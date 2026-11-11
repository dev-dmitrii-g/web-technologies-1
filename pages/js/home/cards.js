$(function () {
    const button = $("button");
    $(button).click(function (e) {
        e.preventDefault();
        $(button).css("transition", "all 3s");
        $(button).toggleClass("scale-carousel");
    });
    const $cards = $("#index-cards");
    const template = $("#card-template").html();
    if (!$cards.length || !template) return;

    $.getJSON("data/trending.json")
        .done(function (data) {
            if (!data || !data.category) return;

            setupCategoryFilters($cards, data.category);
            Object.entries(data.category).forEach(function ([
                categoryName,
                categoryCards,
            ]) {
                const $heading = $("<div>", {
                    class: "box col-12 d-flex align-items-center mb-3 category-content",
                    "data-category": categoryName,
                });
                //$heading.append(
                //    $("<hr>", {
                //        class: "border align-self-end border-1 border-primary flex-grow-1 mx-2",
                //    }),
                //    $("<span>", {
                //        class: "h3 mt-4 mb-2 text-capitalize",
                //        text: categoryName,
                //    }),
                //    $("<hr>", {
                //        class: "border align-self-end border-1 border-primary flex-grow-1 mx-2",
                //    }),
                //);
                $cards.append($heading);

                categoryCards.forEach(function (card) {
                    const $card = $(template.trim());
                    $card
                        .addClass("category-content")
                        .attr("data-category", categoryName);

                    $card
                        .find(".card-img-top")
                        .attr({ src: card.image, alt: card.alt || card.title });
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

function setupCategoryFilters($cards, categories) {
    const $filters = $("<div>", {
        class: "col-12 d-flex gap-3",
    });

    function addButton(label, category) {
        $filters.append(
            $("<button>", {
                type: "button",
                class: "btn btn-outline-primary",
                text: label,
                "data-category": category,
            }),
        );
    }

    addButton("All", "*");

    Object.keys(categories).forEach(function (categoryName) {
        addButton(categoryName, categoryName);
    });

    $filters.on("click", "button", function () {
        const selected = $(this).attr("data-category");

        $filters
            .find("button")
            .removeClass("btn-primary")
            .addClass("btn-outline-primary");

        $(this).removeClass("btn-outline-primary").addClass("btn-primary");

        $cards.children(".category-content").each(function () {
            const category = $(this).attr("data-category");

            $(this).toggle(selected === "*" || category === selected);
        });
    });

    $cards.append($filters);
}
