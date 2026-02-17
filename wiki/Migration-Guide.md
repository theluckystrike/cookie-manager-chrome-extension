# Migration Guide: From EditThisCookie to Cookie Manager

This guide is for users who relied on EditThisCookie and need a replacement. It explains what happened, how to get set up with Cookie Manager, and where to find equivalent features.

---

## What Happened to EditThisCookie?

EditThisCookie was the most popular cookie management extension for Chrome, used by millions of people to view, edit, delete, and export browser cookies. It was built on Chrome's **Manifest V2** extension platform.

In 2024-2025, Google began enforcing the transition from Manifest V2 to **Manifest V3** across the Chrome Web Store. Extensions that had not migrated to MV3 were removed from the store. EditThisCookie was among the extensions that were taken down.

If you already had EditThisCookie installed, it may continue to work for a limited time, but it will not receive updates and Chrome will eventually disable it entirely as MV2 support is dropped.

---

## Installing Cookie Manager

1. Visit the [Chrome Web Store listing](https://chromewebstore.google.com/detail/cookie-manager/ijolfnkijbagodcigeebgjhlkdgcebmf).
2. Click **"Add to Chrome"**.
3. Pin the icon to your toolbar by clicking the puzzle piece icon and selecting the pin next to Cookie Manager.

That is all you need. Cookie Manager works immediately -- open any website and click the icon to see its cookies.

---

## Feature Mapping

Here is how EditThisCookie features map to Cookie Manager:

| EditThisCookie Feature | Cookie Manager Equivalent |
|----------------------|--------------------------|
| View cookies for current site | Same -- click the toolbar icon |
| Search cookies | Same -- press `/` or use the search bar |
| Edit cookie values | Same -- click any cookie to expand and edit |
| Edit cookie attributes (domain, path, expiration, flags) | Same -- all attributes are editable inline |
| Delete a single cookie | Same -- click the delete button on an expanded cookie |
| Delete all cookies for a site | Same -- use "Delete All" button, or right-click > Cookie Manager > Clear cookies |
| Export cookies as JSON | Same -- press `Ctrl+E` or click the export button |
| Add a new cookie | Same -- press `Ctrl+N` or click the "+" button |
| Import cookies from JSON | Same -- click the import button and select a JSON file |
| Block specific cookies | Use **Auto-Delete Rules** to automatically remove cookies by pattern |
| Read-only / protected cookies | Use **Domain Protection** to lock domains, or enable **Read-Only Mode** globally |

---

## Features in Cookie Manager That EditThisCookie Did Not Have

Cookie Manager includes several capabilities that go beyond what EditThisCookie offered:

### Cookie Profiles
Save a snapshot of all cookies for a domain as a named profile. Restore them with one click. This is useful for switching between development, staging, and production environments, or for toggling between multiple test accounts.

### Auto-Delete Rules
Set up rules to automatically clear cookies for specific domains on a schedule (hourly, every 6 hours, or daily). Rules can target all cookies or match specific cookie names. You can toggle individual rules on and off.

### Health Dashboard
A security analysis tool that scores your cookies and identifies potential issues. It checks for Secure flags, HttpOnly usage, SameSite attributes, and known tracking cookies. It provides actionable recommendations and can clean up trackers with one click.

### JWT Decoder
If a cookie value contains a JWT token, Cookie Manager automatically detects it and provides a decoded view of the header and payload, along with expiration status.

### Netscape Export Format
In addition to JSON export, Cookie Manager can export cookies in Netscape format, which is compatible with `curl`, `wget`, and other command-line tools. This is especially useful for developers.

### Context Menu Integration
Right-click any webpage to clear cookies, export cookies, or open Cookie Manager directly from the context menu.

---

## Migrating Your Data

EditThisCookie did not store persistent data outside of the browser's own cookie storage, so there is no data migration needed. Your browser cookies are still in your browser -- Cookie Manager reads them through Chrome's `cookies` API just like EditThisCookie did.

If you previously exported cookies as JSON from EditThisCookie, Cookie Manager can import standard JSON cookie arrays. The format is compatible.

---

## Differences to Be Aware Of

- **Interface:** Cookie Manager has a tabbed interface with sections for Cookies, Profiles, Rules, and Health. EditThisCookie used a single-panel layout. The core cookie list works similarly.
- **Keyboard shortcuts:** Cookie Manager uses `/` for search, `Ctrl+N` for new cookie, `Ctrl+E` for export. EditThisCookie used different shortcuts. The new ones are listed in the popup.
- **Languages:** EditThisCookie had community translations for 20+ languages. Cookie Manager currently supports 6 languages (English, Spanish, French, German, Japanese, Portuguese). More translations are welcome as contributions.
- **Open source:** Both extensions are open source. Cookie Manager uses MIT license; EditThisCookie used GPL.

---

## Questions?

- Check the [FAQ](FAQ) for common questions
- Visit [GitHub Discussions](https://github.com/theluckystrike/cookie-manager-chrome-extension/discussions) to ask questions or share feedback
- Report issues on the [GitHub Issues](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues) page
