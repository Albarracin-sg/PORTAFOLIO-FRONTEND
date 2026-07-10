import { apiRequest } from './http';

export type DiagramNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: { label: string; description?: string };
};

export type DiagramEdge = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  label?: string;
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
