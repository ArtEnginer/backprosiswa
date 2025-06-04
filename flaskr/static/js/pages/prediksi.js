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
