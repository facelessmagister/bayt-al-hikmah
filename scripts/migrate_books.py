#!/usr/bin/env python3
"""
Migrate all books from existing sources into Bayt al-Hikmah content structure.

Sources:
  1. Ikhwan Library EN chapters: /root/projects/ikhwan-library/content/books/
  2. Fathi Yakan AR chapters: /root/tarbiyyah/fathi-yakan-intimai/translation/chapters_ar/
  3. Said Hawwa AR chapters: /root/projects/ikhwan-library/_work/our-spiritual-education/chapters-arabic/
  4. How to Call to Islam AR: /root/projects/ikhwan-library/_work/how-to-call-to-islam/chapters-arabic/
  5. Qaradawi EN text: /root/projects/qaradawi-pub/content/raw/
  6. Jeel Mawoud AR: /root/tarbiyyah/jeel-mawoud-wiki/raw/extracted/chapters/
  7. Jeel Mawoud EN: /root/tarbiyyah/jeel-mawoud-wiki/english-translation/

Output: /root/projects/bayt-al-hikmah/content/books/[slug]/{en,ar}/
"""

import os
import shutil
import re
from pathlib import Path

BASE = Path("/root/projects/bayt-al-hikmah/content/books")

def ensure_dir(path):
    path.mkdir(parents=True, exist_ok=True)
    return path

def copy_file_as_md(src, dst):
    """Copy a .txt or .md file to dst as .md, adding frontmatter if missing."""
    if not src.exists():
        print(f"  SKIP (not found): {src}")
        return
    content = src.read_text(encoding="utf-8", errors="replace")
    # If it's already markdown with frontmatter, keep as-is
    if not content.startswith("---"):
        # Add minimal frontmatter
        content = f"---\n---\n\n{content}"
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(content, encoding="utf-8")
    print(f"  OK: {dst}")

def migrate_ikhwan_en():
    """Migrate EN chapters from Ikhwan Library."""
    print("\n=== Migrating Ikhwan Library EN chapters ===")
    
    # Book 1: What My Belonging to Islam Means
    src = Path("/root/projects/ikhwan-library/content/books/what-my-belonging-to-islam-means/chapters")
    dst = BASE / "what-my-belonging-to-islam-means" / "en"
    if src.exists():
        for f in sorted(src.glob("*.md")):
            copy_file_as_md(f, dst / f.name)
    
    # Book 2: Our Spiritual Education
    src = Path("/root/projects/ikhwan-library/content/books/our-spiritual-education/chapters")
    dst = BASE / "our-spiritual-education" / "en"
    if src.exists():
        for f in sorted(src.glob("*.md")):
            copy_file_as_md(f, dst / f.name)

def migrate_fathi_yakan_ar():
    """Migrate Fathi Yakan Arabic chapters."""
    print("\n=== Migrating Fathi Yakan AR chapters ===")
    src = Path("/root/tarbiyyah/fathi-yakan-intimai/translation/chapters_ar")
    dst = BASE / "what-my-belonging-to-islam-means" / "ar"
    if src.exists():
        for f in sorted(src.glob("*.txt")):
            # Convert to .md
            content = f.read_text(encoding="utf-8", errors="replace")
            md_name = f.stem + ".md"
            md_content = f"---\n---\n\n{content}"
            (dst).mkdir(parents=True, exist_ok=True)
            (dst / md_name).write_text(md_content, encoding="utf-8")
            print(f"  OK: {dst / md_name}")

def migrate_said_hawwa_ar():
    """Migrate Said Hawwa Arabic chapters."""
    print("\n=== Migrating Said Hawwa AR chapters ===")
    src = Path("/root/projects/ikhwan-library/_work/our-spiritual-education/chapters-arabic")
    dst = BASE / "our-spiritual-education" / "ar"
    if src.exists():
        for f in sorted(src.glob("*.txt")):
            content = f.read_text(encoding="utf-8", errors="replace")
            md_name = f.stem + ".md"
            md_content = f"---\n---\n\n{content}"
            dst.mkdir(parents=True, exist_ok=True)
            (dst / md_name).write_text(md_content, encoding="utf-8")
            print(f"  OK: {dst / md_name}")

def migrate_how_to_call_ar():
    """Migrate How to Call to Islam Arabic chapters."""
    print("\n=== Migrating How to Call to Islam AR chapters ===")
    src = Path("/root/projects/ikhwan-library/_work/how-to-call-to-islam/chapters-arabic")
    dst = BASE / "how-to-call-to-islam" / "ar"
    if src.exists():
        for f in sorted(src.glob("*.txt")):
            content = f.read_text(encoding="utf-8", errors="replace")
            md_name = f.stem + ".md"
            md_content = f"---\n---\n\n{content}"
            dst.mkdir(parents=True, exist_ok=True)
            (dst / md_name).write_text(md_content, encoding="utf-8")
            print(f"  OK: {dst / md_name}")

def migrate_qaradawi_en():
    """Migrate Qaradawi books from qaradawi-pub."""
    print("\n=== Migrating Qaradawi EN chapters ===")
    src_base = Path("/root/projects/qaradawi-pub/content/raw")
    
    book_slugs = [
        "halal-haram", "fiqh-al-zakah", "approaching-the-sunnah",
        "economic-security", "ethics-in-islam", "education-economy-sunnah",
        "diversion-arts", "faith-and-life", "auspices-victory",
    ]
    
    for slug in book_slugs:
        src_dir = src_base / slug
        if not src_dir.exists():
            print(f"  SKIP (dir not found): {slug}")
            continue
        
        dst_dir = BASE / slug / "en"
        dst_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy chapter files (ch-XX.txt → ch-XX.md)
        for f in sorted(src_dir.glob("ch-*.txt")):
            content = f.read_text(encoding="utf-8", errors="replace")
            md_name = f.stem + ".md"
            md_content = f"---\n---\n\n{content}"
            (dst_dir / md_name).write_text(md_content, encoding="utf-8")
            print(f"  OK: {slug}/{md_name}")

def migrate_jeel_mawoud():
    """Migrate Jeel Mawoud (The Promised Generation)."""
    print("\n=== Migrating Jeel Mawoud AR ===")
    
    # Arabic
    src_ar = Path("/root/tarbiyyah/jeel-mawoud-wiki/raw/extracted/chapters")
    dst_ar = BASE / "the-promised-generation" / "ar"
    if src_ar.exists():
        for f in sorted(src_ar.glob("*.txt")):
            content = f.read_text(encoding="utf-8", errors="replace")
            md_name = f.stem + ".md"
            md_content = f"---\n---\n\n{content}"
            dst_ar.mkdir(parents=True, exist_ok=True)
            (dst_ar / md_name).write_text(md_content, encoding="utf-8")
            print(f"  OK AR: {md_name}")
    
    print("\n=== Migrating Jeel Mawoud EN (partial) ===")
    # English (chapters 1-3 only)
    en_base = Path("/root/tarbiyyah/jeel-mawoud-wiki/english-translation")
    dst_en = BASE / "the-promised-generation" / "en"
    dst_en.mkdir(parents=True, exist_ok=True)
    
    # Chapter 1
    ch1 = en_base / "ch01-why-the-promised-generation" / "ch01-english-only.md"
    if ch1.exists():
        content = ch1.read_text(encoding="utf-8", errors="replace")
        (dst_en / "ch-01-limadha.md").write_text(content, encoding="utf-8")
        print(f"  OK EN: ch-01-limadha.md")
    
    # Chapter 2
    ch2 = en_base / "ch02-with-the-attributes" / "ch02-english-only.md"
    if ch2.exists():
        content = ch2.read_text(encoding="utf-8", errors="replace")
        (dst_en / "ch-02-sifat.md").write_text(content, encoding="utf-8")
        print(f"  OK EN: ch-02-sifat.md")
    
    # Chapter 3
    ch3 = en_base / "ch03-how-attributes-realized" / "ch03-english-only.md"
    if ch3.exists():
        content = ch3.read_text(encoding="utf-8", errors="replace")
        (dst_en / "ch-03-kayfa.md").write_text(content, encoding="utf-8")
        print(f"  OK EN: ch-03-kayfa.md")

def main():
    print("Bayt al-Hikmah — Book Migration")
    print("=" * 50)
    
    ensure_dir(BASE)
    
    migrate_ikhwan_en()
    migrate_fathi_yakan_ar()
    migrate_said_hawwa_ar()
    migrate_how_to_call_ar()
    migrate_qaradawi_en()
    migrate_jeel_mawoud()
    
    print("\n" + "=" * 50)
    
    # Summary
    total_files = 0
    for book_dir in sorted(BASE.iterdir()):
        if not book_dir.is_dir():
            continue
        for lang_dir in sorted(book_dir.iterdir()):
            if not lang_dir.is_dir():
                continue
            count = len(list(lang_dir.glob("*.md")))
            total_files += count
            print(f"  {book_dir.name}/{lang_dir.name}: {count} chapters")
    
    print(f"\nTotal: {total_files} chapter files migrated")

if __name__ == "__main__":
    main()