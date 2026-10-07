import pypdfium2 as pdfium
import glob
import os
import re

files = sorted(glob.glob("./data/*.pdf"))

print("Extracting Inbound foreign tourist numbers across all years...")

for f in files:
    fname = os.path.basename(f)
    doc = pdfium.PdfDocument(f)
    print(f"\n==================== {fname} ====================")
    for idx, page in enumerate(doc):
        text = page.get_textpage().get_text_range()
        if "外国人" in text and ("宿泊" in text or "延べ" in text):
            # check lines
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            for i, l in enumerate(lines):
                if any(k in l for k in ["外国人の延べ宿泊", "外国人宿泊客数", "外国人延べ宿泊客数", "外国人の延べ宿泊客数", "外国人宿泊者数", "外国人延べ宿泊者数"]):
                    print(f"  [P.{idx+1}]", l)
                    for j in range(1, 5):
                        if i+j < len(lines):
                            print("   +", lines[i+j])
