import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import { fetchPublicPage, fetchPublicProjects } from '@/shared/api/public';
import { mapPublicProjectToFeatured } from '@/shared/api/mappers';

export function HomePage() {
  const location = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [sections, setSections] = useState<Record<string, { id: string; type: string; content: Record<string, unknown> }>>({});
  const [carouselProjects, setCarouselProjects] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.key]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const [page, projects] = await Promise.all([
          fetchPublicPage('home'),
          fetchPublicProjects(),
        ]);
        if (!isActive) return;
        const sectionMap = page.sections.reduce<Record<string, { id: string; type: string; content: Record<string, unknown> }>>(
          (acc, section) => {
            acc[section.type] = { id: section.id, type: section.type, content: section.content };
            return acc;
          },
          {},
        );
        setSections(sectionMap);
        if (import.meta.env.DEV) {
          console.debug('[HomePage] sections', sectionMap);
        }

        const orderedProjects = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
        setCarouselProjects(orderedProjects.map(mapPublicProjectToFeatured));
        if (import.meta.env.DEV) {
          console.debug('[HomePage] carouselProjects', orderedProjects);
        }
      } catch {
        if (!isActive) return;
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
        <Hero scrollY={scrollY} section={sections.HERO} />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="projects">
        <Projects projects={carouselProjects} section={sections.PROJECTS} />
      </section>
      <section id="contact">
        <Contact section={sections.CONTACT} />
      </section>
    </>
  );
}
