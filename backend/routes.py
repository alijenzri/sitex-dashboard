from flask import jsonify, request
from flask_restful import Resource
from config import api, app
from models import Article, VisiteQualite, Defaut, Production, Machine, Arret, get_db
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from services.kpi_service import calculate_dashboard_kpis
from services.article_stats_service import get_top5_article_waste_and_defects
from services.quality_objectives_service import get_defect_rate_by_category, get_quality_objective, get_waste_reduction_objective
from services.article_defects_service import get_all_article_defects
from services.production_waste_service import get_all_production_waste
from services.production_dashboard_service import get_production_dashboard
from services.report_service import get_report_data, generate_pdf_report
import requests
from flask import send_file

@app.route('/')
def home():
    return jsonify({
        'message': 'Sitex-Dashboard Backend',
        'endpoints': [
            '/',
            '/api/init-db (POST)',
            '/api/articles (GET, POST)',
            '/api/visites_qualite (GET, POST)',
            '/api/defauts (GET, POST)',
            '/api/production (GET, POST)',
            '/api/kpis (GET)',
            '/api/top5-production-waste-defects (GET)',
            '/api/defect-rate-by-category (GET)',
            '/api/quality-objective (GET)',
            '/api/waste-reduction-objective (GET)',
            '/api/article-defects (GET)',
            '/api/production-waste (GET)',
            '/api/machines (GET, POST)',
            '/api/arrets (GET, POST)',
            '/api/production-dashboard (GET)',
            '/api/reports (POST)'
        ]
    })

@app.route('/api/init-db', methods=['POST'])
def initialize_database():
    from config import init_db
    init_db()
    return jsonify({'message': 'Database initialized!'}), 201

class ArticleResource(Resource):
    def get(self):
        return {'articles': Article.get_all()}
    def post(self):
        data = request.json
        article = Article.create(data)
        return {'article': article}, 201

class VisitesQualiteResource(Resource):
    def get(self):
        return {'visites_qualite': VisiteQualite.get_all()}
    def post(self):
        data = request.json
        visite = VisiteQualite.create(data)
        return {'visite_qualite': visite}, 201

class DefautsResource(Resource):
    def get(self):
        return {'defauts': Defaut.get_all()}
    def post(self):
        data = request.json
        defaut = Defaut.create(data)
        return {'defaut': defaut}, 201

class ProductionResource(Resource):
    def get(self):
        return {'production': Production.get_all()}
    def post(self):
        data = request.json
        prod = Production.create(data)
        return {'production': prod}, 201

@app.route('/api/kpis', methods=['GET'])
def get_kpis():
    return calculate_dashboard_kpis()

@app.route('/api/top5-production-waste-defects', methods=['GET'])
def top5_production_waste_defects():
    return get_top5_article_waste_and_defects()

@app.route('/api/defect-rate-by-category', methods=['GET'])
def defect_rate_by_category():
    return get_defect_rate_by_category()

@app.route('/api/quality-objective', methods=['GET'])
def quality_objective():
    return get_quality_objective()

@app.route('/api/waste-reduction-objective', methods=['GET'])
def waste_reduction_objective():
    return get_waste_reduction_objective()

@app.route('/api/article-defects', methods=['GET'])
def article_defects():
    return get_all_article_defects()

@app.route('/api/production-waste', methods=['GET'])
def production_waste():
    return get_all_production_waste()

@app.route('/api/reports', methods=['POST', 'GET'])
def generate_report():
    if request.method == 'GET':
        return jsonify({
            'message': 'Utilisez POST pour générer un rapport.',
            'report_types': [
                'article_measurements',
                'defect_details',
                'quality_visit_report'
            ]
        }), 200

    data = request.json
    report_type = data.get('report_type')
    date_from = data.get('date_from')
    date_to = data.get('date_to')
    if not report_type or not date_from or not date_to:
        return jsonify({'error': 'Champs manquants.'}), 400
    result, status = get_report_data(report_type, date_from, date_to)
    return jsonify(result), status

@app.route('/api/reports/pdf', methods=['POST'])
def generate_report_pdf():
    data = request.json
    report_type = data.get('report_type')
    date_from = data.get('date_from')
    date_to = data.get('date_to')
    if not report_type or not date_from or not date_to:
        return jsonify({'error': 'Champs manquants.'}), 400
    # Get report data
    result, status = get_report_data(report_type, date_from, date_to)
    if status != 200:
        return jsonify(result), status
    # Get KPIs
    kpis = requests.get('http://localhost:5000/api/kpis').json()
    # Generate PDF
    pdf_buffer = generate_pdf_report(report_type, date_from, date_to, kpis, result['data'])
    return send_file(pdf_buffer, as_attachment=True, download_name='rapport.pdf', mimetype='application/pdf')

class MachinesResource(Resource):
    def get(self):
        return {'machines': Machine.get_all()}
    def post(self):
        data = request.json
        machine = Machine.create(data)
        return {'machine': machine}, 201

class ArretsResource(Resource):
    def get(self):
        return {'arrets': Arret.get_all()}
    def post(self):
        data = request.json
        arret = Arret.create(data)
        return {'arret': arret}, 201

@app.route('/api/production-dashboard', methods=['GET'])
def production_dashboard():
    return get_production_dashboard()

api.add_resource(ArticleResource, '/api/articles')
api.add_resource(VisitesQualiteResource, '/api/visites_qualite')
api.add_resource(DefautsResource, '/api/defauts')
api.add_resource(ProductionResource, '/api/production')
api.add_resource(MachinesResource, '/api/machines')
api.add_resource(ArretsResource, '/api/arrets')