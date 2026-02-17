# Installation Guide

There are two ways to install Cookie Manager: from the Chrome Web Store (recommended for most users) or manually from source (for developers or contributors).

---

## Option 1: Chrome Web Store (Recommended)

1. Visit the [Cookie Manager listing on the Chrome Web Store](https://chromewebstore.google.com/detail/cookie-manager/ijolfnkijbagodcigeebgjhlkdgcebmf).
2. Click **"Add to Chrome"**.
3. Confirm the permissions when prompted.
4. The Cookie Manager icon will appear in your Chrome toolbar. Click it to start managing cookies.

If the icon does not appear in the toolbar, click the puzzle piece icon (Extensions) in the top-right corner of Chrome and pin Cookie Manager.

### Permissions Explained

Cookie Manager requests the following permissions:

| Permission | Why it's needed |
|-----------|----------------|
| **cookies** | Read and modify browser cookies |
| **storage** | Save your profiles, rules, and settings locally |
| **contextMenus** | Add right-click options for quick access |
| **notifications** | Notify you about auto-delete rule actions |
| **alarms** | Schedule auto-delete rules to run at intervals |
| **host_permissions (all URLs)** | Access cookies for any website you visit |

All data stays local on your machine. Cookie Manager makes zero external network requests.

---

## Option 2: Manual Install (Developer Mode)

This method is useful if you want to contribute, test changes, or run the latest code from GitHub.

### Prerequisites

- Google Chrome version 110 or later
- Git (optional, for cloning)

### Steps

1. **Download the source code:**

   Clone the repository:
   ```bash
   git clone https://github.com/theluckystrike/cookie-manager-chrome-extension.git
   ```

   Or download the ZIP from the [GitHub releases page](https://github.com/theluckystrike/cookie-manager-chrome-extension/releases) and extract it.

2. **Open Chrome's extension management page:**

   Navigate to `chrome://extensions/` in your address bar.

3. **Enable Developer Mode:**

   Toggle the **Developer mode** switch in the top-right corner.

4. **Load the extension:**

   Click **"Load unpacked"** and select the directory you cloned or extracted.

5. **Verify installation:**

   The Cookie Manager icon should appear in your toolbar. Click it to confirm it loads correctly.

### Updating a Manual Install

If you installed from source:

```bash
cd cookie-manager-chrome-extension
git pull origin main
```

Then go to `chrome://extensions/` and click the refresh icon on the Cookie Manager card.

---

## Supported Browsers

Cookie Manager is built for **Google Chrome** (version 110+). It may also work on Chromium-based browsers that support Manifest V3:

- Microsoft Edge
- Brave
- Opera
- Vivaldi

For non-Chrome browsers, use the manual install method and load the extension through the browser's developer mode.

---

## After Installation

Once installed, here are some things to try:

1. **Click the toolbar icon** to view cookies for the current tab
2. **Search** for a specific cookie using `/` or the search bar
3. **Click any cookie** to expand and edit it
4. **Switch tabs** at the top to explore Profiles, Rules, and Health Dashboard
5. **Right-click any webpage** to see Cookie Manager in the context menu

For a full walkthrough, see the [Cookie Management Guide](Cookie-Management-Guide).

---

## Uninstalling

To remove Cookie Manager:

1. Right-click the Cookie Manager icon in the toolbar
2. Select **"Remove from Chrome"**
3. Confirm the removal

Or go to `chrome://extensions/`, find Cookie Manager, and click **"Remove"**.

All locally stored data (profiles, rules, settings) is deleted when the extension is removed.
