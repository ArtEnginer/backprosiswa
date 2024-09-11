const table = {
  user: $("#table-user").DataTable({
    responsive: true,
    ajax: {
      url: origin + "/api/user",
      dataSrc: "data",
    },
    columns: [
      {
        title: "#",
        data: "id",
        render: function (data, type, row, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      { title: "Nama Pengguna", data: "name" },
      { title: "Username", data: "username" },
      { title: "Email", data: "email" },
      {
        title: "Aksi",
        data: "id",
        render: (data, type, row) => {
          return `
          <div class="table-control">
            <a role="button" class="btn waves-effect waves-light btn-action blue btn-slider" data-page="add" data-action="edit" data-id="${data}"><i class="material-icons">edit</i></a>
            <a role="button" class="btn waves-effect waves-light btn-action red" data-action="delete" data-id="${data}"><i class="material-icons">delete</i></a>
          </div>
          `;
        },
      },
    ],
  }),
};

$("body").on("submit", "#form-user", function (e) {
  e.preventDefault();
  const data = $(this).serialize();
  if (data.includes("password")) {
    if (data.includes("password_confirm")) {
      if ($(this).find("input[name=password_confirm]").val() != $(this).find("input[name=password]").val()) {
        M.toast({ html: "Password konfirmasi tidak cocok" });
        return;
      }
    } else {
      M.toast({ html: "Password konfirmasi harus diisi" });
      return;
    }
  }
  $.ajax({
    type: "POST",
    url: $(this).find("input[name=id]").val() != "" ? origin + "/api/user/" + $(this).find("input[name=id]").val() : origin + "/api/user",
    data: data,
    success: (data) => {
      cloud.pull();
      table.user.ajax.reload();
      if ($(this).find("input[name=id]").val() == "") {
        $("#form-user").trigger("reset");
      }
      M.toast({ html: data.toast.title });
    },
  });
});

$("body").on("click", ".btn-action", function (e) {
  e.preventDefault();
  const action = $(this).attr("data-action");
  switch (action) {
    case "delete":
      Swal.fire({
        title: "Hapus Data",
        text: "Apakah anda yakin ingin menghapus data ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            type: "DELETE",
            url: origin + "/api/user/" + $(this).attr("data-id"),
            success: function (response) {
              table.user.ajax.reload();
              Toast.fire({
                icon: "success",
                title: "Data berhasil di hapus",
              });
            },
          });
        }
      });
      break;
    case "show":
      let data = cloud.get("user").data.find((x) => x.id == $(this).attr("data-id"));
      const tableHasil = $("#table-hasil");
      const results = cloud.get("results").data.filter((x) => x.id_model == $(this).attr("data-id"));
      tableHasil.find("tbody").empty();
      $(".page-slider[data-page=hasil] .title span").text(data.nama);
      results.forEach((x) => {
        tableHasil.find("tbody").append(`
          <tr>
            <td>${x.fold}</td>
            <td>${x.akurasi}</td>
            <td>${x.presisi}</td>
            <td>${x.recall}</td>
            <td>${x.f1score}</td>
            <td>${x.support}</td>
          </tr>
        `);
      });
      break;
    case "add":
      $("#form-user").trigger("reset");
      $("#form-user").closest(".page-slider").find(".title").text("Tambah Pengguna");
      $("#form-user input[type=password]").prop("required", true);
      $("#form-user input[name=id]").val("");
      break;
    case "edit":
      $("#form-user").trigger("reset");
      $("#form-user").closest(".page-slider").find(".title").text("Edit Pengguna");
      $("#form-user input[type=password]").prop("required", false);
      let dataEdit = cloud.get("user").data.find((x) => x.id == $(this).attr("data-id"));
      $("#form-user").find("input[name=name]").val(dataEdit.name);
      $("#form-user").find("input[name=username]").val(dataEdit.username);
      $("#form-user").find("input[name=email]").val(dataEdit.email);
      $("#form-user input[name=id]").val($(this).attr("data-id"));
      break;
  }
});

$(document).ready(async function () {
  cloud.add(origin + "/api/user", {
    name: "user",
  });
  cloud.add(origin + "/api/results", {
    name: "results",
  });
});
