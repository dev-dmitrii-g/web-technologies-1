"use strict";

// jQuery 3.7.1 is loaded by brewing-guides.html before this script.
$(document).ready(() => {
    const $form = $("#brewing-question-form");
    const $result = $("#brewing-question-form-result");
    const $error = $("#brewing-question-form-error");
    const $status = $form.find(".small[aria-live]").first();
    const STORAGE_KEY = "tokyo-coffee-brewing-questions";

    $("main > section, main > aside, main .row > section").each(function () {
        const $item = $(this);
        $item.css({ opacity: "0", transform: "translateY(20px)", transition: "all 0.6s ease" });

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        $(entry.target).css({ opacity: "1", transform: "translateY(0)" });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(this);
        } else {
            $item.css({ opacity: "1", transform: "translateY(0)" });
        }
    });

    $("main .card")
        .css({ transition: "transform 0.25s ease, box-shadow 0.25s ease" })
        .on("mouseenter", function () {
            $(this).css({ transform: "translateY(-4px)", boxShadow: "0 8px 20px #0002" });
        })
        .on("mouseleave", function () {
            $(this).css({ transform: "", boxShadow: "" });
        });

    $("button, input[type='submit'], input[type='reset']")
        .css("transition", "transform 0.2s ease")
        .on("mouseenter", function () {
            if (!$(this).prop("disabled")) $(this).css("transform", "scale(1.04)");
        })
        .on("mouseleave", function () {
            $(this).css("transform", "");
        });

    function hideMessages() {
        [$result, $error].forEach($element => {
            if ($element.length) $element.addClass("d-none").css("opacity", "0");
        });
    }

    function showMessage($element) {
        if (!$element.length) return;
        $element.removeClass("d-none").css("opacity", "1");
        $element[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (!$form.length) return;

    const $dateInput = $("#brew-date");

    if ($dateInput.length) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        $dateInput.attr("min", [
            tomorrow.getFullYear(),
            String(tomorrow.getMonth() + 1).padStart(2, "0"),
            String(tomorrow.getDate()).padStart(2, "0")
        ].join("-"));
    }

    $form.on("submit", event => {
        event.preventDefault();
        hideMessages();

        const form = $form[0];
        if (!form.checkValidity()) {
            form.reportValidity();
            if ($error.length) {
                $error.text("Please check the information and try again.");
                showMessage($error);
            }
            if ($status.length) $status.text("Please correct the form fields.");
            return;
        }

        const name = $.trim($("#visitor-name").val() || "");
        const email = $.trim($("#visitor-email").val() || "");
        const phone = $.trim($("#visitor-phone").val() || "");
        const method = $("#brewing-method").val();
        const amount = Number($("#coffee-amount").val());
        const question = $.trim($("#brewing-question").val() || "");

        if (name.length < 2 || !email.includes("@") || phone.length < 7 ||
            amount <= 0 || question.length < 5) {
            if ($error.length) {
                $error.text("Please enter valid contact details and brewing information.");
                showMessage($error);
            }
            if ($status.length) $status.text("Please correct the form fields.");
            return;
        }

        const enquiry = {
            name,
            email,
            phone,
            method,
            amount,
            date: $dateInput.val() || "",
            question,
            created: new Date().toISOString()
        };
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            if (!Array.isArray(saved)) throw new Error("Invalid saved data");
            saved.push(enquiry);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch {
            if ($error.length) {
                $error.text("Could not save your question in this browser. Storage may be full or unavailable.");
                showMessage($error);
            }
            if ($status.length) $status.text("Question could not be saved.");
            return;
        }

        if ($result.length) {
            $result.text(`Thank you, ${name}! Your ${method} brewing question was saved in this browser. No email has been sent.`);
            showMessage($result);
        }

        if ($status.length) $status.text("Form validation completed successfully.");
        form.reset();
    });

    $form.on("reset", () => {
        hideMessages();
        if ($status.length) $status.text("Form cleared.");
    });

    const $saveButton = $form.find("button").filter(function () {
        return $(this).text().trim() === "Save Draft";
    }).first();

    if ($saveButton.length) {
        $saveButton.on("click", () => {
            const draft = {};

            $form.find("input, select, textarea").each(function () {
                const $field = $(this);
                const name = $field.attr("name");
                const type = $field.attr("type");
                if (!name || ["submit", "reset", "button"].includes(type)) return;
                if (type === "radio" && !$field.prop("checked")) return;
                draft[name] = type === "checkbox" ? $field.prop("checked") : $field.val();
            });

            try {
                localStorage.setItem("brewing-question-draft", JSON.stringify(draft));
                if ($status.length) $status.text("Draft saved in this browser.");
            } catch {
                if ($status.length) $status.text("Unable to save the draft.");
            }
        });
    }
});
