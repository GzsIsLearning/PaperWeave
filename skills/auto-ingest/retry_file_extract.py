#!/usr/bin/env python3
"""Retry remaining papers via --file mode (extract PDF from Zotero zip and upload to MinerU)."""

import os, sys, re, time, sqlite3, zipfile, tempfile, shutil, subprocess

# ── Path config: use env vars with hardcoded fallbacks ──────────────────
PROJECT_DIR = os.environ.get("PAPERWEAVE_ROOT", "/mnt/disk1/Gongzs/paperweave")
L0_DIR = os.path.join(PROJECT_DIR, "wiki", "L0_raw")
ZOTERO_DATA = os.environ.get("ZOTERO_DATA", "/mnt/disk1/Gongzs/Zotero-data")
ZOTERO_DB = os.environ.get("ZOTERO_DB", "/mnt/disk1/Gongzs/Zotero-data/zotero.sqlite")
MINERU_SCRIPT = os.path.join(PROJECT_DIR, "tools", "mineru_extract.py")


def safe_slug(title):
    title = re.sub(r'[^\w\s-]', '', title.lower())
    title = re.sub(r'\s+', '-', title.strip())
    return title[:80]


def extract_pdf_from_zip(att_key, tmpdir):
    possibilities = [
        os.path.join(ZOTERO_DATA, f"{att_key}.zip"),
        os.path.join(ZOTERO_DATA, 'data', 'storage', att_key, 'content.zip'),
    ]
    for zip_path in possibilities:
        if os.path.exists(zip_path) and os.path.getsize(zip_path) > 100:
            try:
                with zipfile.ZipFile(zip_path, 'r') as zf:
                    for name in zf.namelist():
                        if name.lower().endswith('.pdf'):
                            out_path = os.path.join(tmpdir, "paper.pdf")
                            with zf.open(name) as src, open(out_path, 'wb') as dst:
                                dst.write(src.read())
                            return out_path, zip_path
            except Exception:
                pass
    return None, None


def main():
    conn = sqlite3.connect(ZOTERO_DB)
    c = conn.cursor()

    # Build attachment key map
    att_rows = c.execute("""
        SELECT ia.parentItemID, i.key as att_key
        FROM itemAttachments ia
        JOIN items i ON i.itemID = ia.itemID
        WHERE ia.contentType = 'application/pdf'
    """).fetchall()
    att_map = {}
    for pid, ak in att_rows:
        att_map[pid] = ak

    # Get papers
    rows = c.execute("""
        SELECT i.itemID,
               (SELECT v.value FROM itemData d JOIN itemDataValues v ON d.valueID = v.valueID
                JOIN fields f ON d.fieldID = f.fieldID
                WHERE d.itemID = i.itemID AND f.fieldName = 'title') as title
        FROM items i
        WHERE i.itemID IN (
            SELECT parentItemID FROM itemAttachments WHERE contentType = 'application/pdf'
        )
    """).fetchall()
    conn.close()

    tasks = []
    for (itemID, title) in rows:
        if not title:
            continue
        slug = safe_slug(title)
        full_md = os.path.join(L0_DIR, slug, "full.md")
        if os.path.exists(full_md):
            continue
        ak = att_map.get(itemID, "")
        tasks.append({"itemID": itemID, "title": title[:80], "slug": slug, "att_key": ak})

    total = len(tasks)
    print(f"Papers to retry via --file: {total}")

    if total == 0:
        print("Nothing to do.")
        return

    os.makedirs(L0_DIR, exist_ok=True)

    success = failed = skipped = 0
    start_time = time.time()

    for i, task in enumerate(tasks):
        elapsed = time.time() - start_time
        eta = (elapsed / max(i, 1)) * (total - i) if i > 0 else 0
        print(f"\n[{i+1}/{total} | +{elapsed/60:.0f}m | ETA {eta/60:.0f}m] FILE: {task['title'][:60]}...")

        if not task["att_key"]:
            print("  ✗ No attachment key")
            skipped += 1
            continue

        tmpdir = tempfile.mkdtemp()
        try:
            pdf_path, zip_used = extract_pdf_from_zip(task["att_key"], tmpdir)
            if not pdf_path:
                print(f"  ✗ No PDF in zip {task['att_key']}")
                skipped += 1
                continue

            pdf_size_mb = os.path.getsize(pdf_path) / 1024 / 1024
            print(f"     PDF: {pdf_size_mb:.1f}M from {os.path.basename(zip_used)}")

            cmd = [sys.executable, MINERU_SCRIPT, "--file", pdf_path,
                   "--slug", task["slug"], "--language", "en"]
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    timeout=900, cwd=PROJECT_DIR)
            if result.returncode == 0:
                success += 1
                lines = [l for l in result.stdout.strip().split("\n") if l.strip()]
                last = lines[-1] if lines else "OK"
                print(f"  ✓ {last}")
            else:
                failed += 1
                err = result.stderr.strip().split("\n")[-3:]
                print(f"  ✗ Exit {result.returncode}: {'; '.join(err)[:200]}")
        except subprocess.TimeoutExpired:
            failed += 1
            print("  ✗ Timeout (15min)")
        except Exception as e:
            failed += 1
            print(f"  ✗ {e}")
        finally:
            shutil.rmtree(tmpdir, ignore_errors=True)

        if i < total - 1:
            time.sleep(10)

    elapsed = (time.time() - start_time) / 60
    print(f"\n{'='*50}")
    print(f"Done in {elapsed:.0f}m. Success: {success}, Failed: {failed}, Skipped: {skipped}")


if __name__ == "__main__":
    main()
