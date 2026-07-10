import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type DiagramNode = { id: string; type?: string; position: { x: number; y: number }; data: { label: string; description?: string } };
type DiagramEdge = { id: string; source: string; target: string; animated?: boolean; label?: string };

interface DiagramViewerProps {
  title: Record<string, string>;
  description?: Record<string, string> | null;
  source: { nodes: DiagramNode[]; edges: DiagramEdge[] };
  locale?: string;
  className?: string;
}

function DiagramNodeComponent({ data }: { data: any }) {
  return (
    <div className="rounded-xl border border-violet-400/30 bg-white/90 dark:bg-zinc-900/90 px-4 py-3 shadow-lg backdrop-blur-sm transition-all hover:shadow-violet-500/20 hover:border-violet-400/50 min-w-[120px] text-center">
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{data.label}</div>
      {data.description && (
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px]">{data.description}</div>
      )}
    </div>
  );
}

const nodeTypes = { default: DiagramNodeComponent, custom: DiagramNodeComponent };

export default function DiagramViewer({ title, description, source, locale = 'es', className }: DiagramViewerProps) {
  const resolvedTitle = title?.[locale] ?? title?.['es'] ?? title?.['en'] ?? '';
  const resolvedDesc = description?.[locale] ?? description?.['es'] ?? description?.['en'] ?? null;

  const nodes: Node[] = useMemo(
    () => (source?.nodes ?? []).map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position,
      data: { label: n.data?.label ?? 'Unknown', description: n.data?.description },
    })),
    [source]
  );

  const edges: Edge[] = useMemo(
    () => (source?.edges ?? []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: e.animated ?? true,
      label: e.label,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      labelStyle: { fill: '#a78bfa', fontWeight: 600, fontSize: 11 },
      markerEnd: { type: 'arrowclosed', color: '#8b5cf6' } as any,
    })),
    [source]
  );

  if (!source?.nodes?.length) return null;

  return (
    <div className={`rounded-2xl border border-zinc-200 dark:border-white/[0.07] bg-white/80 dark:bg-white/[0.025] overflow-hidden ${className ?? ''}`}>
      {(resolvedTitle || resolvedDesc) && (
        <div className="px-6 pt-5 pb-2">
          {resolvedTitle && <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{resolvedTitle}</h3>}
          {resolvedDesc && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{resolvedDesc}</p>}
        </div>
      )}
      <div className="h-[400px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e4e4e7" />
          <Controls className="!rounded-xl !border !border-zinc-200 dark:!border-white/[0.1] !bg-white/80 dark:!bg-zinc-900/80 !backdrop-blur-sm" />
          <MiniMap
            nodeColor="#8b5cf6"
            maskColor="rgba(0, 0, 0, 0.1)"
            className="!rounded-xl !border !border-zinc-200 dark:!border-white/[0.1]"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
