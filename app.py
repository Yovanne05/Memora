from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import text

from utils.db import get_db_session
from utils.logger import init_logger
from utils.swagger import init_swagger

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    
    init_swagger(app)
    init_logger(app)
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)