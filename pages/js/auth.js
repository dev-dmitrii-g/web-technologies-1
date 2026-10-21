"use strict";

function isValidAuthEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function makeAuthMessage(className, role) {
    const message = document.createElement("div");
    message.className = `${className} fade d-none mt-3`;
    message.setAttribute("role", role);
    message.setAttribute("aria-live", role === "status" ? "polite" : "assertive");
    return message;
}

function revealAuthMessage(message) {
    message.classList.remove("d-none");
    requestAnimationFrame(() => message.classList.add("show"));
}

function hideAuthMessage(message) {
    message.classList.remove("show");
    message.classList.add("d-none");
}

function addDescription(field, descriptionId) {
    const descriptions = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    descriptions.add(descriptionId);
    field.setAttribute("aria-describedby", [...descriptions].join(" "));
}

function removeDescription(field, descriptionId) {
    const descriptions = (field.getAttribute("aria-describedby") || "").split(/\s+/).filter((id) => id && id !== descriptionId);
    if (descriptions.length === 0) field.removeAttribute("aria-describedby");
    else field.setAttribute("aria-describedby", descriptions.join(" "));
}

function addPasswordToggle(field) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "btn btn-outline-secondary btn-sm mt-2";
    toggle.textContent = "Show password";
    toggle.setAttribute("aria-controls", field.id);
    toggle.setAttribute("aria-pressed", "false");
    toggle.addEventListener("click", () => {
        const isVisible = field.type === "text";
        field.type = isVisible ? "password" : "text";
        toggle.textContent = isVisible ? "Show password" : "Hide password";
        toggle.setAttribute("aria-pressed", String(!isVisible));
        field.focus();
    });
    field.insertAdjacentElement("afterend", toggle);
    return toggle;
}

function initializeAuthForm(form, mode) {
    if (!form) return;

    const registration = mode === "registration";
    const emailField = form.querySelector(registration ? "#email" : "#login-email");
    const passwordField = form.querySelector(registration ? "#password" : "#login-password");
    if (!emailField || !passwordField) return;

    const firstNameField = registration ? form.querySelector("#first-name") : null;
    const lastNameField = registration ? form.querySelector("#last-name") : null;
    const confirmationField = registration ? form.querySelector("#confirm-password") : null;
    const termsField = registration ? form.querySelector("#terms") : null;
    const fields = [firstNameField, lastNameField, emailField, passwordField, confirmationField, termsField].filter(Boolean);
    const errorMessage = makeAuthMessage("alert alert-danger", "alert");
    const successMessage = makeAuthMessage("alert alert-success", "status");
    form.append(errorMessage, successMessage);
    form.noValidate = true;
    form.method = "post";
    form.action = window.location.pathname;

    const feedbackId = (field) => `${field.id}-validation-error`;

    function clearFieldError(field) {
        const id = feedbackId(field);
        document.getElementById(id)?.remove();
        removeDescription(field, id);
        field.removeAttribute("aria-invalid");
        field.classList.remove("is-invalid", "is-valid");
    }

    function showFieldError(field, message) {
        clearFieldError(field);
        const feedback = document.createElement("div");
        feedback.id = feedbackId(field);
        feedback.className = "invalid-feedback d-block";
        feedback.textContent = message;
        field.insertAdjacentElement("afterend", feedback);
        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
        addDescription(field, feedback.id);
    }

    function setFieldValid(field) {
        clearFieldError(field);
        field.classList.add("is-valid");
        field.setAttribute("aria-invalid", "false");
    }

    function checkPassword(value) {
        return [
            value.length >= 8,
            /[a-z]/.test(value),
            /[A-Z]/.test(value),
            /\d/.test(value),
            /[^A-Za-z0-9\s]/.test(value)
        ];
    }

    let passwordChecklist = null;
    if (registration) {
        const criteriaLabels = ["At least 8 characters", "One lowercase letter", "One uppercase letter", "One number", "One special character"];
        passwordChecklist = document.createElement("ul");
        passwordChecklist.id = "password-checklist";
        passwordChecklist.className = "small text-muted mt-2 mb-0 ps-3";
        passwordChecklist.setAttribute("aria-live", "polite");
        const criteriaItems = criteriaLabels.map((label) => {
            const item = document.createElement("li");
            item.dataset.criterion = label;
            item.textContent = `${label} — missing`;
            passwordChecklist.append(item);
            return item;
        });
        passwordField.insertAdjacentElement("afterend", passwordChecklist);
        addDescription(passwordField, passwordChecklist.id);

        const updatePasswordChecklist = () => {
            checkPassword(passwordField.value).forEach((isMet, index) => {
                criteriaItems[index].textContent = `${criteriaLabels[index]} — ${isMet ? "met" : "missing"}`;
                criteriaItems[index].classList.toggle("text-success", isMet);
                criteriaItems[index].classList.toggle("text-muted", !isMet);
            });
        };
        passwordField.addEventListener("input", updatePasswordChecklist);
        updatePasswordChecklist();
    }

    const passwordToggles = [passwordField, confirmationField].filter(Boolean).map(addPasswordToggle);

    function validateField(field) {
        if (field === firstNameField || field === lastNameField) {
            const name = field.value.trim();
            if (name.length < 2 || name.length > 50) return "Enter 2 to 50 characters.";
            return "";
        }
        if (field === emailField) return isValidAuthEmail(field.value) ? "" : "Enter a valid email address.";
        if (field === passwordField) {
            if (!registration) return field.value.length > 0 ? "" : "Enter your password.";
            const rules = checkPassword(field.value);
            return rules.every(Boolean) ? "" : "Meet all five password requirements shown below.";
        }
        if (field === confirmationField) return field.value === passwordField.value && field.value.length > 0 ? "" : "Enter the same password again.";
        if (field === termsField) return field.checked ? "" : "Agree to the terms before continuing.";
        return "";
    }

    let attemptedSubmit = false;
    fields.forEach((field) => {
        const updateField = () => {
            if (!attemptedSubmit) return;
            const error = validateField(field);
            if (error) showFieldError(field, error);
            else setFieldValid(field);
            if (field === passwordField && confirmationField && confirmationField.value !== "") {
                const confirmationError = validateField(confirmationField);
                if (confirmationError) showFieldError(confirmationField, confirmationError);
                else setFieldValid(confirmationField);
            }
            if (!form.querySelector(".is-invalid")) hideAuthMessage(errorMessage);
        };
        field.addEventListener("input", updateField);
        field.addEventListener("change", updateField);
    });

    form.addEventListener("submit", (submission) => {
        submission.preventDefault();
        attemptedSubmit = true;
        fields.forEach(clearFieldError);
        hideAuthMessage(errorMessage);
        hideAuthMessage(successMessage);

        const invalidFields = fields.filter((field) => {
            const error = validateField(field);
            if (error) showFieldError(field, error);
            else setFieldValid(field);
            return error !== "";
        });

        if (invalidFields.length > 0) {
            errorMessage.textContent = "Please correct the fields marked below.";
            revealAuthMessage(errorMessage);
            invalidFields[0].focus();
            return;
        }

        form.reset();
        fields.forEach((field) => {
            field.classList.remove("is-valid", "is-invalid");
            field.removeAttribute("aria-invalid");
            field.removeAttribute("aria-describedby");
        });
        [passwordField, confirmationField].filter(Boolean).forEach((field, index) => {
            field.type = "password";
            passwordToggles[index].textContent = "Show password";
            passwordToggles[index].setAttribute("aria-pressed", "false");
        });
        if (passwordChecklist) {
            passwordChecklist.querySelectorAll("li").forEach((item) => {
                item.textContent = `${item.dataset.criterion} — missing`;
                item.classList.remove("text-success");
                item.classList.add("text-muted");
            });
            addDescription(passwordField, passwordChecklist.id);
        }

        successMessage.textContent = registration
            ? "The registration form passed local checks. No account was created, and your details and password were not sent or saved."
            : "The sign-in form passed local checks. No account was authenticated, and your credentials were not sent or saved.";
        revealAuthMessage(successMessage);
    });
}

function initializeSocialSignInNotice() {
    const socialLinks = [...document.querySelectorAll('a[aria-label^="Sign in with"]')];
    if (socialLinks.length === 0) return;

    const notice = makeAuthMessage("alert alert-info", "status");
    const socialGroup = socialLinks[0].parentElement;
    socialGroup.insertAdjacentElement("afterend", notice);
    socialLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            notice.textContent = `${link.getAttribute("aria-label")} is not connected in this front-end demo. No account service was contacted.`;
            revealAuthMessage(notice);
        });
    });
}

initializeAuthForm(document.getElementById("password")?.form, "registration");
initializeAuthForm(document.getElementById("login-password")?.form, "login");
initializeSocialSignInNotice();
