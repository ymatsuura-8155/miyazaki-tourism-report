import pypdfium2 as pdfium

doc_r7 = pdfium.PdfDocument('./data/令和7年宮崎市観光統計.pdf')
print("--- R7 Facility Attendance (Pages 21, 22, 23) ---")
for p in [20, 21, 22]:
    print(f"=== Page {p+1} ===")
    print(doc_r7[p].get_textpage().get_text_range())
