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
      {isLoading && <LoadingScreen />}
      <section id="home">
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <div className="space-y-4 text-center">
              <Skeleton className="mx-auto h-12 w-64" />
              <Skeleton className="mx-auto h-24 w-[80%]" />
            </div>
          </div>
        ) : (
          <Hero scrollY={scrollY} section={sections.HERO} />
        )}
      </section>
      <section id="about">
        {isLoading ? (
          <div className="mx-auto max-w-7xl px-4 py-24 space-y-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <About />
        )}
      </section>
      <section id="projects">
        {isLoading ? (
          <div className="mx-auto max-w-7xl px-4 py-24">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="aspect-video w-full rounded-xl" />
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


