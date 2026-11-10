import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Music2,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";

export interface PlaybackTrack {
  id?: string | number;
  title: string;
  src: string;
  image?: string | undefined;
}

type RepeatMode = "off" | "all" | "one";

interface PlaybackContextValue {
  track: PlaybackTrack | null;
  playing: boolean;
  current: number;
  duration: number;
  volume: number;
  error: boolean;
  playTrack: (track: PlaybackTrack, playlist?: PlaybackTrack[]) => void;
  toggle: () => void;
  seek: (value: number) => void;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function usePlayback() {
  const value = useContext(PlaybackContext);
  if (!value) throw new Error("usePlayback must be used inside PlaybackProvider");
  return value;
}

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoplay = useRef(false);
  const [track, setTrack] = useState<PlaybackTrack | null>(null);
  const [queue, setQueue] = useState<PlaybackTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [error, setError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (track && audio && shouldAutoplay.current) {
      shouldAutoplay.current = false;
      void audio.play().catch(() => setError(true));
    }
  }, [track?.src]);

  const selectQueueTrack = useCallback((index: number) => {
    const selected = queue[index];
    if (!selected) return;
    shouldAutoplay.current = true;
    setError(false);
    setCurrent(0);
    setDuration(0);
    setQueueIndex(index);
    setTrack(selected);
  }, [queue]);

  const playTrack = useCallback((nextTrack: PlaybackTrack, playlist?: PlaybackTrack[]) => {
    const audio = audioRef.current;
    if (track?.src === nextTrack.src && audio) {
      if (audio.paused) void audio.play().catch(() => setError(true));
      else audio.pause();
      return;
    }

    const nextQueue = playlist?.filter((item) => item.src) ?? [nextTrack];
    const selectedIndex = nextQueue.findIndex((item) => item.src === nextTrack.src);
    const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const selectedTrack = nextQueue[safeIndex] ?? nextTrack;
    setQueue(nextQueue.length ? nextQueue : [nextTrack]);
    setQueueIndex(safeIndex);
    setError(false);
    setCurrent(0);
    setDuration(0);
    shouldAutoplay.current = true;
    setTrack(selectedTrack);
  }, [track?.src]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) void audio.play().catch(() => setError(true));
    else audio.pause();
  }, [track]);

  const seek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  }, []);

  const moveQueue = (direction: -1 | 1) => {
    if (!queue.length) return;
    if (direction < 0 && current > 3) {
      seek(0);
      return;
    }
    let nextIndex = queueIndex + direction;
    if (shuffle && direction > 0 && queue.length > 1) {
      const candidates = queue.map((_, index) => index).filter((index) => index !== queueIndex);
      nextIndex = candidates[Math.floor(Math.random() * candidates.length)] ?? queueIndex;
    } else if (nextIndex < 0) {
      nextIndex = repeat === "all" ? queue.length - 1 : 0;
    } else if (nextIndex >= queue.length) {
      if (repeat !== "all") return;
      nextIndex = 0;
    }
    selectQueueTrack(nextIndex);
  };

  const onEnded = () => {
    if (repeat === "one") {
      seek(0);
      audioRef.current?.play().catch(() => setError(true));
      return;
    }
    if (queueIndex < queue.length - 1 || repeat === "all") moveQueue(1);
    else setPlaying(false);
  };

  const value: PlaybackContextValue = {
    track,
    playing,
    current,
    duration,
    volume: muted ? 0 : volume,
    error,
    playTrack,
    toggle,
    seek,
  };

  return (
    <PlaybackContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={track?.src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onError={() => setError(true)}
      />
      {track && playing && (
      <div role="region" aria-label="Now playing" className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-4xl rounded-lg border border-border bg-background/95 shadow-card backdrop-blur-xl">
        <div className="px-3 pb-2 pt-2 sm:px-5">
          <div className="flex min-h-11 items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:max-w-[16rem]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary text-primary">
                {track?.image ? <img src={track.image} alt="" className="h-full w-full object-cover" /> : <Music2 className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold sm:text-sm">{track?.title ?? "Choose a beat to play"}</p>
                <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{error ? "Preview unavailable" : track ? "Afrobeat Instrumental" : "Your music, always within reach"}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <Button type="button" variant="ghost" size="icon" className="hidden h-8 w-8 sm:inline-flex" aria-label="Shuffle" title="Shuffle" aria-pressed={shuffle} onClick={() => setShuffle((value) => !value)} disabled={!track}>
                <Shuffle className={shuffle ? "h-4 w-4 text-primary" : "h-4 w-4"} />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Previous beat" title="Previous beat" onClick={() => moveQueue(-1)} disabled={!track}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button type="button" variant="default" size="icon" className="h-9 w-9 rounded-full" aria-label={playing ? "Pause" : "Play"} title={playing ? "Pause" : "Play"} onClick={toggle} disabled={!track}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Next beat" title="Next beat" onClick={() => moveQueue(1)} disabled={!track || (queueIndex === queue.length - 1 && repeat !== "all" && !shuffle)}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="hidden h-8 w-8 sm:inline-flex" aria-label={`Repeat ${repeat}`} title={`Repeat ${repeat}`} aria-pressed={repeat !== "off"} onClick={() => setRepeat((mode) => mode === "off" ? "all" : mode === "all" ? "one" : "off")} disabled={!track}>
                {repeat === "one" ? <Repeat1 className="h-4 w-4 text-primary" /> : <Repeat className={repeat === "all" ? "h-4 w-4 text-primary" : "h-4 w-4"} />}
              </Button>
            </div>

            <div className="hidden min-w-0 flex-1 items-center gap-2 sm:flex">
              <span className="w-9 text-right text-[10px] tabular-nums text-muted-foreground">{formatTime(current)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(current, duration || 0)}
                disabled={!duration}
                onChange={(event) => seek(Number(event.target.value))}
                aria-label="Seek through beat"
                className="w-full accent-primary disabled:opacity-40"
              />
              <span className="w-9 text-[10px] tabular-nums text-muted-foreground">{formatTime(duration)}</span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="hidden h-8 w-8 sm:inline-flex" aria-label={muted ? "Unmute" : "Mute"} title={muted ? "Unmute" : "Mute"} onClick={() => setMuted((value) => !value)} disabled={!track}>
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(event) => { setMuted(false); setVolume(Number(event.target.value)); }}
                aria-label="Volume"
                className="hidden w-16 accent-primary sm:block"
              />
              {track && (
                <Button asChild type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Download beat" title="Download beat">
                  <a href={track.src} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2 sm:hidden">
            <span className="w-8 text-right text-[9px] tabular-nums text-muted-foreground">{formatTime(current)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(current, duration || 0)}
              disabled={!duration}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Seek through beat"
              className="w-full accent-primary disabled:opacity-40"
            />
            <span className="w-8 text-[9px] tabular-nums text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      )}
    </PlaybackContext.Provider>
  );
}