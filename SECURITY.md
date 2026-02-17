# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | Yes                |

## Reporting a Vulnerability

If you discover a security vulnerability in Cookie Manager, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@zovo.one**

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and aim to release a fix within 7 days for critical issues.

## Security Design

Cookie Manager is designed with security in mind:

- **No external network requests** -- All data stays local in `chrome.storage.local`
- **No analytics or telemetry** sent to external servers
- **Input sanitization** on all cookie operations
- **Content Security Policy** enforced via manifest
- **Message validation** for all inter-context communication
- **Sender origin verification** for all runtime messages
- **No eval() or dynamic code execution**

## Scope

The following are in scope for security reports:

- Cross-site scripting (XSS) in extension pages
- Cookie data exposure or leakage
- Privilege escalation
- Bypass of read-only mode or domain protection
- Storage injection or corruption

## Recognition

We appreciate responsible disclosure and will credit reporters in our changelog (with permission).
