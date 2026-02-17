/**
 * Cookie Manager - Popup Logic
 * Connects UI to background service worker
 */

// ============================================================================
// Error Tracking
// ============================================================================

const PopupErrorHandler = {
    errors: [],

    init() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.capture({ type: 'ui_error', message, source, lineno, colno, stack: error?.stack });
            return false;
        };
        window.addEventListener('unhandledrejection', (event) => {
            this.capture({ type: 'promise_rejection', message: event.reason?.message || String(event.reason), stack: event.reason?.stack });
        });
    },

    capture(errorData) {
        const entry = {
            ...errorData,
            context: 'popup',
            timestamp: Date.now(),
            version: chrome.runtime.getManifest().version
        };
        this.errors.push(entry);
        chrome.runtime.sendMessage({ action: 'REPORT_ERROR', payload: entry }).catch(() => {});
    },

    async exportDebugBundle() {
        const [errorLogs, healthData, settings] = await Promise.all([
            chrome.runtime.sendMessage({ action: 'GET_ERROR_LOGS' }).catch(() => []),
            chrome.runtime.sendMessage({ action: 'GET_HEALTH_REPORT' }).catch(() => ({})),
            chrome.runtime.sendMessage({ action: 'GET_SETTINGS' }).catch(() => ({}))
        ]);

        const bundle = {
            generatedAt: new Date().toISOString(),
            extension: {
                id: chrome.runtime.id,
                version: chrome.runtime.getManifest().version,
                name: chrome.runtime.getManifest().name
            },
            browser: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            },
            errors: errorLogs,
            health: healthData,
            sessionErrors: this.errors,
            settings: this.sanitize(settings)
        };

        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cookie-manager-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast(chrome.i18n.getMessage('ntfDebugBundleExported') || 'Debug bundle exported', 'success');
    },

    sanitize(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;
        const sensitive = ['password', 'token', 'secret', 'api_key', 'authorization', 'cookie', 'set-cookie'];
        const result = Array.isArray(obj) ? [] : {};
        for (const [key, value] of Object.entries(obj)) {
            if (sensitive.some(s => key.toLowerCase().includes(s))) {
                result[key] = '[REDACTED]';
            } else if (key === 'stack' && typeof value === 'string') {
                result[key] = value.split('\n').slice(0, 3).join('\n');
            } else if (typeof value === 'object') {
                result[key] = this.sanitize(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
};

// ============================================================================
// JWT Utility -- uses global JWT from src/utils/jwt.js (loaded before popup.js)
// ============================================================================

if (typeof JWT === 'undefined') {
    console.error('[Popup] JWT utility not loaded -- jwt.js must be included before popup.js');
}

// ============================================================================
// State
// ============================================================================

var currentTab = null;
var currentCookies = [];
var selectedCookie = null;
var isNewCookie = false;
var settings = { readOnlyMode: false };
var _savingCookie = false;
var _editorFocusTrap = null;
var _jwtFocusTrap = null;
var _confirmFocusTrap = null;

// ============================================================================
// DOM Elements
// ============================================================================

const $ = (id) => document.getElementById(id);

const elements = {
    currentDomain: $('currentDomain'),
    searchInput: $('searchInput'),
    searchBar: document.querySelector('.search-bar'),
    cookieCount: $('cookieCount'),
    cookieList: $('cookieList'),
    emptyState: $('emptyState'),
    loadingState: $('loadingState'),

    // Tabs
    tabBar: document.querySelector('.tab-bar'),
    tabBtnCookies: $('tabBtnCookies'),
    tabBtnProfiles: $('tabBtnProfiles'),
    tabBtnRules: $('tabBtnRules'),
    tabBtnHealth: $('tabBtnHealth'),
    tabCookies: $('tabCookies'),
    tabProfiles: $('tabProfiles'),
    tabRules: $('tabRules'),
    tabHealth: $('tabHealth'),

    // Actions
    refreshBtn: $('refreshBtn'),

    // Editor Modal
    editorModal: $('editorModal'),
    editorTitle: $('editorTitle'),
    closeModal: $('closeModal'),
    cookieName: $('cookieName'),
    cookieValue: $('cookieValue'),
    cookieDomain: $('cookieDomain'),
    cookiePath: $('cookiePath'),
    cookieExpiry: $('cookieExpiry'),
    cookieSecure: $('cookieSecure'),
    cookieHttpOnly: $('cookieHttpOnly'),
    cookieSameSite: $('cookieSameSite'),
    jwtBadge: $('jwtBadge'),
    decodeJwt: $('decodeJwt'),
    saveCookieBtn: $('saveCookieBtn'),
    deleteCookieBtn: $('deleteCookieBtn'),

    // JWT Modal
    jwtModal: $('jwtModal'),
    closeJwtModal: $('closeJwtModal'),
    jwtHeader: $('jwtHeader'),
    jwtPayload: $('jwtPayload'),
    jwtExpiry: $('jwtExpiry'),
    copyHeader: $('copyHeader'),
    copyPayload: $('copyPayload'),

    // Confirm Modal
    confirmModal: $('confirmModal'),
    confirmTitle: $('confirmTitle'),
    confirmMessage: $('confirmMessage'),
    confirmCancel: $('confirmCancel'),
    confirmOk: $('confirmOk'),

    // Toast
    toast: $('toast'),
    toastIcon: $('toastIcon'),
    toastMessage: $('toastMessage')
};

// ============================================================================
// Tab Navigation
// ============================================================================

const TAB_IDS = ['cookies', 'profiles', 'rules', 'health'];

function switchTab(tabName) {
    if (!TAB_IDS.includes(tabName)) return;

    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Update tab content panels
    const tabPanels = document.querySelectorAll('.tab-content');
    tabPanels.forEach(panel => {
        const panelTab = panel.id.replace('tab', '').toLowerCase();
        const isActive = panelTab === tabName;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
    });

    // Show/hide search bar (only visible on Cookies tab)
    if (elements.searchBar) {
        elements.searchBar.style.display = tabName === 'cookies' ? '' : 'none';
    }

    // Initialize tab managers on first visit
    if (tabName === 'profiles' && typeof ProfilesManager !== 'undefined') {
        ProfilesManager.init(currentTab);
    }
    if (tabName === 'rules' && typeof RulesManager !== 'undefined') {
        RulesManager.init();
    }
    if (tabName === 'health' && typeof HealthManager !== 'undefined') {
        HealthManager.init();
        HealthManager.onShow();
    }

    // Persist active tab
    chrome.storage.local.set({ activePopupTab: tabName }).catch(() => {});

    // Announce tab change to screen readers
    if (typeof A11yManager !== 'undefined' && A11yManager.LiveRegion.announce) {
        const tabLabel = tabName.charAt(0).toUpperCase() + tabName.slice(1);
        A11yManager.LiveRegion.announce(chrome.i18n.getMessage('a11yTabSelected', [tabLabel]) || tabLabel + ' tab selected');
    }
}

async function restoreActiveTab() {
    try {
        const result = await chrome.storage.local.get({ activePopupTab: 'cookies' });
        var savedTab = result.activePopupTab;

        if (TAB_IDS.includes(savedTab)) {
            switchTab(savedTab);
        }
    } catch {
        // Default to cookies tab
    }
}

// ============================================================================
// Initialization
// ============================================================================

async function init() {
    try {
        PopupErrorHandler.init();

        // Accessibility
        if (typeof A11yManager !== 'undefined' && A11yManager.LiveRegion.initLiveRegion) {
            A11yManager.LiveRegion.initLiveRegion();
        }

        // Load settings
        const settingsResponse = await chrome.runtime.sendMessage({ action: 'GET_SETTINGS' });
        settings = settingsResponse || { readOnlyMode: false };

        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tab;

        // Set up event listeners early so UI is always interactive
        setupEventListeners();

        // Restore last active tab
        await restoreActiveTab();

        if (!tab?.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            elements.currentDomain.textContent = chrome.i18n.getMessage('domainChromePage') || 'Chrome page';
            showEmptyState(chrome.i18n.getMessage('emptyChromePage') || 'This page has no cookies');
            return;
        }

        const url = new URL(tab.url);
        elements.currentDomain.textContent = url.hostname;

        // Load cookies
        showLoading();
        await loadCookies();

        // Version display
        var versionEl = document.getElementById('versionDisplay');
        if (versionEl) {
            if (typeof VersionManager !== 'undefined' && VersionManager.getDisplayVersion) {
                versionEl.textContent = 'v' + VersionManager.getDisplayVersion();
            } else {
                versionEl.textContent = 'v' + chrome.runtime.getManifest().version;
            }
        }

        // Architecture patterns integration
        if (typeof ArchPatterns !== 'undefined' && ArchPatterns.EventBus) {
            ArchPatterns.EventBus.on('cookie:updated', function() {
                loadCookies();
            });
            ArchPatterns.EventBus.on('settings:changed', function(newSettings) {
                if (newSettings && typeof newSettings.readOnlyMode !== 'undefined') {
                    settings.readOnlyMode = newSettings.readOnlyMode;
                }
            });
        }

        // Focus search on popup open - only if on Cookies tab
        var activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.dataset.tab === 'cookies') {
            var searchEl = document.getElementById('searchInput');
            if (searchEl) { searchEl.focus(); }
        }

    } catch (error) {
        console.error('[Popup] Init error:', error);
        showEmptyState(chrome.i18n.getMessage('errLoadingCookies') || 'Error loading cookies');
    }
}

// ============================================================================
// Cookie Loading & Rendering
// ============================================================================

async function loadCookies() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'GET_COOKIES',
            payload: { url: currentTab.url }
        });

        if (Array.isArray(response)) {
            currentCookies = response;
        } else {
            console.warn('[Popup] Unexpected response from GET_COOKIES:', response);
            currentCookies = [];
        }
        renderCookies(currentCookies);

    } catch (error) {
        console.error('[Popup] Load cookies error:', error);
        currentCookies = [];
        showEmptyState(chrome.i18n.getMessage('errLoadingCookies') || 'Error loading cookies');
    }
}

function renderCookies(cookies) {
    if (!elements.searchInput || !elements.cookieList || !elements.emptyState || !elements.cookieCount) return;
    const searchTerm = elements.searchInput.value.toLowerCase().trim();

    let filtered = cookies;
    if (searchTerm) {
        filtered = cookies.filter(c =>
            c.name.toLowerCase().includes(searchTerm) ||
            c.value.toLowerCase().includes(searchTerm) ||
            c.domain.toLowerCase().includes(searchTerm)
        );
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    elements.cookieCount.textContent = filtered.length;
    elements.loadingState.hidden = true;

    // Announce search result count to screen readers
    if (searchTerm && typeof A11yManager !== 'undefined' && A11yManager.LiveRegion.announce) {
        A11yManager.LiveRegion.announce(chrome.i18n.getMessage('a11yCookiesFound', [String(filtered.length)]) || filtered.length + ' cookie' + (filtered.length !== 1 ? 's' : '') + ' found');
    }

    if (filtered.length === 0) {
        if (searchTerm) {
            showEmptyState(chrome.i18n.getMessage('emptyNoSearchMatch') || 'No cookies match your search');
        } else {
            showEmptyState(chrome.i18n.getMessage('emptyNoCookies') || 'This site has no cookies set');
        }
        return;
    }

    elements.emptyState.hidden = true;
    elements.cookieList.hidden = false;
    elements.cookieList.textContent = '';
    filtered.forEach(function(cookie) {
        var template = document.createElement('template');
        template.innerHTML = createCookieItemHTML(cookie);
        elements.cookieList.appendChild(template.content);
    });

    // Add click and keyboard handlers
    elements.cookieList.querySelectorAll('.cookie-item').forEach((item, index) => {
        item.addEventListener('click', () => openEditor(filtered[index]));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openEditor(filtered[index]);
            }
        });
    });
}

function createCookieItemHTML(cookie) {
    const isJwt = JWT.isJWT(cookie.value);
    const isSession = !cookie.expirationDate;
    const badges = [];

    if (cookie.secure) {
        badges.push('<span class="badge badge-secure">Secure</span>');
    }
    if (cookie.httpOnly) {
        badges.push('<span class="badge badge-httponly">HttpOnly</span>');
    }
    if (isJwt) {
        badges.push('<span class="badge badge-jwt">JWT</span>');
    }
    if (isSession) {
        badges.push('<span class="badge badge-session">Session</span>');
    }

    const displayValue = cookie.value.length > 50
        ? cookie.value.substring(0, 50) + '...'
        : cookie.value;

    return `
    <div class="cookie-item" data-name="${escapeHtml(cookie.name)}" tabindex="0" role="button" aria-label="Edit cookie ${escapeHtml(cookie.name)}">
      <div class="cookie-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="8" cy="9" r="1" fill="currentColor"></circle>
          <circle cx="15" cy="9" r="1" fill="currentColor"></circle>
          <circle cx="9" cy="14" r="1" fill="currentColor"></circle>
          <circle cx="14" cy="15" r="1" fill="currentColor"></circle>
        </svg>
      </div>
      <div class="cookie-info">
        <div class="cookie-name">${escapeHtml(cookie.name)}</div>
        <div class="cookie-value">${escapeHtml(displayValue) || '&lt;empty&gt;'}</div>
        ${badges.length ? `<div class="cookie-badges">${badges.join('')}</div>` : ''}
      </div>
    </div>
  `;
}

function showEmptyState(message) {
    if (!message) message = chrome.i18n.getMessage('emptyNoCookiesFound') || 'No cookies found';
    if (elements.loadingState) elements.loadingState.hidden = true;
    if (elements.cookieList) elements.cookieList.hidden = true;
    if (elements.emptyState) elements.emptyState.hidden = false;

    const subtitle = elements.emptyState.querySelector('.empty-subtitle');
    if (subtitle) subtitle.textContent = message;

    const tips = document.getElementById('emptyTips');
    if (tips) {
        const isSearchFiltering = elements.searchInput && elements.searchInput.value.trim().length > 0;
        tips.hidden = isSearchFiltering;
    }
}

function showLoading() {
    if (elements.cookieList) elements.cookieList.hidden = true;
    if (elements.emptyState) elements.emptyState.hidden = true;
    if (elements.loadingState) elements.loadingState.hidden = false;
}

// ============================================================================
// Cookie Editor
// ============================================================================

function openEditor(cookie = null) {
    selectedCookie = cookie;
    isNewCookie = !cookie;

    elements.editorTitle.textContent = cookie ? (chrome.i18n.getMessage('titleEditCookie') || 'Edit Cookie') : (chrome.i18n.getMessage('titleAddCookie') || 'Add Cookie');
    elements.deleteCookieBtn.style.display = cookie ? 'flex' : 'none';

    if (cookie) {
        elements.cookieName.value = cookie.name;
        elements.cookieValue.value = cookie.value;
        elements.cookieDomain.value = cookie.domain;
        elements.cookiePath.value = cookie.path;
        elements.cookieSecure.checked = cookie.secure;
        elements.cookieHttpOnly.checked = cookie.httpOnly;
        elements.cookieSameSite.value = cookie.sameSite || 'lax';

        if (cookie.expirationDate) {
            const date = new Date(cookie.expirationDate * 1000);
            elements.cookieExpiry.value = formatDateTimeLocal(date);
        } else {
            elements.cookieExpiry.value = '';
        }

        elements.jwtBadge.hidden = !JWT.isJWT(cookie.value);

    } else {
        let domain = '';
        let isSecure = false;
        try {
            if (currentTab && currentTab.url) {
                domain = new URL(currentTab.url).hostname;
                isSecure = currentTab.url.startsWith('https');
            }
        } catch (e) {}
        elements.cookieName.value = '';
        elements.cookieValue.value = '';
        elements.cookieDomain.value = domain;
        elements.cookiePath.value = '/';
        elements.cookieSecure.checked = isSecure;
        elements.cookieHttpOnly.checked = false;
        elements.cookieSameSite.value = 'lax';
        elements.cookieExpiry.value = '';
        elements.jwtBadge.hidden = true;
    }

    elements.editorModal.hidden = false;

    if (typeof A11yManager !== 'undefined' && A11yManager.FocusTrap.createTrap) {
        _editorFocusTrap = A11yManager.FocusTrap.createTrap(elements.editorModal);
        _editorFocusTrap.activate();
    }

    elements.cookieName.focus();
}

function closeEditor() {
    if (_editorFocusTrap && _editorFocusTrap.deactivate) {
        _editorFocusTrap.deactivate();
        _editorFocusTrap = null;
    }

    if (elements.editorModal) elements.editorModal.hidden = true;
    selectedCookie = null;
    isNewCookie = false;
}

async function saveCookie() {
    if (_savingCookie) return;
    if (settings.readOnlyMode) {
        showToast(chrome.i18n.getMessage('errReadOnlyMode') || 'Read-only mode is enabled', 'error');
        return;
    }

    const name = elements.cookieName.value.trim();
    const value = elements.cookieValue.value;
    const domain = elements.cookieDomain.value.trim();
    const path = elements.cookiePath.value.trim() || '/';

    if (!name) {
        showToast(chrome.i18n.getMessage('errCookieNameRequired') || 'Cookie name is required', 'error');
        elements.cookieName.focus();
        return;
    }

    if (!domain) {
        showToast(chrome.i18n.getMessage('errDomainRequired') || 'Domain is required', 'error');
        elements.cookieDomain.focus();
        return;
    }

    const cookie = {
        name,
        value,
        domain,
        path,
        secure: elements.cookieSecure.checked,
        httpOnly: elements.cookieHttpOnly.checked,
        sameSite: elements.cookieSameSite.value
    };

    if (elements.cookieExpiry.value) {
        cookie.expirationDate = new Date(elements.cookieExpiry.value).getTime() / 1000;
    }

    _savingCookie = true;
    try {
        if (!isNewCookie && selectedCookie) {
            const nameChanged = selectedCookie.name !== name;
            const domainChanged = selectedCookie.domain !== domain;
            const pathChanged = selectedCookie.path !== path;

            if (nameChanged || domainChanged || pathChanged) {
                const oldDomain = selectedCookie.domain.startsWith('.')
                    ? selectedCookie.domain.slice(1)
                    : selectedCookie.domain;
                const oldUrl = `http${selectedCookie.secure ? 's' : ''}://${oldDomain}${selectedCookie.path}`;

                const delResult = await chrome.runtime.sendMessage({
                    action: 'DELETE_COOKIE',
                    payload: { url: oldUrl, name: selectedCookie.name }
                });

                if (delResult && typeof delResult === 'object' && delResult.error) {
                    showToast(delResult.error, 'error');
                    return;
                }
            }
        }

        const response = await chrome.runtime.sendMessage({
            action: 'SET_COOKIE',
            payload: cookie
        });

        if (response?.error) {
            showToast(response.error, 'error');
            return;
        }

        showToast(isNewCookie ? (chrome.i18n.getMessage('ntfCookieCreated') || 'Cookie created') : (chrome.i18n.getMessage('ntfCookieSaved') || 'Cookie saved'), 'success');
        closeEditor();
        await loadCookies();

    } catch (error) {
        console.error('[Popup] Save cookie error:', error);
        showToast(chrome.i18n.getMessage('errFailedSaveCookie') || 'Failed to save cookie', 'error');
    } finally {
        _savingCookie = false;
    }
}

async function deleteCookie() {
    if (!selectedCookie) return;

    if (settings.readOnlyMode) {
        showToast(chrome.i18n.getMessage('errReadOnlyMode') || 'Read-only mode is enabled', 'error');
        return;
    }

    showConfirm(
        chrome.i18n.getMessage('confirmDeleteCookieTitle') || 'Delete Cookie?',
        chrome.i18n.getMessage('confirmDeleteCookieMsg', [selectedCookie.name]) || 'Are you sure you want to delete "' + selectedCookie.name + '"?',
        async () => {
            const domain = selectedCookie.domain.startsWith('.')
                ? selectedCookie.domain.slice(1)
                : selectedCookie.domain;
            const url = `http${selectedCookie.secure ? 's' : ''}://${domain}${selectedCookie.path}`;

            try {
                const deleteResult = await chrome.runtime.sendMessage({
                    action: 'DELETE_COOKIE',
                    payload: { url, name: selectedCookie.name }
                });

                if (deleteResult && typeof deleteResult === 'object' && deleteResult.error) {
                    showToast(deleteResult.error, 'error');
                    return;
                }

                showToast(chrome.i18n.getMessage('ntfCookieDeleted') || 'Cookie deleted', 'success');
                closeEditor();
                await loadCookies();

            } catch (error) {
                console.error('[Popup] Delete cookie error:', error);
                showToast(chrome.i18n.getMessage('errFailedDeleteCookie') || 'Failed to delete cookie', 'error');
            }
        }
    );
}

// ============================================================================
// JWT Decoder
// ============================================================================

function showJwtDecoder() {
    const decoded = JWT.decode(elements.cookieValue.value);
    if (!decoded) {
        showToast(chrome.i18n.getMessage('errInvalidJwt') || 'Invalid JWT token', 'error');
        return;
    }

    elements.jwtHeader.textContent = JSON.stringify(decoded.header, null, 2);
    elements.jwtPayload.textContent = JSON.stringify(decoded.payload, null, 2);

    const expiryText = JWT.formatExpiry(decoded.payload.exp);
    const isExpired = JWT.isExpired(decoded);
    elements.jwtExpiry.textContent = expiryText;
    elements.jwtExpiry.className = `jwt-expiry ${isExpired ? 'expired' : 'valid'}`;

    elements.jwtModal.hidden = false;

    if (typeof A11yManager !== 'undefined' && A11yManager.FocusTrap.createTrap) {
        _jwtFocusTrap = A11yManager.FocusTrap.createTrap(elements.jwtModal);
        _jwtFocusTrap.activate();
    }
}

function closeJwtModal() {
    if (_jwtFocusTrap && _jwtFocusTrap.deactivate) {
        _jwtFocusTrap.deactivate();
        _jwtFocusTrap = null;
    }

    if (elements.jwtModal) elements.jwtModal.hidden = true;
}

// ============================================================================
// Export
// ============================================================================

async function exportCookies() {
    if (currentCookies.length === 0) {
        showToast(chrome.i18n.getMessage('errNoCookiesToExport') || 'No cookies to export', 'error');
        return;
    }

    try {
        const json = await chrome.runtime.sendMessage({
            action: 'EXPORT_COOKIES',
            payload: { url: currentTab.url, format: 'json' }
        });

        if (json && typeof json === 'object' && json.error) {
            showToast(json.error, 'error');
            return;
        }

        if (typeof json !== 'string') {
            showToast(chrome.i18n.getMessage('errFailedExportCookies') || 'Failed to export cookies', 'error');
            return;
        }

        const domain = new URL(currentTab.url).hostname;
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cookies-${domain}-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        try {
            await navigator.clipboard.writeText(json);
            showToast(chrome.i18n.getMessage('ntfCookiesExportedClipboard', [String(currentCookies.length)]) || currentCookies.length + ' cookies exported and copied to clipboard', 'success');
        } catch {
            showToast(chrome.i18n.getMessage('ntfCookiesExportedFile', [String(currentCookies.length)]) || currentCookies.length + ' cookies exported as JSON file', 'success');
        }

    } catch (error) {
        console.error('[Popup] Export error:', error);
        showToast(chrome.i18n.getMessage('errFailedExportCookies') || 'Failed to export cookies', 'error');
    }
}

// ============================================================================
// Confirm Dialog
// ============================================================================

let confirmCallback = null;

function showConfirm(title, message, onConfirm) {
    if (!elements.confirmModal || !elements.confirmTitle || !elements.confirmMessage || !elements.confirmCancel || !elements.confirmOk) return;

    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    confirmCallback = onConfirm;
    elements.confirmModal.hidden = false;

    if (typeof A11yManager !== 'undefined' && A11yManager.FocusTrap.createTrap) {
        _confirmFocusTrap = A11yManager.FocusTrap.createTrap(elements.confirmModal);
        _confirmFocusTrap.activate();
    }

    elements.confirmCancel.focus();
}

function closeConfirm() {
    if (_confirmFocusTrap && _confirmFocusTrap.deactivate) {
        _confirmFocusTrap.deactivate();
        _confirmFocusTrap = null;
    }

    if (elements.confirmModal) elements.confirmModal.hidden = true;
    confirmCallback = null;
}

// ============================================================================
// Toast Notification
// ============================================================================

let toastTimeout = null;

function showToast(message, type = 'success') {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    if (!elements.toast || !elements.toastMessage || !elements.toastIcon) return;

    elements.toastMessage.textContent = message;
    elements.toast.className = `toast toast-${type}`;

    if (type === 'success') {
        elements.toastIcon.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    } else {
        elements.toastIcon.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;
    }

    elements.toast.hidden = false;

    if (typeof A11yManager !== 'undefined' && A11yManager.LiveRegion.announce) {
        A11yManager.LiveRegion.announce(message);
    }

    toastTimeout = setTimeout(() => {
        if (elements.toast) elements.toast.hidden = true;
    }, 2500);
}

// ============================================================================
// Utilities
// ============================================================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDateTimeLocal(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(chrome.i18n.getMessage('ntfCopiedToClipboard') || 'Copied to clipboard', 'success');
    } catch {
        showToast(chrome.i18n.getMessage('errFailedCopy') || 'Failed to copy', 'error');
    }
}

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
        btn.addEventListener('keydown', (e) => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            const currentIndex = tabs.indexOf(btn);
            let newIndex = -1;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                newIndex = (currentIndex + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            } else if (e.key === 'Home') {
                e.preventDefault();
                newIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                newIndex = tabs.length - 1;
            }

            if (newIndex >= 0) {
                tabs[newIndex].focus();
                switchTab(tabs[newIndex].dataset.tab);
            }
        });
    });

    // Search (debounced)
    var _searchDebounceTimer = null;
    elements.searchInput.addEventListener('input', function() {
        if (_searchDebounceTimer) { clearTimeout(_searchDebounceTimer); }
        _searchDebounceTimer = setTimeout(function() {
            renderCookies(currentCookies);
        }, 150);
    });

    // Refresh
    elements.refreshBtn.addEventListener('click', async () => {
        if (elements.refreshBtn.disabled) return;
        elements.refreshBtn.disabled = true;
        showLoading();
        await loadCookies();
        showToast(chrome.i18n.getMessage('ntfCookiesRefreshed') || 'Cookies refreshed', 'success');
        elements.refreshBtn.disabled = false;
    });

    // Editor modal
    elements.closeModal.addEventListener('click', closeEditor);
    elements.saveCookieBtn.addEventListener('click', saveCookie);
    elements.deleteCookieBtn.addEventListener('click', deleteCookie);
    elements.decodeJwt.addEventListener('click', showJwtDecoder);

    // JWT detection on value change
    elements.cookieValue.addEventListener('input', () => {
        elements.jwtBadge.hidden = !JWT.isJWT(elements.cookieValue.value);
    });

    // SameSite=None requires Secure flag
    elements.cookieSameSite.addEventListener('change', function() {
        var secureCheckbox = elements.cookieSecure;
        var secureLabel = secureCheckbox ? secureCheckbox.closest('.checkbox') : null;
        if (elements.cookieSameSite.value === 'no_restriction') {
            if (secureLabel) secureLabel.classList.add('checkbox-highlighted');
            if (!secureCheckbox.checked) {
                secureCheckbox.checked = true;
            }
        } else {
            if (secureLabel) secureLabel.classList.remove('checkbox-highlighted');
        }
    });

    // JWT modal
    elements.closeJwtModal.addEventListener('click', closeJwtModal);
    elements.copyHeader.addEventListener('click', () => {
        copyToClipboard(elements.jwtHeader.textContent);
    });
    elements.copyPayload.addEventListener('click', () => {
        copyToClipboard(elements.jwtPayload.textContent);
    });

    // Confirm modal
    elements.confirmCancel.addEventListener('click', closeConfirm);
    elements.confirmOk.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
        }
        closeConfirm();
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            if (!elements.editorModal.hidden) closeEditor();
            if (!elements.jwtModal.hidden) closeJwtModal();
            if (!elements.confirmModal.hidden) closeConfirm();
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            PopupErrorHandler.exportDebugBundle();
            return;
        }

        if (e.key === 'Escape') {
            if (elements.confirmModal && !elements.confirmModal.hidden) {
                closeConfirm();
            } else if (elements.jwtModal && !elements.jwtModal.hidden) {
                closeJwtModal();
            } else if (elements.editorModal && !elements.editorModal.hidden) {
                closeEditor();
            }
            return;
        }

        if (e.key === '/' && !isInputFocused()) {
            e.preventDefault();
            elements.searchInput.focus();
            elements.searchInput.select();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportCookies();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openEditor(null);
            return;
        }
    });

    // Save on Enter in editor
    elements.editorModal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
            e.preventDefault();
            saveCookie();
        }
    });

    // Help link
    var helpLink = document.getElementById('helpLink');
    if (helpLink) {
        helpLink.addEventListener('click', function(e) {
            e.preventDefault();
            openHelpPage();
        });
    }

    // Keyboard shortcuts via A11yManager
    if (typeof A11yManager !== 'undefined' && A11yManager.KeyboardShortcuts.registerShortcut) {
        A11yManager.KeyboardShortcuts.registerShortcut('/', function() {
            var searchInput = document.getElementById('searchInput');
            if (searchInput) { searchInput.focus(); }
        }, 'Focus search');

        A11yManager.KeyboardShortcuts.registerShortcut('escape', function() {
            var modal = document.getElementById('editorModal');
            if (modal && !modal.hidden) {
                closeEditor();
            }
        }, 'Close modal');

        A11yManager.KeyboardShortcuts.registerShortcut('mod+shift+a', function() {
            openEditor(null);
        }, 'Add cookie');
    }
}

function isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');
}

// ============================================================================
// Help
// ============================================================================

function openHelpPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/help/help.html') });
}

// ============================================================================
// Start
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const startTime = performance.now();
    init().then(() => {
        const loadTime = Math.round(performance.now() - startTime);
        console.debug(`[Popup] Loaded in ${loadTime}ms`);
        chrome.storage.local.get({ popupLoadTimes: [] }).then((result) => {
            const times = result.popupLoadTimes;
            times.push({ durationMs: loadTime, timestamp: Date.now() });
            if (times.length > 20) times.shift();
            chrome.storage.local.set({ popupLoadTimes: times }).catch(() => {});
        }).catch(() => {});
    }).catch((err) => {
        PopupErrorHandler.capture({ type: 'init_error', message: err.message, stack: err.stack });
    });
});
