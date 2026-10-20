"use strict";

const coffeeEvents = [
    { id: "public-cupping", name: "Public Cupping", category: "tasting", durationMinutes: 90, pricePerPerson: 4500, capacity: 8 },
    { id: "latte-art", name: "Latte Art", category: "workshop", durationMinutes: 120, pricePerPerson: 6500, capacity: 6 },
    { id: "community-event", name: "Community Event", category: "community", durationMinutes: 60, pricePerPerson: 0, capacity: 12 },
    { id: "v60-workshop", name: "V60 Brewing Workshop", category: "workshop", durationMinutes: 90, pricePerPerson: 5500, capacity: 6 },
    { id: "espresso-tasting", name: "Espresso Tasting", category: "tasting", durationMinutes: 75, pricePerPerson: 4000, capacity: 8 },
    { id: "coffee-talk", name: "Coffee Community Talk", category: "community", durationMinutes: 60, pricePerPerson: 0, capacity: 12 }
];

function findCoffeeEvent(eventId) {
    return coffeeEvents.find((coffeeEvent) => coffeeEvent.id === eventId) || null;
}

function calculateEventTotal(coffeeEvent, participantCount) {
    if (!coffeeEvent || participantCount < 1 || participantCount > coffeeEvent.capacity) return 0;
    return coffeeEvent.pricePerPerson * participantCount;
}

function formatEventPrice(amount) {
    return `${amount.toLocaleString("en-US")} ₸`;
}

function createEventReference() {
    return `TC-${Math.floor(Math.random() * 900000) + 100000}`;
}

function getEventRequestSummary(coffeeEvent, participantCount, requestedDate) {
    const total = calculateEventTotal(coffeeEvent, participantCount);
    return `${coffeeEvent.name} · ${requestedDate} · ${participantCount} participant${participantCount === 1 ? "" : "s"} · ${coffeeEvent.durationMinutes} minutes · ${total === 0 ? "Free" : formatEventPrice(total)}`;
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

function initializeEventsRequest() {
    const form = document.getElementById("events-registration-form");
    if (!form) return;

    const nameField = document.getElementById("event-name");
    const emailField = document.getElementById("event-email");
    const phoneField = document.getElementById("event-phone");
    const dateField = document.getElementById("preferred-date");
    const participantsField = document.getElementById("participants");
    const activityFields = [...form.querySelectorAll('input[name="activity"]')];
    const result = document.getElementById("events-registration-form-result");
    const error = document.getElementById("events-registration-form-error");
    animatePageSections();
    prepareAnimatedMessages(result, error);
    const fieldsToValidate = [
        nameField,
        emailField,
        phoneField,
        dateField,
        participantsField,
        ...activityFields,
        form.querySelector("#coffee-level"),
        form.querySelector("#event-message")
    ];

    function setFieldError(field, message) {
        field.classList.add("is-invalid");
        let feedback = field.parentElement.querySelector(`[data-error-for="${field.id}"]`);
        if (!feedback) {
            feedback = document.createElement("div");
            feedback.dataset.errorFor = field.id;
            feedback.className = "invalid-feedback d-block";
            field.insertAdjacentElement("afterend", feedback);
        }
        feedback.textContent = message;
    }

    function clearFieldError(field) {
        field.classList.remove("is-invalid");
        field.parentElement.querySelector(`[data-error-for="${field.id}"]`)?.remove();
    }

    function clearValidation() {
        fieldsToValidate.forEach(clearFieldError);
    }

    fieldsToValidate.forEach((field) => {
        field.addEventListener("input", () => clearFieldError(field));
        field.addEventListener("change", () => clearFieldError(field));
    });

    const minimumDate = new Date();
    minimumDate.setDate(minimumDate.getDate() + 1);
    dateField.min = minimumDate.toISOString().slice(0, 10);

    form.addEventListener("submit", (submission) => {
        submission.preventDefault();
        clearValidation();
        hideAnimatedMessage(result);
        hideAnimatedMessage(error);

        const selectedEventId = activityFields.find((field) => field.checked)?.value || "";
        const selectedEvent = findCoffeeEvent(selectedEventId);
        const participantCount = Number(participantsField.value);
        const errors = [];

        if (nameField.value.trim().length < 2) errors.push([nameField, "Enter a name with at least 2 characters."]);
        if (!emailField.validity.valid || emailField.value.trim() === "") errors.push([emailField, "Enter a valid email address."]);
        if (!/^\+?[0-9 ()-]{7,20}$/.test(phoneField.value.trim())) errors.push([phoneField, "Enter a phone number with 7 to 20 digits or phone characters."]);
        if (!dateField.value || dateField.value < dateField.min) errors.push([dateField, "Choose a date starting from tomorrow."]);
        if (!selectedEvent) errors.push([activityFields[0], "Choose an activity."]);
        if (!Number.isInteger(participantCount) || participantCount < 1 || (selectedEvent && participantCount > selectedEvent.capacity)) {
            errors.push([participantsField, selectedEvent ? `This activity allows 1 to ${selectedEvent.capacity} participants.` : "Enter at least 1 participant."]);
        }
        if (!form.querySelector("#coffee-level").value) errors.push([form.querySelector("#coffee-level"), "Choose your coffee experience level."]);
        if (form.querySelector("#event-message").value.trim().length < 10) errors.push([form.querySelector("#event-message"), "Please add at least 10 characters to your message."]);

        if (errors.length > 0) {
            errors.forEach(([field, message]) => setFieldError(field, message));
            error.textContent = "Please correct the fields marked below.";
            showAnimatedMessage(error);
            errors[0][0].focus();
            return;
        }

        const summary = getEventRequestSummary(selectedEvent, participantCount, dateField.value);
        result.textContent = `Demo request ${createEventReference()}: ${summary}. Prices shown here are illustrative only. This is not a confirmed booking; no data was sent to a server.`;
        showAnimatedMessage(result);
    });

    form.addEventListener("reset", () => {
        clearValidation();
        hideAnimatedMessage(result);
        hideAnimatedMessage(error);
    });
}

initializeEventsRequest();
