/**
 * SentinelAI - TypeScript Type Definitions
 */

export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'SSH' | 'DNS' | 'SMB' | 'RDP';

export type EventStatus = 'ALLOW' | 'DENY' | 'FAILED_AUTH' | 'SUCCESS_AUTH' | 'SUSPICIOUS' | 'BLOCKED';

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export type ScenarioType = 
  | 'BASELINE' 
  | 'BRUTE_FORCE' 
  | 'PORT_SCAN' 
  | 'DATA_EXFIL' 
  | 'DDOS_FLOOD' 
  | 'ZERO_DAY_MIX';

export interface SecurityEvent {
  id: string;
  timestamp: string; // ISO string
  sourceIp: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  protocol: Protocol;
  eventType: string; // e.g. "SSH Authentication", "Port Probe", "API Request"
  payloadSize: number; // in bytes or KB
  status: EventStatus;
  country: string;
  countryCode: string;
  userAgent?: string;
  anomalyScore: number; // 0 - 100
  anomalyFactors?: {
    factor: string;
    score: number;
    description: string;
  }[];
  rawPayload?: string;
  flaggedByRules?: string[]; // Rule IDs that flagged this event
}

export interface RuleEvidenceItem {
  metric: string;
  value: string | number;
  threshold: string | number;
  significance: string;
}

export interface DetectionResult {
  triggered: boolean;
  ruleId: string;
  ruleName: string;
  mitreId: string;
  mitreTactic: string;
  severity: Severity;
  explanation: string;
  evidence: RuleEvidenceItem[];
  recommendedActions: string[];
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  mitreId: string;
  mitreTactic: string;
  severity: Severity;
  category: 'AUTHENTICATION' | 'RECONNAISSANCE' | 'EXFILTRATION' | 'DENIAL_OF_SERVICE' | 'COMMAND_CONTROL';
  enabled: boolean;
  evaluate: (recentEvents: SecurityEvent[], currentEvent: SecurityEvent) => DetectionResult | null;
}

export interface AlertNote {
  id: string;
  timestamp: string;
  author: string;
  content: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  eventId: string;
  ruleId: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  sourceIp: string;
  destIp: string;
  destPort: number;
  protocol: Protocol;
  eventType: string;
  mitreId: string;
  mitreTactic: string;
  explanation: string;
  evidence: RuleEvidenceItem[];
  recommendedActions: string[];
  notes: AlertNote[];
  relatedEventIds: string[];
  assignedAnalyst?: string;
  resolvedAt?: string;
  resolutionReason?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'sourceIp' | 'destIp' | 'port' | 'alert' | 'threat';
  severity?: Severity;
  ip?: string;
  port?: number;
  connectionsCount: number;
}

export interface GraphLink {
  source: string;
  target: string;
  protocol?: Protocol;
  label?: string;
  severity?: Severity;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  acronym?: string;
  category: 'Fundamentals' | 'Threats & Attacks' | 'Operations' | 'Architecture';
  plainEnglish: string;
  technicalDetails: string;
  example: string;
  sentinelAiRelation: string;
  tags: string[];
}

export interface WorkflowStage {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  inputs: string[];
  processingDetails: string[];
  outputs: string[];
  samplePayload: {
    inputSample: Record<string, unknown>;
    outputSample: Record<string, unknown>;
  };
  keyMetric: string;
}

export interface TestResult {
  id: string;
  name: string;
  suite: 'Detection Rules' | 'Anomaly Scoring' | 'Export Engine' | 'Data Normalizer';
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  details: string;
  expected: string;
  actual: string;
}
