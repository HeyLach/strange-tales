"""
為所有現有故事頁面加入 story-extras.js（閱讀進度條、閱讀時間、回到頂端、繼續探索）
新故事（mandela-effect, piltdown-man, fermi-paradox）已在建立時內建，此腳本處理其餘頁面。
"""
from pathlib import Path

SCRIPT_TAG = '<script src="../story-extras.js"></script>\n'
stories_dir = Path("stories")
updated = 0
skipped = 0

for html_file in sorted(stories_dir.glob("*.html")):
    content = html_file.read_text(encoding="utf-8")
    if 'story-extras.js' in content:
        skipped += 1
        continue
    if '</body>' not in content:
        print(f"[SKIP] no </body>: {html_file.name}")
        skipped += 1
        continue
    content = content.replace('</body>', SCRIPT_TAG + '</body>', 1)
    html_file.write_text(content, encoding="utf-8")
    updated += 1
    print(f"[OK] {html_file.name}")

print(f"\nDone: updated={updated}, skipped={skipped}")
