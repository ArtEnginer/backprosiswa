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
                const dataResult = [];
                const dataLength = row.indo.X_test.length;
                for (let i = 0; i < dataLength; i++) {
                  dataResult.push({
                    indo1: row.indo.X_test[i][0],
                    indo2: row.indo.X_test[i][1],
                    indo3: row.indo.X_test[i][2],
                    indo4: row.indo.X_test[i][3],
                    indo_y: row.indo.y_test[i],
                    indo_ypred: row.indo.y_pred[i].toFixed(4),
                    mat1: row.mtk.X_test[i][0],
                    mat2: row.mtk.X_test[i][1],
                    mat3: row.mtk.X_test[i][2],
                    mat4: row.mtk.X_test[i][3],
                    mat_y: row.mtk.y_test[i],
                    mat_ypred: row.mtk.y_pred[i].toFixed(4),
                    inggris1: row.inggris.X_test[i][0],
                    inggris2: row.inggris.X_test[i][1],
                    inggris3: row.inggris.X_test[i][2],
                    inggris4: row.inggris.X_test[i][3],
                    inggris_y: row.inggris.y_test[i],
                    inggris_ypred: row.inggris.y_pred[i].toFixed(4),
                  });
                }
                table.result.clear().rows.add(dataResult).draw();
              });

              const buttons = document.createElement("div");
              buttons.className = "d-flex justify-content-center align-items-center";
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
            data: "losses",
            title: "RMSE " + mp.nama,
            render: (data) => {
              const minValue = Math.min(...data[mp.kode]);
              return minValue.toFixed(4);
            },
          })),
        ],
      });
      table.result = $("#table-result").DataTable({
        scrollX: true,
        layout: {
          topStart: {
            buttons: ["copy", "csv", "excel",],
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
