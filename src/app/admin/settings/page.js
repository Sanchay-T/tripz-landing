import { AdminCard, PageHeader } from "../components";

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="System" title="Settings" body="Environment, model, roles, storage, and admin defaults." />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
        <AdminCard className="p-5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/45">Extraction model</p>
          <p className="mt-2 text-xl font-semibold">claude-haiku-4-5-20251001</p>
          <p className="mt-2 text-sm text-ink/55">Configurable through `TRIPZ_ANTHROPIC_MODEL`.</p>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/45">Provider</p>
          <p className="mt-2 text-xl font-semibold">Anthropic Claude API</p>
          <p className="mt-2 text-sm text-ink/55">Uses `ANTHROPIC_API_KEY` server-side only.</p>
        </AdminCard>
      </div>
    </>
  );
}
