import pypdfium2 as pdfium

doc_r2 = pdfium.PdfDocument('./data/令和2年宮崎市観光統計.pdf')
print("--- R2 Page 8 & 9 (Monthly Visitors) ---")
print(doc_r2[7].get_textpage().get_text_range())
print(doc_r2[8].get_textpage().get_text_range())
