import { PageHeader } from "../components";
import TicketIntakeClient from "./TicketIntakeClient";

export default function TicketIntakePage() {
  return (
    <>
      <PageHeader
        eyebrow="Ticket intake"
        title="Ticket Intake"
        body="Upload tickets, vouchers, boarding passes, and receipts. Each file is stored and queued, then the team fills in the booking details and confirms."
      />
      <TicketIntakeClient />
    </>
  );
}
