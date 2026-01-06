import config
from flask import Flask
from flask_cors import CORS

from controllers.auth_controller import bp_sessions
from controllers.collection_controller import bp_collections
from controllers.note_controller import bp_notes
from controllers.note_link_controller import bp_note_links
from controllers.user_controller import bp_users
from controllers.share_note_controller import bp_note_shares
from controllers.share_collection_controller import bp_collection_shares
from controllers.note_share_link_controller import bp_note_share_links
from controllers.collection_share_link_controller import bp_collection_share_links
from controllers.note_share_link_public_controller import (
    bp_note_share_link_public,
)
from controllers.collection_share_link_public_controller import (
    bp_collection_share_link_public,
)
from controllers.note_favorite_controller import bp_note_favorites
from controllers.collection_favorite_controller import bp_collection_favorites
from controllers.image_note_controller import bp_note_images
from controllers.flashcard_controller import bp_flashcards, bp_note_flashcards
from controllers.user_statistics_controller import bp_user_statistics
from controllers.review_controller import bp_reviews
from utils import db
from utils.jwt import init_jwt
from utils.limiter import init_limiter
from utils.filter import register_global_filter
from utils.logger import init_logger
from utils.swagger import init_swagger

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = config.JWT_ACCESS_TOKEN_EXPIRES
    app.config["RATELIMIT_STORAGE_URI"] = config.RATELIMIT_STORAGE_URI

    init_limiter(app)
    init_jwt(app)
    init_swagger(app)
    init_logger(app)
    
    if config.APP_ENV == "test":
        with app.app_context():
            db.create_all()

    register_global_filter(app)

    app.register_blueprint(bp_sessions)
    app.register_blueprint(bp_users)
    app.register_blueprint(bp_notes)
    app.register_blueprint(bp_note_links)
    app.register_blueprint(bp_collections)
    app.register_blueprint(bp_note_shares)
    app.register_blueprint(bp_collection_shares)
    app.register_blueprint(bp_note_share_links)
    app.register_blueprint(bp_collection_share_links)
    app.register_blueprint(bp_note_share_link_public)
    app.register_blueprint(bp_collection_share_link_public)
    app.register_blueprint(bp_note_images)
    app.register_blueprint(bp_flashcards)
    app.register_blueprint(bp_note_flashcards)
    app.register_blueprint(bp_user_statistics)
    app.register_blueprint(bp_reviews)
    app.register_blueprint(bp_note_favorites)
    app.register_blueprint(bp_collection_favorites)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
