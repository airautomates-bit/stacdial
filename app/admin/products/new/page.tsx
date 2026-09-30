import { redirect } from "next/navigation";
import { admin } from "@/lib/server";
import ProductEditor, { blankProduct } from "../product-editor";
export default async function Page(){if(!(await admin()))redirect("/admin");return <ProductEditor initial={blankProduct()} isNew/>}
