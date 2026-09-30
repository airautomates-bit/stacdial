import type { Metadata } from "next";
import InfoPage from "../info-page";
import { storefrontData } from "@/lib/storefront-data";

export const metadata: Metadata = { title: "Privacy Policy | Stacdial", description: "How Stacdial handles information submitted through the website." };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { products } = await storefrontData();
  return <InfoPage eyebrow="Legal" title="Privacy policy." products={products}><p>When you register your interest, we collect the contact and inquiry details you submit so we can respond, answer questions and manage your request. We do not ask for online payment details through the interest form.</p><p>We use reasonable safeguards and restrict administrative access to customer information. We retain records only as needed for customer service, security and applicable business obligations.</p><p>To ask about, correct or request deletion of your submitted information, contact us at <a className="textlink" href="tel:+94768422125">076 842 2125</a>. This concise policy should be reviewed before production launch against the final business practices and applicable Sri Lankan requirements.</p></InfoPage>;
}
