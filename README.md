# Vision Enterprise

Static website for Vision Enterprise, an electric car marketplace for new and pre-owned EVs, with car financing and (once licensed) fleet plans.

> **Preview build.** Inventory, prices and the demo account are sample data. Text in `[BRACKETS]` (company registration, licences, lender, plan terms and fees) must be replaced with real, verified details before launch.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: hero, showroom with New / Pre-owned filter, payment estimator, fleet plans overview, company details, FAQ |
| `car.html` | Car detail (Vantor Eon GT): paint picker, price breakdown, specification, viewing request form |
| `plans.html` | Financing and fleet plans: key facts, all fees, risks, regulatory status, waitlist |
| `account.html` | Sign in, create account, password reset (Supabase Auth) and customer dashboard: Vision Trade shortcut, order tracking, finance agreement, payment schedule, documents, saved cars |

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Accounts and Vision Trade

Sign-in uses **Supabase Auth**, and the same account opens **Vision Trade** (the trading app, hosted separately).

- `assets/config.js`: your Supabase URL, the **anon public** key (never the `service_role` key), and the Vision Trade URL. While the Supabase keys are empty, the account page runs in demo mode.
- `assets/auth.js`: sign-in, sign-up, password reset, and `NeoAuth.goToTrade()`. Any link with a `data-trade-link` attribute opens Vision Trade already signed in. The login travels in the URL fragment, which is never sent to servers, and Vision Trade checks it with Supabase.

In Supabase, go to **Authentication → URL Configuration**. Set the **Site URL** to this site's address, and add `https://<your-site>/account.html` (plus `http://localhost:8000/account.html` for local testing) to **Redirect URLs**.

## Publish with GitHub Pages

1. Push this folder to the `main` branch.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. The site will be live at `https://<your-username>.github.io/<repo-name>/` after a minute or two.

## Adding car photos

Every car image is a fixed-size slot. Put a JPG with the right name in `assets/cars/` and it appears automatically; until then the page shows a drawn placeholder labelled with the size and file name it needs. See `assets/cars/README.txt` for the full list.

| File | Where | Size |
| --- | --- | --- |
| `hero.jpg` | Homepage featured car | 2400 × 800 |
| `vantor-eon-gt.jpg` | Showroom card + car detail page | 1600 × 1000 |
| `kaelis-s7.jpg`, `halden-strata-7.jpg`, `lumen-tide.jpg`, `morrow-arc.jpg`, `orix-pulse.jpg` | Showroom cards | 1600 × 1000 |

Use photos of cars you actually have, taken by you or licensed for commercial use.

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

- [ ] Replace sample cars with real stock and prices, and add photos to `assets/cars/`
- [ ] Fill in registered company name, number and address
- [ ] Add the lender's name and credit licence, with real APR ranges and fees
- [ ] Keep fleet plans closed until authorisation is granted; then publish real terms and a key information document
- [ ] Remove the "Preview build" bar at the top of each page
- [ ] Fill in `assets/config.js` (Supabase keys and Vision Trade URL)
- [ ] Connect the remaining forms (viewing request, waitlist) to a real backend
- [ ] Replace the sample order, finance and document data on the account page with real data
