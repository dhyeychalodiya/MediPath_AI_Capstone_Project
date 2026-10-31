import os
import sys
import json
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

DOCX_OUTPUT_PATH = r"d:\MediPath_AI_Capstone\MediPath_AI_Capstone\Documentations\MediPath_AI_Complete_Handbook_Revised.docx"
DOCX_ROOT_PATH = r"d:\MediPath_AI_Capstone\MediPath_AI_Complete_Handbook_Revised.docx"
DIAGRAMS_DIR = r"d:\MediPath_AI_Capstone\MediPath_AI_Capstone\documentation_assets\diagrams"
MODEL_DIR = r"d:\MediPath_AI_Capstone\MediPath_AI_Capstone\backend\models\MedP_AI_V2.0"

# Colors
HEX_NAVY = "0F172A"       # Primary Headings
HEX_SLATE = "334155"      # Body / Secondary Headings
HEX_TEAL = "0D9488"       # Accent / Subheadings
HEX_BLUE = "2563EB"       # Primary Blue
HEX_LIGHT_BG = "F8FAFC"   # Zebra Table Row / Callout BG
HEX_BORDER = "CBD5E1"     # Table Border
HEX_CALLOUT_BORDER = "0D9488" # Teal Left Border
HEX_AMBER = "D97706"      # Warning
HEX_ROSE = "E11D48"       # Emergency

COLOR_NAVY = RGBColor(15, 23, 42)
COLOR_SLATE = RGBColor(51, 65, 85)
COLOR_TEAL = RGBColor(13, 148, 136)
COLOR_MUTED = RGBColor(100, 116, 139)

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(20)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(17)
    run.font.bold = True
    run.font.color.rgb = COLOR_NAVY
    # Add a thin bottom accent line or border
    pPr = h._p.get_or_add_pPr()
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="8" w:space="4" w:color="{HEX_TEAL}"/></w:pBdr>')
    pPr.append(pBdr)
    return h

def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(13.5)
    run.font.bold = True
    run.font.color.rgb = COLOR_TEAL
    return h

def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(10)
    h.paragraph_format.space_after = Pt(3)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = COLOR_NAVY
    return h

def add_para(doc, text="", bold_prefix="", space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = 'Calibri'
        r_b.font.size = Pt(10)
        r_b.font.bold = True
        r_b.font.color.rgb = COLOR_NAVY
    if text:
        r_t = p.add_run(text)
        r_t.font.name = 'Calibri'
        r_t.font.size = Pt(10)
        r_t.font.color.rgb = COLOR_SLATE
    return p

def add_bullet(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = 'Calibri'
        r_b.font.size = Pt(10)
        r_b.font.bold = True
        r_b.font.color.rgb = COLOR_NAVY
    if text:
        r_t = p.add_run(text)
        r_t.font.name = 'Calibri'
        r_t.font.size = Pt(10)
        r_t.font.color.rgb = COLOR_SLATE
    return p

def add_callout(doc, text, title="CLINICAL SAFETY DIRECTIVE", alert_type="note"):
    border_color = HEX_TEAL if alert_type == "note" else (HEX_AMBER if alert_type == "warning" else HEX_ROSE)
    bg_color = "F0FDFA" if alert_type == "note" else ("FFFBEB" if alert_type == "warning" else "FFF1F2")
    title_color = RGBColor(13, 148, 136) if alert_type == "note" else (RGBColor(217, 119, 6) if alert_type == "warning" else RGBColor(225, 29, 72))
    
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=150)
    
    # Left border only
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="none"/><w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/><w:bottom w:val="none"/><w:right w:val="none"/></w:tcBorders>')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    r_title = p.add_run(f"[{title}]\n")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(9.5)
    r_title.font.bold = True
    r_title.font.color.rgb = title_color
    
    r_body = p.add_run(text)
    r_body.font.name = 'Calibri'
    r_body.font.size = Pt(9.5)
    r_body.font.italic = True
    r_body.font.color.rgb = COLOR_SLATE

    # Spacer paragraph
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(4)

def add_figure(doc, filename, fig_title, fig_caption):
    image_path = os.path.join(DIAGRAMS_DIR, filename)
    if not os.path.exists(image_path):
        print(f"WARNING: Image not found: {image_path}")
        return
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(8)
    p_img.paragraph_format.space_after = Pt(4)
    run_img = p_img.add_run()
    run_img.add_picture(image_path, width=Inches(6.2))
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(0)
    p_cap.paragraph_format.space_after = Pt(10)
    
    r_num = p_cap.add_run(fig_title + ": ")
    r_num.font.name = 'Calibri'
    r_num.font.size = Pt(9)
    r_num.font.bold = True
    r_num.font.color.rgb = COLOR_NAVY
    
    r_desc = p_cap.add_run(fig_caption)
    r_desc.font.name = 'Calibri'
    r_desc.font.size = Pt(9)
    r_desc.font.italic = True
    r_desc.font.color.rgb = COLOR_MUTED

def add_table(doc, headers, data_rows, col_widths=None):
    table = doc.add_table(rows=len(data_rows) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Header Row
    hdr_cells = table.rows[0].cells
    for i, h_text in enumerate(headers):
        hdr_cells[i].text = h_text
        set_cell_background(hdr_cells[i], HEX_NAVY)
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        for r in p.runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(9)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            
    # Data Rows
    for r_idx, row_data in enumerate(data_rows):
        row_cells = table.rows[r_idx + 1].cells
        bg_col = HEX_LIGHT_BG if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].text = str(val)
            set_cell_background(row_cells[c_idx], bg_col)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            for r in p.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(8.5)
                r.font.color.rgb = COLOR_SLATE

    # Apply column widths if provided
    if col_widths and len(col_widths) == len(headers):
        for row in table.rows:
            for c_idx, w in enumerate(col_widths):
                row.cells[c_idx].width = Inches(w)
                
    # Add subtle border
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'<w:tblBorders {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/><w:left w:val="none"/><w:bottom w:val="single" w:sz="8" w:space="0" w:color="{HEX_NAVY}"/><w:right w:val="none"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/><w:insideV w:val="none"/></w:tblBorders>')
    tblPr.append(borders)

    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(6)

def add_code_block(doc, code_str):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/><w:left w:val="single" w:sz="16" w:space="0" w:color="{HEX_NAVY}"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/><w:right w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/></w:tcBorders>')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(code_str.strip())
    run.font.name = 'Consolas'
    run.font.size = Pt(8.5)
    run.font.color.rgb = COLOR_NAVY
    
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(4)

print("Docx builder foundation initialized successfully.")
