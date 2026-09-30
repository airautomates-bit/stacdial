"use client";
import { useState } from "react";

const statuses=["new","contacted","confirmed","preparing","completed","cancelled"] as const;

export default function OrderEditor({id,initialStatus,initialNotes}:{id:string;initialStatus:string;initialNotes:string}){
  const [status,setStatus]=useState(initialStatus),[notes,setNotes]=useState(initialNotes),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function save(){setBusy(true);setMessage("");try{const response=await fetch(`/api/admin/orders/${encodeURIComponent(id)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,internalNotes:notes})});const data=await response.json() as {error?:string};if(!response.ok)throw Error(data.error||"Unable to update order");setMessage("Order updated.")}catch(error){setMessage(error instanceof Error?error.message:"Unable to update order")}finally{setBusy(false)}}
  return <section className="panel form"><h2>Manage request</h2><label>Status<select value={status} onChange={event=>setStatus(event.target.value)}>{statuses.map(value=><option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</select></label><label>Internal admin notes<textarea value={notes} maxLength={3000} onChange={event=>setNotes(event.target.value)} placeholder="Visible only to administrators"/></label>{message&&<p className={message==="Order updated."?"success":"error"} role="status">{message}</p>}<button className="pill" disabled={busy} onClick={()=>void save()}>{busy?"Saving…":"Save order"}</button></section>
}
