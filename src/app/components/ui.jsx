import { cva } from "class-variance-authority";
import Image from "next/image";
import { cn } from "@/lib/cn";

const buttonClass = cva(
  "inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  {
    variants: {
      tone: {
        dark: "bg-ink text-white hover:bg-brand-deep",
        light: "border border-ink/15 bg-white text-ink hover:border-ink/35",
        ghost: "border-b border-brand text-ink hover:bg-brand-soft"
      },
      size: {
        sm: "min-h-10 px-4 py-2 text-sm",
        md: "min-h-11 px-5 py-3 text-sm",
        lg: "min-h-12 px-6 py-3 text-base"
      }
    },
    defaultVariants: {
      tone: "dark",
      size: "md"
    }
  }
);

export function ButtonLink({
  href,
  children,
  tone,
  size,
  className,
  target,
  rel,
  ...props
}) {
  return (
    <a
      className={cn(buttonClass({ tone, size }), className)}
      href={href}
      target={target}
      rel={rel}
      {...props}
    >
      {children}
    </a>
  );
}

export function Wordmark({ onDark = false, size = "text-2xl" }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-sans font-bold leading-none tracking-tight",
        onDark ? "text-white" : "text-ink",
        size
      )}
    >
      Trip
      <span className="-ml-0.5 font-serif font-normal italic text-brand">
        Z
      </span>
    </span>
  );
}

export function SectionLabel({ children, onDark = false, className }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-3 break-words font-mono text-[11px] uppercase leading-5 tracking-[0.14em] sm:tracking-[0.24em]",
        onDark ? "text-white/65" : "text-ink/50",
        "before:h-px before:w-7",
        onDark ? "before:bg-white/40" : "before:bg-brand",
        className
      )}
    >
      {children}
    </span>
  );
}

export function LivePill({ experts, pickupSeconds, onDark = false, className }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 font-mono text-[12px] uppercase tracking-[0.14em] sm:tracking-[0.2em]",
        onDark ? "bg-white/10 text-white" : "bg-brand-soft text-ink",
        className
      )}
      aria-label={`${experts} travel experts online, average pickup ${pickupSeconds} seconds`}
    >
      <span className="size-2 rounded-full bg-brand ring-4 ring-brand/10" />
      {experts} experts · {pickupSeconds}s pickup
    </span>
  );
}

export function ResponsiveImage({
  image,
  className,
  imgClassName,
  caption = true,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  overlay = false,
  objectPosition
}) {
  return (
    <figure
      className={cn(
        "relative isolate m-0 overflow-hidden border border-ink/10 bg-ink",
        className
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        preload={priority}
        loading={priority ? undefined : "lazy"}
        className={cn("object-cover", imgClassName)}
        style={{ objectPosition: objectPosition || image.position || "center" }}
      />
      {overlay && (
        <span
          className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
          aria-hidden="true"
        />
      )}
      {caption && image.caption && (
        <figcaption className="absolute inset-x-4 bottom-4 z-10 font-mono text-[11px] uppercase tracking-[0.18em] text-white/75 sm:tracking-[0.28em]">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}
