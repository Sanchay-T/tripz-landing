export const supportPhoneDisplay = "+91 995 665 1212";
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
    body: "The price you see is the price you pay.",
    cta: "Read more",
    href: "#pillar-01"
  },
  {
    n: "No. 02",
    title: "Exclusive group bookings",
    body: "10 to 1,000+ passengers. One expert team.",
    cta: "Read more",
    href: "#pillar-02"
  },
  {
    n: "No. 03",
    title: "International trips, expertly planned",
    body: "Lowest fares worldwide. Visa and transit handled.",
    cta: "Read more",
    href: "#pillar-03"
  },
  {
    n: "No. 04",
    title: "Personal travel experts on call",
    body: "Real experts on call, 365 days. We pick up.",
    cta: "Call now",
    live: true,
    href: `tel:${supportPhoneE164}`
  }
];

export const pillars = [
  {
    id: "pillar-01",
    marker: "Pillar 01",
    headline: ["Best deals on ", { it: "flights & hotels." }],
    lede:
      "The price you see is the price you pay. No bait-and-switch, no last-minute surprises — just transparent fares with real human support behind every booking.",
    callout: { value: "80%", label: "Free cancel + date change" },
    points: [
      {
        n: "01",
        title: "The price you see is the price you pay.",
        body: "No hidden charges, no last-minute surprises — just transparent fares you can always trust."
      },
      {
        n: "02",
        title: "Better prices than online platforms.",
        body: "Seen a fare on an app? Check with us — we can often get you a lower rate."
      },
      {
        n: "03",
        title: "Flexible bookings, peace of mind.",
        body: "Most flight and hotel bookings come with free cancellation and date change options."
      },
      {
        n: "04",
        title: "More savings, less stress.",
        body: "Tripz often offers better fares than any travel app — with real human support included."
      }
    ]
  },
  {
    id: "pillar-02",
    marker: "Pillar 02",
    headline: ["Group bookings, ", { it: "10 to 1,000+." }],
    lede:
      "From small group trips to large-scale events, Tripz handles bookings of every size seamlessly. One expert team, every airline and hotel, end-to-end.",
    callout: { value: "10 → 1,000+", label: "Passengers · 10 to 500 rooms" },
    tinted: true,
    points: [
      {
        n: "01",
        title: "One expert team for every size.",
        body: "10 to 1,000+ passengers. 10 to 500 rooms. From small trips to large-scale events, handled seamlessly."
      },
      {
        n: "02",
        title: "Exclusive group fares, global access.",
        body: "Better rates with global airline and hotel access — smoother coordination, end-to-end support."
      },
      {
        n: "03",
        title: "Perfect for every occasion.",
        body: "Destination weddings, corporate offsites, annual meets, MICE travel and special celebrations."
      },
      {
        n: "04",
        title: "Flights, stays and logistics — managed.",
        body: "From booking and check-in to boarding assistance and special requests, our experts support you every step."
      }
    ]
  },
  {
    id: "pillar-03",
    marker: "Pillar 03",
    headline: ["International trips, ", { it: "expertly planned." }],
    lede:
      "From flights and routes to complete trip planning, Tripz helps you travel smarter, more comfortably and at the best possible fares — with a human who's actually been there.",
    callout: { value: "End-to-end", label: "Visa, transit · students US/EU" },
    points: [
      {
        n: "01",
        title: "Trips abroad, made easy.",
        body: "From flights and routes to complete itineraries, planned by an expert who's actually been there."
      },
      {
        n: "02",
        title: "Better routes, better prices.",
        body: "Lowest fares, smarter connections and personalised itineraries suited to your budget."
      },
      {
        n: "03",
        title: "Special fares for students.",
        body: "Heading to the US, Europe or beyond for studies? We help students book affordable flights with the best options available."
      },
      {
        n: "04",
        title: "Visa and transit, simplified.",
        body: "From transit requirements to travel documentation, our experts guide you through every step."
      }
    ]
  },
  {
    id: "pillar-04",
    marker: "Pillar 04",
    headline: ["Personal travel experts ", { it: "on call." }],
    lede:
      "Whether it's a holiday, international travel, destination weddings or corporate events — we're here to help you plan it right and stay with you for the whole trip.",
    callout: { value: "24/7 · 365", label: "Call or message, anytime" },
    points: [
      {
        n: "01",
        title: "Your personal travel expert.",
        body: "Holidays, international travel, destination weddings or corporate events — always available, always real."
      },
      {
        n: "02",
        title: "Best deals with expert guidance.",
        body: "From the best deals on flights and hotels to itineraries, routes and special requests, we help you decide."
      },
      {
        n: "03",
        title: "Support on call or message.",
        body: "Need help with changes, refunds, booking issues or last-minute assistance? Our team is available 24/7, 365 days."
      },
      {
        n: "04",
        title: "Travel assistant, end-to-end.",
        body: "From planning to check-in to boarding, Tripz is with you every step of the way."
      }
    ]
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
    n: "No. 01",
    title: ["Real people, real ", { it: "support" }, " — 24/7."]
  },
  {
    n: "No. 02",
    title: ["Better prices, ", { it: "smarter planning." }]
  },
  {
    n: "No. 03",
    title: ["We take care of the ", { it: "unexpected." }]
  },
  {
    n: "No. 04",
    title: ["More than just ", { it: "bookings." }]
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
