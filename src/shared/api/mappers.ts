import type { FeaturedProject, ListProject } from '@/shared/types';
import type { PublicProject } from './public';

export function mapPublicProjectToList(project: PublicProject): ListProject {
  const technologies = project.technologies.map((item) => item.technology.name);

  return {
    id: project.id,
    title: project.title,
    name: project.title,
    description: project.description,
    longDescription: project.description.es || '',
    image: project.imageUrl,
    technologies,
    category: project.category,
    github: project.githubUrl,
    githubUrl: project.githubUrl,
    liveDemo: project.liveUrl ?? undefined,
    liveUrl: project.liveUrl ?? undefined,
    status: project.status,
    stars: project.stars,
    forks: project.forks,
    views: project.views,
    date: project.date,
    featured: project.featured,
    problem: project.problem,
    challenge: project.challenge,
    solution: project.solution,
  };
}

export function mapPublicProjectToFeatured(project: PublicProject): FeaturedProject {
  const technologies = project.technologies.map((item) => item.technology.name);

  return {
    id: project.id,
    name: project.title,
    description: project.description,
    technologies,
    image: project.imageUrl,
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl ?? undefined,
    problem: project.problem,
    challenge: project.challenge,
    solution: project.solution,
    featured: true,
    stats: { stars: project.stars, forks: project.forks },
  };
}
