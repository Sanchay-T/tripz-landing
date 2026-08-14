import AccountsClient from "./AccountsClient";
import { Notice, PageHeader } from "../components";
import { getAdminUser } from "@/lib/admin-user";
import { isViewer } from "@/lib/roles";

export const dynamic = "force-dynamic";
export default async function AccountsPage() {
  const user = await getAdminUser();
  return <><PageHeader title="Login directory" body="Organize operational login IDs and link to the approved password-manager record." /><div className="px-4 pt-4 sm:px-6"><Notice tone="warn" title="Passwords do not belong here">Store passwords, recovery codes, tokens and secrets only in the password manager. This directory intentionally has no password field.</Notice></div><AccountsClient viewer={isViewer(user)} /></>;
}
