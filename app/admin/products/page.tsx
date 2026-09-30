import Link from "next/link";
import {redirect} from "next/navigation";
import {admin} from "@/lib/server";
import {readFirestoreProducts} from "@/lib/firestore-store";
export const dynamic="force-dynamic";
export default async function Page(){if(!(await admin()))redirect("/admin");const products=await readFirestoreProducts(false);return <main className="adminmain"><div className="sectionhead"><div><span className="eyebrow muted">Catalogue</span><h1>Products</h1></div><Link className="pill" href="/admin/products/new">Add watch</Link></div>{products.length?products.map(product=><article className="panel adminproduct" key={product.id}>{product.images[0]&&<img src={product.images[0]} alt=""/>}<div><h3>{product.name}</h3><small>{product.collection} · {product.status||(product.active?"published":"draft")}</small></div><Link className="pill outline" href={`/admin/products/${product.id}/edit`}>Edit</Link></article>):<div className="notice">No products yet. Add the first watch to begin.</div>}</main>}
