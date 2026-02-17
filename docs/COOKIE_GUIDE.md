# Understanding Browser Cookies -- A Practical Guide

This guide explains what browser cookies are, how they work, and how to manage them effectively. It is written for anyone who wants to understand cookies, whether you are a developer, tester, or privacy-conscious user.

---

## What Are Cookies?

Cookies are small pieces of data that websites store in your browser. When you visit a website, the server can send a `Set-Cookie` header in its response, and your browser stores that cookie locally. On subsequent requests to the same domain, the browser sends the cookie back to the server.

Cookies serve many purposes:
- **Authentication** -- Keeping you logged in across page loads
- **Preferences** -- Remembering your language, theme, or region
- **Shopping carts** -- Tracking items between pages
- **Analytics** -- Measuring site traffic and user behavior
- **Advertising** -- Tracking users across sites for targeted ads

---

## Cookie Anatomy

Every cookie has these attributes:

### Name and Value

The core data. For example, a cookie named `session_id` with value `abc123def456`.

Names are case-sensitive. Values can contain any text, though special characters may be URL-encoded. Some cookies store JSON, JWT tokens, or other structured data in their values.

### Domain

The domain the cookie belongs to. A cookie set for `.example.com` is sent with requests to `example.com`, `www.example.com`, `api.example.com`, and any other subdomain.

A cookie set for `www.example.com` (without the leading dot) is only sent to that exact subdomain.

### Path

The URL path the cookie applies to. A cookie with path `/` is sent with all requests to the domain. A cookie with path `/api` is only sent with requests whose path starts with `/api`.

### Expiration

When the cookie expires:
- **Session cookies** have no expiration date. They are deleted when the browser closes.
- **Persistent cookies** have a specific expiration date (either `Expires` or `Max-Age`). They survive browser restarts.

### Secure Flag

When set, the cookie is only sent over HTTPS connections. This prevents the cookie from being transmitted in plaintext over insecure networks.

### HttpOnly Flag

When set, the cookie is not accessible to JavaScript via `document.cookie`. It is only sent in HTTP request headers. This is an important defense against cross-site scripting (XSS) attacks -- even if an attacker injects script into a page, they cannot read HttpOnly cookies.

### SameSite Attribute

Controls whether the cookie is sent with cross-site requests:

- **Strict** -- Only sent in first-party contexts (when the request originates from the same site). Provides the strongest CSRF protection.
- **Lax** -- Sent with same-site requests and top-level navigations from external sites (e.g., clicking a link). This is the default in modern browsers.
- **None** -- Sent with all requests, including cross-site. Requires the Secure flag to be set.

---

## Cookie Types

### First-Party Cookies

Set by the website you are currently visiting. These typically handle authentication, preferences, and site functionality. Most users consider first-party cookies acceptable.

### Third-Party Cookies

Set by domains other than the one you are visiting. These are commonly used for cross-site tracking and advertising. A tracking pixel from `ads.tracker.com` embedded in `news-site.com` can set a cookie that follows you across every site that includes the same tracker.

Browsers are increasingly blocking third-party cookies. Chrome has been working toward phasing them out, and Safari and Firefox already block them by default.

### Session Cookies

Temporary cookies with no expiration date. They exist only for the duration of your browser session and are deleted when you close Chrome. Login sessions are often stored as session cookies.

### Persistent Cookies

Cookies with an explicit expiration date. They survive browser restarts and remain until they expire or are manually deleted. A "remember me" checkbox typically results in a persistent cookie.

### Secure Cookies

Cookies with the Secure flag set. They are only sent over HTTPS, making them safe from interception on public networks.

### Tracking Cookies

Cookies used to identify and follow users across websites, typically set by advertising networks. They build a profile of your browsing behavior for ad targeting. Cookie Manager's Health Dashboard can identify known tracking cookies.

---

## Common Cookie Patterns

### Authentication

A typical authentication flow:
1. You submit your username and password.
2. The server validates your credentials and creates a session.
3. The server sends a `Set-Cookie` header with a session token.
4. Your browser stores the cookie and sends it with every subsequent request.
5. The server uses the cookie to identify your session.

The session cookie should have `HttpOnly`, `Secure`, and `SameSite=Lax` (or Strict) flags for security.

### JWT Tokens in Cookies

Many modern applications store JSON Web Tokens (JWTs) in cookies. A JWT has three parts separated by dots: `header.payload.signature`. The header and payload are Base64-encoded JSON. Cookie Manager can automatically detect and decode JWT cookies, showing you the token's contents and expiration status.

### CSRF Tokens

Some frameworks store a CSRF (Cross-Site Request Forgery) token in a cookie that JavaScript reads and includes in form submissions. This is a standard security pattern. The cookie is typically not HttpOnly (so JavaScript can access it) but has the Secure and SameSite flags.

### Consent Cookies

Websites that comply with GDPR or similar regulations often store your cookie consent preferences in a cookie (somewhat ironically). These are typically persistent cookies that remember whether you opted in or out of tracking.

---

## Managing Cookies with Cookie Manager

### Viewing

Click the toolbar icon on any site to see all its cookies. Each cookie shows its name, a value preview, and key flags. Click to expand and see full details.

### Editing

Click a cookie to expand it, modify any attribute, and save. Common edits:
- Change a session token to test different user states
- Extend expiration to prevent timeout during testing
- Toggle security flags to test different configurations

### Exporting

Press `Ctrl+E` to export. JSON format is good for re-importing and programmatic use. Netscape format is compatible with curl and wget.

Example using exported cookies with curl:
```bash
curl --cookie cookies.txt https://api.example.com/data
```

### Profiles

Save a snapshot of cookies as a named profile. Restore it later with one click. Perfect for switching between dev/staging/production or between test accounts.

### Auto-Delete Rules

Set up rules to automatically clean cookies on a schedule. Useful for privacy (cleaning trackers) or development (forcing fresh sessions).

### Health Analysis

The Health Dashboard scores your cookies on security practices:
- What percentage have the Secure flag?
- What percentage have the HttpOnly flag?
- What percentage have a SameSite attribute?
- Are there known tracking cookies?

---

## Best Practices for Developers

If you are building a web application, here are cookie best practices:

1. **Always set the Secure flag** on cookies that contain sensitive data.
2. **Always set the HttpOnly flag** on session cookies and authentication tokens.
3. **Set SameSite=Lax or Strict** unless you have a specific reason to use None.
4. **Use short expiration times** for sensitive cookies.
5. **Scope cookies to specific paths** when possible (do not use `/` if the cookie is only needed for `/api`).
6. **Scope cookies to specific subdomains** rather than the root domain when possible.
7. **Do not store sensitive data directly in cookies** -- use a server-side session store and reference it with an opaque session ID.
8. **Rotate session tokens** after authentication state changes (login, logout, privilege escalation).

Use Cookie Manager's Health Dashboard to audit your application's cookies during development.

---

## Further Reading

- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [OWASP: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Chrome: SameSite Cookies Explained](https://web.dev/articles/samesite-cookies-explained)
