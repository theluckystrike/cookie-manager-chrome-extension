# Frequently Asked Questions

---

## How do I edit cookies in Chrome?

1. Click the Cookie Manager icon in your toolbar to open the popup.
2. You will see a list of all cookies for the current website.
3. Click on any cookie to expand it.
4. Modify any field: name, value, domain, path, expiration date, or flags (Secure, HttpOnly, SameSite).
5. Click **Save** to apply your changes.

You can also create a new cookie from scratch by pressing `Ctrl+N` or clicking the "+" button.

---

## How do I export and import cookies?

### Exporting

1. Open Cookie Manager on the site whose cookies you want to export.
2. Press `Ctrl+E` or click the export button.
3. Choose your format:
   - **JSON** -- structured format, good for programmatic use and re-importing
   - **Netscape** -- compatible with curl, wget, and other command-line tools
4. The cookies are copied to your clipboard and simultaneously downloaded as a file.

You can also right-click any page and select **"Export cookies"** from the Cookie Manager context menu.

### Importing

1. Open Cookie Manager.
2. Click the import button.
3. Select a previously exported JSON file, or paste JSON content.
4. The cookies will be created in your browser.

---

## How do I delete all cookies for a website?

There are several ways:

- **From the popup:** Open Cookie Manager on the site, then use the "Delete All" button to remove all cookies for that domain.
- **From the context menu:** Right-click anywhere on the page and select **Cookie Manager > Clear cookies for this site**.
- **Individual deletion:** Click any cookie to expand it, then click the delete button to remove just that one.

---

## Can I protect cookies from deletion?

Yes. Cookie Manager has a **Domain Protection** feature that lets you lock specific domains. When a domain is protected:

- Cookies for that domain cannot be edited or deleted through Cookie Manager
- This prevents accidental changes to important cookies (like authentication tokens)
- You can toggle protection on and off at any time from the settings

There is also a **Read-Only Mode** that prevents all modifications across every domain.

---

## Is Cookie Manager safe for sensitive cookies?

Yes. Cookie Manager is designed with a privacy-first approach:

- **Zero network requests** -- your cookie data is never sent anywhere. All data stays in `chrome.storage.local` on your machine.
- **No analytics or telemetry** -- there is no tracking of any kind.
- **No third-party scripts** -- the extension has no external dependencies.
- **Input sanitization** -- all operations validate and sanitize input.
- **Open source** -- the full source code is available on [GitHub](https://github.com/theluckystrike/cookie-manager-chrome-extension) for anyone to audit.

For more details, see the [Privacy and Security](Privacy-and-Security) page.

---

## How do I view HttpOnly cookies?

HttpOnly cookies are not accessible to JavaScript running on web pages, but Chrome extensions with the `cookies` permission can read them. Cookie Manager has this permission, so it displays all cookies for a site, including HttpOnly ones.

In the cookie list, HttpOnly cookies are shown alongside all other cookies. When you expand a cookie, you can see the **HttpOnly** flag in its attributes.

---

## How do I backup my cookies?

Use the **Cookie Profiles** feature:

1. Open Cookie Manager and switch to the **Profiles** tab.
2. Click **"Save Profile"** to capture all cookies for the current site.
3. Give the profile a name (e.g., "Production Login", "Test Account").
4. Your cookies are saved locally and can be restored at any time with a single click.

For a file-based backup, use the **Export** feature to download cookies as JSON. Store the file wherever you keep backups. You can re-import it later.

---

## What happened to EditThisCookie?

EditThisCookie was a widely-used Chrome extension for cookie management that was removed from the Chrome Web Store. It was built on Manifest V2, which Google has been phasing out in favor of Manifest V3.

After its removal, many users were left without a cookie management tool. Cookie Manager was built from the ground up on Manifest V3 as an open source alternative. It covers the core cookie management features (view, edit, delete, export) and adds newer capabilities like cookie profiles, auto-delete rules, health dashboard, and JWT decoding.

For a detailed guide on transitioning, see the [Migration Guide](Migration-Guide).

---

## Does Cookie Manager work on other browsers?

Cookie Manager is built for Google Chrome (version 110+). It may also work on Chromium-based browsers that support Manifest V3, such as Microsoft Edge, Brave, Opera, and Vivaldi. For these browsers, you will need to install it manually using developer mode -- see the [Installation Guide](Installation-Guide).

---

## Does Cookie Manager collect any data?

No. Cookie Manager makes zero external network requests. There is no analytics, no telemetry, no crash reporting, and no data sent to any server. All data (profiles, rules, settings) is stored locally in `chrome.storage.local` and is deleted when you uninstall the extension.

---

## Is Cookie Manager free?

The open source edition is completely free and includes all core features with no limits: unlimited profiles, unlimited auto-delete rules, full export/import, health dashboard, JWT decoder, and more.

A Pro edition is available separately with additional features like an advanced analytics dashboard and priority support. See the [README](https://github.com/theluckystrike/cookie-manager-chrome-extension#free-vs-pro) for a comparison.

---

## How do I report a bug or request a feature?

- **Bug reports:** Open an issue on GitHub using the [Bug Report template](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues/new?template=bug_report.md)
- **Feature requests:** Open an issue using the [Feature Request template](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues/new?template=feature_request.md)
- **Security issues:** Email **security@zovo.one** (do not open a public issue)
- **Discussion:** Visit the [GitHub Discussions](https://github.com/theluckystrike/cookie-manager-chrome-extension/discussions) board
