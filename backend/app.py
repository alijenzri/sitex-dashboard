from config import app
from flask_cors import CORS
import routes

CORS(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)