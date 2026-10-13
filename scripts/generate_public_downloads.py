from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "downloads"
LOGO = ROOT / "src" / "assets" / "SCHOOL_LOGO.png"

PURPLE = colors.HexColor("#5B2FD0")
PURPLE_DARK = colors.HexColor("#21145F")
PURPLE_SOFT = colors.HexColor("#F3EFFF")
ORANGE = colors.HexColor("#FF852C")
INK = colors.HexColor("#17133D")
MUTED = colors.HexColor("#676477")
LINE = colors.HexColor("#E4DFF0")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="DocTitle",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=18,
    leading=22,
    textColor=INK,
    alignment=TA_LEFT,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="Section",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=11,
    leading=14,
    textColor=PURPLE_DARK,
    spaceBefore=10,
    spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="BodySmall",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9.2,
    leading=14,
    textColor=MUTED,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="Note",
    parent=styles["BodyText"],
    fontName="Helvetica-Bold",
    fontSize=8.5,
    leading=12,
    textColor=PURPLE_DARK,
    backColor=PURPLE_SOFT,
    borderColor=LINE,
    borderWidth=0.6,
    borderPadding=9,
    spaceBefore=10,
    spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="Footer",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=7.5,
    leading=10,
    textColor=colors.HexColor("#777384"),
    alignment=TA_CENTER,
))


def page_decorator(title):
    def draw(canvas, doc):
        width, height = A4
        canvas.saveState()
        canvas.setFillColor(PURPLE_DARK)
        canvas.rect(0, height - 31 * mm, width, 31 * mm, stroke=0, fill=1)
        canvas.setFillColor(PURPLE)
        canvas.rect(width - 48 * mm, height - 31 * mm, 48 * mm, 31 * mm, stroke=0, fill=1)
        if LOGO.exists():
            canvas.drawImage(str(LOGO), 17 * mm, height - 25 * mm, 18 * mm, 18 * mm, preserveAspectRatio=True, mask="auto")
        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 14)
        canvas.drawString(40 * mm, height - 14 * mm, "UHS Phurhuriya Paraiya")
        canvas.setFillColor(colors.HexColor("#DCD4F5"))
        canvas.setFont("Helvetica", 8.5)
        canvas.drawString(40 * mm, height - 20 * mm, "Paraiya, Gaya, Bihar | Academic Session 2026-27")
        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.drawCentredString(width - 24 * mm, height - 16 * mm, "PROTOTYPE")
        canvas.setFont("Helvetica", 7)
        canvas.drawCentredString(width - 24 * mm, height - 21 * mm, "SAMPLE DOCUMENT")
        canvas.setStrokeColor(LINE)
        canvas.line(17 * mm, 17 * mm, width - 17 * mm, 17 * mm)
        canvas.setFillColor(colors.HexColor("#777384"))
        canvas.setFont("Helvetica", 7.2)
        canvas.drawString(17 * mm, 11 * mm, "UDISE+ Code: 10350704604")
        canvas.drawRightString(width - 17 * mm, 11 * mm, f"{title} | Page {doc.page}")
        canvas.restoreState()
    return draw


def build_pdf(filename, title, subtitle, story):
    path = OUTPUT / filename
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=39 * mm,
        bottomMargin=23 * mm,
        title=title,
        author="UHS Phurhuriya Paraiya",
        subject="Prototype public download",
    )
    opening = [
        Paragraph(title, styles["DocTitle"]),
        Paragraph(subtitle, styles["BodySmall"]),
        Spacer(1, 5),
    ]
    doc.build(opening + story, onFirstPage=page_decorator(title), onLaterPages=page_decorator(title))
    return path


def styled_table(rows, widths, header=True):
    table = Table(rows, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR", (0, 0), (-1, -1), MUTED),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("ROWBACKGROUNDS", (0, 1 if header else 0), (-1, -1), [colors.white, colors.HexColor("#FAF9FD")]),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]
    if header:
        commands.extend([
            ("BACKGROUND", (0, 0), (-1, 0), PURPLE_DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ])
    table.setStyle(TableStyle(commands))
    return table


def make_documents():
    OUTPUT.mkdir(parents=True, exist_ok=True)

    checklist_rows = [
        ["No.", "Document", "When required"],
        ["01", "Birth certificate or previous school record", "At document verification"],
        ["02", "Transfer Certificate, where applicable", "Before final admission"],
        ["03", "Recent passport-size student photograph", "At document verification"],
        ["04", "Parent or guardian mobile number", "During online application"],
        ["05", "Residence, caste or income certificate, if applicable", "As instructed by school"],
        ["06", "Previous class marksheet", "For Class IX or XI admission"],
    ]
    checklist_story = [
        Paragraph("Document checklist", styles["Section"]),
        styled_table(checklist_rows, [14 * mm, 94 * mm, 58 * mm]),
        Paragraph("Application process", styles["Section"]),
        Paragraph("1. Submit basic student and guardian details through the public registration form.<br/>2. The application enters the Admin approval queue.<br/>3. Bring original documents to the school for verification.<br/>4. Admission is confirmed only after approval and class availability check.", styles["BodySmall"]),
        Paragraph("Privacy reminder: Aadhaar, PEN and APAAR details are not requested in the first public registration step. Any protected identifiers must be handled only through the secure school process.", styles["Note"]),
    ]
    build_pdf(
        "admission-document-checklist.pdf",
        "Admission Document Checklist",
        "Use this checklist before beginning a Class IX or Class XI registration.",
        checklist_story,
    )

    calendar_rows = [
        ["Period", "Academic activity", "Status"],
        ["September 2026", "Registration follow-up and document verification", "Planned"],
        ["05-14 October 2026", "Half-yearly examinations", "Sample schedule"],
        ["Late October 2026", "Result preparation and parent-teacher meeting", "Planned"],
        ["November 2026", "Remedial support and co-curricular activities", "Planned"],
        ["December 2026", "Winter assignments and progress review", "Planned"],
        ["January-February 2027", "Practical work and annual exam preparation", "Planned"],
        ["March 2027", "Annual assessment and progression review", "Planned"],
    ]
    calendar_story = [
        Paragraph("Academic calendar overview", styles["Section"]),
        styled_table(calendar_rows, [40 * mm, 91 * mm, 35 * mm]),
        Paragraph("Important guidance", styles["Section"]),
        Paragraph("Students should follow the latest school notice for confirmed dates. Examination, holiday and activity dates may change after official instructions from the competent authority.", styles["BodySmall"]),
        Paragraph("This is a prototype calendar prepared for website review. It is not an official school order. Replace it with the Head of School-approved calendar before public release.", styles["Note"]),
    ]
    build_pdf(
        "academic-calendar-2026-27.pdf",
        "Academic Calendar 2026-27",
        "A concise planning overview for students, families and staff.",
        calendar_story,
    )

    exam_rows = [
        ["Date", "Classes IX-X", "Classes XI-XII"],
        ["05 Oct 2026", "Hindi", "Hindi / English"],
        ["06 Oct 2026", "English", "Core language"],
        ["07 Oct 2026", "Mathematics", "Physics / History"],
        ["08 Oct 2026", "Science", "Chemistry / Political Science"],
        ["09 Oct 2026", "Social Science", "Biology / Geography"],
        ["10 Oct 2026", "Optional subject", "Optional subject"],
    ]
    exam_story = [
        Paragraph("Half-yearly examination timetable", styles["Section"]),
        styled_table(exam_rows, [37 * mm, 64 * mm, 65 * mm]),
        Paragraph("Instructions for students", styles["Section"]),
        Paragraph("- Report to school at least 20 minutes before the examination.<br/>- Carry the required writing materials and school identity card.<br/>- Mobile phones and unauthorized notes are not permitted.<br/>- Follow the subject-wise instructions issued by the school.", styles["BodySmall"]),
        Paragraph("Sample timetable: dates and subject combinations must be verified and approved by the school administration before publication.", styles["Note"]),
    ]
    build_pdf(
        "half-yearly-exam-schedule-2026.pdf",
        "Half-yearly Examination Schedule",
        "Representative timetable for Classes IX-XII, academic session 2026-27.",
        exam_story,
    )


if __name__ == "__main__":
    make_documents()
