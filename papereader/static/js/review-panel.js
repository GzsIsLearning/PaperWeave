'use strict';

(function () {
  const PW = window.PW = window.PW || {};

  // ── toggleReviewPanel ─────────────────────────────────────────────────
  // Toggle open/close the review panel.

  PW.toggleReviewPanel = function () {
    const panel = document.getElementById('review-panel');
    const btn = document.getElementById('btn-review');
    if (!panel || !btn) return;

    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      btn.classList.add('show');
    } else {
      PW.openReviewPanel();
    }
  };

  // ── openReviewPanel ───────────────────────────────────────────────────
  // Open the review panel, positioning it if not already set.

  PW.openReviewPanel = function () {
    const panel = document.getElementById('review-panel');
    const btn = document.getElementById('btn-review');
    if (!panel || !btn) return;

    // Position if not already set
    if (!panel.style.left || panel.style.left === 'auto') {
      panel.style.left = Math.max(10, window.innerWidth - 500) + 'px';
      panel.style.top = '60px';
    }
    panel.classList.add('open');
    btn.classList.remove('show');
    PW.renderReviewContent();
  };

  // ── renderReviewContent ───────────────────────────────────────────────
  // Render review content into the review panel body.
  // Uses PW.renderMarkdown() from utils.js (unified pipeline).
  // Shows '暂无评审' placeholder when no review is available.

  PW.renderReviewContent = function () {
    const body = document.getElementById('rv-body');
    const title = document.getElementById('rv-title');
    const meta = document.getElementById('rv-meta');
    const btn = document.getElementById('btn-review');
    const currentPaper = PW.getState('currentPaper');

    if (!currentPaper) {
      if (body) {
        body.innerHTML =
          '<div class="rv-empty">' +
            '<div class="rv-empty-icon">📝</div>' +
            '<p>选择一篇论文后，点击 📝 按钮查看 Agent 评审</p>' +
          '</div>';
      }
      if (title) title.textContent = '📝 Agent 评审';
      if (meta) meta.textContent = '';
      if (btn) btn.className = '';
      return;
    }

    const hasReview = currentPaper.review_body &&
      currentPaper.review_body.trim() &&
      currentPaper.review_body !== '*暂无评审*';

    if (title) {
      title.textContent = '📝 ' + (currentPaper.title || 'Agent 评审');
    }

    if (hasReview) {
      if (meta) {
        meta.textContent = '★ ' + (currentPaper.score || 0);
      }
      if (btn) btn.className = 'has-review';

      // Render review with the shared markdown pipeline from utils.js
      const html = PW.renderMarkdown(currentPaper.review_body, currentPaper.slug);
      if (body) body.innerHTML = html;
    } else {
      if (meta) meta.textContent = '暂无评审';
      if (btn) btn.className = 'no-review';
      if (body) {
        body.innerHTML =
          '<div class="rv-empty">' +
            '<div class="rv-empty-icon">📝</div>' +
            '<p>该论文暂无 Agent 评审</p>' +
            '<p style="font-size:12px;margin-top:8px;">你可以在论文目录下创建 review.md 文件</p>' +
          '</div>';
      }
    }
  };

})();
