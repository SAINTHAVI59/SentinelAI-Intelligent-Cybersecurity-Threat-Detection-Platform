/**
 * SentinelAI - Security Overview Dashboard View
 */

import React, { useMemo } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  ArrowUpRight, 
  Radio, 
  FileCheck, 
  Clock, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { SecurityEvent, SecurityAlert, ScenarioType } from '../types';

interface OverviewViewProps {
  events: SecurityEvent[];
  alerts: SecurityAlert[];
  scenario: ScenarioType;
  setScenario: (sc: ScenarioType) => void;
  onOpenAlert: (alertId: string) => void;
  onNavigate: (view: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  events,
  alerts,
  scenario,
  setScenario,
  onOpenAlert,
  onNavigate
}) => {
  // Aggregate KPIs
  const totalEvents = events.length;
  const suspiciousEvents = events.filter(e => e.anomalyScore >= 40 || e.status === 'SUSPICIOUS' || e.status === 'FAILED_AUTH').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  const highAlerts = alerts.filter(a => a.severity === 'HIGH');
  const resolvedIncidents = alerts.filter(a => a.status === 'RESOLVED').length;
  const openIncidents = alerts.filter(a => a.status === 'OPEN').length;

  // Timeline series (grouped into 10 buckets)
  const timelineData = useMemo(() => {
    if (events.length === 0) return [];
    const sorted = [...events].reverse();
    const bucketCount = 10;
    const bucketSize = Math.max(1, Math.floor(sorted.length / bucketCount));
    
    const buckets = [];
    for (let i = 0; i < bucketCount; i++) {
      const slice = sorted.slice(i * bucketSize, (i + 1) * bucketSize);
      if (slice.length === 0) continue;

      const avgAnomaly = Math.round(slice.reduce((acc, c) => acc + c.anomalyScore, 0) / slice.length);
      const totalVolume = slice.length;
      const failedCount = slice.filter(e => e.status === 'FAILED_AUTH' || e.status === 'DENY').length;
      const timeLabel = slice[slice.length - 1].timestamp.slice(14, 19);

      buckets.push({
        time: timeLabel,
        volume: totalVolume,
        anomaly: avgAnomaly,
        anomaliesCount: failedCount
      });
    }
    return buckets;
  }, [events]);

  // Protocol Breakdown
  const protocolData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      counts[e.protocol] = (counts[e.protocol] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      protocol: name,
      count
    })).sort((a, b) => b.count - a.count);
  }, [events]);

  // Severity Distribution for Donut Chart
  const severityData = useMemo(() => {
    const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
    const high = alerts.filter(a => a.severity === 'HIGH').length;
    const medium = alerts.filter(a => a.severity === 'MEDIUM').length;
    const low = alerts.filter(a => a.severity === 'LOW' || a.severity === 'INFO').length;

    return [
      { name: 'Critical', value: critical, color: '#f43f5e' },
      { name: 'High', value: high, color: '#f59e0b' },
      { name: 'Medium', value: medium, color: '#8b5cf6' },
      { name: 'Low / Info', value: low || (critical + high + medium === 0 ? 1 : 0), color: '#06b6d4' }
    ];
  }, [alerts]);

  return (
    <div className="space-y-6">
      
      {/* Synthetic Environment Disclaimer & Quick Scenario Bar */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 border border-cyan-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Active Telemetry Scenario: <span className="text-cyan-400 font-mono">{scenario}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                Synthetic Environment
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live packets are synthetically generated for demonstration. Detection rules and anomaly algorithms are evaluating client-side in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('monitor')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition"
          >
            Live Monitor <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Total Ingested Events */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Total Analyzed Events</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {totalEvents.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Streaming Active (0 drops)</span>
          </div>
        </div>

        {/* Suspicious Events */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Suspicious Anomaly Outliers</span>
            <div className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
            {suspiciousEvents}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span>Score &ge; 40 or Auth Rejected</span>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Critical / High Alerts</span>
            <div className="p-1.5 rounded-lg bg-rose-950/60 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
            {criticalAlerts.length + highAlerts.length}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-400/90 font-mono">
            <span>{criticalAlerts.length} Critical &bull; {highAlerts.length} High</span>
          </div>
        </div>

        {/* Resolved Incidents */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Resolved Incidents</span>
            <div className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {resolvedIncidents} <span className="text-xs text-slate-400 font-normal">/ {alerts.length}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span>{openIncidents} Awaiting Investigation</span>
          </div>
        </div>

      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Event Timeline (2 Columns) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Network Ingestion Velocity & Anomaly Trends
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Moving average of telemetry volume and heuristic anomaly scores
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Sliding Window
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d18', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="volume" name="Telemetry Packets" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                <Area type="monotone" dataKey="anomaly" name="Avg Anomaly Score (0-100)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorAnomaly)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut Chart (1 Column) */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-violet-400" />
                Alert Severity Distribution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Active & historical alert risk breakdown</p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d18', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            {severityData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-bold text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Protocol Breakdown & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Protocol Breakdown Bar Chart */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                Protocol Distribution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Network protocol traffic share</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={protocolData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="protocol" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d18', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Observed Packets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts List (2 Columns) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Recent Security Incidents
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Automated detection triggers requiring analyst triage</p>
            </div>

            <button
              onClick={() => onNavigate('investigation')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
            >
              All Incidents &rarr;
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
            {alerts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                No security alerts triggered yet. Adjust scenario to simulate threats.
              </div>
            ) : (
              alerts.slice(0, 4).map(alert => (
                <div
                  key={alert.id}
                  onClick={() => onOpenAlert(alert.id)}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      alert.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {alert.severity}
                    </span>

                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        {alert.title}
                        <span className="font-mono text-[10px] text-slate-400">[{alert.mitreId}]</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {alert.sourceIp} &rarr; {alert.destIp}:{alert.destPort} ({alert.protocol})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.status === 'RESOLVED' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                        alert.status === 'INVESTIGATING' ? 'bg-purple-950/80 text-purple-300 border border-purple-800' :
                        'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}>
                        {alert.status}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {alert.timestamp.slice(11, 19)} UTC
                      </div>
                    </div>

                    <button 
                      aria-label={`Investigate incident ${alert.id}`}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
