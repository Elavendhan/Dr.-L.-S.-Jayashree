"""
patch_portfolio.py
==================
Makes the following changes to the Portfolio website:

1. Adds GCP Gemini Academic Research Programme USD 30,000 award to the
   highlights ticker (front of the list + duplicate for loop scroll).

2. Inserts a GCP Award Announcement card/banner just below the hero profile
   section on the home page (before the about-analytics-grid).

3. Updates the hardcoded Cited-by table values (citations/h-index/i10-index)
   with the latest figures scraped from the Google Scholar meta description
   or falls back to known-good values.

4. Updates the GitHub Actions workflow to:
   - Also commit index.html when citation data changes
   - Run daily at midnight UTC instead of weekly

Run this script from the repo root:
    python scripts/patch_portfolio.py
"""

import os
import re
import json
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_HTML = os.path.join(BASE_DIR, "index.html")
WORKFLOW_YML = os.path.join(BASE_DIR, ".github", "workflows", "sync_publications.yml")

# ──────────────────────────────────────────────────────────────────────────────
# 1. Load index.html (preserve CRLF)
# ──────────────────────────────────────────────────────────────────────────────
with open(INDEX_HTML, "r", encoding="utf-8") as f:
    html = f.read()

original_html = html
print(f"Loaded index.html ({len(html):,} bytes)")

# ──────────────────────────────────────────────────────────────────────────────
# 2. Fetch live citation metrics from Google Scholar
# ──────────────────────────────────────────────────────────────────────────────
SCHOLAR_URL = "https://scholar.google.com/citations?user=mmNPmLoAAAAJ&hl=en"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# Current known-good fallback values
fallback = {
    "citations_all": 800,
    "citations_since": 452,
    "h_all": 12,
    "h_since": 10,
    "i10_all": 14,
    "i10_since": 12,
    "year_bars": {
        "2019": 62, "2020": 76, "2021": 82,
        "2022": 104, "2023": 80, "2024": 74,
        "2025": 62, "2026": 36,
    }
}

metrics = dict(fallback)
scholar_html = ""

try:
    req = urllib.request.Request(SCHOLAR_URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        scholar_html = resp.read().decode("utf-8", errors="replace")

    desc_m = re.search(r'Cited by (\d+)', scholar_html)
    if desc_m:
        metrics["citations_all"] = int(desc_m.group(1))
        print(f"  Live total citations: {metrics['citations_all']}")

    cit_m = re.search(
        r'Citations\s*</a>\s*</td>\s*<td[^>]*>(\d+)</td>\s*<td[^>]*>(\d+)</td>',
        scholar_html, re.DOTALL
    )
    if cit_m:
        metrics["citations_all"]   = int(cit_m.group(1))
        metrics["citations_since"] = int(cit_m.group(2))
        print(f"  Live citations: {metrics['citations_all']} / {metrics['citations_since']}")

    h_m = re.search(
        r'h-index\s*</a>\s*</td>\s*<td[^>]*>(\d+)</td>\s*<td[^>]*>(\d+)</td>',
        scholar_html, re.DOTALL
    )
    if h_m:
        metrics["h_all"]   = int(h_m.group(1))
        metrics["h_since"] = int(h_m.group(2))
        print(f"  Live h-index: {metrics['h_all']} / {metrics['h_since']}")

    i10_m = re.search(
        r'i10-index\s*</a>\s*</td>\s*<td[^>]*>(\d+)</td>\s*<td[^>]*>(\d+)</td>',
        scholar_html, re.DOTALL
    )
    if i10_m:
        metrics["i10_all"]   = int(i10_m.group(1))
        metrics["i10_since"] = int(i10_m.group(2))
        print(f"  Live i10-index: {metrics['i10_all']} / {metrics['i10_since']}")

    bar_matches = re.findall(
        r'<span class="gsc_g_t"[^>]*>(\d{4})</span>.*?<span class="gsc_g_al">(\d+)</span>',
        scholar_html, re.DOTALL
    )
    if len(bar_matches) >= 4:
        metrics["year_bars"] = {y: int(c) for y, c in bar_matches}
        print(f"  Live year bars: {metrics['year_bars']}")

except Exception as e:
    print(f"Scholar fetch failed ({e}), using fallback values.")

print(f"\nFinal metrics: {json.dumps(metrics, indent=2)}")

# ──────────────────────────────────────────────────────────────────────────────
# 3. Update the Cited-by table in index.html
# ──────────────────────────────────────────────────────────────────────────────
def update_citation_table(content, metrics):
    # Replace Citations row
    content = re.sub(
        r'(<td>Citations</td>\s*<td[^>]*>)\d+(</td>\s*<td[^>]*>)\d+(</td>)',
        lambda m: f"{m.group(1)}{metrics['citations_all']}{m.group(2)}{metrics['citations_since']}{m.group(3)}",
        content, count=1, flags=re.DOTALL
    )
    # Replace h-index row
    content = re.sub(
        r'(<td>h-index</td>\s*<td[^>]*>)\d+(</td>\s*<td[^>]*>)\d+(</td>)',
        lambda m: f"{m.group(1)}{metrics['h_all']}{m.group(2)}{metrics['h_since']}{m.group(3)}",
        content, count=1, flags=re.DOTALL
    )
    # Replace i10-index row
    content = re.sub(
        r'(<td>i10-index</td>\s*<td[^>]*>)\d+(</td>\s*<td[^>]*>)\d+(</td>)',
        lambda m: f"{m.group(1)}{metrics['i10_all']}{m.group(2)}{metrics['i10_since']}{m.group(3)}",
        content, count=1, flags=re.DOTALL
    )
    return content

html = update_citation_table(html, metrics)
print("✅ Updated Cited-by table values.")

# ──────────────────────────────────────────────────────────────────────────────
# 4. Update the chart Y-axis max label and bar heights
# ──────────────────────────────────────────────────────────────────────────────
year_bars = metrics["year_bars"]
if year_bars:
    max_val   = max(year_bars.values())
    chart_max = (max_val // 20 + 1) * 20
    mid_val   = chart_max // 2

    # Update y-axis labels
    html = re.sub(
        r'(<div class="chart-y-axis">.*?<span>)\d+(</span>.*?<span>)\d+(</span>.*?<span>0</span>.*?</div>)',
        lambda m: f'{m.group(1)}{chart_max}{m.group(2)}{mid_val}{m.group(3)}',
        html, count=1, flags=re.DOTALL
    )

    # Rebuild bar columns
    bar_cols_html = ""
    for year in sorted(year_bars.keys()):
        val = year_bars[year]
        pct = round((val / chart_max) * 100, 1)
        bar_cols_html += (
            f'\r\n                                        <div class="chart-bar-col">'
            f'\r\n                                            <div class="chart-bar" style="height: {pct}%;" data-val="{val}">'
            f'<span class="bar-tooltip">{val}</span></div>'
            f'\r\n                                            <span class="bar-year" style="font-size: 0.55rem;">{year}</span>'
            f'\r\n                                        </div>'
        )

    html = re.sub(
        r'(<div class="chart-bars">)(.*?)(</div>\s*\r?\n\s*</div>\s*\r?\n\s*</div>\s*\r?\n\s*</div>\s*\r?\n\s*</div>)',
        lambda m: m.group(1) + bar_cols_html + "\r\n                                    " + m.group(3),
        html, count=1, flags=re.DOTALL
    )
    print("✅ Updated citation bar chart.")

# ──────────────────────────────────────────────────────────────────────────────
# 5. Add GCP award to the Highlights Ticker
# ──────────────────────────────────────────────────────────────────────────────
GCP_TICKER = (
    '<a href="#awards" class="ticker-item">'
    '<span class="ticker-icon">\U0001f31f</span>'
    '<span class="ticker-text">PSG CARES Awarded USD 30,000 Cloud Credits from '
    'Gemini Academic Research Programme of Google Inc. USA</span>'
    '</a>'
)

if "Gemini Academic Research Programme" not in html:
    # First set — insert before first ticker-item
    html = re.sub(
        r'(<div class="ticker-track">)',
        r'\1\r\n                    ' + GCP_TICKER,
        html, count=1
    )
    # Duplicate set — insert before the "<!-- Duplicate items" comment's first ticker
    html = re.sub(
        r'(<!-- Duplicate items for loop scroll symmetry -->)',
        r'\1\r\n                    ' + GCP_TICKER,
        html, count=1
    )
    print("✅ Added GCP award to highlights ticker.")
else:
    print("ℹ️  GCP ticker item already present.")

# ──────────────────────────────────────────────────────────────────────────────
# 6. Insert GCP Award Banner / Poster card into the Hero section
#    Placed right before the "about-analytics-grid" div
# ──────────────────────────────────────────────────────────────────────────────
GCP_BANNER = (
    '\r\n                <!-- GCP Gemini Academic Research Programme Award Banner -->'
    '\r\n                <div class="gcp-award-banner reveal-stagger" style="'
    'margin: 30px 0 10px 0; border-radius: 16px; overflow: hidden;'
    ' display: flex; align-items: stretch; gap: 0;'
    ' background: linear-gradient(135deg, #0f2a6b 0%, #1a3fa8 50%, #0d2255 100%);'
    ' border: 1px solid rgba(255,215,0,0.3);'
    ' box-shadow: 0 8px 32px rgba(66,133,244,0.25);">'
    '\r\n                    <!-- Poster Thumbnail -->'
    '\r\n                    <div style="flex-shrink: 0; width: 190px; display: flex;'
    ' align-items: center; justify-content: center; padding: 16px;'
    ' background: rgba(255,255,255,0.04);">'
    '\r\n                        <a href="assets/awards_recognitions/gcp_gemini_award_poster.png" target="_blank" style="display: block;">'
    '\r\n                            <img src="assets/awards_recognitions/gcp_gemini_award_poster.png"'
    '\r\n                                 alt="PSG CARES USD 30,000 GCP Gemini Cloud Credits Poster"'
    '\r\n                                 style="width: 158px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); display: block;"'
    '\r\n                                 loading="lazy">'
    '\r\n                        </a>'
    '\r\n                    </div>'
    '\r\n                    <!-- Text Content -->'
    '\r\n                    <div style="flex: 1; padding: 24px 28px; display: flex; flex-direction: column; justify-content: center; gap: 10px;">'
    '\r\n                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">'
    '\r\n                            <span style="background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.4);'
    ' color: #FFD700; font-size: 0.72rem; font-weight: 800; text-transform: uppercase;'
    ' letter-spacing: 0.08em; padding: 4px 10px; border-radius: 4px;">\U0001f3c5 New Award</span>'
    '\r\n                            <span style="color: rgba(255,255,255,0.5); font-size: 0.72rem;">September 2026</span>'
    '\r\n                        </div>'
    '\r\n                        <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.35rem;'
    ' font-weight: 800; color: #FFFFFF; line-height: 1.3;">'
    'PSG CARES Awarded <span style="color: #FFD700;">USD 30,000</span> Cloud Credits</h3>'
    '\r\n                        <p style="margin: 0; font-size: 0.9rem; color: rgba(255,255,255,0.82); line-height: 1.6;">'
    'Awarded through the <strong style="color: #fff;">Gemini Academic Research Programme</strong> of '
    '<strong style="color: #4285F4;">G</strong><strong style="color: #EA4335;">o</strong>'
    '<strong style="color: #FBBC04;">o</strong><strong style="color: #4285F4;">g</strong>'
    '<strong style="color: #34A853;">l</strong><strong style="color: #EA4335;">e</strong> '
    'Inc. USA &mdash; to advance <strong style="color: #fff;">Responsible AI for Healthcare Applications</strong> '
    'at the DST Centre of Excellence for Assistive Technology (PSG CARES).</p>'
    '\r\n                        <div style="margin-top: 4px;">'
    '\r\n                            <a href="assets/awards_recognitions/gcp_gemini_award_poster.png" target="_blank"'
    '\r\n                               style="display: inline-flex; align-items: center; gap: 6px;'
    ' background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25);'
    ' color: #fff; text-decoration: none; padding: 7px 16px; border-radius: 6px;'
    ' font-size: 0.8rem; font-weight: 600;">'
    '\r\n                                <i class="fa-solid fa-image"></i> View Award Poster'
    '\r\n                            </a>'
    '\r\n                        </div>'
    '\r\n                    </div>'
    '\r\n                </div>'
    '\r\n                <!-- End GCP Award Banner -->\r\n'
)

ANALYTICS_ANCHOR = '<div class="about-analytics-grid">'
if "gcp-award-banner" not in html:
    if ANALYTICS_ANCHOR in html:
        html = html.replace(ANALYTICS_ANCHOR, GCP_BANNER + "                " + ANALYTICS_ANCHOR, 1)
        print("✅ Inserted GCP award banner/poster into hero section.")
    else:
        print("⚠️  Could not find about-analytics-grid anchor — GCP banner not inserted.")
else:
    print("ℹ️  GCP award banner already present.")

# ──────────────────────────────────────────────────────────────────────────────
# 7. Save patched index.html
# ──────────────────────────────────────────────────────────────────────────────
if html != original_html:
    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"\n✅ Saved patched index.html ({len(html):,} bytes)")
else:
    print("\nℹ️  No changes needed — index.html already up to date.")

# ──────────────────────────────────────────────────────────────────────────────
# 8. Update GitHub Actions workflow
# ──────────────────────────────────────────────────────────────────────────────
with open(WORKFLOW_YML, "r", encoding="utf-8") as f:
    yml = f.read()

original_yml = yml

yml = yml.replace("- cron: '0 0 * * 1'", "- cron: '0 0 * * *'")
yml = yml.replace(
    "# Runs automatically every Monday at 00:00 UTC (05:30 AM IST)",
    "# Runs automatically every day at 00:00 UTC (05:30 AM IST)"
)
yml = yml.replace(
    'file_pattern: "publications.json script.js"',
    'file_pattern: "publications.json script.js index.html"'
)
yml = yml.replace(
    'commit_message: "Auto-sync: Update publications from Google Scholar [skip ci]"',
    'commit_message: "Auto-sync: Update publications & citation metrics from Google Scholar [skip ci]"'
)

if yml != original_yml:
    with open(WORKFLOW_YML, "w", encoding="utf-8") as f:
        f.write(yml)
    print("✅ Updated GitHub Actions workflow (daily cron, index.html in commit).")
else:
    print("ℹ️  Workflow already up to date.")

print("\n\U0001f389 All patches applied. Run `git diff` to review, then commit & push.")
