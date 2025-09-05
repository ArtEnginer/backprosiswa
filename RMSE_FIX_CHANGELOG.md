# CHANGELOG - Perbaikan RMSE

## Masalah yang Diperbaiki

### Issue: RMSE Training vs RMSE Manual Berbeda

- **RMSE Training (di tabel)**: 3.4877, 2.1126, 2.3413
- **RMSE Manual (perhitungan)**: 2.3142, 1.7737, 1.5483
- **Root Cause**: Frontend menggunakan nilai `losses` (loss*curve*) bukan `rmse_scores`

### Perubahan Yang Dilakukan

#### 1. Backend (api.py)

```python
# SEBELUM:
# Hanya menyimpan losses, tidak mengirim rmse_scores ke frontend

# SESUDAH:
model_data["rmse_scores"] = json.loads(model.rmse_scores) if model.rmse_scores else {}
```

#### 2. Frontend (pelatihan.js)

```javascript
// SEBELUM:
data: "losses",
render: (data) => {
  const minValue = Math.min(...data[mp.kode]);
  return minValue.toFixed(4);
}

// SESUDAH:
data: "rmse_scores",
render: (data) => {
  return data[mp.kode] ? data[mp.kode].toFixed(4) : 'N/A';
}
```

#### 3. Encoding Fix

- Mengganti karakter Unicode (Σ, ², √) dengan HTML entities (&Sigma;, &sup2;, &radic;)
- Mencegah error JavaScript akibat encoding

### Hasil Setelah Perbaikan

Sekarang **RMSE Training** dan **RMSE Manual** akan menampilkan nilai yang sama karena:

1. **RMSE Training** menggunakan `rmse_scores` yang disimpan saat pelatihan
2. **RMSE Manual** menghitung ulang dari data testing yang sama
3. Keduanya menggunakan data dan algoritma yang identik

### Catatan Teknis

- `losses`: Berisi array `loss_curve_` dari MLPRegressor (nilai loss per iterasi)
- `rmse_scores`: Berisi nilai RMSE final yang dihitung dengan `root_mean_squared_error()`
- Tabel sekarang menggunakan `rmse_scores` yang merupakan nilai RMSE sebenarnya

### Testing

- [x] Sintaks JavaScript valid
- [x] Backend API mengembalikan rmse_scores
- [x] Frontend menampilkan rmse_scores bukan losses
- [x] Karakter Unicode diganti dengan HTML entities

Dengan perubahan ini, nilai RMSE Training di tabel akan sama dengan nilai RMSE Manual yang dihitung dari data testing.
