import { useEffect, useReducer } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import { fetchPublicPage, fetchPublicProjects } from '@/shared/api/public';
import { mapPublicProjectToFeatured } from '@/shared/api/mappers';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeState {
  sections: Record<string, { id: string; type: string; content: Record<string, unknown> }>;
  carouselProjects: any[];
  isProjectsLoaded: boolean;
}

type HomeAction = 
  | { type: 'SET_SECTIONS'; payload: Record<string, { id: string; type: string; content: Record<string, unknown> }> }
  | { type: 'SET_PROJECTS'; payload: any[] }
  | { type: 'FINISH_PROJECTS_LOAD' };

function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload };
    case 'SET_PROJECTS':
      return { ...state, carouselProjects: action.payload };
    case 'FINISH_PROJECTS_LOAD':
      return { ...state, isProjectsLoaded: true };
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
  });

  const { sections, carouselProjects, isProjectsLoaded } = state;

  useEffect(() => {
    let isActive = true;

    fetchPublicPage('home')
      .then((result) => {
        if (!isActive) return;
        const sectionMap = result.sections.reduce<Record<string, { id: string; type: string; content: Record<string, unknown> }>>(
          (acc, section) => {
            acc[section.type] = { id: section.id, type: section.type, content: section.content };
            return acc;
          },
          {},
        );
        dispatch({ type: 'SET_SECTIONS', payload: sectionMap });
      })
      .catch((error) => { console.error('Error loading home page:', error); });

    fetchPublicProjects()
      .then((result) => {
        if (!isActive) return;
        const orderedProjects = result.toSorted((a, b) => Number(b.featured) - Number(a.featured));
        dispatch({ type: 'SET_PROJECTS', payload: orderedProjects.map(mapPublicProjectToFeatured) });
      })
      .catch((error) => { console.error('Error loading projects:', error); })
      .finally(() => { if (isActive) dispatch({ type: 'FINISH_PROJECTS_LOAD' }); });

    return () => { isActive = false; };
  }, []);

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
      <div className="py-4 sm:py-8" />
    </>
  );
}