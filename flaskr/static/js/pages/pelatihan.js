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
            render: (data) => {
              return `
                  <button class="btn btn-sm btn-danger btn-delete" data-id="${data}"><i class="fas fa-trash"></i></button>
                `;
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
              return Math.min(...JSON.parse(data)[mp.kode]);
            },
          })),
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
