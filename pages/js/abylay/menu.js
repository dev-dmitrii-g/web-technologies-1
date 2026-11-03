'use strict';

// jQuery 4.0.0, loaded from js/jquery/jquery-4.0.0.min.js before this file (the same copy the whole team uses).
// $(function () { ... }) is the short form of $(document).ready(): the code inside runs only after the page
// is fully parsed, so every element it selects (main, its sections) already exists.
$(function () {
    // Guard (the same idea as in js/home/*.js): #coffee-menu is the static price list this script replaces.
    // On a page without it the script stops here instead of building the catalogue or throwing console errors.
    if ($('#coffee-menu').length === 0) {
        return;
    }

    const DRINK_CATEGORIES = ['coffee', 'non-coffee', 'tea', 'milkshake', 'smoothie', 'lemonade'];

    const SORT_OPTIONS = [
        { id: 'menu', label: 'Menu order' },
        { id: 'price-asc', label: 'Price: low to high' },
        { id: 'price-desc', label: 'Price: high to low' },
        { id: 'name', label: 'Name: A to Z' }
    ];

    const menuFilters = { category: 'all', query: '', sort: 'menu' };

    // Element selector: the first section is the page title, the last one is the note at the bottom.
    const $menuPageSections = $('main > section');
    const $menuTitleSection = $menuPageSections.first();
    const $staticMenuSections = $menuPageSections.slice(1, -1);

    const $catalogSection = makeElement('section', 'mb-4');
    const $featuredBody = makeElement('div', 'card-body');
    const $featuredName = makeElement('h2', 'h3 card-title');
    const $featuredDetails = makeElement('p', 'mb-2');
    const $featuredLink = makeElement('a', 'btn btn-primary', 'Order this drink');
    const $searchInput = makeElement('input', 'form-control');
    const $sortSelect = makeElement('select', 'form-select');
    const $categoryGroup = makeElement('div', 'd-flex flex-wrap gap-2 mt-3');
    const $resultCount = makeElement('p', 'font-monospace fw-bold mb-3');
    const $resultGrid = makeElement('div', 'row g-4');
    const $emptyState = makeElement('div', 'card shadow-sm d-none');

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

    // Attribute selectors [data-role="..."] reach the price and the link inside one card.
    function updateCardSelection(item, sizeKey, $card) {
        const sizeText = SIZE_LABELS[sizeKey];
        $card.find('[data-role="price"]').text(`${sizeText}: ${formatPrice(getUnitPrice(item, sizeKey))}`);
        $card.find('[data-role="order"]').attr({
            href: buildOrderLink(item.id, sizeKey),
            'aria-label': `Order ${item.name}, ${sizeText}`
        });
    }

    // Rewritten with jQuery (old version in js/abylay/old/old-js-version.js): makeElement now returns jQuery objects,
    // .attr() replaces htmlFor/id/href assignments, and .appendTo/.append build the card. The per-card
    // addEventListener('change') is gone — one delegated .on() handler on the grid serves every card.
    // It is a little shorter, and clearer because no listener is created again on every re-render.
    function renderMenuCard(item) {
        const sizeKeys = getSizeKeys(item);
        const $column = makeElement('div', 'col-12 col-md-6 col-lg-4');
        const $card = makeElement('article', 'card h-100 shadow-sm').attr('data-item', item.id).appendTo($column);
        const $body = makeElement('div', 'card-body d-flex flex-column').appendTo($card);

        $body.append(
            makeElement('span', 'badge bg-secondary text-white align-self-start mb-2', getCategoryLabel(item.category)),
            makeElement('h3', 'h5 card-title', item.name)
        );

        if (sizeKeys.length > 1) {
            const selectId = `menu-size-${item.id}`;
            const $select = makeElement('select', 'form-select form-select-sm mb-2').attr('id', selectId);
            sizeKeys.forEach((sizeKey) => {
                $select.append(makeOption(`${SIZE_LABELS[sizeKey]} — ${formatPrice(item.prices[sizeKey])}`, sizeKey));
            });
            $body.append(makeElement('label', 'form-label small mb-1', 'Size').attr('for', selectId), $select);
        }

        $body.append(
            makeElement('p', 'font-monospace mb-3').attr('data-role', 'price'),
            makeElement('a', 'btn btn-primary mt-auto align-self-start', 'Order this').attr('data-role', 'order')
        );
        updateCardSelection(item, sizeKeys[0], $card);
        return $column;
    }

    // The list of cards is built from the MENU_ITEMS array with .appendTo(); none of this markup is in menu.html.
    function updateMenuResults() {
        const visibleItems = filterMenuItems(MENU_ITEMS, menuFilters);
        const hasResults = visibleItems.length !== 0;

        $resultGrid.empty();
        visibleItems.forEach((item) => renderMenuCard(item).appendTo($resultGrid));
        $resultGrid.toggleClass('d-none', !hasResults);
        $resultCount.text(describeResults(visibleItems.length, menuFilters));

        if (hasResults) {
            $emptyState.stop(true, true).addClass('d-none');
        } else if ($emptyState.hasClass('d-none')) {
            // slideDown: the "nothing found" card slides in when the visitor's search leaves no results.
            revealBlock($emptyState, 'slideDown', 250);
        }
    }

    // .each() with $(this) walks over every category button.
    function updateCategoryButtons() {
        $categoryGroup.find('button').each(function () {
            const $button = $(this);
            const isActive = $button.attr('data-category') === menuFilters.category;
            $button
                .toggleClass('active btn-primary', isActive)
                .toggleClass('btn-outline-primary', !isActive)
                .attr('aria-pressed', String(isActive));
        });
    }

    function resetMenuFilters() {
        menuFilters.category = 'all';
        menuFilters.query = '';
        menuFilters.sort = 'menu';
        $sortSelect.val('menu');
        updateCategoryButtons();
        updateMenuResults();
        $searchInput.val('').trigger('focus');
    }

    function fillFeaturedDrink() {
        const drink = pickRandomDrink(MENU_ITEMS, featuredItemId);
        featuredItemId = drink.id;
        $featuredName.text(drink.name);
        $featuredDetails.text(`${getCategoryLabel(drink.category)} · from ${formatPrice(getLowestPrice(drink))}`);
        $featuredLink.attr({
            href: buildOrderLink(drink.id, getSizeKeys(drink)[0]),
            'aria-label': `Order ${drink.name}`
        });
    }

    // .animate() fades the old suggestion out in 150 ms; its callback runs after that, swaps the drink
    // and fades the card back in, so the visitor sees that a new drink was picked.
    function showFeaturedDrink() {
        $featuredBody.stop(true, true).animate({ opacity: 0 }, 150, function () {
            fillFeaturedDrink();
            $(this).animate({ opacity: 1 }, 150);
        });
    }

    function buildFeaturedCard() {
        const $anotherButton = makeElement('button', 'btn btn-outline-primary', 'Suggest another')
            .attr('type', 'button')
            .on('click', showFeaturedDrink);

        $featuredDetails.attr('aria-live', 'polite');
        $featuredBody.append(
            makeElement('p', 'font-monospace small text-uppercase mb-1', 'Need an idea? Barista suggestion'),
            $featuredName,
            $featuredDetails,
            makeElement('p', 'small mb-3', 'A random pick from our drinks at the regular menu price.'),
            makeElement('div', 'd-flex flex-wrap gap-2').append($featuredLink, $anotherButton)
        );
        return makeElement('article', 'card shadow-sm mb-4').append($featuredBody);
    }

    function buildControlsCard() {
        const $searchColumn = makeElement('div', 'col-12 col-md-5');
        const $sortColumn = makeElement('div', 'col-12 col-md-4');
        const $resetColumn = makeElement('div', 'col-12 col-md-3 d-flex align-items-end');
        const $resetButton = makeElement('button', 'btn btn-outline-primary w-100 justify-content-center', 'Reset filters')
            .attr('type', 'button')
            .on('click', resetMenuFilters);

        $searchInput.attr({ id: 'menu-search', type: 'search', maxlength: '40', placeholder: 'e.g. latte, matcha, samsa' });
        $sortSelect.attr('id', 'menu-sort');
        SORT_OPTIONS.forEach((option) => $sortSelect.append(makeOption(option.label, option.id)));

        $categoryGroup.attr({ role: 'group', 'aria-label': 'Filter by category' });
        [{ id: 'all', label: 'All' }, ...MENU_CATEGORIES].forEach((category) => {
            makeElement('button', 'btn btn-sm btn-outline-primary', category.label)
                .attr({ type: 'button', 'data-category': category.id })
                .appendTo($categoryGroup);
        });

        $searchColumn.append(makeElement('label', 'form-label', 'Search by name').attr('for', 'menu-search'), $searchInput);
        $sortColumn.append(makeElement('label', 'form-label', 'Sort by').attr('for', 'menu-sort'), $sortSelect);
        $resetColumn.append($resetButton);

        const $body = makeElement('div', 'card-body').append(
            makeElement('h2', 'card-title mb-3', 'Find on the Menu'),
            makeElement('div', 'row g-3').append($searchColumn, $sortColumn, $resetColumn),
            $categoryGroup
        );
        return makeElement('div', 'card shadow-sm mb-4').append($body);
    }

    function buildEmptyState() {
        const $resetButton = makeElement('button', 'btn btn-primary', 'Show the full menu')
            .attr('type', 'button')
            .on('click', resetMenuFilters);
        makeElement('div', 'card-body text-center')
            .append(makeElement('p', 'mb-3', 'No menu items match your search. Try another word or category.'), $resetButton)
            .appendTo($emptyState);
        return $emptyState;
    }

    function buildExtrasNote() {
        const extrasText = EXTRAS.map((extra) => `${extra.name} +${formatPrice(extra.price)}`).join(', ');
        return makeElement('p', 'small mt-4 mb-0', `Drink extras (added on the order page): ${extrasText}.`);
    }

    function bindMenuEvents() {
        // Chain: $(this) is the clicked button → mark it active (2 classes + aria) → .siblings() moves to
        // the other category buttons → un-mark them. One chain replaces a loop over all buttons.
        $categoryGroup.on('click', 'button', function () {
            menuFilters.category = $(this).attr('data-category');
            $(this)
                .addClass('active btn-primary')
                .removeClass('btn-outline-primary')
                .attr('aria-pressed', 'true')
                .siblings()
                .removeClass('active btn-primary')
                .addClass('btn-outline-primary')
                .attr('aria-pressed', 'false');
            updateMenuResults();
        });

        // Delegated handler: bound once to the grid, which exists from the start; the size selects inside the
        // cards are created later and thrown away on every filter change. $resultGrid.find('select').on(...)
        // would only reach the selects that exist at that moment — the new cards would get no handler.
        // The change event bubbles up to the grid, and jQuery checks that it started on a <select>.
        $resultGrid.on('change', 'select', function () {
            const $card = $(this).closest('[data-item]');
            updateCardSelection(findMenuItem($card.attr('data-item')), $(this).val(), $card);
        });

        $searchInput
            .on('input', function () {
                menuFilters.query = $(this).val();
                updateMenuResults();
            })
            .on('keydown', function (event) {
                if (event.key === 'Escape' && $(this).val() !== '') {
                    $(this).val('');
                    menuFilters.query = '';
                    updateMenuResults();
                }
            });

        $sortSelect.on('change', function () {
            menuFilters.sort = $(this).val();
            updateMenuResults();
        });
    }

    function initMenuPage() {
        $resultCount.attr('role', 'status');
        $catalogSection.append(buildFeaturedCard(), buildControlsCard(), $resultCount, $resultGrid, buildEmptyState(), buildExtrasNote());

        // The static price lists are replaced by the catalogue rendered from MENU_ITEMS.
        $staticMenuSections.addClass('d-none');
        $menuTitleSection.after($catalogSection);

        bindMenuEvents();
        fillFeaturedDrink();
        updateCategoryButtons();
        updateMenuResults();
    }

    initMenuPage();
});
