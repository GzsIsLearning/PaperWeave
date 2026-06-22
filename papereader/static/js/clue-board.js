'use strict';

(function () {
  var PW = window.PW = window.PW || {};

  // ── Module-private state ───────────────────────────────────────────

  var clueStore = {};       // slug → array of clues
  var currentClues = [];
  var clueFilter = 'all';
  var clueSort = 'time';

  // ── 1. PW.loadClues(slug) ─────────────────────────────────────────

  PW.loadClues = function (slug) {
    if (!clueStore[slug]) {
      var saved;
      try { saved = localStorage.getItem('pw-clues-' + slug); } catch (e) { saved = null; }
      clueStore[slug] = saved ? JSON.parse(saved) : [];
    }

    // Import legacy highlights from currentPaper
    var currentPaper = PW.getState('currentPaper');
    var paperHighlights = (currentPaper && currentPaper.highlights) ? currentPaper.highlights : [];
    var existingHighlightTexts = new Set();
    (clueStore[slug] || []).forEach(function (c) {
      if (c.type === 'highlight') existingHighlightTexts.add(c.content.text);
    });

    paperHighlights.forEach(function (h) {
      var text = h.text || h;
      if (!existingHighlightTexts.has(text)) {
        clueStore[slug].push({
          id: 'h-' + Math.random().toString(36).slice(2, 9),
          type: 'highlight',
          createdAt: new Date().toISOString(),
          pinned: true,
          content: { text: text, note: '' }
        });
      }
    });

    currentClues = clueStore[slug];
  };

  // ── 2. PW.saveClues(slug) ─────────────────────────────────────────

  PW.saveClues = function (slug) {
    if (!slug) return;
    try {
      localStorage.setItem('pw-clues-' + slug, JSON.stringify(clueStore[slug] || []));
    } catch (e) { /* quota exceeded or unavailable */ }
  };

  // ── 3. PW.addClue(clue) ───────────────────────────────────────────

  PW.addClue = function (clue) {
    var currentSlug = PW.getState('currentSlug');
    if (!currentSlug) return;

    clue.id = clue.id || ('c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6));
    clue.createdAt = clue.createdAt || new Date().toISOString();
    clue.pinned = clue.pinned !== undefined ? clue.pinned : true;

    if (!clueStore[currentSlug]) clueStore[currentSlug] = [];

    // Avoid exact duplicate by content signature
    var sig = JSON.stringify(clue.content);
    var dup = clueStore[currentSlug].find(function (c) { return JSON.stringify(c.content) === sig; });
    if (dup) { PW.toast('该线索已存在'); return; }

    clueStore[currentSlug].push(clue);
    PW.saveClues(currentSlug);
    PW.loadClues(currentSlug);
    PW.renderClueBoard();
    PW.emit('clue:changed');
    PW.toast('已添加到线索板 ✓');
  };

  // ── 4. PW.deleteClue(id) ──────────────────────────────────────────

  PW.deleteClue = function (id) {
    var currentSlug = PW.getState('currentSlug');
    if (!currentSlug) return;
    clueStore[currentSlug] = (clueStore[currentSlug] || []).filter(function (c) { return c.id !== id; });
    PW.saveClues(currentSlug);
    PW.loadClues(currentSlug);
    PW.renderClueBoard();
    PW.emit('clue:changed');
  };

  // ── 5. PW.togglePinClue(id) ───────────────────────────────────────

  PW.togglePinClue = function (id) {
    var currentSlug = PW.getState('currentSlug');
    if (!currentSlug) return;
    var c = (clueStore[currentSlug] || []).find(function (x) { return x.id === id; });
    if (c) { c.pinned = !c.pinned; PW.saveClues(currentSlug); PW.renderClueBoard(); }
  };

  // ── 6. PW.editClue(id) ────────────────────────────────────────────

  PW.editClue = function (id) {
    var currentSlug = PW.getState('currentSlug');
    if (!currentSlug) return;
    var c = (clueStore[currentSlug] || []).find(function (x) { return x.id === id; });
    if (!c) return;

    if (c.type === 'note') {
      PW.showNoteModal('编辑笔记', '输入笔记内容...', function (val) {
        if (!val) return;
        c.content.body = val;
        c.content.title = val.split('\n')[0].substring(0, 40) || '笔记';
        c.createdAt = new Date().toISOString();
        PW.saveClues(currentSlug);
        PW.renderClueBoard();
        PW.emit('clue:changed');
      }, c.content.body || c.content.title || '');
    } else if (c.type === 'highlight') {
      PW.showNoteModal('编辑标注备记', '输入备记...', function (val) {
        c.content.note = val;
        c.createdAt = new Date().toISOString();
        PW.saveClues(currentSlug);
        PW.renderClueBoard();
        PW.emit('clue:changed');
      }, c.content.note || '');
    } else {
      PW.toast('暂不支持编辑此类型');
    }
  };

  // ── 7. PW.clearAllClues() ─────────────────────────────────────────

  PW.clearAllClues = function () {
    var currentSlug = PW.getState('currentSlug');
    if (!currentSlug) return;
    if (!confirm('确定清空所有线索？')) return;
    clueStore[currentSlug] = [];
    PW.saveClues(currentSlug);
    PW.loadClues(currentSlug);
    PW.renderClueBoard();
    PW.emit('clue:changed');
    PW.toast('已清空');
  };

  // ── 8. PW.createNoteClue() ────────────────────────────────────────

  PW.createNoteClue = function () {
    PW.showNoteModal('新建笔记', '输入笔记内容...', function (val) {
      if (!val) return;
      var t = val.split('\n')[0].substring(0, 40) || '笔记';
      PW.addClue({ type: 'note', content: { title: t, body: val } });
    });
  };

  // ── 9. PW.createQuickNoteClue() ───────────────────────────────────

  PW.createQuickNoteClue = function () {
    var input = document.getElementById('clue-note-input');
    if (!input) return;
    var val = input.value.trim();
    if (!val) return;
    PW.addClue({ type: 'note', content: { title: val.split('\n')[0].substring(0, 40) || '笔记', body: val } });
    input.value = '';
  };

  // ── 10. PW.renderClueBoard() ──────────────────────────────────────

  PW.renderClueBoard = function () {
    var board = document.getElementById('clue-board');
    var flow = document.getElementById('clue-flow');
    var countEl = document.getElementById('clue-count');
    if (!board || !flow) return;

    board.style.display = 'flex';

    var currentSlug = PW.getState('currentSlug');
    if (!currentSlug) {
      flow.innerHTML = '<div class="clue-empty">选择一篇论文开始阅读<br><small>划线标注、翻译、AI回复将自动出现在这里</small></div>';
      if (countEl) countEl.textContent = '0 条线索';
      return;
    }

    var clues = clueStore[currentSlug] || [];
    if (countEl) countEl.textContent = clues.length + ' 条线索';

    if (clues.length === 0) {
      flow.innerHTML = '<div class="clue-empty">暂无线索<br><small>划线标注、翻译、收藏AI回复将自动出现在这里</small></div>';
      return;
    }

    flow.innerHTML = clues.map(function (c) { return PW.renderClueCard(c); }).join('');
    PW.initClueDragSort(flow);
  };

  // ── 11. PW.initClueDragSort(flow) ─────────────────────────────────

  PW.initClueDragSort = function (flow) {
    var dragged = null;

    [].forEach.call(flow.querySelectorAll('.clue-card'), function (card) {
      card.draggable = true;

      card.addEventListener('dragstart', function (e) {
        dragged = card;
        card.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', function () {
        card.style.opacity = '';
        dragged = null;
      });
    });

    flow.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!dragged) return;
      var after = PW.getDragAfterElement(flow, e.clientY);
      if (after) {
        flow.insertBefore(dragged, after);
      } else {
        flow.appendChild(dragged);
      }
    });

    flow.addEventListener('drop', function (e) {
      e.preventDefault();
      var currentSlug = PW.getState('currentSlug');
      if (!currentSlug) return;
      var newOrder = [].map.call(flow.querySelectorAll('.clue-card'), function (el) { return el.dataset.id; });
      var map = {};
      (clueStore[currentSlug] || []).forEach(function (c) { map[c.id] = c; });
      clueStore[currentSlug] = newOrder.map(function (id) { return map[id]; }).filter(Boolean);
      PW.saveClues(currentSlug);
    });
  };

  // ── 12. PW.getDragAfterElement(container, y) ──────────────────────

  PW.getDragAfterElement = function (container, y) {
    var cards = [].slice.call(container.querySelectorAll('.clue-card')).filter(function (card) {
      return card.style.opacity !== '0.5';
    });

    return cards.reduce(function (closest, child) {
      var box = child.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      }
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  };

  // ── 13. PW.renderClueCard(c) ──────────────────────────────────────

  PW.renderClueCard = function (c) {
    var bodyHtml = '';
    var extraAttrs = '';

    if (c.type === 'image') {
      var h = c.content.customHeight || 180;
      bodyHtml = '<img class="clue-img" src="' + PW.escHtml(c.content.src || '') + '" style="max-height:' + h + 'px" onclick="window.open(\'' + PW.escHtml(c.content.src || '') + '\',\'_blank\')" alt="">' +
                 (c.content.caption ? '<div class="clue-text">' + PW.escHtml(c.content.caption) + '</div>' : '');
      extraAttrs = ' style="position:relative"';
    } else if (c.type === 'highlight') {
      bodyHtml = '<div class="clue-text" style="background:rgba(245,158,11,0.12);padding:3px 5px;border-radius:3px;">' + PW.renderClueHTML(c.content.text || '') + '</div>' +
                 (c.content.note ? '<div class="clue-note">' + PW.escHtml(c.content.note) + '</div>' : '') +
                 (c.content.translated ? '<div class="clue-note" style="margin-top:4px;padding:4px 8px;background:rgba(99,102,241,0.06);border-left:2px solid var(--accent-dim);border-radius:2px;">🌐 ' + PW.renderClueHTML(c.content.translated) + '</div>' : '');
    } else if (c.type === 'translation') {
      bodyHtml = '<div class="clue-text">' + PW.renderClueHTML(c.content.translated || '') + '</div>' +
                 '<div class="clue-original" id="orig-' + c.id + '">原文: ' + PW.renderClueHTML(c.content.original || '') + '</div>';
    } else if (c.type === 'ai') {
      bodyHtml = '<div class="clue-q">Q: ' + PW.renderClueHTML(c.content.question || '') + '</div>' +
                 '<div class="clue-a">' + PW.renderClueHTML(c.content.answer || '') + '</div>';
    } else if (c.type === 'note') {
      bodyHtml = '<div class="clue-text" style="font-style:italic;color:var(--text);">' + PW.renderClueHTML(c.content.body || c.content.title || '') + '</div>';
    }

    var onClick = c.position && c.position.textSnippet
      ? 'onclick="PW.scrollToTextSnippet(\'' + PW.escHtml((c.position.textSnippet || '').replace(/'/g, "\\'")) + '\')" style="cursor:pointer"'
      : '';

    return '\n    <div class="clue-card" data-id="' + c.id + '" draggable="true"' + extraAttrs + ' ' + onClick + '>\n' +
           '      <div class="clue-body">' + bodyHtml + '</div>\n' +
           (c.type === 'image' ? '      <div class="clue-resize-handle" onmousedown="PW.startImageResize(event,\'' + c.id + '\')" onclick="event.stopPropagation()"></div>\n' : '') +
           '    </div>';
  };

  // ── 14. PW.startImageResize(e, clueId) ────────────────────────────

  PW.startImageResize = function (e, clueId) {
    e.preventDefault();
    e.stopPropagation();
    var card = document.querySelector('.clue-card[data-id="' + clueId + '"]');
    var img = card ? card.querySelector('.clue-img') : null;
    if (!img) return;

    var startY = e.clientY;
    var startH = img.clientHeight || img.naturalHeight || 180;
    var newH = startH;

    function onMove(ev) {
      newH = Math.max(60, Math.min(600, startH + (ev.clientY - startY)));
      img.style.maxHeight = newH + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      var currentSlug = PW.getState('currentSlug');
      if (!currentSlug) return;
      var c = (clueStore[currentSlug] || []).find(function (x) { return x.id === clueId; });
      if (c) { c.content.customHeight = newH; PW.saveClues(currentSlug); }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── 15. PW.scrollToTextSnippet(snippet) ───────────────────────────

  PW.scrollToTextSnippet = function (snippet) {
    var content = document.getElementById('content');
    if (!content) return;

    var searchText = snippet.substring(0, 25).replace(/\s+/g, ' ').trim();
    if (!searchText) { PW.toast('无定位信息'); return; }

    var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    var node, found = null;
    while ((node = walker.nextNode())) {
      if (node.textContent.indexOf(searchText) !== -1) { found = node; break; }
    }

    if (!found) { PW.toast('未在正文中找到对应位置'); return; }

    var range = document.createRange();
    var foundIdx = found.textContent.indexOf(searchText);
    range.setStart(found, Math.max(0, foundIdx));
    range.setEnd(found, Math.min(found.textContent.length, foundIdx + searchText.length));
    var rect = range.getBoundingClientRect();
    content.scrollTo({ top: content.scrollTop + rect.top - 180, behavior: 'smooth' });

    var parent = found.parentElement;
    if (parent) {
      var origBg = parent.style.background;
      parent.style.background = 'rgba(99,102,241,0.2)';
      parent.style.transition = 'background 0.3s';
      setTimeout(function () { parent.style.background = origBg; parent.style.transition = ''; }, 2000);
    }
  };

  // ── 16. PW.deleteClueViaContext() ─────────────────────────────────

  PW.deleteClueViaContext = function () {
    var popup = document.getElementById('clue-popup');
    if (popup) popup.style.display = 'none';
    var target = PW.getState('cluePopupTarget');
    if (target) { PW.deleteClue(target); PW.setState('cluePopupTarget', null); }
  };

  // ── 17. PW.copyClueContent() ──────────────────────────────────────

  PW.copyClueContent = function () {
    var popup = document.getElementById('clue-popup');
    if (popup) popup.style.display = 'none';

    var target = PW.getState('cluePopupTarget');
    var currentSlug = PW.getState('currentSlug');
    if (!target || !currentSlug) { PW.setState('cluePopupTarget', null); return; }

    var c = (clueStore[currentSlug] || []).find(function (x) { return x.id === target; });
    PW.setState('cluePopupTarget', null);

    if (!c) return;

    var text = '';
    if (c.type === 'highlight') text = c.content.text || '';
    else if (c.type === 'translation') text = c.content.translated || '';
    else if (c.type === 'ai') text = c.content.answer || '';
    else if (c.type === 'note') text = c.content.body || c.content.title || '';
    else if (c.type === 'image') text = c.content.caption || '';

    if (!text.trim()) { PW.toast('无可复制的内容'); return; }

    navigator.clipboard.writeText(text).then(
      function () { PW.toast('已复制 ✓'); },
      function () { PW.toast('复制失败'); }
    );
  };

  // ── 18. PW.editClueViaContext() ───────────────────────────────────

  PW.editClueViaContext = function () {
    var popup = document.getElementById('clue-popup');
    if (popup) popup.style.display = 'none';

    var targetId = PW.getState('cluePopupTarget');
    PW.setState('cluePopupTarget', null);

    var currentSlug = PW.getState('currentSlug');
    if (!targetId || !currentSlug) return;

    var clue = (clueStore[currentSlug] || []).find(function (c) { return c.id === targetId; });
    if (!clue) return;

    var card = document.querySelector('.clue-card[data-id="' + targetId + '"]');
    if (!card) return;
    var body = card.querySelector('.clue-body');
    if (!body) return;

    var curText = '';
    if (clue.type === 'image') curText = clue.content.caption || '';
    else if (clue.type === 'highlight') curText = clue.content.text || '';
    else if (clue.type === 'translation') curText = clue.content.translated || '';
    else if (clue.type === 'ai') curText = clue.content.answer || '';
    else if (clue.type === 'note') curText = clue.content.body || clue.content.title || '';

    body.innerHTML = '\n    <textarea class="clue-edit-area">' + PW.escHtml(curText) + '</textarea>\n    <div style="display:flex;gap:4px;margin-top:4px;">\n      <button class="clue-edit-save">✓ 保存</button>\n      <button class="clue-edit-cancel">✕ 取消</button>\n    </div>\n  ';

    var textarea = body.querySelector('.clue-edit-area');
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    var doSave = function () {
      var c = (clueStore[currentSlug] || []).find(function (x) { return x.id === targetId; });
      if (c) {
        var val = textarea.value;
        if (c.type === 'image') c.content.caption = val;
        else if (c.type === 'highlight') c.content.text = val;
        else if (c.type === 'translation') c.content.translated = val;
        else if (c.type === 'ai') c.content.answer = val;
        else if (c.type === 'note') c.content.body = val;
        PW.saveClues(currentSlug);
        PW.emit('clue:changed');
        PW.toast('已更新 ✓');
      }
      PW.renderClueBoard();
    };

    body.querySelector('.clue-edit-save').onclick = doSave;
    body.querySelector('.clue-edit-cancel').onclick = function () { PW.renderClueBoard(); };

    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); PW.renderClueBoard(); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); doSave(); }
    });
  };

})();
