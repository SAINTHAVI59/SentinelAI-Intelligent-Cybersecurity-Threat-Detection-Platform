/**
 * SentinelAI - Interactive Network Relationship Graph
 * 
 * Visualizes topological entity relationships connecting:
 * - Attacker / Source IP
 * - Target Host / Subnet
 * - Probed Ports & Protocols
 * - Generated Alert Node
 * - Correlated Historical Events
 */

import React, { useState } from 'react';
import { ShieldAlert, Server, Globe, Hash, Zap, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';
import { SecurityAlert, SecurityEvent } from '../types';

interface RelationshipGraphProps {
  alert: SecurityAlert;
  relatedEvents?: SecurityEvent[];
  onSelectEvent?: (event: SecurityEvent) => void;
}

interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  type: 'attacker' | 'target' | 'port' | 'alert' | 'event';
  x: number;
  y: number;
  color: string;
  icon: React.ElementType;
  meta: Record<string, string | number>;
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  alert,
  relatedEvents = [],
  onSelectEvent
}) => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Layout node coordinates around center
  const width = 640;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;

  // Build graph nodes
  const nodes: NodeData[] = [
    // Center-left: Attacker IP
    {
      id: 'node-attacker',
      label: alert.sourceIp,
      sublabel: 'Adversary Source Host',
      type: 'attacker',
      x: centerX - 180,
      y: centerY,
      color: '#f43f5e', // rose-500
      icon: Globe,
      meta: {
        'Entity Type': 'External Originating Host',
        'IP Address': alert.sourceIp,
        'Risk Level': alert.severity,
        'Observed Target': alert.destIp
      }
    },
    // Center-right: Target Host
    {
      id: 'node-target',
      label: alert.destIp,
      sublabel: 'Target Internal Host',
      type: 'target',
      x: centerX + 180,
      y: centerY,
      color: '#06b6d4', // cyan-500
      icon: Server,
      meta: {
        'Entity Type': 'Internal Protected Asset',
        'Destination IP': alert.destIp,
        'Port Exposed': alert.destPort,
        'Subnet': alert.destIp.startsWith('10.') ? 'Enterprise Core (10.0.0.0/8)' : 'Corporate LAN'
      }
    },
    // Top-center: Alert Node
    {
      id: 'node-alert',
      label: alert.id,
      sublabel: alert.title,
      type: 'alert',
      x: centerX,
      y: centerY - 110,
      color: alert.severity === 'CRITICAL' ? '#e11d48' : '#f59e0b', // amber / rose
      icon: ShieldAlert,
      meta: {
        'Alert ID': alert.id,
        'MITRE ID': alert.mitreId,
        'Tactic': alert.mitreTactic,
        'Status': alert.status,
        'Severity': alert.severity
      }
    },
    // Bottom-center: Port & Protocol
    {
      id: 'node-port',
      label: `Port ${alert.destPort}`,
      sublabel: alert.protocol,
      type: 'port',
      x: centerX,
      y: centerY + 110,
      color: '#8b5cf6', // violet-500
      icon: Hash,
      meta: {
        'Port Number': alert.destPort,
        'Protocol': alert.protocol,
        'Service Mapping': alert.eventType
      }
    }
  ];

  // Additional nodes for up to 3 correlated events
  relatedEvents.slice(0, 3).forEach((evt, idx) => {
    const angle = (idx * 2 * Math.PI) / 3;
    const radius = 240;
    nodes.push({
      id: `node-evt-${evt.id}`,
      label: evt.id.slice(-8),
      sublabel: `${evt.protocol} ${evt.status}`,
      type: 'event',
      x: centerX + Math.cos(angle) * (radius * 0.9),
      y: centerY + Math.sin(angle) * (radius * 0.7),
      color: evt.status === 'FAILED_AUTH' || evt.status === 'DENY' ? '#fb7185' : '#38bdf8',
      icon: Zap,
      meta: {
        'Event ID': evt.id,
        'Timestamp': evt.timestamp,
        'Status': evt.status,
        'Anomaly Score': evt.anomalyScore
      }
    });
  });

  // Links connecting nodes
  const links = [
    { source: 'node-attacker', target: 'node-alert', label: 'Triggered By' },
    { source: 'node-attacker', target: 'node-port', label: `${alert.protocol} Ingress` },
    { source: 'node-port', target: 'node-target', label: 'Targets' },
    { source: 'node-alert', target: 'node-target', label: 'Affects' },
    ...relatedEvents.slice(0, 3).map(evt => ({
      source: 'node-attacker',
      target: `node-evt-${evt.id}`,
      label: 'Prior Event'
    }))
  ];

  return (
    <div className="relative bg-[#080d19] border border-slate-800 rounded-xl overflow-hidden">
      {/* Top toolbar */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Topological Incident Relationship Graph
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            (Interactive Entity Map)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
            aria-label="Zoom in on graph"
            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
            aria-label="Zoom out of graph"
            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setSelectedNode(null);
            }}
            aria-label="Reset graph zoom"
            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="overflow-hidden flex items-center justify-center p-4 min-h-[380px] bg-cyber-grid">
        <div 
          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
          className="relative origin-center"
        >
          <svg width={width} height={height} className="overflow-visible select-none">
            <defs>
              {/* Gradient defs */}
              <linearGradient id="link-grad-red" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="link-grad-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Links */}
            {links.map((link, idx) => {
              const srcNode = nodes.find(n => n.id === link.source);
              const tgtNode = nodes.find(n => n.id === link.target);
              if (!srcNode || !tgtNode) return null;

              const isHighlighted = selectedNode && (selectedNode.id === srcNode.id || selectedNode.id === tgtNode.id);

              return (
                <g key={`link-${idx}`}>
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={isHighlighted ? '#38bdf8' : '#334155'}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={link.source === 'node-attacker' ? '4,4' : undefined}
                    className={link.source === 'node-attacker' ? 'animate-pulse' : ''}
                  />
                  {/* Midpoint label */}
                  <text
                    x={(srcNode.x + tgtNode.x) / 2}
                    y={(srcNode.y + tgtNode.y) / 2 - 6}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="pointer-events-none bg-slate-900"
                  >
                    {link.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const Icon = node.icon;
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer pulse circle for attacker or alert */}
                  {(node.type === 'attacker' || node.type === 'alert') && (
                    <circle
                      r="32"
                      fill={node.color}
                      opacity="0.15"
                      className="animate-ping"
                    />
                  )}

                  {/* Node background circle */}
                  <circle
                    r={isSelected ? '28' : '24'}
                    fill="#0f172a"
                    stroke={node.color}
                    strokeWidth={isSelected ? '3' : '2'}
                    className="transition-all duration-200 group-hover:scale-110"
                    style={{ filter: `drop-shadow(0 0 8px ${node.color}66)` }}
                  />

                  {/* Node icon rendered inside foreignObject */}
                  <foreignObject x="-10" y="-10" width="20" height="20" className="pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-4 h-4" style={{ color: node.color }} />
                    </div>
                  </foreignObject>

                  {/* Primary Label */}
                  <text
                    y="38"
                    fill="#f1f5f9"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {node.label}
                  </text>

                  {/* Sublabel */}
                  <text
                    y="50"
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {node.sublabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode ? (
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: selectedNode.color }} 
            />
            <div>
              <span className="font-semibold text-white">{selectedNode.label}</span>
              <span className="text-slate-400 ml-2 font-mono text-[11px]">({selectedNode.sublabel})</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
            {Object.entries(selectedNode.meta).map(([key, val]) => (
              <div key={key}>
                <span className="text-slate-400">{key}:</span>{' '}
                <span className="text-cyan-300 font-semibold">{val}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
          >
            Close Details
          </button>
        </div>
      ) : (
        <div className="p-2.5 bg-slate-950/60 border-t border-slate-800/80 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          Click any entity node above to inspect its security attributes, risk factors, and network degree.
        </div>
      )}
    </div>
  );
};
