/**
 * SentinelAI - SOC Processing Workflow Pipeline View
 * 
 * Interactive 7-stage pipeline visualization mapping raw telemetry
 * to normalized events, rule evaluation, anomaly scoring, triage,
 * and incident resolution.
 */

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  ChevronRight, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause, 
  CheckCircle, 
  Layers, 
  FileCode, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Sparkles,
  Info
} from 'lucide-react';
import { WORKFLOW_STAGES } from '../data/workflowData';

export const WorkflowView: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const currentStage = WORKFLOW_STAGES[activeStageIndex];

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStageIndex(prev => (prev + 1) % WORKFLOW_STAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-violet-400" />
            <h1 className="text-base font-bold text-white uppercase tracking-wider">
              Autonomous SecOps Pipeline Architecture
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Step through the 7-stage security processing pipeline from wire ingestion to automated resolution.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isAutoPlaying 
                ? 'bg-amber-600/30 text-amber-300 border border-amber-600/50' 
                : 'bg-slate-800 text-slate-200 hover:text-white border border-slate-700'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isAutoPlaying ? 'Pause Walkthrough' : 'Auto-Play Pipeline'}
          </button>
        </div>
      </div>

      {/* Horizontal Pipeline Stepper Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] relative">
          
          {/* Connector line behind steps */}
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-800 -z-0">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${(activeStageIndex / (WORKFLOW_STAGES.length - 1)) * 100}%` }}
            />
          </div>

          {WORKFLOW_STAGES.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            const isCompleted = idx < activeStageIndex;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  setActiveStageIndex(idx);
                  setIsAutoPlaying(false);
                }}
                className="relative z-10 flex flex-col items-center group cursor-pointer text-center px-1"
              >
                {/* Step Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-950 scale-110' 
                    : isCompleted 
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-800' 
                    : 'bg-slate-900 text-slate-400 border border-slate-800 group-hover:border-slate-700'
                }`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4 text-cyan-400" /> : stage.stepNumber}
                </div>

                {/* Step Title Label */}
                <div className="mt-2 text-center max-w-[90px]">
                  <div className={`text-[11px] font-semibold tracking-tight line-clamp-1 transition ${
                    isActive ? 'text-cyan-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {stage.title.split(' ')[0]} {stage.title.split(' ')[1] || ''}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">Stage 0{stage.stepNumber}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Deep-Dive Container */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-6">
        
        {/* Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                Stage 0{currentStage.stepNumber} of 07
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {currentStage.id}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{currentStage.title}</h2>
            <p className="text-xs text-cyan-400 font-medium mt-0.5">{currentStage.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveStageIndex(p => Math.max(0, p - 1));
                setIsAutoPlaying(false);
              }}
              disabled={activeStageIndex === 0}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveStageIndex(p => Math.min(WORKFLOW_STAGES.length - 1, p + 1));
                setIsAutoPlaying(false);
              }}
              disabled={activeStageIndex === WORKFLOW_STAGES.length - 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          {currentStage.description}
        </p>

        {/* 3-Column Specifications: Inputs -> Processing -> Outputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Inputs */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Received Ingestion Inputs
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {currentStage.inputs.map((inp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">&bull;</span>
                  <span>{inp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Processing */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              Internal Processing Logic
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {currentStage.processingDetails.map((proc, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-violet-400 mt-0.5">&bull;</span>
                  <span>{proc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Outputs */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Emitted Pipeline Output
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {currentStage.outputs.map((outp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">&bull;</span>
                  <span>{outp}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Live Technical Payloads: Input Sample vs Output Sample */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              Pipeline Telemetry Payloads (Input &rarr; Output Transformation)
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              {currentStage.keyMetric}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
            {/* Input payload */}
            <div>
              <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                <span>[INPUT PAYLOAD RECORD]</span>
                <span>JSON</span>
              </div>
              <pre className="p-3 rounded-lg bg-[#070a13] border border-slate-850 text-cyan-300/80 overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(currentStage.samplePayload.inputSample, null, 2)}
              </pre>
            </div>

            {/* Output payload */}
            <div>
              <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                <span>[PROCESSED STAGE OUTPUT]</span>
                <span>JSON</span>
              </div>
              <pre className="p-3 rounded-lg bg-[#070a13] border border-slate-850 text-emerald-300/80 overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(currentStage.samplePayload.outputSample, null, 2)}
              </pre>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
