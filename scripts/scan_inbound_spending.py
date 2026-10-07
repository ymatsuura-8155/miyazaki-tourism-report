import pypdfium2 as pdfium
import glob
import os
import re

files = sorted(glob.glob("./data/*.pdf"))

print("Extracting Inbound foreign visitors and Tourism Spending from each year's PDF...")

results = {}

for f in files:
    fname = os.path.basename(f)
    doc = pdfium.PdfDocument(f)
    print(f"\n==================== {fname} ====================")
    
    inbound_found = False
    spending_found = False
    
    for idx, page in enumerate(doc):
        text = page.get_textpage().get_text_range()
        
        # Check for Foreign visitor count
        if not inbound_found and ("外国人宿泊客" in text or "外国人延べ宿泊" in text or "国別延べ宿泊" in text):
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            for l in lines:
                if any(k in l for k in ["外国人", "国別", "計", "韓国", "台湾"]):
                    print(f"  [Inbound P.{idx+1}]", l)
            inbound_found = True
            
        # Check for Tourism spending
        if not spending_found and "観光消費額" in text and ("百万円" in text or "億円" in text or "消費額は" in text):
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            for l in lines:
                if any(k in l for k in ["観光消費額は", "全体消費額", "宿泊費", "県外客", "1人当たり"]):
                    print(f"  [Spending P.{idx+1}]", l)
            spending_found = True
