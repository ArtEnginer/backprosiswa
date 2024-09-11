from sqlalchemy import Column, Integer
from sqlalchemy.orm import declarative_base
from sqlalchemy_easy_softdelete.hook import IgnoredTable
from sqlalchemy_easy_softdelete.mixin import generate_soft_delete_mixin_class
from sqlalchemy.inspection import inspect
from . import db
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from flask import url_for
from flask_login import UserMixin
from sqlalchemy_serializer import SerializerMixin
import json
from datetime import datetime
import locale
locale.setlocale(locale.LC_TIME, "id_ID")


# Create a Class that inherits from our class builder

class SoftDeleteMixin(generate_soft_delete_mixin_class(
    # This table will be ignored by the hook
    # even if the table has the soft-delete column
    ignored_tables=[IgnoredTable(table_schema="public", name="cars"),]
)):
    # type hint for autocomplete IDE support
    deleted_at: datetime


# Apply the mixin to your Models
Base = declarative_base()


class User(db.Model, UserMixin, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    username = db.Column(db.String(150), unique=True)
    name = db.Column(db.String(150))
    password_hash = db.Column(db.String(256))
    date_created = db.Column(db.DateTime(timezone=True), default=func.now())
    group_id = db.Column(db.Integer, db.ForeignKey("auth_group.id"))
    group = db.relationship("AuthGroup", backref="user")

    @property
    def password(self):
        raise AttributeError("Password is no readable")

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self) -> str:
        return "<Name %r>" % self.name

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "name": self.name,
            "group_id": self.group_id,
        }


class AuthGroup(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)


class Siswa(db.Model, SerializerMixin, SoftDeleteMixin):
    __tablename__ = "siswa"
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.Text, nullable=False)
    kode = db.Column(db.Text, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "nama": self.nama,
            "kode": self.kode,
        }

    def toList(self):
        return [self.id, self.nama, self.kode]
    
class Mapel(db.Model, SerializerMixin, SoftDeleteMixin):
    __tablename__ = "mapel"
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.Text, nullable=False)
    kode = db.Column(db.Text, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "nama": self.nama,
            "kode": self.kode,
        }

class Nilai(db.Model, SerializerMixin, SoftDeleteMixin):
    __tablename__ = "mutasi"
    id = db.Column(db.Integer, primary_key=True)
    id_siswa = db.Column(db.Integer, nullable=False)
    id_mapel = db.Column(db.Integer, nullable=False)
    semester = db.Column(db.Integer, nullable=True)
    nilai = db.Column(db.Text, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "id_siswa": self.id_siswa,
            "id_mapel": self.id_mapel,
            "semester": self.semester,
            "nilai": self.nilai,
        }

    def toList(self):
        return [self.id, self.id_siswa, self.id_mapel, self.semester, self.nilai]


class Models(db.Model, SerializerMixin, SoftDeleteMixin):
    __tablename__ = "models"
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.Text, nullable=False)
    testsize = db.Column(db.Float, nullable=True)
    n = db.Column(db.Integer, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "nama": self.nama,
            "testsize": self.testsize,
            "n": self.n
        }


class Results(db.Model, SerializerMixin, SoftDeleteMixin):
    __tablename__ = "results"
    id = db.Column(db.Integer, primary_key=True)
    id_model = db.Column(db.Integer, nullable=False)
    id_nilai = db.Column(db.Integer, nullable=False)
    rmse = db.Column(db.Float, nullable=True)
    mape = db.Column(db.Float, nullable=True)
    testindex = db.Column(db.Text, nullable=True)
    trainindex = db.Column(db.Text, nullable=True)
    y_true = db.Column(db.Text, nullable=True)
    y_pred = db.Column(db.Text, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "id_model": self.id_model,
            "id_obat": self.id_obat,
            "rmse": self.rmse,
            "mape": self.mape,
            "testindex": self.testindex,
            "trainindex": self.trainindex,
            "y_true": self.y_true,
            "y_pred": self.y_pred,
        }

class Data(db.Model, SerializerMixin, SoftDeleteMixin):
    __tablename__ = "data"
    id = db.Column(db.Integer, primary_key=True)
    id_result = db.Column(db.Integer, nullable=False)
    id_nilai = db.Column(db.Integer, nullable=False)
    row = db.Column(db.Text, nullable=True)
    y = db.Column(db.Float, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "id_result": self.id_result,
            "id_obat": self.id_obat,
            "row": self.row,
            "y": self.y
        }