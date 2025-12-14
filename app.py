import config
from flask import Flask
from flask_cors import CORS

from controllers.auth_controller import bp_auth
from controllers.collection_controller import bp_collections
from controllers.note_controller import bp_notes
from controllers.user_controller import bp_users
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

    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_users)
    app.register_blueprint(bp_notes)
    app.register_blueprint(bp_collections)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
