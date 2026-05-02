import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import { fetchPublicPage, fetchPublicProjects } from '@/shared/api/public';
import { mapPublicProjectToFeatured } from '@/shared/api/mappers';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Skeleton } from '@/components/ui/skeleton';

export function HomePage() {
  const location = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [sections, setSections] = useState<Record<string, { id: string; type: string; content: Record<string, unknown> }>>({});
  const [carouselProjects, setCarouselProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.key]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const [pageResult, projectsResult] = await Promise.allSettled([
          fetchPublicPage('home'),
          fetchPublicProjects(),
        ]);

        if (!isActive) return;

        if (pageResult.status === 'fulfilled') {
          const sectionMap = pageResult.value.sections.reduce<Record<string, { id: string; type: string; content: Record<string, unknown> }>>(
            (acc, section) => {
              acc[section.type] = { id: section.id, type: section.type, content: section.content };
              return acc;
            },
            {},
          );
          setSections(sectionMap);
        }

        if (projectsResult.status === 'fulfilled') {
          const orderedProjects = [...projectsResult.value].sort((a, b) => Number(b.featured) - Number(a.featured));
          setCarouselProjects(orderedProjects.map(mapPublicProjectToFeatured));
        }
      } catch (error) {
        console.error('Error loading home page:', error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <section id="home">
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <div className="space-y-6 text-center w-full max-w-3xl px-4">
              <Skeleton className="mx-auto h-16 w-3/4 rounded-2xl" />
              <Skeleton className="mx-auto h-24 w-full rounded-2xl" />
              <div className="flex justify-center gap-4 mt-8">
                <Skeleton className="h-12 w-40 rounded-xl" />
                <Skeleton className="h-12 w-40 rounded-xl" />
              </div>
            </div>
          </div>
        ) : (
          <Hero scrollY={scrollY} section={sections.HERO} />
        )}
      </section>
      <section id="about">
        {isLoading ? (
          <div className="mx-auto max-w-7xl px-4 py-24 space-y-10">
            <div className="space-y-4">
              <Skeleton className="h-10 w-48 rounded-lg" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        ) : (
          <About />
        )}
      </section>
      <section id="projects">
        {isLoading ? (
          <div className="mx-auto max-w-7xl px-4 py-24 relative">
            <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3 flex-1">
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
      <section id="contact">
        <Contact section={sections.CONTACT} />
      </section>
    </>
  );
}


