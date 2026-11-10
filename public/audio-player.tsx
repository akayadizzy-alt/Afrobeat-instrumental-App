import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePlayback } from "@/components/playback-provider";
import { PauseIcon, PlayIcon } from "./icons";

export function AudioPlayer({ src, title }: { src: string; title: string }) {
  const playback = usePlayback();
  const isCurrent = playback.track?.src === src;
  const playing = isCurrent && playback.playing;
  const current = isCurrent ? playback.current : 0;
  const duration = isCurrent ? playback.duration : 0;
  const error = isCurrent && playback.error;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          onClick={() => playback.playTrack({ title, src })}
          aria-label={playing ? "Pause" : "Play"}
          size="icon"
          className="h-14 w-14 shrink-0 rounded-full shadow-glow transition hover:scale-105 active:scale-95"
        >
          {playing ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6 translate-x-0.5" />
          )}
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          {error ? (
            <p className="mt-2 text-xs text-destructive">
              Preview unavailable — use the download button below.
            </p>
          ) : (
            <>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(current, duration || 0)}
                disabled={!duration}
                onChange={(e) => playback.seek(Number(e.target.value))}
                className="mt-2 w-full accent-primary disabled:opacity-40"
                aria-label="Seek"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>{formatTime(current)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
