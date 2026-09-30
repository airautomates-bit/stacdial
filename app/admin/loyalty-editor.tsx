"use client";
import { useState } from "react";
import { money } from "@/lib/catalog";

export type LoyaltyCustomer = { id: string; name: string; phone: string; status: string };
export type LoyaltyOffer = { code: string; phone: string; percent: number; minimum: number; expires: number; used_order?: string | null; active: number };

export default function LoyaltyEditor({ orders, offers, disabled, save }: {
  orders: LoyaltyCustomer[];
  offers: LoyaltyOffer[];
  disabled: boolean;
  save: (action: string, data?: unknown, id?: string) => Promise<void>;
}) {
  const customers = [...new Map(orders.filter(order => order.status === "paid").map(order => [order.phone, order])).values()];
  const [phone, setPhone] = useState("");
  const [percent, setPercent] = useState(10);
  const [minimum, setMinimum] = useState(0);
  const [expires, setExpires] = useState("");
  const [renderedAt] = useState(() => Date.now());
  return <><div className="panel"><h3>A reason to come back.</h3><p className="muted">Create a personal, single-use offer for a customer with a confirmed purchase. Copy the generated code and share it yourself.</p><form className="form" onSubmit={event=>{event.preventDefault();void save("loyalty",{phone,percent,minimum,expires:new Date(expires+"T23:59:59+05:30").getTime()})}}><label>Returning customer<select value={phone} required disabled={disabled} onChange={event=>setPhone(event.target.value)}><option value="">Choose a customer</option>{customers.map(order=><option value={order.phone} key={order.phone}>{order.name} · {order.phone}</option>)}</select></label><div className="split"><label>Discount · %<input type="number" required min={1} max={50} value={percent} disabled={disabled} onChange={event=>setPercent(Number(event.target.value))}/></label><label>Minimum purchase · LKR<input type="number" required min={0} value={minimum} disabled={disabled} onChange={event=>setMinimum(Number(event.target.value))}/></label></div><label>Valid until · Sri Lanka time<input type="date" value={expires} required disabled={disabled} onChange={event=>setExpires(event.target.value)}/></label><button className="pill" disabled={disabled||!customers.length}>Create personal offer</button>{!customers.length&&<small>Customers become eligible after their first bank transfer is confirmed.</small>}<small>One use, bound to this customer’s WhatsApp number. Does not combine with the welcome offer.</small></form></div><div className="panel"><h3>Personal offers</h3>{offers.length?offers.map(offer=><div className="loyalty-row" key={offer.code}><div><strong>{offer.percent}% off</strong><p>{offer.phone} · Minimum {money(offer.minimum/100)}<br/><small>Expires {new Date(offer.expires).toLocaleDateString("en-GB",{timeZone:"Asia/Colombo"})} · {offer.used_order?"Used":!offer.active?"Disabled":offer.expires<renderedAt?"Expired":"Available"}</small></p><code>{offer.code}</code></div>{!offer.used_order&&Boolean(offer.active)&&<button className="pill outline" disabled={disabled} onClick={()=>void save("revokeLoyalty",undefined,offer.code)}>Disable</button>}</div>):<p className="muted">No personal offers issued yet.</p>}</div></>;
}
