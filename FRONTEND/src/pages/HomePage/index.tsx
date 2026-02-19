import { useEffect, useState } from 'react';
import { useLanguage } from '@/features/language';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import { fetchPublicPage, fetchPublicProjects } from '@/shared/api/public';
import { mapPublicProjectToFeatured } from '@/shared/api/mappers';
import type { FeaturedProject } from '@/shared/types';

export function HomePage() {
  const { translations } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [sections, setSections] = useState<Record<string, Record<string, unknown>>>({});
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const [page, projects] = await Promise.all([
          fetchPublicPage('home'),
          fetchPublicProjects(),
        ]);
        if (!isActive) return;
        const sectionMap = page.sections.reduce<Record<string, Record<string, unknown>>>(
          (acc, section) => {
            acc[section.type] = section.content;
            return acc;
          },
        );
        setSections(sectionMap);

        const featured = projects.filter((project) => project.featured);
        setFeaturedProjects(featured.map(mapPublicProjectToFeatured));
      } catch {
        if (!isActive) return;
        setSections({});
        setFeaturedProjects([]);
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
        <Hero translations={translations} scrollY={scrollY} content={sections.HERO} />
      </section>
      <section id="about">
        <About translations={translations} content={sections.ABOUT} />
      </section>
      <section id="projects">
        <Projects translations={translations} projects={featuredProjects} content={sections.PROJECTS} />
      </section>
      <section id="contact">
        <Contact translations={translations} content={sections.CONTACT} />
      </section>
    </>
  );
}
