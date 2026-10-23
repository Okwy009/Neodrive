# NeoDrive

Static website for NeoDrive, an electric car marketplace for new and pre-owned EVs, with car financing and (once licensed) fleet plans.

> **Preview build.** Inventory, prices and the demo account are sample data. Text in `[BRACKETS]` (company registration, licences, lender, plan terms and fees) must be replaced with real, verified details before launch.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: hero, showroom with New / Pre-owned filter, payment estimator, fleet plans overview, company details, FAQ |
| `car.html` | Car detail (Vantor Eon GT): paint picker, price breakdown, specification, viewing request form |
| `plans.html` | Financing and fleet plans: key facts, all fees, risks, regulatory status, waitlist |
| `account.html` | Sign in (password + code) and customer dashboard: order tracking, finance agreement, payment schedule, documents, saved cars |

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publish with GitHub Pages

1. Push this folder to the `main` branch.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. The site will be live at `https://<your-username>.github.io/<repo-name>/` after a minute or two.

## How the pages work

Each page keeps its markup inside `<x-dc>` and its behaviour in a
`<script type="text/x-dc" data-dc-script>` block. `assets/dc-lite.js` reads both,
renders the page and updates it when state changes. Template syntax:

- `{{ value }}` in text or attributes
- `onClick="{{ handler }}"` for events (`onChange` on inputs fires while typing or sliding)
- `<sc-for list="{{ items }}" as="item">…</sc-for>` to repeat
- `<sc-if value="{{ condition }}">…</sc-if>` to show conditionally

To edit copy, change the HTML directly. To change data such as car listings, prices or FAQ answers, edit the arrays in the page's `renderVals()` function.

## Before going live

- [ ] Replace sample cars with real stock, photos and prices
- [ ] Fill in registered company name, number and address
- [ ] Add the lender's name and credit licence, with real APR ranges and fees
- [ ] Keep fleet plans closed until authorisation is granted; then publish real terms and a key information document
- [ ] Remove the "Preview build" bar at the top of each page
- [ ] Connect the forms (viewing request, waitlist, sign-in) to a real backend
