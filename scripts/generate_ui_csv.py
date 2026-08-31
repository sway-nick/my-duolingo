import csv
import os

from extract_ui_strings import ui_elements

BASE_DIR = r"c:\projects\my-duolingo"
OUTPUT_CSV = os.path.join(BASE_DIR, "scripts", "UI_Translations_Template.csv")

headers = [
    "section", "key", "ru", "uk", "de", "es", "fr", "pl",
    "it", "tr", "pt", "ro", "bg", "cs", "sk", "hu",
    "el", "sl", "et", "lt"
]

rows = []
for idx, (section, key, ru_text) in enumerate(ui_elements, start=2):
    # Prepare row with formula for auto-translation in Google Sheets
    row = [section, key, ru_text]
    for lang in headers[3:]:
        # Google Sheets formula referencing column C (ru_text) at current row index
        formula = f'=GOOGLETRANSLATE(C{idx}; "ru"; "{lang}")'
        row.append(formula)
    rows.append(row)

with open(OUTPUT_CSV, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f, delimiter="\t")
    writer.writerow(headers)
    writer.writerows(rows)

print(f"Generated {len(rows)} UI translation rows in {OUTPUT_CSV}")
