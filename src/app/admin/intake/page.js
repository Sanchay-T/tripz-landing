import { headers } from "next/headers";

import { Notice, PageHeader } from "../components";
import TicketIntakeClient from "./TicketIntakeClient";
import { auth } from "@/lib/auth";
import { isViewer } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function TicketIntakePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Uploading is a write from end to end — it stores a file and creates a booking
  // — so a read-only account gets the explanation rather than a dropzone whose
  // every button would be refused.
  if (isViewer(session?.user)) {
    return (
      <>
        <PageHeader title="Ticket Intake" />
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <Notice tone="warn" title="Your account is read-only">
            Uploading a ticket creates a booking, so it is not available on this
            account. Documents already uploaded are visible under Documents.
          </Notice>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Ticket Intake"
        body="Upload tickets, vouchers, boarding passes, and receipts. Each file is stored and queued, then the team fills in the booking details and confirms."
      />
      <TicketIntakeClient />
    </>
  );
}
