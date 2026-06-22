'use strict';

(function () {
  var PW = window.PW = window.PW || {};

  // ═══════════════════════════════════════════════════════════════════════
  // 1. INIT  —  apply saved theme, font, sidebar state on page load
  // ═══════════════════════════════════════════════════════════════════════

  PW.initUI = function () {
    var theme          = PW.getState('theme')          || 'dark';
    var fontFamily     = PW.getState('fontFamily')     || 'system';
    var fontScale      = PW.getState('fontScale')      || 0;
    var sidebarW       = PW.getState('sidebarW')       || 280;
    var contentW       = PW.getState('contentW')       || 720;
    var sidebarCollapsed = PW.getState('sidebarCollapsed') || false;

    // Theme
    document.documentElement.setAttribute('data-theme', theme);
    var btnTheme = document.getElementById('btn-theme');
    if (btnTheme) btnTheme.textContent = theme === 'light' ? '☀' : '☾';

    // Font family
    PW.applyFontFamily(fontFamily);

    // Layout dimensions
    document.documentElement.style.setProperty('--sidebar-w', sidebarW + 'px');
    document.documentElement.style.setProperty('--content-w', contentW + 'px');

    // Font scale
    PW.applyFontScale(fontScale);

    // Sidebar collapse state
    var sidebar = document.getElementById('sidebar');
    var dragLeft = document.getElementById('drag-left');
    if (sidebarCollapsed && sidebar) sidebar.classList.add('collapsed');
    if (dragLeft) dragLeft.style.display = sidebarCollapsed ? 'none' : '';
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 2. THEME & FONT
  // ═══════════════════════════════════════════════════════════════════════

  // ── toggleTheme ───────────────────────────────────────────────────────

  PW.toggleTheme = function () {
    var theme = PW.getState('theme') || 'dark';
    theme = theme === 'dark' ? 'light' : 'dark';
    PW.setState('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('btn-theme');
    if (btn) btn.textContent = theme === 'light' ? '☀' : '☾';
    PW.emit('ui:theme-changed', { theme: theme });
  };

  // ── applyFontScale ────────────────────────────────────────────────────
  // Apply font scale level visually.  scale is an offset from default idx=4 (16px).

  PW.applyFontScale = function (scale) {
    var sizes = [12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28]; // base idx=4 → 16px
    var idx = Math.max(0, Math.min(sizes.length - 1, 4 + (scale || 0)));
    var px = sizes[idx];
    document.documentElement.style.setProperty('--font-size', px + 'px');
    document.documentElement.style.setProperty('--line-spacing', (1.75 + (scale || 0) * 0.04).toFixed(2));
    var label = document.getElementById('font-label');
    if (label) label.textContent = px + 'px';
  };

  // ── adjustFont(delta) ─────────────────────────────────────────────────

  PW.adjustFont = function (delta) {
    var fontScale = PW.getState('fontScale') || 0;
    fontScale = Math.max(-4, Math.min(8, fontScale + delta));
    PW.setState('fontScale', fontScale);
    PW.applyFontScale(fontScale);
    PW.emit('ui:font-changed', { scale: fontScale });
  };

  // ── resetFont ─────────────────────────────────────────────────────────

  PW.resetFont = function () {
    PW.setState('fontScale', 0);
    PW.setState('contentW', 720);
    document.documentElement.style.setProperty('--content-w', '720px');
    PW.applyFontScale(0);
    PW.emit('ui:font-changed', { scale: 0 });
  };

  // ── applyFontFamily(family) ───────────────────────────────────────────

  PW.applyFontFamily = function (family) {
    var fmap = {
      system: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'PingFang SC\', \'Hiragino Sans GB\', \'Microsoft YaHei\', \'Noto Sans SC\', sans-serif',
      serif:  '\'Noto Serif SC\', \'Source Han Serif SC\', \'Songti SC\', \'Georgia\', serif',
      mono:   '\'SF Mono\', \'Cascadia Code\', \'JetBrains Mono\', \'Fira Code\', monospace',
    };
    var val = fmap[family] || fmap.system;
    document.documentElement.style.setProperty('--font-reading', val);

    // Update dropdown active state
    var buttons = document.querySelectorAll('#font-menu button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle('active', buttons[i].dataset.font === family);
    }

    // Update main button label
    var labels = { system: 'Aa', serif: 'Aa 衬', mono: 'Aa 宽' };
    var btn = document.getElementById('btn-font');
    if (btn) btn.textContent = labels[family] || 'Aa';

    PW.setState('fontFamily', family);
    PW.emit('ui:font-changed', { family: family });
  };

  // ── toggleFontDropdown ────────────────────────────────────────────────

  PW.toggleFontDropdown = function () {
    var menu = document.getElementById('font-menu');
    if (menu) menu.classList.toggle('show');
  };

  // Close font dropdown on outside click
  PW.initFontDropdownClose = function () {
    document.addEventListener('click', function (e) {
      var dd = document.getElementById('font-dropdown');
      if (dd && !dd.contains(e.target)) {
        var menu = document.getElementById('font-menu');
        if (menu) menu.classList.remove('show');
      }
    });
  };

  // ── toggleSidebar ─────────────────────────────────────────────────────

  PW.toggleSidebar = function () {
    var sidebarCollapsed = PW.getState('sidebarCollapsed') || false;
    sidebarCollapsed = !sidebarCollapsed;
    PW.setState('sidebarCollapsed', sidebarCollapsed);

    var sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed', sidebarCollapsed);

    var dragLeft = document.getElementById('drag-left');
    if (dragLeft) dragLeft.style.display = sidebarCollapsed ? 'none' : '';

    PW.emit('sidebar:toggled', { collapsed: sidebarCollapsed });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 3. DRAG RESIZE  (sidebar & clue board)
  // ═══════════════════════════════════════════════════════════════════════

  PW.initDragResize = function () {
    var overlay = document.getElementById('drag-overlay');

    // ── Sidebar drag ──
    var leftHandle = document.getElementById('drag-left');
    if (leftHandle) {
      var dragging = false, startX, startW;

      leftHandle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        dragging = true;
        startX = e.clientX;
        startW = PW.getState('sidebarW') || 280;
        leftHandle.classList.add('active');
        if (overlay) overlay.style.display = 'block';
      });

      document.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        var delta = e.clientX - startX;
        var newW = Math.max(200, Math.min(600, startW + delta));
        PW.setState('sidebarW', newW);
        document.documentElement.style.setProperty('--sidebar-w', newW + 'px');
      });

      document.addEventListener('mouseup', function () {
        if (dragging) {
          leftHandle.classList.remove('active');
          if (overlay) overlay.style.display = 'none';
          dragging = false;
        }
      });
    }

    // ── Clue board drag (resize from left edge) ──
    var clueHandle = document.getElementById('clue-drag');
    if (clueHandle) {
      var dragging2 = false, startX2, startW2;

      clueHandle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        dragging2 = true;
        startX2 = e.clientX;
        var board = document.getElementById('clue-board');
        startW2 = board ? parseFloat(getComputedStyle(board).width) : 280;
        clueHandle.classList.add('active');
        if (overlay) overlay.style.display = 'block';
      });

      document.addEventListener('mousemove', function (e) {
        if (!dragging2) return;
        var delta = startX2 - e.clientX; // drag left = wider
        var newW = Math.max(220, Math.min(800, startW2 + delta));
        PW.setState('contextW', newW);
        document.documentElement.style.setProperty('--context-w', newW + 'px');
      });

      document.addEventListener('mouseup', function () {
        if (dragging2) {
          clueHandle.classList.remove('active');
          if (overlay) overlay.style.display = 'none';
          dragging2 = false;
        }
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 4. COMBINED DRAG HANDLERS  (chat window, result popup, review panel)
  // ═══════════════════════════════════════════════════════════════════════

  // ── Chat window drag (mousedown on header) ────────────────────────────

  PW.initChatDrag = function () {
    var header = document.getElementById('cw-header');
    if (!header) return;

    header.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      var cw = document.getElementById('chat-window');
      if (!cw) return;

      PW.setState('cwDragging', true);
      PW.setState('cwOffX', e.clientX - cw.getBoundingClientRect().left);
      PW.setState('cwOffY', e.clientY - cw.getBoundingClientRect().top);
      cw.style.transition = 'none';
      e.preventDefault();
    });
  };

  // ── Review panel drag (mousedown on header) ───────────────────────────

  PW.initReviewPanelDrag = function () {
    var rvHeader = document.getElementById('rv-header');
    if (!rvHeader) return;

    rvHeader.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      var panel = document.getElementById('review-panel');
      if (!panel) return;

      PW.setState('rvDragging', true);
      PW.setState('rvOffX', e.clientX - panel.getBoundingClientRect().left);
      PW.setState('rvOffY', e.clientY - panel.getBoundingClientRect().top);
      panel.style.transition = 'none';
      e.preventDefault();
    });
  };

  // ── Result popup drag (mousedown on header) ───────────────────────────

  PW.initResultPopupDrag = function () {
    var header = document.querySelector('#result-popup .rp-header');
    if (!header) return;

    header.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      var popup = document.getElementById('result-popup');
      if (!popup) return;

      PW.setState('rpDragging', true);
      PW.setState('rpOffX', e.clientX - popup.getBoundingClientRect().left);
      PW.setState('rpOffY', e.clientY - popup.getBoundingClientRect().top);
      popup.style.transition = 'none';
      e.preventDefault();
    });
  };

  // ── Combined mousemove / mouseup for all draggable panels ─────────────

  PW.initCombinedDragListeners = function () {
    document.addEventListener('mousemove', function (e) {
      var cwDragging = PW.getState('cwDragging');
      var rpDragging = PW.getState('rpDragging');
      var rvDragging = PW.getState('rvDragging');

      // Chat window drag
      if (cwDragging) {
        var cw = document.getElementById('chat-window');
        if (cw) {
          var cwOffX = PW.getState('cwOffX') || 0;
          var cwOffY = PW.getState('cwOffY') || 0;
          cw.style.left = Math.max(0, Math.min(window.innerWidth - cw.offsetWidth, e.clientX - cwOffX)) + 'px';
          cw.style.top  = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - cwOffY)) + 'px';
        }
      }

      // Result popup drag
      if (rpDragging) {
        var popup = document.getElementById('result-popup');
        if (popup) {
          var rpOffX = PW.getState('rpOffX') || 0;
          var rpOffY = PW.getState('rpOffY') || 0;
          popup.style.left = Math.max(0, Math.min(window.innerWidth - popup.offsetWidth, e.clientX - rpOffX)) + 'px';
          popup.style.top  = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - rpOffY)) + 'px';
        }
      }

      // Review panel drag
      if (rvDragging) {
        var panel = document.getElementById('review-panel');
        if (panel) {
          var rvOffX = PW.getState('rvOffX') || 0;
          var rvOffY = PW.getState('rvOffY') || 0;
          panel.style.left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, e.clientX - rvOffX)) + 'px';
          panel.style.top  = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - rvOffY)) + 'px';
        }
      }
    });

    document.addEventListener('mouseup', function () {
      if (PW.getState('cwDragging')) {
        PW.setState('cwDragging', false);
        var cw = document.getElementById('chat-window');
        if (cw) cw.style.transition = '';
      }
      if (PW.getState('rpDragging')) {
        PW.setState('rpDragging', false);
        var popup = document.getElementById('result-popup');
        if (popup) popup.style.transition = '';
      }
      if (PW.getState('rvDragging')) {
        PW.setState('rvDragging', false);
        var panel = document.getElementById('review-panel');
        if (panel) panel.style.transition = '';
      }
    });
  };

  // ── Convenience: call all drag init functions ─────────────────────────

  PW.initAllDrag = function () {
    PW.initDragResize();
    PW.initChatDrag();
    PW.initReviewPanelDrag();
    PW.initResultPopupDrag();
    PW.initCombinedDragListeners();
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 5. SELECTION & POPUPS
  // ═══════════════════════════════════════════════════════════════════════

  // ── onSelection(e) ────────────────────────────────────────────────────
  // Mouseup handler: detect text selection, show toolbar popup.

  PW.onSelection = function (e) {
    var sel = window.getSelection();
    var text = PW.extractLatexText ? PW.extractLatexText(sel) : sel.toString().trim();
    if (!text || text.length < 3) { PW.hidePopup(); return; }
    PW.setState('savedSelection', text);
    PW.setState('highlightedElement', null);
    PW.preparePopup(false); // hide delete button
    PW.showPopupAt(sel.getRangeAt(0).getBoundingClientRect());
  };

  // ── onContextMenu(e) ─────────────────────────────────────────────────
  // Right-click handler: detect hl-mark, show contextual popup.

  PW.onContextMenu = function (e) {
    var hlEl = e.target.closest('.hl-mark');
    if (hlEl) {
      // Right-clicked on highlighted text
      PW.setState('highlightedElement', hlEl);
      PW.setState('savedSelection', hlEl.textContent.trim());
      PW.preparePopup(true); // show delete button
      PW.showPopupAt(hlEl.getBoundingClientRect());
      return;
    }
    // No highlight under cursor — use current selection
    var sel = window.getSelection();
    var text = sel.toString().trim();
    if (text.length < 3) return;
    PW.setState('savedSelection', text);
    PW.setState('highlightedElement', null);
    PW.preparePopup(false);
    PW.showPopupAt(sel.getRangeAt(0).getBoundingClientRect());
  };

  // ── preparePopup(showDelete) ──────────────────────────────────────────

  PW.preparePopup = function (showDelete) {
    var btnDelete = document.getElementById('btn-delete-hl');
    var btnHighlight = document.getElementById('btn-highlight');
    if (btnDelete) btnDelete.style.display = showDelete ? '' : 'none';
    if (btnHighlight) btnHighlight.style.display = showDelete ? 'none' : '';
  };

  // ── showPopupAt(rect) ─────────────────────────────────────────────────

  PW.showPopupAt = function (rect) {
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
  };

  // ── hidePopup() ───────────────────────────────────────────────────────

  PW.hidePopup = function () {
    var selPopup = document.getElementById('sel-popup');
    var imgPopup = document.getElementById('img-popup');
    var cluePopup = document.getElementById('clue-popup');
    if (selPopup)  selPopup.style.display = 'none';
    if (imgPopup)  imgPopup.style.display = 'none';
    if (cluePopup) cluePopup.style.display = 'none';
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 6. TRANSLATION
  // ═══════════════════════════════════════════════════════════════════════

  // ── doTranslate() ─────────────────────────────────────────────────────

  PW.doTranslate = async function () {
    var savedSelection = PW.getState('savedSelection');
    var currentSlug = PW.getState('currentSlug');
    if (!savedSelection) return;

    PW.hidePopup();
    PW.toast('翻译中...');

    try {
      var res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: savedSelection, slug: currentSlug })
      });
      var data = await res.json();

      // Cache translation
      var transCache = PW.getState('transCache') || [];
      transCache.push({
        text: savedSelection,
        translation: data.translation,
        slug: currentSlug,
        time: new Date().toISOString()
      });
      PW.setState('transCache', transCache);

      PW.showResultPopup('🌐 翻译结果',
        '<div style="margin-bottom:12px;padding:10px 12px;background:var(--bg-hover);border-radius:var(--radius);font-size:12px;color:var(--text-muted);line-height:1.6">' +
        PW.escHtml(savedSelection) + '</div>' +
        '<div style="padding:4px 0;line-height:1.8;font-size:14px">' + PW.escHtml(data.translation) + '</div>');

      PW.toast('翻译完成 ✓');
    } catch (e) {
      PW.toast('翻译失败: ' + e.message);
    }
  };

  // ── showResultPopup(title, html) ──────────────────────────────────────

  PW.showResultPopup = function (title, html) {
    var popup = document.getElementById('result-popup');
    if (!popup) return;

    var titleEl = document.getElementById('rp-title');
    var bodyEl  = document.getElementById('rp-body');
    if (titleEl) titleEl.textContent = title;
    if (bodyEl)  bodyEl.innerHTML = html;

    popup.style.display = 'block';
    popup.style.transform = 'none';
    // Position: centered horizontally, slightly below top
    var pw = popup.offsetWidth || 480;
    popup.style.left = Math.max(10, (window.innerWidth - pw) / 2) + 'px';
    popup.style.top = '12%';
    popup.style.right = 'auto';
    popup.style.bottom = 'auto';
  };

  // ── closeResultPopup() ────────────────────────────────────────────────

  PW.closeResultPopup = function () {
    var popup = document.getElementById('result-popup');
    if (popup) popup.style.display = 'none';
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 7. HIGHLIGHT
  // ═══════════════════════════════════════════════════════════════════════

  // ── doHighlight() ─────────────────────────────────────────────────────
  // Save a text highlight to the server, add to clue board, auto-translate.

  PW.doHighlight = async function () {
    var savedSelection = PW.getState('savedSelection');
    var currentSlug = PW.getState('currentSlug');
    if (!savedSelection || !currentSlug) return;

    PW.hidePopup();

    try {
      var res = await fetch('/api/highlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: currentSlug, text: savedSelection, note: '' })
      });
      await res.json();
      PW.toast('已标注 ✓');

      // Auto-add to clue board (without translation yet)
      var clueId = 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
      if (PW.addClue) {
        PW.addClue({
          id: clueId,
          type: 'highlight',
          content: { text: savedSelection, note: '', translated: '' },
          position: { textSnippet: savedSelection.substring(0, 80) }
        });
      }

      // Reload paper to show highlight marks
      if (currentSlug && PW.loadPaper) PW.loadPaper(currentSlug);

      // Auto-translate in background
      try {
        var tr = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: savedSelection, slug: currentSlug })
        });
        var td = await tr.json();

        // Update the clue card with translation via clue-board module internals
        // We use the event system — the auto-translation result is attached
        // to the clueStore inside clue-board.js
        // However, since clueStore is module-private, we use a different approach:
        // We emit an event that the clue-board module can listen to.
        // For now, we access the clue via addClue's ID approach:
        PW.emit('highlight:auto-translated', {
          clueId: clueId,
          translation: td.translation,
          slug: currentSlug
        });
      } catch (te) {
        console.warn('auto-translate failed:', te);
      }
    } catch (e) {
      PW.toast('标注失败: ' + e.message);
    }
  };

  // ── doDeleteHighlight() ───────────────────────────────────────────────
  // Delete a highlight that was right-clicked.

  PW.doDeleteHighlight = async function () {
    var highlightedElement = PW.getState('highlightedElement');
    var currentSlug = PW.getState('currentSlug');
    if (!highlightedElement || !currentSlug) return;

    var text = highlightedElement.textContent.trim();
    if (!text) return;

    PW.hidePopup();

    try {
      var res = await fetch('/api/highlight/' + encodeURIComponent(currentSlug) +
        '?text=' + encodeURIComponent(text.substring(0, 120)), {
        method: 'DELETE'
      });
      var data = await res.json();
      PW.toast(data.ok ? '已删除标注 ✓' : '删除失败');
      if (data.ok && currentSlug && PW.loadPaper) PW.loadPaper(currentSlug);
    } catch (e) {
      PW.toast('删除失败: ' + e.message);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 8. CONTEXT PANEL  (images, highlights, translations, notes tabs)
  // ═══════════════════════════════════════════════════════════════════════

  // ── switchContext(tab) ────────────────────────────────────────────────
  // Switch between context panel tabs: images | highlights | translations | notes

  PW.switchContext = function (tab) {
    PW.setState('contextTab', tab);

    // Highlight target tab button
    var tabButtons = document.querySelectorAll('#context-tabs button');
    var btnIdx = { images: 0, highlights: 1, translations: 2, notes: 3 }[tab] || 0;
    for (var i = 0; i < tabButtons.length; i++) {
      tabButtons[i].classList.toggle('active', i === btnIdx);
    }

    // Show/hide appropriate content areas
    var cpanel   = document.getElementById('context-panel');
    var ccontent = document.getElementById('context-content');
    var editor   = document.getElementById('context-notes-editor');

    if (tab === 'notes') {
      if (ccontent) ccontent.style.display = 'none';
      if (editor) {
        editor.style.display = 'flex';
        var currentSlug = PW.getState('currentSlug');
        var notesCache = PW.getState('notesCache') || {};
        var textarea = document.getElementById('context-notes-textarea');
        if (textarea) textarea.value = (currentSlug && notesCache[currentSlug]) ? notesCache[currentSlug] : '';
      }
    } else {
      if (ccontent) ccontent.style.display = 'block';
      if (editor) editor.style.display = 'none';
      if (tab === 'images')        PW.renderContextImages();
      else if (tab === 'highlights')   PW.renderContextHighlights();
      else if (tab === 'translations') PW.renderContextTranslations();
    }
    if (cpanel) cpanel.style.display = 'flex';
  };

  // ── renderContextImages() ─────────────────────────────────────────────

  PW.renderContextImages = function () {
    var el = document.getElementById('context-content');
    if (!el) return;

    var imgs = document.querySelectorAll('#content img');
    if (imgs.length === 0) {
      el.innerHTML = '<div class="ctx-empty">本论文无图片</div>';
      return;
    }

    el.innerHTML = '';
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        var clone = img.cloneNode(true);
        clone.classList.add('ctx-img');
        clone.onclick = function () {
          // Unzoom any currently zoomed image
          var zoomed = document.querySelectorAll('#content img.zoomed');
          for (var j = 0; j < zoomed.length; j++) zoomed[j].classList.remove('zoomed');
          img.classList.add('zoomed');
          var backdrop = document.getElementById('img-backdrop');
          if (backdrop) backdrop.style.display = 'block';
          img.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        el.appendChild(clone);
      })(imgs[i]);
    }
  };

  // ── renderContextHighlights() ──────────────────────────────────────────

  PW.renderContextHighlights = function () {
    var el = document.getElementById('context-content');
    if (!el) return;

    var highlightList = PW.getState('highlightList') || [];
    if (!highlightList.length) {
      el.innerHTML = '<div class="ctx-empty">暂无标注</div>';
      return;
    }

    el.innerHTML = highlightList.map(function (h, i) {
      var text = h.text || h;
      var note = h.note || '';
      var date = h.date || '';
      return '<div class="ctx-item" onclick="PW.scrollToHighlight(' + i + ')" title="点击跳转到标注位置">\n' +
        '      <div class="ctx-text">' + PW.escHtml(text) + '</div>\n' +
        (note ? '      <div class="ctx-meta">💬 ' + PW.escHtml(note) + '</div>\n' : '') +
        '      <div class="ctx-meta" style="display:flex;justify-content:space-between;align-items:center">\n' +
        '        <span>' + (date || '') + '</span>\n' +
        '        <button class="ctx-discuss-btn" onclick="event.stopPropagation();PW.discussHighlight(' + i + ')" title="与此标注展开讨论">💬 讨论</button>\n' +
        '      </div>\n' +
        '    </div>';
    }).join('');
  };

  // ── scrollToHighlight(idx) ────────────────────────────────────────────
  // Scroll content to the approximate position of a highlight, then flash.

  PW.scrollToHighlight = function (idx) {
    var highlightList = PW.getState('highlightList') || [];
    var h = highlightList[idx];
    if (!h || !h.text) return;

    var content = document.getElementById('content');
    if (!content) return;

    var text = typeof h === 'string' ? h : h.text;
    var searchText = text.substring(0, 25).replace(/\s+/g, ' ').trim();

    // Try to find matching DOM node
    var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    var node, found = null;
    while ((node = walker.nextNode())) {
      if (node.textContent.indexOf(searchText) !== -1) {
        found = node;
        break;
      }
    }

    if (!found) { PW.toast('未在正文中找到对应文字'); return; }

    var range = document.createRange();
    var foundIdx = found.textContent.indexOf(searchText);
    range.setStart(found, Math.max(0, foundIdx));
    range.setEnd(found, Math.min(found.textContent.length, foundIdx + searchText.length));
    var rect = range.getBoundingClientRect();
    content.scrollTo({ top: content.scrollTop + rect.top - 180, behavior: 'smooth' });

    // Brief flash
    var parent = found.parentElement;
    if (parent) {
      var origBg = parent.style.background;
      parent.style.background = 'rgba(99,102,241,0.2)';
      parent.style.transition = 'background 0.3s';
      setTimeout(function () { parent.style.background = origBg; parent.style.transition = ''; }, 2000);
    }
  };

  // ── renderContextTranslations() ───────────────────────────────────────

  PW.renderContextTranslations = function () {
    var el = document.getElementById('context-content');
    if (!el) return;

    var transCache = PW.getState('transCache') || [];
    var currentSlug = PW.getState('currentSlug');
    var list = transCache.filter(function (t) { return t.slug === currentSlug; });

    if (!list.length) {
      el.innerHTML = '<div class="ctx-empty">暂无翻译记录<br><small>选中文字后点击"翻译选中"开始</small></div>';
      return;
    }

    el.innerHTML = list.reverse().map(function (t) {
      return '<div class="ctx-item">\n' +
        '      <div class="ctx-text">' + PW.escHtml(t.translation) + '</div>\n' +
        '      <div class="ctx-meta">原文: ' + PW.escHtml(t.text.substring(0, 60)) + (t.text.length > 60 ? '...' : '') + '</div>\n' +
        '    </div>';
    }).join('');
  };

  // ── saveNotes() ───────────────────────────────────────────────────────

  PW.saveNotes = function () {
    var currentSlug = PW.getState('currentSlug');
    if (!currentSlug) return;

    var textarea = document.getElementById('context-notes-textarea');
    if (!textarea) return;

    var notesCache = PW.getState('notesCache') || {};
    notesCache[currentSlug] = textarea.value;
    PW.setState('notesCache', notesCache);
    PW.toast('笔记已保存 ✓');
  };

  // ── discussHighlight(idx) ─────────────────────────────────────────────
  // Open chat window and send discussion prompt about a highlight.

  PW.discussHighlight = async function (idx) {
    var highlightList = PW.getState('highlightList') || [];
    var currentSlug = PW.getState('currentSlug');
    var h = highlightList[idx];
    if (!h || !h.text) return;

    var text = typeof h === 'string' ? h : h.text;
    var contextNote = h.note || '';
    var prompt = contextNote
      ? '关于这篇论文中标注的这段文字「' + text.substring(0, 200) + '」，我的备注是：' + contextNote + '。请对此展开讨论：这段文字在论文中起到什么作用？它的论证是否严谨？与其他相关研究有什么联系？'
      : '关于这篇论文中标注的这段文字「' + text.substring(0, 200) + '」，请展开讨论：这段文字在论文中起到什么作用？它的论证是否严谨？与其他相关研究有什么联系？';

    // Open chat window and send
    if (PW.openChatWindow) PW.openChatWindow();
    if (PW.addChatMessage) PW.addChatMessage('user', prompt.substring(0, 120) + '...');
    PW.toast('Agent 正在分析标注...');

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: currentSlug, selected_text: text, question: prompt })
      });
      var data = await res.json();
      if (PW.addChatMessage) PW.addChatMessage('assistant', data.answer);
    } catch (e) {
      if (PW.addChatMessage) PW.addChatMessage('assistant', 'Agent 无响应: ' + e.message);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 9. NOTE MODAL
  // ═══════════════════════════════════════════════════════════════════════

  // ── showNoteModal(title, placeholder, callback, defaultVal) ────────────

  PW.showNoteModal = function (title, placeholder, callback, defaultVal) {
    PW.setState('noteModalCallback', callback);

    var titleEl = document.getElementById('note-modal-title');
    var input   = document.getElementById('note-modal-input');
    var backdrop = document.getElementById('note-backdrop');
    var modal    = document.getElementById('note-modal');

    if (titleEl) titleEl.textContent = title;
    if (input) {
      input.placeholder = placeholder || '';
      input.value = defaultVal || '';
    }
    if (backdrop) backdrop.style.display = 'block';
    if (modal)    modal.style.display = 'block';

    if (input) {
      setTimeout(function () { input.focus(); }, 50);
    }
  };

  // ── confirmNoteModal() ────────────────────────────────────────────────

  PW.confirmNoteModal = function () {
    var input = document.getElementById('note-modal-input');
    var val = input ? input.value.trim() : '';

    var backdrop = document.getElementById('note-backdrop');
    var modal    = document.getElementById('note-modal');
    if (backdrop) backdrop.style.display = 'none';
    if (modal)    modal.style.display = 'none';

    var cb = PW.getState('noteModalCallback');
    PW.setState('noteModalCallback', null);
    if (cb) cb(val || '');
  };

  // ── cancelNoteModal() ─────────────────────────────────────────────────

  PW.cancelNoteModal = function () {
    var backdrop = document.getElementById('note-backdrop');
    var modal    = document.getElementById('note-modal');
    if (backdrop) backdrop.style.display = 'none';
    if (modal)    modal.style.display = 'none';

    var cb = PW.getState('noteModalCallback');
    PW.setState('noteModalCallback', null);
    if (cb) cb(null);
  };

  // ── initNoteModalKeyboard() ───────────────────────────────────────────
  // Global keyboard handler: Enter=confirm, Esc=cancel when modal is open.

  PW.initNoteModalKeyboard = function () {
    document.addEventListener('keydown', function (e) {
      var modal = document.getElementById('note-modal');
      if (!modal || modal.style.display !== 'block') return;
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); PW.confirmNoteModal(); }
      if (e.key === 'Escape') { e.preventDefault(); PW.cancelNoteModal(); }
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 10. IMAGE CONTEXT MENU  —  collectImageToClue
  // ═══════════════════════════════════════════════════════════════════════

  // ── collectImageToClue() ──────────────────────────────────────────────

  PW.collectImageToClue = function () {
    var imgPopupTarget = PW.getState('imgPopupTarget');
    if (!imgPopupTarget) return;
    var src = imgPopupTarget.src;

    var popup = document.getElementById('img-popup');
    if (popup) popup.style.display = 'none';

    if (PW.addClue) {
      PW.addClue({
        type: 'image',
        content: { src: src, caption: imgPopupTarget.alt || '' },
        position: { textSnippet: '' }
      });
    }
  };

  // ── initImageContextMenu() ────────────────────────────────────────────
  // Wire up right-click on images inside #content.

  PW.initImageContextMenu = function () {
    var content = document.getElementById('content');
    if (!content) return;

    content.addEventListener('contextmenu', function (e) {
      var img = e.target.closest('#content img');
      if (!img) return;
      e.preventDefault();
      PW.setState('imgPopupTarget', img);
      var popup = document.getElementById('img-popup');
      if (!popup) return;
      popup.style.display = 'block';
      var left = e.clientX + 8;
      var top  = e.clientY + 8;
      if (left + 160 > window.innerWidth) left = e.clientX - 168;
      if (top + 80 > window.innerHeight)  top  = e.clientY - 88;
      popup.style.left = left + 'px';
      popup.style.top  = top + 'px';
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 11. CLUE CARD CONTEXT MENU  —  delete, copy, edit
  // ═══════════════════════════════════════════════════════════════════════

  PW.initClueContextMenu = function () {
    var flow = document.getElementById('clue-flow');
    if (!flow) return;

    flow.addEventListener('contextmenu', function (e) {
      var card = e.target.closest('.clue-card');
      if (!card) return;
      e.preventDefault();
      PW.setState('cluePopupTarget', card.dataset.id);
      var popup = document.getElementById('clue-popup');
      if (!popup) return;
      popup.style.display = 'block';
      var left = e.clientX + 8;
      var top  = e.clientY + 8;
      if (left + 150 > window.innerWidth) left = e.clientX - 158;
      if (top + 100 > window.innerHeight)  top  = e.clientY - 108;
      popup.style.left = left + 'px';
      popup.style.top  = top + 'px';
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 12. TRANSLATION HOVER POPUP
  // ═══════════════════════════════════════════════════════════════════════

  PW.initTranslationHover = function () {
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
        trPopup.style.cssText =
          'position:fixed;z-index:999;background:var(--bg-panel);border:1px solid var(--border);' +
          'border-radius:var(--radius);box-shadow:var(--shadow-lg);padding:10px 14px;' +
          'font-size:13px;line-height:1.6;max-width:360px;color:var(--text);pointer-events:none;';
        document.body.appendChild(trPopup);
      }
      PW.setState('trPopup', trPopup);
      trPopup.textContent = tr.dataset.translation || '';
      var rect = tr.getBoundingClientRect();
      trPopup.style.left = Math.min(rect.left, window.innerWidth - 380) + 'px';
      trPopup.style.top = (rect.bottom + 6 > window.innerHeight
        ? rect.top - trPopup.offsetHeight - 6
        : rect.bottom + 6) + 'px';
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('.tr-mark')) {
        setTimeout(function () {
          if (trPopup && !document.querySelector('.tr-mark:hover')) {
            trPopup.remove();
            trPopup = null;
            PW.setState('trPopup', null);
          }
        }, 100);
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 13. LEGACY sendChat  (shows toast directing to chat window)
  // ═══════════════════════════════════════════════════════════════════════

  PW.sendChat = function () {
    PW.toast('请先选中文字，右键使用"问 Agent"，或在聊天窗口中直接输入');
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 14. SELECTION EVENT BINDING  —  mouseup + contextmenu on #content
  // ═══════════════════════════════════════════════════════════════════════

  PW.initSelectionEvents = function () {
    var content = document.getElementById('content');
    if (!content) return;

    // Mouseup triggers text selection popup
    content.addEventListener('mouseup', PW.onSelection);

    // Right-click: suppress browser menu, show contextual popup
    content.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      PW.onContextMenu(e);
    });

    // Hide popups when clicking outside
    document.addEventListener('mousedown', function (e) {
      if (!e.target.closest('#sel-popup') &&
          !e.target.closest('#img-popup') &&
          !e.target.closest('#clue-popup') &&
          !e.target.closest('#content') &&
          !e.target.closest('#note-modal')) {
        PW.hidePopup();
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 15. RESULT POPUP CLOSE ON ESCAPE
  // ═══════════════════════════════════════════════════════════════════════

  PW.initResultPopupEscape = function () {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var rp = document.getElementById('result-popup');
        if (rp && rp.style.display === 'block') {
          PW.closeResultPopup();
        }
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 16. INIT ALL  —  call all init functions (called from main.js or inline)
  // ═══════════════════════════════════════════════════════════════════════

  PW.initUIModule = function () {
    PW.initUI();
    PW.initAllDrag();
    PW.initFontDropdownClose();
    PW.initNoteModalKeyboard();
    PW.initSelectionEvents();
    PW.initImageContextMenu();
    PW.initClueContextMenu();
    PW.initTranslationHover();
    PW.initResultPopupEscape();
  };

})();
