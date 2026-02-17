import { useEffect, useState } from 'react';
import { useLanguage } from '@/features/language';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';

export function HomePage() {
  const { translations } = useLanguage();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <section id="home">
        <Hero translations={translations} scrollY={scrollY} />
      </section>
      <section id="about">
        <About translations={translations} />
      </section>
      <section id="projects">
        <Projects translations={translations} />
      </section>
      <section id="contact">
        <Contact translations={translations} />
      </section>
    </>
  );
}
