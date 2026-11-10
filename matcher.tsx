import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LockKeyhole, Search, WandSparkles } from "lucide-react";
import { BeatCard } from "@/components/beat-card";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { rankBeats } from "@/lib/beat-matcher";
import { matchCandidatesOptions } from "@/lib/queries";

export const Route = createFileRoute("/matcher")({
  loader: async ({ context }) => ({
    beats: await context.queryClient.ensureQueryData(matchCandidatesOptions()),
  }),
  head: () => ({
    meta: [
      { title: "Beat Matcher | Afrobeat Instrumental" },
      {
        name: "description",
        content: "Describe your song idea or paste lyrics to find matching instrumentals from the live Afrobeat catalogue.",
      },
      { property: "og:title", content: "Beat Matcher | Afrobeat Instrumental" },
      {
        property: "og:description",
        content: "Find Afrobeat instrumentals that fit your lyrics, mood, and style.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BeatMatcher,
});

const suggestions = [
  "A romantic song with soft guitar for someone I love",
  "A high-energy party track for dancing all night",
  "An emotional song about heartbreak and moving on",
  "A street rap beat for lyrics about the hustle",
];

function BeatMatcher() {
  const { beats } = Route.useLoaderData();
  const [idea, setIdea] = useState("");
  const [submittedIdea, setSubmittedIdea] = useState("");
  const matches = useMemo(() => rankBeats(submittedIdea, beats), [submittedIdea, beats]);
  const audioCount = beats.filter((beat) => beat.audio).length;

  const findMatches = (value: string) => {
    const clean = value.trim();
    setIdea(clean);
    setSubmittedIdea(clean);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6">
        <section className="border-b border-border/70 pb-7">
          <span className="badge"><WandSparkles className="h-3 w-3" /> Beat matcher</span>
          <h1 className="section-title mt-4 max-w-2xl text-4xl sm:text-5xl">What does your song feel like?</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Describe your idea or paste your lyrics. We’ll match the mood and style with instrumentals from the live catalogue.
          </p>
        </section>

        <section className="py-7" aria-labelledby="matcher-form-title">
          <h2 id="matcher-form-title" className="sr-only">Describe your song</h2>
          <form
            className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-5"
            onSubmit={(event) => {
              event.preventDefault();
              findMatches(idea);
            }}
          >
            <label htmlFor="song-idea" className="text-sm font-semibold">Your song idea or lyrics</label>
            <textarea
              id="song-idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              maxLength={4000}
              rows={7}
              placeholder="Example: A smooth, emotional love song with guitar. My lyrics are about finding someone who understands me…"
              className="mt-3 w-full resize-y rounded-md border border-input bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <LockKeyhole className="h-3.5 w-3.5" /> Matching happens on your device. Nothing is saved.
              </p>
              <Button type="submit" disabled={!idea.trim()} className="w-full sm:w-auto">
                <Search /> Find matching beats
              </Button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Example song ideas">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" className="chip" onClick={() => findMatches(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </section>

        {submittedIdea && (
          <section className="border-t border-border/70 pt-7" aria-live="polite">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">From {audioCount} live instrumentals</p>
                <h2 className="section-title mt-1 text-3xl">Your closest matches</h2>
              </div>
              {matches.length > 0 && <p className="text-sm text-muted-foreground">{matches.length} recommendations</p>}
            </div>
            {matches.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {matches.map((match) => (
                  <div key={match.beat.id}>
                    {match.reasons.length > 0 && (
                      <p className="mb-2 truncate text-xs font-medium text-primary" title={match.reasons.join(" · ")}>
                        {match.reasons.join(" · ")}
                      </p>
                    )}
                    <BeatCard beat={match.beat} queue={matches.map((item) => item.beat)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 border-y border-border/70 py-12 text-center">
                <h3 className="font-display text-2xl uppercase">Try a little more detail</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Add a mood, genre, or theme such as love, party, emotional, guitar, Amapiano, or rap.
                </p>
              </div>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
