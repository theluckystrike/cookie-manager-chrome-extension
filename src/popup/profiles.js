/**
 * Cookie Manager - Profiles Tab Logic
 * Save and restore cookie sets for switching between environments
 */

const ProfilesManager = {
    // State
    _profiles: [],
    _currentDomain: null,
    _currentTabUrl: null,
    _initialized: false,

    // Profile color palette (deterministic based on name)
    COLORS: [
        '#7C3AED', // purple (primary)
        '#10B981', // green
        '#F59E0B', // amber
        '#EF4444', // red
        '#3B82F6', // blue
        '#EC4899', // pink
        '#8B5CF6', // violet
        '#14B8A6', // teal
    ],

    // ========================================================================
    // Initialization
    // ========================================================================

    async init(tab) {
        if (this._initialized) {
            await this.loadProfiles();
            return;
        }

        this._initialized = true;

        try {
            if (!tab) {
                const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                tab = activeTab;
            }
            if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                const url = new URL(tab.url);
                this._currentDomain = url.hostname;
                this._currentTabUrl = tab.url;
            }
        } catch (e) {
            console.warn('[Profiles] Could not get current tab:', e.message);
        }

        this._bindEvents();
        await this.loadProfiles();
    },

    // ========================================================================
    // Data Loading
    // ========================================================================

    async loadProfiles() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'GET_COOKIE_PROFILES' });

            if (Array.isArray(response)) {
                this._profiles = response;
            } else if (response && response.error) {
                console.warn('[Profiles] Error loading profiles:', response.error);
                this._profiles = [];
            } else {
                this._profiles = [];
            }
        } catch (e) {
            console.error('[Profiles] Failed to load profiles:', e);
            this._profiles = [];
        }

        this._render();
    },

    // ========================================================================
    // Actions
    // ========================================================================

    async saveCurrentCookies() {
        if (!this._currentDomain || !this._currentTabUrl) {
            this._showToast(chrome.i18n.getMessage('errNoDomainAvailable') || 'No domain available to save cookies from', 'error');
            return;
        }

        // Prompt for profile name
        const name = await this._promptForName();
        if (!name) return; // User cancelled

        var self = this;

        // Check for duplicate name
        if (this._profiles.some(p => p.name === name)) {
            this._showConfirm(
                chrome.i18n.getMessage('confirmOverwriteProfileTitle') || 'Overwrite Profile?',
                chrome.i18n.getMessage('confirmOverwriteProfileMsg', [name]) || 'A profile named "' + name + '" already exists. Overwrite it?',
                async () => {
                    await self._doSave(name);
                }
            );
            return;
        }

        await this._doSave(name);
    },

    async _doSave(name) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'SAVE_COOKIE_PROFILE',
                payload: {
                    name: name,
                    url: this._currentTabUrl
                }
            });

            if (response && response.success) {
                this._showToast(chrome.i18n.getMessage('ntfProfileSaved', [name, String(response.cookieCount)]) || 'Profile "' + name + '" saved with ' + response.cookieCount + ' cookies', 'success');
                await this.loadProfiles();
            } else {
                this._showToast(response?.error || (chrome.i18n.getMessage('errFailedSaveProfile') || 'Failed to save profile'), 'error');
            }
        } catch (e) {
            console.error('[Profiles] Save error:', e);
            this._showToast(chrome.i18n.getMessage('errFailedSaveProfile') || 'Failed to save profile', 'error');
        }
    },

    async loadProfile(profileName) {
        this._showConfirm(
            chrome.i18n.getMessage('confirmLoadProfileTitle') || 'Load Profile?',
            chrome.i18n.getMessage('confirmLoadProfileMsg', [profileName]) || 'This will restore all cookies from "' + profileName + '" to the current domain. Existing cookies will not be cleared first.',
            async () => {
                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'LOAD_COOKIE_PROFILE',
                        payload: { name: profileName }
                    });

                    if (response && response.success) {
                        let msg = chrome.i18n.getMessage('ntfProfileRestored', [String(response.restored), String(response.total)]) || 'Restored ' + response.restored + ' of ' + response.total + ' cookies';
                        if (response.failed > 0) {
                            msg += ' (' + response.failed + ' failed)';
                        }
                        this._showToast(msg, response.failed > 0 ? 'error' : 'success');

                        if (typeof loadCookies === 'function') {
                            loadCookies();
                        }
                    } else {
                        this._showToast(response?.error || (chrome.i18n.getMessage('errFailedLoadProfile') || 'Failed to load profile'), 'error');
                    }
                } catch (e) {
                    console.error('[Profiles] Load error:', e);
                    this._showToast(chrome.i18n.getMessage('errFailedLoadProfile') || 'Failed to load profile', 'error');
                }
            }
        );
    },

    async deleteProfile(profileName) {
        this._showConfirm(
            chrome.i18n.getMessage('confirmDeleteProfileTitle') || 'Delete Profile?',
            chrome.i18n.getMessage('confirmDeleteProfileMsg', [profileName]) || 'Are you sure you want to delete "' + profileName + '"? This cannot be undone.',
            async () => {
                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'DELETE_COOKIE_PROFILE',
                        payload: { name: profileName }
                    });

                    if (response && response.success) {
                        this._showToast(chrome.i18n.getMessage('ntfProfileDeleted', [profileName]) || 'Profile "' + profileName + '" deleted', 'success');
                        await this.loadProfiles();
                    } else {
                        this._showToast(response?.error || (chrome.i18n.getMessage('errFailedDeleteProfile') || 'Failed to delete profile'), 'error');
                    }
                } catch (e) {
                    console.error('[Profiles] Delete error:', e);
                    this._showToast(chrome.i18n.getMessage('errFailedDeleteProfile') || 'Failed to delete profile', 'error');
                }
            }
        );
    },

    // ========================================================================
    // Name Prompt
    // ========================================================================

    _promptForName() {
        return new Promise((resolve) => {
            const overlay = document.getElementById('profileNameOverlay');
            const input = document.getElementById('profileNameInput');
            const cancelBtn = document.getElementById('profileNameCancel');
            const saveBtn = document.getElementById('profileNameSave');

            if (!overlay || !input) {
                const name = prompt(chrome.i18n.getMessage('profileNamePrompt') || 'Profile name:');
                resolve(name ? name.trim() : null);
                return;
            }

            input.value = this._currentDomain
                ? this._currentDomain.replace(/^www\./, '') + ' - ' + new Date().toLocaleDateString()
                : 'Profile ' + (this._profiles.length + 1);

            overlay.hidden = false;
            input.focus();
            input.select();

            const cleanup = () => {
                overlay.hidden = true;
                cancelBtn.removeEventListener('click', onCancel);
                saveBtn.removeEventListener('click', onSave);
                input.removeEventListener('keydown', onKeydown);
            };

            const onCancel = () => { cleanup(); resolve(null); };
            const onSave = () => { const val = input.value.trim(); cleanup(); resolve(val || null); };
            const onKeydown = (e) => {
                if (e.key === 'Enter') { e.preventDefault(); onSave(); }
                else if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
            };

            cancelBtn.addEventListener('click', onCancel);
            saveBtn.addEventListener('click', onSave);
            input.addEventListener('keydown', onKeydown);
        });
    },

    // ========================================================================
    // Event Binding
    // ========================================================================

    _bindEvents() {
        const saveBtn = document.getElementById('profilesSaveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCurrentCookies());
        }
    },

    // ========================================================================
    // Rendering
    // ========================================================================

    _render() {
        const listEl = document.getElementById('profilesList');
        const emptyEl = document.getElementById('profilesEmpty');

        if (!listEl || !emptyEl) return;

        if (this._profiles.length === 0) {
            listEl.hidden = true;
            emptyEl.hidden = false;
            return;
        }

        emptyEl.hidden = true;
        listEl.hidden = false;
        listEl.textContent = '';

        const sorted = [...this._profiles].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

        sorted.forEach((profile) => {
            const card = this._createProfileCard(profile);
            listEl.appendChild(card);
        });
    },

    _createProfileCard(profile) {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.style.borderLeftColor = this._getColor(profile.name);

        const dot = document.createElement('span');
        dot.className = 'profile-dot';
        dot.style.backgroundColor = this._getColor(profile.name);

        const info = document.createElement('div');
        info.className = 'profile-info';

        const nameRow = document.createElement('div');
        nameRow.className = 'profile-name-row';

        const nameEl = document.createElement('span');
        nameEl.className = 'profile-name';
        nameEl.textContent = profile.name;

        const countBadge = document.createElement('span');
        countBadge.className = 'profile-cookie-count';
        countBadge.textContent = chrome.i18n.getMessage('profileCookieCount', [String(profile.cookieCount)]) || profile.cookieCount + ' cookie' + (profile.cookieCount !== 1 ? 's' : '');

        nameRow.appendChild(nameEl);
        nameRow.appendChild(countBadge);

        const meta = document.createElement('div');
        meta.className = 'profile-meta';
        meta.textContent = (chrome.i18n.getMessage('profileSavedPrefix') || 'Saved ') + this._formatDate(profile.updatedAt || profile.createdAt);

        info.appendChild(nameRow);
        info.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'profile-actions';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-primary profile-load-btn';
        loadBtn.textContent = chrome.i18n.getMessage('buttonLoad') || 'Load';
        loadBtn.title = 'Restore cookies from this profile';
        loadBtn.setAttribute('aria-label', 'Load profile ' + profile.name);
        loadBtn.addEventListener('click', (e) => { e.stopPropagation(); this.loadProfile(profile.name); });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn profile-delete-btn';
        deleteBtn.title = 'Delete profile';
        deleteBtn.setAttribute('aria-label', 'Delete profile ' + profile.name);
        deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); this.deleteProfile(profile.name); });

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(dot);
        card.appendChild(info);
        card.appendChild(actions);

        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Load profile ' + profile.name + ', ' + profile.cookieCount + ' cookies');
        card.addEventListener('click', () => this.loadProfile(profile.name));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.loadProfile(profile.name); }
        });

        return card;
    },

    // ========================================================================
    // UI Helpers
    // ========================================================================

    _showToast(message, type) {
        if (typeof showToast === 'function') { showToast(message, type); }
        else { console.warn('[Profiles]', type === 'error' ? 'Error:' : 'Info:', message); }
    },

    _showConfirm(title, message, onConfirm) {
        if (typeof showConfirm === 'function') { showConfirm(title, message, onConfirm); }
        else { if (confirm(title + '\n\n' + message)) { onConfirm(); } }
    },

    // ========================================================================
    // Helpers
    // ========================================================================

    _getColor(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return this.COLORS[Math.abs(hash) % this.COLORS.length];
    },

    _formatDate(timestamp) {
        if (!timestamp) return chrome.i18n.getMessage('profileUnknownDate') || 'unknown date';

        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 7) return new Date(timestamp).toLocaleDateString();
        if (days > 0) return days + ' day' + (days !== 1 ? 's' : '') + ' ago';
        if (hours > 0) return hours + ' hour' + (hours !== 1 ? 's' : '') + ' ago';
        if (minutes > 0) return minutes + ' min' + (minutes !== 1 ? 's' : '') + ' ago';
        return chrome.i18n.getMessage('profileJustNow') || 'just now';
    }
};
