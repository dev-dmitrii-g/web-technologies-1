$(function () {
    if (!("IntersectionObserver" in window)) {
        $(".box").addClass("visible");
        $(document).on("home:cardsRendered", function () {
            $(".box").addClass("visible");
        });
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            setTimeout(function () {
                $(entry.target).addClass("visible");
            }, 100);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.2 });

    function observeBoxes() {
        $(".box:not(.visible)").each(function () {
            observer.observe(this);
        });
    }

    observeBoxes();
    $(document).on("home:cardsRendered", observeBoxes);
});
