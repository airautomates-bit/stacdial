# Stacdial V2 — local setup

## Requirements

- Node.js 22 or newer
- Corepack / pnpm

## Run on Windows

Open PowerShell inside this folder:

```powershell
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Open the local address shown in PowerShell.

## Included

- Home, Shop, About, Login and product routes
- Desktop and mobile hero videos
- Responsive search and collection filters
- Product quick views and detail pages
- Admin dashboard, product and media controls
- First-purchase and returning-customer offers
- Purchase requests, payment status and reporting
- Google Sheets integration code

## Local services

The deployed version uses cloud storage, database and identity services supplied by Sites. For full local testing of admin uploads, orders and authentication, follow the managed development instructions in the main README and configure the values in `.env`.

Keep `.env` private. It is excluded from this package.

## Admin configuration

- Approved email: `liqiudspike@gmail.com`
- WhatsApp: `94760436776`
- Google Sheet ID: `1ljq3p8armJ5Ua042uKqOSzf90CjGQo97WNISRACRW-8`

Automatic Google Sheets sync needs a Google service-account JSON credential in `GOOGLE_SERVICE_ACCOUNT_JSON`.

## Vercel deployment

This project is configured for a normal Next.js/Vercel deployment. Create a Turso/libSQL database and run `turso-schema.sql` once, then add these Vercel environment variables:

- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` — production database
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token for admin media uploads
- `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` — dashboard login and signed session key
- `ADMIN_EMAILS` — approved administrator email, normally `liqiudspike@gmail.com`
- `GOOGLE_SERVICE_ACCOUNT_JSON` — optional Google service-account JSON for sheet sync

In Vercel, import the project, keep the framework as Next.js, and use `pnpm install` followed by `pnpm build`. The public videos already included under `public/videos` work without storage configuration; newly uploaded media uses Vercel Blob.

## Typeface

The interface requests SF Pro first and uses Apple's system font on Apple devices. The package does not redistribute Apple's font files.
