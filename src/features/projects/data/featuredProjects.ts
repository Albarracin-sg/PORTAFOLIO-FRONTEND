import type { FeaturedProject } from '@/shared/types';
import { allProjectsList } from './projectsList';

export function getFeaturedProjects(): FeaturedProject[] {
  const [p1, p3, p4] = allProjectsList;
  return [
    {
      id: p1.id,
      name: p1.title,
      description: p1.description,
      technologies: p1.technologies,
      image: p1.image,
      githubUrl: p1.github ?? '',
      liveUrl: p1.liveDemo,
      problem: p1.problem ?? '',
      challenge: p1.challenge ?? '',
      solution: p1.solution ?? '',
      featured: true,
      stats: { stars: p1.stars, forks: p1.forks },
    },
    {
      id: p3.id,
      name: p3.title,
      description: p3.description,
      technologies: p3.technologies,
      image: p3.image,
      githubUrl: p3.github ?? '',
      liveUrl: p3.liveDemo,
      problem: p3.problem ?? '',
      challenge: p3.challenge ?? '',
      solution: p3.solution ?? '',
      featured: true,
      stats: { stars: p3.stars, forks: p3.forks },
    },
    {
      id: p4.id,
      name: p4.title,
      description: p4.description,
      technologies: p4.technologies,
      image: p4.image,
      githubUrl: p4.github ?? '',
      liveUrl: p4.liveDemo,
      problem: p4.problem ?? '',
      challenge: p4.challenge ?? '',
      solution: p4.solution ?? '',
      featured: true,
      stats: { stars: p4.stars, forks: p4.forks },
    },
  ];
}
