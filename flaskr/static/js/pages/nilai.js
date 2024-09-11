const table = {
  data: null,
};

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
                      return nilai.data.find(
                        (k) =>
                          k.id_siswa == data &&
                          k.id_mapel == mpl.id &&
                          k.semester == idx
                      ).nilai;
                    },
                  });
                }
                nilaiUjian.push({
                  data: "id",
                  title: mpl.nama,
                  render: function (data) {
                    return ujian.data.find(
                      (k) => k.id_siswa == data && k.id_mapel == mpl.id
                    ).nilai;
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
