$(document).ready(function () {
    $("#locations-footer-link").click(function (e) {
        e.preventDefault();
        $("#locations-title")[0].scrollIntoView({ behavior: "smooth" });
    });

    $("#contacts-footer-link").click(function (e) {
        e.preventDefault();
        $("#contacts-title")[0].scrollIntoView({ behavior: "smooth" });
    });
});
