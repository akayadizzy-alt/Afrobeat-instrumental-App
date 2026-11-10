import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";
import { getBeat, getSitePage, listBeats, listCategories } from "@/lib/beats.functions";

export const PER_PAGE = 12;

export const categoriesOptions = () =>
  queryOptions({
    queryKey: ["wp-categories"],
    queryFn: () => listCategories(),
    staleTime: 1000 * 60 * 10,
  });

export interface BeatFilters {
  search?: string | undefined;
  category?: number | undefined;
}

export const beatsInfiniteOptions = (filters: BeatFilters) =>
  infiniteQueryOptions({
    queryKey: ["wp-beats", filters],
    queryFn: ({ pageParam }) =>
      listBeats({ data: { page: pageParam, perPage: PER_PAGE, ...filters } }),
    initialPageParam: 1,
    getNextPageParam: (last, _all, lastPageParam) =>
      last.length < PER_PAGE ? undefined : lastPageParam + 1,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

export const beatOptions = (slug: string) =>
  queryOptions({
    queryKey: ["wp-beat", slug],
    queryFn: () => getBeat({ data: { slug } }),
    staleTime: 1000 * 60 * 5,
  });

export const relatedBeatsOptions = (categoryId: number, excludeId: number) =>
  queryOptions({
    queryKey: ["wp-related", categoryId, excludeId],
    queryFn: () =>
      listBeats({
        data: { category: categoryId, excludeId, perPage: 6 },
      }),
    staleTime: 1000 * 60 * 5,
  });

export const matchCandidatesOptions = () =>
  queryOptions({
    queryKey: ["wp-match-candidates"],
    queryFn: () => listBeats({ data: { perPage: 36 } }),
    staleTime: 1000 * 60 * 5,
  });

export const sitePageOptions = (slug: string) =>
  queryOptions({
    queryKey: ["wp-page", slug],
    queryFn: () => getSitePage({ data: { slug } }),
    staleTime: 1000 * 60 * 10,
  });
