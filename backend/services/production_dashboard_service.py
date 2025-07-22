from flask import jsonify
from datetime import datetime, timedelta
from models import get_db

def get_production_dashboard():
    db = get_db()
    # Use the latest date in production as the reference
    prod_date_row = db.execute("SELECT MAX(date) as max_date FROM production").fetchone()
    prod_date = prod_date_row['max_date']
    if prod_date:
        today = datetime.strptime(prod_date[:19], '%Y-%m-%d %H:%M:%S') if len(prod_date) > 10 else datetime.strptime(prod_date, '%Y-%m-%d')
    else:
        today = datetime.today()
    first_day_month = today.replace(day=1)
    # 1. Total Production (unités ce mois)
    res = db.execute(
        "SELECT SUM(quantite_produite) as total FROM production WHERE date BETWEEN ? AND ?",
        (first_day_month.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'))
    ).fetchone()
    total_production = res['total'] or 0

    # 2. Machines Actives / Total
    res = db.execute("SELECT COUNT(*) as total, SUM(CASE WHEN etat = 'active' THEN 1 ELSE 0 END) as actives FROM machines").fetchone()
    machines_total = res['total'] or 0
    machines_actives = res['actives'] or 0

    # 3. Taux de Rendement (Yield Rate) = (produced - waste) / produced * 100
    res = db.execute(
        "SELECT SUM(quantite_produite) as prod, SUM(quantite_dechet) as waste FROM production WHERE date BETWEEN ? AND ?",
        (first_day_month.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'))
    ).fetchone()
    if res['prod']:
        taux_rendement = int(((res['prod'] - (res['waste'] or 0)) / res['prod']) * 100)
    else:
        taux_rendement = 0

    # 4. Arrêts Non Planifiés ce mois (type_arret = 'Panne')
    res = db.execute(
        "SELECT COUNT(*) as nb FROM arrets WHERE type_arret = 'Panne' AND date_arret BETWEEN ? AND ?",
        (first_day_month.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'))
    ).fetchone()
    arrets_non_planifies = res['nb'] or 0

    # 5. Production Quotidienne (last 7 unique days with data)
    last_7_dates = db.execute(
        "SELECT DISTINCT date FROM production ORDER BY date DESC LIMIT 7"
    ).fetchall()
    last_7_dates = [row['date'] for row in last_7_dates][::-1]  # oldest to newest
    if last_7_dates:
        placeholders = ','.join(['?'] * len(last_7_dates))
        daily = db.execute(
            f"SELECT date, SUM(quantite_produite) as total FROM production WHERE date IN ({placeholders}) GROUP BY date ORDER BY date",
            last_7_dates
        ).fetchall()
        # Map to weekday labels
        day_labels_map = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        data = []
        labels = []
        for row in daily:
            dt = datetime.strptime(row['date'], '%Y-%m-%d')
            weekday = dt.weekday()  # 0=Monday, 6=Sunday
            labels.append(day_labels_map[weekday])
            data.append(row['total'] or 0)
        production_quotidienne = data
        production_quotidienne_labels = labels
    else:
        production_quotidienne = [0]*7
        production_quotidienne_labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

    # 6. Arrêts par type (ce mois)
    arrets_types = db.execute(
        "SELECT type_arret, COUNT(*) as nb FROM arrets WHERE date_arret BETWEEN ? AND ? GROUP BY type_arret",
        (first_day_month.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'))
    ).fetchall()
    arrets_labels = [row['type_arret'] for row in arrets_types]
    arrets_data = [row['nb'] for row in arrets_types]

    # 7. Lots de Production (5 plus récents)
    lots = db.execute(
        "SELECT p.id, a.nom_article as article, p.quantite_produite as quantite, p.date FROM production p JOIN articles a ON p.article_id = a.id ORDER BY p.date DESC LIMIT 5"
    ).fetchall()
    # Assign status/colors for demo
    status_list = [
        ('Terminé', 'bg-green-100 text-green-700'),
        ('En cours', 'bg-blue-100 text-blue-700'),
        ('En attente', 'bg-yellow-100 text-yellow-700'),
        ('Annulé', 'bg-red-100 text-red-700'),
    ]
    lots_production = []
    for i, row in enumerate(lots):
        statut, color = status_list[i % len(status_list)]
        lots_production.append({
            'lot': f"LOT-{row['date'][:4]}-{int(row['id']):03d}",
            'article': row['article'],
            'quantite': row['quantite'],
            'date': row['date'],
            'statut': statut,
            'color': color
        })

    return jsonify({
        'kpis': {
            'total_production': total_production,
            'machines_actives': machines_actives,
            'machines_total': machines_total,
            'taux_rendement': taux_rendement,
            'arrets_non_planifies': arrets_non_planifies
        },
        'production_quotidienne': {
            'labels': production_quotidienne_labels,
            'data': production_quotidienne
        },
        'arrets_par_type': {
            'labels': arrets_labels,
            'data': arrets_data
        },
        'lots_production': lots_production
    }) 