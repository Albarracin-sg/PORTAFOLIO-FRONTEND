import { useEffect, useMemo, useState } from 'react';
import { Music2, PauseCircle, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchNowPlaying, type SpotifyTrack } from '@/shared/api/public';
import musicDayImg from '@/assets/music/music-day.png';
import musicNightImg from '@/assets/music/music-nitgh.png';

const CACHE_KEY = 'spotify-playing-cache';

function getProgressPercentage(track: SpotifyTrack) {
  if (track.durationMs <= 0) return 0;
  return Math.min(100, Math.max(0, (track.progressMs / track.durationMs) * 100));
}

function loadFromCache(): SpotifyTrack | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    return entry?.data ?? null;
  } catch {
    return null;
  }
}

function saveToCache(track: SpotifyTrack) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: track, timestamp: Date.now() }),
    );
  } catch {
    // localStorage lleno o deshabilitado
  }
}

export function SpotifyNowPlayingCard() {
  const { t } = useTranslation();
  const [state, setState] = useState<{
    track: SpotifyTrack | null;
    error: boolean;
  }>(() => {
    const cached = loadFromCache();
    if (cached) return { track: cached, error: false };
    return { track: null, error: false };
  });

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    async function loadTrack() {
      try {
        const data = await fetchNowPlaying();
        if (!cancelled) {
          setState({ track: data, error: false });
          saveToCache(data);
        }
      } catch {
        if (!cancelled) {
          setState(prev => ({ ...prev, error: true }));
        }
      }
    }

    const startPolling = () => {
      if (intervalId) window.clearInterval(intervalId);
      intervalId = window.setInterval(() => {
        if (!document.hidden) {
          loadTrack();
        }
      }, 60_000);
    };

    const stopPolling = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    loadTrack();
    startPolling();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        loadTrack();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const { track, error } = state;
  const progress = useMemo(() => (track ? getProgressPercentage(track) : 0), [track]);

  const imageUrl = track?.albumImageUrl || 'https://placehold.co/96x96/7c3aed/ffffff?text=%E2%99%AA';

  if (error || !track || track.type === 'none') {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200/60 bg-white/40 px-3.5 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.05]">
          <Music2 className="size-3.5 text-zinc-400 dark:text-zinc-500" />
        </div>
        <span className="text-xs tracking-wide text-zinc-400 dark:text-zinc-500">
          {t('spotify.notListening')}
        </span>
      </div>
    );
  }

  const isPlaying = track.type === 'now_playing';
  const StatusIcon = isPlaying ? Radio : PauseCircle;

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block w-full overflow-hidden rounded-xl border border-zinc-200/60 bg-white/40 p-3.5 transition-all duration-300 hover:border-violet-300/50 hover:bg-white/60 sm:p-3 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:border-violet-400/20 dark:hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-3">
        {/* Album art */}
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-zinc-900/5 sm:size-10 dark:ring-white/[0.08]">
          <img
            src={imageUrl}
            alt={`Portada de ${track.album}`}
            loading="lazy"
            className="size-full object-cover"
          />
          {isPlaying && (
            <span className="absolute bottom-0.5 right-0.5 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-60 dark:bg-violet-500" />
              <span className="relative inline-flex size-2 rounded-full bg-violet-500 dark:bg-violet-400" />
            </span>
          )}
        </div>

        {/* Track info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <StatusIcon className="size-3 shrink-0 text-violet-500 dark:text-violet-400" />
            <p className="truncate text-sm font-medium leading-tight text-zinc-700 dark:text-zinc-200">
              {track.name}
            </p>
          </div>
          <p className="mt-0.5 truncate text-xs leading-tight text-zinc-400 dark:text-zinc-500">
            {track.artists}
          </p>
        </div>

        {/* Day-mode mobile flourish: hidden in dark mode and desktop. */}
        <img
          src={musicDayImg}
          alt=""
          aria-hidden="true"
          className="h-20 w-14 shrink-0 object-contain opacity-80 sm:hidden dark:hidden"
        />
        <img
          src={musicNightImg}
          alt=""
          aria-hidden="true"
          className="hidden h-20 w-14 shrink-0 object-contain opacity-80 dark:block sm:dark:hidden"
        />
      </div>

      {/* Progress bar — full width bottom edge */}
      <div className="mt-2.5 h-px overflow-hidden rounded-full bg-zinc-200/80 dark:bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-violet-400/70 transition-[width] duration-1000 ease-linear dark:bg-violet-500/60"
          style={{ width: `${progress}%` }}
        />
      </div>
    </a>
  );
}
