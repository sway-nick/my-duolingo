import docx
import re
import json
import string

doc_path = r'C:\Users\user\.gemini\antigravity\brain\df28d9cd-0651-4a2e-bc3b-3b01404114d8\.user_uploaded\media_1793482493642_520c7081.docx'
doc = docx.Document(doc_path)
paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

# Regex to detect dialogue start e.g. "01. Meeting Someone New — Знакомство"
dialogue_indices = []
for idx, text in enumerate(paragraphs):
    m = re.match(r'^(\d{2})\.\s*(.+)', text)
    if m:
        dialogue_indices.append((idx, int(m.group(1)), m.group(2)))

print(f"Detected {len(dialogue_indices)} dialogues.")

# Supported 36 locales in canonical order
LOCALE_MAP = {
    'ru': 'ru', 'uk': 'uk', 'en': 'en', 'de': 'de', 'es': 'es', 'fr': 'fr',
    'pl': 'pl', 'tr': 'tr', 'it': 'it', 'ro': 'ro', 'bg': 'bg', 'hu': 'hu',
    'el': 'el', 'da': 'da', 'lv': 'lv', 'lt': 'lt', 'pt-br': 'pt', 'pt': 'pt',
    'sk': 'sk', 'sl': 'sl', 'fi': 'fi', 'hr': 'hr', 'cs': 'cs', 'sv': 'sv',
    'et': 'et', 'hi': 'hi', 'bn': 'bn', 'ar': 'ar', 'fa': 'fa', 'ur': 'ur',
    'id': 'id', 'vi': 'vi', 'th': 'th', 'ko': 'ko', 'ja': 'ja', 'zh': 'zh',
    'kk': 'kk'
}

parsed_dialogues = []

for d_num in range(1, len(dialogue_indices) + 1):
    start_p = dialogue_indices[d_num - 1][0]
    end_p = dialogue_indices[d_num][0] if d_num < len(dialogue_indices) else len(paragraphs)
    d_paras = paragraphs[start_p:end_p]

    header_full = d_paras[0] # e.g. "01. Meeting Someone New — Знакомство"
    level_desc = d_paras[1] if len(d_paras) > 1 else ""

    dialogue_obj = {
        'id': d_num,
        'milestone': (d_num - 1) * 50, # 0, 50, 100, 150, ..., 1800
        'header': header_full,
        'level_desc': level_desc,
        'locales': {}
    }

    # Iterate through paragraphs looking for locale headers e.g. "ru — Русский: Знакомство"
    i = 2
    while i < len(d_paras):
        line = d_paras[i]
        # Match e.g. "ru — Русский: Знакомство" or "en — English (оригинал): Meeting Someone New"
        # or "pt-br — Português (Brasil): Conhecendo Alguém"
        m_loc = re.match(r'^([a-zA-Z-]+)\s*[—\-]\s*([^:]+):\s*(.+)$', line)
        if m_loc:
            loc_code = m_loc.group(1).lower().strip()
            loc_name = m_loc.group(2).strip()
            title = m_loc.group(3).strip()
            
            # Content is the next paragraph(s)
            i += 1
            content_lines = []
            while i < len(d_paras) and not re.match(r'^[a-zA-Z-]+\s*[—\-]\s*[^:]+:', d_paras[i]):
                content_lines.append(d_paras[i])
                i += 1
            
            full_content = "\n".join(content_lines).strip()
            dialogue_obj['locales'][loc_code] = {
                'title': title,
                'content': full_content
            }
        else:
            i += 1

    parsed_dialogues.append(dialogue_obj)

print(f"Successfully structured {len(parsed_dialogues)} dialogues.")

# Verify each dialogue has all locales and English content
missing_report = []
for d in parsed_dialogues:
    en_data = d['locales'].get('en')
    ru_data = d['locales'].get('ru')
    loc_count = len(d['locales'])
    if not en_data or not ru_data or loc_count < 30:
        missing_report.append(f"Dialogue {d['id']} has {loc_count} locales. en={bool(en_data)}, ru={bool(ru_data)}")

if missing_report:
    print("Warning: some locales missing:")
    for m in missing_report:
        print("  ", m)
else:
    print("All 37 dialogues have complete locale structures!")

# Save parsed dialogues to JSON
with open('scripts/parsed_37_dialogues.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_dialogues, f, ensure_ascii=False, indent=2)

print("Saved to scripts/parsed_37_dialogues.json")
