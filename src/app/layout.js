import "./globals.css";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap"
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap"
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap"
});

export const metadata = {
  title: "TripZ — Travel help, without the hold music.",
  description:
    "Flights, hotels, group bookings, international trips — and a real travel expert on the line, 24/7. 10+ experts. 80% of bookings come with free cancellation and free date change.",
  metadataBase: new URL("https://tripz-landing.vercel.app"),
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
      <body
        className={`${geist.variable} ${instrument.variable} ${jetbrains.variable} min-h-screen overflow-x-hidden bg-paper text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
