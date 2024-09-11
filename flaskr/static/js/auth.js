$("#login-page").on("submit", function (e) {
  e.preventDefault();
  let data = $(this).serialize();
  $.ajax({
    type: "POST",
    url: $(this).attr("action"),
    data: data,
    error: function (jqXHR, textStatus, errorThrown) {
      Toast.fire({
        icon: "error",
        title: "Gagal",
      });
      console.log(jqXHR.responseText, textStatus, errorThrown);
    },
    success: function (data, textStatus, jqXHR) {
      Toast.fire({
        icon: data.toast.icon,
        title: data.toast.title,
      });
      if (data.login) {
        setTimeout(function () {
          window.location.href = data.redirect;
        }, 2000);
      }
    },
  });
});
