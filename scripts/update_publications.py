import os
import re
import json
import urllib.request
import urllib.error
import pandas as pd
import difflib

# 1. Configuration & Paths
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
excel_path = os.path.join(base_dir, "Quartile_Details_Updated.xlsx")
json_path = os.path.join(base_dir, "publications.json")
js_path = os.path.join(base_dir, "script.js")
scholar_url = "https://scholar.google.com/citations?user=mmNPmLoAAAAJ&hl=en&oi=ao&cstart=0&pagesize=100"

print("--- Google Scholar Publication Synchronizer ---")

# 2. Load Excel Quartile lookup
excel_lookup = {}
if os.path.exists(excel_path):
    try:
        df = pd.read_excel(excel_path)
        title_col = 'Paper Title'
        quartile_col = 'Quartile / Classification'
        
        for idx, row in df.iterrows():
            title = str(row[title_col]).strip()
            q = str(row[quartile_col]).strip()
            
            if q in ['Q1', 'Q2', 'Q3', 'Q4']:
                mapped_q = q
            elif q in ['Conference Proceedings', 'Unranked / Non-indexed']:
                mapped_q = 'Others'
            else:
                mapped_q = 'Others'
                
            clean_title = re.sub(r'[^a-z0-9]', '', title.lower())
            excel_lookup[clean_title] = mapped_q
        print(f"Loaded {len(excel_lookup)} paper quartile mappings from Excel.")
    except Exception as e:
        print(f"Warning: Failed to load Excel: {e}")
else:
    print("Warning: Excel file not found.")

# 3. Load existing JSON Quartile lookup
json_lookup = {}
if os.path.exists(json_path):
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            existing_pubs = json.load(f)
            for pub in existing_pubs:
                title = pub.get("Title", "")
                q = pub.get("Quartile", "Others")
                clean_title = re.sub(r'[^a-z0-9]', '', title.lower())
                json_lookup[clean_title] = q
        print(f"Loaded {len(json_lookup)} existing quartiles from publications.json.")
    except Exception as e:
        print(f"Warning: Failed to load existing publications.json: {e}")

# 4. Fetch Google Scholar HTML
print("Fetching publications from Google Scholar profile...")
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
req = urllib.request.Request(scholar_url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
except Exception as e:
    print(f"Error connecting to Google Scholar: {e}")
    exit(1)

# 5. Parse Publication Rows
rows = re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', html, re.DOTALL)
print(f"Parsed {len(rows)} publication rows from Scholar HTML.")

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
        title = title.replace('', '-').replace('\uFFFD', '-')
        
        link = "https://scholar.google.com" + link_match.group(1).strip() if link_match else ""
        authors = re.sub(r'<[^>]+>', '', divs[0]).strip() if len(divs) > 0 else ""
        venue = re.sub(r'<[^>]+>', '', divs[1]).strip() if len(divs) > 1 else ""
        venue = venue.replace('', '-').replace('\uFFFD', '-')
        
        citations_str = citations_match.group(1).strip() if citations_match else "0"
        citations = int(citations_str) if citations_str.isdigit() else 0
        
        year_str = year_match.group(1).strip() if year_match else ""
        year = year_str if year_str.isdigit() else ""
        
        # Skip retracted publication
        clean_title = re.sub(r'[^a-z0-9]', '', title.lower())
        if "retractionnote" in clean_title or "retractedarticle" in clean_title:
            print(f"Skipping retracted article: {title}")
            continue
            
        parsed_pubs.append({
            "Title": title,
            "Link": link,
            "Authors": authors,
            "Source": venue,
            "Citations": citations,
            "Year": year
        })

# 6. Merge & Quartile Match
final_pubs = []
for pub in parsed_pubs:
    title = pub["Title"]
    clean_title = re.sub(r'[^a-z0-9]', '', title.lower())
    
    quartile = excel_lookup.get(clean_title)
    if not quartile:
        best_ratio = 0
        best_match = None
        for k in excel_lookup.keys():
            ratio = difflib.SequenceMatcher(None, clean_title, k).ratio()
            if ratio > 0.90 and ratio > best_ratio:
                best_ratio = ratio
                best_match = k
        if best_match:
            quartile = excel_lookup[best_match]
            
    if not quartile:
        quartile = json_lookup.get(clean_title)
    if not quartile:
        best_ratio = 0
        best_match = None
        for k in json_lookup.keys():
            ratio = difflib.SequenceMatcher(None, clean_title, k).ratio()
            if ratio > 0.90 and ratio > best_ratio:
                best_ratio = ratio
                best_match = k
        if best_match:
            quartile = json_lookup[best_match]
            
    if not quartile:
        quartile = "Others"
        
    pub["Quartile"] = quartile
    final_pubs.append(pub)

# 7. Write to publications.json
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(final_pubs, f, indent=2, ensure_ascii=False)
print(f"Saved {len(final_pubs)} merged publications to publications.json.")

# 8. Update script.js database
with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

start_match = re.search(r'const publicationsDb = \[', js_content)
if not start_match:
    print("Error: Could not find const publicationsDb in script.js")
    exit(1)
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

if end_idx == -1:
    print("Error: Could not find end of publicationsDb bracket in script.js")
    exit(1)

indent_json = json.dumps(final_pubs, indent=2, ensure_ascii=False)
indent_json = indent_json.replace('\n', '\n    ')
new_js_content = js_content[:start_idx] + "const publicationsDb = " + indent_json + js_content[end_idx:]

with open(js_path, "w", encoding="utf-8") as f:
    f.write(new_js_content)

print("Successfully synced and updated script.js inline publications database!")

# 9. Print sync summary stats
q_counts = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0, "Others": 0}
for p in final_pubs:
    q = p.get("Quartile", "Others")
    if q in q_counts:
        q_counts[q] += 1
    else:
        q_counts["Others"] += 1

print("\n--- SYNC SUMMARY STATS ---")
print(f"Total Publications: {len(final_pubs)}")
print(f"  Q1 Journals: {q_counts['Q1']}")
print(f"  Q2 Journals: {q_counts['Q2']}")
print(f"  Q3 Journals: {q_counts['Q3']}")
print(f"  Q4 Journals: {q_counts['Q4']}")
print(f"  Others (Conferences/Unranked): {q_counts['Others']}")
print("--------------------------")
