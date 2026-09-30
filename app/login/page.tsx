import Link from "next/link";
import SiteHeader from "../site-header";
import {getChatGPTUser,customerAuthAvailable} from "../chatgpt-auth";
import {admin} from "@/lib/server";
import {listUserOrders} from "@/lib/firestore-store";
import {money,samples} from "@/lib/catalog";
import {CustomerSignOutButton,GoogleSignInButton} from "./customer-auth";

export const dynamic="force-dynamic";

export default async function Page(){
  const user=await getChatGPTUser();const owner=await admin();const authAvailable=customerAuthAvailable();
  const orders=user?await listUserOrders(user.userId).catch(()=>[]):[];
  return <><SiteHeader products={samples} active="login"/><main className="loginbox"><span className="eyebrow">Your Stacdial</span><h2 style={{margin:"20px 0"}}>{user?"Welcome back.":"Make yourself at home."}</h2>{user?<><p className="muted">{user.displayName}</p>{owner&&<Link className="pill" href="/admin">Open dashboard ↗</Link>}<h3 style={{marginTop:30}}>Your interest requests</h3>{orders.length?orders.map(order=><div className="notice" key={order.id}><strong>{order.product_name}</strong><br/>{order.id} · {money(order.total/100)}<br/><span style={{textTransform:"capitalize"}}>{order.status}</span></div>):<p className="muted">No requests are linked to this account yet. Sign in before registering interest so it appears here.</p>}<CustomerSignOutButton/></>:authAvailable?<><p className="muted" style={{lineHeight:1.7}}>Sign in securely with Google to keep track of your watch inquiries.</p><GoogleSignInButton/><p style={{marginTop:25}}><Link className="textlink" href="/shop">Continue browsing</Link></p></>:<><p className="muted" style={{lineHeight:1.7}}>Firebase customer accounts are awaiting their server credentials. You can still browse and register your interest.</p>{owner&&<Link className="pill" href="/admin">Open dashboard ↗</Link>}<p style={{marginTop:25}}><Link className="textlink" href="/shop">Continue browsing</Link></p></>}</main></>;
}
