import LeadsClient from "./LeadsClient";
import { PageHeader } from "../components";
import { getAdminUser } from "@/lib/admin-user";
import { isViewer } from "@/lib/roles";

export const dynamic = "force-dynamic";
export default async function LeadsPage() {
  const user = await getAdminUser();
  return <><PageHeader title="Leads" body="Capture prospects, campaigns and the next follow-up in one operating list." /><LeadsClient viewer={isViewer(user)} /></>;
}
