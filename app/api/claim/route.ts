import { AppError, claimToken, errorResponse, json, limit, originCheck, readSettings } from "@/lib/server";
import {readCollectionDoc,writeCollectionDoc} from "@/lib/firestore-store";

export async function POST(req: Request) {
  try {
    originCheck(req);
    await limit(req, "claim", 15);
    const settings = await readSettings();
    if (!settings.offerEnabled) throw new AppError("This offer is not currently available", 400, "BAD_REQUEST");
    const existing = await readCollectionDoc<{used:boolean}>("claims",claimToken(req));
    if (existing&&!existing.used) return json({ claimed: true });
    const token = crypto.randomUUID();
    await writeCollectionDoc("claims",token,{token,created:Date.now(),used:false});
    return Response.json({ claimed: true }, { headers: {
      "Set-Cookie": `stacdial_claim=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
      "Cache-Control": "no-store",
    } });
  } catch (error) {
    return errorResponse(error, "Unable to claim this offer");
  }
}
