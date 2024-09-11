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
