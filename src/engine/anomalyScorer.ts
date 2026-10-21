/**
 * SentinelAI - Statistical & Heuristic Anomaly Scoring Engine
 * 
 * Computes an interpretable composite anomaly score (0 - 100)
 * based on multi-dimensional event feature extraction.
 * 
 * Note: Anomaly scores are probabilistic indicators designed for analyst triage,
 * not definitive proof of malicious intent.
 */

import { SecurityEvent } from '../types';

export interface AnomalyBreakdown {
  score: number;
  factors: {
    factor: string;
    score: number;
    description: string;
  }[];
}

// Critical / high-risk ports commonly targeted in attacks
const SENSITIVE_PORTS: Record<number, { name: string; weight: number }> = {
  21: { name: 'FTP', weight: 15 },
  22: { name: 'SSH', weight: 18 },
  23: { name: 'Telnet', weight: 25 },
  445: { name: 'SMB', weight: 22 },
  1433: { name: 'MSSQL', weight: 20 },
  3306: { name: 'MySQL', weight: 16 },
  3389: { name: 'RDP', weight: 22 },
  4444: { name: 'Metasploit Default', weight: 35 },
  8080: { name: 'HTTP-Alt/Proxy', weight: 10 },
  9001: { name: 'Tor/Backdoor', weight: 30 },
};

/**
 * Calculates the anomaly score for a given security event
 * based on historical context and event attributes.
 */
export function calculateAnomalyScore(
  event: Partial<SecurityEvent>,
  recentEventsFromIp: SecurityEvent[] = []
): AnomalyBreakdown {
  const factors: { factor: string; score: number; description: string }[] = [];
  let totalScore = 5; // benign baseline noise

  // 1. Destination Port Risk Weight
  const port = event.destPort || 80;
  if (SENSITIVE_PORTS[port]) {
    const portInfo = SENSITIVE_PORTS[port];
    totalScore += portInfo.weight;
    factors.push({
      factor: 'Sensitive Port Target',
      score: portInfo.weight,
      description: `Target port ${port} (${portInfo.name}) is a high-value attack surface.`,
    });
  }

  // 2. Authentication Status Risk
  if (event.status === 'FAILED_AUTH') {
    const authFailWeight = 25;
    totalScore += authFailWeight;
    factors.push({
      factor: 'Authentication Failure',
      score: authFailWeight,
      description: 'Credentials rejected or authorization denied.',
    });
  } else if (event.status === 'SUSPICIOUS') {
    const suspWeight = 20;
    totalScore += suspWeight;
    factors.push({
      factor: 'Unusual Packet Flags / Header Anomaly',
      score: suspWeight,
      description: 'Packet headers exhibit non-standard or fragmented TCP flags.',
    });
  }

  // 3. Request Frequency / Burst Velocity from same Source IP
  const now = event.timestamp ? new Date(event.timestamp).getTime() : Date.now();
  const eventsInLast30s = recentEventsFromIp.filter(e => {
    const diff = Math.abs(now - new Date(e.timestamp).getTime());
    return diff <= 30000;
  }).length;

  if (eventsInLast30s > 20) {
    const burstScore = 30;
    totalScore += burstScore;
    factors.push({
      factor: 'Extreme Request Velocity',
      score: burstScore,
      description: `${eventsInLast30s} requests observed in 30s window (Volumetric anomaly).`,
    });
  } else if (eventsInLast30s > 8) {
    const burstScore = 15;
    totalScore += burstScore;
    factors.push({
      factor: 'Elevated Request Rate',
      score: burstScore,
      description: `${eventsInLast30s} requests observed in 30s window.`,
    });
  }

  // 4. Payload Size Deviation
  // Typical enterprise HTTP requests are between 0.5KB and 150KB.
  const size = event.payloadSize || 0;
  if (size > 2000000) { // > 2MB
    const payloadWeight = 25;
    totalScore += payloadWeight;
    factors.push({
      factor: 'Massive Payload Size',
      score: payloadWeight,
      description: `Payload size ${(size / (1024 * 1024)).toFixed(2)} MB exceeds normal operational baseline (>2MB).`,
    });
  } else if (size > 500000) { // > 500KB
    const payloadWeight = 12;
    totalScore += payloadWeight;
    factors.push({
      factor: 'Large Outbound Payload',
      score: payloadWeight,
      description: `Payload size ${(size / 1024).toFixed(1)} KB is moderately higher than average web baseline.`,
    });
  }

  // 5. Port Diversity from Single IP (Port Scanning Indicator)
  const distinctPortsTargeted = new Set(recentEventsFromIp.map(e => e.destPort)).size;
  if (distinctPortsTargeted >= 4) {
    const scanScore = 25;
    totalScore += scanScore;
    factors.push({
      factor: 'Port Diversity Sweep',
      score: scanScore,
      description: `Host connected to ${distinctPortsTargeted} distinct destination ports recently (Reconnaissance pattern).`,
    });
  }

  // Bound score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  return {
    score: normalizedScore,
    factors,
  };
}
