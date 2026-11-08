# Eclipse 404 — NY 2027

This editable Vercel project now closely matches the original public design at `https://eclipse404-ny2027.rahmansharmin.chatgpt.site/`. The original page's deployed stylesheet, hero artwork, and fireworks audio were recovered from its public assets. This is still a reconstruction, not an export of the original ChatGPT project or its private backend source.

## Features
- Original black-and-cyan design, event artwork, content, and responsive layout
- Mobile friendly, no external front-end dependencies
- Fireworks visual and the original fireworks audio, enabled only after a visitor interaction
- Guest registration: name, phone, email, Facebook, Instagram; consent required
- Server-side validation; submission is **not** considered successful without a confirmed response from Google Apps Script
- Google Sheets Apps Script integration via a Vercel serverless function
- Configurable Messenger and WhatsApp chat options

## Deploy to Vercel
1. Create a GitHub repository and upload **this folder's files**, preserving `api/register.js`.
2. Sign in to https://vercel.com and choose **Add New → Project → Import Git Repository**. Pick your repository.
3. Framework preset: **Other**. Root directory: folder containing `index.html`. Leave build command empty.
4. Deploy. Vercel will assign a `*.vercel.app` preview URL.
5. Complete Google Sheets steps below and set environment variables, then redeploy.
6. For chat, edit `config.js` with your public Facebook Page username and WhatsApp business number and push the change.

Alternative terminal deployment with Vercel CLI (after signing in to your Vercel account):
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Connect Google Sheets
1. Create or open a Google Sheet that will collect event guest applications.
2. In the Sheet, open **Extensions → Apps Script**.
3. Replace its starter code with `google-apps-script/Code.gs`.
4. Open **Project Settings → Script properties**; add `SCRIPT_SECRET` set to a long random string. Do not share it or place it in any browser JS.
5. Use **Deploy → New deployment → Web app**; execute as **Me** and allow access to **Anyone** (necessary for anonymous server-to-server POST via this method). Approve Google's authorization prompts.
6. Copy the Web App `/exec` URL.
7. In Vercel project **Settings → Environment Variables**, create `REGISTRATION_HOOK_URL` = that URL, and `REGISTRATION_SECRET` = the same value as `SCRIPT_SECRET`.
8. Redeploy your site. Send a test application and verify a row appears on the `Registrations` worksheet. Then delete that test row.

**Privacy:** This form collects real personal and social account information. Ensure you publish an appropriate privacy notice/retention policy and limit access to the destination Google Sheet. Anyone with a valid form can submit; for production campaigns with high traffic, add CAPTCHA/Turnstile and rate limiting before sharing publicly. Consent in the page is event-contact consent, not permission to use information for marketing outside the event.

## Customizations
- Update hero text/date when event schedule and approved details are finalized. No exact event date or venue has been invented.
- In `config.js`, set `messengerUsername` and `whatsappNumber`. The widget explains that chat is pending when these values aren't set.
- The original frontend artwork and audio are stored in `assets/`; no secrets belong there.

## Local preview
With Node 20+, use `npx vercel dev` after project linking to run API functions. Alternatively `python -m http.server 8000` previews the frontend only (the registration endpoint won't exist).

## Files
- `index.html` — content and form
- `styles-original.css` — recovered responsive stylesheet from the original public design
- `styles.css` — local asset path overrides
- `script.js` — interactions, fireworks, client validation, form submission
- `assets/eclipse-ny2027.png` and `assets/fireworks-once.wav` — original public design assets
- `config.js` — public chat destinations
- `api/register.js` — serverless Google Sheets proxy (Vercel)
- `google-apps-script/Code.gs` — Google Sheets form receiver
- `vercel.json` — Vercel configuration
- `.env.example` — required private environment variables
