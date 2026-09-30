import { put } from "@vercel/blob";
import { admin, errorResponse, json, log, originCheck, runtime } from "@/lib/server";
import {readCollectionDoc,writeCollectionDoc} from "@/lib/firestore-store";

const MAX_FILE_BYTES = 80 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(req: Request) {
  const user = await admin();
  if (!user) return json({ error: "Administrator access required" }, 403);
  try {
    originCheck(req);
    const declaredLength = Number(req.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_FILE_BYTES + 100_000) return json({ error: "Maximum file size is 80 MB" }, 413);
    const form = await req.formData();
    const file = form.get("file");
    const replacementId = String(form.get("mediaId") ?? "");
    if (replacementId && !/^[a-f0-9-]{36}$/.test(replacementId)) return json({ error: "Invalid media reference" }, 400);
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_FILE_BYTES) return json({ error: "Choose a file smaller than 80 MB" }, 400);
    const extension = allowedTypes[file.type];
    if (!extension) return json({ error: "Use JPG, PNG, WebP, MP4 or WebM" }, 400);
    if (!(await signatureMatches(file))) return json({ error: "The file content does not match its type" }, 400);

    const storageKey = `${crypto.randomUUID()}.${extension}`;
    const env = runtime();
    let storageUrl = "";
    const blobToken = String(env.BLOB_READ_WRITE_TOKEN ?? "");
    if (blobToken) {
      const uploaded = await put(storageKey, file, { access: "public", addRandomSuffix: false, contentType: file.type, token: blobToken });
      storageUrl = uploaded.url;
    } else if (env.BUCKET) {
      await env.BUCKET.put(storageKey, file.stream(), { httpMetadata: { contentType: file.type } });
      storageUrl = `/api/media/${storageKey}`;
    } else {
      throw new Error("Media storage unavailable. Configure Vercel Blob or R2.");
    }

    const id = replacementId || crypto.randomUUID();
    const now = Date.now();
    if (replacementId) {
      const existing=await readCollectionDoc<Record<string,unknown>>("media",id);if(!existing)return json({error:"Media item not found"},404);
      await writeCollectionDoc("media",id,{...existing,id,url:storageUrl,storage_key:storageKey,mime:file.type,size:file.size,name:file.name.slice(0,200),updated:now});
      await log(user.userId, `media replaced:${id}`);
    } else {
      await writeCollectionDoc("media",id,{id,url:storageUrl,storage_key:storageKey,mime:file.type,size:file.size,name:file.name.slice(0,200),created:now,updated:now});
      await log(user.userId, `media uploaded:${id}`);
    }
    return json({ url: `/api/assets/${id}`, media: { id, mime: file.type, size: file.size, name: file.name, created: now, updated: now } });
  } catch (error) {
    return errorResponse(error, "Upload failed. Please try a smaller file.");
  }
}

async function signatureMatches(file: File): Promise<boolean> {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const text = new TextDecoder().decode(header);
  if (file.type === "image/jpeg") return header[0] === 255 && header[1] === 216;
  if (file.type === "image/png") return header[0] === 137 && text.slice(1, 4) === "PNG";
  if (file.type === "image/webp") return text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WEBP";
  if (file.type === "video/mp4") return text.slice(4, 8) === "ftyp";
  return header[0] === 26 && header[1] === 69 && header[2] === 223 && header[3] === 163;
}
