import { getAdminPrincipal } from "@/app/chatgpt-auth";
import { defaults, type Product } from "./catalog";
import {logFirestore,rateLimitFirestore,readFirestoreProducts,readFirestoreSettings} from "./firestore-store";
import { deploymentTarget, runtime } from "./runtime";
import { ZodError } from "zod";

export { runtime };

export type AppErrorCode =
  | "BAD_REQUEST"
  | "CONFLICT"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "UNAVAILABLE";

export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: AppErrorCode,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const admin = getAdminPrincipal;

export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function errorResponse(error: unknown, fallback = "Request failed"): Response {
  const requestId = crypto.randomUUID();
  if (error instanceof AppError) {
    return json({ error: error.message, code: error.code, requestId }, error.status);
  }
  if (error instanceof ZodError) {
    return json(
      { error: "Please check the submitted fields.", code: "BAD_REQUEST", requestId },
      400,
    );
  }
  console.error(`[${requestId}]`, error);
  return json({ error: fallback, code: "UNAVAILABLE", requestId }, 503);
}

export function originCheck(req: Request): void {
  if (req.headers.get("origin") !== new URL(req.url).origin) {
    throw new AppError("Invalid request origin", 403, "FORBIDDEN");
  }
}

export async function readSettings() {
  return {...defaults,...await readFirestoreSettings()};
}

export async function readProducts(active = true): Promise<Product[]> {
  return readFirestoreProducts(active);
}

export async function body<T = unknown>(req: Request, maxBytes = 30_000): Promise<T> {
  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new AppError("Request is too large", 413, "BAD_REQUEST");
  }
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new AppError("JSON required", 415, "BAD_REQUEST");
  }

  const text = await req.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new AppError("Request is too large", 413, "BAD_REQUEST");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AppError("Invalid JSON", 400, "BAD_REQUEST");
  }
}

export function clientIp(req: Request): string {
  const target = deploymentTarget();
  const value =
    target === "vercel"
      ? req.headers.get("x-vercel-forwarded-for")
      : target === "sites"
        ? req.headers.get("cf-connecting-ip")
        : "local";
  const ip = value?.split(",")[0]?.trim();
  return ip && ip.length <= 64 ? ip : "unknown";
}

export async function limit(req: Request, kind: string, max = 12): Promise<void> {
  const rawKey = `${kind}:${clientIp(req)}`;
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawKey));
  const key = Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  if (!(await rateLimitFirestore(key,max))) {
    throw new AppError("Too many requests. Please try again later.", 429, "RATE_LIMITED");
  }
}

export function claimToken(req: Request): string {
  return (
    req.headers
      .get("cookie")
      ?.split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("stacdial_claim="))
      ?.split("=")[1] ?? ""
  );
}

export async function log(actor: string, action: string): Promise<void> {
  await logFirestore(actor,action);
}
