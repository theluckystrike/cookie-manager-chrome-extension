# Cookie Manager for Web Developers

This guide covers how web developers can use Cookie Manager to improve their development, debugging, and testing workflows.

---

## Testing Authentication Flows

One of the most common development tasks involving cookies is testing authentication. Cookie Manager makes this significantly faster.

### The Slow Way (Without Cookie Manager)

1. Open your app, log in with user A.
2. Test the feature.
3. Log out.
4. Log in with user B.
5. Test the feature again.
6. Repeat.

Each login cycle takes time, especially with MFA or complex login forms.

### The Fast Way (With Cookie Profiles)

1. Log in as user A.
2. Open Cookie Manager > Profiles tab > Save Profile as "User A".
3. Log out, log in as user B.
4. Save Profile as "User B".
5. Now switch between users instantly by restoring profiles.

No more repeated logins. This is especially valuable when testing:
- Role-based access control (admin vs. regular user)
- Multi-tenant applications
- Permissions and authorization
- User-specific features

---

## Debugging Cookie Issues

### Common Issues and How to Diagnose Them

**Cookie not being set:**
1. Open Cookie Manager after the page loads.
2. Check if the cookie appears in the list.
3. If not, check the browser console for `Set-Cookie` warnings (Chrome warns about rejected cookies).
4. Common causes: missing Secure flag on HTTPS-required cookie, SameSite conflicts, invalid domain or path.

**Cookie not being sent with requests:**
1. Verify the cookie exists in Cookie Manager.
2. Check the domain -- does it match the request domain?
3. Check the path -- does it match the request path?
4. Check the Secure flag -- is the request using HTTPS?
5. Check SameSite -- is this a cross-site request with SameSite=Strict?

**Cookie expiring unexpectedly:**
1. Click the cookie in Cookie Manager to see its expiration date.
2. If it is a session cookie (no expiry), it will be deleted when Chrome closes.
3. If the server is re-setting the cookie with a short Max-Age, the expiration resets on each response.

**HttpOnly cookie not accessible in JavaScript:**
This is intentional and correct behavior. HttpOnly cookies cannot be read via `document.cookie`. Cookie Manager can still display them because it uses Chrome's `cookies` API, which has access that page scripts do not.

---

## Working with JWT Tokens

Many applications store JWT tokens in cookies for authentication. Cookie Manager automatically detects JWT values and provides:

- **Decoded header** -- Algorithm and token type
- **Decoded payload** -- Claims, user ID, roles, expiration
- **Expiration status** -- Whether the token is still valid or expired

This eliminates the workflow of copying a cookie value, opening jwt.io, and pasting it in. Cookie Manager shows the decoded token inline.

### Common JWT Debugging Scenarios

- **"Why am I getting 401s?"** -- Check if the JWT has expired.
- **"Which user is this token for?"** -- Decode the payload to see the `sub` or user ID claim.
- **"What roles does this token have?"** -- Check the payload for role or scope claims.
- **"Why does the token work locally but not in staging?"** -- Compare the `iss` (issuer) and `aud` (audience) claims.

---

## API Testing with Exported Cookies

Export cookies in Netscape format and use them directly with command-line tools:

### curl

```bash
# Export cookies from Cookie Manager in Netscape format (saved as cookies.txt)

# Use the cookies in a curl request
curl --cookie cookies.txt https://api.example.com/users/me

# Send cookies and save updated cookies
curl --cookie cookies.txt --cookie-jar cookies.txt https://api.example.com/data
```

### wget

```bash
wget --load-cookies cookies.txt https://api.example.com/report.pdf
```

### Python requests

```python
import json

# Export cookies from Cookie Manager in JSON format
with open('cookies.json') as f:
    cookies = json.load(f)

import requests
session = requests.Session()
for cookie in cookies:
    session.cookies.set(cookie['name'], cookie['value'], domain=cookie['domain'])

response = session.get('https://api.example.com/users/me')
```

This is useful for:
- Scripting API calls that require authentication
- Reproducing issues outside the browser
- Automated testing with real session cookies
- Downloading authenticated resources

---

## Environment Switching

Web developers often work with multiple environments: local, dev, staging, production. Each environment has its own domain and cookies.

### Using Profiles for Environment Management

1. Log in to your **local** environment. Save a profile named "Local Dev".
2. Log in to **staging**. Save a profile named "Staging".
3. Log in to **production** (if needed). Save a profile named "Production - Read Only".

Now switch between environments instantly. Combined with Domain Protection, you can prevent accidental modifications to production cookies.

---

## Testing Cookie Security

Use the **Health Dashboard** during development to audit your application's cookies:

1. Navigate to your application.
2. Open Cookie Manager > Health tab.
3. Review the security score and breakdown.

The dashboard checks:
- **Secure flag** -- Are cookies only sent over HTTPS?
- **HttpOnly flag** -- Are sensitive cookies protected from XSS?
- **SameSite attribute** -- Are cookies protected from CSRF?
- **Known trackers** -- Are any third-party tracking cookies present?

Use this during code review and before deployments to catch cookie security issues early.

---

## Auto-Delete Rules for Development

Set up auto-delete rules to support your development workflow:

### Fresh Session Testing

Create a rule that deletes session cookies for `localhost` every hour. This forces you to re-authenticate periodically, which is useful for testing:
- Session timeout handling
- Token refresh flows
- "Remember me" functionality

### Cleaning Up After Test Runs

Create a rule that deletes all cookies for your test domains daily. This ensures you start each day with a clean state.

---

## Keyboard Shortcuts for Speed

When you are debugging, speed matters. Cookie Manager's shortcuts:

| Shortcut | Action |
|----------|--------|
| `/` | Focus search -- quickly find a specific cookie |
| `Ctrl+N` | Create a new cookie -- useful for testing |
| `Ctrl+E` | Export -- grab cookies for use in scripts |
| `Ctrl+Shift+D` | Debug bundle -- for reporting extension issues |
| `Escape` | Close modal |

---

## Context Menu for Quick Actions

Right-click any page to:
- **Clear all cookies** -- Instantly wipe cookies for the current site (useful for testing logged-out states)
- **Export cookies** -- Grab cookies without opening the popup
- **Open Cookie Manager** -- Quick access
- **Open Settings** -- Jump to configuration

---

## Integration with Development Tools

Cookie Manager complements other development tools:

- **Chrome DevTools > Application > Cookies** -- Shows cookies but with limited editing. Cookie Manager adds profiles, export, health, and more.
- **Postman** -- Export cookies from Cookie Manager and import them into Postman for API testing.
- **Selenium / Playwright** -- Export cookies and load them in automated tests to skip login flows.
- **Charles Proxy / Fiddler** -- Use Cookie Manager to verify what cookies are set, then inspect the traffic in your proxy.

---

## Tips

1. **Use Read-Only Mode** when exploring production cookies to avoid accidental changes.
2. **Save profiles before making changes** so you can restore the original state.
3. **Export debug bundles** (`Ctrl+Shift+D`) when reporting issues -- they include diagnostic information without cookie values.
4. **Check the Health Dashboard** on your own applications regularly during development.
