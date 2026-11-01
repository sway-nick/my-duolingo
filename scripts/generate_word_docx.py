import json
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_word_document():
    # Load words
    with open('frontend/assets/data/words.json', 'r', encoding='utf-8') as f:
        all_words = json.load(f)

    elem_words = [w for w in all_words if w.get('category') == 'Elementary']
    print(f"Loaded {len(elem_words)} Elementary words.")

    doc = Document()

    # Page setup
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    # Document Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("English Breakfast 🍳")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(26)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(194, 65, 12) # Warm Amber

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("Списки частотных слов для составления авторских рассказов\n(разбивка по 100 слов)")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(15)
    run_sub.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph() # Spacer

    # Instructions box
    p_inst = doc.add_paragraph()
    p_inst.paragraph_format.left_indent = Inches(0.2)
    p_inst.paragraph_format.right_indent = Inches(0.2)
    run_inst_title = p_inst.add_run("📖 Как устроена методика рассказов:\n")
    run_inst_title.font.bold = True
    run_inst_title.font.size = Pt(11)
    run_inst_title.font.color.rgb = RGBColor(15, 23, 42)

    inst_text = (
        "• Все слова в приложении изучаются в строгом порядке частотности реального использования в живой речи.\n"
        "• Рубеж 100 слов: рассказ составляется строго из пула слов № 1–100.\n"
        "• Рубеж 200 слов: рассказ может использовать слова № 1–200 (все первые 200 слов).\n"
        "• Рубеж 300 слов: используются слова № 1–300, и так далее на каждом рубеже.\n"
        "• Старайтесь избегать сложных грамматических конструкций и редких идиом, чтобы текст читался легко и вдохновлял ученика!"
    )
    run_inst = p_inst.add_run(inst_text)
    run_inst.font.size = Pt(10)
    run_inst.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_page_break()

    # Generate batches of 100
    batch_size = 100
    total_words = len(elem_words)
    num_batches = (total_words + batch_size - 1) // batch_size

    for b in range(num_batches):
        start_idx = b * batch_size
        end_idx = min(start_idx + batch_size, total_words)
        batch = elem_words[start_idx:end_idx]
        milestone = (b + 1) * 100 if end_idx == (b + 1) * 100 else end_idx

        # Heading
        p_head = doc.add_paragraph()
        run_h = p_head.add_run(f"Рубеж {milestone} слов (Слова № {start_idx + 1} – {end_idx})")
        run_h.font.name = "Arial"
        run_h.font.size = Pt(16)
        run_h.font.bold = True
        run_h.font.color.rgb = RGBColor(15, 23, 42)

        p_note = doc.add_paragraph()
        p_note.paragraph_format.space_after = Pt(8)
        run_n = p_note.add_run(f"Пул слов, открывающийся на отметке {milestone} слов. Допустимы также слова из всех предыдущих рубежей (всего доступно: {end_idx} слов).")
        run_n.font.size = Pt(9.5)
        run_n.font.italic = True
        run_n.font.color.rgb = RGBColor(100, 116, 139)

        # Table: 4 columns: №, Слово, Транскрипция, Перевод
        table = doc.add_table(rows=1, cols=4)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        col_widths = [Inches(0.6), Inches(2.2), Inches(1.8), Inches(2.6)]

        # Header row
        hdr_cells = table.rows[0].cells
        headers = ["№", "Слово (English)", "Транскрипция", "Перевод (Русский)"]
        for i, text in enumerate(headers):
            hdr_cells[i].width = col_widths[i]
            set_cell_background(hdr_cells[i], "1E293B") # Dark slate
            set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
            p = hdr_cells[i].paragraphs[0]
            if i == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(text)
            run.font.bold = True
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(255, 255, 255)

        # Rows
        for i, w in enumerate(batch):
            row_idx = start_idx + i + 1
            row_cells = table.add_row().cells

            bg_hex = "F8FAFC" if (i % 2 == 1) else "FFFFFF"

            # Column 0: Number
            row_cells[0].width = col_widths[0]
            set_cell_background(row_cells[0], bg_hex)
            set_cell_margins(row_cells[0], top=80, bottom=80, left=100, right=100)
            p0 = row_cells[0].paragraphs[0]
            p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r0 = p0.add_run(str(row_idx))
            r0.font.size = Pt(9)
            r0.font.color.rgb = RGBColor(148, 163, 184)

            # Column 1: Word
            row_cells[1].width = col_widths[1]
            set_cell_background(row_cells[1], bg_hex)
            set_cell_margins(row_cells[1], top=80, bottom=80, left=140, right=140)
            p1 = row_cells[1].paragraphs[0]
            r1 = p1.add_run(w.get("word", ""))
            r1.font.bold = True
            r1.font.size = Pt(10)
            r1.font.color.rgb = RGBColor(15, 23, 42)

            # Column 2: Transcription
            row_cells[2].width = col_widths[2]
            set_cell_background(row_cells[2], bg_hex)
            set_cell_margins(row_cells[2], top=80, bottom=80, left=140, right=140)
            p2 = row_cells[2].paragraphs[0]
            r2 = p2.add_run(w.get("transcription", ""))
            r2.font.size = Pt(9)
            r2.font.color.rgb = RGBColor(100, 116, 139)

            # Column 3: Translation
            row_cells[3].width = col_widths[3]
            set_cell_background(row_cells[3], bg_hex)
            set_cell_margins(row_cells[3], top=80, bottom=80, left=140, right=140)
            p3 = row_cells[3].paragraphs[0]
            r3 = p3.add_run(w.get("translation", ""))
            r3.font.size = Pt(9.5)
            r3.font.color.rgb = RGBColor(30, 41, 59)

        if b < num_batches - 1:
            doc.add_page_break()

    out_path = os.path.abspath("EnglishBreakfast_Word_Lists_Milestones.docx")
    doc.save(out_path)
    print(f"Document saved successfully at: {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    create_word_document()
