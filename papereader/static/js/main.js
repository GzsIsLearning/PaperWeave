'use strict';

(function () {
  var PW = window.PW = window.PW || {};

  // ======================================================================
  // GLOBAL WRAPPERS for onclick handlers in HTML
  // These bridge the onclick attributes in index.html to PW.* functions.
  // ======================================================================

  window.toggleSidebar = function () {
    var collapsed = PW.getState('sidebarCollapsed');
    var newVal = !collapsed;
    PW.setState('sidebarCollapsed', newVal);
    var sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed', newVal);
    var dl = document.getElementById('drag-left');
    if (dl) dl.style.display = newVal ? 'none' : '';
    PW.savePrefs();
  };

  window.adjustFont = function (delta) {
    var scale = PW.getState('fontScale') || 0;
    scale = Math.max(-4, Math.min(8, scale + delta));
    PW.setState('fontScale', scale);
    applyFontScaleDOM(scale);
    PW.savePrefs();
  };

  window.applyFontFamily = function (family) {
    PW.setState('fontFamily', family);
    var fmap = {
      system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
      serif: "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'Georgia', serif",
      mono: "'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Fira Code', monospace"
    };
    document.documentElement.style.setProperty('--font-reading', fmap[family] || fmap.system);
    var menu = document.getElementById('font-menu');
    if (menu) {
      [].forEach.call(menu.querySelectorAll('button'), function (b) {
        b.classList.toggle('active', b.dataset.font === family);
      });
    }
    var btn = document.getElementById('btn-font');
    var labels = { system: 'Aa', serif: 'Aa 衬', mono: 'Aa 宽' };
    if (btn) btn.textContent = labels[family] || 'Aa';
    PW.savePrefs();
  };

  window.toggleFontDropdown = function () {
    var menu = document.getElementById('font-menu');
    if (menu) menu.classList.toggle('show');
  };

  window.toggleTheme = function () {
    var theme = PW.getState('theme') || 'dark';
    theme = theme === 'dark' ? 'light' : 'dark';
    PW.setState('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('btn-theme');
    if (btn) btn.textContent = theme === 'light' ? '☀' : '☾';
    PW.savePrefs();
  };

  window.toggleReviewPanel = function () {
    if (PW.toggleReviewPanel) PW.toggleReviewPanel();
  };

  window.toggleChatWindow = function () {
    if (PW.toggleChatWindow) PW.toggleChatWindow();
  };

  window.closeImageZoom = function () {
    if (PW.closeImageZoom) PW.closeImageZoom();
  };

  window.doTranslate = function () { doTranslateAction(); };
  window.doAskAI = function () { doAskAIAction(); };
  window.doHighlight = function () { doHighlightAction(); };
  window.doDeleteHighlight = function () { doDeleteHighlightAction(); };
  window.askAIAboutImage = function () { askAIAboutImageAction(); };
  window.collectImageToClue = function () { collectImageToClueAction(); };
  window.editClueViaContext = function () { if (PW.editClueViaContext) PW.editClueViaContext(); };
  window.copyClueContent = function () { if (PW.copyClueContent) PW.copyClueContent(); };
  window.deleteClueViaContext = function () { if (PW.deleteClueViaContext) PW.deleteClueViaContext(); };
  window.closeResultPopup = function () { closeResultPopupDOM(); };
  window.sendChatMessage = function () { if (PW.sendChatMessage) PW.sendChatMessage(); };
  window.toggleSessionDropdown = function () { if (PW.toggleSessionDropdown) PW.toggleSessionDropdown(); };
  window.newSession = function () { if (PW.newSession) PW.newSession(); };
  window.cancelNoteModal = function () { cancelNoteModalDOM(); };
  window.confirmNoteModal = function () { confirmNoteModalDOM(); };
  window.clearAllClues = function () { if (PW.clearAllClues) PW.clearAllClues(); };
  window.createQuickNoteClue = function () { if (PW.createQuickNoteClue) PW.createQuickNoteClue(); };

  // ======================================================================
  // LOCAL HELPERS: font scale DOM application
  // ======================================================================

  function applyFontScaleDOM(scale) {
    var sizes = [12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28];
    var idx = Math.max(0, Math.min(sizes.length - 1, 4 + scale));
    var px = sizes[idx];
    document.documentElement.style.setProperty('--font-size', px + 'px');
    document.documentElement.style.setProperty('--line-spacing', (1.75 + scale * 0.04).toFixed(2));
    var label = document.getElementById('font-label');
    if (label) label.textContent = px + 'px';
  }

  // ======================================================================
  // LOCAL HELPERS: selection popup
  // ======================================================================

  function showPopupAt(rect) {
    var popup = document.getElementById('sel-popup');
    if (!popup) return;
    popup.style.display = 'block';
    var popupH = popup.offsetHeight || 110;
    var popupW = popup.offsetWidth || 160;
    var top = rect.bottom + 8;
    if (top + popupH + 10 > window.innerHeight) top = rect.top - popupH - 8;
    top = Math.max(8, Math.min(top, window.innerHeight - popupH - 8));
    var left = rect.left + rect.width / 2 - popupW / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - popupW - 10));
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }

  function hidePopup() {
    var sp = document.getElementById('sel-popup');
    if (sp) sp.style.display = 'none';
    var ip = document.getElementById('img-popup');
    if (ip) ip.style.display = 'none';
    var cp = document.getElementById('clue-popup');
    if (cp) cp.style.display = 'none';
  }

  function preparePopup(showDelete) {
    var delBtn = document.getElementById('btn-delete-hl');
    var hlBtn = document.getElementById('btn-highlight');
    if (delBtn) delBtn.style.display = showDelete ? '' : 'none';
    if (hlBtn) hlBtn.style.display = showDelete ? 'none' : '';
  }

  // ======================================================================
  // SELECTION HANDLERS (mouseup → text popup)
  // ======================================================================

  function onSelection(e) {
    var sel = window.getSelection();
    var text = '';
    if (PW.extractLatexText) {
      text = PW.extractLatexText(sel);
    } else {
      text = (sel.toString() || '').trim();
    }
    if (!text || text.length < 3) { hidePopup(); return; }
    PW.setState('savedSelection', text);
    PW.setState('highlightedElement', null);
    preparePopup(false);
    var range = sel.getRangeAt(0);
    if (range) showPopupAt(range.getBoundingClientRect());
  }

  // ======================================================================
  // BUG FIX: Single unified contextmenu handler for #content
  // Checks for image FIRST, then falls through to text handling.
  // Previously there were TWO contextmenu handlers (L925 + L1301 in inline
  // script), both firing on image right-click → two popups appeared.
  // Now: one handler with priority: image → highlight → text.
  // ======================================================================

  function onContentContextMenu(e) {
    // Priority 1: Image right-click
    var img = e.target.closest('#content img');
    if (img) {
      e.preventDefault();
      PW.setState('imgPopupTarget', img);
      var imgPopup = document.getElementById('img-popup');
      if (imgPopup) {
        imgPopup.style.display = 'block';
        var left = e.clientX + 8;
        var top = e.clientY + 8;
        if (left + 160 > window.innerWidth) left = e.clientX - 168;
        if (top + 80 > window.innerHeight) top = e.clientY - 88;
        imgPopup.style.left = left + 'px';
        imgPopup.style.top = top + 'px';
      }
      return;
    }

    // Priority 2: Text (highlighted or selection)
    e.preventDefault();
    var hlEl = e.target.closest('.hl-mark');
    if (hlEl) {
      PW.setState('highlightedElement', hlEl);
      PW.setState('savedSelection', hlEl.textContent.trim());
      preparePopup(true);
      showPopupAt(hlEl.getBoundingClientRect());
      return;
    }

    var sel = window.getSelection();
    var text = sel.toString().trim();
    if (text.length < 3) return;
    PW.setState('savedSelection', text);
    PW.setState('highlightedElement', null);
    preparePopup(false);
    showPopupAt(sel.getRangeAt(0).getBoundingClientRect());
  }

  // ======================================================================
  // RESULT POPUP helpers
  // ======================================================================

  function showResultPopup(title, html) {
    var popup = document.getElementById('result-popup');
    if (!popup) return;
    var titleEl = document.getElementById('rp-title');
    if (titleEl) titleEl.textContent = title;
    var bodyEl = document.getElementById('rp-body');
    if (bodyEl) bodyEl.innerHTML = html;
    popup.style.display = 'block';
    popup.style.transform = 'none';
    var pw = popup.offsetWidth || 480;
    popup.style.left = Math.max(10, (window.innerWidth - pw) / 2) + 'px';
    popup.style.top = '12%';
    popup.style.right = 'auto';
    popup.style.bottom = 'auto';
  }

  function closeResultPopupDOM() {
    var popup = document.getElementById('result-popup');
    if (popup) popup.style.display = 'none';
  }

  // ======================================================================
  // NOTE MODAL helpers
  // ======================================================================

  function cancelNoteModalDOM() {
    var backdrop = document.getElementById('note-backdrop');
    if (backdrop) backdrop.style.display = 'none';
    var modal = document.getElementById('note-modal');
    if (modal) modal.style.display = 'none';
    var cb = PW.getState('noteModalCallback');
    if (cb) {
      PW.setState('noteModalCallback', null);
      cb(null);
    }
  }

  function confirmNoteModalDOM() {
    var backdrop = document.getElementById('note-backdrop');
    if (backdrop) backdrop.style.display = 'none';
    var modal = document.getElementById('note-modal');
    if (modal) modal.style.display = 'none';
    var input = document.getElementById('note-modal-input');
    var val = input ? input.value.trim() : '';
    var cb = PW.getState('noteModalCallback');
    if (cb) {
      PW.setState('noteModalCallback', null);
      cb(val || '');
    }
  }

  // ======================================================================
  // ACTION IMPLEMENTATIONS (doTranslate, doAskAI, doHighlight, etc.)
  // These exist as inline functions in the HTML script.
  // We re-implement them here using PW.* and fetch.
  // ======================================================================

  function doTranslateAction() {
    var savedSelection = PW.getState('savedSelection');
    var currentSlug = PW.getState('currentSlug');
    if (!savedSelection || !currentSlug) return;
    hidePopup();
    if (PW.toast) PW.toast('翻译中...');

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: savedSelection, slug: currentSlug })
    }).then(function (res) { return res.json(); })
      .then(function (data) {
        var transCache = PW.getState('transCache') || [];
        transCache.push({
          text: savedSelection,
          translation: data.translation,
          slug: currentSlug,
          time: new Date().toISOString()
        });
        PW.setState('transCache', transCache);
        showResultPopup('🌐 翻译结果',
          '<div style="margin-bottom:12px;padding:10px 12px;background:var(--bg-hover);border-radius:var(--radius);font-size:12px;color:var(--text-muted);line-height:1.6">' +
          (PW.escHtml ? PW.escHtml(savedSelection) : savedSelection.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')) +
          '</div>' +
          '<div style="padding:4px 0;line-height:1.8;font-size:14px">' +
          (PW.escHtml ? PW.escHtml(data.translation) : data.translation.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')) +
          '</div>');
        if (PW.toast) PW.toast('翻译完成 ✓');
      }).catch(function (e) {
        if (PW.toast) PW.toast('翻译失败: ' + e.message);
      });
  }

  function doAskAIAction() {
    var savedSelection = PW.getState('savedSelection');
    if (!savedSelection) return;
    hidePopup();
    var prefill = '关于: ' + savedSelection.substring(0, 80) +
      (savedSelection.length > 80 ? '...' : '') +
      '\n\n这段是什么意思？';
    if (PW.openChatWindow) PW.openChatWindow(prefill);
  }

  function doHighlightAction() {
    var savedSelection = PW.getState('savedSelection');
    var currentSlug = PW.getState('currentSlug');
    if (!savedSelection || !currentSlug) return;
    hidePopup();

    fetch('/api/highlight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: currentSlug, text: savedSelection, note: '' })
    }).then(function (res) { return res.json(); })
      .then(function () {
        if (PW.toast) PW.toast('已标注 ✓');
        if (PW.addClue) {
          PW.addClue({
            type: 'highlight',
            content: { text: savedSelection, note: '', translated: '' },
            position: { textSnippet: savedSelection.substring(0, 80) }
          });
        }
        if (PW.loadPaper) PW.loadPaper(currentSlug);
      }).catch(function (e) {
        if (PW.toast) PW.toast('标注失败: ' + e.message);
      });
  }

  function doDeleteHighlightAction() {
    var highlightedElement = PW.getState('highlightedElement');
    var currentSlug = PW.getState('currentSlug');
    if (!highlightedElement || !currentSlug) return;
    var text = highlightedElement.textContent.trim();
    if (!text) return;
    hidePopup();

    fetch('/api/highlight/' + encodeURIComponent(currentSlug) + '?text=' + encodeURIComponent(text.substring(0, 120)), {
      method: 'DELETE'
    }).then(function (res) { return res.json(); })
      .then(function (data) {
        if (PW.toast) PW.toast(data.ok ? '已删除标注 ✓' : '删除失败');
        if (data.ok && PW.loadPaper) PW.loadPaper(currentSlug);
      }).catch(function (e) {
        if (PW.toast) PW.toast('删除失败: ' + e.message);
      });
  }

  function askAIAboutImageAction() {
    var imgPopupTarget = PW.getState('imgPopupTarget');
    if (!imgPopupTarget) return;
    var src = imgPopupTarget.src;
    var imgPopup = document.getElementById('img-popup');
    if (imgPopup) imgPopup.style.display = 'none';
    if (PW.openChatWindow) PW.openChatWindow();
    var input = document.getElementById('cw-input');
    if (input) {
      input.value = '请分析这张图片：' + src;
      input.focus();
    }
  }

  function collectImageToClueAction() {
    var imgPopupTarget = PW.getState('imgPopupTarget');
    if (!imgPopupTarget) return;
    var src = imgPopupTarget.src;
    var imgPopup = document.getElementById('img-popup');
    if (imgPopup) imgPopup.style.display = 'none';
    if (PW.addClue) {
      PW.addClue({
        type: 'image',
        content: { src: src, caption: imgPopupTarget.alt || '' },
        position: { textSnippet: '' }
      });
    }
  }

  // ======================================================================
  // SCROLL HANDLER: reading position persistence (debounced)
  // ======================================================================

  var posSaveTimer;
  function onContentScrollSavePos() {
    var currentSlug = PW.getState('currentSlug');
    if (!currentSlug) return;
    var content = document.getElementById('content');
    if (content && content.querySelector('.loading')) return;
    clearTimeout(posSaveTimer);
    posSaveTimer = setTimeout(function () {
      var scrollTop = content ? content.scrollTop : 0;
      if (scrollTop > 0) {
        try {
          localStorage.setItem('pw-readpos-' + currentSlug, scrollTop);
        } catch (e) { /* ignore */ }
      }
    }, 500);
  }

  // ======================================================================
  // DRAG RESIZE: sidebar + clue board
  // ======================================================================

  function initDragResize() {
    var overlay = document.getElementById('drag-overlay');

    // Sidebar drag (left handle)
    var leftHandle = document.getElementById('drag-left');
    if (leftHandle) {
      var sidebarDragging = false, sidebarStartX, sidebarStartW;
      leftHandle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        sidebarDragging = true;
        sidebarStartX = e.clientX;
        sidebarStartW = PW.getState('sidebarW') || 280;
        leftHandle.classList.add('active');
        if (overlay) overlay.style.display = 'block';
      });
      document.addEventListener('mousemove', function (e) {
        if (!sidebarDragging) return;
        var delta = e.clientX - sidebarStartX;
        var newW = Math.max(200, Math.min(600, sidebarStartW + delta));
        PW.setState('sidebarW', newW);
        document.documentElement.style.setProperty('--sidebar-w', newW + 'px');
        PW.savePrefs();
      });
      document.addEventListener('mouseup', function () {
        if (sidebarDragging) {
          leftHandle.classList.remove('active');
          if (overlay) overlay.style.display = 'none';
          sidebarDragging = false;
        }
      });
    }

    // Clue board drag (right handle)
    var clueHandle = document.getElementById('clue-drag');
    if (clueHandle) {
      var clueDragging = false, clueStartX, clueStartW;
      clueHandle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        clueDragging = true;
        clueStartX = e.clientX;
        var board = document.getElementById('clue-board');
        clueStartW = board ? parseFloat(getComputedStyle(board).width) : 280;
        clueHandle.classList.add('active');
        if (overlay) overlay.style.display = 'block';
      });
      document.addEventListener('mousemove', function (e) {
        if (!clueDragging) return;
        var delta = clueStartX - e.clientX;
        var newW = Math.max(220, Math.min(800, clueStartW + delta));
        document.documentElement.style.setProperty('--context-w', newW + 'px');
        PW.savePrefs();
      });
      document.addEventListener('mouseup', function () {
        if (clueDragging) {
          clueHandle.classList.remove('active');
          if (overlay) overlay.style.display = 'none';
          clueDragging = false;
        }
      });
    }
  }

  // ======================================================================
  // REVIEW PANEL DRAG
  // ======================================================================

  function initReviewPanelDrag() {
    var rvHeader = document.getElementById('rv-header');
    if (!rvHeader) return;
    rvHeader.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      var panel = document.getElementById('review-panel');
      if (!panel) return;
      PW.setState('rpDragging', true);
      PW.setState('rpOffX', e.clientX - panel.getBoundingClientRect().left);
      PW.setState('rpOffY', e.clientY - panel.getBoundingClientRect().top);
      panel.style.transition = 'none';
      e.preventDefault();
    });
  }

  // ======================================================================
  // APPLICATION INITIALIZATION
  // ======================================================================

  function init() {
    // ── 1. Apply saved theme ──
    var theme = PW.getState('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    var themeBtn = document.getElementById('btn-theme');
    if (themeBtn) themeBtn.textContent = theme === 'light' ? '☀' : '☾';

    // ── 2. Apply saved font family ──
    var fontFamily = PW.getState('fontFamily') || 'system';
    window.applyFontFamily(fontFamily);

    // ── 3. Apply saved sidebar state ──
    var sidebarW = PW.getState('sidebarW') || 280;
    document.documentElement.style.setProperty('--sidebar-w', sidebarW + 'px');
    var contentW = PW.getState('contentW') || 720;
    document.documentElement.style.setProperty('--content-w', contentW + 'px');

    var sidebarCollapsed = PW.getState('sidebarCollapsed');
    if (sidebarCollapsed) {
      var sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.add('collapsed');
      var dl = document.getElementById('drag-left');
      if (dl) dl.style.display = 'none';
    }

    // ── 4. Apply font scale ──
    var fontScale = PW.getState('fontScale') || 0;
    applyFontScaleDOM(fontScale);

    // ── 5. Load starred papers ──
    try {
      var arr = JSON.parse(localStorage.getItem('pw-starred') || '[]');
      PW.setState('starredSet', new Set(arr));
    } catch (e) {
      PW.setState('starredSet', new Set());
    }
    // Merge with server stars for cross-device sync
    if (PW.syncStarsFromServer) PW.syncStarsFromServer();

    // ── 6. Render clue board ──
    if (PW.renderClueBoard) PW.renderClueBoard();

    // ── 7. Load global chat sessions from server ──
    if (PW.loadSessions) PW.loadSessions();

    // ======================================================================
    // EVENT BINDINGS
    // ======================================================================

    var content = document.getElementById('content');

    // ── content contextmenu: SINGLE HANDLER (BUG FIX) ──
    // Checks image first, then falls through to text handling.
    // Previously two handlers both fired on image right-click.
    if (content) {
      content.addEventListener('contextmenu', onContentContextMenu);
    }

    // ── content click: image zoom ──
    if (content) {
      content.addEventListener('click', function (e) {
        if (e.target.tagName === 'IMG') {
          var img = e.target;
          if (img.classList.contains('zoomed')) {
            if (PW.closeImageZoom) PW.closeImageZoom();
          } else {
            [].forEach.call(document.querySelectorAll('#content img.zoomed'), function (i) {
              i.classList.remove('zoomed');
            });
            img.classList.add('zoomed');
            var backdrop = document.getElementById('img-backdrop');
            if (backdrop) backdrop.style.display = 'block';
            e.stopPropagation();
          }
        }
      });
    }

    // ── content scroll: reading progress ──
    if (content) {
      content.addEventListener('scroll', function () {
        if (PW.updateReadProgress) PW.updateReadProgress();
      });
    }

    // ── content scroll: save reading position ──
    if (content) {
      content.addEventListener('scroll', onContentScrollSavePos);
    }

    // ── content mouseup: detect selection ──
    if (content) {
      content.addEventListener('mouseup', onSelection);
    }

    // ── document mousedown: hide popups on outside click ──
    document.addEventListener('mousedown', function (e) {
      if (!e.target.closest('#sel-popup') &&
          !e.target.closest('#img-popup') &&
          !e.target.closest('#clue-popup') &&
          !e.target.closest('#content') &&
          !e.target.closest('#note-modal')) {
        hidePopup();
      }
    });

    // ── chat header mousedown: chat drag ──
    var cwHeader = document.getElementById('cw-header');
    if (cwHeader) {
      cwHeader.addEventListener('mousedown', function (e) {
        if (e.target.tagName === 'BUTTON') return;
        var cw = document.getElementById('chat-window');
        if (!cw) return;
        PW.setState('cwDragging', true);
        PW.setState('cwOffX', e.clientX - cw.getBoundingClientRect().left);
        PW.setState('cwOffY', e.clientY - cw.getBoundingClientRect().top);
        cw.style.transition = 'none';
        e.preventDefault();
      });
    }

    // ── document mousemove: unified drag handler (cw + rp + rv) ──
    document.addEventListener('mousemove', function (e) {
      // Chat window drag
      if (PW.getState('cwDragging')) {
        var cw = document.getElementById('chat-window');
        if (cw) {
          var cwOffX = PW.getState('cwOffX') || 0;
          var cwOffY = PW.getState('cwOffY') || 0;
          cw.style.left = Math.max(0, Math.min(window.innerWidth - cw.offsetWidth, e.clientX - cwOffX)) + 'px';
          cw.style.top = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - cwOffY)) + 'px';
        }
      }
      // Result popup drag
      if (PW.getState('rvDragging')) {
        var popup = document.getElementById('result-popup');
        if (popup) {
          var rvOffX = PW.getState('rvOffX') || 0;
          var rvOffY = PW.getState('rvOffY') || 0;
          popup.style.left = Math.max(0, Math.min(window.innerWidth - popup.offsetWidth, e.clientX - rvOffX)) + 'px';
          popup.style.top = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - rvOffY)) + 'px';
        }
      }
      // Review panel drag
      if (PW.getState('rpDragging')) {
        var panel = document.getElementById('review-panel');
        if (panel) {
          var rpOffX = PW.getState('rpOffX') || 0;
          var rpOffY = PW.getState('rpOffY') || 0;
          panel.style.left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, e.clientX - rpOffX)) + 'px';
          panel.style.top = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - rpOffY)) + 'px';
        }
      }
    });

    // ── document mouseup: unified drag release ──
    document.addEventListener('mouseup', function () {
      if (PW.getState('cwDragging')) {
        PW.setState('cwDragging', false);
        var cw = document.getElementById('chat-window');
        if (cw) cw.style.transition = '';
      }
      if (PW.getState('rvDragging')) {
        PW.setState('rvDragging', false);
        var popup = document.getElementById('result-popup');
        if (popup) popup.style.transition = '';
      }
      if (PW.getState('rpDragging')) {
        PW.setState('rpDragging', false);
        var panel = document.getElementById('review-panel');
        if (panel) panel.style.transition = '';
      }
    });

    // ── chat input keydown: Enter to send ──
    var cwInput = document.getElementById('cw-input');
    if (cwInput) {
      cwInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (PW.sendChatMessage) PW.sendChatMessage();
        }
      });
    }

    // ── result popup header mousedown: result popup drag ──
    var resultPopup = document.getElementById('result-popup');
    if (resultPopup) {
      var rpHeader = resultPopup.querySelector('.rp-header');
      if (rpHeader) {
        rpHeader.addEventListener('mousedown', function (e) {
          if (e.target.tagName === 'BUTTON') return;
          PW.setState('rvDragging', true);
          PW.setState('rvOffX', e.clientX - resultPopup.getBoundingClientRect().left);
          PW.setState('rvOffY', e.clientY - resultPopup.getBoundingClientRect().top);
          resultPopup.style.transition = 'none';
          e.preventDefault();
        });
      }
    }

    // ── translation hover (mouseover / mouseout) ──
    var trPopup = null;
    document.addEventListener('mouseover', function (e) {
      var tr = e.target.closest('.tr-mark');
      if (!tr) {
        if (trPopup) { trPopup.remove(); trPopup = null; }
        return;
      }
      if (!trPopup) {
        trPopup = document.createElement('div');
        trPopup.id = 'tr-popup';
        trPopup.style.cssText = 'position:fixed;z-index:999;background:var(--bg-panel);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-lg);padding:10px 14px;font-size:13px;line-height:1.6;max-width:360px;color:var(--text);pointer-events:none;';
        document.body.appendChild(trPopup);
      }
      trPopup.textContent = tr.dataset.translation || '';
      var rect = tr.getBoundingClientRect();
      trPopup.style.left = Math.min(rect.left, window.innerWidth - 380) + 'px';
      trPopup.style.top = (rect.bottom + 6 > window.innerHeight ? rect.top - trPopup.offsetHeight - 6 : rect.bottom + 6) + 'px';
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('.tr-mark')) {
        setTimeout(function () {
          if (trPopup && !document.querySelector('.tr-mark:hover')) {
            trPopup.remove();
            trPopup = null;
          }
        }, 100);
      }
    });

    // ── clue flow contextmenu ──
    var clueFlow = document.getElementById('clue-flow');
    if (clueFlow) {
      clueFlow.addEventListener('contextmenu', function (e) {
        var card = e.target.closest('.clue-card');
        if (!card) return;
        e.preventDefault();
        PW.setState('cluePopupTarget', card.dataset.id);
        var popup = document.getElementById('clue-popup');
        if (popup) {
          popup.style.display = 'block';
          var left = e.clientX + 8;
          var top = e.clientY + 8;
          if (left + 150 > window.innerWidth) left = e.clientX - 158;
          if (top + 100 > window.innerHeight) top = e.clientY - 108;
          popup.style.left = left + 'px';
          popup.style.top = top + 'px';
        }
      });
    }

    // ── outside click to close font dropdown ──
    document.addEventListener('click', function (e) {
      var dd = document.getElementById('font-dropdown');
      if (dd && !dd.contains(e.target)) {
        var menu = document.getElementById('font-menu');
        if (menu) menu.classList.remove('show');
      }
    });

    // ── outside click to close session dropdown ──
    document.addEventListener('click', function (e) {
      var dd = document.getElementById('cw-session-dropdown');
      var btn = document.getElementById('cw-session-btn');
      if (dd && dd.classList.contains('show') && !dd.contains(e.target) && e.target !== btn) {
        dd.classList.remove('show');
      }
    });

    // ── sidebar drag resize ──
    initDragResize();

    // ── review panel drag ──
    initReviewPanelDrag();

    // ── Fetch papers and render ──
    fetch('/api/papers')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        PW.setState('papers', data.papers);
        var countEl = document.getElementById('paper-count');
        if (countEl) countEl.textContent = '(' + data.papers.length + ' 篇)';
        if (PW.renderPaperList) PW.renderPaperList(data.papers);

        // Search input
        var searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.addEventListener('input', function (e) {
            var q = e.target.value.toLowerCase();
            var papers = PW.getState('papers') || [];
            var filtered = papers.filter(function (p) {
              return !q || p.title.toLowerCase().indexOf(q) !== -1 ||
                (p.authors || []).join(' ').toLowerCase().indexOf(q) !== -1 ||
                (p.tags || []).join(' ').toLowerCase().indexOf(q) !== -1;
            });
            if (PW.renderPaperList) PW.renderPaperList(filtered);
            // Reset list focus index (for keyboard nav)
            PW._listFocusIdx = -1;
          });
        }
      }).catch(function (e) {
        console.error('Failed to load papers:', e);
      });

    // ======================================================================
    // DOCUMENT-LEVEL KEYBOARD HANDLING
    // BUG FIX: Added note modal close on Escape, plus result popup.
    // Previously Escape only closed result popup (L1714) but not note modal.
    // ======================================================================

    var listFocusIdx = -1;
    document.addEventListener('keydown', function (e) {
      // ── Escape: close all overlays in priority order ──
      if (e.key === 'Escape') {
        // Close note modal first (if visible)
        var noteModal = document.getElementById('note-modal');
        if (noteModal && noteModal.style.display === 'block') {
          e.preventDefault();
          cancelNoteModalDOM();
          return;
        }
        // Close result popup
        var resultPopup = document.getElementById('result-popup');
        if (resultPopup && resultPopup.style.display === 'block') {
          closeResultPopupDOM();
          return;
        }
        // Close image zoom
        if (PW.closeImageZoom) PW.closeImageZoom();
        // Hide selection popups
        hidePopup();
        return;
      }

      // ── Ctrl+R: show review ──
      var currentSlug = PW.getState('currentSlug');
      if (e.key === 'r' && e.ctrlKey && currentSlug) {
        e.preventDefault();
        if (PW.showReview) PW.showReview();
      }
      // ── Ctrl+F: show full ──
      if (e.key === 'f' && e.ctrlKey && currentSlug) {
        e.preventDefault();
        if (PW.showFull) PW.showFull();
      }

      // ── Quick search focus with / ──
      var searchInput = document.getElementById('search-input');
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }

      // ── Sidebar list navigation with arrow keys ──
      var isTyping = document.activeElement === searchInput &&
        searchInput && searchInput.value.length > 0 && e.key.length === 1;
      if (isTyping) return;

      var items = document.querySelectorAll('#paper-list .paper-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        listFocusIdx = Math.min(items.length - 1, listFocusIdx + 1);
        focusListItem(items, listFocusIdx);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        listFocusIdx = Math.max(0, listFocusIdx - 1);
        focusListItem(items, listFocusIdx);
      } else if (e.key === 'Enter' && listFocusIdx >= 0 && items[listFocusIdx]) {
        e.preventDefault();
        items[listFocusIdx].click();
      }

      // ── Vim-like scroll in content area ──
      var isInputFocused = ['INPUT', 'TEXTAREA'].indexOf(document.activeElement ? document.activeElement.tagName : '') !== -1;
      if (!isInputFocused && !e.ctrlKey && !e.altKey && !e.metaKey) {
        var contentEl = document.getElementById('content');
        if (!contentEl) return;
        if (e.key === 'j') { e.preventDefault(); contentEl.scrollBy({ top: 50, behavior: 'smooth' }); }
        if (e.key === 'k') { e.preventDefault(); contentEl.scrollBy({ top: -50, behavior: 'smooth' }); }
        if (e.key === 'g' && !e.shiftKey) { e.preventDefault(); contentEl.scrollTo({ top: 0, behavior: 'smooth' }); }
        if (e.key === 'G') { e.preventDefault(); contentEl.scrollTo({ top: contentEl.scrollHeight, behavior: 'smooth' }); }
      }
    });

    function focusListItem(items, idx) {
      [].forEach.call(items, function (it, i) {
        if (i === idx) {
          it.style.background = 'var(--bg-active)';
          it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          it.style.background = '';
        }
      });
    }
  }

  // ── Run initialization on DOMContentLoaded ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
