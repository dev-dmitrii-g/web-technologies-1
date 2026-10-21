"use strict";

function createContactReference() {
    return `TC-MSG-${Math.floor(Math.random() * 900000) + 100000}`;
}

function revealContactMessage(message) {
    message.classList.remove("d-none");
    requestAnimationFrame(() => message.classList.add("show"));
}

function hideContactMessage(message) {
    message.classList.remove("show");
    message.classList.add("d-none");
}

function initializeContactForm() {
    const nameField = document.getElementById("contact-name");
    const emailField = document.getElementById("contact-email");
    const inquiryField = document.getElementById("inquiry-type");
    const messageField = document.getElementById("contact-message");
    const form = nameField?.form;
    if (!form || !emailField || !inquiryField || !messageField) return;

    const fields = [nameField, emailField, inquiryField, messageField];
    const maximumMessageLength = 1000;
    const counter = document.createElement("small");
    counter.className = "form-text text-muted d-block mt-1";
    counter.setAttribute("aria-live", "polite");
    messageField.maxLength = maximumMessageLength;
    messageField.insertAdjacentElement("afterend", counter);

    const errorMessage = document.createElement("div");
    errorMessage.className = "alert alert-danger fade d-none mt-3";
    errorMessage.setAttribute("role", "alert");
    errorMessage.setAttribute("aria-live", "assertive");
    const successMessage = document.createElement("div");
    successMessage.className = "alert alert-success fade d-none mt-3";
    successMessage.setAttribute("role", "status");
    successMessage.setAttribute("aria-live", "polite");
    form.append(errorMessage, successMessage);
    form.noValidate = true;
    form.method = "post";
    form.action = window.location.pathname;

    function clearFieldError(field) {
        const feedback = document.getElementById(`${field.id}-error`);
        feedback?.remove();
        field.classList.remove("is-invalid", "is-valid");
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
    }

    function showFieldError(field, text) {
        clearFieldError(field);
        const feedback = document.createElement("div");
        feedback.id = `${field.id}-error`;
        feedback.className = "invalid-feedback d-block";
        feedback.textContent = text;
        field.insertAdjacentElement("afterend", feedback);
        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", feedback.id);
    }

    function validateField(field) {
        if (field === nameField) {
            const name = field.value.trim();
            return name.length >= 2 && name.length <= 80 ? "" : "Enter a name between 2 and 80 characters.";
        }
        if (field === emailField) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim()) ? "" : "Enter a valid email address.";
        }
        if (field === inquiryField) return field.value ? "" : "Choose the nature of your inquiry.";
        if (field === messageField) {
            const length = field.value.trim().length;
            return length >= 20 && length <= maximumMessageLength ? "" : "Write a message between 20 and 1,000 characters.";
        }
        return "";
    }

    function updateCounter() {
        counter.textContent = `${messageField.value.length} / ${maximumMessageLength} characters`;
    }

    let attemptedSubmit = false;
    fields.forEach((field) => {
        const updateField = () => {
            if (!attemptedSubmit) return;
            const validationMessage = validateField(field);
            if (validationMessage) showFieldError(field, validationMessage);
            else {
                clearFieldError(field);
                field.classList.add("is-valid");
                field.setAttribute("aria-invalid", "false");
            }
            if (!form.querySelector(".is-invalid")) hideContactMessage(errorMessage);
        };
        field.addEventListener("input", updateField);
        field.addEventListener("change", updateField);
    });
    messageField.addEventListener("input", updateCounter);
    form.addEventListener("submit", (submission) => {
        submission.preventDefault();
        attemptedSubmit = true;
        fields.forEach(clearFieldError);
        hideContactMessage(errorMessage);
        hideContactMessage(successMessage);

        const invalidFields = fields.filter((field) => {
            const validationMessage = validateField(field);
            if (validationMessage) showFieldError(field, validationMessage);
            else {
                field.classList.add("is-valid");
                field.setAttribute("aria-invalid", "false");
            }
            return validationMessage !== "";
        });

        if (invalidFields.length > 0) {
            errorMessage.textContent = "Please correct the fields marked below.";
            revealContactMessage(errorMessage);
            invalidFields[0].focus();
            return;
        }

        const inquiry = inquiryField.options[inquiryField.selectedIndex].textContent.trim();
        const reference = createContactReference();
        form.reset();
        fields.forEach((field) => {
            field.classList.remove("is-valid", "is-invalid");
            field.removeAttribute("aria-invalid");
            field.removeAttribute("aria-describedby");
        });
        updateCounter();
        successMessage.textContent = `Demo message ${reference} is ready about “${inquiry}”. It was not sent or saved; use hello@tokyocoffee.kz to contact the cafe.`;
        revealContactMessage(successMessage);
    });
    form.addEventListener("reset", () => {
        fields.forEach(clearFieldError);
        hideContactMessage(errorMessage);
        hideContactMessage(successMessage);
        updateCounter();
    });

    updateCounter();
}

initializeContactForm();
