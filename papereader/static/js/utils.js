'use strict';

(function () {
  var PW = window.PW = window.PW || {};

  // ── escapeRegex ───────────────────────────────────────────────────────

  PW.escapeRegex = function (s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // ── escHtml ───────────────────────────────────────────────────────────

  PW.escHtml = function (s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  // ── toast ─────────────────────────────────────────────────────────────

  PW.toast = function (msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(function () { el.classList.remove('show'); }, 2500);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // _renderRichText — the ONE markdown+LaTeX rendering pipeline
  // All content (papers, reviews, agent answers, clues) flows through here.
  //
  // Options:
  //   slug       — paper slug for image path fixing (optional)
  //   escapeHtml — if true, escHtml() before marked (for untrusted text)
  //   useMarked  — if true, run marked.parse() for full GFM; if false,
  //                just restore LaTeX (for simple clue cards)
  // ═══════════════════════════════════════════════════════════════════════

  PW._renderRichText = function (text, options) {
    if (!text) return '';
    options = options || {};

    var s = text;

    // ── 1. Fix mineru image paths: images/xxx → /api/paper/{slug}/image/xxx
    if (options.slug) {
      s = s.replace(/!\[([^\]]*)\]\(images\/([^)]+)\)/g,
        '![$1](/api/paper/' + options.slug + '/image/$2)');
    }

    // ── 2. Extract LaTeX to placeholders (before any HTML processing)
    var katexBlocks = [];

    // Display math $$...$$
    s = s.replace(/\$\$([\s\S]*?)\$\$/g, function (_, m) {
      var idx = katexBlocks.length;
      try {
        katexBlocks.push(katex.renderToString(m.trim(), {displayMode: true, throwOnError: false}));
      } catch (e) {
        katexBlocks.push('$$' + PW.escHtml(m) + '$$');
      }
      return '\u27E8KATEX' + idx + '\u27E9';
    });

    // Inline math $...$
    s = s.replace(/(?<!\$)\$(?!\$)([^$]+?)(?<!\$)\$(?!\$)/g, function (_, m) {
      var idx = katexBlocks.length;
      try {
        katexBlocks.push(katex.renderToString(m.trim(), {throwOnError: false}));
      } catch (e) {
        katexBlocks.push('$' + PW.escHtml(m) + '$');
      }
      return '\u27E8KATEX' + idx + '\u27E9';
    });

    // ── 3. Markdown rendering via marked.parse
    if (options.useMarked !== false) {
      // Escape HTML for untrusted content (agent answers)
      if (options.escapeHtml) {
        s = PW.escHtml(s);
      }

      // Custom renderer: support ```math / ```latex fenced blocks
      var renderer = new marked.Renderer();
      renderer.code = function (codeInfo) {
        var codeText = codeInfo.text;
        var lang = codeInfo.lang;
        if (lang === 'math' || lang === 'latex') {
          try {
            return katex.renderToString(codeText, {displayMode: true, throwOnError: false});
          } catch (e) {
            return '<pre><code>' + PW.escHtml(codeText) + '</code></pre>';
          }
        }
        return '<pre><code class="language-' + (lang || '') + '">' + PW.escHtml(codeText) + '</code></pre>';
      };

      s = marked.parse(s, {renderer: renderer, breaks: true});
    }

    // ── 4. Restore KaTeX placeholders
    s = s.replace(/\u27E8KATEX(\d+)\u27E9/g, function (_, i) {
      return katexBlocks[+i] || '';
    });

    return s;
  };

  // ── formatChatAnswer (agent chat messages) ────────────────────────────
  // Untrusted plain text → escHtml → marked → KaTeX

  PW.formatChatAnswer = function (text) {
    return PW._renderRichText(text, {escapeHtml: true, useMarked: true});
  };

  // ── renderMarkdown (paper full text / review content) ─────────────────
  // Trusted markdown from disk → marked + KaTeX. No HTML escaping.

  PW.renderMarkdown = function (md, slug) {
    return PW._renderRichText(md, {slug: slug, useMarked: true});
  };

  // ── renderClueHTML (clue cards: highlight text, AI snippets) ──────────
  // Short text with possible LaTeX. No full markdown — just escape + KaTeX.

  PW.renderClueHTML = function (text) {
    return PW._renderRichText(text, {escapeHtml: true, useMarked: false});
  };

})();
