import { readSettings, runtime } from "./server";
import {listFirestoreOrders,markOrdersSynced} from "./firestore-store";

type ServiceAccount = { client_email: string; private_key: string };
type TokenResponse = { access_token?: string };
type ExportOrder = Record<string, unknown> & {
  id: string; created: number; name: string; phone: string; product_name: string;
  subtotal: number; discount: number; total: number; status: string;
};

const encode = (value: Uint8Array) => btoa(String.fromCharCode(...value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

export async function syncOrders() {
  const config = runtime().GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!config) return { configured: false };
  const settings = await readSettings();
  if (!/^[a-zA-Z0-9_-]{15,150}$/.test(settings.sheetsId)) return { configured: false };
  const account = JSON.parse(String(config)) as Partial<ServiceAccount>;
  if (!account.client_email || !account.private_key) throw new Error("Google service-account configuration is invalid");
  const now = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();
  const header = encode(encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = encode(encoder.encode(JSON.stringify({ iss: account.client_email, scope: "https://www.googleapis.com/auth/spreadsheets", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })));
  const unsigned = `${header}.${payload}`;
  const pem = account.private_key.replace(/-----[^-]+-----|\s/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), character => character.charCodeAt(0)), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(unsigned));
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${encode(new Uint8Array(signature))}` }), signal: AbortSignal.timeout(8_000) });
  if (!tokenResponse.ok) throw new Error("Google authentication failed");
  const token = await tokenResponse.json() as TokenResponse;
  if (!token.access_token) throw new Error("Google authentication returned no access token");
  const orders = (await listFirestoreOrders(5000) as ExportOrder[]).sort((left,right)=>left.created-right.created);
  const values = [["Request", "Date", "Customer", "WhatsApp", "Watch", "Subtotal LKR", "Discount LKR", "Total LKR", "Status"], ...orders.map(order => [order.id, new Date(order.created).toISOString(), order.name, order.phone, order.product_name, order.subtotal / 100, order.discount / 100, order.total / 100, order.status])];
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${settings.sheetsId}/values/Orders!A1:I5001?valueInputOption=RAW`, { method: "PUT", headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ range: "Orders!A1:I5001", majorDimension: "ROWS", values }), signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error("Sheet update failed. Check access and the Orders tab.");
  await markOrdersSynced();
  return { configured: true, synced: orders.length };
}
