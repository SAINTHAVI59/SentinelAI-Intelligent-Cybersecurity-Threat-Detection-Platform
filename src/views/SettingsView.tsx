/**
 * SentinelAI - Settings & Demo Controls View
 * 
 * Provides scenario configuration, stream performance tuning,
 * factory data reset, and technical interview talking points.
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Radio, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode, 
  Cpu, 
  Terminal, 
  BookOpen,
  Sparkles,
  Github,
  Copy,
  Check,
  Download,
  FolderArchive,
  ExternalLink
} from 'lucide-react';
import { ScenarioType } from '../types';

interface SettingsViewProps {
  scenario: ScenarioType;
  setScenario: (sc: ScenarioType) => void;
  streamSpeed: number;
  setStreamSpeed: (speed: number) => void;
  maxBufferSize: number;
  setMaxBufferSize: (size: number) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  scenario,
  setScenario,
  streamSpeed,
  setStreamSpeed,
  maxBufferSize,
  setMaxBufferSize,
  onResetData
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  // GitHub Sync State
  const [githubUser, setGithubUser] = useState<string>('sherly20flora');
  const [githubRepo, setGithubRepo] = useState<string>('sentinelai-soc');
  const [authType, setAuthType] = useState<'https' | 'ssh'>('https');
  const [copiedCommands, setCopiedCommands] = useState<boolean>(false);

  const SCENARIOS: { id: ScenarioType; title: string; subtitle: string; desc: string; expectedRule: string; mitre: string }[] = [
    {
      id: 'BASELINE',
      title: 'Normal Enterprise Baseline',
      subtitle: 'Standard business operational telemetry',
      desc: 'Simulates nominal web application access, DNS resolutions, microservice REST queries, and legitimate employee browsing. Low anomaly scores, no false alerts.',
      expectedRule: 'No alerts expected (Negative baseline)',
      mitre: 'Nominal'
    },
    {
      id: 'BRUTE_FORCE',
      title: 'Repeated Authentication Failures',
      subtitle: 'Automated credential guessing attack',
      desc: 'Simulates external attacker IP (185.220.101.5) firing high-frequency invalid password login attempts against internal SSH / Bastion jump host within a 60s window.',
      expectedRule: 'RULE-AUTH-001 (Repeated Authentication Failure)',
      mitre: 'T1110 Credential Access'
    },
    {
      id: 'PORT_SCAN',
      title: 'Network Service Sweep & Reconnaissance',
      subtitle: 'Multi-port probing sweep',
      desc: 'Simulates a port scanner attempting connection across sensitive ports (21, 22, 23, 80, 445, 1433, 3389, 4444) to map perimeter surface vulnerabilities.',
      expectedRule: 'RULE-NET-002 (Multi-Port Reconnaissance Sweep)',
      mitre: 'T1046 Network Service Discovery'
    },
    {
      id: 'DATA_EXFIL',
      title: 'Large Outbound Data Transfer',
      subtitle: 'Anomalous exfiltration attempt',
      desc: 'Simulates an internal compromised workstation initiating massive encrypted uploads (>3.5 MB) to an untrusted overseas hosting provider over HTTPS.',
      expectedRule: 'RULE-EXFIL-004 (Anomalous Large Data Transfer)',
      mitre: 'T1048 Exfiltration Over Protocol'
    },
    {
      id: 'DDOS_FLOOD',
      title: 'Unusually Frequent Requests / Traffic Spike',
      subtitle: 'Denial-of-service / scraper burst',
      desc: 'Generates intense volumetric spikes from a single source host exceeding the standard rate-limit threshold (>12 requests in 15 seconds).',
      expectedRule: 'RULE-DOS-003 (Traffic Spike / Flooding)',
      mitre: 'T1499 Endpoint Denial of Service'
    },
    {
      id: 'ZERO_DAY_MIX',
      title: 'Composite Zero-Day Behavioral Anomaly',
      subtitle: 'Multi-vector suspicious indicators',
      desc: 'Emits packets featuring rare administrative ports, non-standard TCP flags, fragmented headers, and abnormal entropy.',
      expectedRule: 'RULE-PORT-005 (Administrative Port Access)',
      mitre: 'T1021 Remote Services'
    }
  ];

  const handleConfirmReset = () => {
    onResetData();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white uppercase tracking-wider">
              Simulation Scenarios & Demonstration Controls
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure telemetry generators, tune ingestion rate buffers, and reset demonstration data.
          </p>
        </div>

        {/* Reset Data Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-3.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-xs flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Demonstration Telemetry?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Clear local browser storage and return to default baseline.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will clear all local incident statuses, custom analyst triage notes, and buffered packets, repopulating SentinelAI with a pristine baseline seed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
              >
                Confirm Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Success Toast */}
      {resetSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Demo data reset to clean baseline successfully!
        </div>
      )}

      {/* Demonstration Sandbox Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed space-y-1">
          <strong className="text-white block font-semibold">Demonstration Environment Notice:</strong>
          <p>
            SentinelAI is an educational, industry-grade Security Operations Center simulator. All network telemetry, IP addresses, packet headers, and attack vectors are synthetically generated client-side in browser memory. No external user traffic is intercepted or harvested.
          </p>
        </div>
      </div>

      {/* Section 1: Scenario Selector Grid */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          Active Attack Telemetry Scenario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIOS.map(sc => {
            const isActive = scenario === sc.id;

            return (
              <div
                key={sc.id}
                onClick={() => setScenario(sc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition text-left flex flex-col justify-between space-y-3 ${
                  isActive 
                    ? 'bg-gradient-to-br from-cyan-950/70 to-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/50' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase">
                      {sc.id}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white">{sc.title}</h3>
                  <div className="text-[11px] text-slate-400 font-medium">{sc.subtitle}</div>
                  
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {sc.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div>MITRE: <span className="text-slate-300">{sc.mitre}</span></div>
                  <div>Triggers: <span className="text-amber-400">{sc.expectedRule.split(' ')[0]}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Ingestion & Buffer Controls */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          Stream Performance & Buffer Tuning
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Slider 1: Stream Interval */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-300">Packet Generation Interval:</span>
              <span className="text-cyan-400 font-bold">{(streamSpeed / 1000).toFixed(1)}s per event</span>
            </div>
            <input
              type="range"
              min="300"
              max="3500"
              step="100"
              value={streamSpeed}
              onChange={e => setStreamSpeed(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>High Burst (0.3s)</span>
              <span>Default (1.5s)</span>
              <span>Slow Walkthrough (3.5s)</span>
            </div>
          </div>

          {/* Slider 2: Max Buffer Size */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-300">Max In-Memory Telemetry Buffer:</span>
              <span className="text-violet-400 font-bold">{maxBufferSize} events</span>
            </div>
            <input
              type="range"
              min="100"
              max="800"
              step="50"
              value={maxBufferSize}
              onChange={e => setMaxBufferSize(parseInt(e.target.value, 10))}
              className="w-full accent-violet-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>Lightweight (100)</span>
              <span>Balanced (400)</span>
              <span>High Capacity (800)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Section: GitHub Sync & Source Code Export (Free) */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Sync to GitHub & Source Export
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  100% Free
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Push complete repository (code, README with architecture diagrams, and tests) to your GitHub account.
              </p>
            </div>
          </div>

          <a
            href="/sentinelai-source.tar.gz"
            download="sentinelai-source.tar.gz"
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition self-start sm:self-auto shrink-0 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Source Archive (.tar.gz)
          </a>
        </div>

        {/* Repository Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">GitHub Username:</label>
            <input
              type="text"
              value={githubUser}
              onChange={e => setGithubUser(e.target.value)}
              placeholder="e.g. your-github-handle"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Repository Name:</label>
            <input
              type="text"
              value={githubRepo}
              onChange={e => setGithubRepo(e.target.value)}
              placeholder="e.g. sentinelai-soc"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Protocol:</label>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 font-mono">
              <button
                type="button"
                onClick={() => setAuthType('https')}
                className={`flex-1 py-1 rounded text-center text-xs transition ${
                  authType === 'https' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                HTTPS
              </button>
              <button
                type="button"
                onClick={() => setAuthType('ssh')}
                className={`flex-1 py-1 rounded text-center text-xs transition ${
                  authType === 'ssh' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                SSH
              </button>
            </div>
          </div>
        </div>

        {/* Formatted Terminal Commands */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Terminal Push Commands (Copy & Paste):
            </span>

            <button
              onClick={() => {
                const targetUrl = authType === 'https' 
                  ? `https://github.com/${githubUser || '<username>'}/${githubRepo || '<repo>'}.git`
                  : `git@github.com:${githubUser || '<username>'}/${githubRepo || '<repo>'}.git`;

                const cmds = `# 1. Create a free repo at https://github.com/new named "${githubRepo}"\n# 2. Run in your project directory:\ngit remote add origin ${targetUrl}\ngit branch -M main\ngit push -u origin main`;
                navigator.clipboard.writeText(cmds);
                setCopiedCommands(true);
                setTimeout(() => setCopiedCommands(false), 2500);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              {copiedCommands ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCommands ? 'Copied to Clipboard!' : 'Copy All Commands'}
            </button>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 font-mono text-[11px] text-cyan-300/90 overflow-x-auto leading-relaxed select-all">
{`# Step 1: Create an empty public or private repository at https://github.com/new
# Repository Name: ${githubRepo}

# Step 2: Link this repository and push to your GitHub account:
git remote add origin ${authType === 'https' ? `https://github.com/${githubUser}/${githubRepo}.git` : `git@github.com:${githubUser}/${githubRepo}.git`}
git branch -M main
git push -u origin main`}
          </pre>
        </div>

        {/* Free Option Steps Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-400">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850">
            <strong className="text-slate-200 block mb-0.5">1. Free GitHub Account</strong>
            Public or private repositories with unlimited collaborators and free GitHub Actions CI/CD workflows.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850">
            <strong className="text-slate-200 block mb-0.5">2. Clean Git History</strong>
            Initial commit already prepared with full file tree, types, data schemas, and unit test runners.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850">
            <strong className="text-slate-200 block mb-0.5">3. Web Upload Alternative</strong>
            You can also drag-and-drop the downloaded archive directly into GitHub via the "Upload files" button.
          </div>
        </div>
      </div>

      {/* Section 3: Technical Interview System Design Primer */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Architecture Guide & Interview Talking Points
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
              1. The Detection Architecture
            </h4>
            <p>
              "We chose a dual-engine architecture: deterministic sliding-window rules for known MITRE ATT&CK signatures (like T1110 brute-force and T1046 port scanning), paired with a multi-factor heuristic anomaly scoring engine that analyzes port sensitivity, velocity burst, and payload deviations."
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
            <h4 className="font-bold text-violet-300 flex items-center gap-1.5 font-mono">
              2. Suppressing False Positives
            </h4>
            <p>
              "Alert fatigue is a major problem in real SOCs. Rather than flagging single failed logins, our rules require temporal correlation (e.g. &ge;4 failures within 60s) and multi-port diversity thresholds. Our negative control unit test proves that normal baseline traffic emits zero false positives."
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
            <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
              3. Interactive Relationship Mapping
            </h4>
            <p>
              "In real investigations, raw tabular logs slow down triage. Our topological relationship graph immediately maps the external attacker IP to targeted internal servers, targeted ports, and corresponding alerts so analysts can understand lateral movement in seconds."
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5 font-mono">
              4. Production Scaling Path
            </h4>
            <p>
              "In a distributed enterprise deployment, the in-browser streaming loop would be replaced by Apache Kafka for event ingestion and Apache Flink for stateful windowed CEP (Complex Event Processing), feeding Elasticsearch and an analyst React console."
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
