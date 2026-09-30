import { orderUpdateSchema } from "@/lib/schemas";
import { AppError, admin, body, errorResponse, json, log, originCheck } from "@/lib/server";
import {updateFirestoreOrder} from "@/lib/firestore-store";

export async function PUT(req:Request,{params}:{params:Promise<{id:string}>}){
  try{
    originCheck(req);
    const principal=await admin();
    if(!principal)throw new AppError("Administrator access required",401,"UNAUTHORIZED");
    const {id}=await params;
    if(!/^(PO|RI)-[A-Z0-9]{10}$/.test(id))throw new AppError("Request not found",404,"NOT_FOUND");
    const input=orderUpdateSchema.parse(await body(req,4_000));
    if(!(await updateFirestoreOrder(id,{status:input.status,internal_notes:input.internalNotes})))throw new AppError("Order not found",404,"NOT_FOUND");
    await log(principal.userId,`interest request ${id} updated to ${input.status}`);
    return json({ok:true});
  }catch(error){return errorResponse(error,"Unable to update the interest request")}
}
