/** Apply the checked-in operations migration with psql without putting the database URL in argv. */
import { spawnSync } from "node:child_process";

const raw = process.env.DATABASE_URL_UNPOOLED;
if (!raw) throw new Error("DATABASE_URL_UNPOOLED is missing.");
const backupPath = process.env.TRIPZ_SCHEMA_BACKUP_PATH;
if (!backupPath) throw new Error("TRIPZ_SCHEMA_BACKUP_PATH is missing.");
const pgDump = process.env.PG_DUMP_BIN || "pg_dump";

const url = new URL(raw);
const dbEnv = {
  ...process.env,
  PGHOST: url.hostname,
  PGPORT: url.port || "5432",
  PGUSER: decodeURIComponent(url.username),
  PGPASSWORD: decodeURIComponent(url.password),
  PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
  PGSSLMODE: "require"
};

function run(command, args) {
  const result = spawnSync(command, args, { env: dbEnv, encoding: "utf8" });
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  if (result.status !== 0) process.exit(result.status || 1);
}

run("psql", [
  "-X", "-A", "-F", "|", "-v", "ON_ERROR_STOP=1", "-c",
  "select current_database() as database, current_user as db_user, count(*) as expense_rows_before from expenses group by current_database(), current_user;"
]);
run("psql", ["-X", "-A", "-F", "|", "-v", "ON_ERROR_STOP=1", "-c", "select to_regclass('public.finance_accounts') as finance_accounts_before, to_regclass('public.leads') as leads_before, to_regclass('public.operational_accounts') as operational_accounts_before;"]);

run(pgDump, [
  "--schema-only", "--no-owner", "--no-privileges",
  `--file=${backupPath}`
]);

run("psql", ["-X", "-v", "ON_ERROR_STOP=1", "-f", "supabase/migrations/20260814190000_operations_expansion.sql"]);

run("psql", [
  "-X", "-A", "-F", "|", "-v", "ON_ERROR_STOP=1", "-c",
  "select count(*) as expense_rows_after from expenses; select table_name from information_schema.tables where table_schema='public' and table_name in ('finance_accounts','finance_transactions','leads','operational_accounts') order by table_name; select indexname from pg_indexes where schemaname='public' and indexname in ('finance_transactions_account_date_idx','leads_follow_up_idx','leads_status_idx','leads_campaign_idx','leads_location_idx','operational_accounts_service_idx','operational_accounts_owner_idx') order by indexname;"
]);
