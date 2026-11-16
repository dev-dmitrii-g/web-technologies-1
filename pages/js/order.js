'use strict';

// DOM helpers for this page, plain JavaScript.
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

const LAST_PICKUP_BEFORE_CLOSE = 15;
const MAX_COMMENT_LENGTH = 200;

const orderForm = document.getElementById('order-form');
const itemSelect = document.getElementById('item');
const sizeSelect = document.getElementById('size');
const quantityInput = document.getElementById('quantity');
const pickupInput = document.getElementById('pickup-time');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const commentInput = document.getElementById('comment');
const prepOutput = orderForm.querySelector('p > output');
const extrasFieldset = document.getElementById('order-extras');
const quantityFieldset = quantityInput.closest('fieldset');
const itemFieldset = itemSelect.closest('fieldset');

const orderError = document.getElementById('order-error');
const orderConfirmation = document.getElementById('order-confirmation');
const confirmationDetails = document.getElementById('order-confirmation-details');

const extrasNote = makeElement('p', 'small mb-2');
const linePreview = makeElement('p', 'font-monospace my-3');
const addStatus = makeElement('p', 'small mb-0 mt-2');
const cartFieldset = makeElement('fieldset', 'border rounded p-3 mb-4');
const cartList = makeElement('ul', 'list-group mb-3');
const cartEmpty = makeElement('p', 'mb-3', 'Your cart is empty. Add items on the menu page, or choose one below and press "Add to Cart".');
const cartTotals = makeElement('p', 'font-monospace fw-bold mb-3');
const cartStatus = makeElement('p', 'small mb-3');
const clearCartButton = makeElement('button', 'btn btn-sm btn-outline-secondary', 'Clear Cart');
const commentCounter = makeElement('p', 'small mt-1 mb-0');
const addButton = makeElement('button', 'btn btn-primary', 'Add to Cart');
const cancelEditButton = makeElement('button', 'btn btn-outline-secondary d-none', 'Cancel Editing');
const pickupStatus = makeElement('p', 'small mt-2 mb-2');
const earliestPickupButton = makeElement('button', 'btn btn-sm btn-outline-primary', 'Use the earliest time');
const itemPanel = makeElement('div', 'border rounded p-3 mb-4');
const addAnotherButton = makeElement('button', 'btn btn-sm btn-primary', 'Add another item');

let cart = readStoredCart();
// Key of the cart line that is loaded back into the form, '' when nothing is being edited.
let editingKey = '';
// true after "Add another item", until the item is added or "Cancel" is pressed.
let isItemPanelOpen = false;

function getSelectedItem() {
    return findMenuItem(itemSelect.value);
}

// The checkboxes are created by renderExtras(), so they are looked up each time instead of once at load.
function getExtrasCheckboxes() {
    return Array.from(extrasFieldset.querySelectorAll('input[name="extras"]'));
}

function getSelectedExtras() {
    return getExtrasCheckboxes()
        .filter((checkbox) => checkbox.checked && !checkbox.disabled)
        .map((checkbox) => findExtra(checkbox.value));
}

function readQuantity() {
    const quantity = Number(quantityInput.value);
    if (quantityInput.value.trim() === '' || !Number.isInteger(quantity) || quantity < 1 || quantity > CART_ITEM_LIMIT) {
        return null;
    }
    return quantity;
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

function roundUpToFive(minutes) {
    return Math.ceil(minutes / 5) * 5;
}

// The pickup window for today: the cafe hours shortened by the preparation time and the last-pickup margin.
function getPickupWindow(itemCount) {
    const preparation = getPreparationRange(itemCount);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const first = timeToMinutes(CAFE_HOURS.open) + preparation.max;
    const last = timeToMinutes(CAFE_HOURS.close) - LAST_PICKUP_BEFORE_CLOSE;
    const earliestToday = nowMinutes + preparation.max;
    return {
        preparation,
        nowMinutes,
        first,
        last,
        earliestToday,
        earliestChoice: roundUpToFive(Math.max(first, earliestToday)),
        isClosedToday: earliestToday > last
    };
}

function getExtrasText(extras) {
    return extras.length === 0 ? 'no extras' : extras.map((extra) => extra.name).join(', ');
}

function describeLine(line) {
    return `${SIZE_LABELS[line.sizeKey]} · ${getExtrasText(line.extras)} · ${formatPrice(line.unitPrice)} each`;
}

// The item list is built from MENU_ITEMS, one <optgroup> per category; none of it is written in order.html.
function renderItemOptions() {
    MENU_CATEGORIES.forEach((category) => {
        const group = makeElement('optgroup');
        group.label = category.label;
        MENU_ITEMS
            .filter((item) => item.category === category.id)
            .forEach((item) => group.append(new Option(item.name, item.id)));
        itemSelect.append(group);
    });
}

// One checkbox with its label for every extra in EXTRAS; the price in the label comes from the data.
function renderExtras() {
    EXTRAS.forEach((extra) => {
        const wrapper = makeElement('div', 'form-check mb-2');
        const checkbox = makeElement('input', 'form-check-input');
        const label = makeElement('label', 'form-check-label', `${extra.name} +${formatPrice(extra.price)}`);
        checkbox.type = 'checkbox';
        checkbox.name = 'extras';
        checkbox.id = `extra-${extra.id}`;
        checkbox.value = extra.id;
        label.htmlFor = checkbox.id;
        wrapper.append(checkbox, label);
        extrasFieldset.append(wrapper);
    });
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
    getExtrasCheckboxes().forEach((checkbox) => {
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
        linePreview.textContent = `Enter a quantity from 1 to ${CART_ITEM_LIMIT}.`;
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

function focusCartControl(lineKey, action) {
    const target = cartList.querySelector(`[data-key="${CSS.escape(lineKey)}"][data-action="${action}"]`);
    if (target !== null && !target.disabled) {
        target.focus();
    } else {
        cartStatus.focus();
    }
}

function renderCartLine(line) {
    const isEditing = line.key === editingKey;
    const listItem = makeElement('li', isEditing ? 'list-group-item list-group-item-primary' : 'list-group-item');
    const row = makeElement('div', 'd-flex flex-wrap justify-content-between align-items-center gap-2');
    const info = makeElement('div');
    const controls = makeElement('div', 'd-flex flex-wrap align-items-center gap-2');
    const stepper = makeElement('div', 'd-flex align-items-center gap-1');
    const decreaseButton = makeElement('button', 'btn btn-sm btn-outline-secondary', '−');
    const quantityText = makeElement('span', 'font-monospace fw-bold px-2', String(line.quantity));
    const increaseButton = makeElement('button', 'btn btn-sm btn-outline-secondary', '+');
    const subtotal = makeElement('span', 'font-monospace fw-bold', formatPrice(calculateLineSubtotal(line.unitPrice, line.quantity)));
    const editButton = makeElement('button', 'btn btn-sm btn-outline-primary', isEditing ? 'Editing' : 'Edit');
    const removeButton = makeElement('button', 'btn btn-sm btn-outline-danger', 'Remove');

    info.append(makeElement('strong', '', line.name), makeElement('div', 'small', describeLine(line)));

    stepper.setAttribute('role', 'group');
    stepper.setAttribute('aria-label', `Quantity of ${line.name}`);
    quantityText.setAttribute('aria-label', `Quantity: ${line.quantity}`);

    // No listener per button: one delegated click handler on cartList reads data-action and data-key.
    [decreaseButton, increaseButton, editButton, removeButton].forEach((button) => {
        button.type = 'button';
        button.dataset.key = line.key;
    });
    decreaseButton.dataset.action = 'decrease';
    increaseButton.dataset.action = 'increase';
    editButton.dataset.action = 'edit';
    removeButton.dataset.action = 'remove';
    decreaseButton.setAttribute('aria-label', `Decrease quantity of ${line.name}`);
    increaseButton.setAttribute('aria-label', `Increase quantity of ${line.name}`);
    editButton.setAttribute('aria-label', `Change size, extras or quantity of ${line.name}`);
    removeButton.setAttribute('aria-label', `Remove ${line.name} from the cart`);
    // While a line is in the form, its quantity is changed there, so its own stepper is locked.
    decreaseButton.disabled = isEditing || line.quantity <= 1;
    increaseButton.disabled = isEditing || getCartCount(cart) >= CART_ITEM_LIMIT;
    editButton.disabled = isEditing;

    stepper.append(decreaseButton, quantityText, increaseButton);
    controls.append(stepper, subtotal, editButton, removeButton);
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
    cartTotals.textContent = `Items: ${itemCount} of ${CART_ITEM_LIMIT} · Cart total: ${formatPrice(getCartTotal(cart))}`;
    clearCartButton.disabled = cart.length === 0;
    prepOutput.textContent = `${preparation.min}–${preparation.max} minutes`;
    updatePickupStatus();

    if (cart.length !== 0 && hasFieldError(cartFieldset)) {
        clearFieldState(cartFieldset);
    }
    updateItemPanel();
    saveStoredCart(cart);
}

// otherLines: the cart without the line being edited, so its old quantity does not count twice.
function validateNewLine(item, quantity, otherLines) {
    let quantityMessage = '';
    const freePlaces = CART_ITEM_LIMIT - getCartCount(otherLines);
    if (quantity === null) {
        quantityMessage = `Enter a whole number from 1 to ${CART_ITEM_LIMIT}.`;
    } else if (quantity > freePlaces) {
        quantityMessage = freePlaces === 0
            ? `Your cart already has the maximum of ${CART_ITEM_LIMIT} items for one online order.`
            : `One online order is limited to ${CART_ITEM_LIMIT} items. You can add ${freePlaces} more.`;
    }
    return [
        { control: itemSelect, message: item === null ? 'Choose a menu item.' : '' },
        { control: quantityInput, message: quantityMessage }
    ];
}

function addToCart() {
    const item = getSelectedItem();
    const quantity = readQuantity();
    const isEditing = editingKey !== '';
    const otherLines = cart.filter((line) => line.key !== editingKey);
    const invalid = validateNewLine(item, quantity, otherLines).filter((result) => !applyValidation(result.control, result.message));

    if (invalid.length !== 0) {
        addStatus.textContent = isEditing
            ? 'The item was not updated. Please fix the highlighted fields.'
            : 'The item was not added. Please fix the highlighted fields.';
        invalid[0].control.focus();
        return;
    }

    const sizeKey = sizeSelect.value;
    const newLine = buildCartLine(item, sizeKey, getSelectedExtras(), quantity);
    const sameLine = otherLines.find((line) => line.key === newLine.key);

    if (sameLine !== undefined) {
        // The same item with the same size and extras is already in the cart: the quantities are added up.
        sameLine.quantity += quantity;
        cart = otherLines;
    } else if (isEditing) {
        // The edited line keeps its place in the cart.
        cart = cart.map((line) => (line.key === editingKey ? newLine : line));
    } else {
        cart.push(newLine);
    }

    // The item fields close again, so the result is reported next to the cart and the focus goes there.
    editingKey = '';
    isItemPanelOpen = false;
    renderCart();
    [itemSelect, quantityInput].forEach(clearFieldState);
    orderError.classList.add('d-none');
    const lineText = `${item.name} (${SIZE_LABELS[sizeKey]})`;
    if (sameLine !== undefined) {
        cartStatus.textContent = `${lineText} is already in your cart, so the quantities were added up: now ${sameLine.quantity}.`;
    } else if (isEditing) {
        cartStatus.textContent = `Updated: ${quantity} × ${lineText}.`;
    } else {
        cartStatus.textContent = `Added ${quantity} × ${lineText} to your cart.`;
    }
    addStatus.textContent = '';
    itemSelect.value = '';
    quantityInput.value = '1';
    refreshItemFields('');
    cartStatus.focus();
}

// Loads a cart line back into the item fields, so the visitor can change its size, extras or quantity.
function startEditingLine(lineKey) {
    const line = cart.find((entry) => entry.key === lineKey);
    if (line === undefined) {
        return;
    }
    editingKey = line.key;
    itemSelect.value = line.itemId;
    refreshItemFields(line.sizeKey);
    const extraIds = line.extras.map((extra) => extra.id);
    getExtrasCheckboxes().forEach((checkbox) => {
        checkbox.checked = !checkbox.disabled && extraIds.includes(checkbox.value);
    });
    quantityInput.value = String(line.quantity);
    [itemSelect, quantityInput].forEach(clearFieldState);
    updateLinePreview();
    renderCart();
    addStatus.textContent = `Editing ${line.quantity} × ${line.name}. Change it above and press "Update Item".`;
    itemSelect.focus();
}

function stopEditing() {
    editingKey = '';
    renderCart();
    addStatus.textContent = '';
}

// The page is a cart first: the item fields are shown only for an empty cart, for the line being edited
// or after "Add another item". Called from renderCart(), so every cart change keeps it up to date.
function updateItemPanel() {
    const isEditing = editingKey !== '';
    const isOpen = cart.length === 0 || isEditing || isItemPanelOpen;
    itemPanel.classList.toggle('d-none', !isOpen);
    addAnotherButton.classList.toggle('d-none', isOpen);
    addButton.textContent = isEditing ? 'Update Item' : 'Add to Cart';
    cancelEditButton.textContent = isEditing ? 'Cancel Editing' : 'Cancel';
    cancelEditButton.classList.toggle('d-none', !isOpen || cart.length === 0);
}

function openItemPanel() {
    isItemPanelOpen = true;
    updateItemPanel();
    addStatus.textContent = '';
    itemSelect.focus();
}

// Closes the item fields without changing the cart, both after "Edit" and after "Add another item".
function cancelEditing() {
    const wasEditing = editingKey !== '';
    isItemPanelOpen = false;
    stopEditing();
    cartStatus.textContent = wasEditing ? 'Editing was cancelled. The cart line was not changed.' : '';
    itemSelect.value = '';
    quantityInput.value = '1';
    refreshItemFields('');
    [itemSelect, quantityInput].forEach(clearFieldState);
    addAnotherButton.focus();
}

// One delegated handler for every button inside the cart: the lines are rebuilt on each change,
// so listeners on the buttons themselves would be lost; cartList itself stays on the page.
function handleCartClick(event) {
    const button = event.target.closest('button[data-action]');
    if (button === null || button.disabled) {
        return;
    }
    const lineKey = button.dataset.key;
    switch (button.dataset.action) {
        case 'decrease':
            changeLineQuantity(lineKey, -1);
            break;
        case 'increase':
            changeLineQuantity(lineKey, 1);
            break;
        case 'edit':
            startEditingLine(lineKey);
            break;
        case 'remove':
            removeCartLine(lineKey);
            break;
    }
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
    if (step > 0 && getCartCount(cart) >= CART_ITEM_LIMIT) {
        cartStatus.textContent = `One online order is limited to ${CART_ITEM_LIMIT} items.`;
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
    if (lineKey === editingKey) {
        stopEditing();
    }
    renderCart();
    cartStatus.textContent = `${line.name} was removed from your cart.`;
    cartStatus.focus();
}

function clearCart() {
    cart = [];
    editingKey = '';
    isItemPanelOpen = false;
    renderCart();
    cartStatus.textContent = 'Your cart was cleared.';
    cartStatus.focus();
}

function validatePickupTime() {
    if (pickupInput.value === '') {
        return 'Choose a pickup time.';
    }
    const pickup = timeToMinutes(pickupInput.value);
    const pickupWindow = getPickupWindow(getCartCount(cart));

    if (pickupWindow.isClosedToday) {
        return getClosedTodayText(pickupWindow);
    }
    if (pickup < pickupWindow.first || pickup > pickupWindow.last) {
        return `Pickup is available between ${minutesToTime(pickupWindow.first)} and ${minutesToTime(pickupWindow.last)}.`;
    }
    if (pickup < pickupWindow.earliestToday) {
        return `Your order needs up to ${pickupWindow.preparation.max} minutes. Choose ${minutesToTime(pickupWindow.earliestToday)} or later.`;
    }
    return '';
}

function getClosedTodayText(pickupWindow) {
    return `Online pickup for today is closed (last pickup ${minutesToTime(pickupWindow.last)}). Please order tomorrow after ${CAFE_HOURS.open}.`;
}

// Tells the visitor before the submit whether the cafe takes pickups now and which time is the earliest.
function updatePickupStatus() {
    const pickupWindow = getPickupWindow(getCartCount(cart));
    const earliestText = minutesToTime(pickupWindow.earliestChoice);
    const preparationText = `your order needs up to ${pickupWindow.preparation.max} minutes`;

    if (pickupWindow.isClosedToday) {
        pickupStatus.textContent = getClosedTodayText(pickupWindow);
    } else if (pickupWindow.nowMinutes < timeToMinutes(CAFE_HOURS.open)) {
        pickupStatus.textContent = `The cafe opens at ${CAFE_HOURS.open}. Earliest pickup today: ${earliestText} (${preparationText}).`;
    } else {
        pickupStatus.textContent = `Open now until ${CAFE_HOURS.close}. Earliest pickup: ${earliestText} (${preparationText}).`;
    }
    earliestPickupButton.classList.toggle('d-none', pickupWindow.isClosedToday);
    earliestPickupButton.setAttribute('aria-label', `Use the earliest time, ${earliestText}`);
}

function useEarliestPickup() {
    pickupInput.value = minutesToTime(getPickupWindow(getCartCount(cart)).earliestChoice);
    applyValidation(pickupInput, validatePickupTime());
    pickupInput.focus();
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
        makeElement('p', 'fw-bold mb-1', `Total: ${formatPrice(order.total)} for ${order.itemCount} ${order.itemCount === 1 ? 'item' : 'items'}`),
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
    editingKey = '';
    isItemPanelOpen = false;
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

function buildOrderInterface() {
    const cartLegend = makeElement('legend', 'h5 mb-3', 'Your Cart');
    const cartActions = makeElement('div', 'd-flex flex-wrap gap-2');
    const itemActions = makeElement('div', 'd-flex flex-wrap gap-2');
    const menuLink = makeElement('a', 'btn btn-sm btn-outline-primary', 'Back to the menu');

    extrasFieldset.querySelector('legend').after(extrasNote);

    addButton.type = 'button';
    addButton.addEventListener('click', addToCart);
    cancelEditButton.type = 'button';
    cancelEditButton.addEventListener('click', cancelEditing);
    itemActions.append(addButton, cancelEditButton);
    addStatus.setAttribute('role', 'status');
    quantityFieldset.append(linePreview, itemActions, addStatus);

    cartFieldset.id = 'order-cart';
    cartStatus.setAttribute('role', 'status');
    cartStatus.tabIndex = -1;
    clearCartButton.type = 'button';
    clearCartButton.addEventListener('click', clearCart);
    addAnotherButton.type = 'button';
    addAnotherButton.addEventListener('click', openItemPanel);
    menuLink.href = 'menu.html';
    cartActions.append(addAnotherButton, menuLink, clearCartButton);
    cartList.addEventListener('click', handleCartClick);
    cartFieldset.append(cartLegend, cartStatus, cartEmpty, cartList, cartTotals, cartActions);
    // The cart comes first; the four item fieldsets move into one panel that updateItemPanel() shows or hides.
    itemFieldset.before(cartFieldset, itemPanel);
    itemPanel.append(itemFieldset, sizeSelect.closest('fieldset'), extrasFieldset, quantityFieldset);

    earliestPickupButton.type = 'button';
    earliestPickupButton.addEventListener('click', useEarliestPickup);
    pickupInput.after(pickupStatus, earliestPickupButton);

    phoneInput.placeholder = '+7 701 234 56 78';
    phoneInput.autocomplete = 'tel';
    nameInput.autocomplete = 'name';
    commentCounter.id = 'comment-counter';
    commentInput.after(commentCounter);

    orderConfirmation.tabIndex = -1;
}

function initOrderPage() {
    orderForm.noValidate = true;
    renderItemOptions();
    renderExtras();
    buildOrderInterface();

    itemSelect.addEventListener('change', () => {
        refreshItemFields('');
        if (hasFieldError(itemSelect)) {
            applyValidation(itemSelect, getSelectedItem() === null ? 'Choose a menu item.' : '');
        }
    });
    sizeSelect.addEventListener('change', updateLinePreview);
    // Delegated: one handler on the fieldset serves every checkbox that renderExtras() created.
    extrasFieldset.addEventListener('change', (event) => {
        if (event.target.name === 'extras') {
            updateLinePreview();
        }
    });
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
        // change fires when the visitor leaves a field after editing it: the field is checked then,
        // not on every key. While typing, only an error that is already shown is checked again.
        validator.control.addEventListener('change', () => {
            applyValidation(validator.control, validator.validate());
        });
        validator.control.addEventListener('input', () => {
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

    // The earliest pickup time moves with the clock, so the status is refreshed every minute.
    setInterval(updatePickupStatus, 60000);
}

initOrderPage();
