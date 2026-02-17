# Migration Guide: From EditThisCookie to Cookie Manager

If you used EditThisCookie and are looking for a replacement, this guide will help you get started with Cookie Manager.

---

## What Happened to EditThisCookie?

EditThisCookie was the most widely-used cookie management extension for Chrome, with millions of users. It was built on Chrome's Manifest V2 extension platform.

As part of Google's transition to Manifest V3, extensions that had not migrated were removed from the Chrome Web Store. EditThisCookie was among those removed. Existing installs may continue to work temporarily, but the extension will not receive updates and will eventually be disabled as Chrome fully drops MV2 support.

---

## Getting Started with Cookie Manager

1. Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/cookie-manager/ijolfnkijbagodcigeebgjhlkdgcebmf).
2. Click the Cookie Manager icon in your toolbar.
3. You will see all cookies for the current website. Click any cookie to view and edit it.

---

## Feature Mapping

| EditThisCookie | Cookie Manager |
|---------------|----------------|
| View cookies | Click toolbar icon -- same workflow |
| Search cookies | Press `/` or use the search bar |
| Edit cookie name, value, domain, path, flags | Click any cookie to expand and edit all attributes |
| Delete a cookie | Click delete on the expanded cookie |
| Delete all cookies for a site | "Delete All" button or right-click > Clear cookies |
| Export as JSON | Press `Ctrl+E` -- supports JSON and Netscape formats |
| Import from JSON | Click import button -- compatible with standard JSON |
| Add a new cookie | Press `Ctrl+N` or click "+" |
| Block cookies | Use **Auto-Delete Rules** to remove cookies automatically |

---

## Additional Features in Cookie Manager

- **Cookie Profiles** -- Save and restore cookie sets for switching between environments or user accounts
- **Auto-Delete Rules** -- Schedule automatic cookie cleanup per domain (hourly, every 6h, daily)
- **Health Dashboard** -- Security scoring with tracker detection and actionable recommendations
- **JWT Decoder** -- Automatic detection and decoding of JWT tokens in cookie values
- **Domain Protection** -- Lock important domains to prevent accidental cookie changes
- **Read-Only Mode** -- Browse cookies safely without risk of modification
- **Netscape Export** -- Export cookies in a format compatible with curl and wget
- **Context Menu** -- Right-click any page to clear or export cookies
- **Dark Mode** -- Follows system preference
- **6 Languages** -- English, Spanish, French, German, Japanese, Portuguese

---

## Data Migration

No data migration is needed. Your browser cookies are still in your browser -- Cookie Manager reads them through Chrome's `cookies` API, the same way EditThisCookie did.

If you previously exported cookies as JSON from EditThisCookie, Cookie Manager can import standard JSON cookie arrays.

---

## Key Differences

- **Interface:** Cookie Manager uses a tabbed interface (Cookies, Profiles, Rules, Health). The core cookie list works similarly to EditThisCookie.
- **Keyboard shortcuts:** `/` for search, `Ctrl+N` for new cookie, `Ctrl+E` for export.
- **Languages:** Cookie Manager currently supports 6 languages. EditThisCookie had 20+. Additional translations are welcome as contributions.
- **Architecture:** Cookie Manager is built entirely on Manifest V3 with no bundler or external dependencies.

---

## Questions?

- [FAQ](https://github.com/theluckystrike/cookie-manager-chrome-extension/wiki/FAQ)
- [GitHub Discussions](https://github.com/theluckystrike/cookie-manager-chrome-extension/discussions)
- [Report an Issue](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues)
