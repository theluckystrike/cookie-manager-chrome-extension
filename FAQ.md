# Frequently Asked Questions

## How do I edit cookies in Chrome?

Install Cookie Manager from the [Chrome Web Store](https://chromewebstore.google.com/detail/cookie-manager/ijolfnkijbagodcigeebgjhlkdgcebmf), click the toolbar icon on any website, and click any cookie to expand and edit its name, value, domain, path, expiration, and flags.

## How do I export and import cookies?

Press `Ctrl+E` to export cookies as JSON or Netscape format. To import, click the import button and select a JSON file. You can also right-click any page and select "Export cookies" from the context menu.

## How do I delete all cookies for a website?

Open Cookie Manager and click "Delete All", or right-click the page and select Cookie Manager > Clear cookies for this site.

## Can I protect cookies from deletion?

Yes. Use **Domain Protection** to lock specific domains, preventing their cookies from being edited or deleted. You can also enable **Read-Only Mode** to prevent all modifications globally.

## Is Cookie Manager safe for sensitive cookies?

Yes. Cookie Manager makes zero external network requests. All data stays in `chrome.storage.local` on your machine. There is no analytics, telemetry, or third-party code. The full source is open on [GitHub](https://github.com/theluckystrike/cookie-manager-chrome-extension).

## How do I view HttpOnly cookies?

Cookie Manager displays all cookies for a site, including HttpOnly cookies. Chrome extensions with the `cookies` permission can read HttpOnly cookies even though page JavaScript cannot.

## How do I backup my cookies?

Use **Cookie Profiles** to save cookie snapshots that can be restored with one click. For file-based backups, use the export feature to download cookies as JSON.

## What happened to EditThisCookie?

EditThisCookie was removed from the Chrome Web Store because it was built on Manifest V2, which Google is deprecating. Cookie Manager is a modern, open source alternative built on Manifest V3. See [MIGRATION.md](MIGRATION.md) for a transition guide.

## Does Cookie Manager collect any data?

No. Zero network requests, no analytics, no telemetry, no crash reporting. All data is stored locally and deleted when you uninstall.

## Is Cookie Manager free?

The open source edition is completely free with no feature limits. A Pro edition with advanced analytics and priority support is available separately.

## How do I report a bug?

Open an issue on [GitHub](https://github.com/theluckystrike/cookie-manager-chrome-extension/issues/new?template=bug_report.md). For security issues, email security@zovo.one.

## More Information

- [Wiki](https://github.com/theluckystrike/cookie-manager-chrome-extension/wiki)
- [Discussions](https://github.com/theluckystrike/cookie-manager-chrome-extension/discussions)
- [Cookie Management Guide](https://github.com/theluckystrike/cookie-manager-chrome-extension/wiki/Cookie-Management-Guide)
