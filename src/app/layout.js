import "./globals.css";

export const metadata = {
  title: "TripZ — Travel help, without the hold music.",
  description:
    "TripZ is a service, not a chatbot. A real person picks up in under a minute — any hour, any leg of the trip — and handles the rebooking, refunds, and arguments so you don't have to.",
  metadataBase: new URL("https://tripz.co.in"),
  openGraph: {
    title: "TripZ — Travel help, without the hold music.",
    description:
      "A real person picks up in under a minute. 38s avg pickup · 24/7 coverage · 14 humans online right now.",
    type: "website",
    siteName: "TripZ"
  },
  twitter: {
    card: "summary_large_image",
    title: "TripZ — Travel help, without the hold music.",
    description:
      "A real person picks up in under a minute. 38s avg pickup · 24/7 coverage."
  }
};

export const viewport = {
  themeColor: "#0f1a16",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
