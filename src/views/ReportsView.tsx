/**
 * SentinelAI - Reports & Compliance Export View
 * 
 * Provides real, browser-native CSV/JSON file generation and
 * printable executive incident dossiers.
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileCode, 
  ShieldAlert, 
  Info,
  Layers
} from 'lucide-react';
import { SecurityEvent, SecurityAlert, Severity } from '../types';
import { exportEventsToCsv, exportDataToJson, computeReportMetrics } from '../utils/reportExport';

interface ReportsViewProps {
  events: SecurityEvent[];
  alerts: SecurityAlert[];
  onOpenPrintModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  events,
  alerts,
  onOpenPrintModal
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [includeOnlyAnomalies, setIncludeOnlyAnomalies] = useState<boolean>(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Filtered data for export
  const exportableEvents = useMemo(() => {
    return events.filter(e => {
      if (includeOnlyAnomalies && e.anomalyScore < 40 && e.status === 'ALLOW') return false;
      return true;
    });
  }, [events, includeOnlyAnomalies]);

  const exportableAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
      return true;
    });
  }, [alerts, severityFilter]);

  const metrics = computeReportMetrics(exportableEvents, exportableAlerts);

  const showNotification = (msg: string) => {
    setDownloadSuccessMsg(msg);
    setTimeout(() => setDownloadSuccessMsg(null), 3500);
  };

  const handleDownloadCsv = () => {
    exportEventsToCsv(exportableEvents);
    showNotification(`Successfully exported ${exportableEvents.length} events to CSV format.`);
  };

  const handleDownloadJson = () => {
    exportDataToJson({
      exportedAt: new Date().toISOString(),
      generator: 'SentinelAI SecOps Platform',
      metrics,
      events: exportableEvents
    }, `sentinelai-telemetry-${Date.now()}.json`);
    showNotification(`Successfully exported ${exportableEvents.length} events to JSON format.`);
  };

  const handleDownloadAlertsJson = () => {
    exportDataToJson({
      exportedAt: new Date().toISOString(),
      generator: 'SentinelAI SecOps Platform',
      metrics,
      incidents: exportableAlerts
    }, `sentinelai-incidents-${Date.now()}.json`);
    showNotification(`Successfully exported ${exportableAlerts.length} incidents to JSON format.`);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white uppercase tracking-wider">
              Incident Reporting & Compliance Data Export
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real client-side CSV and JSON export pipelines. Compliant with SIEM telemetry archiving standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPrintModal}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Incident Dossier
          </button>
        </div>
      </div>

      {/* Download Toast Notification */}
      {downloadSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400">Telemetry Events in Buffer</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {exportableEvents.length}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Estimated CSV size: ~{(exportableEvents.length * 0.18).toFixed(1)} KB
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400">Security Incident Tickets</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {exportableAlerts.length}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {metrics.criticalCount} Critical &bull; {metrics.resolvedCount} Resolved
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400">Export Encoding</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            UTF-8 / RFC 4180
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Full delimiter escaping & sanitization
          </div>
        </div>
      </div>

      {/* Export Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: CSV Export */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Download Telemetry (CSV)</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Standard RFC 4180 comma-separated format including timestamps, source IPs, destinations, protocols, status, and anomaly scores.
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV ({exportableEvents.length} Rows)
          </button>
        </div>

        {/* Card 2: JSON Export */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Download Telemetry (JSON)</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Complete raw JSON dump of all observed events with nested payload headers, feature vectors, and calculated anomaly factor trees.
            </p>
          </div>

          <button
            onClick={handleDownloadJson}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Events JSON
          </button>
        </div>

        {/* Card 3: Incidents Dossier JSON */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Incidents Register (JSON)</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Full structured export of all triggered security alerts with MITRE ATT&CK metadata, analyst triage audit notes, and evidence tables.
            </p>
          </div>

          <button
            onClick={handleDownloadAlertsJson}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            Export Incidents ({exportableAlerts.length})
          </button>
        </div>

      </div>

      {/* Printable Report Preview Card */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Printer className="w-4 h-4 text-cyan-400" />
            Executive Incident Investigation Dossier
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Generate an executive-ready formal audit report with severity KPIs, incident evidence matrices, containment playbooks, and lead analyst sign-off blocks formatted for PDF and physical print.
          </p>
        </div>

        <button
          onClick={onOpenPrintModal}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shrink-0 transition"
        >
          <Printer className="w-4 h-4" />
          Preview & Print
        </button>
      </div>

    </div>
  );
};
