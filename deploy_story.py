"""
每天執行一次：從 queue/ 取出最舊的一篇故事，
複製到 stories/，並更新 index.html。
由 GitHub Actions 的 daily-story.yml 呼叫。
"""

import json
import re
import sys
from pathlib import Path


def main():
    queue_dir = Path("queue")
    stories_dir = Path("stories")

    html_files = sorted(queue_dir.glob("*.html"))
    if not html_files:
        print("✅ queue/ 已空，沒有新故事可發布。")
        sys.exit(0)

    html_file = html_files[0]
    content = html_file.read_text(encoding="utf-8")

    # 從 HTML 注釋讀取 metadata
    meta_match = re.search(r"<!--QUEUE_META:(.*?)-->", content, re.DOTALL)
    if not meta_match:
        print(f"⚠️  找不到 QUEUE_META：{html_file.name}，跳過。")
        sys.exit(1)

    data = json.loads(meta_match.group(1))
    slug     = data["slug"]
    title    = data["title"]
    badge    = data["badge"]
    symbol   = data["symbol"]
    gradient = data["gradient"]
    location = data["location"]
    date_str = data["date_str"]
    excerpt  = data["excerpt"]

    # 移除 metadata 注釋，寫入 stories/
    clean_html = content.replace(meta_match.group(0), "", 1)
    dest = stories_dir / f"{slug}.html"
    dest.write_text(clean_html, encoding="utf-8")
    html_file.unlink()

    # 更新 index.html
    story_count = len(list(stories_dir.glob("*.html")))

    new_card = f"""
    <a href="stories/{slug}.html" class="story-card">
      <div class="card-visual">
        <div class="card-visual-inner" style="background:{gradient};"></div>
        <span class="card-symbol">{symbol}</span>
        <span class="card-badge">{badge}</span>
      </div>
      <div class="card-body">
        <div class="card-meta"><span>📍 {location}</span><span>📅 {date_str}</span></div>
        <h2 class="card-title">{title}</h2>
        <p class="card-excerpt">{excerpt}</p>
        <div class="card-footer"><span class="read-more">閱讀全文</span></div>
      </div>
    </a>

    """

    index_path = Path("index.html")
    index = index_path.read_text(encoding="utf-8")
    index = index.replace("<!-- STORIES_END -->", new_card + "<!-- STORIES_END -->")
    index = re.sub(r"<span>\d+</span> 則奇案", f"<span>{story_count}</span> 則奇案", index)
    index = re.sub(
        r"\d+ 則真實存在、令人拍案的世界奇事",
        f"{story_count} 則真實存在、令人拍案的世界奇事",
        index,
    )
    index_path.write_text(index, encoding="utf-8")

    remaining = len(list(queue_dir.glob("*.html")))
    print(f"✅ 發布：{slug} — {title}（共 {story_count} 篇，queue 剩 {remaining} 篇）")


if __name__ == "__main__":
    main()
