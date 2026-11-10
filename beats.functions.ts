import { createServerFn } from "@tanstack/react-start";
import {
  fetchBeat,
  fetchBeats,
  fetchCategories,
  fetchSitePage,
  type BeatQuery,
} from "@/lib/wordpress";

export const listBeats = createServerFn({ method: "GET" })
  .inputValidator((input: BeatQuery | undefined) => input ?? {})
  .handler(async ({ data }) => fetchBeats(data));

export const getBeat = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => fetchBeat(data.slug));

export const listCategories = createServerFn({ method: "GET" }).handler(
  async () => fetchCategories(),
);

export const getSitePage = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => fetchSitePage(data.slug));