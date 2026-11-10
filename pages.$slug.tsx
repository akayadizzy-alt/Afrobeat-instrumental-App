import type { ReactNode } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLinkIcon } from "@/components/icons";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { sitePageOptions } from "@/lib/queries";

export const Route = createFileRoute("/pages/$slug")({
  loader: async ({ context, params }) => {
    const page = await context.queryClient.ensureQueryData(sitePageOptions(params.slug));
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.page;
    const title = page ? `${page.title} | Afrobeat Instrumental` : "Page | Afrobeat Instrumental";
    const description = page?.description ?? "Information from Afrobeat Instrumental.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: WordPressPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader back />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="section-title text-4xl">Page not found</h1>
        <p className="mt-3 text-muted-foreground">This information page isn’t available.</p>
        <Button asChild className="mt-6"><Link to="/">Back to beats</Link></Button>
      </main>
      <SiteFooter />
    </div>
  ),
});

const LINK_TEXT = /^(?:https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})$/;

function linkedText(text: string): ReactNode {
  return text.split(/(https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/g).map((part, index) => {
    if (!LINK_TEXT.test(part)) return part;
    const href = part.startsWith("www.") ? `https://${part}` : part.includes("@") && !part.startsWith("mailto:") ? `mailto:${part}` : part;
    const external = href.startsWith("http");
    return (
      <a
        key={`${part}-${index}`}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="font-medium text-primary underline underline-offset-4"
      >
        {part}
      </a>
    );
  });
}

function WordPressPage() {
  const { slug } = Route.useParams();
  const { data: page } = useSuspenseQuery(sitePageOptions(slug));
  if (!page) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader back />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6">
        <Link to="/" className="text-sm text-muted-foreground transition hover:text-foreground">← Back to beats</Link>
        <article className="mt-6">
          <p className="text-xs font-semibold uppercase text-primary">Afrobeat Instrumental</p>
          <h1 className="section-title mt-2 text-4xl sm:text-5xl">{page.title}</h1>
          <div className="mt-7 space-y-4 border-t border-border/70 pt-6">
            {page.blocks.map((block, index) => {
              if (block.type === "heading") {
                return <h2 key={`${index}-${block.text}`} className="pt-4 font-display text-2xl uppercase leading-tight text-foreground">{linkedText(block.text)}</h2>;
              }
              if (block.type === "list") {
                return (
                  <div key={`${index}-${block.text}`} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <p>{linkedText(block.text)}</p>
                  </div>
                );
              }
              return <p key={`${index}-${block.text}`} className="text-sm leading-7 text-muted-foreground">{linkedText(block.text)}</p>;
            })}
          </div>
          {page.links.length > 0 && (
            <div className="mt-7 rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Contact links</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {page.links.map((link) => (
                  <Button asChild key={link.href} variant="outline" size="sm">
                    <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {link.label} <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
          <a href={page.link} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 transition hover:text-foreground">
            View this live page on the original website <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
