import { assetSchema } from "@/lib/schemas";
import { errorResponse } from "@/lib/server";
import {readCollectionDoc} from "@/lib/firestore-store";

type MediaRow = Record<string, unknown> & { url: string };

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
    const media = await readCollectionDoc<MediaRow>("media",id);
    if (!media || !assetSchema.safeParse(media.url).success || media.url.startsWith("/api/assets/")) {
      return new Response("Not found", { status: 404 });
    }
    return Response.redirect(new URL(media.url, req.url), 307);
  } catch (error) {
    return errorResponse(error, "Media temporarily unavailable");
  }
}
