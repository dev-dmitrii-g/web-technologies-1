'use strict';

const DRINK_CATEGORIES = ['coffee', 'non-coffee', 'tea', 'milkshake', 'smoothie', 'lemonade'];

const SORT_OPTIONS = [
    { id: 'menu', label: 'Menu order' },
    { id: 'price-asc', label: 'Price: low to high' },
    { id: 'price-desc', label: 'Price: high to low' },
    { id: 'name', label: 'Name: A to Z' }
];

const menuFilters = { category: 'all', query: '', sort: 'menu' };

const menuPageSections = Array.from(document.querySelectorAll('main > section'));
const menuTitleSection = menuPageSections[0];
const staticMenuSections = menuPageSections.slice(1, -1);

const catalogSection = makeElement('section', 'mb-4');
const featuredName = makeElement('h2', 'h3 card-title');
const featuredDetails = makeElement('p', 'mb-2');
const featuredLink = makeElement('a', 'btn btn-primary', 'Order this drink');
const searchInput = makeElement('input', 'form-control');
const sortSelect = makeElement('select', 'form-select');
const categoryGroup = makeElement('div', 'd-flex flex-wrap gap-2 mt-3');
const resultCount = makeElement('p', 'font-monospace fw-bold mb-3');
const resultGrid = makeElement('div', 'row g-4');
const emptyState = makeElement('div', 'card shadow-sm d-none');

let featuredItemId = '';

function buildOrderLink(itemId, sizeKey) {
    const params = new URLSearchParams({ item: itemId });
    if (sizeKey !== '') {
        params.set('size', sizeKey);
    }
    return `order.html?${params.toString()}`;
}

function sortMenuItems(items, sortId) {
    const sorted = items.slice();
    switch (sortId) {
        case 'price-asc':
            sorted.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
            break;
        case 'price-desc':
            sorted.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            break;
    }
    return sorted;
}

function filterMenuItems(items, filters) {
    const query = filters.query.trim().toLowerCase();
    const matches = items.filter((item) => {
        const categoryMatches = filters.category === 'all' || item.category === filters.category;
        const queryMatches = query === '' || item.name.toLowerCase().includes(query);
        return categoryMatches && queryMatches;
    });
    return sortMenuItems(matches, filters.sort);
}

function describeResults(count, filters) {
    let text = `Showing ${count} of ${MENU_ITEMS.length} items`;
    if (filters.category !== 'all') {
        text += ` in ${getCategoryLabel(filters.category)}`;
    }
    if (filters.query.trim() !== '') {
        text += ` matching "${filters.query.trim()}"`;
    }
    return `${text}.`;
}

function pickRandomDrink(items, excludedId) {
    const candidates = items.filter((item) => DRINK_CATEGORIES.includes(item.category) && item.id !== excludedId);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

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

function resetMenuFilters() {
    menuFilters.category = 'all';
    menuFilters.query = '';
    menuFilters.sort = 'menu';
    searchInput.value = '';
    sortSelect.value = 'menu';
    updateCategoryButtons();
    updateMenuResults();
    searchInput.focus();
}

function showFeaturedDrink() {
    const drink = pickRandomDrink(MENU_ITEMS, featuredItemId);
    const firstSize = getSizeKeys(drink)[0];
    featuredItemId = drink.id;
    featuredName.textContent = drink.name;
    featuredDetails.textContent = `${getCategoryLabel(drink.category)} · from ${formatPrice(getLowestPrice(drink))}`;
    featuredLink.href = buildOrderLink(drink.id, firstSize);
    featuredLink.setAttribute('aria-label', `Order ${drink.name}`);
}

function buildFeaturedCard() {
    const card = makeElement('article', 'card shadow-sm mb-4');
    const body = makeElement('div', 'card-body');
    const eyebrow = makeElement('p', 'font-monospace small text-uppercase mb-1', 'Need an idea? Barista suggestion');
    const note = makeElement('p', 'small mb-3', 'A random pick from our drinks at the regular menu price.');
    const actions = makeElement('div', 'd-flex flex-wrap gap-2');
    const anotherButton = makeElement('button', 'btn btn-outline-primary', 'Suggest another');

    anotherButton.type = 'button';
    anotherButton.addEventListener('click', showFeaturedDrink);
    featuredDetails.setAttribute('aria-live', 'polite');

    actions.append(featuredLink, anotherButton);
    body.append(eyebrow, featuredName, featuredDetails, note, actions);
    card.append(body);
    return card;
}

function buildControlsCard() {
    const card = makeElement('div', 'card shadow-sm mb-4');
    const body = makeElement('div', 'card-body');
    const heading = makeElement('h2', 'card-title mb-3', 'Find on the Menu');
    const row = makeElement('div', 'row g-3');
    const searchColumn = makeElement('div', 'col-12 col-md-5');
    const sortColumn = makeElement('div', 'col-12 col-md-4');
    const resetColumn = makeElement('div', 'col-12 col-md-3 d-flex align-items-end');
    const searchLabel = makeElement('label', 'form-label', 'Search by name');
    const sortLabel = makeElement('label', 'form-label', 'Sort by');
    const resetButton = makeElement('button', 'btn btn-outline-primary w-100 justify-content-center', 'Reset filters');

    searchInput.id = 'menu-search';
    searchInput.type = 'search';
    searchInput.maxLength = 40;
    searchInput.placeholder = 'e.g. latte, matcha, samsa';
    searchLabel.htmlFor = searchInput.id;

    sortSelect.id = 'menu-sort';
    sortLabel.htmlFor = sortSelect.id;
    SORT_OPTIONS.forEach((option) => sortSelect.append(new Option(option.label, option.id)));

    resetButton.type = 'button';
    resetButton.addEventListener('click', resetMenuFilters);

    categoryGroup.setAttribute('role', 'group');
    categoryGroup.setAttribute('aria-label', 'Filter by category');
    [{ id: 'all', label: 'All' }, ...MENU_CATEGORIES].forEach((category) => {
        const button = makeElement('button', 'btn btn-sm btn-outline-primary', category.label);
        button.type = 'button';
        button.dataset.category = category.id;
        button.addEventListener('click', () => {
            menuFilters.category = category.id;
            updateCategoryButtons();
            updateMenuResults();
        });
        categoryGroup.append(button);
    });

    searchInput.addEventListener('input', () => {
        menuFilters.query = searchInput.value;
        updateMenuResults();
    });
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && searchInput.value !== '') {
            searchInput.value = '';
            menuFilters.query = '';
            updateMenuResults();
        }
    });
    sortSelect.addEventListener('change', () => {
        menuFilters.sort = sortSelect.value;
        updateMenuResults();
    });

    searchColumn.append(searchLabel, searchInput);
    sortColumn.append(sortLabel, sortSelect);
    resetColumn.append(resetButton);
    row.append(searchColumn, sortColumn, resetColumn);
    body.append(heading, row, categoryGroup);
    card.append(body);
    return card;
}

function buildEmptyState() {
    const body = makeElement('div', 'card-body text-center');
    const message = makeElement('p', 'mb-3', 'No menu items match your search. Try another word or category.');
    const resetButton = makeElement('button', 'btn btn-primary', 'Show the full menu');
    resetButton.type = 'button';
    resetButton.addEventListener('click', resetMenuFilters);
    body.append(message, resetButton);
    emptyState.append(body);
    return emptyState;
}

function buildExtrasNote() {
    const extrasText = EXTRAS.map((extra) => `${extra.name} +${formatPrice(extra.price)}`).join(', ');
    return makeElement('p', 'small mt-4 mb-0', `Drink extras (added on the order page): ${extrasText}.`);
}

function initMenuPage() {
    resultCount.setAttribute('role', 'status');
    catalogSection.append(buildFeaturedCard(), buildControlsCard(), resultCount, resultGrid, buildEmptyState(), buildExtrasNote());

    // The static price lists are replaced by the catalogue rendered from MENU_ITEMS.
    staticMenuSections.forEach((section) => section.classList.add('d-none'));
    menuTitleSection.after(catalogSection);

    showFeaturedDrink();
    updateCategoryButtons();
    updateMenuResults();
}

initMenuPage();
