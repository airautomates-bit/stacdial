export type DeploymentTarget = "vercel" | "sites" | "local";

export type RuntimeEnv = Record<string, unknown> & {
  ADMIN_EMAILS?: string;
  ADMIN_EMAIL_ONLY?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  AUTH_PROVIDER?: "sites" | "none";
  BLOB_READ_WRITE_TOKEN?: string;
  BUCKET?: R2Bucket;
  DB?: D1Database;
  GOOGLE_SERVICE_ACCOUNT_JSON?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  GOOGLE_APPLICATION_CREDENTIALS?: string;
  LIBSQL_AUTH_TOKEN?: string;
  LIBSQL_URL?: string;
  STACDIAL_DEPLOYMENT?: DeploymentTarget;
  TURSO_AUTH_TOKEN?: string;
  TURSO_DATABASE_URL?: string;
  VERCEL?: string;
};

export function runtime(): RuntimeEnv {
  const workerEnv = (globalThis as { env?: RuntimeEnv }).env ?? {};
  return { ...process.env, ...workerEnv };
}

export function deploymentTarget(env: RuntimeEnv = runtime()): DeploymentTarget {
  if (env.STACDIAL_DEPLOYMENT === "vercel" || env.VERCEL === "1") return "vercel";
  if (env.STACDIAL_DEPLOYMENT === "sites") return "sites";
  return "local";
}

export function usesTrustedPlatformIdentity(env: RuntimeEnv = runtime()): boolean {
  return deploymentTarget(env) === "sites" && env.AUTH_PROVIDER === "sites";
}

export function adminEmails(env: RuntimeEnv = runtime()): string[] {
  return String(env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function emailOnlyAdminAccess(env: RuntimeEnv = runtime()): boolean {
  return deploymentTarget(env) === "local" && env.ADMIN_EMAIL_ONLY === "true";
}
