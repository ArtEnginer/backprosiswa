from flask_seeder import Seeder, Faker, generator
from flaskr.models import (
    Siswa,
    Mapel,
    Jurusan,
    Nilai,
    NilaiUjian,
    Models,
    Results,
    User,
    AuthGroup,
)
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd


class InitSeeder(Seeder):
    def run(self):
        users = [
            User(
                email="admin@gmail.com",
                username="admin",
                name="Admin",
                password="123456",
                group_id=1,
            ),
        ]
        groups = [
            AuthGroup(name="admin"),
            AuthGroup(name="user"),
        ]

        for user in users:
            print("Adding user: %s" % user)
            self.db.session.add(user)
        for group in groups:
            print("Adding user to group: %s" % group)
            self.db.session.add(group)
        data = pd.read_excel("dataset/all.xlsx")
        self.db.session.add(Jurusan(nama="Teknik Komputer Jaringan", kode="TKJ"))
        self.db.session.add(Jurusan(nama="Bisnis Daring Pemasaran", kode="BDP"))
        self.db.session.add(Jurusan(nama="Akuntansi", kode="AK"))
        self.db.session.add(Jurusan(nama="Tata Busana", kode="TB"))
        self.db.session.add(Jurusan(nama="Farmasi", kode="FR"))

        self.db.session.add(Mapel(nama="Bahasa Indonesia", kode="indo"))
        self.db.session.add(Mapel(nama="Matematika", kode="mtk"))
        self.db.session.add(Mapel(nama="Bahasa Inggris", kode="inggris"))
        # for index, row in data.iterrows():
        #     self.db.session.add(Siswa(nama=row["nama"], id_jurusan=row["jurusan"], nisn=row["nisn"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=1, semester=1, nilai=row["indo1"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=1, semester=2, nilai=row["indo2"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=1, semester=3, nilai=row["indo3"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=1, semester=4, nilai=row["indo4"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=2, semester=1, nilai=row["mtk1"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=2, semester=2, nilai=row["mtk2"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=2, semester=3, nilai=row["mtk3"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=2, semester=4, nilai=row["mtk4"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=3, semester=1, nilai=row["inggris1"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=3, semester=2, nilai=row["inggris2"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=3, semester=3, nilai=row["inggris3"]))
        #     self.db.session.add(Nilai(id_siswa=index + 1, id_mapel=3, semester=4, nilai=row["inggris4"]))

        #     self.db.session.add(NilaiUjian(id_siswa=index + 1, id_mapel=1, nilai=row["indo"]))
        #     self.db.session.add(NilaiUjian(id_siswa=index + 1, id_mapel=2, nilai=row["mtk"]))
        #     self.db.session.add(NilaiUjian(id_siswa=index + 1, id_mapel=3, nilai=row["inggris"]))
