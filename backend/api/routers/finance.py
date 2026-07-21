import io
import csv
from datetime import datetime
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.finance import FinanceRecord
from backend.models.product import Product
from pydantic import BaseModel

router = APIRouter()

class ReportGenerateRequest(BaseModel):
    name: str = "Financial Valuation Report"
    report_type: str = "Finance"
    format: str = "CSV"

REPORTS_DB = [
    {
        "id": 1,
        "name": "Q4 Asset Valuation Summary",
        "type": "Finance",
        "generatedAt": "2026-07-20",
        "format": "CSV",
    },
    {
        "id": 2,
        "name": "Annual Depreciation Ledger 2026",
        "type": "Finance",
        "generatedAt": "2026-07-15",
        "format": "XLSX",
    },
    {
        "id": 3,
        "name": "Audit Compliance Valuation Report",
        "type": "Audit",
        "generatedAt": "2026-07-10",
        "format": "PDF",
    },
    {
        "id": 4,
        "name": "Vendor Asset Cost Breakdown",
        "type": "Finance",
        "generatedAt": "2026-07-01",
        "format": "CSV",
    },
]

@router.get("")
def read_finance_records(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    records = db.query(FinanceRecord).offset(skip).limit(limit).all()
    if not records:
        products = db.query(Product).all()
        result = []
        for p in products:
            cost = float(p.cost) if p.cost else 0.0
            curr_val = round(cost * 0.85, 2)
            result.append({
                "id": p.id,
                "product_id": p.id,
                "product_name": p.name,
                "category": p.category,
                "purchase_price": cost,
                "depreciation_method": "STRAIGHT_LINE",
                "depreciation_rate": 0.15,
                "current_value": curr_val,
                "accumulated_depreciation": round(cost - curr_val, 2),
                "status": p.status,
            })
        return result
    return records


@router.get("/summary")
def get_finance_summary(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    products = db.query(Product).all()
    total_cost = sum(float(p.cost) for p in products if p.cost)
    total_current_value = round(total_cost * 0.85, 2)
    total_depreciation = round(total_cost - total_current_value, 2)

    return {
        "total_acquisition_cost": total_cost,
        "total_current_value": total_current_value,
        "total_depreciation": total_depreciation,
        "asset_count": len(products),
    }


@router.get("/valuations")
def read_valuations(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Fetch current asset valuations computed from asset inventory & finance records."""
    products = db.query(Product).all()
    records = db.query(FinanceRecord).all()
    record_map = {r.product_id: r for r in records}

    result = []
    today_str = datetime.now().strftime("%Y-%m-%d")

    for p in products:
        cost = float(p.cost) if p.cost else 0.0
        rec = record_map.get(p.id)
        if rec and rec.current_value is not None:
            curr_val = float(rec.current_value)
            method_str = rec.depreciation_method or "Straight Line"
        else:
            curr_val = round(cost * 0.85, 2)
            method_str = "Straight Line"

        result.append({
            "id": p.id,
            "product": p.name,
            "category": p.category,
            "method": method_str,
            "value": curr_val,
            "cost": cost,
            "accumulated_depreciation": round(cost - curr_val, 2),
            "asOf": today_str,
        })
    return result


@router.get("/depreciation")
def read_depreciation(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Fetch annual depreciation schedules for company assets."""
    products = db.query(Product).all()
    records = db.query(FinanceRecord).all()
    record_map = {r.product_id: r for r in records}

    current_year = datetime.now().year
    result = []

    for p in products:
        cost = float(p.cost) if p.cost else 0.0
        rec = record_map.get(p.id)
        rate = float(rec.depreciation_rate) if rec and rec.depreciation_rate else 0.15

        opening = cost
        depreciated = round(cost * rate, 2)
        closing = round(opening - depreciated, 2)

        result.append({
            "id": p.id,
            "product": p.name,
            "category": p.category,
            "year": str(current_year),
            "opening": opening,
            "depreciated": depreciated,
            "closing": closing,
            "rate": f"{int(rate * 100)}%",
        })
    return result


@router.get("/reports")
def list_reports(
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    return REPORTS_DB


@router.post("/report/generate")
def generate_report(
    payload: ReportGenerateRequest,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    new_id = len(REPORTS_DB) + 1
    new_report = {
        "id": new_id,
        "name": payload.name,
        "type": payload.report_type,
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "format": payload.format.upper(),
    }
    REPORTS_DB.insert(0, new_report)
    return {
        "message": "Report generated successfully",
        "report": new_report,
        "download_url": f"/api/v1/finance/report/download/{new_id}"
    }


def _build_pdf_binary(report_name: str, products: list) -> bytes:
    lines = []
    lines.append("AUDITONE FINANCIAL VALUATION REPORT")
    lines.append(f"Title: {report_name}")
    lines.append(f"Date:  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("")
    lines.append("-" * 72)
    lines.append(f"{'Asset ID':<10} {'Product Name':<22} {'Category':<14} {'Cost (INR)':<12} {'Value (INR)':<12}")
    lines.append("-" * 72)

    total_cost = 0.0
    total_val = 0.0
    for p in products:
        cost = float(p.cost) if p.cost else 0.0
        val = round(cost * 0.85, 2)
        total_cost += cost
        total_val += val
        name_str = (p.name or "Product")[:20]
        cat_str = (p.category or "General")[:12]
        lines.append(f"AST-{p.id:04d}   {name_str:<22} {cat_str:<14} {cost:<12.2f} {val:<12.2f}")

    lines.append("-" * 72)
    lines.append(f"Total Asset Count:        {len(products)}")
    lines.append(f"Total Acquisition Cost:   INR {total_cost:.2f}")
    lines.append(f"Total Current Book Value: INR {total_val:.2f}")
    lines.append(f"Total Depreciation:       INR {total_cost - total_val:.2f}")
    lines.append("-" * 72)

    content_cmds = ["BT", "/F1 10 Tf", "12 TL", "36 750 Td"]
    for l in lines:
        safe_l = l.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        content_cmds.append(f"({safe_l}) '")
    content_cmds.append("ET")

    stream_bytes = "\n".join(content_cmds).encode("latin-1")
    stream_len = len(stream_bytes)

    objects = [
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
        f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin-1") + stream_bytes + b"\nendstream\nendobj\n",
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = []
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)

    xref_pos = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode("latin-1"))
    for o in offsets:
        pdf.extend(f"{o:010d} 00000 n \n".encode("latin-1"))

    pdf.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode("latin-1"))
    return bytes(pdf)


import zipfile


def _escape_xml(val: Any) -> str:
    if val is None:
        return ""
    return str(val).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def _build_native_xlsx_binary(report_name: str, products: list) -> bytes:
    buffer = io.BytesIO()

    total_cost = sum(float(p.cost) for p in products if p.cost)
    total_val = round(total_cost * 0.85, 2)

    sheet_rows = []
    sheet_rows.append('<row r="1"><c r="A1" t="inlineStr" s="1"><is><t>AUDITONE FINANCIAL VALUATION REPORT - ' + _escape_xml(report_name) + '</t></is></c></row>')
    sheet_rows.append('<row r="2"><c r="A2" t="inlineStr"><is><t>Generated Date: ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + '</t></is></c></row>')
    sheet_rows.append('<row r="3"/>')

    headers = ["Asset ID", "Product Name", "Category", "Acquisition Cost (INR)", "Depreciation Method", "Depreciation Rate", "Current Book Value (INR)", "Accumulated Depreciation (INR)", "Status"]
    cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]

    header_cells = [f'<c r="{c}4" t="inlineStr" s="2"><is><t>{_escape_xml(h)}</t></is></c>' for c, h in zip(cols, headers)]
    sheet_rows.append(f'<row r="4">{"".join(header_cells)}</row>')

    r_num = 5
    for p in products:
        cost = float(p.cost) if p.cost else 0.0
        val = round(cost * 0.85, 2)
        dep = round(cost - val, 2)
        row_cells = [
            f'<c r="A{r_num}" t="inlineStr"><is><t>AST-{p.id:04d}</t></is></c>',
            f'<c r="B{r_num}" t="inlineStr"><is><t>{_escape_xml(p.name)}</t></is></c>',
            f'<c r="C{r_num}" t="inlineStr"><is><t>{_escape_xml(p.category)}</t></is></c>',
            f'<c r="D{r_num}"><v>{cost:.2f}</v></c>',
            f'<c r="E{r_num}" t="inlineStr"><is><t>Straight Line</t></is></c>',
            f'<c r="F{r_num}" t="inlineStr"><is><t>15%</t></is></c>',
            f'<c r="G{r_num}"><v>{val:.2f}</v></c>',
            f'<c r="H{r_num}"><v>{dep:.2f}</v></c>',
            f'<c r="I{r_num}" t="inlineStr"><is><t>{_escape_xml(p.status or "Active")}</t></is></c>',
        ]
        sheet_rows.append(f'<row r="{r_num}">{"".join(row_cells)}</row>')
        r_num += 1

    sheet_rows.append(f'<row r="{r_num}"/>')
    r_num += 1

    tot_cells = [
        f'<c r="A{r_num}" t="inlineStr" s="3"><is><t>TOTALS</t></is></c>',
        f'<c r="B{r_num}" t="inlineStr" s="3"><is><t></t></is></c>',
        f'<c r="C{r_num}" t="inlineStr" s="3"><is><t></t></is></c>',
        f'<c r="D{r_num}" s="3"><v>{total_cost:.2f}</v></c>',
        f'<c r="E{r_num}" t="inlineStr" s="3"><is><t></t></is></c>',
        f'<c r="F{r_num}" t="inlineStr" s="3"><is><t></t></is></c>',
        f'<c r="G{r_num}" s="3"><v>{total_val:.2f}</v></c>',
        f'<c r="H{r_num}" s="3"><v>{total_cost - total_val:.2f}</v></c>',
        f'<c r="I{r_num}" t="inlineStr" s="3"><is><t></t></is></c>',
    ]
    sheet_rows.append(f'<row r="{r_num}">{"".join(tot_cells)}</row>')

    content_types_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>"""

    rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"""

    workbook_rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

    workbook_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Financial Valuation" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>"""

    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><sz val="14"/><b/><color rgb="FF4338CA"/><name val="Calibri"/></font>
    <font><sz val="11"/><b/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill fillType="none"/></fill>
    <fill><patternFill fillType="gray125"/></fill>
    <fill><patternFill fillType="solid"><fgColor rgb="FF6366F1"/></patternFill></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>"""

    sheet1_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>
    <col min="1" max="1" width="12"/>
    <col min="2" max="2" width="28"/>
    <col min="3" max="3" width="18"/>
    <col min="4" max="4" width="22"/>
    <col min="5" max="5" width="20"/>
    <col min="6" max="6" width="18"/>
    <col min="7" max="7" width="22"/>
    <col min="8" max="8" width="26"/>
    <col min="9" max="9" width="14"/>
  </cols>
  <sheetData>
{"\n".join(sheet_rows)}
  </sheetData>
</worksheet>"""

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types_xml)
        zf.writestr("_rels/.rels", rels_xml)
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml)
        zf.writestr("xl/workbook.xml", workbook_xml)
        zf.writestr("xl/styles.xml", styles_xml)
        zf.writestr("xl/worksheets/sheet1.xml", sheet1_xml)

    return buffer.getvalue()


@router.get("/report/download/{report_id}")
def download_report(
    report_id: int,
    db: Session = Depends(deps.get_db),
    fmt: Optional[str] = Query(None),
) -> Any:
    """Download financial asset valuation report in PDF, XLSX, or CSV format."""
    report = next((r for r in REPORTS_DB if r["id"] == report_id), None)
    report_name = report["name"] if report else f"Finance_Report_{report_id}"
    format_type = (fmt or (report["format"] if report else "CSV")).upper()

    products = db.query(Product).all()
    safe_name = report_name.replace(" ", "_").replace("/", "_")

    if format_type == "PDF":
        pdf_bytes = _build_pdf_binary(report_name, products)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}.pdf"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            }
        )
    elif format_type == "XLSX":
        xlsx_bytes = _build_native_xlsx_binary(report_name, products)
        return StreamingResponse(
            io.BytesIO(xlsx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}.xlsx"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            }
        )
    else:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["\ufeffAUDITONE FINANCIAL VALUATION REPORT"])
        writer.writerow(["Report Title", report_name])
        writer.writerow(["Generated Date", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
        writer.writerow([])
        writer.writerow([
            "Asset ID",
            "Product Name",
            "Category",
            "Acquisition Cost (INR)",
            "Depreciation Method",
            "Depreciation Rate (%)",
            "Current Book Value (INR)",
            "Accumulated Depreciation (INR)",
            "Status"
        ])

        total_cost = 0.0
        total_val = 0.0
        for p in products:
            cost = float(p.cost) if p.cost else 0.0
            val = round(cost * 0.85, 2)
            dep = round(cost - val, 2)
            total_cost += cost
            total_val += val
            writer.writerow([
                f"AST-{p.id:04d}",
                p.name,
                p.category,
                f"{cost:.2f}",
                "Straight Line",
                "15.00%",
                f"{val:.2f}",
                f"{dep:.2f}",
                p.status or "Active"
            ])

        writer.writerow([])
        writer.writerow(["SUMMARY TOTALS"])
        writer.writerow(["Total Asset Count", len(products)])
        writer.writerow(["Total Acquisition Cost", f"INR {total_cost:.2f}"])
        writer.writerow(["Total Current Book Value", f"INR {total_val:.2f}"])
        writer.writerow(["Total Depreciation", f"INR {total_cost - total_val:.2f}"])

        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}.csv"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            }
        )
