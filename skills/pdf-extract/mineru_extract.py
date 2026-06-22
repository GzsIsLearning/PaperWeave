#!/usr/bin/env python3
"""
MinerU PDF precision parsing integration script (OpenXLab API)
=============================================================
- Submit PDF to MinerU cloud parsing (VLM model, recommended)
- Supports remote URL and local file upload modes
- Async polling, download Zip result package
- Extract full.md + images → paperweave wiki L0_raw/

Usage:
  # URL mode
  python3 mineru_extract.py --url "https://example.com/paper.pdf"

  # Local PDF file
  python3 mineru_extract.py --file /path/to/paper.pdf

  # Specify output directory and model version
  python3 mineru_extract.py --url "..." --out /tmp/out --model pipeline

Dependencies: requests, tqdm
Environment variable: MINERU_TOKEN (can also be set in .env file)
"""

import os
import sys
import re
import json
import hashlib
import shutil
import time
import tempfile
import zipfile
import io
from pathlib import Path
from datetime import datetime

# ── Path config ───────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.environ.get("PAPERWEAVE_ROOT", os.path.dirname(SCRIPT_DIR))
DEFAULT_OUT = os.path.join(PROJECT_DIR, "wiki", "L0_raw")

# ── Load Token ─────────────────────────────────────────────
def load_token():
    """Load MINERU_TOKEN from env var or .env file"""
    token = os.environ.get("MINERU_TOKEN", "")
    if token:
        return token

    # Try .env in various locations
    for env_dir in [os.getcwd(), SCRIPT_DIR, PROJECT_DIR,
                    os.path.expanduser("~"), os.path.expanduser("~/.hermes")]:
        env_file = os.path.join(env_dir, ".env")
        if os.path.exists(env_file):
            # Also try python-dotenv if available
            try:
                from dotenv import load_dotenv
                load_dotenv(env_file)
                token = os.environ.get("MINERU_TOKEN", "")
                if token:
                    return token
            except ImportError:
                pass
            with open(env_file) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("MINERU_TOKEN="):
                        token = line.split("=", 1)[1].strip()
                        if token:
                            return token
    return ""


TOKEN = load_token()
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}",
}

API_BASE = "https://mineru.net/api/v4"

# ── Utility functions ────────────────────────────────────────────────

def get_uid():
    """Extract uuid from Token JWT payload (for callback validation)"""
    import base64
    try:
        payload_b64 = TOKEN.split(".")[1]
        payload_b64 += "=" * (4 - len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        return payload.get("uuid", "")
    except Exception:
        return ""


def sanitize_filename(name: str) -> str:
    """Title → safe filename"""
    name = re.sub(r'[^\w\s-]', '', name)
    name = re.sub(r'\s+', '-', name.strip())
    return name.lower()[:80]


def poll_task(task_id: str, timeout: int = 600) -> dict:
    """Poll single task until done, return final response data"""
    url = f"{API_BASE}/extract/task/{task_id}"
    start = time.time()
    while True:
        resp = _request("GET", url)
        state = resp.get("data", {}).get("state", "unknown")
        progress = resp.get("data", {}).get("extract_progress", {})

        if state == "done":
            return resp["data"]
        elif state == "failed":
            err = resp["data"].get("err_msg", "unknown error")
            raise RuntimeError(f"Task {task_id} failed: {err}")

        elapsed = time.time() - start
        pages = progress.get("extracted_pages", 0)
        total = progress.get("total_pages", 0)
        page_info = f" [{pages}/{total} pages]" if total else ""
        print(f"  {state}{page_info} ({elapsed:.0f}s)", end="\r")
        time.sleep(3)

        if elapsed > timeout:
            raise TimeoutError(f"Task {task_id} timed out after {timeout}s")


def poll_batch(batch_id: str, timeout: int = 900) -> list:
    """Poll batch task until all done, return extract_result array"""
    url = f"{API_BASE}/extract-results/batch/{batch_id}"
    start = time.time()
    while True:
        resp = _request("GET", url)
        results = resp.get("data", {}).get("extract_result", [])
        states = [r.get("state") for r in results]

        if all(s == "done" for s in states):
            return results

        failed = [r for r in results if r.get("state") == "failed"]
        if failed:
            errs = "; ".join(f"{r['file_name']}: {r.get('err_msg', '?')}" for r in failed)
            raise RuntimeError(f"Batch {batch_id} failed: {errs}")

        done = sum(1 for s in states if s == "done")
        elapsed = time.time() - start
        print(f"  {done}/{len(results)} done ({elapsed:.0f}s)", end="\r")
        time.sleep(5)

        if elapsed > timeout:
            raise TimeoutError(f"Batch {batch_id} timed out after {timeout}s")


def _request(method: str, url: str, json_data: dict = None,
             raw: bool = False, **kwargs) -> dict | bytes:
    """Send authenticated HTTP request"""
    import requests
    if method == "GET":
        resp = requests.get(url, headers=HEADERS, **kwargs)
    elif method == "POST":
        resp = requests.post(url, headers=HEADERS, json=json_data, **kwargs)
    else:
        raise ValueError(f"Unsupported method: {method}")

    if resp.status_code != 200:
        raise RuntimeError(
            f"HTTP {resp.status_code}: {resp.text[:500]}"
        )

    if raw:
        return resp.content
    return resp.json()


def download_and_extract(zip_url: str, output_dir: str,
                         paper_slug: str = None) -> dict:
    """Download zip → extract → return file info"""
    import requests

    try:
        import tqdm
        has_tqdm = True
    except ImportError:
        has_tqdm = False

    print(f"  Downloading: {zip_url}")
    resp = requests.get(zip_url, stream=True)
    resp.raise_for_status()

    tmpdir = tempfile.mkdtemp()
    zip_path = os.path.join(tmpdir, "result.zip")
    total = int(resp.headers.get("content-length", 0))

    with open(zip_path, "wb") as f:
        if total and has_tqdm:
            with tqdm.tqdm(total=total, unit="B", unit_scale=True, desc="  ") as pbar:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)
                    pbar.update(len(chunk))
        else:
            f.write(resp.content)

    # Extract
    os.makedirs(output_dir, exist_ok=True)
    info = {"files": [], "images": [], "full_md_path": None}

    with zipfile.ZipFile(zip_path, "r") as zf:
        for name in zf.namelist():
            if name.startswith("__MACOSX") or name.endswith("/"):
                continue

            dest_name = name
            if paper_slug and name.startswith("images/"):
                dest_name = f"images/{paper_slug}_{os.path.basename(name)}"

            dest_path = os.path.join(output_dir, dest_name)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            with zf.open(name) as src, open(dest_path, "wb") as dst:
                dst.write(src.read())

            info["files"].append(dest_name)
            if name.endswith(".md"):
                info["full_md_path"] = dest_path
            if name.startswith("images/"):
                info["images"].append(dest_name)

    shutil.rmtree(tmpdir)
    return info


# ── Main functions ──────────────────────────────────────────────────

def extract_from_url(file_url: str, output_dir: str = None,
                     paper_slug: str = None,
                     model: str = "vlm",
                     enable_formula: bool = True,
                     enable_table: bool = True,
                     language: str = "ch",
                     page_ranges: str = None,
                     extra_formats: list = None) -> dict:
    """
    Parse PDF from remote URL.

    Returns: {"md_path": str, "images": [str], "task_id": str, "info": dict}
    """
    if not TOKEN:
        raise ValueError("MINERU_TOKEN not set. Export it or add to .env file.")

    output_dir = output_dir or DEFAULT_OUT
    if paper_slug:
        paper_dir = os.path.join(output_dir, paper_slug)
    else:
        paper_dir = output_dir

    data = {
        "url": file_url,
        "model_version": model,
        "enable_formula": enable_formula,
        "enable_table": enable_table,
        "language": language,
    }
    if page_ranges:
        data["page_ranges"] = page_ranges
    if extra_formats:
        data["extra_formats"] = extra_formats

    print(f"Submitting URL: {file_url[:80]}...")
    resp = _request("POST", f"{API_BASE}/extract/task", json_data=data)

    if resp.get("code") != 0:
        raise RuntimeError(f"API error: {resp.get('msg', resp)}")

    task_id = resp["data"]["task_id"]
    print(f"  Task ID: {task_id}")

    print("  Waiting for result...")
    result = poll_task(task_id)
    zip_url = result.get("full_zip_url")
    if not zip_url:
        raise RuntimeError("No zip_url in result")

    info = download_and_extract(zip_url, paper_dir, paper_slug)
    print(f"  ✓ Saved to: {paper_dir}")
    print(f"  Files: {len(info['files'])} ({len(info['images'])} images)")

    return {
        "md_path": info.get("full_md_path"),
        "images": info["images"],
        "task_id": task_id,
        "info": info,
    }


def extract_from_file(file_path: str, output_dir: str = None,
                      paper_slug: str = None,
                      model: str = "vlm",
                      enable_formula: bool = True,
                      enable_table: bool = True,
                      language: str = "ch",
                      page_ranges: str = None) -> dict:
    """
    Upload local file to MinerU for parsing (via batch upload API).

    Returns: {"md_path": str, "images": [str], "batch_id": str, "info": dict}
    """
    import requests

    if not TOKEN:
        raise ValueError("MINERU_TOKEN not set.")
    if not os.path.exists(file_path):
        raise FileNotFoundError(file_path)

    file_name = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)
    if file_size > 200 * 1024 * 1024:
        raise ValueError(f"File too large: {file_size} bytes (max 200MB)")

    output_dir = output_dir or DEFAULT_OUT
    if paper_slug:
        paper_dir = os.path.join(output_dir, paper_slug)
    else:
        paper_dir = output_dir

    print(f"Uploading: {file_name} ({file_size/1024/1024:.1f} MB)")
    batch_data = {
        "files": [{"name": file_name}],
        "model_version": model,
        "enable_formula": enable_formula,
        "enable_table": enable_table,
        "language": language,
    }
    if page_ranges:
        batch_data["files"][0]["page_ranges"] = page_ranges

    resp = _request("POST", f"{API_BASE}/file-urls/batch", json_data=batch_data)
    if resp.get("code") != 0:
        raise RuntimeError(f"Batch API error: {resp.get('msg', resp)}")

    batch_id = resp["data"]["batch_id"]
    upload_url = resp["data"]["file_urls"][0]
    print(f"  Batch ID: {batch_id}")

    print("  Uploading...")
    with open(file_path, "rb") as f:
        put_resp = requests.put(upload_url, data=f)
    if put_resp.status_code not in (200, 204):
        raise RuntimeError(f"Upload failed: HTTP {put_resp.status_code}")
    print("  ✓ Uploaded")

    print("  Waiting for result...")
    results = poll_batch(batch_id)

    result = results[0]
    if result["state"] != "done":
        raise RuntimeError(f"Extraction failed: {result.get('err_msg', '?')}")

    zip_url = result.get("full_zip_url")
    if not zip_url:
        raise RuntimeError("No zip_url in result")

    info = download_and_extract(zip_url, paper_dir, paper_slug)
    print(f"  ✓ Saved to: {paper_dir}")
    print(f"  Files: {len(info['files'])} ({len(info['images'])} images)")

    return {
        "md_path": info.get("full_md_path"),
        "images": info["images"],
        "batch_id": batch_id,
        "info": info,
    }


# ── CLI entry ──────────────────────────────────────────────

def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="MinerU PDF precision parsing — Cloud VLM extraction",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --url "https://arxiv.org/pdf/2301.12345"
  %(prog)s --file paper.pdf --model pipeline
  %(prog)s --file paper.pdf --out /my/output --slug my-paper
  %(prog)s --url "..." --model vlm --language en
        """,
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--url", help="Remote PDF/file URL")
    group.add_argument("--file", help="Local PDF/file path")

    parser.add_argument("--out", default=None, help="Output directory (default: wiki/L0_raw)")
    parser.add_argument("--slug", default=None, help="paper slug (for subdirectory/image prefix)")
    parser.add_argument("--model", default="vlm",
                        choices=["vlm", "pipeline", "MinerU-HTML"],
                        help="Model version (default: vlm)")
    parser.add_argument("--no-formula", action="store_true", help="Disable formula recognition")
    parser.add_argument("--no-table", action="store_true", help="Disable table recognition")
    parser.add_argument("--language", default="ch", help="Document language (default: ch)")
    parser.add_argument("--pages", default=None, help="Page range, e.g. 2,4-6")
    parser.add_argument("--extra-formats", nargs="*", choices=["docx", "html", "latex"],
                        help="Extra export formats")

    args = parser.parse_args()

    if not TOKEN:
        print("Error: MINERU_TOKEN not set. Please export MINERU_TOKEN=xxx or add to project .env.")
        sys.exit(1)

    try:
        if args.url:
            result = extract_from_url(
                file_url=args.url,
                output_dir=args.out,
                paper_slug=args.slug,
                model=args.model,
                enable_formula=not args.no_formula,
                enable_table=not args.no_table,
                language=args.language,
                page_ranges=args.pages,
                extra_formats=args.extra_formats,
            )
            print(f"\n✓ MD path: {result['md_path']}")
        else:
            result = extract_from_file(
                file_path=args.file,
                output_dir=args.out,
                paper_slug=args.slug,
                model=args.model,
                enable_formula=not args.no_formula,
                enable_table=not args.no_table,
                language=args.language,
                page_ranges=args.pages,
            )
            print(f"\n✓ MD path: {result['md_path']}")

        print(f"  Images: {len(result['images'])}")
        print(f"  Task/Batch ID: {result.get('task_id') or result.get('batch_id')}")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
