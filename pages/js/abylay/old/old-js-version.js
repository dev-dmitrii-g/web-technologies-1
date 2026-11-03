'use strict';

// Old plain-JavaScript versions (Assignment 4–5) of the three features that were rewritten with jQuery
// in Assignment 6. This file is NOT linked to any page; it is kept only to compare both versions side by side.
// Author: Abylay Opayev — menu.html, order.html, subscriptions.html.
//
// 1. The menu catalogue built from MENU_ITEMS        → now in js/abylay/menu.js (renderMenuCard, updateMenuResults)
// 2. Form validation (field errors + submit)         → now in js/abylay/mainabyl.js and js/abylay/subscriptions.js
// 3. Show / hide of the order result blocks          → now in js/abylay/order.js (hideOrderResult, showOrderConfirmation)


// ---------------------------------------------------------------------------------------------------------
// 1. Menu catalogue: a list of cards built from an array (old menu.js)
// ---------------------------------------------------------------------------------------------------------

function updateCardSelection(item, sizeKey, priceElement, linkElement) {
    const sizeText = SIZE_LABELS[sizeKey];
    priceElement.textContent = `${sizeText}: ${formatPrice(getUnitPrice(item, sizeKey))}`;
    linkElement.href = buildOrderLink(item.id, sizeKey);
    linkElement.setAttribute('aria-label', `Order ${item.name}, ${sizeText}`);
}

function renderMenuCard(item) {
    const column = makeElement('div', 'col-12 col-md-6 col-lg-4');
    const card = makeElement('article', 'card h-100 shadow-sm');
    const body = makeElement('div', 'card-body d-flex flex-column');
    const badge = makeElement('span', 'badge bg-secondary text-white align-self-start mb-2', getCategoryLabel(item.category));
    const title = makeElement('h3', 'h5 card-title', item.name);
    const price = makeElement('p', 'font-monospace mb-3');
    const orderLink = makeElement('a', 'btn btn-primary mt-auto align-self-start', 'Order this');
    const sizeKeys = getSizeKeys(item);

    body.append(badge, title);

    if (sizeKeys.length > 1) {
        const selectId = `menu-size-${item.id}`;
        const label = makeElement('label', 'form-label small mb-1', 'Size');
        const select = makeElement('select', 'form-select form-select-sm mb-2');
        label.htmlFor = selectId;
        select.id = selectId;
        sizeKeys.forEach((sizeKey) => {
            select.append(new Option(`${SIZE_LABELS[sizeKey]} — ${formatPrice(item.prices[sizeKey])}`, sizeKey));
        });
        // One listener per card: every rebuild of the list creates new listeners.
        select.addEventListener('change', () => {
            updateCardSelection(item, select.value, price, orderLink);
        });
        body.append(label, select);
    }

    updateCardSelection(item, sizeKeys[0], price, orderLink);
    body.append(price, orderLink);
    card.append(body);
    column.append(card);
    return column;
}

function updateMenuResults() {
    const visibleItems = filterMenuItems(MENU_ITEMS, menuFilters);
    resultGrid.replaceChildren(...visibleItems.map(renderMenuCard));
    resultCount.textContent = describeResults(visibleItems.length, menuFilters);
    resultGrid.classList.toggle('d-none', visibleItems.length === 0);
    emptyState.classList.toggle('d-none', visibleItems.length !== 0);
}

function updateCategoryButtons() {
    categoryGroup.querySelectorAll('button').forEach((button) => {
        const isActive = button.dataset.category === menuFilters.category;
        button.classList.toggle('active', isActive);
        button.classList.toggle('btn-primary', isActive);
        button.classList.toggle('btn-outline-primary', !isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}


// ---------------------------------------------------------------------------------------------------------
// 2. Form validation (old mainabyl.js helpers + old subscriptions.js submit handler)
// ---------------------------------------------------------------------------------------------------------

function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

// Error and success states use Bootstrap classes; a fieldset stands for a radio group.
function getStateTargets(control) {
    if (control.tagName === 'FIELDSET') {
        return Array.from(control.querySelectorAll('.form-check-input'));
    }
    return [control];
}

function clearFieldState(control) {
    const feedback = document.getElementById(`${control.id}-feedback`);
    if (feedback !== null) {
        feedback.remove();
    }
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
    getStateTargets(control).forEach((target) => target.classList.remove('is-invalid', 'is-valid'));
}

function setFieldError(control, message) {
    clearFieldState(control);
    const feedback = makeElement('div', 'invalid-feedback d-block', `Error: ${message}`);
    feedback.id = `${control.id}-feedback`;
    if (control.tagName === 'FIELDSET') {
        control.append(feedback);
    } else {
        control.after(feedback);
    }
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', feedback.id);
    getStateTargets(control).forEach((target) => target.classList.add('is-invalid'));
}

function setFieldValid(control) {
    clearFieldState(control);
    if (control.tagName !== 'FIELDSET') {
        control.setAttribute('aria-invalid', 'false');
        control.classList.add('is-valid');
    }
}

function applyValidation(control, message) {
    if (message === '') {
        setFieldValid(control);
        return true;
    }
    setFieldError(control, message);
    return false;
}

function hasFieldError(control) {
    return document.getElementById(`${control.id}-feedback`) !== null;
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

// Re-check a text field while the visitor fixes it (old subscriptions.js).
[subscriberName, subscriberEmail, subscriberPhone, deliveryAddress].forEach((input) => {
    input.addEventListener('input', () => {
        if (hasFieldError(input)) {
            const validator = subscriptionValidators.find((entry) => entry.control === input);
            applyValidation(input, validator.validate());
        }
    });
});


// ---------------------------------------------------------------------------------------------------------
// 3. Show / hide of the order result blocks (old order.js)
// ---------------------------------------------------------------------------------------------------------

function hideOrderResult() {
    orderError.classList.add('d-none');
    orderConfirmation.classList.add('d-none');
    confirmationDetails.classList.add('d-none');
}

function showOrderConfirmation(order) {
    const list = makeElement('ul', 'mb-2');
    order.lines.forEach((line) => {
        const text = `${line.quantity} × ${line.name} (${describeLine(line)}) — ${formatPrice(calculateLineSubtotal(line.unitPrice, line.quantity))}`;
        list.append(makeElement('li', '', text));
    });

    orderConfirmation.replaceChildren(
        makeElement('strong', '', `Demo order request ${order.reference} is ready.`),
        makeElement('span', '', ' This is a front-end demonstration: no data was sent to a server and no real order or payment was created.')
    );
    confirmationDetails.replaceChildren(
        makeElement('h3', 'h5', 'Your order details'),
        list,
        makeElement('p', 'fw-bold mb-1', `Total: ${formatPrice(order.total)} for ${order.itemCount} item(s)`),
        makeElement('p', 'mb-1', `Pickup: today at ${order.pickupTime} (preparation ${order.preparation})`),
        makeElement('p', 'mb-1', `Name: ${order.name}`),
        makeElement('p', 'mb-1', `Phone: ${order.phone}`),
        makeElement('p', 'mb-0', `Notes: ${order.comment === '' ? 'none' : order.comment}`)
    );
    orderConfirmation.classList.remove('d-none');
    confirmationDetails.classList.remove('d-none');
    orderConfirmation.focus();
}
