"use strict";

const brewRecipes = [
    { id: "v60-15g", method: "v60", methodName: "V60", coffeeGrams: 15, exampleWaterGrams: 250, ratioMin: 16, ratioMax: 17, grind: "Medium", style: "pour-over" },
    { id: "v60-30g", method: "v60", methodName: "V60", coffeeGrams: 30, exampleWaterGrams: 500, ratioMin: 16, ratioMax: 17, grind: "Medium", style: "pour-over" },
    { id: "press-20g", method: "french-press", methodName: "French Press", coffeeGrams: 20, exampleWaterGrams: 300, ratioMin: 15, ratioMax: 15, grind: "Coarse", style: "immersion" },
    { id: "press-40g", method: "french-press", methodName: "French Press", coffeeGrams: 40, exampleWaterGrams: 600, ratioMin: 15, ratioMax: 15, grind: "Coarse", style: "immersion" },
    { id: "aeropress-15g", method: "aeropress", methodName: "AeroPress", coffeeGrams: 15, exampleWaterGrams: 225, ratioMin: 15, ratioMax: 15, grind: "Medium-fine", style: "immersion / pressure" },
    { id: "aeropress-30g", method: "aeropress", methodName: "AeroPress", coffeeGrams: 30, exampleWaterGrams: 450, ratioMin: 15, ratioMax: 15, grind: "Medium-fine", style: "immersion / pressure" }
];

function findBrewRecipe(method) {
    return brewRecipes.find((recipe) => recipe.method === method) || null;
}

function calculateWaterRange(method, coffeeGrams) {
    const recipe = findBrewRecipe(method);
    if (!recipe || !Number.isFinite(coffeeGrams) || coffeeGrams <= 0) return null;

    return {
        methodName: recipe.methodName,
        minimumWater: Math.round(coffeeGrams * recipe.ratioMin),
        maximumWater: Math.round(coffeeGrams * recipe.ratioMax),
        ratioMin: recipe.ratioMin,
        ratioMax: recipe.ratioMax,
        grind: recipe.grind,
        example: `${recipe.coffeeGrams} g coffee to ${recipe.exampleWaterGrams} g water`
    };
}

function createBrewingReference() {
    return `TC-BREW-${Math.floor(Math.random() * 90000) + 10000}`;
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

function initializeBrewingGuides() {
    const form = document.getElementById("brewing-question-form");
    if (!form) return;

    const nameField = document.getElementById("visitor-name");
    const emailField = document.getElementById("visitor-email");
    const phoneField = document.getElementById("visitor-phone");
    const dateField = document.getElementById("brew-date");
    const methodField = document.getElementById("brewing-method");
    const coffeeField = document.getElementById("coffee-amount");
    const adjustmentFields = [...form.querySelectorAll('input[name="adjustment"]')];
    const questionField = document.getElementById("brewing-question");
    const permissionField = document.getElementById("permission");
    const saveDraftButton = form.querySelector('button.btn-success[type="button"]');
    const result = document.getElementById("brewing-question-form-result");
    const error = document.getElementById("brewing-question-form-error");
    animatePageSections();
    prepareAnimatedMessages(result, error);
    const fieldsToValidate = [nameField, emailField, phoneField, dateField, methodField, coffeeField, ...adjustmentFields, questionField, permissionField];

    const calculatorOutput = document.createElement("div");
    calculatorOutput.className = "alert alert-info mt-3";
    calculatorOutput.setAttribute("role", "status");
    calculatorOutput.setAttribute("aria-live", "polite");
    const estimateText = document.createElement("p");
    estimateText.className = "mb-0";
    estimateText.textContent = "Choose a brewing method and enter your coffee amount to estimate the water needed.";
    const draftStatus = document.createElement("p");
    draftStatus.className = "small mt-2 mb-0 d-none";
    calculatorOutput.append(estimateText, draftStatus);
    coffeeField.parentElement.insertAdjacentElement("afterend", calculatorOutput);

    const restoreDraftButton = document.createElement("button");
    restoreDraftButton.type = "button";
    restoreDraftButton.className = "btn btn-outline-primary d-none";
    restoreDraftButton.textContent = "Restore Draft";
    saveDraftButton.insertAdjacentElement("afterend", restoreDraftButton);

    let brewingDraft = null;

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

    function renderWaterEstimate() {
        const coffeeGrams = Number(coffeeField.value);
        if (!methodField.value || !coffeeField.value) {
            estimateText.textContent = "Choose a brewing method and enter your coffee amount to estimate the water needed.";
            return;
        }

        if (!Number.isFinite(coffeeGrams) || coffeeGrams <= 0) {
            estimateText.textContent = "Enter a coffee amount greater than zero grams.";
            return;
        }

        const estimate = calculateWaterRange(methodField.value, coffeeGrams);
        if (!estimate) {
            estimateText.textContent = "The page lists starting ratios for V60, French Press and AeroPress. For another method, use the question form to describe your recipe.";
            return;
        }

        const waterText = estimate.minimumWater === estimate.maximumWater
            ? `${estimate.minimumWater} g`
            : `${estimate.minimumWater}–${estimate.maximumWater} g`;
        estimateText.textContent = `${estimate.methodName}: start with about ${waterText} water for ${coffeeGrams} g coffee (ratio 1:${estimate.ratioMin}${estimate.ratioMin === estimate.ratioMax ? "" : `–${estimate.ratioMax}`}). Grind: ${estimate.grind}. The page's example is ${estimate.example}. These are starting points; adjust to taste.`;
    }

    fieldsToValidate.forEach((field) => {
        field.addEventListener("input", () => {
            clearFieldError(field);
            if (field === coffeeField) renderWaterEstimate();
        });
        field.addEventListener("change", () => {
            clearFieldError(field);
            if (field === methodField || field === coffeeField) renderWaterEstimate();
        });
    });

    saveDraftButton.addEventListener("click", () => {
        brewingDraft = {
            name: nameField.value.trim(),
            email: emailField.value.trim(),
            phone: phoneField.value.trim(),
            brewDate: dateField.value,
            method: methodField.value,
            coffeeGrams: coffeeField.value,
            adjustment: adjustmentFields.find((field) => field.checked)?.value || "",
            question: questionField.value.trim(),
            permission: permissionField.checked
        };
        const methodName = methodField.options[methodField.selectedIndex].textContent.trim();
        draftStatus.textContent = `Draft kept temporarily in this page for ${methodName}${coffeeField.value ? ` with ${coffeeField.value} g coffee` : ""}. It will be cleared when you leave or reload this page.`;
        draftStatus.classList.remove("d-none");
        restoreDraftButton.classList.remove("d-none");
    });

    restoreDraftButton.addEventListener("click", () => {
        if (!brewingDraft) return;
        clearAllErrors();
        nameField.value = brewingDraft.name;
        emailField.value = brewingDraft.email;
        phoneField.value = brewingDraft.phone;
        dateField.value = brewingDraft.brewDate;
        methodField.value = brewingDraft.method;
        coffeeField.value = brewingDraft.coffeeGrams;
        adjustmentFields.forEach((field) => {
            field.checked = field.value === brewingDraft.adjustment;
        });
        questionField.value = brewingDraft.question;
        permissionField.checked = brewingDraft.permission;
        renderWaterEstimate();
        draftStatus.textContent = "Your temporary draft has been restored. You can continue editing it.";
    });

    form.addEventListener("submit", (submission) => {
        submission.preventDefault();
        clearAllErrors();
        hideAnimatedMessage(result);
        hideAnimatedMessage(error);

        const coffeeGrams = Number(coffeeField.value);
        const selectedAdjustment = adjustmentFields.find((field) => field.checked);
        const errors = [];
        const today = new Date();
        const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        if (nameField.value.trim().length < 2) errors.push([nameField, "Enter a name with at least 2 characters."]);
        if (!emailField.validity.valid || emailField.value.trim() === "") errors.push([emailField, "Enter a valid email address."]);
        if (!/^\+?[0-9 ()-]{7,20}$/.test(phoneField.value.trim())) errors.push([phoneField, "Enter a valid phone number with 7 to 20 digits or phone characters."]);
        if (!dateField.value || dateField.value > todayValue) errors.push([dateField, "Enter today or an earlier date for the brewing attempt."]);
        if (!Number.isFinite(coffeeGrams) || coffeeGrams <= 0) errors.push([coffeeField, "Enter a coffee amount greater than zero grams."]);
        if (!selectedAdjustment) errors.push([adjustmentFields[0], "Choose which brewing variable you want to adjust."]);
        if (questionField.value.trim().length < 15) errors.push([questionField, "Describe your brewing question in at least 15 characters."]);
        if (!permissionField.checked) errors.push([permissionField, "Confirm that Tokyo Coffee may contact you about this question."]);

        if (errors.length > 0) {
            errors.forEach(([field, message]) => showFieldError(field, message));
            error.textContent = "Please correct the fields marked below.";
            showAnimatedMessage(error);
            errors[0][0].focus();
            return;
        }

        const methodName = methodField.options[methodField.selectedIndex].textContent.trim();
        const adjustmentName = selectedAdjustment.labels[0].textContent.trim();
        const estimate = calculateWaterRange(methodField.value, coffeeGrams);
        const waterSummary = estimate ? ` Calculated starting water amount: ${estimate.minimumWater}${estimate.minimumWater === estimate.maximumWater ? "" : `–${estimate.maximumWater}`} g.` : " No water ratio is listed on this page for that method.";
        result.textContent = `Demo question ${createBrewingReference()}: ${methodName}, ${coffeeGrams} g coffee, brewed on ${dateField.value}; you want to adjust ${adjustmentName}.${waterSummary} This is a local preview only: no data was sent to a server and no real support request was created.`;
        showAnimatedMessage(result);
    });

    form.addEventListener("reset", () => {
        clearAllErrors();
        hideAnimatedMessage(result);
        hideAnimatedMessage(error);
        brewingDraft = null;
        restoreDraftButton.classList.add("d-none");
        draftStatus.textContent = "";
        draftStatus.classList.add("d-none");
        estimateText.textContent = "Choose a brewing method and enter your coffee amount to estimate the water needed.";
    });
}

initializeBrewingGuides();
