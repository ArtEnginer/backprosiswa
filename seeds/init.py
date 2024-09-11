from flask_seeder import Seeder, Faker, generator
from flaskr.models import Obat, Mutasi, Models, Results, User, AuthGroup
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd


class InitSeeder(Seeder):
    def run(self):
        users = [
            User(email="admin@gmail.com", username="admin",
                 name="Admin", password="123456", group_id=1),
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
        data = pd.read_csv("data/obat.csv")
        for index, row in data.iterrows():
            self.db.session.add(Obat(nama=row["nama"], kode=row["kode"]))
        data = pd.read_csv("data/clean.csv")
        for index, row in data.iterrows():
            self.db.session.add(Mutasi(id_obat=row["id_obat"], tanggal=row["tanggal"], keluar=row["keluar"],
                                masuk=row["masuk"], stok=row["stok"], keterangan=row["keterangan"]))
