import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches a beat detail page", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/beat/sample-beat");

    expect(matches.at(-1)?.routeId).toBe("/beat/$slug");
  });

  it("matches the catalogue-only beat matcher", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/matcher");

    expect(matches.at(-1)?.routeId).toBe("/matcher");
  });

  it.each(["dmca", "privacy-policy-2", "terms-and-conditions", "disclaimer", "about-us", "contact", "support-us"])(
    "matches the live WordPress page for %s",
    (slug) => {
      const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

      const matches = router.matchRoutes(`/pages/${slug}`);

      expect(matches.at(-1)?.routeId).toBe("/pages/$slug");
    },
  );
});
