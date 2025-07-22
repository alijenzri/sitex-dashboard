from flask import jsonify
from models import get_db

def get_all_article_defects():
    db = get_db()
    # Map defect codes to dashboard categories
    code_to_category = {
        'DIM-001': 'Couture',
        'COL-101': 'Teinte',
        'SUR-201': 'Bouton',
        'DEF-301': 'Doublure',
        # If you have more codes, map them here
    }
    category_map = {
        "Couture": ("bg-blue-500", "Défaut couture"),
        "Teinte": ("bg-red-500", "Défaut teinte"),
        "Bouton": ("bg-green-500", "Défaut bouton"),
        "Doublure": ("bg-yellow-400", "Défaut doublure"),
    }
    # Query to get defect rate per article and main defect type
    query = '''
        SELECT a.nom_article as title,
               d.code_defaut as code,
               SUM(d.valeur_mesure) as total_defauts,
               SUM(vq.nb_points) as total_points
        FROM articles a
        JOIN visites_qualite vq ON a.id = vq.article_id
        JOIN defauts d ON vq.id = d.visite_id
        GROUP BY a.id, d.code_defaut
    '''
    results = db.execute(query).fetchall()
    # Aggregate by article: pick the defect category with the most defects for each article
    article_map = {}
    for row in results:
        title = row['title']
        code = row['code']
        category = code_to_category.get(code)
        if not category:
            continue  # Skip codes not mapped to a category
        total_defauts = row['total_defauts'] or 0
        total_points = row['total_points'] or 0
        defect_rate = (total_defauts / total_points * 100) if total_points else 0
        if title not in article_map or total_defauts > article_map[title]['total_defauts']:
            article_map[title] = {
                'category': category,
                'total_defauts': total_defauts,
                'defect_rate': defect_rate,
                'total_points': total_points
            }
    # Prepare the list (do not sort, do not limit)
    data = []
    for title, info in article_map.items():
        category = info['category']
        color, subtitle = category_map.get(category, ("bg-gray-500", f"Défaut {category.lower()}"))
        value = f"{info['defect_rate']:.1f}%"
        # Status logic
        if info['defect_rate'] >= 5:
            status = "Critique"
            statusColor = "bg-red-100 text-red-700"
        elif info['defect_rate'] >= 3:
            status = "Attention"
            statusColor = "bg-yellow-100 text-yellow-700"
        else:
            status = "Acceptable"
            statusColor = "bg-green-100 text-green-700"
        data.append({
            'color': color,
            'title': title,
            'subtitle': subtitle,
            'value': value,
            'status': status,
            'statusColor': statusColor
        })
    return jsonify(data) 