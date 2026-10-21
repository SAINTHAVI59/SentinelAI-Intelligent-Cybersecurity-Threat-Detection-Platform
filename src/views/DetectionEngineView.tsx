/**
 * SentinelAI - Threat Detection Engine View
 * 
 * Inspects deterministic MITRE ATT&CK detection rules and
 * provides an interactive Anomaly Scoring feature simulator.
 */

import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Hash, 
  Terminal, 
  Activity, 
  Check, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { DETECTION_RULES } from '../engine/detectionEngine';
import { calculateAnomalyScore } from '../engine/anomalyScorer';
import { EventStatus, Protocol } from '../types';

export const DetectionEngineView: React.FC = () => {
  // Anomaly Sandbox interactive state
  const [sandboxPort, setSandboxPort] = useState<number>(22);
  const [sandboxStatus, setSandboxStatus] = useState<EventStatus>('FAILED_AUTH');
  const [sandboxPayloadKb, setSandboxPayloadKb] = useState<number>(500); // KB
  const [sandboxBurstCount, setSandboxBurstCount] = useState<number>(10);
  const [sandboxPortDiversity, setSandboxPortDiversity] = useState<number>(4);

  // Compute live sandbox score
  const sandboxBreakdown = useMemo(() => {
    // Generate synthetic dummy events to match burst and port diversity
    const dummyRecent = Array.from({ length: sandboxBurstCount }).map((_, i) => ({
      id: `DUMMY-${i}`,
      timestamp: new Date().toISOString(),
      sourceIp: '198.51.100.5',
      destIp: '10.0.1.15',
      sourcePort: 50000 + i,
      destPort: i < sandboxPortDiversity ? [21, 22, 80, 445, 3389][i % 5] : sandboxPort,
      protocol: 'TCP' as Protocol,
      eventType: 'Test Event',
      payloadSize: 1024,
      status: sandboxStatus,
      country: 'Test',
      countryCode: 'TT',
      anomalyScore: 0
    }));

    return calculateAnomalyScore(
      {
        destPort: sandboxPort,
        status: sandboxStatus,
        payloadSize: sandboxPayloadKb * 1024,
        timestamp: new Date().toISOString()
      },
      dummyRecent
    );
  }, [sandboxPort, sandboxStatus, sandboxPayloadKb, sandboxBurstCount, sandboxPortDiversity]);

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white uppercase tracking-wider">
              Threat Detection & Anomaly Scoring Engine
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Hybrid detection architecture combining deterministic sliding-window MITRE ATT&CK rules with an explainable multi-factor heuristic anomaly scoring pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 font-bold">
            <Check className="w-3.5 h-3.5" /> 5 Rules Active
          </span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-violet-950 text-violet-300 border border-violet-800 font-bold">
            MITRE ATT&CK v14
          </span>
        </div>
      </div>

      {/* Disclaimers & Ethics Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300">Engineering Transparency & Scientific Rigor:</strong> SentinelAI processes simulated telemetry. An alert indicates an anomaly or signature pattern matching defensive rules—it does not constitute definitive proof of an actual breach without human analyst investigation.
        </div>
      </div>

      {/* Section 1: Active Detection Rules Catalog */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Deterministic Signature & Behavioral Rules
          </h2>
          <span className="text-xs text-slate-400 font-mono">100% Client-Side Evaluation</span>
        </div>

        <div className="space-y-4">
          {DETECTION_RULES.map(rule => (
            <div 
              key={rule.id}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition"
            >
              {/* Rule Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    rule.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    rule.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}>
                    {rule.severity}
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
                    <div className="text-[11px] font-mono text-slate-400">Rule ID: {rule.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-semibold">
                    {rule.mitreId}
                  </span>
                  <span className="text-slate-400">{rule.mitreTactic}</span>
                </div>
              </div>

              {/* Description & Trigger Logic */}
              <div className="py-3 text-xs text-slate-300 space-y-2">
                <p>{rule.description}</p>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-[11px] text-cyan-300/90 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Category: {rule.category} | Sliding Window Temporal Correlation</span>
                </div>
              </div>

              {/* Evaluation Parameters */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                <div>Engine: <span className="text-slate-200 font-mono font-medium">Deterministic Rule</span></div>
                <div>Status: <span className="text-emerald-400 font-mono font-semibold">ENABLED</span></div>
                <div>Action: <span className="text-amber-400 font-mono font-semibold">GENERATE_ALERT</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Interactive Anomaly Scoring Sandbox */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Interactive Anomaly Scoring Feature Sandbox
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Experiment with event feature vectors to see how the scoring model calculates the composite 0-100 risk index and assigns contributing factors in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Feature Vector Controls (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Control 1: Destination Port */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Target Port Vulnerability:</span>
                <span className="text-cyan-400 font-bold">Port {sandboxPort}</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 text-xs font-mono">
                {[
                  { port: 80, label: '80 (HTTP)' },
                  { port: 443, label: '443 (HTTPS)' },
                  { port: 22, label: '22 (SSH)' },
                  { port: 23, label: '23 (Telnet)' },
                  { port: 445, label: '445 (SMB)' },
                  { port: 4444, label: '4444 (C2)' }
                ].map(p => (
                  <button
                    key={p.port}
                    onClick={() => setSandboxPort(p.port)}
                    className={`p-1.5 rounded-lg border text-center transition ${
                      sandboxPort === p.port 
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 2: Authentication Status */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Authentication & Traffic Disposition:</span>
                <span className="text-amber-400 font-bold">{sandboxStatus}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {(['ALLOW', 'FAILED_AUTH', 'SUSPICIOUS'] as EventStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => setSandboxStatus(st)}
                    className={`p-2 rounded-lg border text-center transition ${
                      sandboxStatus === st 
                        ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Burst Frequency in 30s */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Request Density (Events from IP in last 30s):</span>
                <span className="text-violet-400 font-bold">{sandboxBurstCount} req/30s</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                value={sandboxBurstCount}
                onChange={e => setSandboxBurstCount(parseInt(e.target.value, 10))}
                className="w-full accent-violet-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>Baseline (1-5)</span>
                <span>Elevated (8-15)</span>
                <span>Flood Spike (&gt;20)</span>
              </div>
            </div>

            {/* Control 4: Payload Size */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Payload Volume Size:</span>
                <span className="text-cyan-400 font-bold">
                  {sandboxPayloadKb >= 1024 
                    ? `${(sandboxPayloadKb / 1024).toFixed(2)} MB` 
                    : `${sandboxPayloadKb} KB`}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="5000"
                step="50"
                value={sandboxPayloadKb}
                onChange={e => setSandboxPayloadKb(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>Standard (10 KB)</span>
                <span>Moderate (500 KB)</span>
                <span>Large Exfil (&gt;2.5 MB)</span>
              </div>
            </div>

            {/* Control 5: Port Diversity */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Distinct Ports Probed by IP:</span>
                <span className="text-rose-400 font-bold">{sandboxPortDiversity} ports</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={sandboxPortDiversity}
                onChange={e => setSandboxPortDiversity(parseInt(e.target.value, 10))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

          </div>

          {/* Live Calculated Output Card (1 Column) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Computed Anomaly Output
              </div>

              {/* Large Score Dial */}
              <div className="text-center py-4">
                <div className={`text-5xl font-black font-mono tracking-tight ${
                  sandboxBreakdown.score >= 70 ? 'text-rose-400' :
                  sandboxBreakdown.score >= 40 ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {sandboxBreakdown.score}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Scale: 0 (Normal) to 100 (Critical)
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full transition-all duration-300 ${
                      sandboxBreakdown.score >= 70 ? 'bg-rose-500' :
                      sandboxBreakdown.score >= 40 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${sandboxBreakdown.score}%` }}
                  />
                </div>
              </div>

              {/* Contributing Factor List */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Attributed Feature Factors:
                </div>
                {sandboxBreakdown.factors.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">
                    No anomalous feature thresholds exceeded. Nominal base noise (+5).
                  </div>
                ) : (
                  sandboxBreakdown.factors.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-300 font-medium">{f.factor}</span>
                      <span className="font-mono text-amber-400 font-bold">+{f.score}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-800">
              Algorithm: Bounded Multi-Feature Heuristic
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
