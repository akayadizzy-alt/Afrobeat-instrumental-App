import { displayTitle, type Beat } from "@/lib/wordpress";

export interface BeatMatch {
  beat: Beat;
  score: number;
  reasons: string[];
}

const STOP_WORDS = new Set([
  "about", "after", "afrobeat", "again", "all", "and", "are", "artist", "beat", "beats",
  "been", "before", "but", "can", "could", "for", "from", "have", "her", "him", "his",
  "instrumental", "into", "its", "like", "looking", "make", "me", "more", "music", "my",
  "need", "not", "our", "out", "she", "song", "that", "the", "their", "them", "they",
  "this", "want", "was", "with", "would", "you", "your",
]);

const MOODS = [
  {
    reason: "Romantic feel",
    cues: ["love", "romantic", "romance", "heart", "baby", "wedding"],
    tags: ["love", "romantic", "r&b", "guitar", "emotional", "afropop"],
  },
  {
    reason: "Emotional mood",
    cues: ["sad", "emotional", "heartbreak", "cry", "pain", "lonely", "soulful"],
    tags: ["emotional", "sad", "soul", "guitar", "r&b", "slow"],
  },
  {
    reason: "Party energy",
    cues: ["party", "dance", "dancing", "club", "celebration", "turn up", "vibe"],
    tags: ["amapiano", "dancehall", "cruise", "party", "club", "pop"],
  },
  {
    reason: "Rap and street sound",
    cues: ["rap", "rapper", "hip hop", "hiphop", "hustle", "street", "grind", "bars"],
    tags: ["rap", "hip hop", "trap", "street", "drill"],
  },
  {
    reason: "Roots-inspired sound",
    cues: ["fuji", "reggae", "highlife", "traditional", "cultural", "african"],
    tags: ["fuji", "reggae", "highlife", "traditional"],
  },
  {
    reason: "Laid-back feel",
    cues: ["chill", "calm", "smooth", "soft", "relax", "mellow", "slow"],
    tags: ["r&b", "soul", "guitar", "emotional", "slow", "chill"],
  },
] as const;

function normalise(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9&]+/g, " ").trim();
}

function words(value: string): string[] {
  return normalise(value)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/** Rank only the supplied live catalogue; no text or results leave the browser. */
export function rankBeats(input: string, beats: Beat[], limit = 6): BeatMatch[] {
  const query = normalise(input);
  if (!query) return [];
  const queryWords = [...new Set(words(input))];
  const activeMoods = MOODS.filter((mood) => mood.cues.some((cue) => query.includes(cue)));

  return beats
    .filter((beat) => Boolean(beat.audio))
    .map((beat) => {
      const title = normalise(displayTitle(beat.title));
      const categories = normalise(beat.categories.map((category) => category.name).join(" "));
      const details = normalise(`${beat.producer ?? ""} ${beat.excerpt}`);
      const reasons = new Set<string>();
      let score = 0;

      for (const mood of activeMoods) {
        const matched = mood.tags.some((tag) => `${title} ${categories} ${details}`.includes(tag));
        if (matched) {
          score += 9;
          reasons.add(mood.reason);
        }
      }

      for (const word of queryWords) {
        if (title.includes(word)) {
          score += 7;
          reasons.add("Matching title");
        } else if (categories.includes(word)) {
          score += 6;
          reasons.add("Matching style");
        } else if (details.includes(word)) {
          score += 2;
          reasons.add("Matching description");
        }
      }

      return { beat, score, reasons: [...reasons].slice(0, 2) };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || b.beat.date.localeCompare(a.beat.date))
    .slice(0, limit);
}
