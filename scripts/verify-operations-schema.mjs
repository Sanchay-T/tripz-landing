/** Read-only production schema and cleanup verifier. */
import { spawnSync } from "node:child_process";

const raw = process.env.DATABASE_URL_UNPOOLED;
if (!raw) throw new Error("DATABASE_URL_UNPOOLED is missing.");
const url = new URL(raw);
const env = { ...process.env, PGHOST:url.hostname, PGPORT:url.port||"5432", PGUSER:decodeURIComponent(url.username), PGPASSWORD:decodeURIComponent(url.password), PGDATABASE:decodeURIComponent(url.pathname.slice(1)), PGSSLMODE:"require" };
function query(sql) {
  const result=spawnSync("psql",["-X","-A","-F","|","-v","ON_ERROR_STOP=1","-c",sql],{env,encoding:"utf8"});
  process.stdout.write(result.stdout||""); process.stderr.write(result.stderr||""); if(result.status)process.exit(result.status||1);
}
query("select current_database() as database, current_user as db_user;");
query("select count(*) as expense_rows from expenses;");
query("select table_name from information_schema.tables where table_schema='public' and table_name in ('finance_accounts','finance_transactions','leads','operational_accounts') order by table_name;");
query("select indexname from pg_indexes where schemaname='public' and indexname in ('finance_transactions_account_date_idx','leads_follow_up_idx','leads_status_idx','leads_campaign_idx','leads_location_idx','operational_accounts_service_idx','operational_accounts_owner_idx') order by indexname;");
query("select (select count(*) from finance_accounts) as finance_accounts, (select count(*) from finance_transactions) as finance_transactions, (select count(*) from leads) as leads, (select count(*) from operational_accounts) as operational_accounts;");
