import pdfplumber
import glob
import re

files = sorted(glob.glob("./data/*.pdf"))

print("Investigating specific tables in files...")

# Let's inspect 平成25, 平成30, 令和2, 令和5, 令和7
sample_files = [
    "./data/平成25年宮崎市観光統計.pdf",
    "./data/平成30年宮崎市観光統計.pdf",
    "./data/令和2年宮崎市観光統計.pdf",
    "./data/令和5年宮崎市観光統計.pdf",
    "./data/令和7年宮崎市観光統計.pdf"
]

for f in sample_files:
    print(f"\n==========================================")
    print(f"FILE: {f}")
    with pdfplumber.open(f) as pdf:
        for idx, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            # Check for key table headings
            if any(term in text for term in ["入込観光客数の推移", "観光入込客数の推移", "延べ宿泊者数の推移", "延べ宿泊客数の推移", "外国人延べ宿泊客数", "観光消費額の推移", "月別"]):
                first_lines = [l.strip() for l in text.split("\n") if l.strip()][:8]
                print(f"Page {idx+1}:")
                for l in first_lines:
                    print("  ", l)
