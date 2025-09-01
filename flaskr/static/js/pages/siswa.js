const table = {
  data: null,
};

$(document).ready(function () {
  cloud.add(origin + "/api/siswa", {
    name: "siswa",
  });
  cloud
    .add(origin + "/api/jurusan", {
      name: "jurusan",
    })
    .then((res) => {
      table.data = $("#table-data").DataTable({
        processing: true,
        ajax: {
          url: origin + "/api/siswa",
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
              deleteElement.onclick = () => deleteData(data);

              const buttons = document.createElement("div");
              buttons.className =
                "d-flex justify-content-center align-items-center";
              buttons.appendChild(deleteElement);
              return buttons;
            },
          },
          {
            data: "id_jurusan",
            title: "Jurusan",
            render: function (data) {
              return res.data.find((key) => key.id == data).nama;
            },
          },
          {
            data: "nisn",
            title: "NISN",
          },
          {
            data: "nama",
            title: "Nama",
          },
        ],
      });
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

$("body").on("submit", "#form-data", function (e) {
  e.preventDefault();
  const form = $("#form-data");
  const data = {
    nilai: [],
    ujian: [],
  };
  form.serializeArray().forEach((input) => {
    if (input.name.includes("nilai")) {
      const [key, id_mapel, semester] = input.name.split("-");
      data.nilai.push({
        id_mapel: parseInt(id_mapel),
        semester: parseInt(semester),
        nilai: parseInt(input.value),
      });
    } else if (input.name.includes("ujian")) {
      const [key, id_mapel] = input.name.split("-");
      data.ujian.push({
        id_mapel: parseInt(id_mapel),
        nilai: parseInt(input.value),
      });
    } else {
      console.log(data);

      data[input.name] = input.value;
    }
  });
  console.log(data);

  fetch("/api/siswa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      table.data.ajax.reload();
      Toast.fire({
        icon: "success",
        title: "Data berhasil disimpan",
      });
      $("#form-data").trigger("reset");
      $("#btn-add").closest(".modal").modal("hide");
    });
});

// Handle import form submission
$("body").on("submit", "#import-form", function (e) {
  e.preventDefault();

  const formData = new FormData();
  const fileInput = document.getElementById("import_file");

  if (!fileInput.files[0]) {
    Toast.fire({
      icon: "error",
      title: "Pilih file terlebih dahulu",
    });
    return;
  }

  formData.append("file", fileInput.files[0]);

  // Show progress
  $("#import-progress").removeClass("d-none");
  $("#btn-import").prop("disabled", true);

  fetch("/api/import-siswa", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      $("#import-progress").addClass("d-none");
      $("#btn-import").prop("disabled", false);

      if (data.toast) {
        Toast.fire({
          icon: data.toast.icon,
          title: data.toast.title,
        });
      }

      if (data.errors && data.errors.length > 0) {
        let errorMessage =
          "Beberapa data gagal diimport:\n" + data.errors.join("\n");
        Swal.fire({
          title: "Peringatan",
          text: errorMessage,
          icon: "warning",
          confirmButtonText: "OK",
        });
      }

      if (data.imported_count > 0) {
        table.data.ajax.reload();
        $("#import-form").trigger("reset");
        $("#importModal").modal("hide");
      }
    })
    .catch((error) => {
      $("#import-progress").addClass("d-none");
      $("#btn-import").prop("disabled", false);

      Toast.fire({
        icon: "error",
        title: "Terjadi kesalahan saat import",
      });
      console.error("Error:", error);
    });
});

// Function to download template
function downloadTemplate() {
  fetch("/api/template-import", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.download_url) {
        // Create download link
        const link = document.createElement("a");
        link.href = data.download_url;
        link.download = "template_import_siswa.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Toast.fire({
          icon: "success",
          title: "Template berhasil didownload",
        });
      }
    })
    .catch((error) => {
      Toast.fire({
        icon: "error",
        title: "Gagal mendownload template",
      });
      console.error("Error:", error);
    });
}

function deleteData(id) {
  Swal.fire({
    title: "Hapus data siswa?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Hapus",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "DELETE",
        url: origin + "/api/siswa/" + id,
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
}
