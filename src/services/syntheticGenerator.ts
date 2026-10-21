/**
 * SentinelAI - Synthetic Telemetry Event Generator
 * 
 * Generates realistic synthetic network packets and audit events
 * tailored to specific attack simulation scenarios.
 * 
 * All telemetry produced is 100% synthetic and clearly labeled.
 */

import { SecurityEvent, ScenarioType, Protocol, EventStatus } from '../types';
import { calculateAnomalyScore } from '../engine/anomalyScorer';

// Internal enterprise network addresses
const INTERNAL_SERVERS = [
  { ip: '10.0.1.15', role: 'Active Directory / Auth', commonPort: 445 },
  { ip: '10.0.2.80', role: 'Enterprise Web Gateway', commonPort: 443 },
  { ip: '10.0.2.81', role: 'Internal API Service', commonPort: 8080 },
  { ip: '10.0.3.22', role: 'Bastion SSH Jump Host', commonPort: 22 },
  { ip: '10.0.4.50', role: 'Production PostgreSQL DB', commonPort: 5432 },
  { ip: '10.0.5.12', role: 'Corporate File Share (SMB)', commonPort: 445 },
  { ip: '192.168.1.104', role: 'Staff Workstation (Fin)', commonPort: 3389 },
];

const EXTERNAL_IPS = [
  { ip: '185.220.101.5', country: 'Germany', code: 'DE', tag: 'Tor Exit Node' },
  { ip: '45.154.255.89', country: 'Netherlands', code: 'NL', tag: 'Hosting Provider' },
  { ip: '194.26.29.112', country: 'Bulgaria', code: 'BG', tag: 'Cloud VPS' },
  { ip: '103.208.220.14', country: 'Singapore', code: 'SG', tag: 'Commercial ISP' },
  { ip: '198.51.100.42', country: 'United States', code: 'US', tag: 'Cloudflare Edge' },
  { ip: '203.0.113.19', country: 'Japan', code: 'JP', tag: 'Tokyo Datacenter' },
  { ip: '176.119.1.84', country: 'Brazil', code: 'BR', tag: 'Public ASN' },
  { ip: '91.240.118.23', country: 'United Kingdom', code: 'GB', tag: 'London Peer' },
];

const BENIGN_CLIENT_IPS = [
  { ip: '192.168.1.101', country: 'United States', code: 'US' },
  { ip: '192.168.1.102', country: 'United States', code: 'US' },
  { ip: '192.168.1.103', country: 'United States', code: 'US' },
  { ip: '192.168.2.45', country: 'United States', code: 'US' },
  { ip: '192.168.2.88', country: 'United States', code: 'US' },
];

const SCAN_TARGET_PORTS = [21, 22, 23, 80, 443, 445, 1433, 3306, 3389, 4444, 8080];

let eventIdCounter = 1000;

export function generateSyntheticEvent(
  scenario: ScenarioType,
  recentHistory: SecurityEvent[] = []
): SecurityEvent {
  eventIdCounter++;
  const id = `EVT-${Date.now().toString().slice(-6)}-${eventIdCounter}`;
  const timestamp = new Date().toISOString();

  let sourceIp: string;
  let destIp: string;
  let sourcePort: number = Math.floor(Math.random() * 20000 + 40000);
  let destPort: number = 443;
  let protocol: Protocol = 'HTTPS';
  let eventType = 'HTTP Web Request';
  let payloadSize = Math.floor(Math.random() * 12000 + 400); // 400B - 12KB
  let status: EventStatus = 'ALLOW';
  let country = 'United States';
  let countryCode = 'US';
  let rawPayload = 'GET /api/v1/telemetry HTTP/1.1\\r\\nHost: api.sentinel.internal\\r\\nUser-Agent: Mozilla/5.0';

  // Tailor event based on active simulation scenario
  switch (scenario) {
    case 'BRUTE_FORCE': {
      // 70% chance of generating a brute-force authentication failure from a malicious external IP
      if (Math.random() < 0.75) {
        const attacker = EXTERNAL_IPS[0]; // 185.220.101.5
        sourceIp = attacker.ip;
        country = attacker.country;
        countryCode = attacker.code;
        const targetServer = INTERNAL_SERVERS[3]; // SSH Jump Host
        destIp = targetServer.ip;
        destPort = 22;
        protocol = 'SSH';
        eventType = 'SSH Failed Login Attempt';
        status = 'FAILED_AUTH';
        payloadSize = Math.floor(Math.random() * 800 + 512);
        rawPayload = `SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1\\nFailed password for root from ${attacker.ip} port ${sourcePort} ssh2`;
      } else {
        // Interleaved benign background traffic
        const benign = BENIGN_CLIENT_IPS[Math.floor(Math.random() * BENIGN_CLIENT_IPS.length)];
        sourceIp = benign.ip;
        const srv = INTERNAL_SERVERS[1];
        destIp = srv.ip;
        destPort = srv.commonPort;
        protocol = 'HTTPS';
        eventType = 'Authorized API Call';
        status = 'ALLOW';
      }
      break;
    }

    case 'PORT_SCAN': {
      if (Math.random() < 0.8) {
        const scanner = EXTERNAL_IPS[2]; // 194.26.29.112
        sourceIp = scanner.ip;
        country = scanner.country;
        countryCode = scanner.code;
        destIp = INTERNAL_SERVERS[0].ip; // Scanning Active Directory host
        destPort = SCAN_TARGET_PORTS[Math.floor(Math.random() * SCAN_TARGET_PORTS.length)];
        protocol = destPort === 22 || destPort === 23 || destPort === 80 || destPort === 443 ? 'TCP' : 'UDP';
        eventType = `SYN Probe on Port ${destPort}`;
        status = Math.random() < 0.6 ? 'DENY' : 'SUSPICIOUS';
        payloadSize = 64; // Tiny probe packet
        rawPayload = `TCP [SYN] Seq=0 Win=1024 Len=0 MSS=1460 (Flags: [S]) Target: ${destIp}:${destPort}`;
      } else {
        const benign = BENIGN_CLIENT_IPS[0];
        sourceIp = benign.ip;
        destIp = INTERNAL_SERVERS[1].ip;
        destPort = 443;
        protocol = 'HTTPS';
        eventType = 'Corporate Intranet Access';
        status = 'ALLOW';
      }
      break;
    }

    case 'DATA_EXFIL': {
      if (Math.random() < 0.65) {
        // Internal compromised workstation exfiltrating data to external server
        sourceIp = INTERNAL_SERVERS[6].ip; // 192.168.1.104
        country = 'United States';
        countryCode = 'US';
        const receiver = EXTERNAL_IPS[1]; // 45.154.255.89 (Netherlands)
        destIp = receiver.ip;
        destPort = 443;
        protocol = 'HTTPS';
        eventType = 'Encrypted Outbound Stream';
        status = 'ALLOW';
        payloadSize = Math.floor(Math.random() * 2500000 + 3500000); // 3.5MB - 6.0MB
        rawPayload = `POST /upload/chunk_749.bin HTTP/1.1\\r\\nHost: ${receiver.ip}\\r\\nContent-Length: ${payloadSize}\\r\\nContent-Type: application/octet-stream\\r\\nEncrypted payload`;
      } else {
        const benign = BENIGN_CLIENT_IPS[1];
        sourceIp = benign.ip;
        destIp = INTERNAL_SERVERS[1].ip;
        destPort = 443;
        protocol = 'HTTPS';
        eventType = 'Standard Web Browsing';
        status = 'ALLOW';
      }
      break;
    }

    case 'DDOS_FLOOD': {
      // Rapid burst of requests targeting web gateway
      const randomExt = EXTERNAL_IPS[Math.floor(Math.random() * EXTERNAL_IPS.length)];
      sourceIp = randomExt.ip;
      country = randomExt.country;
      countryCode = randomExt.code;
      destIp = INTERNAL_SERVERS[1].ip; // 10.0.2.80
      destPort = 443;
      protocol = 'HTTPS';
      eventType = 'High Frequency HTTP Flood';
      status = Math.random() < 0.4 ? 'ALLOW' : 'DENY';
      payloadSize = Math.floor(Math.random() * 400 + 120);
      rawPayload = `GET /search?q=${Math.random().toString(36).slice(2)} HTTP/1.1\\r\\nHost: 10.0.2.80\\r\\nConnection: keep-alive`;
      break;
    }

    case 'ZERO_DAY_MIX': {
      // Composite anomaly
      const ext = EXTERNAL_IPS[Math.floor(Math.random() * EXTERNAL_IPS.length)];
      sourceIp = ext.ip;
      country = ext.country;
      countryCode = ext.code;
      const srv = INTERNAL_SERVERS[Math.floor(Math.random() * INTERNAL_SERVERS.length)];
      destIp = srv.ip;
      destPort = [23, 4444, 9001, 3389][Math.floor(Math.random() * 4)];
      protocol = 'TCP';
      eventType = 'Non-Standard Protocol Ingress';
      status = 'SUSPICIOUS';
      payloadSize = Math.floor(Math.random() * 800000 + 200000);
      rawPayload = `HEX: 0x4d534600... [Fragmented TCP Window - Suspicious NOP Sled Sequence Detected]`;
      break;
    }

    case 'BASELINE':
    default: {
      // Pure healthy enterprise operational traffic
      const isInternal = Math.random() < 0.8;
      if (isInternal) {
        const client = BENIGN_CLIENT_IPS[Math.floor(Math.random() * BENIGN_CLIENT_IPS.length)];
        sourceIp = client.ip;
        const target = INTERNAL_SERVERS[Math.floor(Math.random() * 3)];
        destIp = target.ip;
        destPort = target.commonPort;
        protocol = destPort === 443 ? 'HTTPS' : destPort === 8080 ? 'HTTP' : 'SMB';
        eventType = protocol === 'HTTPS' ? 'Web Application Traffic' : 'Internal Service Sync';
        status = 'ALLOW';
        payloadSize = Math.floor(Math.random() * 8000 + 350);
        rawPayload = `GET /dashboard/user-profile HTTP/1.1\\r\\nHost: internal.sentinel.soc\\r\\nUser-Agent: Enterprise-Workstation/2.4`;
      } else {
        const ext = EXTERNAL_IPS[4]; // Cloudflare US
        sourceIp = ext.ip;
        country = ext.country;
        countryCode = ext.code;
        destIp = INTERNAL_SERVERS[1].ip;
        destPort = 443;
        protocol = 'HTTPS';
        eventType = 'CDN Asset Cache Ingress';
        status = 'ALLOW';
        payloadSize = Math.floor(Math.random() * 15000 + 2000);
      }
      break;
    }
  }

  // Calculate anomaly score and factors
  const recentFromIp = recentHistory.filter(e => e.sourceIp === sourceIp);
  const anomalyInfo = calculateAnomalyScore(
    {
      sourceIp,
      destIp,
      destPort,
      protocol,
      status,
      payloadSize,
      timestamp
    },
    recentFromIp
  );

  return {
    id,
    timestamp,
    sourceIp,
    destIp,
    sourcePort,
    destPort,
    protocol,
    eventType,
    payloadSize,
    status,
    country,
    countryCode,
    anomalyScore: anomalyInfo.score,
    anomalyFactors: anomalyInfo.factors,
    rawPayload
  };
}

/**
 * Pre-populates the buffer with initial synthetic baseline events.
 */
export function generateInitialSeedEvents(count = 45): SecurityEvent[] {
  const events: SecurityEvent[] = [];
  const baseTime = Date.now() - count * 1500;

  for (let i = 0; i < count; i++) {
    // Determine scenario mix for realistic initial SOC view:
    // mostly baseline, with a few historical failed logins and port probes
    let scenario: ScenarioType = 'BASELINE';
    if (i === 12 || i === 13 || i === 14 || i === 15) {
      scenario = 'BRUTE_FORCE';
    } else if (i === 28 || i === 29 || i === 30 || i === 31) {
      scenario = 'PORT_SCAN';
    }

    const event = generateSyntheticEvent(scenario, events);
    // Adjust timestamp to be chronological backwards
    event.timestamp = new Date(baseTime + i * 1500).toISOString();
    events.push(event);
  }

  return events;
}
