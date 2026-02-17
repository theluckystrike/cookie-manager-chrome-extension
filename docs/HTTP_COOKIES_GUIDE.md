# Understanding HTTP Cookies — A Developer's Reference

A practical reference covering cookie attributes, types, security implications, and browser behavior. This guide covers what developers need to know when working with HTTP cookies in modern web applications.

## Cookie Attributes

Every cookie has a name-value pair and optional attributes that control scope, lifetime, and security.

### Attribute Reference

| Attribute | Example | Purpose |
|-----------|---------|---------|
| **Domain** | `Domain=example.com` | Which hosts receive the cookie |
| **Path** | `Path=/api` | URL path prefix for sending the cookie |
| **Expires** | `Expires=Thu, 01 Jan 2026 00:00:00 GMT` | Absolute expiration date |
| **Max-Age** | `Max-Age=86400` | Lifetime in seconds (overrides Expires) |
| **Secure** | `Secure` | Only send over HTTPS |
| **HttpOnly** | `HttpOnly` | Inaccessible to JavaScript (`document.cookie`) |
| **SameSite** | `SameSite=Strict` | Cross-site request policy |
| **Partitioned** | `Partitioned` | CHIPS — per-top-level-site isolation |

### Domain Scoping Rules

- **No Domain attribute**: Cookie is sent only to the exact host that set it (no subdomains). This is a "host-only" cookie.
- **With Domain attribute**: Cookie is sent to the specified domain **and all subdomains**. `Domain=example.com` matches `api.example.com`, `www.example.com`, etc.
- A server at `sub.example.com` can set `Domain=example.com`, but **not** `Domain=other.com`.

### SameSite in Detail

| Value | Cross-site GET | Cross-site POST | Same-site |
|-------|:--------------:|:---------------:|:---------:|
| `Strict` | Blocked | Blocked | Sent |
| `Lax` | Sent (top-level navigation) | Blocked | Sent |
| `None` | Sent (requires `Secure`) | Sent (requires `Secure`) | Sent |

**Default behavior**: Modern browsers default to `SameSite=Lax` when no attribute is specified.

## Cookie Types

### Session Cookies

No `Expires` or `Max-Age` attribute. Deleted when the browser session ends (though modern browsers often restore sessions).

```
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure
```

### Persistent Cookies

Have an explicit expiration:

```
Set-Cookie: preference=dark; Max-Age=31536000; Path=/
```

### Third-Party Cookies

Set by a domain different from the page the user is visiting. Commonly used for cross-site tracking. **Being phased out** — Chrome's Privacy Sandbox and other browser initiatives are restricting third-party cookies.

### Partitioned Cookies (CHIPS)

Cookies with the `Partitioned` attribute are keyed by the top-level site. A cookie set by `tracker.example` embedded on `siteA.com` is **separate** from the same cookie on `siteB.com`.

```
Set-Cookie: __Host-id=xyz; Secure; Path=/; SameSite=None; Partitioned
```

## The `__Host-` and `__Secure-` Prefixes

These prefixes enforce security requirements:

| Prefix | Requirements |
|--------|-------------|
| `__Host-` | Must have `Secure`, must have `Path=/`, must **not** have `Domain` |
| `__Secure-` | Must have `Secure` |

```
Set-Cookie: __Host-token=abc; Secure; Path=/; HttpOnly
```

These prefixes prevent subdomain attacks and ensure cookies are only sent over HTTPS.

## Cookie Limits

Browsers enforce limits per the recommendations in RFC 6265:

| Limit | Value |
|-------|-------|
| Cookies per domain | At least 50 (most browsers: 150–180) |
| Total cookie size per domain | 4 KB per cookie (name + value + attributes) |
| Total cookies | At least 3,000 |

When limits are exceeded, browsers evict cookies using LRU (least recently used).

## Security Best Practices

### 1. Always Use These Attributes for Sensitive Cookies

```
Set-Cookie: session=token; Secure; HttpOnly; SameSite=Lax; Path=/
```

- **`Secure`** prevents transmission over HTTP
- **`HttpOnly`** prevents XSS from reading the cookie
- **`SameSite=Lax`** blocks CSRF on POST requests

### 2. Set Reasonable Expiration

Avoid setting cookies to expire years in the future. Match cookie lifetime to session lifetime.

### 3. Avoid Storing Sensitive Data in Cookie Values

Cookies are sent with every request. Store a session ID, not user data.

### 4. Use the `__Host-` Prefix

For session and authentication cookies, the `__Host-` prefix provides the strongest guarantees.

## Setting and Reading Cookies

### Server Side (HTTP)

```http
HTTP/1.1 200 OK
Set-Cookie: user=alice; Max-Age=3600; Secure; HttpOnly; SameSite=Lax; Path=/
```

### Client Side (JavaScript)

```javascript
// Set a cookie (HttpOnly cookies cannot be set via JS)
document.cookie = "theme=dark; max-age=86400; path=/; secure; samesite=lax";

// Read all accessible cookies
const cookies = document.cookie; // "theme=dark; lang=en"

// Parse cookies into an object
const parsed = Object.fromEntries(
  document.cookie.split('; ').map(c => c.split('='))
);
```

## Further Reading

- [RFC 6265 — HTTP State Management Mechanism](https://www.rfc-editor.org/rfc/rfc6265) — The cookie specification
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) — Comprehensive attribute reference
- [CHIPS Explainer](https://developer.chrome.com/docs/privacy-sandbox/chips/) — Partitioned cookies specification
- [SameSite Cookies Explained](https://web.dev/articles/samesite-cookies-explained) — Practical guide to SameSite
