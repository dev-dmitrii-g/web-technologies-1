"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("blog-review-form");
    const list = document.getElementById("reviews-article");
    const status = document.getElementById("reviews-status");
    const sort = document.getElementById("reviews-sort");
    const result = document.getElementById("blog-review-form-result");
    const error = document.getElementById("blog-review-form-error");

    if (!form || !list || !sort) return;

    const STORAGE_KEY = "tokyo-coffee-reviews";
    const fields = {
        name: document.getElementById("review-name"),
        visitDate: document.getElementById("visit-date"),
        rating: document.getElementById("review-rating"),
        comment: document.getElementById("review-text"),
        permission: document.getElementById("permission")
    };
    const counter = document.getElementById("review-text-counter");
    const average = document.getElementById("average-rating");
    const stars = document.getElementById("average-stars");
    const count = document.getElementById("reviews-count");
    let preserveSuccessOnReset = false;

    function localDateValue(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    if (fields.visitDate) fields.visitDate.max = localDateValue(new Date());

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealSections = document.querySelectorAll("main > section, main > aside, main .row > section");
    if (prefersReducedMotion) {
        revealSections.forEach(section => { section.style.opacity = "1"; section.style.transform = "none"; });
    } else if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.1 });
        revealSections.forEach(section => {
            section.style.opacity = "0";
            section.style.transform = "translateY(20px)";
            section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            revealObserver.observe(section);
        });
    } else {
        revealSections.forEach(section => { section.style.opacity = "1"; section.style.transform = "none"; });
    }

    function bindCardHover(card) {
        if (prefersReducedMotion || card.dataset.hoverBound === "true") return;
        card.dataset.hoverBound = "true";
        card.style.transition = "transform 0.25s ease, box-shadow 0.25s ease";
        card.addEventListener("mouseenter", function () {
            card.style.transform = "translateY(-4px)";
            card.style.boxShadow = "0 8px 20px #0002";
        });
        card.addEventListener("mouseleave", function () {
            card.style.transform = "";
            card.style.boxShadow = "";
        });
    }

    document.querySelectorAll("main .card").forEach(bindCardHover);
    if (!prefersReducedMotion) {
        document.querySelectorAll("button, input[type='submit'], input[type='reset']").forEach(button => {
            button.style.transition = "transform 0.2s ease";
            button.addEventListener("mouseenter", function () {
                if (!button.disabled) button.style.transform = "scale(1.04)";
            });
            button.addEventListener("mouseleave", function () { button.style.transform = ""; });
        });
    }

    function loadReviews() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            if (!Array.isArray(saved)) return [];
            return saved.filter(function (review) {
                return review && typeof review.name === "string" &&
                    typeof review.comment === "string" &&
                    Number.isInteger(Number(review.rating)) &&
                    Number(review.rating) >= 1 && Number(review.rating) <= 5 &&
                    !Number.isNaN(new Date(review.created).getTime());
            }).map(function (review) {
                return { ...review, rating: Number(review.rating), created: new Date(review.created).toISOString() };
            });
        } catch {
            return [];
        }
    }

    const reviews = loadReviews();

    function saveReviews() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
            return true;
        } catch {
            return false;
        }
    }

    function setError(field, message) {
        const errorNode = document.getElementById(field.id + "-error");
        field.classList.toggle("is-invalid", Boolean(message));
        field.classList.toggle("is-valid", !message && field.value.trim() !== "");
        field.setAttribute("aria-invalid", message ? "true" : "false");
        if (errorNode) errorNode.textContent = message;
        return !message;
    }

    function validate(field) {
        if (field === fields.name) {
            const value = field.value.trim();
            return setError(field, value.length < 2 || value.length > 60 || !/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(value)
                ? "Enter a name using 2–60 letters, spaces, apostrophes or hyphens." : "");
        }
        if (field === fields.rating) {
            const score = Number(field.value);
            return setError(field, !Number.isInteger(score) || score < 1 || score > 5 ? "Choose a rating from 1 to 5 stars." : "");
        }
        if (field === fields.visitDate) {
            const today = localDateValue(new Date());
            const isValidDate = field.value && !Number.isNaN(new Date(field.value + "T00:00:00").getTime());
            return setError(field, !isValidDate || field.value > today
                ? "Choose today or an earlier visit date." : "");
        }
        if (field === fields.comment) {
            const length = field.value.trim().length;
            return setError(field, length < 20 ? "Write at least 20 characters." : length > 1000 ? "Keep your review under 1,000 characters." : "");
        }
        if (field === fields.permission) {
            field.classList.toggle("is-invalid", !field.checked);
            field.setAttribute("aria-invalid", field.checked ? "false" : "true");
            const errorNode = document.getElementById("permission-error");
            if (errorNode) errorNode.textContent = field.checked ? "" : "Please agree before posting your review.";
            return field.checked;
        }
        return true;
    }

    function hideMessages() {
        [result, error].forEach(function (element) {
            if (element) {
                element.textContent = "";
                element.classList.add("d-none");
            }
        });
    }

    function showMessage(element, message) {
        if (!element) return;
        element.textContent = message;
        element.classList.remove("d-none");
    }

    function updateCounter() {
        if (counter) counter.textContent = fields.comment.value.length + " / 1000";
    }

    function renderReviews() {
        list.replaceChildren();
        let sorted = [...reviews];
        if (sort.value === "highest") sorted.sort((a, b) => b.rating - a.rating || new Date(b.created) - new Date(a.created));
        else if (sort.value === "lowest") sorted.sort((a, b) => a.rating - b.rating || new Date(b.created) - new Date(a.created));
        else if (sort.value.startsWith("rating-")) sorted = sorted.filter(review => review.rating === Number(sort.value.slice(7)));
        else sorted.sort((a, b) => new Date(b.created) - new Date(a.created));

        if (!sorted.length) {
            const empty = document.createElement("p");
            empty.className = "text-muted border rounded p-4 bg-body";
            empty.textContent = reviews.length ? "No reviews match this filter." : "No reviews yet. Be the first to share your experience.";
            list.appendChild(empty);
        }

        sorted.forEach(function (review) {
            const article = document.createElement("article");
            article.className = "card shadow-sm";
            bindCardHover(article);
            const body = document.createElement("div");
            body.className = "card-body";
            const header = document.createElement("div");
            header.className = "d-flex flex-wrap justify-content-between align-items-start gap-2";
            const authorBlock = document.createElement("div");
            authorBlock.className = "d-flex align-items-center gap-3";
            const avatar = document.createElement("span");
            avatar.className = "rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center fw-bold";
            avatar.style.width = "42px";
            avatar.style.height = "42px";
            avatar.setAttribute("aria-hidden", "true");
            avatar.textContent = (review.name.trim()[0] || "?").toLocaleUpperCase();
            const authorDetails = document.createElement("div");
            const author = document.createElement("h3");
            author.className = "h6 mb-1";
            author.textContent = review.name;
            const time = document.createElement("time");
            time.className = "small text-muted";
            time.dateTime = review.created;
            time.textContent = new Date(review.created).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
            authorDetails.append(author, time);
            if (review.visitDate) {
                const visit = document.createElement("small");
                visit.className = "d-block text-muted";
                visit.textContent = "Visited " + new Date(review.visitDate + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
                authorDetails.appendChild(visit);
            }
            authorBlock.append(avatar, authorDetails);
            const starsLine = document.createElement("p");
            starsLine.className = "text-warning mb-0";
            starsLine.setAttribute("aria-label", review.rating + " out of 5 stars");
            starsLine.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
            header.append(authorBlock, starsLine);
            const text = document.createElement("p");
            text.className = "mt-3 mb-0 text-break";
            text.textContent = review.comment;
            const actions = document.createElement("div");
            actions.className = "d-flex justify-content-end mt-3";
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-link link-danger p-0 small";
            deleteButton.textContent = "Delete review";
            deleteButton.setAttribute("aria-label", "Delete review by " + review.name);
            deleteButton.addEventListener("click", function () {
                const index = reviews.indexOf(review);
                if (index < 0) return;
                const removed = reviews.splice(index, 1)[0];
                if (!saveReviews()) {
                    reviews.splice(index, 0, removed);
                    showMessage(error, "Could not delete the review. Browser storage may be unavailable.");
                    return;
                }
                renderReviews();
                if (status) status.textContent = "Review deleted from this browser.";
            });
            actions.appendChild(deleteButton);
            body.append(header, text, actions);
            article.appendChild(body);
            list.appendChild(article);
        });

        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avg = reviews.length ? total / reviews.length : 0;
        if (average) average.textContent = reviews.length ? avg.toFixed(1) : "—";
        if (stars) stars.textContent = "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));
        if (count) count.textContent = reviews.length + (reviews.length === 1 ? " review" : " reviews");
    }

    if (![...sort.options].some(option => option.value === "highest")) {
        sort.add(new Option("Highest rating", "highest"));
        sort.add(new Option("Lowest rating", "lowest"));
    }
    [5, 4, 3, 2, 1].forEach(function (number) {
        if (![...sort.options].some(option => option.value === "rating-" + number)) {
            sort.add(new Option(number + " stars only", "rating-" + number));
        }
    });
    sort.addEventListener("change", renderReviews);

    [fields.name, fields.visitDate, fields.rating, fields.comment, fields.permission].forEach(function (field) {
        field.addEventListener(field === fields.permission ? "change" : "input", function () {
            hideMessages();
            if (field.classList.contains("is-invalid") || form.dataset.submitted === "true") validate(field);
            updateCounter();
        });
        field.addEventListener("blur", function () { if (field.value || field === fields.permission) validate(field); }, true);
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        hideMessages();
        form.dataset.submitted = "true";
        const valid = [fields.name, fields.visitDate, fields.rating, fields.comment, fields.permission]
            .map(validate).every(Boolean);
        if (!valid) {
            showMessage(error, "Please correct the highlighted fields before posting.");
            const firstInvalid = form.querySelector(".is-invalid");
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const review = {
            name: fields.name.value.trim(),
            visitDate: fields.visitDate.value,
            rating: Number(fields.rating.value),
            comment: fields.comment.value.trim(),
            created: new Date().toISOString()
        };
        reviews.push(review);
        if (!saveReviews()) {
            reviews.pop();
            showMessage(error, "Could not save the review in this browser. Storage may be full or unavailable.");
            return;
        }
        sort.value = "newest";
        renderReviews();
        preserveSuccessOnReset = true;
        form.reset();
        form.dataset.submitted = "false";
        form.querySelectorAll(".is-valid, .is-invalid").forEach(field => {
            field.classList.remove("is-valid", "is-invalid");
            field.removeAttribute("aria-invalid");
        });
        form.querySelectorAll(".invalid-feedback").forEach(node => node.textContent = "");
        updateCounter();
        showMessage(result, "Your review has been posted!");
        if (status) status.textContent = "Your review is saved in this browser only.";
    });

    form.addEventListener("reset", function () {
        window.setTimeout(function () {
            if (!preserveSuccessOnReset) hideMessages();
            preserveSuccessOnReset = false;
            form.dataset.submitted = "false";
            form.querySelectorAll(".is-valid, .is-invalid").forEach(field => {
                field.classList.remove("is-valid", "is-invalid");
                field.removeAttribute("aria-invalid");
            });
            form.querySelectorAll(".invalid-feedback").forEach(node => node.textContent = "");
            updateCounter();
        }, 0);
    });

    form.dataset.submitted = "false";
    updateCounter();
    renderReviews();
});
