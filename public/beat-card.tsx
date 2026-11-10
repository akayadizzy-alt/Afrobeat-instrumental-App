import { Link } from "@tanstack/react-router";
import { cn, formatDate } from "@/lib/utils";
import { displayTitle, type Beat } from "@/lib/wordpress";
import { Button } from "@/components/ui/button";
import { usePlayback, type PlaybackTrack } from "@/components/playback-provider";
import { MusicIcon, PlayIcon } from "./icons";

export function BeatCard({ beat, queue, className }: { beat: Beat; queue?: Beat[]; className?: string }) {
  const { playTrack } = usePlayback();
  const title = displayTitle(beat.title);
  const playbackTrack: PlaybackTrack = { id: beat.id, title, src: beat.audio ?? "", image: beat.image };
  const playlist = (queue ?? [beat])
    .filter((item) => item.audio)
    .map((item) => ({ id: item.id, title: displayTitle(item.title), src: item.audio ?? "", image: item.image }));
  return (
    <div className={cn("group relative", className)}>
      <Link to="/beat/$slug" params={{ slug: beat.slug }} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card shadow-card transition duration-300 group-hover:shadow-glow">
          {beat.image ? (
            <img src={beat.image} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary"><MusicIcon className="h-10 w-10 text-muted-foreground" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
          {beat.categories[0] && <span className="absolute bottom-2.5 left-2.5">{beat.categories[0].name}</span>}
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{title}</h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{beat.producer ? `Prod. by ${beat.producer}` : "Free download"} · {formatDate(beat.date)}</p>
      </Link>
      {beat.audio && (
        <Button
          type="button"
          variant="default"
          size="icon"
          className="absolute right-2.5 top-2.5 z-10 h-10 w-10 rounded-full shadow-card sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
          aria-label={`Play ${title}`}
          title={`Play ${title}`}
          onClick={() => playTrack(playbackTrack, playlist)}
        >
          <PlayIcon className="h-4 w-4 translate-x-px" />
        </Button>
      )}
    </div>
  );
}
