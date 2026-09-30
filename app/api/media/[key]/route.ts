import { json, runtime } from "@/lib/server";

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    if (!/^[a-zA-Z0-9-]+\.(jpg|png|webp|mp4|webm)$/.test(key)) return new Response("Not found", { status: 404 });
    const bucket = runtime().BUCKET;
    if (!bucket) return json({ error: "Media storage unavailable" }, 503);
    const range = req.headers.get("range");
    const object = await bucket.get(key, range ? { range: req.headers } : undefined);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", "public,max-age=31536000,immutable");
    headers.set("Accept-Ranges", "bytes");
    headers.set("ETag", object.httpEtag);
    if (range && object.range && "offset" in object.range) {
      const offset = object.range.offset ?? 0;
      const length = ("length" in object.range ? object.range.length : undefined) ?? object.size - offset;
      headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
      headers.set("Content-Length", String(length));
      return new Response(object.body, { status: 206, headers });
    }
    headers.set("Content-Length", String(object.size));
    return new Response(object.body, { headers });
  } catch {
    return json({ error: "Media temporarily unavailable" }, 503);
  }
}
