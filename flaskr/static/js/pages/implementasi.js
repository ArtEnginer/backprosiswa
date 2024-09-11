$("body").on("submit", "#form-implementasi", function (e) {
  e.preventDefault();
  const data = {};
  data.id_model = "";
  data.jk = "";
  $(this).serializeArray().forEach((x) => {
    data[x.name] = x.value;
  })
  if (data.id_model == "") {
    Toast.fire({ icon: "error", title: "Model harus dilatih terlebih dahulu" });
    return;
  }
  if (data.jk == "") {
    Toast.fire({ icon: "error", title: "Jenis Kelamin harus di pilih" });
    return;
  }
  $.ajax({
    type: "POST",
    url: origin + "/api/implementasi",
    data: data,
    success: function (data) {
      cloud.pull();
      $("#form-implementasi").trigger("reset");
      Swal.fire({
        title: data.status,
        text: data.toast.title,
        icon: "success"
      });
    },
  });
});

$(document).ready(async function () {
  let bestmodel = 0;
  cloud
    .add(origin + "/api/pelatihan", {
      name: "pelatihan",
    })
    .then(function (data) {
      data.data.forEach((x) => {
        const alg = x.algoritma == "c45" ? "C4.5" : "Naive Bayes";
        if (bestmodel < x.akurasi) {
          bestmodel = x.akurasi;
          $("#form-implementasi").find("[name=id_model]").val(x.id);
          $("#form-implementasi").find("[name=id_model_d]").val(`${alg} (${x.akurasi * 100}%)`);
        }
      });
    });
  cloud.add(origin + "/api/results", {
    name: "results",
  });
});
