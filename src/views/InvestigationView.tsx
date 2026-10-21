/**
 * SentinelAI - Incident Investigation View
 * 
 * Deep-dive triage console featuring event timeline, evidence metrics,
 * topological relationship graph, analyst notes, and status transitions.
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Clock, 
  Globe, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  Send, 
  CheckSquare, 
  Square, 
  ArrowLeft,
  Activity,
  Layers,
  ChevronRight,
  Filter,
  BookOpen
} from 'lucide-react';
import { SecurityAlert, SecurityEvent, IncidentStatus, Severity } from '../types';
import { RelationshipGraph } from '../components/RelationshipGraph';

interface InvestigationViewProps {
  alerts: SecurityAlert[];
  events: SecurityEvent[];
  activeAlertId: string | null;
  setActiveAlertId: (id: string | null) => void;
  updateAlertStatus: (alertId: string, status: IncidentStatus, author?: string, note?: string) => void;
  addAlertNote: (alertId: string, author: string, note: string) => void;
  onInspectEvent: (evt: SecurityEvent) => void;
  onNavigateToGlossary?: (term: string) => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  alerts,
  events,
  activeAlertId,
  setActiveAlertId,
  updateAlertStatus,
  addAlertNote,
  onInspectEvent,
  onNavigateToGlossary
}) => {
  // Filter states for incident list
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Analyst note input
  const [newNote, setNewNote] = useState<string>('');
  const [analystName, setAnalystName] = useState<string>('Analyst (Demo)');

  // Interactive completed checklist state per alert persisted in localStorage
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('sentinelai_checklist_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(term);
        const matchId = a.id.toLowerCase().includes(term);
        const matchIp = a.sourceIp.toLowerCase().includes(term) || a.destIp.toLowerCase().includes(term);
        if (!matchTitle && !matchId && !matchIp) return false;
      }
      return true;
    });
  }, [alerts, statusFilter, severityFilter, searchTerm]);

  // Selected active alert
  const currentAlert = useMemo(() => {
    if (!activeAlertId) {
      return filteredAlerts[0] || alerts[0] || null;
    }
    return alerts.find(a => a.id === activeAlertId) || alerts[0] || null;
  }, [alerts, activeAlertId, filteredAlerts]);

  // Correlated events for this alert (same source IP or target IP)
  const correlatedEvents = useMemo(() => {
    if (!currentAlert) return [];
    return events
      .filter(e => e.sourceIp === currentAlert.sourceIp || e.destIp === currentAlert.destIp)
      .slice(0, 10);
  }, [events, currentAlert]);

  // Checklist toggle helper with persistence
  const toggleStep = (alertId: string, stepIdx: number) => {
    setCompletedSteps(prev => {
      const existing = prev[alertId] || [];
      const updated = existing.includes(stepIdx)
        ? existing.filter(i => i !== stepIdx)
        : [...existing, stepIdx];
      const nextState = { ...prev, [alertId]: updated };
      try {
        localStorage.setItem('sentinelai_checklist_v1', JSON.stringify(nextState));
      } catch (err) {
        console.warn(err);
      }
      return nextState;
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !currentAlert) return;
    addAlertNote(currentAlert.id, analystName, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white uppercase tracking-wider">
              Security Incident Investigation Console
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-spectrum forensic triage: evidence analysis, graph topology, response playbooks, and analyst audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Total Alerts:</span>
          <span className="font-bold text-white">{alerts.length}</span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-rose-400 font-bold">{alerts.filter(a => a.status === 'OPEN').length} Open</span>
        </div>
      </div>

      {/* Main Layout: Left Selector Drawer / Column & Right Deep Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Incidents List (4 Columns) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Filters */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search alert, IP, ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-1 text-[11px] text-slate-300 font-mono"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open Only</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-1 text-[11px] text-slate-300 font-mono"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
              </select>
            </div>
          </div>

          {/* Incident List */}
          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 rounded-xl bg-slate-900/40 border border-slate-800">
                No incidents match filter.
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isSelected = currentAlert?.id === alert.id;

                return (
                  <div
                    key={alert.id}
                    onClick={() => setActiveAlertId(alert.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      isSelected 
                        ? 'bg-slate-850 border-cyan-500 shadow-md shadow-cyan-950/40' 
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{alert.id}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        alert.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-100 line-clamp-1">{alert.title}</div>
                    
                    <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                      <span>{alert.sourceIp}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        alert.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300' :
                        alert.status === 'INVESTIGATING' ? 'bg-purple-950 text-purple-300' :
                        'bg-amber-950 text-amber-300'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Deep-Dive Investigation View (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {currentAlert ? (
            <>
              {/* Incident Header & Status Transition Controls */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-400">{currentAlert.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                        {currentAlert.mitreId} ({currentAlert.mitreTactic})
                      </span>
                      {onNavigateToGlossary && (
                        <button
                          onClick={() => onNavigateToGlossary(currentAlert.mitreId)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-mono"
                        >
                          <BookOpen className="w-3 h-3" />
                          Glossary Ref
                        </button>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">{currentAlert.title}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Triggered: {currentAlert.timestamp} UTC &bull; Origin: {currentAlert.sourceIp} &bull; Target: {currentAlert.destIp}:{currentAlert.destPort}
                    </p>
                  </div>

                  {/* Status Change Buttons */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400 font-mono">Incident Status:</span>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
                      {(['OPEN', 'INVESTIGATING', 'RESOLVED'] as IncidentStatus[]).map(st => (
                        <button
                          key={st}
                          onClick={() => updateAlertStatus(currentAlert.id, st, analystName)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                            currentAlert.status === st 
                              ? st === 'RESOLVED' 
                                ? 'bg-emerald-600 text-white font-bold'
                                : st === 'INVESTIGATING'
                                ? 'bg-purple-600 text-white font-bold'
                                : 'bg-amber-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
                    Detection Root Cause & Behavioral Analysis:
                  </div>
                  {currentAlert.explanation}
                </div>

                {/* Supporting Quantitative Evidence Table */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Supporting Evidence & Metric Thresholds
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                        <tr>
                          <th className="p-2.5">Observed Metric</th>
                          <th className="p-2.5">Triggered Value</th>
                          <th className="p-2.5">Baseline Threshold</th>
                          <th className="p-2.5">Significance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {currentAlert.evidence.map((ev, idx) => (
                          <tr key={idx} className="hover:bg-slate-950/40">
                            <td className="p-2.5 font-bold text-white">{ev.metric}</td>
                            <td className="p-2.5 text-rose-300 font-bold">{ev.value}</td>
                            <td className="p-2.5 text-slate-400">{ev.threshold}</td>
                            <td className="p-2.5 text-[11px] font-sans text-slate-300">{ev.significance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Interactive Topological Relationship Graph */}
              <div>
                <RelationshipGraph 
                  alert={currentAlert}
                  relatedEvents={correlatedEvents}
                  onSelectEvent={onInspectEvent}
                />
              </div>

              {/* Recommended Response Playbook Checklist & Analyst Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Containment Playbook Checklist */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Recommended Response Playbook
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Interactive remediation checklist for SOC triage compliance:
                    </p>

                    <div className="space-y-2">
                      {currentAlert.recommendedActions.map((action, idx) => {
                        const isDone = (completedSteps[currentAlert.id] || []).includes(idx);
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleStep(currentAlert.id, idx)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                              isDone 
                                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200 line-through' 
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <span className="leading-snug">{action}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 text-[10px] text-slate-400 font-mono">
                    Progress: {(completedSteps[currentAlert.id] || []).length} of {currentAlert.recommendedActions.length} actions verified
                  </div>
                </div>

                {/* Analyst Audit Log & Notes */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-violet-400" />
                      Analyst Triage & Audit Trail
                    </h3>

                    {/* Notes stream */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
                      {currentAlert.notes.map(note => (
                        <div key={note.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                            <span className="font-bold text-cyan-300">{note.author}</span>
                            <span>{note.timestamp.slice(11, 19)} UTC</span>
                          </div>
                          <div className="text-slate-300">{note.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add note form */}
                  <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="Add analyst note or mitigation summary..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={analystName}
                        onChange={e => setAnalystName(e.target.value)}
                        className="text-[10px] font-mono bg-transparent text-slate-400 border-none focus:outline-none w-32"
                        title="Analyst Name / Badge"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1 transition"
                      >
                        <Send className="w-3 h-3" />
                        Save Note
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* Correlated Event Timeline */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Correlated Event Timeline (Preceding Activity)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {correlatedEvents.length} related packets found
                  </span>
                </div>

                <div className="space-y-1.5">
                  {correlatedEvents.map(evt => (
                    <div
                      key={evt.id}
                      onClick={() => onInspectEvent(evt)}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{evt.timestamp.slice(11, 19)}</span>
                        <span className="font-semibold text-slate-300">{evt.sourceIp}</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="text-cyan-300">{evt.destIp}:{evt.destPort}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 font-sans">
                          {evt.eventType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          evt.status === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {evt.status}
                        </span>
                        <span className="text-slate-400 text-[10px]">Inspect &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/40">
              No incident selected. Select an alert from the register to begin investigation.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
