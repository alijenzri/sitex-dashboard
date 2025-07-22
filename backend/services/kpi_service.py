from flask import jsonify
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from models import get_db

#The KPIs (quality, waste, efficiency, defect rate) are calculated based on the most recent data in the database, not the current calendar date
def calculate_dashboard_kpis():
    db = get_db()
    # Get the latest date from production and visites_qualite
    prod_date_row = db.execute("SELECT MAX(date) as max_date FROM production").fetchone()
    qual_date_row = db.execute("SELECT MAX(date_visite) as max_date FROM visites_qualite").fetchone()
    prod_date = prod_date_row['max_date']
    qual_date = qual_date_row['max_date']
    # Use the latest of both as the reference date
    ref_dates = [d for d in [prod_date, qual_date] if d]
    if ref_dates:
        ref_date = max(ref_dates)
        today = datetime.strptime(ref_date[:19], '%Y-%m-%d %H:%M:%S') if len(ref_date) > 10 else datetime.strptime(ref_date, '%Y-%m-%d')
    else:
        today = datetime.today()
    # Use last 14 days with data for 'now', and the 14 days before that for 'last'
    end_now = today
    start_now = end_now - timedelta(days=13)
    end_last = start_now - timedelta(days=1)
    start_last = end_last - timedelta(days=13)
    # Month ranges for monthly KPIs
    first_day_this_month = today.replace(day=1)
    first_day_last_month = (first_day_this_month - relativedelta(months=1)).replace(day=1)
    last_day_last_month = first_day_this_month - timedelta(days=1)

    # 1. Taux de défauts (Defect Rate)
    def get_defect_rate(start, end):
        res = db.execute(
            "SELECT SUM(nb_defauts) as total_defauts, SUM(nb_points) as total_points FROM visites_qualite WHERE date_visite BETWEEN ? AND ?",
            (start.strftime('%Y-%m-%d'), end.strftime('%Y-%m-%d'))
        ).fetchone()
        if res['total_points']:
            return (res['total_defauts'] or 0) / res['total_points'] * 100
        return 0

    taux_defauts_now = get_defect_rate(start_now, end_now)
    taux_defauts_last = get_defect_rate(start_last, end_last)
    taux_defauts_change = taux_defauts_now - taux_defauts_last

    # 2. Déchets de production (Production Waste)
    def get_waste(start, end):
        res = db.execute(
            "SELECT SUM(quantite_dechet) as total_waste FROM production WHERE date BETWEEN ? AND ?",
            (start.strftime('%Y-%m-%d'), end.strftime('%Y-%m-%d'))
        ).fetchone()
        return res['total_waste'] or 0

    waste_now = get_waste(start_now, end_now)
    waste_last = get_waste(start_last, end_last)
    waste_change = waste_now - waste_last
    waste_change_pct = (waste_change / waste_last * 100) if waste_last else 0

    # 3. Qualité moyenne (Average Quality)
    def get_quality(start, end):
        res = db.execute(
            "SELECT SUM(nb_points) as total_points FROM visites_qualite WHERE date_visite BETWEEN ? AND ?",
            (start.strftime('%Y-%m-%d'), end.strftime('%Y-%m-%d'))
        ).fetchone()
        res2 = db.execute(
            "SELECT SUM(points_penalite) as total_penalty FROM defauts WHERE date_enregistrement BETWEEN ? AND ?",
            (start.strftime('%Y-%m-%d'), end.strftime('%Y-%m-%d'))
        ).fetchone()
        if res['total_points']:
            return ((res['total_points'] - (res2['total_penalty'] or 0)) / res['total_points']) * 100
        return 0

    qualite_now = get_quality(start_now, end_now)
    qualite_last = get_quality(start_last, end_last)
    qualite_change = qualite_now - qualite_last

    # 4. Efficacité de production (Production Efficiency)
    def get_efficiency(start, end):
        res = db.execute(
            "SELECT SUM(quantite_produite) as total_prod, SUM(quantite_dechet) as total_waste FROM production WHERE date BETWEEN ? AND ?",
            (start.strftime('%Y-%m-%d'), end.strftime('%Y-%m-%d'))
        ).fetchone()
        if res['total_prod']:
            return ((res['total_prod'] - (res['total_waste'] or 0)) / res['total_prod']) * 100
        return 0

    efficacite_now = get_efficiency(start_now, end_now)
    efficacite_last = get_efficiency(start_last, end_last)
    efficacite_change = efficacite_now - efficacite_last

    # Format the response
    return jsonify({
        "taux_defauts": {
            "value": f"{taux_defauts_now:.1f}%",
            "change": f"{taux_defauts_change:+.1f}"
        },
        "dechets_production": {
            "value": f"{waste_now:.0f} kg",
            "change": f"{waste_change_pct:+.1f}%"
        },
        "qualite_moyenne": {
            "value": f"{qualite_now:.1f}%",
            "change": f"{qualite_change:+.1f}%"
        },
        "efficacite_production": {
            "value": f"{efficacite_now:.1f}%",
            "change": f"{efficacite_change:+.1f}%"
        }
    }) 