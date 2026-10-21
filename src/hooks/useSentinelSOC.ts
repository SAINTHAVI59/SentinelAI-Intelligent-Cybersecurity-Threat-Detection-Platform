/**
 * SentinelAI - Core Security Operations Center Hook
 * 
 * Manages event streaming, scenario toggles, alert generation,
 * incident status updates, and browser localStorage persistence.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SecurityEvent, SecurityAlert, ScenarioType, IncidentStatus } from '../types';
import { generateSyntheticEvent, generateInitialSeedEvents } from '../services/syntheticGenerator';
import { evaluateEventForAlerts } from '../engine/detectionEngine';

const STORAGE_KEY_ALERTS = 'sentinelai_alerts_v1';
const STORAGE_KEY_SCENARIO = 'sentinelai_scenario_v1';
const STORAGE_KEY_SPEED = 'sentinelai_speed_v1';

export function useSentinelSOC() {
  // Load saved scenario or default to 'BASELINE'
  const [scenario, setScenarioState] = useState<ScenarioType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCENARIO);
      return (saved as ScenarioType) || 'BASELINE';
    } catch {
      return 'BASELINE';
    }
  });

  // Streaming controls
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeedState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPEED);
      return saved ? parseInt(saved, 10) : 1500; // ms interval
    } catch {
      return 1500;
    }
  });
  const [maxBufferSize, setMaxBufferSize] = useState<number>(400);

  // In-memory events buffer
  const [events, setEvents] = useState<SecurityEvent[]>(() => {
    return generateInitialSeedEvents(35);
  });

  // Persistent alerts state
  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved alerts:', e);
    }
    // Generate initial alerts from seed events
    const initialEvents = generateInitialSeedEvents(35);
    const initialAlerts: SecurityAlert[] = [];
    for (let i = 0; i < initialEvents.length; i++) {
      const newAlerts = evaluateEventForAlerts(initialEvents[i], initialEvents.slice(0, i + 1));
      initialAlerts.push(...newAlerts);
    }
    return initialAlerts;
  });

  // Selected event for quick inspection modal
  const [inspectingEvent, setInspectingEvent] = useState<SecurityEvent | null>(null);

  // Selected alert for deep-dive investigation
  const [investigatingAlertId, setInvestigatingAlertId] = useState<string | null>(null);

  // Persist alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save alerts to localStorage:', e);
    }
  }, [alerts]);

  const setScenario = useCallback((newScenario: ScenarioType) => {
    setScenarioState(newScenario);
    try {
      localStorage.setItem(STORAGE_KEY_SCENARIO, newScenario);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const setStreamSpeed = useCallback((newSpeed: number) => {
    setStreamSpeedState(newSpeed);
    try {
      localStorage.setItem(STORAGE_KEY_SPEED, newSpeed.toString());
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Process a newly generated event through the detection engine
  const ingestEvent = useCallback((event: SecurityEvent) => {
    setEvents(prev => {
      const updated = [event, ...prev].slice(0, maxBufferSize);
      return updated;
    });

    setAlerts(prevAlerts => {
      // Evaluate rules against recent events window
      setEvents(currentEvents => {
        const triggered = evaluateEventForAlerts(event, currentEvents.slice(0, 50));
        if (triggered.length > 0) {
          // Avoid duplicate alerts within short cooldown
          const uniqueTriggered = triggered.filter(newAlert => {
            const exists = prevAlerts.some(
              a => a.ruleId === newAlert.ruleId &&
                   a.sourceIp === newAlert.sourceIp &&
                   a.status === 'OPEN' &&
                   Math.abs(new Date(a.timestamp).getTime() - new Date(newAlert.timestamp).getTime()) < 30000
            );
            return !exists;
          });

          if (uniqueTriggered.length > 0) {
            return currentEvents; // trigger alert update via alert setter below
          }
        }
        return currentEvents;
      });

      // Compute actual triggered alerts
      setEvents(currentEvents => {
        const triggered = evaluateEventForAlerts(event, currentEvents.slice(0, 50));
        if (triggered.length > 0) {
          const uniqueTriggered = triggered.filter(newAlert => {
            const exists = prevAlerts.some(
              a => a.ruleId === newAlert.ruleId &&
                   a.sourceIp === newAlert.sourceIp &&
                   a.status === 'OPEN' &&
                   Math.abs(new Date(a.timestamp).getTime() - new Date(newAlert.timestamp).getTime()) < 30000
            );
            return !exists;
          });

          if (uniqueTriggered.length > 0) {
            setAlerts(existing => [...uniqueTriggered, ...existing].slice(0, 150));
          }
        }
        return currentEvents;
      });

      return prevAlerts;
    });
  }, [maxBufferSize]);

  // Step manually generates 1 event
  const stepEvent = useCallback(() => {
    const newEvent = generateSyntheticEvent(scenario, events.slice(0, 30));
    ingestEvent(newEvent);
  }, [scenario, events, ingestEvent]);

  // Event stream timer loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const newEvent = generateSyntheticEvent(scenario, events.slice(0, 30));
      ingestEvent(newEvent);
    }, streamSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, scenario, streamSpeed, events, ingestEvent]);

  // Update incident status with analyst notes
  const updateAlertStatus = useCallback((
    alertId: string, 
    newStatus: IncidentStatus, 
    author = 'SOC Analyst (Demo)', 
    noteText = ''
  ) => {
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;

      const updatedNotes = [...a.notes];
      if (noteText.trim()) {
        updatedNotes.push({
          id: `NOTE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author,
          content: noteText
        });
      } else {
        updatedNotes.push({
          id: `NOTE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author,
          content: `Incident status transitioned to ${newStatus}.`
        });
      }

      return {
        ...a,
        status: newStatus,
        notes: updatedNotes,
        resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : a.resolvedAt,
        resolutionReason: newStatus === 'RESOLVED' ? (noteText || 'Mitigation applied. Attack vector contained.') : a.resolutionReason
      };
    }));
  }, []);

  // Add analyst note to an alert
  const addAlertNote = useCallback((alertId: string, author: string, content: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      return {
        ...a,
        notes: [
          ...a.notes,
          {
            id: `NOTE-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author,
            content
          }
        ]
      };
    }));
  }, []);

  // Reset all demo data to baseline
  const resetDemoData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_ALERTS);
      localStorage.removeItem(STORAGE_KEY_SCENARIO);
      localStorage.removeItem(STORAGE_KEY_SPEED);
    } catch (e) {
      console.warn(e);
    }
    const seed = generateInitialSeedEvents(40);
    setEvents(seed);
    setScenarioState('BASELINE');
    setIsRunning(true);
    setStreamSpeedState(1500);

    // Regenerate seed alerts
    const initialAlerts: SecurityAlert[] = [];
    for (let i = 0; i < seed.length; i++) {
      const generated = evaluateEventForAlerts(seed[i], seed.slice(0, i + 1));
      initialAlerts.push(...generated);
    }
    setAlerts(initialAlerts);
    setInvestigatingAlertId(null);
    setInspectingEvent(null);
  }, []);

  return {
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
  };
}
