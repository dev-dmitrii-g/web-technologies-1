'use strict';

// jQuery 4.0.0, loaded from js/jquery/jquery-4.0.0.min.js before this file (the same copy the whole team uses).
// $(function () { ... }) is the short form of $(document).ready(): the code waits until the page is parsed,
// so #order-form and every field inside it already exist when they are selected.
$(function () {
    const MAX_ORDER_ITEMS = 30;
    const LAST_PICKUP_BEFORE_CLOSE = 15;
    const MAX_COMMENT_LENGTH = 200;

    // Selectors by id, and by attribute for the extras checkboxes.
    const $orderForm = $('#order-form');

    // Guard (the same idea as in js/home/*.js): without the order form there is nothing to do,
    // so the script stops here instead of throwing errors on the missing fields.
    if ($orderForm.length === 0) {
        return;
    }

    const $itemSelect = $('#item');
    const $sizeSelect = $('#size');
    const $quantityInput = $('#quantity');
    const $extrasCheckboxes = $orderForm.find('input[name="extras"]');
    const $pickupInput = $('#pickup-time');
    const $nameInput = $('#name');
    const $phoneInput = $('#phone');
    const $commentInput = $('#comment');
    const $placeOrderButton = $('#order-submit');
    const $prepOutput = $orderForm.find('p > output');
    // Traversal instead of new ids: from a field up to the fieldset it belongs to.
    const $extrasFieldset = $extrasCheckboxes.first().closest('fieldset');
    const $quantityFieldset = $quantityInput.closest('fieldset');
    const $pickupFieldset = $pickupInput.closest('fieldset');

    const $summaryItem = $('#summary-item');
    const $summarySize = $('#summary-size');
    const $summaryExtras = $('#summary-extras');
    const $summaryQuantity = $('#summary-quantity');
    const $summaryTotal = $('#order-total');
    const $orderError = $('#order-error');
    const $orderConfirmation = $('#order-confirmation');
    const $confirmationDetails = $('#order-confirmation-details');

    const $extrasNote = makeElement('p', 'small mb-2');
    const $linePreview = makeElement('p', 'font-monospace my-3');
    const $addStatus = makeElement('p', 'small mb-0 mt-2');
    const $cartFieldset = makeElement('fieldset', 'border rounded p-3 mb-4');
    const $cartList = makeElement('ul', 'list-group mb-3');
    const $cartEmpty = makeElement('p', 'mb-3', 'Your cart is empty. Choose an item above and press "Add to Cart".');
    const $cartTotals = makeElement('p', 'font-monospace fw-bold mb-3');
    const $cartStatus = makeElement('p', 'small mb-3');
    const $clearCartButton = makeElement('button', 'btn btn-sm btn-outline-secondary', 'Clear Cart');
    const $commentCounter = makeElement('p', 'small mt-1 mb-0');

    let cart = [];

    function getSelectedItem() {
        return findMenuItem($itemSelect.val());
    }

    // :checked and :not(:disabled) filters keep only the ticked extras that are available for this item.
    function getSelectedExtras() {
        return $extrasCheckboxes
            .filter(':checked:not(:disabled)')
            .map(function () {
                return findExtra($(this).val());
            })
            .get();
    }

    function readQuantity() {
        const value = String($quantityInput.val()).trim();
        const quantity = Number(value);
        if (value === '' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_ITEMS) {
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
        $sizeSelect.empty();
        if (item === null) {
            $sizeSelect.append(makeOption('Select a menu item first', '')).prop('disabled', true);
            return;
        }
        const sizeKeys = getSizeKeys(item);
        if (sizeKeys.length === 1 && sizeKeys[0] === '') {
            $sizeSelect.append(makeOption('Not Applicable', '')).prop('disabled', true);
            return;
        }
        sizeKeys.forEach((sizeKey) => {
            $sizeSelect.append(makeOption(`${SIZE_LABELS[sizeKey]} — ${formatPrice(item.prices[sizeKey])}`, sizeKey));
        });
        $sizeSelect.prop('disabled', sizeKeys.length === 1);
        if (sizeKeys.includes(preferredSize)) {
            $sizeSelect.val(preferredSize);
        }
    }

    function updateExtrasAvailability(item) {
        const allowedIds = item === null ? [] : getExtrasForCategory(item.category).map((extra) => extra.id);

        // .prop() is used, not .attr(): .prop('checked') / .prop('disabled') change the live state of the
        // checkbox right now, while .attr('checked') only changes the HTML attribute (the default state that
        // a form reset goes back to) and does not untick a box the visitor has already ticked.
        $extrasCheckboxes.each(function () {
            const isAllowed = allowedIds.includes($(this).val());
            $(this).prop('disabled', !isAllowed);
            if (!isAllowed) {
                $(this).prop('checked', false);
            }
        });

        if (item === null) {
            $extrasNote.text('Select a menu item to see which extras are available.');
        } else if (allowedIds.length === 0) {
            $extrasNote.text(`No extras are available for ${item.name}.`);
        } else {
            $extrasNote.text(`Available extras for ${item.name} are enabled below.`);
        }
    }

    function updateLinePreview() {
        const item = getSelectedItem();
        const quantity = readQuantity();
        if (item === null) {
            $linePreview.text('Select a menu item to see its price.');
            return;
        }
        if (quantity === null) {
            $linePreview.text(`Enter a quantity from 1 to ${MAX_ORDER_ITEMS}.`);
            return;
        }
        const basePrice = getUnitPrice(item, $sizeSelect.val());
        const extrasTotal = getExtrasTotal(getSelectedExtras());
        const priceText = extrasTotal > 0
            ? `(${formatPrice(basePrice)} + extras ${formatPrice(extrasTotal)})`
            : formatPrice(basePrice);
        $linePreview.text(`${item.name}: ${priceText} × ${quantity} = ${formatPrice(calculateLineSubtotal(basePrice + extrasTotal, quantity))}`);
    }

    function refreshItemFields(preferredSize) {
        const item = getSelectedItem();
        renderSizeOptions(item, preferredSize);
        updateExtrasAvailability(item);
        updateLinePreview();
    }

    function updateOrderSummary() {
        if (cart.length === 0) {
            $summaryItem.text('No item selected');
            $summarySize.text('Not selected');
            $summaryExtras.text('None');
            $summaryQuantity.text('0');
            $summaryTotal.text(formatPrice(0));
            return;
        }
        $summaryItem.text(cart.map((line) => `${line.quantity} × ${line.name}`).join(', '));
        $summarySize.text(cart.map((line) => `${line.name}: ${SIZE_LABELS[line.sizeKey]}`).join('; '));
        $summaryExtras.text(cart.map((line) => `${line.name}: ${getExtrasText(line.extras)}`).join('; '));
        $summaryQuantity.text(String(getCartCount(cart)));
        $summaryTotal.text(formatPrice(getCartTotal(cart)));
    }

    function focusCartControl(lineKey, action) {
        const $target = $cartList
            .find(`button[data-action="${action}"]`)
            .filter(function () {
                return $(this).closest('li').attr('data-key') === lineKey;
            });
        if ($target.length !== 0 && !$target.prop('disabled')) {
            $target.trigger('focus');
        } else {
            $cartStatus.trigger('focus');
        }
    }

    function makeCartButton(action, text, styleClass, label) {
        return makeElement('button', `btn btn-sm ${styleClass}`, text).attr({ type: 'button', 'data-action': action, 'aria-label': label });
    }

    // One cart line is built in code; the line key is stored on the <li>, the buttons only say what they do.
    function renderCartLine(line) {
        const $listItem = makeElement('li', 'list-group-item').attr('data-key', line.key);
        const $info = makeElement('div').append(makeElement('strong', '', line.name), makeElement('div', 'small', describeLine(line)));
        const $stepper = makeElement('div', 'd-flex align-items-center gap-1')
            .attr({ role: 'group', 'aria-label': `Quantity of ${line.name}` })
            .append(
                makeCartButton('decrease', '−', 'btn-outline-secondary', `Decrease quantity of ${line.name}`).prop('disabled', line.quantity <= 1),
                makeElement('span', 'font-monospace fw-bold px-2', String(line.quantity)).attr('aria-label', `Quantity: ${line.quantity}`),
                makeCartButton('increase', '+', 'btn-outline-secondary', `Increase quantity of ${line.name}`).prop('disabled', getCartCount(cart) >= MAX_ORDER_ITEMS)
            );
        const $controls = makeElement('div', 'd-flex flex-wrap align-items-center gap-2').append(
            $stepper,
            makeElement('span', 'font-monospace fw-bold', formatPrice(calculateLineSubtotal(line.unitPrice, line.quantity))),
            makeCartButton('remove', 'Remove', 'btn-outline-danger', `Remove ${line.name} from the cart`)
        );

        makeElement('div', 'd-flex flex-wrap justify-content-between align-items-center gap-2')
            .append($info, $controls)
            .appendTo($listItem);
        return $listItem;
    }

    function renderCart() {
        const itemCount = getCartCount(cart);
        const preparation = getPreparationRange(itemCount);
        const isEmpty = cart.length === 0;

        $cartList.empty();
        cart.forEach((line) => renderCartLine(line).appendTo($cartList));
        $cartList.toggleClass('d-none', isEmpty);
        $cartEmpty.toggleClass('d-none', !isEmpty);
        $cartTotals.text(`Items: ${itemCount} of ${MAX_ORDER_ITEMS} · Cart total: ${formatPrice(getCartTotal(cart))}`);
        $clearCartButton.prop('disabled', isEmpty);
        $placeOrderButton.prop('disabled', isEmpty);
        $prepOutput.text(`${preparation.min}–${preparation.max} minutes`);
        updateOrderSummary();

        if (!isEmpty && hasFieldError($cartFieldset)) {
            clearFieldState($cartFieldset);
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
            { control: $itemSelect, message: item === null ? 'Choose a menu item.' : '' },
            { control: $quantityInput, message: quantityMessage }
        ];
    }

    function addToCart() {
        const item = getSelectedItem();
        const quantity = readQuantity();
        const invalid = validateNewLine(item, quantity).filter((result) => !applyValidation(result.control, result.message));

        if (invalid.length !== 0) {
            $addStatus.text('The item was not added. Please fix the highlighted fields.');
            invalid[0].control.trigger('focus');
            return;
        }

        const sizeKey = $sizeSelect.val();
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
        [$itemSelect, $quantityInput].forEach((control) => clearFieldState(control));
        $orderError.addClass('d-none');
        $addStatus.text(`Added ${quantity} × ${item.name} (${SIZE_LABELS[sizeKey]}) to your cart.`);
        $quantityInput.val('1');
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
            $cartStatus.text(`One online order is limited to ${MAX_ORDER_ITEMS} items.`);
            return;
        }
        line.quantity = newQuantity;
        renderCart();
        $cartStatus.text(`${line.name}: quantity changed to ${newQuantity}.`);
        focusCartControl(lineKey, step > 0 ? 'increase' : 'decrease');
    }

    function removeCartLine(lineKey) {
        const line = cart.find((entry) => entry.key === lineKey);
        if (line === undefined) {
            return;
        }
        cart = cart.filter((entry) => entry.key !== lineKey);
        renderCart();
        $cartStatus.text(`${line.name} was removed from your cart.`).trigger('focus');
    }

    function clearCart() {
        cart = [];
        renderCart();
        $cartStatus.text('Your cart was cleared.').trigger('focus');
    }

    function validatePickupTime() {
        const value = $pickupInput.val();
        if (value === '') {
            return 'Choose a pickup time.';
        }
        const pickup = timeToMinutes(value);
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
        const length = String($commentInput.val()).trim().length;
        if (length > MAX_COMMENT_LENGTH) {
            return `Order notes can be up to ${MAX_COMMENT_LENGTH} characters (now ${length}).`;
        }
        return '';
    }

    const orderValidators = [
        { control: $pickupInput, event: 'change', validate: validatePickupTime },
        { control: $nameInput, event: 'input', validate: () => validateFullName(String($nameInput.val())) },
        { control: $phoneInput, event: 'input', validate: () => validatePhone(String($phoneInput.val())) },
        { control: $commentInput, event: 'input', validate: validateComment }
    ];

    function updateCommentCounter() {
        const length = String($commentInput.val()).trim().length;
        $commentCounter
            .text(`${length} / ${MAX_COMMENT_LENGTH} characters`)
            .toggleClass('text-danger', length > MAX_COMMENT_LENGTH);
    }

    // Rewritten with jQuery (old version in js/abylay/old/old-js-version.js): .add() joins the three blocks into
    // one set, so one .addClass('d-none') replaces three classList.add() lines; .stop() also cancels a fade
    // that is still running. Shorter and clearer.
    function hideOrderResult() {
        $orderError.add($orderConfirmation).add($confirmationDetails).stop(true, true).addClass('d-none');
    }

    // Rewritten with jQuery: .html() + .empty().append() replace replaceChildren(), and revealBlock()
    // (.hide().removeClass('d-none').fadeIn()) replaces classList.remove('d-none'). The code is about as
    // long as before; what it adds is the fade and the callback, which plain JavaScript would need a timer for.
    function showOrderConfirmation(order) {
        const $list = makeElement('ul', 'mb-2');
        order.lines.forEach((line) => {
            const text = `${line.quantity} × ${line.name} (${describeLine(line)}) — ${formatPrice(calculateLineSubtotal(line.unitPrice, line.quantity))}`;
            makeElement('li', '', text).appendTo($list);
        });

        // .html() parses the string as markup, so the <strong> becomes bold text; .text() would show the tags
        // literally. .html() is safe here only because this string is written in the code (the reference is
        // digits from createReference); everything the visitor typed is inserted with .text() below.
        $orderConfirmation.html(
            `<strong>Demo order request ${order.reference} is ready.</strong> ` +
            'This is a front-end demonstration: no data was sent to a server and no real order or payment was created.'
        );
        $confirmationDetails.empty().append(
            makeElement('h3', 'h5', 'Your order details'),
            $list,
            makeElement('p', 'fw-bold mb-1', `Total: ${formatPrice(order.total)} for ${order.itemCount} item(s)`),
            makeElement('p', 'mb-1', `Pickup: today at ${order.pickupTime} (preparation ${order.preparation})`),
            makeElement('p', 'mb-1', `Name: ${order.name}`),
            makeElement('p', 'mb-1', `Phone: ${order.phone}`),
            makeElement('p', 'mb-0', `Notes: ${order.comment === '' ? 'none' : order.comment}`)
        );

        // fadeIn for 400 ms; the callback moves focus to the message only once it is visible,
        // because a block that is still hidden cannot take focus.
        revealBlock($confirmationDetails, 'fadeIn', 400);
        revealBlock($orderConfirmation, 'fadeIn', 400, function () {
            $(this).trigger('focus');
        });
    }

    // The required attributes stay in order.html as the first line of defence: if this script does not load,
    // the browser still blocks an empty form. But every check in the browser (HTML or jQuery) runs on the
    // visitor's computer and can be switched off or skipped by sending the request directly, so a real
    // server must check all the data again before it accepts an order.
    function handleOrderSubmit(event) {
        // Without preventDefault() the browser would send the form the normal way (method="get"): the page
        // would reload with the fields in the URL, the cart would be lost and no error or summary would be shown.
        event.preventDefault();

        const invalidControls = orderValidators
            .filter((validator) => !applyValidation(validator.control, validator.validate()))
            .map((validator) => validator.control);

        if (cart.length === 0) {
            setFieldError($cartFieldset, 'Add at least one item to your cart.');
            invalidControls.unshift($itemSelect);
        }

        if (invalidControls.length !== 0) {
            $orderConfirmation.add($confirmationDetails).stop(true, true).addClass('d-none');
            if ($orderError.hasClass('d-none')) {
                revealBlock($orderError, 'slideDown', 200);
            }
            invalidControls[0].trigger('focus');
            return;
        }

        const order = {
            reference: createReference('TC'),
            lines: cart.map((line) => ({ ...line })),
            itemCount: getCartCount(cart),
            total: getCartTotal(cart),
            preparation: $prepOutput.text(),
            pickupTime: $pickupInput.val(),
            name: String($nameInput.val()).trim(),
            phone: String($phoneInput.val()).trim(),
            comment: String($commentInput.val()).trim()
        };

        // trigger('reset') runs handleOrderReset and then the form's own reset(), so the form is emptied.
        $orderForm.trigger('reset');
        showOrderConfirmation(order);
    }

    function handleOrderReset() {
        cart = [];
        [$itemSelect, $quantityInput, $cartFieldset, ...orderValidators.map((validator) => validator.control)]
            .forEach((control) => clearFieldState(control));
        hideOrderResult();
        $addStatus.text('');
        $cartStatus.text('');

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
        $itemSelect.val(item.id);
        refreshItemFields(params.get('size'));
        $addStatus.text(`${item.name} was selected from the menu. Choose extras and press "Add to Cart".`);
    }

    function buildOrderInterface() {
        const $addButton = makeElement('button', 'btn btn-primary', 'Add to Cart').attr('type', 'button').on('click', addToCart);

        $extrasFieldset.find('legend').after($extrasNote);

        $linePreview.attr('aria-live', 'polite');
        $addStatus.attr('role', 'status');
        $quantityFieldset.append($linePreview, $addButton, $addStatus);

        $cartStatus.attr({ role: 'status', tabindex: '-1' });
        $clearCartButton.attr('type', 'button').on('click', clearCart);
        $cartFieldset
            .attr('id', 'order-cart')
            .append(
                makeElement('legend', 'h5 mb-3', 'Your Cart'),
                $cartStatus,
                $cartEmpty,
                $cartList,
                $cartTotals,
                makeElement('div', 'd-flex flex-wrap gap-2').append($clearCartButton)
            );
        $pickupFieldset.before($cartFieldset);

        $phoneInput.attr({ placeholder: '+7 701 234 56 78', autocomplete: 'tel' });
        $nameInput.attr('autocomplete', 'name');
        $commentCounter.attr('id', 'comment-counter');
        $commentInput.after($commentCounter);

        $orderConfirmation.attr('tabindex', '-1');
    }

    function bindOrderEvents() {
        $itemSelect.on('change', function () {
            refreshItemFields('');
            if (hasFieldError($itemSelect)) {
                applyValidation($itemSelect, getSelectedItem() === null ? 'Choose a menu item.' : '');
            }
        });
        $sizeSelect.on('change', updateLinePreview);
        $extrasCheckboxes.on('change', updateLinePreview);
        $quantityInput
            .on('input', function () {
                updateLinePreview();
                if (hasFieldError($(this))) {
                    clearFieldState($(this));
                }
            })
            .on('keydown', function (event) {
                if (event.key === 'Enter') {
                    // Without preventDefault() Enter in this field would submit the whole order form.
                    event.preventDefault();
                    addToCart();
                }
            });

        // Delegated handler: bound once to the cart list, which exists from the start. The +, − and Remove
        // buttons are rebuilt by renderCart() after every change, so handlers bound directly to them
        // ($cartList.find('button').on('click', ...)) would be lost with the old buttons and the new ones
        // would not react. The click bubbles up to the list and jQuery runs the handler only if it started
        // on a button with data-action.
        $cartList.on('click', 'button[data-action]', function () {
            const $line = $(this).closest('li');
            const lineKey = $line.attr('data-key');
            const action = $(this).attr('data-action');

            if (action === 'remove') {
                // fadeOut: the line fades away first; the callback removes it from the cart after the effect.
                $line.find('button').prop('disabled', true);
                $line.fadeOut(250, () => removeCartLine(lineKey));
                return;
            }
            changeLineQuantity(lineKey, action === 'increase' ? 1 : -1);
        });

        // As soon as the visitor fixes a field that shows an error, the error is checked again and cleared.
        orderValidators.forEach((validator) => {
            validator.control.on(validator.event, function () {
                if (hasFieldError(validator.control)) {
                    applyValidation(validator.control, validator.validate());
                }
            });
        });
        $commentInput.on('input', updateCommentCounter);

        $orderForm.on('submit', handleOrderSubmit).on('reset', handleOrderReset);
    }

    function initOrderPage() {
        // Our jQuery checks replace the browser's bubbles, so they are turned off here (not in the HTML).
        $orderForm.prop('noValidate', true);
        buildOrderInterface();
        bindOrderEvents();

        refreshItemFields('');
        renderCart();
        updateCommentCounter();
        applyMenuSelection();
    }

    initOrderPage();
});
