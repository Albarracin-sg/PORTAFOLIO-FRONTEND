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
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTrack() {
      try {
        const data = await fetchNowPlaying();
        if (!cancelled) {
          setTrack(data);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrack();
    const intervalId = window.setInterval(loadTrack, 5_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const progress = useMemo(() => (track ? getProgressPercentage(track) : 0), [track]);

  if (loading) {
    return (
      <Card className="group mt-6 overflow-hidden border-violet-500/20 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-violet-500/10 dark:bg-slate-950/70">
        <CardContent className="flex items-center gap-3 p-3.5 sm:gap-4 sm:p-4">
          <div className="h-14 w-14 animate-pulse rounded-2xl bg-violet-100 dark:bg-violet-500/15" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-violet-100 dark:bg-violet-500/15" />
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !track || track.type === 'none') {
    return (
      <Card className="group mt-6 overflow-hidden border-violet-500/20 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-violet-500/10 dark:bg-slate-950/70">
        <CardContent className="flex items-center gap-3 p-3.5 sm:gap-4 sm:p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Music2 className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
              Spotify
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {t('spotify.notListening')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
      aria-label={`${t('common.open')} ${track.name} ${t('common.in')} Spotify`}
    >
      <Card className="group overflow-hidden border-violet-500/20 bg-white/85 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10 dark:bg-slate-950/75">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl sm:h-16 sm:w-16">
              <img
                src={imageUrl}
                alt={`Portada de ${track.album}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400 sm:text-[11px] sm:tracking-[0.25em]">
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{statusLabel}</span>
              </div>

              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {track.name}
                  </p>
                  <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                    {track.artists}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {track.album}
                  </p>
                </div>

                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-500" />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 sm:flex-nowrap">
              <span>{formatTime(track.progressMs)}</span>
              <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <Waves className="h-3.5 w-3.5" />
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
