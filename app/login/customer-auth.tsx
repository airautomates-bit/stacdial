"use client";

import { FirebaseError } from "firebase/app";
import { signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { firebaseAuth, googleProvider } from "@/lib/firebase-client";

export function GoogleSignInButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function login() {
    setBusy(true);setMessage("");
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      const response = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
      if (!response.ok) throw new Error("Unable to create your secure session");
      await signOut(firebaseAuth);
      router.refresh();
    } catch (error) {
      if (error instanceof FirebaseError) {
        const messages: Record<string, string> = {
          "auth/popup-blocked": "Please allow pop-ups for Stacdial, then try again.",
          "auth/popup-closed-by-user": "The Google sign-in window was closed before sign-in finished.",
          "auth/unauthorized-domain": "This website still needs to be authorized in Firebase. Please contact Stacdial.",
          "auth/network-request-failed": "Google sign-in could not reach the network. Please check your connection and try again.",
          "auth/internal-error": "Google sign-in could not start. Please reload the page and try again.",
        };
        setMessage(messages[error.code] || "Unable to sign in with Google. Please try again.");
      } else {
        setMessage(error instanceof Error ? error.message : "Unable to sign in");
      }
    } finally { setBusy(false); }
  }
  return <><button className="pill" type="button" disabled={busy} onClick={login}>{busy ? "Signing in…" : "Continue with Google"}</button>{message&&<p className="error" role="alert" style={{marginTop:16}}>{message}</p>}</>;
}

export function CustomerSignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    setBusy(false);
  }
  return <button className="textlink" type="button" disabled={busy} onClick={logout}>{busy?"Signing out…":"Sign out"}</button>;
}
