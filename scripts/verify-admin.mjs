/**
 * Static checks for the admin's UI-library migration.
 *
 *   node scripts/verify-admin.mjs
 *
 * Exists so the migration's "green ticks" are reproducible by anyone rather than
 * asserted in a chat message. Prints one line per assertion and exits non-zero if
 * any fails, so it can gate a commit.
 *
 * These are the checks a build cannot make. `next build` happily compiles a raw
 * `<input>`, a hand-rolled table, or a stray arbitrary-value class — none of them
 * are type errors, they are just the things this migration set out to remove.
 *
 * Runtime and visual checks (horizontal overflow at each breakpoint, the figures,
 * auth) are not here: they need a browser and a database. They are run separately
 * against a live server.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ADMIN = "src/app/admin";
const UI = "src/components/ui";

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if ([".js", ".jsx"].includes(extname(full))) out.push(full);
  }
  return out;
}

const adminFiles = walk(ADMIN);
const read = (f) => readFileSync(f, "utf8");

// Strip comments before pattern matching. Several of these files carry long
// rationale comments that quote the very markup being banned, and matching those
// would make the check fail on its own documentation.
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

const checks = [];
const check = (name, detail, pass, offenders = []) =>
  checks.push({ name, detail, pass, offenders });

// --- raw form controls -----------------------------------------------------
const rawControl = /<(input|select|textarea)\b/;
const controlOffenders = adminFiles.filter((f) => rawControl.test(code(read(f))));
check(
  "no raw form controls",
  "0 <input|select|textarea> under src/app/admin",
  controlOffenders.length === 0,
  controlOffenders
);

// --- raw tables ------------------------------------------------------------
const tableOffenders = adminFiles.filter((f) => /<table\b/.test(code(read(f))));
check("no raw tables", "0 <table> under src/app/admin", tableOffenders.length === 0, tableOffenders);

// --- custom CSS ------------------------------------------------------------
// `data-[...]` and `@[...]` are Tailwind variant selectors, not custom values.
const ARBITRARY = /(?<![\w:])[a-z][a-z-]*-\[[^\]]+\]/g;
const cssOffenders = [];
for (const f of adminFiles) {
  const hits = (code(read(f)).match(ARBITRARY) ?? []).filter(
    (m) => !m.startsWith("data-[") && !m.startsWith("supports-[")
  );
  if (hits.length) cssOffenders.push(`${f} → ${[...new Set(hits)].join(", ")}`);
}
check("no custom CSS", "0 arbitrary-value classes", cssOffenders.length === 0, cssOffenders);

// --- library adoption ------------------------------------------------------
// Pages that render nothing but a wrapper legitimately import no primitives, so
// this measures files that build UI, not the raw file count.
const buildsUI = adminFiles.filter((f) => /<[a-z]|className=/.test(code(read(f))));
const adopters = buildsUI.filter((f) => read(f).includes("@/components/ui"));
check(
  "library adoption",
  `${adopters.length}/${buildsUI.length} UI-building admin files import @/components/ui`,
  adopters.length === buildsUI.length,
  buildsUI.filter((f) => !adopters.includes(f))
);

// --- no dead primitives ----------------------------------------------------
const primitives = read(join(ADMIN, "components.jsx"));
const exported = [...primitives.matchAll(/^export function ([A-Za-z]+)/gm)].map((m) => m[1]);
const KEEP = ["PageHeader", "AdminTable"];
const extra = exported.filter((e) => !KEEP.includes(e));
check(
  "no duplicate primitives",
  `components.jsx exports ${exported.length} (want ${KEEP.join(", ")})`,
  extra.length === 0,
  extra
);

// --- installed-but-unused --------------------------------------------------
const installed = readdirSync(UI).map((f) => f.replace(/\.jsx?$/, ""));
const allSource = walk("src").map(read).join("\n");
const unused = installed.filter((c) => !allSource.includes(`components/ui/${c}"`));
check(
  "no unused components",
  `${installed.length - unused.length}/${installed.length} installed components are used`,
  unused.length === 0,
  unused
);

// --- report ----------------------------------------------------------------
let failed = 0;
for (const { name, detail, pass, offenders } of checks) {
  console.log(`${pass ? "✓" : "✗"} ${name.padEnd(24)} ${detail}`);
  if (!pass) {
    failed += 1;
    for (const o of offenders.slice(0, 8)) console.log(`    ${o}`);
    if (offenders.length > 8) console.log(`    …and ${offenders.length - 8} more`);
  }
}

console.log(`\n${checks.length - failed}/${checks.length} passing`);
process.exit(failed === 0 ? 0 : 1);
