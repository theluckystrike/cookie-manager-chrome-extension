# Contributing to Cookie Manager

Thank you for your interest in contributing to Cookie Manager! This guide will help you get started.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally: `git clone https://github.com/<your-username>/cookie-manager-chrome-extension.git`
3. **Load** the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the cloned directory

## Development Guidelines

### Code Style

- **IIFE pattern** for all modules (not ES modules, not class syntax for global modules)
- **SCREAMING_SNAKE_CASE** for message action constants
- Use `{ success: true, data: {...} }` response envelope from service worker
- Use `chrome.storage.local` for persistence
- No external network requests -- all data stays local

### Architecture

- `src/background/service-worker.js` -- MV3 background service worker
- `src/popup/` -- Extension popup UI (HTML, CSS, JS)
- `src/options/` -- Settings page
- `src/utils/` -- Shared utility modules
- `src/shared/` -- Cross-context shared modules
- `_locales/` -- Internationalization strings

### Before Submitting

- Test your changes by loading the unpacked extension
- Verify no console errors in both the popup and service worker
- Ensure existing features still work (cookie CRUD, profiles, rules, health dashboard)
- Keep commits focused and descriptive

## Reporting Bugs

Please use the [Bug Report](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues/new?template=bug_report.md) issue template.

## Requesting Features

Please use the [Feature Request](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues/new?template=feature_request.md) issue template.

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
