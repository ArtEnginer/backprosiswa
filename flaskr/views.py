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

@views.route("/obat")
def obat():
    return render_template(
        "page/obat.html",
        page="obat",
    )

@views.route("/mutasi")
def mutasi():
    return render_template(
        "page/mutasi.html",
        page="mutasi",
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