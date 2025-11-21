from flask import Flask
from flask_cors import CORS

from controllers.note_controller import bp_notes
from controllers.user_controller import bp_users
from controllers.collection_controller import bp_collections
from controllers.tag_controller import bp_tags
from utils.filter import register_global_filter
from utils.logger import init_logger
from utils.swagger import init_swagger

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    
    init_swagger(app)
    init_logger(app)

    register_global_filter(app)

    app.register_blueprint(bp_users)
    app.register_blueprint(bp_notes)
    app.register_blueprint(bp_collections)
    app.register_blueprint(bp_tags)
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
