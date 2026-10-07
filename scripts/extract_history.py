import pypdfium2 as pdfium
import re
import json

doc = pdfium.PdfDocument('./data/令和7年宮崎市観光統計.pdf')

# Pages 8 & 9 (0-indexed 7 and 8)
p8_text = doc[7].get_textpage().get_text_range()
p9_text = doc[8].get_textpage().get_text_range()

print("--- P8 TEXT ---")
print(p8_text[-500:])
print("--- P9 TEXT ---")
print(p9_text)

# Pages 12 & 13 (0-indexed 11 and 12)
p12_text = doc[11].get_textpage().get_text_range()
p13_text = doc[12].get_textpage().get_text_range()

print("--- P12 TEXT ---")
print(p12_text[-500:])
print("--- P13 TEXT ---")
print(p13_text)
