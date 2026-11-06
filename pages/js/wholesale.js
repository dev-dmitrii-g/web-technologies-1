"use strict";

$(document).ready(function () {
    // jQuery 3.7.1 is loaded from the official CDN; ready() waits until this page's enquiry form exists.
    const $form = $("#wholesale-enquiry-form");
    if (!$form.length) return;
    const $result = $("#wholesale-enquiry-form-result"), $error = $("#wholesale-enquiry-form-error");
    const $status = $form.find("[aria-live]").first();
    const STORAGE_KEY = "tokyo-coffee-wholesale-enquiries";
    function validate($field) {
        const value = $.trim(String($field.val() || ""));
        const id = $field.attr("id");
        let valid = !!value, message = "This field is required.", group;
        if (id === "company") { valid = value.length >= 2; message = "Enter your company name."; }
        if (id === "contact-name") { valid = value.length >= 2; message = "Enter at least two characters for your name."; }
        if (id === "business-email") { valid = FormUI.emailValid(value); message = "Enter a valid business email."; }
        if (id === "business-phone") { valid = FormUI.phoneValid(value); message = "Enter a valid phone number with 7 to 15 digits."; }
        if (id === "volume") { valid = Number(value) > 0; message = "Enter an expected volume greater than zero."; }
        if (id === "preferred-date") { valid = !!value && value >= FormUI.today(); message = "Choose today or a future contact date."; }
        if (id === "business-cafe") { valid = $form.find('input[name="business-type"]:checked').length > 0; message = "Choose a business type."; group = $field.closest("fieldset"); }
        if (id === "service") { valid = !!value; message = "Choose a required service."; }
        if (id === "contact-agree") { valid = $field.prop("checked"); message = "Please agree to be contacted."; }
        if (id === "business-message") { valid = value.length >= 10; message = "Describe your requirements in at least 10 characters."; }
        FormUI.mark($field, valid, message, group);
        return valid;
    }
    $form.find("input, select, textarea").each(function () {
        $(this).on("invalid", function (event) { event.preventDefault(); validate($(this)); });
    });
    $form.on("input change", "input, select, textarea", function () {
        if ($(this).attr("type") === "radio") {
            const $firstChoice = $form.find("[name=" + $(this).attr("name") + "]").first();
            if ($firstChoice.hasClass("is-invalid")) validate($firstChoice);
        } else if ($(this).hasClass("is-invalid")) validate($(this));
    });
    // Replaces getElementById/addEventListener and direct style changes with selectors, .on(), and Bootstrap feedback classes; the jQuery version is shorter and clearer.
    $form.on("submit", function (event) {
        event.preventDefault(); // Without this, this demo form would post to the placeholder FormSubmit address.
        FormUI.hide($result); FormUI.hide($error);
        let valid = true;
        $form.find("input[required], select[required], textarea[required]").each(function () {
            if ($(this).attr("name") === "business-type" && $(this).attr("id") !== "business-cafe") return;
            valid = validate($(this)) && valid;
        });
        if (!valid) {
            FormUI.show($error, "Please correct the highlighted fields.");
            $status.text("Please correct the form fields.");
            return;
        }
        const company = $.trim($("#company").val());
        const service = $("#service option:selected").text().trim();
        const enquiry = {};
        $form.find("input, select, textarea").each(function () {
            const $field = $(this);
            const name = $field.attr("name");
            const type = $field.attr("type");
            if (!name || ["submit", "reset", "button"].includes(type)) return;
            if ((type === "radio" || type === "checkbox") && !$field.prop("checked")) return;
            const value = type === "checkbox" ? true : $.trim(String($field.val() || ""));
            if (Object.prototype.hasOwnProperty.call(enquiry, name)) {
                enquiry[name] = [].concat(enquiry[name], value);
            } else {
                enquiry[name] = value;
            }
        });
        enquiry.created = new Date().toISOString();
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            if (!Array.isArray(saved)) throw new Error("Invalid saved data");
            saved.push(enquiry);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch {
            FormUI.show($error, "Could not save your enquiry in this browser. Storage may be full or unavailable.");
            return;
        }
        this.reset();
        FormUI.clearForm($form);
        FormUI.show($result, "Thank you, " + company + ". Your " + service.toLowerCase() + " enquiry was saved in this browser. It was not sent to a server.", "slide");
        $status.text("Enquiry saved in this browser. No information was sent to a server.");
    });
    $form.on("reset", function () {
        FormUI.hide($result); FormUI.hide($error);
        window.setTimeout(function () { FormUI.clearForm($form); }, 0);
    });
});

