import { PageHeader } from "../components";
import TicketIntakeClient from "./TicketIntakeClient";

export default function TicketIntakePage() {
  return (
    <>
      <PageHeader
        eyebrow="Claude extraction"
        title="Ticket Intake"
        body="Upload tickets, vouchers, boarding passes, and receipts. Claude Haiku returns structured fields, then the team reviews before booking creation."
      />
      <TicketIntakeClient />
    </>
  );
}
