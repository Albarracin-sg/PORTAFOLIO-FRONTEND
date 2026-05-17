import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Music2, PauseCircle, Radio, Waves } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card';
import { fetchNowPlaying, type SpotifyTrack } from '@/shared/api/public';

function formatTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getProgressPercentage(track: SpotifyTrack) {
  if (track.durationMs <= 0) return 0;
  return Math.min(100, Math.max(0, (track.progressMs / track.durationMs) * 100));
}

export function SpotifyNowPlayingCard() {
  const { t } = useTranslation();
  const [state, setState] = useState<{
    track: SpotifyTrack | null;
    error: boolean;
  }>({
    track: null,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    async function loadTrack() {
      try {
        const data = await fetchNowPlaying();
        if (!cancelled) {
          setState({ track: data, error: false });
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

  if (error || !track || track.type === 'none') {
    return (
      <Card className="group mt-6 overflow-hidden border-violet-500/20 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-violet-500/10 dark:bg-zinc-950/70">
        <CardContent className="flex items-center gap-3 p-3.5 sm:gap-4 sm:p-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Music2 className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
              Spotify
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
              {t('spotify.notListening')}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {t('spotify.comeBackLater')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusLabel = track.type === 'now_playing' ? t('spotify.nowPlaying') : t('spotify.lastPlayed');
  const statusIcon = track.type === 'now_playing' ? Radio : PauseCircle;
  const StatusIcon = statusIcon;
  const imageUrl = track.albumImageUrl || 'https://placehold.co/96x96/7c3aed/ffffff?text=%E2%99%AA';

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noreferrer"
      className="mt-6 block"
    >
      <Card className="group overflow-hidden border-violet-500/20 bg-white/85 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10 dark:bg-zinc-950/75">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl sm:size-16">
              <img
                src={imageUrl}
                alt={`Portada de ${track.album}`}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400 sm:text-[11px] sm:tracking-[0.25em]">
                <StatusIcon className="size-3.5" />
                <span>{statusLabel}</span>
              </div>

              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {track.name}
                  </p>
                  <p className="truncate text-sm text-zinc-600 dark:text-white">
                    {track.artists}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {track.album}
                  </p>
                </div>

                <ExternalLink className="mt-0.5 size-4 shrink-0 text-zinc-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-500" />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 sm:flex-nowrap">
              <span>{formatTime(track.progressMs)}</span>
              <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <Waves className="size-3.5" />
                {t('spotify.openInSpotify')}
              </span>
              <span>{track.durationMs > 0 ? formatTime(track.durationMs) : '--:--'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
