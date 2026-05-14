import AdminShell from "./AdminShell";

export const metadata = {
  title: "TripZ Admin",
  description: "TripZ internal operations panel"
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
