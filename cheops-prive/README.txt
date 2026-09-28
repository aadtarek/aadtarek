CHEOPS PRIVÉ CUSTOM THEME — v4.0

INSTALL
1. Upload the ZIP from Appearance > Themes > Add New > Upload Theme.
2. Activate Cheops Privé.
3. Core pages including Contact are created automatically if missing.
4. Go to Settings > Permalinks and click Save once if /property/... links return 404.

PROPERTY MANAGER
- Manage sale and rental units, residential/administrative types, galleries, plans and amenities.
- Homepage and Properties filters support Sale/Rent, Location, Type, Bedrooms and Price.
- Single Property uses the premium gallery/details/sticky-enquiry layout introduced in v3.

PROJECTS + CITIES
- WordPress Admin > Projects lets you add/edit development projects.
- Assign every project to a City using the Cities taxonomy.
- Homepage now shows cities first. Clicking a city reveals only its projects in the original alternating project layout.
- Featured Image controls project imagery. Project type, starting price and available units are editable.
- Existing homepage projects are seeded automatically on first use.

CONTACT PAGE
- Dedicated /contact/ page with Call + WhatsApp CTAs, office information and a working WordPress enquiry form.
- Enquiries are sent to the Email configured in Appearance > Customize > Cheops Theme Options.

HEADER / MOBILE MENU
- Unified floating header across the site.
- Desktop Services dropdown.
- Animated full-screen mobile menu with expandable Services submenu.
- The supplied Cheops logo URL is used in both header and the unified footer.
- Contact links now point to /contact/.

OFFICE SHORTCUTS
- Buy Office and Rent Office cards now use photographic office backgrounds.
- Buy Office opens Properties pre-filtered to Office + For Sale.
- Rent Office opens Properties pre-filtered to Office + For Rent.

PRELOADER
- Homepage only, once per browser session.

THEME OPTIONS
Appearance > Customize > Cheops Theme Options
- Hero YouTube URL
- Phone
- WhatsApp
- Email
- Office address

NOTES
The supplied HTML/CSS/animation system is retained wherever practical to preserve the original visual design.


V5 changes:
- Removed all artificial logo backgrounds/crops; the supplied logo is rendered directly in header and footer.
- Homepage city cards now open dedicated /city/{slug}/ pages.
- Every city page lists its projects vertically using the original alternating project layout.
- Contact, single property and city pages use the same Romie typography and reveal motion language as the original pages.
- Cities/Projects remain fully dynamic from the WordPress dashboard.


V8 POLISH
- Reduced oversized vertical spacing across service/content sections without changing the visual language.
- Added a site-wide word guard so animated headings wrap between words instead of splitting words across lines.
- FAQ sections are more compact.
- About hero decorative frame removed; About Cheops Privé is centered on one line on desktop.
- City marquee now focuses on New Cairo, Shorouk, Mostakbal City and North Coast.
- Interactive map now includes dots for all four focus locations.
- User-facing Commercial terminology changed to Administrative.
- Property quick cards redesigned as icon + title + subtitle.
- V7 performance asset extraction/caching architecture retained.

Curated Portfolio AUG26 integration
----------------------------------
This build includes a source-backed importer for 7 projects and 35 units from Curated Portfolio AUG26.
- Automatic one-time import runs for an administrator on the first wp-admin request after activation/update.
- Manual refresh: Property Manager > Overview > Import / Refresh AUG26 Portfolio (35 units).
- Units are matched by Reference Code, so the importer is safe to run again without duplicating portfolio units.
- Project covers, unit locator pages and floor-plan pages are stored under assets/portfolio/ and remain editable/replacable later from WordPress.
