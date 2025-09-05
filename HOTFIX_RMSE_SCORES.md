# HOTFIX - AttributeError 'rmse_scores'

## Error Yang Diperbaiki

```
AttributeError: 'Models' object has no attribute 'rmse_scores'
```

## Root Cause

Model lama (yang dibuat sebelum update) tidak memiliki field `rmse_scores` di database.

## Solusi

### 1. Backward Compatibility Check

```python
# Sebelum
model_data["rmse_scores"] = json.loads(model.rmse_scores) if model.rmse_scores else {}

# Sesudah
if hasattr(model, 'rmse_scores') and model.rmse_scores:
    model_data["rmse_scores"] = json.loads(model.rmse_scores)
else:
    # Calculate RMSE from stored test data for old models
    model_data["rmse_scores"] = {}
    # ... calculate from pickle files
```

### 2. Runtime RMSE Calculation

Untuk model lama yang tidak memiliki `rmse_scores`:

- Load data testing dari file pickle
- Load prediksi dari file pickle
- Hitung RMSE menggunakan `root_mean_squared_error()`
- Fallback ke `None` jika file tidak ada

### 3. Frontend Error Handling

```javascript
render: (data) => {
  if (data && data[mp.kode] !== null && data[mp.kode] !== undefined) {
    return data[mp.kode].toFixed(4);
  }
  return "N/A";
};
```

## Keuntungan Solusi

1. **Backward Compatible**: Model lama tetap bisa digunakan
2. **Forward Compatible**: Model baru menggunakan stored `rmse_scores`
3. **Graceful Degradation**: Menampilkan 'N/A' jika data tidak tersedia
4. **No Data Loss**: Tidak perlu delete/recreate model lama

## Testing

- [x] Sintaks Python valid
- [x] Tidak ada AttributeError lagi
- [x] Model lama dapat menampilkan RMSE (calculated on-the-fly)
- [x] Model baru menggunakan stored RMSE (lebih efisien)

## Migrasi Otomatis

Sistem akan otomatis:

1. Deteksi model lama tanpa `rmse_scores`
2. Hitung RMSE dari data pickle yang tersimpan
3. Tampilkan hasil tanpa error
4. Model baru akan menyimpan `rmse_scores` untuk efisiensi
