import type { NextConfig } from "next";

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  "https://apis.google.com",
  "https://www.gstatic.com",
];
if (process.env.NODE_ENV === "development") scriptSources.push("'unsafe-eval'");

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "Content-Security-Policy", value: `default-src 'self'; img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://lh3.googleusercontent.com; media-src 'self' blob: https://*.public.blob.vercel-storage.com; script-src ${scriptSources.join(" ")}; style-src 'self' 'unsafe-inline'; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com; frame-src https://stacdial.firebaseapp.com https://accounts.google.com; frame-ancestors 'none'; font-src 'self' data:; base-uri 'self'; form-action 'self' https://wa.me` },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
    ] }];
  },
};

export default nextConfig;
