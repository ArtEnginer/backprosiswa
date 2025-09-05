const table = {};

$("body").on("click", "#btn-add", function (e) {
  e.preventDefault();
  $(this).prop("disabled", true);
  const form = $("#form-pelatihan");
  const data = {};
  form.serializeArray().forEach((input) => {
    data[input.name] = input.value;
  });
  $.ajax({
    type: "POST",
    url: origin + "/api/pelatihan",
    data: data,
    success: (res) => {
      table.data.ajax.reload();
      form.trigger("reset");
      $("#btn-add").prop("disabled", false);
      $("#btn-add").closest(".modal").modal("hide");
      Toast.fire({
        icon: "success",
        title: "Model berhasil dilatih",
      });
    },
  });
});

$(document).ready(function () {
  cloud.add(origin + "/api/siswa", {
    name: "siswa",
  });
  cloud.add(origin + "/api/jurusan", {
    name: "jurusan",
  });
  cloud
    .add(origin + "/api/mapel", {
      name: "mapel",
    })
    .then((mapel) => {
      table.data = $("#table-data").DataTable({
        processing: true,
        ajax: {
          url: origin + "/api/pelatihan",
          type: "GET",
        },

        columns: [
          {
            data: "id",
            title: "Aksi",
            render: (data, type, row) => {
              const deleteElement = document.createElement("button");
              deleteElement.className = "btn btn-sm btn-danger btn-delete";
              deleteElement.innerHTML = '<i class="fas fa-trash"></i>';
              deleteElement.setAttribute("data-id", data);
              const viewElement = document.createElement("button");
              viewElement.className = "btn btn-sm btn-primary btn-view";
              viewElement.innerHTML = '<i class="fas fa-eye"></i>';
              viewElement.setAttribute("data-id", data);

              viewElement.addEventListener("click", (e) => {
                console.log(row);
                $("#result-title").text("Hasil Prediksi: " + row.nama);
                const dataResult = [];
                const dataLength = row.indo.X_test.length;

                // Calculate RMSE manually for each subject
                let indoSquaredErrors = [];
                let mtkSquaredErrors = [];
                let inggrisSquaredErrors = [];

                for (let i = 0; i < dataLength; i++) {
                  // Calculate squared errors for each subject
                  const indoError = row.indo.y_test[i] - row.indo.y_pred[i];
                  const mtkError = row.mtk.y_test[i] - row.mtk.y_pred[i];
                  const inggrisError =
                    row.inggris.y_test[i] - row.inggris.y_pred[i];

                  const indoSquaredError = Math.pow(indoError, 2);
                  const mtkSquaredError = Math.pow(mtkError, 2);
                  const inggrisSquaredError = Math.pow(inggrisError, 2);

                  indoSquaredErrors.push(indoSquaredError);
                  mtkSquaredErrors.push(mtkSquaredError);
                  inggrisSquaredErrors.push(inggrisSquaredError);

                  dataResult.push({
                    indo1: row.indo.X_test[i][0],
                    indo2: row.indo.X_test[i][1],
                    indo3: row.indo.X_test[i][2],
                    indo4: row.indo.X_test[i][3],
                    indo_y: row.indo.y_test[i],
                    indo_ypred: row.indo.y_pred[i].toFixed(4),
                    indo_error: indoError.toFixed(4),
                    indo_squared_error: indoSquaredError.toFixed(4),
                    mat1: row.mtk.X_test[i][0],
                    mat2: row.mtk.X_test[i][1],
                    mat3: row.mtk.X_test[i][2],
                    mat4: row.mtk.X_test[i][3],
                    mat_y: row.mtk.y_test[i],
                    mat_ypred: row.mtk.y_pred[i].toFixed(4),
                    mat_error: mtkError.toFixed(4),
                    mat_squared_error: mtkSquaredError.toFixed(4),
                    inggris1: row.inggris.X_test[i][0],
                    inggris2: row.inggris.X_test[i][1],
                    inggris3: row.inggris.X_test[i][2],
                    inggris4: row.inggris.X_test[i][3],
                    inggris_y: row.inggris.y_test[i],
                    inggris_ypred: row.inggris.y_pred[i].toFixed(4),
                    inggris_error: inggrisError.toFixed(4),
                    inggris_squared_error: inggrisSquaredError.toFixed(4),
                  });
                }

                // Calculate final RMSE values
                const indoMSE =
                  indoSquaredErrors.reduce((a, b) => a + b, 0) / dataLength;
                const mtkMSE =
                  mtkSquaredErrors.reduce((a, b) => a + b, 0) / dataLength;
                const inggrisMSE =
                  inggrisSquaredErrors.reduce((a, b) => a + b, 0) / dataLength;

                const indoRMSE = Math.sqrt(indoMSE);
                const mtkRMSE = Math.sqrt(mtkMSE);
                const inggrisRMSE = Math.sqrt(inggrisMSE);

                // Display RMSE calculation summary with comparison
                const rmseCalculation = `
                  <div class="card mt-3">
                    <div class="card-header">
                      <h5>Perhitungan RMSE Manual (Data Testing)</h5>
                      <small class="text-muted">RMSE ini dihitung dari data testing yang digunakan saat pelatihan model</small>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-4">
                          <h6><strong>Bahasa Indonesia</strong></h6>
                          <p>MSE = &Sigma;(Error&sup2;) / n = ${indoSquaredErrors
                            .reduce((a, b) => a + b, 0)
                            .toFixed(4)} / ${dataLength} = ${indoMSE.toFixed(
                  4
                )}</p>
                          <p><strong>RMSE = &radic;MSE = &radic;${indoMSE.toFixed(
                            4
                          )} = ${indoRMSE.toFixed(4)}</strong></p>
                        </div>
                        <div class="col-md-4">
                          <h6><strong>Matematika</strong></h6>
                          <p>MSE = &Sigma;(Error&sup2;) / n = ${mtkSquaredErrors
                            .reduce((a, b) => a + b, 0)
                            .toFixed(4)} / ${dataLength} = ${mtkMSE.toFixed(
                  4
                )}</p>
                          <p><strong>RMSE = &radic;MSE = &radic;${mtkMSE.toFixed(
                            4
                          )} = ${mtkRMSE.toFixed(4)}</strong></p>
                        </div>
                        <div class="col-md-4">
                          <h6><strong>Bahasa Inggris</strong></h6>
                          <p>MSE = &Sigma;(Error&sup2;) / n = ${inggrisSquaredErrors
                            .reduce((a, b) => a + b, 0)
                            .toFixed(4)} / ${dataLength} = ${inggrisMSE.toFixed(
                  4
                )}</p>
                          <p><strong>RMSE = &radic;MSE = &radic;${inggrisMSE.toFixed(
                            4
                          )} = ${inggrisRMSE.toFixed(4)}</strong></p>
                        </div>
                      </div>
                      <div class="row mt-3">
                        <div class="col-12">
                          <div class="alert alert-info">
                            <h6><strong>Penjelasan RMSE:</strong></h6>
                            <p><strong>RMSE Training</strong> = RMSE yang dihitung dari data testing saat pelatihan model (ditampilkan di tabel)</p>
                            <p><strong>RMSE Manual</strong> = RMSE yang dihitung ulang secara manual dari data yang sama</p>
                            <p><strong>Rumus:</strong> RMSE = &radic;(&Sigma;(Aktual - Prediksi)&sup2; / n)</p>
                            <p>Dimana:</p>
                            <ul>
                              <li>Aktual = Nilai ujian sebenarnya</li>
                              <li>Prediksi = Nilai hasil prediksi model</li>
                              <li>n = Jumlah data test (${dataLength})</li>
                            </ul>
                            <p><small><em>Nilai RMSE Training dan Manual seharusnya sama karena menggunakan data yang sama.</em></small></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;

                // Add RMSE calculation to the modal
                if (!$("#rmse-calculation").length) {
                  $("#table-result_wrapper").after(
                    '<div id="rmse-calculation"></div>'
                  );
                }
                $("#rmse-calculation").html(rmseCalculation);

                table.result.clear().rows.add(dataResult).draw();
              });

              const buttons = document.createElement("div");
              buttons.className =
                "d-flex justify-content-center align-items-center";
              buttons.appendChild(deleteElement);
              buttons.appendChild(viewElement);
              return buttons;
            },
          },
          {
            data: "nama",
            title: "Nama",
          },
          {
            data: "testsize",
            title: "Ukuran Data Testing",
          },
          {
            data: "learning_rate",
            title: "Learning Rate",
          },
          {
            data: "max_iter",
            title: "Max Iterasi",
          },
          ...mapel.data.map((mp) => ({
            data: "rmse_scores",
            title: "RMSE Training " + mp.nama,
            render: (data) => {
              if (
                data &&
                data[mp.kode] !== null &&
                data[mp.kode] !== undefined
              ) {
                return data[mp.kode].toFixed(4);
              }
              return "N/A";
            },
          })),
        ],
      });
      table.result = $("#table-result").DataTable({
        scrollX: true,
        layout: {
          topStart: {
            buttons: ["copy", "csv", "excel"],
          },
        },
        columns: [
          {
            data: null,
            title: "#",
            render: (data, type, row, meta) => {
              return meta.row + 1;
            },
          },
          {
            data: "indo1",
            title: "Indo 1",
          },
          {
            data: "indo2",
            title: "Indo 2",
          },
          {
            data: "indo3",
            title: "Indo 3",
          },
          {
            data: "indo4",
            title: "Indo 4",
          },
          {
            data: "indo_y",
            title: "Indo Ujian",
          },
          {
            data: "indo_ypred",
            title: "Indo Prediksi",
          },
          {
            data: "indo_error",
            title: "Indo Error",
            render: (data) => {
              return `<span class="${
                parseFloat(data) < 0 ? "text-danger" : "text-success"
              }">${data}</span>`;
            },
          },
          {
            data: "indo_squared_error",
            title: "Indo Error²",
          },
          {
            data: "mat1",
            title: "Mat 1",
          },
          {
            data: "mat2",
            title: "Mat 2",
          },
          {
            data: "mat3",
            title: "Mat 3",
          },
          {
            data: "mat4",
            title: "Mat 4",
          },
          {
            data: "mat_y",
            title: "Mat Ujian",
          },
          {
            data: "mat_ypred",
            title: "Mat Prediksi",
          },
          {
            data: "mat_error",
            title: "Mat Error",
            render: (data) => {
              return `<span class="${
                parseFloat(data) < 0 ? "text-danger" : "text-success"
              }">${data}</span>`;
            },
          },
          {
            data: "mat_squared_error",
            title: "Mat Error²",
          },
          {
            data: "inggris1",
            title: "Inggris 1",
          },
          {
            data: "inggris2",
            title: "Inggris 2",
          },
          {
            data: "inggris3",
            title: "Inggris 3",
          },
          {
            data: "inggris4",
            title: "Inggris 4",
          },
          {
            data: "inggris_y",
            title: "Inggris Ujian",
          },
          {
            data: "inggris_ypred",
            title: "Inggris Prediksi",
          },
          {
            data: "inggris_error",
            title: "Inggris Error",
            render: (data) => {
              return `<span class="${
                parseFloat(data) < 0 ? "text-danger" : "text-success"
              }">${data}</span>`;
            },
          },
          {
            data: "inggris_squared_error",
            title: "Inggris Error²",
          },
        ],
      });
    });
  cloud.add(origin + "/api/nilai", {
    name: "nilai",
  });
  cloud.add(origin + "/api/ujian", {
    name: "ujian",
  });

  $("body").on("click", ".btn-delete", function (e) {
    Swal.fire({
      title: "Hapus data pelatihan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Hapus",
    }).then((result) => {
      if (result.isConfirmed) {
        const id = $(e.currentTarget).data("id");
        $.ajax({
          type: "DELETE",
          url: origin + "/api/pelatihan/" + id,
          success: (res) => {
            table.data.ajax.reload();
            Toast.fire({
              icon: "success",
              title: "Data berhasil dihapus",
            });
          },
        });
      }
    });
  });
});
