import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { AppError, body, errorResponse, originCheck } from "@/lib/server";

const MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

export async function POST(req: Request) {
  try {
    originCheck(req);
    const { idToken } = await body<{ idToken?: unknown }>(req, 12_000);
    if (typeof idToken !== "string" || idToken.length > 10_000) {
      throw new AppError("Unable to sign in", 400, "BAD_REQUEST");
    }
    const auth = firebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);
    const authTime = Number(decoded.auth_time || 0);
    if (!decoded.email_verified || Date.now() / 1000 - authTime > 5 * 60) {
      throw new AppError("Please sign in again", 401, "UNAUTHORIZED");
    }
    const session = await auth.createSessionCookie(idToken, { expiresIn: MAX_AGE_SECONDS * 1000 });
    return Response.json({ ok: true }, { headers: {
      "Set-Cookie": `stacdial_customer=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    }});
  } catch (error) {
    return errorResponse(error, "Unable to sign in");
  }
}
