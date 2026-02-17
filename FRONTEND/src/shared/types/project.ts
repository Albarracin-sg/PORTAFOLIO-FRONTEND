/** Tipos para entidad Project (listado y detalle) */

export interface ProjectStats {
  stars: number;
  forks: number;
  views?: number;
}

export interface ProjectBase {
  id: string;
  name: string;
  title?: string; // alias para AllProjects
  description: string;
  technologies: string[];
  image: string;
  githubUrl?: string;
  github?: string;
  liveUrl?: string;
  liveDemo?: string;
  problem?: string;
  challenge?: string;
  solution?: string;
  featured?: boolean;
  stats?: ProjectStats;
  stars?: number;
  forks?: number;
  views?: number;
  date?: string;
  category?: string;
  status?: string;
  longDescription?: string;
}

/** Proyecto para Home/Projects (featured, modal) */
export interface FeaturedProject extends ProjectBase {
  problem: string;
  challenge: string;
  solution: string;
  githubUrl: string;
  liveUrl?: string;
  stats: ProjectStats;
  featured: true;
}

/** Proyecto para AllProjects (listado completo) */
export interface ListProject extends ProjectBase {
  title: string;
  longDescription?: string;
  category: string;
  status: string;
  github: string;
  liveDemo?: string;
  stars: number;
  forks: number;
  views: number;
  date: string;
  featured: boolean;
}
