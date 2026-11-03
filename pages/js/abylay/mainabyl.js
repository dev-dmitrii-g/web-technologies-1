'use strict';

// Shared data and helpers for menu.html, order.html and subscriptions.html.

const CAFE_HOURS = { open: '09:00', close: '21:00' };

const MENU_CATEGORIES = [
    { id: 'coffee', label: 'Coffee' },
    { id: 'non-coffee', label: 'Non-Coffee Drinks' },
    { id: 'tea', label: 'Signature Tea' },
    { id: 'milkshake', label: 'Milkshakes' },
    { id: 'smoothie', label: 'Smoothies' },
    { id: 'lemonade', label: 'Lemonades' },
    { id: 'bakery', label: 'Bakery' },
    { id: 'dessert', label: 'Desserts' },
    { id: 'salad', label: 'Salads & Bowls' }
];

// Size keys match the option values of #size on order.html; '' means one standard portion.
const SIZE_LABELS = {
    '': 'Standard portion',
    s: 'Small',
    m: 'Medium',
    l: 'Large',
    '400': '400 ml',
    '900': '900 ml'
};

// Item ids match the option values of #item on order.html.
const MENU_ITEMS = [
    { id: 'espresso', name: 'Espresso', category: 'coffee', prices: { s: 990, m: 1090 } },
    { id: 'americano', name: 'Americano', category: 'coffee', prices: { s: 990, m: 1090, l: 1290 } },
    { id: 'cappuccino', name: 'Cappuccino', category: 'coffee', prices: { s: 1290, m: 1390, l: 1490 } },
    { id: 'latte', name: 'Latte', category: 'coffee', prices: { s: 1290, m: 1390, l: 1490 } },
    { id: 'flat-white', name: 'Flat White', category: 'coffee', prices: { s: 1590 } },
    { id: 'raf', name: 'Raf Coffee', category: 'coffee', prices: { m: 1790, l: 1890 } },
    { id: 'espresso-tonic', name: 'Espresso Tonic', category: 'coffee', prices: { l: 1390 } },
    { id: 'ice-cherry', name: 'Ice Cherry', category: 'coffee', prices: { l: 1490 } },
    { id: 'bumble-coffee', name: 'Bumble Coffee', category: 'coffee', prices: { l: 1390 } },
    { id: 'affogato', name: 'Affogato', category: 'coffee', prices: { s: 1590 } },

    { id: 'green-matcha', name: 'Green Matcha', category: 'non-coffee', prices: { '400': 1790 } },
    { id: 'iced-matcha', name: 'Iced Matcha Latte', category: 'non-coffee', prices: { '400': 2090 } },
    { id: 'cocoa', name: 'Cocoa', category: 'non-coffee', prices: { '400': 1290 } },

    { id: 'berry-tea', name: 'Berry Tea', category: 'tea', prices: { '400': 990, '900': 1790 } },
    { id: 'pineapple-passion', name: 'Pineapple Passion Fruit Tea', category: 'tea', prices: { '400': 990, '900': 1790 } },
    { id: 'moroccan-tea', name: 'Moroccan Tea', category: 'tea', prices: { '400': 990, '900': 1790 } },
    { id: 'tashkent-tea', name: 'Tashkent Tea', category: 'tea', prices: { '400': 990, '900': 1790 } },
    { id: 'sea-buckthorn', name: 'Sea Buckthorn and Ginger Tea', category: 'tea', prices: { '400': 990, '900': 1790 } },
    { id: 'black-tea', name: 'Black Tea', category: 'tea', prices: { '400': 490, '900': 1090 } },
    { id: 'milk-tea', name: 'Tea with Milk', category: 'tea', prices: { '400': 590, '900': 1590 } },

    { id: 'vanilla-milkshake', name: 'Vanilla Milkshake', category: 'milkshake', prices: { '400': 1590 } },
    { id: 'strawberry-milkshake', name: 'Strawberry Milkshake', category: 'milkshake', prices: { '400': 1590 } },
    { id: 'banana-milkshake', name: 'Banana Milkshake', category: 'milkshake', prices: { '400': 1590 } },
    { id: 'chocolate-milkshake', name: 'Chocolate Milkshake', category: 'milkshake', prices: { '400': 1590 } },

    { id: 'strawberry-banana', name: 'Strawberry Banana', category: 'smoothie', prices: { '400': 2490 } },
    { id: 'mango-pineapple', name: 'Mango Pineapple', category: 'smoothie', prices: { '400': 2490 } },
    { id: 'light-breakfast', name: 'Light Breakfast', category: 'smoothie', prices: { '400': 2490 } },
    { id: 'healthy-smoothie', name: 'Healthy Smoothie', category: 'smoothie', prices: { '400': 2490 } },

    { id: 'berry-lemonade', name: 'Berry Lemonade', category: 'lemonade', prices: { '400': 1490 } },
    { id: 'mango-passion-lemonade', name: 'Mango Passion Fruit Lemonade', category: 'lemonade', prices: { '400': 1490 } },
    { id: 'mojito', name: 'Mojito', category: 'lemonade', prices: { '400': 1490 } },
    { id: 'pomegranate', name: 'Pomegranate Lemonade', category: 'lemonade', prices: { '400': 1490 } },
    { id: 'citrus', name: 'Citrus Lemonade', category: 'lemonade', prices: { '400': 1490 } },
    { id: 'ice-tea', name: 'Ice Tea', category: 'lemonade', prices: { '400': 1490 } },

    { id: 'chicken-panini', name: 'Chicken Panini', category: 'bakery', prices: { '': 1290 } },
    { id: 'chicken-quesadilla', name: 'Chicken Quesadilla', category: 'bakery', prices: { '': 1390 } },
    { id: 'chicken-croissant', name: 'Chicken Croissant', category: 'bakery', prices: { '': 1290 } },
    { id: 'turkey-croissant', name: 'Turkey Croissant', category: 'bakery', prices: { '': 1290 } },
    { id: 'club-sandwich', name: 'Chicken Club Sandwich', category: 'bakery', prices: { '': 1290 } },
    { id: 'chicken-pancakes', name: 'Pancakes with Chicken and Mushrooms', category: 'bakery', prices: { '': 1190 } },
    { id: 'meat-pancakes', name: 'Pancakes with Meat', category: 'bakery', prices: { '': 1190 } },
    { id: 'french-dog', name: 'French Dog', category: 'bakery', prices: { '': 1090 } },
    { id: 'danish', name: 'Danish', category: 'bakery', prices: { '': 1290 } },
    { id: 'meat-samsa', name: 'Meat Samsa', category: 'bakery', prices: { '': 490 } },
    { id: 'chicken-samsa', name: 'Chicken Samsa', category: 'bakery', prices: { '': 490 } },
    { id: 'cheburek', name: 'Cheburek', category: 'bakery', prices: { '': 490 } },

    { id: 'granola', name: 'Granola with Yogurt', category: 'dessert', prices: { '': 1090 } },
    { id: 'tiramisu', name: 'Tiramisu Trifle', category: 'dessert', prices: { '': 1190 } },
    { id: 'pistachio-raspberry', name: 'Pistachio Raspberry Trifle', category: 'dessert', prices: { '': 1190 } },
    { id: 'banoffee', name: 'Banoffee Pie Trifle', category: 'dessert', prices: { '': 1190 } },
    { id: 'snickers', name: 'Snickers Trifle', category: 'dessert', prices: { '': 1190 } },
    { id: 'cinnabon', name: 'Cinnabon', category: 'dessert', prices: { '': 1190 } },
    { id: 'dates', name: 'Dates with Cottage Cheese', category: 'dessert', prices: { '': 1190 } },
    { id: 'condensed-milk-cookies', name: 'Cookies with Condensed Milk', category: 'dessert', prices: { '': 290 } },

    { id: 'teriyaki-bowl', name: 'Chicken Teriyaki Bowl', category: 'salad', prices: { '': 1790 } },
    { id: 'caesar', name: 'Caesar Salad', category: 'salad', prices: { '': 1790 } },
    { id: 'fitness-salad', name: 'Fitness Salad', category: 'salad', prices: { '': 1790 } }
];

// Extra ids match the checkbox values on order.html.
const EXTRAS = [
    { id: 'syrup', name: 'Syrup', price: 100, categories: ['coffee', 'non-coffee', 'tea', 'milkshake', 'lemonade'] },
    { id: 'lemon', name: 'Lemon', price: 200, categories: ['tea', 'lemonade'] },
    { id: 'milk', name: 'Milk', price: 200, categories: ['coffee', 'non-coffee', 'tea'] },
    { id: 'cream', name: 'Cream', price: 290, categories: ['coffee', 'non-coffee', 'milkshake'] },
    { id: 'extra-shot', name: 'Extra Coffee Shot', price: 350, categories: ['coffee'] },
    { id: 'alternative-milk', name: 'Alternative Milk', price: 300, categories: ['coffee', 'non-coffee'] },
    { id: 'honey', name: 'Honey', price: 200, categories: ['coffee', 'non-coffee', 'tea', 'smoothie'] },
    { id: 'marshmallow', name: 'Marshmallow', price: 200, categories: ['coffee', 'non-coffee', 'milkshake'] }
];

function findMenuItem(itemId) {
    return MENU_ITEMS.find((item) => item.id === itemId) || null;
}

function findExtra(extraId) {
    return EXTRAS.find((extra) => extra.id === extraId) || null;
}

function getCategoryLabel(categoryId) {
    const category = MENU_CATEGORIES.find((entry) => entry.id === categoryId);
    return category ? category.label : categoryId;
}

function getSizeKeys(item) {
    return Object.keys(item.prices);
}

function getUnitPrice(item, sizeKey) {
    if (item === null || !Object.hasOwn(item.prices, sizeKey)) {
        return null;
    }
    return item.prices[sizeKey];
}

function getLowestPrice(item) {
    return Math.min(...Object.values(item.prices));
}

function getExtrasForCategory(categoryId) {
    return EXTRAS.filter((extra) => extra.categories.includes(categoryId));
}

function formatPrice(amount) {
    return `${amount} ₸`;
}

function formatKzt(amount) {
    return `${amount.toLocaleString('en-US')} KZT`;
}

// Demo reference only: it is never stored or sent anywhere.
function createReference(prefix) {
    const number = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${number}`;
}

// jQuery 4.0.0 (js/jquery/jquery-4.0.0.min.js) is loaded before this file, so $ already exists here.
// These helpers only build elements and change classes; the page scripts call them inside $(function () { ... }).

// Rewritten with jQuery: $('<tag>') replaces document.createElement, .addClass() replaces className and
// .text() replaces textContent. .text() puts the value in as plain text, so a visitor's input never becomes HTML.
// It is the same length as before — the gain is that it returns a jQuery object that can be chained.
function makeElement(tagName, className, text) {
    const $element = $(`<${tagName}>`);
    if (className) {
        $element.addClass(className);
    }
    if (text !== undefined) {
        $element.text(text);
    }
    return $element;
}

function makeOption(text, value) {
    return $('<option>', { text, value });
}

// Bootstrap's d-none is display: none !important, which beats the inline style a jQuery effect sets.
// So the block is hidden by jQuery first, d-none is removed, and only then the effect ('fadeIn' or 'slideDown') runs.
function revealBlock($block, effect, duration, done) {
    return $block.stop(true, true).hide().removeClass('d-none')[effect](duration, done);
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function validateFullName(value) {
    const name = value.trim();
    if (name === '') {
        return 'Enter your full name.';
    }
    if (name.length < 2 || name.length > 50) {
        return 'The name must be 2 to 50 characters long.';
    }
    if (!/^\p{L}[\p{L}\s'-]*$/u.test(name)) {
        return 'Use letters, spaces, hyphens or apostrophes only.';
    }
    return '';
}

function validatePhone(value) {
    const phone = value.trim();
    if (phone === '') {
        return 'Enter your phone number.';
    }
    const digits = phone.replace(/[\s()-]/g, '');
    if (!/^(\+7|8)\d{10}$/.test(digits)) {
        return 'Enter a Kazakhstan number, for example +7 701 234 56 78 or 8 701 234 56 78.';
    }
    return '';
}

// Form validation, rewritten with jQuery. $control is a jQuery object: one field, or a fieldset for a radio group.
// .is('fieldset') replaces tagName === 'FIELDSET', .find() replaces querySelectorAll + Array.from,
// .removeAttr('a b') and .attr({ ... }) replace two setAttribute/removeAttribute calls each, and
// .addClass/.removeClass work on the whole set at once, so the forEach loops are gone. Shorter and clearer.
function getStateTargets($control) {
    return $control.is('fieldset') ? $control.find('.form-check-input') : $control;
}

function getFeedbackId($control) {
    return `${$control.attr('id')}-feedback`;
}

function clearFieldState($control) {
    $(`#${getFeedbackId($control)}`).remove();
    $control.removeAttr('aria-invalid aria-describedby');
    getStateTargets($control).removeClass('is-invalid is-valid');
}

// The error message is placed next to its own field, not one message for the whole form.
function setFieldError($control, message) {
    clearFieldState($control);
    const feedbackId = getFeedbackId($control);
    const $feedback = makeElement('div', 'invalid-feedback d-block', `Error: ${message}`).attr('id', feedbackId);
    if ($control.is('fieldset')) {
        $feedback.appendTo($control);
    } else {
        $control.after($feedback);
    }
    $control.attr({ 'aria-invalid': 'true', 'aria-describedby': feedbackId });
    getStateTargets($control).addClass('is-invalid');
}

function setFieldValid($control) {
    clearFieldState($control);
    if (!$control.is('fieldset')) {
        $control.attr('aria-invalid', 'false').addClass('is-valid');
    }
}

function applyValidation($control, message) {
    if (message === '') {
        setFieldValid($control);
        return true;
    }
    setFieldError($control, message);
    return false;
}

function hasFieldError($control) {
    return $(`#${getFeedbackId($control)}`).length !== 0;
}
