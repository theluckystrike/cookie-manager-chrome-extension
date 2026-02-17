# Troubleshooting

This page covers common issues and their solutions. If your problem is not listed here, please open an issue on [GitHub](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues) or ask in [Discussions](https://github.com/theluckystrike/cookie-manager-chrome-extension/discussions).

---

## Cookie Manager icon does not appear in the toolbar

**Solution:** The icon may be hidden in Chrome's extension overflow menu.

1. Click the puzzle piece icon (Extensions) in the top-right corner of Chrome.
2. Find **Cookie Manager** in the list.
3. Click the pin icon next to it to pin it to your toolbar.

---

## "No cookies found" for a website

**Possible causes:**

1. **The page has not set any cookies.** Some pages genuinely have no cookies. Try visiting a page that requires login or has tracking.
2. **You are on a Chrome internal page.** Extensions cannot access cookies for `chrome://` URLs, the Chrome Web Store, or other extension pages.
3. **The cookies belong to a different subdomain.** Cookie Manager shows cookies for the current tab's domain. If the cookies are set on a different subdomain, they may not appear.

---

## Cannot edit or delete a cookie

**Possible causes:**

1. **Domain Protection is enabled.** Check if the domain is in your protected domains list. Go to Settings (Options page) and review your protected domains.
2. **Read-Only Mode is enabled.** Check Settings to see if read-only mode is turned on.
3. **The cookie is set by a different domain.** You can only modify cookies that Chrome's `cookies` API has access to for the current context.

---

## Exported file is empty or contains no cookies

**Possible causes:**

1. **No cookies exist for the current site.** Verify that cookies are listed in the Cookies tab before exporting.
2. **The page is a restricted URL.** Chrome internal pages and the Web Store do not expose cookies to extensions.

---

## Auto-delete rules are not running

**Possible causes:**

1. **The rule is toggled off.** Check the Rules tab and make sure the rule's toggle is enabled.
2. **Chrome was closed.** Auto-delete rules use Chrome's `alarms` API, which only runs while Chrome is open. If Chrome was closed during the scheduled time, the rule will run at the next opportunity.
3. **Service worker was suspended.** MV3 service workers can be suspended by Chrome to save resources. The alarm will fire when the service worker wakes up, but there may be a slight delay.

---

## Dark mode is not working

Cookie Manager follows your system preference for dark mode. To change it:

- **macOS:** System Settings > Appearance > select Dark
- **Windows:** Settings > Personalization > Colors > choose Dark
- **Linux:** Depends on your desktop environment

If your system is set to dark mode but Cookie Manager still shows light mode, try closing and reopening the popup.

---

## Cookies reappear after deletion

This is normal behavior. When you delete a cookie and then reload the page, the website may set the cookie again as part of its normal operation. Websites commonly re-create cookies on every page load.

To handle this:
- Use **Auto-Delete Rules** to continuously clean cookies on a schedule.
- Use browser-level settings to block cookies from specific sites if you want to prevent them from being set at all.

---

## Import fails or cookies are not created

**Possible causes:**

1. **Invalid JSON format.** Make sure the file contains a valid JSON array of cookie objects. Each cookie needs at least `name`, `value`, and `domain` fields.
2. **Domain mismatch.** Cookies are created for the domain specified in the JSON. If the domain is incorrect or unreachable, the creation may fail silently.
3. **Secure cookies on HTTP.** If a cookie has the `secure` flag set to `true`, it can only be created for HTTPS domains.

---

## Extension crashes or does not load

1. Go to `chrome://extensions/`.
2. Find Cookie Manager and click **"Remove"**.
3. Reinstall from the [Chrome Web Store](https://chromewebstore.google.com/detail/cookie-manager/ijolfnkijbagodcigeebgjhlkdgcebmf).

If you installed from source:
1. Make sure you are using Chrome version 110 or later.
2. Try pulling the latest code from GitHub.
3. Remove and re-load the unpacked extension.

---

## Keyboard shortcuts do not work

Keyboard shortcuts work when the Cookie Manager popup is focused. Make sure:
1. The popup is open (click the toolbar icon).
2. Focus is inside the popup window (click inside it).
3. You are not focused on a text input field (some shortcuts are disabled when typing).

Available shortcuts:
- `/` -- Focus search
- `Ctrl+N` -- Create new cookie
- `Ctrl+E` -- Export cookies
- `Ctrl+Shift+D` -- Export debug bundle
- `Escape` -- Close modal or dialog

---

## Context menu items are missing

If Cookie Manager's context menu items (Clear cookies, Export cookies, etc.) do not appear when you right-click:

1. Make sure the extension is enabled at `chrome://extensions/`.
2. Try disabling and re-enabling the extension.
3. Reload the page -- context menus are registered when the service worker starts.

---

## Getting More Help

- **Debug bundle:** Press `Ctrl+Shift+D` in the Cookie Manager popup to export a debug bundle. This contains diagnostic information (no cookie values) that can help troubleshoot issues.
- **GitHub Issues:** [Report a bug](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues/new?template=bug_report.md)
- **GitHub Discussions:** [Ask a question](https://github.com/theluckystrike/cookie-manager-chrome-extension/discussions)
- **Security issues:** Email **security@zovo.one** (do not open a public issue)
