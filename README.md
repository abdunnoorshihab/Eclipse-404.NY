# Eclipse 404 - NY 2027

This editable Vercel project closely matches the original public design at
https://eclipse404-ny2027.rahmansharmin.chatgpt.site/. Its deployed stylesheet,
hero artwork, and fireworks audio were recovered from public assets. This is a
reconstruction, not an export of the original ChatGPT project or its private
backend source.

## Features

- Original black-and-cyan design, artwork, content, and responsive layout
- Full-bleed event poster background in the hero, with the original single-page section layout preserved
- Fireworks visual and original fireworks audio, attempted automatically on entry
- Registration form for name, phone, email, Facebook, Instagram, and consent
- Server-side validation through a Vercel function
- Google Sheets Apps Script integration
- Optional Messenger and WhatsApp chat links

## Deploy to Vercel

1. Import this repository into Vercel.
2. Select the folder containing `index.html` and `vercel.json` as the project root.
3. Use the "Other" framework preset and leave the build command empty.
4. Configure the Google Sheets integration below and redeploy.
5. Optionally set the public contact values in `config.js`.

The fireworks audio is preloaded, and the opening visual burst starts when audio
playback begins. If audio is still loading after a short wait, the visual effect
starts rather than holding up the page. Some browsers block audible autoplay;
when that happens, playback starts on the visitor's first tap or key press
without an extra sound button. Fireworks are rate-limited to keep animation
smooth across display refresh rates.

## Connect Google Sheets

1. Create or open a Google Sheet for event applications.
2. In the Sheet, choose Extensions > Apps Script.
3. Replace its starter code with `google-apps-script/Code.gs`.
4. In Project Settings > Script properties, add `SCRIPT_SECRET` with a long random value. Do not put this secret in browser JavaScript or commit it to Git.
5. Deploy the script as a web app, execute as yourself, and allow access to anyone. Approve Google's authorization prompts.
6. Copy the web app URL ending in `/exec`.
7. In Vercel project settings, set `REGISTRATION_HOOK_URL` to that URL and `REGISTRATION_SECRET` to the same value as `SCRIPT_SECRET`.
8. Redeploy and submit a test application. Verify it appears in the `Registrations` sheet, then remove the test row.

## Privacy

The form collects personal and social profile information. Publish an appropriate
privacy and retention notice, limit access to the destination Sheet, and consider
adding CAPTCHA or rate limiting before sharing the site publicly.

## Customization

- Update event copy only when the schedule and approved details are finalized.
- In `config.js`, set `messengerUsername` and `whatsappNumber` to configure the chat links.
- The original frontend artwork and audio are in `assets/`. Do not store secrets there.

## Local preview

With Node.js 20 or later, run `npx vercel dev` to preview both the site and API.
A static server such as `python -m http.server 8000` previews only the frontend.

## Files

- `index.html` - page structure, content, and registration form
- `styles-original.css` - recovered stylesheet from the original public design
- `styles.css` - local asset path overrides
- `script.js` - interactions, fireworks, validation, and form submission
- `assets/eclipse-ny2027.png` and `assets/fireworks-once.wav` - original public design assets
- `api/register.js` - Vercel registration endpoint
- `google-apps-script/Code.gs` - Google Sheets receiver
- `config.js` - public contact destinations
- `.env.example` - names of the private environment variables required by the API
