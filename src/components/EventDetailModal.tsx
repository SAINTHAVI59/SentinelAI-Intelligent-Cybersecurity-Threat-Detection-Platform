/**
 * SentinelAI - Event Inspection Detail Modal
 */

import React from 'react';
import { X, ShieldAlert, Globe, Server, Hash, Activity, FileCode, CheckCircle, AlertOctagon } from 'lucide-react';
import { SecurityEvent } from '../types';

interface EventDetailModalProps {
  event: SecurityEvent | null;
  onClose: () => void;
  onInvestigateHost?: (ip: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onInvestigateHost
}) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0c1220] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${
              event.anomalyScore > 60 
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800' 
                : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">{event.id}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  event.status === 'ALLOW' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  event.status === 'FAILED_AUTH' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  event.status === 'DENY' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-purple-950 text-purple-300 border border-purple-800'
                }`}>
                  {event.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{event.eventType}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close event details modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">

          {/* Anomaly Score Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Heuristic Anomaly Index
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {event.anomalyScore}<span className="text-xs text-slate-400 font-normal"> / 100</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {event.anomalyScore > 70 ? 'Extreme risk outlier detected' :
                 event.anomalyScore > 40 ? 'Moderate deviation from baseline' : 'Standard expected network baseline'}
              </div>
            </div>

            <div className="w-36">
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    event.anomalyScore > 70 ? 'bg-gradient-to-r from-amber-500 to-rose-500' :
                    event.anomalyScore > 40 ? 'bg-gradient-to-r from-cyan-500 to-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${event.anomalyScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>0</span>
                <span>Threshold: 60</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Connection Vector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Source */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-rose-400" /> Source Origin</span>
                <span className="text-slate-300 font-bold">{event.country} ({event.countryCode || 'INT'})</span>
              </div>
              <div className="font-mono text-sm font-semibold text-white flex items-center justify-between">
                <span>{event.sourceIp}</span>
                <span className="text-xs text-slate-400 font-normal">Port {event.sourcePort}</span>
              </div>
              {onInvestigateHost && (
                <button
                  onClick={() => onInvestigateHost(event.sourceIp)}
                  className="mt-2 text-[11px] text-cyan-400 hover:underline"
                >
                  Filter events from this IP &rarr;
                </button>
              )}
            </div>

            {/* Destination */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1"><Server className="w-3.5 h-3.5 text-cyan-400" /> Destination Target</span>
                <span className="text-slate-300 font-bold">{event.protocol}</span>
              </div>
              <div className="font-mono text-sm font-semibold text-white flex items-center justify-between">
                <span>{event.destIp}</span>
                <span className="text-xs text-cyan-400 font-semibold">Port {event.destPort}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 font-mono">
                Payload Size: <span className="text-slate-200">{(event.payloadSize / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          </div>

          {/* Anomaly Factors */}
          {event.anomalyFactors && event.anomalyFactors.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                Contributing Anomaly Factors
              </div>
              <div className="space-y-1.5">
                {event.anomalyFactors.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-200">{f.factor}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{f.description}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                      +{f.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Payload Inspection */}
          <div>
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Raw Packet & Payload Inspection
            </div>
            <pre className="p-3 rounded-xl bg-[#070b14] border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {event.rawPayload || 'TCP Packet payload null / encrypted TLS payload'}
            </pre>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              Timestamp: {event.timestamp} | Synthetic Signature Hash: SHA256:{event.id.replace(/-/g, '').padEnd(32, 'a')}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Synthetic telemetry log</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
