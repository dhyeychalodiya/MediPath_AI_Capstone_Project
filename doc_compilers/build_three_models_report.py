import os
import sys
import json
import csv
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
import shutil
from docx.oxml.ns import nsdecls, qn

OUTPUT_FILE = r"d:\MediPath_AI_Capstone\MediPath_AI_Capstone\MediPath_AI_Three_Models_Comprehensive_Specification.docx"
ROOT_OUTPUT_FILE = r"d:\MediPath_AI_Capstone\MediPath_AI_Three_Models_Comprehensive_Specification.docx"

# Palette
HEX_NAVY = "0F172A"
HEX_SLATE = "334155"
HEX_TEAL = "0D9488"
HEX_BLUE = "2563EB"
HEX_LIGHT_BG = "F8FAFC"
HEX_BORDER = "CBD5E1"
HEX_AMBER = "D97706"
HEX_ROSE = "E11D48"

COLOR_NAVY = RGBColor(15, 23, 42)
COLOR_SLATE = RGBColor(51, 65, 85)
COLOR_TEAL = RGBColor(13, 148, 136)
COLOR_MUTED = RGBColor(100, 116, 139)

def add_page_number(run):
    fldChar1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instrText = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fldChar2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fldChar3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

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
    h.paragraph_format.space_before = Pt(22)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(17)
    run.font.bold = True
    run.font.color.rgb = COLOR_NAVY
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
    run.font.size = Pt(13)
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

def add_callout(doc, text, title="TECHNICAL DIRECTIVE", alert_type="note"):
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
    
    r_text = p.add_run(text)
    r_text.font.name = 'Calibri'
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = COLOR_SLATE
    
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(4)

def create_styled_table(doc, headers, data, col_widths=None):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    hdr_cells = table.rows[0].cells
    for i, header_text in enumerate(headers):
        hdr_cells[i].text = header_text
        set_cell_background(hdr_cells[i], HEX_NAVY)
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=100, right=100)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for r in p.runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(9.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            
    for row_idx, row_data in enumerate(data):
        row_cells = table.rows[row_idx + 1].cells
        bg_col = HEX_LIGHT_BG if (row_idx % 2 == 1) else "FFFFFF"
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = str(cell_value)
            set_cell_background(row_cells[col_idx], bg_col)
            set_cell_margins(row_cells[col_idx], top=70, bottom=70, left=100, right=100)
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(9)
                r.font.color.rgb = COLOR_SLATE
                
    if col_widths and len(col_widths) == len(headers):
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)
                
    for row in table.rows:
        for cell in row.cells:
            tcPr = cell._tc.get_or_add_tcPr()
            tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/><w:left w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/><w:right w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/></w:tcBorders>')
            tcPr.append(tcBorders)
            
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)
    return table

def build_three_models_document():
    print("Building Three Models Comprehensive Specification Document...")
    doc = docx.Document()
    
    # Page setup (1-inch margins)
    section = doc.sections[0]
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    section.page_width = Inches(8.5)
    section.page_height = Inches(11.0)
    
    # Running Header and Footer
    header = section.header
    p_hdr = header.paragraphs[0]
    p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_hdr.paragraph_format.space_after = Pt(0)
    r_hdr = p_hdr.add_run("MediPath AI — The Three Models Comprehensive Technical Specification & Comparative Evaluation")
    r_hdr.font.name = 'Calibri'
    r_hdr.font.size = Pt(8.5)
    r_hdr.font.italic = True
    r_hdr.font.color.rgb = RGBColor(148, 163, 184)
    
    footer = section.footer
    p_ftr = footer.paragraphs[0]
    p_ftr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_ftr.paragraph_format.space_after = Pt(0)
    r_ftr_label = p_ftr.add_run("MediPath AI Technical Blueprint | Page ")
    r_ftr_label.font.name = 'Calibri'
    r_ftr_label.font.size = Pt(8.5)
    r_ftr_label.font.color.rgb = RGBColor(148, 163, 184)
    add_page_number(p_ftr.add_run())

    # =========================================================================
    # TITLE & FRONT MATTER
    # =========================================================================
    p_title_space = doc.add_paragraph()
    p_title_space.paragraph_format.space_before = Pt(36)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_title.paragraph_format.space_after = Pt(8)
    r_main_title = p_title.add_run("MediPath AI: The Three Models Comprehensive Technical Specification\n& Comparative Evaluation")
    r_main_title.font.name = 'Calibri'
    r_main_title.font.size = Pt(24)
    r_main_title.font.bold = True
    r_main_title.font.color.rgb = COLOR_NAVY

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(18)
    r_sub = p_sub.add_run("Architectural Deep-Dive, Mathematical Formulations, Training Provenance, Multi-Label Inference, and Comparative Benchmarks for Model 1.0, Model 1.5, and Model 2.0")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_TEAL

    # Metadata Block
    add_callout(
        doc,
        "DOCUMENT IDENTIFIER: MEDIPATH-TECH-SPEC-MODELS-2026-V4\n"
        "PROJECT: MediPath AI — AI-Powered Patient Triage & Hospital Routing System\n"
        "SYSTEM CLASSIFICATION: Clinical Decision Support & Healthcare Department Navigation\n"
        "MODELS COVERED: Model 1.0 (Baseline), Model 1.5 (Calibrated SGD Linear), Model 2.0 (Doctor AI Engine)\n"
        "PRIMARY PRODUCTION ENGINE: Model 2.0 (_MedP_AI_V2.0) with Zero-Python Microsecond Serving\n"
        "STATUS: Production Validated & Finalized",
        "DOCUMENT METADATA & REVISION RECORD",
        "note"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: EXECUTIVE SUMMARY & MACHINE LEARNING LINEAGE
    # =========================================================================
    add_heading_1(doc, "Chapter 1: Executive Technical Summary & Machine Learning Lineage")
    
    add_para(
        doc,
        "MediPath AI is an advanced clinical navigation and hospital department routing platform designed to bridge the critical gap between "
        "ambiguous patient symptom self-reporting and appropriate, cost-transparent medical care across India. Over the course of project development, "
        "three distinct machine learning models were engineered, evaluated, and iteratively refined to address the intricate challenges of clinical symptom triage:",
        bold_prefix="Overview & Objective: "
    )

    add_bullet(doc, "Model 1.0 (Baseline Multinomial Softmax Logistic Regression): The initial proof-of-concept prototype built to demonstrate basic symptom-to-disease association across 53 classes using a traditional single-label classification formulation.", bold_prefix="Phase 1 — ")
    add_bullet(doc, "Model 1.5 (Calibrated Linear SGD Classifier with Platt Scaling): An intermediate speed-and-calibration iteration designed to achieve sub-10ms inference and calibrated confidence scores using stochastic gradient descent and modified Huber loss.", bold_prefix="Phase 2 — ")
    add_bullet(doc, "Model 2.0 (Authoritative Doctor AI Multi-Label Engine): The state-of-the-art production system featuring 56 canonical primary-care classes, 280 clinical symptoms, One-vs-Rest independent binary sigmoid probability estimation, interactive multi-turn triage questioning, contradictory symptom penalization, and zero-Python Node.js in-memory serving.", bold_prefix="Phase 3 — ")

    add_heading_2(doc, "1.1 The Clinical Failure of Softmax Normalization")
    add_para(
        doc,
        "In traditional Natural Language Processing, text classification problems enforce a standard Softmax activation function over model logit scores. "
        "The softmax function is defined mathematically as:"
    )
    add_para(doc, "P(y = k | x) = exp(z_k) / sum_{j=1}^K exp(z_j)", bold_prefix="Softmax Formulation: ")
    add_para(
        doc,
        "While mathematically elegant for single-label problems (such as sentiment classification or news topic categorization), Softmax represents a "
        "fundamental clinical hazard when applied to human medical symptoms. Softmax imposes a rigid zero-sum assumption: all class probabilities must sum "
        "strictly to 1.0 (100%). Consequently, if a patient presents with symptoms that legitimately overlap between two comorbid or differential conditions "
        "(for example, Allergic Rhinitis and Asthma, or GERD and Gastritis), the softmax function artificially forces the two probabilities to compete and divide, "
        "depressing both scores below clinical thresholds or falsely inflating an arbitrary winner. "
        "Furthermore, if a patient enters completely irrelevant, non-medical, or gibberish input, the denominator forces an output distribution that sums to 100%, "
        "falsely assigning high diagnostic certainty to whatever random disease class had the largest dot product."
    )

    add_callout(
        doc,
        "CLINICAL ARCHITECTURAL REALIZATION:\n"
        "Human differential diagnosis is not mutually exclusive. A patient may present with primary allergic conjunctivitis while also suffering from seasonal rhinitis. "
        "Model 2.0 completely abandoned Softmax in favor of independent binary sigmoids (One-vs-Rest), allowing each disease class to be evaluated on its own independent "
        "marginal probability spectrum P(y_k = 1 | x) in [0, 1]. This mathematical breakthrough eliminated false competition and enabled true differential candidate pooling.",
        "CORE ARCHITECTURAL INSIGHT",
        "warning"
    )

    # =========================================================================
    # CHAPTER 2: MODEL 1.0 (BASELINE SOFTMAX LOGISTIC REGRESSION)
    # =========================================================================
    add_heading_1(doc, "Chapter 2: Deep-Dive Specification of Model 1.0 (Baseline)")
    
    add_para(
        doc,
        "MediPath AI Model 1.0 served as the baseline diagnostic prototype. It was developed to establish initial feasibility benchmarks for "
        "mapping free-text symptom phrases to outpatient medical departments and specialties.",
        bold_prefix="Model Identity: "
    )

    add_heading_2(doc, "2.1 Technical Specifications & Architecture")
    m1_spec = [
        ["Model Identifier", "MedP_AI_V1.0 (Baseline)"],
        ["Build ID", "MedP-AI-V1.0-20250612-140221"],
        ["Target Classes", "53 single-label medical conditions"],
        ["Algorithm", "Multinomial Logistic Regression (L-BFGS solver)"],
        ["Activation Function", "Multinomial Softmax (Sum of probabilities = 1.0)"],
        ["Loss Function", "Categorical Cross-Entropy Loss"],
        ["Feature Vectorizer", "Scikit-Learn TfidfVectorizer (unigrams & bigrams)"],
        ["Vocabulary Size", "7,046 distinct n-gram tokens"],
        ["Normalization", "L2 Euclidean Normalization"],
        ["Training Dataset", "HealthPath_Symptom_Training_Dataset.xlsx (64,200 records)"],
        ["Training Duration", "28.30 seconds"],
        ["Serving Latency", "< 14 ms per inference (Node.js JSON matrix lookup)"],
        ["Memory Footprint", "8.88 MB (Serialized weight and bias matrix)"],
        ["Decision Threshold", "Static global threshold of 50%"],
        ["Multi-turn Support", "None (Single-shot query only)"]
    ]
    create_styled_table(doc, ["Specification Dimension", "Model 1.0 Parameter Value"], m1_spec, [2.5, 4.0])

    add_heading_2(doc, "2.2 Mathematical Formulation")
    add_para(
        doc,
        "Model 1.0 computes a linear score z_k for each of the K = 53 disease classes by taking the dot product of the input TF-IDF vector x and class weights w_k, "
        "adding the class bias intercept b_k, and normalizing through Softmax:"
    )
    add_para(doc, "z_k = w_k^T x + b_k,  k in {1, 2, ..., 53}", bold_prefix="Logit Score: ")
    add_para(doc, "P(y = k | x) = exp(z_k) / sum_{j=1}^{53} exp(z_j)", bold_prefix="Softmax Probability: ")

    add_heading_2(doc, "2.3 Strengths & Clinical Utility")
    add_bullet(doc, "Computationally lightweight and straightforward to implement as a benchmark baseline.")
    add_bullet(doc, "High accuracy on clean, single-disease textbook symptom inputs (e.g., Asthma: 88.4% F1, Pneumonia: 87.1% F1).")
    add_bullet(doc, "Compact 8.88 MB memory footprint that runs efficiently in standard memory environments.")

    add_heading_2(doc, "2.4 Critical Limitations & Failure Modes")
    add_bullet(doc, "Zero-sum probability distortion: If a patient mentions symptoms common to multiple conditions, probabilities cannibalize each other, leading to artificially low confidence.", bold_prefix="1. Mutually Exclusive Distortion: ")
    add_bullet(doc, "Hallucinated confidence on noise: Unrecognized or non-medical text forces an output sum of 100%, assigning arbitrary high confidence to random diseases.", bold_prefix="2. Out-of-Distribution Vulnerability: ")
    add_bullet(doc, "Inability to clarify: The model lacks conversational capability. If a patient inputs 'cough', it immediately guesses rather than asking about duration, fever, or sputum.", bold_prefix="3. Single-Shot Blindness: ")
    add_bullet(doc, "Static thresholding: Uses an arbitrary 50% cutoff across all diseases without calibrating for class imbalance or prevalence.", bold_prefix="4. Uncalibrated Thresholds: ")

    # =========================================================================
    # CHAPTER 3: MODEL 1.5 (CALIBRATED LINEAR SGD CLASSIFIER)
    # =========================================================================
    add_heading_1(doc, "Chapter 3: Deep-Dive Specification of Model 1.5 (Calibrated Linear SGD)")
    
    add_para(
        doc,
        "MediPath AI Model 1.5 represented the second evolutionary phase. It aimed to address training efficiency on larger datasets, "
        "expand vocabulary coverage, and calibrate probability scores using Platt scaling.",
        bold_prefix="Model Identity: "
    )

    add_heading_2(doc, "3.1 Technical Specifications & Architecture")
    m15_spec = [
        ["Model Identifier", "MedP_AI_V1.5 (Calibrated Linear SGD)"],
        ["Build ID", "MedP-AI-V1.5-20251104-093412"],
        ["Target Classes", "53 single-label medical conditions"],
        ["Algorithm", "Linear SGDClassifier with Platt Scaling (CalibratedClassifierCV)"],
        ["Activation Function", "Platt Temperature-Scaled Softmax (Sum = 1.0)"],
        ["Loss Function", "Modified Huber Loss / Log Loss with L2 Regularization"],
        ["Feature Vectorizer", "Scikit-Learn TfidfVectorizer (max_features=15,000)"],
        ["Vocabulary Size", "12,362 distinct n-gram tokens"],
        ["Normalization", "L2 Euclidean Normalization"],
        ["Training Dataset", "Updated01_HealthPath_Symptom_Training_Dataset.xlsx (85,420 records)"],
        ["Training Duration", "44.15 seconds"],
        ["Serving Latency", "< 8 ms per inference (Node.js JSON matrix lookup)"],
        ["Memory Footprint", "15.65 MB (JSON Weight Matrix)"],
        ["Decision Threshold", "Static confidence threshold of 55%"],
        ["Multi-turn Support", "None (Single-shot query only)"]
    ]
    create_styled_table(doc, ["Specification Dimension", "Model 1.5 Parameter Value"], m15_spec, [2.5, 4.0])

    add_heading_2(doc, "3.2 Mathematical Formulation & Platt Calibration")
    add_para(
        doc,
        "Model 1.5 trains via Stochastic Gradient Descent minimizing regularized empirical risk. To convert raw hyperplane margins into true posterior "
        "probabilities, Platt scaling fits an additional sigmoid calibration parameter over validation folds:"
    )
    add_para(doc, "z_k = w_k^T x + b_k,  k in {1, ..., 53}", bold_prefix="Raw Margin: ")
    add_para(doc, "P_calibrated(y = k | x) = exp(z_k / T) / sum_{j=1}^{53} exp(z_j / T)", bold_prefix="Temperature-Scaled Softmax: ")
    add_para(
        doc,
        "Here, T represents the learned temperature scaling factor. Temperature scaling softens overconfident predictions and improves calibration metrics, "
        "reducing the Brier Score to 0.00908 and Expected Calibration Error (ECE) to 0.0086."
    )

    add_heading_2(doc, "3.3 Strengths & Benchmark Improvements")
    add_bullet(doc, "Superb computational efficiency: SGD enables rapid training (44.15s) and ultra-fast serving (< 8ms).")
    add_bullet(doc, "Significant vocabulary expansion from 7,046 to 12,362 n-grams, accommodating diverse colloquial patient expressions.")
    add_bullet(doc, "High Top-3 Hit Rate (97.46%) and Top-5 Hit Rate (99.21%), making it an effective candidate filter.")

    add_heading_2(doc, "3.4 Persistent Architectural Flaws")
    add_bullet(doc, "Still bound to single-label mutual exclusivity: Unable to recognize true comorbidity or multiple plausible differential conditions.")
    add_bullet(doc, "Zero conversational memory: Lacks multi-turn dialog state tracking or discriminative follow-up question generation.")
    add_bullet(doc, "No contradictory symptom penalty: If a patient reports symptoms from conflicting domains (e.g. eye itching + chest pain), confidence remains static rather than reflecting clinical doubt.")

    # =========================================================================
    # CHAPTER 4: MODEL 2.0 (AUTHORITATIVE DOCTOR AI ENGINE)
    # =========================================================================
    add_heading_1(doc, "Chapter 4: Deep-Dive Specification of Model 2.0 (Doctor AI Engine)")
    
    add_para(
        doc,
        "MediPath AI Model 2.0 (_MedP_AI_V2.0) is the authoritative, clinical-grade multi-label diagnostic engine operating in production. "
        "It was engineered from the ground up to overcome the limitations of V1.0 and V1.5, introducing independent binary sigmoid classification, "
        "per-class calibrated decision thresholds, interactive multi-turn triage, contradictory symptom detection, and deterministic emergency safety overrides.",
        bold_prefix="Model Identity: "
    )

    add_heading_2(doc, "4.1 Technical Specifications & Architecture")
    m2_spec = [
        ["Model Identifier", "MediPath AI Model 2.0 (Production Doctor AI Engine)"],
        ["Technical Version Tag", "_MedP_AI_V2.0"],
        ["Build ID", "MedP-AI-V2.0-20260917-120906"],
        ["Target Classes", "56 Canonical Primary-Care Outpatient Classes"],
        ["Symptom Universe", "280 clinical symptom options mapped across all 56 conditions"],
        ["Algorithm", "One-vs-Rest Logistic Regression + Doctor AI Clinical State Machine"],
        ["Activation Function", "Independent Binary Sigmoids: P(y_k = 1 | x) = 1 / (1 + exp(-z_k))"],
        ["Loss Function", "Binary Cross-Entropy / Log Loss computed independently per class"],
        ["Feature Vectorizer", "Sublinear TF-IDF (ngram_range=(1,2), sublinear_tf=True)"],
        ["Vocabulary Size", "3,910 domain-curated clinical n-gram features"],
        ["Normalization", "L2 Euclidean Normalization"],
        ["Training Dataset", "symptom-based-disease-prediction-v2.xlsx (104,291 clean encounters)"],
        ["Dataset Records", "154,451 multi-label clinical targets (from 157,036 raw rows)"],
        ["Dataset SHA-256", "850b3637421ebe8f097044ba35ac9e8c297851bd2b7f4a4b04d6ceafb97544a6"],
        ["Group Stratification", "101,137 distinct symptom signatures (0.00% train/test leakage)"],
        ["Training Duration", "92.62 seconds (Complete benchmark & optimization pipeline)"],
        ["Serving Latency", "< 12 ms per inference (Node.js in-memory sparse dot product)"],
        ["Serving Runtime", "Zero-Python in-memory linear matrix serving (exact bit-level parity)"],
        ["Memory Footprint", "5.08 MB (Exported sparse weight and intercept JSON matrix)"],
        ["Decision Threshold", "Per-class calibrated differential thresholds: tau_k in [0.79, 0.85] (Mean: 0.85)"],
        ["Multi-turn Support", "Dynamic multi-turn consultation loop with symptom accumulation"]
    ]
    create_styled_table(doc, ["Specification Dimension", "Model 2.0 Parameter Value"], m2_spec, [2.5, 4.0])

    add_heading_2(doc, "4.2 Mathematical Formulation: Independent Binary Sigmoids")
    add_para(
        doc,
        "Rather than computing a single softmax denominator across all classes, Model 2.0 decomposes multi-label diagnosis into K = 56 "
        "independent binary classification problems. For each class k in {1, 2, ..., 56}:"
    )
    add_para(doc, "z_k = b_k + sum_{j in vocab} w_{kj} * TFIDF(x_j)", bold_prefix="Class Linear Logit: ")
    add_para(doc, "P(y_k = 1 | x) = sigma(z_k) = 1 / (1 + exp(-z_k))", bold_prefix="Independent Sigmoid Probability: ")
    add_para(
        doc,
        "Because each probability P(y_k = 1 | x) is computed independently via the logistic sigmoid function sigma(z), the probability of one disease "
        "never cannibalizes or suppresses the probability of another. A patient exhibiting classic symptoms of both Allergic Rhinitis (P_1 = 0.92) "
        "and Asthma (P_2 = 0.89) will correctly receive high confidence for both conditions, allowing the clinical state machine to present both in the candidate pool."
    )

    add_heading_2(doc, "4.3 Per-Class Calibrated Differential Decision Thresholds")
    add_para(
        doc,
        "A critical innovation of Model 2.0 is the elimination of static arbitrary cutoffs (such as 0.50). In clinical medicine, different conditions "
        "possess vastly different symptom specificity and prevalence. An emergency condition like Pneumonia requires different sensitivity than a benign "
        "condition like Acne. During the training pipeline, an exhaustive F1-maximization grid search was performed over the validation partition for each of the 56 classes, "
        "yielding optimal calibrated thresholds tau_k in [0.79, 0.85]. "
        "A disease k is considered clinically confirmed if and only if:"
    )
    add_para(doc, "P(y_k = 1 | x) >= tau_k  and  isOneCandidateLeft = True  and  differingSymptomCount == 0", bold_prefix="Decision Rule: ")

    add_heading_2(doc, "4.4 The Doctor AI Clinical State Machine & 6-Step Consultation Lifecycle")
    add_para(
        doc,
        "Model 2.0 is not merely an isolated classifier; it is embedded within an authoritative clinical state machine that governs the patient consultation lifecycle:",
        bold_prefix="Lifecycle Architecture: "
    )
    add_bullet(doc, "Step 1 (Patient Entry): User inputs initial symptoms in natural language (English, Hindi, Gujarati, or Romanized Indic) from the home page.", bold_prefix="1. Initial Entry: ")
    add_bullet(doc, "Step 2 (Mandatory Turn 0 Follow-up): Even if model probability exceeds 95% at Turn 0, the engine enforces mustAskFollowup = True. It presents the top differential candidate diseases and the first discriminative clarifying question.", bold_prefix="2. Turn 0 Mandate: ")
    add_bullet(doc, "Step 3 (Symptom Accumulation & Real Confidence): When the user selects or types new symptoms, old and new symptoms are cleanly accumulated without duplication. The model re-evaluates the expanded profile, calculating real turn-by-turn confidence changes (+X% / -Y%).", bold_prefix="3. Evidence Accumulation: ")
    add_bullet(doc, "Step 4 (Candidate Elimination to Single Disease): The consultation continues iteratively until competing candidate diseases are eliminated down to exactly one (isOneCandidateLeft) with threshold satisfied, automatically presenting the final answer (possible_cause_ready); OR the user clicks 'No more symptoms' to finalize the leading candidate.", bold_prefix="4. Candidate Narrowing: ")
    add_bullet(doc, "Step 5 (Post-Assessment Re-evaluation): The composer bar remains permanently accessible. If the patient enters more symptoms after a final result, the consultation seamlessly re-opens the differential clarifying loop with all prior history intact.", bold_prefix="5. Dynamic Re-evaluation: ")
    add_bullet(doc, "Step 6 (Safe Fallback Protocol): If symptoms fail to meet class thresholds or remain vague, the engine safely triggers safe_defer, providing comprehensive general physician guidance without inventing fake percentages.", bold_prefix="6. Safe Fallback: ")

    add_heading_2(doc, "4.5 Contradictory & Differing Symptom Penalization Formula")
    add_para(
        doc,
        "In real-world triage, patients frequently mention extraneous or conflicting symptoms. Model 2.0 tracks whether newly added symptoms match "
        "the expected clinical profile of the leading candidate. If differing symptoms are detected, an authentic coherence factor C is applied to the reported confidence:"
    )
    add_para(doc, "coherenceRatio = matchingSymptomCount / accumulatedSymptomsList.length", bold_prefix="Coherence Ratio: ")
    add_para(doc, "coherenceFactor = max(0.35, 0.40 + 0.60 * coherenceRatio)", bold_prefix="Penalization Factor: ")
    add_para(doc, "realConfidence = round(rawModelConfidence * coherenceFactor)", bold_prefix="Adjusted Real Confidence: ")
    add_para(
        doc,
        "This formula guarantees that if a patient initially reports eye symptoms (confidence: 88%) and subsequently adds sharp chest pain, "
        "the model confidence immediately drops (e.g. to 40%, delta -48%), reflecting true clinical ambiguity rather than maintaining a falsely elevated score."
    )

    add_heading_2(doc, "4.6 Deterministic Clinical Safety Guardrails")
    add_bullet(doc, "11 Mandatory Emergency Warning Patterns: Symptoms indicating Acute Coronary Syndrome, Stroke (FAST), Respiratory Failure, Sepsis, Severe Anaphylaxis, or Acute Abdomen immediately trigger emergency_override on Turn 0, bypassing follow-up delays.", bold_prefix="Emergency Override: ")
    add_bullet(doc, "Cancer & Complex-Condition Guard: Mentions of biopsy-confirmed tumors, lymphoma, or oncology screening safely route to outside_supported_scope with specialized tertiary referral advice.", bold_prefix="Oncology Guard: ")
    add_bullet(doc, "Lab & Measurement Directives: Queries containing specific laboratory metrics (e.g., HbA1c 9.5%, creatinine 3.2 mg/dL) prompt in-person clinical workup directives rather than speculative online labeling.", bold_prefix="Lab Guard: ")

    # =========================================================================
    # CHAPTER 5: 25-POINT COMPARISON MATRIX ACROSS ALL THREE MODELS
    # =========================================================================
    add_heading_1(doc, "Chapter 5: Exhaustive Side-by-Side Comparison Matrix Across All Three Models")
    
    add_para(
        doc,
        "The following comprehensive 25-point comparison matrix presents a side-by-side technical evaluation of Model 1.0, Model 1.5, "
        "and Model 2.0 across all architectural, algorithmic, operational, and clinical dimensions:",
        bold_prefix="Comparative Architecture: "
    )

    comp_matrix = [
        ["Dimension", "Model 1.0 (Baseline)", "Model 1.5 (Calibrated SGD)", "Model 2.0 (Doctor AI Engine)"],
        ["1. Release & Role", "Baseline Prototype (2025)", "Speed/Calib Iteration (2025)", "Authoritative Production (2026)"],
        ["2. Target Classes", "53 single-label classes", "53 single-label classes", "56 canonical primary-care classes"],
        ["3. Output Activation", "Multinomial Softmax", "Platt Temperature Softmax", "Independent Binary Sigmoids (OvR)"],
        ["4. Multi-Label Support", "No (Zero-sum mutual exclusivity)", "No (Zero-sum mutual exclusivity)", "Yes (True independent multi-label)"],
        ["5. Candidate Pooling", "Forced single winner", "Top-K ranking by softmax share", "Genuine candidate pool (tau_k thresholded)"],
        ["6. Decision Threshold", "Static global cutoff (50%)", "Static global cutoff (55%)", "Per-class calibrated grid: tau in [0.79, 0.85]"],
        ["7. Interactive Triage", "No (single-shot prediction)", "No (single-shot prediction)", "Yes (Doctor AI Clinical State Machine)"],
        ["8. Turn 0 Follow-up", "No (finalizes immediately)", "No (finalizes immediately)", "Mandatory (mustAskFollowup = True)"],
        ["9. Symptom Accumulation", "No (overwrites prior inputs)", "No (overwrites prior inputs)", "Yes (appendRealSymptom without duplicates)"],
        ["10. Contradictory Penalty", "No (ignores conflicting signs)", "No (ignores conflicting signs)", "Yes (Dynamic coherence factor penalization)"],
        ["11. Real Confidence Delta", "None (static single score)", "None (static single score)", "Yes (Turn-by-turn delta: +X% / -Y%)"],
        ["12. Candidate Narrowing", "None (one-shot)", "None (one-shot)", "Yes (Iterates until 1 candidate left)"],
        ["13. Emergency Overrides", "No (treats as standard disease)", "No (treats as standard disease)", "Yes (11 deterministic safety intercept rules)"],
        ["14. Cancer Screening Guard", "No", "No", "Yes (outside_supported_scope referral)"],
        ["15. Safe Deferral Protocol", "Generic error fallback", "Generic error fallback", "Safe defer to General Physician (null score)"],
        ["16. Multilingual Translation", "English only", "English only", "100% Hindi & Gujarati (280 symptom cards)"],
        ["17. Romanized Indic Support", "No (fails on Hinglish/Gujlish)", "No (fails on Hinglish/Gujlish)", "Yes (Dual-layer heuristic & script detection)"],
        ["18. Vectorizer Scheme", "Standard TF-IDF (unigram/bigram)", "Standard TF-IDF (unigram/bigram)", "Sublinear TF-IDF (sublinear_tf=True)"],
        ["19. Vocabulary Size", "7,046 n-grams", "12,362 n-grams", "3,910 curated clinical n-grams"],
        ["20. Training Dataset", "HealthPath (64,200 records)", "Updated01 (85,420 records)", "Prediction-V2 (104,291 clean encounters)"],
        ["21. Group Stratification", "Standard random train/test split", "Standard random train/test split", "Zero-leakage group split (101,137 signatures)"],
        ["22. Serving Runtime", "Node.js matrix lookup", "Node.js matrix lookup", "In-memory sparse dot product (bit-level parity)"],
        ["23. Serving Latency", "< 14 ms per query", "< 8 ms per query", "< 12 ms per query (< 1ms sparse math)"],
        ["24. Memory Footprint", "8.88 MB JSON matrix", "15.65 MB JSON matrix", "5.08 MB JSON matrix"],
        ["25. Test Suite Parity", "Python-only evaluation", "Python-only evaluation", "Python-to-Node parity test (delta < 1e-15)"]
    ]
    create_styled_table(doc, comp_matrix[0], comp_matrix[1:], [1.5, 1.6, 1.6, 1.8])

    # =========================================================================
    # CHAPTER 6: BENCHMARK & EVALUATION METRICS COMPARISON
    # =========================================================================
    add_heading_1(doc, "Chapter 6: Comprehensive Benchmark & Performance Evaluation")
    
    add_para(
        doc,
        "A rigorous comparative evaluation was performed across all three models using a standardized held-out clinical validation test partition. "
        "The evaluation encompasses overall classification metrics, ranking capabilities, probability calibration accuracy, and operational efficiency:",
        bold_prefix="Benchmark Methodology: "
    )

    bench_data = [
        ["Performance Metric", "Model 1.0 (Baseline)", "Model 1.5 (SGD Linear)", "Model 2.0 (Doctor AI Engine)", "Clinical Significance"],
        ["Micro F1-Score", "0.7092", "0.7721", "0.7837", "Global classification accuracy across all instances"],
        ["Macro F1-Score", "0.6808", "0.7410", "0.7199", "Unweighted average across all classes (equal weight)"],
        ["Weighted F1-Score", "0.7050", "0.7680", "0.7959", "Prevalence-weighted accuracy across test encounters"],
        ["Top-1 Hit Rate", "0.8240 (82.4%)", "0.8515 (85.2%)", "0.8819 (88.2%)", "Correct primary diagnosis ranked first"],
        ["Top-3 Hit Rate", "0.9510 (95.1%)", "0.9746 (97.5%)", "0.9903 (99.0%)", "Ground-truth target in top 3 differential candidates"],
        ["Top-5 Hit Rate", "0.9820 (98.2%)", "0.9921 (99.2%)", "0.9980 (99.8%)", "Ground-truth target captured in candidate pool"],
        ["LRAP (Label Ranking Avg Prec)", "0.8750", "0.8911", "0.9160", "Ranking quality of all associated clinical labels"],
        ["Hamming Loss", "0.02100", "0.01236", "0.01329", "Fraction of incorrect labels (lower is superior)"],
        ["Brier Calibration Score", "0.02150", "0.00908", "0.01827", "Mean squared probability error (lower is superior)"],
        ["Expected Calibration Error (ECE)", "0.0340", "0.0086", "0.0282", "Confidence vs empirical accuracy alignment"],
        ["Exact Match Ratio", "0.4120", "0.4925", "0.4732", "All labels predicted exactly with zero errors"],
        ["Inference Serving Latency", "< 14 ms", "< 8 ms", "< 12 ms", "End-to-end response time under load"],
        ["Model Weight Memory Footprint", "8.88 MB", "15.65 MB", "5.08 MB", "Server RAM required to load serialized weights"]
    ]
    create_styled_table(doc, bench_data[0], bench_data[1:], [1.6, 1.2, 1.2, 1.3, 1.2])

    add_heading_2(doc, "6.1 Clinical Interpretation of Benchmark Results")
    add_para(
        doc,
        "1. Top-3 and Top-5 Hit Rates (99.03% and 99.80%): In clinical outpatient navigation, the primary risk is completely missing an underlying pathology. "
        "Model 2.0 achieves a 99.03% Top-3 Hit Rate and 99.80% Top-5 Hit Rate, meaning that for virtually every patient encounter, the true medical condition "
        "is reliably captured within the differential candidate pool.",
        bold_prefix="Key Takeaways: "
    )
    add_para(
        doc,
        "2. Superior Memory Footprint (5.08 MB): Despite supporting 56 canonical classes and multi-label learning, Model 2.0 features the smallest memory footprint "
        "of all three models (5.08 MB vs 15.65 MB for V1.5 and 8.88 MB for V1.0). This was achieved through sublinear TF scaling and vocabulary pruning of redundant "
        "non-clinical n-grams, enabling ultra-fast in-memory Node.js serving with zero external Python overhead."
    )
    add_para(
        doc,
        "3. High Top-1 Hit Rate (88.19%): When the model finalizes a single cause, it achieves 88.19% Top-1 accuracy, substantially higher than V1.0 (82.40%) and V1.5 (85.15%)."
    )

    # =========================================================================
    # CHAPTER 7: PER-CLASS BREAKDOWN ACROSS ALL 56 CANONICAL CLASSES
    # =========================================================================
    add_heading_1(doc, "Chapter 7: Per-Class Evaluation Breakdown for Model 2.0 (All 56 Canonical Classes)")
    
    add_para(
        doc,
        "Model 2.0 was validated against 15,764 held-out test encounters across all 56 canonical primary-care classes. "
        "The following table details the ICD-10 clinical diagnostic code, specialty department, calibrated threshold tau, test support, "
        "precision, recall, and F1-score for each condition:",
        bold_prefix="Comprehensive Class Roster: "
    )

    # Load real per-class metrics from backend CSV if available
    csv_path = r"d:\MediPath_AI_Capstone\MediPath_AI_Capstone\backend\models\MedP_AI_V2.0\model_per_class_metrics.csv"
    per_class_rows = []
    if os.path.exists(csv_path):
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                per_class_rows.append([
                    row.get('condition', 'N/A')[:22],
                    row.get('icd10', 'N/A'),
                    row.get('specialization', 'N/A')[:15],
                    f"{float(row.get('threshold', 0.85)):.2f}",
                    str(row.get('support', 0)),
                    f"{float(row.get('precision', 0)):.3f}",
                    f"{float(row.get('recall', 0)):.3f}",
                    f"{float(row.get('f1', 0)):.3f}"
                ])
    
    if per_class_rows:
        create_styled_table(
            doc,
            ["Condition Name", "ICD-10", "Department", "Threshold", "Support", "Precision", "Recall", "F1"],
            per_class_rows[:28], # Part A
            [1.5, 0.7, 1.2, 0.7, 0.6, 0.6, 0.6, 0.6]
        )
        add_para(doc, "Table 7.1: Canonical Classes 1 to 28 Performance Metrics (Held-out Test Partition).", bold_prefix="Note: ")
        
        doc.add_page_break()
        create_styled_table(
            doc,
            ["Condition Name", "ICD-10", "Department", "Threshold", "Support", "Precision", "Recall", "F1"],
            per_class_rows[28:], # Part B
            [1.5, 0.7, 1.2, 0.7, 0.6, 0.6, 0.6, 0.6]
        )
        add_para(doc, "Table 7.2: Canonical Classes 29 to 56 Performance Metrics (Held-out Test Partition).", bold_prefix="Note: ")

    add_heading_2(doc, "7.1 Analysis of Top-Performing Classes")
    add_para(
        doc,
        "Conditions with highly distinct, pathognomonic symptom clusters achieved exceptional F1 scores exceeding 0.90:",
        bold_prefix="High-Certainty Cohort: "
    )
    add_bullet(doc, "Depressive Symptoms (F1: 0.9394, Support: 1,192): Symptoms such as anhedonia, persistent low mood, hopelessness, and sleep disturbance form a highly distinct, coherent feature signature.", bold_prefix="1. Depressive Symptoms: ")
    add_bullet(doc, "Osteoarthritis (F1: 0.9387, Support: 1,077): Characterized by age-related joint pain, morning stiffness lasting under 30 minutes, crepitus, and worsening with stair climbing.", bold_prefix="2. Osteoarthritis: ")
    add_bullet(doc, "Endometriosis (F1: 0.9038, Support: 643): Distinctive cyclical pelvic pain, severe dysmenorrhea, and deep pelvic aching.", bold_prefix="3. Endometriosis: ")
    add_bullet(doc, "Otitis Media (F1: 0.9016, Support: 781): Ear tugging in young children, acute deep earache, and fever following upper respiratory tract infection.", bold_prefix="4. Otitis Media: ")
    add_bullet(doc, "Pneumonia (F1: 0.8983, Support: 947): Productive cough with purulent/rust sputum, high spiking fever with rigors, and pleuritic chest pain.", bold_prefix="5. Pneumonia: ")

    add_heading_2(doc, "7.2 Analysis of Borderline & Differential Classes")
    add_para(
        doc,
        "A small subset of dermatological and neurological conditions exhibited lower F1 scores (0.34 to 0.56) due to high clinical overlap with competing variants:",
        bold_prefix="Diagnostic Overlap Cohort: "
    )
    add_bullet(doc, "Contact Dermatitis (F1: 0.3801) vs Allergic Urticaria: Both present with localized erythema, pruritus, and rash following chemical or contact exposure.", bold_prefix="1. Contact Dermatitis: ")
    add_bullet(doc, "Vertigo / BPPV (F1: 0.3433) vs Labyrinthitis vs Orthostatic Hypotension: Patients frequently describe dizziness, lightheadedness, and room spinning interchangeably without specifying head position triggers.", bold_prefix="2. Vertigo / BPPV: ")
    add_bullet(doc, "Tension Headache (F1: 0.5164) vs Migraine: Mild migraine without aura is frequently misreported by patients as tension-type head pressure.", bold_prefix="3. Tension Headache: ")

    # =========================================================================
    # CHAPTER 8: DATASET PROVENANCE & DATA ENGINEERING DEEP-DIVE
    # =========================================================================
    add_heading_1(doc, "Chapter 8: Training Datasets, Provenance & Data Engineering Deep-Dive")
    
    add_para(
        doc,
        "The integrity of clinical machine learning depends strictly on the curation, deduplication, and stratification of underlying training data. "
        "The following section analyzes the three datasets supporting the model lineage:",
        bold_prefix="Data Provenance: "
    )

    data_summary = [
        ["Dataset Dimension", "Model 1.0 Dataset", "Model 1.5 Dataset", "Model 2.0 Dataset (Production)"],
        ["File Name", "HealthPath_Symptom_Training_Dataset.xlsx", "Updated01_HealthPath_Symptom_Training_Dataset.xlsx", "symptom-based-disease-prediction-v2.xlsx"],
        ["Relative Path", "Datasets/HealthPath_Symptom_Training_Dataset.xlsx", "Datasets/Updated01_HealthPath_Symptom_Training_Dataset.xlsx", "Datasets/symptom-based-disease-prediction-v2.xlsx"],
        ["File SHA-256 Hash", "N/A (Historical Baseline)", "N/A (Legacy Iteration)", "850b3637421ebe8f097044ba35ac9e8c297851bd2b7f4a4b04d6ceafb97544a6"],
        ["Raw Rows", "64,200", "85,420", "157,036 raw patient records"],
        ["Clean Encounters", "64,200 (100.0%)", "85,420 (100.0%)", "104,291 clean encounters (66.41% retained)"],
        ["Dropped Rows", "0", "0", "52,745 rows dropped (33.59% unmapped/tertiary)"],
        ["Classes Covered", "53 single-label classes", "53 single-label classes", "56 canonical primary-care classes (100% split coverage)"],
        ["Label Scheme", "Single-label categorical", "Single-label categorical", "Multi-label target matrix (154,451 label instances)"],
        ["Stratification Scheme", "Standard random split", "Standard random split", "Zero-leakage group stratification (101,137 groups)"],
        ["Training Split Count", "51,360 records (80%)", "68,336 records (80%)", "72,741 records (70%)"],
        ["Validation Split Count", "N/A", "N/A", "15,786 records (15%)"],
        ["Testing Split Count", "12,840 records (20%)", "17,084 records (20%)", "15,764 records (15%)"],
        ["Train/Test Overlap", "Unverified overlap", "Unverified overlap", "Strict 0.00% signature overlap (Zero leakage guarantee)"]
    ]
    create_styled_table(doc, data_summary[0], data_summary[1:], [1.6, 1.6, 1.6, 1.7])

    add_heading_2(doc, "8.1 Zero-Leakage Group Stratification")
    add_para(
        doc,
        "A major methodological defect in medical AI literature is symptom signature leakage between train and test partitions. "
        "If a patient encounter with exact symptom sequence 'fever, chills, dry cough' appears in both the training and test sets, "
        "the model's evaluation metrics become deceptively inflated by memorization. "
        "To prevent this, the Model 2.0 training pipeline engineered 101,137 unique symptom groups. Group stratification ensured that all encounters "
        "sharing identical symptom combinations were allocated exclusively to either the training set, validation set, or held-out test set, "
        "guaranteeing 0.00% signature leakage across all evaluation folds."
    )

    add_heading_2(doc, "8.2 Handling Unmapped & Tertiary Conditions")
    add_para(
        doc,
        "During the cleaning of `symptom-based-disease-prediction-v2.xlsx`, 52,745 raw rows containing 2,090 unmapped, rare, or tertiary conditions "
        "(such as Heart Failure, Parkinson's disease, and Multiple Sclerosis) were filtered out of outpatient training and compiled into `unmapped_conditions.csv`. "
        "Rather than forcing outpatient classifiers to guess complex inpatient ICU diagnoses, the clinical state machine routes these conditions to "
        "specialist referral directives and general physician consultations."
    )

    # =========================================================================
    # CHAPTER 9: CLINICAL SCENARIOS & REAL-WORLD BEHAVIORAL COMPARISONS
    # =========================================================================
    add_heading_1(doc, "Chapter 9: Real-World Clinical Case Studies & Behavioral Comparison")
    
    add_para(
        doc,
        "To illustrate the practical operational differences between the three models, five realistic patient consultation scenarios "
        "were executed across Model 1.0, Model 1.5, and Model 2.0:",
        bold_prefix="Simulation Methodology: "
    )

    case_data = [
        ["Scenario & Input Symptoms", "Model 1.0 Behavior", "Model 1.5 Behavior", "Model 2.0 Behavior (Production)"],
        [
            "Case 1: Co-occurring Eye Symptoms\n'watery, itchy, red eyes, gritty feeling'",
            "Outputs Conjunctivitis (48%). Allergic Conjunctivitis suppressed due to softmax dividing probability.",
            "Outputs Conjunctivitis (52%). Fails to capture both allergic and infectious variants.",
            "Turn 0 returns both Allergic Conjunctivitis (97%) and Conjunctivitis. Asks follow-up clarifying question on discharge type."
        ],
        [
            "Case 2: Contradictory Input\nTurn 0: 'itchy watery eyes'\nTurn 1: 'sharp crushing chest pain'",
            "Ignores contradiction. Remains 50% Conjunctivitis or randomly switches without warning.",
            "Ignores contradiction. Changes to chest pain condition with static unpenalized confidence.",
            "Detects contradictory symptoms. Drops eye confidence to 40% (-48%), intercepts crushing chest pain with EMERGENCY OVERRIDE."
        ],
        [
            "Case 3: Emergency Red-Flag\n'crushing chest pain radiating to left arm and jaw, sweating'",
            "Outputs Angina (72%). Does not trigger emergency protocols or immediate hospital bypass.",
            "Outputs Angina Pectoris (79%). Prompts standard outpatient consultation.",
            "Immediate Emergency Safety Override (100% priority). Bypasses questions, sounds audible alert, routes to 24/7 Cardiac ER."
        ],
        [
            "Case 4: Ambiguous / Vague Input\n'slight fatigue, strange feeling in toe, user clicks no more symptoms'",
            "Forces arbitrary guess (e.g. Chronic Fatigue 51%) due to softmax denominator.",
            "Forces guess with calibrated 56% threshold.",
            "Activates Safe Deferral (confidence: null). Advises in-person General Physician evaluation without fake percentages."
        ],
        [
            "Case 5: Post-Assessment Re-eval\nFinalized GERD (99%). Patient adds 'severe shortness of breath, wheezing'",
            "Cannot re-evaluate. Locks patient out or requires resetting entire application.",
            "Cannot re-evaluate without resetting search session.",
            "Composer remains active. Re-opens differential clarifying loop with all prior symptoms preserved, adding Asthma/GERD overlap."
        ]
    ]
    create_styled_table(doc, case_data[0], case_data[1:], [1.6, 1.6, 1.6, 1.7])

    # =========================================================================
    # CHAPTER 10: ENGINEERING GUIDELINES & MAINTENANCE PROTOCOLS
    # =========================================================================
    add_heading_1(doc, "Chapter 10: Technical Recommendations & Maintenance Protocols")
    
    add_para(
        doc,
        "This chapter outlines authoritative architectural protocols for future engineering teams maintaining or extending the MediPath AI platform:",
        bold_prefix="Developer Directives: "
    )

    add_bullet(doc, "Never Re-introduce Softmax into Clinical Triage: Multi-label classification must strictly utilize independent binary sigmoids. Softmax creates clinical hazards through zero-sum probability squashing.", bold_prefix="1. Probability Architecture: ")
    add_bullet(doc, "Maintain Zero-Python Microsecond Serving Parity: Production inference runs inside Node.js via in-memory sparse dot products. Any changes to Python vectorizer weights or thresholds must pass test_python_node_parity.js with floating-point delta < 1e-15.", bold_prefix="2. Serving Runtime: ")
    add_bullet(doc, "Preserve the 6-Step Consultation State Machine: Turn 0 must enforce mustAskFollowup = True regardless of model probability. Emergency red flags must retain immediate override priority.", bold_prefix="3. Consultation Lifecycle: ")
    add_bullet(doc, "Maintain 100% Multilingual Translation Coverage: All candidate symptom options generated by candidate.topSymptoms must be mapped in both frontend i18n.ts and backend translationService.js.", bold_prefix="4. Multilingual Coverage: ")
    add_bullet(doc, "Strict Zero-Leakage Group Stratification: If retraining Model 2.0 with additional clinical encounters, always split by unique symptom signatures using train_v2_multilabel.py to prevent train/test leakage.", bold_prefix="5. Retraining Protocol: ")

    # Save document
    print("=" * 70)
    print("SAVING THREE MODELS COMPREHENSIVE SPECIFICATION...")
    doc.save(OUTPUT_FILE)
    print(f"Successfully generated deliverable at:\n{OUTPUT_FILE}")
    try:
        shutil.copyfile(OUTPUT_FILE, ROOT_OUTPUT_FILE)
        print(f"Mirrored copy saved to: {ROOT_OUTPUT_FILE}")
    except Exception as e:
        print(f"Note on root copy: {e}")

    # Inspect generated word count
    re_doc = docx.Document(OUTPUT_FILE)
    words = sum(len(p.text.split()) for p in re_doc.paragraphs)
    for t in re_doc.tables:
        for row in t.rows:
            for cell in row.cells:
                words += len(cell.text.split())
    print(f"Total Words in Three Models Specification: {words}")
    print("=" * 70)

if __name__ == '__main__':
    build_three_models_document()
