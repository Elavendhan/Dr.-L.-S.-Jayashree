import os
import re
import json
import urllib.request
import urllib.error
import difflib
import sys

# 1. Configuration & Paths
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
excel_path = os.path.join(base_dir, "Quartile_Details_Updated.xlsx")
lookup_path = os.path.join(base_dir, "quartiles_lookup.json")
json_path = os.path.join(base_dir, "publications.json")
js_path = os.path.join(base_dir, "script.js")
html_path = os.path.join(base_dir, "index.html")

scholar_url = "https://scholar.google.com/citations?user=mmNPmLoAAAAJ&hl=en&oi=ao&cstart=0&pagesize=100"

print("--- Google Scholar Publication & Citation Synchronizer ---")

# 2. Load Quartile mappings (from JSON or Excel)
quartile_lookup = {}
if os.path.exists(lookup_path):
    try:
        with open(lookup_path, "r", encoding="utf-8") as f:
            quartile_lookup = json.load(f)
        print(f"Loaded {len(quartile_lookup)} quartile mappings from quartiles_lookup.json.")
    except Exception as e:
        print(f"Warning: Failed to load quartiles_lookup.json: {e}")

if not quartile_lookup and os.path.exists(excel_path):
    try:
        import pandas as pd
        df = pd.read_excel(excel_path)
        for _, row in df.iterrows():
            title = str(row['Paper Title']).strip()
            q = str(row['Quartile / Classification']).strip()
            mapped_q = q if q in ['Q1', 'Q2', 'Q3', 'Q4'] else 'Others'
            clean_title = re.sub(r'[^a-z0-9]', '', title.lower())
            quartile_lookup[clean_title] = mapped_q
        print(f"Loaded {len(quartile_lookup)} quartile mappings from Excel.")
    except Exception as e:
        print(f"Warning: Failed to load Excel: {e}")

# Also load existing publications.json quartiles as backup
if os.path.exists(json_path):
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            existing_pubs = json.load(f)
            for pub in existing_pubs:
                clean_title = re.sub(r'[^a-z0-9]', '', pub.get("Title", "").lower())
                if clean_title not in quartile_lookup and "Quartile" in pub:
                    quartile_lookup[clean_title] = pub["Quartile"]
    except Exception as e:
        pass

# 3. Fetch Google Scholar Profile HTML
print("Fetching profile from Google Scholar...")
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"'
}

html = None
req = urllib.request.Request(scholar_url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=15) as response:
        html = response.read().decode('utf-8')
except Exception as e:
    print(f"Notice: Could not connect to Google Scholar ({e}).")
    print("Safely exiting: Existing publications and citations database remain 100% intact!")
    sys.exit(0)

# 4. Parse Publication Rows
rows = re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', html, re.DOTALL)
print(f"Parsed {len(rows)} publication rows from Scholar HTML.")

# STRICT SAFETY GUARD: Never overwrite with empty or partial data
if len(rows) < 50:
    print(f"Warning: Only {len(rows)} publication rows parsed (possible rate-limiting or CAPTCHA).")
    print("SAFETY GUARD TRIGGERED: Aborting write to prevent data corruption. Existing database preserved!")
    sys.exit(0)

parsed_pubs = []
for row in rows:
    title_match = re.search(r'class="gsc_a_at">([^<]+)</a>', row)
    link_match = re.search(r'href="([^"]+)" class="gsc_a_at"', row)
    divs = re.findall(r'<div class="gs_gray">(.*?)</div>', row, re.DOTALL)
    citations_match = re.search(r'class="gsc_a_ac[^"]*">([^<]*)</a>', row)
    year_match = re.search(r'<span class="gsc_a_h gsc_a_hc gs_ibl">([^<]*)</span>', row)
    if not year_match:
        year_match = re.search(r'<td class="gsc_a_y"><span[^>]*>([^<]*)</span></td>', row)
        
    if title_match:
        title = title_match.group(1).strip()
        title = title.replace('\u00ad', '-').replace('\u2013', '-').replace('\u2014', '-').replace('\uFFFD', '-')
        
        link = "https://scholar.google.com" + link_match.group(1).strip() if link_match else ""
        authors = re.sub(r'<[^>]+>', '', divs[0]).strip() if len(divs) > 0 else ""
        venue = re.sub(r'<[^>]+>', '', divs[1]).strip() if len(divs) > 1 else ""
        venue = venue.replace('\u00ad', '-').replace('\u2013', '-').replace('\u2014', '-').replace('\uFFFD', '-')
        
        citations_str = citations_match.group(1).strip() if citations_match else "0"
        citations = int(citations_str) if citations_str.isdigit() else 0
        
        year_str = year_match.group(1).strip() if year_match else ""
        year = year_str if year_str.isdigit() else ""
        
        # Skip retracted publication
        clean_title = re.sub(r'[^a-z0-9]', '', title.lower())
        if "retractionnote" in clean_title or "retractedarticle" in clean_title:
            continue
            
        parsed_pubs.append({
            "Title": title,
            "Link": link,
            "Authors": authors,
            "Source": venue,
            "Citations": citations,
            "Year": year
        })

# 5. Merge & Quartile Match
final_pubs = []
for pub in parsed_pubs:
    title = pub["Title"]
    clean_title = re.sub(r'[^a-z0-9]', '', title.lower())
    
    quartile = quartile_lookup.get(clean_title)
    if not quartile:
        best_ratio = 0
        best_match = None
        for k in quartile_lookup.keys():
            ratio = difflib.SequenceMatcher(None, clean_title, k).ratio()
            if ratio > 0.90 and ratio > best_ratio:
                best_ratio = ratio
                best_match = k
        if best_match:
            quartile = quartile_lookup[best_match]
            
    if not quartile:
        quartile = "Others"
        
    pub["Quartile"] = quartile
    final_pubs.append(pub)

# 6. Write to publications.json
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(final_pubs, f, indent=2, ensure_ascii=False)
print(f"Saved {len(final_pubs)} merged publications to publications.json.")

# 7. Update script.js database
with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

start_match = re.search(r'const publicationsDb = \[', js_content)
if start_match:
    start_idx = start_match.start()
    bracket_count = 0
    found_start = False
    end_idx = -1
    for idx in range(start_idx, len(js_content)):
        char = js_content[idx]
        if char == '[':
            bracket_count += 1
            found_start = True
        elif char == ']':
            bracket_count -= 1
        if found_start and bracket_count == 0:
            end_idx = idx + 1
            break
            
    if end_idx != -1:
        indent_json = json.dumps(final_pubs, indent=2, ensure_ascii=False)
        indent_json = indent_json.replace('\n', '\n    ')
        new_js_content = js_content[:start_idx] + "const publicationsDb = " + indent_json + js_content[end_idx:]
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(new_js_content)
        print("Successfully synced script.js inline publications database!")

# 8. Dynamic Update of Cited-by Metrics in index.html
citation_metrics = re.findall(r'<td class="gsc_rsb_std">([^<]+)</td>', html)
if len(citation_metrics) >= 6 and os.path.exists(html_path):
    c_all, c_since = citation_metrics[0].strip(), citation_metrics[1].strip()
    h_all, h_since = citation_metrics[2].strip(), citation_metrics[3].strip()
    i10_all, i10_since = citation_metrics[4].strip(), citation_metrics[5].strip()
    
    print(f"Live Citations from Scholar: All={c_all}, Since={c_since} | h-index: {h_all}/{h_since} | i10: {i10_all}/{i10_since}")
    
    with open(html_path, "r", encoding="utf-8", newline="") as f:
        h_content = f.read()
        
    # Update citations row
    h_content = re.sub(
        r'(<td>Citations</td>\s*<td[^>]*>)[0-9]+(</td>\s*<td[^>]*>)[0-9]+(</td>)',
        rf'\g<1>{c_all}\g<2>{c_since}\g<3>',
        h_content
    )
    # Update h-index row
    h_content = re.sub(
        r'(<td>h-index</td>\s*<td[^>]*>)[0-9]+(</td>\s*<td[^>]*>)[0-9]+(</td>)',
        rf'\g<1>{h_all}\g<2>{h_since}\g<3>',
        h_content
    )
    # Update i10-index row
    h_content = re.sub(
        r'(<td>i10-index</td>\s*<td[^>]*>)[0-9]+(</td>\s*<td[^>]*>)[0-9]+(</td>)',
        rf'\g<1>{i10_all}\g<2>{i10_since}\g<3>',
        h_content
    )
    
    with open(html_path, "w", encoding="utf-8", newline="") as f:
        f.write(h_content)
    print("Successfully updated live Cited-by metrics in index.html!")

# 9. Print sync summary stats
q_counts = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0, "Others": 0}
for p in final_pubs:
    q = p.get("Quartile", "Others")
    if "Q1" in q: q_counts["Q1"] += 1
    elif "Q2" in q: q_counts["Q2"] += 1
    elif "Q3" in q: q_counts["Q3"] += 1
    elif "Q4" in q: q_counts["Q4"] += 1
    else: q_counts["Others"] += 1

print("\n--- SYNC SUMMARY STATS ---")
print(f"Total Publications: {len(final_pubs)}")
print(f"  Q1 Journals: {q_counts['Q1']}")
print(f"  Q2 Journals: {q_counts['Q2']}")
print(f"  Q3 Journals: {q_counts['Q3']}")
print(f"  Q4 Journals: {q_counts['Q4']}")
print(f"  Others (Conferences/Unranked): {q_counts['Others']}")
print("--------------------------")
