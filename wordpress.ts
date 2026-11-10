// Server-side helpers for reading the live WordPress REST API of
// afrobeatinstrumental.com. Pure functions only — runs on the Edge runtime.

const WP_BASE = "https://afrobeatinstrumental.com";

export interface Beat {
  id: number;
  slug: string;
  title: string;
  producer?: string | undefined;
  excerpt: string;
  paragraphs: string[];
  image?: string | undefined;
  audio?: string | undefined;
  date: string;
  categories: { id: number; name: string; slug: string }[];
  link: string;
}

export interface BeatQuery {
  page?: number | undefined;
  perPage?: number | undefined;
  search?: string | undefined;
  category?: number | undefined;
  excludeId?: number | undefined;
}

export interface BeatCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export const SITE_PAGE_SLUGS = [
  "about-us",
  "contact",
  "support-us",
  "privacy-policy-2",
  "terms-and-conditions",
  "disclaimer",
  "dmca",
] as const;

export interface SitePageBlock {
  type: "paragraph" | "heading" | "list";
  text: string;
}

export interface SitePageLink {
  label: string;
  href: string;
}

export interface SitePage {
  id: number;
  slug: string;
  title: string;
  description: string;
  blocks: SitePageBlock[];
  links: SitePageLink[];
  link: string;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&#8216;": "\u2018",
  "&#8217;": "\u2019",
  "&#8220;": "\u201c",
  "&#8221;": "\u201d",
  "&#8211;": "\u2013",
  "&#8212;": "\u2014",
  "&#8230;": "\u2026",
  "&nbsp;": " ",
  "&hellip;": "\u2026",
};

export function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&[a-z0-9#]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

export function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Turn a raw WordPress title into a human-friendly beat name. */
export function displayTitle(raw: string): string {
  let t = raw.replace(/^download\s+freebeat[:\s-]*/i, "").trim();
  t = t.replace(/\s*(?:[-–—|]\s*)?afrobeat instrumental\s*$/i, "").trim();
  return t || raw;
}

interface WpTerm {
  id: number;
  name: string;
  slug: string;
}

interface WpPost {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: {
      source_url?: string;
      media_details?: { sizes?: Record<string, { source_url: string }> };
    }[];
    "wp:term"?: WpTerm[][];
  };
}

export function mapPost(post: WpPost): Beat {
  const title = stripTags(post.title.rendered);
  const producer =
    title.match(/prod(?:uction)?\s+by\s+([A-Za-z0-9'&.\- ]+)/i)?.[1]?.trim() ??
    undefined;

  const audio =
    post.content.rendered.match(/https?:\/\/[^"'<>()\s]+\.mp3/i)?.[0] ??
    undefined;

  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const sizes = media?.media_details?.sizes ?? {};
  const image =
    sizes["large"]?.source_url ??
    sizes["medium_large"]?.source_url ??
    media?.source_url ??
    post.content.rendered.match(/https?:\/\/[^"'<>()\s]+\.(?:jpe?g|png|webp)/i)?.[0];

  const categories = (post._embedded?.["wp:term"]?.[0] ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
  }));

  const paragraphs = (post.content.rendered.match(/<p[^>]*>[\s\S]*?<\/p>/g) ?? [])
    .map((p) => stripTags(p))
    .filter((t) => t.length > 0 && !t.includes(".mp3"))
    .slice(0, 10);

  const excerpt = stripTags(post.excerpt.rendered)
    .replace(/\[…\]\s*$/, "")
    .trim();

  return {
    id: post.id,
    slug: post.slug,
    title,
    producer: producer && producer.length > 1 ? producer : undefined,
    excerpt,
    paragraphs,
    image,
    audio,
    date: post.date,
    categories,
    link: post.link,
  };
}

function wpFetch(url: URL): Promise<Response> {
  return fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
}

export async function fetchBeats(params: BeatQuery): Promise<Beat[]> {
  const url = new URL(`${WP_BASE}/wp-json/wp/v2/posts`);
  url.searchParams.set("_embed", "1");
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("per_page", String(params.perPage ?? 12));
  if (params.search) url.searchParams.set("search", params.search);
  if (params.category) url.searchParams.set("categories", String(params.category));
  if (params.excludeId) url.searchParams.set("exclude", String(params.excludeId));

  const res = await wpFetch(url);
  // Past the last page WordPress answers 400 — treat as "no more beats".
  if (res.status === 400 || res.status === 404) return [];
  if (!res.ok) throw new Error(`WordPress request failed [${res.status}]`);
  const posts = (await res.json()) as WpPost[];
  return posts.map(mapPost);
}

export async function fetchBeat(slug: string): Promise<Beat | null> {
  const url = new URL(`${WP_BASE}/wp-json/wp/v2/posts`);
  url.searchParams.set("slug", slug);
  url.searchParams.set("_embed", "1");
  const res = await wpFetch(url);
  if (!res.ok) return null;
  const posts = (await res.json()) as WpPost[];
  return posts[0] ? mapPost(posts[0]) : null;
}

export async function fetchCategories(): Promise<BeatCategory[]> {
  const res = await wpFetch(
    new URL(
      `${WP_BASE}/wp-json/wp/v2/categories?per_page=20&orderby=count&order=desc&_fields=id,name,slug,count`,
    ),
  );
  if (!res.ok) return [];
  const cats = (await res.json()) as BeatCategory[];
  return cats.filter((c) => c.count > 0 && c.slug !== "uncategorized");
}

interface WpPage {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
}

function parsePageBlocks(html: string): SitePageBlock[] {
  const blocks: SitePageBlock[] = [];
  const tagPattern = /<(h[2-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of html.matchAll(tagPattern)) {
    const tag = match[1]?.toLowerCase();
    let text = stripTags(match[2] ?? "");
    if (!text) continue;
    const isListItem = tag === "li" || /^[–—•-]\s*/.test(text);
    if (isListItem) text = text.replace(/^[–—•-]\s*/, "");
    blocks.push({
      type: tag?.startsWith("h") ? "heading" : isListItem ? "list" : "paragraph",
      text,
    });
  }
  return blocks;
}

function parsePageLinks(html: string): SitePageLink[] {
  const links: SitePageLink[] = [];
  const linkPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(linkPattern)) {
    const href = decodeEntities(match[1] ?? "");
    if (!/^(?:https?:\/\/|mailto:)/i.test(href)) continue;
    links.push({ href, label: stripTags(match[2] ?? "") || href });
  }
  return links;
}

export async function fetchSitePage(slug: string): Promise<SitePage | null> {
  if (!(SITE_PAGE_SLUGS as readonly string[]).includes(slug)) return null;
  const url = new URL(`${WP_BASE}/wp-json/wp/v2/pages`);
  url.searchParams.set("slug", slug);
  const res = await wpFetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`WordPress page request failed [${res.status}]`);
  const pages = (await res.json()) as WpPage[];
  const page = pages[0];
  if (!page) return null;
  const blocks = parsePageBlocks(page.content.rendered);
  const description = blocks.find((block) => block.type === "paragraph" && block.text.length > 40)?.text
    ?? `Read ${stripTags(page.title.rendered)} from Afrobeat Instrumental.`;
  return {
    id: page.id,
    slug: page.slug,
    title: stripTags(page.title.rendered),
    description: description.slice(0, 180),
    blocks,
    links: parsePageLinks(page.content.rendered),
    link: page.link,
  };
}
