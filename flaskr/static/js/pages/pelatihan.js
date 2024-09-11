const table = {
  pelatihan: $("#table-pelatihan").DataTable({
    responsive: true,
    ajax: {
      url: origin + "/api/pelatihan",
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
      { title: "Nama Model", data: "nama" },
      {
        title: "Algoritma",
        data: "algoritma",
        render: function (data) {
          return data == "nb" ? "Naive Bayes" : "C 4.5";
        },
      },
      { title: "K Fold", data: "kfold" },
      { title: "Akurasi", data: "akurasi" },
      {
        title: "Aksi",
        data: "id",
        render: (data, type, row) => {
          return `
          <div class="table-control">
            <a role="button" class="btn waves-effect waves-light btn-action red" data-action="delete" data-id="${data}"><i class="material-icons">delete</i></a>
            <a role="button" class="btn waves-effect waves-light btn-action btn-slider blue" data-action="show" data-id="${data}" data-page="hasil"><i class="material-icons">visibility</i></a>
          </div>
          `;
        },
      },
    ],
  }),
};

const charts = {
  hasil: new Chart(document.getElementById("chart-hasil"), {
    type: "line",
    data: {
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      datasets: [
        {
          label: "Akurasi",
          data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80],
          fill: false,
          borderColor: "green",
          tension: 0.1,
        },
        {
          label: "Presisi",
          data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80],
          fill: false,
          borderColor: "blue",
          tension: 0.1,
        },
        {
          label: "Recall",
          data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80],
          fill: false,
          borderColor: "orange",
          tension: 0.1,
        },
        {
          label: "F1 Score",
          data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80],
          fill: false,
          borderColor: "purple",
          tension: 0.1,
        },
      ],
    },
  }),
};

const statusGizi = ["Normal", "Gizi Kurang", "Beresiko Gizi Lebih", "Gizi Lebih", "Gizi Buruk", "Obesitas"];

$("body").on("submit", "#form-pelatihan", function (e) {
  e.preventDefault();

  $.ajax({
    type: "POST",
    url: origin + "/api/pelatihan",
    data: $(this).serialize(),
    success: function (data) {
      cloud.pull();
      table.pelatihan.ajax.reload();
      $("#form-pelatihan").trigger("reset");
      M.toast({ html: "Data baru berhasil ditambahkan" });
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
            url: origin + "/api/pelatihan/" + $(this).attr("data-id"),
            success: function (response) {
              table.pelatihan.ajax.reload();
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
      let data = cloud.get("pelatihan").data.find((x) => x.id == $(this).attr("data-id"));
      const tableHasil = $("#table-hasil");
      const results = cloud.get("results").data.filter((x) => x.id_model == $(this).attr("data-id"));
      const hasilPrediksi = $("#hasil-prediksi");
      tableHasil.find("tbody").empty();
      hasilPrediksi.empty();
      $(".page-slider[data-page=hasil] .title span").text(data.nama);
      const confusionMatrixAll = [];
      results.forEach((x) => {
        const confusionMatrix = {
          tp: 0,
          fp: 0,
          fn: 0,
          tn: 0,
        };
        const datatesting = cloud.get("periksa").data.filter((d) =>
          JSON.parse(x.testindex)
            .map((y) => y + 1)
            .includes(d.id)
        );
        const y_pred = JSON.parse(x.y_pred);
        let r = "";
        datatesting.forEach((d, di) => {
          let trueFalse = d.status == y_pred[di];
          let positiveNegative = statusGizi.indexOf(y_pred[di]) == 0;
          let matrixValue = "tp";
          if (trueFalse && positiveNegative) matrixValue = "tp";
          else if (trueFalse && !positiveNegative) matrixValue = "tn";
          else if (!trueFalse && positiveNegative) matrixValue = "fp";
          else if (!trueFalse && !positiveNegative) matrixValue = "fn";
          confusionMatrix[matrixValue]++;
          r += `<tr>
            <td>${d.nama}</td>
            <td>${d.usia}</td>
            <td>${d.jenis_kelamin}</td>
            <td>${d.bb}</td>
            <td>${d.tb}</td>
            <td>${d.status}</td>
            <td>${y_pred[di]}</td>
            <td>${matrixValue.toUpperCase()}</td>
          </tr>`;
        });
        const cmAkurasi = ((confusionMatrix.tp + confusionMatrix.tn) / datatesting.length);
        const cmPresisi = (confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fp));
        const cmRecall = (confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fn));
        const cmF1Score = 2 * (cmRecall * cmPresisi) / (cmRecall + cmPresisi);
        tableHasil.find("tbody").append(`
          <tr>
          <td>${x.fold}</td>
          <td>${cmAkurasi.toFixed(4)}</td>
          <td>${cmPresisi.toFixed(4)}</td>
          <td>${cmRecall.toFixed(4)}</td>
          <td>${cmF1Score.toFixed(4)}</td>
          <td>${x.support}</td>
          </tr>
          `);
        confusionMatrixAll.push({
          fold: x.fold,
          confusionMatrix: confusionMatrix,
          support: x.support,
          akurasi: cmAkurasi.toFixed(4),
          presisi: cmPresisi.toFixed(4),
          recall: cmRecall.toFixed(4),
          f1score: cmF1Score.toFixed(4),
        });
        hasilPrediksi.append(`
          <li>
              <div class="collapsible-header">Hasil Prediksi K ${x.fold}</div>
              <div class="collapsible-body">
                <table class="responsive table-prediksi">
                <thead>
              <tr>
                <th>Nama</th>
                <th>Usia</th>
                <th>Jenis Kelamin</th>
                <th>BB</th>
                <th>TB</th>
                <th>Status</th>
                <th>Prediksi</th>
                <th>Matrix</th>
              </tr>
              </thead>
              <tbody>${r}</tbody>
            </table>
            <p class="center">TP : ${confusionMatrix.tp}  |  FP : ${confusionMatrix.fp}  |  FN : ${confusionMatrix.fn}  |  TN : ${confusionMatrix.tn}</p>
            </div>
            </li>
        `);
      });
      charts.hasil.data.labels = confusionMatrixAll.map((x) => x.fold);
      charts.hasil.data.datasets[0].data = confusionMatrixAll.map((x) => x.akurasi);
      charts.hasil.data.datasets[1].data = confusionMatrixAll.map((x) => x.presisi);
      charts.hasil.data.datasets[2].data = confusionMatrixAll.map((x) => x.recall);
      charts.hasil.data.datasets[3].data = confusionMatrixAll.map((x) => x.f1score);
      charts.hasil.update();
      break;
  }
});

$(document).ready(async function () {
  cloud.add(origin + "/api/periksa", {
    name: "periksa",
  });
  cloud.add(origin + "/api/pelatihan", {
    name: "pelatihan",
  });
  cloud.add(origin + "/api/results", {
    name: "results",
  });
});
