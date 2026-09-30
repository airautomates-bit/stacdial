import Storefront from "../storefront";
import {storefrontData} from "@/lib/storefront-data";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;collection?:string}>}){const [data,params]=await Promise.all([storefrontData(),searchParams]);return <Storefront view="shop" initialProducts={data.products} initialSettings={data.settings} initialClaimed={data.claimed} initialUnavailable={data.unavailable} initialQuery={params.q||""} initialCollection={params.collection||""}/>}
