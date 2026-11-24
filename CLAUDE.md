# Cheops Privé website

This repository holds the WordPress theme and dashboard plugin for https://cheopsprive.com, the site of Cheops Privé, an Egyptian private real estate advisory (New Cairo, Mostakbal City, North Coast).

- `cheops-prive/`: the theme. The folder name must stay exactly `cheops-prive`.
- `cheops-mcp/`: the Cheops MCP plugin that gives Claude access to the live dashboard and theme files.

## Talking to the owner

- The owner writes in Egyptian Arabic and calls Claude "ياسطا". Answer in Egyptian Arabic, short and plain.
- Do only what was asked. Redesigning sections nobody asked about upset the owner before. When unsure, ask.
- Before changing anything on the live site, say what will change. Then do it, then report what was done.
- Send screenshots of visible changes.

## Content rules for the site

- Never put a dash or em dash between words in site text. The theme also strips them from output.
- Never overwrite content the owner made. One-time migrations only change values still at their old defaults, guarded by an option flag so they run once.
- No unit prices anywhere on the site. Prices stay stored in unit meta but are hidden (`cheops_show_unit_prices` is off). Unit pages have no description block, and floor plan images must not show prices.
- No photos with people in them on units. Lake Town units show offices only.
- Finishing that is not set shows as "Core and Shell".
- Location maps list roads and landmarks (Suez Road, Ring Road, airport, New Capital), never other compounds.
- Every unit page should look the same across projects.
- Make new things editable from the dashboard.
- Every visible English string needs an Arabic translation in `cheops-prive/inc/i18n-ar.php` (exact text match; the Arabic site lives under `/ar/`).

## How changes ship

1. Change the code in this repository first. It is the source of truth.
2. Bump `CHEOPS_BUILD` in `cheops-prive/functions.php` on every release (shown in the dashboard under Site Content). A new build purges LiteSpeed once by itself.
3. Commit on the working branch and push.
4. Put the changed files on the live site with the `cheops` MCP tools (`read_theme_file` for the sha1, then `write_theme_file`; `upload_theme_file` for images, fonts and videos). Every write keeps a backup (`list_theme_backups`, `restore_theme_backup`), PHP is syntax checked, and a change that breaks the home page is undone at once.
5. Run `clear_cache` after changes.
6. If the MCP tools are not available, send the full theme zip instead: `git archive --format=zip -o cheops-prive-updated.zip HEAD cheops-prive`, send it, delete the zip, and tell the owner to upload it (folder name `cheops-prive`) and then LiteSpeed Cache → Purge All.

Content (units, projects, pages, community pages, Customizer settings, media) is changed with the MCP tools directly, not through code.

## Where things live in the theme

- `functions.php`: post types (`cheops_unit`, `cheops_project`), Customizer settings, output buffer (dash cleaning, Arabic), map coordinates (`cheops_project_map_coords`), caches.
- `single-cheops_unit.php`: the unit page.
- `inc/lake-town.php`, `inc/marq-gardens.php`, `inc/lvls.php`: shared community material (photos, plans, rooms, map tabs, features, story), saved in the options `cheops_lake_town`, `cheops_marq_gardens`, `cheops_lvls` and edited under Property Manager in the dashboard.
- `inc/unit-rooms-data.php`: bedrooms, bathrooms and room areas copied from the reference pages.
- `inc/i18n.php`, `inc/i18n-ar.php`: Arabic.
- `assets/css/pages/single-unit-late.css`: unit page styles. `assets/css/admin.css`: dashboard look.
- `assets/portfolio/`: brochure covers, floor plans and locators for units.

Reference material for units and communities: https://cheops.front.aait-d.com/communities/ (lake-town, the-marq-gardens, lvls, field-park, river-park, mountain-view-1-1-the-park, solana-east). Take only data and photos that belong to our units, and no photos with people.

## Still waiting on the owner

- Bedrooms and rooms for the five MarQ Gardens villas (TMG-SV-50, TMG-SV-54, TMG-TV-59A, TMG-TW-19A, TMG-TW-19B); the reference page lists other units.
- Room data for Solana East and The Water MarQ units (no reference data).
- The real Google Maps share links for the communities.
- Whether MV 1.1 should move to the New Cairo city.
- Developer descriptions (can be entered in the dashboard).
