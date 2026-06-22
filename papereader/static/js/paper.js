'use strict';

(function () {
  var PW = window.PW = window.PW || {};

  // ── Local helpers ───────────────────────────────────────────────────

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function saveStarred() {
    try {
      var starredSet = PW.getState('starredSet');
      var arr = starredSet instanceof Set ? Array.from(starredSet) : [];
      localStorage.setItem('pw-starred', JSON.stringify(arr));
      // Push to server for cross-device sync
      fetch('/api/stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars: arr })
      }).catch(function () { /* server may be unreachable */ });
    } catch (e) { /* ignore */ }
  }

  function loadStarred() {
    try {
      var arr = JSON.parse(localStorage.getItem('pw-starred') || '[]');
      return new Set(arr);
    } catch (e) {
      return new Set();
    }
  }

  // Fetch stars from server, merge with localStorage, save merged set to both
  PW.syncStarsFromServer = function () {
    fetch('/api/stars')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var serverStars = data.stars || [];
        if (!serverStars.length) return;

        var localSet = PW.getState('starredSet') || new Set();
        var merged = new Set(localSet);
        serverStars.forEach(function (s) { merged.add(s); });

        // Only save and re-render if there's new data from server
        if (merged.size > localSet.size) {
          PW.setState('starredSet', merged);
          // Save merged to both localStorage and server
          saveStarred();
          // Re-render sidebar if papers are already loaded
          var papers = PW.getState('papers');
          if (papers && papers.length && PW.renderPaperList) {
            PW.renderPaperList(papers);
          }
        }
      })
      .catch(function () { /* server may be unreachable */ });
  };

  // Ensure starredSet is initialised
  if (!PW.getState('starredSet')) {
    PW.setState('starredSet', loadStarred());
  }

  // ── TOC observer (module-local) ─────────────────────────────────────

  var _tocObserver = null;

  // ── Public API ──────────────────────────────────────────────────────

  // 1. renderPaperList(list)
  // Render sidebar paper list (sorted: starred first, then by score desc)
  PW.renderPaperList = function (list) {
    var el = document.getElementById('paper-list');
    if (!el) return;

    var starredSet = PW.getState('starredSet');
    var currentSlug = PW.getState('currentSlug');

    var sorted = [].slice.call(list).sort(function (a, b) {
      var sa = starredSet.has(a.slug) ? 1 : 0;
      var sb = starredSet.has(b.slug) ? 1 : 0;
      if (sa !== sb) return sb - sa;
      return (b.score || 0) - (a.score || 0);
    });

    el.innerHTML = sorted.map(function (p) {
      var isStarred = starredSet.has(p.slug);
      var isActive = p.slug === currentSlug;
      return '<div class="paper-item' + (isActive ? ' active' : '') + '" onclick="PW.loadPaper(\'' + p.slug.replace(/'/g, "\\'") + '\')" title="' + (PW.escHtml ? PW.escHtml(p.title) : p.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')) + '">\n' +
        '      <div class="paper-item-inner">\n' +
        '        <button class="star-btn' + (isStarred ? ' starred' : '') + '" onclick="event.stopPropagation();PW.toggleStar(\'' + p.slug.replace(/'/g, "\\'") + '\')" title="标记/取消星标">' + (isStarred ? '★' : '☆') + '</button>\n' +
        '        <div class="paper-item-body">\n' +
        '          <div class="title">' + (PW.escHtml ? PW.escHtml(p.title) : p.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')) + '</div>\n' +
        '          <div class="meta">\n' +
        '            ' + (p.score ? '<span class="score s' + p.score + '">★ ' + p.score + '</span>' : '') + '\n' +
        '            <span>' + (p.year || '') + '</span>\n' +
        '            <span>' + ((p.authors || [])[0] || '') + '</span>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      </div>\n' +
        '    </div>';
    }).join('');
  };

  // 2. toggleStar(slug)
  PW.toggleStar = function (slug) {
    var starredSet = PW.getState('starredSet');
    var papers = PW.getState('papers') || [];

    if (starredSet.has(slug)) {
      starredSet.delete(slug);
    } else {
      starredSet.add(slug);
    }
    PW.setState('starredSet', starredSet);
    saveStarred();

    // Re-render with current search filter
    var q = (document.getElementById('search-input') || {}).value || '';
    q = q.toLowerCase();
    var filtered = papers.filter(function (p) {
      return !q || p.title.toLowerCase().indexOf(q) !== -1 ||
        (p.authors || []).join(' ').toLowerCase().indexOf(q) !== -1 ||
        (p.tags || []).join(' ').toLowerCase().indexOf(q) !== -1;
    });
    PW.renderPaperList(filtered);
  };

  // 3. loadPaper(slug)
  // BUG FIX: savedSelection reset to null when switching papers
  PW.loadPaper = async function (slug) {
    var papers = PW.getState('papers') || [];
    var currentSlug = PW.getState('currentSlug');
    var notesCache = PW.getState('notesCache') || {};
    var transCache = PW.getState('transCache') || [];
    var contextTab = PW.getState('contextTab') || 'images';

    // Save reading position of current paper before switching
    if (currentSlug) {
      var contentEl = document.getElementById('content');
      if (contentEl && contentEl.scrollTop > 0 && !contentEl.querySelector('.loading')) {
        try {
          localStorage.setItem('pw-readpos-' + currentSlug, contentEl.scrollTop);
        } catch (e) { /* ignore */ }
      }
    }

    // ── BUG FIX: reset savedSelection to prevent cross-paper state leak ──
    PW.setState('savedSelection', null);
    // ────────────────────────────────────────────────────────────────────

    PW.setState('currentSlug', slug);
    PW.setState('viewMode', 'full');

    // Re-render sidebar to highlight active paper
    var q = (document.getElementById('search-input') || {}).value || '';
    q = q.toLowerCase();
    PW.renderPaperList(papers.filter(function (p) {
      return p.title.toLowerCase().indexOf(q) !== -1;
    }));

    // Scroll sidebar to keep active item in view
    setTimeout(function () {
      var active = document.querySelector('#paper-list .paper-item.active');
      if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 30);

    // Show loading state
    var content = document.getElementById('content');
    if (content) content.innerHTML = '<div class="loading">加载中</div>';

    var res, data;
    try {
      res = await fetch('/api/paper/' + encodeURIComponent(slug));
      data = await res.json();
    } catch (e) {
      if (content) content.innerHTML = '<div class="loading">加载失败: ' + (PW.escHtml ? PW.escHtml(e.message) : e.message) + '</div>';
      return;
    }

    PW.setState('currentPaper', data);

    var titleEl = document.getElementById('current-title');
    if (titleEl) titleEl.textContent = data.title;

    // Set highlightList BEFORE renderContent so applyInTextMarks sees the data
    PW.setState('highlightList', data.highlights || []);

    PW.renderContent(data.full_body, slug);
    if (PW.renderMetaPanel) PW.renderMetaPanel(data);

    // Restore reading position after content is rendered
    var saved;
    try { saved = localStorage.getItem('pw-readpos-' + slug); } catch (e) { saved = null; }
    if (saved) {
      var el = document.getElementById('content');
      if (el) {
        requestAnimationFrame(function () {
          el.scrollTop = parseInt(saved) || 0;
        });
      }
    }

    // Load context-panel data
    var translationHistory = transCache.filter(function (t) { return t.slug === slug; });
    PW.setState('translationHistory', translationHistory);

    if (!notesCache[slug]) notesCache[slug] = '';
    PW.setState('notesCache', notesCache);

    if (PW.switchContext) PW.switchContext(contextTab);

    // Load clue board
    if (PW.loadClues) PW.loadClues(slug);
    if (PW.renderClueBoard) PW.renderClueBoard();

    // Update review panel if open
    var rvPanel = document.getElementById('review-panel');
    var rvBtn = document.getElementById('btn-review');
    if (rvBtn) {
      var hasReview = data.review_body && data.review_body.trim() && data.review_body !== '*暂无评审*';
      if (hasReview) {
        rvBtn.classList.add('has-review');
        rvBtn.classList.remove('no-review');
      } else {
        rvBtn.classList.add('no-review');
        rvBtn.classList.remove('has-review');
      }
      rvBtn.classList.add('show');
    }
    if (rvPanel && rvPanel.classList.contains('open') && PW.renderReviewContent) {
      PW.renderReviewContent();
    }

    // ── Emit events ──
    PW.emit('paper:loaded', { slug: slug });
    PW.emit('paper:switched', { slug: slug, previousSlug: currentSlug });
  };

  // 4. renderContent(md, slug)
  // Renders markdown content using PW.renderMarkdown from utils.js
  PW.renderContent = function (md, slug) {
    var el = document.getElementById('content');
    if (!el) return;

    // Fix image paths: images/xxx.jpg → /api/paper/{slug}/image/xxx.jpg
    if (slug && md) {
      md = md.replace(/!\[([^\]]*)\]\(images\/([^)]+)\)/g,
        '![$1](/api/paper/' + slug + '/image/$2)');
    }

    // Render markdown using the shared renderer from utils.js
    var html = '';
    if (PW.renderMarkdown) {
      html = PW.renderMarkdown(md, slug);
    } else {
      // Fallback: basic rendering if utils.js not loaded yet
      html = md || '';
    }

    el.innerHTML = html;
    el.scrollTop = 0;
    PW.updateReadProgress();

    // Apply in-text marks (highlights + translations) — delay for layout + stale-slot guard
    var renderSlot = (PW.getState('renderSlot') || 0) + 1;
    PW.setState('renderSlot', renderSlot);
    var slot = renderSlot;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (slot === PW.getState('renderSlot')) {
          PW.applyInTextMarks();
          PW.buildTOC();
        }
      });
    });
  };

  // 5. showReview()
  PW.showReview = function () {
    var currentPaper = PW.getState('currentPaper');
    if (!currentPaper) return;
    PW.setState('viewMode', 'review');
    PW.renderContent(currentPaper.review_body || '*暂无评审*', currentPaper.slug);
  };

  // 6. showFull()
  PW.showFull = function () {
    var currentPaper = PW.getState('currentPaper');
    if (!currentPaper) return;
    PW.setState('viewMode', 'full');
    PW.renderContent(currentPaper.full_body || '*暂无全文*', currentPaper.slug);
  };

  // 7. buildTOC()
  PW.buildTOC = function () {
    var content = document.getElementById('content');
    var nav = document.getElementById('toc-nav');
    if (!content || !nav) return;

    var headings = content.querySelectorAll('h1, h2, h3');
    if (headings.length === 0) {
      nav.innerHTML = '<div style="padding:20px 14px;font-size:11px;color:var(--text-muted);">无目录</div>';
      return;
    }

    // Assign IDs to headings that lack them
    var usedIds = new Set();
    [].forEach.call(headings, function (h) {
      if (!h.id) {
        var base = h.textContent.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 40);
        if (!base) base = 'sec';
        var id = base, n = 1;
        while (usedIds.has(id)) { id = base + '-' + (n++); }
        h.id = id;
      }
      usedIds.add(h.id);
    });

    nav.innerHTML = [].map.call(headings, function (h) {
      var tag = h.tagName.toLowerCase();
      var cls = tag === 'h2' ? 'toc-h2' : tag === 'h3' ? 'toc-h3' : 'toc-h1';
      return '<a class="toc-item ' + cls + '" data-target="' + h.id + '" onclick="PW.scrollToHeading(\'' + h.id + '\')">' + (PW.escHtml ? PW.escHtml(h.textContent.trim()) : h.textContent.trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')) + '</a>';
    }).join('');

    // Scroll-spy via IntersectionObserver
    if (_tocObserver) _tocObserver.disconnect();
    _tocObserver = new IntersectionObserver(function (entries) {
      var topId = null, topRatio = 0;
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > topRatio) {
          topRatio = e.intersectionRatio;
          topId = e.target.id;
        }
      });
      if (topId) {
        [].forEach.call(nav.querySelectorAll('.toc-item'), function (a) {
          a.classList.toggle('active', a.dataset.target === topId);
        });
      }
    }, { rootMargin: '-10% 0px -70% 0px' });
    [].forEach.call(headings, function (h) { _tocObserver.observe(h); });
  };

  // 8. scrollToHeading(id)
  PW.scrollToHeading = function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var content = document.getElementById('content');
    if (content) {
      content.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
    }
  };

  // 9. renderMetaPanel(p) — stub, panel removed
  PW.renderMetaPanel = function (p) {
    // Panel removed — metadata displayed inline if needed
  };

  // 10. extractLatexText(sel)
  PW.extractLatexText = function (sel) {
    if (!sel.rangeCount) return sel.toString().trim();
    var range = sel.getRangeAt(0);
    var frag = range.cloneContents();
    // Replace KaTeX elements in the cloned fragment with their LaTeX source
    frag.querySelectorAll('[data-latex]').forEach(function (el) {
      var latex = el.getAttribute('data-latex');
      if (latex) {
        el.parentNode.replaceChild(document.createTextNode(latex), el);
      }
    });
    var tmp = document.createElement('div');
    tmp.appendChild(frag);
    return tmp.textContent.trim();
  };

  // 11. updateReadProgress()
  PW.updateReadProgress = function () {
    var el = document.getElementById('content');
    if (!el) return;
    var progress = el.scrollTop / (el.scrollHeight - el.clientHeight) || 0;
    var bar = document.getElementById('read-progress');
    if (bar) {
      bar.style.width = (progress * 100).toFixed(1) + '%';
    }
  };

  // 12. closeImageZoom()
  PW.closeImageZoom = function () {
    [].forEach.call(document.querySelectorAll('#content img.zoomed'), function (i) {
      i.classList.remove('zoomed');
    });
    var backdrop = document.getElementById('img-backdrop');
    if (backdrop) backdrop.style.display = 'none';
  };

  // 13. applyInTextMarks()
  PW.applyInTextMarks = function () {
    var currentSlug = PW.getState('currentSlug');
    if (!currentSlug) return;

    var highlightList = PW.getState('highlightList') || [];
    var transCache = PW.getState('transCache') || [];
    var content = document.getElementById('content');
    if (!content) return;

    // Apply highlight marks (yellow/gold background)
    highlightList.forEach(function (h) {
      var raw = h.text || h;
      var regex = new RegExp(escapeRegex(raw), 'g');
      // Fresh walker each highlight to avoid detached-node crash
      var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      var textNodes = [];
      var node;
      while ((node = walker.nextNode())) {
        if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE') continue;
        if (node.parentElement.closest('.hl-mark, .tr-mark, .katex, pre, code')) continue;
        if (!node.textContent.trim()) continue;
        textNodes.push(node);
      }
      textNodes.forEach(function (n) {
        if (n.parentElement.closest('.hl-mark')) return;
        var newHtml = n.textContent.replace(regex,
          '<span class="hl-mark">$&</span>');
        if (newHtml !== n.textContent) {
          var span = document.createElement('span');
          span.innerHTML = newHtml;
          n.replaceWith.apply(n, [].slice.call(span.childNodes));
        }
      });
    });

    // Apply translation marks (underline) for current paper
    transCache.filter(function (t) { return t.slug === currentSlug; }).forEach(function (t) {
      var raw = t.text.substring(0, 100);
      var regex = new RegExp(escapeRegex(raw), 'g');
      var content2 = document.getElementById('content');
      if (!content2) return;
      var walker2 = document.createTreeWalker(content2, NodeFilter.SHOW_TEXT);
      var nodes2 = [];
      var n2;
      while ((n2 = walker2.nextNode())) {
        if (n2.parentElement.closest('.hl-mark, .tr-mark, .katex, pre, code')) continue;
        if (!n2.textContent.trim()) continue;
        nodes2.push(n2);
      }
      nodes2.forEach(function (n) {
        if (n.parentElement.closest('.tr-mark')) return;
        var translationEscaped = (PW.escHtml ? PW.escHtml(t.translation) : t.translation.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')).replace(/"/g, '&quot;');
        var newHtml = n.textContent.replace(regex,
          '<span class="tr-mark" data-translation="' + translationEscaped + '">$&</span>');
        if (newHtml !== n.textContent) {
          var span = document.createElement('span');
          span.innerHTML = newHtml;
          n.replaceWith.apply(n, [].slice.call(span.childNodes));
        }
      });
    });
  };

})();
