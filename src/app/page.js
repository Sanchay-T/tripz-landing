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
  outcomeFeature,
  recoveryProof,
  services,
  steps,
  stepsVisual,
  supportPhoneDisplay,
  supportPhoneE164,
  promiseVisuals,
  visualAssets,
  visualInterlude,
  whyTripz
} from "@/lib/site-data.mjs";
import { cn } from "@/lib/cn";
import HeroLeft from "./components/HeroLeft";
import OperationsPanel from "./components/OperationsPanel";
import { Reveal, StaggerGroup, StaggerItem } from "./components/Reveal";
import { Icons } from "./components/icons";
import {
  ButtonLink,
  LivePill,
  ResponsiveImage,
  SectionLabel,
  Wordmark
} from "./components/ui";

const sectionShell = "mx-auto w-full max-w-7xl px-[clamp(1.5rem,4vw,4rem)] py-[clamp(3rem,7vw,5rem)]";
const splitGrid = "grid grid-cols-1 gap-[clamp(1.5rem,4vw,3rem)] min-[1152px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]";
const splitGridReverse = "grid grid-cols-1 gap-[clamp(1.5rem,4vw,3rem)] min-[1152px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]";
const cardGrid = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-px";

function renderTitleParts(parts) {
  return parts.map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <em key={i}>{part.it}</em>
    )
  );
}

function DisplayTitle({ children, id, onDark = false, className }) {
  return (
    <h2
      id={id}
      className={cn(
        "text-balance font-sans text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-[0.96] tracking-[-0.045em]",
        onDark ? "text-white" : "text-ink",
        className
      )}
    >
      {children}
    </h2>
  );
}

function ClosingCtas() {
  return (
    <>
      <ButtonLink href={ctaActions.call.href}>
        <Icons.phone size={16} />
        {ctaActions.call.label}
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
          {ctaActions.call.meta}
        </span>
      </ButtonLink>
      <ButtonLink
        href={ctaActions.whatsapp.href}
        tone="light"
        target="_blank"
        rel="noreferrer"
      >
        <Icons.whatsapp size={14} />
        {ctaActions.whatsapp.label}
      </ButtonLink>
    </>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-[clamp(1.5rem,4vw,4rem)]">
        <a href="#top" aria-label="TripZ home">
          <Wordmark />
        </a>
        <nav className="hidden items-center gap-8 text-sm text-ink/60 md:flex" aria-label="Sections">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <LivePill
              experts={liveStatus.expertsOnShift}
              pickupSeconds={liveStatus.avgPickupSeconds}
            />
          </div>
          <ButtonLink
            href={ctaActions.call.href}
            size="sm"
            className="hidden shrink-0 sm:inline-flex"
            aria-label="Call now"
          >
            <Icons.phone size={14} />
            <span className="hidden sm:inline">Call now</span>
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="border-b border-ink/10 bg-white"
      id="top"
      aria-labelledby="hero-headline"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-[clamp(1.5rem,4vw,3rem)] px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2rem,5vw,3rem)] min-[1152px]:grid-cols-[minmax(0,0.86fr)_minmax(0,1fr)]">
        <HeroLeft />
        <div className="grid min-w-0 gap-4">
          <ResponsiveImage
            image={visualAssets.nightDesk}
            className="aspect-[16/10] w-full sm:aspect-[16/9]"
            objectPosition="center 55%"
            sizes="(max-width: 1024px) 100vw, 48vw"
            priority
            overlay
          />
          <OperationsPanel />
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className={sectionShell} id="about" aria-labelledby="about-head">
      <div className={cn(splitGrid, "lg:items-start")}>
        <Reveal as="header" className="min-w-0">
          <SectionLabel>{aboutBand.marker}</SectionLabel>
          <DisplayTitle id="about-head" className="mt-5 max-w-3xl">
            {renderTitleParts(aboutBand.headline)}
          </DisplayTitle>
        </Reveal>
        <Reveal as="div" className="grid gap-5 text-[clamp(1rem,1vw+0.75rem,1.125rem)] leading-[1.75] text-ink/65">
          {aboutBand.paragraphs.map((p, i) => (
            <p key={p} className={cn(i === aboutBand.paragraphs.length - 1 && "font-medium text-ink")}>
              {p}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function VisualInterlude() {
  return (
    <Reveal
      as="section"
      className="relative isolate min-h-[clamp(24rem,48vw,32.5rem)] overflow-hidden"
      aria-labelledby="visual-interlude-head"
    >
      <ResponsiveImage
        image={visualInterlude.image}
        className="absolute inset-0 h-full w-full border-0"
        caption={false}
        sizes="100vw"
        priority
        overlay
      />
      <div className="relative z-10 mx-auto flex min-h-[clamp(24rem,48vw,32.5rem)] w-full max-w-7xl items-end px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2.5rem,6vw,4rem)]">
        <div className="max-w-2xl text-white">
          <SectionLabel onDark>{visualInterlude.marker}</SectionLabel>
          <h2
            id="visual-interlude-head"
            className="mt-5 text-balance font-sans text-[clamp(2.25rem,5.6vw,3.75rem)] font-bold leading-[0.95] tracking-[-0.045em]"
          >
            {visualInterlude.headline}
          </h2>
          <p className="mt-5 max-w-xl text-[clamp(1rem,1vw+0.75rem,1.125rem)] leading-[1.75] text-white/75">
            {visualInterlude.body}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function Services() {
  return (
    <StaggerGroup
      as="section"
      className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-px border-y border-ink/10 bg-ink/10"
      id="services"
    >
      {services.map((service) => (
        <StaggerItem key={service.n}>
          <a
            href={service.href}
            className={cn(
              "group flex min-h-56 flex-col bg-white p-6 transition hover:bg-accent-soft lg:p-8",
              service.live && "bg-accent text-white hover:bg-accent"
            )}
          >
            <div className={cn("font-mono text-xs uppercase tracking-[0.24em]", service.live ? "text-white/65" : "text-ink/40")}>
              {service.n}
            </div>
            <h3 className="mt-8 text-balance text-2xl font-bold leading-tight tracking-[-0.03em]">
              {service.title}
            </h3>
            <p className={cn("mt-3 leading-7", service.live ? "text-white/70" : "text-ink/55")}>
              {service.body}
            </p>
            <span className="mt-auto inline-flex items-center gap-2 pt-10 text-sm font-semibold">
              {service.cta} <Icons.arrow size={13} />
            </span>
          </a>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

function Promise() {
  return (
    <section className={sectionShell} id="why" aria-labelledby="why-head">
      <div className={cn(splitGridReverse, "lg:items-start")}>
        <div className="min-w-0">
          <Reveal as="header">
            <SectionLabel>§ 01 · Promise</SectionLabel>
            <DisplayTitle id="why-head" className="mt-5 max-w-3xl">
              Four reasons people <em>stay.</em>
            </DisplayTitle>
          </Reveal>
          <StaggerGroup as="ul" className="mt-10 grid gap-0 divide-y divide-ink/10">
            {whyTripz.map((reason) => (
              <StaggerItem as="li" key={reason.n} className="grid gap-4 py-6 sm:grid-cols-[80px_minmax(0,1fr)]">
                <span className="font-mono text-xs uppercase tracking-[0.24em] text-ink/40">
                  {reason.n}
                </span>
                <span className="text-balance text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
                  {renderTitleParts(reason.title)}
                </span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
        <Reveal as="div" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4">
          {promiseVisuals.map((image) => (
            <ResponsiveImage
              key={image.src}
              image={image}
              className="aspect-[4/3] w-full"
              sizes="(max-width: 1024px) 50vw, 32vw"
              overlay
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Pillar({ pillar }) {
  return (
    <section
      className={cn("scroll-mt-20 border-t border-ink/10", pillar.tinted ? "bg-field" : "bg-white")}
      id={pillar.id}
      aria-labelledby={`${pillar.id}-head`}
    >
      <div className={cn(sectionShell, splitGrid)}>
        <Reveal as="header" className="min-w-0">
          <SectionLabel>{pillar.marker}</SectionLabel>
          <DisplayTitle id={`${pillar.id}-head`} className="mt-5 max-w-3xl">
            {renderTitleParts(pillar.headline)}
          </DisplayTitle>
          <p className="mt-6 max-w-2xl text-[clamp(1rem,1vw+0.75rem,1.125rem)] leading-[1.75] text-ink/60">
            {pillar.lede}
          </p>
          <div className="mt-10 border-t border-ink/10 pt-8">
            <span className="block text-5xl font-bold tracking-[-0.04em] text-accent sm:text-6xl">
              {pillar.callout.value}
            </span>
            <span className="mt-2 block font-mono text-xs uppercase tracking-[0.28em] text-ink/45">
              {pillar.callout.label}
            </span>
          </div>
        </Reveal>
        <StaggerGroup className={cn(cardGrid, "bg-ink/10")}>
          {pillar.points.map((point) => (
            <StaggerItem key={point.n} className="bg-white p-6 sm:p-8">
              <article>
                <span className="font-serif text-3xl italic text-accent">— {point.n}</span>
                <h4 className="mt-5 text-balance text-2xl font-bold leading-tight tracking-[-0.03em]">
                  {point.title}
                </h4>
                <p className="mt-4 leading-7 text-ink/60">{point.body}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function PillarStack() {
  return pillars.map((pillar) => <Pillar key={pillar.id} pillar={pillar} />);
}

function PullBand() {
  return (
    <Reveal as="section" className="border-y border-ink/10 bg-field">
      <div className={cn(sectionShell, "grid gap-8 lg:grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)]")}>
        <div className="font-serif text-8xl leading-none text-accent" aria-hidden="true">
          &ldquo;
        </div>
        <div>
          <p className="max-w-5xl text-balance font-serif text-[clamp(2rem,5vw,3rem)] italic leading-tight text-ink">
            {pullQuote.body}
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.24em] text-ink/45">
            — {pullQuote.attribution}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function ProofFeature() {
  return (
    <section className={cn(sectionShell, splitGrid, "lg:items-center")} id="proof" aria-labelledby="proof-head">
      <ResponsiveImage
        image={recoveryProof.image}
        className="aspect-[4/3] w-full lg:aspect-[5/6]"
        sizes="(max-width: 1024px) 100vw, 42vw"
        overlay
      />
      <Reveal as="div" className="min-w-0">
        <SectionLabel>{recoveryProof.marker}</SectionLabel>
        <DisplayTitle id="proof-head" className="mt-5">
          {renderTitleParts(recoveryProof.headline)}
        </DisplayTitle>
        <p className="mt-6 max-w-xl text-[clamp(1rem,1vw+0.75rem,1.125rem)] leading-[1.75] text-ink/60">
          {recoveryProof.body}
        </p>
        <dl className={cn(cardGrid, "mt-10 overflow-hidden bg-ink/10")}>
          {recoveryProof.facts.map((fact) => (
            <div key={fact.label} className="bg-white p-5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40">
                {fact.label}
              </dt>
              <dd className="mt-2 font-semibold text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}

function Steps() {
  return (
    <section className="border-t border-ink/10 bg-white" id="how" aria-labelledby="steps-head">
      <div className={cn(sectionShell, "grid gap-12")}>
        <div className={cn(splitGridReverse, "lg:items-end")}>
          <Reveal as="header">
            <SectionLabel>§ 02 · How it works</SectionLabel>
            <DisplayTitle id="steps-head" className="mt-5 max-w-3xl">
              Three steps. <em>That is the product.</em>
            </DisplayTitle>
          </Reveal>
          <ResponsiveImage
            image={stepsVisual}
            className="aspect-[16/10] w-full"
            sizes="(max-width: 1024px) 100vw, 32vw"
            overlay
          />
        </div>
        <StaggerGroup className={cn(cardGrid, "bg-ink/10")}>
          {steps.map((step) => (
            <StaggerItem key={step.n} className="bg-white p-6 sm:p-8">
              <article>
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40">
                  Step {step.n}
                </span>
                <h3 className="mt-8 text-balance text-3xl font-bold leading-tight tracking-[-0.035em]">
                  {renderTitleParts(step.title)}
                </h3>
                <p className="mt-4 leading-7 text-ink/60">{step.body}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function OutcomeFeature() {
  return (
    <Reveal
      as="section"
      className="relative isolate min-h-[clamp(24rem,48vw,32.5rem)] overflow-hidden"
      id="outcome"
      aria-labelledby="outcome-head"
    >
      <ResponsiveImage
        image={outcomeFeature.image}
        className="absolute inset-0 h-full w-full border-0"
        caption={false}
        sizes="100vw"
        overlay
      />
      <div className="relative z-10 mx-auto flex min-h-[clamp(24rem,48vw,32.5rem)] w-full max-w-7xl items-end px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2.5rem,6vw,4rem)]">
        <div className="max-w-2xl text-white">
          <SectionLabel onDark>{outcomeFeature.marker}</SectionLabel>
          <DisplayTitle id="outcome-head" onDark className="mt-5">
            {outcomeFeature.headline}
          </DisplayTitle>
          <p className="mt-5 max-w-xl text-[clamp(1rem,1vw+0.75rem,1.125rem)] leading-[1.75] text-white/75">
            {outcomeFeature.body}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function Desk() {
  return (
    <section className="bg-ink text-white" id="desk" aria-labelledby="desk-head">
      <div className={cn(sectionShell, "grid gap-12")}>
        <Reveal as="header" className={cn(splitGridReverse, "lg:items-start")}>
          <div>
            <SectionLabel onDark>§ 03 · The desk</SectionLabel>
            <DisplayTitle id="desk-head" onDark className="mt-5 max-w-4xl">
              One of <em className="text-accent-live">ten travel experts</em> is already online.
            </DisplayTitle>
            <p className="mt-6 max-w-3xl text-[clamp(1rem,1vw+0.75rem,1.125rem)] leading-[1.75] text-white/65">
              Travel agents book what you tell them. Travel experts <em>advise</em>{" "}
              — they&rsquo;ve been there, they read the language, they know which
              embassy desk to call. Tap a name and you&rsquo;re on a thread with{" "}
              <em>them</em>, not a queue.
            </p>
          </div>
          <LivePill
            experts={liveStatus.expertsOnShift}
            pickupSeconds={liveStatus.avgPickupSeconds}
            onDark
          />
        </Reveal>
        <div className={cn(splitGrid, "lg:items-start")}>
          <ResponsiveImage
            image={visualAssets.operatorRoster}
            className="aspect-square w-full"
            sizes="(max-width: 1024px) 100vw, 36vw"
            overlay
          />
          <StaggerGroup className={cn(cardGrid, "bg-white/10")}>
            {desk.map((agent) => (
              <StaggerItem key={agent.initials} className="bg-ink p-6 ring-1 ring-white/10 sm:p-7">
                <article>
                  <span className="inline-flex size-2 rounded-full bg-accent-live" aria-label="Online" />
                  <div className="mt-5 flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-xs font-bold text-ink">
                      {agent.initials}
                    </span>
                    <div>
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-sm text-white/50">{agent.role}</div>
                    </div>
                  </div>
                  <blockquote className="mt-6 text-balance font-serif text-2xl italic leading-tight text-white">
                    &ldquo;{agent.quote}&rdquo;
                  </blockquote>
                  <div className="mt-8 flex justify-between gap-4 border-t border-white/10 pt-4 text-sm text-white/55">
                    <span>
                      <b className="text-white">{agent.tenure}</b> · tenure
                    </span>
                    <span>
                      <b className="text-white">{agent.saves}</b>
                    </span>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <StaggerGroup as="section" className={cn(cardGrid, "border-y border-ink/10 bg-ink/10")}>
      {metrics.map((m) => (
        <StaggerItem key={m.label} className="bg-white p-8 sm:p-10 lg:p-14">
          <div>
            <div className="font-bold text-[clamp(3.75rem,8vw,4.5rem)] leading-none tracking-[-0.05em] text-accent">
              {m.value}
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.26em] text-ink/45">
              {m.label}
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

function Closing() {
  return (
    <Reveal
      as="section"
      className="relative isolate scroll-mt-20 overflow-hidden bg-field"
      id="contact"
      aria-labelledby="closing-head"
    >
      <ResponsiveImage
        image={visualAssets.postcards}
        className="absolute inset-0 h-full w-full border-0 opacity-35"
        caption={false}
        sizes="100vw"
      />
      <div className={cn(sectionShell, "relative z-10 text-center")}>
        <SectionLabel className="justify-center before:hidden">End of issue</SectionLabel>
        <h2
          id="closing-head"
          className="mx-auto mt-6 max-w-3xl text-balance text-[clamp(2.5rem,8vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.05em] text-ink"
        >
          Next trip,
          <br />
          <em className="text-accent">call a human.</em>
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ClosingCtas />
        </div>
      </div>
    </Reveal>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className={cn(sectionShell, "pb-10")}>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))]">
          <div>
            <Wordmark onDark size="text-3xl" />
            <p className="mt-5 max-w-sm text-lg text-white/60">
              TripZ — picked up <em className="text-accent-live">by humans.</em>
            </p>
            <div className="mt-8">
              <span className="block font-mono text-[11px] uppercase tracking-[0.26em] text-white/40">
                Call any hour
              </span>
              <a className="mt-2 block text-2xl font-bold" href={`tel:${supportPhoneE164}`}>
                {supportPhoneDisplay}
              </a>
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.26em] text-white/40">
                {title}
              </h4>
              <ul className="mt-5 grid gap-3 text-sm text-white/65">
                {links.map((link) => (
                  <li key={link.label}>
                    <a className="transition hover:text-white" href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/45">
          <span>© 2026 TripZ · Bengaluru / Mumbai / Bangkok</span>
          <LivePill
            experts={liveStatus.expertsOnShift}
            pickupSeconds={liveStatus.avgPickupSeconds}
            onDark
          />
        </div>
      </div>
    </footer>
  );
}

function StickyMobile() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-white/10 bg-ink/95 p-3 backdrop-blur md:hidden">
      <a
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-ink"
        href={ctaActions.call.href}
      >
        <Icons.phone size={15} />
        Call a human
      </a>
      <a
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 px-3 text-sm font-semibold text-white"
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
        <VisualInterlude />
        <Services />
        <Promise />
        <PillarStack />
        <PullBand />
        <ProofFeature />
        <Steps />
        <OutcomeFeature />
        <Desk />
        <Metrics />
        <Closing />
      </main>
      <Footer />
      <StickyMobile />
    </>
  );
}
