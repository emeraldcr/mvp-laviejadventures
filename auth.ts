import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByEmail, upsertUserFromAuth0 } from "@/lib/models/user";
import { getAuth0AuthorizationParams, getAuth0Issuer } from "@/lib/auth0-config";

const auth0ClientId = process.env.AUTH0_CLIENT_ID?.trim();
const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET?.trim();
const auth0Issuer = getAuth0Issuer();

const hasAuth0Config = Boolean(auth0ClientId && auth0ClientSecret && auth0Issuer);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await findUserByEmail(email);
        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id!.toString(),
          name: user.name,
          email: user.email,
          image: user.image ?? null,
        };
      },
    }),
    ...(hasAuth0Config
      ? [
          Auth0Provider({
            clientId: auth0ClientId!,
            clientSecret: auth0ClientSecret!,
            issuer: auth0Issuer!,
            authorization: {
              params: getAuth0AuthorizationParams(),
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/platform",
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (user?.id) {
        token.sub = user.id;
      }

      if (account?.provider === "auth0" && profile) {
        const auth0Profile = profile as {
          sub?: string;
          email?: string;
          name?: string;
          picture?: string;
        };

        const localUser = await upsertUserFromAuth0({
          auth0Sub: auth0Profile.sub,
          email: auth0Profile.email,
          name: auth0Profile.name,
          image: auth0Profile.picture,
        });

        if (localUser?._id) {
          token.sub = localUser._id.toString();
          token.email = localUser.email;
          token.name = localUser.name;
          token.picture = localUser.image ?? token.picture;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      if (session.user && token.name) {
        session.user.name = token.name;
      }
      if (session.user && token.picture) {
        session.user.image = String(token.picture);
      }
      return session;
    },
  },
});
