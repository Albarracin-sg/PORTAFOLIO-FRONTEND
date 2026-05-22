import { useEffect, useReducer } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import { fetchPublicPage, fetchPublicProjects } from '@/shared/api/public';
import { mapPublicProjectToFeatured } from '@/shared/api/mappers';
import { useLocalStorageSWR } from '@/shared/hooks/useLocalStorageSWR';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Skeleton } from '@/components/ui/skeleton';

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
  const scrollY = 0;
  const [state, dispatch] = useReducer(homeReducer, {
    sections: {},
    carouselProjects: [],
    isProjectsLoaded: false,
    sectionsLoaded: false,
  });

  const { sections, carouselProjects, isProjectsLoaded } = state;

  const { data: pageData } = useLocalStorageSWR('home-page-cache', () => fetchPublicPage('home'));
  const { data: projectsData, isLoading: projectsLoading } = useLocalStorageSWR(
    'public-projects-cache',
    fetchPublicProjects,
  );

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

  return (
    <>
      {/* ── Hero ── */}
      <section id="home">
        <Hero scrollY={scrollY} section={sections.HERO} />
      </section>

      {/* ── Separador Hero → About ── */}
      <div className="py-8 sm:py-16" />

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

      {/* ── Separador Projects → Contact (igual) ── */}
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
