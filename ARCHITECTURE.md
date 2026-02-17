# Cookie Manager — Technical Architecture

## High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Chrome Browser                     │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐    │
│  │  Popup   │  │ Options  │  │  DevTools Panel  │    │
│  │  (UI)    │  │  Page    │  │  (cookie viewer) │    │
│  └────┬─────┘  └────┬─────┘  └───────┬─────────┘    │
│       │              │                │               │
│       └──────────┬───┘────────────────┘               │
│                  │  Chrome Messages API               │
│           ┌──────▼──────┐                             │
│           │   Service   │                             │
│           │   Worker    │──── importScripts()         │
│           │ (background)│     ├── cookie-ops.js       │
│           └──────┬──────┘     ├── license-manager.js  │
│                  │            └── utils.js             │
│           ┌──────▼──────┐                             │
│           │chrome.storage│                            │
│           │chrome.cookies│                            │
│           └─────────────┘                             │
└──────────────────────────────────────────────────────┘
```

## Module Descriptions

| Module | File | Responsibility |
|--------|------|---------------|
| **Service Worker** | `background.js` | Message routing, cookie CRUD operations via `chrome.cookies` |
| **Cookie Operations** | `cookie-ops.js` | Import/export logic, bulk operations, cookie serialization |
| **Popup UI** | `popup.js` | Domain list, cookie table, edit/delete/add actions |
| **Options Page** | `options.js` | Default behaviors, export format preferences |
| **License Manager** | `license-manager.js` | Pro feature gating, trial management |
| **Feature Gate** | `feature-gate.js` | UI-level feature toggling based on license state |

## Data Flow

1. **Cookie Reading**: The popup requests cookies for the active tab's domain via `chrome.runtime.sendMessage`. The service worker queries `chrome.cookies.getAll()` and returns results in a `{ success: true, data: {...} }` envelope.
2. **Cookie Editing**: User edits are sent as messages with `SCREAMING_SNAKE_CASE` actions (e.g., `SET_COOKIE`, `DELETE_COOKIE`). The service worker applies changes via `chrome.cookies.set()` / `chrome.cookies.remove()`.
3. **Import/Export**: Cookies are serialized to JSON or Netscape format. Import parses the file and applies cookies in batch.
4. **Storage**: User preferences and license state are persisted in `chrome.storage.local`.

## Chrome Extension APIs Used

| API | Purpose |
|-----|---------|
| `chrome.cookies` | Full CRUD access to browser cookies |
| `chrome.storage.local` | Persist preferences and license data |
| `chrome.tabs` | Get active tab URL for domain scoping |
| `chrome.runtime` | Message passing between popup and service worker |
| `chrome.action` | Badge showing cookie count for active domain |

## Build & Development

```bash
# Clone the repository
git clone https://github.com/theluckystrike/cookie-manager-chrome-extension.git
cd cookie-manager-chrome-extension

# Load as unpacked extension
# 1. Open chrome://extensions
# 2. Enable Developer Mode
# 3. Click "Load unpacked" and select the src/ directory

# No bundler — uses importScripts() in service worker (IIFE pattern)
```

### Project Structure

```
├── manifest.json
├── src/
│   ├── background.js        # Service worker entry
│   ├── popup/               # Popup UI (HTML, CSS, JS)
│   ├── options/             # Options page
│   ├── utils/               # Shared utilities, feature gate
│   └── icons/               # Extension icons
└── docs/                    # Documentation
```

## Design Decisions

- **IIFE Pattern**: All modules use Immediately Invoked Function Expressions assigned to `self.*` or `window.*` — no ES module imports, ensuring compatibility with `importScripts()`.
- **Message Envelope**: All service worker responses follow `{ success: true, data: {...} }` for consistent error handling.
- **SCREAMING_SNAKE_CASE Actions**: Message actions like `GET_COOKIES` and `SET_COOKIE` provide clear, grep-friendly constants.
- **Local-Only Storage**: No data ever leaves the browser. All cookie data and preferences stay on-device.
