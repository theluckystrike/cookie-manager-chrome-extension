# Cookie Management Guide

This guide covers everything you need to know about browser cookies and how to manage them effectively with Cookie Manager.

---

## What Are Cookies?

Cookies are small pieces of data that websites store in your browser. They serve many purposes: keeping you logged in, remembering preferences, tracking shopping carts, and more. Each cookie belongs to a specific domain and has a set of attributes that control its behavior.

---

## Cookie Types and Attributes

### Key Attributes

| Attribute | Description |
|-----------|-------------|
| **Name** | The identifier for the cookie (e.g., `session_id`, `user_pref`) |
| **Value** | The data stored in the cookie |
| **Domain** | The website the cookie belongs to (e.g., `.example.com`) |
| **Path** | The URL path the cookie applies to (e.g., `/` for the entire site) |
| **Expiration** | When the cookie expires. Session cookies have no expiration and are deleted when the browser closes |
| **Secure** | If set, the cookie is only sent over HTTPS connections |
| **HttpOnly** | If set, the cookie cannot be accessed by JavaScript on the page (only sent in HTTP requests) |
| **SameSite** | Controls whether the cookie is sent with cross-site requests. Values: `Strict`, `Lax`, or `None` |

### Session Cookies vs. Persistent Cookies

- **Session cookies** have no expiration date. They exist only while the browser is open and are deleted when you close it.
- **Persistent cookies** have an explicit expiration date. They survive browser restarts and remain until they expire or are manually deleted.

### First-Party vs. Third-Party Cookies

- **First-party cookies** are set by the website you are visiting. They are typically used for functionality like login state and preferences.
- **Third-party cookies** are set by domains other than the one you are visiting, usually for advertising and tracking purposes. Browsers are increasingly restricting or blocking third-party cookies.

### Security-Related Flags

- **Secure flag:** Ensures the cookie is only transmitted over encrypted (HTTPS) connections. This prevents the cookie from being intercepted on insecure networks.
- **HttpOnly flag:** Prevents JavaScript on the page from reading the cookie via `document.cookie`. This is an important defense against cross-site scripting (XSS) attacks.
- **SameSite attribute:**
  - `Strict` -- Cookie is only sent in first-party contexts (same-site requests)
  - `Lax` -- Cookie is sent with same-site requests and top-level navigations from external sites
  - `None` -- Cookie is sent with all requests (requires the Secure flag)

---

## Viewing Cookies for Any Site

1. Navigate to the website in your browser.
2. Click the Cookie Manager icon in the toolbar.
3. All cookies for the current site are listed in the **Cookies** tab.

### Searching and Filtering

- Press `/` or click the search bar to filter cookies by name, value, or domain.
- Cookies are displayed with their name, value preview, and key flags.

### Reading Cookie Details

Click any cookie in the list to expand it. You will see:
- Full name and value
- Domain and path
- Expiration date (or "Session" if it has no expiry)
- Security flags (Secure, HttpOnly, SameSite)

---

## Editing Cookie Values

1. Click a cookie to expand it.
2. Modify any field -- name, value, domain, path, expiration, or flags.
3. Click **Save**.

Common editing scenarios:
- **Change a session token** to test how a website handles different users
- **Extend expiration** to prevent a cookie from expiring during testing
- **Toggle the Secure flag** to test HTTP vs. HTTPS behavior
- **Set SameSite to Strict** to test cross-site request handling

### Creating a New Cookie

Press `Ctrl+N` or click the "+" button. Fill in the attributes:
- **Name** and **Value** are required
- **Domain** defaults to the current site
- **Path** defaults to `/`
- Set flags as needed

---

## Import and Export Workflows

### Exporting Cookies

Press `Ctrl+E` or click the export button. Choose your format:

**JSON format:**
```json
[
  {
    "name": "session_id",
    "value": "abc123",
    "domain": ".example.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "Lax",
    "expirationDate": 1735689600
  }
]
```

**Netscape format:**
```
.example.com	TRUE	/	TRUE	1735689600	session_id	abc123
```

The Netscape format is compatible with `curl --cookie`, `wget --load-cookies`, and other tools that use the Netscape cookie file format.

### Importing Cookies

Click the import button and select a JSON file, or paste JSON content directly. The cookies will be created in your browser for the appropriate domains.

### Use Cases

- **Transfer session between browsers:** Export from one browser, import in another
- **Share test credentials with teammates:** Export cookies for a test environment and share the JSON file
- **Automate workflows:** Export cookies and use them with curl or scripts
- **Backup important sessions:** Export and store in a safe location

---

## Cookie Profiles

Profiles let you save a snapshot of all cookies for a domain and restore them later.

### Creating a Profile

1. Open Cookie Manager and go to the **Profiles** tab.
2. Click **"Save Profile"**.
3. Enter a name for the profile (e.g., "Dev Environment", "Admin Account").
4. The current cookies are saved.

### Restoring a Profile

1. Go to the **Profiles** tab.
2. Click **Restore** on the profile you want to load.
3. The saved cookies are applied to the browser.

### Use Cases

- **Switch between environments:** Save profiles for dev, staging, and production
- **Toggle between user accounts:** Save login sessions for different test accounts
- **Reproduce bug reports:** Save the exact cookie state that triggers an issue

---

## Auto-Delete Rules

Rules let you schedule automatic cookie cleanup for specific domains.

### Creating a Rule

1. Open Cookie Manager and go to the **Rules** tab.
2. Click **"Add Rule"**.
3. Configure:
   - **Domain** -- which site to clean
   - **Frequency** -- hourly, every 6 hours, or daily
   - **Pattern** -- delete all cookies or only those matching a specific name
4. Enable the rule.

### Use Cases

- **Privacy:** Automatically clean tracking cookies on a schedule
- **Development:** Clear session cookies periodically to test fresh login flows
- **Maintenance:** Keep cookie storage clean for frequently visited sites

---

## Developer Use Cases

### Testing Authentication Flows

1. Log in to your application.
2. Save a profile with the authenticated cookies.
3. Delete all cookies to simulate a logged-out user.
4. Test the login flow.
5. Restore the profile to return to the authenticated state instantly.

### Debugging Cookie Issues

- Check whether cookies have the correct `Secure`, `HttpOnly`, and `SameSite` flags
- Verify cookie domains and paths are set correctly
- Use the **Health Dashboard** to identify security issues
- Edit cookie values to test how your application handles different states

### Working with JWT Tokens

Many modern applications store JWT tokens in cookies. Cookie Manager automatically detects JWT values and provides:
- Decoded header and payload
- Formatted JSON output
- Expiration status
- Copy-to-clipboard for decoded sections

This saves the manual step of copying the value and pasting it into a JWT decoder tool.

### Using Exported Cookies with curl

Export cookies in Netscape format, then use them in command-line requests:

```bash
curl --cookie cookies.txt https://api.example.com/protected-endpoint
```

This is useful for scripting API calls that require authentication.

---

## Cookie Health Dashboard

The Health tab provides a security analysis of the current site's cookies:

- **Security Score** -- Letter grade from A+ to F based on cookie security practices
- **Category Breakdown** -- Percentage of cookies with Secure, HttpOnly, and SameSite flags
- **Tracker Detection** -- Identifies cookies from known tracking domains
- **Recommendations** -- Specific suggestions for improving cookie security
- **One-Click Cleanup** -- Remove detected tracking cookies instantly

This is useful for developers auditing their own applications and for privacy-conscious users who want to understand what cookies a site is setting.

---

## Tips

- Use **Read-Only Mode** when browsing cookies if you want to avoid accidental changes
- Use **Domain Protection** to lock domains whose cookies you never want to modify
- Press `Ctrl+Shift+D` to export a debug bundle if you need to report an issue
- Cookie Manager remembers your last active tab, so it opens where you left off
