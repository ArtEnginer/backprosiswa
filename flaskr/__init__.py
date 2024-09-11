import os

from functools import wraps
from flask import Flask, render_template, redirect, flash, url_for, current_app, request
from flask_sqlalchemy import SQLAlchemy
from flaskr.config import Config
from flask_login import LoginManager, current_user
from flask_login.config import EXEMPT_METHODS

db = SQLAlchemy()
login_manager = LoginManager()


def admin_required(func):
    """
    Modified login_required decorator to restrict access to admin group.
    """

    @wraps(func)
    def decorated_view(*args, **kwargs):
        if request.method in EXEMPT_METHODS or current_app.config.get("LOGIN_DISABLED"):
            pass
        elif not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()

        if current_user.group_id != 1:  # zero means admin, one and up are other groups
            flash("You don't have permission to access this resource.", "warning")
            return redirect(url_for("views.home"))
        # flask 1.x compatibility
        # current_app.ensure_sync is only available in Flask >= 2.0
        if callable(getattr(current_app, "ensure_sync", None)):
            return current_app.ensure_sync(func)(*args, **kwargs)
        return func(*args, **kwargs)

    return decorated_view

def create_app(config_class=Config):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)
    db.init_app(app)

    from .views import views
    from .auth import auth
    from .api import api

    @app.context_processor
    def super_processor():
        return dict(user=current_user)
    
    @app.errorhandler(404)
    def not_found(e):
        return render_template("404.html"), 404

    app.register_blueprint(views, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(api, url_prefix="/api")

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from .models import Siswa, Mapel, Nilai, Models, Results, User

    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))

    return app
