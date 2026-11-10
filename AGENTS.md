<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## App architecture

- Use only the owner's live WordPress REST API for catalogue, audio, and footer-page content; do not add an app database, account backend, or AI service. Use TanStack file routes and shared query options so content stays current.
- Keep client-callable server functions in `*.functions.ts` modules outside `src/server/`, because the client import boundary blocks that directory.
- Keep audio playback in one root-level provider so beat cards, detail pages, and the persistent bottom player share a single queue and audio element.
- Keep app-wide bottom navigation beside the route outlet in the root shell, with catalogue actions targeting real sections on the home page.
