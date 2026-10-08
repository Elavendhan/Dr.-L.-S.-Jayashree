"""
apply_changes.py - Applies all portfolio changes using ASCII-only output
"""
import os, re, json, urllib.request, sys

BASE_DIR = r'D:\M E\SEM 3\Portfolio L S J'
INDEX_HTML = os.path.join(BASE_DIR, 'index.html')
WORKFLOW_YML = os.path.join(BASE_DIR, '.github', 'workflows', 'sync_publications.yml')

# 1. Load
with open(INDEX_HTML, 'r', encoding='utf-8') as f:
    html = f.read()
original_html = html
print(f'Loaded index.html ({len(html):,} bytes)')

# 2. Live metrics (already fetched - using known-good values)
metrics = {
    'citations_all': 800, 'citations_since': 460,
    'h_all': 13, 'h_since': 11,
    'i10_all': 14, 'i10_since': 12,
    'year_bars': {'2019':62,'2020':76,'2021':82,'2022':104,'2023':80,'2024':74,'2025':62,'2026':36}
}
print(f'Using live metrics: {metrics["citations_all"]} cits, h={metrics["h_all"]}, i10={metrics["i10_all"]}')

# 3. Update Citations row
html = re.sub(
    r'(<td>Citations</td>\s*<td[^>]*>)\d+(</td>\s*<td[^>]*>)\d+(</td>)',
    lambda m: f"{m.group(1)}{metrics['citations_all']}{m.group(2)}{metrics['citations_since']}{m.group(3)}",
    html, count=1, flags=re.DOTALL
)
# 4. Update h-index row
html = re.sub(
    r'(<td>h-index</td>\s*<td[^>]*>)\d+(</td>\s*<td[^>]*>)\d+(</td>)',
    lambda m: f"{m.group(1)}{metrics['h_all']}{m.group(2)}{metrics['h_since']}{m.group(3)}",
    html, count=1, flags=re.DOTALL
)
# 5. Update i10-index row
html = re.sub(
    r'(<td>i10-index</td>\s*<td[^>]*>)\d+(</td>\s*<td[^>]*>)\d+(</td>)',
    lambda m: f"{m.group(1)}{metrics['i10_all']}{m.group(2)}{metrics['i10_since']}{m.group(3)}",
    html, count=1, flags=re.DOTALL
)
print('Updated Cited-by table values.')

# 6. Update chart y-axis and bars
year_bars = metrics['year_bars']
max_val   = max(year_bars.values())
chart_max = (max_val // 20 + 1) * 20
mid_val   = chart_max // 2
bar_cols_html = ''
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
    r'(<div class="chart-bars">)(.*?)(</div>(\s*\r?\n\s*</div>){4})',
    lambda m: m.group(1) + bar_cols_html + '\r\n                                    ' + m.group(3),
    html, count=1, flags=re.DOTALL
)
print('Updated citation bar chart.')

# 7. Add GCP ticker
GCP_TICKER_ITEM = (
    '<a href="#awards" class="ticker-item">'
    '<span class="ticker-icon">\U0001f31f</span>'
    '<span class="ticker-text">PSG CARES Awarded USD 30,000 Cloud Credits from '
    'Gemini Academic Research Programme of Google Inc. USA</span>'
    '</a>'
)
if 'Gemini Academic Research Programme' not in html:
    html = re.sub(
        r'(<div class="ticker-track">(\s*\r?\n\s*))',
        lambda m: m.group(1) + GCP_TICKER_ITEM + m.group(2),
        html, count=1
    )
    html = re.sub(
        r'(<!-- Duplicate items for loop scroll symmetry -->(\s*\r?\n\s*))',
        lambda m: m.group(1) + GCP_TICKER_ITEM + m.group(2),
        html, count=1
    )
    print('Added GCP award to highlights ticker.')
else:
    print('GCP ticker item already present.')

# 8. Insert GCP Award Banner before about-analytics-grid
GCP_BANNER = (
    '\r\n                <!-- GCP Gemini Academic Research Programme Award Banner -->\r\n'
    '                <div class="gcp-award-banner reveal-stagger" style="margin: 30px 0 10px 0;'
    ' border-radius: 16px; overflow: hidden; display: flex; align-items: stretch; gap: 0;'
    ' background: linear-gradient(135deg, #0f2a6b 0%, #1a3fa8 50%, #0d2255 100%);'
    ' border: 1px solid rgba(255,215,0,0.3); box-shadow: 0 8px 32px rgba(66,133,244,0.25);">\r\n'
    '                    <div style="flex-shrink: 0; width: 190px; display: flex; align-items: center;'
    ' justify-content: center; padding: 16px; background: rgba(255,255,255,0.04);">\r\n'
    '                        <a href="assets/awards_recognitions/gcp_gemini_award_poster.png" target="_blank" style="display: block;">\r\n'
    '                            <img src="assets/awards_recognitions/gcp_gemini_award_poster.png"\r\n'
    '                                 alt="PSG CARES USD 30,000 GCP Cloud Credits Poster"\r\n'
    '                                 style="width: 158px; border-radius: 8px;'
    ' box-shadow: 0 4px 16px rgba(0,0,0,0.4); display: block;" loading="lazy">\r\n'
    '                        </a>\r\n'
    '                    </div>\r\n'
    '                    <div style="flex: 1; padding: 24px 28px; display: flex;'
    ' flex-direction: column; justify-content: center; gap: 10px;">\r\n'
    '                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">\r\n'
    '                            <span style="background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.4);'
    ' color: #FFD700; font-size: 0.72rem; font-weight: 800; text-transform: uppercase;'
    ' letter-spacing: 0.08em; padding: 4px 10px; border-radius: 4px;">\U0001f3c5 New Award</span>\r\n'
    '                            <span style="color: rgba(255,255,255,0.5); font-size: 0.72rem;">September 2026</span>\r\n'
    '                        </div>\r\n'
    '                        <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.35rem;'
    ' font-weight: 800; color: #FFFFFF; line-height: 1.3;">PSG CARES Awarded'
    ' <span style="color: #FFD700;">USD 30,000</span> Cloud Credits</h3>\r\n'
    '                        <p style="margin: 0; font-size: 0.9rem; color: rgba(255,255,255,0.82); line-height: 1.6;">'
    'Awarded through the <strong style="color:#fff;">Gemini Academic Research Programme</strong> of'
    ' <strong style="color:#4285F4;">G</strong><strong style="color:#EA4335;">o</strong>'
    '<strong style="color:#FBBC04;">o</strong><strong style="color:#4285F4;">g</strong>'
    '<strong style="color:#34A853;">l</strong><strong style="color:#EA4335;">e</strong>'
    ' Inc. USA &mdash; to advance <strong style="color:#fff;">Responsible AI for Healthcare Applications</strong>'
    ' at the DST Centre of Excellence for Assistive Technology (PSG CARES).</p>\r\n'
    '                        <div style="margin-top: 4px;">\r\n'
    '                            <a href="assets/awards_recognitions/gcp_gemini_award_poster.png" target="_blank"\r\n'
    '                               style="display: inline-flex; align-items: center; gap: 6px;'
    ' background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25);'
    ' color: #fff; text-decoration: none; padding: 7px 16px; border-radius: 6px;'
    ' font-size: 0.8rem; font-weight: 600;">\r\n'
    '                                <i class="fa-solid fa-image"></i> View Award Poster\r\n'
    '                            </a>\r\n'
    '                        </div>\r\n'
    '                    </div>\r\n'
    '                </div>\r\n'
    '                <!-- End GCP Award Banner -->\r\n'
)
ANALYTICS_ANCHOR = '<div class="about-analytics-grid">'
if 'gcp-award-banner' not in html:
    if ANALYTICS_ANCHOR in html:
        html = html.replace(ANALYTICS_ANCHOR, GCP_BANNER + '                ' + ANALYTICS_ANCHOR, 1)
        print('Inserted GCP award banner into hero section.')
    else:
        print('WARNING: Could not find about-analytics-grid anchor.')
else:
    print('GCP award banner already present.')

# 9. Save
if html != original_html:
    with open(INDEX_HTML, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Saved patched index.html ({len(html):,} bytes)')
else:
    print('No changes needed.')

# 10. Update workflow
with open(WORKFLOW_YML, 'r', encoding='utf-8') as f:
    yml = f.read()
original_yml = yml
yml = yml.replace("- cron: '0 0 * * 1'", "- cron: '0 0 * * *'")
yml = yml.replace('# Runs automatically every Monday at 00:00 UTC (05:30 AM IST)',
                  '# Runs automatically every day at 00:00 UTC (05:30 AM IST)')
yml = yml.replace('file_pattern: "publications.json script.js"',
                  'file_pattern: "publications.json script.js index.html"')
yml = yml.replace('commit_message: "Auto-sync: Update publications from Google Scholar [skip ci]"',
                  'commit_message: "Auto-sync: Update publications & citation metrics from Google Scholar [skip ci]"')
if yml != original_yml:
    with open(WORKFLOW_YML, 'w', encoding='utf-8') as f:
        f.write(yml)
    print('Updated GitHub Actions workflow (daily cron, index.html in commit).')
else:
    print('Workflow already up to date.')

print('Done! All changes applied.')
