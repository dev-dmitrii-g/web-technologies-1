'use strict';

const SUBSCRIPTION_PLANS = [
    { id: 'explorer', name: 'Explorer', coffee: '1 × 250 g bag', price: 6500, bestFor: 'Occasional home brewers', frequencies: ['two-weeks', 'four-weeks'] },
    { id: 'daily-brew', name: 'Daily Brew', coffee: '2 × 250 g bags', price: 11500, bestFor: 'Regular coffee drinkers', frequencies: ['two-weeks', 'four-weeks'] },
    { id: 'coffee-lover', name: 'Coffee Lover', coffee: '2 × 500 g bags', price: 19500, bestFor: 'Frequent home brewing', frequencies: ['two-weeks', 'four-weeks'] },
    { id: 'roasters-choice', name: "Roaster's Choice", coffee: 'Rotating premium coffee', price: 14000, bestFor: 'Discovering new origins', frequencies: ['two-weeks'] }
];

const DELIVERY_FREQUENCIES = [
    { id: 'two-weeks', label: 'Every 2 weeks', weeks: 2 },
    { id: 'four-weeks', label: 'Every 4 weeks', weeks: 4 }
];

const BILLING_PERIOD_WEEKS = 4;

const subscriptionForm = document.getElementById('subscription-form');
const planTable = document.querySelector('main table');
const planTableBody = planTable.querySelector('tbody');
const subscriptionConfirmation = document.getElementById('subscription-confirmation');
const subscriptionError = document.getElementById('subscription-error');

const subscriberName = document.getElementById('subscriber-name');
const subscriberEmail = document.getElementById('subscriber-email');
const subscriberPhone = document.getElementById('subscriber-phone');
const deliveryAddress = document.getElementById('delivery-address');

const radioGroups = {
    plan: document.getElementById('explorer').closest('fieldset'),
    roast: document.getElementById('light-roast').closest('fieldset'),
    grind: document.getElementById('whole-bean').closest('fieldset'),
    frequency: document.getElementById('two-weeks').closest('fieldset')
};

const budgetInput = makeElement('input', 'form-control');
const planCount = makeElement('p', 'font-monospace fw-bold mb-3');
const liveSummary = makeElement('div', 'border rounded p-3 mb-4');
const liveSummaryBody = makeElement('div');

function findPlan(planId) {
    return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || null;
}

function findFrequency(frequencyId) {
    return DELIVERY_FREQUENCIES.find((frequency) => frequency.id === frequencyId) || null;
}

function getCheckedValue(groupName) {
    const checked = subscriptionForm.querySelector(`input[name="${groupName}"]:checked`);
    return checked === null ? '' : checked.value;
}

function getCheckedLabel(groupName) {
    const checked = subscriptionForm.querySelector(`input[name="${groupName}"]:checked`);
    if (checked === null) {
        return '';
    }
    return subscriptionForm.querySelector(`label[for="${checked.id}"]`).textContent.trim();
}

function getDeliveriesPerPeriod(frequency) {
    return BILLING_PERIOD_WEEKS / frequency.weeks;
}

function calculatePeriodCost(plan, frequency) {
    return plan.price * getDeliveriesPerPeriod(frequency);
}

function describePlanDelivery(plan) {
    const weeks = plan.frequencies.map((id) => findFrequency(id).weeks);
    return `Every ${weeks.join(' or ')} weeks`;
}

function readBudget() {
    const value = budgetInput.value.trim();
    const budget = Number(value);
    if (value === '' || !Number.isFinite(budget) || budget < 0) {
        return null;
    }
    return budget;
}

function filterPlansByBudget(plans, budget) {
    if (budget === null) {
        return plans;
    }
    return plans.filter((plan) => plan.price <= budget);
}

function selectPlan(planId) {
    const radio = document.getElementById(planId);
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));
    radio.focus();
}

function renderPlanRow(plan, selectedPlanId) {
    const row = makeElement('tr');
    const nameCell = makeElement('th');
    const chooseButton = makeElement('button', 'btn btn-sm btn-outline-primary mt-1', 'Choose');

    nameCell.scope = 'row';
    chooseButton.type = 'button';
    chooseButton.setAttribute('aria-label', `Choose the ${plan.name} plan`);
    chooseButton.addEventListener('click', () => selectPlan(plan.id));
    nameCell.append(makeElement('div', '', plan.name), chooseButton);

    if (plan.id === selectedPlanId) {
        row.classList.add('table-active');
        row.setAttribute('aria-current', 'true');
        chooseButton.textContent = 'Selected';
    }

    row.append(
        nameCell,
        makeElement('td', '', plan.coffee),
        makeElement('td', '', describePlanDelivery(plan)),
        makeElement('td', '', `${formatKzt(plan.price)} per delivery`),
        makeElement('td', '', plan.bestFor)
    );
    return row;
}

function renderEmptyPlanRow() {
    const row = makeElement('tr');
    const cell = makeElement('td', 'text-center py-4');
    const resetButton = makeElement('button', 'btn btn-sm btn-primary ms-2', 'Show all plans');
    cell.colSpan = 5;
    resetButton.type = 'button';
    resetButton.addEventListener('click', resetBudgetFilter);
    const lowestPrice = Math.min(...SUBSCRIPTION_PLANS.map((plan) => plan.price));
    cell.append(makeElement('span', '', `No plan fits this budget. Plans start from ${formatKzt(lowestPrice)} per delivery.`), resetButton);
    row.append(cell);
    return row;
}

function renderPlans() {
    const budget = readBudget();
    const visiblePlans = filterPlansByBudget(SUBSCRIPTION_PLANS, budget);
    const selectedPlanId = getCheckedValue('plan');

    if (visiblePlans.length === 0) {
        planTableBody.replaceChildren(renderEmptyPlanRow());
    } else {
        planTableBody.replaceChildren(...visiblePlans.map((plan) => renderPlanRow(plan, selectedPlanId)));
    }

    const budgetText = budget === null ? '' : ` up to ${formatKzt(budget)} per delivery`;
    planCount.textContent = `Showing ${visiblePlans.length} of ${SUBSCRIPTION_PLANS.length} plans${budgetText}.`;
}

function resetBudgetFilter() {
    budgetInput.value = '';
    renderPlans();
    budgetInput.focus();
}

function validateFrequency() {
    const frequencyId = getCheckedValue('frequency');
    const plan = findPlan(getCheckedValue('plan'));
    if (frequencyId === '') {
        return 'Choose a delivery frequency.';
    }
    if (plan !== null && !plan.frequencies.includes(frequencyId)) {
        return `${plan.name} is delivered ${describePlanDelivery(plan).toLowerCase()} only. Choose that frequency or another plan.`;
    }
    return '';
}

function validateEmail(value) {
    const email = value.trim();
    if (email === '') {
        return 'Enter your email address.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return 'Enter a valid email address, for example name@example.com.';
    }
    return '';
}

function validateAddress(value) {
    const address = value.trim();
    if (address === '') {
        return 'Enter your delivery address.';
    }
    if (address.length < 10 || !/\d/.test(address)) {
        return 'Enter the street and building number, for example Kabanbay Batyr Ave 15, apt 12.';
    }
    return '';
}

const subscriptionValidators = [
    { control: radioGroups.plan, focusTarget: document.getElementById('explorer'), validate: () => (getCheckedValue('plan') === '' ? 'Choose a subscription plan.' : '') },
    { control: radioGroups.roast, focusTarget: document.getElementById('light-roast'), validate: () => (getCheckedValue('roast') === '' ? 'Choose a roast preference.' : '') },
    { control: radioGroups.grind, focusTarget: document.getElementById('whole-bean'), validate: () => (getCheckedValue('grind') === '' ? 'Choose a grind preference.' : '') },
    { control: radioGroups.frequency, focusTarget: document.getElementById('two-weeks'), validate: validateFrequency },
    { control: subscriberName, focusTarget: subscriberName, validate: () => validateFullName(subscriberName.value) },
    { control: subscriberEmail, focusTarget: subscriberEmail, validate: () => validateEmail(subscriberEmail.value) },
    { control: subscriberPhone, focusTarget: subscriberPhone, validate: () => validatePhone(subscriberPhone.value) },
    { control: deliveryAddress, focusTarget: deliveryAddress, validate: () => validateAddress(deliveryAddress.value) }
];

function buildSummaryLines() {
    const plan = findPlan(getCheckedValue('plan'));
    const frequency = findFrequency(getCheckedValue('frequency'));
    const lines = [];

    if (plan === null) {
        return lines;
    }
    lines.push(`Plan: ${plan.name} (${plan.coffee})`);
    lines.push(`Roast: ${getCheckedLabel('roast') || 'not selected yet'}`);
    lines.push(`Grind: ${getCheckedLabel('grind') || 'not selected yet'}`);
    lines.push(`Price per delivery: ${formatKzt(plan.price)}`);

    if (frequency === null) {
        lines.push('Delivery: choose a frequency to see the total.');
    } else if (!plan.frequencies.includes(frequency.id)) {
        lines.push(`Delivery: ${plan.name} is available ${describePlanDelivery(plan).toLowerCase()} only.`);
    } else {
        const deliveries = getDeliveriesPerPeriod(frequency);
        lines.push(`Delivery: ${frequency.label.toLowerCase()}`);
        lines.push(`Every ${BILLING_PERIOD_WEEKS} weeks: ${deliveries} × ${formatKzt(plan.price)} = ${formatKzt(calculatePeriodCost(plan, frequency))}`);
    }
    return lines;
}

function updateLiveSummary() {
    const lines = buildSummaryLines();
    if (lines.length === 0) {
        liveSummaryBody.replaceChildren(makeElement('p', 'mb-0', 'Choose a plan to see the price and your selections here.'));
        return;
    }
    const list = makeElement('ul', 'mb-0');
    lines.forEach((line) => list.append(makeElement('li', '', line)));
    liveSummaryBody.replaceChildren(list);
}

function showSuccessSummary(details) {
    const list = makeElement('ul', 'mb-3');
    const closeButton = makeElement('button', 'btn btn-primary', 'Close summary');

    details.lines.forEach((line) => list.append(makeElement('li', '', line)));
    [`Name: ${details.name}`, `Email: ${details.email}`, `Phone: ${details.phone}`, `Address: ${details.address}`]
        .forEach((line) => list.append(makeElement('li', '', line)));

    closeButton.type = 'button';
    closeButton.addEventListener('click', () => {
        subscriptionConfirmation.classList.add('d-none');
        document.getElementById('explorer').focus();
    });

    subscriptionConfirmation.replaceChildren(
        makeElement('h3', 'h4', 'Demo subscription request ready'),
        makeElement('p', 'font-monospace mb-2', `Demo reference: ${details.reference}`),
        list,
        makeElement('p', 'fw-bold', 'This is a front-end demonstration: no data was sent to a server, no subscription was created and no payment was taken.'),
        closeButton
    );
    subscriptionError.classList.add('d-none');
    subscriptionConfirmation.classList.remove('d-none');
    subscriptionConfirmation.focus();
}

function handleSubscriptionSubmit(event) {
    event.preventDefault();

    const invalid = subscriptionValidators.filter((validator) => !applyValidation(validator.control, validator.validate()));
    if (invalid.length !== 0) {
        subscriptionConfirmation.classList.add('d-none');
        subscriptionError.classList.remove('d-none');
        invalid[0].focusTarget.focus();
        return;
    }

    const details = {
        reference: createReference('SUB'),
        lines: buildSummaryLines(),
        name: subscriberName.value.trim(),
        email: subscriberEmail.value.trim(),
        phone: subscriberPhone.value.trim(),
        address: deliveryAddress.value.trim()
    };

    subscriptionForm.reset();
    showSuccessSummary(details);
}

function handleSubscriptionReset() {
    subscriptionValidators.forEach((validator) => clearFieldState(validator.control));
    subscriptionConfirmation.classList.add('d-none');
    subscriptionError.classList.add('d-none');

    // Radio buttons are unchecked only after the reset event finishes.
    setTimeout(() => {
        updateLiveSummary();
        renderPlans();
    }, 0);
}

function buildBudgetFilter() {
    const wrapper = makeElement('div', 'row g-2 align-items-end mb-3');
    const inputColumn = makeElement('div', 'col-12 col-md-6');
    const buttonColumn = makeElement('div', 'col-12 col-md-3');
    const label = makeElement('label', 'form-label', 'Maximum price per delivery (KZT)');
    const resetButton = makeElement('button', 'btn btn-outline-primary w-100 justify-content-center', 'Reset filter');

    budgetInput.id = 'plan-budget';
    budgetInput.type = 'number';
    budgetInput.min = '0';
    budgetInput.step = '500';
    budgetInput.placeholder = 'Any budget';
    label.htmlFor = budgetInput.id;
    resetButton.type = 'button';
    resetButton.addEventListener('click', resetBudgetFilter);
    budgetInput.addEventListener('input', renderPlans);

    inputColumn.append(label, budgetInput);
    buttonColumn.append(resetButton);
    wrapper.append(inputColumn, buttonColumn);
    return wrapper;
}

function initSubscriptionsPage() {
    subscriptionForm.noValidate = true;

    radioGroups.plan.id = 'plan-group';
    radioGroups.roast.id = 'roast-group';
    radioGroups.grind.id = 'grind-group';
    radioGroups.frequency.id = 'frequency-group';

    planCount.setAttribute('role', 'status');
    planTable.closest('.table-responsive').before(buildBudgetFilter(), planCount);

    liveSummary.setAttribute('aria-live', 'polite');
    liveSummary.append(makeElement('h3', 'h5', 'Your Subscription Summary'), liveSummaryBody);
    radioGroups.frequency.after(liveSummary);

    subscriberPhone.placeholder = '+7 701 234 56 78';
    subscriptionConfirmation.tabIndex = -1;

    subscriptionForm.addEventListener('change', (event) => {
        if (event.target.type !== 'radio') {
            return;
        }
        updateLiveSummary();
        renderPlans();
        subscriptionValidators.forEach((validator) => {
            const isRadioGroup = validator.control.tagName === 'FIELDSET';
            if (isRadioGroup && hasFieldError(validator.control)) {
                applyValidation(validator.control, validator.validate());
            }
        });
        if ((event.target.name === 'plan' || event.target.name === 'frequency') && getCheckedValue('frequency') !== '') {
            applyValidation(radioGroups.frequency, validateFrequency());
        }
    });

    [subscriberName, subscriberEmail, subscriberPhone, deliveryAddress].forEach((input) => {
        input.addEventListener('input', () => {
            if (hasFieldError(input)) {
                const validator = subscriptionValidators.find((entry) => entry.control === input);
                applyValidation(input, validator.validate());
            }
        });
    });

    subscriptionForm.addEventListener('submit', handleSubscriptionSubmit);
    subscriptionForm.addEventListener('reset', handleSubscriptionReset);

    renderPlans();
    updateLiveSummary();
}

initSubscriptionsPage();
