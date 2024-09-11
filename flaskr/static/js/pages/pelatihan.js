const table = {
  data: $("#table-data").DataTable({
    processing: true,
    ajax: {
      url: origin + "/api/pelatihan",
      type: "GET",
    },
    columns: [
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
      {
        data: "best_loss",
        title: "Loss",
      },
    ],
  }),
};

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
  cloud.add(origin + "/api/mapel", {
    name: "mapel",
  });
  cloud.add(origin + "/api/nilai", {
    name: "nilai",
  });
  cloud.add(origin + "/api/ujian", {
    name: "ujian",
  });
});
