from flask import jsonify
from models import get_db

def get_defect_rate_by_category():
    db = get_db()
    # Map defect codes to dashboard categories
    code_to_category = {
        'DIM-001': 'Couture',
        'COL-101': 'Teinte',
        'SUR-201': 'Bouton',
        'DEF-301': 'Doublure',
        # Add more mappings if needed
    }
    categories = ["Couture", "Teinte", "Bouton", "Doublure"]
    data = []
    for cat in categories:
        # Sum nb_defauts for all codes mapped to this category
        codes = [code for code, mapped in code_to_category.items() if mapped == cat]
        if codes:
            placeholders = ','.join(['?'] * len(codes))
            res = db.execute(
                f"SELECT SUM(nb_defauts) as total_defauts FROM defauts d JOIN visites_qualite vq ON d.visite_id = vq.id JOIN articles a ON vq.article_id = a.id WHERE d.code_defaut IN ({placeholders})",
                codes
            ).fetchone()
            data.append(res['total_defauts'] or 0)
        else:
            data.append(0)
    # Pie chart format
    return jsonify({
        "labels": categories,
        "datasets": [
            {
                "data": data,
                "backgroundColor": [
                    "#60a5fa", "#f87171", "#34d399", "#fbbf24"
                ],
                "borderWidth": 1,
            }
        ]
    })

def get_quality_objective():
    db = get_db()
    # Calculate current quality (example: average quality from visites_qualite)
    res = db.execute(
        "SELECT SUM(nb_points) as total_points, SUM(points_penalite) as total_penalty FROM visites_qualite LEFT JOIN defauts ON visites_qualite.id = defauts.visite_id"
    ).fetchone()
    if res['total_points']:
        value = int(((res['total_points'] - (res['total_penalty'] or 0)) / res['total_points']) * 100)
    else:
        value = 0
    goal = 95  # Example goal
    return jsonify({"label": "Objectif qualité", "value": value, "goal": goal, "color": "#2563eb"})

def get_waste_reduction_objective():
    db = get_db()
    # Calculate current waste reduction (example: 1 - (waste/produced) * 100)
    res = db.execute(
        "SELECT SUM(quantite_produite) as total_prod, SUM(quantite_dechet) as total_waste FROM production"
    ).fetchone()
    if res['total_prod']:
        value = int((1 - (res['total_waste'] or 0) / res['total_prod']) * 100)
    else:
        value = 0
    goal = 80  # Example goal
    return jsonify({"label": "Réduction des déchets", "value": value, "goal": goal, "color": "#2563eb"}) 