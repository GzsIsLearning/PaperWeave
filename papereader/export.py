#!/usr/bin/env python3
"""
Generate self-contained paper HTML files — for offline reading, sharing via WeChat.

Usage:
  python3 reader/export.py --slug <slug> --output /tmp/croma.html
"""
import sys
import os
import html as html_mod
from pathlib import Path

# ── Path config ──────────────────────────────────────────────────────────
PAPERWEAVE_ROOT = Path(os.environ.get("PAPERWEAVE_ROOT", Path(__file__).resolve().parent.parent))
WIKI = PAPERWEAVE_ROOT / "wiki"
L0 = WIKI / "L0_raw"

# Import from the reader package
sys.path.insert(0, str(Path(__file__).resolve().parent))
from server import get_paper, list_papers


def export_paper(slug: str) -> str:
    """Generate self-contained HTML for a single paper."""
    paper = get_paper(slug)
    full_md = paper["full_body"]
    review_md = paper["review_body"]
    title = paper["title"]
    authors = ", ".join(paper.get("authors", [])) if isinstance(paper.get("authors"), list) else ""
    score = paper.get("score", 0)
    tags = paper.get("tags", [])

    # Escape markdown content to prevent HTML injection
    full_escaped = html_mod.escape(full_md)
    review_escaped = html_mod.escape(review_md)

    # Escape tags for XSS prevention
    escaped_tags = [html_mod.escape(t) for t in tags]

    html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html_mod.escape(title)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked@14/marked.min.js"></script>
<style>
:root {{
  --bg: #0d1117; --bg-panel: #161b22; --bg-hover: #21262d;
  --border: #30363d; --text: #c9d1d9; --text-muted: #8b949e;
  --accent: #58a6ff; --accent-dim: #1f6feb; --gold: #d2991d;
  --red: #f85149; --radius: 6px;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Code', 'JetBrains Mono', monospace;
}}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ font-family:var(--font); background:var(--bg); color:var(--text); }}
#header {{ background:var(--bg-panel); border-bottom:1px solid var(--border); padding:16px 24px; position:sticky; top:0; z-index:10; }}
#header h1 {{ font-size:18px; margin-bottom:4px; }}
#header .meta {{ font-size:12px; color:var(--text-muted); }}
#header .badge {{ display:inline-block; padding:2px 8px; border-radius:10px; margin:2px; font-size:11px; }}
#header .badge.score {{ background:var(--gold); color:#000; }}
#header .badge.tag {{ background:var(--bg-hover); color:var(--accent); }}
#tabs {{ display:flex; gap:4px; padding:8px 24px; background:var(--bg); border-bottom:1px solid var(--border); }}
#tabs button {{ padding:6px 16px; border:1px solid var(--border); border-radius:var(--radius); background:var(--bg-panel); color:var(--text); cursor:pointer; font-size:12px; }}
#tabs button.active {{ background:var(--accent-dim); color:#fff; border-color:var(--accent-dim); }}
#content {{ max-width:900px; margin:0 auto; padding:24px; }}
#content h1, #content h2, #content h3 {{ margin:24px 0 12px; font-weight:600; }}
#content h1 {{ font-size:22px; border-bottom:1px solid var(--border); padding-bottom:8px; }}
#content h2 {{ font-size:17px; }}
#content h3 {{ font-size:14px; }}
#content p {{ margin:8px 0; line-height:1.7; font-size:15px; }}
#content img {{ max-width:100%; border-radius:var(--radius); margin:12px 0; }}
#content table {{ width:100%; border-collapse:collapse; margin:12px 0; font-size:13px; }}
#content th, #content td {{ border:1px solid var(--border); padding:8px 12px; text-align:left; }}
#content th {{ background:var(--bg-hover); font-weight:600; }}
#content code {{ font-family:var(--font-mono); font-size:13px; background:var(--bg-hover); padding:2px 6px; border-radius:3px; }}
#content pre {{ background:var(--bg-hover); padding:16px; border-radius:var(--radius); overflow-x:auto; margin:12px 0; }}
#content pre code {{ background:none; padding:0; }}
#content blockquote {{ border-left:3px solid var(--accent-dim); padding:4px 16px; margin:12px 0; color:var(--text-muted); }}
#hidden-review {{ display:none; }}
</style>
</head>
<body>

<div id="header">
  <h1>{html_mod.escape(title)}</h1>
  <div class="meta">
    {html_mod.escape(authors)}  
    <span class="badge score">{"★" * score} {score}/5</span>
    {" ".join(f'<span class="badge tag">{t}</span>' for t in escaped_tags)}
  </div>
</div>

<div id="tabs">
  <button class="active" onclick="switchTab('full')">全文</button>
  <button onclick="switchTab('review')">评审</button>
</div>

<div id="content"></div>

<script>
// Paper content (embedded)
const FULL_MD = {repr(full_md)};
const REVIEW_MD = {repr(review_md)};

function renderMarkdown(md) {{
  // Math: $$...$$ and $...$
  let html = md
    .replace(/\\$\\$(.+?)\\$\\$/gs, (_, m) => {{ try {{ return katex.renderToString(m.trim(), {{displayMode:true, throwOnError:false}}); }} catch(e) {{ return m; }} }})
    .replace(/\\$(.+?)\\$/g, (_, m) => {{ try {{ return katex.renderToString(m.trim(), {{throwOnError:false}}); }} catch(e) {{ return m; }} }});
  html = marked.parse(html, {{breaks:true}});
  return html;
}}

function switchTab(tab) {{
  document.querySelectorAll('#tabs button').forEach(b => b.classList.remove('active'));
  document.querySelector('#tabs button:nth-child(' + (tab==='full'?1:2) + ')').classList.add('active');
  const md = tab === 'full' ? FULL_MD : REVIEW_MD;
  document.getElementById('content').innerHTML = renderMarkdown(md);
}}

// Initial render
switchTab('full');
</script>
</body>
</html>"""
    return html_content


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", required=True, help="Paper slug")
    parser.add_argument("--output", default=None, help="Output path (default: /tmp/<slug>.html)")
    args = parser.parse_args()

    html = export_paper(args.slug)
    out = args.output or f"/tmp/{args.slug}.html"
    Path(out).write_text(html, encoding="utf-8")
    print(f"Generated: {out} ({len(html)} bytes)")

    # Also open in reader if server is available
    try:
        import requests
        r = requests.get(f"http://localhost:8899/api/paper/{args.slug}", timeout=3)
        if r.status_code == 200:
            print(f"Reader: http://localhost:8899 → search '{args.slug[:30]}...'")
    except:
        pass
