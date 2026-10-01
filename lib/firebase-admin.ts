import "server-only";

import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { initializeFirestore, type Firestore } from "firebase-admin/firestore";
import { runtime } from "./runtime";

let firestoreInstance: Firestore | undefined;

function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const env = runtime();
  const projectId = String(env.FIREBASE_PROJECT_ID || "stacdial");
  let clientEmail = String(env.FIREBASE_CLIENT_EMAIL || "");
  let privateKey = String(env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if ((!clientEmail || !privateKey) && env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const account = JSON.parse(String(env.GOOGLE_SERVICE_ACCOUNT_JSON)) as {
        client_email?: string;
        private_key?: string;
      };
      clientEmail = account.client_email || "";
      privateKey = (account.private_key || "").replace(/\\n/g, "\n");
    } catch {
      // Firebase Admin reports malformed credentials when initialization is attempted.
    }
  }
  const credential = clientEmail && privateKey
    ? cert({ projectId, clientEmail, privateKey })
    : applicationDefault();
  return initializeApp({ credential, projectId });
}

export function firebaseAdminAuth() {
  return getAuth(adminApp());
}

export function firestore() {
  // Vercel functions are more reliable over Firestore's HTTP transport than
  // a long-lived gRPC channel, especially during a cold start.
  firestoreInstance ??= initializeFirestore(adminApp(), { preferRest: true });
  return firestoreInstance;
}

export function firebaseServerConfigured(): boolean {
  const env = runtime();
  return Boolean(
    (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) ||
    env.GOOGLE_APPLICATION_CREDENTIALS ||
    env.GOOGLE_SERVICE_ACCOUNT_JSON
  );
}
