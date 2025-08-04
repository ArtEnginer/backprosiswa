const table = {
  data: null,
};

const dataSend = {
  nilai: [],
  ujian: [],
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
                          const n = Number(nilai.data.find((k) => k.id_siswa == data && k.id_mapel == mpl.id && k.semester == idx).nilai);
                          const inputElement = document.createElement("input");
                          inputElement.type = "number";
                          inputElement.className = "form-control";
                          inputElement.name = `nilai-${mpl.id}-${idx}`;
                          inputElement.value = n || 0;
                          inputElement.style.width = "70px";
                          inputElement.min = 0;
                          inputElement.max = 100;
                          inputElement.addEventListener("keyup", function () {
                            const value = this.value;
                            if (value < 0 || value > 100) {
                              this.value = "";
                            }
                            if ((ds = dataSend.nilai.find((d) => d.id_siswa == data && d.id_mapel == mpl.id && d.semester == idx))) {
                              ds.nilai = Number(value);
                            } else {
                              dataSend.nilai.push({
                                id_siswa: data,
                                id_mapel: mpl.id,
                                semester: idx,
                                nilai: Number(value),
                              });
                            }
                            console.log(dataSend);
                          });
                          return inputElement;
                        },
                      });
                    }
                    nilaiUjian.push({
                      data: "id",
                      title: mpl.nama,
                      render: function (data) {
                        const n = ujian.data.find((k) => k.id_siswa == data && k.id_mapel == mpl.id).nilai;
                        const inputElement = document.createElement("input");
                        inputElement.type = "number";
                        inputElement.className = "form-control";
                        inputElement.name = `ujian-${mpl.id}`;
                        inputElement.value = n || 0;
                        inputElement.style.width = "70px";
                        inputElement.min = 0;
                        inputElement.max = 100;
                        inputElement.addEventListener("keyup", function () {
                          const value = this.value;
                          if (value < 0 || value > 100) {
                            this.value = "";
                          }
                          if ((ds = dataSend.ujian.find((d) => d.id_siswa == data && d.id_mapel == mpl.id))) {
                            ds.nilai = Number(value);
                          } else {
                            dataSend.ujian.push({
                              id_siswa: data,
                              id_mapel: mpl.id,
                              nilai: Number(value),
                            });
                          }
                          console.log(dataSend);
                        });
                        return inputElement;
                      },
                    });
                  });
                  table.data = $("#table-data").DataTable({
                    fixedColumns: {
                      start: 3,
                    },
                    fixedHeader: true,
                    scrollX: true,
                    ajax: {
                      url: origin + "/api/siswa",
                      type: "GET",
                    },
                    columns: [
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
                    columnDefs: [
                      {
                        targets: 2,
                        width: "200px",
                      },
                    ],
                  });
                });
            });
        });
    });
});

$("body").on("click", "#btn-save", function (e) {
  e.preventDefault();
  fetch("/api/nilai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataSend),
  })
    .then((res) => res.json())
    .then((res) => {
      window.location.reload();
    });
});
