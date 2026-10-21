/**
 * SentinelAI - Collapsible Sidebar Navigation
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  Cpu, 
  Search, 
  GitBranch, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Sliders, 
  X,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SecurityAlert } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  alerts: SecurityAlert[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isOpen,
  setIsOpen,
  alerts
}) => {
  const openAlertsCount = alerts.filter(a => a.status === 'OPEN').length;

  const NAV_ITEMS = [
    {
      id: 'overview',
      label: 'Security Overview',
      icon: LayoutDashboard,
      badge: null,
      description: 'Threat posture & SOC KPIs'
    },
    {
      id: 'monitor',
      label: 'Live Threat Monitor',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-700/60',
      description: 'Real-time telemetry stream'
    },
    {
      id: 'detection',
      label: 'Detection Engine',
      icon: Cpu,
      badge: null,
      description: 'MITRE rules & anomaly scoring'
    },
    {
      id: 'investigation',
      label: 'Incident Investigation',
      icon: Search,
      badge: openAlertsCount > 0 ? `${openAlertsCount}` : null,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      description: 'Deep triage & relationship graph'
    },
    {
      id: 'workflow',
      label: 'Pipeline Visualisation',
      icon: GitBranch,
      badge: '7 STAGES',
      badgeColor: 'bg-violet-950 text-violet-300 border-violet-800',
      description: 'End-to-end event flow'
    },
    {
      id: 'glossary',
      label: 'Security Glossary',
      icon: BookOpen,
      badge: null,
      description: 'Plain-English cybersecurity terms'
    },
    {
      id: 'reports',
      label: 'Reports & Compliance',
      icon: FileText,
      badge: 'EXPORT',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      description: 'CSV, JSON & printable dossier'
    },
    {
      id: 'tests',
      label: 'System Tests & Health',
      icon: CheckSquare,
      badge: 'QA',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      description: 'Client-side verification runner'
    },
    {
      id: 'settings',
      label: 'Settings & Scenarios',
      icon: Sliders,
      badge: null,
      description: 'Demo scenarios & reset data'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#090d18] border-r border-slate-800/80 
        flex flex-col transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close bar */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80 lg:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white tracking-wide">SentinelAI SOC</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation sidebar"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section title */}
        <div className="px-4 pt-5 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-300">
          SOC Operations Center
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group text-left ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-950/80 to-indigo-950/40 text-cyan-300 border border-cyan-800/60 shadow-sm shadow-cyan-900/20' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <div>
                    <div className={isActive ? 'font-semibold text-white' : ''}>{item.label}</div>
                    <div className="text-[10px] text-slate-300 line-clamp-1">{item.description}</div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom SOC Status Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 m-2 rounded-xl border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Core SOC Engine
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
            <div>MITRE ATT&CK: <span className="text-slate-300 font-bold">v14.1</span></div>
            <div>Rules Active: <span className="text-slate-300 font-bold">5 Deterministic</span></div>
            <div>Scoring Model: <span className="text-slate-300 font-bold">Multi-Heuristic</span></div>
          </div>
        </div>

      </aside>
    </>
  );
};
