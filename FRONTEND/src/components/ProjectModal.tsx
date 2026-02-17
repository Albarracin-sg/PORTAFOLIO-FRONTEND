import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ExternalLink, Github, X } from "lucide-react";

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl text-gray-900 dark:text-gray-100">{project.name}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Image */}
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
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

          {/* Technologies */}
          <div>
            <h4 className="mb-3 text-gray-900 dark:text-gray-100">{translations.projects.technologies}</h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="secondary">{tech}</Badge>
              ))}
            </div>
          </div>

          {/* Problem */}
          <div>
            <h4 className="mb-3 text-violet-600 dark:text-violet-400 font-medium">{translations.projects.modal.problem}</h4>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.problem}</p>
          </div>

          {/* Challenge */}
          <div>
            <h4 className="mb-3 text-violet-600 dark:text-violet-400 font-medium">{translations.projects.modal.challenge}</h4>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.challenge}</p>
          </div>

          {/* Solution */}
          <div>
            <h4 className="mb-3 text-violet-600 dark:text-violet-400 font-medium">{translations.projects.modal.solution}</h4>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.solution}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
      </DialogContent>
    </Dialog>
  );
}