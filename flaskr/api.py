import email
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from . import db
from .models import Siswa, Mapel, Nilai, Models, Results, User
import numpy as np
from sklearn.model_selection import KFold
from flask_login import login_user, logout_user, login_required, current_user
from sklearn import tree
from sklearn.naive_bayes import GaussianNB, BernoulliNB, MultinomialNB, CategoricalNB, ComplementNB
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_curve, auc
import os
import pickle
import json

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

    data = siswa.query.all()
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
        pelatihan = Models(nama=request.form.get("nama"), algoritma=request.form.get(
            "algoritma"), kfold=request.form.get("kfold"))
        db.session.add(pelatihan)
        db.session.flush()
        db.session.refresh(pelatihan)
        data = Balita.query.all()
        X = []
        y = []
        for i in data:
            X.append([i.bb, i.tb])
            y.append(i.status)
        kf = KFold(n_splits=int(pelatihan.kfold))
        best_akurasi = 0
        best_model = None
        fold = 1
        for train_index, test_index in kf.split(X):
            X_train, X_test = np.array(X)[train_index], np.array(X)[test_index]
            y_train, y_test = np.array(y)[train_index], np.array(y)[test_index]
            if pelatihan.algoritma == "c45":
                clf = tree.DecisionTreeClassifier(
                    random_state=0, criterion='entropy')
            elif pelatihan.algoritma == "nb":
                clf = BernoulliNB()
            clf = clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            cm = classification_report(y_test, y_pred, output_dict=True)
            akurasi = round(accuracy_score(y_test, y_pred), 2)
            result = Results(id_model=pelatihan.id, fold=fold, akurasi=akurasi, presisi=cm["weighted avg"]["precision"], recall=cm["weighted avg"][
                "recall"], f1score=cm["weighted avg"]["f1-score"], support=cm["weighted avg"]["support"], testindex=json.dumps(test_index.tolist()), trainindex=json.dumps(train_index.tolist()), y_true=json.dumps(y_test.tolist
                                                                                                                                                                                                                    ()), y_pred=json.dumps(y_pred.tolist()))
            if akurasi > best_akurasi:
                best_akurasi = akurasi
                best_model = clf
            fold += 1
            db.session.add(result)
        db.session.commit()

        pelatihan.akurasi = best_akurasi
        pickle.dump(best_model, open(f"models/{pelatihan.nama}.pkl", 'wb'))
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
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data tidak ditemukan"
        }}, 404
    data.bb = request.form.get("bb")
    data.tb = request.form.get("tb")
    data.bb = float(data.bb)
    data.tb = float(data.tb)
    model = pickle.load(open(f"models/{data.nama}.pkl", 'rb'))
    data.status = model.predict([[data.bb, data.tb]])[0]
    return {"toast": {
        "icon": "success",
        "title": "Data berhasil diprediksi"
    }, "data": data.serialize(), "status": data.status}, 200
