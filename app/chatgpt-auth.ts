import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminEmails, runtime, usesTrustedPlatformIdentity } from "@/lib/runtime";
import { firebaseAdminAuth, firebaseServerConfigured } from "@/lib/firebase-admin";

export type CustomerUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export type AdminPrincipal = {
  userId: string;
  email: string;
  source: "admin-session" | "sites-identity" | "firebase";
};

const USER_ID_HEADER = "oai-authenticated-user-id";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER = "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";
const ADMIN_COOKIE = "stacdial_admin";
const ADMIN_SESSION_SECONDS = 30 * 24 * 60 * 60;
const CUSTOMER_COOKIE = "stacdial_customer";

export function platformUserFromHeaders(
  requestHeaders: Pick<Headers, "get">,
  trusted: boolean,
): CustomerUser | null {
  if (!trusted) return null;

  const userId = requestHeaders.get(USER_ID_HEADER);
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (!userId || !email) return null;

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  return {
    userId,
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

export async function getChatGPTUser(): Promise<CustomerUser | null> {
  if (firebaseServerConfigured()) {
    const session=(await cookies()).get(CUSTOMER_COOKIE)?.value;
    if(session){try{const user=await firebaseAdminAuth().verifySessionCookie(session,true);return {userId:user.uid,email:String(user.email||""),displayName:String(user.name||user.email||"Customer"),fullName:user.name?String(user.name):null}}catch{/* Invalid or revoked customer session. */}}
  }
  return platformUserFromHeaders(await headers(), usesTrustedPlatformIdentity());
}

export function customerAuthAvailable(): boolean {
  return firebaseServerConfigured() || usesTrustedPlatformIdentity();
}

export async function getAdminPrincipal(): Promise<AdminPrincipal | null> {
  const env = runtime();
  const allowed = adminEmails(env);
  if (!allowed.length) return null;

  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const secret = String(env.ADMIN_SESSION_SECRET ?? "");
  if (token && secret && (await validAdminToken(token, secret))) {
    return { userId: "admin-session", email: allowed[0], source: "admin-session" };
  }

  const firebaseUser=await getChatGPTUser();
  if(firebaseUser&&allowed.includes(firebaseUser.email.toLowerCase()))return {userId:firebaseUser.userId,email:firebaseUser.email,source:"firebase"};

  const user = platformUserFromHeaders(await headers(), usesTrustedPlatformIdentity(env));
  if (!user || !allowed.includes(user.email.toLowerCase())) return null;
  return { userId: user.userId, email: user.email, source: "sites-identity" };
}

export async function createAdminToken(secret: string, issuedAt = Date.now()): Promise<string> {
  const value = `${issuedAt}.${crypto.randomUUID()}`;
  return `${value}.${await sign(value, secret)}`;
}

export async function validAdminToken(
  token: string,
  secret: string,
  now = Date.now(),
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const issuedAt = Number(parts[0]);
  if (!Number.isFinite(issuedAt) || issuedAt > now + 60_000) return false;
  if (now - issuedAt > ADMIN_SESSION_SECONDS * 1000) return false;

  const value = `${parts[0]}.${parts[1]}`;
  const signature = hexToBytes(parts[2]);
  if (!signature) return false;

  const key = await hmacKey(secret, ["verify"]);
  return crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(signature),
    new TextEncoder().encode(value),
  );
}

export async function requireChatGPTUser(returnTo: string): Promise<CustomerUser> {
  const user = await getChatGPTUser();
  if (user) return user;
  if (firebaseServerConfigured()) {
    redirect(`/login?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`);
  }
  if (!customerAuthAvailable()) redirect("/login");
  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function adminCookie(token: string): string {
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${ADMIN_SESSION_SECONDS}`;
}

export function clearAdminCookie(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await hmacKey(secret, ["sign"]);
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
  );
  return Array.from(signature, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hmacKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );
}

function hexToBytes(value: string): Uint8Array | null {
  if (!/^[a-f0-9]{64}$/i.test(value)) return null;
  return Uint8Array.from(value.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local" || isReservedAuthPath(url.pathname)) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

function isReservedAuthPath(pathname: string): boolean {
  return [SIGN_IN_PATH, SIGN_OUT_PATH, CALLBACK_PATH].includes(pathname);
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
