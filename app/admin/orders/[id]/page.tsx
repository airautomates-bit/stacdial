import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { admin } from "@/lib/server";
import {readFirestoreOrder} from "@/lib/firestore-store";
import { money } from "@/lib/catalog";
import OrderEditor from "./order-editor";

type OrderRow = Record<string, unknown> & {
  id: string; created: number; updated: number; name: string; email: string; phone: string;
  contact_preference: string; note: string; internal_notes: string; product_id: string;
  product_name: string; total: number; status: string;
};

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await admin())) redirect("/admin");
  const { id } = await params;
  const order = await readFirestoreOrder(id) as OrderRow|null;
  if (!order) notFound();
  const created = new Intl.DateTimeFormat("en-LK", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Colombo" }).format(order.created);
  return <main className="adminmain">
    <div className="sectionhead"><div><Link className="textlink" href="/admin/orders">← Interest requests</Link><h1>{order.id}</h1><p className="muted">Received {created}</p></div><Link className="pill outline" href={`/admin/products/${encodeURIComponent(order.product_id)}/edit`}>View product</Link></div>
    <div className="order-admin-grid"><section className="panel"><span className="eyebrow muted">Interest summary</span><div className="order-summary-product"><div><h2>{order.product_name}</h2><p>Indicative price when registered</p></div><strong>{money(order.total / 100)}</strong></div><dl className="order-details"><div><dt>Customer</dt><dd>{order.name}</dd></div><div><dt>Email</dt><dd>{order.email}</dd></div><div><dt>Phone</dt><dd>{order.phone}</dd></div><div><dt>Contact preference</dt><dd>{order.contact_preference}</dd></div><div><dt>Questions or message</dt><dd>{order.note || "No message"}</dd></div></dl><div className="notice">This is an expression of interest. No purchase, payment, shipping, or completion status is implied.</div></section><OrderEditor id={order.id} initialStatus={order.status} initialNotes={order.internal_notes} /></div>
  </main>;
}
