import { auth } from "@/lib/auth";

// An explicit allowlist and a verified identity are both required. An unset
// allowlist deliberately grants access to nobody.
export async function isAuthorizedAdmin() {
  const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!allowed.length) return false;
  const session = await auth();
  const user = session?.user as { email?: string | null; verifiedEmail?: boolean } | undefined;
  return user?.verifiedEmail === true && typeof user.email === "string" && allowed.includes(user.email.trim().toLowerCase());
}
