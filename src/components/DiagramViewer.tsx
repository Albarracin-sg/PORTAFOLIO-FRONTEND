import { useState, useCallback, useMemo, type CSSProperties, type ReactNode } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useTheme } from '@/features/theme';
import { cn } from '@/components/ui/utils';

type DiagramNodeData = {
  label: string;
  description?: string;
  type?: string;
  inputs?: string[];
  outputs?: string[];
  metadata?: Record<string, string>;
};



const TYPE_META: Record<string, { icon: string; label: string }> = {
  database:  { icon: 'DB',   label: 'Database' },
  service:   { icon: 'SVC',  label: 'Service' },
  api:       { icon: 'API',  label: 'API' },
  client:    { icon: 'CLI',  label: 'Client' },
  queue:     { icon: 'Q',    label: 'Queue' },
  cache:     { icon: 'CACHE', label: 'Cache' },
  external:  { icon: 'EXT',  label: 'External' },
  gateway:   { icon: 'GW',   label: 'Gateway' },
};

interface NodeColorScheme {
  border: string;
  bg: string;
  glow: string;
  text: string;
  desc: string;
  badgeBg: string;
  badgeText: string;
  handle: string;
}

const NODE_COLORS_DARK: Record<string, NodeColorScheme> = {
  database:  { border: '#10b981', bg: 'rgba(16,185,129,0.07)',  glow: 'rgba(16,185,129,0.30)',  text: '#d1fae5', desc: '#6ee7b7', badgeBg: 'rgba(16,185,129,0.20)',  badgeText: '#6ee7b7', handle: '#10b981' },
  service:   { border: '#3b82f6', bg: 'rgba(59,130,246,0.07)',  glow: 'rgba(59,130,246,0.30)',  text: '#dbeafe', desc: '#93c5fd', badgeBg: 'rgba(59,130,246,0.20)',  badgeText: '#93c5fd', handle: '#3b82f6' },
  api:       { border: '#8b5cf6', bg: 'rgba(139,92,246,0.07)',  glow: 'rgba(139,92,246,0.30)',  text: '#ede9fe', desc: '#c4b5fd', badgeBg: 'rgba(139,92,246,0.20)',  badgeText: '#c4b5fd', handle: '#8b5cf6' },
  client:    { border: '#f59e0b', bg: 'rgba(245,158,11,0.07)',  glow: 'rgba(245,158,11,0.30)',  text: '#fef3c7', desc: '#fcd34d', badgeBg: 'rgba(245,158,11,0.20)',  badgeText: '#fcd34d', handle: '#f59e0b' },
  queue:     { border: '#ec4899', bg: 'rgba(236,72,153,0.07)',  glow: 'rgba(236,72,153,0.30)',  text: '#fce7f3', desc: '#f9a8d4', badgeBg: 'rgba(236,72,153,0.20)',  badgeText: '#f9a8d4', handle: '#ec4899' },
  cache:     { border: '#f97316', bg: 'rgba(249,115,22,0.07)',  glow: 'rgba(249,115,22,0.30)',  text: '#ffedd5', desc: '#fdba74', badgeBg: 'rgba(249,115,22,0.20)',  badgeText: '#fdba74', handle: '#f97316' },
  external:  { border: '#64748b', bg: 'rgba(100,116,139,0.07)', glow: 'rgba(100,116,139,0.30)', text: '#f1f5f9', desc: '#cbd5e1', badgeBg: 'rgba(100,116,139,0.20)', badgeText: '#cbd5e1', handle: '#64748b' },
  gateway:   { border: '#06b6d4', bg: 'rgba(6,182,212,0.07)',   glow: 'rgba(6,182,212,0.30)',   text: '#cffafe', desc: '#67e8f9', badgeBg: 'rgba(6,182,212,0.20)',   badgeText: '#67e8f9', handle: '#06b6d4' },
};

const NODE_COLORS_LIGHT: Record<string, NodeColorScheme> = {
  database:  { border: '#059669', bg: 'rgba(16,185,129,0.05)',  glow: 'rgba(16,185,129,0.12)',  text: '#064e3b', desc: '#047857', badgeBg: 'rgba(16,185,129,0.15)',  badgeText: '#047857', handle: '#059669' },
  service:   { border: '#2563eb', bg: 'rgba(59,130,246,0.05)',  glow: 'rgba(59,130,246,0.12)',  text: '#1e3a5f', desc: '#1d4ed8', badgeBg: 'rgba(59,130,246,0.15)',  badgeText: '#1d4ed8', handle: '#2563eb' },
  api:       { border: '#7c3aed', bg: 'rgba(139,92,246,0.05)',  glow: 'rgba(139,92,246,0.12)',  text: '#3b0764', desc: '#6d28d9', badgeBg: 'rgba(139,92,246,0.15)',  badgeText: '#6d28d9', handle: '#7c3aed' },
  client:    { border: '#d97706', bg: 'rgba(245,158,11,0.05)',  glow: 'rgba(245,158,11,0.12)',  text: '#78350f', desc: '#b45309', badgeBg: 'rgba(245,158,11,0.15)',  badgeText: '#b45309', handle: '#d97706' },
  queue:     { border: '#db2777', bg: 'rgba(236,72,153,0.05)',  glow: 'rgba(236,72,153,0.12)',  text: '#831843', desc: '#be185d', badgeBg: 'rgba(236,72,153,0.15)',  badgeText: '#be185d', handle: '#db2777' },
  cache:     { border: '#ea580c', bg: 'rgba(249,115,22,0.05)',  glow: 'rgba(249,115,22,0.12)',  text: '#7c2d12', desc: '#c2410c', badgeBg: 'rgba(249,115,22,0.15)',  badgeText: '#c2410c', handle: '#ea580c' },
  external:  { border: '#475569', bg: 'rgba(100,116,139,0.05)', glow: 'rgba(100,116,139,0.12)', text: '#1e293b', desc: '#475569', badgeBg: 'rgba(100,116,139,0.15)', badgeText: '#475569', handle: '#475569' },
  gateway:   { border: '#0891b2', bg: 'rgba(6,182,212,0.05)',   glow: 'rgba(6,182,212,0.12)',   text: '#164e63', desc: '#0e7490', badgeBg: 'rgba(6,182,212,0.15)',   badgeText: '#0e7490', handle: '#0891b2' },
};

const DEFAULT_DARK: NodeColorScheme = { border: '#8b5cf6', bg: 'rgba(139,92,246,0.07)', glow: 'rgba(139,92,246,0.30)', text: '#ede9fe', desc: '#c4b5fd', badgeBg: 'rgba(139,92,246,0.20)', badgeText: '#c4b5fd', handle: '#8b5cf6' };
const DEFAULT_LIGHT: NodeColorScheme = { border: '#7c3aed', bg: 'rgba(139,92,246,0.05)', glow: 'rgba(139,92,246,0.12)', text: '#3b0764', desc: '#6d28d9', badgeBg: 'rgba(139,92,246,0.15)', badgeText: '#6d28d9', handle: '#7c3aed' };

function detectColor(type?: string, isDark = true): NodeColorScheme {
  const key = (type ?? 'api').toLowerCase();
  const palette = isDark ? NODE_COLORS_DARK : NODE_COLORS_LIGHT;
  return palette[key] ?? (isDark ? DEFAULT_DARK : DEFAULT_LIGHT);
}



interface RawDiagramNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: { label: string; description?: string; inputs?: string[]; outputs?: string[]; metadata?: Record<string, string> };
}

interface RawDiagramEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  label?: string;
  data?: { flowType?: 'sync' | 'async' | 'error' };
}

function autoLayout(rawNodes: RawDiagramNode[], rawEdges: RawDiagramEdge[]): RawDiagramNode[] {
  if (!rawNodes.length) return rawNodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 120, marginx: 40, marginy: 40 });

  for (const n of rawNodes) {
    g.setNode(n.id, { width: 240, height: 100 });
  }
  for (const e of rawEdges) {
    g.setEdge(e.source, e.target);
  }

  dagre.layout(g);

  return rawNodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - 120, y: pos.y - 50 } };
  });
}

function DiagramNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as DiagramNodeData;
  const { isDark } = useTheme();
  const c = detectColor(nodeData.type, isDark);
  const meta = TYPE_META[nodeData.type?.toLowerCase() ?? ''] ?? { icon: '?', label: nodeData.type ?? 'Unknown' };

  return (
    <div
      className={cn(
        'relative rounded-xl border shadow-lg backdrop-blur-sm min-w-[220px] max-w-[280px] transition-all duration-200',
        selected && 'ring-2 ring-offset-2',
      )}
      style={{
        borderColor: c.border,
        background: c.bg,
        boxShadow: isDark
          ? `0 4px 24px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`
          : `0 4px 16px ${c.glow}, 0 1px 3px rgba(0,0,0,0.06)`,
        ...(selected ? { ringColor: c.border } : {}),
      } as CSSProperties}
    >
      {/* Type badge */}
      <div
        className="absolute -top-2.5 left-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
        style={{ background: c.badgeBg, color: c.badgeText }}
      >
        <span className="opacity-90">{meta.icon}</span>
        <span className="opacity-70">{meta.label}</span>
      </div>

      {/* Input handles */}
      {nodeData.inputs && nodeData.inputs.length > 0 && nodeData.inputs.map((input, i) => (
        <div key={`in-${i}`} className="absolute -left-[3px] flex flex-col items-start" style={{ top: `${28 + i * 20}px` }}>
          <Handle
            type="target"
            position={Position.Left}
            id={`input-${i}`}
            className="!size-[10px] !border-2 !rounded-full"
            style={{ background: c.handle, borderColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)', boxShadow: `0 0 6px ${c.glow}` }}
          />
          <span className="ml-3 mt-[-2px] text-[9px] font-medium whitespace-nowrap" style={{ color: c.desc }}>
            {input}
          </span>
        </div>
      ))}

      {/* Output handles */}
      {nodeData.outputs && nodeData.outputs.length > 0 && nodeData.outputs.map((output, i) => (
        <div key={`out-${i}`} className="absolute -right-[3px] flex flex-col items-end" style={{ top: `${28 + i * 20}px` }}>
          <Handle
            type="source"
            position={Position.Right}
            id={`output-${i}`}
            className="!size-[10px] !border-2 !rounded-full"
            style={{ background: c.handle, borderColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)', boxShadow: `0 0 6px ${c.glow}` }}
          />
          <span className="mr-3 mt-[-2px] text-[9px] font-medium whitespace-nowrap" style={{ color: c.desc }}>
            {output}
          </span>
        </div>
      ))}

      {/* Fallback handles when no inputs/outputs defined */}
      {(!nodeData.inputs || nodeData.inputs.length === 0) && (
        <Handle
          type="target"
          position={Position.Left}
          className="!size-[10px] !border-2 !rounded-full"
          style={{ background: c.handle, borderColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)', boxShadow: `0 0 6px ${c.glow}` }}
        />
      )}
      {(!nodeData.outputs || nodeData.outputs.length === 0) && (
        <Handle
          type="source"
          position={Position.Right}
          className="!size-[10px] !border-2 !rounded-full"
          style={{ background: c.handle, borderColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)', boxShadow: `0 0 6px ${c.glow}` }}
        />
      )}

      {/* Card content */}
      <div className="px-4 pt-4 pb-3">
        <div className="text-sm font-bold leading-tight" style={{ color: c.text }}>
          {nodeData.label}
        </div>
        {nodeData.description && (
          <div className="mt-1.5 text-xs leading-snug" style={{ color: c.desc }}>
            {nodeData.description as ReactNode}
          </div>
        )}
      </div>
    </div>
  );
}

const nodeTypes = { custom: DiagramNodeComponent };

interface DetailPanelProps {
  node: RawDiagramNode;
  edges: RawDiagramEdge[];
  allNodes: RawDiagramNode[];
  isDark: boolean;
  onClose: () => void;
}

function DetailPanel({ node, edges, allNodes, isDark, onClose }: DetailPanelProps) {
  const c = detectColor(node.type, isDark);
  const meta = TYPE_META[node.type?.toLowerCase() ?? ''] ?? { icon: '?', label: node.type ?? 'Unknown' };

  const incomingEdges = edges.filter((e) => e.target === node.id);
  const outgoingEdges = edges.filter((e) => e.source === node.id);

  return (
    <div
      className="absolute top-0 right-0 z-30 h-full w-[320px] border-l overflow-y-auto backdrop-blur-xl"
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        background: isDark ? 'rgba(10,10,10,0.92)' : 'rgba(255,255,255,0.95)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: c.badgeBg, color: c.badgeText }}
          >
            {meta.icon} {meta.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          style={{ color: isDark ? '#71717a' : '#52525b' }}
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Name + description */}
      <div className="px-5 pb-4">
        <h4 className="text-base font-bold" style={{ color: isDark ? '#e4e4e7' : '#18181b' }}>
          {node.data.label}
        </h4>
        {node.data.description && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color: isDark ? '#a1a1aa' : '#52525b' }}>
            {node.data.description}
          </p>
        )}
      </div>

      <div className="mx-5 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

      {/* Input connections */}
      {incomingEdges.length > 0 && (
        <div className="px-5 py-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: isDark ? '#52525b' : '#a1a1aa' }}>
            Inputs ({incomingEdges.length})
          </div>
          <div className="flex flex-col gap-1.5">
            {incomingEdges.map((e) => {
              const src = allNodes.find((n) => n.id === e.source);
              const srcC = detectColor(src?.type, isDark);
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderLeft: `3px solid ${srcC.border}`,
                  }}
                >
                  <span className="font-semibold" style={{ color: isDark ? '#d4d4d8' : '#27272a' }}>
                    {src?.data.label ?? e.source}
                  </span>
                  {e.label && (
                    <span className="ml-auto rounded-full px-1.5 py-0.5 text-[9px]" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: isDark ? '#71717a' : '#a1a1aa' }}>
                      {e.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Output connections */}
      {outgoingEdges.length > 0 && (
        <div className="px-5 pb-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: isDark ? '#52525b' : '#a1a1aa' }}>
            Outputs ({outgoingEdges.length})
          </div>
          <div className="flex flex-col gap-1.5">
            {outgoingEdges.map((e) => {
              const tgt = allNodes.find((n) => n.id === e.target);
              const tgtC = detectColor(tgt?.type, isDark);
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRight: `3px solid ${tgtC.border}`,
                  }}
                >
                  <span className="font-semibold" style={{ color: isDark ? '#d4d4d8' : '#27272a' }}>
                    {tgt?.data.label ?? e.target}
                  </span>
                  {e.label && (
                    <span className="ml-auto rounded-full px-1.5 py-0.5 text-[9px]" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: isDark ? '#71717a' : '#a1a1aa' }}>
                      {e.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metadata */}
      {node.data.metadata && Object.keys(node.data.metadata).length > 0 && (
        <>
          <div className="mx-5 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
          <div className="px-5 py-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: isDark ? '#52525b' : '#a1a1aa' }}>
              Metadata
            </div>
            <div className="flex flex-col gap-1">
              {Object.entries(node.data.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="font-medium" style={{ color: isDark ? '#a1a1aa' : '#52525b' }}>{k}</span>
                  <span style={{ color: isDark ? '#d4d4d8' : '#27272a' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LegendOverlay({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="absolute bottom-3 left-3 z-10 rounded-xl border px-3 py-2.5 text-[10px] leading-relaxed backdrop-blur-sm"
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        background: isDark ? 'rgba(5,5,5,0.75)' : 'rgba(255,255,255,0.85)',
        color: isDark ? '#a1a1aa' : '#52525b',
      }}
    >
      <div className="mb-1.5 font-bold uppercase tracking-wider text-[9px]" style={{ color: isDark ? '#e4e4e7' : '#18181b' }}>
        Node Types
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {Object.entries(NODE_COLORS_DARK).map(([key]) => {
          const c = detectColor(key, isDark);
          const m = TYPE_META[key] ?? { icon: '?', label: key };
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="inline-flex size-4 items-center justify-center rounded text-[8px] font-bold" style={{ background: c.badgeBg, color: c.badgeText }}>
                {m.icon}
              </span>
              <span>{m.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 border-t pt-1.5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
        <div className="mb-1 font-bold uppercase tracking-wider text-[9px]" style={{ color: isDark ? '#e4e4e7' : '#18181b' }}>
          Edge Types
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2 border-solid" style={{ borderColor: isDark ? '#71717a' : '#52525b' }} />
            <span>Synchronous</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: isDark ? '#71717a' : '#52525b' }} />
            <span>Asynchronous</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2 border-solid" style={{ borderColor: '#ef4444' }} />
            <span>Error</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DiagramViewerProps {
  title: Record<string, string>;
  description?: Record<string, string> | null;
  source: { nodes: RawDiagramNode[]; edges: RawDiagramEdge[] };
  locale?: string;
  className?: string;
}

function DiagramViewerInner({ source, isDark, onSelectNode, selectedId }: {
  source: { nodes: RawDiagramNode[]; edges: RawDiagramEdge[] };
  isDark: boolean;
  onSelectNode: (node: RawDiagramNode | null) => void;
  selectedId: string | null;
}) {
  const nodes: Node[] = useMemo(
    () => (source?.nodes ?? []).map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position,
      data: {
        label: n.data?.label ?? 'Unknown',
        description: n.data?.description,
        type: n.type,
        inputs: n.data?.inputs,
        outputs: n.data?.outputs,
        metadata: n.data?.metadata,
      },
      selected: n.id === selectedId,
    })),
    [source, selectedId],
  );

  const edges: Edge[] = useMemo(
    () => (source?.edges ?? []).map((e) => {
      const srcNode = source?.nodes?.find((n) => n.id === e.source);
      const srcColor = detectColor(srcNode?.type, isDark);
      const flowType = e.data?.flowType ?? 'sync';

      let strokeColor = srcColor.border;

      if (flowType === 'error') {
        strokeColor = '#ef4444';
      }

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        label: e.label,
        type: 'smoothstep',
        style: {
          stroke: strokeColor,
          strokeWidth: 2,
          strokeDasharray: flowType === 'async' ? '8 4' : undefined,
          opacity: 0.85,
        },
        labelStyle: {
          fill: isDark ? '#a1a1aa' : '#52525b',
          fontWeight: 600,
          fontSize: 10,
          fontFamily: 'inherit',
        },
        labelBgStyle: {
          fill: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.90)',
          stroke: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          strokeWidth: 1,
          rx: 6,
          ry: 6,
        },
        labelBgPadding: [6, 3] as [number, number],
        markerEnd: {
          type: 'arrowclosed' as const,
          color: strokeColor,
          width: 16,
          height: 16,
        },
      };
    }),
    [source, isDark],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const raw = source?.nodes?.find((n) => n.id === node.id);
    onSelectNode(raw ?? null);
  }, [source, onSelectNode]);

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      proOptions={{ hideAttribution: true }}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      style={{ background: isDark ? '#050505' : '#fafafa' }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={22}
        size={1.5}
        color={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
      />
      <Controls
        showInteractive={false}
        className="!rounded-xl !border backdrop-blur-sm"
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
        maskColor={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)'}
        className="!rounded-xl !border !backdrop-blur-sm"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e4e4e7',
          background: isDark ? 'rgba(10,10,10,0.8)' : '#ffffff',
          width: 140,
          height: 100,
        }}
        pannable={false}
        zoomable={false}
      />
    </ReactFlow>
  );
}

export default function DiagramViewer({ title, description, source, locale = 'es', className }: DiagramViewerProps) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RawDiagramNode | null>(null);
  const [layoutKey, setLayoutKey] = useState(0);

  const resolvedTitle = title?.[locale] ?? title?.['es'] ?? title?.['en'] ?? '';
  const resolvedDesc = description?.[locale] ?? description?.['es'] ?? description?.['en'] ?? null;

  const laidOutSource = useMemo(() => {
    return {
      nodes: autoLayout(source?.nodes ?? [], source?.edges ?? []),
      edges: source?.edges ?? [],
    };
  }, [source, layoutKey]);

  const handleCopyDiagram = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(source, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail
    }
  }, [source]);

  const handleRelayout = useCallback(() => {
    setLayoutKey((k) => k + 1);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (!source?.nodes?.length) return null;

  return (
    <div
      className={cn(
        'relative rounded-2xl border overflow-hidden',
        className,
      )}
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e4e4e7',
        background: isDark ? 'rgba(5,5,5,0.6)' : 'rgba(255,255,255,0.6)',
      }}
    >
      {/* Header bar */}
      {(resolvedTitle || resolvedDesc) && (
        <div className="relative px-6 pt-5 pb-2">
          {resolvedTitle && (
            <h3 className="text-lg font-semibold" style={{ color: isDark ? '#e4e4e7' : '#18181b' }}>
              {resolvedTitle}
            </h3>
          )}
          {resolvedDesc && (
            <p className="mt-1 text-sm" style={{ color: isDark ? '#71717a' : '#52525b' }}>
              {resolvedDesc}
            </p>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            {/* Relayout button */}
            <button
              onClick={handleRelayout}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e4e4e7',
                background: isDark ? 'rgba(24,24,27,0.8)' : 'rgba(255,255,255,0.9)',
                color: isDark ? '#a1a1aa' : '#52525b',
              }}
              title="Re-layout diagram"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Layout
            </button>
            {/* Copy button */}
            <button
              onClick={handleCopyDiagram}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
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
        </div>
      )}

      {/* Canvas area */}
      <div className="relative h-[480px] w-full">
        <ReactFlowProvider>
          <DiagramViewerInner
            source={laidOutSource}
            isDark={isDark}
            onSelectNode={setSelectedNode}
            selectedId={selectedNode?.id ?? null}
          />
        </ReactFlowProvider>

        {/* Legend */}
        <LegendOverlay isDark={isDark} />

        {/* Detail panel */}
        {selectedNode && (
          <DetailPanel
            node={selectedNode}
            edges={source.edges}
            allNodes={source.nodes}
            isDark={isDark}
            onClose={handleCloseDetail}
          />
        )}

        {/* Interaction hint */}
        <div
          className="absolute bottom-3 right-3 z-10 rounded-lg border px-3 py-1.5 text-[10px] backdrop-blur-sm"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            background: isDark ? 'rgba(5,5,5,0.5)' : 'rgba(255,255,255,0.7)',
            color: isDark ? '#71717a' : '#a1a1aa',
          }}
        >
          Click node for details · Drag · Scroll · Zoom
        </div>
      </div>
    </div>
  );
}
