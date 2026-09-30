import Link from "next/link";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import type { Product } from "@/lib/catalog";

export default function InfoPage({ eyebrow, title, children, products = [] }: { eyebrow: string; title: string; children: React.ReactNode; products?: Product[] }) {
  return <><SiteHeader products={products}/><main className="reading info-page"><span className="eyebrow muted">{eyebrow}</span><h1>{title}</h1>{children}<Link className="pill" href="/shop">Explore the collection</Link></main><SiteFooter/></>;
}
