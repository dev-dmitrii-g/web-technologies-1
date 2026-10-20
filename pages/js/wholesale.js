"use strict";

const wholesaleGuides = [
    { id: "cafe-coffee", service: "coffee", businessType: "cafe", focus: "Coffee supply for a cafe", nextSteps: ["Expected monthly volume", "Current espresso or filter setup", "Preferred coffee styles"] },
    { id: "office-coffee", service: "coffee", businessType: "office", focus: "Coffee supply for an office", nextSteps: ["Expected monthly volume", "Number of people using the coffee setup", "Available preparation equipment"] },
    { id: "other-coffee", service: "coffee", businessType: "other-business", focus: "Coffee supply for another business", nextSteps: ["Expected monthly volume", "How the coffee will be used", "Available preparation equipment"] },
    { id: "cafe-equipment", service: "equipment", businessType: "cafe", focus: "Equipment needs for a cafe", nextSteps: ["Current equipment", "Menu and expected use", "Installation or maintenance questions"] },
    { id: "office-equipment", service: "equipment", businessType: "office", focus: "Equipment needs for an office", nextSteps: ["Number of daily users", "Available counter space", "Preferred preparation method"] },
    { id: "other-equipment", service: "equipment", businessType: "other-business", focus: "Equipment needs for another business", nextSteps: ["Current equipment", "Intended use", "Space or setup requirements"] },
    { id: "cafe-training", service: "training", businessType: "cafe", focus: "Coffee training for cafe staff", nextSteps: ["Number of participants", "Experience level", "Preferred training dates"] },
    { id: "office-training", service: "training", businessType: "office", focus: "Coffee training for an office team", nextSteps: ["Number of participants", "Training goals", "Preferred training dates"] },
    { id: "other-training", service: "training", businessType: "other-business", focus: "Coffee training for a business group", nextSteps: ["Number of participants", "Experience level", "Preferred training dates"] },
    { id: "cafe-partnership", service: "partnership", businessType: "cafe", focus: "A partnership with a cafe", nextSteps: ["Project goals", "Intended customer group", "The cooperation you have in mind"] },
    { id: "office-partnership", service: "partnership", businessType: "office", focus: "A partnership with an office or workplace", nextSteps: ["Project goals", "People or teams involved", "The cooperation you have in mind"] },
    { id: "other-partnership", service: "partnership", businessType: "other-business", focus: "A custom business partnership", nextSteps: ["Project goals", "Potential audience or partners", "The cooperation you have in mind"] }
];

function findWholesaleGuide(service, businessType) {
    return wholesaleGuides.find((guide) => guide.service === service && guide.businessType === businessType) || null;
}

function getWholesaleReference() {
    return `TC-B2B-${Math.floor(Math.random() * 90000) + 10000}`;
}

function getDaysUntilContact(requestedDate) {
    const [year, month, day] = requestedDate.split("-").map(Number);
    const requested = Date.UTC(year, month - 1, day);
    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.round((requested - todayUtc) / 86400000);
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

function initializeWholesaleEnquiry() {
    const form = document.getElementById("wholesale-enquiry-form");
    if (!form) return;

    const companyField = document.getElementById("company");
    const contactField = document.getElementById("contact-name");
    const emailField = document.getElementById("business-email");
    const phoneField = document.getElementById("business-phone");
    const volumeField = document.getElementById("volume");
    const dateField = document.getElementById("preferred-date");
    const serviceField = document.getElementById("service");
    const messageField = document.getElementById("business-message");
    const businessTypeFields = [...form.querySelectorAll('input[name="business-type"]')];
    const result = document.getElementById("wholesale-enquiry-form-result");
    const error = document.getElementById("wholesale-enquiry-form-error");
    animatePageSections();
    prepareAnimatedMessages(result, error);
    const fieldsToValidate = [companyField, contactField, emailField, phoneField, volumeField, dateField, serviceField, messageField, ...businessTypeFields];

    function clearFieldError(field) {
        field.classList.remove("is-invalid");
        const feedback = field.parentElement.querySelector(`[data-error-for="${field.id}"]`);
        if (feedback) feedback.remove();
    }

    function showFieldError(field, message) {
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

    function clearAllErrors() {
        fieldsToValidate.forEach(clearFieldError);
    }

    fieldsToValidate.forEach((field) => {
        field.addEventListener("input", () => clearFieldError(field));
        field.addEventListener("change", () => clearFieldError(field));
    });

    const earliestDate = new Date();
    earliestDate.setDate(earliestDate.getDate() + 1);
    const earliestDateValue = `${earliestDate.getFullYear()}-${String(earliestDate.getMonth() + 1).padStart(2, "0")}-${String(earliestDate.getDate()).padStart(2, "0")}`;
    dateField.min = earliestDateValue;

    form.addEventListener("submit", (submission) => {
        submission.preventDefault();
        clearAllErrors();
        hideAnimatedMessage(result);
        hideAnimatedMessage(error);

        const selectedBusinessType = businessTypeFields.find((field) => field.checked)?.value || "";
        const selectedGuide = findWholesaleGuide(serviceField.value, selectedBusinessType);
        const errors = [];

        if (companyField.value.trim().length < 2) errors.push([companyField, "Enter a company or organisation name."]);
        if (contactField.value.trim().length < 2) errors.push([contactField, "Enter a contact name with at least 2 characters."]);
        if (!emailField.validity.valid || emailField.value.trim() === "") errors.push([emailField, "Enter a valid business email."]);
        if (!/^\+?[0-9 ()-]{7,20}$/.test(phoneField.value.trim())) errors.push([phoneField, "Enter a valid phone number with 7 to 20 digits or phone characters."]);
        if (!Number.isInteger(Number(volumeField.value)) || Number(volumeField.value) < 1) errors.push([volumeField, "Enter a whole expected volume greater than zero."]);
        if (!dateField.value || dateField.value < dateField.min) errors.push([dateField, "Choose a preferred contact date starting from tomorrow."]);
        if (messageField.value.trim().length < 20) errors.push([messageField, "Describe your business requirements in at least 20 characters."]);
        if (!selectedGuide) errors.push([serviceField, "Choose a service and business type to prepare a relevant enquiry summary."]);

        if (errors.length > 0) {
            errors.forEach(([field, message]) => showFieldError(field, message));
            error.textContent = "Please correct the fields marked below.";
            showAnimatedMessage(error);
            errors[0][0].focus();
            return;
        }

        const selectedService = serviceField.options[serviceField.selectedIndex].textContent.trim();
        const selectedBusinessLabel = businessTypeFields.find((field) => field.checked).labels[0].textContent.trim();
        const daysUntilContact = getDaysUntilContact(dateField.value);
        const followUp = selectedGuide.nextSteps.join(", ");

        result.textContent = `Demo enquiry ${getWholesaleReference()} for ${companyField.value.trim()} (${selectedBusinessLabel}). Service: ${selectedService}. Expected coffee volume: ${volumeField.value}. Preferred contact date: ${dateField.value} (${daysUntilContact} days from today). The Tokyo Coffee team can review details about ${selectedGuide.focus.toLowerCase()}, including ${followUp}. This is a local preview only: no data was sent and no wholesale prices or agreement have been confirmed.`;
        showAnimatedMessage(result);
    });

    form.addEventListener("reset", () => {
        clearAllErrors();
        hideAnimatedMessage(result);
        hideAnimatedMessage(error);
    });
}

initializeWholesaleEnquiry();
