"use client";

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
      setMessage(error instanceof Error ? error.message : "Unable to sign in");
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
