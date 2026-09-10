import {createAdminToken} from "@/app/chatgpt-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {password?: string};
    const password = process.env.ADMIN_PASSWORD;
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!password || !secret || body.password !== password) return Response.json({error:"Invalid administrator password"},{status:401});
    const token = await createAdminToken(secret);
    return Response.json({ok:true},{headers:{"Set-Cookie":`stacdial_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`,"Cache-Control":"no-store"}});
  } catch { return Response.json({error:"Unable to sign in"},{status:400}); }
}

export async function DELETE() {
  return Response.json({ok:true},{headers:{"Set-Cookie":"stacdial_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"}});
}
