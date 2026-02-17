# Cookie Manager - Chrome Extension

A powerful, privacy-first Chrome extension for managing browser cookies. View, edit, create, delete, export, and organize cookies with an intuitive interface. Built with Manifest V3.

**Built by [Zovo](https://www.zovo.one)**

[![License: MIT](https://img.shields.io/badge/License-MIT-7C3AED.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/cookie-manager/kgdijghmpjgeebebacjphenjiogpfmfn)
[![GitHub Release](https://img.shields.io/github/v/release/theluckystrike/cookie-manager-chrome-extension)](https://github.com/theluckystrike/cookie-manager-chrome-extension/releases)

---

## Features

### Cookie Management
- **View all cookies** for the current site with search and filtering
- **Edit cookies** inline -- modify name, value, domain, path, expiration, flags
- **Create new cookies** from scratch with full attribute control
- **Delete individual cookies** or clear all cookies for a domain
- **Domain protection** -- lock important domains to prevent accidental changes
- **Read-only mode** -- browse cookies safely without risk of modification

### Export & Import
- **Export as JSON** -- structured format for programmatic use
- **Export as Netscape** -- compatible with curl, wget, and other tools
- **One-click clipboard copy** with simultaneous file download
- **Context menu export** -- right-click any page to export its cookies

### Cookie Profiles
- **Save cookie sets** as named profiles for quick environment switching
- **Restore profiles** with a single click -- perfect for dev/staging/production
- **Unlimited profiles** with no restrictions
- **Color-coded cards** for visual organization

### Auto-Delete Rules
- **Schedule cookie cleanup** per domain (hourly, every 6 hours, daily)
- **Pattern matching** -- delete all cookies or target specific names
- **Toggle rules** on/off without deleting them
- **Unlimited rules** with no restrictions

### Cookie Health Dashboard
- **Security score** with letter grades (A+ through F)
- **Category breakdown** -- Secure, HttpOnly, SameSite analysis
- **Tracker detection** -- identifies known tracking cookies
- **Actionable recommendations** for improving cookie security
- **One-click tracker cleanup**

### JWT Decoder
- **Automatic detection** of JWT tokens in cookie values
- **Decode header and payload** with formatted JSON output
- **Expiration status** -- see if tokens are expired at a glance
- **Copy decoded sections** to clipboard

### Developer Experience
- **Keyboard shortcuts** -- `/` to search, `Ctrl+N` to create, `Ctrl+E` to export
- **Context menu integration** -- clear or export cookies from any page
- **Debug bundle export** (`Ctrl+Shift+D`) for troubleshooting
- **Tab persistence** -- remembers your last active tab

### Privacy & Security
- **Zero network requests** -- all data stays in `chrome.storage.local`
- **No analytics or telemetry** sent anywhere
- **No third-party scripts** or external dependencies
- **Input sanitization** on all operations
- **Content Security Policy** enforced
- **Open source** -- fully auditable code

### Internationalization
- English, Spanish, French, German, Japanese, Portuguese (Brazilian)

---

## Install

### Chrome Web Store (Recommended)

Install directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/cookie-manager/kgdijghmpjgeebebacjphenjiogpfmfn).

### Manual Install (Developer Mode)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/theluckystrike/cookie-manager-chrome-extension.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the cloned directory

---

## Usage

### Quick Start

1. Click the Cookie Manager icon in your toolbar
2. View all cookies for the current site
3. Click any cookie to edit it
4. Use the tab bar to switch between Cookies, Profiles, Rules, and Health

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search |
| `Ctrl+N` | Create new cookie |
| `Ctrl+E` | Export cookies |
| `Ctrl+Shift+D` | Export debug bundle |
| `Escape` | Close modal / dialog |

### Context Menu

Right-click any webpage to:
- Clear all cookies for the site
- Export cookies for the site
- Open Cookie Manager
- Open Settings

---

## Architecture

```
cookie-manager-chrome-extension/
  manifest.json          # MV3 manifest
  _locales/              # i18n strings (en, es, fr, de, ja, pt_BR)
  assets/icons/          # Extension icons
  src/
    background/
      service-worker.js  # MV3 service worker (message routing, alarms)
    popup/
      index.html         # Popup UI
      popup.js           # Main popup logic
      popup.css          # Styles
      profiles.js        # Cookie profiles tab
      rules.js           # Auto-delete rules tab
      health.js          # Health dashboard tab
    options/
      options.html       # Settings page
      options.js         # Settings logic
      options.css        # Settings styles
    utils/
      cookies.js         # Cookie utility helpers
      jwt.js             # JWT decode utility
      storage.js         # Storage abstraction
      i18n-loader.js     # i18n initialization
      i18n-helpers.js    # i18n DOM helpers
    shared/              # Cross-context modules
    help/                # Help page
    legal/               # Privacy policy, terms of service
    welcome/             # Welcome page (shown on install)
```

**Key design decisions:**
- IIFE module pattern (no ES modules, no bundler required)
- `importScripts()` in service worker for shared modules
- `chrome.runtime.sendMessage` for popup-to-background communication
- `chrome.storage.local` for all persistence
- All operations are local -- no external API calls

---

## Free vs Pro

This repository contains the **free, open-source edition** of Cookie Manager. All features listed above are fully available with no limits.

| Feature | Free (This Repo) | Pro |
|---------|:-:|:-:|
| View / Edit / Delete cookies | Unlimited | Unlimited |
| Export (JSON + Netscape) | Yes | Yes |
| Cookie profiles | Unlimited | Unlimited |
| Auto-delete rules | Unlimited | Unlimited |
| Health dashboard | Yes | Yes |
| JWT decoder | Yes | Yes |
| Domain protection | Yes | Yes |
| Context menu | Yes | Yes |
| i18n (6 languages) | Yes | Yes |
| Priority support | -- | Yes |
| Advanced analytics dashboard | -- | Yes |
| Usage insights | -- | Yes |

[Get Cookie Manager Pro](https://www.zovo.one/cookie-manager/upgrade)

---

## More from Zovo

Check out our other Chrome extensions:

- [Tab Manager](https://chromewebstore.google.com/detail/tab-manager/bmlilpidhcbalkimgfjihdebfcanfhgo) -- Organize, search, and manage your open tabs
- [Clipboard Manager](https://chromewebstore.google.com/detail/clipboard-manager/fiacmehkahiiepmikmmhljmmbpogieph) -- Smart clipboard history with search and favorites

Visit [zovo.one](https://www.zovo.one) for all our tools.

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## Security

Found a vulnerability? Please read our [Security Policy](SECURITY.md) for responsible disclosure instructions.

## License

[MIT](LICENSE) -- Copyright (c) 2025 Zovo (zovo.one) -- Michael Ip
