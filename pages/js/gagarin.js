async function loadJSON(path) {
    const response = await fetch(path);
    const item = await response.json();
    console.log("Loaded data:", item);
    return item;
}

function renderCards(cards) {
    const wrapper = document.getElementById("index-cards");
    const template = document.getElementById("card-template");

    if (!cards?.category) return;

    Object.entries(cards.category).forEach(([categoryName, categoryArray]) => {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "box d-flex align-items-center mb-3";

        const categorySeparator = document.createElement("hr");
        categorySeparator.className =
            "border align-self-end border-1 border-primary flex-grow-1 mx-2";

        const categoryHeading = document.createElement("span");
        categoryHeading.className = "h3 mt-4 mb-2 text-capitalize";

        categoryHeading.textContent = categoryName;

        categoryDiv.appendChild(categorySeparator);
        categoryDiv.appendChild(categoryHeading);

        categoryDiv.appendChild(categorySeparator.cloneNode(true));

        wrapper.appendChild(categoryDiv);

        categoryArray.forEach((card) => {
            const clone = template.content.cloneNode(true);

            const img = clone.querySelector(".card-img-top");
            const title = clone.querySelector(".card-title");
            const text = clone.querySelector(".card-text");
            const price = clone.querySelector(".card-price");

            if (img) {
                img.src = card.image;
                img.alt = card.alt || card.title;
            }
            if (title) title.textContent = card.title;
            if (text) text.textContent = card.description;
            if (price) price.textContent = card.price;

            wrapper.appendChild(clone);
        });
    });
}

const cards = await loadJSON("data/trending.json");
renderCards(cards);

const boxes = document.querySelectorAll(".box");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add("visible");
                }, 100);

                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.2,
    },
);

boxes.forEach((box) => observer.observe(box));

function renderTime() {
    const wrapper = document.getElementById("time-status-badge-wrapper");
    const template = document.getElementById("time-status-badge-template");

    const clone = template.content.cloneNode(true);

    const badge = clone.querySelector(".badge");
    const text = clone.querySelector(".text-muted");

    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();

    const currentTime = hours * 60 + minutes;

    const openingTime = 9 * 60;
    const closingTime = 21 * 60;

    if (currentTime >= openingTime && currentTime < closingTime) {
        badge.textContent = "Open Now";

        const remaining = closingTime - currentTime;

        const remainingHours = Math.floor(remaining / 60);
        const remainingMinutes = remaining % 60;

        text.textContent = `Closes in ${remainingHours} hours ${remainingMinutes} minutes`;
    } else {
        badge.textContent = "Closed";
        text.textContent = "Opens at 9:00 AM";
    }
    wrapper.appendChild(clone);
}

renderTime();
