import {
  aboutBand,
  ctaActions,
  desk,
  footerLinks,
  liveStatus,
  metrics,
  navLinks,
  pillars,
  pullQuote,
  services,
  steps,
  supportPhoneDisplay,
  supportPhoneE164,
  whyTripz
} from "@/lib/site-data.mjs";
import HeroLeft from "./components/HeroLeft";
import OperationsPanel from "./components/OperationsPanel";
import { Reveal, StaggerGroup, StaggerItem } from "./components/Reveal";
import { Icons } from "./components/icons";

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
      aria-label={`${liveStatus.expertsOnShift} travel experts online, average pickup ${liveStatus.avgPickupSeconds} seconds`}
    >
      <span className="dot" aria-hidden="true" />
      {liveStatus.expertsOnShift} experts · {liveStatus.avgPickupSeconds}s pickup
    </span>
  );
}

function ClosingCtas() {
  return (
    <>
      <a className="cta primary" href={ctaActions.call.href}>
        <Icons.phone size={16} />
        {ctaActions.call.label}
        <span className="meta">{ctaActions.call.meta}</span>
      </a>
      <a className="cta secondary" href={ctaActions.chat.href}>
        <Icons.chat size={16} />
        {ctaActions.chat.label}
      </a>
      <a
        className="cta tertiary"
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
      <HeroLeft />
      <div className="hero-side">
        <OperationsPanel />
      </div>
    </section>
  );
}

function Services() {
  return (
    <StaggerGroup
      as="section"
      className="services"
      id="services"
    >
      {services.map((service) => (
        <StaggerItem key={service.n}>
          <a
            href={service.href}
            className={`service${service.live ? " live" : ""}`}
          >
            <div className="num">{service.n}</div>
            <h3>{service.title}</h3>
            <p>{service.body}</p>
            <span className="arrow">
              {service.cta} <Icons.arrow size={13} />
            </span>
          </a>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

function PullBand() {
  return (
    <Reveal as="section" className="pullband" id="stories">
      <div className="pullband-inner">
        <div className="mark" aria-hidden="true">
          &ldquo;
        </div>
        <div>
          <p className="body">{pullQuote.body}</p>
          <p className="attribution">— {pullQuote.attribution}</p>
        </div>
      </div>
    </Reveal>
  );
}

function renderTitleParts(parts) {
  return parts.map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <em key={i}>{part.it}</em>
    )
  );
}

function About() {
  return (
    <section className="section about-band" id="about" aria-labelledby="about-head">
      <Reveal as="header" className="section-head about-head">
        <span className="marker">{aboutBand.marker}</span>
        <h2 id="about-head" className="display">
          {renderTitleParts(aboutBand.headline)}
        </h2>
      </Reveal>
      <Reveal as="div" className="about-prose">
        {aboutBand.paragraphs.map((p, i) => (
          <p key={i} className={i === aboutBand.paragraphs.length - 1 ? "kicker" : ""}>
            {p}
          </p>
        ))}
      </Reveal>
    </section>
  );
}

function Promise() {
  return (
    <section className="section why-band" id="why" aria-labelledby="why-head">
      <Reveal as="header" className="section-head">
        <span className="marker">§ 01 · Promise</span>
        <h2 id="why-head" className="display">
          Four reasons people <em>stay.</em>
        </h2>
      </Reveal>
      <StaggerGroup as="ul" className="promise-list">
        {whyTripz.map((reason) => (
          <StaggerItem as="li" key={reason.n}>
            <span className="n">{reason.n}</span>
            <span className="promise">{renderTitleParts(reason.title)}</span>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

function Pillar({ pillar }) {
  return (
    <section
      className={`pillar-band${pillar.tinted ? " tinted" : ""}`}
      id={pillar.id}
      aria-labelledby={`${pillar.id}-head`}
    >
      <Reveal as="header" className="pillar-head">
        <span className="marker">{pillar.marker}</span>
        <h2 id={`${pillar.id}-head`} className="display">
          {renderTitleParts(pillar.headline)}
        </h2>
        <p className="lede">{pillar.lede}</p>
        <div className="callout">
          <span className="callout-value">{pillar.callout.value}</span>
          <span className="callout-label">{pillar.callout.label}</span>
        </div>
      </Reveal>
      <StaggerGroup className="pillar-points">
        {pillar.points.map((point) => (
          <StaggerItem key={point.n}>
            <article className="pillar-point">
              <span className="n">— {point.n}</span>
              <h4>{point.title}</h4>
              <p>{point.body}</p>
            </article>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

function PillarStack() {
  return (
    <>
      {pillars.map((pillar) => (
        <Pillar key={pillar.id} pillar={pillar} />
      ))}
    </>
  );
}

function Steps() {
  return (
    <section className="steps-section" id="how" aria-labelledby="steps-head">
      <div className="steps-head">
        <Reveal as="header" className="section-head">
          <span className="marker">§ 02 · How it works</span>
          <h2 id="steps-head" className="display">
            Three steps. <em>That is the product.</em>
          </h2>
        </Reveal>
      </div>
      <StaggerGroup className="steps">
        {steps.map((step) => (
          <StaggerItem key={step.n}>
            <article className="step">
              <span className="num">Step {step.n}</span>
              <h3>{renderTitleParts(step.title)}</h3>
              <p>{step.body}</p>
            </article>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

function Desk() {
  return (
    <section
      className="section on-dark"
      id="desk"
      aria-labelledby="desk-head"
    >
      <Reveal as="header" className="section-head">
        <div>
          <span className="marker on-dark">§ 03 · The desk</span>
          <h2
            id="desk-head"
            className="display on-dark"
            style={{ marginTop: 14 }}
          >
            One of <em>ten travel experts</em> is already online.
          </h2>
          <p className="section-lede">
            Travel agents book what you tell them. Travel experts <em>advise</em>
            {" "}— they&rsquo;ve been there, they read the language, they know
            which embassy desk to call. Tap a name and you&rsquo;re on a thread
            with <em>them</em>, not a queue.
          </p>
        </div>
        <LivePill onDark />
      </Reveal>
      <StaggerGroup className="agent-grid">
        {desk.map((agent) => (
          <StaggerItem key={agent.initials}>
            <article className="agent-tile">
              <span className="online-dot" aria-label="Online" />
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
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

function Metrics() {
  return (
    <StaggerGroup as="section" className="metrics">
      {metrics.map((m) => (
        <StaggerItem key={m.label}>
          <div className="metric">
            <div className="value">{m.value}</div>
            <div className="label">{m.label}</div>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

function Closing() {
  return (
    <Reveal as="section" className="closing" id="contact">
      <span className="marker">End of issue</span>
      <h2 id="closing-head">
        Next trip,
        <br />
        <em>call a human.</em>
      </h2>
      <div className="ctas">
        <ClosingCtas />
      </div>
    </Reveal>
  );
}

function Footer() {
  return (
    <footer className="tz-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Wordmark onDark size={28} />
          <p className="tagline">
            TripZ — picked up{" "}
            <em style={{ color: "var(--tz-accent-on-dark)" }}>by humans.</em>
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
        <span>
          © {new Date().getFullYear()} TripZ · Bengaluru / Mumbai / Bangkok
        </span>
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
        <About />
        <Services />
        <Promise />
        <PillarStack />
        <PullBand />
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
