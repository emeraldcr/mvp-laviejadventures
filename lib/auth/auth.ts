import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByEmail, getUserPreferencesByEmail, upsertUserFromAuth0 } from "@/lib/auth/users/user";
import { getAuth0AuthorizationParams, getAuth0Issuer } from "@/lib/auth/auth0-config";
import { sendLoginNotificationEmail } from "@/lib/email/login-email";
import { createLoginLog } from "@/lib/auth/audit/login-log";

import { validEmail } from "@/lib/security/validation";
import { allowRequest } from "@/lib/security/rate-limit";

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

        if (!validEmail(email) || typeof password !== "string" || Buffer.byteLength(password, "utf8") > 72) {
          return null;
        }

        if (!await allowRequest(`login:${email.trim().toLowerCase()}`, 10, 900_000)) return null;
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
  events: {
    async signIn({ user }) {
      if (!user?.email) return;

      const preferences = await getUserPreferencesByEmail(user.email);
      if (preferences?.notifications.emailEnabled === false) return;

      sendLoginNotificationEmail({
        email: user.email,
        name: user.name,
      }).catch((error) => {
        console.error("Login notification email failed:", error);
      });

      createLoginLog({
        userType: "user",
        userId: (user as { id?: string }).id,
        emailOrUsername: user.email,
        device: "nextauth-session",
        createdAt: new Date(),
      }).catch((error) => {
        console.error("User login log failed:", error);
      });
    },
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "auth0") {
        return profile?.email_verified === true && validEmail(profile.email);
      }
      return true;
    },
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
          email_verified?: boolean;
        };

        const localUser = await upsertUserFromAuth0({
          auth0Sub: auth0Profile.sub,
          emailVerified: auth0Profile.email_verified,
          email: auth0Profile.email,
          name: auth0Profile.name,
          image: auth0Profile.picture,
        });

        if (!localUser?._id) throw new Error("Account linking requires reauthentication");
        if (localUser._id) {
          token.sub = localUser._id.toString();
          token.email = localUser.email;
          token.name = localUser.name;
          token.picture = localUser.image ?? token.picture;
        }
      }

      if (token.email) {
        const currentUser = await findUserByEmail(token.email);
        if (!currentUser || currentUser._id?.toString() !== token.sub) return null;
        if (account || user) token.sessionVersion = currentUser.sessionVersion ?? 0;
        if ((token.sessionVersion ?? 0) !== (currentUser.sessionVersion ?? 0)) return null;
        token.emailVerified = currentUser.emailVerified === true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { verifiedEmail?: boolean }).verifiedEmail = token.emailVerified === true;
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
