/**
 * SentinelAI - Live Threat Monitor View
 * 
 * High-speed network telemetry stream with real-time filtering,
 * sorting, searching, pagination, and packet inspection.
 */

import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  ShieldAlert, 
  Play, 
  Pause, 
  FastForward, 
  Trash2, 
  Globe, 
  Server, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { SecurityEvent, Protocol, EventStatus } from '../types';

interface LiveMonitorViewProps {
  events: SecurityEvent[];
  isRunning: boolean;
  setIsRunning: (run: boolean) => void;
  streamSpeed: number;
  setStreamSpeed: (speed: number) => void;
  stepEvent: () => void;
  onInspectEvent: (evt: SecurityEvent) => void;
}

export const LiveMonitorView: React.FC<LiveMonitorViewProps> = ({
  events,
  isRunning,
  setIsRunning,
  streamSpeed,
  setStreamSpeed,
  stepEvent,
  onInspectEvent
}) => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(0);
  const [sortField, setSortField] = useState<'timestamp' | 'anomalyScore' | 'payloadSize'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        // Search term filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchIp = e.sourceIp.toLowerCase().includes(term) || e.destIp.toLowerCase().includes(term);
          const matchType = e.eventType.toLowerCase().includes(term);
          const matchCountry = e.country.toLowerCase().includes(term);
          if (!matchIp && !matchType && !matchCountry) return false;
        }

        // Protocol filter
        if (protocolFilter !== 'ALL' && e.protocol !== protocolFilter) return false;

        // Status filter
        if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;

        // Anomaly threshold
        if (e.anomalyScore < anomalyThreshold) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'timestamp') {
          const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          return sortOrder === 'desc' ? diff : -diff;
        }
        if (sortField === 'anomalyScore') {
          return sortOrder === 'desc' ? b.anomalyScore - a.anomalyScore : a.anomalyScore - b.anomalyScore;
        }
        if (sortField === 'payloadSize') {
          return sortOrder === 'desc' ? b.payloadSize - a.payloadSize : a.payloadSize - b.payloadSize;
        }
        return 0;
      });
  }, [events, searchTerm, protocolFilter, statusFilter, anomalyThreshold, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage]);

  const PROTOCOLS: (Protocol | 'ALL')[] = ['ALL', 'HTTPS', 'HTTP', 'SSH', 'TCP', 'UDP', 'SMB', 'DNS'];
  const STATUSES: (EventStatus | 'ALL')[] = ['ALL', 'ALLOW', 'DENY', 'FAILED_AUTH', 'SUSPICIOUS'];

  return (
    <div className="space-y-4">
      
      {/* Top Telemetry Control Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className={`w-6 h-6 ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            {isRunning && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Telemetry Ingestion Buffer</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {events.length} Buffered Events
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic sliding window pipeline. Real-time packet inspection & feature extraction.
            </p>
          </div>
        </div>

        {/* Streaming Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isRunning 
                ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/40 border border-amber-600/50' 
                : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-600/50'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'Pause Stream' : 'Resume Stream'}
          </button>

          <button
            onClick={stepEvent}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-700 transition"
            title="Step 1 synthetic packet"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Step +1</span>
          </button>

          {/* Speed Presets */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {[
              { label: 'Normal (1.5s)', speed: 1500 },
              { label: 'Fast (0.8s)', speed: 800 },
              { label: 'Burst (0.3s)', speed: 300 }
            ].map(s => (
              <button
                key={s.label}
                onClick={() => setStreamSpeed(s.speed)}
                className={`px-2 py-1 rounded ${
                  streamSpeed === s.speed 
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search source IP, destination IP, event type, or country..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Protocol & Status Pickers */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px] font-mono">Protocol:</span>
              <select
                value={protocolFilter}
                onChange={e => {
                  setProtocolFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {PROTOCOLS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px] font-mono">Status:</span>
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Anomaly Slider Filter */}
            <div className="flex items-center gap-2 text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] font-mono">Min Anomaly:</span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={anomalyThreshold}
                onChange={e => {
                  setAnomalyThreshold(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
                className="w-20 accent-cyan-400 cursor-pointer"
              />
              <span className="font-mono text-cyan-300 font-bold text-[11px]">{anomalyThreshold}+</span>
            </div>
          </div>

        </div>

        {/* Quick Filter Presets */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800/80 text-[11px]">
          <span className="text-slate-400 font-medium">Quick Presets:</span>
          {[
            { label: 'All Telemetry', fn: () => { setAnomalyThreshold(0); setProtocolFilter('ALL'); setStatusFilter('ALL'); setSearchTerm(''); } },
            { label: 'High Anomaly (Score &ge; 40)', fn: () => { setAnomalyThreshold(40); } },
            { label: 'Failed Authentications Only', fn: () => { setStatusFilter('FAILED_AUTH'); } },
            { label: 'SSH & Admin Ports', fn: () => { setProtocolFilter('SSH'); } },
            { label: 'Denied / Blocked Packets', fn: () => { setStatusFilter('DENY'); } }
          ].map(p => (
            <button
              key={p.label}
              onClick={() => { p.fn(); setCurrentPage(1); }}
              className="px-2 py-0.5 rounded-md bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition font-mono"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Stream Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="p-3">
                  <button 
                    onClick={() => {
                      if (sortField === 'timestamp') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('timestamp');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Timestamp (UTC)
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3">Source Origin (Host)</th>
                <th className="p-3">Destination (Service)</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">
                  <button 
                    onClick={() => {
                      if (sortField === 'anomalyScore') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('anomalyScore');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Anomaly Score
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    No events match the active search query and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedEvents.map(evt => {
                  const isHighRisk = evt.anomalyScore >= 60;
                  const isMediumRisk = evt.anomalyScore >= 40 && evt.anomalyScore < 60;

                  return (
                    <tr 
                      key={evt.id}
                      onClick={() => onInspectEvent(evt)}
                      className="hover:bg-slate-800/40 cursor-pointer transition group"
                    >
                      {/* Timestamp */}
                      <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {evt.timestamp.slice(11, 23)}
                      </td>

                      {/* Source */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 font-mono text-slate-200">
                          <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                            {evt.countryCode || 'US'}
                          </span>
                          <span className="font-semibold">{evt.sourceIp}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Port {evt.sourcePort}</div>
                      </td>

                      {/* Destination */}
                      <td className="p-3">
                        <div className="font-mono text-slate-200 font-semibold">{evt.destIp}</div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">Port {evt.destPort}</div>
                      </td>

                      {/* Protocol */}
                      <td className="p-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                          {evt.protocol}
                        </span>
                      </td>

                      {/* Event Type */}
                      <td className="p-3 text-slate-200 font-medium">
                        {evt.eventType}
                        {evt.flaggedByRules && evt.flaggedByRules.length > 0 && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 font-mono font-bold border border-rose-800">
                            ALERT
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          evt.status === 'ALLOW' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                          evt.status === 'FAILED_AUTH' ? 'bg-rose-950/80 text-rose-300 border border-rose-800' :
                          evt.status === 'DENY' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                          'bg-purple-950/80 text-purple-300 border border-purple-800'
                        }`}>
                          {evt.status}
                        </span>
                      </td>

                      {/* Anomaly Score Bar */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                isHighRisk ? 'bg-rose-500' :
                                isMediumRisk ? 'bg-amber-500' :
                                'bg-cyan-500'
                              }`}
                              style={{ width: `${evt.anomalyScore}%` }}
                            />
                          </div>
                          <span className={`font-mono text-[11px] font-bold ${
                            isHighRisk ? 'text-rose-400' :
                            isMediumRisk ? 'text-amber-400' :
                            'text-cyan-400'
                          }`}>
                            {evt.anomalyScore}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectEvent(evt);
                          }}
                          aria-label={`Inspect packet ${evt.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:text-white group-hover:bg-cyan-900/60 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{Math.min(filteredEvents.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-semibold text-white">{Math.min(filteredEvents.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-semibold text-white">{filteredEvents.length}</span> filtered events
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono text-[11px]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
