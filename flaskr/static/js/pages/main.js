$("body").on("click", ".katalog-item", function (e) {
  if ($(e.target).hasClass("sewa") || $(e.target).parent().hasClass("sewa")) {
    e.preventDefault();
    return;
  }
  let alat = cloud.get("alat").find((a) => a.id == $(e.currentTarget).data("id"));
  console.log(alat);
  $(".slide-image img").attr("src", alat.gambar);
  $(".slide-image .kategori").text(alat.kategori.label);
  $(".slide-content h4").text(alat.nama);
  $(".slide-content .slide-text").html(alat.deskripsi.replace(new RegExp("\r?\n", "g"), "<br />"));
  $(".slide-content .nominal").text(alat.harga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  $(".slide-content .stok").text(alat.stok);
  $(".slide-wrapper").addClass("active");
  $(".slide-button .sewa").attr("data-id", alat.id);
  alat.stok > 0 ? $(".slide-button a").removeClass("disabled") : $(".slide-button a").addClass("disabled");
  setTimeout(function () {
    $(".slide").css("right", "0%");
  }, 100);
});
$("body").on("click", ".slide-close", function (e) {
  $(".slide").css("right", "-100%");
  setTimeout(function () {
    $(".slide-wrapper").removeClass("active");
  }, 100);
});
$("body").on("click", ".sewa", async function (e) {
  const id = $(e.currentTarget).data("id");
  let alat = cloud.get("alat").find((a) => a.id == id);
  let val = 1;
  if (keranjangBarang.getItem(id)) val = keranjangBarang.getItem(id);
  console.log(val);
  const { value: jumlah } = await Swal.fire({
    title: "Mau sewa berapa?",
    icon: "question",
    input: "range",
    inputLabel: "masukkan jumlah",
    showCancelButton: true,
    inputAttributes: {
      min: "1",
      max: alat.stok,
      step: "1",
    },
    inputValue: val,
  });
  if (jumlah) {
    keranjangBarang.setItem(id, jumlah);
  }
});

$("body > div.slide-wrapper").on("click", function (e) {
  if ($(e.target).closest(".slide").length > 0) {
    e.preventDefault();
    return;
  }
  $(".slide-close").trigger("click");
});

$(document).ready(async function () {
  await cloud.add(baseUrl + "me", {
    name: "user"
  });
  const activeMenu = $(`.menu-list[data-id='${page}']`);
  activeMenu.addClass("active");
  if (activeMenu.hasClass("collapse-item")) {
    activeMenu.closest(".collapse").addClass("show");
    activeMenu.closest(".nav-link").removeClass("collapsed");
    activeMenu.closest(".nav-item").addClass("active");
  }
});

$("body").on("click", ".btn-password", function (e) {
  e.preventDefault();
  const inputEl = $(this).closest(".form-group").find("input");
  if (inputEl.attr("type") == "password") {
    inputEl.attr("type", "text");
    $(this).find("i").addClass("fa-eye-slash").removeClass("fa-eye");
  } else {
    inputEl.attr("type", "password");
    $(this).find("i").addClass("fa-eye").removeClass("fa-eye-slash");
  }
});