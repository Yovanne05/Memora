import config
from flask import Flask
from flask_cors import CORS

from controllers.auth_controller import bp_sessions
from controllers.collection_controller import bp_collections
from controllers.note_controller import bp_notes
from controllers.note_link_controller import bp_note_relations
from controllers.user_controller import bp_users
from controllers.share_note_controller import bp_note_shares
from controllers.share_collection_controller import bp_collection_shares
from controllers.note_share_link_controller import bp_note_share_links
from controllers.collection_share_link_controller import bp_collection_share_links
from controllers.shared_note_controller import bp_shared_notes
from controllers.shared_collection_controller import bp_shared_collections
from controllers.note_favorite_controller import bp_note_favorites
from controllers.collection_favorite_controller import bp_collection_favorites
from controllers.image_note_controller import bp_note_images
from controllers.flashcard_controller import bp_flashcards, bp_note_flashcards
from controllers.user_statistics_controller import bp_user_statistics
from controllers.realtime_collaboration_controller import register_socketio_handlers
from controllers.review_controller import bp_reviews
from controllers.report_controller import bp_reports
from utils import db
from utils.jwt import init_jwt
from utils.filter import register_global_filter
from utils.logger import init_logger
from utils.realtime_filter import register_realtime_filter
from utils.swagger import init_swagger
from utils.redis_client import init_redis
from utils.socketio_service import init_socketio
from utils.crdt_service import init_crdt_service
from utils.background_jobs import init_background_jobs


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = config.JWT_ACCESS_TOKEN_EXPIRES
    app.config["MAX_CONTENT_LENGTH"] = config.IMAGE_MAX_CONTENT_LENGTH

    init_jwt(app)
    init_swagger(app)
    init_logger(app)

    redis_client = init_redis(
        host=config.REDIS_HOST,
        port=config.REDIS_PORT,
        db=config.REDIS_DB
    )

    init_crdt_service(redis_client=redis_client)

    if config.APP_ENV != "test":
        init_background_jobs(
            crdt_snapshot_interval=30,   # 30 secondes
            session_cleanup_interval=30, # 30 secondes
        )


    socketio = init_socketio(app, cors_allowed_origins="*", async_mode="threading")
    register_realtime_filter(socketio)


    if config.APP_ENV == "test":
        with app.app_context():
            db.create_all()
            
    register_socketio_handlers()
    register_global_filter(app)

    app.register_blueprint(bp_sessions)
    app.register_blueprint(bp_users)
    app.register_blueprint(bp_notes)
    app.register_blueprint(bp_note_relations)
    app.register_blueprint(bp_collections)
    app.register_blueprint(bp_note_shares)
    app.register_blueprint(bp_collection_shares)
    app.register_blueprint(bp_note_share_links)
    app.register_blueprint(bp_collection_share_links)
    app.register_blueprint(bp_shared_notes)
    app.register_blueprint(bp_shared_collections)
    app.register_blueprint(bp_note_images)
    app.register_blueprint(bp_flashcards)
    app.register_blueprint(bp_note_flashcards)
    app.register_blueprint(bp_user_statistics)
    app.register_blueprint(bp_reviews)
    app.register_blueprint(bp_note_favorites)
    app.register_blueprint(bp_collection_favorites)
    app.register_blueprint(bp_reports)

    return app

if __name__ == "__main__":
    from utils.socketio_service import run_socketio
    app = create_app()
    run_socketio(app, debug=True, host="0.0.0.0", port=5000)
