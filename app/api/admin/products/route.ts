import { productSchema } from "@/lib/schemas";
import { AppError, admin, body, errorResponse, json, log, originCheck } from "@/lib/server";
import {readFirestoreProducts,writeFirestoreProduct} from "@/lib/firestore-store";

export async function GET() {
  if (!(await admin())) return json({ error: "Administrator access required" }, 403);
  try { return json(await readFirestoreProducts(false)); }
  catch (error) { return errorResponse(error, "Products unavailable"); }
}

export async function POST(req: Request) {
  const user = await admin();
  if (!user) return json({ error: "Administrator access required" }, 403);
  try {
    originCheck(req);
    const product = productSchema.parse(await body(req, 40_000));
    if (!product.slug) throw new AppError("A valid product slug is required", 400, "BAD_REQUEST");
    const active = product.status === "published" && product.active;
    await writeFirestoreProduct({...product,active});
    await log(user.userId, `product created:${product.id}`);
    return json({ ok: true, id: product.id, slug: product.slug }, 201);
  } catch (error) { return errorResponse(error, "Unable to create product"); }
}
