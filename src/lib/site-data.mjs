export const supportPhoneDisplay = "+91 99566 51212";
export const supportPhoneE164 = "+919956651212";
export const supportEmail = "hello@tripz.co.in";

const whatsappMessage =
  "Hi TripZ — I need a human on this. Can someone from the desk pick up?";

export const liveStatus = {
  expertsOnShift: 10,
  avgPickupSeconds: 38
};

export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Why TripZ", href: "#why" },
  { label: "How it works", href: "#how" },
  { label: "The desk", href: "#desk" }
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
    initials: "RP",
    name: "Ravi Patel",
    role: "Recovery expert · Bengaluru · 4 yr",
    quote: "Connected. I see your Narita itinerary — one moment."
  },
  {
    initials: "MK",
    name: "Meera Kapoor",
    role: "Senior travel expert · Delhi · 8 yr",
    quote: "Got your file. Let's clear the embassy first."
  },
  {
    initials: "DM",
    name: "Dev Mehta",
    role: "Corporate travel expert · Pune · 5 yr",
    quote: "On the line. Twelve passengers — let me line up the legs."
  }
];

export const onlinePool = [
  { initials: "PI", name: "Priya Iyer", city: "Chennai" },
  { initials: "NS", name: "Neha Singh", city: "Hyderabad" },
  { initials: "CR", name: "Charan Rao", city: "Visakhapatnam" },
  { initials: "AK", name: "Arjun Khanna", city: "Jaipur" },
  { initials: "RJ", name: "Rohan Joshi", city: "Bengaluru" },
  { initials: "AY", name: "Aditi Yadav", city: "Delhi" },
  { initials: "KV", name: "Karan Verma", city: "Kolkata" },
  { initials: "SR", name: "Sanjana Rao", city: "Goa" },
  { initials: "VS", name: "Vikram Shah", city: "Ahmedabad" }
];

export const alsoOnline = onlinePool.slice(0, 3);

export const justInFeed = [
  { who: "Asha", verb: "confirmed", subject: "AI 144 boarding pass", ago: "4s ago" },
  { who: "Ravi", verb: "rebooked", subject: "JL 412 → HND", ago: "12s ago" },
  { who: "Meera", verb: "filed", subject: "Schengen appeal · Paris", ago: "21s ago" },
  { who: "Dev", verb: "couriered", subject: "lost bag · MRS → DXB", ago: "38s ago" },
  { who: "Rohan", verb: "queued", subject: "wedding party · 24 pax", ago: "56s ago" },
  { who: "Charan", verb: "swapped", subject: "SQ 25 hotel · Changi", ago: "1m ago" }
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
    title: "Best deals on flights & hotels",
    body: "The price you see is the price you pay. No hidden charges, no last-minute surprises. We often beat what the apps quote — and most bookings come with free cancellation and date change.",
    cta: "Get a quote",
    href: "#contact"
  },
  {
    n: "No. 02",
    title: "Exclusive group bookings",
    body: "10 to 1,000+ passengers. 10 to 500 rooms. One expert team — destination weddings, corporate offsites, MICE travel and special celebrations, all with global airline and hotel access.",
    cta: "Plan a group trip",
    href: "#contact"
  },
  {
    n: "No. 03",
    title: "International trips, expertly planned",
    body: "Lowest fares worldwide, smarter routes, special fares for students flying to the US or Europe — with visa and transit guidance handled end-to-end.",
    cta: "Plan a trip",
    href: "#contact"
  },
  {
    n: "No. 04",
    title: "Personal travel experts on call, 24/7",
    body: "Holidays, international travel, destination weddings or corporate events — call or message anytime. 24/7, 365 days. A real expert picks up and stays with you the whole way.",
    cta: "Call now",
    live: true,
    href: `tel:${supportPhoneE164}`
  }
];

export const aboutBand = {
  marker: "Foreword",
  headline: ["Travel planning should feel ", { it: "easy" }, ", not stressful."],
  paragraphs: [
    "We're human-first, not bot-first — with real travel experts available 24/7 to help you book smarter and travel better.",
    "We offer the best deals on flights and hotels, expert itinerary planning, international travel support, and student fares for those studying abroad.",
    "From holidays and business travel to destination weddings, corporate offsites, group bookings and special occasions — we handle it all with personalised support and seamless planning.",
    "No AI bots. No generic responses. Just real experts, real guidance, and better travel deals."
  ]
};

export const whyTripz = [
  {
    n: "01",
    title: "Real people, real support — 24/7.",
    body: "No AI bots. Just travel experts you can actually speak to whenever you need help."
  },
  {
    n: "02",
    title: "Better prices with smarter planning.",
    body: "Great deals on flights and hotels, along with personalised guidance to help you travel better."
  },
  {
    n: "03",
    title: "We take care of the unexpected.",
    body: "Refunds, reschedules, booking issues or special requests — we handle it all, so you don't have to stress."
  },
  {
    n: "04",
    title: "More than just bookings.",
    body: "From international and student travel to destination weddings, group trips and corporate travel — we help plan it all."
  }
];

export const pullQuote = {
  body: "The Frankfurt flight cancelled at 2am. One call to TripZ, back in my seat by 6am — they did in twelve minutes what the airline couldn't in three hours.",
  attribution: "Rohan M. · Bengaluru → Berlin · member since 2024"
};

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
    initials: "RP",
    name: "Ravi Patel",
    role: "Recovery expert · Bengaluru · EN/HI/KN",
    quote: "When Narita closes, I already know which Haneda hotel still has a runway shuttle.",
    tenure: "4 yr",
    saves: "298 saves"
  },
  {
    initials: "MK",
    name: "Meera Kapoor",
    role: "Senior expert · Delhi · EN/HI/PA",
    quote: "Schengen visa drama, on hold with the embassy — I read French faster than the bot.",
    tenure: "8 yr",
    saves: "521 saves"
  },
  {
    initials: "DM",
    name: "Dev Mehta",
    role: "Corporate expert · Pune · EN/HI/MR",
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
    { label: "About TripZ", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Why TripZ", href: "#why" },
    { label: "How it works", href: "#how" },
    { label: "The desk", href: "#desk" }
  ],
  Company: [
    { label: "Talk to a human", href: "#contact" },
    { label: `Email · ${supportEmail}`, href: `mailto:${supportEmail}` },
    { label: "Careers", href: "mailto:careers@tripz.co.in" },
    { label: "Press", href: "mailto:press@tripz.co.in" }
  ],
  Legal: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Refunds", href: "#" }
  ]
};
