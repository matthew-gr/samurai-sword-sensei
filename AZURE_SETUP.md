# Azure pronunciation scoring (optional upgrade)

The game runs fine on the browser's built-in Web Speech API. If you deploy it to
**Vercel** with an Azure Speech resource, it automatically upgrades to **Azure
Pronunciation Assessment** — real per-phoneme scoring of the SH / CH / S / Z
sounds, driving the closeness bar under each target word.

If Azure isn't configured (or you open `index.html` locally), the game silently
falls back to Web Speech. Nothing breaks.

## How it works

- `index.html` loads the Azure Speech SDK and, on START, calls
  `POST /api/azure-token`.
- `api/azure-token.js` (a Vercel serverless function) exchanges your secret key
  for a **short-lived token** and returns `{ token, region }`. The key never
  reaches the browser.
- The game runs continuous recognition with the round's target word as the
  reference text (miscue enabled, so the child can chat/ask questions — only
  attempts at the target word are scored).
- The target sound's accuracy (0–100) fills the bar; at **70** or above it turns
  green and she wins the round. Saying a wrong sibling (e.g. "chip" for "ship")
  flashes that card and triggers the gentle coach.

## One-time setup

1. **Create an Azure Speech resource** in the Azure portal (region **eastus**).
   Copy one of its keys.
2. **Deploy this repo to Vercel** (zero-config: `index.html` is served as a
   static site and `api/azure-token.js` becomes a serverless function).
3. In the Vercel project → **Settings → Environment Variables**, add:
   - `AZURE_SPEECH_KEY` = your Azure Speech key
   - `AZURE_SPEECH_REGION` = `eastus`
4. Redeploy. Open the site, tap START, allow the microphone — you should see the
   bar fill as she speaks.

## Tuning

- Win threshold: `WIN_THRESHOLD` near the top of the `<script>` in `index.html`
  (currently `70`). Lower it if it feels too strict for her.

## Cost / privacy

- Pronunciation Assessment is usage-priced (a fraction of a cent per short
  utterance). Continuous mode streams audio while listening.
- Audio is sent to Azure for scoring. Fine for personal use; just a deliberate
  choice to be aware of.
