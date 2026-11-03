'use strict';

// jQuery 4.0.0, loaded from js/jquery/jquery-4.0.0.min.js before this file (the same copy the whole team uses).
// $(function () { ... }) is the short form of $(document).ready(): the code waits until the page is parsed,
// so the plan table and #subscription-form already exist when they are selected.
$(function () {
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

    // Custom event name; the colon is only part of the name (a dot would make it a jQuery namespace).
    const SELECTION_EVENT = 'subscription:selectionChanged';

    const $subscriptionForm = $('#subscription-form');
    // Element selectors: the only table in <main> and its body.
    const $planTable = $('main table');

    // Guard (the same idea as in js/home/*.js): without the form and the plan table there is nothing to do,
    // so the script stops here instead of throwing errors on the missing elements.
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

    function findPlan(planId) {
        return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || null;
    }

    function findFrequency(frequencyId) {
        return DELIVERY_FREQUENCIES.find((frequency) => frequency.id === frequencyId) || null;
    }

    // Attribute selector + :checked filter: the ticked radio button of one group.
    function getChecked(groupName) {
        return $subscriptionForm.find(`input[name="${groupName}"]:checked`);
    }

    function getCheckedValue(groupName) {
        const $checked = getChecked(groupName);
        return $checked.length === 0 ? '' : $checked.val();
    }

    // .siblings('label'): the label sits next to its radio button inside the same .form-check.
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

    // Chain: tick the radio → fire its change event (summary and table update) → move focus to it.
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

    // The table rows are built from the SUBSCRIPTION_PLANS array with .appendTo().
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

    // Values are trimmed before they are checked.
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

        // slideUp for 300 ms closes the summary; the callback runs after the effect: it sets d-none
        // and returns focus to the first plan so the visitor can start a new request.
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
        // fadeIn shows the result of the visitor's submit; the callback focuses it once it is visible.
        revealBlock($subscriptionConfirmation, 'fadeIn', 400, function () {
            $(this).trigger('focus');
        });
    }

    // Rewritten with jQuery (old version in js/abylay/old/old-js-version.js): .val() replaces .value, .trigger('reset')
    // replaces form.reset(), .trigger('focus') replaces .focus(), and revealBlock() adds the slide. The length
    // is almost the same — jQuery does not make this function shorter, the real saving is in the helpers in
    // mainabyl.js (setFieldError / clearFieldState), which lost all their forEach loops.
    //
    // The required attributes stay in subscriptions.html as the first line of defence: without this script
    // the browser still blocks an empty form. A browser check never replaces a server check: it runs on the
    // visitor's computer, can be turned off in devtools, and a request can be sent without the page at all,
    // so the server must validate every field again before it creates a subscription.
    function handleSubscriptionSubmit(event) {
        // Without preventDefault() the browser would send the form with method="get": the page would reload,
        // the fields would end up in the URL and the visitor would see neither the errors nor the summary.
        event.preventDefault();

        // Every field is checked (not only up to the first error), so every invalid field gets its own message.
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

        // The success message is shown only now, when every check passed, and the form is reset.
        $subscriptionForm.trigger('reset');
        showSuccessSummary(details);
    }

    function handleSubscriptionReset() {
        subscriptionValidators.forEach((validator) => clearFieldState(validator.control));
        $subscriptionConfirmation.add($subscriptionError).stop(true, true).addClass('d-none');

        // Radio buttons are unchecked only after the reset event finishes.
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
        // Delegated handlers: bound once to the <tbody>, which is in the HTML from the start. Its rows are
        // rebuilt by renderPlans() whenever the budget or the chosen plan changes, so a handler bound directly
        // to the "Choose" buttons would disappear with the old rows and the new buttons would not react.
        // The click bubbles up to the <tbody> and jQuery checks which button it started on.
        $planTableBody
            .on('click', 'button[data-plan]', function () {
                selectPlan($(this).attr('data-plan'));
            })
            .on('click', 'button[data-action="reset-budget"]', resetBudgetFilter);

        // Custom event (the same idea as "home:cardsRendered" in js/home/cards.js): every place that changes the
        // chosen options (a radio change, the form reset, the first load) only announces it with .trigger(),
        // and the live summary and the plan table listen with .on(). A new block that depends on the selection
        // can subscribe here without touching the code that changes the selection.
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

        // As soon as the visitor fixes a text field that shows an error, it is checked again and the error is cleared.
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
        // Our jQuery checks replace the browser's bubbles, so they are turned off here (not in the HTML).
        $subscriptionForm.prop('noValidate', true);

        radioGroups.plan.attr('id', 'plan-group');
        radioGroups.roast.attr('id', 'roast-group');
        radioGroups.grind.attr('id', 'grind-group');
        radioGroups.frequency.attr('id', 'frequency-group');

        $planCount.attr('role', 'status');
        // .parent(): the table's direct wrapper is the .table-responsive block; the filter goes above it.
        $planTable.parent('.table-responsive').before(buildBudgetFilter(), $planCount);

        $liveSummary.attr('aria-live', 'polite').append(makeElement('h3', 'h5', 'Your Subscription Summary'), $liveSummaryBody);
        radioGroups.frequency.after($liveSummary);

        $subscriberPhone.attr('placeholder', '+7 701 234 56 78');
        $subscriptionConfirmation.attr('tabindex', '-1');

        bindSubscriptionEvents();
        $subscriptionForm.trigger(SELECTION_EVENT);
    }

    initSubscriptionsPage();
});
