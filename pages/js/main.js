
"use strict";

const events = [
    { id: "public-cupping", name: "Public Cupping", duration: 90, price: 4500, capacity: 8 },
    { id: "latte-art", name: "Latte Art", duration: 120, price: 6500, capacity: 6 },
    { id: "community-event", name: "Community Event", duration: 60, price: 0, capacity: 12 },
    { id: "v60-workshop", name: "V60 Brewing Workshop", duration: 90, price: 5500, capacity: 6 },
    { id: "espresso-tasting", name: "Espresso Tasting", duration: 75, price: 4000, capacity: 8 },
    { id: "coffee-talk", name: "Coffee Community Talk", duration: 60, price: 0, capacity: 12 }
];

const money = price => price.toLocaleString("en-US") + " ₸";
const findEvent = id => events.find(e => e.id === id);

document.addEventListener("DOMContentLoaded", () => {
    // Animate sections when they appear.
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll("main > section").forEach(section => {
        section.style.opacity = "0";
        section.style.transform = "translateY(20px)";
        section.style.transition = "opacity .6s ease, transform .6s ease";
        observer.observe(section);
    });

    const form = document.getElementById("events-registration-form");
    if (!form) return;

    const get = id => document.getElementById(id);
    const name = get("event-name");
    const email = get("event-email");
    const phone = get("event-phone");
    const date = get("preferred-date");
    const people = get("participants");
    const experience = get("coffee-level");
    const message = get("event-message");
    const result = get("events-registration-form-result");
    const error = get("events-registration-form-error");
    const activities = [...form.querySelectorAll('[name="activity"]')];

    // Create the time selector and price summary.
    const timeColumn = document.createElement("div");
    timeColumn.className = "col-12 col-md-6";
    timeColumn.innerHTML = `
        <label for="preferred-time" class="form-label">Preferred Start Time</label>
        <select id="preferred-time" class="form-select" required></select>
    `;
    date.closest(".col-12").after(timeColumn);
    const time = get("preferred-time");

    const summary = document.createElement("div");
    summary.className = "alert alert-info mt-3";
    form.querySelector("fieldset").append(summary);

    // Set the earliest date to tomorrow.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    date.min = [
        tomorrow.getFullYear(),
        String(tomorrow.getMonth() + 1).padStart(2, "0"),
        String(tomorrow.getDate()).padStart(2, "0")
    ].join("-");

    const selected = () => findEvent(activities.find(a => a.checked)?.value);

    function update() {
        const event = selected();
        const count = Number(people.value);
        const duration = event ? event.duration : 120;
        const previous = time.value;
        const options = [new Option("Choose a preferred time", "")];

        for (let m = 540; m + duration <= 1260; m += 30) {
            const value = String(Math.floor(m / 60)).padStart(2, "0") +
                ":" + String(m % 60).padStart(2, "0");
            options.push(new Option(value, value));
        }

        time.replaceChildren(...options);
        if (options.some(o => o.value === previous)) time.value = previous;

        let price = "Choose an activity and group size to estimate the price.";
        if (event) {
            price = count < 1 || count > event.capacity
                ? `Enter 1 to ${event.capacity} participants.`
                : `${event.name}: ${count} participant${count === 1 ? "" : "s"}, ` +
                  `${event.duration} minutes, ${money(event.price * count)}.`;
        }

        summary.textContent =
            `Estimate: ${date.value || "choose a date"} at ${time.value || "choose a time"}. ` +
            `${price} This is a preferred time, not a confirmed booking.`;
    }

    // Update the estimate when form values change.
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();

    const detailsButton = form.querySelector('button[type="button"]:not(:disabled)');
    if (detailsButton) {
        detailsButton.addEventListener("click", () => {
            get("event-details").scrollIntoView({ behavior: "smooth" });
        });
    }

    function show(element, text) {
        element.textContent = text;
        element.classList.remove("d-none");
        element.style.opacity = "0";
        element.style.transition = "opacity .4s ease";
        requestAnimationFrame(() => element.style.opacity = "1");
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        result.classList.add("d-none");
        error.classList.add("d-none");

        const activity = selected();
        const count = Number(people.value);
        const digits = phone.value.replace(/\D/g, "").length;
        const errors = [];

        if (name.value.trim().length < 2)
            errors.push("Enter a name with at least 2 characters.");

        if (!email.validity.valid || !email.value.trim())
            errors.push("Enter a valid email address.");

        if (!/^\+?[0-9 ()-]{7,20}$/.test(phone.value.trim()) ||
            digits < 7 || digits > 15)
            errors.push("Enter a valid phone number.");

        if (!date.value || date.value < date.min)
            errors.push("Choose a date starting from tomorrow.");

        if (!time.value)
            errors.push("Choose a preferred start time.");

        if (!activity)
            errors.push("Choose an activity.");

        if (!Number.isInteger(count) || count < 1 ||
            (activity && count > activity.capacity))
            errors.push("Check the number of participants.");

        if (!experience.value)
            errors.push("Choose your coffee experience level.");

        if (message.value.trim().length < 10)
            errors.push("Your message must contain at least 10 characters.");

        if (errors.length) {
            show(error, errors.join(" "));
            return;
        }

        const total = activity.price * count;
        const reference = "TC-" + (Math.floor(Math.random() * 900000) + 100000);

        show(result,
            `Demo request ${reference}: ${activity.name}, ${date.value} at ${time.value}. ` +
            `${count} participant(s), ${activity.duration} minutes, ${money(total)}. ` +
            "This is not a confirmed booking; no data was sent to a server."
        );
    });

    form.addEventListener("reset", () => {
        result.classList.add("d-none");
        error.classList.add("d-none");
        setTimeout(update, 0);
    });
});
