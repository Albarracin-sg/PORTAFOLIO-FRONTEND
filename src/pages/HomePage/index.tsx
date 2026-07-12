import { useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FolderGit2, GitBranch, Star, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/features/theme';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import { BlogPreview } from '@/components/BlogPreview';
import { SpotifyNowPlayingCard } from '@/components/SpotifyNowPlayingCard';
import { fetchGithubStats, fetchPublicPage, fetchPublicProjects } from '@/shared/api/public';
import { mapPublicProjectToFeatured } from '@/shared/api/mappers';
import { useLocalStorageSWR } from '@/shared/hooks/useLocalStorageSWR';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { usePageSeo } from '@/shared/seo/usePageSeo';
import { usePrerenderReady } from '@/shared/seo/usePrerenderReady';

import { catImages } from '@/assets/stack/cats';

interface HomeState {
  sections: Record<string, { id: string; type: string; content: Record<string, unknown> }>;
  carouselProjects: any[];
  isProjectsLoaded: boolean;
  sectionsLoaded: boolean;
}

type HomeAction =
  | { type: 'SET_SECTIONS'; payload: Record<string, { id: string; type: string; content: Record<string, unknown> }> }
  | { type: 'SET_PROJECTS'; payload: any[] }
  | { type: 'FINISH_PROJECTS_LOAD' }
  | { type: 'FINISH_SECTIONS_LOAD' };

function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload };
    case 'SET_PROJECTS':
      return { ...state, carouselProjects: action.payload };
    case 'FINISH_PROJECTS_LOAD':
      return { ...state, isProjectsLoaded: true };
    case 'FINISH_SECTIONS_LOAD':
      return { ...state, sectionsLoaded: true };
    default:
      return state;
  }
}

export function HomePage() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const scrollY = 0;
  const [state, dispatch] = useReducer(homeReducer, {
    sections: {},
    carouselProjects: [],
    isProjectsLoaded: false,
    sectionsLoaded: false,
  });

  const { sections, carouselProjects, isProjectsLoaded } = state;

  const { data: pageData, isLoading: pageLoading } = useLocalStorageSWR('home-page-cache', () => fetchPublicPage('home'));
  const { data: projectsData, isLoading: projectsLoading } = useLocalStorageSWR(
    'public-projects-cache',
    fetchPublicProjects,
  );
  const { data: githubStats, isLoading: statsLoading } = useLocalStorageSWR(
    'github-stats-cache',
    fetchGithubStats,
  );

  const previewStats = githubStats
    ? [
        { label: t('stats.totalRepos'), value: githubStats.totalRepos, icon: FolderGit2 },
        { label: t('stats.totalStars'), value: githubStats.stars, icon: Star },
        { label: t('stats.totalForks'), value: githubStats.forks, icon: GitBranch },
        { label: t('stats.followers'), value: githubStats.followers, icon: Users },
      ]
    : [];

  // Sync page sections
  useEffect(() => {
    if (!pageData) return;
    const sectionMap = pageData.sections.reduce<Record<string, { id: string; type: string; content: Record<string, unknown> }>>(
      (acc, section) => {
        acc[section.type] = { id: section.id, type: section.type, content: section.content };
        return acc;
      },
      {},
    );
    dispatch({ type: 'SET_SECTIONS', payload: sectionMap });
    dispatch({ type: 'FINISH_SECTIONS_LOAD' });
  }, [pageData]);

  useEffect(() => {
    if (!pageData && !pageLoading && !state.sectionsLoaded) {
      dispatch({ type: 'FINISH_SECTIONS_LOAD' });
    }
  }, [pageData, pageLoading, state.sectionsLoaded]);

  // Sync projects
  useEffect(() => {
    if (!projectsData) return;
    const ordered = projectsData.toSorted((a, b) => Number(b.featured) - Number(a.featured));
    dispatch({ type: 'SET_PROJECTS', payload: ordered.map(mapPublicProjectToFeatured) });
    dispatch({ type: 'FINISH_PROJECTS_LOAD' });
  }, [projectsData]);

  // Si falló fetch + no cache, cerrar loading igual
  useEffect(() => {
    if (!projectsData && !projectsLoading && !isProjectsLoaded) {
      dispatch({ type: 'FINISH_PROJECTS_LOAD' });
    }
  }, [projectsData, projectsLoading, isProjectsLoaded]);

  usePageSeo({
    title: 'Juan Camilo Albarracin | Portafolio Full Stack Backend e IA',
    description:
      'Portafolio de Juan Camilo Albarracin, Full-Stack Engineer con foco en backend, microservicios, NestJS, arquitectura distribuida e integracion de IA y MCP en Bogota, Colombia.',
    path: '/',
    keywords: [
      'juan camilo albarracin',
      'juan camilo albarracín',
      'albarracin portafolio',
      'portafolio backend',
      'backend engineer colombia',
      'nest js developer',
      'microservicios colombia',
    ],
  });

  usePrerenderReady(state.sectionsLoaded && isProjectsLoaded, 250);

  return (
    <>
      {/* ── Hero ── */}
      <section id="home">
        <Hero scrollY={scrollY} section={sections.HERO} />
      </section>

      {/* ── Spotify — mobile only ── */}
      <section className="sm:hidden px-4 pt-6 pb-12">
        <div className="mx-auto max-w-sm">
          <SpotifyNowPlayingCard />
        </div>
      </section>

      {/* ── About ── */}
      <section id="about">
        <About />
      </section>

      {/* ── Separador About → Projects ── */}
      <div className="py-8 sm:py-16" />

      {/* ── Projects ── */}
      <section id="projects">
        {!isProjectsLoaded ? (
          <div className="mx-auto max-w-7xl px-4 py-24 relative">
            <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="gap-y-3 flex-1">
                <Skeleton className="h-12 w-64 rounded-lg" />
                <Skeleton className="h-6 w-full max-w-2xl rounded-lg" />
              </div>
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
            <div className="relative">
              <LoadingScreen variant="inline" className="absolute inset-0 z-10 bg-background/20 backdrop-blur-[1px] border-none" />
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 opacity-20">
                <Skeleton className="aspect-video w-full rounded-3xl" />
                <Skeleton className="aspect-video w-full rounded-3xl" />
                <Skeleton className="aspect-video w-full rounded-3xl" />
              </div>
            </div>
          </div>
        ) : (
          <Projects projects={carouselProjects} section={sections.PROJECTS} />
        )}
      </section>

      {/* ── Separador Projects → Statistics ── */}
      <div className="py-8 sm:py-16" />

      <section id="stats" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl text-center lg:text-left">
              <h2 className="mb-4 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                {t('stats.preview.title')}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
                {t('stats.preview.description')}
              </p>
            </div>
            <Link
              to="/stats"
              className="inline-flex self-center items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 lg:self-auto"
            >
              {t('stats.preview.action')} <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {statsLoading && !githubStats
              ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-2xl" />)
              : previewStats.map(({ label, value, icon: Icon }, index) => (
                <Card key={label} className="group relative cursor-pointer overflow-hidden rounded-2xl border-zinc-200/80 bg-white/85 shadow-lg shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/70 hover:shadow-xl active:scale-[1.03] active:shadow-xl dark:border-white/10 dark:bg-zinc-950/75 dark:shadow-black/20 dark:hover:border-violet-400/30">
                  <CardContent className="relative p-5 sm:p-6">
                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/70 to-transparent" />
                    <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">{value}</p>
                    <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">{label}</p>
                    <img
                      src={isDark ? catImages[index].night : catImages[index].day}
                      alt=""
                      aria-hidden="true"
                      className={`pointer-events-none absolute bottom-0 right-0 opacity-80 transition-opacity group-hover:opacity-100 ${index === 3 ? 'size-24 sm:size-32' : 'size-20 sm:size-24'}`}
                    />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* ── Separador Statistics → Blog ── */}
      <div className="py-8 sm:py-16" />

      {/* ── Blog Preview ── */}
      <section id="blog">
        <BlogPreview />
      </section>

      {/* ── Separador Blog → Contact ── */}
      <div className="py-8 sm:py-16" />

      {/* ── Contact ── */}
      <section id="contact">
        <Contact section={sections.CONTACT} />
      </section>

      {/* ── Espacio antes del footer ── */}
      <div className="py-8 sm:py-16" />
    </>
  );
}
