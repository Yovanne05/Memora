from flask import Flask
from flask_cors import CORS

from controllers.note_controller import bp_notes
from controllers.user_controller import bp_users
from controllers.collection_controller import bp_collections
from controllers.share_note_controller import bp_note_shares
from controllers.share_collection_controller import bp_collection_shares
from controllers.image_note_controller import bp_note_images
from config import APP_ENV
from utils import db
from utils.filter import register_global_filter
from utils.logger import init_logger
from utils.swagger import init_swagger

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    init_swagger(app)
    init_logger(app)
    
    if APP_ENV == "test":
        with app.app_context():
            db.create_all()

    register_global_filter(app)

    app.register_blueprint(bp_users)
    app.register_blueprint(bp_notes)
    app.register_blueprint(bp_collections)
    app.register_blueprint(bp_note_shares)
    app.register_blueprint(bp_collection_shares)
    app.register_blueprint(bp_note_images)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
