import { headers } from "next/headers";

import { Notice, PageHeader } from "../../components";
import AddBookingForm from "./AddBookingForm";
import { auth } from "@/lib/auth";
import { isViewer } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // The sidebar hides this destination for read-only accounts, but a bookmark or
  // a typed URL still lands here. Showing the form and letting the save fail with
  // a 403 would waste someone's typing, so the page says so up front instead.
  if (isViewer(session?.user)) {
    return (
      <>
        <PageHeader title="Add booking" />
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <Notice tone="warn" title="Your account is read-only">
            You can see every booking and every figure, but not add or change one.
            Ask Sanchay if you need to.
          </Notice>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Add booking"
        body="Type a booking in and the totals update. Margin is derived from cost and price by the database, so it can never disagree with them."
      />
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <AddBookingForm />
      </div>
    </>
  );
}
