'use strict';

$(function () {
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

    const FAVORITES_STORAGE_KEY = 'tokyo-coffee-menu-favorites';

    const menuFilters = { category: 'all', query: '', sort: 'menu' };

    const $menuPageSections = $('main > section');
    const $menuTitleSection = $menuPageSections.first();
    const $staticMenuSections = $menuPageSections.slice(1, -1);

    const $catalogSection = makeElement('section', 'mb-4');
    const $featuredName = makeElement('h2', 'h3 card-title');
    const $featuredBody = makeElement('div', 'card-body');
    const $featuredDetails = makeElement('p', 'mb-2');
    const $featuredAddButton = makeElement('button', 'btn btn-primary', 'Add to cart');
    const $searchInput = makeElement('input', 'form-control');
    const $sortSelect = makeElement('select', 'form-select');
    const $categoryGroup = makeElement('div', 'd-flex flex-wrap gap-2 mt-3');
    const $resultCount = makeElement('p', 'font-monospace fw-bold mb-3');
    const $resultGrid = makeElement('div');
    const $emptyState = makeElement('div', 'card shadow-sm d-none');
    const $emptyText = makeElement('p', 'mb-3');
    // 5rem above the window edge: the theme button of the site is fixed in the bottom right corner
    // and on a phone it would cover "Open cart".
    const $cartBar = makeElement('div', 'card shadow sticky-bottom d-none mt-4').css('bottom', '5rem');
    const $cartSummary = makeElement('p', 'fw-bold mb-0');
    const $cartMessage = makeElement('p', 'small mb-0');

    let featuredItemId = '';
    let favoriteIds = readFavorites();
    // The same cart as on order.html: the cart functions used here are in mainabyl.js.
    let cartLines = readStoredCart();

    // Favorites stay in this browser only. If the storage is blocked or holds something broken,
    // the page starts with an empty list instead of throwing an error.
    function readFavorites() {
        try {
            const saved = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
            return Array.isArray(saved) ? saved.filter((itemId) => findMenuItem(itemId) !== null) : [];
        } catch (error) {
            return [];
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
        } catch (error) {
            // Storage is blocked: the favorites still work until the page is closed.
        }
    }

    function isFavorite(itemId) {
        return favoriteIds.includes(itemId);
    }

    function toggleFavorite(itemId) {
        favoriteIds = isFavorite(itemId)
            ? favoriteIds.filter((favoriteId) => favoriteId !== itemId)
            : [...favoriteIds, itemId];
        saveFavorites();
        return isFavorite(itemId);
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
            const categoryMatches = filters.category === 'favorites'
                ? isFavorite(item.id)
                : filters.category === 'all' || item.category === filters.category;
            const queryMatches = query === '' || item.name.toLowerCase().includes(query);
            return categoryMatches && queryMatches;
        });
        return sortMenuItems(matches, filters.sort);
    }

    function describeResults(count, filters) {
        let text = `Showing ${count} of ${MENU_ITEMS.length} items`;
        if (filters.category === 'favorites') {
            text += ' in your favorites';
        } else if (filters.category !== 'all') {
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

    // How many of this item are in the cart, in every size and with any extras.
    function describeInCart(itemId) {
        const count = getCartCount(cartLines.filter((line) => line.itemId === itemId));
        return count === 0 ? '' : `In cart: ${count}`;
    }

    function updateCartBar(message) {
        const count = getCartCount(cartLines);
        $cartSummary.text(`Cart: ${count} ${count === 1 ? 'item' : 'items'} · ${formatPrice(getCartTotal(cartLines))}`);
        $cartMessage.text(message);

        if (count === 0) {
            $cartBar.stop(true, true).addClass('d-none');
        } else if ($cartBar.hasClass('d-none')) {
            revealBlock($cartBar, 'slideDown', 200);
        }
    }

    // Adds one piece without extras; the same item and size again raises the quantity of its line.
    function addToCart(item, sizeKey) {
        if (getCartCount(cartLines) >= CART_ITEM_LIMIT) {
            updateCartBar(`One online order is limited to ${CART_ITEM_LIMIT} items. Open the cart to change it.`);
            return;
        }

        const newLine = buildCartLine(item, sizeKey, [], 1);
        const sameLine = cartLines.find((line) => line.key === newLine.key);
        if (sameLine !== undefined) {
            sameLine.quantity += 1;
        } else {
            cartLines.push(newLine);
        }

        const lineText = `${item.name} (${SIZE_LABELS[sizeKey]})`;
        const message = saveStoredCart(cartLines)
            ? `Added ${lineText}. Extras and quantities can be changed in the cart.`
            : `Added ${lineText}, but this browser blocks saved data, so the cart cannot be opened on the order page.`;
        $resultGrid.find(`[data-item="${item.id}"] [data-role="in-cart"]`).text(describeInCart(item.id));
        updateCartBar(message);
    }

    // The cart can change outside this page: on order.html before "Back" is pressed, or in another tab.
    function refreshCart() {
        cartLines = readStoredCart();
        $resultGrid.find('[data-item]').each(function () {
            $(this).find('[data-role="in-cart"]').text(describeInCart($(this).attr('data-item')));
        });
        updateCartBar('');
    }

    function updateCardSelection(item, sizeKey, $card) {
        const sizeText = SIZE_LABELS[sizeKey];
        $card.find('[data-role="price"]').text(`${sizeText}: ${formatPrice(getUnitPrice(item, sizeKey))}`);
        $card.find('button[data-action="add"]').attr('aria-label', `Add to cart: ${item.name}, ${sizeText}`);
    }

    function setFavoriteButtonState($button, itemName, saved) {
        $button
            .text(saved ? '★ Saved' : '☆ Save')
            .toggleClass('btn-primary', saved)
            .toggleClass('btn-outline-primary', !saved)
            .attr({
                'aria-pressed': String(saved),
                'aria-label': saved ? `Remove ${itemName} from favorites` : `Save ${itemName} to favorites`
            });
    }

    function renderMenuCard(item) {
        const sizeKeys = getSizeKeys(item);
        const $column = makeElement('div', 'col-12 col-md-6 col-lg-4');
        const $card = makeElement('article', 'card h-100 shadow-sm').attr('data-item', item.id).appendTo($column);
        const $body = makeElement('div', 'card-body d-flex flex-column').appendTo($card);

        const $favoriteButton = makeElement('button', 'btn btn-sm').attr({ type: 'button', 'data-action': 'favorite' });
        setFavoriteButtonState($favoriteButton, item.name, isFavorite(item.id));

        $body.append(
            makeElement('div', 'd-flex justify-content-between align-items-start gap-2 mb-2').append(
                makeElement('span', 'badge bg-secondary text-white', getCategoryLabel(item.category)),
                $favoriteButton
            ),
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
            makeElement('div', 'd-flex flex-wrap align-items-center gap-2 mt-auto').append(
                makeElement('button', 'btn btn-primary', 'Add to cart').attr({ type: 'button', 'data-action': 'add' }),
                makeElement('span', 'small fw-bold', describeInCart(item.id)).attr('data-role', 'in-cart')
            )
        );
        updateCardSelection(item, sizeKeys[0], $card);
        return $column;
    }

    // Blocks by category only for the full menu in menu order: a price or name sort, one category
    // or the favorites stay one flat list, so the chosen order is not broken up.
    function isGroupedView(filters) {
        return filters.category === 'all' && filters.sort === 'menu';
    }

    function renderCardRow(items) {
        const $row = makeElement('div', 'row g-4');
        items.forEach((item) => renderMenuCard(item).appendTo($row));
        return $row;
    }

    function renderCategoryBlocks(items) {
        return MENU_CATEGORIES
            .map((category) => ({ category, items: items.filter((item) => item.category === category.id) }))
            .filter((group) => group.items.length !== 0)
            .map((group) => {
                const headingId = `menu-group-${group.category.id}`;
                return makeElement('section', 'mb-5').attr('aria-labelledby', headingId).append(
                    makeElement('h2', 'h4 mb-3', group.category.label).attr('id', headingId),
                    renderCardRow(group.items)
                );
            });
    }

    function updateMenuResults() {
        const visibleItems = filterMenuItems(MENU_ITEMS, menuFilters);
        const hasResults = visibleItems.length !== 0;

        $resultGrid
            .empty()
            .append(isGroupedView(menuFilters) ? renderCategoryBlocks(visibleItems) : renderCardRow(visibleItems));
        $resultGrid.toggleClass('d-none', !hasResults);
        $resultCount.text(describeResults(visibleItems.length, menuFilters));
        $emptyText.text(describeEmptyState(menuFilters));

        if (hasResults) {
            $emptyState.stop(true, true).addClass('d-none');
        } else if ($emptyState.hasClass('d-none')) {
            revealBlock($emptyState, 'slideDown', 250);
        }
    }

    function describeEmptyState(filters) {
        if (filters.category === 'favorites' && favoriteIds.length === 0) {
            return 'You have no favorites yet. Press "☆ Save" on any item to keep it here.';
        }
        if (filters.category === 'favorites') {
            return 'None of your favorites match your search. Try another word.';
        }
        return 'No menu items match your search. Try another word or category.';
    }

    function updateFavoritesButton() {
        $categoryGroup.find('button[data-category="favorites"]').text(`★ Favorites (${favoriteIds.length})`);
    }

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
        $featuredAddButton.attr('aria-label', `Add to cart: ${drink.name}, ${SIZE_LABELS[getSizeKeys(drink)[0]]}`);
    }

    function addFeaturedDrink() {
        const drink = findMenuItem(featuredItemId);
        addToCart(drink, getSizeKeys(drink)[0]);
    }

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

        $featuredAddButton.attr('type', 'button').on('click', addFeaturedDrink);
        $featuredDetails.attr('aria-live', 'polite');
        $featuredBody.append(
            makeElement('p', 'font-monospace small text-uppercase mb-1', 'Need an idea? Barista suggestion'),
            $featuredName,
            $featuredDetails,
            makeElement('p', 'small mb-3', 'A random pick from our drinks at the regular menu price.'),
            makeElement('div', 'd-flex flex-wrap gap-2').append($featuredAddButton, $anotherButton)
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
        [{ id: 'all', label: 'All' }, { id: 'favorites', label: '★ Favorites' }, ...MENU_CATEGORIES].forEach((category) => {
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
            .append($emptyText, $resetButton)
            .appendTo($emptyState);
        return $emptyState;
    }

    // Stays at the bottom of the window while the visitor scrolls the menu, so the cart is always one click away.
    function buildCartBar() {
        $cartMessage.attr('role', 'status');
        makeElement('div', 'card-body d-flex flex-wrap justify-content-between align-items-center gap-2')
            .append(
                makeElement('div').append($cartSummary, $cartMessage),
                makeElement('a', 'btn btn-primary', 'Open cart').attr('href', 'order.html')
            )
            .appendTo($cartBar);
        return $cartBar;
    }

    function buildExtrasNote() {
        const extrasText = EXTRAS.map((extra) => `${extra.name} +${formatPrice(extra.price)}`).join(', ');
        return makeElement('p', 'small mt-4 mb-0', `Drink extras (added on the order page): ${extrasText}.`);
    }

    function bindMenuEvents() {
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

        // Delegated like the size selects: the cards are rebuilt on every filter change.
        $resultGrid.on('click', 'button[data-action="favorite"]', function () {
            const $card = $(this).closest('[data-item]');
            const item = findMenuItem($card.attr('data-item'));
            const saved = toggleFavorite(item.id);
            setFavoriteButtonState($(this), item.name, saved);
            updateFavoritesButton();

            // In the favorites view a removed item fades out, then the list and the count are rebuilt.
            if (menuFilters.category === 'favorites' && !saved) {
                $card.parent().fadeOut(200, updateMenuResults);
            }
        });

        $resultGrid.on('click', 'button[data-action="add"]', function () {
            const $card = $(this).closest('[data-item]');
            const item = findMenuItem($card.attr('data-item'));
            const $sizeSelect = $card.find('select');
            addToCart(item, $sizeSelect.length === 0 ? getSizeKeys(item)[0] : $sizeSelect.val());
        });

        $(window).on('pageshow storage', refreshCart);

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
        $catalogSection.append(buildFeaturedCard(), buildControlsCard(), $resultCount, $resultGrid, buildEmptyState(), buildExtrasNote(), buildCartBar());

        $staticMenuSections.addClass('d-none');
        $menuTitleSection.after($catalogSection);

        bindMenuEvents();
        fillFeaturedDrink();
        updateCategoryButtons();
        updateFavoritesButton();
        updateMenuResults();
        updateCartBar('');
    }

    initMenuPage();
});
