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
    .then((jurusan) => {
      cloud
        .add(origin + "/api/mapel", {
          name: "mapel",
        })
        .then((mapel) => {
          cloud
            .add(origin + "/api/nilai", {
              name: "nilai",
            })
            .then((nilai) => {
              cloud
                .add(origin + "/api/ujian", {
                  name: "ujian",
                })
                .then((ujian) => {
                  const nilaiMapel = [];
                  const nilaiUjian = [];
                  mapel.data.forEach((mpl) => {
                    for (let idx = 1; idx <= 4; idx++) {
                      nilaiMapel.push({
                        data: "id",
                        title: `${mpl.kode} ${idx}`,
                        render: function (data) {
                          return nilai.data.find((k) => k.id_siswa == data && k.id_mapel == mpl.id && k.semester == idx).nilai;
                        },
                      });
                    }
                    nilaiUjian.push({
                      data: "id",
                      title: mpl.nama,
                      render: function (data) {
                        return ujian.data.find((k) => k.id_siswa == data && k.id_mapel == mpl.id).nilai;
                      },
                    });
                  });
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
                        render: (data) => {
                          return `
                  <button class="btn btn-sm btn-success btn-edit" data-id="${data}"><i class="fas fa-edit"></i></button>
                `;
                        },
                      },
                      {
                        data: "id_jurusan",
                        title: "Jurusan",
                        render: function (data) {
                          return jurusan.data.find((key) => key.id == data).nama;
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
                      ...nilaiMapel,
                      ...nilaiUjian,
                    ],
                  });
                });
            });
        });
    });
});

$("body").on("click", ".btn-edit", function (e) {
  e.preventDefault();
  const id = $(e.currentTarget).data("id");
  const nilai = cloud.get("nilai").data.filter((k) => k.id_siswa == id);
  const ujian = cloud.get("ujian").data.filter((k) => k.id_siswa == id);

  nilai.forEach((k) => {
    $(`#form-data [name="nilai-${k.id_mapel}-${k.semester}"]`).val(k.nilai);
  });

  ujian.forEach((k) => {
    $(`#form-data [name="ujian-${k.id_mapel}"]`).val(k.nilai);
  });

  $("#form-data [name='id_siswa']").val(id);

  $("#exampleModal").modal("show");
  console.log(nilai, ujian);
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
      data[key].push({
        id_mapel: parseInt(id_mapel),
        semester: parseInt(semester),
        nilai: parseInt(input.value),
      });
    } else if (input.name.includes("ujian")) {
      const [key, id_mapel] = input.name.split("-");
      data[key].push({
        id_mapel: parseInt(id_mapel),
        nilai: parseInt(input.value),
      });
    }
  });
  data.id_siswa = form.find('[name="id_siswa"]').val();
  console.log(data);
  fetch("/api/nilai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      table.data.ajax.reload();
      form.trigger("reset");
      $("#exampleModal").modal("hide");
      Toast.fire({
        icon: "success",
        title: "Data berhasil disimpan",
      });
    });
});
