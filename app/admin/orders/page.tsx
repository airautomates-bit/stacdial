import Link from "next/link";
import { redirect } from "next/navigation";
import { admin } from "@/lib/server";
import {listFirestoreOrders} from "@/lib/firestore-store";
import { money } from "@/lib/catalog";

type OrderRow = Record<string, unknown> & { id: string; created: number; name: string; email: string; phone: string; product_name: string; total: number; status: string };

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  if (!(await admin())) redirect("/admin");
  const orders = await listFirestoreOrders(500) as OrderRow[];
  return <main className="adminmain"><div className="sectionhead"><div><span className="eyebrow muted">Customer inquiries</span><h1>Interest requests</h1></div><Link className="pill outline" href="/admin">Dashboard</Link></div>{orders.length ? <div className="panel tablewrap"><table><thead><tr><th>Reference</th><th>Date</th><th>Customer</th><th>Watch</th><th>Indicative price</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{new Intl.DateTimeFormat("en-LK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" }).format(order.created)}</td><td>{order.name}<small style={{ display: "block" }}>{order.email} · {order.phone}</small></td><td>{order.product_name}</td><td>{money(order.total / 100)}</td><td><span className={`order-status status-${order.status}`}>{order.status}</span></td><td><Link className="textlink" href={`/admin/orders/${encodeURIComponent(order.id)}`}>View</Link></td></tr>)}</tbody></table></div> : <div className="notice"><h3>No interest registrations yet.</h3><p>New inquiries will appear here after customers register their interest.</p></div>}</main>;
}
