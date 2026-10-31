$(function () {
    const $cards = $("#index-cards");
    const template = $("#card-template").html();
    if (!$cards.length || !template) return;

    $.getJSON("data/trending.json")
        .done(function (data) {
            if (!data || !data.category) return;

            const $filters = $("<div>", { class: "col-12 d-flex gap-3" });
            Object.keys(data.category).forEach(function (categoryName) {
                $filters.append(
                    $("<button>", {
                        type: "button",
                        class: "btn btn-outline-primary",
                        text: categoryName,
                    }),
                );
            });
            $cards.append($filters);

            Object.entries(data.category).forEach(function ([categoryName, categoryCards]) {
                const $heading = $("<div>", {
                    class: "box col-12 d-flex align-items-center mb-3",
                });
                $heading.append(
                    $("<hr>", { class: "border align-self-end border-1 border-primary flex-grow-1 mx-2" }),
                    $("<span>", { class: "h3 mt-4 mb-2 text-capitalize", text: categoryName }),
                    $("<hr>", { class: "border align-self-end border-1 border-primary flex-grow-1 mx-2" }),
                );
                $cards.append($heading);

                categoryCards.forEach(function (card) {
                    const $card = $(template.trim());
                    $card.find(".card-img-top").attr({ src: card.image, alt: card.alt || card.title });
                    $card.find(".card-title").text(card.title);
                    $card.find(".card-text").text(card.description);
                    $card.find(".card-price").text(card.price);
                    $cards.append($card);
                });
            });

            $(document).trigger("home:cardsRendered");
        })
        .fail(function () {
            console.error("Could not load trending cards.");
        });
});
