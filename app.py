from flask import Flask
from flask_cors import CORS

from controllers.note_controller import bp_notes
from utils.logger import init_logger
from utils.swagger import init_swagger

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    
    init_swagger(app)
    init_logger(app)

    app.register_blueprint(bp_notes)
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
