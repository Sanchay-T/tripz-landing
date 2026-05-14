# TripZ Admin Master Spec

## Goal

Build an internal TripZ operating panel under `/admin` for the backend and operations team. The panel must cover ticket intake, Gemini-assisted extraction, human review, booking/customer management, task tracking, documents, finance, templates, providers, and imports.

## Product Shape

- Use the existing Next.js App Router project.
- Keep the public landing page unchanged.
- Use shadcn-style admin patterns: sidebar, top bar, cards, tables, badges, forms, dialogs, sheets, and dense dashboard surfaces.
- Keep `bookings` as the center record. Customers, documents, extraction rows, tasks, payments, expenses, and notifications attach to bookings.
- Use human review before any Gemini extraction becomes a final booking.

## Default Stack

- UI: Tailwind utilities, shadcn-style components, lucide-react icons.
- AI SDK: `@google/genai`.
- AI backend: Vertex AI on Google Cloud project `cyphersol-prod`.
- Default model: `gemini-2.5-flash-lite`.
- Accuracy fallback: `gemini-2.5-flash`.
- Data/storage target: Supabase Postgres and Supabase Storage.

## Success Criteria

- `/admin` renders a responsive admin dashboard with the TripZ theme.
- `/admin/intake` supports file selection, upload status, extraction status, and editable review fields.
- Server-only Gemini extraction uses `responseMimeType` and `responseSchema`, not prompt-only JSON.
- Synthetic ticket fixtures exist and can be reused for regression testing.
- Extraction output is validated before it enters operational data.
- No booking is finalized automatically from AI output in v1.

## Out Of Scope For V1

- Customer-facing login.
- Automated WhatsApp sending.
- Airline or hotel booking APIs.
- Auto-finalizing bookings without human review.
- Complex approvals.
- Multi-tenant support.
