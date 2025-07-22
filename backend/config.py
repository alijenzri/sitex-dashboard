from flask import Flask
from flask_restful import Api
import sqlite3
from flask import g

app = Flask(__name__)
api = Api(app)
DATABASE = 'quality_control.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.executescript('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code_article VARCHAR UNIQUE NOT NULL,
            nom_article VARCHAR,
            categorie VARCHAR
        );
        CREATE TABLE IF NOT EXISTS visites_qualite (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code_visite INT NOT NULL,
            article_id INT NOT NULL,
            date_visite DATETIME NOT NULL,
            nb_defauts INT,
            nb_points FLOAT,
            nb_sonnettes INT,
            defauts_majeurs INT,
            volume_ml FLOAT,
            FOREIGN KEY(article_id) REFERENCES articles(id)
        );
        CREATE TABLE IF NOT EXISTS defauts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visite_id INT NOT NULL,
            code_defaut VARCHAR NOT NULL,
            valeur_mesure FLOAT,
            points_penalite INT,
            date_enregistrement DATETIME NOT NULL,
            FOREIGN KEY(visite_id) REFERENCES visites_qualite(id)
        );
        CREATE TABLE IF NOT EXISTS production (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_id INT NOT NULL,
            date DATE NOT NULL,
            quantite_produite INT,
            quantite_dechet INT,
            FOREIGN KEY(article_id) REFERENCES articles(id)
        );
        CREATE TABLE IF NOT EXISTS machines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code_machine VARCHAR UNIQUE NOT NULL,
            nom_machine VARCHAR,
            etat VARCHAR CHECK(etat IN ("active", "inactive")) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS arrets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_arret VARCHAR NOT NULL,
            machine_id INT NOT NULL,
            date_arret DATETIME NOT NULL,
            duree_minutes INT,
            lot_id VARCHAR,
            commentaire TEXT,
            FOREIGN KEY(machine_id) REFERENCES machines(id)
        );
        ''')
        db.commit()