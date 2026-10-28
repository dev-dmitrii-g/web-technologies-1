
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("blog-review-form");
    const list = document.getElementById("reviews-article");
    const status = document.getElementById("reviews-status");
    const sort = document.getElementById("reviews-sort");
    const result = document.getElementById("blog-review-form-result");
    const error = document.getElementById("blog-review-form-error");

    if (!form || !list || !sort) return;

    const reviews = [];

    const name = document.getElementById("review-name");
    const email = document.getElementById("review-email");
    const phone = document.getElementById("review-phone");
    const date = document.getElementById("visit-date");
    const visits = document.getElementById("visit-count");
    const drink = document.getElementById("favorite-drink");
    const rating = document.getElementById("review-rating");
    const comment = document.getElementById("review-text");
    const permission = document.getElementById("permission");
    const average = document.getElementById("average-rating");
    const stars = document.getElementById("average-stars");
    const count = document.getElementById("reviews-count");

    const counter = document.createElement("small");
    counter.className = "form-text text-muted d-block mt-1";
    comment.insertAdjacentElement("afterend", counter);
    comment.maxLength = 2000;

    function updateCounter() {
        counter.textContent = comment.value.length + " / 2000 characters";
    }

    comment.addEventListener("input", updateCounter);

    function showMessage(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.remove("d-none");
        }
    }

    function hideMessages() {
        [result, error].forEach(function (element) {
            if (element) element.classList.add("d-none");
        });
    }

    function renderReviews() {
        list.replaceChildren();

        let sorted = [...reviews];

        if (sort.value === "highest") {
            sorted.sort((a, b) => b.rating - a.rating);
        } else if (sort.value === "lowest") {
            sorted.sort((a, b) => a.rating - b.rating);
        } else if (sort.value.startsWith("rating-")) {
            sorted = sorted.filter(
                review => review.rating === Number(sort.value.slice(7))
            );
        } else {
            sorted.sort((a, b) => b.created - a.created);
        }

        if (sorted.length === 0) {
            const message = document.createElement("p");
            message.className = "text-muted";
            message.textContent = reviews.length === 0
                ? "No reviews yet. Submit a review to see it here."
                : "No reviews match this filter.";
            list.appendChild(message);
        }

        sorted.forEach(function (review) {
            const card = document.createElement("article");
            card.className = "card shadow-sm mb-3";

            const body = document.createElement("div");
            body.className = "card-body";

            const title = document.createElement("h3");
            title.className = "h5";
            title.textContent = review.name;

            const reviewStars = document.createElement("p");
            reviewStars.className = "text-warning";
            reviewStars.textContent =
                "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

            const details = document.createElement("p");
            details.className = "small text-muted";
            details.textContent =
                new Date(review.created).toLocaleString();

            const info = document.createElement("p");
            info.className = "small text-muted";
            info.textContent = "Visit date: " + review.visitDate +
                " · Drink: " + review.drink +
                " · Visits: " + review.visits +
                " · Experience: " + review.experience;

            const text = document.createElement("p");
            text.textContent = review.comment;

            body.append(title, reviewStars, details, info, text);
            card.appendChild(body);
            list.appendChild(card);
        });

        const total = reviews.reduce(
            (sum, review) => sum + review.rating, 0
        );
        const avg = reviews.length ? total / reviews.length : 0;

        if (average) {
            average.textContent = reviews.length ? avg.toFixed(1) : "—";
        }

        if (stars) {
            stars.textContent =
                "★".repeat(Math.round(avg)) +
                "☆".repeat(5 - Math.round(avg));
        }

        if (count) {
            count.textContent = reviews.length + " reviews";
        }
    }

    [5, 4, 3, 2, 1].forEach(function (number) {
        const option = document.createElement("option");
        option.value = "rating-" + number;
        option.textContent = number + " stars only";
        sort.appendChild(option);
    });

    sort.addEventListener("change", renderReviews);

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        hideMessages();

        const experience = form.querySelector(
            'input[name="experience"]:checked'
        );

        const digits = phone.value.replace(/\D/g, "").length;
        const score = Number(rating.value);
        const visitNumber = Number(visits.value);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const visitDate = new Date(date.value + "T00:00:00");

        if (name.value.trim().length < 2) {
            showMessage(error, "Please enter your name.");
            return;
        }

        if (!email.validity.valid || !email.value.trim()) {
            showMessage(error, "Please enter a valid email.");
            return;
        }

        if (digits < 7 || digits > 15 ||
            !/^\+?[0-9 ()-]{7,20}$/.test(phone.value.trim())) {
            showMessage(error, "Please enter a valid phone number.");
            return;
        }

        if (!date.value || isNaN(visitDate.getTime()) || visitDate > today) {
            showMessage(error, "Choose today or an earlier visit date.");
            return;
        }

        if (!Number.isInteger(visitNumber) || visitNumber < 1) {
            showMessage(error, "Enter a valid number of visits.");
            return;
        }

        if (!drink.value || !experience) {
            showMessage(error, "Please complete all required fields.");
            return;
        }

        if (!Number.isInteger(score) || score < 1 || score > 5) {
            showMessage(error, "Choose a rating from 1 to 5.");
            return;
        }

        if (experience.value === "excellent" && score <= 2 ||
            experience.value === "okay" && score === 5) {
            showMessage(error, "Make your rating match your experience.");
            return;
        }

        if (comment.value.trim().length < 20) {
            showMessage(error, "Write at least 20 characters.");
            return;
        }

        if (!permission.checked) {
            showMessage(error, "Please confirm the permission checkbox.");
            return;
        }

        reviews.push({
            name: name.value.trim(),
            rating: score,
            comment: comment.value.trim(),
            created: new Date(),
            visitDate: date.value,
            drink: drink.options[drink.selectedIndex].textContent.trim(),
            visits: visitNumber,
            experience: experience.labels[0].textContent.trim()
        });

        sort.value = "newest";
        renderReviews();
        form.reset();
        updateCounter();

        showMessage(result, "Your review was added successfully!");

        if (status) {
            status.textContent =
                "Your review is displayed on this page only.";
        }
    });

    form.addEventListener("reset", function () {
        hideMessages();
        updateCounter();
    });

    updateCounter();
    renderReviews();
});
