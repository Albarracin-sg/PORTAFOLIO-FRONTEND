import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ExternalLink, Github } from "lucide-react";

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
  translations: any;
}

export default function ProjectModal({ project, isOpen, onClose, translations }: ProjectModalProps) {
  if (!project) return null;

  const dialogOpen = isOpen !== undefined ? isOpen : !!project;

  return (
    <Dialog open={dialogOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-2xl text-gray-900 dark:text-gray-100 pr-8">
            {project.name}
          </DialogTitle>
        </DialogHeader>

        {/* Horizontal en PC: imagen a la izquierda, texto a la derecha */}
        <div className="flex flex-col md:flex-row md:min-h-[320px]">
          {/* Imagen */}
          <div className="w-full md:w-2/5 md:min-w-[280px] shrink-0">
            <div className="aspect-video md:aspect-auto md:min-h-[280px] bg-gray-100 dark:bg-gray-800 rounded-b-lg md:rounded-b-none md:rounded-r-lg overflow-hidden">
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-500 dark:text-gray-400">Project Preview</div>
                </div>
              )}
            </div>
          </div>

          {/* Contenido: tecnologías, problema, reto, solución, botones */}
          <div className="flex-1 overflow-y-auto px-6 py-4 md:max-h-[60vh] space-y-4">
            {/* Technologies */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                {translations.projects.technologies}
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </div>

            {/* Problem */}
            <div>
              <h4 className="mb-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                {translations.projects.modal.problem}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {project.problem}
              </p>
            </div>

            {/* Challenge */}
            <div>
              <h4 className="mb-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                {translations.projects.modal.challenge}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {project.challenge}
              </p>
            </div>

            {/* Solution */}
            <div>
              <h4 className="mb-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                {translations.projects.modal.solution}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {project.solution}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button className="gap-2" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  {translations.projects.modal.viewGithub}
                </a>
              </Button>
              {project.liveUrl && (
                <Button variant="outline" className="gap-2" asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    {translations.projects.modal.viewLive}
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
