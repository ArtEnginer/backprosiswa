$(document).ready(function () {
    cloud.add(origin + "/api/siswa", {
        name: "siswa"
    }).then((res) => {
        $("#count-siswa").text(`${res.data.length}`).counterUp();
    });
    cloud.add(origin + "/api/mapel", {
        name: "mapel"
    }).then((res) => {
        $("#count-mapel").text(`${res.data.length}`).counterUp();
    });
    cloud.add(origin + "/api/nilai", {
        name: "nilai"
    }).then((res) => {
        $("#count-nilai").text(`${res.data.length}`).counterUp();
    });
    cloud.add(origin + "/api/ujian", {
        name: "ujian"
    }).then((res) => {
        $("#count-ujian").text(`${res.data.length}`).counterUp();
    });
});