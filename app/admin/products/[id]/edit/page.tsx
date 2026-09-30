import {notFound,redirect} from "next/navigation";
import {admin} from "@/lib/server";
import {readFirestoreProduct} from "@/lib/firestore-store";
import ProductEditor from "../../product-editor";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){if(!(await admin()))redirect("/admin");const {id}=await params;const product=await readFirestoreProduct(id);if(!product)notFound();return <ProductEditor initial={product} isNew={false}/>}
