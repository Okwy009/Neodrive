# Vision Enterprise Car Photos

Drop photos into `assets/cars/` using exactly these file names. They appear on the site automatically. Until a file is added, the page shows the drawn placeholder instead.

## Required Images

| File name | Where it shows | Size (width × height) |
|---|---|---|
| `hero.jpg` | Homepage featured car | 2400 × 800 (3:1) |
| `tesla-cybertruck-cyberbeast.jpg` | Showroom card + car detail page | 1600 × 1000 (16:10) |
| `tesla-model-s-plaid.jpg` | Showroom card | 1600 × 1000 (16:10) |
| `tesla-model-x-plaid.jpg` | Showroom card | 1600 × 1000 (16:10) |
| `tesla-model-s-signature-edition.jpg` | Showroom card | 1600 × 1000 (16:10) |
| `tesla-model-x.jpg` | Showroom card | 1600 × 1000 (16:10) |
| `tesla-model-s.jpg` | Showroom card | 1600 × 1000 (16:10) |
| `tesla-cybertruck-all-wheel-drive.jpg` | Showroom card | 1600 × 1000 (16:10) |
| `tesla-roadster-next-generation.jpg` | Showroom card | 1600 × 1000 (16:10) |

## Image Guidelines

- Other dimensions work too. Photos are cropped to fill the slot from the centre, so keep the car centred with some space around it.
- Keep each file under approximately 400 KB. Use JPG quality 75–80 to help pages load quickly on phones.
- File names are lowercase and must match exactly, including `.jpg`.
- Use photos you own or have licensed for commercial use.
- Use `hero.jpg` for the homepage banner. It should be a wide automotive image with enough space for headline text.
- Use distinct photos for each vehicle so visitors can identify the correct model.

## Current Vehicle Inventory

1. Tesla Cybertruck Cyberbeast
2. Tesla Model S Plaid
3. Tesla Model X Plaid
4. Tesla Model S Signature Edition
5. Tesla Model X
6. Tesla Model S
7. Tesla Cybertruck All-Wheel Drive
8. Tesla Roadster (Next Generation)

## Renaming a Car

If you rename a car in `index.html`, update its photo filename to match the vehicle name using these rules:

1. Convert the name to lowercase.
2. Replace spaces with hyphens.
3. Remove parentheses and other unnecessary punctuation.
4. Append `.jpg`.

Example:

`Model S Plaid` → `tesla-model-s-plaid.jpg`

Update the corresponding CSS class and image path in the `<style>` block at the top of `index.html`.

Example:

```css
.ph-tesla-model-s-plaid {
  background-image: url("assets/cars/tesla-model-s-plaid.jpg");
}
```

Repeat this mapping for every vehicle, ensuring the CSS class, HTML reference, and actual image filename match.

## Important

Adding an image file alone will not work if the website uses a different filename or CSS class. Verify that `index.html` references all eight vehicle images and that each image path points to `assets/cars/`.