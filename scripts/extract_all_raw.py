import pypdfium2 as pdfium
import glob
import os
import re
import json

files = sorted(glob.glob("./data/*.pdf"))

print(f"Inspecting {len(files)} files for annual overview and key indicators...")

results = {}

for f in files:
    fname = os.path.basename(f)
    doc = pdfium.PdfDocument(f)
    print(f"\n==========================================")
    print(f"FILE: {fname} (Pages: {len(doc)})")
    
    # Extract overview text (usually pages 4-7)
    overview_text = ""
    for p in range(len(doc)):
        txt = doc[p].get_textpage().get_text_range()
        if "観光動向の概要" in txt:
            overview_text += f"[Page {p+1}]\n" + txt + "\n"
        elif "入込観光客数の推移" in txt or "観光入込客数の推移" in txt:
            overview_text += f"[Page {p+1} - 入込]\n" + txt + "\n"
        elif "宿泊施設利用状況" in txt or "宿泊客の状況" in txt:
            if "①" in txt or "推移" in txt:
                overview_text += f"[Page {p+1} - 宿泊]\n" + txt + "\n"
        elif "観光消費額" in txt and ("①" in txt or "百万円" in txt or "億円" in txt):
            overview_text += f"[Page {p+1} - 消費額]\n" + txt + "\n"
            
    print(overview_text[:1500])
    results[fname] = overview_text

with open("./scripts/extracted_raw.json", "w", encoding="utf-8") as out:
    json.dump(results, out, ensure_ascii=False, indent=2)

print("\nDumped raw extracted sections to scripts/extracted_raw.json")
