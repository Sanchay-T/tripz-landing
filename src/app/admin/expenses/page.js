import ExpensesClient from "./ExpensesClient";
import { PageHeader } from "../components";
import { getAdminUser } from "@/lib/admin-user";
import { isViewer } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const user = await getAdminUser();
  return <><PageHeader title="Expenses" body="Enter, classify and maintain operating expenses in INR." /><ExpensesClient viewer={isViewer(user)} /></>;
}
