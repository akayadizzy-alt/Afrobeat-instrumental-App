import { describe, expect, it } from "vitest";
import { rankBeats } from "@/lib/beat-matcher";
import type { Beat } from "@/lib/wordpress";

function beat(id: number, title: string, category: string, audio = "https://example.com/beat.mp3"): Beat {
  return {
    id,
    slug: `beat-${id}`,
    title,
    excerpt: "",
    paragraphs: [],
    audio,
    date: `2026-01-${String(id).padStart(2, "0")}`,
    categories: [{ id, name: category, slug: category.toLowerCase() }],
    link: `https://example.com/beat-${id}`,
  };
}

describe("catalogue beat matcher", () => {
  it("ranks emotional guitar ahead of trap for a sad love song", () => {
    const matches = rankBeats("A sad love song with soft guitar", [
      beat(1, "Street Code", "Trap Beat"),
      beat(2, "Love Guitar", "Emotional Afrobeat"),
    ]);

    expect(matches[0]?.beat.id).toBe(2);
  });

  it("ranks rap and hip hop for street lyrics about the hustle", () => {
    const matches = rankBeats("Street rap bars about my daily hustle", [
      beat(1, "Sweet Love", "R&B"),
      beat(2, "Lagos Hustle", "Rap Instrumental"),
    ]);

    expect(matches[0]?.beat.id).toBe(2);
  });

  it("recommends only playable beats from the supplied catalogue", () => {
    const matches = rankBeats("A romantic love song", [
      beat(1, "Silent Love", "R&B", ""),
      beat(2, "Love Tonight", "R&B"),
    ]);

    expect(matches.map((match) => match.beat.id)).toEqual([2]);
  });

  it("returns no recommendations for an empty song idea", () => {
    expect(rankBeats("   ", [beat(1, "Love Tonight", "R&B")])).toEqual([]);
  });
});
