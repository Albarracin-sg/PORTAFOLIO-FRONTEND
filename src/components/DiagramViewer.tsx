import { useMemo, useState, useCallback, type CSSProperties, type ReactNode } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from '@/features/theme';

type DiagramNode = { id: string; type?: string; position: { x: number; y: number }; data: { label: string; description?: string } };
type DiagramEdge = { id: string; source: string; target: string; animated?: boolean; label?: string };

interface DiagramViewerProps {
  title: Record<string, string>;
  description?: Record<string, string> | null;
  source: { nodes: DiagramNode[]; edges: DiagramEdge[] };
  locale?: string;
  className?: string;
}

interface NodeColorScheme {
  border: string;
  bg: string;
  glow: string;
  text: string;
  desc: string;
}

const NODE_COLORS_DARK: Record<string, NodeColorScheme> = {
  database:     { border: '#10b981', bg: 'rgba(16,185,129,0.08)', glow: 'rgba(16,185,129,0.25)', text: '#d1fae5', desc: '#6ee7b7' },
  service:      { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)', glow: 'rgba(59,130,246,0.25)', text: '#dbeafe', desc: '#93c5fd' },
  api:          { border: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', glow: 'rgba(139,92,246,0.25)', text: '#ede9fe', desc: '#c4b5fd' },
  client:       { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', glow: 'rgba(245,158,11,0.25)', text: '#fef3c7', desc: '#fcd34d' },
  queue:        { border: '#ec4899', bg: 'rgba(236,72,153,0.08)', glow: 'rgba(236,72,153,0.25)', text: '#fce7f3', desc: '#f9a8d4' },
  cache:        { border: '#f97316', bg: 'rgba(249,115,22,0.08)', glow: 'rgba(249,115,22,0.25)', text: '#ffedd5', desc: '#fdba74' },
  external:     { border: '#64748b', bg: 'rgba(100,116,139,0.08)', glow: 'rgba(100,116,139,0.25)', text: '#f1f5f9', desc: '#cbd5e1' },
  gateway:      { border: '#06b6d4', bg: 'rgba(6,182,212,0.08)', glow: 'rgba(6,182,212,0.25)', text: '#cffafe', desc: '#67e8f9' },
};

const NODE_COLORS_LIGHT: Record<string, NodeColorScheme> = {
  database:     { border: '#059669', bg: 'rgba(16,185,129,0.06)', glow: 'rgba(16,185,129,0.10)', text: '#064e3b', desc: '#047857' },
  service:      { border: '#2563eb', bg: 'rgba(59,130,246,0.06)', glow: 'rgba(59,130,246,0.10)', text: '#1e3a5f', desc: '#1d4ed8' },
  api:          { border: '#7c3aed', bg: 'rgba(139,92,246,0.06)', glow: 'rgba(139,92,246,0.10)', text: '#3b0764', desc: '#6d28d9' },
  client:       { border: '#d97706', bg: 'rgba(245,158,11,0.06)', glow: 'rgba(245,158,11,0.10)', text: '#78350f', desc: '#b45309' },
  queue:        { border: '#db2777', bg: 'rgba(236,72,153,0.06)', glow: 'rgba(236,72,153,0.10)', text: '#831843', desc: '#be185d' },
  cache:        { border: '#ea580c', bg: 'rgba(249,115,22,0.06)', glow: 'rgba(249,115,22,0.10)', text: '#7c2d12', desc: '#c2410c' },
  external:     { border: '#475569', bg: 'rgba(100,116,139,0.06)', glow: 'rgba(100,116,139,0.10)', text: '#1e293b', desc: '#475569' },
  gateway:      { border: '#0891b2', bg: 'rgba(6,182,212,0.06)', glow: 'rgba(6,182,212,0.10)', text: '#164e63', desc: '#0e7490' },
};

const DEFAULT_DARK: NodeColorScheme = { border: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', glow: 'rgba(139,92,246,0.25)', text: '#ede9fe', desc: '#c4b5fd' };
const DEFAULT_LIGHT: NodeColorScheme = { border: '#7c3aed', bg: 'rgba(139,92,246,0.06)', glow: 'rgba(139,92,246,0.10)', text: '#3b0764', desc: '#6d28d9' };

function detectColor(type?: string, isDark = true): NodeColorScheme {
  const key = (type ?? 'api').toLowerCase();
  const palette = isDark ? NODE_COLORS_DARK : NODE_COLORS_LIGHT;
  const fallback = isDark ? DEFAULT_DARK : DEFAULT_LIGHT;
  return palette[key] ?? fallback;
}

type DiagramNodeData = { label: string; description?: string; type?: string };

function DiagramNodeComponent({ data }: NodeProps) {
  const nodeData = data as DiagramNodeData;
  const { isDark } = useTheme();
  const c = detectColor(nodeData.type, isDark);
  return (
    <div
      className="rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all hover:scale-105 min-w-[120px] text-center"
      style={{
        borderColor: c.border,
        background: c.bg,
        boxShadow: isDark
          ? `0 0 20px ${c.glow}, inset 0 0 20px ${c.glow}`
          : `0 1px 3px ${c.glow}, 0 0 0 1px ${c.glow}`,
      } as CSSProperties}
    >
      <div
        className="text-sm font-semibold"
        style={{ color: c.text }}
      >
        {nodeData.label}
      </div>
      {nodeData.description && (
        <div
          className="mt-1 text-xs max-w-[200px]"
          style={{ color: c.desc }}
        >
          {nodeData.description as ReactNode}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { custom: DiagramNodeComponent };

export default function DiagramViewer({ title, description, source, locale = 'es', className }: DiagramViewerProps) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const resolvedTitle = title?.[locale] ?? title?.['es'] ?? title?.['en'] ?? '';
  const resolvedDesc = description?.[locale] ?? description?.['es'] ?? description?.['en'] ?? null;

  const bgColor = isDark ? '#050505' : '#fafafa';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';

  const nodes: Node[] = useMemo(
    () => (source?.nodes ?? []).map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position,
      data: { label: n.data?.label ?? 'Unknown', description: n.data?.description, type: n.type },
    })),
    [source],
  );

  const edges: Edge[] = useMemo(
    () => (source?.edges ?? []).map((e) => {
      const srcNode = source?.nodes?.find((n) => n.id === e.source);
      const srcColor = detectColor(srcNode?.type, isDark);
      const edgeColor = srcColor.border;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated ?? true,
        label: e.label,
        style: {
          stroke: edgeColor,
          strokeWidth: 2,
          opacity: 0.7,
        },
        labelStyle: {
          fill: isDark ? '#a1a1aa' : '#52525b',
          fontWeight: 600,
          fontSize: 11,
        },
        markerEnd: {
          type: 'arrowclosed' as const,
          color: edgeColor,
        },
      };
    }),
    [source, isDark],
  );

  const handleCopyDiagram = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(source, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some contexts
    }
  }, [source]);

  if (!source?.nodes?.length) return null;

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${className ?? ''}`}
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e4e4e7',
        background: isDark ? 'rgba(5,5,5,0.6)' : 'rgba(255,255,255,0.6)',
      }}
    >
      {(resolvedTitle || resolvedDesc) && (
        <div className="relative px-6 pt-5 pb-2">
          {resolvedTitle && (
            <h3
              className="text-lg font-semibold"
              style={{ color: isDark ? '#e4e4e7' : '#18181b' }}
            >
              {resolvedTitle}
            </h3>
          )}
          {resolvedDesc && (
            <p
              className="mt-1 text-sm"
              style={{ color: isDark ? '#71717a' : '#52525b' }}
            >
              {resolvedDesc}
            </p>
          )}

          <button
            onClick={handleCopyDiagram}
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e4e4e7',
              background: isDark ? 'rgba(24,24,27,0.8)' : 'rgba(255,255,255,0.9)',
              color: isDark ? '#a1a1aa' : '#52525b',
            }}
            title="Copy diagram as JSON"
          >
            {copied ? (
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      <div className="relative h-[400px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          style={{ background: bgColor }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.5}
            color={gridColor}
          />
          <Controls
            className="!rounded-xl !border !backdrop-blur-sm"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e4e4e7',
              background: isDark ? 'rgba(24,24,27,0.8)' : 'rgba(255,255,255,0.9)',
              color: isDark ? '#e4e4e7' : '#18181b',
            }}
          />
          <MiniMap
            nodeColor={(n) => {
              const c = detectColor((n.data as Record<string, unknown>)?.type as string | undefined, isDark);
              return c.border;
            }}
            maskColor={isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'}
            className="!rounded-xl !border"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e4e4e7',
              background: isDark ? undefined : '#ffffff',
            }}
          />
        </ReactFlow>

        {/* Legend overlay */}
        <div
          className="absolute bottom-3 left-3 z-10 rounded-lg border px-3 py-2 text-[10px] leading-relaxed backdrop-blur-sm"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            background: isDark ? 'rgba(5,5,5,0.7)' : 'rgba(255,255,255,0.8)',
            color: isDark ? '#a1a1aa' : '#52525b',
          }}
        >
          <div
            className="mb-1 font-semibold"
            style={{ color: isDark ? '#e4e4e7' : '#18181b' }}
          >
            Legend
          </div>
          {Object.entries(NODE_COLORS_DARK).map(([key, c]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: c.border, boxShadow: isDark ? `0 0 6px ${c.glow}` : 'none' }}
              />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
          ))}
        </div>

        {/* Interaction hint */}
        <div
          className="absolute bottom-3 right-3 z-10 rounded-lg border px-3 py-1.5 text-[10px] backdrop-blur-sm"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            background: isDark ? 'rgba(5,5,5,0.5)' : 'rgba(255,255,255,0.7)',
            color: isDark ? '#71717a' : '#a1a1aa',
          }}
        >
          Drag · Scroll · Zoom
        </div>
      </div>
    </div>
  );
}
