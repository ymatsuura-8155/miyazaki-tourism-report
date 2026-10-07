import pypdfium2 as pdfium
import glob
import os
import re

files = sorted(glob.glob("./data/*.pdf"))

def extract_tables_info(pdf_path):
    doc = pdfium.PdfDocument(pdf_path)
    fname = os.path.basename(pdf_path)
    print(f"==================== {fname} ====================")
    
    for idx, page in enumerate(doc):
        text = page.get_textpage().get_text_range()
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        
        # Look for monthly visitors table
        if any("月別観光入込客数" in l or "月別入込客数" in l for l in lines):
            print(f"[Page {idx+1}] MONTHLY VISITORS:")
            for l in lines[:25]:
                print("  ", l)
                
        # Look for monthly stays table
        if any("月別宿泊客数" in l or "月別宿泊者数" in l or "月別延べ宿泊客数" in l for l in lines):
            print(f"[Page {idx+1}] MONTHLY STAYS:")
            for l in lines[:25]:
                print("  ", l)

        # Look for foreign stays breakdown
        if any("国別延べ宿泊客数" in l or "外国人宿泊客" in l or "外国人延べ宿泊者数" in l for l in lines):
            if any("韓国" in l or "台湾" in l for l in lines):
                print(f"[Page {idx+1}] INBOUND BY COUNTRY:")
                for l in lines[:30]:
                    print("  ", l)

        # Look for spending table
        if any("観光消費額" in l and ("宿泊費" in text or "百万円" in text or "億円" in text) for l in lines):
            print(f"[Page {idx+1}] SPENDING:")
            for l in lines[:25]:
                print("  ", l)

# Run on 平成25, 令和1, 令和6, 令和7
for f in ["./data/平成25年宮崎市観光統計.pdf", "./data/令和1年宮崎市観光統計.pdf", "./data/令和6年宮崎市観光統計.pdf", "./data/令和7年宮崎市観光統計.pdf"]:
    extract_tables_info(f)
