# Gemini Ticket Extraction

## SDK

Use Google Gen AI JavaScript SDK:

```text
@google/genai
```

Use Vertex AI mode:

```js
new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || "global",
  apiVersion: "v1"
});
```

## Environment

```text
GOOGLE_CLOUD_PROJECT=cyphersol-prod
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_VERTEXAI=true
TRIPZ_GEMINI_MODEL=gemini-2.5-flash-lite
```

Local development must use Application Default Credentials or a deploy-time service account. CLI access was verified with `gcloud auth login`, but the running Next.js server should use ADC:

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project cyphersol-prod
```

## Flow

```text
file buffer + MIME type
  -> inlineData base64 part
  -> ai.models.generateContent()
  -> config.responseMimeType = application/json
  -> config.responseSchema = ticketExtractionSchema
  -> JSON.parse(response.text)
  -> Zod validation
  -> store raw response and normalized fields
  -> route to human review
```

## Important

- The prompt describes what to extract.
- `responseSchema` enforces the response shape.
- Zod validates application correctness after Gemini responds.
- Do not auto-finalize bookings from AI output in v1.
