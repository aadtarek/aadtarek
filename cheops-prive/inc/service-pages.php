<?php
if (!defined('ABSPATH')) exit;

/**
 * Content for the four service pages (For Sale, For Rent, Income Property,
 * Private Consultation). Each template renders its hero, "How we help" and
 * "What we handle" sections from this data via cheops_render_service_page().
 */
function cheops_service_pages() {
    return [
        'for-sale' => [
            'title'       => 'Properties for Sale | Cheops Privé',
            'description' => 'Apartments, villas, townhouses, offices and clinics for sale in New Cairo, Mostakbal City and the North Coast, with prices, payment plans and delivery dates explained by one Cheops Privé advisor.',
            'eyebrow'     => 'Services · For Sale',
            'headline'    => ['Buy with clarity,', 'own with confidence.'],
            'lead'        => 'Apartments, villas, townhouses, offices and clinics for sale across New Cairo, Mostakbal City and the North Coast. We shortlist units from developers such as Mountain View, The MarQ and ORA, then walk you through the price, payment plan and delivery date before you commit.',
            'primary'     => ['Browse units for sale', '/properties/?deal=sale'],
            'help_title'  => 'A shortlist, not a flood.',
            'help'        => [
                ['Primary and resale', 'New developer launches and resale units are compared side by side, so a long payment plan and a ready unit are weighed on the same terms.'],
                ['Real numbers', 'Down payment, instalments, maintenance deposit and delivery date for every unit, taken from the developer’s own price sheet.'],
                ['One advisor', 'Private site visits and show-unit viewings arranged around your schedule, with the same advisor from the first shortlist to the signed contract.'],
            ],
            'handle_title' => 'From first shortlist to signed contract.',
            'handle'      => [
                ['Homes in leading communities', 'Apartments, townhouses and villas in Mountain View LVLS, Aliva, 1.1 The Park, The MarQ Gardens, The Water MarQ and Solana East.'],
                ['Offices and clinics', 'Administrative and medical units in Lake Town, New Cairo, including units already leased to operating tenants.'],
                ['Unit comparison', 'Area, view, floor, finishing and price per metre compared across projects before you visit.'],
                ['Payment plans', 'Down payment, instalment schedule and maintenance deposit set out clearly before reservation.'],
                ['Developer and delivery', 'Delivery date, construction progress and the developer’s track record checked for every option.'],
                ['Reservation and contract', 'Reservation forms, developer paperwork and contract review handled with you, step by step.'],
            ],
        ],
        'for-rent' => [
            'title'       => 'Properties for Rent | Cheops Privé',
            'description' => 'Offices, clinics and homes for rent in New Cairo and beyond. Cheops Privé matches tenants and owners with fair terms, qualified tenants and a clean handover.',
            'eyebrow'     => 'Services · For Rent',
            'headline'    => ['The right space,', 'on the right terms.'],
            'lead'        => 'Offices, clinics and homes for rent in New Cairo and beyond. Whether you are looking for a space or leasing one out, we match the property, the tenant and the terms, and we stay involved until the keys change hands.',
            'primary'     => ['Browse units for rent', '/properties/?deal=rent'],
            'help_title'  => 'Leasing, handled from both sides.',
            'help'        => [
                ['For tenants', 'Offices, clinics and residences shortlisted by size, budget, fit-out and location, with viewings arranged around your schedule.'],
                ['For owners', 'A rent price grounded in current demand and a qualified tenant. Our Lake Town listings include offices and clinics leased to businesses such as Guva Clinic, SIG Group IMEA and City Edge.'],
                ['Clear lease terms', 'Rent, annual increases, deposit, duration and fit-out responsibilities agreed in writing before anyone signs.'],
            ],
            'handle_title' => 'Everything between the viewing and the keys.',
            'handle'      => [
                ['Office space', 'Fitted and core-and-shell offices for companies moving to or expanding in New Cairo.'],
                ['Clinic units', 'Medical units in serviced buildings with parking and easy patient access.'],
                ['Residential rentals', 'Apartments and villas, furnished or unfurnished, in established compounds.'],
                ['Rental pricing', 'For owners: a rent range based on comparable leases and current demand.'],
                ['Tenant screening', 'Company or personal background, intended use and payment reliability checked before an offer is accepted.'],
                ['Contract and handover', 'Lease drafting, inventory, meter readings and a clean handover on the first day.'],
            ],
        ],
        'income-property' => [
            'title'       => 'Income Property | Cheops Privé',
            'description' => 'Leased clinics, offices and homes with rental demand. Cheops Privé shows the rent, the running costs and the net return before you buy.',
            'eyebrow'     => 'Services · Income Property',
            'headline'    => ['Property that pays,', 'measured properly.'],
            'lead'        => 'Units bought for their rental income: clinics and offices with tenants already in place, and homes with steady rental demand. We show you the rent, the running costs and the net return before you buy.',
            'primary'     => ['Build an income brief', '/contact/'],
            'help_title'  => 'Income, seen in full.',
            'help'        => [
                ['Already leased', 'Units with a tenant in place, such as Lake Town clinics leased to Guva Clinic, so income starts from the day you own them.'],
                ['Net, not gross', 'Maintenance, service charges and realistic vacancy are deducted before we quote a return.'],
                ['An exit in mind', 'We look at who will buy the unit later and whether the tenancy adds to its resale value.'],
            ],
            'handle_title' => 'What we check before you buy for income.',
            'handle'      => [
                ['Leased clinics and offices', 'Administrative and medical units sold with an existing lease and a known monthly rent.'],
                ['Rent and return', 'Current rent, comparable rents nearby and the net return after costs.'],
                ['Tenant and lease', 'Who the tenant is, how long the lease runs and how the rent increases each year.'],
                ['Running costs', 'Maintenance deposit, service charges and any fit-out the owner is responsible for.'],
                ['Renewal and re-letting', 'A plan for renewing the lease or finding the next tenant when it ends.'],
                ['Resale planning', 'Expected demand for the unit when you decide to sell, leased or vacant.'],
            ],
        ],
        'private-consultation' => [
            'title'       => 'Private Consultation | Cheops Privé',
            'description' => 'A one-to-one property consultation with Cheops Privé. Share your budget and goals and leave with a clear shortlist across New Cairo, Mostakbal City, Shorouk and the North Coast.',
            'eyebrow'     => 'Services · Private Consultation',
            'headline'    => ['One advisor,', 'one clear plan.'],
            'lead'        => 'A one-to-one session that turns your budget and goals into a shortlist. Whether you are buying a home, moving your company or investing, we tell you plainly which projects fit and which do not.',
            'primary'     => ['Book a consultation', '/contact/'],
            'help_title'  => 'Advice you can act on.',
            'help'        => [
                ['Your brief first', 'Budget, timing, location, unit type and whether you plan to live in, work from, rent out or resell the property.'],
                ['An honest comparison', 'Projects across New Cairo, Mostakbal City, Shorouk and the North Coast compared on price, payment plan, delivery and developer.'],
                ['A written shortlist', 'You leave with specific units, their numbers and the next steps, with no pressure to reserve.'],
            ],
            'handle_title' => 'What a consultation covers.',
            'handle'      => [
                ['Budget and payment', 'How much to put down, what instalments you can carry and when cash is needed.'],
                ['Choosing the area', 'New Cairo, Mostakbal City, Shorouk or the North Coast, based on how you will use the property.'],
                ['Comparing developers', 'Track record, delivery history and the difference between similar-looking offers.'],
                ['Living or investing', 'Whether a unit suits your own use, rental income or resale, and what that changes.'],
                ['Selling your current unit', 'A realistic resale price and timing if you are moving from a property you already own.'],
                ['Viewings', 'Site visits and show-unit tours for the options that make the shortlist.'],
            ],
        ],
    ];
}

function cheops_service_page($slug) {
    $pages = cheops_service_pages();
    return $pages[$slug] ?? null;
}

/** Hero plus the "How we help" and "What we handle" sections of a service page. */
function cheops_render_service_page($slug, $image_url) {
    $p = cheops_service_page($slug);
    if (!$p) return;
    ?>
<section class="hero service-hero hero-investment" id="hero"><img alt="<?php echo esc_attr($p['headline'][0] . ' ' . $p['headline'][1]); ?>" class="hero-bg" id="heroImg" fetchpriority="high" src="<?php echo esc_url($image_url); ?>"<?php echo cheops_hero_img_attrs($image_url); ?>/><div class="wrap hero-content"><div class="hero-copy"><div class="eyebrow"><?php echo esc_html($p['eyebrow']); ?></div><h1 class="d"><?php foreach ($p['headline'] as $line) : ?><span class="rl"><span><?php echo esc_html($line); ?></span></span><?php endforeach; ?></h1><p class="lead"><?php echo esc_html($p['lead']); ?></p><div class="hero-actions"><a class="btn light btn-light" data-cursor="Open" href="<?php echo esc_url(home_url($p['primary'][1])); ?>"><?php echo esc_html($p['primary'][0]); ?> <span class="ar">→</span></a><a class="btn ghost btn-ghost" data-cursor="Open" href="<?php echo esc_url(home_url('/contact/')); ?>">Talk to an advisor <span class="ar">→</span></a></div></div></div><div class="hero-scroll"><span class="eyebrow">Scroll</span></div></section>
<section class="section paper" id="service-body"><span class="blob" style="width:380px;height:380px;top:6%;left:-8%;background:rgba(229,207,167,.24)"></span><div class="wrap"><div class="eyebrow gold">How we help</div><h2 class="d section-title reveal"><span class="rl"><span><?php echo esc_html($p['help_title']); ?></span></span></h2><div class="pillars"><?php foreach ($p['help'] as $item) : ?><div class="pillar reveal" data-cursor="Explore"><h3 class="d"><?php echo esc_html($item[0]); ?></h3><p><?php echo esc_html($item[1]); ?></p></div><?php endforeach; ?></div></div></section>
<?php
}

function cheops_render_service_handle($slug, $image_url) {
    $p = cheops_service_page($slug);
    if (!$p) return;
    ?>
<section class="section service-handle"><span class="blob" style="width:450px;height:450px;top:11%;right:-8%;background:rgba(109,91,208,.10)"></span><div class="wrap split"><div class="image-panel reveal"><img alt="<?php echo esc_attr($p['eyebrow']); ?>" loading="lazy" decoding="async" src="<?php echo esc_url(cheops_img_variant($image_url, 800)); ?>"/></div><div><div class="eyebrow gold">What we handle</div><h2 class="d statement reveal"><span class="rl"><span><?php echo esc_html($p['handle_title']); ?></span></span></h2><div class="bullet-list reveal"><?php foreach ($p['handle'] as $item) : ?><div class="handle handle-detail reveal" data-cursor="Explore"><strong><?php echo esc_html($item[0]); ?></strong><span><?php echo esc_html($item[1]); ?></span></div><?php endforeach; ?></div></div></div></section>
<?php
}
