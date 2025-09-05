$("body").on("submit", "#form-prediksi", function (e) {
  e.preventDefault();
  var formData = new FormData();
  formData.append("model", $("#model").val());
  formData.append("file", $("#file")[0].files[0]);

  $("#btn-prediksi").prop("disabled", true);
  $("#btn-result").addClass("disabled");

  $.ajax({
    type: "POST",
    url: origin + "/api/prediksi",
    data: formData,
    processData: false,
    contentType: false,
    success: function (res) {
      console.log(res);

      table.clear().rows.add(res.data).draw();

      // Display RMSE comparison if available
      if (res.rmse_training && res.rmse_prediction) {
        displayRMSEComparison(res.rmse_training, res.rmse_prediction);
      }

      Toast.fire({
        icon: "success",
        title: "Data berhasil diprediksi",
      });

      $("#btn-result").removeClass("disabled");
    },
    error: function (res) {
      Toast.fire({
        icon: "error",
        title: "Data gagal diprediksi",
      });
    },
    complete: function () {
      $("#btn-prediksi").prop("disabled", false);
    },
  });
});

function displayRMSEComparison(rmseTraining, rmsePrediction) {
  const mapelNames = {
    indo: "Bahasa Indonesia",
    mtk: "Matematika",
    inggris: "Bahasa Inggris",
  };

  let comparisonHTML = `
    <div class="card mt-4">
      <div class="card-header">
        <h5>Perbandingan RMSE</h5>
        <small class="text-muted">Perbandingan antara RMSE Training dan RMSE Prediksi</small>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Mata Pelajaran</th>
                <th>RMSE Training</th>
                <th>RMSE Prediksi</th>
                <th>Selisih</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
  `;

  Object.keys(mapelNames).forEach((kode) => {
    const training = rmseTraining[kode] ? rmseTraining[kode].toFixed(4) : "N/A";
    const prediction = rmsePrediction[kode]
      ? rmsePrediction[kode].toFixed(4)
      : "N/A";

    let selisih = "N/A";
    let status = "N/A";
    let statusClass = "";

    if (rmseTraining[kode] && rmsePrediction[kode]) {
      const diff = Math.abs(rmseTraining[kode] - rmsePrediction[kode]);
      selisih = diff.toFixed(4);

      if (diff < 0.5) {
        status = "Konsisten";
        statusClass = "text-success";
      } else if (diff < 1.0) {
        status = "Cukup Baik";
        statusClass = "text-warning";
      } else {
        status = "Perlu Perhatian";
        statusClass = "text-danger";
      }
    }

    comparisonHTML += `
      <tr>
        <td>${mapelNames[kode]}</td>
        <td>${training}</td>
        <td>${prediction}</td>
        <td>${selisih}</td>
        <td><span class="${statusClass}">${status}</span></td>
      </tr>
    `;
  });

  comparisonHTML += `
            </tbody>
          </table>
        </div>
        <div class="alert alert-info mt-3">
          <h6><strong>Penjelasan:</strong></h6>
          <ul>
            <li><strong>RMSE Training:</strong> Dihitung dari data testing saat pelatihan model</li>
            <li><strong>RMSE Prediksi:</strong> Dihitung dari data prediksi yang baru di-upload</li>
            <li><strong>Status Konsisten:</strong> Selisih < 0.5 (Model bekerja konsisten)</li>
            <li><strong>Status Cukup Baik:</strong> Selisih 0.5-1.0 (Model masih dapat diterima)</li>
            <li><strong>Status Perlu Perhatian:</strong> Selisih > 1.0 (Data prediksi sangat berbeda dari data training)</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  // Remove existing comparison if any
  $("#rmse-comparison").remove();

  // Add comparison after the table
  $("#table-result_wrapper").after(
    '<div id="rmse-comparison">' + comparisonHTML + "</div>"
  );
}

let table = null;

$(document).ready(function () {
  cloud
    .add(origin + "/api/pelatihan", {
      name: "pelatihan",
    })
    .then((res) => {
      if (res.data.length == 0) {
        $("#blank-wrapper").removeClass("d-none");
        return;
      }
      $("#prediksi-wrapper").removeClass("d-none");
      res.data.forEach((key) => {
        $("select[name=model]").append(`
          <option value="${key.nama}">${key.nama}</option>
        `);
      });

      cloud
        .add(origin + "/api/mapel", {
          name: "mapel",
        })
        .then((mapel) => {
          const nilaiMapel = [];
          const nilaiUjian = [];
          mapel.data.forEach((mpl) => {
            for (let idx = 1; idx <= 4; idx++) {
              nilaiMapel.push({
                data: `${mpl.kode}${idx}`,
                title: `${mpl.kode} ${idx}`,
              });
            }
            nilaiUjian.push({
              data: mpl.kode,
              title: mpl.nama,
            });
          });
          table = $("#table-result").DataTable({
            responsive: true,
            columns: [
              {
                data: "jurusan",
                title: "Jurusan",
              },
              {
                data: "nisn",
                title: "NISN",
              },
              {
                data: "nama",
                title: "Nama",
              },
              ...nilaiMapel,
              ...nilaiUjian,
            ],
          });
        });
    });
});
