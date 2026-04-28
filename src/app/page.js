import {
  ctaActions,
  desk,
  footerLinks,
  heroAgent,
  heroStats,
  liveStatus,
  metrics,
  navLinks,
  pullQuote,
  services,
  situations,
  steps,
  supportPhoneDisplay,
  supportPhoneE164
} from "@/lib/site-data.mjs";

const Icons = {
  phone: (props) => (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L9.09 10.09a16 16 0 0 0 6 6l1.45-1.45a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  chat: (props) => (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  whatsapp: (props) => (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.07 4.93A10 10 0 0 0 4.42 18.5L3 22l3.6-1.37A10 10 0 1 0 19.07 4.93Zm-7 16.32a8.3 8.3 0 0 1-4.21-1.16l-.3-.18-2.13.81.81-2.07-.2-.31a8.3 8.3 0 1 1 6.03 2.91Zm4.6-6.18c-.25-.13-1.49-.74-1.72-.82-.23-.08-.4-.13-.57.13-.17.25-.66.82-.81.99-.15.16-.3.18-.55.06a6.78 6.78 0 0 1-3.4-2.97c-.26-.44.26-.4.74-1.34.08-.16.04-.3-.02-.43l-.78-1.88c-.21-.5-.42-.43-.57-.44h-.49a.94.94 0 0 0-.69.32 2.86 2.86 0 0 0-.9 2.13c0 1.26.92 2.47 1.05 2.64.13.17 1.81 2.77 4.39 3.88.61.27 1.09.43 1.46.55.61.2 1.17.17 1.61.1.49-.07 1.49-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  ),
  arrow: (props) => (
    <svg
      width={props.size ?? 13}
      height={props.size ?? 13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
};

function Wordmark({ onDark = false, size = 22 }) {
  return (
    <span
      className={`tz-wordmark${onDark ? " on-dark" : ""}`}
      style={{ fontSize: size }}
    >
      Trip
      <span className="z" style={{ fontSize: size * 1.18 }}>
        Z
      </span>
    </span>
  );
}

function LivePill({ onDark = false }) {
  return (
    <span
      className={`live-pill${onDark ? " on-dark" : ""}`}
      aria-label={`${liveStatus.humansOnline} humans online, average pickup ${liveStatus.avgPickupSeconds} seconds`}
    >
      <span className="dot" aria-hidden="true" />
      {liveStatus.humansOnline} humans · {liveStatus.avgPickupSeconds}s pickup
    </span>
  );
}

function CtaRow({ tone = "light", compact = false }) {
  const onDark = tone === "dark";
  return (
    <>
      <a
        className={`cta primary${compact ? " compact" : ""}`}
        href={ctaActions.call.href}
      >
        <Icons.phone size={compact ? 14 : 16} />
        {ctaActions.call.label}
        {ctaActions.call.meta && (
          <span className="meta">{ctaActions.call.meta}</span>
        )}
      </a>
      <a
        className={`cta secondary${onDark ? " on-dark" : ""}${compact ? " compact" : ""}`}
        href={ctaActions.chat.href}
      >
        <Icons.chat size={compact ? 14 : 16} />
        {ctaActions.chat.label}
      </a>
      <a
        className={`cta tertiary${onDark ? " on-dark" : ""}`}
        href={ctaActions.whatsapp.href}
        target="_blank"
        rel="noreferrer"
      >
        <Icons.whatsapp size={14} />
        {ctaActions.whatsapp.label}
      </a>
    </>
  );
}

function Nav() {
  return (
    <header className="nav" aria-label="Primary">
      <a href="#top" aria-label="TripZ home">
        <Wordmark size={22} />
      </a>
      <nav className="nav-links" aria-label="Sections">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="nav-right">
        <LivePill />
        <a className="cta primary compact" href={ctaActions.call.href}>
          <Icons.phone size={14} />
          Call now
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-headline">
      <div>
        <span className="eyebrow">Volume 01 · Human travel help</span>
        <h1 id="hero-headline" className="hero-headline">
          Travel help,
          <br />
          <em>without the</em>
          <br />
          <em>hold music.</em>
        </h1>
        <p className="hero-lede">
          TripZ is a <em>service</em>, not a chatbot. A real person picks up in
          under a minute — any hour, any leg of the trip — and handles the
          rebooking, refunds, and arguments so you don&rsquo;t have to.
        </p>
        <div className="hero-ctas">
          <CtaRow />
        </div>
        <div className="hero-stats">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <b>{stat.value}</b>· {stat.label}
            </div>
          ))}
        </div>
      </div>
      <div className="hero-side">
        <article className="agent-card">
          <div className="meta">
            <span className="dot" aria-hidden="true" /> {heroAgent.meta}
          </div>
          <p className="quote">&ldquo;{heroAgent.quote}&rdquo;</p>
          <div className="who">
            <span className="avatar">{heroAgent.initials}</span>
            <span>
              <b>{heroAgent.name}</b> — {heroAgent.role}
            </span>
          </div>
          <div className="footnote">
            <span>Fig. 01 · The desk</span>
            <span>Picked up · 03:47 IST</span>
          </div>
        </article>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="services" id="services" aria-label="Services">
      {services.map((service) => (
        <article
          key={service.n}
          className={`service${service.live ? " live" : ""}`}
        >
          <div className="num">{service.n}</div>
          <h3>{service.title}</h3>
          <p>{service.body}</p>
          <span className="arrow">
            {service.cta} <Icons.arrow size={13} />
          </span>
        </article>
      ))}
    </section>
  );
}

function PullBand() {
  return (
    <section className="pullband" aria-label="Customer story">
      <div className="pullband-inner">
        <div className="mark" aria-hidden="true">
          &ldquo;
        </div>
        <div>
          <p className="body">{pullQuote.body}</p>
          <p className="attribution">— {pullQuote.attribution}</p>
        </div>
      </div>
    </section>
  );
}

function Situations() {
  return (
    <section className="section" id="how" aria-labelledby="situations-head">
      <header className="section-head">
        <span className="marker">§ 01 · Three situations</span>
        <h2 id="situations-head" className="display">
          When the trip goes <em>sideways.</em>
        </h2>
      </header>
      <div className="situations">
        {situations.map((s) => (
          <article key={s.n} className="situation">
            <span className="num">— {s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Steps() {
  function renderTitle(parts) {
    return parts.map((part, i) =>
      typeof part === "string" ? (
        <span key={i}>{part}</span>
      ) : (
        <em key={i}>{part.it}</em>
      )
    );
  }
  return (
    <section className="steps" aria-label="How it works">
      {steps.map((step) => (
        <article key={step.n} className="step">
          <span className="num">Step {step.n}</span>
          <h3>{renderTitle(step.title)}</h3>
          <p>{step.body}</p>
        </article>
      ))}
    </section>
  );
}

function Desk() {
  return (
    <section
      className="section on-dark"
      id="stories"
      aria-labelledby="desk-head"
    >
      <header className="section-head">
        <div>
          <span className="marker on-dark">§ 02 · The desk</span>
          <h2 id="desk-head" className="display on-dark" style={{ marginTop: 12 }}>
            One of <em>fourteen</em> people is already online.
          </h2>
        </div>
        <LivePill onDark />
      </header>
      <div className="agent-grid">
        {desk.map((agent) => (
          <article key={agent.initials} className="agent-tile">
            <div className="row">
              <span className="avatar">{agent.initials}</span>
              <div>
                <div className="name">{agent.name}</div>
                <div className="role">{agent.role}</div>
              </div>
            </div>
            <blockquote>&ldquo;{agent.quote}&rdquo;</blockquote>
            <div className="footer-row">
              <span>
                <b>{agent.tenure}</b> · tenure
              </span>
              <span>
                <b>{agent.saves}</b>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className="metrics" aria-label="Metrics">
      {metrics.map((m) => (
        <div key={m.label} className="metric">
          <div className="value">{m.value}</div>
          <div className="label">{m.label}</div>
        </div>
      ))}
    </section>
  );
}

function Closing() {
  return (
    <section className="closing" id="contact" aria-labelledby="closing-head">
      <span className="marker">End of issue</span>
      <h2 id="closing-head">
        Next trip,
        <br />
        <em>call a human.</em>
      </h2>
      <div className="ctas">
        <CtaRow />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="tz-footer" id="business">
      <div className="footer-grid">
        <div className="footer-brand">
          <Wordmark onDark size={28} />
          <p className="tagline">
            TripZ — picked up <em style={{ color: "#7ec79d" }}>by humans.</em>
          </p>
          <div className="footer-call" style={{ marginTop: 28 }}>
            <span className="label">Call any hour</span>
            <a className="number" href={`tel:${supportPhoneE164}`}>
              {supportPhoneDisplay}
            </a>
          </div>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title} className="footer-col">
            <h4>{title}</h4>
            <ul>
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} TripZ · Bengaluru / Mumbai / Bangkok</span>
        <LivePill onDark />
      </div>
    </footer>
  );
}

function StickyMobile() {
  return (
    <div className="sticky-mobile" aria-label="Quick contact">
      <a className="primary" href={ctaActions.call.href}>
        <Icons.phone size={15} />
        Call a human
      </a>
      <a
        className="secondary"
        href={ctaActions.whatsapp.href}
        target="_blank"
        rel="noreferrer"
      >
        <Icons.whatsapp size={15} />
        WhatsApp
      </a>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Services />
        <PullBand />
        <Situations />
        <Steps />
        <Desk />
        <Metrics />
        <Closing />
      </main>
      <Footer />
      <StickyMobile />
    </>
  );
}
