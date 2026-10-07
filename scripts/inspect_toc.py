import pdfplumber

def inspect_file(filepath):
    print(f"\n==================== {filepath} ====================")
    with pdfplumber.open(filepath) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        for idx in range(min(6, len(pdf.pages))):
            text = pdf.pages[idx].extract_text()
            print(f"--- Page {idx+1} ---")
            if text:
                for line in text.split("\n")[:15]:
                    print("  ", line)
            else:
                print("  [No text]")

inspect_file("./data/令和6年宮崎市観光統計.pdf")
inspect_file("./data/令和7年宮崎市観光統計.pdf")
inspect_file("./data/平成25年宮崎市観光統計.pdf")
