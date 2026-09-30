import type { Metadata } from "next";
import InfoPage from "../info-page";
import { storefrontData } from "@/lib/storefront-data";

export const metadata: Metadata = { title: "Frequently Asked Questions | Stacdial", description: "Answers about Stacdial interest registrations, watch details, payment and delivery." };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { products } = await storefrontData();
  return <InfoPage eyebrow="Customer care" title="Frequently asked questions." products={products}><div className="faq-list"><section><h2>What happens after I register my interest?</h2><p>We aim to contact you within 10 minutes to confirm the watch you selected and answer your questions. Registering does not commit you to a purchase.</p></section><section><h2>Can I ask about the watch grade?</h2><p>Yes. A dedicated team member can clarify the stated grade, specifications, availability and other product details before you decide whether to continue.</p></section><section><h2>When do I pay?</h2><p>Payment is discussed only after we have contacted you, answered your questions and you confirm that you want to proceed.</p></section><section><h2>How long does delivery take?</h2><p>Delivery is normally 1–3 business days within Colombo and 3–5 business days outside Colombo after the order is confirmed.</p></section></div></InfoPage>;
}
