import { productSchema } from "@/lib/schemas";
import { AppError, admin, body, errorResponse, json, log, originCheck } from "@/lib/server";
import {deleteFirestoreProduct,readFirestoreProduct,writeFirestoreProduct} from "@/lib/firestore-store";

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}) {
  if (!(await admin())) return json({ error: "Administrator access required" }, 403);
  try { const {id}=await params;const product=await readFirestoreProduct(id);if(!product)throw new AppError("Product not found",404,"NOT_FOUND");return json(product); }
  catch(error){return errorResponse(error,"Product unavailable")}
}
export async function PUT(req:Request,{params}:{params:Promise<{id:string}>}){
  const user=await admin();if(!user)return json({error:"Administrator access required"},403);
  try{originCheck(req);const {id}=await params;if(!(await readFirestoreProduct(id)))throw new AppError("Product not found",404,"NOT_FOUND");const product=productSchema.parse({...await body<Record<string,unknown>>(req,40_000),id});if(!product.slug)throw new AppError("A valid product slug is required",400,"BAD_REQUEST");const active=product.status==="published"&&product.active;await writeFirestoreProduct({...product,active});await log(user.userId,`product updated:${id}`);return json({ok:true,id,slug:product.slug})}catch(error){return errorResponse(error,"Unable to update product")}
}
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
  const user=await admin();if(!user)return json({error:"Administrator access required"},403);
  try{originCheck(req);const {id}=await params;if(!(await deleteFirestoreProduct(id)))throw new AppError("Product not found",404,"NOT_FOUND");await log(user.userId,`product deleted:${id}`);return json({ok:true})}catch(error){return errorResponse(error,"Unable to delete product")}
}
