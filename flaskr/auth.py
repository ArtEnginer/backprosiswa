from flask import Blueprint, render_template, redirect, url_for, request, flash
from . import db
from .models import User
from flask_login import login_user, logout_user, login_required, current_user

auth = Blueprint("auth", __name__)


@auth.route("/login", methods=['GET'])
def login():
    if request.method == 'POST':
        username = request.form.get("username")
        password = request.form.get("password")

        user = User.query.filter_by(username=username).first()
        if user:
            if user.verify_password(password):
                flash("Logged in!", category='success')
                login_user(user, remember=True)
                return redirect(url_for('views.home'))
            else:
                flash('Password yang anda masukkan salah', category='error')
        else:
            flash('Username tidak dapat ditemukan', category='error')

    return render_template("auth/login.html", user=current_user)


@auth.route("/sign-up", methods=['GET', 'POST'])
@auth.route("/register", methods=['GET', 'POST'])
def sign_up():
    return {"message": "Tidak dapat melakukan pendaftaran"}, 401


@auth.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("views.index"))
