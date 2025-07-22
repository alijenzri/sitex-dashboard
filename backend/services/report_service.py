import os
import sqlite3
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import matplotlib.pyplot as plt

def get_report_data(report_type, date_from, date_to, db_path=None):
    # Always resolve the absolute path relative to this file
    if db_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, 'quality_control.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        if report_type == 'article_measurements':
            query = '''
                SELECT a.nom_article as article, p.quantite_produite, p.quantite_dechet, p.date
                FROM production p
                JOIN articles a ON p.article_id = a.id
                WHERE p.date BETWEEN ? AND ?
            '''
        elif report_type == 'defect_details':
            query = '''
                SELECT a.nom_article as article, d.code_defaut, d.valeur_mesure, d.points_penalite, d.date_enregistrement as date
                FROM defauts d
                JOIN visites_qualite vq ON d.visite_id = vq.id
                JOIN articles a ON vq.article_id = a.id
                WHERE d.date_enregistrement BETWEEN ? AND ?
            '''
        elif report_type == 'quality_visit_report':
            query = '''
                SELECT a.nom_article as article, vq.date_visite, vq.nb_defauts, vq.nb_points, vq.nb_sonnettes, vq.defauts_majeurs, vq.volume_ml
                FROM visites_qualite vq
                JOIN articles a ON vq.article_id = a.id
                WHERE vq.date_visite BETWEEN ? AND ?
            '''
        else:
            return {'error': 'Type de rapport inconnu.'}, 400
        cursor.execute(query, (date_from, date_to))
        rows = cursor.fetchall()
        if not rows:
            return {'error': 'Aucune donnée trouvée pour cette période.'}, 404
        columns = [desc[0] for desc in cursor.description]
        data = [dict(zip(columns, row)) for row in rows]
        return {'data': data}, 200
    except Exception as e:
        print(f"Erreur lors de la génération du rapport: {e}")
        return {'error': f'Erreur serveur: {str(e)}'}, 500
    finally:
        conn.close()

def generate_pdf_report(report_type, date_from, date_to, kpis, data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    elements = []
    styles = getSampleStyleSheet()
    styleN = styles['Normal']
    styleH = styles['Heading1']
    styleTitle = ParagraphStyle('Title', parent=styles['Title'], fontSize=28, textColor=colors.HexColor('#2563eb'), alignment=1, spaceAfter=20)
    styleSection = ParagraphStyle('Section', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor('#2563eb'), spaceAfter=10)
    styleSummary = ParagraphStyle('Summary', parent=styles['Normal'], fontSize=12, textColor=colors.HexColor('#2563eb'), spaceAfter=8)
    styleTableHeader = ParagraphStyle('TableHeader', parent=styles['Normal'], fontSize=11, textColor=colors.white, alignment=1)

    # --- Cover Page ---
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'assets', 'sitex-logo.jpeg')
    def cover_bg(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor('#f3f4f6'))
        canvas.rect(0, 0, doc.pagesize[0], doc.pagesize[1], fill=1, stroke=0)
        canvas.restoreState()
    if os.path.exists(logo_path):
        img = Image(logo_path, width=90, height=90)
        elements.append(Spacer(1, 60))
        elements.append(img)
        elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Rapport <b>{report_type.replace('_', ' ').title()}</b>", styleTitle))
    elements.append(Paragraph(f"Période du <b>{date_from}</b> au <b>{date_to}</b>", styleN))
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("<b>Sitex</b> - Généré le " + datetime.now().strftime('%Y-%m-%d %H:%M'), styleSummary))
    elements.append(PageBreak())

    # --- KPIs Section ---
    elements.append(Paragraph("Statistiques du tableau de bord", styleSection))
    for k, v in kpis.items():
        elements.append(Paragraph(f"<b>{k.replace('_',' ').capitalize()}</b> : {v['value']} (Δ {v['change']})", styleN))
    elements.append(Spacer(1, 16))

    # --- Horizontal Bar Chart for KPIs ---
    try:
        kpi_labels = list(kpis.keys())
        kpi_values = [float(v['value'].replace('%','').replace('kg','').replace(',','.').strip()) for v in kpis.values()]
        fig, ax = plt.subplots(figsize=(5, 1.5))
        bars = ax.barh(kpi_labels, kpi_values, color='#2563eb')
        ax.set_xlabel('Valeur')
        ax.set_title('KPIs')
        plt.tight_layout()
        img_buf = BytesIO()
        plt.savefig(img_buf, format='png', bbox_inches='tight')
        plt.close(fig)
        img_buf.seek(0)
        chart_img = Image(img_buf, width=350, height=70)
        elements.append(chart_img)
        elements.append(Spacer(1, 16))
    except Exception as e:
        print(f"Matplotlib chart error: {e}")

    # --- Summary Section ---
    if data:
        elements.append(Paragraph(f"<b>Résumé :</b> {len(data)} lignes de données dans ce rapport.", styleSummary))
        elements.append(Spacer(1, 8))
    else:
        elements.append(Paragraph("Aucune donnée pour cette période.", styleN))

    # --- Table Section ---
    if data:
        elements.append(Paragraph("Données détaillées", styleSection))
        keys = list(data[0].keys())
        # If too many columns, only show the most important (first 5)
        if len(keys) > 5:
            keys = keys[:5]
        table_data = [[Paragraph(f"<b>{k}</b>", styleTableHeader) for k in keys]] + [[str(row[k]) for k in keys] for row in data]
        t = Table(table_data, repeatRows=1, hAlign='CENTER', colWidths=[doc.width/len(keys)]*len(keys))
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.HexColor('#e0e7ff')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
    else:
        elements.append(Paragraph("Aucune donnée pour cette période.", styleN))

    # --- Footer with logo and page number ---
    def footer(canvas, doc):
        if doc.page == 1:
            cover_bg(canvas, doc)
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#2563eb'))
        canvas.drawString(30, 20, f"Sitex - Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        if os.path.exists(logo_path):
            try:
                canvas.drawImage(logo_path, doc.pagesize[0] - 70, 10, width=40, height=40, mask='auto')
            except Exception as e:
                print(f"Footer logo error: {e}")
        canvas.setFillColor(colors.grey)
        canvas.drawRightString(doc.pagesize[0] - 30, 20, f"Page {doc.page}")
        canvas.restoreState()

    doc.build(elements, onFirstPage=footer, onLaterPages=footer)
    buffer.seek(0)
    return buffer