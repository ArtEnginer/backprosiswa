$(document).ready(async function () {
  cloud
    .add(origin + "/api/periksa", {
      name: "periksa",
      callback: (data) => {},
    })
    .then((periksa) => {
      $(".counter-balita").text(periksa.data.length);
    });
});
