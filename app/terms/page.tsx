import type { Metadata } from "next";
import InfoPage from "../info-page";
import { storefrontData } from "@/lib/storefront-data";

export const metadata: Metadata = { title: "Terms | Stacdial", description: "Important terms for Stacdial interest registrations and product information." };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { products } = await storefrontData();
  return <InfoPage eyebrow="Legal" title="Terms." products={products}><p>Registering your interest is an inquiry, not an order, reservation or payment obligation. Availability, grade, specifications, price, delivery and payment arrangements must be confirmed directly with our team before a purchase proceeds.</p><p>Product photographs and descriptions are provided to help you evaluate a watch. Ask for clarification about any detail that is important to your decision before making payment.</p><p>These concise terms are provisional and should be reviewed before production launch against the final sales, payment, warranty and returns practices.</p></InfoPage>;
}
