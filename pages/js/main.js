"use strict";

// jQuery 3.7.1 is loaded by events.html; ready() waits until the page elements are available.
$(document).ready(() => {
    const events = [
        { id: "public-cupping", name: "Public Cupping", duration: 90, price: 4500, capacity: 8 },
        { id: "latte-art", name: "Latte Art", duration: 120, price: 6500, capacity: 6 },
        { id: "community-event", name: "Community Event", duration: 60, price: 0, capacity: 12 },
        { id: "v60-workshop", name: "V60 Brewing Workshop", duration: 90, price: 5500, capacity: 6 },
        { id: "espresso-tasting", name: "Espresso Tasting", duration: 75, price: 4000, capacity: 8 },
        { id: "coffee-talk", name: "Coffee Community Talk", duration: 60, price: 0, capacity: 12 }
    ];

    const money = price => price.toLocaleString("en-US") + " ₸";

    const $sections = $("main > section");
    const revealedSections = new WeakSet();

    $sections.each(function () {
        $(this).css({ opacity: "0", transform: "translateY(20px)", transition: "all 0.6s ease" });
    });

    function revealVisibleSections() {
        const viewportBottom = $(window).scrollTop() + $(window).height();
        $sections.each(function () {
            const $section = $(this);
            if (!revealedSections.has(this) && $section.offset().top < viewportBottom) {
                revealedSections.add(this);
                $section.css({ opacity: "1", transform: "translateY(0)" });
            }
        });
    }

    $(window).on("scroll resize", revealVisibleSections);
    revealVisibleSections();

    const $form = $("#events-registration-form");
    if (!$form.length) return;

    const $name = $("#event-name");
    const $email = $("#event-email");
    const $phone = $("#event-phone");
    const $date = $("#preferred-date");
    const $people = $("#participants");
    const $experience = $("#coffee-level");
    const $message = $("#event-message");
    const $result = $("#events-registration-form-result");
    const $error = $("#events-registration-form-error");
    const STORAGE_KEY = "tokyo-coffee-event-requests";

    const $timeColumn = $("<div>", { "class": "col-12 col-md-6" });
    $timeColumn.html(`
        <label for="preferred-time" class="form-label">Preferred Start Time</label>
        <select id="preferred-time" class="form-select" required></select>
    `);
    $date.closest(".col-12").after($timeColumn);

    const $time = $("#preferred-time");
    const $summary = $("<div>", { "class": "alert alert-info mt-3" });
    $form.find("fieldset").first().append($summary);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    $date.attr("min", tomorrow.toISOString().slice(0, 10));

    function update() {
        const selectedId = $form.find('[name="activity"]:checked').val();
        const selectedEvent = events.find(event => event.id === selectedId);
        const count = Number($people.val());
        const oldTime = $time.val();

        $time.empty().append($("<option>").val("").text("Choose a preferred time"));

        for (let minutes = 540; minutes <= 1260 - (selectedEvent ? selectedEvent.duration : 120); minutes += 30) {
            const value = String(Math.floor(minutes / 60)).padStart(2, "0") +
                ":" + String(minutes % 60).padStart(2, "0");
            $time.append($("<option>").val(value).text(value));
        }

        if ($time.find("option").filter(function () { return $(this).val() === oldTime; }).length) {
            $time.val(oldTime);
        }

        let price = "Choose an activity and group size.";

        if (selectedEvent) {
            price = count < 1 || count > selectedEvent.capacity
                ? "Enter 1 to " + selectedEvent.capacity + " participants."
                : `${selectedEvent.name}: ${count} participant(s), ${selectedEvent.duration} minutes, ${money(selectedEvent.price * count)}.`;
        }

        $summary.text(
            `Estimate: ${$date.val() || "choose a date"} at ${$time.val() || "choose a time"}. ${price} This is not a confirmed booking.`
        );
    }

    $form.on("input change", update);

    const $detailsButton = $form.find('button[type="button"]:not(:disabled)').first();
    if ($detailsButton.length) {
        $detailsButton.on("click", function () {
            const $details = $("#event-details");
            if ($details.length) {
                $("html, body").animate({ scrollTop: $details.offset().top }, 450);
            }
        });
    }

    function show($element, text) {
        $element.text(text).removeClass("d-none");
    }

    $form.on("submit", event => {
        event.preventDefault();
        $result.addClass("d-none");
        $error.addClass("d-none");

        const selectedId = $form.find('[name="activity"]:checked').val();
        const selectedEvent = events.find(item => item.id === selectedId);
        const count = Number($people.val());
        const digits = String($phone.val() || "").replace(/\D/g, "").length;
        const errors = [];

        if ($.trim($name.val() || "").length < 2) errors.push("Enter your name.");
        if (!$email.prop("validity").valid || !$.trim($email.val() || "")) errors.push("Enter a valid email.");
        if (!/^\+?[0-9 ()-]{7,20}$/.test($.trim($phone.val() || "")) || digits < 7 || digits > 15)
            errors.push("Enter a valid phone number.");
        if (!$date.val() || $date.val() < $date.attr("min")) errors.push("Choose a date from tomorrow.");
        if (!$time.val()) errors.push("Choose a time.");
        if (!selectedEvent) errors.push("Choose an activity.");
        if (!Number.isInteger(count) || count < 1 || (selectedEvent && count > selectedEvent.capacity))
            errors.push("Check the number of participants.");
        if (!$experience.val()) errors.push("Choose your coffee experience level.");
        if ($.trim($message.val() || "").length < 10) errors.push("Write at least 10 characters.");

        if (errors.length) {
            show($error, errors.join(" "));
            return;
        }

        const reference = "TC-" + (Math.floor(Math.random() * 900000) + 100000);

        const request = {
            reference,
            activity: selectedEvent.name,
            date: $date.val(),
            time: $time.val(),
            participants: count,
            duration: selectedEvent.duration,
            totalPrice: selectedEvent.price * count,
            experience: $experience.val(),
            message: $.trim($message.val() || ""),
            created: new Date().toISOString()
        };
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            if (!Array.isArray(saved)) throw new Error("Invalid saved data");
            saved.push(request);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch {
            show($error, "Could not save your request in this browser. Storage may be full or unavailable.");
            return;
        }

        show($result,
            `Request ${reference} saved in this browser: ${selectedEvent.name}, ${$date.val()} at ${$time.val()}. ` +
            `${count} participant(s), ${selectedEvent.duration} minutes, ${money(selectedEvent.price * count)}. ` +
            "This is not a confirmed booking. No data was sent to a server."
        );
    });

    $form.on("reset", () => {
        $result.addClass("d-none");
        $error.addClass("d-none");
        window.setTimeout(update, 0);
    });

    update();
});
