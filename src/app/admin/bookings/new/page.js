import { PageHeader } from "../../components";
import AddBookingForm from "./AddBookingForm";

export const dynamic = "force-dynamic";

export default function NewBookingPage() {
  return (
    <>
      <PageHeader
        title="Add booking"
        body="Type a booking in and the totals update. Margin is derived from cost and price by the database, so it can never disagree with them."
      />
      <div className="px-4 py-5 sm:px-6">
        <AddBookingForm />
      </div>
    </>
  );
}
