import { Link, useRouterState } from "@tanstack/react-router";
import { Grid2X2, House, Search, WandSparkles, type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  to: "/" | "/matcher";
  hash?: string;
  Icon: LucideIcon;
}

const items: NavItem[] = [
  { label: "Home", to: "/", hash: "home", Icon: House },
  { label: "Browse", to: "/", hash: "catalogue", Icon: Grid2X2 },
  { label: "Match", to: "/matcher", Icon: WandSparkles },
  { label: "Search", to: "/", hash: "search", Icon: Search },
];

export function AppBottomNav() {
  const { pathname, hash } = useRouterState({
    select: (state) => ({ pathname: state.location.pathname, hash: state.location.hash }),
  });
  const currentHash = hash.replace(/^#/, "");

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4 px-2">
        {items.map(({ label, to, hash: itemHash, Icon }) => {
          const active = to === "/matcher"
            ? pathname === "/matcher"
            : pathname === "/" && (currentHash === itemHash || (!currentHash && itemHash === "home"));
          return (
            <Link
              key={label}
              to={to}
              {...(itemHash ? { hash: itemHash } : {})}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
