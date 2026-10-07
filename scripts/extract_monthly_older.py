import pypdfium2 as pdfium
import glob
import os
import re

older_files = [
    "./data/平成25年宮崎市観光統計.pdf",
    "./data/平成26年宮崎市観光統計.pdf",
    "./data/平成27年宮崎市観光統計.pdf",
    "./data/平成28年宮崎市観光統計.pdf",
    "./data/平成29年宮崎市観光統計.pdf",
    "./data/平成30年宮崎市観光統計.pdf",
    "./data/令和1年宮崎市観光統計.pdf",
    "./data/令和2年宮崎市観光統計.pdf"
]

for f in older_files:
    fname = os.path.basename(f)
    doc = pdfium.PdfDocument(f)
    print(f"\n==================== {fname} ====================")
    for idx, page in enumerate(doc):
        text = page.get_textpage().get_text_range()
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        if any("月別観光入込客数" in l or "月別入込客数" in l for l in lines):
            print(f"  [Monthly Visitors P.{idx+1}]:")
            for l in lines[:18]:
                print("   ", l)
        if any("月別宿泊客数" in l or "月別宿泊者数" in l or "月別延べ宿泊客数" in l or "月別延べ宿泊者数" in l for l in lines):
            print(f"  [Monthly Stays P.{idx+1}]:")
            for l in lines[:18]:
                print("   ", l)
