// ATT&CK Enterprise v20 のマトリックス（サブテクニックを除く）。戦術の並びは TACTICS と同じ。

export type Technique = { id: string; name: string }

const t = (list: string): Technique[] => list.split('|').map((s) => ({ id: s.slice(0, 5), name: s.slice(6) }))

export const MATRIX: Technique[][] = [
  // TA0043 Reconnaissance
  t(
    'T1595 Active Scanning|' +
      'T1592 Gather Victim Host Information|' +
      'T1589 Gather Victim Identity Information|' +
      'T1590 Gather Victim Network Information|' +
      'T1591 Gather Victim Org Information|' +
      'T1598 Phishing for Information|' +
      'T1682 Query Public AI Services|' +
      'T1597 Search Closed Sources|' +
      'T1596 Search Open Technical Databases|' +
      'T1593 Search Open Websites/Domains|' +
      'T1681 Search Threat Vendor Data|' +
      'T1594 Search Victim-Owned Websites',
  ),
  // TA0042 Resource Development
  t(
    'T1650 Acquire Access|' +
      'T1583 Acquire Infrastructure|' +
      'T1586 Compromise Accounts|' +
      'T1584 Compromise Infrastructure|' +
      'T1587 Develop Capabilities|' +
      'T1585 Establish Accounts|' +
      'T1683 Generate Content|' +
      'T1588 Obtain Capabilities|' +
      'T1608 Stage Capabilities',
  ),
  // TA0001 Initial Access
  t(
    'T1659 Content Injection|' +
      'T1189 Drive-by Compromise|' +
      'T1190 Exploit Public-Facing Application|' +
      'T1133 External Remote Services|' +
      'T1200 Hardware Additions|' +
      'T1566 Phishing|' +
      'T1091 Replication Through Removable Media|' +
      'T1195 Supply Chain Compromise|' +
      'T1199 Trusted Relationship|' +
      'T1078 Valid Accounts|' +
      'T1669 Wi-Fi Networks',
  ),
  // TA0002 Execution
  t(
    'T1197 BITS Jobs|' +
      'T1651 Cloud Administration Command|' +
      'T1059 Command and Scripting Interpreter|' +
      'T1609 Container Administration Command|' +
      'T1610 Deploy Container|' +
      'T1699 Direct Prompt Injection|' +
      'T1675 ESXi Administration Command|' +
      'T1203 Exploitation for Client Execution|' +
      'T1574 Hijack Execution Flow|' +
      'T1698 Indirect Prompt Injection|' +
      'T1674 Input Injection|' +
      'T1559 Inter-Process Communication|' +
      'T1106 Native API|' +
      'T1677 Poisoned Pipeline Execution|' +
      'T1053 Scheduled Task/Job|' +
      'T1648 Serverless Execution|' +
      'T1129 Shared Modules|' +
      'T1072 Software Deployment Tools|' +
      'T1569 System Services|' +
      'T1127 Trusted Developer Utilities Proxy Execution|' +
      'T1204 User Execution|' +
      'T1047 Windows Management Instrumentation',
  ),
  // TA0003 Persistence
  t(
    'T1098 Account Manipulation|' +
      'T1197 BITS Jobs|' +
      'T1547 Boot or Logon Autostart Execution|' +
      'T1037 Boot or Logon Initialization Scripts|' +
      'T1671 Cloud Application Integration|' +
      'T1554 Compromise Host Software Binary|' +
      'T1136 Create Account|' +
      'T1543 Create or Modify System Process|' +
      'T1546 Event Triggered Execution|' +
      'T1668 Exclusive Control|' +
      'T1133 External Remote Services|' +
      'T1525 Implant Internal Image|' +
      'T1556 Modify Authentication Process|' +
      'T1112 Modify Registry|' +
      'T1137 Office Application Startup|' +
      'T1653 Power Settings|' +
      'T1542 Pre-OS Boot|' +
      'T1053 Scheduled Task/Job|' +
      'T1505 Server Software Component|' +
      'T1176 Software Extensions|' +
      'T1205 Traffic Signaling|' +
      'T1078 Valid Accounts',
  ),
  // TA0004 Privilege Escalation
  t(
    'T1548 Abuse Elevation Control Mechanism|' +
      'T1134 Access Token Manipulation|' +
      'T1098 Account Manipulation|' +
      'T1547 Boot or Logon Autostart Execution|' +
      'T1037 Boot or Logon Initialization Scripts|' +
      'T1543 Create or Modify System Process|' +
      'T1484 Domain or Tenant Policy Modification|' +
      'T1611 Escape to Host|' +
      'T1546 Event Triggered Execution|' +
      'T1068 Exploitation for Privilege Escalation|' +
      'T1055 Process Injection|' +
      'T1053 Scheduled Task/Job|' +
      'T1078 Valid Accounts',
  ),
  // TA0005 Stealth
  t(
    'T1134 Access Token Manipulation|' +
      'T1696 Anti-Automation Evasion|' +
      'T1197 BITS Jobs|' +
      'T1612 Build Image on Host|' +
      'T1622 Debugger Evasion|' +
      'T1678 Delay Execution|' +
      'T1140 Deobfuscate/Decode Files or Information|' +
      'T1006 Direct Volume Access|' +
      'T1480 Execution Guardrails|' +
      'T1211 Exploitation for Stealth|' +
      'T1564 Hide Artifacts|' +
      'T1574 Hijack Execution Flow|' +
      'T1070 Indicator Removal|' +
      'T1202 Indirect Command Execution|' +
      'T1036 Masquerading|' +
      'T1027 Obfuscated Files or Information|' +
      'T1542 Pre-OS Boot|' +
      'T1055 Process Injection|' +
      'T1620 Reflective Code Loading|' +
      'T1014 Rootkit|' +
      'T1679 Selective Exclusion|' +
      'T1684 Social Engineering|' +
      'T1218 System Binary Proxy Execution|' +
      'T1216 System Script Proxy Execution|' +
      'T1221 Template Injection|' +
      'T1205 Traffic Signaling|' +
      'T1127 Trusted Developer Utilities Proxy Execution|' +
      'T1535 Unused/Unsupported Cloud Regions|' +
      'T1078 Valid Accounts|' +
      'T1497 Virtualization/Sandbox Evasion|' +
      'T1220 XSL Script Processing',
  ),
  // TA0112 Defense Impairment
  t(
    'T1686 Disable or Modify System Firewall|' +
      'T1685 Disable or Modify Tools|' +
      'T1484 Domain or Tenant Policy Modification|' +
      'T1689 Downgrade Attack|' +
      'T1687 Exploitation for Defense Impairment|' +
      'T1222 File and Directory Permissions Modification|' +
      'T1556 Modify Authentication Process|' +
      'T1578 Modify Cloud Compute Infrastructure|' +
      'T1666 Modify Cloud Resource Hierarchy|' +
      'T1112 Modify Registry|' +
      'T1601 Modify System Image|' +
      'T1599 Network Boundary Bridging|' +
      'T1647 Plist File Modification|' +
      'T1690 Prevent Command History Logging|' +
      'T1207 Rogue Domain Controller|' +
      'T1688 Safe Mode Boot|' +
      'T1553 Subvert Trust Controls|' +
      'T1600 Weaken Encryption',
  ),
  // TA0006 Credential Access
  t(
    'T1557 Adversary-in-the-Middle|' +
      'T1110 Brute Force|' +
      'T1555 Credentials from Password Stores|' +
      'T1212 Exploitation for Credential Access|' +
      'T1187 Forced Authentication|' +
      'T1606 Forge Web Credentials|' +
      'T1056 Input Capture|' +
      'T1556 Modify Authentication Process|' +
      'T1111 Multi-Factor Authentication Interception|' +
      'T1621 Multi-Factor Authentication Request Generation|' +
      'T1040 Network Sniffing|' +
      'T1003 OS Credential Dumping|' +
      'T1528 Steal Application Access Token|' +
      'T1697 Steal Application Specific Passwords|' +
      'T1649 Steal or Forge Authentication Certificates|' +
      'T1558 Steal or Forge Kerberos Tickets|' +
      'T1539 Steal Web Session Cookie|' +
      'T1552 Unsecured Credentials',
  ),
  // TA0007 Discovery
  t(
    'T1087 Account Discovery|' +
      'T1010 Application Window Discovery|' +
      'T1217 Browser Information Discovery|' +
      'T1580 Cloud Infrastructure Discovery|' +
      'T1538 Cloud Service Dashboard|' +
      'T1526 Cloud Service Discovery|' +
      'T1619 Cloud Storage Object Discovery|' +
      'T1613 Container and Resource Discovery|' +
      'T1622 Debugger Evasion|' +
      'T1652 Device Driver Discovery|' +
      'T1482 Domain Trust Discovery|' +
      'T1083 File and Directory Discovery|' +
      'T1615 Group Policy Discovery|' +
      'T1680 Local Storage Discovery|' +
      'T1654 Log Enumeration|' +
      'T1046 Network Service Discovery|' +
      'T1135 Network Share Discovery|' +
      'T1040 Network Sniffing|' +
      'T1201 Password Policy Discovery|' +
      'T1120 Peripheral Device Discovery|' +
      'T1069 Permission Groups Discovery|' +
      'T1057 Process Discovery|' +
      'T1012 Query Registry|' +
      'T1018 Remote System Discovery|' +
      'T1518 Software Discovery|' +
      'T1082 System Information Discovery|' +
      'T1614 System Location Discovery|' +
      'T1016 System Network Configuration Discovery|' +
      'T1049 System Network Connections Discovery|' +
      'T1033 System Owner/User Discovery|' +
      'T1007 System Service Discovery|' +
      'T1124 System Time Discovery|' +
      'T1673 Virtual Machine Discovery|' +
      'T1497 Virtualization/Sandbox Evasion',
  ),
  // TA0008 Lateral Movement
  t(
    'T1210 Exploitation of Remote Services|' +
      'T1534 Internal Spearphishing|' +
      'T1570 Lateral Tool Transfer|' +
      'T1563 Remote Service Session Hijacking|' +
      'T1021 Remote Services|' +
      'T1091 Replication Through Removable Media|' +
      'T1072 Software Deployment Tools|' +
      'T1080 Taint Shared Content|' +
      'T1550 Use Alternate Authentication Material',
  ),
  // TA0009 Collection
  t(
    'T1557 Adversary-in-the-Middle|' +
      'T1560 Archive Collected Data|' +
      'T1123 Audio Capture|' +
      'T1119 Automated Collection|' +
      'T1185 Browser Session Hijacking|' +
      'T1115 Clipboard Data|' +
      'T1530 Data from Cloud Storage|' +
      'T1602 Data from Configuration Repository|' +
      'T1213 Data from Information Repositories|' +
      'T1005 Data from Local System|' +
      'T1039 Data from Network Shared Drive|' +
      'T1025 Data from Removable Media|' +
      'T1074 Data Staged|' +
      'T1114 Email Collection|' +
      'T1056 Input Capture|' +
      'T1113 Screen Capture|' +
      'T1125 Video Capture',
  ),
  // TA0011 Command and Control
  t(
    'T1071 Application Layer Protocol|' +
      'T1092 Communication Through Removable Media|' +
      'T1659 Content Injection|' +
      'T1132 Data Encoding|' +
      'T1001 Data Obfuscation|' +
      'T1568 Dynamic Resolution|' +
      'T1573 Encrypted Channel|' +
      'T1008 Fallback Channels|' +
      'T1665 Hide Infrastructure|' +
      'T1105 Ingress Tool Transfer|' +
      'T1104 Multi-Stage Channels|' +
      'T1095 Non-Application Layer Protocol|' +
      'T1571 Non-Standard Port|' +
      'T1572 Protocol Tunneling|' +
      'T1090 Proxy|' +
      'T1219 Remote Access Tools|' +
      'T1205 Traffic Signaling|' +
      'T1102 Web Service',
  ),
  // TA0010 Exfiltration
  t(
    'T1700 AI-Enabled Exfiltration|' +
      'T1020 Automated Exfiltration|' +
      'T1030 Data Transfer Size Limits|' +
      'T1048 Exfiltration Over Alternative Protocol|' +
      'T1041 Exfiltration Over C2 Channel|' +
      'T1011 Exfiltration Over Other Network Medium|' +
      'T1052 Exfiltration Over Physical Medium|' +
      'T1567 Exfiltration Over Web Service|' +
      'T1029 Scheduled Transfer|' +
      'T1537 Transfer Data to Cloud Account',
  ),
  // TA0040 Impact
  t(
    'T1531 Account Access Removal|' +
      'T1485 Data Destruction|' +
      'T1486 Data Encrypted for Impact|' +
      'T1565 Data Manipulation|' +
      'T1491 Defacement|' +
      'T1561 Disk Wipe|' +
      'T1667 Email Bombing|' +
      'T1499 Endpoint Denial of Service|' +
      'T1657 Financial Theft|' +
      'T1495 Firmware Corruption|' +
      'T1490 Inhibit System Recovery|' +
      'T1498 Network Denial of Service|' +
      'T1496 Resource Hijacking|' +
      'T1489 Service Stop|' +
      'T1529 System Shutdown/Reboot',
  ),
]
