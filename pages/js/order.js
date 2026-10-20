'use strict';

const MAX_ORDER_ITEMS = 30;
const LAST_PICKUP_BEFORE_CLOSE = 15;
const MAX_COMMENT_LENGTH = 200;

const orderForm = document.getElementById('order-form');
const itemSelect = document.getElementById('item');
const sizeSelect = document.getElementById('size');
const quantityInput = document.getElementById('quantity');
const extrasCheckboxes = Array.from(document.querySelectorAll('input[name="extras"]'));
const pickupInput = document.getElementById('pickup-time');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const commentInput = document.getElementById('comment');
const placeOrderButton = document.getElementById('order-submit');
const prepOutput = orderForm.querySelector('p > output');
const extrasFieldset = extrasCheckboxes[0].closest('fieldset');
const quantityFieldset = quantityInput.closest('fieldset');
const pickupFieldset = pickupInput.closest('fieldset');

const summaryItem = document.getElementById('summary-item');
const summarySize = document.getElementById('summary-size');
const summaryExtras = document.getElementById('summary-extras');
const summaryQuantity = document.getElementById('summary-quantity');
const summaryTotal = document.getElementById('order-total');
const orderError = document.getElementById('order-error');
const orderConfirmation = document.getElementById('order-confirmation');
const confirmationDetails = document.getElementById('order-confirmation-details');

const extrasNote = makeElement('p', 'small mb-2');
const linePreview = makeElement('p', 'font-monospace my-3');
const addStatus = makeElement('p', 'small mb-0 mt-2');
const cartFieldset = makeElement('fieldset', 'border rounded p-3 mb-4');
const cartList = makeElement('ul', 'list-group mb-3');
const cartEmpty = makeElement('p', 'mb-3', 'Your cart is empty. Choose an item above and press "Add to Cart".');
const cartTotals = makeElement('p', 'font-monospace fw-bold mb-3');
const cartStatus = makeElement('p', 'small mb-3');
const clearCartButton = makeElement('button', 'btn btn-sm btn-outline-secondary', 'Clear Cart');
const commentCounter = makeElement('p', 'small mt-1 mb-0');

let cart = [];

function getSelectedItem() {
    return findMenuItem(itemSelect.value);
}

function getSelectedExtras() {
    return extrasCheckboxes
        .filter((checkbox) => checkbox.checked && !checkbox.disabled)
        .map((checkbox) => findExtra(checkbox.value));
}

function readQuantity() {
    const quantity = Number(quantityInput.value);
    if (quantityInput.value.trim() === '' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_ITEMS) {
        return null;
    }
    return quantity;
}

function getExtrasTotal(extras) {
    return extras.reduce((sum, extra) => sum + extra.price, 0);
}

function calculateLineSubtotal(unitPrice, quantity) {
    return unitPrice * quantity;
}

function getCartCount(lines) {
    return lines.reduce((count, line) => count + line.quantity, 0);
}

function getCartTotal(lines) {
    return lines.reduce((total, line) => total + calculateLineSubtotal(line.unitPrice, line.quantity), 0);
}

function getPreparationRange(itemCount) {
    if (itemCount <= 5) {
        return { min: 15, max: 20 };
    }
    if (itemCount <= 15) {
        return { min: 20, max: 25 };
    }
    return { min: 25, max: 30 };
}

function getExtrasText(extras) {
    return extras.length === 0 ? 'no extras' : extras.map((extra) => extra.name).join(', ');
}

function describeLine(line) {
    return `${SIZE_LABELS[line.sizeKey]} · ${getExtrasText(line.extras)} · ${formatPrice(line.unitPrice)} each`;
}

function renderSizeOptions(item, preferredSize) {
    sizeSelect.replaceChildren();
    if (item === null) {
        sizeSelect.append(new Option('Select a menu item first', ''));
        sizeSelect.disabled = true;
        return;
    }
    const sizeKeys = getSizeKeys(item);
    if (sizeKeys.length === 1 && sizeKeys[0] === '') {
        sizeSelect.append(new Option('Not Applicable', ''));
        sizeSelect.disabled = true;
        return;
    }
    sizeKeys.forEach((sizeKey) => {
        sizeSelect.append(new Option(`${SIZE_LABELS[sizeKey]} — ${formatPrice(item.prices[sizeKey])}`, sizeKey));
    });
    sizeSelect.disabled = sizeKeys.length === 1;
    if (sizeKeys.includes(preferredSize)) {
        sizeSelect.value = preferredSize;
    }
}

function updateExtrasAvailability(item) {
    const allowedIds = item === null ? [] : getExtrasForCategory(item.category).map((extra) => extra.id);
    extrasCheckboxes.forEach((checkbox) => {
        const isAllowed = allowedIds.includes(checkbox.value);
        checkbox.disabled = !isAllowed;
        if (!isAllowed) {
            checkbox.checked = false;
        }
    });

    if (item === null) {
        extrasNote.textContent = 'Select a menu item to see which extras are available.';
    } else if (allowedIds.length === 0) {
        extrasNote.textContent = `No extras are available for ${item.name}.`;
    } else {
        extrasNote.textContent = `Available extras for ${item.name} are enabled below.`;
    }
}

function updateLinePreview() {
    const item = getSelectedItem();
    const quantity = readQuantity();
    if (item === null) {
        linePreview.textContent = 'Select a menu item to see its price.';
        return;
    }
    if (quantity === null) {
        linePreview.textContent = `Enter a quantity from 1 to ${MAX_ORDER_ITEMS}.`;
        return;
    }
    const basePrice = getUnitPrice(item, sizeSelect.value);
    const extrasTotal = getExtrasTotal(getSelectedExtras());
    const priceText = extrasTotal > 0
        ? `(${formatPrice(basePrice)} + extras ${formatPrice(extrasTotal)})`
        : formatPrice(basePrice);
    linePreview.textContent = `${item.name}: ${priceText} × ${quantity} = ${formatPrice(calculateLineSubtotal(basePrice + extrasTotal, quantity))}`;
}

function refreshItemFields(preferredSize) {
    const item = getSelectedItem();
    renderSizeOptions(item, preferredSize);
    updateExtrasAvailability(item);
    updateLinePreview();
}

function updateOrderSummary() {
    if (cart.length === 0) {
        summaryItem.textContent = 'No item selected';
        summarySize.textContent = 'Not selected';
        summaryExtras.textContent = 'None';
        summaryQuantity.textContent = '0';
        summaryTotal.textContent = formatPrice(0);
        return;
    }
    summaryItem.textContent = cart.map((line) => `${line.quantity} × ${line.name}`).join(', ');
    summarySize.textContent = cart.map((line) => `${line.name}: ${SIZE_LABELS[line.sizeKey]}`).join('; ');
    summaryExtras.textContent = cart.map((line) => `${line.name}: ${getExtrasText(line.extras)}`).join('; ');
    summaryQuantity.textContent = String(getCartCount(cart));
    summaryTotal.textContent = formatPrice(getCartTotal(cart));
}

function focusCartControl(lineKey, action) {
    const target = cartList.querySelector(`[data-key="${CSS.escape(lineKey)}"][data-action="${action}"]`);
    if (target !== null && !target.disabled) {
        target.focus();
    } else {
        cartStatus.focus();
    }
}

function renderCartLine(line) {
    const listItem = makeElement('li', 'list-group-item');
    const row = makeElement('div', 'd-flex flex-wrap justify-content-between align-items-center gap-2');
    const info = makeElement('div');
    const controls = makeElement('div', 'd-flex flex-wrap align-items-center gap-2');
    const stepper = makeElement('div', 'd-flex align-items-center gap-1');
    const decreaseButton = makeElement('button', 'btn btn-sm btn-outline-secondary', '−');
    const quantityText = makeElement('span', 'font-monospace fw-bold px-2', String(line.quantity));
    const increaseButton = makeElement('button', 'btn btn-sm btn-outline-secondary', '+');
    const subtotal = makeElement('span', 'font-monospace fw-bold', formatPrice(calculateLineSubtotal(line.unitPrice, line.quantity)));
    const removeButton = makeElement('button', 'btn btn-sm btn-outline-danger', 'Remove');

    info.append(makeElement('strong', '', line.name), makeElement('div', 'small', describeLine(line)));

    stepper.setAttribute('role', 'group');
    stepper.setAttribute('aria-label', `Quantity of ${line.name}`);
    quantityText.setAttribute('aria-label', `Quantity: ${line.quantity}`);

    [decreaseButton, increaseButton, removeButton].forEach((button) => {
        button.type = 'button';
        button.dataset.key = line.key;
    });
    decreaseButton.dataset.action = 'decrease';
    increaseButton.dataset.action = 'increase';
    removeButton.dataset.action = 'remove';
    decreaseButton.setAttribute('aria-label', `Decrease quantity of ${line.name}`);
    increaseButton.setAttribute('aria-label', `Increase quantity of ${line.name}`);
    removeButton.setAttribute('aria-label', `Remove ${line.name} from the cart`);
    decreaseButton.disabled = line.quantity <= 1;
    increaseButton.disabled = getCartCount(cart) >= MAX_ORDER_ITEMS;

    decreaseButton.addEventListener('click', () => changeLineQuantity(line.key, -1));
    increaseButton.addEventListener('click', () => changeLineQuantity(line.key, 1));
    removeButton.addEventListener('click', () => removeCartLine(line.key));

    stepper.append(decreaseButton, quantityText, increaseButton);
    controls.append(stepper, subtotal, removeButton);
    row.append(info, controls);
    listItem.append(row);
    return listItem;
}

function renderCart() {
    const itemCount = getCartCount(cart);
    const preparation = getPreparationRange(itemCount);

    cartList.replaceChildren(...cart.map(renderCartLine));
    cartList.classList.toggle('d-none', cart.length === 0);
    cartEmpty.classList.toggle('d-none', cart.length !== 0);
    cartTotals.textContent = `Items: ${itemCount} of ${MAX_ORDER_ITEMS} · Cart total: ${formatPrice(getCartTotal(cart))}`;
    clearCartButton.disabled = cart.length === 0;
    placeOrderButton.disabled = cart.length === 0;
    prepOutput.textContent = `${preparation.min}–${preparation.max} minutes`;
    updateOrderSummary();

    if (cart.length !== 0 && hasFieldError(cartFieldset)) {
        clearFieldState(cartFieldset);
    }
}

function validateNewLine(item, quantity) {
    let quantityMessage = '';
    const freePlaces = MAX_ORDER_ITEMS - getCartCount(cart);
    if (quantity === null) {
        quantityMessage = `Enter a whole number from 1 to ${MAX_ORDER_ITEMS}.`;
    } else if (quantity > freePlaces) {
        quantityMessage = freePlaces === 0
            ? `Your cart already has the maximum of ${MAX_ORDER_ITEMS} items for one online order.`
            : `One online order is limited to ${MAX_ORDER_ITEMS} items. You can add ${freePlaces} more.`;
    }
    return [
        { control: itemSelect, message: item === null ? 'Choose a menu item.' : '' },
        { control: quantityInput, message: quantityMessage }
    ];
}

function addToCart() {
    const item = getSelectedItem();
    const quantity = readQuantity();
    const invalid = validateNewLine(item, quantity).filter((result) => !applyValidation(result.control, result.message));

    if (invalid.length !== 0) {
        addStatus.textContent = 'The item was not added. Please fix the highlighted fields.';
        invalid[0].control.focus();
        return;
    }

    const sizeKey = sizeSelect.value;
    const extras = getSelectedExtras();
    const key = `${item.id}|${sizeKey}|${extras.map((extra) => extra.id).sort().join(',')}`;
    const existingLine = cart.find((line) => line.key === key);

    if (existingLine !== undefined) {
        existingLine.quantity += quantity;
    } else {
        cart.push({
            key,
            name: item.name,
            sizeKey,
            extras: extras.map((extra) => ({ id: extra.id, name: extra.name, price: extra.price })),
            unitPrice: getUnitPrice(item, sizeKey) + getExtrasTotal(extras),
            quantity
        });
    }

    renderCart();
    [itemSelect, quantityInput].forEach(clearFieldState);
    orderError.classList.add('d-none');
    addStatus.textContent = `Added ${quantity} × ${item.name} (${SIZE_LABELS[sizeKey]}) to your cart.`;
    quantityInput.value = '1';
    updateLinePreview();
}

function changeLineQuantity(lineKey, step) {
    const line = cart.find((entry) => entry.key === lineKey);
    if (line === undefined) {
        return;
    }
    const newQuantity = line.quantity + step;
    if (newQuantity < 1) {
        return;
    }
    if (step > 0 && getCartCount(cart) >= MAX_ORDER_ITEMS) {
        cartStatus.textContent = `One online order is limited to ${MAX_ORDER_ITEMS} items.`;
        return;
    }
    line.quantity = newQuantity;
    renderCart();
    cartStatus.textContent = `${line.name}: quantity changed to ${newQuantity}.`;
    focusCartControl(lineKey, step > 0 ? 'increase' : 'decrease');
}

function removeCartLine(lineKey) {
    const line = cart.find((entry) => entry.key === lineKey);
    if (line === undefined) {
        return;
    }
    cart = cart.filter((entry) => entry.key !== lineKey);
    renderCart();
    cartStatus.textContent = `${line.name} was removed from your cart.`;
    cartStatus.focus();
}

function clearCart() {
    cart = [];
    renderCart();
    cartStatus.textContent = 'Your cart was cleared.';
    cartStatus.focus();
}

function validatePickupTime() {
    if (pickupInput.value === '') {
        return 'Choose a pickup time.';
    }
    const pickup = timeToMinutes(pickupInput.value);
    const preparation = getPreparationRange(getCartCount(cart));
    const firstPickup = timeToMinutes(CAFE_HOURS.open) + preparation.max;
    const lastPickup = timeToMinutes(CAFE_HOURS.close) - LAST_PICKUP_BEFORE_CLOSE;
    const now = new Date();
    const earliestToday = now.getHours() * 60 + now.getMinutes() + preparation.max;

    if (earliestToday > lastPickup) {
        return `Online pickup for today is closed (last pickup ${minutesToTime(lastPickup)}). Please order tomorrow after ${CAFE_HOURS.open}.`;
    }
    if (pickup < firstPickup || pickup > lastPickup) {
        return `Pickup is available between ${minutesToTime(firstPickup)} and ${minutesToTime(lastPickup)}.`;
    }
    if (pickup < earliestToday) {
        return `Your order needs up to ${preparation.max} minutes. Choose ${minutesToTime(earliestToday)} or later.`;
    }
    return '';
}

function validateComment() {
    const length = commentInput.value.trim().length;
    if (length > MAX_COMMENT_LENGTH) {
        return `Order notes can be up to ${MAX_COMMENT_LENGTH} characters (now ${length}).`;
    }
    return '';
}

const orderValidators = [
    { control: pickupInput, validate: validatePickupTime },
    { control: nameInput, validate: () => validateFullName(nameInput.value) },
    { control: phoneInput, validate: () => validatePhone(phoneInput.value) },
    { control: commentInput, validate: validateComment }
];

function updateCommentCounter() {
    const length = commentInput.value.trim().length;
    commentCounter.textContent = `${length} / ${MAX_COMMENT_LENGTH} characters`;
    commentCounter.classList.toggle('text-danger', length > MAX_COMMENT_LENGTH);
}

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

function handleOrderSubmit(event) {
    event.preventDefault();

    const invalidControls = orderValidators
        .filter((validator) => !applyValidation(validator.control, validator.validate()))
        .map((validator) => validator.control);

    if (cart.length === 0) {
        setFieldError(cartFieldset, 'Add at least one item to your cart.');
        invalidControls.unshift(itemSelect);
    }

    if (invalidControls.length !== 0) {
        orderConfirmation.classList.add('d-none');
        confirmationDetails.classList.add('d-none');
        orderError.classList.remove('d-none');
        invalidControls[0].focus();
        return;
    }

    const order = {
        reference: createReference('TC'),
        lines: cart.map((line) => ({ ...line })),
        itemCount: getCartCount(cart),
        total: getCartTotal(cart),
        preparation: prepOutput.textContent,
        pickupTime: pickupInput.value,
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        comment: commentInput.value.trim()
    };

    orderForm.reset();
    showOrderConfirmation(order);
}

function handleOrderReset() {
    cart = [];
    [itemSelect, quantityInput, cartFieldset, ...orderValidators.map((validator) => validator.control)].forEach(clearFieldState);
    hideOrderResult();
    addStatus.textContent = '';
    cartStatus.textContent = '';

    // Form fields get their default values only after the reset event finishes.
    setTimeout(() => {
        refreshItemFields('');
        renderCart();
        updateCommentCounter();
    }, 0);
}

function applyMenuSelection() {
    const params = new URLSearchParams(window.location.search);
    const item = findMenuItem(params.get('item'));
    if (item === null) {
        return;
    }
    itemSelect.value = item.id;
    refreshItemFields(params.get('size'));
    addStatus.textContent = `${item.name} was selected from the menu. Choose extras and press "Add to Cart".`;
}

function buildOrderInterface() {
    const addButton = makeElement('button', 'btn btn-primary', 'Add to Cart');
    const cartLegend = makeElement('legend', 'h5 mb-3', 'Your Cart');
    const cartActions = makeElement('div', 'd-flex flex-wrap gap-2');

    extrasFieldset.querySelector('legend').after(extrasNote);

    addButton.type = 'button';
    addButton.addEventListener('click', addToCart);
    linePreview.setAttribute('aria-live', 'polite');
    addStatus.setAttribute('role', 'status');
    quantityFieldset.append(linePreview, addButton, addStatus);

    cartFieldset.id = 'order-cart';
    cartStatus.setAttribute('role', 'status');
    cartStatus.tabIndex = -1;
    clearCartButton.type = 'button';
    clearCartButton.addEventListener('click', clearCart);
    cartActions.append(clearCartButton);
    cartFieldset.append(cartLegend, cartStatus, cartEmpty, cartList, cartTotals, cartActions);
    pickupFieldset.before(cartFieldset);

    phoneInput.placeholder = '+7 701 234 56 78';
    phoneInput.autocomplete = 'tel';
    nameInput.autocomplete = 'name';
    commentCounter.id = 'comment-counter';
    commentInput.after(commentCounter);

    orderConfirmation.tabIndex = -1;
}

function initOrderPage() {
    orderForm.noValidate = true;
    buildOrderInterface();

    itemSelect.addEventListener('change', () => {
        refreshItemFields('');
        if (hasFieldError(itemSelect)) {
            applyValidation(itemSelect, getSelectedItem() === null ? 'Choose a menu item.' : '');
        }
    });
    sizeSelect.addEventListener('change', updateLinePreview);
    extrasCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', updateLinePreview));
    quantityInput.addEventListener('input', () => {
        updateLinePreview();
        if (hasFieldError(quantityInput)) {
            clearFieldState(quantityInput);
        }
    });
    quantityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addToCart();
        }
    });

    orderValidators.forEach((validator) => {
        const eventName = validator.control === pickupInput ? 'change' : 'input';
        validator.control.addEventListener(eventName, () => {
            if (hasFieldError(validator.control)) {
                applyValidation(validator.control, validator.validate());
            }
        });
    });
    commentInput.addEventListener('input', updateCommentCounter);

    orderForm.addEventListener('submit', handleOrderSubmit);
    orderForm.addEventListener('reset', handleOrderReset);

    refreshItemFields('');
    renderCart();
    updateCommentCounter();
    applyMenuSelection();
}

initOrderPage();
