import { notFound, redirect } from "next/navigation";
import { storefrontData } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, data] = await Promise.all([params, storefrontData()]);
  const product = data.products.find(item => item.id === id || item.slug === id);
  if (!product) notFound();
  redirect(`/shop/${product.slug || product.id}`);
}
