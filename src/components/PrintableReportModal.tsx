/**
 * SentinelAI - Formal Printable Incident Report Dossier Modal
 * 
 * Styled specifically for browser print rendering (`window.print()`)
 * and screen preview.
 */

import React, { useRef } from 'react';
import { X, Printer, Shield, Download, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SecurityAlert, SecurityEvent } from '../types';
import { triggerPrintReport, computeReportMetrics } from '../utils/reportExport';

interface PrintableReportModalProps {
  alerts: SecurityAlert[];
  events: SecurityEvent[];
  onClose: () => void;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  alerts,
  events,
  onClose
}) => {
  const metrics = computeReportMetrics(events, alerts);
  const reportDate = new Date().toUTCString();
  const reportId = `REP-${Date.now().toString().slice(-6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Controls Toolbar (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-white text-sm">Formal Incident Investigation Dossier</h2>
              <p className="text-[11px] text-slate-400">SOC Compliance & Executive Security Audit Report</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerPrintReport}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              aria-label="Close printable report"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 font-sans print:p-0">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-base">
                  S
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  SENTINEL<span className="text-cyan-700">AI</span> SECURITY OPERATIONS CENTER
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Autonomous Threat Detection & Incident Response Platform — Executive Briefing
              </p>
            </div>

            <div className="text-right text-xs font-mono text-slate-600 space-y-0.5">
              <div><strong className="text-slate-900">Report Ref:</strong> {reportId}</div>
              <div><strong className="text-slate-900">Generated:</strong> {reportDate}</div>
              <div><strong className="text-slate-900">Classification:</strong> DEMO / RESTRICTED</div>
            </div>
          </div>

          {/* Environment Statement Banner */}
          <div className="p-3 mb-6 bg-slate-100 border-l-4 border-cyan-600 text-xs text-slate-700">
            <strong>NOTICE:</strong> This document represents synthetic telemetry captured within the SentinelAI demonstration sandbox. Detection rules and anomaly algorithms executed are production-mode client implementations.
          </div>

          {/* Executive Summary Metrics */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Executive Summary & Telemetry KPIs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[11px] text-slate-500">Total Analyzed Events</div>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{metrics.totalEvents}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[11px] text-slate-500">Security Alerts</div>
                <div className="text-xl font-bold text-rose-700 font-mono mt-0.5">{metrics.totalAlerts}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[11px] text-slate-500">Critical / High Severity</div>
                <div className="text-xl font-bold text-amber-700 font-mono mt-0.5">{metrics.criticalCount + metrics.highCount}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[11px] text-slate-500">Resolved Incidents</div>
                <div className="text-xl font-bold text-emerald-700 font-mono mt-0.5">{metrics.resolvedCount}</div>
              </div>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              2. Security Incidents Register
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">Alert ID</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Threat Classification</th>
                    <th className="p-2.5">Attacker & Target</th>
                    <th className="p-2.5">MITRE ATT&CK</th>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {alerts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500">
                        No security alerts triggered in active window.
                      </td>
                    </tr>
                  ) : (
                    alerts.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-medium">{a.id}</td>
                        <td className="p-2.5 text-slate-600 font-mono text-[11px]">
                          {a.timestamp.slice(11, 19)} UTC
                        </td>
                        <td className="p-2.5 font-medium text-slate-900">{a.title}</td>
                        <td className="p-2.5 font-mono text-[11px]">
                          {a.sourceIp} &rarr; {a.destIp}:{a.destPort}
                        </td>
                        <td className="p-2.5 font-mono text-cyan-800 font-semibold">{a.mitreId}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                            a.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {a.severity}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                            a.status === 'INVESTIGATING' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Incident Evidence Sections */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              3. Detection Evidence & Containment Playbooks
            </h2>
            <div className="space-y-4">
              {alerts.slice(0, 4).map((a, i) => (
                <div key={a.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 print-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900">
                      Incident #{i + 1}: {a.title} [{a.id}]
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-600">
                      MITRE: {a.mitreId} ({a.mitreTactic})
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                    {a.explanation}
                  </p>

                  <div className="text-xs font-semibold text-slate-800 mb-1.5">Corroborated Telemetry Evidence:</div>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1 mb-3">
                    {a.evidence.map((ev, eIdx) => (
                      <li key={eIdx}>
                        <strong>{ev.metric}:</strong> {ev.value} (Benchmark: {ev.threshold}) — {ev.significance}
                      </li>
                    ))}
                  </ul>

                  <div className="text-xs font-semibold text-slate-800 mb-1.5">Mandated Remediation Steps:</div>
                  <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-0.5">
                    {a.recommendedActions.map((act, actIdx) => (
                      <li key={actIdx}>{act}</li>
                    ))}
                  </ol>

                  {a.notes && a.notes.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                      Latest Analyst Audit Note: "{a.notes[a.notes.length - 1].content}" ({a.notes[a.notes.length - 1].author})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sign-off & Signatures */}
          <div className="border-t-2 border-slate-900 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
            <div>
              <div className="font-bold text-slate-900">Lead Security Operations Engineer</div>
              <div className="mt-6 border-b border-slate-400 w-48"></div>
              <div className="text-[10px] mt-1 font-mono">Signature / Badge ID: SEC-88912</div>
            </div>

            <div>
              <div className="font-bold text-slate-900">Chief Information Security Officer (Approval)</div>
              <div className="mt-6 border-b border-slate-400 w-48"></div>
              <div className="text-[10px] mt-1 font-mono">Date: {new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Ready for hardcopy printout or PDF export.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
            >
              Close
            </button>
            <button
              onClick={triggerPrintReport}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
