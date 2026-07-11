import { apiRequest } from './http';

export type DiagramNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    inputs?: string[];
    outputs?: string[];
    metadata?: Record<string, string>;
  };
};

export type DiagramEdge = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  label?: string;
  data?: {
    flowType?: 'sync' | 'async' | 'error';
  };
};

export type Diagram = {
  id: string;
  title: Record<string, string>;
  description: Record<string, string> | null;
  type: string;
  source: { nodes: DiagramNode[]; edges: DiagramEdge[] };
  position: number;
  published: boolean;
};

export async function fetchDiagramsByProject(projectId: string): Promise<Diagram[]> {
  return apiRequest<Diagram[]>(`/public/projects/${projectId}/diagrams`);
}
