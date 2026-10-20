# WEB Technologies 1 project
WEB Technologies group project website about "Tokyo Coffee" coffee house.

## Assignment 4 Functionality Plan

| Page | Visitor goal | Planned function | Expected result | Responsible student |
| --- | --- | --- | --- | --- |
| `pages/events.html` | Explore a coffee activity and request information for a group | Store six realistic activity records in an array, look up the selected activity, check participant capacity, calculate its total price and duration, and create a non-confirming demo reference | The visitor receives a clear request summary with event, date, group size, duration, price and a demonstration reference | Rakhmetolla Sultan-Ali |
| `pages/wholesale.html` | Prepare a business enquiry and understand which details matter for the selected request | Match service and business type to a preparation guide, validate enquiry details, calculate days until the requested contact date and show a local preview with a temporary reference | The visitor sees a service-specific summary and useful follow-up details without a false wholesale quote or claim that the form was sent | Rakhmetolla Sultan-Ali |
| `pages/brewing-guides.html` | Calculate water for a chosen brewing method and submit a question preview | Use six recipe records from the published starting ratios, calculate the water range for the entered coffee amount, validate a brewing question and summarize the method and chosen adjustment | The visitor sees an immediate water estimate and a clearly labeled local question preview | Rakhmetolla Sultan-Ali |
| `pages/blog.html` | Share and review a customer comment | Validate the review form, count characters, create review cards through one renderer, calculate average rating, sort or filter ratings, and reset the filter | The visitor sees a review preview with date, rating and category; it remains in the current tab only | Rakhmetolla Sultan-Ali |

### Assignment 4 implementation

`pages/js/main.js` contains the six activity objects and reusable functions for event lookup, capacity-aware price calculation, price formatting, reference generation and request summary generation. The event request flow uses conditions and logical operators to validate the chosen event, date, participant count and required contact details before calculating the summary. No actual booking or server submission is made.

`pages/js/wholesale.js` uses a 12-record service and business-type guide, reusable lookup and date-calculation functions, and a complete front-end enquiry preview. It uses the existing form and prepared result/error areas; it does not create a quote or send business details to a server.

`pages/js/brewing-guides.js` uses six scaled recipe examples from the ratios already published on the page. It calculates an estimated water range as the visitor changes method or coffee amount, and provides a validated local preview for the brewing question form.

`pages/js/blog.js` creates review cards through one renderer and supports sorting, rating filters, a live character count and field-level validation. The previous page code used Supabase; this assignment version does not load or use a database, and new reviews are demonstration previews held only in memory. The blog script link now points to the existing `pages/js/blog.js` location.

### Motion effects

The four pages use Bootstrap's existing `fade` and `show` classes to reveal main sections as they enter the viewport. New review cards and form feedback fade in through `classList`; no CSS rules were added.
