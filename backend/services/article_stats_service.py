from flask import jsonify
from models import get_db

def get_top5_article_waste_and_defects():
    db = get_db()
    # Query to get total waste and defect rate per article
    query = '''
        SELECT a.nom_article as article,
               SUM(p.quantite_produite) as quantity,
               SUM(p.quantite_dechet) as waste_kg,
               SUM(vq.nb_defauts) as total_defauts,
               SUM(vq.nb_points) as total_points
        FROM articles a
        LEFT JOIN production p ON a.id = p.article_id
        LEFT JOIN visites_qualite vq ON a.id = vq.article_id
        GROUP BY a.id, a.nom_article
    '''
    results = db.execute(query).fetchall()
    data = []
    for row in results:
        quantity = row['quantity'] or 0
        waste_kg = row['waste_kg'] or 0
        defect_rate = ((row['total_defauts'] or 0) / row['total_points'] * 100) if row['total_points'] else 0
        # Format quantity as 'xxxx unités', waste as 'xx kg', defect as 'x.x%'
        entry = {
            'article': row['article'],
            'quantity': f"{int(quantity)} unités",
            'waste': f"{int(waste_kg)} kg",
            'defect': f"{defect_rate:.1f}%",
        }
        data.append(entry)
    # Sort by waste_kg descending and take top 5
    top5_waste = sorted(data, key=lambda x: int(x['waste'].split()[0]), reverse=True)[:5]
    # Sort by defect descending and take top 5
    top5_defect = sorted(data, key=lambda x: float(x['defect'].replace('%','')), reverse=True)[:5]
    return jsonify({
        'top5_waste': top5_waste,
        'top5_defect': top5_defect
    }) 