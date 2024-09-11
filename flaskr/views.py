from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from flask_login import login_required, current_user
from .models import Models
from . import db

views = Blueprint("views", __name__)


@views.route("/")
def index():
    return render_template(
        "page/index.html",
        page="home",
    )

@views.route("/home")
def home():
    return render_template(
        "page/index.html",
        page="home",
    )

@views.route("/siswa")
def siswa():
    return render_template(
        "page/siswa.html",
        page="siswa",
    )

@views.route("/mapel")
def mapel():
    return render_template(
        "page/mapel.html",
        page="mapel",
    )

@views.route("/nilai")
def nilai():
    return render_template(
        "page/nilai.html",
        page="nilai",
    )

@views.route("/pelatihan")
def pelatihan():
    return render_template(
        "page/pelatihan.html",
        page="pelatihan",
    )

@views.route("/prediksi")
def prediksi():
    return render_template(
        "page/prediksi.html",
        page="prediksi",
    )