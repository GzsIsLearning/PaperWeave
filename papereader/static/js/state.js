'use strict';

(function () {
  const PW = window.PW = window.PW || {};
  const state = PW.state = {};
  const _listeners = {};

  // ── EventBus (pub/sub) ──────────────────────────────────────────────

  PW.on = function (event, callback) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(callback);
  };

  PW.off = function (event, callback) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(function (cb) { return cb !== callback; });
  };

  PW.emit = function (event, data) {
    if (!_listeners[event]) return;
    _listeners[event].forEach(function (cb) { cb(data); });
  };

  // ── State store ─────────────────────────────────────────────────────

  PW.setState = function (key, value) {
    state[key] = value;
    PW.emit('change:' + key, value);
  };

  PW.getState = function (key) {
    return state[key];
  };

  // ── Preferences persistence ─────────────────────────────────────────

  PW.savePrefs = function () {
    var prefs = {
      sidebarW:       state.sidebarW,
      fontScale:      state.fontScale,
      contentW:       state.contentW,
      theme:          state.theme,
      fontFamily:     state.fontFamily,
      sidebarCollapsed: state.sidebarCollapsed
    };
    try {
      localStorage.setItem('paperweave_prefs', JSON.stringify(prefs));
    } catch (e) { /* quota exceeded or unavailable */ }
  };

  function loadPrefs() {
    var prefs = null;
    try {
      prefs = JSON.parse(localStorage.getItem('paperweave_prefs'));
    } catch (e) { /* corrupted data */ }

    if (!prefs) return;

    if (typeof prefs.sidebarW    === 'number') state.sidebarW    = prefs.sidebarW;
    if (typeof prefs.fontScale   === 'number') state.fontScale   = prefs.fontScale;
    if (typeof prefs.contentW    === 'number') state.contentW    = prefs.contentW;
    if (typeof prefs.theme       === 'string') state.theme       = prefs.theme;
    if (typeof prefs.fontFamily  === 'string') state.fontFamily  = prefs.fontFamily;
    if (typeof prefs.sidebarCollapsed === 'boolean') state.sidebarCollapsed = prefs.sidebarCollapsed;
  }

  // ── Initial state ───────────────────────────────────────────────────

  // Paper data
  state.papers       = [];
  state.currentSlug  = null;
  state.currentPaper = null;
  state.savedSelection = null;
  state.viewMode     = 'full';
  state.highlightList = [];
  state.translationHistory = [];
  state.contextTab   = 'images';
  state.notesCache   = {};     // slug → text
  state.starredSet   = new Set();

  // Preferences (persisted to localStorage)
  state.sidebarW       = 280;
  state.fontScale      = 0;
  state.contentW       = 720;
  state.theme          = 'dark';
  state.fontFamily     = 'system';
  state.sidebarCollapsed = false;

  // Drag states
  state.cwDragging = false;
  state.cwOffX     = 0;
  state.cwOffY     = 0;
  state.rvDragging = false;
  state.rvOffX     = 0;
  state.rvOffY     = 0;
  state.rpDragging = false;
  state.rpOffX     = 0;
  state.rpOffY     = 0;

  // UI ephemeral
  state.renderSlot        = 0;
  state.noteModalCallback = null;
  state.highlightedElement = null;
  state.imgPopupTarget    = null;
  state.cluePopupTarget   = null;
  state.trPopup           = null;

  // Translation cache (in-memory, for current session)
  state.transCache = [];

  // ── Load persisted preferences on init ──────────────────────────────

  loadPrefs();

  // Auto-save preferences whenever a pref key changes
  var _prefKeys = ['sidebarW', 'fontScale', 'contentW', 'theme', 'fontFamily', 'sidebarCollapsed'];
  _prefKeys.forEach(function (key) {
    PW.on('change:' + key, function () {
      PW.savePrefs();
    });
  });

  // ── Named events (documented convenience triggers) ──────────────────

  // 'paper:loaded'   — emit when loadPaper completes
  // 'paper:switched' — emit when user switches to different paper
  // 'chat:message-added' — emit when a message is added to chat
  // 'chat:session-changed' — emit when active session changes
  // 'clue:changed'   — emit when clues are modified
  // 'ui:theme-changed'
  // 'ui:font-changed'
  // 'sidebar:toggled'

})();
