'use strict';

(function () {
  var PW = window.PW = window.PW || {};

  // ── Session store (server-persisted via .chat-sessions.json) ──────────
  // Global across all papers. Loaded on page load, synced on every message.

  var chatSessions = [];     // [{id, name, messages:[{role,content,time}]}]
  var activeSessionId = null;
  var _sessionsLoaded = false;

  // ── Server sync ──────────────────────────────────────────────────────

  function syncToServer() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/sessions', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ sessions: chatSessions }));
    } catch (e) {
      // Fire-and-forget, best effort
    }
  }

  // Called once on page load
  PW.loadSessions = function () {
    if (_sessionsLoaded) return;
    _sessionsLoaded = true;
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/sessions', false);
      xhr.send();
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        chatSessions = data.sessions || [];
      }
    } catch (e) {
      chatSessions = [];
    }
    if (!chatSessions.length) {
      newSession(true); // silent — don't sync
    }
    activeSessionId = chatSessions[0].id;
    PW.renderChatHistory();
    PW.renderSessionList();
  };

  // ── Session helpers ──────────────────────────────────────────────────

  function activeSession() {
    if (!chatSessions.length) newSession();
    for (var i = 0; i < chatSessions.length; i++) {
      if (chatSessions[i].id === activeSessionId) return chatSessions[i];
    }
    activeSessionId = chatSessions[0].id;
    return chatSessions[0];
  }

  function sessionIndex(id) {
    for (var i = 0; i < chatSessions.length; i++) {
      if (chatSessions[i].id === id) return i;
    }
    return -1;
  }

  // ── Session CRUD ─────────────────────────────────────────────────────

  function newSession(name, silent) {
    var id = 's' + Date.now();
    chatSessions.unshift({
      id: id,
      name: name || ('对话 ' + (chatSessions.length + 1)),
      messages: []
    });
    activeSessionId = id;
    if (!silent) syncToServer();
    PW.renderChatHistory();
    PW.renderSessionList();
    PW.emit('chat:session-changed', { sessionId: id });
  }
  PW.newSession = function (name) { newSession(name); };

  PW.switchSession = function (id) {
    activeSessionId = id;
    var dd = document.getElementById('cw-session-dropdown');
    if (dd) dd.classList.remove('show');
    PW.renderChatHistory();
    PW.renderSessionList();
    PW.emit('chat:session-changed', { sessionId: id });
  };

  PW.deleteSession = function (id) {
    if (chatSessions.length <= 1) {
      // Clear the last session instead
      chatSessions[0].messages = [];
      chatSessions[0].name = '默认对话';
      syncToServer();
      PW.renderChatHistory();
      PW.renderSessionList();
      return;
    }
    var idx = sessionIndex(id);
    if (idx === -1) return;
    chatSessions.splice(idx, 1);
    activeSessionId = chatSessions[0].id;
    syncToServer();
    PW.renderChatHistory();
    PW.renderSessionList();
    PW.emit('chat:session-changed', { sessionId: activeSessionId });
  };

  // ── Message CRUD ─────────────────────────────────────────────────────

  PW.addChatMessage = function (role, content) {
    var s = activeSession();
    s.messages.push({
      role: role,
      content: content,
      time: new Date().toISOString()
    });
    syncToServer();
    PW.renderChatHistory();
    PW.emit('chat:message-added', { role: role });
  };

  PW.deleteMessage = function (index) {
    var s = activeSession();
    if (index < 0 || index >= s.messages.length) return;
    s.messages.splice(index, 1);
    syncToServer();
    requestAnimationFrame(function () { PW.renderChatHistory(); });
  };

  // ── Session dropdown UI ──────────────────────────────────────────────

  PW.toggleSessionDropdown = function () {
    var dd = document.getElementById('cw-session-dropdown');
    if (!dd) return;
    dd.classList.toggle('show');
    if (dd.classList.contains('show')) PW.renderSessionList();
  };

  PW.renderSessionList = function () {
    var dd = document.getElementById('cw-session-dropdown');
    var btn = document.getElementById('cw-session-btn');
    var s = activeSession();
    if (btn) btn.textContent = s ? s.name : '默认对话';
    if (!dd) return;
    dd.innerHTML = chatSessions.map(function (sess) {
      var activeClass = sess.id === activeSessionId ? ' active' : '';
      return '<div class="cw-sess-item' + activeClass + '" onclick="PW.switchSession(\'' + sess.id + '\')">' +
        '<span>' + PW.escHtml(sess.name) + '</span>' +
        '<button class="cw-sess-del" onclick="event.stopPropagation();PW.deleteSession(\'' + sess.id + '\')" title="删除会话">✕</button>' +
        '</div>';
    }).join('');
  };

  // ── Render ───────────────────────────────────────────────────────────

  PW.renderChatHistory = function () {
    var el = document.getElementById('cw-messages');
    var s = activeSession();
    if (!s || !s.messages.length) {
      el.innerHTML = '<div class="cw-msg assistant"><div class="cw-label">Agent</div>在下方输入问题，我会在这里回答。</div>';
      return;
    }
    el.innerHTML = s.messages.map(function (m, i) {
      var display = m.role === 'user'
        ? PW.escHtml(m.content)
        : PW.formatChatAnswer(m.content);
      return '<div class="cw-msg ' + m.role + '">' +
        '<button class="cw-del" onclick="event.stopPropagation();PW.deleteMessage(' + i + ')">✕</button>' +
        '<div class="cw-label">' + (m.role === 'user' ? '你' : 'Agent') + '</div>' +
        display +
        '</div>';
    }).join('');
    el.scrollTop = el.scrollHeight;
  };

  // ── Chat window ──────────────────────────────────────────────────────

  PW.toggleChatWindow = function () {
    var cw = document.getElementById('chat-window');
    var btn = document.getElementById('btn-chat');
    if (cw.classList.contains('open')) {
      cw.classList.remove('open');
      if (btn) btn.classList.add('show');
    } else {
      PW.openChatWindow();
    }
  };

  PW.openChatWindow = function (prefillText) {
    var cw = document.getElementById('chat-window');
    var btn = document.getElementById('btn-chat');
    if (!cw.style.left || cw.style.left === 'auto') {
      cw.style.left = Math.max(10, window.innerWidth - 440) + 'px';
      cw.style.top = '80px';
    }
    cw.classList.add('open');
    if (btn) btn.classList.remove('show');

    if (prefillText) {
      var input = document.getElementById('cw-input');
      if (input) {
        input.value = prefillText;
        input.focus();
      }
    }
    PW.renderChatHistory();
  };

  PW.closeChatWindow = function () {
    PW.toggleChatWindow();
  };

  // ── Send (streaming with SSE, fallback to /api/chat) ─────────────────

  PW.sendChatMessage = async function () {
    var input = document.getElementById('cw-input');
    var question = input.value.trim();
    if (!question) return;
    input.value = '';

    PW.addChatMessage('user', question);

    // Create a placeholder for the streaming answer
    var msgs = document.getElementById('cw-messages');
    var answerEl = document.createElement('div');
    answerEl.className = 'cw-msg assistant';
    answerEl.innerHTML =
      '<div class="cw-label">Agent</div>' +
      '<span class="cw-status">💭 思考中...</span>' +
      '<span class="cw-answer"></span>';
    answerEl.id = 'cw-streaming';
    msgs.appendChild(answerEl);
    msgs.scrollTop = msgs.scrollHeight;

    var answerContent = '';

    // Build history from active session (exclude the just-added message)
    var s = activeSession();
    var history = s.messages.slice(0, -1).map(function (m) {
      return (m.role === 'user' ? 'user: ' : 'assistant: ') + m.content;
    });

    var currentSlug = PW.getState('currentSlug') || '';
    var savedSelection = PW.getState('savedSelection') || '';

    // Indicator when chatting without paper context
    if (!currentSlug) {
      var subtle = document.getElementById('cw-no-paper-indicator');
      if (!subtle) {
        subtle = document.createElement('div');
        subtle.id = 'cw-no-paper-indicator';
        subtle.style.cssText = 'font-size:11px;color:var(--text-muted,#999);padding:2px 8px;text-align:center;';
        subtle.textContent = '⚠ 未选择论文，Agent 将无上下文回答';
        var header = document.getElementById('cw-header');
        if (header) header.appendChild(subtle);
      }
    }

    var streamingOk = false;

    try {
      var res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: currentSlug,
          selected_text: savedSelection,
          question: question,
          history: history
        })
      });

      if (!res.ok) throw new Error('Stream endpoint returned ' + res.status);

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      while (true) {
        var chunk = await reader.read(), done = chunk.done, value = chunk.value;
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        var lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line.startsWith('data: ')) continue;
          var dataStr = line.substring(6);
          if (dataStr === '[DONE]') continue;

          try {
            var evt = JSON.parse(dataStr);
            if (evt.type === 'status' || evt.type === 'searching' ||
                evt.type === 'reading' || evt.type === 'tool' ||
                evt.type === 'memory') {
              var icons = { searching: '🔍', reading: '📖', tool: '🔧', memory: '🧠', status: '💭' };
              var icon = icons[evt.type] || '💭';
              var statusEl = answerEl.querySelector('.cw-status');
              if (statusEl) statusEl.textContent = icon + ' ' + (evt.text || '处理中...');
            } else if (evt.type === 'answer') {
              answerContent = evt.text;
              var answerSpan = answerEl.querySelector('.cw-answer');
              var statusEl2 = answerEl.querySelector('.cw-status');
              if (statusEl2) statusEl2.style.display = 'none';
              if (answerSpan) {
                answerSpan.innerHTML = PW.formatChatAnswer
                  ? PW.formatChatAnswer(answerContent)
                  : PW.escHtml(answerContent);
              }
              streamingOk = true;
            }
          } catch (parseErr) {
            // Ignore unparseable lines
          }
        }
      }
    } catch (streamErr) {
      console.warn('SSE stream failed, falling back to /api/chat:', streamErr.message);
    }

    // Fall back to non-streaming if needed
    if (!streamingOk || !answerContent) {
      try {
        var fbRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: currentSlug,
            selected_text: savedSelection,
            question: question,
            history: s.messages.slice(0, -1).map(function (m) {
              return { role: m.role, content: m.content };
            })
          })
        });
        var fbData = await fbRes.json();
        answerContent = fbData.answer || '';
      } catch (fbErr) {
        if (!answerContent) answerContent = 'Agent 无响应: ' + fbErr.message;
      }
    }

    var streaming = document.getElementById('cw-streaming');
    if (streaming) streaming.remove();

    if (answerContent) {
      PW.addChatMessage('assistant', answerContent);
    } else {
      PW.addChatMessage('assistant', 'Agent 无响应');
    }

    PW.setState('savedSelection', null);
  };

  // ── doAskAI ──────────────────────────────────────────────────────────

  PW.doAskAI = function () {
    var savedSelection = PW.getState('savedSelection');
    if (!savedSelection) return;
    PW.openChatWindow('关于这段文字：' + savedSelection + '\n\n');
  };

  // ── askAIAboutImage ─────────────────────────────────────────────────

  PW.askAIAboutImage = function () {
    var imgPopupTarget = PW.getState('imgPopupTarget');
    if (!imgPopupTarget) return;
    var src = imgPopupTarget.src;
    var popup = document.getElementById('img-popup');
    if (popup) popup.style.display = 'none';
    PW.openChatWindow();
    var input = document.getElementById('cw-input');
    if (input) {
      input.value = '请分析这张图片：' + src;
      input.focus();
    }
  };

})();
