/**
 * Cookie Manager - Auto-Delete Rules Tab
 * Manages creation, listing, toggling, and deletion of auto-delete rules.
 * Communicates with the background service worker via chrome.runtime.sendMessage.
 */

// ============================================================================
// Schedule Definitions
// ============================================================================

const SCHEDULE_OPTIONS = [
    { label: chrome.i18n.getMessage('scheduleEveryHour') || 'Every hour',       minutes: 60 },
    { label: chrome.i18n.getMessage('scheduleEvery6Hours') || 'Every 6 hours',    minutes: 360 },
    { label: chrome.i18n.getMessage('scheduleEveryDay') || 'Every day',        minutes: 1440 },
    { label: chrome.i18n.getMessage('scheduleOnBrowserClose') || 'On browser close', minutes: 0 }
];

function scheduleLabel(intervalMinutes) {
    if (intervalMinutes === 0) return chrome.i18n.getMessage('scheduleOnBrowserClose') || 'On browser close';
    var match = SCHEDULE_OPTIONS.find(function(o) { return o.minutes === intervalMinutes; });
    if (match) return match.label;
    if (intervalMinutes < 60) return intervalMinutes + 'm';
    if (intervalMinutes < 1440) return Math.round(intervalMinutes / 60) + 'h';
    return Math.round(intervalMinutes / 1440) + 'd';
}

// ============================================================================
// RulesManager
// ============================================================================

var RulesManager = (function() {

    var _rules = [];
    var _loading = false;
    var _formVisible = false;
    var _editingRuleId = null;
    var _initialized = false;

    var _els = {};

    function $(id) { return document.getElementById(id); }

    function _resolveElements() {
        _els.container     = $('tabRules');
        _els.list          = $('rulesList');
        _els.emptyState    = $('rulesEmpty');
        _els.addBtn        = $('addRuleBtn');

        _els.formWrap      = $('ruleFormOverlay');
        _els.formTitle      = $('ruleFormTitle');
        _els.domainInput   = $('ruleDomain');
        _els.patternInput  = $('ruleCookiePattern');
        _els.scheduleSelect = $('ruleSchedule');
        _els.saveBtn       = $('ruleFormSave');
        _els.cancelBtn     = $('ruleFormCancel');
    }

    function _send(action, payload) {
        return chrome.runtime.sendMessage({ action: action, payload: payload || {} });
    }

    async function _loadRules() {
        if (_loading) return;
        _loading = true;
        _renderLoading();
        try {
            var response = await _send('GET_AUTO_DELETE_RULES');
            _rules = Array.isArray(response) ? response : [];
        } catch (e) {
            console.error('[Rules] Failed to load rules:', e);
            _rules = [];
        }
        _loading = false;
        _render();
    }

    async function _saveRule(ruleData) {
        try {
            var response = await _send('SAVE_AUTO_DELETE_RULE', ruleData);
            if (response && response.error) {
                _toast(response.error, 'error');
                return false;
            }
            _toast(_editingRuleId ? (chrome.i18n.getMessage('ntfRuleUpdated') || 'Rule updated') : (chrome.i18n.getMessage('ntfRuleCreated') || 'Rule created'), 'success');
            return true;
        } catch (e) {
            console.error('[Rules] Failed to save rule:', e);
            _toast(chrome.i18n.getMessage('errFailedSaveRule') || 'Failed to save rule', 'error');
            return false;
        }
    }

    async function _deleteRule(id) {
        try {
            var response = await _send('DELETE_AUTO_DELETE_RULE', { id: id });
            if (response && response.error) {
                _toast(response.error, 'error');
                return false;
            }
            _toast(chrome.i18n.getMessage('ntfRuleDeleted') || 'Rule deleted', 'success');
            return true;
        } catch (e) {
            console.error('[Rules] Failed to delete rule:', e);
            _toast(chrome.i18n.getMessage('errFailedDeleteRule') || 'Failed to delete rule', 'error');
            return false;
        }
    }

    async function _toggleRule(id, enabled) {
        var rule = _rules.find(function(r) { return r.id === id; });
        if (!rule) return;
        var updatedRule = {
            id: rule.id,
            domain: rule.domain,
            pattern: rule.pattern,
            intervalMinutes: rule.intervalMinutes,
            enabled: enabled
        };
        var ok = await _saveRule(updatedRule);
        if (ok) await _loadRules();
    }

    async function _getCookieCount(domain) {
        try {
            var response = await _send('GET_ALL_COOKIES', { domain: domain });
            if (Array.isArray(response)) return response.length;
            return 0;
        } catch (e) {
            return 0;
        }
    }

    function _toast(message, type) {
        if (typeof showToast === 'function') { showToast(message, type); }
        else { console.log('[Rules]', type, message); }
    }

    function _renderLoading() {
        if (!_els.list) return;
        _els.list.hidden = true;
        if (_els.emptyState) _els.emptyState.hidden = true;
        if (_els.addBtn) _els.addBtn.hidden = false;
    }

    function _render() {
        if (!_els.list) return;

        // No free-tier limits in the open-source edition
        if (_els.addBtn) _els.addBtn.hidden = false;

        if (_rules.length === 0) {
            _els.list.hidden = true;
            if (_els.emptyState) _els.emptyState.hidden = false;
            return;
        }

        if (_els.emptyState) _els.emptyState.hidden = true;
        _els.list.hidden = false;
        _els.list.textContent = '';

        _rules.forEach(function(rule) {
            var card = _createRuleCard(rule);
            _els.list.appendChild(card);
        });

        _rules.forEach(function(rule) {
            _getCookieCount(rule.domain).then(function(count) {
                var countEl = _els.list.querySelector('[data-rule-count="' + rule.id + '"]');
                if (countEl) {
                    countEl.textContent = chrome.i18n.getMessage('ruleCookiesAffected', [String(count)]) || count + ' cookie' + (count !== 1 ? 's' : '') + ' affected';
                }
            });
        });
    }

    function _createRuleCard(rule) {
        var card = document.createElement('div');
        card.className = 'rule-card' + (rule.enabled ? '' : ' rule-card--disabled');
        card.setAttribute('data-rule-id', rule.id);

        var header = document.createElement('div');
        header.className = 'rule-card-header';

        var domainSpan = document.createElement('span');
        domainSpan.className = 'rule-domain';
        domainSpan.textContent = rule.domain;

        var toggleLabel = document.createElement('label');
        toggleLabel.className = 'toggle rule-toggle';
        toggleLabel.title = rule.enabled ? 'Disable rule' : 'Enable rule';
        var toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = rule.enabled;
        toggleInput.setAttribute('aria-label', (rule.enabled ? 'Disable' : 'Enable') + ' rule for ' + rule.domain);
        var toggleSlider = document.createElement('span');
        toggleSlider.className = 'toggle-slider';
        toggleLabel.appendChild(toggleInput);
        toggleLabel.appendChild(toggleSlider);

        toggleInput.addEventListener('change', function() {
            _toggleRule(rule.id, toggleInput.checked);
        });

        header.appendChild(domainSpan);
        header.appendChild(toggleLabel);

        var meta = document.createElement('div');
        meta.className = 'rule-card-meta';

        var patternBadge = document.createElement('span');
        patternBadge.className = 'badge rule-badge-pattern';
        patternBadge.textContent = rule.pattern === '*' ? (chrome.i18n.getMessage('ruleAllCookies') || 'All cookies') : rule.pattern;

        var scheduleBadge = document.createElement('span');
        scheduleBadge.className = 'badge rule-badge-schedule';
        scheduleBadge.textContent = scheduleLabel(rule.intervalMinutes);

        var countBadge = document.createElement('span');
        countBadge.className = 'rule-cookie-count';
        countBadge.setAttribute('data-rule-count', rule.id);
        countBadge.textContent = '...';

        meta.appendChild(patternBadge);
        meta.appendChild(scheduleBadge);
        meta.appendChild(countBadge);

        var actions = document.createElement('div');
        actions.className = 'rule-card-actions';

        var editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary btn-sm';
        editBtn.textContent = chrome.i18n.getMessage('buttonEdit') || 'Edit';
        editBtn.setAttribute('aria-label', 'Edit rule for ' + rule.domain);
        editBtn.addEventListener('click', function() { _openForm(rule); });

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger-outline btn-sm';
        deleteBtn.textContent = chrome.i18n.getMessage('buttonDelete') || 'Delete';
        deleteBtn.setAttribute('aria-label', 'Delete rule for ' + rule.domain);
        deleteBtn.addEventListener('click', function() { _confirmDeleteRule(rule); });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(header);
        card.appendChild(meta);
        card.appendChild(actions);

        return card;
    }

    function _confirmDeleteRule(rule) {
        if (typeof showConfirm === 'function') {
            showConfirm(
                chrome.i18n.getMessage('confirmDeleteRuleTitle') || 'Delete Rule?',
                chrome.i18n.getMessage('confirmDeleteRuleMsg', [rule.domain]) || 'Delete the auto-delete rule for "' + rule.domain + '"?',
                async function() {
                    var ok = await _deleteRule(rule.id);
                    if (ok) await _loadRules();
                }
            );
        } else {
            if (confirm(chrome.i18n.getMessage('confirmDeleteRuleMsg', [rule.domain]) || 'Delete the auto-delete rule for "' + rule.domain + '"?')) {
                _deleteRule(rule.id).then(function(ok) { if (ok) _loadRules(); });
            }
        }
    }

    function _openForm(rule) {
        if (!_els.formWrap) return;
        _formVisible = true;
        _editingRuleId = rule ? rule.id : null;

        if (_els.formTitle) {
            _els.formTitle.textContent = rule ? (chrome.i18n.getMessage('titleEditRule') || 'Edit Rule') : (chrome.i18n.getMessage('titleAddRule') || 'Add Rule');
        }

        _els.domainInput.value   = rule ? rule.domain : '';
        _els.patternInput.value  = rule ? rule.pattern : '*';

        var mins = rule ? rule.intervalMinutes : 60;
        var options = _els.scheduleSelect.options;
        var found = false;
        for (var i = 0; i < options.length; i++) {
            if (parseInt(options[i].value) === mins) {
                _els.scheduleSelect.selectedIndex = i;
                found = true;
                break;
            }
        }
        if (!found) _els.scheduleSelect.selectedIndex = 0;

        _els.formWrap.hidden = false;
        _els.domainInput.focus();
    }

    function _closeForm() {
        if (!_els.formWrap) return;
        _formVisible = false;
        _editingRuleId = null;
        _els.formWrap.hidden = true;
    }

    async function _handleFormSubmit() {
        var domain = (_els.domainInput.value || '').trim();
        var pattern = (_els.patternInput.value || '').trim() || '*';
        var intervalMinutes = parseInt(_els.scheduleSelect.value);
        if (isNaN(intervalMinutes)) intervalMinutes = 60;
        var rule = _editingRuleId ? _rules.find(function(r) { return r.id === _editingRuleId; }) : null;
        var enabled = rule ? rule.enabled : true;

        if (!domain) {
            _toast(chrome.i18n.getMessage('errDomainPatternRequired') || 'Domain pattern is required', 'error');
            _els.domainInput.focus();
            return;
        }

        var ruleData = {
            domain: domain,
            pattern: pattern,
            intervalMinutes: intervalMinutes,
            enabled: enabled
        };

        if (_editingRuleId) {
            ruleData.id = _editingRuleId;
        }

        var ok = await _saveRule(ruleData);
        if (ok) {
            _closeForm();
            await _loadRules();
        }
    }

    function _bindEvents() {
        if (_els.addBtn) {
            _els.addBtn.addEventListener('click', function() { _openForm(null); });
        }
        if (_els.saveBtn) {
            _els.saveBtn.addEventListener('click', function() { _handleFormSubmit(); });
        }
        if (_els.cancelBtn) {
            _els.cancelBtn.addEventListener('click', function() { _closeForm(); });
        }
        if (_els.formWrap) {
            _els.formWrap.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); _handleFormSubmit(); }
                if (e.key === 'Escape') { _closeForm(); }
            });
        }
    }

    async function init() {
        _resolveElements();
        if (!_els.container) {
            console.debug('[Rules] #tabRules not found, skipping init');
            return;
        }
        if (!_initialized) {
            _bindEvents();
            _initialized = true;
        }
        await _loadRules();
    }

    return {
        init: init,
        reload: _loadRules
    };

})();
