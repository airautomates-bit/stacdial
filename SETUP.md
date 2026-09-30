# Stacdial setup
The site is privately published for review. It is not open to customers yet.

## Firebase backend and customer authentication
- Firebase project: `stacdial`; web app: `1:92597748937:web:fafb620a107236ab677918`.
- Google is the customer sign-in provider. The browser obtains a Firebase ID token and exchanges it through `/api/auth/session` for a secure, revocable, `HttpOnly` session cookie lasting up to 14 days.
- Firestore `(default)` is Standard edition, Native mode, region `asia-southeast1`. Products, settings, interest requests, customer history, offers, media metadata, rate limits and audit records use Firestore through Firebase Admin.
- `firestore.rules` deliberately denies every browser read/write. Application data is accessed through validated Next.js server routes only. Deploy changes with `npx -y firebase-tools@latest deploy --only firestore:rules,firestore:indexes --project stacdial`.
- Add `FIREBASE_PROJECT_ID=stacdial`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` as Vercel environment variables. The private key must remain server-only and must never be committed or prefixed with `NEXT_PUBLIC_`.
- The public `NEXT_PUBLIC_FIREBASE_*` values are documented in `.env.example`; Firebase web API keys identify the project but do not grant Firebase Admin access.

## Deployment and administrator authentication
- Set `STACDIAL_DEPLOYMENT=vercel` on Vercel. Vercel request headers are never accepted as customer or administrator identity.
- Set `ADMIN_EMAILS`, an `ADMIN_PASSWORD` of at least 12 characters, and an independent random `ADMIN_SESSION_SECRET` of at least 32 characters. Never commit their values.
- Configure Vercel Blob (`BLOB_READ_WRITE_TOKEN`) or a Sites R2 `BUCKET` binding for uploaded media files. Firestore stores their metadata and stable references.

## Content and media
- Homepage, product, order, offer, media and audit records are stored in named Firestore collections. Code continues to own section layout and styling.
- Product records support draft/published and stock states. Draft, hidden or out-of-stock products cannot accept interest registrations.
- New uploads create stable `/api/assets/{id}` references backed by Firestore media metadata. Replacing a media-library file updates the backing object while preserving references already saved in sections and products.
- Allowed uploads are JPG, PNG, WebP, MP4, and WebM, up to 80 MB. The server verifies both MIME type and file signature.

## Required before launch
- Set `ADMIN_EMAILS` to a comma-separated administrator email allowlist. An empty value deliberately locks every admin write operation. Firebase users whose verified email is allowlisted can access administration; the first visitor never becomes administrator.
- Customer sign-in uses Firebase Authentication with Google. Add every production/preview hostname to Firebase Authentication → Settings → Authorized domains.
- Open /admin, sign in with an allowlisted email, and add actual product photos, descriptions, specifications, prices and payment-plan terms. Demonstration catalogue items cannot be purchased.
- Upload desktop/mobile home videos in /admin → Home video. Add a fallback image. Videos autoplay muted where browser policy permits, loop, and respect reduced-motion preferences.
- Enter the business WhatsApp number, including country code, in Store settings.
- Replace reference photography before making the store public.
- Test the full purchase request and payment verification with the configured accounts before launch.

## Google Sheets
Set GOOGLE_SERVICE_ACCOUNT_JSON as a secret containing a Google service account's JSON credential with Sheets API access. Do not enter this credential in a public form.
Create a dedicated spreadsheet tab named Orders; share that sheet as an editor with the service account email. Save its spreadsheet ID in Store settings.
Requests and verified payments attempt a sync. Failed syncs retain database records and can be retried from Store settings. This version supports a 5,000-request export. The Orders tab is app-managed.
Do not put unrelated data in Orders!A:I. Sheets receives personal order data; restrict spreadsheet access accordingly.

## Security and accounting
Server-side admin allowlist, Firebase session verification, identity checks on private APIs, origin validation on mutations, input validation, upload MIME and signature checks, rate limits, HttpOnly cookies, integer minor-unit totals, persistent order idempotency keys, transactional discount eligibility/claim use, and an audit log.
The discount is applied once per normalized phone number and once per claim. Phone numbers are not verified by OTP, so this is not proof of a unique person.
Paid status is set only by an administrator after verification; it is not inferred from WhatsApp or a screenshot.
No implementation can guarantee zero vulnerabilities. This build has not received an independent penetration test.

## Typography
Uses Apple's system SF font on Apple devices through -apple-system / BlinkMacSystemFont, then installed SF Pro, then Arial. No Apple font binary is redistributed. Cross-platform SF Pro rendering requires appropriately licensed web font assets.

## Validation performed
Firestore rules/index deployment, TypeScript, lint, tests and production build.
Connected WhatsApp, Firebase Admin credentials, Google API credentials and the administrator allowlist require final end-to-end validation in the deployed environment.

## V2 changes
- Main navigation now lists Home, Shop, About and Login. The centered brand and desktop search field are retained.
- Mobile search opens an accessible modal with a blurred backdrop, live collection suggestions and watch results.
- Everyday, Dress and Sport labels link to a collection-filtered Shop. Clear returns to the full Shop.
- Shop/About covers and editorial photography support non-destructive horizontal/vertical positioning, zoom, fit/fill and independent mobile framing.
- Supplied desktop and mobile films are included at public/videos/watchpc.mp4 and public/videos/mobile.mp4.
- Business WhatsApp: 94760436776.
- Spreadsheet ID: 1ljq3p8armJ5Ua042uKqOSzf90CjGQo97WNISRACRW-8. The server Google service-account credential is still required for automatic sync. Connecting the conversational Drive plugin does not install a runtime credential in the site.
- ADMIN_EMAILS runtime setting is configured to the user-supplied liqiudspike@gmail.com. The private site currently allows the owner vervestac@gmail.com. The separate admin account needs a private viewer invitation before accessing it; invitation emails require authorization.
- Returning-customer offers: administrator chooses a customer with a paid purchase, 1–50% discount, minimum spend and expiry (Sri Lanka time). Cryptographically random personal codes are single-use, matched against the normalized phone number, checked atomically at order creation, and can be disabled before use. They never stack with the welcome offer.
- The Details editorial feature sits directly beneath Featured. One optional WhatsApp consultation section follows; requests are not confirmed bookings.
- Existing purchase/payment flow, product detail layout and card visual styling remain in place.

V2 validation: production compilation, TypeScript, migration inspection and targeted SQLite transaction tests including existing welcome-offer regression. Browser QA was not requested.
