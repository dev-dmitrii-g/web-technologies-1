async function loadReviews() {
    const response = await fetch("data/reviews.json");
    const users = await response.json();
    const wrapper = document.getElementById("reviews-article");
    const template = document.getElementById("review-card");

    users.users.forEach((element) => {
        const clone = template.content.cloneNode(true);

        const name = clone.querySelector(".h5");
        const comment = clone.querySelector(".blockquote");
        name.textContent = element.name;
        comment.textContent = element.comment;
        time = clone.querySelector("#time");
        time.textContent = new Date();

        wrapper.appendChild(clone);
    });
}

loadReviews();
