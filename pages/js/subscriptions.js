'use strict';

$(function () {
    const SUBSCRIPTION_PLANS = [
        { id: 'explorer', name: 'Explorer', coffee: '1 × 250 g bag', grams: 250, price: 6500, bestFor: 'Occasional home brewers', frequencies: ['two-weeks', 'four-weeks'] },
        { id: 'daily-brew', name: 'Daily Brew', coffee: '2 × 250 g bags', grams: 500, price: 11500, bestFor: 'Regular coffee drinkers', frequencies: ['two-weeks', 'four-weeks'] },
        { id: 'coffee-lover', name: 'Coffee Lover', coffee: '2 × 500 g bags', grams: 1000, price: 19500, bestFor: 'Frequent home brewing', frequencies: ['two-weeks', 'four-weeks'] },
        { id: 'roasters-choice', name: "Roaster's Choice", coffee: 'Rotating premium coffee', grams: null, price: 14000, bestFor: 'Discovering new origins', frequencies: ['two-weeks'] }
    ];

    const DELIVERY_FREQUENCIES = [
        { id: 'two-weeks', label: 'Every 2 weeks', weeks: 2 },
        { id: 'four-weeks', label: 'Every 4 weeks', weeks: 4 }
    ];

    const BILLING_PERIOD_WEEKS = 4;

    // A 250 ml cup at the 1:16 ratio from brewing-guides.html needs about 15 g of coffee.
    // Roaster's Choice has no published amount (grams: null), so it is not recommended.
    const GRAMS_PER_CUP = 15;
    const MAX_CUPS_PER_DAY = 10;

    const SELECTION_EVENT = 'subscription:selectionChanged';

    const $subscriptionForm = $('#subscription-form');
    const $planTable = $('main table');

    if ($subscriptionForm.length === 0 || $planTable.length === 0) {
        return;
    }

    const $planTableBody = $planTable.find('tbody');
    const $subscriptionConfirmation = $('#subscription-confirmation');
    const $subscriptionError = $('#subscription-error');

    const $subscriberName = $('#subscriber-name');
    const $subscriberEmail = $('#subscriber-email');
    const $subscriberPhone = $('#subscriber-phone');
    const $deliveryAddress = $('#delivery-address');

    const radioGroups = {
        plan: $('#explorer').closest('fieldset'),
        roast: $('#light-roast').closest('fieldset'),
        grind: $('#whole-bean').closest('fieldset'),
        frequency: $('#two-weeks').closest('fieldset')
    };

    const $budgetInput = makeElement('input', 'form-control');
    const $planCount = makeElement('p', 'font-monospace fw-bold mb-3');
    const $liveSummary = makeElement('div', 'border rounded p-3 mb-4');
    const $liveSummaryBody = makeElement('div');
    const $cupsInput = makeElement('input', 'form-control');
    const $recommendation = makeElement('div', 'alert alert-info d-none mb-0');

    function findPlan(planId) {
        return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || null;
    }

    function findFrequency(frequencyId) {
        return DELIVERY_FREQUENCIES.find((frequency) => frequency.id === frequencyId) || null;
    }

    function getChecked(groupName) {
        return $subscriptionForm.find(`input[name="${groupName}"]:checked`);
    }

    function getCheckedValue(groupName) {
        const $checked = getChecked(groupName);
        return $checked.length === 0 ? '' : $checked.val();
    }

    function getCheckedLabel(groupName) {
        const $checked = getChecked(groupName);
        return $checked.length === 0 ? '' : $checked.siblings('label').text().trim();
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
        const value = String($budgetInput.val()).trim();
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

    function readCupsPerDay() {
        const value = String($cupsInput.val()).trim();
        const cups = Number(value);
        if (value === '' || !Number.isInteger(cups) || cups < 1 || cups > MAX_CUPS_PER_DAY) {
            return null;
        }
        return cups;
    }

    function getGramsPerPeriod(cupsPerDay) {
        return cupsPerDay * GRAMS_PER_CUP * BILLING_PERIOD_WEEKS * 7;
    }

    // Every plan with a known amount, at every frequency it allows, with its coffee and cost per 4 weeks.
    function getPlanOptions() {
        const options = [];
        SUBSCRIPTION_PLANS.filter((plan) => plan.grams !== null).forEach((plan) => {
            plan.frequencies.forEach((frequencyId) => {
                const frequency = findFrequency(frequencyId);
                options.push({
                    plan,
                    frequency,
                    grams: plan.grams * getDeliveriesPerPeriod(frequency),
                    cost: calculatePeriodCost(plan, frequency)
                });
            });
        });
        return options;
    }

    // The cheapest option that gives enough coffee; if none is enough, the one with the most coffee.
    function recommendPlan(gramsNeeded) {
        const options = getPlanOptions();
        const enough = options
            .filter((option) => option.grams >= gramsNeeded)
            .sort((a, b) => a.cost - b.cost || a.grams - b.grams);
        if (enough.length !== 0) {
            return { option: enough[0], isEnough: true };
        }
        const largest = options.sort((a, b) => b.grams - a.grams)[0];
        return { option: largest, isEnough: false };
    }

    function validateCups() {
        if (String($cupsInput.val()).trim() === '') {
            return 'Enter how many cups you drink a day.';
        }
        if (readCupsPerDay() === null) {
            return `Enter a whole number of cups from 1 to ${MAX_CUPS_PER_DAY}.`;
        }
        return '';
    }

    function showRecommendation() {
        if (!applyValidation($cupsInput, validateCups())) {
            $recommendation.stop(true, true).addClass('d-none');
            $cupsInput.trigger('focus');
            return;
        }

        const cups = readCupsPerDay();
        const gramsNeeded = getGramsPerPeriod(cups);
        const result = recommendPlan(gramsNeeded);
        const { plan, frequency, grams, cost } = result.option;
        const coveredCups = Math.floor(grams / getGramsPerPeriod(1));
        const $chooseButton = makeElement('button', 'btn btn-primary btn-sm', 'Choose this plan')
            .attr({ type: 'button', 'data-plan': plan.id, 'data-frequency': frequency.id });

        $recommendation.empty().append(
            makeElement('p', 'mb-1', `For ${cups} ${cups === 1 ? 'cup' : 'cups'} a day you need about ${gramsNeeded} g of coffee every ${BILLING_PERIOD_WEEKS} weeks.`),
            makeElement('p', 'fw-bold mb-1', `Best fit: ${plan.name}, ${frequency.label.toLowerCase()} — ${grams} g for ${formatKzt(cost)} every ${BILLING_PERIOD_WEEKS} weeks.`),
            makeElement('p', 'small mb-2', result.isEnough
                ? 'It is the cheapest plan that gives you enough coffee.'
                : `This is our largest plan: it covers about ${coveredCups} cups a day.`),
            $chooseButton
        );
        revealBlock($recommendation, 'fadeIn', 300);
    }

    // The frequency is ticked first, so the summary and the frequency check see both choices at once.
    function applyRecommendation(planId, frequencyId) {
        $(`#${frequencyId}`).prop('checked', true);
        selectPlan(planId);
    }

    function buildPlanFinder() {
        const $findButton = makeElement('button', 'btn btn-outline-primary w-100 justify-content-center', 'Find my plan')
            .attr('type', 'button')
            .on('click', showRecommendation);

        $cupsInput
            .attr({ id: 'cups-per-day', type: 'number', min: '1', max: String(MAX_CUPS_PER_DAY), step: '1', placeholder: 'e.g. 2' })
            .on('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    showRecommendation();
                }
            })
            .on('input', function () {
                if (hasFieldError($(this))) {
                    applyValidation($(this), validateCups());
                }
            });

        // Delegated: the "Choose this plan" button is created again with every new recommendation.
        $recommendation.attr('aria-live', 'polite').on('click', 'button[data-plan]', function () {
            applyRecommendation($(this).attr('data-plan'), $(this).attr('data-frequency'));
        });

        return makeElement('div', 'border rounded p-3 mb-4').append(
            makeElement('h3', 'h5', 'Not sure which plan fits?'),
            makeElement('p', 'small mb-2', `Tell us how many cups you drink a day. We count about ${GRAMS_PER_CUP} g of coffee per 250 ml cup, the 1:16 ratio from our Brewing Guides.`),
            makeElement('div', 'row g-2 align-items-end mb-3').append(
                makeElement('div', 'col-12 col-md-6').append(
                    makeElement('label', 'form-label', 'Cups of coffee per day').attr('for', 'cups-per-day'),
                    $cupsInput
                ),
                makeElement('div', 'col-12 col-md-3').append($findButton)
            ),
            $recommendation
        );
    }

    function selectPlan(planId) {
        $(`#${planId}`).prop('checked', true).trigger('change').trigger('focus');
    }

    function renderPlanRow(plan, selectedPlanId) {
        const isSelected = plan.id === selectedPlanId;
        const $row = makeElement('tr').toggleClass('table-active', isSelected);
        const $chooseButton = makeElement('button', 'btn btn-sm btn-outline-primary mt-1', isSelected ? 'Selected' : 'Choose')
            .attr({ type: 'button', 'data-plan': plan.id, 'aria-label': `Choose the ${plan.name} plan` });

        if (isSelected) {
            $row.attr('aria-current', 'true');
        }

        makeElement('th').attr('scope', 'row').append(makeElement('div', '', plan.name), $chooseButton).appendTo($row);
        $row.append(
            makeElement('td', '', plan.coffee),
            makeElement('td', '', describePlanDelivery(plan)),
            makeElement('td', '', `${formatKzt(plan.price)} per delivery`),
            makeElement('td', '', plan.bestFor)
        );
        return $row;
    }

    function renderEmptyPlanRow() {
        const lowestPrice = Math.min(...SUBSCRIPTION_PLANS.map((plan) => plan.price));
        const $cell = makeElement('td', 'text-center py-4').attr('colspan', '5').append(
            makeElement('span', '', `No plan fits this budget. Plans start from ${formatKzt(lowestPrice)} per delivery.`),
            makeElement('button', 'btn btn-sm btn-primary ms-2', 'Show all plans').attr({ type: 'button', 'data-action': 'reset-budget' })
        );
        return makeElement('tr').append($cell);
    }

    function renderPlans() {
        const budget = readBudget();
        const visiblePlans = filterPlansByBudget(SUBSCRIPTION_PLANS, budget);
        const selectedPlanId = getCheckedValue('plan');

        $planTableBody.empty();
        if (visiblePlans.length === 0) {
            renderEmptyPlanRow().appendTo($planTableBody);
        } else {
            visiblePlans.forEach((plan) => renderPlanRow(plan, selectedPlanId).appendTo($planTableBody));
        }

        const budgetText = budget === null ? '' : ` up to ${formatKzt(budget)} per delivery`;
        $planCount.text(`Showing ${visiblePlans.length} of ${SUBSCRIPTION_PLANS.length} plans${budgetText}.`);
    }

    function resetBudgetFilter() {
        $budgetInput.val('');
        renderPlans();
        $budgetInput.trigger('focus');
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
        { control: radioGroups.plan, focusTarget: $('#explorer'), validate: () => (getCheckedValue('plan') === '' ? 'Choose a subscription plan.' : '') },
        { control: radioGroups.roast, focusTarget: $('#light-roast'), validate: () => (getCheckedValue('roast') === '' ? 'Choose a roast preference.' : '') },
        { control: radioGroups.grind, focusTarget: $('#whole-bean'), validate: () => (getCheckedValue('grind') === '' ? 'Choose a grind preference.' : '') },
        { control: radioGroups.frequency, focusTarget: $('#two-weeks'), validate: validateFrequency },
        { control: $subscriberName, focusTarget: $subscriberName, validate: () => validateFullName(String($subscriberName.val())) },
        { control: $subscriberEmail, focusTarget: $subscriberEmail, validate: () => validateEmail(String($subscriberEmail.val())) },
        { control: $subscriberPhone, focusTarget: $subscriberPhone, validate: () => validatePhone(String($subscriberPhone.val())) },
        { control: $deliveryAddress, focusTarget: $deliveryAddress, validate: () => validateAddress(String($deliveryAddress.val())) }
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
        $liveSummaryBody.empty();
        if (lines.length === 0) {
            $liveSummaryBody.append(makeElement('p', 'mb-0', 'Choose a plan to see the price and your selections here.'));
            return;
        }
        const $list = makeElement('ul', 'mb-0').appendTo($liveSummaryBody);
        lines.forEach((line) => makeElement('li', '', line).appendTo($list));
    }

    function showSuccessSummary(details) {
        const $list = makeElement('ul', 'mb-3');
        const $closeButton = makeElement('button', 'btn btn-primary', 'Close summary').attr('type', 'button');

        [...details.lines, `Name: ${details.name}`, `Email: ${details.email}`, `Phone: ${details.phone}`, `Address: ${details.address}`]
            .forEach((line) => makeElement('li', '', line).appendTo($list));

        $closeButton.on('click', function () {
            $subscriptionConfirmation.slideUp(300, function () {
                $(this).addClass('d-none');
                $('#explorer').trigger('focus');
            });
        });

        $subscriptionConfirmation.empty().append(
            makeElement('h3', 'h4', 'Demo subscription request ready'),
            makeElement('p', 'font-monospace mb-2', `Demo reference: ${details.reference}`),
            $list,
            makeElement('p', 'fw-bold', 'This is a front-end demonstration: no data was sent to a server, no subscription was created and no payment was taken.'),
            $closeButton
        );
        $subscriptionError.stop(true, true).addClass('d-none');
        revealBlock($subscriptionConfirmation, 'fadeIn', 400, function () {
            $(this).trigger('focus');
        });
    }

    function handleSubscriptionSubmit(event) {
        event.preventDefault();

        const invalid = subscriptionValidators.filter((validator) => !applyValidation(validator.control, validator.validate()));
        if (invalid.length !== 0) {
            $subscriptionConfirmation.stop(true, true).addClass('d-none');
            if ($subscriptionError.hasClass('d-none')) {
                revealBlock($subscriptionError, 'slideDown', 200);
            }
            invalid[0].focusTarget.trigger('focus');
            return;
        }

        const details = {
            reference: createReference('SUB'),
            lines: buildSummaryLines(),
            name: String($subscriberName.val()).trim(),
            email: String($subscriberEmail.val()).trim(),
            phone: String($subscriberPhone.val()).trim(),
            address: String($deliveryAddress.val()).trim()
        };

        $subscriptionForm.trigger('reset');
        showSuccessSummary(details);
    }

    function handleSubscriptionReset() {
        subscriptionValidators.forEach((validator) => clearFieldState(validator.control));
        $subscriptionConfirmation.add($subscriptionError).stop(true, true).addClass('d-none');

        setTimeout(() => $subscriptionForm.trigger(SELECTION_EVENT), 0);
    }

    function buildBudgetFilter() {
        const $resetButton = makeElement('button', 'btn btn-outline-primary w-100 justify-content-center', 'Reset filter')
            .attr('type', 'button')
            .on('click', resetBudgetFilter);

        $budgetInput
            .attr({ id: 'plan-budget', type: 'number', min: '0', step: '500', placeholder: 'Any budget' })
            .on('input', renderPlans);

        return makeElement('div', 'row g-2 align-items-end mb-3').append(
            makeElement('div', 'col-12 col-md-6').append(
                makeElement('label', 'form-label', 'Maximum price per delivery (KZT)').attr('for', 'plan-budget'),
                $budgetInput
            ),
            makeElement('div', 'col-12 col-md-3').append($resetButton)
        );
    }

    function bindSubscriptionEvents() {
        $planTableBody
            .on('click', 'button[data-plan]', function () {
                selectPlan($(this).attr('data-plan'));
            })
            .on('click', 'button[data-action="reset-budget"]', resetBudgetFilter);

        $subscriptionForm
            .on(SELECTION_EVENT, updateLiveSummary)
            .on(SELECTION_EVENT, renderPlans);

        $subscriptionForm.on('change', 'input[type="radio"]', function () {
            const groupName = $(this).attr('name');
            $subscriptionForm.trigger(SELECTION_EVENT);
            subscriptionValidators.forEach((validator) => {
                if (validator.control.is('fieldset') && hasFieldError(validator.control)) {
                    applyValidation(validator.control, validator.validate());
                }
            });
            if ((groupName === 'plan' || groupName === 'frequency') && getCheckedValue('frequency') !== '') {
                applyValidation(radioGroups.frequency, validateFrequency());
            }
        });

        $subscriptionForm.on('input', 'input.form-control', function () {
            const $input = $(this);
            const validator = subscriptionValidators.find((entry) => entry.control.is($input));
            if (validator !== undefined && hasFieldError($input)) {
                applyValidation(validator.control, validator.validate());
            }
        });

        $subscriptionForm.on('submit', handleSubscriptionSubmit).on('reset', handleSubscriptionReset);
    }

    function initSubscriptionsPage() {
        $subscriptionForm.prop('noValidate', true);

        radioGroups.plan.attr('id', 'plan-group');
        radioGroups.roast.attr('id', 'roast-group');
        radioGroups.grind.attr('id', 'grind-group');
        radioGroups.frequency.attr('id', 'frequency-group');

        $planCount.attr('role', 'status');
        $planTable.parent('.table-responsive').before(buildPlanFinder(), buildBudgetFilter(), $planCount);

        $liveSummary.attr('aria-live', 'polite').append(makeElement('h3', 'h5', 'Your Subscription Summary'), $liveSummaryBody);
        radioGroups.frequency.after($liveSummary);

        $subscriberPhone.attr('placeholder', '+7 701 234 56 78');
        $subscriptionConfirmation.attr('tabindex', '-1');

        bindSubscriptionEvents();
        $subscriptionForm.trigger(SELECTION_EVENT);
    }

    initSubscriptionsPage();
});
