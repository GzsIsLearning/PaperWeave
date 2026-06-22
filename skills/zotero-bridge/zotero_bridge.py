#!/usr/bin/env python3
"""
Zotero SQLite Bridge — read zotero.sqlite directly, provide structured query interface.

Usage:
  from zotero_bridge import ZoteroBridge
  zb = ZoteroBridge("~/Zotero-Data/zotero.sqlite")
  papers = zb.search("transformer attention")
  paper = zb.get_item("ABCD1234")
  collections = zb.list_collections()
  notes = zb.get_notes("ABCD1234")
  annotations = zb.get_annotations("ABCD1234")
  stats = zb.stats()
"""

import sqlite3
import os
import json


class ZoteroBridge:
    """Zotero SQLite database access layer (read-only)"""

    def __init__(self, db_path: str = None):
        if db_path is None:
            # Prefer env var, fallback to hardcoded paths
            db_path = os.environ.get(
                "ZOTERO_DB",
                "/mnt/disk1/Gongzs/Zotero-data/zotero.sqlite"
            )
        self.db_path = os.path.expanduser(db_path)
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Zotero database not found: {self.db_path}")
        self.conn = sqlite3.connect(f"file:{self.db_path}?mode=ro", uri=True)
        self.conn.row_factory = sqlite3.Row

    def stats(self) -> dict:
        """Return library statistics."""
        c = self.conn.cursor()
        c.execute("SELECT COUNT(*) FROM items WHERE itemTypeID IS NOT NULL")
        total = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM collections")
        collections = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM itemAttachments")
        attachments = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM itemNotes")
        notes = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM itemAnnotations")
        annotations = c.fetchone()[0]
        c.execute("SELECT COUNT(DISTINCT tagID) FROM itemTags")
        tags = c.fetchone()[0]
        c.execute("""
            SELECT it.typeName, COUNT(*) as cnt
            FROM items i
            JOIN itemTypes it ON i.itemTypeID = it.itemTypeID
            WHERE i.itemTypeID IS NOT NULL
            GROUP BY it.typeName ORDER BY cnt DESC
        """)
        type_counts = {row["typeName"]: row["cnt"] for row in c.fetchall()}
        return {
            "total_items": total,
            "collections": collections,
            "attachments": attachments,
            "notes": notes,
            "annotations": annotations,
            "unique_tags": tags,
            "type_distribution": type_counts,
        }

    def search(self, query: str, limit: int = 20, offset: int = 0) -> list[dict]:
        """Search in title, abstract, creators. Returns results sorted by dateAdded desc."""
        like = f"%{query}%"
        c = self.conn.cursor()
        c.execute("""
            SELECT DISTINCT i.itemID, i.key, i.dateAdded, i.dateModified,
                   it.typeName,
                   (SELECT idv.value FROM itemData id
                    JOIN itemDataValues idv ON id.valueID = idv.valueID
                    JOIN fields f ON id.fieldID = f.fieldID
                    WHERE id.itemID = i.itemID AND f.fieldName = 'title') as title,
                   (SELECT idv.value FROM itemData id
                    JOIN itemDataValues idv ON id.valueID = idv.valueID
                    JOIN fields f ON id.fieldID = f.fieldID
                    WHERE id.itemID = i.itemID
                    AND f.fieldName = 'abstractNote') as abstract
            FROM items i
            JOIN itemTypes it ON i.itemTypeID = it.itemTypeID
            WHERE i.itemID IN (
                SELECT id.itemID FROM itemData id
                JOIN itemDataValues idv ON id.valueID = idv.valueID
                JOIN fields f ON id.fieldID = f.fieldID
                WHERE (f.fieldName IN ('title','abstractNote') AND idv.value LIKE ?)
                UNION
                SELECT ic.itemID FROM itemCreators ic
                JOIN creators c2 ON ic.creatorID = c2.creatorID
                WHERE c2.firstName LIKE ? OR c2.lastName LIKE ?
            )
            ORDER BY i.dateAdded DESC
            LIMIT ? OFFSET ?
        """, (like, like, like, limit, offset))
        return [dict(r) for r in c.fetchall()]

    def get_item(self, zotero_key: str) -> dict | None:
        """Get full item info by Zotero key (includes creators, fields, tags, collections)."""
        c = self.conn.cursor()
        c.execute("""
            SELECT i.*, it.typeName FROM items i
            JOIN itemTypes it ON i.itemTypeID = it.itemTypeID
            WHERE i.key = ?
        """, (zotero_key,))
        row = c.fetchone()
        if not row:
            return None
        item = dict(row)
        item["creators"] = self._get_creators(item["itemID"])
        item["fields"] = self._get_fields(item["itemID"])
        item["tags"] = self._get_tags(item["itemID"])
        item["collections"] = self._get_item_collections(item["itemID"])
        return item

    def list_collections(self) -> list[dict]:
        """List all collections with item counts."""
        c = self.conn.cursor()
        c.execute("""
            SELECT c.*,
                   (SELECT COUNT(*) FROM collectionItems ci
                    WHERE ci.collectionID = c.collectionID) as item_count
            FROM collections c ORDER BY c.collectionName
        """)
        return [dict(r) for r in c.fetchall()]

    def get_collection_items(self, collection_id: int) -> list[dict]:
        """Get all item titles in a collection."""
        c = self.conn.cursor()
        c.execute("""
            SELECT i.itemID, i.key, i.dateAdded, it.typeName,
                   (SELECT idv.value FROM itemData id
                    JOIN itemDataValues idv ON id.valueID = idv.valueID
                    JOIN fields f ON id.fieldID = f.fieldID
                    WHERE id.itemID = i.itemID AND f.fieldName = 'title') as title
            FROM collectionItems ci
            JOIN items i ON ci.itemID = i.itemID
            JOIN itemTypes it ON i.itemTypeID = it.itemTypeID
            WHERE ci.collectionID = ?
            ORDER BY ci.orderIndex
        """, (collection_id,))
        return [dict(r) for r in c.fetchall()]

    def get_annotations(self, zotero_key: str) -> list[dict]:
        """Get PDF annotations for an item."""
        item = self.get_item(zotero_key)
        if not item:
            return []
        c = self.conn.cursor()
        c.execute("""
            SELECT * FROM itemAnnotations
            WHERE parentItemID = ? ORDER BY sortIndex
        """, (item["itemID"],))
        return [dict(r) for r in c.fetchall()]

    def get_notes(self, zotero_key: str) -> list[dict]:
        """Get Zotero notes for an item."""
        item = self.get_item(zotero_key)
        if not item:
            return []
        c = self.conn.cursor()
        c.execute("""
            SELECT itemID, parentItemID, note, title
            FROM itemNotes WHERE parentItemID = ?
        """, (item["itemID"],))
        return [dict(r) for r in c.fetchall()]

    def get_attachments(self, zotero_key: str) -> list[dict]:
        """Get attachment list for an item."""
        item = self.get_item(zotero_key)
        if not item:
            return []
        c = self.conn.cursor()
        c.execute("""
            SELECT itemID, parentItemID, contentType, path, linkMode
            FROM itemAttachments WHERE parentItemID = ?
        """, (item["itemID"],))
        return [dict(r) for r in c.fetchall()]

    def get_pdf_path(self, zotero_key: str) -> str | None:
        """Get filesystem path of PDF attachment. Respects ZOTERO_DATA env var."""
        zotero_data = os.environ.get(
            "ZOTERO_DATA",
            os.path.dirname(self.db_path)
        )
        for att in self.get_attachments(zotero_key):
            if att.get("contentType") == "application/pdf" and att.get("path"):
                path = att["path"]
                if path.startswith("storage:"):
                    rel = path.replace("storage:", "storage/", 1)
                    return os.path.join(zotero_data, rel)
                return path
        return None

    def get_recent(self, limit: int = 20) -> list[dict]:
        """Get recently added items (bibliographic types only)."""
        c = self.conn.cursor()
        c.execute("""
            SELECT i.itemID, i.key, i.dateAdded, it.typeName,
                   (SELECT idv.value FROM itemData id
                    JOIN itemDataValues idv ON id.valueID = idv.valueID
                    JOIN fields f ON id.fieldID = f.fieldID
                    WHERE id.itemID = i.itemID AND f.fieldName = 'title') as title
            FROM items i
            JOIN itemTypes it ON i.itemTypeID = it.itemTypeID
            WHERE it.typeName IN ('journalArticle','conferencePaper','preprint',
                                  'thesis','book','bookSection','report','webpage',
                                  'patent','presentation','blogPost')
            ORDER BY i.dateAdded DESC LIMIT ?
        """, (limit,))
        return [dict(r) for r in c.fetchall()]

    # ─── Internal helpers ─────────────────────────────────

    def _get_creators(self, item_id: int) -> list[dict]:
        c = self.conn.cursor()
        c.execute("""
            SELECT c.firstName, c.lastName, ct.creatorType
            FROM itemCreators ic
            JOIN creators c ON ic.creatorID = c.creatorID
            JOIN creatorTypes ct ON ic.creatorTypeID = ct.creatorTypeID
            WHERE ic.itemID = ? ORDER BY ic.orderIndex
        """, (item_id,))
        return [dict(r) for r in c.fetchall()]

    def _get_fields(self, item_id: int) -> dict:
        c = self.conn.cursor()
        c.execute("""
            SELECT f.fieldName, idv.value
            FROM itemData id
            JOIN fields f ON id.fieldID = f.fieldID
            JOIN itemDataValues idv ON id.valueID = idv.valueID
            WHERE id.itemID = ?
        """, (item_id,))
        return {r["fieldName"]: r["value"] for r in c.fetchall()}

    def _get_tags(self, item_id: int) -> list[str]:
        c = self.conn.cursor()
        c.execute("""
            SELECT t.name FROM itemTags it
            JOIN tags t ON it.tagID = t.tagID
            WHERE it.itemID = ?
        """, (item_id,))
        return [r["name"] for r in c.fetchall()]

    def _get_item_collections(self, item_id: int) -> list[str]:
        c = self.conn.cursor()
        c.execute("""
            SELECT c.collectionName FROM collectionItems ci
            JOIN collections c ON ci.collectionID = c.collectionID
            WHERE ci.itemID = ?
        """, (item_id,))
        return [r["collectionName"] for r in c.fetchall()]


# ─── CLI ─────────────────────────────────────────

if __name__ == "__main__":
    import sys
    zb = ZoteroBridge()

    if len(sys.argv) < 2:
        print("Usage: python zotero_bridge.py <command> [args]")
        print("  stats                  — library statistics")
        print("  search <query>         — search")
        print("  item <key>             — get item details")
        print("  collections            — list collections")
        print("  collection <id>        — list collection items")
        print("  recent [N]             — recently added items")
        print("  annotations <key>      — get annotations")
        print("  notes <key>            — get notes")
        print("  attachments <key>      — get attachments")
        print("  pdf <key>              — get PDF path")
        sys.exit(0)

    cmd = sys.argv[1]
    try:
        if cmd == "stats":
            print(json.dumps(zb.stats(), indent=2, ensure_ascii=False))
        elif cmd == "search":
            results = zb.search(" ".join(sys.argv[2:]))
            print(json.dumps(results, indent=2, ensure_ascii=False))
        elif cmd == "item":
            print(json.dumps(zb.get_item(sys.argv[2]),
                             indent=2, ensure_ascii=False, default=str))
        elif cmd == "collections":
            print(json.dumps(zb.list_collections(),
                             indent=2, ensure_ascii=False))
        elif cmd == "collection":
            print(json.dumps(zb.get_collection_items(int(sys.argv[2])),
                             indent=2, ensure_ascii=False))
        elif cmd == "recent":
            n = int(sys.argv[2]) if len(sys.argv) > 2 else 20
            print(json.dumps(zb.get_recent(n),
                             indent=2, ensure_ascii=False))
        elif cmd == "annotations":
            print(json.dumps(zb.get_annotations(sys.argv[2]),
                             indent=2, ensure_ascii=False))
        elif cmd == "notes":
            print(json.dumps(zb.get_notes(sys.argv[2]),
                             indent=2, ensure_ascii=False))
        elif cmd == "attachments":
            print(json.dumps(zb.get_attachments(sys.argv[2]),
                             indent=2, ensure_ascii=False))
        elif cmd == "pdf":
            print(zb.get_pdf_path(sys.argv[2]))
        else:
            print(f"Unknown command: {cmd}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
