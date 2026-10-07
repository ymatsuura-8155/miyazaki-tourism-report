import pypdfium2 as pdfium
import glob
import os
import re

files = [
    "./data/令和1年宮崎市観光統計.pdf",
    "./data/令和2年宮崎市観光統計.pdf",
    "./data/令和3年宮崎市観光統計.pdf",
    "./data/令和4年宮崎市観光統計.pdf",
    "./data/令和5年宮崎市観光統計.pdf",
    "./data/令和6年宮崎市観光統計.pdf",
    "./data/令和7年宮崎市観光統計.pdf"
]

for f in files:
    fname = os.path.basename(f)
    doc = pdfium.PdfDocument(f)
    print(f"\n==================== {fname} ====================")
    for idx, page in enumerate(doc):
        text = page.get_textpage().get_text_range()
        if "観光消費額" in text and ("百万円" in text or "億円" in text or "消費額は" in text):
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            for l in lines:
                if any(k in l for k in ["消費額は", "内訳は", "総額が", "宿泊費", "みやげ", "交通費", "雑費", "1人当たり"]):
                    print(f"  [P.{idx+1}]", l)
            break
