"use strict";

$(function () {
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

    const form = document.getElementById("wholesale-enquiry-form");
    if (!form) return;

    const $form = $(form);
    const $result = $("#wholesale-enquiry-form-result");
    const $error = $("#wholesale-enquiry-form-error");
    const $status = $("#wholesale-form-status");
    const storageKey = "tokyo-coffee-wholesale-enquiries";
    let submittedOnce = false;
    let savingSuccessfulSubmission = false;

    const phonePattern = /^\+77\d{9}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function localDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const dateInput = document.getElementById("preferred-date");
    if (dateInput) dateInput.min = localDateString();

    function setFieldError($field, message, $container) {
        const id = $field.attr("id");
        const feedbackId = `${id}-feedback`;
        let $feedback = $form.find(`[data-feedback-for="${id}"]`);

        if (!$feedback.length) {
            $feedback = $("<div>", {
                id: feedbackId,
                class: "invalid-feedback d-block",
                "data-feedback-for": id,
                role: "alert"
            });
            ($container || $field.parent()).append($feedback);
        }

        $feedback.text(message).toggleClass("d-none", !message);
        $field.attr("aria-invalid", message ? "true" : "false");
        if (message) {
            $field.addClass("is-invalid").attr("aria-describedby", feedbackId);
        } else {
            $field.removeClass("is-invalid").removeAttr("aria-describedby");
        }
    }

    function validateField(field) {
        const $field = $(field);
        const id = $field.attr("id");
        const value = $.trim(String($field.val() || ""));
        let message = "";
        let $container;

        switch (id) {
            case "company":
                if (value.length < 2) message = "Enter a company name with at least 2 characters.";
                break;
            case "contact-name":
                if (value.length < 2) message = "Enter a contact name with at least 2 characters.";
                break;
            case "business-email":
                if (!emailPattern.test(value) || !$field[0].validity.valid) {
                    message = "Enter a valid email, for example company@email.com.";
                }
                break;
            case "business-phone":
                if (!phonePattern.test(value.replace(/[\s-]/g, ""))) {
                    message = "Enter a Kazakhstan mobile number starting with +7 7 and 10 digits after +7. Spaces or hyphens are optional.";
                }
                break;
            case "volume":
                if (!Number.isFinite(Number(value)) || Number(value) <= 0 || !Number.isInteger(Number(value))) {
                    message = "Enter a whole number of kilograms greater than zero.";
                }
                break;
            case "preferred-date":
                if (!value || value < localDateString()) {
                    message = "Choose today or a future contact date.";
                }
                break;
            case "business-cafe": {
                const $choices = $form.find('input[name="business-type"]');
                const selected = $choices.is(":checked");
                $container = $field.closest(".col-12");
                message = selected ? "" : "Choose a business type.";
                $choices.each(function () {
                    $(this).toggleClass("is-invalid", !selected)
                        .attr("aria-invalid", selected ? "false" : "true");
                });
                break;
            }
            case "service":
                if (!value) message = "Choose the service you need.";
                break;
            case "contact-agree":
                if (!$field.prop("checked")) message = "Please agree to be contacted about this enquiry.";
                break;
            case "business-message":
                if (value.length < 10) message = "Describe your requirements in at least 10 characters.";
                break;
            default:
                if (!value) message = "This field is required.";
        }

        setFieldError($field, message, $container);
        return !message;
    }

    function clearMessages() {
        $result.addClass("d-none");
        $error.addClass("d-none");
    }

    function clearValidation() {
        $form.find(".is-invalid").removeClass("is-invalid").removeAttr("aria-invalid aria-describedby");
        $form.find("[data-feedback-for]").remove();
    }

    $form.on("input change", "input, select, textarea", function () {
        if (submittedOnce || $(this).hasClass("is-invalid")) {
            if (this.name === "business-type") {
                validateField($form.find("input[name='business-type'][required]")[0]);
            } else {
                validateField(this);
            }
        }
        clearMessages();
    });

    $form.on("submit", function (event) {
        event.preventDefault();
        submittedOnce = true;
        clearMessages();

        let valid = true;
        $form.find("input[required], select[required], textarea[required]").each(function () {
            if (!validateField(this)) valid = false;
        });

        if (!valid) {
            $error.text("Please correct the highlighted fields and submit again.").removeClass("d-none");
            $status.text("Some fields need your attention.");
            return;
        }

        const selectedBusinessType = $form.find('input[name="business-type"]:checked').val();
        const enquiry = {
            company: $.trim($("#company").val()),
            contactName: $.trim($("#contact-name").val()),
            businessEmail: $.trim($("#business-email").val()),
            businessPhone: $.trim($("#business-phone").val()),
            expectedVolumeKg: Number($("#volume").val()),
            preferredContactDate: $("#preferred-date").val(),
            businessType: selectedBusinessType,
            service: $("#service").val(),
            contactPermission: $("#contact-agree").prop("checked"),
            requirements: $.trim($("#business-message").val()),
            createdAt: new Date().toISOString()
        };

        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
            if (!Array.isArray(saved)) throw new Error("Saved enquiries are not an array.");
            saved.push(enquiry);
            localStorage.setItem(storageKey, JSON.stringify(saved));
        } catch {
            $error.text("The enquiry could not be saved in this browser. Check available storage and try again.").removeClass("d-none");
            $status.text("The enquiry was not saved.");
            return;
        }

        savingSuccessfulSubmission = true;
        form.reset();
        savingSuccessfulSubmission = false;
        clearValidation();
        submittedOnce = false;
        $result.text(
            `Thank you, ${enquiry.contactName}. Your enquiry has been submitted and saved locally. We will contact you soon.`
        ).removeClass("d-none");
        $status.text("Enquiry saved locally as JSON. ");
    });

    $form.on("reset", function () {
        if (savingSuccessfulSubmission) return;
        window.setTimeout(function () {
            clearValidation();
            clearMessages();
            submittedOnce = false;
            if ($status.length) $status.text("Form cleared.");
        }, 0);
    });
});
