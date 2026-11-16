'use strict';

// Shared data and plain helpers (no DOM) for menu.html, order.html and subscriptions.html.

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

// Size keys are the keys of each item's prices; '' means one standard portion.
const SIZE_LABELS = {
    '': 'Standard portion',
    s: 'Small',
    m: 'Medium',
    l: 'Large',
    '400': '400 ml',
    '900': '900 ml'
};

// order.js builds the item list of order.html from this array; menu.js builds the menu cards from it.
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

// order.js builds the extras checkboxes of order.html from this array.
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

// The phone field always starts with the Kazakhstan code, the visitor types only the 10 digits after it.
const PHONE_PREFIX = '+7 ';
const PHONE_DIGIT_COUNT = 10;

// A full number (+7 701 234 56 78 or 8 701 234 56 78) loses its own 7 or 8, only the 10 digits stay.
function getDigitsOfFullNumber(text) {
    const digits = text.replace(/\D/g, '');
    return digits.length === PHONE_DIGIT_COUNT + 1 && /^[78]/.test(digits) ? digits.slice(1) : digits;
}

// The digits after +7. A value without +7 in front was put in whole, for example by browser autofill.
function getPhoneDigits(value) {
    const digits = value.startsWith('+7') ? value.slice(2).replace(/\D/g, '') : getDigitsOfFullNumber(value);
    return digits.slice(0, PHONE_DIGIT_COUNT);
}

function validatePhone(value) {
    const digits = getPhoneDigits(value);
    if (digits === '') {
        return 'Enter your phone number.';
    }
    if (digits.length !== PHONE_DIGIT_COUNT) {
        return `Enter all ${PHONE_DIGIT_COUNT} digits after +7, for example +7 7012345678.`;
    }
    if (!digits.startsWith('7')) {
        return 'Kazakhstan numbers start with 7 after +7, for example +7 7012345678.';
    }
    return '';
}

function keepCaretAfterPrefix(input) {
    if (input.selectionStart < PHONE_PREFIX.length) {
        input.setSelectionRange(PHONE_PREFIX.length, Math.max(input.selectionEnd, PHONE_PREFIX.length));
    }
}

// Keeps +7 in front, drops everything that is not a digit and stops at 10 digits.
function attachPhoneMask(input) {
    input.defaultValue = PHONE_PREFIX;
    input.value = PHONE_PREFIX;
    input.inputMode = 'numeric';

    // A pasted full number would bring a second 7 or 8, so only its 10 digits are put in.
    input.addEventListener('paste', (event) => {
        event.preventDefault();
        keepCaretAfterPrefix(input);
        input.setRangeText(getDigitsOfFullNumber(event.clipboardData.getData('text')), input.selectionStart, input.selectionEnd, 'end');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    input.addEventListener('input', () => {
        const value = input.value;
        const digits = getPhoneDigits(value);
        const cleanValue = PHONE_PREFIX + digits;
        if (value === cleanValue) {
            return;
        }
        // The caret stays after the same digit it was after, not at the end of the field.
        const digitsBeforeCaret = Math.min(getPhoneDigits(value.slice(0, input.selectionStart)).length, digits.length);
        input.value = cleanValue;
        input.setSelectionRange(PHONE_PREFIX.length + digitsBeforeCaret, PHONE_PREFIX.length + digitsBeforeCaret);
    });
    ['focus', 'click', 'keyup'].forEach((eventName) => {
        input.addEventListener(eventName, () => keepCaretAfterPrefix(input));
    });
}

// The cart is kept in localStorage, so items added on menu.html are waiting on order.html.
const CART_STORAGE_KEY = 'tokyo-coffee-cart';
const CART_ITEM_LIMIT = 30;

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

// One cart line. The key joins the item, its size and its extras, so the same choice is one line.
function buildCartLine(item, sizeKey, extras, quantity) {
    return {
        key: `${item.id}|${sizeKey}|${extras.map((extra) => extra.id).sort().join(',')}`,
        itemId: item.id,
        name: item.name,
        sizeKey,
        extras: extras.map((extra) => ({ id: extra.id, name: extra.name, price: extra.price })),
        unitPrice: getUnitPrice(item, sizeKey) + getExtrasTotal(extras),
        quantity
    };
}

// A saved line is rebuilt from the menu data: names and prices are never taken from the storage,
// and a line with an unknown item, size or quantity gives null.
function restoreCartLine(saved) {
    if (saved === null || typeof saved !== 'object') {
        return null;
    }
    const item = findMenuItem(saved.itemId);
    if (item === null || getUnitPrice(item, saved.sizeKey) === null) {
        return null;
    }
    if (!Number.isInteger(saved.quantity) || saved.quantity < 1) {
        return null;
    }
    const savedIds = Array.isArray(saved.extras) ? saved.extras.map((extra) => extra && extra.id) : [];
    const extras = getExtrasForCategory(item.category).filter((extra) => savedIds.includes(extra.id));
    return buildCartLine(item, saved.sizeKey, extras, saved.quantity);
}

// If the storage is blocked or holds something broken, the cart starts empty instead of throwing an error.
function readStoredCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
        const lines = [];
        let freePlaces = CART_ITEM_LIMIT;
        (Array.isArray(saved) ? saved : []).forEach((entry) => {
            const line = restoreCartLine(entry);
            if (line !== null && line.quantity <= freePlaces) {
                lines.push(line);
                freePlaces -= line.quantity;
            }
        });
        return lines;
    } catch (error) {
        return [];
    }
}

// Returns false when the browser does not let the page save the cart.
function saveStoredCart(lines) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
        return true;
    } catch (error) {
        return false;
    }
}
