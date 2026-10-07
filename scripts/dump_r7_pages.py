import pypdfium2 as pdfium

doc = pdfium.PdfDocument('./data/令和7年宮崎市観光統計.pdf')
for p in [5, 6, 9, 10, 14, 15, 16, 17]:
    print(f"==================== PAGE {p+1} ====================")
    print(doc[p].get_textpage().get_text_range())
