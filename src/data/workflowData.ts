/**
 * SentinelAI - SOC Processing Workflow Pipeline Data
 * 
 * Defines the 7 stages of security telemetry ingestion, analysis,
 * alerting, and incident response.
 */

import { WorkflowStage } from '../types';

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'stage-gen',
    stepNumber: 1,
    title: 'Event Generation & Ingestion',
    subtitle: 'Raw packet captures, syslog, and audit streams',
    description: 'Raw network telemetry, firewalls, endpoint agents, and identity providers emit disparate log streams at scale.',
    inputs: [
      'Raw PCAP packet headers (IPv4/IPv6, TCP, UDP)',
      'Perimeter firewall logs (Cisco, Palo Alto, iptables)',
      'Syslog & Linux auth.log / Windows Event Logs (EventID 4625/4624)',
      'Cloud audit trails (AWS CloudTrail, GCP Cloud Audit Logs)'
    ],
    processingDetails: [
      'Asynchronous ingestion queues via streaming brokers (Kafka / Kinesis)',
      'High-throughput timestamp tagging in UTC format',
      'Rate limiting and buffer backpressure controls to prevent socket drops'
    ],
    outputs: [
      'Raw serialized JSON log records with arrival timestamps and stream origins'
    ],
    samplePayload: {
      inputSample: {
        raw_syslog: "<134>1 2026-10-21T04:48:12Z firewall01 kernel - - [drop] IN=eth0 OUT=eth1 SRC=185.220.101.5 DST=10.0.3.22 PROTO=TCP SPT=49210 DPT=22 FLAGS=0x02",
        source_daemon: "syslogd-forwarder-v3",
        ingest_latency_ms: 1.4
      },
      outputSample: {
        status: "BUFFERED_FOR_NORMALIZATION",
        batch_id: "BATCH-8921",
        raw_size_bytes: 184
      }
    },
    keyMetric: 'Average ingestion latency: < 2.5 ms'
  },
  {
    id: 'stage-norm',
    stepNumber: 2,
    title: 'Event Normalisation',
    subtitle: 'Standardized schema mapping (CEF / ECS)',
    description: 'Transforms multi-vendor disparate log structures into an unified, strongly-typed internal schema.',
    inputs: [
      'Raw log payloads from various proprietary vendors',
      'IP geolocation databases (MaxMind GeoIP)',
      'Known internal asset registry & subnet mapping definitions'
    ],
    processingDetails: [
      'Extract IP addresses, ports, protocol names, and status codes',
      'Enrich source and destination IPs with country code and organizational ASN',
      'Map internal private subnets (RFC 1918) to designated server asset roles',
      'Validate field types and drop malformed packets'
    ],
    outputs: [
      'Canonical `SecurityEvent` model compliant with Common Event Format (CEF)'
    ],
    samplePayload: {
      inputSample: {
        raw_text: "IN=eth0 SRC=185.220.101.5 DST=10.0.3.22 DPT=22"
      },
      outputSample: {
        id: "EVT-98124-1002",
        timestamp: "2026-10-21T04:48:12.140Z",
        sourceIp: "185.220.101.5",
        destIp: "10.0.3.22",
        destPort: 22,
        protocol: "SSH",
        country: "Germany",
        countryCode: "DE",
        status: "FAILED_AUTH"
      }
    },
    keyMetric: '99.98% parser accuracy across multi-vendor schemas'
  },
  {
    id: 'stage-rules',
    stepNumber: 3,
    title: 'Detection Rules Engine',
    subtitle: 'Deterministic signatures & sliding-window thresholds',
    description: 'Evaluates normalized events against predefined security detection logic mapped directly to MITRE ATT&CK techniques.',
    inputs: [
      'Incoming normalized SecurityEvent object',
      'Sliding window state buffer of recent events (last 15s to 60s)'
    ],
    processingDetails: [
      'Correlates events across temporal windows per IP and target entity',
      'Evaluates signature thresholds (e.g., >4 failed authentications in 60s)',
      'Identifies port sweep patterns across distinct destination ports',
      'Flags volume anomalies and restricted service ingress'
    ],
    outputs: [
      'Rule evaluation status and raw triggered flags with MITRE ATT&CK tags'
    ],
    samplePayload: {
      inputSample: {
        rule_eval_target: "RULE-AUTH-001 (T1110 Brute Force)",
        source_ip_bucket: "185.220.101.5",
        failed_count_window: 5
      },
      outputSample: {
        ruleId: "RULE-AUTH-001",
        triggered: true,
        mitreId: "T1110",
        severity: "HIGH",
        threshold_met: "5 >= 4 failures in 60s"
      }
    },
    keyMetric: 'Rule execution time: < 0.8 ms per event'
  },
  {
    id: 'stage-scoring',
    stepNumber: 4,
    title: 'Anomaly Scoring Module',
    subtitle: 'Heuristic & statistical feature vector evaluation',
    description: 'Calculates an objective risk score (0 to 100) based on mathematical features rather than rigid binary rules.',
    inputs: [
      'Event feature vector: Port criticality, burst velocity, payload size, failure status'
    ],
    processingDetails: [
      'Weighted summation of port vulnerability coefficients (e.g. SMB 445 = +22)',
      'Payload size deviation analysis (Z-score against historical 2MB baseline)',
      'Rate-of-change burst multiplier calculation based on temporal event density',
      'Bounding score into standardized 0 - 100 integer range'
    ],
    outputs: [
      'Composite Anomaly Score (0–100) and explainable factor contribution breakdown'
    ],
    samplePayload: {
      inputSample: {
        destPort: 22,
        failedAuth: true,
        burstCountLast30s: 6
      },
      outputSample: {
        anomalyScore: 68,
        factors: [
          { factor: "Sensitive Port Target", score: 18 },
          { factor: "Authentication Failure", score: 25 },
          { factor: "Elevated Request Rate", score: 15 }
        ]
      }
    },
    keyMetric: 'Feature calculation latency: ~0.2 ms'
  },
  {
    id: 'stage-priority',
    stepNumber: 5,
    title: 'Alert Prioritisation & Deduplication',
    subtitle: 'Noise reduction and triage assignment',
    description: 'Suppresses duplicate alerts, clusters related telemetry, and assigns SLA targets to prevent alert fatigue.',
    inputs: [
      'Triggered detection results from Rules Engine',
      'Anomaly scores from Anomaly Scoring Module'
    ],
    processingDetails: [
      'Deduplicates repeated alerts from identical source within active alert cooldown',
      'Correlates related events (e.g. port scan followed by brute force attempt)',
      'Escalates severity if high anomaly score is paired with high-risk target',
      'Generates incident ticket in SIEM incident database'
    ],
    outputs: [
      'Structured `SecurityAlert` containing evidence, suggested response, and status'
    ],
    samplePayload: {
      inputSample: {
        raw_triggers: ["RULE-AUTH-001"],
        anomaly_score: 82
      },
      outputSample: {
        alertId: "ALT-39281-201",
        title: "Repeated Authentication Failure (Brute Force)",
        assigned_sla_minutes: 15,
        status: "OPEN"
      }
    },
    keyMetric: '72% alert noise reduction via deduplication'
  },
  {
    id: 'stage-investigation',
    stepNumber: 6,
    title: 'Incident Investigation',
    subtitle: 'Analyst triage, graph visualization & evidence audit',
    description: 'SOC analysts examine the relationship graph, inspect raw packet evidence, review the timeline, and add audit notes.',
    inputs: [
      'SecurityAlert record, related events history, node-link topological graph'
    ],
    processingDetails: [
      'Correlate attacking source IP with internal destination servers',
      'Analyze historical timeline of events preceding the alert',
      'Verify whether target service accepted or rejected rogue traffic',
      'Update incident status to "INVESTIGATING" and attach analyst triage notes'
    ],
    outputs: [
      'Enriched incident dossier with analyst findings and containment decision'
    ],
    samplePayload: {
      inputSample: {
        alertId: "ALT-39281-201",
        analyst_action: "BEGIN_TRIAGE"
      },
      outputSample: {
        status: "INVESTIGATING",
        analystNotesAdded: 1,
        perimeterActionTaken: "Firewall rule staged for review"
      }
    },
    keyMetric: 'Average triage time target: < 12 minutes'
  },
  {
    id: 'stage-resolution',
    stepNumber: 7,
    title: 'Incident Resolution & Playbooks',
    subtitle: 'Remediation, reporting, and closure',
    description: 'Executes containment playbooks (e.g. IP block, credential reset), documents root cause, and generates compliance reports.',
    inputs: [
      'Completed investigation findings, verified containment confirmations'
    ],
    processingDetails: [
      'Execute automated or manual remediation (perimeter IP block, session revocation)',
      'Update alert status to "RESOLVED" with resolution reason and timestamp',
      'Generate printable incident summary report and export CSV/JSON logs',
      'Feed indicators of compromise (IOCs) into threat intelligence repository'
    ],
    outputs: [
      'Resolved incident record, downloadable compliance audit report, and closed ticket'
    ],
    samplePayload: {
      inputSample: {
        incidentId: "ALT-39281-201",
        resolutionStatus: "RESOLVED",
        resolutionReason: "Attacker IP blocked at perimeter firewall. No credentials breached."
      },
      outputSample: {
        isClosed: true,
        resolvedAt: "2026-10-21T04:59:12.000Z",
        exportReady: true
      }
    },
    keyMetric: 'Resolution MTTR achieved: 11.4 minutes'
  }
];
