$(function () {
    const $form = $("#login-form");
    if (!$form.length) return;

    function showLoading() {
        const $overlay = $("<div>", {
            id: "loading-overlay",
            class: "position-fixed top-0 start-0 w-100 h-100 bg-secondary d-flex align-items-center justify-content-center",
        }).css({ zIndex: 9999, height: "100vh" });
        const $display = $("<div>", {
            class: "h1 text-white d-flex gap-4 align-items-center",
        });
        const $icon = $(
            '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" class="bi bi-brilliance loading-icon"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M1 8a7 7 0 0 0 7 7 3.5 3.5 0 1 0 0-7 3.5 3.5 0 1 1 0-7 7 7 0 0 0-7 7"/></svg>',
        );
        $display.append($icon);
        $("body").append($overlay.append($display));
    }

    function stopLoading() {
        $("#loading-overlay").addClass("fade-out").one("transitionend", function () {
            $(this).remove();
        });
    }

    $form.on("submit", function (event) {
        event.preventDefault();
        showLoading();
        setTimeout(function () {
            stopLoading();
            window.location.replace("./index.html");
        }, 1000);
    });
});
