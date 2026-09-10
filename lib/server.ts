import {getChatGPTUser} from "@/app/chatgpt-auth";
import {defaults} from "./catalog";
type SqlValue=string|number|boolean|null|Uint8Array;
type SqlResult={rows:any[];columns:string[];rowsAffected:number};
class HttpSqlClient {
  constructor(private url:string, private token:string) {}
  private endpoint(){return this.url.replace(/^libsql:/,"https:").replace(/\/$/,"")+"/v2/pipeline"}
  async execute(sql:string,args:SqlValue[]=[]):Promise<SqlResult>{
    const r=await fetch(this.endpoint(),{method:"POST",headers:{Authorization:`Bearer ${this.token}`,"Content-Type":"application/json"},body:JSON.stringify({requests:[{type:"execute",stmt:{sql,args:args.map(v=>({type:v===null?"null":typeof v==="number"?(Number.isInteger(v)?"integer":"float"):"text",value:v===null?undefined:String(v)}))}},{type:"close"}]})});
    if(!r.ok)throw Error(`Database request failed (${r.status})`);
    const data:any=await r.json();const result=data.results?.[0]?.response?.result;if(!result)throw Error("Database response was invalid");
    const columns=(result.cols||[]).map((c:any)=>typeof c==="string"?c:c.name);const rows=(result.rows||[]).map((row:any[])=>Object.fromEntries(columns.map((c:string,i:number)=>[c,row[i]?.value??null])));
    return {rows,columns,rowsAffected:result.affected_row_count||0};
  }
  prepare(sql:string){const self=this;return {bind(...args:SqlValue[]){return {all:()=>self.execute(sql,args),first:async()=>{const r=await self.execute(sql,args);return r.rows[0]||null},run:async()=>{const r=await self.execute(sql,args);return {meta:{changes:r.rowsAffected}}}}}}}
  async batch(statements:any[]){return Promise.all(statements.map(s=>s.run()))}
}
const cfRuntime=()=>({...process.env,...(((globalThis as any).env||{}) as any)}) as any;
let cachedDb:any;
export const runtime=()=>cfRuntime();
export function db(){
  if(cachedDb)return cachedDb;
  const url=process.env.TURSO_DATABASE_URL||process.env.LIBSQL_URL;const token=process.env.TURSO_AUTH_TOKEN||process.env.LIBSQL_AUTH_TOKEN;
  if(url&&token){cachedDb=new HttpSqlClient(url,token);return cachedDb}
  const d=runtime().DB;if(!d)throw Error("Storage unavailable. Configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.");return d
}
export function json(data:any,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
export async function admin(){const u=await getChatGPTUser();const allowed=String(runtime().ADMIN_EMAILS||"").toLowerCase().split(",").map((s:string)=>s.trim()).filter(Boolean);return u&&allowed.includes(u.email.toLowerCase())?u:null}
export function originCheck(req:Request){if(req.headers.get("origin")!==new URL(req.url).origin)throw Error("Invalid request origin")}
export async function readSettings(){const row=await db().prepare("SELECT data FROM settings WHERE id = ?").bind("store").first();return {...defaults,...(row?JSON.parse(row.data):{})}}
export async function readProducts(active=true){const q=active?"SELECT data FROM products WHERE active=1":"SELECT data FROM products";const r=await db().prepare(q).all();return r.results.map((x:any)=>JSON.parse(x.data))}
export async function body(req:Request){if(!req.headers.get("content-type")?.includes("application/json"))throw Error("JSON required");const text=await req.text();if(text.length>30000)throw Error("Request too large");return JSON.parse(text)}
export async function limit(req:Request,kind:string,max=12){const ip=req.headers.get("cf-connecting-ip")||"unknown";const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(kind+":"+ip));const key=Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,"0")).join("");const now=Date.now();const r=await db().prepare("INSERT INTO rates (key,count,reset) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rates.reset<? THEN 1 ELSE rates.count+1 END, reset=CASE WHEN rates.reset<? THEN excluded.reset ELSE rates.reset END RETURNING count").bind(key,now+3600000,now,now).first();if(r.count>max)throw Error("Too many requests. Please try again later.")}
export function claimToken(req:Request){return req.headers.get("cookie")?.split(";").map(s=>s.trim()).find(s=>s.startsWith("stacdial_claim="))?.split("=")[1]||""}
export async function log(actor:string,action:string){await db().prepare("INSERT INTO audit (id,actor,action,created) VALUES (?,?,?,?)").bind(crypto.randomUUID(),actor,action,Date.now()).run()}
