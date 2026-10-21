/**
 * SentinelAI - Navigation Header Component
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Play, 
  Pause, 
  FastForward, 
  Activity, 
  Bell, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Menu, 
  ExternalLink,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { ScenarioType, SecurityAlert } from '../types';

interface NavbarProps {
  scenario: ScenarioType;
  setScenario: (sc: ScenarioType) => void;
  isRunning: boolean;
  setIsRunning: (run: boolean) => void;
  streamSpeed: number;
  setStreamSpeed: (speed: number) => void;
  stepEvent: () => void;
  alerts: SecurityAlert[];
  onOpenAlert: (alertId: string) => void;
  toggleSidebar: () => void;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scenario,
  setScenario,
  isRunning,
  setIsRunning,
  streamSpeed,
  setStreamSpeed,
  stepEvent,
  alerts,
  onOpenAlert,
  toggleSidebar,
  onNavigate
}) => {
  const [timeUtc, setTimeUtc] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openAlerts = alerts.filter(a => a.status === 'OPEN');
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;

  const SCENARIOS: { id: ScenarioType; label: string; desc: string }[] = [
    { id: 'BASELINE', label: 'Normal Baseline Traffic', desc: 'Standard business web, API, and DNS telemetry' },
    { id: 'BRUTE_FORCE', label: 'Brute Force Attack', desc: 'Rapid SSH failed authentication attempts' },
    { id: 'PORT_SCAN', label: 'Port Reconnaissance', desc: 'Multi-port sweep on sensitive service ports' },
    { id: 'DATA_EXFIL', label: 'Data Exfiltration', desc: 'Massive outbound payload transfer burst' },
    { id: 'DDOS_FLOOD', label: 'High-Frequency Flood', desc: 'Traffic volume spike exceeding rate limits' },
    { id: 'ZERO_DAY_MIX', label: 'Composite Anomaly', desc: 'Unusual protocol flags and high entropy packets' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        
        {/* Left: Branding & Mobile toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            aria-label="Toggle navigation sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 p-[1.5px] shadow-sm shadow-cyan-500/20">
              <div className="w-full h-full bg-[#090d18] rounded-[7px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition transform duration-200" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">Sentinel<span className="text-cyan-400">AI</span></span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">SOC Tier 1</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight -mt-0.5">Threat Detection & SecOps</p>
            </div>
          </div>

          {/* Synthetic Banner Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/50 border border-indigo-700/50 text-[11px] text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-medium">Synthetic Telemetry Sandbox</span>
          </div>
        </div>

        {/* Center: Scenario Selector & Live Controls */}
        <div className="flex items-center gap-2">
          {/* Active Scenario Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowScenarioMenu(!showScenarioMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 hover:border-cyan-500/60 transition"
              title="Change active attack simulation scenario"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-slate-400 hidden xl:inline">Scenario:</span>
                <span className="font-medium text-cyan-300">
                  {SCENARIOS.find(s => s.id === scenario)?.label.split(' ')[0]}...
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showScenarioMenu && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setShowScenarioMenu(false)} />
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Attack Simulation Scenario
                  </div>
                  {SCENARIOS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setScenario(s.id);
                        setShowScenarioMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition flex flex-col gap-0.5 ${
                        scenario === s.id 
                          ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/50' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-medium flex items-center justify-between">
                        {s.label}
                        {scenario === s.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Stream Play/Pause & Step Controls */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
                isRunning 
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
              title={isRunning ? 'Pause telemetry stream' : 'Resume telemetry stream'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="text-[11px] hidden sm:inline">{isRunning ? 'Streaming' : 'Paused'}</span>
            </button>

            <button
              onClick={stepEvent}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Generate single simulated event step"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            {/* Speed toggle */}
            <div className="hidden lg:flex items-center text-[10px] text-slate-400 px-1 border-l border-slate-800 gap-1">
              {[
                { label: '1x', speed: 1500 },
                { label: '2x', speed: 800 },
                { label: '5x', speed: 300 }
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setStreamSpeed(opt.speed)}
                  className={`px-1.5 py-0.5 rounded font-mono ${
                    streamSpeed === opt.speed 
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold' 
                      : 'hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Clock & Alerts Bell */}
        <div className="flex items-center gap-2.5">
          {/* UTC Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{timeUtc}</span>
          </div>

          {/* Notification Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="View triggered alerts"
            >
              <Bell className="w-4 h-4" />
              {openAlerts.length > 0 && (
                <span className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${
                  criticalCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
                }`}>
                  {openAlerts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Active Security Alerts ({openAlerts.length})
                    </span>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('investigation');
                      }}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      View all in SOC <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {openAlerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                      No active alerts open. Network baseline is nominal.
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                      {openAlerts.slice(0, 5).map(alert => (
                        <div
                          key={alert.id}
                          onClick={() => {
                            setShowNotifications(false);
                            onOpenAlert(alert.id);
                          }}
                          className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition text-left"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[10px] text-slate-400">{alert.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              alert.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-200 line-clamp-1">{alert.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Src: {alert.sourceIp} &rarr; Dst: {alert.destIp}:{alert.destPort}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
