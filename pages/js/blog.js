"use strict";

function createReviewReference() {
    return `TC-REV-${Math.floor(Math.random() * 900000) + 100000}`;
}

function formatReviewDate(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getSortedReviews(reviewRecords, mode) {
    let visibleReviews = [...reviewRecords];

    if (mode.startsWith("rating-")) {
        const requestedRating = Number(mode.slice("rating-".length));
        visibleReviews = visibleReviews.filter((review) => review.rating === requestedRating);
        visibleReviews.sort((first, second) => new Date(second.created_at) - new Date(first.created_at));
    } else if (mode === "highest") {
        visibleReviews.sort((first, second) => second.rating - first.rating || new Date(second.created_at) - new Date(first.created_at));
    } else if (mode === "lowest") {
        visibleReviews.sort((first, second) => first.rating - second.rating || new Date(second.created_at) - new Date(first.created_at));
    } else {
        visibleReviews.sort((first, second) => new Date(second.created_at) - new Date(first.created_at));
    }

    return visibleReviews;
}

function calculateReviewAverage(reviewRecords) {
    if (reviewRecords.length === 0) return 0;
    const ratingTotal = reviewRecords.reduce((total, review) => total + review.rating, 0);
    return ratingTotal / reviewRecords.length;
}

function isValidReviewPhone(value) {
    const phone = value.trim();
    const digitCount = phone.replace(/\D/g, "").length;
    return /^\+?[0-9 ()-]{7,20}$/.test(phone) && digitCount >= 7 && digitCount <= 15;
}

function animatePageSections() {
    const sections = [...document.querySelectorAll("main > section")];
    if (typeof IntersectionObserver !== "function") return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    sections.forEach((section) => {
        section.classList.add("fade");
        observer.observe(section);
    });
}

function prepareAnimatedMessages(...messages) {
    messages.forEach((message) => message.classList.add("fade"));
}

function showAnimatedMessage(message) {
    message.classList.remove("d-none");
    requestAnimationFrame(() => message.classList.add("show"));
}

function hideAnimatedMessage(message) {
    message.classList.remove("show");
    message.classList.add("d-none");
}

function createReviewCard(review) {
    const card = document.createElement("article");
    card.className = "card shadow-sm fade";

    const body = document.createElement("div");
    body.className = "card-body";

    const name = document.createElement("h3");
    name.className = "h5 mb-1";
    name.textContent = review.name;

    const date = document.createElement("p");
    date.className = "small text-muted mb-2";
    date.textContent = formatReviewDate(review.created_at);

    const stars = document.createElement("p");
    stars.className = "text-warning mb-2";
    stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
    stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;

    const details = document.createElement("p");
    details.className = "small text-muted mb-2";
    details.textContent = `Visit date: ${review.visitDate} · Favorite drink: ${review.drink} · Visits: ${review.visits} · Experience: ${review.experience}`;

    const comment = document.createElement("p");
    comment.className = "mb-0";
    comment.textContent = review.comment;

    body.append(name, date, stars, details, comment);
    card.appendChild(body);
    return card;
}

function initializeCoffeeBlog() {
    const form = document.getElementById("blog-review-form");
    const reviewIntroduction = document.querySelector("#customer-reviews > p.text-muted");
    const wrapper = document.getElementById("reviews-article");
    const status = document.getElementById("reviews-status");
    const sortSelect = document.getElementById("reviews-sort");
    if (!form || !wrapper || !status || !sortSelect) return;

    const nameField = document.getElementById("review-name");
    const emailField = document.getElementById("review-email");
    const phoneField = document.getElementById("review-phone");
    const visitDateField = document.getElementById("visit-date");
    const visitCountField = document.getElementById("visit-count");
    const drinkField = document.getElementById("favorite-drink");
    const experienceFields = [...form.querySelectorAll('input[name="experience"]')];
    const ratingField = document.getElementById("review-rating");
    const commentField = document.getElementById("review-text");
    const permissionField = document.getElementById("permission");
    const averageRating = document.getElementById("average-rating");
    const averageStars = document.getElementById("average-stars");
    const reviewsCount = document.getElementById("reviews-count");
    const result = document.getElementById("blog-review-form-result");
    const error = document.getElementById("blog-review-form-error");
    animatePageSections();
    prepareAnimatedMessages(result, error);
    const fieldsToValidate = [nameField, emailField, phoneField, visitDateField, visitCountField, drinkField, ...experienceFields, ratingField, commentField, permissionField];
    const reviews = [];
    const maximumCommentLength = 2000;

    if (reviewIntroduction) {
        reviewIntroduction.textContent = "Reviews submitted here are local previews for this browser session and are not published or sent to a server.";
    }

    form.noValidate = true;
    commentField.maxLength = maximumCommentLength;

    const counter = document.createElement("small");
    counter.className = "form-text text-muted d-block mt-1";
    counter.setAttribute("aria-live", "polite");
    commentField.insertAdjacentElement("afterend", counter);

    const ratingFilterOptions = [5, 4, 3, 2, 1].map((rating) => {
        const option = document.createElement("option");
        option.value = `rating-${rating}`;
        option.textContent = `${rating} star${rating === 1 ? "" : "s"} only`;
        return option;
    });
    sortSelect.append(...ratingFilterOptions);

    const resetFilterButton = document.createElement("button");
    resetFilterButton.type = "button";
    resetFilterButton.className = "btn btn-outline-secondary mt-2";
    resetFilterButton.textContent = "Reset review filter";
    sortSelect.insertAdjacentElement("afterend", resetFilterButton);

    function clearFieldError(field) {
        const feedbackField = experienceFields.includes(field) ? experienceFields[0] : field;
        feedbackField.classList.remove("is-invalid");
        feedbackField.removeAttribute("aria-invalid");
        feedbackField.removeAttribute("aria-describedby");
        const feedback = feedbackField.parentElement.querySelector(`[data-error-for="${feedbackField.id}"]`);
        if (feedback) feedback.remove();
    }

    function showFieldError(field, message) {
        const feedbackField = experienceFields.includes(field) ? experienceFields[0] : field;
        feedbackField.classList.add("is-invalid");
        feedbackField.setAttribute("aria-invalid", "true");
        let feedback = feedbackField.parentElement.querySelector(`[data-error-for="${feedbackField.id}"]`);
        if (!feedback) {
            feedback = document.createElement("div");
            feedback.dataset.errorFor = feedbackField.id;
            feedback.id = `${feedbackField.id}-error`;
            feedback.className = "invalid-feedback d-block";
            feedbackField.insertAdjacentElement("afterend", feedback);
        }
        feedbackField.setAttribute("aria-describedby", feedback.id);
        feedback.textContent = message;
    }

    function clearAllErrors() {
        fieldsToValidate.forEach(clearFieldError);
    }

    function updateCounter() {
        counter.textContent = `${commentField.value.length} / ${maximumCommentLength} characters`;
    }

    function renderReviews() {
        const visibleReviews = getSortedReviews(reviews, sortSelect.value);
        wrapper.replaceChildren();

        if (visibleReviews.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "text-muted";
            emptyMessage.textContent = reviews.length === 0
                ? "No reviews have been shared in this browser session yet. A review you add will appear here as a preview."
                : "No reviews match this rating filter. Choose another rating or reset the filter.";
            wrapper.appendChild(emptyMessage);
        } else {
            visibleReviews.forEach((review) => {
                const card = createReviewCard(review);
                wrapper.appendChild(card);
                requestAnimationFrame(() => card.classList.add("show"));
            });
        }

        const average = calculateReviewAverage(reviews);
        averageRating.textContent = reviews.length > 0 ? average.toFixed(1) : "—";
        averageStars.textContent = `${"★".repeat(Math.round(average))}${"☆".repeat(5 - Math.round(average))}`;
        reviewsCount.textContent = sortSelect.value.startsWith("rating-")
            ? `${visibleReviews.length} matching of ${reviews.length} reviews`
            : `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`;
    }

    commentField.addEventListener("input", updateCounter);
    sortSelect.addEventListener("change", renderReviews);
    resetFilterButton.addEventListener("click", () => {
        sortSelect.value = "newest";
        renderReviews();
        status.textContent = "Review filter reset.";
    });

    fieldsToValidate.forEach((field) => {
        const feedbackField = experienceFields.includes(field) ? experienceFields[0] : field;
        const clearOutdatedError = () => {
            clearFieldError(feedbackField);
            if (experienceFields.includes(field)) {
                const selectedExperience = experienceFields.find((radio) => radio.checked)?.value || "";
                const rating = Number(ratingField.value);
                const mismatch = (selectedExperience === "excellent" && rating >= 1 && rating <= 2)
                    || (selectedExperience === "okay" && rating === 5);
                const ratingFeedback = ratingField.parentElement.querySelector(`[data-error-for="${ratingField.id}"]`);
                if (ratingFeedback?.textContent.startsWith("Make the star rating consistent") && !mismatch) {
                    clearFieldError(ratingField);
                }
            }
            if (!form.querySelector(".is-invalid")) error.classList.add("d-none");
        };
        field.addEventListener("input", clearOutdatedError);
        field.addEventListener("change", clearOutdatedError);
    });

    form.addEventListener("submit", (submission) => {
        submission.preventDefault();
        clearAllErrors();
        hideAnimatedMessage(result);
        hideAnimatedMessage(error);
        status.textContent = "";

        const visitCount = Number(visitCountField.value);
        const rating = Number(ratingField.value);
        const experienceField = experienceFields.find((field) => field.checked);
        const visitDate = visitDateField.value;
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const validationErrors = [];

        if (nameField.value.trim().length < 2 || nameField.value.trim().length > 80) validationErrors.push([nameField, "Enter a name between 2 and 80 characters."]);
        if (!emailField.validity.valid || emailField.value.trim() === "") validationErrors.push([emailField, "Enter a valid email address."]);
        if (!isValidReviewPhone(phoneField.value)) validationErrors.push([phoneField, "Enter a phone number containing 7 to 15 digits."]);
        if (!visitDate || visitDate > today) validationErrors.push([visitDateField, "Choose today or an earlier visit date."]);
        if (!Number.isInteger(visitCount) || visitCount < 1) validationErrors.push([visitCountField, "Enter a whole number of visits greater than zero."]);
        if (!drinkField.value) validationErrors.push([drinkField, "Choose your favorite drink."]);
        if (!experienceField) validationErrors.push([experienceFields[0], "Choose an experience category."]);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) validationErrors.push([ratingField, "Choose a rating from 1 to 5 stars."]);
        if (experienceField && rating >= 1 && rating <= 5 && ((experienceField.value === "excellent" && rating <= 2) || (experienceField.value === "okay" && rating === 5))) {
            validationErrors.push([ratingField, "Make the star rating consistent with the experience category."]);
        }
        if (commentField.value.trim().length < 20 || commentField.value.trim().length > maximumCommentLength) validationErrors.push([commentField, "Write a review between 20 and 2,000 characters."]);
        if (!permissionField.checked) validationErrors.push([permissionField, "Confirm the feedback permission checkbox."]);

        if (validationErrors.length > 0) {
            validationErrors.forEach(([field, message]) => showFieldError(field, message));
            error.textContent = "Please correct the fields marked below.";
            showAnimatedMessage(error);
            validationErrors[0][0].focus();
            return;
        }

        const newReview = {
            name: nameField.value.trim(),
            rating,
            comment: commentField.value.trim(),
            created_at: new Date().toISOString(),
            visitDate,
            drink: drinkField.options[drinkField.selectedIndex].textContent.trim(),
            visits: visitCount,
            experience: experienceField.labels[0].textContent.trim()
        };

        reviews.push(newReview);
        sortSelect.value = "newest";
        renderReviews();
        const reference = createReviewReference();
        form.reset();
        updateCounter();
        result.textContent = `Demo review ${reference} is now previewed in this page. It is held only in this browser tab; it was not sent to a server or permanently published.`;
        showAnimatedMessage(result);
        status.textContent = "Your review preview was added to the list below.";
    });

    form.addEventListener("reset", () => {
        clearAllErrors();
        hideAnimatedMessage(result);
        hideAnimatedMessage(error);
        status.textContent = "";
    });

    updateCounter();
    renderReviews();
}

initializeCoffeeBlog();
