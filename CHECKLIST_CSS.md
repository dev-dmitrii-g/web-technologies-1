# CSS CHECKLIST
**Assignment 2**  
**Team:** Dmitriy Gagarin, Sultan-Ali Rakhmetolla & Abylay Opayev

## 1. SELECTORS
* **Type selector:** `base.css`, Line 24 (`body`) - Dmitriy/Sultan-Ali
* **Class selector:** `base.css`, Line 163 (`.content-card`) - Dmitriy/Sultan-Ali
* **ID selector:** `gagarin.css`, Line 1 (`#hero-split`) - Dmitriy
* **Descendant selector:** `gagarin.css`, Line 8 (`#hero-split .hero-text`) - Dmitriy
* **Child selector (>):** `gagarin.css`, Line 27 (`#home-features > article`) - Dmitriy
* **Adjacent sibling (+):** `gagarin.css`, Line 105 (`h2 + p.intro-text`) - Dmitriy
* **Grouping with commas:** `base.css`, Line 34 (`h1, h2, h3`) - Dmitriy/Sultan-Ali
* **Attribute selector:** `base.css`, Line 299 (`a[target="_blank"]::after`) - Dmitriy/Sultan-Ali
* **Universal selector (*):** `base.css`, Line 15 (`*, *::before, *::after`) - Dmitriy/Sultan-Ali
* **:hover or :focus:** `base.css`, Line 198 (`.btn-primary:hover`) - Dmitriy/Sultan-Ali
* **:first-child or :nth-child:** `base.css`, Line 126 (`.dropdown-menu a:last-child`) - Dmitriy/Sultan-Ali
* **::before or ::after:** `base.css`, Line 299 (`a[target="_blank"]::after`) - Dmitriy/Sultan-Ali

## 2. CLASSES AND IDs
* **8+ Classes used:** Yes, heavily utilized across `base.css`, `gagarin.css`, and `rakhmetolla.css`.
* **2+ IDs used exactly once per page:** Yes.
    * *Example (Dmitriy):* `gagarin.css`, Line 21 (`#home-features`), Line 45 (`#contact-split`)
    * *Example (Sultan-Ali):* `rakhmetolla.css`, Line 131 (`#community`), Line 301 (`#activities`)

## 3. COLORS, FONTS, SPACING, ALIGNMENT
* **5 colors palette in comment:** `base.css`, Lines 5-13 - Dmitriy/Sultan-Ali
* **Hex, rgb/rgba, and named color used:** `base.css`, Line 6 (`rgb`), Line 7 (`hex`), Line 8 (`ivory`) - Dmitriy/Sultan-Ali
* **2 font families with fallbacks:** `base.css`, Line 29 (`'Lora', Georgia, serif`) & Line 60 (`'Space Mono', 'Courier New', Courier, monospace`) - Dmitriy/Sultan-Ali
* **font-size, font-weight, line-height, letter-spacing set:** `base.css`, Lines 20-31, 41-46 - Dmitriy/Sultan-Ali
* **Box model (margin, padding, border, box-sizing):** `base.css`, Lines 15-17 (box-sizing), Lines 163-170 (.content-card) - Dmitriy/Sultan-Ali
* **Margin collapse commented:** `base.css`, Line 41 (above `h1`) - Dmitriy/Sultan-Ali
* **Alignment (text-align):** `base.css`, Line 44 (`text-align: center`) - Dmitriy/Sultan-Ali

## 4. PRIORITY & CASCADE
* **Exactly one internal style block with comment:** `index.html` (`<style>` in head)
* **Exactly one inline style attribute with comment:** `index.html` (`<p style="...">`)
* **Exactly one !important with comment:** `base.css`, Line 194 (`color: var(--color-alabaster) !important;`) - Dmitriy/Sultan-Ali
* **Specificity experiment with comments:**
    * *Dmitriy:* `gagarin.css`, Lines 110-115 (`.feature-img` vs `#home-features .feature-img`)
    * *Sultan-Ali:* `rakhmetolla.css`, Lines 614-643 (`.specificity-demo` vs `#specificity-demo`)

## 5. FLEXBOX
* **Flex row, justify-content, align-items, gap:** `base.css`, Lines 56-59 (`.site-header`) - Dmitriy/Sultan-Ali
* **Flex container with flex-wrap and items growing/shrinking:**
    * *Dmitriy:* `gagarin.css`, Lines 2-4 (`#hero-split`) and Lines 8-12 (`flex: 1 1 400px`)
    * *Sultan-Ali:* `rakhmetolla.css`, Lines 131-137 (`#community`) and Line 145 (`flex: 1 1 300px`)
* **Flex-direction used:** `base.css`, Line 113 (`flex-direction: column;`) - Dmitriy/Sultan-Ali

## 6. GRID
* **grid-template-columns with fr units, repeat(), gap:**
    * *Dmitriy:* `gagarin.css`, Lines 22-24 (`#home-features`)
    * *Sultan-Ali:* `rakhmetolla.css`, Lines 200-204 (`.blog-grid`)
* **minmax() used:**
    * *Dmitriy:* `gagarin.css`, Line 23 (`minmax(0, 1fr)`)
    * *Sultan-Ali:* `rakhmetolla.css`, Line 202 (`minmax(0, 1fr)`)
* **Item spanning rows/columns:** `rakhmetolla.css`, Line 243 (`grid-column: 1 / -1;`) - Sultan-Ali

## 7. POSITIONING, FLOAT, CLEAR
* **Static positioning with comment:** `base.css`, Line 316 (`.static-reset`) - Dmitriy/Sultan-Ali
* **Relative containing block:** `base.css`, Line 77 (`.nav-dropdown`) - Dmitriy/Sultan-Ali
* **Absolute inside relative:** `base.css`, Line 99 (`.dropdown-menu`) - Dmitriy/Sultan-Ali
* **Fixed element:** `base.css`, Line 305 (`.back-to-top`) - Dmitriy/Sultan-Ali
* **Float image and Clear:**
    * *Dmitriy:* `gagarin.css`, Lines 94 (`.about-barista-img`) & 103 (`.clear-block`)
    * *Sultan-Ali:* `rakhmetolla.css`, Lines 479 (`.brewing-image`) & 494 (`.clearfix`)

## 8. CENTERING (3 Ways)
* **Technique 1 (Absolute + Transform):** `base.css`, Lines 100-102 (`.dropdown-menu`) - Dmitriy/Sultan-Ali
* **Technique 2 (Margin Auto):** `base.css`, Line 151 (`main { margin: 0 auto; }`) - Dmitriy/Sultan-Ali
* **Technique 3 (Flexbox):** `base.css`, Line 272 (`.footer-links { justify-content: center; }`) - Dmitriy/Sultan-Ali