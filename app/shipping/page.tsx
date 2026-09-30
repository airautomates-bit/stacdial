import type { Metadata } from "next";
import InfoPage from "../info-page";
import { storefrontData } from "@/lib/storefront-data";

export const metadata: Metadata = { title: "Shipping | Stacdial", description: "Estimated Stacdial delivery times within and outside Colombo." };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { products } = await storefrontData();
  return <InfoPage eyebrow="Customer care" title="Shipping." products={products}><p>Estimated delivery is 1–3 business days within Colombo and 3–5 business days outside Colombo after your watch and order details are confirmed.</p><p>Timing may vary because of product availability, public holidays, weather, courier coverage or circumstances outside our control. A team member will confirm the available delivery arrangement before payment.</p></InfoPage>;
}
