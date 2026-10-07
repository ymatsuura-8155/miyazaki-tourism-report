import pdfplumber
import pypdfium2 as pdfium

test_files = ["./data/平成28年宮崎市観光統計.pdf", "./data/令和2年宮崎市観光統計.pdf"]

for f in test_files:
    print(f"--- Testing {f} with pypdfium2 ---")
    doc = pdfium.PdfDocument(f)
    print(f"Pages: {len(doc)}")
    page = doc[0]
    textpage = page.get_textpage()
    text = textpage.get_text_range()
    print("Page 1 text (pypdfium2):")
    print(text[:300])
    
    print(f"\n--- Testing {f} with pdfplumber ---")
    with pdfplumber.open(f) as pdf:
        p0 = pdf.pages[0]
        text_plumber = p0.extract_text()
        print("Page 1 text (pdfplumber):")
        print(text_plumber[:300] if text_plumber else "None")
