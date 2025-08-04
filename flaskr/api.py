import email
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from . import db
from .models import Siswa, Mapel, Nilai, NilaiUjian, Jurusan, Models, Results, User
import numpy as np
from flask_login import login_user, logout_user, login_required, current_user
import os
import shutil
import pickle
import json
from sklearn.neural_network import MLPRegressor
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, root_mean_squared_error
import pandas as pd

def safe_load(path):
    if os.path.exists(path):
        data = pickle.load(open(path, 'rb'))
        return data.tolist() if isinstance(data, np.ndarray) else data
    return []

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
        body = request.get_json()

        # Ambil data utama siswa
        data = Siswa(
            nama=body.get("nama"),
            nisn=body.get("nisn"),
            id_jurusan=body.get("id_jurusan")
        )
        db.session.add(data)
        db.session.commit()

        siswa_id = data.id

        # Simpan nilai
        for item in body.get("nilai", []):
            nilai = Nilai(
                id_siswa=siswa_id,
                id_mapel=item["id_mapel"],
                semester=item["semester"],
                nilai=item["nilai"]
            )
            db.session.add(nilai)

        # Simpan ujian
        for item in body.get("ujian", []):
            ujian = NilaiUjian(
                id_siswa=siswa_id,
                id_mapel=item["id_mapel"],
                nilai=item["nilai"]
            )
            db.session.add(ujian)

        db.session.commit()

        return jsonify({
            "toast": {
                "icon": "success",
                "title": "Data siswa dan nilai berhasil ditambahkan"
            },
            "data": data.serialize()
        }), 200

    data = Siswa.query.all()
    return {"data": [k.serialize() for k in data]}, 200


@api.route("/mapel", methods=["GET", "POST"])
def mapel():
    if request.method == 'POST':
        data = Mapel(nama=request.form.get("nama"),
                     kode=request.form.get("kode"))
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
        body = request.get_json()
        nilai = body.get("nilai", [])
        ujian = body.get("ujian", [])

        # Update data nilai
        for item in nilai:
            id_mapel = item.get("id_mapel")
            semester = item.get("semester")
            nilai_baru = item.get("nilai")

            # Cari nilai yang sudah ada
            data_nilai = Nilai.query.filter_by(
                id_siswa=item.get("id_siswa"),
                id_mapel=id_mapel,
                semester=semester
            ).first()

            if data_nilai:
                data_nilai.nilai = nilai_baru
            else:
                # Jika tidak ditemukan, bisa juga dibuat baru jika kamu mau
                data_nilai = Nilai(
                    id_siswa=item.get("id_siswa"),
                    id_mapel=id_mapel,
                    semester=semester,
                    nilai=nilai_baru
                )
                db.session.add(data_nilai)

        # Update data ujian
        for item in ujian:
            id_mapel = item.get("id_mapel")
            nilai_baru = item.get("nilai")

            data_ujian = NilaiUjian.query.filter_by(
                id_siswa=item.get("id_siswa"),
                id_mapel=id_mapel
            ).first()

            if data_ujian:
                data_ujian.nilai = nilai_baru
            else:
                # Jika tidak ditemukan, bisa juga dibuat baru
                data_ujian = NilaiUjian(
                    id_siswa=item.get("id_siswa"),
                    id_mapel=id_mapel,
                    nilai=nilai_baru
                )
                db.session.add(data_ujian)

        db.session.commit()

        return {
            "toast": {
                "icon": "success",
                "title": "Nilai dan ujian berhasil diperbarui"
            }
        }, 200
    data = Nilai.query.all()
    return {"data": [k.serialize() for k in data]}, 200


@api.route("/ujian", methods=["GET", "POST"])
def ujian():
    if request.method == 'POST':
        data = NilaiUjian(id_siswa=request.form.get("id_siswa"), id_mapel=request.form.get(
            "id_mapel"), nilai=request.form.get("nilai"))
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
        data = Jurusan(nama=request.form.get("nama"),
                       kode=request.form.get("kode"))
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
        pelatihan = Models(nama=request.form.get("nama"), testsize=float(request.form.get("testsize")), max_iter=int(
            request.form.get("max_iter")), learning_rate=float(request.form.get("learning_rate")))
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

        d = os.getcwd()
        path_folder = os.path.join(d, "model", pelatihan.nama)

        if os.path.exists(path_folder):
            return False
        os.makedirs(path_folder)

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
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=pelatihan.testsize, shuffle=False)
            pickle.dump(X_train, open(
                f"model/{pelatihan.nama}/{m.kode}_X_train.pkl", 'wb'))
            pickle.dump(X_test, open(
                f"model/{pelatihan.nama}/{m.kode}_X_test.pkl", 'wb'))
            pickle.dump(y_train, open(
                f"model/{pelatihan.nama}/{m.kode}_y_train.pkl", 'wb'))
            pickle.dump(y_test, open(
                f"model/{pelatihan.nama}/{m.kode}_y_test.pkl", 'wb'))
            backpropagation = MLPRegressor(hidden_layer_sizes=(
                4), random_state=1, max_iter=pelatihan.max_iter, learning_rate_init=pelatihan.learning_rate).fit(X_train, y_train)
            y_pred = backpropagation.predict(X_test)
            pickle.dump(y_pred, open(
                f"model/{pelatihan.nama}/{m.kode}_y_pred.pkl", 'wb'))
            loss = root_mean_squared_error(y_test, y_pred)
            if loss < best_loss:
                best_loss = loss
            losses[m.kode] = backpropagation.loss_curve_
            pickle.dump(backpropagation, open(
                f"model/{pelatihan.nama}/{m.kode}.pkl", 'wb'))
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

    allModels = Models.query.all()
    # include X_train, X_test, y_train, y_test, losses
    data = []
    for model in allModels:
        model_data = model.serialize()
        model_data['losses'] = json.loads(model.losses) if model.losses else {}
        mapel = Mapel.query.all()
        for m in mapel:
            model_data[m.kode] = {}
            model_data[m.kode]['X_train'] = safe_load(f"model/{model.nama}/{m.kode}_X_train.pkl")
            model_data[m.kode]['X_test'] = safe_load(f"model/{model.nama}/{m.kode}_X_test.pkl")
            model_data[m.kode]['y_train'] = safe_load(f"model/{model.nama}/{m.kode}_y_train.pkl")
            model_data[m.kode]['y_test'] = safe_load(f"model/{model.nama}/{m.kode}_y_test.pkl")
            model_data[m.kode]['y_pred'] = safe_load(f"model/{model.nama}/{m.kode}_y_pred.pkl")
        data.append(model_data)

    return {"data": data}, 200



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
        shutil.rmtree(f"model/{data.nama}")
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
    file = request.files['file']
    name = request.form.get("model")

    if not os.path.exists(f'model/{name}'):
        return {"toast": {
            "icon": "error",
            "title": "Model tidak ditemukan"
        }}, 404

    model = {}
    kode = ["indo", "mtk", "inggris"]
    for m in kode:
        model[m] = pickle.load(open(f"model/{name}/{m}.pkl", 'rb'))

    df = pd.read_excel(file)

    df[["jurusan", "nisn", "nama"]] = df[[
        "jurusan", "nisn", "nama"]].fillna("-")
    for m in ["indo", "mtk", "inggris"]:
        for i in range(1, 5):
            df[f"{m}{i}"] = df[f"{m}{i}"].fillna(0)

    for m in kode:
        fitur = df[[f"{m}1", f"{m}2", f"{m}3", f"{m}4"]]
        df[m] = model[m].predict(fitur)

    df.to_excel("flaskr/static/xlsx/prediksi.xlsx", index=False)

    data = df.to_dict(orient="records")

    return {"toast": {
        "icon": "success",
        "title": "Data berhasil diprediksi"
    }, "data": data}, 200
