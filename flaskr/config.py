from datetime import timedelta


class Config:
    SECRET_KEY = 'backprob3i232bbadas'
    CORS_HEADERS = 'Content-Type'
    SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/backprosiswa'
    LOGIN_MESSAGE = "Anda harus masuk terlebih dahulu untuk dapat mengakses halaman ini"