/**
 * SentinelAI - Intelligent Threat Detection & Security Operations Platform
 * 
 * Main Application Orchestration Component
 */

import React, { useState } from 'react';
import { useSentinelSOC } from './hooks/useSentinelSOC';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { EventDetailModal } from './components/EventDetailModal';
import { PrintableReportModal } from './components/PrintableReportModal';

// Views
import { OverviewView } from './views/OverviewView';
import { LiveMonitorView } from './views/LiveMonitorView';
import { DetectionEngineView } from './views/DetectionEngineView';
import { InvestigationView } from './views/InvestigationView';
import { WorkflowView } from './views/WorkflowView';
import { GlossaryView } from './views/GlossaryView';
import { ReportsView } from './views/ReportsView';
import { TestsView } from './views/TestsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // SOC Core Hook
  const {
    scenario,
    setScenario,
    isRunning,
    setIsRunning,
    streamSpeed,
    setStreamSpeed,
    maxBufferSize,
    setMaxBufferSize,
    events,
    alerts,
    stepEvent,
    inspectingEvent,
    setInspectingEvent,
    investigatingAlertId,
    setInvestigatingAlertId,
    updateAlertStatus,
    addAlertNote,
    resetDemoData
  } = useSentinelSOC();

  // Handle clicking an alert in Navbar or Overview
  const handleOpenAlert = (alertId: string) => {
    setInvestigatingAlertId(alertId);
    setCurrentView('investigation');
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navigation Bar */}
      <Navbar
        scenario={scenario}
        setScenario={setScenario}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        streamSpeed={streamSpeed}
        setStreamSpeed={setStreamSpeed}
        stepEvent={stepEvent}
        alerts={alerts}
        onOpenAlert={handleOpenAlert}
        toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onNavigate={setCurrentView}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          alerts={alerts}
        />

        {/* Dynamic Content Main View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentView === 'overview' && (
            <OverviewView
              events={events}
              alerts={alerts}
              scenario={scenario}
              setScenario={setScenario}
              onOpenAlert={handleOpenAlert}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'monitor' && (
            <LiveMonitorView
              events={events}
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              streamSpeed={streamSpeed}
              setStreamSpeed={setStreamSpeed}
              stepEvent={stepEvent}
              onInspectEvent={setInspectingEvent}
            />
          )}

          {currentView === 'detection' && (
            <DetectionEngineView />
          )}

          {currentView === 'investigation' && (
            <InvestigationView
              alerts={alerts}
              events={events}
              activeAlertId={investigatingAlertId}
              setActiveAlertId={setInvestigatingAlertId}
              updateAlertStatus={updateAlertStatus}
              addAlertNote={addAlertNote}
              onInspectEvent={setInspectingEvent}
              onNavigateToGlossary={() => setCurrentView('glossary')}
            />
          )}

          {currentView === 'workflow' && (
            <WorkflowView />
          )}

          {currentView === 'glossary' && (
            <GlossaryView />
          )}

          {currentView === 'reports' && (
            <ReportsView
              events={events}
              alerts={alerts}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          )}

          {currentView === 'tests' && (
            <TestsView />
          )}

          {currentView === 'settings' && (
            <SettingsView
              scenario={scenario}
              setScenario={setScenario}
              streamSpeed={streamSpeed}
              setStreamSpeed={setStreamSpeed}
              maxBufferSize={maxBufferSize}
              setMaxBufferSize={setMaxBufferSize}
              onResetData={resetDemoData}
            />
          )}
        </main>

      </div>

      {/* Modal: Raw Packet & Event Inspection Drawer */}
      <EventDetailModal
        event={inspectingEvent}
        onClose={() => setInspectingEvent(null)}
        onInvestigateHost={(ip) => {
          setInspectingEvent(null);
          setCurrentView('monitor');
        }}
      />

      {/* Modal: Formal Printable Incident Dossier */}
      {isPrintModalOpen && (
        <PrintableReportModal
          alerts={alerts}
          events={events}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

    </div>
  );
}
