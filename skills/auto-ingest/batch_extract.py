#!/usr/bin/env python3
"""Batch MinerU parsing of Zotero papers — URL mode first
- arXiv URL → convert to pdf direct link
- Other URL → use directly (MinerU supports HTTP PDF)
- No URL → extract PDF from Zotero zip and upload
- Skip already parsed (check L0_raw/<slug>/full.md)
- 10 second interval between calls
"""

import os, sys, re, time, sqlite3, zipfile, tempfile, shutil, subprocess
from pathlib import Path

# ── Path config: use env vars with hardcoded fallbacks ──────────────────
PROJECT_DIR = os.environ.get("PAPERWEAVE_ROOT", "/mnt/disk1/Gongzs/paperweave")
L0_DIR = os.path.join(PROJECT_DIR, "wiki", "L0_raw")
ZOTERO_DB = os.environ.get("ZOTERO_DB", "/mnt/disk1/Gongzs/Zotero-data/zotero.sqlite")
ZOTERO_DATA = os.environ.get("ZOTERO_DATA", "/mnt/disk1/Gongzs/Zotero-data")
MINERU_SCRIPT = os.path.join(PROJECT_DIR, "tools", "mineru_extract.py")

def safe_slug(title):
    title = re.sub(r'[^\w\s-]', '', title.lower())
    title = re.sub(r'\s+', '-', title.strip())
    return title[:80]

def get_pdf_url(url):
    """Convert various URLs to direct PDF links"""
    url = url.strip()
    # arXiv abs → pdf
    m = re.match(r'https?://arxiv\.org/abs/([\d.]+(?:v\d+)?)', url)
    if m:
        return f"https://arxiv.org/pdf/{m.group(1)}"
    # Already pdf
    if '/pdf/' in url or url.endswith('.pdf'):
        return url
    # openreview /forum → /pdf
    if 'openreview.net/forum' in url:
        return url.replace('/forum', '/pdf')
    # Keep as-is, MinerU may handle it
    return url

def get_attachment_key(conn, item_id):
    row = conn.execute(
        "SELECT i.key FROM itemAttachments ia JOIN items i ON i.itemID = ia.itemID "
        "WHERE ia.parentItemID = ? AND ia.contentType = 'application/pdf' LIMIT 1",
        (item_id,)
    ).fetchone()
    return row['key'] if row else None

def extract_pdf_from_zip(att_key, tmpdir):
    zip_path = os.path.join(ZOTERO_DATA, f"{att_key}.zip")
    if not os.path.exists(zip_path) or os.path.getsize(zip_path) < 1000:
        return None
    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            for name in zf.namelist():
                if name.lower().endswith('.pdf'):
                    out_path = os.path.join(tmpdir, "paper.pdf")
                    with zf.open(name) as src, open(out_path, 'wb') as dst:
                        dst.write(src.read())
                    return out_path
    except Exception:
        pass
    return None

def main():
    conn = sqlite3.connect(ZOTERO_DB)
    conn.row_factory = sqlite3.Row

    rows = conn.execute("""
        SELECT i.itemID, i.key,
               COALESCE(
                 (SELECT v.value FROM itemData d JOIN itemDataValues v ON d.valueID = v.valueID 
                  JOIN fields f ON d.fieldID = f.fieldID 
                  WHERE d.itemID = i.itemID AND f.fieldName = 'title'), 'NO_TITLE') as title,
               COALESCE(
                 (SELECT v.value FROM itemData d JOIN itemDataValues v ON d.valueID = v.valueID 
                  JOIN fields f ON d.fieldID = f.fieldID 
                  WHERE d.itemID = i.itemID AND f.fieldName = 'url'), '') as url
        FROM items i
        WHERE i.itemTypeID IN (
            SELECT itemTypeID FROM itemTypes 
            WHERE typeName IN ('journalArticle','conferencePaper','preprint','thesis','book','bookSection','report')
        )
        AND i.itemID IN (
            SELECT parentItemID FROM itemAttachments WHERE contentType = 'application/pdf'
        )
    """).fetchall()
    conn.close()

    # Build task list
    tasks = []
    for row in rows:
        slug = safe_slug(row['title'])
        full_md = os.path.join(L0_DIR, slug, "full.md")
        if os.path.exists(full_md):
            continue
        
        pdf_url = get_pdf_url(row['url']) if row['url'].strip() else None
        tasks.append({
            'item_id': row['itemID'],
            'key': row['key'],
            'title': row['title'][:100],
            'slug': slug,
            'url': pdf_url,
            'mode': 'url' if pdf_url else 'file',
        })

    total = len(tasks)
    url_count = sum(1 for t in tasks if t['mode'] == 'url')
    file_count = sum(1 for t in tasks if t['mode'] == 'file')
    print(f"Total to process: {total} ({url_count} via URL, {file_count} via file upload)")
    
    if total == 0:
        print("All done!")
        return

    os.makedirs(L0_DIR, exist_ok=True)
    conn = sqlite3.connect(ZOTERO_DB)
    conn.row_factory = sqlite3.Row

    success = skipped = failed = 0
    start_time = time.time()

    for i, task in enumerate(tasks):
        elapsed = time.time() - start_time
        eta = (elapsed / max(i, 1)) * (total - i) if i > 0 else 0
        print(f"\n[{i+1}/{total} | +{elapsed/60:.0f}m | ETA {eta/60:.0f}m] "
              f"{task['mode'].upper()}: {task['title'][:60]}...")

        if task['mode'] == 'url':
            cmd = [sys.executable, MINERU_SCRIPT, "--url", task['url'],
                   "--slug", task['slug'], "--language", "en"]
        else:
            att_key = get_attachment_key(conn, task['item_id'])
            if not att_key:
                print(f"  ✗ No attachment")
                skipped += 1
                continue
            tmpdir = tempfile.mkdtemp()
            pdf_path = extract_pdf_from_zip(att_key, tmpdir)
            if not pdf_path:
                print(f"  ✗ Failed to extract PDF from {att_key}")
                shutil.rmtree(tmpdir, ignore_errors=True)
                skipped += 1
                continue
            cmd = [sys.executable, MINERU_SCRIPT, "--file", pdf_path,
                   "--slug", task['slug'], "--language", "en"]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    timeout=900, cwd=PROJECT_DIR)
            if result.returncode == 0:
                success += 1
                lines = [l for l in result.stdout.strip().split('\n') if l.strip()]
                last = lines[-1] if lines else "OK"
                print(f"  ✓ {last}")
            else:
                failed += 1
                err_lines = result.stderr.strip().split('\n')[-3:]
                print(f"  ✗ Exit {result.returncode}: {'; '.join(err_lines)[:200]}")
        except subprocess.TimeoutExpired:
            failed += 1
            print(f"  ✗ Timeout (15min)")
        except Exception as e:
            failed += 1
            print(f"  ✗ {e}")
        finally:
            if task['mode'] == 'file':
                shutil.rmtree(tmpdir, ignore_errors=True)

        # Rate limit
        if i < total - 1:
            time.sleep(10)

    conn.close()
    elapsed = (time.time() - start_time) / 60
    
    print(f"\n{'='*50}")
    print(f"Done in {elapsed:.0f}m. Success: {success}, Failed: {failed}, Skipped: {skipped}")

if __name__ == "__main__":
    main()
