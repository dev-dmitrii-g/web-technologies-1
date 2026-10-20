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
