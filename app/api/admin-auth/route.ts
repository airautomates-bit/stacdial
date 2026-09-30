import { adminCookie, clearAdminCookie, createAdminToken } from "@/app/chatgpt-auth";
import { adminEmails, emailOnlyAdminAccess, runtime } from "@/lib/runtime";
import { AppError, body, errorResponse, limit, originCheck } from "@/lib/server";
import { adminLoginSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    originCheck(req);
    const { email, password: suppliedPassword } = adminLoginSchema.parse(await body(req, 1_024));
    const env = runtime();
    const emailOnly = emailOnlyAdminAccess(env);
    if (!emailOnly) await limit(req, "admin-auth", 5);
    const password = String(env.ADMIN_PASSWORD ?? "");
    const secret = String(env.ADMIN_SESSION_SECRET ?? "");
    const allowedEmails = adminEmails(env);
    if ((!emailOnly && password.length < 12) || secret.length < 32 || allowedEmails.length === 0) {
      throw new AppError("Administrator access is not configured", 503, "UNAVAILABLE");
    }
    if (!allowedEmails.includes(email) || (!emailOnly && !(await passwordsMatch(suppliedPassword, password)))) {
      throw new AppError("Invalid administrator credentials", 401, "UNAUTHORIZED");
    }
    return Response.json({ ok: true }, { headers: {
      "Set-Cookie": adminCookie(await createAdminToken(secret)),
      "Cache-Control": "no-store",
    } });
  } catch (error) {
    return errorResponse(error, "Unable to sign in");
  }
}

export async function DELETE(req: Request) {
  try {
    originCheck(req);
    return Response.json({ ok: true }, { headers: {
      "Set-Cookie": clearAdminCookie(),
      "Cache-Control": "no-store",
    } });
  } catch (error) {
    return errorResponse(error, "Unable to sign out");
  }
}

async function passwordsMatch(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const a = new Uint8Array(leftHash);
  const b = new Uint8Array(rightHash);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return difference === 0;
}
