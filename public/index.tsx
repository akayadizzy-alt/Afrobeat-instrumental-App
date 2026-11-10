import { useState } from "react";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BeatCard } from "@/components/beat-card";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { DownloadIcon, SearchIcon } from "@/components/icons";
import { beatsInfiniteOptions, categoriesOptions, type BeatFilters } from "@/lib/queries";
import { displayTitle } from "@/lib/wordpress";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const categories = await context.queryClient.ensureQueryData(categoriesOptions());
    const defaultCategoryId = categories.find((category) => category.slug === "freebeat")?.id;
    const beats = await context.queryClient.ensureInfiniteQueryData(
      beatsInfiniteOptions({ category: defaultCategoryId }),
    );
    return { featuredBeat: beats.pages[0]?.[0] };
  },
  head: ({ loaderData }) => {
    const image = loaderData?.featuredBeat?.image;
    return {
      meta: [
        { title: "Afrobeat Instrumentals | Free Beats & Downloads" },
        {
          name: "description",
          content: "Stream and download free Afrobeat instrumentals from Afrobeat Instrumental.",
        },
        { property: "og:title", content: "Afrobeat Instrumentals | Free Beats & Downloads" },
        {
          property: "og:description",
          content: "Stream and download free Afrobeat instrumentals from Afrobeat Instrumental.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  component: Index,
  pendingComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-20 pb-28 text-center text-muted-foreground">Loading beats…</main>
      <SiteFooter />
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-20 pb-28 text-center">
        <h1 className="section-title mt-12">Beats are taking a break</h1>
        <p className="mt-3 text-muted-foreground">The beat list couldn’t load right now. Try refreshing in a moment.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>Try again</Button>
      </main>
      <SiteFooter />
    </div>
  ),
});

function Index() {
  const { featuredBeat } = Route.useLoaderData();
  const { data: categories } = useSuspenseQuery(categoriesOptions());
  const defaultCategoryId = categories.find((category) => category.slug === "freebeat")?.id;
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const activeCategory = selectedCategory === 0 ? undefined : selectedCategory ?? defaultCategoryId;
  const filters: BeatFilters = { category: activeCategory, search: search || undefined };
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    beatsInfiniteOptions(filters),
  );
  const beats = data?.pages.flat() ?? [];
  const visibleCategories = categories.filter(
    (category) => category.count > 0 && !["articles", "uncategorized", "uncategorised"].includes(category.slug),
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="home" className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6">
        <section className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Fresh from Lagos</p>
            <h1 className="section-title mt-2 text-4xl sm:text-5xl">Find your next sound</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">Free Afrobeat instrumentals, ready to stream and download.</p>
          </div>
          <form
            id="search"
            className="flex w-full max-w-md items-center gap-2 sm:w-[22rem]"
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(searchInput.trim());
            }}
            role="search"
          >
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search beats"
                placeholder="Search beats or producers"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </section>

        {featuredBeat && (
          <section className="grid gap-6 border-b border-border/70 py-7 sm:grid-cols-[minmax(12rem,18rem)_1fr] sm:items-center sm:gap-8">
            <Link to="/beat/$slug" params={{ slug: featuredBeat.slug }} className="group block overflow-hidden rounded-md">
              {featuredBeat.image ? (
                <img src={featuredBeat.image} alt={displayTitle(featuredBeat.title)} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-secondary text-primary">Afrobeat</div>
              )}
            </Link>
            <div className="min-w-0">
              <span className="badge">Featured beat</span>
              <h2 className="mt-4 font-display text-4xl uppercase leading-tight sm:text-5xl">{displayTitle(featuredBeat.title)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {featuredBeat.producer ? `Produced by ${featuredBeat.producer}` : "Free Afrobeat instrumental"}
                {featuredBeat.categories[0] ? ` · ${featuredBeat.categories[0].name}` : ""}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/beat/$slug" params={{ slug: featuredBeat.slug }}>Listen now</Link>
                </Button>
                {featuredBeat.audio && (
                  <Button asChild variant="outline">
                    <a href={featuredBeat.audio} target="_blank" rel="noreferrer">
                      <DownloadIcon /> Download MP3
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        <section id="catalogue" className="pt-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">The catalogue</p>
              <h2 className="section-title mt-1 text-3xl">Browse beats</h2>
            </div>
            <p className="text-sm text-muted-foreground">{beats.length} {beats.length === 1 ? "beat" : "beats"} shown</p>
          </div>
          <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Filter by category">
            <Button size="sm" variant={selectedCategory === 0 ? "default" : "outline"} onClick={() => setSelectedCategory(0)}>All beats</Button>
            {visibleCategories.map((category) => {
              const isSelected = (selectedCategory ?? defaultCategoryId) === category.id;
              return (
                <Button key={category.id} size="sm" variant={isSelected ? "default" : "outline"} onClick={() => setSelectedCategory(category.id)}>
                  {category.name}
                </Button>
              );
            })}
          </div>

          {beats.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
              {beats.map((beat) => <BeatCard key={beat.id} beat={beat} queue={beats} />)}
            </div>
          ) : (
            <div className="border-y border-border/70 py-16 text-center">
              <h3 className="font-display text-2xl uppercase">No beats found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try another title, producer, or category.</p>
            </div>
          )}

          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Loading…" : "Load more beats"}
              </Button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
