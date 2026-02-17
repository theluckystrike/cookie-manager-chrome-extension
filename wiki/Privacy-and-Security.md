# Privacy and Security

Cookie Manager is built with a privacy-first design. This page explains exactly what the extension does and does not do with your data.

---

## Core Principles

1. **No network requests.** Cookie Manager never connects to any external server. Zero. All data stays on your machine.
2. **No analytics or telemetry.** There is no usage tracking, no crash reporting, no event logging sent anywhere.
3. **No third-party scripts.** The extension has no external dependencies. Every line of code is in the repository.
4. **Open source.** The full source code is available at [github.com/theluckystrike/cookie-manager-chrome-extension](https://github.com/theluckystrike/cookie-manager-chrome-extension). Anyone can audit it.

---

## What Data Does Cookie Manager Access?

Cookie Manager uses Chrome's `cookies` API to read cookies for the websites you visit. This is the core functionality of the extension -- you install it specifically to view and manage cookies.

The extension also uses `chrome.storage.local` to store:
- Your saved cookie profiles
- Your auto-delete rules and their schedules
- Your settings and preferences (dark mode, read-only mode, protected domains)

This data is stored entirely within Chrome's local storage on your machine. It is not synced to any cloud service, not sent to any server, and not accessible to websites.

---

## Permissions Explained

| Permission | Purpose | Data Access |
|-----------|---------|-------------|
| `cookies` | Read and modify browser cookies | Cookie names, values, domains, and attributes for sites you visit |
| `storage` | Save profiles, rules, and settings | Stored locally in `chrome.storage.local` |
| `contextMenus` | Add right-click menu options | No data accessed |
| `notifications` | Notify about auto-delete actions | No data accessed |
| `alarms` | Schedule auto-delete rules | No data accessed |
| `host_permissions (all URLs)` | Access cookies for any site | Required by Chrome's `cookies` API to read cookies across all domains |

### Why "all URLs"?

The `<all_urls>` host permission looks broad, but it is required by Chrome's `cookies` API. Without it, the extension could not read cookies for the sites you visit. This permission does not grant access to page content -- it only allows the extension to use the `cookies` API for any domain.

Many cookie management extensions require this same permission for the same reason.

---

## Security Measures

### Input Sanitization
All user input (cookie names, values, domains, profile names, rule configurations) is validated and sanitized before being processed. This prevents injection attacks and malformed data.

### Content Security Policy
The extension's manifest enforces a strict Content Security Policy:
```
script-src 'self'; object-src 'none'
```
This means:
- Only scripts from the extension itself can execute (no inline scripts, no external scripts)
- No plugins or embedded objects are allowed

### Message Validation
All communication between the popup, options page, and service worker uses Chrome's `runtime.sendMessage` API. Messages are validated for correct structure and sender origin.

### No Dynamic Code Execution
The extension does not use `eval()`, `Function()`, or any other form of dynamic code execution. All code paths are static and auditable.

### No External Dependencies
There are no npm packages, CDN scripts, or third-party libraries. This eliminates supply chain attack vectors entirely.

---

## What Cookie Manager Does NOT Do

- Does not send your cookies to any server
- Does not track which websites you visit
- Does not inject scripts into web pages
- Does not modify page content
- Does not communicate with any external API
- Does not store data outside of `chrome.storage.local`
- Does not sync data across devices
- Does not collect usage statistics
- Does not display ads

---

## Domain Protection and Read-Only Mode

Cookie Manager includes safety features to prevent accidental changes:

- **Domain Protection:** Lock specific domains so their cookies cannot be edited or deleted through the extension. This is useful for protecting authentication cookies on important sites.
- **Read-Only Mode:** A global toggle that prevents all cookie modifications. When enabled, you can view cookies but cannot edit, delete, or create them.

---

## Data Deletion

All data stored by Cookie Manager is deleted when you uninstall the extension. Chrome automatically clears `chrome.storage.local` for removed extensions.

You can also manually clear Cookie Manager's stored data (profiles, rules, settings) from the extension's settings page without uninstalling.

---

## Auditing the Code

The source code is available at: [github.com/theluckystrike/cookie-manager-chrome-extension](https://github.com/theluckystrike/cookie-manager-chrome-extension)

Key files to review:
- `manifest.json` -- Permissions and CSP
- `src/background/service-worker.js` -- Background logic and message routing
- `src/popup/popup.js` -- Main popup interface
- `src/utils/cookies.js` -- Cookie operation helpers
- `src/utils/storage.js` -- Storage abstraction

You can verify that there are no network requests by searching the codebase for `fetch`, `XMLHttpRequest`, or any URL construction. You will not find any.

---

## Reporting Security Issues

If you discover a security vulnerability, please report it privately:

**Email:** security@zovo.one

Do not open a public GitHub issue for security vulnerabilities.

We will acknowledge receipt within 48 hours and aim to release a fix within 7 days for critical issues. See the full [Security Policy](https://github.com/theluckystrike/cookie-manager-chrome-extension/blob/main/SECURITY.md) for details.
