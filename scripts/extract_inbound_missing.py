import pypdfium2 as pdfium

for f in ["./data/平成25年宮崎市観光統計.pdf", "./data/令和1年宮崎市観光統計.pdf", "./data/令和2年宮崎市観光統計.pdf", "./data/令和3年宮崎市観光統計.pdf", "./data/令和4年宮崎市観光統計.pdf", "./data/令和5年宮崎市観光統計.pdf"]:
    doc = pdfium.PdfDocument(f)
    print(f"\n==================== {f} ====================")
    for p in range(len(doc)):
        txt = doc[p].get_textpage().get_text_range()
        if "外国人" in txt and ("宿泊" in txt or "人" in txt):
            for l in txt.split("\n"):
                if any(k in l for k in ["外国人宿泊", "外国人延べ", "外国人の延べ", "国別延べ", "外国人観光客", "インバウンド"]):
                    print(f"  [P.{p+1}]", l.strip())
