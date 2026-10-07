import pdfplumber
import glob
import os
import re

files = sorted(glob.glob("./data/*.pdf"))

print(f"Analyzing {len(files)} PDF files...\n")

for f in files:
    fname = os.path.basename(f)
    print(f"==================================================")
    print(f"FILE: {fname}")
    with pdfplumber.open(f) as pdf:
        num_pages = len(pdf.pages)
        print(f"Total Pages: {num_pages}")
        
        # Look for table of contents or overview section in first 6 pages
        overview_found = False
        for p_idx in range(min(7, num_pages)):
            txt = pdf.pages[p_idx].extract_text() or ""
            if "観光動向の概要" in txt or "観光動向" in txt:
                lines = [l.strip() for l in txt.split("\n") if l.strip()]
                # Print title and first 10 lines of overview
                print(f"[Page {p_idx+1}]")
                for l in lines[:12]:
                    print("  ", l)
                overview_found = True
                break
        if not overview_found:
            print("  Overview not found in first 7 pages")
