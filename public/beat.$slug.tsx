import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AudioPlayer } from "@/components/audio-player";
import { BeatCard } from "@/components/beat-card";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { beatOptions, relatedBeatsOptions } from "@/lib/queries";
import { displayTitle } from "@/lib/wordpress";

export const Route = createFileRoute("/beat/$slug")({
  loader: async ({ context, params }) => {
    const beat = await context.queryClient.ensureQueryData(beatOptions(params.slug));
    if (!beat) throw notFound();
    const categoryId = beat.categories[0]?.id;
    if (categoryId) {
      await context.queryClient.ensureQueryData(relatedBeatsOptions(categoryId, beat.id));
    }
    return { beat };
  },
  head: ({ loaderData }) => {
    const beat = loaderData?.beat;
    const title = beat ? `${displayTitle(beat.title)} | Afrobeat Instrumental` : "Beat | Afrobeat Instrumental";
    const description = beat?.excerpt || (beat ? `Listen to and download ${displayTitle(beat.title)}.` : "Listen to free Afrobeat instrumentals.");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "music.song" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(beat?.image
          ? [
              { property: "og:image", content: beat.image },
              { name: "twitter:image", content: beat.image },
            ]
          : []),
      ],
    };
  },
  component: BeatDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-16 pb-40 text-center">
        <SiteHeader back />
        <h1 className="section-title mt-12 text-4xl">Beat not found</h1>
        <p className="mt-2 text-muted-foreground">This beat may have been removed from the catalogue.</p>
        <Button asChild className="mt-6"><Link to="/">Browse all beats</Link></Button>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-16 pb-40 text-center">
        <SiteHeader back />
        <h1 className="section-title mt-12 text-4xl">This beat couldn’t load</h1>
        <Button asChild className="mt-6"><Link to="/">Back to beats</Link></Button>
      </main>
      <SiteFooter />
    </div>
  ),
});

function BeatDetail() {
  const { slug } = Route.useParams();
  const { data: beat } = useSuspenseQuery(beatOptions(slug));
  const categoryId = beat?.categories[0]?.id;
  const relatedQuery = relatedBeatsOptions(categoryId ?? 0, beat?.id ?? 0);
  const { data: related = [] } = useSuspenseQuery(relatedQuery);

  if (!beat) return null;
  const title = displayTitle(beat.title);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader back />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6">
        <Link to="/" className="text-sm text-muted-foreground transition hover:text-foreground">← All beats</Link>
        <section className="mt-5 grid gap-7 border-b border-border/70 pb-8 md:grid-cols-[minmax(16rem,25rem)_1fr] md:items-center md:gap-10">
          {beat.image ? (
            <img src={beat.image} alt={title} className="aspect-square w-full rounded-md object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-md bg-secondary font-display text-4xl uppercase text-primary">Afrobeat</div>
          )}
          <div className="min-w-0">
            {beat.categories[0] && <span className="badge">{beat.categories[0].name}</span>}
            <h1 className="mt-4 break-words font-display text-4xl uppercase leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {beat.producer ? `Produced by ${beat.producer}` : "Free Afrobeat instrumental"}
            </p>
            {beat.excerpt && <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">{beat.excerpt}</p>}
            <div className="mt-6">
              {beat.audio ? (
                <AudioPlayer src={beat.audio} title={title} />
              ) : (
                <p className="border-y border-border/70 py-4 text-sm text-muted-foreground">Audio preview isn’t available for this post.</p>
              )}
            </div>
            {beat.audio && (
              <Button asChild className="mt-4">
                <a href={beat.audio} target="_blank" rel="noreferrer">Download MP3</a>
              </Button>
            )}
            {beat.paragraphs.length > 0 && (
              <div className="mt-7 space-y-3 border-t border-border/70 pt-5 text-sm leading-6 text-muted-foreground">
                {beat.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
              </div>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section className="pt-8">
            <p className="text-xs font-semibold uppercase text-primary">Keep the rhythm going</p>
            <h2 className="section-title mt-1 text-3xl">More beats</h2>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
              {related.slice(0, 4).map((item) => <BeatCard key={item.id} beat={item} queue={related} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}