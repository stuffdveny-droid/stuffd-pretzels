# Stuff’d — stuffed pretzels

Animated static storefront for Stuff’d, a stuffed pretzel brand. The site has no build step and is published through GitHub Pages at `stuffdve.com`.

## Preview locally

```sh
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## Pages

Home, Shop, Flavors, The Stuff’d Idea, Our Story, Journal, Find Us, Wholesale, FAQ, Contact, and a custom 404 page. Shared GSAP choreography provides page transitions, scroll reveals, animated flavor art, marquees, and hover movement.

## Current catalog

The seven Stuff’d Staple Pouch flavors and two Party Box sizes, product numbers, and prices mirror the POS menu supplied for this site. See `assets/js/site.js` and `shop.html`. New flavor concepts are labeled as ideas and are not represented as current products.

All nine current menu items have VE Hub Buy Buttons for one-time purchases. Shop cards, quick view, the Party Box selector, and the homepage’s “Teleport to the store” hero link make the customer checkout path easy to find. Ingredient, allergen, shipping, stockist, wholesale, and contact details are only shown when confirmed; pages mark pending information clearly.

## Deployment

GitHub Pages serves the repository root from `main`. `CNAME` points to `stuffdve.com`; `.nojekyll` keeps static assets available.
