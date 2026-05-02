import { useEffect, useMemo, useState } from 'react';
import { useEditMode } from '@/features/admin/EditModeProvider';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { fetchPublicPage, fetchPublicProjects } from '@/shared/api/public';
import { mapPublicProjectToFeatured } from '@/shared/api/mappers';
import type { FeaturedProject } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Statistics from '@/components/Statistics';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PAGES = ['home', 'stats'] as const;

type PageSlug = (typeof PAGES)[number];

type SectionMap = Record<string, { id: string; type: string; content: Record<string, unknown> }>;

export function AdminLiveEditorPage() {
  const { t } = useTranslation();
  const { isEditMode, setEditMode } = useEditMode();
  const { token } = useAdminAuth();
  const [activePage, setActivePage] = useState<PageSlug>('home');
  const [sections, setSections] = useState<SectionMap>({});
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    setEditMode(true);
    return () => setEditMode(false);
  }, []);

  useEffect(() => {
    const handler = () => {
      setSavedModalOpen(true);
      window.setTimeout(() => setSavedModalOpen(false), 1200);
    };

    const errorHandler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setErrorModal(detail || 'Error guardando cambios');
    };

    window.addEventListener('admin-save-complete', handler);
    window.addEventListener('admin-save-error', errorHandler);
    return () => {
      window.removeEventListener('admin-save-complete', handler);
      window.removeEventListener('admin-save-error', errorHandler);
    };
  }, []);

  const load = async (active: boolean) => {
      setLoading(true);
      try {
        const [page, projects] = await Promise.all([
          fetchPublicPage(activePage),
          activePage === 'home' ? fetchPublicProjects() : Promise.resolve([]),
        ]);
        if (!active) return;
        const sectionMap = page.sections.reduce<SectionMap>((acc, section) => {
          acc[section.type] = { id: section.id, type: section.type, content: section.content };
          return acc;
        }, {});
        setSections(sectionMap);
        if (activePage === 'home') {
          const featured = (projects as any[]).filter((project) => project.featured);
          setFeaturedProjects(featured.map(mapPublicProjectToFeatured));
        }
      } finally {
        if (active) setLoading(false);
      }
  };

  useEffect(() => {
    let isActive = true;
    load(isActive);

    return () => {
      isActive = false;
    };
  }, [activePage]);

  const handleSaveNow = () => {
    window.dispatchEvent(new Event('admin-save'));
  };

  const handleUndo = () => {
    load(true);
  };

  const activeSection = useMemo(() => {
    if (activePage === 'stats') return sections.STATS;
    return sections;
  }, [activePage, sections]);

  if (!token) {
    return <div className="text-sm text-gray-500">Necesitas iniciar sesion para editar.</div>;
  }

  return (
    <div className="space-y-6">
      <Dialog open={savedModalOpen} onOpenChange={setSavedModalOpen}>
        <DialogContent overlayClassName="bg-slate-900/20 backdrop-blur-sm" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambios guardados</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
            Tu contenido se ha actualizado correctamente.
          </DialogDescription>
        </DialogContent>
      </Dialog>
      <Dialog open={!!errorModal} onOpenChange={() => setErrorModal(null)}>
        <DialogContent overlayClassName="bg-slate-900/20 backdrop-blur-sm" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Error al guardar</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
            {errorModal}
          </DialogDescription>
        </DialogContent>
      </Dialog>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100">Live Editor</h1>
          <p className="text-gray-600 dark:text-gray-400">Edita la pagina directamente. Los cambios se guardan automaticamente.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Pagina:</span>
          <select
            value={activePage}
            onChange={(event) => setActivePage(event.target.value as PageSlug)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {PAGES.map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSaveNow}
            className="h-9 rounded-md bg-violet-600 px-4 text-sm text-white hover:bg-violet-700"
          >
            Guardar ahora
          </button>
          <button
            type="button"
            onClick={handleUndo}
            className="h-9 rounded-md border border-gray-200 px-4 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Deshacer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Cargando...</div>
      ) : activePage === 'home' ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <section id="home">
            <Hero section={sections.HERO} />
          </section>
          <section id="about">
            <About section={sections.ABOUT} />
          </section>
          <section id="projects">
            <Projects projects={featuredProjects} section={sections.PROJECTS} />
          </section>
          <section id="contact">
            <Contact section={sections.CONTACT} />
          </section>
        </div>
      ) : (
        <Statistics section={sections.STATS} />
      )}
    </div>
  );
}
