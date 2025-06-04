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
        $("select[name=id_model]").append(`
          <option value="${key.id}">${key.nama}</option>
        `);
      });
    });
});
