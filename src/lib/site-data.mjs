export const supportPhoneDisplay = "+91 99566 51212";
export const supportPhoneE164 = "+919956651212";

const whatsappMessage =
  "Hi TripZ — I need a human on this. Can someone from the desk pick up?";

export const liveStatus = {
  expertsOnShift: 10,
  avgPickupSeconds: 38
};

export const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "Services", href: "#services" },
  { label: "The desk", href: "#desk" },
  { label: "Stories", href: "#stories" }
];

export const heroStats = [
  { label: "Avg pickup", value: "38s" },
  { label: "Coverage", value: "24/7" },
  { label: "CSAT", value: "9.6" }
];

export const ctaActions = {
  call: {
    label: "Call a human",
    meta: "24/7",
    href: `tel:${supportPhoneE164}`,
    icon: "phone"
  },
  chat: {
    label: "Live chat",
    href: "#support",
    icon: "chat"
  },
  whatsapp: {
    label: "WhatsApp",
    href: `https://wa.me/${supportPhoneE164.replace("+", "")}?text=${encodeURIComponent(
      whatsappMessage
    )}`,
    icon: "whatsapp"
  }
};

export const heroAgent = {
  meta: "Live · Travel expert online · 03:47 IST",
  quote: "Hi — I've pulled up your booking. Tell me what happened.",
  initials: "AS",
  name: "Asha Sharma",
  role: "Senior travel expert · Mumbai · 6 yr"
};

export const heroQuotes = [
  {
    initials: "AS",
    name: "Asha Sharma",
    role: "Senior travel expert · Mumbai · 6 yr",
    quote: "Hi — I've pulled up your booking. Tell me what happened."
  },
  {
    initials: "KP",
    name: "Kenji Park",
    role: "Recovery expert · Tokyo · 4 yr",
    quote: "Connected. I see your Narita itinerary — one moment."
  },
  {
    initials: "ML",
    name: "Maya Leclerc",
    role: "Senior travel expert · Paris · 8 yr",
    quote: "Bonjour — I have your file. Let's sort the embassy first."
  },
  {
    initials: "DO",
    name: "Diego Okafor",
    role: "Corporate travel expert · Lagos · 5 yr",
    quote: "On the line. Twelve passengers — let me line up the legs."
  }
];

export const onlinePool = [
  { initials: "KP", name: "Kenji Park", city: "Tokyo" },
  { initials: "ML", name: "Maya Leclerc", city: "Paris" },
  { initials: "DO", name: "Diego Okafor", city: "Lagos" },
  { initials: "RJ", name: "Rohan Joshi", city: "Bengaluru" },
  { initials: "AY", name: "Aditi Yadav", city: "Delhi" },
  { initials: "SC", name: "Sara Chen", city: "Singapore" },
  { initials: "TB", name: "Tomás Barcelos", city: "Lisbon" },
  { initials: "NM", name: "Nadia Maalouf", city: "Beirut" }
];

export const alsoOnline = onlinePool.slice(0, 3);

export const justInFeed = [
  { who: "Asha", verb: "confirmed", subject: "AI 144 boarding pass", ago: "4s ago" },
  { who: "Kenji", verb: "rebooked", subject: "JL 412 → HND", ago: "12s ago" },
  { who: "Maya", verb: "filed", subject: "Schengen appeal · Paris", ago: "21s ago" },
  { who: "Diego", verb: "couriered", subject: "lost bag · MRS → DXB", ago: "38s ago" },
  { who: "Rohan", verb: "queued", subject: "wedding party · 24 pax", ago: "56s ago" },
  { who: "Sara", verb: "swapped", subject: "SQ 25 hotel · Changi", ago: "1m ago" }
];

export const recentSaves = [
  { route: "AI 144 → BLR", detail: "Rebooked · same class · 4 min ago" },
  { route: "Lost bag · FRA", detail: "PIR filed · couriered · 12 min ago" },
  { route: "Schengen visa", detail: "Embassy slot · Paris · 28 min ago" },
  { route: "NRT runway closed", detail: "Hotel arranged · 41 min ago" },
  { route: "Group of 12 · DXB", detail: "Single thread · 1 invoice · 1 hr ago" }
];

export const services = [
  {
    n: "No. 01",
    title: "Cheap flights & hotels",
    body: "The price you see is the price you pay. 80% of our bookings come with free cancellation and free date change — and we beat what the apps quote.",
    cta: "Get a quote",
    href: "#contact"
  },
  {
    n: "No. 02",
    title: "Group bookings",
    body: "10 to 1,000 passengers. 10 to 500 rooms. Destination weddings, corporate offsites, annual events — every airline and hotel, one thread.",
    cta: "Plan a group trip",
    href: "#contact"
  },
  {
    n: "No. 03",
    title: "International trips",
    body: "A travel expert who's actually been there. Lowest rates worldwide, with visa, transit, and student US / Europe routes handled end-to-end.",
    cta: "Plan a trip",
    href: "#contact"
  },
  {
    n: "No. 04",
    title: "Personalised expert support",
    body: "10+ travel experts. 24/7/365. Call or message — a real expert picks up in under a minute and stays with you for the whole trip.",
    cta: "Call now",
    live: true,
    href: `tel:${supportPhoneE164}`
  }
];

export const pullQuote = {
  body: "The Frankfurt flight cancelled at 2am. One call to TripZ, back in my seat by 6am — they did in twelve minutes what the airline couldn't in three hours.",
  attribution: "Rohan M. · Bengaluru → Berlin · member since 2024"
};

export const situations = [
  {
    n: "01",
    title: "The 2am cancellation",
    body: "Your flight dies. We rebook — same night, same class, no chatbot loops. You sleep; we fight the GDS."
  },
  {
    n: "02",
    title: "The lost bag",
    body: "We file the PIR, chase the airline daily, courier your essentials, and keep receipts for the claim."
  },
  {
    n: "03",
    title: "The visa mess",
    body: "Wrong stamp, missing document, embassy chaos. We call the right desk and we speak the language."
  }
];

export const desk = [
  {
    initials: "AS",
    name: "Asha Sharma",
    role: "Senior expert · Mumbai · EN/HI/MR",
    quote: "Most rebookings beat the airline by an hour. That's the whole job.",
    tenure: "6 yr",
    saves: "412 saves"
  },
  {
    initials: "KP",
    name: "Kenji Park",
    role: "Recovery expert · Tokyo · EN/JP",
    quote: "When Narita closes, I already know which Haneda hotel still has a runway shuttle.",
    tenure: "4 yr",
    saves: "298 saves"
  },
  {
    initials: "ML",
    name: "Maya Leclerc",
    role: "Senior expert · Paris · EN/FR/ES",
    quote: "Schengen visa drama, on hold with the embassy — I read French faster than the bot.",
    tenure: "8 yr",
    saves: "521 saves"
  },
  {
    initials: "DO",
    name: "Diego Okafor",
    role: "Corporate expert · Lagos · EN/FR/YO",
    quote: "Twelve passengers, three layovers — one thread. Finance gets one invoice.",
    tenure: "5 yr",
    saves: "367 saves"
  }
];

export const metrics = [
  { value: "2,847", label: "trips saved last month" },
  { value: "80%", label: "bookings with free cancel + date change" },
  { value: "10", label: "travel experts on shift, 24/7" },
  { value: "₹1.2 Cr", label: "refunded for members" }
];

export const steps = [
  {
    n: "01",
    title: ["You ", { it: "call" }, " us."],
    body: "One number. No menu tree, no \"press 1 for...\". Goes straight to a real person."
  },
  {
    n: "02",
    title: ["A real person ", { it: "picks up" }, "."],
    body: "Average 38 seconds. They already see your booking when the line connects."
  },
  {
    n: "03",
    title: ["They ", { it: "handle it" }, "."],
    body: "Rebooking, refunds, escalation, hotel — start to finish, on the call."
  }
];

export const footerLinks = {
  Product: [
    { label: "How it works", href: "#how" },
    { label: "Services", href: "#services" },
    { label: "The desk", href: "#desk" },
    { label: "Stories", href: "#stories" }
  ],
  Company: [
    { label: "Get in touch", href: "#contact" },
    { label: "Careers", href: "mailto:careers@tripz.co.in" },
    { label: "Press", href: "mailto:press@tripz.co.in" }
  ],
  Legal: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Refunds", href: "#" }
  ]
};
