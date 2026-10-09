import { auth } from "@/lib/auth/auth";

export async function requirePokerIdentity() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  const userId = user?.id || user?.email;
  if (!userId) return null;
  return { userId, name: (user.name || user.email || "Player").slice(0, 30) };
}
