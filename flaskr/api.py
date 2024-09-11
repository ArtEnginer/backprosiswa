import email
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from . import db
from .models import Siswa, Mapel, Nilai, NilaiUjian,Jurusan, Models, Results, User
import numpy as np
from flask_login import login_user, logout_user, login_required, current_user
import os
import pickle
import json
from sklearn.neural_network import MLPRegressor
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

api = Blueprint("api", __name__)


@api.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    remember = request.form.get("rememberMe") == "on"

    user = User.query.filter_by(username=username).first()
    if user:
        if (password) and user.verify_password(password):
            login_user(user, remember=remember)
            return {"toast": {
                "icon": "success",
                "title": "Login Berhasil"
            }, "login": True, "redirect": url_for('views.home')}, 200
        else:
            return {"toast": {
                "icon": "error",
                "title": "Password yang anda masukkan salah"
            }, "login": False}, 200
    else:
        return {"toast": {
                "icon": "error",
                "title": "Username tidak dapat ditemukan"
                }, "login": False}, 200


@api.route("/siswa", methods=["GET", "POST"])
def siswa():
    if request.method == 'POST':
        data = Siswa(nama=request.form.get("nama"), kode=request.form.get("kode"))
        db.session.add(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": data.serialize()}, 200

    data = Siswa.query.all()
    return {"data": [k.serialize() for k in data]}, 200

@api.route("/mapel", methods=["GET", "POST"])
def mapel():
    if request.method == 'POST':
        data = Mapel(nama=request.form.get("nama"), kode=request.form.get("kode"))
        db.session.add(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": data.serialize()}, 200

    data = Mapel.query.all()
    return {"data": [k.serialize() for k in data]}, 200

@api.route("/nilai", methods=["GET", "POST"])
def nilai():
    if request.method == 'POST':
        data = Nilai(siswa_id=request.form.get("id_siswa"), mapel_id=request.form.get("id_mapel"), kkm=request.form.get("semester"), nilai=request.form.get("nilai"))
        db.session.add(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": data.serialize()}, 200

    data = Nilai.query.all()
    return {"data": [k.serialize() for k in data]}, 200

@api.route("/ujian", methods=["GET", "POST"])
def ujian():
    if request.method == 'POST':
        data = NilaiUjian(id_siswa=request.form.get("id_siswa"), id_mapel=request.form.get("id_mapel"), nilai=request.form.get("nilai"))
        db.session.add(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": data.serialize()}, 200

    data = NilaiUjian.query.all()
    return {"data": [k.serialize() for k in data]}, 200

@api.route("/jurusan", methods=["GET", "POST"])
def jurusan():
    if request.method == 'POST':
        data = Jurusan(nama=request.form.get("nama"), kode=request.form.get("kode"))
        db.session.add(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": data.serialize()}, 200

    data = Jurusan.query.all()
    return {"data": [k.serialize() for k in data]}, 200


@api.route("/siswa/<id>", methods=["GET", "POST", "DELETE"])
def siswabyid(id):
    data = Siswa.query.get(id)
    if request.method == 'POST':
        data.nama = request.form.get("nama")
        data.kode = request.form.get("kode")
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data berhasil disimpan"
        }, "data": data.serialize()}, 200
    if request.method == 'DELETE':
        db.session.delete(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data berhasil dihapus"
        }}, 200
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data tidak ditemukan"
        }}, 404
    return {"data": data.serialize()}, 200


@api.route("/pelatihan", methods=["GET", "POST"])
def pelatihan():
    if request.method == 'POST':
        pelatihan = Models(nama=request.form.get("nama"), testsize=float(request.form.get("testsize")), max_iter=int(request.form.get("max_iter")), learning_rate=float(request.form.get("learning_rate")))
        db.session.add(pelatihan)
        db.session.flush()
        db.session.refresh(pelatihan)
        siswa = Siswa.query.all()
        mapel = Mapel.query.all()
        jurusan = Jurusan.query.all()
        nilai = Nilai.query.all()
        ujian = NilaiUjian.query.all()
        best_loss = 99999
        losses = {}
        for m in mapel:
            X = []
            y = []
            for s in siswa:
                row = []
                for smt in range(4):
                    for n in nilai:
                        if n.id_siswa == s.id and n.id_mapel == m.id and n.semester == (smt + 1):
                            row.append(n.nilai)
                for u in ujian:
                    if u.id_siswa == s.id and u.id_mapel == m.id:
                        y.append(u.nilai)
                X.append(row)
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=pelatihan.testsize, shuffle=False)
            backpropagation = MLPRegressor(random_state=1, max_iter=pelatihan.max_iter, learning_rate_init=pelatihan.learning_rate).fit(X_train, y_train)
            y_pred = backpropagation.predict(X_test)
            loss = mean_squared_error(y_test, y_pred)
            if loss < best_loss:
                best_loss = loss
            losses[m.kode] = backpropagation.loss_curve_
            pickle.dump(backpropagation, open(f"train/{pelatihan.nama}-{m.kode}.pkl", 'wb')) 
            # return {"toast": {
            #     "icon": "success",
            #     "title": "Data baru berhasil ditambahkan"
            # }, "data": [X_train, X_test, y_train, y_test]}, 200
        # db.session.commit()
        pelatihan.best_loss = best_loss
        pelatihan.losses = json.dumps(losses)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": pelatihan.serialize()}, 200

    data = Models.query.all()
    return {"data": [k.serialize() for k in data]}, 200


@api.route("/pelatihan/<id>", methods=["GET", "POST", "DELETE"])
def pelatihanbyid(id):
    data = Models.query.get(id)
    if request.method == 'POST':
        data.nama = request.form.get("nama")
        data.algoritma = request.form.get("algoritma")
        data.kfold = request.form.get("kfold")
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data berhasil disimpan"
        }, "data": data.serialize()}, 200
    if request.method == 'DELETE':
        # delete models file by name
        os.remove(f"models/{data.nama}.pkl")
        db.session.query(Results).filter(Results.id_model == data.id).delete()
        db.session.delete(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data berhasil dihapus"
        }}, 200
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data tidak ditemukan"
        }}, 404
    return {"data": data.serialize()}, 200


@api.route("/results", methods=["GET"])
def results():
    data = Results.query.all()
    return {"data": [k.serialize() for k in data]}, 200


@api.route("/user", methods=["GET", "POST"])
def user():
    if request.method == 'POST':
        data = User(name=request.form.get("name"), email=request.form.get(
            "email"), username=request.form.get("username"), password=request.form.get("password"), group_id=2)
        db.session.add(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": data.serialize()}, 200
    data = User.query.all()
    data = [k for k in data if k.group_id != 1]
    return {"data": [k.serialize() for k in data]}, 200


@api.route("/user/<id>", methods=["GET", "POST", "DELETE"])
def userbyid(id):
    data = User.query.get(id)
    if request.method == 'POST':
        data.name = request.form.get("name")
        data.email = request.form.get("email")
        data.username = request.form.get("username")
        if request.form.get("password") != "":
            data.password = request.form.get("password")
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data berhasil disimpan"
        }, "data": data.serialize()}, 200
    if request.method == 'DELETE':
        db.session.delete(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data berhasil dihapus"
        }}, 200
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data tidak ditemukan"
        }}, 404
    return {"data": data.serialize()}, 200


@api.route("/prediksi", methods=["POST"])
def prediksi():
    data = Models.query.get(request.form.get("id_model"))
    mapel = Mapel.query.get(request.form.get("id_mapel"))
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data tidak ditemukan"
        }}, 404
    smt1 = float(request.form.get("nilai1"))
    smt2 = float(request.form.get("nilai2"))
    smt3 = float(request.form.get("nilai3"))
    smt4 = float(request.form.get("nilai4"))
    model = pickle.load(open(f"train/{data.nama}-{mapel.kode}.pkl", 'rb'))
    data.status = model.predict([[smt1, smt2, smt3, smt4]])[0]
    return {"toast": {
        "icon": "success",
        "title": "Data berhasil diprediksi"
    }, "data": data.serialize(), "prediksi": data.status}, 200
