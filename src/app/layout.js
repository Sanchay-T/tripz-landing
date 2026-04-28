import "./globals.css";

export const metadata = {
  title: "TripZ — Travel help, without the hold music.",
  description:
    "Flights, hotels, group bookings, international trips — and a real travel expert on the line, 24/7. 10+ experts. 80% of bookings come with free cancellation and free date change.",
  metadataBase: new URL("https://tripz.co.in"),
  openGraph: {
    title: "TripZ — Travel help, without the hold music.",
    description:
      "A real travel expert picks up in under a minute. 38s avg pickup · 24/7 · 10 experts on shift right now.",
    type: "website",
    siteName: "TripZ"
  },
  twitter: {
    card: "summary_large_image",
    title: "TripZ — Travel help, without the hold music.",
    description:
      "A real travel expert picks up in under a minute. 38s avg pickup · 24/7 · 365 days."
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
