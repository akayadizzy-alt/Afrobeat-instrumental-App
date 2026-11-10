import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, ExternalLinkIcon, MusicIcon } from "./icons";

export function SiteHeader({ back }: { back?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        {back && (
          <Link
            to="/"
            aria-label="Back to all beats"
            className="rounded-full p-1 text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        )}
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
            <MusicIcon className="h-5 w-5" />
          </span>
          <span className="truncate font-display text-2xl uppercase leading-none tracking-wide">
            Afrobeat <span className="gradient-text">Instrumental</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

const informationLinks = [
  { label: "About us", slug: "about-us" },
  { label: "Contact us", slug: "contact" },
  { label: "Advertise with us", slug: "support-us" },
] as const;

const legalLinks = [
  { label: "Privacy policy", slug: "privacy-policy-2" },
  { label: "Terms & conditions", slug: "terms-and-conditions" },
  { label: "Disclaimer", slug: "disclaimer" },
  { label: "DMCA", slug: "dmca" },
] as const;

function FooterLinks({ title, links }: { title: string; links: readonly { label: string; slug: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {links.map((item) => (
          <li key={item.slug}>
            <Link
              to="/pages/$slug"
              params={{ slug: item.slug }}
              className="text-sm text-muted-foreground transition hover:text-primary"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-[1.35fr_1fr_1fr] sm:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="font-display text-2xl uppercase tracking-wide text-foreground">
              Afrobeat <span className="gradient-text">Instrumental</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              Free instrumentals for artists, direct from the live catalogue.
            </p>
          </div>
          <FooterLinks title="Information" links={informationLinks} />
          <FooterLinks title="Legal" links={legalLinks} />
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-border/60 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Afrobeat Instrumental</p>
          <a
            href="https://afrobeatinstrumental.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-foreground"
          >
            Visit the original website <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
