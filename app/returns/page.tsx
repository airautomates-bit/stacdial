import type { Metadata } from "next";
import InfoPage from "../info-page";
import { storefrontData } from "@/lib/storefront-data";

export const metadata: Metadata = { title: "Returns | Stacdial", description: "Current information about the Stacdial returns policy." };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { products } = await storefrontData();
  return <InfoPage eyebrow="Customer care" title="Returns." products={products}><div className="notice"><strong>Our detailed returns policy is being finalized.</strong></div><p>Please ask our team about the terms that apply to your watch before making payment. Nothing on this page limits any rights that cannot legally be excluded.</p><p>For help, call <a className="textlink" href="tel:+94768422125">076 842 2125</a>.</p></InfoPage>;
}
