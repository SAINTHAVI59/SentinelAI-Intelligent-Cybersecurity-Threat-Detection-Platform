/**
 * SentinelAI - Threat Detection Engine
 * 
 * Implements deterministic client-side signature and behavioral detection rules.
 * Generates transparent alerts containing:
 * - Clear human-readable detection reason
 * - Quantitative supporting evidence (counts, thresholds, intervals)
 * - Assigned severity
 * - MITRE ATT&CK technique mapping
 * - Recommended triage and containment steps
 */

import { DetectionRule, DetectionResult, SecurityEvent, SecurityAlert, IncidentStatus } from '../types';

export const DETECTION_RULES: DetectionRule[] = [
  // RULE 1: Brute Force Authentication (MITRE ATT&CK T1110)
  {
    id: 'RULE-AUTH-001',
    name: 'Repeated Authentication Failure (Brute Force)',
    description: 'Detects a high frequency of authentication failures from a single source IP targeting authentication services within a 60-second window.',
    mitreId: 'T1110',
    mitreTactic: 'Credential Access',
    severity: 'HIGH',
    category: 'AUTHENTICATION',
    enabled: true,
    evaluate: (recentEvents: SecurityEvent[], currentEvent: SecurityEvent): DetectionResult | null => {
      if (currentEvent.status !== 'FAILED_AUTH') return null;

      const windowMs = 60 * 1000;
      const currentTs = new Date(currentEvent.timestamp).getTime();
      
      const failedAuthEvents = recentEvents.filter(e => {
        const eTs = new Date(e.timestamp).getTime();
        return (
          e.sourceIp === currentEvent.sourceIp &&
          e.status === 'FAILED_AUTH' &&
          currentTs - eTs >= 0 &&
          currentTs - eTs <= windowMs
        );
      });

      const count = failedAuthEvents.length;
      const threshold = 4;

      if (count >= threshold) {
        return {
          triggered: true,
          ruleId: 'RULE-AUTH-001',
          ruleName: 'Repeated Authentication Failure (Brute Force)',
          mitreId: 'T1110',
          mitreTactic: 'Credential Access',
          severity: count >= 7 ? 'CRITICAL' : 'HIGH',
          explanation: `Source host ${currentEvent.sourceIp} generated ${count} failed authentication attempts within a 60-second sliding window, exceeding the threshold of ${threshold}. This behavioral pattern aligns with automated credential stuffing or dictionary attacks.`,
          evidence: [
            {
              metric: 'Failed Auth Count',
              value: count,
              threshold: `${threshold} attempts in 60s`,
              significance: 'Exceeds normal human retry rate for forgotten passwords.'
            },
            {
              metric: 'Target Service',
              value: `${currentEvent.destIp}:${currentEvent.destPort} (${currentEvent.protocol})`,
              threshold: 'N/A',
              significance: 'Authentication endpoint attacked.'
            },
            {
              metric: 'Source Origin',
              value: `${currentEvent.sourceIp} [${currentEvent.countryCode || 'INT'}]`,
              threshold: 'N/A',
              significance: 'External or untrusted ingress node.'
            }
          ],
          recommendedActions: [
            'Enforce temporary IP rate limiting or block source IP at the perimeter firewall.',
            'Verify if target accounts were locked out by directory services.',
            'Review server auth logs to determine whether default usernames (admin, root, test) were targeted.',
            'Check for any subsequent SUCCESS_AUTH from the same source IP indicating a compromised account.'
          ]
        };
      }
      return null;
    }
  },

  // RULE 2: Suspicious Port Sweep / Reconnaissance (MITRE ATT&CK T1046)
  {
    id: 'RULE-NET-002',
    name: 'Multi-Port Reconnaissance Sweep (Port Scan)',
    description: 'Detects single source host attempting connections across multiple distinct destination ports in rapid succession.',
    mitreId: 'T1046',
    mitreTactic: 'Discovery',
    severity: 'MEDIUM',
    category: 'RECONNAISSANCE',
    enabled: true,
    evaluate: (recentEvents: SecurityEvent[], currentEvent: SecurityEvent): DetectionResult | null => {
      const windowMs = 45 * 1000;
      const currentTs = new Date(currentEvent.timestamp).getTime();

      const hostEvents = recentEvents.filter(e => {
        const eTs = new Date(e.timestamp).getTime();
        return (
          e.sourceIp === currentEvent.sourceIp &&
          currentTs - eTs >= 0 &&
          currentTs - eTs <= windowMs
        );
      });

      const probedPorts = Array.from(new Set(hostEvents.map(e => e.destPort)));
      const threshold = 4;

      if (probedPorts.length >= threshold) {
        return {
          triggered: true,
          ruleId: 'RULE-NET-002',
          ruleName: 'Multi-Port Reconnaissance Sweep (Port Scan)',
          mitreId: 'T1046',
          mitreTactic: 'Discovery',
          severity: probedPorts.length >= 7 ? 'HIGH' : 'MEDIUM',
          explanation: `Source host ${currentEvent.sourceIp} probed ${probedPorts.length} distinct service ports (${probedPorts.slice(0, 5).join(', ')}${probedPorts.length > 5 ? '...' : ''}) within 45 seconds. This indicates automated network discovery tooling attempting to map open perimeter services.`,
          evidence: [
            {
              metric: 'Distinct Ports Probed',
              value: probedPorts.length,
              threshold: `${threshold} ports in 45s`,
              significance: 'Deviation from typical application traffic which connects to single static port.'
            },
            {
              metric: 'Target Host',
              value: currentEvent.destIp,
              threshold: 'Single subnet/host',
              significance: 'Targeted host discovery.'
            },
            {
              metric: 'Observed Ports List',
              value: probedPorts.join(', '),
              threshold: 'N/A',
              significance: 'Includes high-risk or administrative ports.'
            }
          ],
          recommendedActions: [
            'Inspect perimeter edge firewall drop logs to confirm whether probes were rejected.',
            'Review honeypot or IDS telemetry for complementary signatures.',
            'Apply temporary TCP RST or DROP rule at the ingress border router for source IP.'
          ]
        };
      }
      return null;
    }
  },

  // RULE 3: Unusually Frequent Requests / Volumetric Burst (MITRE ATT&CK T1499)
  {
    id: 'RULE-DOS-003',
    name: 'Unusually Frequent Requests / Traffic Spike',
    description: 'Detects excessive request volume from a single IP or protocol endpoint within a short time frame, characteristic of scraping or denial of service attempts.',
    mitreId: 'T1499',
    mitreTactic: 'Impact',
    severity: 'MEDIUM',
    category: 'DENIAL_OF_SERVICE',
    enabled: true,
    evaluate: (recentEvents: SecurityEvent[], currentEvent: SecurityEvent): DetectionResult | null => {
      const windowMs = 15 * 1000; // 15 seconds
      const currentTs = new Date(currentEvent.timestamp).getTime();

      const eventsInWindow = recentEvents.filter(e => {
        const eTs = new Date(e.timestamp).getTime();
        return (
          e.sourceIp === currentEvent.sourceIp &&
          currentTs - eTs >= 0 &&
          currentTs - eTs <= windowMs
        );
      });

      const requestCount = eventsInWindow.length;
      const threshold = 12;

      if (requestCount >= threshold) {
        return {
          triggered: true,
          ruleId: 'RULE-DOS-003',
          ruleName: 'Unusually Frequent Requests / Traffic Spike',
          mitreId: 'T1499',
          mitreTactic: 'Impact',
          severity: requestCount >= 20 ? 'HIGH' : 'MEDIUM',
          explanation: `Source IP ${currentEvent.sourceIp} generated ${requestCount} network transactions in 15 seconds, exceeding the standard rate limit threshold (${threshold} req/15s). This may degrade upstream API availability or indicate automated crawling.`,
          evidence: [
            {
              metric: 'Request Frequency',
              value: `${(requestCount / 15).toFixed(1)} req/sec`,
              threshold: `${(threshold / 15).toFixed(1)} req/sec`,
              significance: 'High frequency requests over short sliding window.'
            },
            {
              metric: 'Cumulative Volume',
              value: `${requestCount} events in 15s`,
              threshold: `${threshold} events`,
              significance: 'Substantial burst relative to baseline enterprise distribution.'
            }
          ],
          recommendedActions: [
            'Trigger API gateway rate limiter / WAF challenge (e.g. Turnstile or Captcha).',
            'Verify server CPU and worker pool saturation on target destination.',
            'Check User-Agent strings across requests for automated bot or scraper identifiers.'
          ]
        };
      }
      return null;
    }
  },

  // RULE 4: Unusual Outbound Payload / Data Exfiltration (MITRE ATT&CK T1048)
  {
    id: 'RULE-EXFIL-004',
    name: 'Anomalous Large Data Transfer (Potential Exfiltration)',
    description: 'Detects outbound network transfers with payload volume significantly exceeding typical baselines (>2.5MB in single or concentrated burst).',
    mitreId: 'T1048',
    mitreTactic: 'Exfiltration',
    severity: 'HIGH',
    category: 'EXFILTRATION',
    enabled: true,
    evaluate: (_recentEvents: SecurityEvent[], currentEvent: SecurityEvent): DetectionResult | null => {
      const sizeBytes = currentEvent.payloadSize;
      const thresholdBytes = 2500000; // 2.5 MB

      // Outbound to non-internal IP or sensitive service
      if (sizeBytes >= thresholdBytes) {
        const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2);
        return {
          triggered: true,
          ruleId: 'RULE-EXFIL-004',
          ruleName: 'Anomalous Large Data Transfer (Potential Exfiltration)',
          mitreId: 'T1048',
          mitreTactic: 'Exfiltration',
          severity: sizeBytes > 5000000 ? 'CRITICAL' : 'HIGH',
          explanation: `A large outbound transmission of ${sizeMb} MB was initiated by ${currentEvent.sourceIp} to remote endpoint ${currentEvent.destIp}:${currentEvent.destPort} over ${currentEvent.protocol}. This exceeds standard transactional payloads and warrants inspection for unauthorized archive staging or data transfer.`,
          evidence: [
            {
              metric: 'Payload Size',
              value: `${sizeMb} MB (${sizeBytes.toLocaleString()} bytes)`,
              threshold: '2.5 MB threshold',
              significance: 'Exceeds standard 99th percentile HTTP/TCP request size.'
            },
            {
              metric: 'Remote Destination',
              value: `${currentEvent.destIp}:${currentEvent.destPort}`,
              threshold: 'External destination',
              significance: 'Data leaving protected internal perimeter.'
            }
          ],
          recommendedActions: [
            'Isolate source workstation/host from internal network segment immediately.',
            'Review proxy/DLP metadata to identify specific files or endpoints transferred.',
            'Verify whether transfer was authorized business backup or cloud sync activity.'
          ]
        };
      }
      return null;
    }
  },

  // RULE 5: Suspicious High-Risk Port Connection (MITRE ATT&CK T1021 / T1071)
  {
    id: 'RULE-PORT-005',
    name: 'Suspicious Administrative Port Access',
    description: 'Detects external connection attempts directed at unencrypted or high-risk remote management services (Telnet 23, SMB 445, RDP 3389).',
    mitreId: 'T1021',
    mitreTactic: 'Lateral Movement',
    severity: 'MEDIUM',
    category: 'RECONNAISSANCE',
    enabled: true,
    evaluate: (_recentEvents: SecurityEvent[], currentEvent: SecurityEvent): DetectionResult | null => {
      const highRiskPorts = [23, 445, 3389, 4444, 9001];
      if (highRiskPorts.includes(currentEvent.destPort) && (currentEvent.status === 'SUSPICIOUS' || currentEvent.status === 'DENY' || currentEvent.status === 'FAILED_AUTH')) {
        return {
          triggered: true,
          ruleId: 'RULE-PORT-005',
          ruleName: 'Suspicious Administrative Port Access',
          mitreId: 'T1021',
          mitreTactic: 'Lateral Movement',
          severity: currentEvent.destPort === 4444 || currentEvent.destPort === 23 ? 'HIGH' : 'MEDIUM',
          explanation: `Ingress traffic from ${currentEvent.sourceIp} targeted sensitive administrative port ${currentEvent.destPort} (${currentEvent.protocol}). Direct exposure of this port carries heightened risk of remote compromise or protocol exploit.`,
          evidence: [
            {
              metric: 'Destination Port',
              value: `${currentEvent.destPort} (${currentEvent.eventType})`,
              threshold: 'Restricted administrative port',
              significance: 'Port is classified as sensitive and should not be publicly accessible.'
            },
            {
              metric: 'Connection Disposition',
              value: currentEvent.status,
              threshold: 'N/A',
              significance: 'Connection encountered security rejection or failed authentication.'
            }
          ],
          recommendedActions: [
            'Confirm internal firewall ACLs prevent external WAN exposure of port ' + currentEvent.destPort + '.',
            'Mandate VPN and multi-factor authentication (MFA) for any necessary administrative endpoints.',
            'Audit endpoint for unpatched vulnerabilities (e.g. MS17-010 EternalBlue for port 445).'
          ]
        };
      }
      return null;
    }
  }
];

/**
 * Runs the detection pipeline on a newly arrived event against recent event history.
 * Returns any newly triggered SecurityAlert.
 */
export function evaluateEventForAlerts(
  currentEvent: SecurityEvent,
  recentEvents: SecurityEvent[]
): SecurityAlert[] {
  const generatedAlerts: SecurityAlert[] = [];

  for (const rule of DETECTION_RULES) {
    if (!rule.enabled) continue;

    try {
      const result = rule.evaluate(recentEvents, currentEvent);
      if (result && result.triggered) {
        // Tag the event with this rule
        if (!currentEvent.flaggedByRules) currentEvent.flaggedByRules = [];
        if (!currentEvent.flaggedByRules.includes(rule.id)) {
          currentEvent.flaggedByRules.push(rule.id);
        }

        // Find related events (same source IP or dest IP)
        const relatedIds = recentEvents
          .filter(e => e.sourceIp === currentEvent.sourceIp && e.id !== currentEvent.id)
          .slice(-5)
          .map(e => e.id);

        const alert: SecurityAlert = {
          id: `ALT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
          timestamp: currentEvent.timestamp,
          eventId: currentEvent.id,
          ruleId: rule.id,
          title: result.ruleName,
          severity: result.severity,
          status: 'OPEN' as IncidentStatus,
          sourceIp: currentEvent.sourceIp,
          destIp: currentEvent.destIp,
          destPort: currentEvent.destPort,
          protocol: currentEvent.protocol,
          eventType: currentEvent.eventType,
          mitreId: result.mitreId,
          mitreTactic: result.mitreTactic,
          explanation: result.explanation,
          evidence: result.evidence,
          recommendedActions: result.recommendedActions,
          notes: [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: new Date().toISOString(),
              author: 'SentinelAI Engine',
              content: `Automated detection triggered by rule ${rule.id} [${rule.mitreId}]. Severity set to ${result.severity}.`
            }
          ],
          relatedEventIds: relatedIds
        };

        generatedAlerts.push(alert);
      }
    } catch (err) {
      console.error(`Error evaluating detection rule ${rule.id}:`, err);
    }
  }

  return generatedAlerts;
}
