/**
 * SentinelAI - Report Generation & Data Export Utilities
 * 
 * Provides real browser-side CSV & JSON file generation and downloading.
 * No mock buttons or fake alerts.
 */

import { SecurityEvent, SecurityAlert } from '../types';

/**
 * Escapes CSV values conforming to RFC 4180
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates and downloads a clean CSV file of security events
 */
export function exportEventsToCsv(events: SecurityEvent[], filename = `sentinelai-events-${Date.now()}.csv`): void {
  const headers = [
    'Event ID',
    'Timestamp (UTC)',
    'Source IP',
    'Source Port',
    'Destination IP',
    'Destination Port',
    'Protocol',
    'Event Type',
    'Status',
    'Payload Size (Bytes)',
    'Anomaly Score (0-100)',
    'Country',
    'Flagged By Rules'
  ];

  const rows = events.map(evt => [
    escapeCsvValue(evt.id),
    escapeCsvValue(evt.timestamp),
    escapeCsvValue(evt.sourceIp),
    escapeCsvValue(evt.sourcePort),
    escapeCsvValue(evt.destIp),
    escapeCsvValue(evt.destPort),
    escapeCsvValue(evt.protocol),
    escapeCsvValue(evt.eventType),
    escapeCsvValue(evt.status),
    escapeCsvValue(evt.payloadSize),
    escapeCsvValue(evt.anomalyScore),
    escapeCsvValue(evt.country),
    escapeCsvValue(evt.flaggedByRules ? evt.flaggedByRules.join('; ') : 'None')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBrowserDownload(blob, filename);
}

/**
 * Generates and downloads a clean JSON file of security events or alerts
 */
export function exportDataToJson(data: unknown, filename = `sentinelai-export-${Date.now()}.json`): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  triggerBrowserDownload(blob, filename);
}

/**
 * Native browser download trigger via hidden <a> element
 */
function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats bytes into human readable format (KB, MB, etc.)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Triggers native browser print dialog for printable incident report
 */
export function triggerPrintReport(): void {
  window.print();
}

/**
 * Summary metrics for incident reporting
 */
export function computeReportMetrics(events: SecurityEvent[], alerts: SecurityAlert[]) {
  const totalEvents = events.length;
  const totalAlerts = alerts.length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highCount = alerts.filter(a => a.severity === 'HIGH').length;
  const mediumCount = alerts.filter(a => a.severity === 'MEDIUM').length;
  const openCount = alerts.filter(a => a.status === 'OPEN').length;
  const investigatingCount = alerts.filter(a => a.status === 'INVESTIGATING').length;
  const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;

  const avgAnomaly = totalEvents > 0
    ? Math.round(events.reduce((acc, curr) => acc + curr.anomalyScore, 0) / totalEvents)
    : 0;

  return {
    totalEvents,
    totalAlerts,
    criticalCount,
    highCount,
    mediumCount,
    openCount,
    investigatingCount,
    resolvedCount,
    avgAnomaly
  };
}
