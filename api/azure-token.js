// Vercel serverless function: mints a short-lived Azure Speech token so the
// browser never sees the subscription key.
//
// Required environment variables (set in the Vercel dashboard):
//   AZURE_SPEECH_KEY     - your Azure Speech resource key
//   AZURE_SPEECH_REGION  - e.g. "eastus"  (defaults to eastus)
//
// The game fetches POST /api/azure-token and gets { token, region }.

export default async function handler(req, res) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || "eastus";

  if (!key) {
    res.status(500).json({ error: "AZURE_SPEECH_KEY is not set" });
    return;
  }

  try {
    const r = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Length": "0",
        },
      }
    );

    if (!r.ok) {
      res.status(502).json({ error: "Azure token request failed", status: r.status });
      return;
    }

    const token = await r.text();
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ token, region });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
