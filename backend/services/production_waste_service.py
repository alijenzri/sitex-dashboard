from flask import jsonify
from models import get_db

def get_all_production_waste():
    db = get_db()
    # Map articles to colors for demo (extend as needed)
    color_map = {
        "T-shirt standard": "bg-blue-500",
        "Jean slim": "bg-indigo-400",
        "Pantalon casual": "bg-red-500",
        "Chemise formelle": "bg-green-500",
        "Veste légère": "bg-yellow-400",
        "Robe été": "bg-pink-500",
    }
    # Query to get all production batches with article info
    query = '''
        SELECT p.id, p.article_id, p.date, p.quantite_produite, p.quantite_dechet, a.nom_article
        FROM production p
        JOIN articles a ON p.article_id = a.id
        ORDER BY p.id
    '''
    results = db.execute(query).fetchall()
    data = []
    for row in results:
        ref = f"PRD-{row['date'][:4]}-{int(row['id']):03d}"
        article = row['nom_article']
        color = color_map.get(article, "bg-gray-500")
        quantity = f"{int(row['quantite_produite'] or 0)} unités"
        waste = f"{int(row['quantite_dechet'] or 0)} kg"
        # Calculate defect rate for this batch
        defect_query = '''
            SELECT SUM(d.valeur_mesure) as total_defauts, SUM(vq.nb_points) as total_points
            FROM visites_qualite vq
            JOIN defauts d ON vq.id = d.visite_id
            WHERE vq.article_id = ?
        '''
        defect_res = db.execute(defect_query, (row['article_id'],)).fetchone()
        total_defauts = defect_res['total_defauts'] or 0
        total_points = defect_res['total_points'] or 0
        defect_rate = (total_defauts / total_points * 100) if total_points else 0
        defect = f"{defect_rate:.1f}%"
        # Status logic
        if defect_rate >= 5:
            status = "Critique"
            statusColor = "bg-red-100 text-red-700"
        elif defect_rate >= 3:
            status = "Attention"
            statusColor = "bg-yellow-100 text-yellow-700"
        else:
            status = "Acceptable"
            statusColor = "bg-green-100 text-green-700"
        data.append({
            'ref': ref,
            'color': color,
            'article': article,
            'quantity': quantity,
            'waste': waste,
            'defect': defect,
            'status': status,
            'statusColor': statusColor
        })
    return jsonify(data) 