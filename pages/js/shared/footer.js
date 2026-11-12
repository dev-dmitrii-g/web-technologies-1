$(document).ready(function () {
    $("body").append(createFooter());

    $("#locations-footer-link").click(function (e) {
        e.preventDefault();
        window.location.href = "./about.html#locations-title";
    });

    $("#contacts-footer-link").click(function (e) {
        e.preventDefault();
        window.location.href = "./about.html#contacts-title";
    });
});

function createFooter() {
    return $("<footer>", {
        class: "w-100 position-static bottom-0 bg-secondary pt-5 d-flex flex-column justify-content-center align-items-center",
    }).html(`
        <hr class="my-1" />
        <section class="container row w-100 font-monospace">
            <article
                class="col-12 col-md-6 col-lg-3 d-flex flex-column justify-content-start pb-3"
            >
                <p class="font-monospace text-white">[ Company ]</p>
                <a class="text-primary" href="about.html">About us</a>
                <a class="text-primary" id="locations-footer-link"
                    >Locations &amp; Hours</a
                >
                <a class="text-primary" id="contacts-footer-link">Contacts</a>
            </article>
            <article
                class="col-12 col-md-6 col-lg-3 d-flex flex-column justify-content-start pb-3"
            >
                <p class="font-monospace text-white">[ Explore ]</p>
                <a class="text-primary" href="brewing-guides.html"
                    >Brewing Guides</a
                >
                <a class="text-primary" href="events.html"
                    >Events &amp; Classes</a
                >
                <a class="text-primary" href="blog.html">Coffee Blog</a>
                <a class="text-primary" href="wholesale.html">B2B Wholesale</a>
            </article>
            <article
                class="col-12 col-md-6 col-lg-3 d-flex flex-column justify-content-start pb-3"
            >
                <p class="font-monospace text-white">[ Products ]</p>
                <a class="text-primary" href="subscriptions.html"
                    >Subscriptions</a
                >
                <a class="text-primary" href="menu.html">Full Menu</a>
            </article>
            <article
                class="col-12 col-md-6 col-lg-3 d-flex flex-column justify-content-start pb-3"
            >
                <p class="font-monospace text-white">[ Account ]</p>
                <a class="text-primary" href="login.html">Sign In / Register</a>
            </article>
        </section>
        <section
            class="container d-flex justify-content-start justify-content-md-center py-4"
        >
            <p class="font-monospace text-white-50 small">
                &copy; 2026 Tokyo Coffee. All rights reserved.
            </p>
        </section>
    `);
}
