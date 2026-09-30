"use client";

import { useState } from "react";

export default function AdminLogin({ emailOnly = false }: { emailOnly?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return <main className="admin-gate">
    <form className="panel form" onSubmit={async event => {
      event.preventDefault();
      setBusy(true);
      setError("");
      try {
        const response = await fetch("/api/admin-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          const data = await response.json() as { error?: string };
          throw Error(data.error || "Unable to sign in");
        }
        location.reload();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Unable to sign in");
        setBusy(false);
      }
    }}>
      <span className="eyebrow muted">Stacdial management</span>
      <h1>Administrator sign in</h1>
      <p className="muted">{emailOnly ? "Enter the approved administrator email. This local device will remain signed in for 30 days." : "Use the approved administrator account. This device will remain signed in for 30 days."}</p>
      <label>Email address<input aria-label="Administrator email" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required /></label>
      {!emailOnly && <label>Password<input aria-label="Administrator password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>}
      <button className="pill" disabled={busy}>{busy ? "Signing in…" : "Continue"}</button>
      {error && <p role="alert" className="error">{error}</p>}
    </form>
  </main>;
}
