# Penjelasan RMSE dalam Sistem Prediksi Siswa

## Jenis-jenis RMSE dalam Sistem

### 1. RMSE Training (Evaluasi Model)

- **Definisi**: RMSE yang dihitung dari data testing saat proses pelatihan model
- **Data yang digunakan**: Subset data training (30% dari total data siswa)
- **Tujuan**: Mengukur seberapa baik model memprediksi pada data yang belum pernah dilihat selama training
- **Tampilan**: Ditampilkan di tabel pelatihan dengan kolom "RMSE Training [Mata Pelajaran]"

### 2. RMSE Prediksi (Evaluasi Performa)

- **Definisi**: RMSE yang dihitung dari data prediksi yang di-upload untuk prediksi
- **Data yang digunakan**: File Excel yang di-upload untuk prediksi
- **Tujuan**: Mengukur seberapa baik model memprediksi pada data baru
- **Tampilan**: Ditampilkan di halaman prediksi dalam tabel perbandingan

## Mengapa RMSE Berbeda?

### Penyebab Perbedaan:

1. **Dataset Berbeda**:

   - RMSE Training menggunakan data testing dari pembagian train_test_split
   - RMSE Prediksi menggunakan data dari file Excel yang di-upload

2. **Jumlah Data Berbeda**:

   - Data testing: Bervariasi tergantung jumlah siswa dan test_size (default 30%)
   - Data prediksi: Sesuai dengan jumlah baris dalam file Excel

3. **Distribusi Data Berbeda**:
   - Data testing: Subset acak dari data training
   - Data prediksi: Data baru dengan karakteristik yang mungkin berbeda

### Interpretasi:

- **RMSE Serupa**: Model konsisten dan dapat diandalkan
- **RMSE Prediksi Lebih Tinggi**: Data prediksi lebih sulit diprediksi dari data training
- **RMSE Prediksi Lebih Rendah**: Data prediksi lebih mudah diprediksi dari data training

## Status Evaluasi

### Konsisten (Selisih < 0.5)

- Model bekerja dengan baik pada data baru
- Prediksi dapat diandalkan

### Cukup Baik (Selisih 0.5-1.0)

- Model masih dapat diterima
- Perlu monitoring lebih lanjut

### Perlu Perhatian (Selisih > 1.0)

- Data prediksi sangat berbeda dari data training
- Mungkin perlu retraining model atau cek kualitas data

## Formula RMSE

```
RMSE = √(Σ(Actual - Predicted)² / n)
```

Dimana:

- **Actual**: Nilai ujian sebenarnya
- **Predicted**: Nilai hasil prediksi model
- **n**: Jumlah data

## Best Practices

1. **Monitoring Regular**: Pantau RMSE Training vs Prediksi secara berkala
2. **Data Quality**: Pastikan data prediksi memiliki kualitas yang sama dengan data training
3. **Retraining**: Lakukan retraining jika selisih RMSE terlalu besar secara konsisten
4. **Validasi**: Selalu validasi hasil prediksi dengan data actual yang tersedia

## Troubleshooting

### RMSE Prediksi Sangat Tinggi

- Periksa kualitas data input
- Pastikan format data sesuai dengan template
- Cek apakah ada outlier dalam data

### RMSE Training Tinggi

- Pertimbangkan untuk mengubah parameter model
- Tambah data training
- Cek kualitas data training

### Inkonsistensi RMSE

- Periksa distribusi data
- Pastikan preprocessing data konsisten
- Validasi model dengan cross-validation
