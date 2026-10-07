import os
import glob
from pypdf import PdfReader

data_dir = "./data"
pdf_files = sorted(glob.glob(os.path.join(data_dir, "*.pdf")))

print(f"Total PDFs found: {len(pdf_files)}\n")

summary = []

for pdf_path in pdf_files:
    filename = os.path.basename(pdf_path)
    try:
        reader = PdfReader(pdf_path)
        num_pages = len(reader.pages)
        
        # Extract title or first page text preview
        first_page_text = reader.pages[0].extract_text() or ""
        first_page_lines = [line.strip() for line in first_page_text.split("\n") if line.strip()][:5]
        
        # Let's inspect page 2 or table of contents
        toc_text = ""
        for p in range(min(5, num_pages)):
            t = reader.pages[p].extract_text() or ""
            if "目次" in t or "第" in t:
                toc_text = t
                break
        
        summary.append({
            "filename": filename,
            "pages": num_pages,
            "preview": first_page_lines,
            "toc_sample": toc_text[:300].replace("\n", " / ") if toc_text else "None"
        })
        print(f"=== {filename} ({num_pages} pages) ===")
        print("Header lines:", first_page_lines)
        print("TOC / Sample:", (toc_text[:200].replace("\n", " ") if toc_text else "None"))
        print()
    except Exception as e:
        print(f"Error reading {filename}: {e}")
