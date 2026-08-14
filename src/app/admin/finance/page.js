import FinanceClient from "./FinanceClient";
import { PageHeader } from "../components";
import { getAdminUser } from "@/lib/admin-user";
import { isViewer } from "@/lib/roles";

export const dynamic = "force-dynamic";
export default async function FinancePage() {
  const user = await getAdminUser();
  return <><PageHeader title="Bank and cash" body="Track separate accounts, cash movement and reconciled balances in INR." /><FinanceClient viewer={isViewer(user)} /></>;
}
