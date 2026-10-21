/**
 * SentinelAI - Interactive Security Glossary Knowledge Base
 * 
 * Provides clear, plain-English definitions, practical examples,
 * and direct architectural context within SentinelAI.
 */

import { GlossaryTerm } from '../types';

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'siem',
    term: 'Security Information and Event Management',
    acronym: 'SIEM',
    category: 'Operations',
    plainEnglish: 'A centralized system that collects, organizes, and analyzes security log data from across an entire organization to identify suspicious activities and support compliance.',
    technicalDetails: 'SIEM tools ingest event logs from firewalls, operating systems, identity providers, and endpoints, normalize them into unified formats (e.g. Common Event Format CEF), execute correlation rules, and provide dashboards for SOC analysts.',
    example: 'An employee logs in from New York, and 3 minutes later the same account logs in from Tokyo. A SIEM correlates these two events and triggers an "Impossible Travel" alert.',
    sentinelAiRelation: 'SentinelAI operates as a lightweight, browser-side SIEM simulator: ingesting synthetic network telemetry, normalizing payloads, running correlation rules, and prioritizing alerts.',
    tags: ['monitoring', 'logs', 'correlation', 'soc']
  },
  {
    id: 'anomaly-detection',
    term: 'Anomaly Detection',
    acronym: 'AD',
    category: 'Fundamentals',
    plainEnglish: 'The practice of identifying patterns in data that do not conform to expected normal behavior.',
    technicalDetails: 'Uses statistical baselines (e.g. Z-scores, moving averages) and machine learning models to detect outliers in continuous metrics like request frequency, packet size, or unusual connection hours without requiring hardcoded signatures.',
    example: 'An accounting server that normally sends 2 MB of data per day suddenly uploads 4.2 GB of data at 3:00 AM on a Sunday.',
    sentinelAiRelation: 'The SentinelAI Anomaly Scoring module evaluates destination port risk, request burst velocity, and payload size deviation to assign a 0–100 risk score to every event.',
    tags: ['machine-learning', 'statistics', 'heuristics', 'baseline']
  },
  {
    id: 'false-positive',
    term: 'False Positive',
    acronym: 'FP',
    category: 'Operations',
    plainEnglish: 'When a security system incorrectly flags legitimate, harmless activity as a threat or security breach.',
    technicalDetails: 'A high false positive rate creates "alert fatigue," causing analysts to miss real attacks. Detection engineering focuses on optimizing precision (minimizing false positives) while maintaining high recall.',
    example: 'A developer stress-testing a new internal API triggers a high-severity DDoS rule, but no malicious intent or breach occurred.',
    sentinelAiRelation: 'SentinelAI incorporates threshold tuning and multi-factor confirmation (requiring multiple failed logins or multiple scanned ports) to minimize false positives during normal baseline scenarios.',
    tags: ['triage', 'alert-fatigue', 'accuracy', 'tuning']
  },
  {
    id: 'port-scanning',
    term: 'Port Scanning',
    acronym: 'Recon',
    category: 'Threats & Attacks',
    plainEnglish: 'A surveillance technique used by hackers (or security auditors) to discover which communication channels (ports) are open and accessible on a target computer.',
    technicalDetails: 'Scanners like Nmap send TCP SYN, FIN, or ACK packets across thousands of ports and listen for responses (SYN-ACK for open, RST for closed) to map vulnerable services.',
    example: 'An external IP systematically probes ports 21 (FTP), 22 (SSH), 80 (HTTP), 445 (SMB), and 3389 (RDP) within 30 seconds to find open remote access vectors.',
    sentinelAiRelation: 'Triggered in SentinelAI by Rule RULE-NET-002 (MITRE T1046) when a single IP probes multiple distinct ports over a short time window.',
    tags: ['reconnaissance', 'nmap', 'discovery', 'firewall']
  },
  {
    id: 'source-ip',
    term: 'Source IP Address',
    acronym: 'Src IP',
    category: 'Fundamentals',
    plainEnglish: 'The unique numerical address identifying the computer or network device that originated a message or data packet across the internet or local network.',
    technicalDetails: 'In IPv4 (e.g., 192.168.1.10) or IPv6, the source IP sits in the IP packet header. While attackers can spoof UDP source IPs, TCP-based attacks require a two-way handshake, making source IPs reliable for correlation.',
    example: 'An attacker uses an overseas VPN with source IP 185.220.101.5 to attempt brute-forcing SSH credentials.',
    sentinelAiRelation: 'SentinelAI tracks sliding-window telemetry per Source IP to measure request frequency, port diversity, and authentication failure rate.',
    tags: ['networking', 'ip', 'routing', 'packets']
  },
  {
    id: 'severity',
    term: 'Severity Rating',
    acronym: 'Sev',
    category: 'Fundamentals',
    plainEnglish: 'A classification level (Info, Low, Medium, High, Critical) representing how dangerous a threat is and how quickly a security team must respond.',
    technicalDetails: 'Derived from vulnerability scoring frameworks like CVSS (Common Vulnerability Scoring System) and environmental asset criticality (e.g. public website vs. crown-jewel customer database).',
    example: 'A port scan on a public honeypot is rated Low, whereas successful administrative login from an untrusted country on an active directory controller is rated Critical.',
    sentinelAiRelation: 'All SentinelAI alerts display clear color-coded severity badges with standardized triage time targets (e.g., Critical: <15 min; High: <1 hour).',
    tags: ['cvss', 'triage', 'prioritization', 'sla']
  },
  {
    id: 'brute-force',
    term: 'Brute Force Attack',
    acronym: 'T1110',
    category: 'Threats & Attacks',
    plainEnglish: 'An automated trial-and-error method where an attacker guesses thousands or millions of passwords until the correct one is discovered.',
    technicalDetails: 'Includes dictionary attacks, credential stuffing (using leaked credentials from other breaches), and password spraying (trying one common password across many accounts to avoid lockouts).',
    example: 'A bot sends 40 SSH login attempts per minute trying passwords like "admin123", "password", and "Winter2024!".',
    sentinelAiRelation: 'SentinelAI features a dedicated Brute Force simulation scenario and Rule RULE-AUTH-001 that activates when failed authentications exceed 4 attempts in 60 seconds.',
    tags: ['credentials', 'passwords', 'authentication', 'mitre']
  },
  {
    id: 'mitre-attack',
    term: 'MITRE ATT&CK Framework',
    acronym: 'ATT&CK',
    category: 'Architecture',
    plainEnglish: 'A globally-accessible knowledge base of real-world adversary tactics, techniques, and procedures (TTPs) used by cybersecurity defenders to categorize threats.',
    technicalDetails: 'Organized into matrices of Tactics (the adversary’s goal, e.g., Initial Access, Persistence, Exfiltration) and Techniques (how they achieve it, e.g., T1046 Network Service Scanning).',
    example: 'A security team maps all detection rules to MITRE IDs to identify blind spots in their defensive coverage.',
    sentinelAiRelation: 'Every rule and alert in SentinelAI directly cross-references specific MITRE ATT&CK IDs (e.g., T1110, T1046, T1499, T1048, T1021).',
    tags: ['framework', 'tactics', 'techniques', 'ttps']
  },
  {
    id: 'data-exfiltration',
    term: 'Data Exfiltration',
    acronym: 'T1048',
    category: 'Threats & Attacks',
    plainEnglish: 'The unauthorized copying, transfer, or retrieval of sensitive data from a computer or server to an external location controlled by an attacker.',
    technicalDetails: 'Often utilizes encrypted tunnels (HTTPS, DNS tunneling, SSH) or cloud storage services (AWS S3, Dropbox) to hide large outbound file transfers from firewalls.',
    example: 'Malware compresses customer records into an encrypted .zip file and uploads it in a single 500 MB POST request to a suspicious VPS.',
    sentinelAiRelation: 'SentinelAI monitors outbound payload sizes and triggers Rule RULE-EXFIL-004 when abnormal transfer bursts (>2.5 MB) leave the internal network.',
    tags: ['exfiltration', 'dlp', 'encryption', 'theft']
  },
  {
    id: 'c2-beaconing',
    term: 'Command and Control (C2) Beaconing',
    acronym: 'C2',
    category: 'Threats & Attacks',
    plainEnglish: 'Regular, periodic signals sent by an infected computer back to the attacker’s server to ask for new commands or confirm it is still online.',
    technicalDetails: 'Beacons often exhibit strict mathematical periodicity (e.g. an HTTP GET request every 60 seconds), which defenders detect using time-delta variance analysis (jitter calculations).',
    example: 'An internal desktop makes a tiny HTTP request to an unknown domain every 10 minutes on the dot, day and night.',
    sentinelAiRelation: 'SentinelAI uses time-delta analysis across sequential events to detect automated repetitive beaconing behavior.',
    tags: ['malware', 'botnet', 'persistence', 'beacon']
  },
  {
    id: 'mttd-mttr',
    term: 'MTTD & MTTR (Mean Time to Detect / Respond)',
    acronym: 'MTTD / MTTR',
    category: 'Operations',
    plainEnglish: 'Key performance metrics measuring how fast a security team identifies an attack (MTTD) and how quickly they contain and eliminate it (MTTR).',
    technicalDetails: 'Industry averages for MTTD can be weeks or months without modern SIEM automation. High-maturity SOCs aim for MTTD < 15 minutes and MTTR < 1 hour.',
    example: 'Automated alert routing reduced a company’s Mean Time to Detect from 4 hours to 3 minutes.',
    sentinelAiRelation: 'The SentinelAI dashboard tracks synthetic response status and provides instant one-click triage transitions to simulate reducing MTTR.',
    tags: ['metrics', 'efficiency', 'soc-kpi', 'incident-response']
  },
  {
    id: 'zero-trust',
    term: 'Zero Trust Architecture',
    acronym: 'ZTA',
    category: 'Architecture',
    plainEnglish: 'A security model based on the principle of "never trust, always verify," treating every user and device inside or outside the network as potentially hostile.',
    technicalDetails: 'Eliminates traditional perimeter-only security in favor of continuous identity verification, least-privilege micro-segmentation, and device health validation.',
    example: 'An employee on the corporate Wi-Fi still has to authenticate with MFA and pass device security checks to access the internal payroll server.',
    sentinelAiRelation: 'SentinelAI monitors both external ingress and internal lateral movement between internal subnets (e.g. 192.168.1.x to 10.0.1.x).',
    tags: ['architecture', 'least-privilege', 'identity', 'mfa']
  }
];
