$("body").on("submit", "#form-prediksi", function (e) {
  e.preventDefault();
  const form = $("#form-prediksi");
  $.ajax({
    type: "POST",
    url: origin + "/api/prediksi",
    data: form.serialize(),
    success: function (res) {
      Swal.fire({
        icon: "success",
        title: "Data berhasil diprediksi",
        text: `Prediksi nilai : ${parseFloat(res.prediksi).toFixed(2)}`,
        showConfirmButton: true,
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
    .then((res) => {
      res.data.forEach((key) => {
        $("select[name=id_mapel]").append(`
          <option value="${key.id}">${key.nama}</option>
        `);
      });
    });
  cloud.add(origin + "/api/nilai", {
    name: "nilai",
  });
  cloud.add(origin + "/api/ujian", {
    name: "ujian",
  });
  cloud
    .add(origin + "/api/pelatihan", {
      name: "pelatihan",
    })
    .then((res) => {
      res.data.forEach((key) => {
        $("select[name=id_model]").append(`
          <option value="${key.id}">${key.nama}</option>
        `);
      });
    });
});
