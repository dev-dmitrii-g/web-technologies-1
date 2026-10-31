
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

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("main > section").forEach(section => {
        section.style.opacity = "0";
        section.style.transform = "translateY(20px)";
        section.style.transition = "all 0.6s ease";

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        section.style.opacity = "1";
                        section.style.transform = "translateY(0)";
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(section);
        } else {
            section.style.opacity = "1";
            section.style.transform = "translateY(0)";
        }
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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    date.min = tomorrow.toISOString().slice(0, 10);

    function update() {
        const event = events.find(e =>
            activities.some(a => a.checked && a.value === e.id)
        );
        const count = Number(people.value);
        const oldTime = time.value;

        time.replaceChildren(new Option("Choose a preferred time", ""));

        for (let m = 540; m <= 1260 - (event ? event.duration : 120); m += 30) {
            const value = String(Math.floor(m / 60)).padStart(2, "0") +
                ":" + String(m % 60).padStart(2, "0");
            time.add(new Option(value, value));
        }

        if ([...time.options].some(o => o.value === oldTime)) {
            time.value = oldTime;
        }

        let price = "Choose an activity and group size.";

        if (event) {
            price = count < 1 || count > event.capacity
                ? "Enter 1 to " + event.capacity + " participants."
                : `${event.name}: ${count} participant(s), ${event.duration} minutes, ${money(event.price * count)}.`;
        }

        summary.textContent =
            `Estimate: ${date.value || "choose a date"} at ${time.value || "choose a time"}. ${price} This is not a confirmed booking.`;
    }

    form.addEventListener("input", update);
    form.addEventListener("change", update);

    const detailsButton = form.querySelector('button[type="button"]:not(:disabled)');
    if (detailsButton) {
        detailsButton.addEventListener("click", () => {
            get("event-details").scrollIntoView({ behavior: "smooth" });
        });
    }

    function show(element, text) {
        element.textContent = text;
        element.classList.remove("d-none");
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        result.classList.add("d-none");
        error.classList.add("d-none");

        const activity = events.find(e =>
            activities.some(a => a.checked && a.value === e.id)
        );
        const count = Number(people.value);
        const digits = phone.value.replace(/\D/g, "").length;
        const errors = [];

        if (name.value.trim().length < 2) errors.push("Enter your name.");
        if (!email.validity.valid || !email.value.trim()) errors.push("Enter a valid email.");
        if (!/^\+?[0-9 ()-]{7,20}$/.test(phone.value.trim()) || digits < 7 || digits > 15)
            errors.push("Enter a valid phone number.");
        if (!date.value || date.value < date.min) errors.push("Choose a date from tomorrow.");
        if (!time.value) errors.push("Choose a time.");
        if (!activity) errors.push("Choose an activity.");
        if (!Number.isInteger(count) || count < 1 || (activity && count > activity.capacity))
            errors.push("Check the number of participants.");
        if (!experience.value) errors.push("Choose your coffee experience level.");
        if (message.value.trim().length < 10) errors.push("Write at least 10 characters.");

        if (errors.length) {
            show(error, errors.join(" "));
            return;
        }

        const reference = "TC-" + (Math.floor(Math.random() * 900000) + 100000);

        show(result,
            `Demo request ${reference}: ${activity.name}, ${date.value} at ${time.value}. ` +
            `${count} participant(s), ${activity.duration} minutes, ${money(activity.price * count)}. ` +
            "This is not a confirmed booking. No data was sent to a server."
        );
    });

    form.addEventListener("reset", () => {
        result.classList.add("d-none");
        error.classList.add("d-none");
        setTimeout(update, 0);
    });

    update();
});
