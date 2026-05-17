import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ExternalLink, Github } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Markdown } from "./ui/markdown";

interface Project {
  id: string;
  name: string;
  technologies: string[];
  description: string;
  problem: string;
  challenge: string;
  solution: string;
  githubUrl: string;
  liveUrl?: string;
  image: string;
}

interface ProjectModalProps {
  project: Project | null;
  isOpen?: boolean;
  onClose: () => void;
}

export default function ProjectModal({
  project,
  isOpen,
  onClose,
}: ProjectModalProps) {
  const { t, i18n } = useTranslation();
  if (!project) return null;

  const currentLang = i18n.language;
  const getLocalized = (val: any) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val !== null) {
      return val[currentLang] || val['es'] || '';
    }
    return '';
  };

  const dialogOpen = isOpen !== undefined ? isOpen : !!project;

  const technologies = project.technologies ?? [];
  const problem = getLocalized(project.problem);
  const challenge = getLocalized(project.challenge);
  const solution = getLocalized(project.solution);
  
  const hasProblem = Boolean(problem.trim());
  const hasChallenge = Boolean(challenge.trim());
  const hasSolution = Boolean(solution.trim());

  return (
    <Dialog open={dialogOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <DialogTitle className="text-2xl text-zinc-900 dark:text-white pr-8">
            {project.name}
          </DialogTitle>
        </DialogHeader>

        {/* Horizontal en PC: imagen a la izquierda, texto a la derecha */}
        <div className="flex flex-col md:flex-row md:min-h-[320px]">
          {/* Imagen */}
          <div className="w-full md:w-2/5 md:min-w-[280px] shrink-0">
            <div className="aspect-video md:aspect-auto md:min-h-[280px] bg-zinc-100 dark:bg-zinc-800 rounded-b-lg md:rounded-b-none md:rounded-r-lg overflow-hidden">
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <div className="text-zinc-500 dark:text-zinc-400">
                      {t('projects.modal.preview')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenido: tecnologías, problema, reto, solución, botones */}
          <div className="flex-1 overflow-y-auto px-6 py-4 md:max-h-[60vh] gap-y-4">
            {/* Technologies */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">
                {t('projects.technologies')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {technologies.length > 0 ? (
                  technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {t('projects.modal.noTags')}
                  </span>
                )}
              </div>
            </div>

            {/* Problem */}
            {hasProblem && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                  {t('projects.modal.problem')}
                </h4>
                <Markdown className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {problem}
                </Markdown>
              </div>
            )}

            {/* Challenge */}
            {hasChallenge && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                  {t('projects.modal.challenge')}
                </h4>
                <Markdown className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {challenge}
                </Markdown>
              </div>
            )}

            {/* Solution */}
            {hasSolution && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                  {t('projects.modal.solution')}
                </h4>
                <Markdown className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {solution}
                </Markdown>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <Button className="gap-2" asChild>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" />
                  {t('projects.modal.viewGithub')}
                </a>
              </Button>
              {project.liveUrl && (
                <Button variant="outline" className="gap-2" asChild>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    {t('projects.modal.viewLive')}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
