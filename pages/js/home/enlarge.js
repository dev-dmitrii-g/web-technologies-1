$(document).ready(function () {
    div = $("div#hero-carousel-md");
    $(div).click(function (e) {
        e.preventDefault();
        console.log("clicked");
        $(div).css("transition", "all 3s");
        $(div).toggleClass("scale-carousel");
    });
});
