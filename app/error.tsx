"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="reading"><h1>Something went wrong.</h1><p className="muted">We could not load this page. Please try again.</p><button className="pill" onClick={reset}>Try again</button></main>;
}
