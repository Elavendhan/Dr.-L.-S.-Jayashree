import os
import re
import json
import urllib.request
import urllib.error
from datetime import datetime

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
json_path = os.path.join(base_dir, "social_analytics.json")
html_path = os.path.join(base_dir, "index.html")

print("--- Social Media Summary & Analytics Synchronizer ---")

# 1. Load current analytics
if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
else:
    data = {
        "last_updated": "20th October 2026",
        "last_updated_iso": "2026-10-20",
        "award": {
            "title": "Google Cloud credits",
            "amount": "$30,000",
            "program": "Google's Gemini Academic Research Program",
            "focus": "Responsible AI models for healthcare applications",
            "recipient": "Dr. L. S. Jayashree"
        },
        "platforms": {
            "instagram": {
                "platform": "Instagram",
                "url": "https://www.instagram.com/p/DeY1i19D2iN/?vrfl=cGtkbnpqM3o2YzBy",
                "likes": 8010,
                "likes_display": "8,010",
                "comments": 791,
                "reposts": 37,
                "metrics_summary": "8,010 likes · 791 comments · 37 reposts"
            },
            "facebook": {
                "platform": "Facebook",
                "url": "https://www.facebook.com/share/p/1DVjWSDeNN/",
                "reactions": 5000,
                "reactions_display": "5K+",
                "comments": 742,
                "shares": 177,
                "metrics_summary": "5,000+ reactions · 742 comments · 177 shares"
            },
            "linkedin": {
                "platform": "LinkedIn",
                "url": "https://www.linkedin.com/posts/psgandsonscharities-psgcollegeoftechnology-share-7515330083641888769-mc-k/",
                "reactions": 1681,
                "reactions_display": "1,681+",
                "comments": 97,
                "reposts": 6,
                "followers": 13435,
                "metrics_summary": "1,681+ reactions · 97 comments · 6 reposts · 13,435 followers*"
            }
        }
    }

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
}

# 2. Check LinkedIn public metrics
li_url = data["platforms"]["linkedin"]["url"]
print(f"Checking LinkedIn public metrics: {li_url} ...")
try:
    req = urllib.request.Request(li_url, headers=headers)
    with urllib.request.urlopen(req, timeout=12) as response:
        content = response.read().decode('utf-8', errors='ignore')
        # Check comment count in description
        c_match = re.search(r'\|\s*(\d[\d,]*)\s*comments', content, re.IGNORECASE)
        if c_match:
            comm_cnt = int(c_match.group(1).replace(',', ''))
            data["platforms"]["linkedin"]["comments"] = comm_cnt
            print(f"  Live LinkedIn comments: {comm_cnt}")
        
        # Check reaction count in text
        r_match = re.search(r'([\d,]+)\s*reactions', content, re.IGNORECASE)
        if r_match:
            r_cnt = int(r_match.group(1).replace(',', ''))
            data["platforms"]["linkedin"]["reactions"] = r_cnt
            data["platforms"]["linkedin"]["reactions_display"] = f"{r_cnt:,}+"
            print(f"  Live LinkedIn reactions: {r_cnt}")
except Exception as e:
    print(f"  Notice: LinkedIn live check ({e}). Using verified fallback figures.")

# 3. Check Instagram public metrics
ig_url = data["platforms"]["instagram"]["url"]
print(f"Checking Instagram public metrics: {ig_url} ...")
try:
    req = urllib.request.Request(ig_url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        content = response.read().decode('utf-8', errors='ignore')
        likes_match = re.search(r'([\d,]+)\s*likes', content, re.IGNORECASE)
        comments_match = re.search(r'([\d,]+)\s*comments', content, re.IGNORECASE)
        if likes_match:
            l_cnt = int(likes_match.group(1).replace(',', ''))
            data["platforms"]["instagram"]["likes"] = l_cnt
            data["platforms"]["instagram"]["likes_display"] = f"{l_cnt:,}"
            print(f"  Live Instagram likes: {l_cnt}")
        if comments_match:
            data["platforms"]["instagram"]["comments"] = int(comments_match.group(1).replace(',', ''))
except Exception as e:
    print(f"  Notice: Instagram live check ({e}). Using verified fallback figures.")

# 4. Check Facebook public metrics
fb_url = data["platforms"]["facebook"]["url"]
print(f"Checking Facebook public metrics: {fb_url} ...")
try:
    req = urllib.request.Request(fb_url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        content = response.read().decode('utf-8', errors='ignore')
        reactions_match = re.search(r'([\d,]+)\s*(?:reactions|likes)', content, re.IGNORECASE)
        if reactions_match:
            print(f"  Live Facebook reactions match: {reactions_match.group(1)}")
except Exception as e:
    print(f"  Notice: Facebook live check ({e}). Using verified fallback figures.")

# Update summaries
ig = data["platforms"]["instagram"]
data["platforms"]["instagram"]["metrics_summary"] = f"{ig['likes_display']} likes · {ig['comments']} comments · {ig.get('reposts', 37)} reposts"

fb = data["platforms"]["facebook"]
data["platforms"]["facebook"]["metrics_summary"] = f"{fb['reactions_display']} reactions · {fb['comments']} comments · {fb.get('shares', 177)} shares"

li = data["platforms"]["linkedin"]
data["platforms"]["linkedin"]["metrics_summary"] = f"{li['reactions_display']} reactions · {li['comments']} comments · {li.get('reposts', 6)} reposts · {li.get('followers', 13435):,} followers*"

# Save updated json
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
print("Updated social_analytics.json successfully.")

# 5. Synchronize index.html
if os.path.exists(html_path):
    with open(html_path, "r", encoding="utf-8", newline="") as f:
        html = f.read()

    # Update date badge
    html = re.sub(
        r'(id="social-sync-date"[^>]*>)[^<]+(</span>)',
        rf'\g<1>{data["last_updated"]}\g<2>',
        html
    )

    # Update Instagram numbers
    html = re.sub(
        r'(id="social-ig-likes"[^>]*>)[^<]+(</span>)',
        rf'\g<1>{ig["likes_display"]}\g<2>',
        html
    )
    html = re.sub(
        r'(id="social-ig-sub"[^>]*>)[^<]+(</span>)',
        rf'\g<1>{ig["comments"]} comments · {ig.get("reposts", 37)} reposts\g<2>',
        html
    )

    # Update Facebook numbers
    html = re.sub(
        r'(id="social-fb-reactions"[^>]*>)[^<]+(</span>)',
        rf'\g<1>{fb["reactions_display"]}\g<2>',
        html
    )
    html = re.sub(
        r'(id="social-fb-sub"[^>]*>)[^<]+(</span>)',
        rf'\g<1>{fb["comments"]} comments · {fb.get("shares", 177)} shares\g<2>',
        html
    )

    # Update LinkedIn numbers
    html = re.sub(
        r'(id="social-li-reactions"[^>]*>)[^<]+(</span>)',
        rf'\g<1>{li["reactions_display"]}\g<2>',
        html
    )
    html = re.sub(
        r'(id="social-li-sub"[^>]*>)[^<]+(</span>)',
        rf'\g<1>{li["comments"]} comments · {li.get("followers", 13435):,} followers*\g<2>',
        html
    )

    # Update Modal Button Stats
    html = re.sub(
        r'(id="modal-social-li"[^>]*>)[^<]+(</strong>)',
        rf'\g<1>{li["reactions_display"]}\g<2>',
        html
    )
    html = re.sub(
        r'(id="modal-social-fb"[^>]*>)[^<]+(</strong>)',
        rf'\g<1>{fb["reactions_display"]}\g<2>',
        html
    )
    html = re.sub(
        r'(id="modal-social-ig"[^>]*>)[^<]+(</strong>)',
        rf'\g<1>{ig["likes_display"]}\g<2>',
        html
    )

    with open(html_path, "w", encoding="utf-8", newline="") as f:
        f.write(html)
    print("Updated index.html social media analytics numbers and date stamp successfully!")

print("--- Social Analytics Synchronization Complete ---")
