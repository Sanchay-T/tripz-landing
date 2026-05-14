import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const fixtureDir = path.join(root, "test-fixtures", "tickets");
const expectedDir = path.join(fixtureDir, "expected");

const fixtures = [
  {
    file: "domestic-flight-indigo.png",
    kind: "domestic flight",
    difficulty: "clean",
    format: "png",
    fields: {
      documentType: "flight_ticket",
      customerName: "Keya Sharma",
      mobileNumber: "+91 90000 00001",
      email: "keya.fixture@example.com",
      bookingType: "flight",
      market: "domestic",
      journeyType: "one_way",
      departure: "DEL",
      arrival: "BOM",
      travelDate: "2026-06-10",
      returnDate: null,
      provider: "IndiGo",
      pnrOrConfirmation: "TZ9K2A",
      baseCost: 4800,
      sellingPrice: 5000,
      currency: "INR",
      confidence: 0.92,
      missingFields: [],
      rawNotes: "Clean synthetic domestic flight ticket."
    }
  },
  {
    file: "domestic-flight-airindia.pdf",
    kind: "domestic flight",
    difficulty: "pdf",
    format: "pdf",
    fields: {
      documentType: "flight_ticket",
      customerName: "Aarav Rao",
      mobileNumber: "+91 90000 00002",
      email: "aarav.fixture@example.com",
      bookingType: "flight",
      market: "domestic",
      journeyType: "return",
      departure: "BLR",
      arrival: "DEL",
      travelDate: "2026-07-04",
      returnDate: "2026-07-11",
      provider: "Air India",
      pnrOrConfirmation: "AI7RT2",
      baseCost: 11200,
      sellingPrice: 12500,
      currency: "INR",
      confidence: 0.9,
      missingFields: [],
      rawNotes: "Synthetic return flight PDF."
    }
  },
  {
    file: "international-flight-emirates.png",
    kind: "international flight",
    difficulty: "clean",
    format: "png",
    fields: {
      documentType: "flight_ticket",
      customerName: "Sachay Mehta",
      mobileNumber: "+91 90000 00003",
      email: "sachay.fixture@example.com",
      bookingType: "flight",
      market: "international",
      journeyType: "one_way",
      departure: "BOM",
      arrival: "DXB",
      travelDate: "2026-08-14",
      returnDate: null,
      provider: "Emirates",
      pnrOrConfirmation: "EK4DXB",
      baseCost: 92000,
      sellingPrice: 100000,
      currency: "INR",
      confidence: 0.91,
      missingFields: [],
      rawNotes: "Synthetic international ticket."
    }
  },
  {
    file: "international-return-ticket.pdf",
    kind: "international return",
    difficulty: "pdf",
    format: "pdf",
    fields: {
      documentType: "flight_ticket",
      customerName: "Ira Khan",
      mobileNumber: "+91 90000 00004",
      email: "ira.fixture@example.com",
      bookingType: "flight",
      market: "international",
      journeyType: "return",
      departure: "DEL",
      arrival: "LHR",
      travelDate: "2026-09-02",
      returnDate: "2026-09-18",
      provider: "British Airways",
      pnrOrConfirmation: "BA9LHR",
      baseCost: 141000,
      sellingPrice: 152000,
      currency: "INR",
      confidence: 0.88,
      missingFields: [],
      rawNotes: "Synthetic international return ticket."
    }
  },
  {
    file: "hotel-voucher.png",
    kind: "hotel voucher",
    difficulty: "clean",
    format: "png",
    fields: {
      documentType: "hotel_voucher",
      customerName: "Sony Kapoor",
      mobileNumber: "+91 90000 00005",
      email: "sony.fixture@example.com",
      bookingType: "hotel",
      market: "domestic",
      journeyType: "stay_only",
      departure: "Goa",
      arrival: "Goa",
      travelDate: "2026-06-21",
      returnDate: "2026-06-24",
      provider: "TripZ Hotels",
      pnrOrConfirmation: "HTL5GOA",
      baseCost: 4200,
      sellingPrice: 5000,
      currency: "INR",
      confidence: 0.86,
      missingFields: [],
      rawNotes: "Synthetic hotel voucher."
    }
  },
  {
    file: "boarding-pass.png",
    kind: "boarding pass",
    difficulty: "clean",
    format: "png",
    fields: {
      documentType: "boarding_pass",
      customerName: "Meera Shah",
      mobileNumber: null,
      email: null,
      bookingType: "flight",
      market: "domestic",
      journeyType: "one_way",
      departure: "HYD",
      arrival: "MAA",
      travelDate: "2026-07-20",
      returnDate: null,
      provider: "IndiGo",
      pnrOrConfirmation: "BP2MAA",
      baseCost: null,
      sellingPrice: null,
      currency: "INR",
      confidence: 0.84,
      missingFields: ["sellingPrice"],
      rawNotes: "Boarding passes usually do not show commercial price."
    }
  },
  {
    file: "multi-city-flight.pdf",
    kind: "multi-city flight",
    difficulty: "pdf",
    format: "pdf",
    fields: {
      documentType: "flight_ticket",
      customerName: "Nikhil Jain",
      mobileNumber: "+91 90000 00006",
      email: "nikhil.fixture@example.com",
      bookingType: "flight",
      market: "international",
      journeyType: "multi_city",
      departure: "BOM",
      arrival: "SIN",
      travelDate: "2026-10-03",
      returnDate: "2026-10-15",
      provider: "Singapore Airlines",
      pnrOrConfirmation: "SQ3SIN",
      baseCost: 118000,
      sellingPrice: 130000,
      currency: "INR",
      confidence: 0.82,
      missingFields: [],
      rawNotes: "Synthetic multi-city ticket; segment detail should be reviewed."
    }
  },
  {
    file: "low-quality-photo.jpg",
    kind: "low quality photo",
    difficulty: "low_quality",
    format: "jpg",
    fields: {
      documentType: "flight_ticket",
      customerName: "Riya Sen",
      mobileNumber: null,
      email: null,
      bookingType: "flight",
      market: "domestic",
      journeyType: "one_way",
      departure: "PNQ",
      arrival: "DEL",
      travelDate: "2026-07-30",
      returnDate: null,
      provider: "Akasa Air",
      pnrOrConfirmation: "QP8DEL",
      baseCost: null,
      sellingPrice: 7200,
      currency: "INR",
      confidence: 0.62,
      missingFields: ["mobileNumber", "email", "baseCost"],
      rawNotes: "Low-quality fixture should remain in human review."
    }
  },
  {
    file: "rotated-ticket.png",
    kind: "rotated flight",
    difficulty: "rotated",
    format: "rotated_png",
    fields: {
      documentType: "flight_ticket",
      customerName: "Kabir Bose",
      mobileNumber: "+91 90000 00007",
      email: "kabir.fixture@example.com",
      bookingType: "flight",
      market: "domestic",
      journeyType: "one_way",
      departure: "CCU",
      arrival: "DEL",
      travelDate: "2026-08-05",
      returnDate: null,
      provider: "Vistara",
      pnrOrConfirmation: "UK5DEL",
      baseCost: 7900,
      sellingPrice: 8600,
      currency: "INR",
      confidence: 0.7,
      missingFields: [],
      rawNotes: "Rotated fixture should be reviewed for OCR confidence."
    }
  },
  {
    file: "missing-pnr-ticket.png",
    kind: "missing PNR",
    difficulty: "missing_field",
    format: "png",
    fields: {
      documentType: "flight_ticket",
      customerName: "Tara Iyer",
      mobileNumber: "+91 90000 00008",
      email: "tara.fixture@example.com",
      bookingType: "flight",
      market: "domestic",
      journeyType: "one_way",
      departure: "AMD",
      arrival: "BOM",
      travelDate: "2026-08-25",
      returnDate: null,
      provider: "SpiceJet",
      pnrOrConfirmation: null,
      baseCost: 6100,
      sellingPrice: 6800,
      currency: "INR",
      confidence: 0.66,
      missingFields: ["pnrOrConfirmation"],
      rawNotes: "PNR intentionally omitted."
    }
  }
];

function ticketSvg(fixture) {
  const fields = fixture.fields;
  const rows = [
    ["Passenger", fields.customerName],
    ["Phone", fields.mobileNumber],
    ["Email", fields.email],
    ["Type", fields.bookingType],
    ["Market", fields.market],
    ["Journey", fields.journeyType],
    ["From", fields.departure],
    ["To", fields.arrival],
    ["Date", fields.travelDate],
    ["Return", fields.returnDate],
    ["Provider", fields.provider],
    ["PNR", fields.pnrOrConfirmation],
    ["Amount", fields.sellingPrice ? `${fields.currency} ${fields.sellingPrice}` : null]
  ].filter(([, value]) => value !== null);

  return `<svg width="1100" height="720" xmlns="http://www.w3.org/2000/svg">
    <rect width="1100" height="720" fill="#ffffff"/>
    <rect x="40" y="40" width="1020" height="640" rx="28" fill="#f7faf8" stroke="#1f4538" stroke-width="6"/>
    <text x="80" y="115" font-family="Arial" font-size="46" font-weight="700" fill="#0f1a16">TripZ Synthetic ${fixture.kind}</text>
    <text x="80" y="160" font-family="Arial" font-size="20" fill="#557064">Fixture: ${fixture.file}</text>
    ${rows
      .map(
        ([label, value], index) =>
          `<text x="80" y="${220 + index * 36}" font-family="Arial" font-size="26" fill="#0f1a16">${label}: ${value}</text>`
      )
      .join("")}
  </svg>`;
}

async function writeImageFixture(fixture) {
  const svg = Buffer.from(ticketSvg(fixture));
  let image = sharp(svg);

  if (fixture.format === "rotated_png") {
    image = image.rotate(90, { background: "#ffffff" });
  }

  if (fixture.format === "jpg") {
    await image.jpeg({ quality: 38 }).blur(0.6).toFile(path.join(fixtureDir, fixture.file));
    return;
  }

  await image.png().toFile(path.join(fixtureDir, fixture.file));
}

async function writePdfFixture(fixture) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fields = fixture.fields;
  const rows = [
    ["Passenger", fields.customerName],
    ["Phone", fields.mobileNumber],
    ["Email", fields.email],
    ["Type", fields.bookingType],
    ["Market", fields.market],
    ["Journey", fields.journeyType],
    ["From", fields.departure],
    ["To", fields.arrival],
    ["Date", fields.travelDate],
    ["Return", fields.returnDate],
    ["Provider", fields.provider],
    ["PNR", fields.pnrOrConfirmation],
    ["Amount", fields.sellingPrice ? `${fields.currency} ${fields.sellingPrice}` : null]
  ].filter(([, value]) => value !== null);

  page.drawRectangle({
    x: 36,
    y: 36,
    width: 540,
    height: 720,
    borderColor: rgb(0.12, 0.27, 0.22),
    borderWidth: 2,
    color: rgb(0.97, 0.99, 0.98)
  });
  page.drawText(`TripZ Synthetic ${fixture.kind}`, {
    x: 60,
    y: 710,
    size: 24,
    font: bold,
    color: rgb(0.06, 0.1, 0.09)
  });
  page.drawText(`Fixture: ${fixture.file}`, {
    x: 60,
    y: 680,
    size: 10,
    font,
    color: rgb(0.25, 0.35, 0.31)
  });
  rows.forEach(([label, value], index) => {
    page.drawText(`${label}: ${value}`, {
      x: 60,
      y: 630 - index * 28,
      size: 14,
      font,
      color: rgb(0.06, 0.1, 0.09)
    });
  });

  await fs.writeFile(path.join(fixtureDir, fixture.file), await pdf.save());
}

async function main() {
  await fs.mkdir(expectedDir, { recursive: true });

  const manifest = [];

  for (const fixture of fixtures) {
    if (fixture.format === "pdf") {
      await writePdfFixture(fixture);
    } else {
      await writeImageFixture(fixture);
    }

    const expectedFile = fixture.file.replace(/\.(png|jpg|pdf)$/u, ".json");
    await fs.writeFile(
      path.join(expectedDir, expectedFile),
      `${JSON.stringify(fixture.fields, null, 2)}\n`
    );

    manifest.push({
      file: fixture.file,
      kind: fixture.kind,
      difficulty: fixture.difficulty,
      expected: `expected/${expectedFile}`
    });
  }

  await fs.writeFile(
    path.join(fixtureDir, "manifest.json"),
    `${JSON.stringify({ fixtures: manifest }, null, 2)}\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
