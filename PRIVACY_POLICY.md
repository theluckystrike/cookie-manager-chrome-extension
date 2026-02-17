# Privacy Policy — Cookie Manager

**Last updated:** February 2026

## Overview

Cookie Manager is committed to protecting your privacy. This extension operates entirely within your browser and does not collect, transmit, or share any personal data. While the extension manages browser cookies, it does not exfiltrate cookie data to any external service.

## Data Access

Cookie Manager accesses the following browser data solely to provide its core functionality:

- **Browser cookies** — The extension reads, creates, modifies, and deletes cookies as directed by you. This is the core purpose of the extension.
- **Active tab URL** — Used to scope cookie operations to the current domain.

## Data Storage

All data is stored locally on your device using `chrome.storage.local`:

| Data | Purpose | Location |
|------|---------|----------|
| User preferences | Export format, default behaviors | Local storage |
| License state | Pro feature access, trial status | Local storage |

**Cookie data itself is managed through Chrome's built-in cookie APIs, not in separate storage.**

**No data is stored on external servers.**

## Data Transmission

Cookie Manager does **not** transmit cookie data or browsing information to external servers. Specifically:

- No cookie values are sent to any external server
- No analytics or telemetry are collected
- No browsing history is recorded or shared
- No personal information is transmitted to third parties
- License validation communicates only a license key — no cookie data, browsing data, or personal information

## Third-Party Services

| Service | Data sent | Purpose |
|---------|-----------|---------|
| License API (api.zovo.dev) | License key only | Validate Pro license status |

No cookie data, browsing data, or personal information is sent to any third-party service.

## Permissions Explained

| Permission | Why it's needed |
|------------|----------------|
| `cookies` | Core functionality — read, write, and delete cookies |
| `activeTab` | Scope cookie operations to the current domain |
| `storage` | Save user preferences locally |
| `tabs` | Read the active tab's URL for domain scoping |

## Data Retention

User preferences persist until you uninstall the extension or clear them manually. The extension does not create its own data store of cookie values.

## Children's Privacy

This extension does not knowingly collect any information from children under 13.

## Changes to This Policy

We may update this policy as the extension evolves. Changes will be reflected in the "Last updated" date above.

## Contact

If you have questions about this privacy policy, please open an issue on our [GitHub repository](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues) or contact us at support@zovo.dev.
