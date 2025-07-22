from config import app, get_db

class Article:
    @staticmethod
    def get_all():
        db = get_db()
        articles = db.execute('SELECT * FROM articles').fetchall()
        return [dict(row) for row in articles]

    @staticmethod
    def create(data):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('INSERT INTO articles (code_article, nom_article, categorie) VALUES (?, ?, ?)',
                      (data['code_article'], data.get('nom_article'), data.get('categorie')))
        db.commit()
        article_id = cursor.lastrowid
        article = db.execute('SELECT * FROM articles WHERE id = ?', (article_id,)).fetchone()
        return dict(article) if article else None

class VisiteQualite:
    @staticmethod
    def get_all():
        db = get_db()
        visites = db.execute('SELECT * FROM visites_qualite').fetchall()
        return [dict(row) for row in visites]

    @staticmethod
    def create(data):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''INSERT INTO visites_qualite (code_visite, article_id, date_visite, nb_defauts, nb_points, nb_sonnettes, defauts_majeurs, volume_ml)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                       (data['code_visite'], data['article_id'], data['date_visite'], data.get('nb_defauts'),
                        data.get('nb_points'), data.get('nb_sonnettes'), data.get('defauts_majeurs'), data.get('volume_ml')))
        db.commit()
        visite_id = cursor.lastrowid
        visite = db.execute('SELECT * FROM visites_qualite WHERE id = ?', (visite_id,)).fetchone()
        return dict(visite) if visite else None

class Defaut:
    @staticmethod
    def get_all():
        db = get_db()
        defauts = db.execute('SELECT * FROM defauts').fetchall()
        return [dict(row) for row in defauts]

    @staticmethod
    def create(data):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''INSERT INTO defauts (visite_id, code_defaut, valeur_mesure, points_penalite, date_enregistrement)
                          VALUES (?, ?, ?, ?, ?)''',
                       (data['visite_id'], data['code_defaut'], data.get('valeur_mesure'),
                        data.get('points_penalite'), data['date_enregistrement']))
        db.commit()
        defaut_id = cursor.lastrowid
        defaut = db.execute('SELECT * FROM defauts WHERE id = ?', (defaut_id,)).fetchone()
        return dict(defaut) if defaut else None

class Production:
    @staticmethod
    def get_all():
        db = get_db()
        production = db.execute('SELECT * FROM production').fetchall()
        return [dict(row) for row in production]

    @staticmethod
    def create(data):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''INSERT INTO production (article_id, date, quantite_produite, quantite_dechet)
                          VALUES (?, ?, ?, ?)''',
                       (data['article_id'], data['date'], data.get('quantite_produite'), data.get('quantite_dechet')))
        db.commit()
        prod_id = cursor.lastrowid
        prod = db.execute('SELECT * FROM production WHERE id = ?', (prod_id,)).fetchone()
        return dict(prod) if prod else None

class Machine:
    @staticmethod
    def get_all():
        db = get_db()
        machines = db.execute('SELECT * FROM machines').fetchall()
        return [dict(row) for row in machines]

    @staticmethod
    def create(data):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('INSERT INTO machines (code_machine, nom_machine, etat) VALUES (?, ?, ?)',
                      (data['code_machine'], data.get('nom_machine'), data['etat']))
        db.commit()
        machine_id = cursor.lastrowid
        machine = db.execute('SELECT * FROM machines WHERE id = ?', (machine_id,)).fetchone()
        return dict(machine) if machine else None

class Arret:
    @staticmethod
    def get_all():
        db = get_db()
        arrets = db.execute('SELECT * FROM arrets').fetchall()
        return [dict(row) for row in arrets]

    @staticmethod
    def create(data):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''INSERT INTO arrets (type_arret, machine_id, date_arret, duree_minutes, lot_id, commentaire)
                          VALUES (?, ?, ?, ?, ?, ?)''',
                       (data['type_arret'], data['machine_id'], data['date_arret'],
                        data.get('duree_minutes'), data.get('lot_id'), data.get('commentaire')))
        db.commit()
        arret_id = cursor.lastrowid
        arret = db.execute('SELECT * FROM arrets WHERE id = ?', (arret_id,)).fetchone()
        return dict(arret) if arret else None