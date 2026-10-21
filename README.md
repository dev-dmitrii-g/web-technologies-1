# WEB Technologies 1 project
WEB Technologies group project website about "Tokyo Coffee" coffee house.

## Assignment 4 Functionality Plan

| Page | Visitor goal | Planned function | Expected result | Responsible student |
| --- | --- | --- | --- | --- |
| `pages/events.html` | Explore a coffee activity and request information for a group | Store six realistic activity records in an array, look up the selected activity, check participant capacity, calculate its total price and duration, and create a non-confirming demo reference | The visitor receives a clear request summary with event, date, group size, duration, price and a demonstration reference | Rakhmetolla Sultan-Ali |
| `pages/wholesale.html` | Prepare a business enquiry and understand which details matter for the selected request | Match service and business type to a preparation guide, validate enquiry details, calculate days until the requested contact date and show a local preview with a temporary reference | The visitor sees a service-specific summary and useful follow-up details without a false wholesale quote or claim that the form was sent | Rakhmetolla Sultan-Ali |
| `pages/brewing-guides.html` | Calculate water for a chosen brewing method and submit a question preview | Use six recipe records from the published starting ratios, calculate the water range for the entered coffee amount, validate a brewing question and summarize the method and chosen adjustment | The visitor sees an immediate water estimate and a clearly labeled local question preview | Rakhmetolla Sultan-Ali |
| `pages/blog.html` | Share and review a customer comment | Validate the review form, count characters, create review cards through one renderer, calculate average rating, sort or filter ratings, and reset the filter | The visitor sees a review preview with date, rating and category; it remains in the current tab only | Rakhmetolla Sultan-Ali |
| `pages/menu.html` | Find a drink or food item and choose its size | Search, filter by category, sort by price or name, and pass the selected item to the order page | The visitor sees matching items and can continue with a chosen product | Rakhmetolla Sultan-Ali |
| `pages/order.html` | Build and review a pickup order | Add items and extras, change quantities, remove or clear lines, calculate totals and validate pickup details | The visitor sees a complete demonstration order summary; no order or payment is created | Rakhmetolla Sultan-Ali |
| `pages/subscriptions.html` | Compare and request a coffee subscription | Filter plans by budget, compare supported frequencies, calculate period cost and validate delivery details | The visitor sees a plan summary and demonstration request; no subscription or payment is created | Rakhmetolla Sultan-Ali |
| `pages/login.html`, `pages/register.html` | Check the front-end sign-in or registration form | Validate email and password fields, show a live new-password checklist, compare confirmation exactly, and provide accessible show/hide controls | The visitor sees local validation feedback; no account is authenticated or created and credentials are not sent or saved | Rakhmetolla Sultan-Ali |
| `pages/contacts.html` | Prepare a message for the cafe | Validate name, email, inquiry type and message length, then show a local demonstration reference | The visitor is clearly told that the message was not sent and is given the cafe email address | Rakhmetolla Sultan-Ali |

### Assignment 4 implementation

`pages/js/main.js` contains the six activity objects and reusable functions for event lookup, capacity-aware price calculation, price formatting, reference generation and request summary generation. The event request flow uses conditions and logical operators to validate the chosen event, date, participant count and required contact details before calculating the summary. No actual booking or server submission is made.

`pages/js/wholesale.js` uses a 12-record service and business-type guide, reusable lookup and date-calculation functions, and a complete front-end enquiry preview. It uses the existing form and prepared result/error areas; it does not create a quote or send business details to a server.

`pages/js/brewing-guides.js` uses six scaled recipe examples from the ratios already published on the page. It calculates an estimated water range as the visitor changes method or coffee amount, and provides a validated local preview for the brewing question form.

`pages/js/blog.js` creates review cards through one renderer and supports sorting, rating filters, a live character count and field-level validation. The previous page code used Supabase; this assignment version does not load or use a database, and new reviews are demonstration previews held only in memory. The blog script link now points to the existing `pages/js/blog.js` location.

### Motion effects

The four pages use Bootstrap's existing `fade` and `show` classes to reveal main sections as they enter the viewport. New review cards and form feedback fade in through `classList`; no CSS rules were added.

## Assignment 5 implementation

### Essential midterm correction

`pages/login.html`, `pages/register.html` and `pages/contacts.html` placed their footer after the body closing tag; `pages/register.html` also had an incomplete `</footer` tag. The closing tags are corrected so the browser can parse the pages and their script references reliably. `pages/events.html`, `pages/brewing-guides.html` and `pages/wholesale.html` also linked to a nonexistent `contact.html`; those links now point to the existing `contacts.html`. These structural and link corrections do not earn assignment points; no interface content or CSS was added or removed.

### DOM, events and form validation

`pages/js/main.js` adds the event time selector and live booking estimate through DOM methods. It limits available start times to the cafe's 09:00–21:00 hours based on event duration, checks dates, participant limits and contact fields, focuses the first invalid field and returns a clearly labeled demo request.

`pages/js/wholesale.js`, `pages/js/brewing-guides.js` and `pages/js/blog.js` provide field-level errors, accessible error descriptions, focus management and outdated-error clearing. Phone fields require 7–15 digits. Cross-field rules check service/business combinations, event capacity and review rating consistency.

`pages/js/auth.js` handles the existing login and registration forms. Registration shows a live password checklist, exact password confirmation and accessible Show/Hide Password buttons. Both forms explain that no account is created or authenticated and that credentials are not sent or saved. Social sign-in links give feedback that no provider is connected.

`pages/js/contacts.js` adds field validation, a character counter and a local message reference. It never sends or stores the submitted details and points visitors to the published cafe email address.

`pages/js/menu.js`, `pages/js/order.js`, `pages/js/subscriptions.js` and the shared `pages/js/mainabyl.js` support the connected catalogue, cart and subscription flows. They create repeated content with DOM methods, include empty or no-match states, update totals and produce demonstration-only confirmations.

The new account and contact behavior is loaded using deferred script references. All new visible controls and feedback are created or updated with DOM methods and Bootstrap classes; the Assignment 5 work adds no CSS rules.

### JavaScript checklist with code locations

- Event time, duration, capacity and total estimate with validated demo request: `pages/js/main.js` lines 73, 166–208 and 215–223.
- Wholesale service/business lookup and enquiry validation: `pages/js/wholesale.js` lines 13, 73 and 136–156.
- Brewing water calculation, draft actions and question validation: `pages/js/brewing-guides.js` lines 16, 74 and 218–234.
- Review-card rendering, sorting/filtering, counter and review validation: `pages/js/blog.js` lines 82, 115 and 258–282.
- Menu filtering and one renderer for matching catalogue cards: `pages/js/menu.js` lines 57 and 90–123.
- Cart line rendering, quantity/total updates and order confirmation: `pages/js/order.js` lines 66, 188, 230 and 413–481.
- Subscription budget filter, live summary and request validation: `pages/js/subscriptions.js` lines 65, 83, 137, 228 and 265–318.
- Login/registration validation, password checklist and password visibility controls: `pages/js/auth.js` lines 37, 55, 103–141 and 178–216.
- Contact form validation and local confirmation: `pages/js/contacts.js` lines 17 and 103–133.

For final submission, capture browser evidence for the empty/no-match states and one invalid plus one valid demonstration flow. Add the required `assignment-4` and `assignment-5` tags after committing the corresponding versions, and keep the midterm tag unchanged. The current working tree has not been committed or tagged.
