import { originCheck } from "@/lib/server";

export async function POST(req: Request) {
  originCheck(req);
  return Response.json({ ok: true }, { headers: {
    "Set-Cookie": "stacdial_customer=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  }});
}
