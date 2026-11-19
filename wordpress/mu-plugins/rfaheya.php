<?php
/**
 * Plugin Name: Rfaheya Store
 * Description: WordPress side of the headless Rfaheya storefront: store settings (contact, social, home page), FAQs, page section labels, the "Rfaheya details" box on products, the fragrance notes library, wear-report videos, starter-content import, and the REST routes the storefront reads.
 * Version:     3.0.1
 *
 * Must-use plugin: lives in wp-content/mu-plugins/ and runs automatically.
 * Starter content (articles, pages, FAQs, images) ships in mu-plugins/rfaheya/.
 */

defined( 'ABSPATH' ) || exit;

const RFAHEYA_OPTION = 'rfaheya_store';
// Bump when the shop data changes shape or how it is gathered: older saved copies are then rebuilt.
const RFAHEYA_DATA_VERSION = 10;

// ==================================================================== settings

/** Settings fields: group => key => [label, default, type]. */
function rfaheya_fields() {
	return array(
		'contact' => array(
			'email'    => array( 'Contact email', 'hello@rfaheya.com', 'text' ),
			'phone'    => array( 'Phone', '+20 100 000 0000', 'text' ),
			'whatsapp' => array( 'WhatsApp number (international, digits only, e.g. 2010…)', '201000000000', 'text' ),
			'hours'    => array( 'Opening hours', 'Sat – Thu · 10 AM – 8 PM', 'text' ),
			'location' => array( 'Location', 'Cairo, Egypt', 'text' ),
			'instapay' => array( 'InstaPay address customers transfer to', 'rfaheya@instapay', 'text' ),
		),
		'social'  => array(
			'instagram' => array( 'Instagram URL', 'https://www.instagram.com/', 'url' ),
			'tiktok'    => array( 'TikTok URL', 'https://www.tiktok.com/', 'url' ),
			'youtube'   => array( 'YouTube URL', 'https://www.youtube.com/', 'url' ),
			'facebook'  => array( 'Facebook URL', 'https://www.facebook.com/', 'url' ),
		),
		'home'    => array(
			'announcement_1' => array( 'Announcement bar — message 1', 'Free shipping in Cairo & Alexandria on orders over 1200 EGP', 'text' ),
			'announcement_2' => array( 'Announcement bar — message 2', 'Try 5 ML first — discover your scent before committing', 'text' ),
			'announcement_3' => array( 'Announcement bar — message 3', 'Zero risk guarantee', 'text' ),
			'hero_eyebrow'   => array( 'Hero — small line above the title', 'Fragrances made personal', 'text' ),
			'hero_title'     => array( 'Hero — title (press Enter for a new line)', "Speak\nyour scent.", 'textarea' ),
			'hero_text'      => array( 'Hero — text', 'Discover inspired fragrances crafted with quality materials, high concentration and a signature Rfaheya experience.', 'textarea' ),
			'hero_image'     => array( 'Hero — image', '', 'image' ),
			'logo'           => array( 'Logo (header, footer and My Account) — PNG or SVG; empty uses the built-in logo', '', 'image' ),
			'logo_height'    => array( 'Logo size — height in the header on computers (px, 30–90; 56 is the default)', '56', 'text' ),
			'logo_height_mobile' => array( 'Logo size — height in the header on phones (px, 28–70; 48 is the default)', '48', 'text' ),
			'logo_footer'    => array( 'Logo size — width in the footer (px, 120–360; 240 is the default)', '240', 'text' ),
		),
		'slider'  => array(
			'enabled'         => array( 'Show the hero slider on the home page (otherwise the single hero above)', 'yes', 'yesno' ),
			'interval'        => array( 'Seconds per slide', '6', 'text' ),
			'intro'           => array( 'Opening animation on the first visit (“Speak your scent”) — looks lovely but slows the PageSpeed score', 'no', 'yesno' ),
			'slide_1_show'    => array( 'Slide 1 — show this slide', 'yes', 'yesno' ),
			'slide_1_image'   => array( 'Slide 1 — image (945 × 780)', '', 'image' ),
			'slide_1_mobile'  => array( 'Slide 1 — image for phones (optional, 358 × 550)', '', 'image' ),
			'slide_1_closed'  => array( 'Slide 1 — narrow image while closed (optional, computers, 170 × 780)', '', 'image' ),
			'slide_1_eyebrow' => array( 'Slide 1 — small line above the title', 'New season', 'text' ),
			'slide_1_title'   => array( 'Slide 1 — title', 'The Oud Edit', 'text' ),
			'slide_1_text'    => array( 'Slide 1 — text under the title', 'Deep, warm and unforgettable — our richest scents for the cold nights.', 'textarea' ),
			'slide_1_button'  => array( 'Slide 1 — button text', 'Shop the edit', 'text' ),
			'slide_1_link'    => array( 'Slide 1 — button link (e.g. /shop or /collections/oud)', '/shop?family=oriental', 'text' ),
			'slide_2_show'    => array( 'Slide 2 — show this slide', 'yes', 'yesno' ),
			'slide_2_image'   => array( 'Slide 2 — image (945 × 780)', '', 'image' ),
			'slide_2_mobile'  => array( 'Slide 2 — image for phones (optional, 358 × 550)', '', 'image' ),
			'slide_2_closed'  => array( 'Slide 2 — narrow image while closed (optional, computers, 170 × 780)', '', 'image' ),
			'slide_2_eyebrow' => array( 'Slide 2 — small line above the title', 'Limited offer', 'text' ),
			'slide_2_title'   => array( 'Slide 2 — title', 'Spend more, save more', 'text' ),
			'slide_2_text'    => array( 'Slide 2 — text under the title', 'Free shipping over 1,200 EGP · 20% off + free shipping over 2,500 EGP.', 'textarea' ),
			'slide_2_button'  => array( 'Slide 2 — button text', 'Start shopping', 'text' ),
			'slide_2_link'    => array( 'Slide 2 — button link (e.g. /shop or /collections/oud)', '/shop', 'text' ),
			'slide_3_show'    => array( 'Slide 3 — show this slide', 'yes', 'yesno' ),
			'slide_3_image'   => array( 'Slide 3 — image (945 × 780)', '', 'image' ),
			'slide_3_mobile'  => array( 'Slide 3 — image for phones (optional, 358 × 550)', '', 'image' ),
			'slide_3_closed'  => array( 'Slide 3 — narrow image while closed (optional, computers, 170 × 780)', '', 'image' ),
			'slide_3_eyebrow' => array( 'Slide 3 — small line above the title', 'Rfaheya Finder', 'text' ),
			'slide_3_title'   => array( 'Slide 3 — title', 'Find your scent', 'text' ),
			'slide_3_text'    => array( 'Slide 3 — text under the title', 'Answer a few questions and meet the fragrance that feels like you.', 'textarea' ),
			'slide_3_button'  => array( 'Slide 3 — button text', 'Take the quiz', 'text' ),
			'slide_3_link'    => array( 'Slide 3 — button link (e.g. /shop or /collections/oud)', '/finder/quiz', 'text' ),
			'slide_4_show'    => array( 'Slide 4 — show this slide', 'yes', 'yesno' ),
			'slide_4_image'   => array( 'Slide 4 — image (945 × 780)', '', 'image' ),
			'slide_4_mobile'  => array( 'Slide 4 — image for phones (optional, 358 × 550)', '', 'image' ),
			'slide_4_closed'  => array( 'Slide 4 — narrow image while closed (optional, computers, 170 × 780)', '', 'image' ),
			'slide_4_eyebrow' => array( 'Slide 4 — small line above the title', '', 'text' ),
			'slide_4_title'   => array( 'Slide 4 — title', '', 'text' ),
			'slide_4_text'    => array( 'Slide 4 — text under the title', '', 'textarea' ),
			'slide_4_button'  => array( 'Slide 4 — button text', '', 'text' ),
			'slide_4_link'    => array( 'Slide 4 — button link (e.g. /shop or /collections/oud)', '', 'text' ),
		),
		'login'   => array(
			'google_client_id'     => array( 'Google — Client ID', '', 'text' ),
			'google_client_secret' => array( 'Google — Client secret', '', 'secret' ),
			'facebook_app_id'      => array( 'Facebook — App ID', '', 'text' ),
			'facebook_app_secret'  => array( 'Facebook — App secret', '', 'secret' ),
		),
		'bundle'  => array(
			'enabled' => array( 'Show the bundle section on the home page and apply its discount', 'yes', 'yesno' ),
			'title'   => array( 'Title', 'Build your bundle.', 'text' ),
			'text'    => array( 'Text', 'Pick any fragrances in any size — the more you add, the more you save.', 'textarea' ),
			'stack'   => array( 'Adds up with other discounts — off: when the order also fits an offer or “spend more, save more”, it gets only the biggest discount', 'no', 'yesno' ),
			'tiers'   => array( 'Discount by number of bottles — one per line, “bottles = discount %”. Counts every full bottle in the cart (any fragrance, any size; 5–10 ML samples don’t count). The highest step reached applies.', "2 = 5\n3 = 10\n4 = 15\n5 = 20", 'textarea' ),
		),
		'loyalty'  => array(
			'enabled'         => array( 'Loyalty points: customers earn points on completed orders and use them as a discount', 'yes', 'yesno' ),
			'earn'            => array( 'Points earned per 1 EGP spent (shipping not counted)', '1', 'text' ),
			'value'           => array( 'Discount value of 100 points (EGP)', '5', 'text' ),
			'min'             => array( 'Fewest points a customer can use at once', '200', 'text' ),
			'welcome_enabled' => array( 'Welcome discount: a discount on the first order (with an animated pop-up) for customers who sign in', 'yes', 'yesno' ),
			'welcome_percent' => array( 'Welcome discount (%)', '5', 'text' ),
			'welcome_stack'   => array( 'Welcome / first-order discount adds up with other discounts — off: the order gets either it or the other discount, whichever is bigger', 'yes', 'yesno' ),
		),
		'gift'     => array(
			'enabled' => array( 'Charge gift packaging on gift boxes', 'yes', 'yesno' ),
			'max'     => array( 'Most fragrances in one box', '6', 'text' ),
			'prices'  => array( 'Packaging price by number of fragrances in the box — one per line, “fragrances = price (EGP)”. A box with more fragrances than the last line pays the last price.', "1 = 60\n2 = 90\n3 = 120\n4 = 150\n5 = 180\n6 = 200", 'textarea' ),
			'wrap_enabled' => array( 'Gift wrap in the cart (a switch: the order is boxed with a handwritten card)', 'yes', 'yesno' ),
			'wrap_price'   => array( 'Gift wrap price (EGP)', '50', 'text' ),
		),
		'shipping' => array(
			'free_enabled' => array( 'Free shipping in Cairo & Alexandria (and the bar on the product page, cart and checkout)', 'yes', 'yesno' ),
			'free_min'     => array( 'Free shipping from (EGP)', '1200', 'text' ),
			'offer_enabled' => array( 'Spend more, save more: a discount plus free shipping (anywhere) from a higher amount, shown on the same bar', 'yes', 'yesno' ),
			'offer_min'     => array( 'Discount + free shipping from (EGP)', '2500', 'text' ),
			'offer_percent' => array( 'Discount (%)', '20', 'text' ),
			'offer_stack'   => array( 'Spend more, save more adds up with other discounts — off: the order gets only the biggest discount', 'no', 'yesno' ),
			'order_min'     => array( 'Minimum order (EGP) — the smallest basket that can be ordered; 0 for none', '300', 'text' ),
		),
		'images'   => rfaheya_image_fields(),
		'discovery' => array(
			'enabled' => array( 'Discovery sets at a set price — any samples (5 ml) in the cart: 10 for one price, 20 for another; between 10 and 20, the extra ones at their own price', 'yes', 'yesno' ),
			'set10'   => array( 'Set of 10 samples (EGP)', '650', 'text' ),
			'set20'   => array( 'Set of 20 samples (EGP)', '1000', 'text' ),
		),
		'seo'      => array(
			'redirects' => array( 'Redirects — one per line: old address, a space or →, new address (e.g. /old-perfume → /shop/new-perfume). Old site links (/shop/…, /product-category/…, articles at /…, /ar/…) are redirected automatically; add only the ones that changed name.', '', 'textarea' ),
		),
		'campaigns' => array(
			'vanilla_label' => array( 'Vanilla campaign — name in the menu', 'Vanilla Redefined', 'text' ),
			'vanilla_title' => array( 'Vanilla campaign — banner title (the words after the comma show in gold)', 'Vanilla, redefined.', 'text' ),
			'vanilla_text'  => array( 'Vanilla campaign — banner text', 'The warmest note in perfumery, re-composed: smooth, addictive vanilla with a modern, long-lasting Rfaheya signature.', 'textarea' ),
			'vanilla_products' => array( 'Vanilla campaign — its products (ticked ones show on the page; none ticked = the products tagged “Vanilla Redefined”, else the ones with vanilla notes)', '', 'products' ),
			'oudrose_label' => array( 'Oud & Rose campaign — name in the menu', 'Oud & Rose Redefined', 'text' ),
			'oudrose_title' => array( 'Oud & Rose campaign — banner title (the words after the comma show in gold)', 'Oud & Rose, redefined.', 'text' ),
			'oudrose_text'  => array( 'Oud & Rose campaign — banner text', 'Two legends of the Orient, side by side: deep smoky oud and velvet rose, crafted with quality materials and high concentration.', 'textarea' ),
			'oudrose_products' => array( 'Oud & Rose campaign — its products (ticked ones show on the page; none ticked = the products tagged “Oud & Rose Redefined”, else the ones with oud or rose notes)', '', 'products' ),
		),
	);
}

/**
 * Site images (Settings → Rfaheya Store → Site images): key => array( label, file name it is
 * picked up from in the media library the first time, size sent to the storefront ).
 * An empty field keeps the storefront's built-in picture.
 */
function rfaheya_site_images() {
	$c = 'Collections page card';
	return array(
		'campaign_vanilla'     => array( 'Vanilla Redefined — banner (computers, 1600 × 760)', '', 'full' ),
		'campaign_vanilla_m'   => array( 'Vanilla Redefined — banner (phones, 750 × 1100)', '', 'full' ),
		'campaign_oudrose'     => array( 'Oud & Rose Redefined — banner (computers, 1600 × 760)', '', 'full' ),
		'campaign_oudrose_m'   => array( 'Oud & Rose Redefined — banner (phones, 750 × 1100)', '', 'full' ),
		'col_perfume_lab'      => array( "$c — Perfume Lab (computers, 834 × 522)", 'perfume-lab.webp', 'full' ),
		'col_perfume_lab_m'    => array( "$c — Perfume Lab (phones, 436 × 348)", 'perfume-lab-Mobile.webp', 'full' ),
		'col_ledger'           => array( "$c — Ledger (computers)", 'ledger.webp', 'full' ),
		'col_ledger_m'         => array( "$c — Ledger (phones)", 'ledger-Mobile.webp', 'full' ),
		'col_serenity'         => array( "$c — Serenity (computers)", 'serenity.webp', 'full' ),
		'col_serenity_m'       => array( "$c — Serenity (phones)", 'serenityMobile.webp', 'full' ),
		'col_discovery_sets'   => array( "$c — Discovery Sets (computers)", 'discovery-sets.webp', 'full' ),
		'col_discovery_sets_m' => array( "$c — Discovery Sets (phones)", 'discovery-sets-Mobile.webp', 'full' ),
		'col_gift_boxes'       => array( "$c — Gift Boxes (computers)", 'gift-boxes.webp', 'full' ),
		'col_gift_boxes_m'     => array( "$c — Gift Boxes (phones)", 'gift-boxes.Mobile.webp', 'full' ),
		'colhero_perfume_lab'    => array( 'Collection page banner — Perfume Lab (no text on it, 1600 × 700)', '', 'large' ),
		'colhero_ledger'         => array( 'Collection page banner — Ledger', '', 'large' ),
		'colhero_serenity'       => array( 'Collection page banner — Serenity', '', 'large' ),
		'colhero_discovery_sets' => array( 'Collection page banner — Discovery Sets', '', 'large' ),
		'colhero_gift_boxes'     => array( 'Collection page banner — Gift Boxes', '', 'large' ),
		'standard_hero'        => array( 'Our Standard banner (computers, 1284 × 640)', 'Our-Standard.webp', 'full' ),
		'standard_hero_m'      => array( 'Our Standard banner (phones, 358 × 600)', 'ﺑﺎﻧﺮ-Our-Standard-—-ﻣﻮﺑﺎﻳﻞ.webp', 'full' ),
		'finder_hero'          => array( 'Finder start page — big picture (2048 × 1092)', '', 'large' ),
		'finder_cta'           => array( 'Finder start page — picture by the button', '', 'medium_large' ),
		'finder_card_style'    => array( 'Finder start page — card “Your style”', '', 'medium_large' ),
		'finder_card_moments'  => array( 'Finder start page — card “Your moments”', '', 'medium_large' ),
		'finder_card_prefs'    => array( 'Finder start page — card “Your preferences”', '', 'medium_large' ),
		'finder_card_match'    => array( 'Finder start page — card “Your match”', '', 'medium_large' ),
		'panel_for'            => array( 'Finder — big picture beside question 1 “For you” (1100 × 1880)', 'For-You.webp', 'large' ),
		'panel_occasion'       => array( 'Finder — beside question 2 “Occasion”', 'Occasion.webp', 'large' ),
		'panel_style'          => array( 'Finder — beside question 3 “Scent style”', 'Scent-Style.webp', 'large' ),
		'panel_notes'          => array( 'Finder — beside question 4 “Notes”', 'Notes.webp', 'large' ),
		'panel_season'         => array( 'Finder — beside question 5 “Season”', 'Season.webp', 'large' ),
		'panel_presence'       => array( 'Finder — beside question 6 “Presence”', 'Presence.webp', 'large' ),
		'panel_longevity'      => array( 'Finder — beside question 7 “Longevity”', 'Longevity-FINDER.webp', 'large' ),
		'for_men'              => array( 'Finder — Men', 'MEN.webp', 'medium_large' ),
		'for_women'            => array( 'Finder — Women', 'WOMEN.webp', 'medium_large' ),
		'for_unisex'           => array( 'Finder — Unisex', 'UNISEX.webp', 'medium_large' ),
		'occ_everyday'         => array( 'Finder — Everyday', 'EVERYDAY.webp', 'medium_large' ),
		'occ_work'             => array( 'Finder — Work', 'WORK.webp', 'medium_large' ),
		'occ_date'             => array( 'Finder — Date night', 'DATE-NIGHT.webp', 'medium_large' ),
		'occ_special'          => array( 'Finder — Special occasions', 'Special-occasion.webp', 'medium_large' ),
		'occ_club'             => array( 'Finder — Club vibe', 'CLUB-VIBE.webp', 'medium_large' ),
		'style_fresh'          => array( 'Finder — Fresh & clean', 'fresh.webp', 'medium_large' ),
		'style_oriental'       => array( 'Finder — Warm & oriental', 'warm.webp', 'medium_large' ),
		'style_floral'         => array( 'Finder — Floral & expressive', 'floral-1.webp', 'medium_large' ),
		'style_fruity'         => array( 'Finder — Fruity & juicy', 'Fruity-Juicy.webp', 'medium_large' ),
		'style_sweet'          => array( 'Finder — Sweet & addictive', 'Sweet-Addictive.webp', 'medium_large' ),
		'note_citrus'          => array( 'Finder note — Citrus', '', 'medium_large' ),
		'note_aquatic'         => array( 'Finder note — Aquatic', '', 'medium_large' ),
		'note_woods'           => array( 'Finder note — Woods', '', 'medium_large' ),
		'note_floral'          => array( 'Finder note — Floral', '', 'medium_large' ),
		'note_fruity'          => array( 'Finder note — Fruity', '', 'medium_large' ),
		'note_musk'            => array( 'Finder note — Musk', '', 'medium_large' ),
		'note_vanilla'         => array( 'Finder note — Vanilla', '', 'medium_large' ),
		'note_caramel'         => array( 'Finder note — Caramel', '', 'medium_large' ),
		'note_tonka'           => array( 'Finder note — Tonka', '', 'medium_large' ),
		'note_oud'             => array( 'Finder note — Oud', '', 'medium_large' ),
		'note_incense'         => array( 'Finder note — Incense', '', 'medium_large' ),
		'note_leather'         => array( 'Finder note — Leather', '', 'medium_large' ),
		'note_rose'            => array( 'Finder note — Rose', '', 'medium_large' ),
		'note_jasmine'         => array( 'Finder note — Jasmine', '', 'medium_large' ),
		'note_amber'           => array( 'Finder note — Amber', '', 'medium_large' ),
		'season_spring'        => array( 'Finder — Spring', 'SPRING.webp', 'medium_large' ),
		'season_summer'        => array( 'Finder — Summer', 'SUMMER.webp', 'medium_large' ),
		'season_autumn'        => array( 'Finder — Autumn', 'Autumn.webp', 'medium_large' ),
		'season_winter'        => array( 'Finder — Winter', 'Winter.webp', 'medium_large' ),
		'season_all'           => array( 'Finder — All year', 'ALL-YEAR.webp', 'medium_large' ),
		'pres_soft'            => array( 'Finder — Soft', 'soft.webp', 'medium_large' ),
		'pres_balanced'        => array( 'Finder — Balanced', 'balanced.webp', 'medium_large' ),
		'pres_bold'            => array( 'Finder — Bold', 'bold.webp', 'medium_large' ),
		'long_standard'        => array( 'Finder — Moderate (up to 6 hours)', 'Moderate.webp', 'medium_large' ),
		'long_extended'        => array( 'Finder — Extended (up to 8 hours)', 'Extended.webp', 'medium_large' ),
		'long_eternal'         => array( 'Finder — Eternal (12+ hours)', 'Eternal.webp', 'medium_large' ),
	);
}

function rfaheya_image_fields() {
	$out = array();
	foreach ( rfaheya_site_images() as $key => $img ) {
		$out[ $key ] = array( $img[0], '', 'image' );
	}
	return $out;
}

/** The chosen site images for the storefront: key => URL (only the ones chosen). */
function rfaheya_site_images_data() {
	$o   = rfaheya_options()['images'];
	$out = array();
	foreach ( rfaheya_site_images() as $key => $img ) {
		$id = (int) ( $o[ $key ] ?? 0 );
		if ( $id ) {
			// A smaller copy WordPress made (falls back to the original when there is none).
			$url = wp_get_attachment_image_url( $id, $img[2] );
			if ( $url ) {
				$out[ $key ] = (string) $url;
			}
		}
	}
	return (object) $out;
}

/*
 * The first time, the site images already in the media library are filled in by their file
 * names (so nothing has to be picked by hand); after that the fields are yours.
 */
add_action(
	'admin_init',
	function () {
		if ( get_option( 'rfaheya_images_seeded' ) || ! current_user_can( 'manage_options' ) ) {
			return;
		}
		global $wpdb;
		$saved = get_option( RFAHEYA_OPTION, array() );
		$saved = is_array( $saved ) ? $saved : array();
		$found = 0;
		foreach ( rfaheya_site_images() as $key => $img ) {
			if ( '' === $img[1] || ! empty( $saved['images'][ $key ] ) ) {
				continue;
			}
			$like = '%/' . $wpdb->esc_like( $img[1] );
			$id   = (int) $wpdb->get_var( $wpdb->prepare( "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_wp_attached_file' AND ( meta_value LIKE %s OR meta_value = %s ) ORDER BY post_id DESC LIMIT 1", $like, $img[1] ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			if ( $id ) {
				$saved['images'][ $key ] = (string) $id;
				++$found;
			}
		}
		if ( $found ) {
			update_option( RFAHEYA_OPTION, $saved );
			update_option( 'rfaheya_images_seeded', time(), false );
		}
	}
);

function rfaheya_group_title( $group ) {
	$titles = array(
		'contact' => 'Contact details',
		'social'  => 'Social links',
		'home'    => 'Home page (empty fields keep the storefront’s built-in text)',
		'bundle'  => 'Bundle (home page bundle builder; the discount is applied in the cart)',
		'slider'  => 'Home hero slider (up to four slides, each with your own image and text; they open like an accordion. A slide shows when it has an image or a title; with none filled in, three built-in slides show)',
		'login'   => 'Sign in with Google / Facebook (the buttons show once the keys are filled in)',
		'images'  => 'Site images (an empty field keeps the built-in picture; WordPress’s smaller copy is used, so pages stay fast)',
		'campaigns' => 'Campaigns in the header. Each page shows the products you tag with its menu name in WooCommerce (Products → Tags, e.g. “Vanilla Redefined”); with none tagged, the fragrances whose notes match. Banners: Site images tab.',
		'shipping' => 'Free shipping & spend-more offer (the bar on the product page, cart and checkout; applied in the WooCommerce cart and shipping rates)',
		'gift'     => 'Gift boxes (customers fill a box with any fragrances; a hidden “Gift box” product carries the packaging price)',
		'loyalty'  => 'Loyalty points & welcome discount (points are added when an order is marked Completed; a customer’s points can be changed on their user profile)',
	);
	return isset( $titles[ $group ] ) ? $titles[ $group ] : $group;
}

function rfaheya_options() {
	$saved = get_option( RFAHEYA_OPTION, array() );
	$saved = is_array( $saved ) ? $saved : array();
	$out   = array();
	foreach ( rfaheya_fields() as $group => $fields ) {
		foreach ( $fields as $key => $field ) {
			$value                 = isset( $saved[ $group ][ $key ] ) ? (string) $saved[ $group ][ $key ] : '';
			$out[ $group ][ $key ] = '' !== $value ? $value : $field[1];
		}
	}
	return $out;
}

add_action(
	'admin_init',
	function () {
		register_setting(
			'rfaheya_store',
			RFAHEYA_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => 'rfaheya_clean_settings',
			)
		);
	}
);

add_action(
	'admin_menu',
	function () {
		add_options_page( 'Rfaheya Store', 'Rfaheya Store', 'manage_options', 'rfaheya-store', 'rfaheya_settings_page' );
	}
);

/** Tabs of the Rfaheya Store page: title, dashicon, one line about it, and the field groups in it. */
function rfaheya_settings_tabs() {
	return array(
		'store'    => array( 'Store', 'dashicons-store', 'How customers reach you, and your social pages.', array( 'contact', 'social' ) ),
		'home'     => array( 'Home & logo', 'dashicons-admin-home', 'The announcement bar, the hero, the slider and your logo.', array( 'home', 'slider' ) ),
		'offers'   => array( 'Orders & offers', 'dashicons-tag', 'Minimum order, free shipping, the spend-more offer, the bundle and the discovery sets.', array( 'shipping', 'bundle', 'discovery' ) ),
		'gifts'    => array( 'Gift boxes', 'dashicons-heart', 'Packaging prices for the gift boxes customers build.', array( 'gift' ) ),
		'loyalty'  => array( 'Loyalty', 'dashicons-awards', 'Points and the first-order welcome discount.', array( 'loyalty' ) ),
		'campaigns' => array( 'Campaigns', 'dashicons-megaphone', 'Vanilla Redefined and Oud & Rose Redefined: menu names and banner texts.', array( 'campaigns' ) ),
		'images'   => array( 'Site images', 'dashicons-format-gallery', 'The pictures on the Collections page, Our Standard and the Rfaheya Finder.', array( 'images' ) ),
		'signin'   => array( 'Sign in', 'dashicons-admin-users', 'Google and Facebook sign-in buttons.', array( 'login' ) ),
		'seo'      => array( 'SEO & redirects', 'dashicons-search', 'Old addresses sent to new ones (301). Titles and descriptions come from Rank Math.', array( 'seo' ) ),
		'tools'    => array( 'Tools', 'dashicons-admin-tools', 'Starter content and store health.', array() ),
	);
}

/** Smaller headings inside a group, by field name. */
function rfaheya_settings_section( $group, $key ) {
	if ( 'home' === $group ) {
		if ( 0 === strpos( $key, 'announcement' ) ) {
			return 'Announcement bar';
		}
		if ( 0 === strpos( $key, 'hero' ) ) {
			return 'Hero (when the slider is off)';
		}
		return 'Logo';
	}
	if ( 'slider' === $group ) {
		return preg_match( '/^slide_(\d)_/', $key, $m ) ? 'Slide ' . $m[1] : 'Hero slider';
	}
	if ( 'images' === $group ) {
		$sections = array(
			'campaign' => 'Campaign banners',
			'col_'     => 'Collections page',
			'colhero_' => 'Collection page banners',
			'standard' => 'Our Standard',
			'finder_'  => 'Finder start page',
			'panel_'   => 'Finder — the big picture beside each question',
			'for_'     => 'Finder — who it’s for',
			'occ_'     => 'Finder — occasion',
			'style_'   => 'Finder — scent style',
			'note_'    => 'Finder — notes',
			'season_'  => 'Finder — season',
			'pres_'    => 'Finder — presence',
			'long_'    => 'Finder — longevity',
		);
		foreach ( $sections as $prefix => $title ) {
			if ( 0 === strpos( $key, $prefix ) ) {
				return $title;
			}
		}
	}
	$titles = array(
		'contact'  => 'Contact details',
		'social'   => 'Social links',
		'shipping' => 'Minimum order, free shipping & spend more',
		'bundle'   => 'Bundle — the more bottles, the bigger the discount',
		'gift'     => 'Gift boxes & gift wrap',
		'loyalty'  => 'Points & welcome discount',
		'login'    => 'Sign in with Google / Facebook',
		'campaigns' => 'Campaigns',
		'seo'       => 'Redirects',
		'discovery' => 'Discovery sets — 10 or 20 samples at a set price',
	);
	if ( 'campaigns' === $group ) {
		return 0 === strpos( $key, 'vanilla' ) ? 'Vanilla Redefined' : 'Oud & Rose Redefined';
	}
	return isset( $titles[ $group ] ) ? $titles[ $group ] : $group;
}

/** The submitted settings, cleaned field by field. */
function rfaheya_clean_settings( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();
	foreach ( rfaheya_fields() as $group => $fields ) {
		foreach ( $fields as $key => $field ) {
			if ( 'products' === $field[2] ) {
				// Ticked products, as a list of ids.
				$ids = isset( $input[ $group ][ $key ] ) ? $input[ $group ][ $key ] : array();
				$ids = is_array( $ids ) ? $ids : explode( ',', (string) $ids ); // a saved list comes back as "12,7,30"
				$clean[ $group ][ $key ] = implode( ',', array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) ) );
				continue;
			}
			$value = isset( $input[ $group ][ $key ] ) ? trim( (string) $input[ $group ][ $key ] ) : '';
			switch ( $field[2] ) {
				case 'url':
					$value = esc_url_raw( $value );
					break;
				case 'textarea':
					$value = str_replace( "\r\n", "\n", sanitize_textarea_field( $value ) );
					break;
				case 'image':
				case 'product':
					$value = $value ? (string) absint( $value ) : '';
					break;
				case 'yesno':
					$value = 'no' === $value ? 'no' : 'yes';
					break;
				default:
					$value = sanitize_text_field( $value );
			}
			$clean[ $group ][ $key ] = $value;
		}
	}
	return $clean;
}

// The page saves through its own handler (no options.php), then comes back to the same tab.
add_action(
	'admin_post_rfaheya_save_settings',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Sorry, you are not allowed to change these settings.' );
		}
		check_admin_referer( 'rfaheya_save_settings' );
		$input = isset( $_POST[ RFAHEYA_OPTION ] ) ? wp_unslash( $_POST[ RFAHEYA_OPTION ] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned field by field below
		$saved = get_option( RFAHEYA_OPTION, array() );
		$saved = is_array( $saved ) ? $saved : array();
		// Groups not on the form keep what they had.
		foreach ( rfaheya_fields() as $group => $fields ) {
			if ( ! isset( $input[ $group ] ) && isset( $saved[ $group ] ) ) {
				$input[ $group ] = $saved[ $group ];
			}
		}
		$clean = rfaheya_clean_settings( $input );
		update_option( RFAHEYA_OPTION, $clean );
		// Content changes show up right away (same as update_option_ hooks; runs even when nothing changed).
		delete_transient( 'rfaheya_bootstrap' );
		rfaheya_purge_page_cache();
		$tab = isset( $_POST['rfaheya_tab'] ) ? sanitize_key( wp_unslash( $_POST['rfaheya_tab'] ) ) : 'store';
		wp_safe_redirect( add_query_arg( array( 'page' => 'rfaheya-store', 'tab' => $tab, 'saved' => '1' ), admin_url( 'options-general.php' ) ) );
		exit;
	}
);

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'settings_page_rfaheya-store' !== $hook ) {
			return;
		}
		wp_enqueue_media();
		$base = WPMU_PLUGIN_URL . '/rfaheya-admin/';
		$ver  = file_exists( __DIR__ . '/rfaheya-admin/settings.css' ) ? (string) filemtime( __DIR__ . '/rfaheya-admin/settings.css' ) : '1';
		wp_enqueue_style( 'rfaheya-settings', $base . 'settings.css', array(), $ver );
		wp_enqueue_script( 'rfaheya-settings', $base . 'settings.js', array( 'jquery' ), $ver, true );
	}
);

/** One field, in the page's own style. */
/**
 * Live preview of the home slider in Settings → Rfaheya Store → Hero slider: the slides as the
 * store shows them, redrawn as the fields change (settings.js). Clicking a slide opens its fields.
 */
function rfaheya_slider_preview() {
	// The storefront's built-in pictures, for slides without their own.
	$builtin = array();
	foreach ( array( 'obsidian-945', 'dynasty-945', 'finder-945' ) as $name ) {
		$found     = glob( ABSPATH . 'assets/' . $name . '-*.webp' );
		$builtin[] = $found ? home_url( '/assets/' . basename( $found[0] ) ) : '';
	}
	?>
	<div class="rfs-card rfs-preview-card">
		<div class="rfs-preview-head">
			<h2>Preview</h2>
			<div class="rfs-seg" role="tablist">
				<button type="button" class="is-on" data-view="desktop">Computer</button>
				<button type="button" data-view="phone">Phone</button>
			</div>
		</div>
		<p class="rfs-text">How the slider looks on the home page with the texts and pictures below. Tap a slide to open its fields; changes show here as you type and go live when you save.</p>
		<div class="rfs-slider-preview is-desktop" data-builtin="<?php echo esc_attr( wp_json_encode( $builtin ) ); ?>"></div>
	</div>
	<?php
}

function rfaheya_settings_field( $group, $key, $field, $value ) {
	$id    = "rfaheya-$group-$key";
	$input = RFAHEYA_OPTION . "[$group][$key]";
	$label = $field[0];
	$help  = '';
	// "Title (explanation)" or "Title — explanation": the explanation shows smaller underneath.
	if ( preg_match( '/^(.+?)\s+\((.+)\)$/u', $label, $m ) ) {
		$label = $m[1];
		$help  = $m[2];
	}
	$range = array(
		'logo_height'        => array( 30, 90 ),
		'logo_height_mobile' => array( 28, 70 ),
		'logo_footer'        => array( 120, 360 ),
	);
	$wide = in_array( $field[2], array( 'textarea', 'image', 'products' ), true ) || 'yesno' === $field[2];
	echo '<div class="rfs-field' . ( $wide ? ' rfs-wide' : '' ) . ' rfs-type-' . esc_attr( $field[2] ) . '">';
	if ( 'yesno' === $field[2] ) {
		printf(
			'<label class="rfs-switch"><input type="hidden" name="%1$s" value="no"><input type="checkbox" id="%2$s" name="%1$s" value="yes" %3$s><span class="rfs-track" aria-hidden="true"></span><span class="rfs-switch-text"><strong>%4$s</strong>%5$s</span></label>',
			esc_attr( $input ),
			esc_attr( $id ),
			checked( $value, 'yes', false ),
			esc_html( $label ),
			$help ? '<small>' . esc_html( $help ) . '</small>' : ''
		);
		echo '</div>';
		return;
	}
	printf( '<label class="rfs-label" for="%s">%s</label>', esc_attr( $id ), esc_html( $label ) );
	if ( 'home' === $group && isset( $range[ $key ] ) ) {
		printf(
			'<div class="rfs-range"><input type="range" min="%1$d" max="%2$d" value="%3$d" data-for="%4$s" aria-label="%5$s"><span class="rfs-num"><input id="%4$s" type="number" min="%1$d" max="%2$d" name="%6$s" value="%3$d" data-logo="%7$s"> px</span></div>',
			(int) $range[ $key ][0],
			(int) $range[ $key ][1],
			(int) $value,
			esc_attr( $id ),
			esc_attr( $label ),
			esc_attr( $input ),
			esc_attr( $key )
		);
	} elseif ( 'textarea' === $field[2] ) {
		printf( '<textarea id="%s" rows="%d" name="%s">%s</textarea>', esc_attr( $id ), 'redirects' === $key ? 14 : 3, esc_attr( $input ), esc_textarea( $value ) );
	} elseif ( 'products' === $field[2] ) {
		rfaheya_products_picker( $id, $input, $value );
	} elseif ( 'product' === $field[2] ) {
		printf( '<select id="%s" name="%s"><option value="">— Best seller —</option>', esc_attr( $id ), esc_attr( $input ) );
		foreach ( rfaheya_one_language( get_posts( array( 'post_type' => 'product', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) ) ) as $p ) {
			printf( '<option value="%d" %s>%s</option>', (int) $p->ID, selected( (int) $value, $p->ID, false ), esc_html( get_the_title( $p ) ) );
		}
		echo '</select>';
	} elseif ( 'image' === $field[2] ) {
		$url = $value ? wp_get_attachment_image_url( (int) $value, 'medium' ) : '';
		printf(
			'<div class="rfs-image%5$s"><input id="%1$s" type="hidden" name="%2$s" value="%3$s"><button type="button" class="rfs-image-pick" data-target="%1$s" data-logo="%6$s"><span class="rfs-image-preview" id="%1$s-preview">%4$s</span><span class="rfs-image-empty"><span class="dashicons dashicons-format-image"></span>Choose image</span></button><button type="button" class="rfs-image-clear" data-target="%1$s">Remove</button></div>',
			esc_attr( $id ),
			esc_attr( $input ),
			esc_attr( $value ),
			$url ? '<img src="' . esc_url( $url ) . '" alt="">' : '',
			$url ? ' has-image' : '',
			'logo' === $key && 'home' === $group ? '1' : ''
		);
	} else {
		$type = 'url' === $field[2] ? 'url' : ( 'secret' === $field[2] ? 'password' : 'text' );
		printf( '<input id="%s" type="%s" name="%s" value="%s" autocomplete="off">', esc_attr( $id ), esc_attr( $type ), esc_attr( $input ), esc_attr( $value ) );
	}
	if ( $help ) {
		printf( '<small class="rfs-help">%s</small>', esc_html( $help ) );
	}
	echo '</div>';
}

/** "12,7,30" → [12, 7, 30] */
function rfaheya_id_list( $csv ) {
	return array_values( array_filter( array_map( 'absint', explode( ',', (string) $csv ) ) ) );
}

/** A searchable list of products to tick (the ticked ones first, in their order). */
function rfaheya_products_picker( $id, $input, $value ) {
	$picked   = rfaheya_id_list( $value );
	$products = rfaheya_one_language( get_posts( array( 'post_type' => 'product', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) ) );
	usort(
		$products,
		function ( $a, $b ) use ( $picked ) {
			$ia = array_search( (int) $a->ID, $picked, true );
			$ib = array_search( (int) $b->ID, $picked, true );
			if ( false === $ia && false === $ib ) {
				return 0;
			}
			if ( false === $ia ) {
				return 1;
			}
			if ( false === $ib ) {
				return -1;
			}
			return $ia <=> $ib;
		}
	);
	printf( '<div class="rfs-products" id="%s"><input type="hidden" name="%s[]" value="">', esc_attr( $id ), esc_attr( $input ) );
	echo '<div class="rfs-products-tools"><input type="search" class="rfs-products-search" placeholder="Search products…" aria-label="Search products"><span class="rfs-products-count"></span><button type="button" class="button-link rfs-products-clear">Clear all</button></div><div class="rfs-products-list">';
	foreach ( $products as $p ) {
		printf(
			'<label class="rfs-product" data-name="%1$s"><input type="checkbox" name="%2$s[]" value="%3$d" %4$s>%5$s<span>%6$s</span></label>',
			esc_attr( strtolower( get_the_title( $p ) ) ),
			esc_attr( $input ),
			(int) $p->ID,
			checked( in_array( (int) $p->ID, $picked, true ), true, false ),
			get_the_post_thumbnail( $p->ID, array( 36, 36 ) ),
			esc_html( get_the_title( $p ) )
		);
	}
	echo '</div></div>';
	static $once = false;
	if ( $once ) {
		return;
	}
	$once = true;
	?>
	<style>
		.rfs-products{border:1px solid #dcdcde;border-radius:10px;padding:8px;background:#fff}
		.rfs-products-tools{display:flex;gap:12px;align-items:center;margin-bottom:6px}.rfs-products-search{flex:1;max-width:320px}
		.rfs-products-count{color:#646970}.rfs-products-clear{margin-left:auto;color:#b32d2e}
		.rfs-products-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:4px;max-height:300px;overflow:auto}
		.rfs-product{display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:6px;cursor:pointer}
		.rfs-product:hover{background:#f6f7f7}.rfs-product:has(input:checked){background:#fcf3e4}
		.rfs-product img{width:30px;height:30px;object-fit:cover;border-radius:4px}
	</style>
	<script>
	document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.rfs-products').forEach(function(box){
		var s=box.querySelector('.rfs-products-search'),c=box.querySelector('.rfs-products-count');
		function count(){c.textContent=box.querySelectorAll('.rfs-product input:checked').length+' ticked'}
		s.addEventListener('input',function(){var q=s.value.trim().toLowerCase();box.querySelectorAll('.rfs-product').forEach(function(l){l.style.display=!q||l.dataset.name.indexOf(q)>-1?'':'none'})});
		box.querySelector('.rfs-products-clear').addEventListener('click',function(){box.querySelectorAll('.rfs-product input').forEach(function(i){i.checked=false});count()});
		box.addEventListener('change',count);count();
	})});
	</script>
	<?php
}

function rfaheya_settings_page() {
	$options = rfaheya_options();
	$tabs    = rfaheya_settings_tabs();
	$fields  = rfaheya_fields();
	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- which tab to show, and notices
	$tab   = isset( $_GET['tab'] ) && isset( $tabs[ sanitize_key( $_GET['tab'] ) ] ) ? sanitize_key( $_GET['tab'] ) : 'store';
	$saved = isset( $_GET['saved'] );
	$note  = isset( $_GET['rfaheya-imported'] ) ? sanitize_text_field( wp_unslash( $_GET['rfaheya-imported'] ) ) : '';
	// phpcs:enable
	$logo  = rfaheya_logo_url();
	?>
	<div class="wrap rfs">
		<header class="rfs-hero">
			<div>
				<p class="rfs-eyebrow">Rfaheya · Speak your scent</p>
				<h1>Store settings</h1>
				<p>Everything the storefront shows — change it here and it’s live on the site in a moment.</p>
			</div>
			<a class="rfs-btn rfs-btn-light" href="<?php echo esc_url( home_url( '/' ) ); ?>" target="_blank" rel="noopener">View store <span class="dashicons dashicons-external"></span></a>
		</header>
		<?php if ( $saved ) : ?>
			<div class="rfs-toast" role="status"><span class="dashicons dashicons-yes-alt"></span> Saved — it’s live on the store.</div>
		<?php endif; ?>
		<?php if ( $note ) : ?>
			<div class="rfs-toast" role="status"><span class="dashicons dashicons-yes-alt"></span> <?php echo esc_html( $note ); ?></div>
		<?php endif; ?>

		<div class="rfs-layout">
			<nav class="rfs-nav" aria-label="Settings">
				<?php foreach ( $tabs as $slug => $t ) : ?>
					<a href="<?php echo esc_url( add_query_arg( array( 'page' => 'rfaheya-store', 'tab' => $slug ), admin_url( 'options-general.php' ) ) ); ?>" class="<?php echo $slug === $tab ? 'is-active' : ''; ?>" data-tab="<?php echo esc_attr( $slug ); ?>">
						<span class="dashicons <?php echo esc_attr( $t[1] ); ?>"></span>
						<span><strong><?php echo esc_html( $t[0] ); ?></strong><small><?php echo esc_html( $t[2] ); ?></small></span>
					</a>
				<?php endforeach; ?>
			</nav>

			<div class="rfs-main">
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="rfs-form">
					<input type="hidden" name="action" value="rfaheya_save_settings">
					<input type="hidden" name="rfaheya_tab" value="<?php echo esc_attr( $tab ); ?>">
					<?php wp_nonce_field( 'rfaheya_save_settings' ); ?>
					<?php foreach ( $tabs as $slug => $t ) : ?>
						<section class="rfs-panel" data-panel="<?php echo esc_attr( $slug ); ?>" <?php echo $slug === $tab ? '' : 'hidden'; ?>>
							<?php
							if ( 'tools' === $slug ) {
								echo '</section>';
								continue;
							}
							foreach ( $t[3] as $group ) {
								if ( 'login' === $group ) {
									echo '<div class="rfs-card rfs-info"><p><strong>Google:</strong> <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud → Credentials</a> → OAuth client ID (Web application). Authorized redirect URI:<br><code>' . esc_html( rfaheya_oauth_redirect_uri( 'google' ) ) . '</code></p><p><strong>Facebook:</strong> <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener">Meta for Developers</a> → your app → Facebook Login → Valid OAuth Redirect URIs:<br><code>' . esc_html( rfaheya_oauth_redirect_uri( 'facebook' ) ) . '</code></p></div>';
								}
								$sections = array();
								foreach ( $fields[ $group ] as $key => $field ) {
									$sections[ rfaheya_settings_section( $group, $key ) ][ $key ] = $field;
								}
								foreach ( $sections as $title => $list ) {
									$is_slide = 'slider' === $group && 0 === strpos( $title, 'Slide ' );
									echo $is_slide ? '<details class="rfs-card rfs-collapsible"><summary>' : '<div class="rfs-card">';
									echo '<h2>' . esc_html( $title ) . '</h2>';
									echo $is_slide ? '</summary>' : '';
									if ( 'home' === $group && 'Logo' === $title ) {
										?>
										<div class="rfs-logo-preview" data-logo-src="<?php echo esc_url( $logo ); ?>">
											<div class="rfs-lp-desktop"><span class="rfs-lp-label">Computer</span><div class="rfs-lp-bar"><img alt="" data-size="desktop"><i></i><i></i><i></i><b></b></div></div>
											<div class="rfs-lp-row">
												<div class="rfs-lp-phone"><span class="rfs-lp-label">Phone</span><div class="rfs-lp-bar"><b class="rfs-lp-menu"></b><img alt="" data-size="mobile"><b></b></div></div>
												<div class="rfs-lp-footer"><span class="rfs-lp-label">Footer</span><div class="rfs-lp-dark"><img alt="" data-size="footer"></div></div>
											</div>
										</div>
										<?php
									}
									echo '<div class="rfs-grid">';
									foreach ( $list as $key => $field ) {
										rfaheya_settings_field( $group, $key, $field, $options[ $group ][ $key ] );
									}
									echo '</div>';
									echo $is_slide ? '</details>' : '</div>';
									if ( 'slider' === $group && 'Hero slider' === $title ) {
										rfaheya_slider_preview();
									}
									if ( 'home' === $group && 'Announcement bar' === $title ) {
										echo '<div class="rfs-card rfs-preview-card"><h2>Preview</h2><p class="rfs-text">The bar at the very top of every page (the messages take turns).</p><div class="rfs-ann-preview" aria-hidden="true"><span>‹</span><b></b><span>›</span></div></div>';
									}
								}
							}
							?>
						</section>
					<?php endforeach; ?>
					<div class="rfs-savebar" <?php echo 'tools' === $tab ? 'hidden' : ''; ?>>
						<span>Changes go live on the store as soon as you save.</span>
						<button type="submit" class="rfs-btn">Save changes</button>
					</div>
				</form>

				<section class="rfs-panel" data-panel="tools-extra" <?php echo 'tools' === $tab ? '' : 'hidden'; ?>>
					<div class="rfs-card">
						<h2>Starter content</h2>
						<p class="rfs-text">Copies the storefront’s built-in content into WordPress so you can edit it here: journal articles (Posts), information pages (Pages), FAQs, home page texts and images (Media), and fragrance family images (Products → Categories). It also fills the “Rfaheya details” box of each product from its attributes. Anything that already exists is left untouched, so it is safe to run again.</p>
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
							<input type="hidden" name="action" value="rfaheya_import">
							<?php wp_nonce_field( 'rfaheya_import' ); ?>
							<button type="submit" class="rfs-btn rfs-btn-ghost">Import starter content</button>
						</form>
					</div>
					<div class="rfs-card">
						<h2>Store health</h2>
						<?php
						$fresh   = get_transient( 'rfaheya_bootstrap' );
						$count   = is_array( $fresh ) && isset( $fresh['products'] ) ? count( $fresh['products'] ) : 0;
						$missing = rfaheya_missing_products();
						?>
						<ul class="rfs-stats">
							<li><strong><?php echo esc_html( number_format_i18n( $count ) ); ?></strong><span>products on the storefront</span></li>
							<li><strong><?php echo esc_html( number_format_i18n( count( $missing ) ) ); ?></strong><span>products not showing</span></li>
							<li><strong><?php echo esc_html( RFAHEYA_DATA_VERSION ); ?></strong><span>data version</span></li>
						</ul>
					</div>
				</section>
			</div>
		</div>
	</div>
	<?php
}

// ==================================================================== products missing from the storefront

/**
 * Products that exist in WooCommerce but don't show on the storefront, with the
 * reason. Shown on the Products screen and on Settings → Rfaheya Store.
 */
function rfaheya_missing_products() {
	if ( ! function_exists( 'wc_get_product' ) ) {
		return array();
	}
	$shown = array();
	$data  = rfaheya_bootstrap();
	if ( empty( $data['products'] ) ) {
		return array();
	}
	foreach ( (array) $data['products'] as $p ) {
		$shown[ (int) $p['id'] ] = true;
	}
	$gift = (int) ( (array) get_option( 'rfaheya_gift_box', array() ) + array( 'product' => 0 ) )['product'];
	$hide_out = 'yes' === get_option( 'woocommerce_hide_out_of_stock_items' );
	$missing  = array();
	$ids      = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts' => -1,
			'fields'      => 'ids',
		)
	);
	foreach ( $ids as $id ) {
		if ( isset( $shown[ $id ] ) || $id === $gift || 0 === strpos( (string) get_post_field( 'post_name', $id ), 'rfaheya-gift-' ) ) {
			continue;
		}
		$product = wc_get_product( $id );
		if ( ! $product ) {
			continue;
		}
		$status = get_post_status( $id );
		if ( 'publish' !== $status ) {
			$labels = array( 'draft' => 'Draft', 'pending' => 'Pending review', 'private' => 'Private', 'future' => 'Scheduled' );
			$reason = sprintf( 'Not published (%s) — open it and press Publish.', isset( $labels[ $status ] ) ? $labels[ $status ] : $status );
		} elseif ( post_password_required( $id ) || '' !== get_post_field( 'post_password', $id ) ) {
			$reason = 'Password protected — remove the password (Publish box → Visibility: Public).';
		} elseif ( in_array( $product->get_catalog_visibility(), array( 'hidden', 'search' ), true ) ) {
			$reason = 'Catalog visibility is “' . $product->get_catalog_visibility() . '” — set it to “Shop and search results” (Publish box).';
		} elseif ( $hide_out && ! $product->is_in_stock() ) {
			$reason = 'Out of stock, and WooCommerce → Settings → Products → Inventory hides out-of-stock products.';
		} elseif ( '' === (string) $product->get_price() ) {
			$reason = 'No price — add a price (or prices on its variations).';
		} else {
			$reason = 'Not in the storefront data yet — it refreshes on its own within a few minutes after any save.';
		}
		$missing[] = array(
			'id'     => $id,
			'name'   => get_the_title( $id ),
			'reason' => $reason,
		);
	}
	return $missing;
}

add_action(
	'admin_notices',
	function () {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || ! current_user_can( 'edit_products' ) || ! in_array( $screen->id, array( 'edit-product' ), true ) ) {
			return;
		}
		$missing = rfaheya_missing_products();
		if ( ! $missing ) {
			return;
		}
		echo '<div class="notice notice-warning"><p><strong>' . esc_html( sprintf( '%d product(s) don’t show on the storefront:', count( $missing ) ) ) . '</strong></p><ul style="list-style:disc;margin-left:20px">';
		foreach ( array_slice( $missing, 0, 25 ) as $m ) {
			printf( '<li><a href="%s">%s</a> — %s</li>', esc_url( get_edit_post_link( $m['id'] ) ), esc_html( $m['name'] ), esc_html( $m['reason'] ) );
		}
		echo '</ul></div>';
	}
);

// ==================================================================== hero slider

function rfaheya_hero_slider_data( $s ) {
	$slides = array();
	for ( $i = 1; $i <= 4; $i++ ) {
		$image    = (int) $s[ "slide_{$i}_image" ];
		$mobile   = (int) $s[ "slide_{$i}_mobile" ];
		$closed   = (int) ( $s[ "slide_{$i}_closed" ] ?? 0 );
		if ( 'no' === ( $s[ "slide_{$i}_show" ] ?? 'yes' ) ) {
			// Hidden from the dashboard: an empty slide is left out by the storefront.
			$slides[] = array_fill_keys( array( 'image', 'srcset', 'mobile', 'closed', 'eyebrow', 'title', 'text', 'button', 'link' ), '' );
			continue;
		}
		$slides[] = array(
			'image'   => $image ? (string) wp_get_attachment_image_url( $image, 'full' ) : '',
			'srcset'  => $image ? (string) wp_get_attachment_image_srcset( $image, 'full' ) : '',
			'mobile'  => $mobile ? (string) wp_get_attachment_image_url( $mobile, 'full' ) : '',
			'closed'  => $closed ? (string) wp_get_attachment_image_url( $closed, 'full' ) : '',
			'eyebrow' => (string) $s[ "slide_{$i}_eyebrow" ],
			'title'   => (string) $s[ "slide_{$i}_title" ],
			'text'    => (string) $s[ "slide_{$i}_text" ],
			'button'  => (string) $s[ "slide_{$i}_button" ],
			'link'    => (string) $s[ "slide_{$i}_link" ],
		);
	}
	return array(
		'enabled'  => 'no' !== $s['enabled'],
		'interval' => max( 2, (float) $s['interval'] ),
		'intro'    => 'yes' === ( $s['intro'] ?? 'no' ),
		'slides'   => $slides,
	);
}

// ==================================================================== logo

/** The logo chosen in Settings → Rfaheya Store (empty: the storefront's built-in logo). */
function rfaheya_logo_url() {
	$id = (int) rfaheya_options()['home']['logo'];
	return $id ? (string) wp_get_attachment_image_url( $id, 'full' ) : '';
}

/**
 * The logo as the storefront shows it, prepared once on the server (not in every visitor's
 * phone): its empty margins cut off, made small enough for a sharp footer, and its main
 * colour and darkness read. Kept until the logo changes. Falls back to the original file.
 * Returns array( url, color, dark, trimmed ).
 */
function rfaheya_logo_prepared() {
	$id  = (int) rfaheya_options()['home']['logo'];
	$url = rfaheya_logo_url();
	$out = array(
		'url'     => $url,
		'color'   => '',
		'dark'    => false,
		'trimmed' => false,
	);
	if ( ! $id || ! $url ) {
		return $out;
	}
	$file = get_attached_file( $id );
	if ( ! $file || ! is_readable( $file ) || preg_match( '/\.svg$/i', $file ) || ! function_exists( 'imagecreatefromstring' ) ) {
		return $out;
	}
	$key  = $id . ':' . filemtime( $file ) . ':' . filesize( $file ) . ':2';
	$done = get_option( 'rfaheya_logo_prepared' );
	if ( is_array( $done ) && ( $done['key'] ?? '' ) === $key ) {
		if ( empty( $done['file'] ) || is_readable( $done['file'] ) ) {
			return array_merge( $out, $done['data'] );
		}
	}
	$data = array();
	try {
		$data = rfaheya_logo_prepare( $file, $id );
	} catch ( Throwable $e ) {
		$data = array();
	}
	update_option(
		'rfaheya_logo_prepared',
		array(
			'key'  => $key,
			'file' => $data['file'] ?? '',
			'data' => array_diff_key( $data, array( 'file' => 1 ) ),
		),
		true
	);
	return array_merge( $out, array_diff_key( $data, array( 'file' => 1 ) ) );
}

/** Does the work for rfaheya_logo_prepared(): returns the fields it found (and the new file). */
function rfaheya_logo_prepare( $file, $id ) {
	$src = @imagecreatefromstring( (string) file_get_contents( $file ) ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	if ( ! $src ) {
		return array();
	}
	$w = imagesx( $src );
	$h = imagesy( $src );
	if ( ! imageistruecolor( $src ) ) {
		imagepalettetotruecolor( $src );
	}
	imagealphablending( $src, false );
	imagesavealpha( $src, true );
	// Edges and colour from a small copy (quick for any file size).
	$scale = min( 1, 480 / max( $w, $h ) );
	$sw    = max( 1, (int) round( $w * $scale ) );
	$sh    = max( 1, (int) round( $h * $scale ) );
	$small = imagecreatetruecolor( $sw, $sh );
	imagealphablending( $small, false );
	imagesavealpha( $small, true );
	imagefill( $small, 0, 0, imagecolorallocatealpha( $small, 0, 0, 0, 127 ) );
	imagecopyresampled( $small, $src, 0, 0, 0, 0, $sw, $sh, $w, $h );
	$top    = $sh;
	$bottom = -1;
	$left   = $sw;
	$right  = -1;
	$seen   = 0;
	$light  = 0.0;
	$col    = 0;
	$r      = 0;
	$g      = 0;
	$b      = 0;
	for ( $y = 0; $y < $sh; $y++ ) {
		for ( $x = 0; $x < $sw; $x++ ) {
			$c  = imagecolorat( $small, $x, $y );
			$a  = 255 - ( ( ( $c >> 24 ) & 0x7f ) * 2 );
			$pr = ( $c >> 16 ) & 0xff;
			$pg = ( $c >> 8 ) & 0xff;
			$pb = $c & 0xff;
			if ( $a < 12 || ( $pr > 246 && $pg > 246 && $pb > 246 ) ) {
				continue;
			}
			$top    = min( $top, $y );
			$bottom = max( $bottom, $y );
			$left   = min( $left, $x );
			$right  = max( $right, $x );
			if ( $a < 140 || ( $pr > 242 && $pg > 242 && $pb > 242 ) ) {
				continue;
			}
			++$seen;
			$max    = max( $pr, $pg, $pb );
			$min    = min( $pr, $pg, $pb );
			$luma   = ( 0.299 * $pr + 0.587 * $pg + 0.114 * $pb ) / 255;
			$light += $luma;
			$sat    = 0 === $max ? 0 : ( $max - $min ) / $max;
			if ( $sat > 0.28 && $luma > 0.18 && $luma < 0.9 ) {
				++$col;
				$r += $pr;
				$g += $pg;
				$b += $pb;
			}
		}
	}
	imagedestroy( $small );
	$data = array();
	if ( $seen ) {
		$data['dark'] = $light / $seen < 0.45;
		if ( $col / $seen > 0.03 ) {
			$data['color'] = sprintf( 'rgb(%d %d %d)', round( $r / $col ), round( $g / $col ), round( $b / $col ) );
		}
	}
	if ( $bottom < 0 ) {
		return $data;
	}
	$pad = 2;
	$x0  = max( 0, ( $left - $pad ) / $scale );
	$y0  = max( 0, ( $top - $pad ) / $scale );
	$x1  = min( $w, ( $right + 1 + $pad ) / $scale );
	$y1  = min( $h, ( $bottom + 1 + $pad ) / $scale );
	$cw  = $x1 - $x0;
	$ch  = $y1 - $y0;
	if ( $cw * $ch > $w * $h * 0.92 && max( $w, $h ) <= 1200 ) {
		return $data; // nothing worth cutting, and not oversized
	}
	// Just big enough for the footer on a sharp screen (about 260 px tall).
	$k   = min( 1, 260 / $ch );
	$ow  = max( 1, (int) round( $cw * $k ) );
	$oh  = max( 1, (int) round( $ch * $k ) );
	$dst = imagecreatetruecolor( $ow, $oh );
	imagealphablending( $dst, false );
	imagesavealpha( $dst, true );
	imagefill( $dst, 0, 0, imagecolorallocatealpha( $dst, 0, 0, 0, 127 ) );
	imagecopyresampled( $dst, $src, 0, 0, (int) round( $x0 ), (int) round( $y0 ), $ow, $oh, (int) round( $cw ), (int) round( $ch ) );
	imagedestroy( $src );
	$up = wp_upload_dir();
	if ( ! empty( $up['error'] ) ) {
		return $data;
	}
	$dir = trailingslashit( $up['basedir'] ) . 'rfaheya';
	wp_mkdir_p( $dir );
	$name = 'logo-' . $id . '-' . substr( md5( $file . filemtime( $file ) ), 0, 8 );
	$path = $dir . '/' . $name . '.webp';
	$ok   = function_exists( 'imagewebp' ) && imagewebp( $dst, $path, 90 );
	if ( ! $ok ) {
		$path = $dir . '/' . $name . '.png';
		$ok   = imagepng( $dst, $path, 9 );
	}
	imagedestroy( $dst );
	if ( ! $ok ) {
		return $data;
	}
	$data['url']     = trailingslashit( $up['baseurl'] ) . 'rfaheya/' . basename( $path );
	$data['trimmed'] = true;
	$data['file']    = $path;
	return $data;
}

/**
 * One-time: a logo already uploaded to the media library as “LOGO-1.png” becomes
 * the store logo (it can be changed or removed in Settings → Rfaheya Store).
 */
add_action(
	'admin_init',
	function () {
		if ( get_option( 'rfaheya_logo_seeded' ) ) {
			return;
		}
		update_option( 'rfaheya_logo_seeded', 1 );
		$saved = get_option( RFAHEYA_OPTION, array() );
		$saved = is_array( $saved ) ? $saved : array();
		if ( ! empty( $saved['home']['logo'] ) ) {
			return;
		}
		$found = get_posts(
			array(
				'post_type'      => 'attachment',
				'post_mime_type' => 'image',
				'posts_per_page' => 1,
				'orderby'        => 'date',
				'order'          => 'DESC',
				'meta_query'     => array(
					array(
						'key'     => '_wp_attached_file',
						'value'   => '/LOGO-1\\.(png|svg|webp)$',
						'compare' => 'REGEXP',
					),
				),
			)
		);
		if ( $found ) {
			$saved['home']['logo'] = (string) $found[0]->ID;
			update_option( RFAHEYA_OPTION, $saved );
		}
	}
);

// ==================================================================== information pages

/**
 * One-time page refresh: the starter Shipping, Size Guide, Ingredients,
 * Sustainability and Terms pages are removed (moved to the trash), and the
 * starter Privacy Policy and Returns & Refunds pages get the store's own
 * text from rfaheya/content.json. Only pages the starter import created
 * (they carry the rfaheya_eyebrow field) are touched.
 */
add_action(
	'init',
	function () {
		if ( (int) get_option( 'rfaheya_pages_set', 1 ) >= 2 ) {
			return;
		}
		$file = __DIR__ . '/rfaheya/content.json';
		$data = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
		if ( ! is_array( $data ) || ! isset( $data['pages'] ) ) {
			return;
		}
		$ours = function ( $slug ) {
			$page = get_page_by_path( $slug );
			return $page && '' !== (string) get_post_meta( $page->ID, 'rfaheya_eyebrow', true ) ? $page : null;
		};
		foreach ( array( 'shipping', 'size-guide', 'ingredients', 'sustainability', 'terms' ) as $slug ) {
			$page = $ours( $slug );
			if ( ! $page ) {
				continue;
			}
			if ( (int) get_option( 'woocommerce_terms_page_id' ) === (int) $page->ID ) {
				update_option( 'woocommerce_terms_page_id', 0 );
			}
			wp_trash_post( $page->ID );
		}
		foreach ( (array) $data['pages'] as $p ) {
			$page = $ours( $p['slug'] );
			if ( ! $page ) {
				continue;
			}
			wp_update_post(
				array(
					'ID'           => $page->ID,
					'post_title'   => $p['title'],
					'post_excerpt' => $p['excerpt'],
					'post_content' => $p['content'],
				)
			);
			update_post_meta( $page->ID, 'rfaheya_eyebrow', $p['eyebrow'] );
		}
		update_option( 'rfaheya_pages_set', 2 );
	}
);

// ==================================================================== FAQs

/**
 * One-time FAQ refresh: replaces the first starter FAQs (if they were
 * imported) with the current set from rfaheya/content.json. FAQs written
 * in WordPress are left alone.
 */
add_action(
	'init',
	function () {
		if ( (int) get_option( 'rfaheya_faq_set', 1 ) >= 2 ) {
			return;
		}
		$file = __DIR__ . '/rfaheya/content.json';
		$data = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
		if ( ! is_array( $data ) || empty( $data['faqs'] ) ) {
			return;
		}
		$old = array(
			'What does “inspired by” mean?',
			'How does “Try 10 ML first” work?',
			'How much is shipping?',
			'How do I pay?',
			'What is the zero risk guarantee?',
			'How can I track my order?',
		);
		$faqs   = get_posts( array( 'post_type' => 'rfaheya_faq', 'post_status' => 'any', 'numberposts' => -1 ) );
		$titles = array();
		$had    = false;
		foreach ( $faqs as $f ) {
			if ( in_array( $f->post_title, $old, true ) ) {
				wp_trash_post( $f->ID );
				$had = true;
			} else {
				$titles[] = $f->post_title;
			}
		}
		// Only add the new set where the starter FAQs had been imported (otherwise the import adds them).
		if ( $had ) {
			foreach ( $data['faqs'] as $i => $f ) {
				if ( in_array( $f['q'], $titles, true ) ) {
					continue;
				}
				wp_insert_post(
					array(
						'post_type'    => 'rfaheya_faq',
						'post_status'  => 'publish',
						'post_title'   => $f['q'],
						'post_content' => $f['a'],
						'menu_order'   => $i,
					)
				);
			}
		}
		update_option( 'rfaheya_faq_set', 2 );
	},
	20
);

add_action(
	'init',
	function () {
		register_post_type(
			'rfaheya_faq',
			array(
				'labels'       => array(
					'name'          => 'FAQs',
					'singular_name' => 'FAQ',
					'add_new_item'  => 'Add question',
					'edit_item'     => 'Edit question',
					'all_items'     => 'All questions',
				),
				'public'       => false,
				'show_ui'      => true,
				'show_in_rest' => true,
				'menu_icon'    => 'dashicons-editor-help',
				'menu_position' => 21,
				'supports'     => array( 'title', 'editor', 'page-attributes' ),
			)
		);
		add_filter(
			'enter_title_here',
			function ( $text, $post ) {
				return 'rfaheya_faq' === $post->post_type ? 'Question' : $text;
			},
			10,
			2
		);

		// Pages: the intro under the title (excerpt) and the small section label above it.
		add_post_type_support( 'page', 'excerpt' );
		register_post_meta(
			'page',
			'rfaheya_eyebrow',
			array(
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => true,
				'auth_callback' => function () {
					return current_user_can( 'edit_pages' );
				},
			)
		);
	}
);

// ==================================================================== page section label

add_action(
	'add_meta_boxes_page',
	function () {
		add_meta_box(
			'rfaheya_page',
			'Storefront',
			function ( $post ) {
				wp_nonce_field( 'rfaheya_page', 'rfaheya_page_nonce' );
				$value = (string) get_post_meta( $post->ID, 'rfaheya_eyebrow', true );
				echo '<p><label for="rfaheya-eyebrow"><strong>Section label</strong></label></p>';
				echo '<input id="rfaheya-eyebrow" name="rfaheya_eyebrow" list="rfaheya-eyebrows" class="widefat" value="' . esc_attr( $value ) . '" placeholder="e.g. Help">';
				echo '<datalist id="rfaheya-eyebrows"><option value="Help"><option value="Legal"><option value="About"></datalist>';
				echo '<p class="description">Shown above the title. Pages with the same label are listed together as “Related”. The page excerpt is shown as the intro.</p>';
			},
			'page',
			'side'
		);
	}
);

add_action(
	'save_post_page',
	function ( $post_id ) {
		if ( ! isset( $_POST['rfaheya_page_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rfaheya_page_nonce'] ) ), 'rfaheya_page' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE || ! current_user_can( 'edit_page', $post_id ) ) {
			return;
		}
		update_post_meta( $post_id, 'rfaheya_eyebrow', sanitize_text_field( wp_unslash( isset( $_POST['rfaheya_eyebrow'] ) ? $_POST['rfaheya_eyebrow'] : '' ) ) );
	}
);

// ==================================================================== product details box

/** Finder choices: key => label. */
function rfaheya_choices() {
	return array(
		'gender'    => array(
			'men'    => 'Men',
			'women'  => 'Women',
			'unisex' => 'Unisex',
		),
		'occasions' => array(
			'everyday' => 'Everyday',
			'work'     => 'Work',
			'date'     => 'Date Night',
			'special'  => 'Special Occasions',
			'club'     => 'Club Vibe',
		),
		'seasons'   => array(
			'spring' => 'Spring',
			'summer' => 'Summer',
			'autumn' => 'Autumn',
			'winter' => 'Winter',
			'all'    => 'All Year',
		),
		'presence'  => array(
			'soft'     => 'Soft',
			'balanced' => 'Balanced',
			'bold'     => 'Bold',
		),
		'longevity' => array(
			'standard' => 'Moderate',
			'extended' => 'Extended',
			'eternal'  => 'Eternal',
		),
	);
}

/** Small label on the product image. */
function rfaheya_badges() {
	return array( 'Best Seller', 'New', 'Limited Edition' );
}

/** Rfaheya Standard™ dimensions and their levels (same names as the storefront's Standard page). */
function rfaheya_standard_levels() {
	return array(
		'character'  => array( 'Character', array( 'Universal', 'Selective', 'Enthusiast' ) ),
		'comfort'    => array( 'Comfort', array( 'Relaxed', 'Balanced', 'Intense' ) ),
		'density'    => array( 'Density', array( 'Airy', 'Balanced', 'Dense' ) ),
		'projection' => array( 'Projection', array( 'Intimate', 'Balanced', 'Enormous' ) ),
		'longevity'  => array( 'Longevity', array( 'Moderate', 'Extended', 'Long-lasting' ) ),
		'evolution'  => array( 'Evolution', array( 'Linear', 'Evolving' ) ),
	);
}

function rfaheya_details( $product_id ) {
	$d = get_post_meta( $product_id, '_rfaheya_details', true );
	return is_array( $d ) ? $d : array();
}

/** "a, b , c" or "a\nb" -> ['a', 'b', 'c'] */
function rfaheya_list( $text ) {
	if ( is_array( $text ) ) {
		$text = implode( ',', $text );
	}
	return array_values( array_unique( array_filter( array_map( 'trim', preg_split( '/[,\n]+/', (string) $text ) ) ) ) );
}

add_action(
	'add_meta_boxes_product',
	function () {
		add_meta_box( 'rfaheya_details', 'Rfaheya details', 'rfaheya_details_box', 'product', 'normal', 'high' );
	}
);

/** Pill buttons (radio = pick one, checkbox = pick several). Works without JavaScript. */
function rfaheya_pills( $name, $options, $current, $multiple = false ) {
	echo '<div class="rf-pills">';
	foreach ( $options as $value => $label ) {
		$on = $multiple ? in_array( (string) $value, array_map( 'strval', (array) $current ), true ) : (string) $current === (string) $value;
		printf(
			'<label class="rf-pill"><input type="%s" name="%s" value="%s"%s><span>%s</span></label>',
			$multiple ? 'checkbox' : 'radio',
			esc_attr( $multiple ? $name . '[]' : $name ),
			esc_attr( $value ),
			$on ? ' checked' : '',
			esc_html( $label )
		);
	}
	echo '</div>';
}

/** Note picker: chosen notes as chips with their icons, picked from Products → Fragrance notes. */
function rfaheya_note_picker( $name, $current, $hint = '' ) {
	$value = implode( ', ', (array) $current );
	printf(
		'<div class="rf-notes" data-hint="%s"><input type="text" class="rf-notes-value large-text" name="%s" value="%s" placeholder="Vanilla, Oud, Amber"></div>',
		esc_attr( $hint ),
		esc_attr( $name ),
		esc_attr( $value )
	);
}

/** Image picker (Media Library). */
function rfaheya_media_field( $id, $name, $attachment_id, $type = 'image' ) {
	$attachment_id = (int) $attachment_id;
	$preview       = '';
	if ( $attachment_id ) {
		$preview = 'video' === $type
			? '<video src="' . esc_url( (string) wp_get_attachment_url( $attachment_id ) ) . '" muted playsinline></video>'
			: ( 'image/svg+xml' === get_post_mime_type( $attachment_id )
				? '<img src="' . esc_url( rfaheya_image_url( $attachment_id ) ) . '" alt="">'
				: wp_get_attachment_image( $attachment_id, 'medium' ) );
	}
	printf(
		'<div class="rf-media" data-type="%1$s"><input type="hidden" id="%2$s" name="%3$s" value="%4$s"><div class="rf-media-preview" id="%2$s-preview">%5$s</div><button type="button" class="button rfaheya-media" data-target="%2$s" data-type="%1$s">%6$s</button> <button type="button" class="button-link rfaheya-media-clear" data-target="%2$s">Remove</button></div>',
		esc_attr( $type ),
		esc_attr( $id ),
		esc_attr( $name ),
		$attachment_id ? esc_attr( (string) $attachment_id ) : '',
		$preview, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts / wp_get_attachment_image
		'video' === $type ? 'Choose video' : 'Choose image'
	);
}

function rfaheya_details_box( $post ) {
	wp_nonce_field( 'rfaheya_details', 'rfaheya_details_nonce' );
	$d       = rfaheya_details( $post->ID );
	$choices = rfaheya_choices();
	$val     = function ( $key, $default = '' ) use ( $d ) {
		return isset( $d[ $key ] ) ? $d[ $key ] : $default;
	};
	$row     = function ( $label, $help, $render ) {
		echo '<div class="rf-row"><div class="rf-label">' . esc_html( $label ) . ( $help ? '<small>' . esc_html( $help ) . '</small>' : '' ) . '</div><div class="rf-field">';
		$render();
		echo '</div></div>';
	};
	$auto    = array( '' => 'Auto' );
	$notes   = admin_url( 'edit-tags.php?taxonomy=rfaheya_note&post_type=product' );
	?>
	<div class="rf-box">
		<p class="rf-intro">What the storefront shows for this fragrance. The tagline is the product’s <em>Short description</em>, the story is the main description, and sizes / prices are the variations.</p>

		<h3 class="rf-section">Rfaheya Finder <small>The quiz questions, in order. Each answer is matched against these.</small></h3>
		<?php
		$row(
			'1 · For you',
			'“Who are you shopping for?”',
			function () use ( $val, $choices, $auto ) {
				rfaheya_pills( 'rfaheya[gender]', $auto + $choices['gender'], $val( 'gender' ) );
			}
		);
		$row(
			'2 · Occasion',
			'“Where will you wear it?” The first one also shows on the card.',
			function () use ( $val, $choices ) {
				rfaheya_pills( 'rfaheya[occasions]', $choices['occasions'], $val( 'occasions', array() ), true );
			}
		);
		$row(
			'3 · Scent style',
			'“What kind of scent speaks to you?” Same as the product categories.',
			function () use ( $post ) {
				$current = wp_get_object_terms( $post->ID, 'product_cat', array( 'fields' => 'slugs' ) );
				echo '<input type="hidden" name="rfaheya[families_sent]" value="1">';
				rfaheya_pills( 'rfaheya[families]', rfaheya_families(), is_wp_error( $current ) ? array() : $current, true );
			}
		);
		$row(
			'4 · Notes',
			'“Which notes do you love?” Key notes; the first 4 show on the card.',
			function () use ( $val ) {
				rfaheya_note_picker( 'rfaheya[notes]', $val( 'notes', array() ), 'Pick up to 5' );
			}
		);
		$row(
			'Main accords',
			'Also matched by the Notes question, Search and the Shop.',
			function () use ( $val ) {
				echo '<div class="rf-tags"><input type="text" class="rf-tags-value large-text" id="rfaheya-accords" name="rfaheya[accords]" value="' . esc_attr( implode( ', ', (array) $val( 'accords', array() ) ) ) . '" placeholder="Sweet, Oud, Amber"></div>';
			}
		);
		$row(
			'5 · Season',
			'“When do you wear it most?” The first one also shows on the card.',
			function () use ( $val, $choices ) {
				rfaheya_pills( 'rfaheya[seasons]', $choices['seasons'], $val( 'seasons', array() ), true );
			}
		);
		$row(
			'6 · Presence',
			'“How noticeable should it be?”',
			function () use ( $val, $choices, $auto ) {
				rfaheya_pills( 'rfaheya[presence]', $auto + $choices['presence'], $val( 'presence' ) );
			}
		);
		$row(
			'7 · Longevity',
			'“How long should it last?”',
			function () use ( $val, $choices, $auto ) {
				rfaheya_pills( 'rfaheya[longevity]', $auto + $choices['longevity'], $val( 'longevity' ) );
			}
		);
		?>

		<h3 class="rf-section">Product page <a href="<?php echo esc_url( $notes ); ?>" target="_blank" rel="noopener">Manage notes &amp; icons ↗</a></h3>
		<?php
		$row(
			'Badge',
			'Shown on the product image.',
			function () use ( $val ) {
				rfaheya_pills( 'rfaheya[badge]', array_merge( array( '' => 'None' ), array_combine( rfaheya_badges(), rfaheya_badges() ) ), $val( 'badge' ) );
			}
		);
		$row(
			'DNA',
			'The original fragrance it is based on.',
			function () use ( $val ) {
				echo '<input id="rfaheya-inspired_by" name="rfaheya[inspired_by]" class="large-text" placeholder="e.g. Vanilla 28 by Kayali" value="' . esc_attr( $val( 'inspired_by' ) ) . '">';
			}
		);
		$row(
			'DNA bottle image',
			'Optional, shown in the DNA card.',
			function () use ( $val ) {
				rfaheya_media_field( 'rfaheya-dna-image', 'rfaheya[dna_image]', $val( 'dna_image', 0 ) );
			}
		);
		$row(
			'Showcase bottle',
			'The bottle alone on a transparent background (PNG / WebP), for The Vitrine page. A file named showcase-' . get_post_field( 'post_name', get_the_ID() ) . ' uploaded to the Media Library is picked up by itself.',
			function () use ( $val ) {
				rfaheya_media_field( 'rfaheya-showcase-image', 'rfaheya[showcase_image]', $val( 'showcase_image', 0 ) );
			}
		);
		$row(
			'Opening',
			'The composition: first impression.',
			function () use ( $val ) {
				rfaheya_note_picker( 'rfaheya[opening]', $val( 'opening', array() ) );
			}
		);
		$row(
			'Heart',
			'',
			function () use ( $val ) {
				rfaheya_note_picker( 'rfaheya[heart]', $val( 'heart', array() ) );
			}
		);
		$row(
			'Dry down',
			'',
			function () use ( $val ) {
				rfaheya_note_picker( 'rfaheya[drydown]', $val( 'drydown', array() ) );
			}
		);
		?>

		<h3 class="rf-section">Rfaheya Standard™ <small>The six dimensions on the product page.</small></h3>
		<?php
		$standard = (array) $val( 'standard', array() );
		foreach ( rfaheya_standard_levels() as $key => $dim ) {
			$row(
				$dim[0],
				'',
				function () use ( $key, $dim, $standard ) {
					rfaheya_pills( "rfaheya[standard][$key]", array_merge( array( '' => '—' ), array_combine( $dim[1], $dim[1] ) ), isset( $standard[ $key ] ) ? $standard[ $key ] : '' );
				}
			);
		}
		?>
	</div>
	<?php
}

/** Fragrance families (the Finder's scent styles): product category slug => name. */
function rfaheya_families() {
	return array(
		'fresh'    => 'Fresh & Clean',
		'oriental' => 'Warm & Oriental',
		'floral'   => 'Floral & Expressive',
		'fruity'   => 'Fruity & Juicy',
		'sweet'    => 'Sweet & Addictive',
	);
}

/** Sets the product's family categories (keeps its other categories). */
function rfaheya_save_families( $post_id, $picked ) {
	$names   = array(
		'fresh'    => 'Fresh',
		'oriental' => 'Oriental',
		'floral'   => 'Floral',
		'fruity'   => 'Fruity',
		'sweet'    => 'Sweet',
	);
	$current = wp_get_object_terms( $post_id, 'product_cat', array( 'fields' => 'all' ) );
	if ( is_wp_error( $current ) ) {
		return;
	}
	$keep = array();
	foreach ( $current as $t ) {
		if ( ! isset( $names[ $t->slug ] ) ) {
			$keep[] = (int) $t->term_id;
		}
	}
	foreach ( array_intersect( array_keys( $names ), (array) $picked ) as $slug ) {
		$term = get_term_by( 'slug', $slug, 'product_cat' );
		if ( ! $term ) {
			$made = wp_insert_term( $names[ $slug ], 'product_cat', array( 'slug' => $slug ) );
			$term = is_wp_error( $made ) ? null : get_term( $made['term_id'], 'product_cat' );
		}
		if ( $term ) {
			$keep[] = (int) $term->term_id;
		}
	}
	wp_set_object_terms( $post_id, array_values( array_unique( $keep ) ), 'product_cat' );
}

/** Cleans the posted details box values. */
function rfaheya_clean_details( $input ) {
	$choices = rfaheya_choices();
	$input   = is_array( $input ) ? $input : array();
	$text    = function ( $key ) use ( $input ) {
		return sanitize_text_field( isset( $input[ $key ] ) ? (string) $input[ $key ] : '' );
	};
	$names   = function ( $key ) use ( $input ) {
		return array_map( 'sanitize_text_field', rfaheya_list( isset( $input[ $key ] ) ? $input[ $key ] : '' ) );
	};
	$badge   = $text( 'badge' );
	$out     = array(
		'inspired_by' => $text( 'inspired_by' ),
		'dna_image'   => isset( $input['dna_image'] ) ? absint( $input['dna_image'] ) : 0,
		'showcase_image' => isset( $input['showcase_image'] ) ? absint( $input['showcase_image'] ) : 0,
		'badge'       => $badge,
		'accords'     => $names( 'accords' ),
		'notes'       => $names( 'notes' ),
		'opening'     => $names( 'opening' ),
		'heart'       => $names( 'heart' ),
		'drydown'     => $names( 'drydown' ),
		'standard'    => array(),
	);
	foreach ( array( 'gender', 'presence', 'longevity' ) as $key ) {
		$v           = isset( $input[ $key ] ) ? (string) $input[ $key ] : '';
		$out[ $key ] = isset( $choices[ $key ][ $v ] ) ? $v : '';
	}
	foreach ( array( 'occasions', 'seasons' ) as $key ) {
		$picked      = isset( $input[ $key ] ) ? (array) $input[ $key ] : array();
		$out[ $key ] = array_values( array_filter( array_map( 'strval', $picked ), fn( $k ) => isset( $choices[ $key ][ $k ] ) ) );
	}
	$standard = isset( $input['standard'] ) && is_array( $input['standard'] ) ? $input['standard'] : array();
	foreach ( rfaheya_standard_levels() as $key => $dim ) {
		$v = isset( $standard[ $key ] ) ? (string) $standard[ $key ] : '';
		if ( in_array( $v, $dim[1], true ) ) {
			$out['standard'][ $key ] = $v;
		}
	}
	return $out;
}

add_action(
	'save_post_product',
	function ( $post_id ) {
		if ( ! isset( $_POST['rfaheya_details_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rfaheya_details_nonce'] ) ), 'rfaheya_details' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$input = isset( $_POST['rfaheya'] ) ? wp_unslash( $_POST['rfaheya'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned below
		update_post_meta( $post_id, '_rfaheya_details', rfaheya_clean_details( $input ) );
		if ( ! empty( $input['families_sent'] ) && taxonomy_exists( 'product_cat' ) ) {
			rfaheya_save_families( $post_id, isset( $input['families'] ) ? (array) $input['families'] : array() );
		}
	}
);

// ==================================================================== fragrance notes library

add_action(
	'init',
	function () {
		register_taxonomy(
			'rfaheya_note',
			'product',
			array(
				'labels'            => array(
					'name'          => 'Fragrance notes',
					'singular_name' => 'Note',
					'menu_name'     => 'Fragrance notes',
					'add_new_item'  => 'Add note',
					'edit_item'     => 'Edit note',
					'search_items'  => 'Search notes',
					'not_found'     => 'No notes yet.',
				),
				'public'            => false,
				'show_ui'           => true,
				'show_in_menu'      => true,
				'show_admin_column' => false,
				'meta_box_cb'       => false,
				'show_in_rest'      => false,
				'rewrite'           => false,
				'hierarchical'      => false,
			)
		);
	}
);

/** Icon URL of a note term ('' when none). */
function rfaheya_note_icon( $term_id ) {
	return rfaheya_image_url( (int) get_term_meta( $term_id, 'rfaheya_icon', true ) );
}

/** URL of an image attachment: the medium size, or the file itself for an SVG ('' when none). */
function rfaheya_image_url( $id ) {
	if ( ! $id ) {
		return '';
	}
	return 'image/svg+xml' === get_post_mime_type( $id ) ? (string) wp_get_attachment_url( $id ) : (string) wp_get_attachment_image_url( $id, 'medium' );
}

/** Every note in the library: name and icon. */
function rfaheya_note_library() {
	$terms = get_terms(
		array(
			'taxonomy'   => 'rfaheya_note',
			'hide_empty' => false,
			'orderby'    => 'name',
		)
	);
	if ( is_wp_error( $terms ) ) {
		return array();
	}
	return array_map(
		fn( $t ) => array(
			'name' => html_entity_decode( $t->name, ENT_QUOTES ),
			'icon' => rfaheya_note_icon( $t->term_id ),
		),
		$terms
	);
}

add_action(
	'rfaheya_note_add_form_fields',
	function () {
		echo '<div class="form-field"><label>Icon</label>';
		rfaheya_media_field( 'rfaheya-note-icon', 'rfaheya_icon', 0 );
		echo '<p>An SVG or a transparent PNG (about 200 × 200) works best.</p></div>';
	}
);
add_action(
	'rfaheya_note_edit_form_fields',
	function ( $term ) {
		echo '<tr class="form-field"><th scope="row"><label>Icon</label></th><td>';
		rfaheya_media_field( 'rfaheya-note-icon', 'rfaheya_icon', get_term_meta( $term->term_id, 'rfaheya_icon', true ) );
		echo '<p class="description">An SVG or a transparent PNG (about 200 × 200) works best.</p></td></tr>';
	}
);
$rfaheya_save_note = function ( $term_id ) {
	if ( ! current_user_can( 'manage_product_terms' ) && ! current_user_can( 'manage_categories' ) ) {
		return;
	}
	// The term screens verify their own nonce before these hooks run.
	if ( isset( $_POST['rfaheya_icon'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		update_term_meta( $term_id, 'rfaheya_icon', absint( $_POST['rfaheya_icon'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
	}
};
add_action( 'created_rfaheya_note', $rfaheya_save_note );
add_action( 'edited_rfaheya_note', $rfaheya_save_note );

add_filter(
	'manage_edit-rfaheya_note_columns',
	function ( $cols ) {
		unset( $cols['description'], $cols['slug'], $cols['posts'] );
		return array_merge( array( 'cb' => $cols['cb'], 'rf_icon' => 'Icon' ), $cols );
	}
);
add_filter(
	'manage_rfaheya_note_custom_column',
	function ( $out, $col, $term_id ) {
		if ( 'rf_icon' !== $col ) {
			return $out;
		}
		$url = rfaheya_note_icon( $term_id );
		return $url ? '<img src="' . esc_url( $url ) . '" alt="" style="width:44px;height:44px;object-fit:contain">' : '—';
	},
	10,
	3
);

// ==================================================================== wear-report videos

add_action(
	'init',
	function () {
		register_post_type(
			'rfaheya_video',
			array(
				'labels'        => array(
					'name'          => 'Videos',
					'singular_name' => 'Video',
					'add_new'       => 'Add video',
					'add_new_item'  => 'Add video',
					'edit_item'     => 'Edit video',
					'all_items'     => 'Videos',
				),
				'public'        => false,
				'show_ui'       => true,
				'show_in_menu'  => 'edit.php?post_type=product',
				'supports'      => array( 'title', 'page-attributes' ),
				'menu_icon'     => 'dashicons-video-alt3',
			)
		);
	}
);

add_filter(
	'enter_title_here',
	fn( $text, $post ) => 'rfaheya_video' === $post->post_type ? 'Title shown on the video, e.g. Drunk Gold + Mawj' : $text,
	10,
	2
);

add_action(
	'add_meta_boxes_rfaheya_video',
	function () {
		add_meta_box( 'rfaheya_video', 'Video', 'rfaheya_video_box', 'rfaheya_video', 'normal', 'high' );
	}
);

function rfaheya_video_meta( $post_id ) {
	$m = get_post_meta( $post_id, '_rfaheya_video', true );
	return wp_parse_args(
		is_array( $m ) ? $m : array(),
		array(
			'video'   => 0,
			'poster'  => 0,
			'product' => 0,
			'label'   => 'Rfaheya Wear Report',
			'tags'    => '',
		)
	);
}

function rfaheya_video_box( $post ) {
	wp_nonce_field( 'rfaheya_video', 'rfaheya_video_nonce' );
	$m        = rfaheya_video_meta( $post->ID );
	$products = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => 'title',
			'order'       => 'ASC',
		)
	);
	?>
	<div class="rf-box">
		<div class="rf-row"><div class="rf-label">Video file<small>MP4, vertical (9:16) looks best.</small></div><div class="rf-field"><?php rfaheya_media_field( 'rfaheya-video-file', 'rfaheya_video[video]', $m['video'], 'video' ); ?></div></div>
		<div class="rf-row"><div class="rf-label">Cover image<small>Optional: shown before the video plays.</small></div><div class="rf-field"><?php rfaheya_media_field( 'rfaheya-video-poster', 'rfaheya_video[poster]', $m['poster'] ); ?></div></div>
		<div class="rf-row"><div class="rf-label">Small label</div><div class="rf-field"><input class="regular-text" name="rfaheya_video[label]" value="<?php echo esc_attr( $m['label'] ); ?>"></div></div>
		<div class="rf-row"><div class="rf-label">Tags line<small>e.g. Warm · Bold · Evening</small></div><div class="rf-field"><input class="regular-text" name="rfaheya_video[tags]" value="<?php echo esc_attr( $m['tags'] ); ?>"></div></div>
		<div class="rf-row"><div class="rf-label">Product<small>Shown on the video, with Add to cart.</small></div><div class="rf-field">
			<input type="search" class="rf-product-search regular-text" placeholder="Search products…">
			<div class="rf-products">
				<?php foreach ( $products as $p ) : ?>
					<label class="rf-product" data-name="<?php echo esc_attr( strtolower( get_the_title( $p ) ) ); ?>">
						<input type="radio" name="rfaheya_video[product]" value="<?php echo esc_attr( (string) $p->ID ); ?>" <?php checked( (int) $m['product'], $p->ID ); ?>>
						<span><?php echo get_the_post_thumbnail( $p, 'thumbnail' ); ?><b><?php echo esc_html( get_the_title( $p ) ); ?></b></span>
					</label>
				<?php endforeach; ?>
				<?php if ( ! $products ) : ?>
					<p>No published products yet.</p>
				<?php endif; ?>
			</div>
		</div></div>
	</div>
	<?php
}

add_action(
	'save_post_rfaheya_video',
	function ( $post_id ) {
		if ( ! isset( $_POST['rfaheya_video_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rfaheya_video_nonce'] ) ), 'rfaheya_video' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$in = isset( $_POST['rfaheya_video'] ) && is_array( $_POST['rfaheya_video'] ) ? wp_unslash( $_POST['rfaheya_video'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned below
		update_post_meta(
			$post_id,
			'_rfaheya_video',
			array(
				'video'   => absint( isset( $in['video'] ) ? $in['video'] : 0 ),
				'poster'  => absint( isset( $in['poster'] ) ? $in['poster'] : 0 ),
				'product' => absint( isset( $in['product'] ) ? $in['product'] : 0 ),
				'label'   => sanitize_text_field( isset( $in['label'] ) ? $in['label'] : '' ),
				'tags'    => sanitize_text_field( isset( $in['tags'] ) ? $in['tags'] : '' ),
			)
		);
	}
);

add_filter(
	'manage_rfaheya_video_posts_columns',
	function ( $cols ) {
		return array(
			'cb'         => $cols['cb'],
			'rf_preview' => '',
			'title'      => 'Title',
			'rf_product' => 'Product',
			'date'       => $cols['date'],
		);
	}
);
add_action(
	'manage_rfaheya_video_posts_custom_column',
	function ( $col, $post_id ) {
		$m = rfaheya_video_meta( $post_id );
		if ( 'rf_preview' === $col && $m['video'] ) {
			echo '<video src="' . esc_url( (string) wp_get_attachment_url( (int) $m['video'] ) ) . '" muted playsinline preload="metadata" style="width:54px;height:96px;object-fit:cover;border-radius:4px;background:#111"></video>';
		}
		if ( 'rf_product' === $col ) {
			echo $m['product'] ? esc_html( get_the_title( (int) $m['product'] ) ) : '—';
		}
	},
	10,
	2
);

/** Published videos for the storefront. */
function rfaheya_videos() {
	$posts = get_posts(
		array(
			'post_type'   => 'rfaheya_video',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => array(
				'menu_order' => 'ASC',
				'date'       => 'DESC',
			),
		)
	);
	$out   = array();
	foreach ( $posts as $p ) {
		$m   = rfaheya_video_meta( $p->ID );
		$src = $m['video'] ? (string) wp_get_attachment_url( (int) $m['video'] ) : '';
		if ( ! $src ) {
			continue;
		}
		$out[] = array(
			'id'        => $p->ID,
			'title'     => html_entity_decode( get_the_title( $p ), ENT_QUOTES ),
			'label'     => $m['label'],
			'tags'      => $m['tags'],
			'src'       => $src,
			'poster'    => $m['poster'] ? (string) wp_get_attachment_image_url( (int) $m['poster'], 'large' ) : '',
			'productId' => (int) $m['product'],
		);
	}
	return $out;
}

// ==================================================================== admin assets (details box, notes, videos)

add_action(
	'admin_enqueue_scripts',
	function () {
		$screen = get_current_screen();
		if ( ! $screen || ! ( in_array( $screen->post_type, array( 'product', 'rfaheya_video' ), true ) && in_array( $screen->base, array( 'post', 'edit-tags', 'term' ), true ) ) ) {
			return;
		}
		$base = content_url( 'mu-plugins/rfaheya-admin/' );
		$ver  = '3.0.0';
		wp_enqueue_media();
		wp_enqueue_style( 'rfaheya-admin-ui', $base . 'admin.css', array(), $ver );
		wp_enqueue_script( 'rfaheya-admin-ui', $base . 'admin.js', array( 'jquery' ), $ver, true );
		wp_localize_script(
			'rfaheya-admin-ui',
			'rfaheyaAdmin',
			array(
				'notes'     => rfaheya_note_library(),
				'notesUrl'  => admin_url( 'edit-tags.php?taxonomy=rfaheya_note&post_type=product' ),
			)
		);
	}
);

// ==================================================================== REST

/** Store settings for the storefront (also part of the bootstrap response). */
function rfaheya_settings_data() {
	$o    = rfaheya_options();
	$h    = $o['home'];
	$logo = rfaheya_logo_prepared();
	$home = array(
		'announcements' => array_values( array_filter( array( $h['announcement_1'], $h['announcement_2'], $h['announcement_3'] ) ) ),
		'hero'          => array(
			'eyebrow' => $h['hero_eyebrow'],
			'title'   => $h['hero_title'],
			'text'    => $h['hero_text'],
			'image'   => $h['hero_image'] ? (string) wp_get_attachment_image_url( (int) $h['hero_image'], 'full' ) : '',
		'srcset'  => $h['hero_image'] ? (string) wp_get_attachment_image_srcset( (int) $h['hero_image'], 'full' ) : '',
		),
		'logo'          => $logo['url'],
		'logoReady'     => function_exists( 'imagecreatefromstring' ),
		'logoColor'     => $logo['color'],
		'logoDark'      => $logo['dark'],
		'logoSize'      => array(
			'desktop' => max( 30, min( 90, (int) ( $h['logo_height'] ?? 56 ) ) ),
			'mobile'  => max( 28, min( 70, (int) ( $h['logo_height_mobile'] ?? 48 ) ) ),
			'footer'  => max( 120, min( 360, (int) ( $h['logo_footer'] ?? 240 ) ) ),
		),
	);
	return array(
			'contact'      => $o['contact'],
			'social'       => $o['social'],
			'home'         => $home,
			'myAccountUrl' => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ),
			'bundle'       => array(
				'enabled' => 'no' !== $o['bundle']['enabled'],
				// Texts saved for the old fixed-price trio give way to the new ones.
				'title'   => 'Build your trio.' === $o['bundle']['title'] ? rfaheya_fields()['bundle']['title'][1] : $o['bundle']['title'],
				'text'    => 0 === strpos( $o['bundle']['text'], 'Pick any three fragrances' ) ? rfaheya_fields()['bundle']['text'][1] : $o['bundle']['text'],
				'tiers'   => array_map(
					fn( $t ) => array(
						'count'   => $t[0],
						'percent' => $t[1],
					),
					rfaheya_bundle_tiers()
				),
			),
			'gift'         => rfaheya_gift_box_data(),
			'offers'       => rfaheya_offers_data(),
			'heroSlider'   => rfaheya_hero_slider_data( $o['slider'] ),
			'images'       => rfaheya_site_images_data(),
			'characters'   => rfaheya_characters_data(),
			'discovery'    => rfaheya_discovery_prices(),
			'menus'        => rfaheya_menus_data(),
			'campaigns'    => array(
				'vanilla-redefined'  => array(
					'label' => $o['campaigns']['vanilla_label'],
					'title' => $o['campaigns']['vanilla_title'],
					'text'  => $o['campaigns']['vanilla_text'],
					'products' => rfaheya_id_list( $o['campaigns']['vanilla_products'] ?? '' ),
				),
				'oud-rose-redefined' => array(
					'label' => $o['campaigns']['oudrose_label'],
					'title' => $o['campaigns']['oudrose_title'],
					'text'  => $o['campaigns']['oudrose_text'],
					'products' => rfaheya_id_list( $o['campaigns']['oudrose_products'] ?? '' ),
				),
			),
			'loyalty'      => rfaheya_loyalty(),
			'shipping'     => array(
				'freeShipping' => 'no' !== $o['shipping']['free_enabled'],
				'freeMin'      => (float) $o['shipping']['free_min'],
				'offer'        => 'no' !== $o['shipping']['offer_enabled'],
				'offerMin'     => (float) $o['shipping']['offer_min'],
				'offerPercent' => (float) $o['shipping']['offer_percent'],
				'orderMin'     => rfaheya_order_min(),
			),
			'currency'     => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'EGP',
		);
}

/*
 * The Vitrine's bottles: a picture uploaded as "showcase-<product slug>" (any image type) becomes
 * that product's showcase bottle, unless one is already chosen. Checked on upload, and once for
 * the pictures already in the Media Library.
 */
function rfaheya_showcase_attach( $attachment_id ) {
	$file = (string) get_post_meta( $attachment_id, '_wp_attached_file', true );
	$name = strtolower( pathinfo( $file, PATHINFO_FILENAME ) );
	if ( ! preg_match( '/^showcase-(.+)$/', $name, $m ) ) {
		return false;
	}
	foreach ( array_unique( array( $m[1], preg_replace( '/-(\d+|scaled)$/', '', $m[1] ) ) ) as $slug ) {
		$product = get_page_by_path( $slug, OBJECT, 'product' );
		if ( $product ) {
			$d = rfaheya_details( $product->ID );
			if ( empty( $d['showcase_image'] ) ) {
				$d['showcase_image'] = (int) $attachment_id;
				update_post_meta( $product->ID, '_rfaheya_details', $d );
				delete_transient( 'rfaheya_bootstrap' ); // the shop data is rebuilt with the new bottle
			}
			return true;
		}
	}
	return false;
}
add_action( 'add_attachment', 'rfaheya_showcase_attach' );
add_action(
	'admin_init',
	function () {
		if ( get_option( 'rfaheya_showcase_seeded' ) || ! current_user_can( 'manage_options' ) ) {
			return;
		}
		global $wpdb;
		$ids = $wpdb->get_col( "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_wp_attached_file' AND meta_value LIKE '%showcase-%'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$hit = false;
		foreach ( $ids as $id ) {
			$hit = rfaheya_showcase_attach( (int) $id ) || $hit;
		}
		if ( $hit ) {
			update_option( 'rfaheya_showcase_seeded', time(), false );
		}
	}
);

/** Rfaheya details of every published product: id => details (+ DNA image URL). */
function rfaheya_products_details() {
	$ids = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => 'publish',
			'numberposts' => -1,
			'fields'      => 'ids',
			'meta_key'    => '_rfaheya_details', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
		)
	);
	$out = array();
	foreach ( $ids as $id ) {
		$d = rfaheya_details( $id );
		if ( ! empty( $d['dna_image'] ) ) {
			$d['dna_image_url'] = (string) wp_get_attachment_image_url( (int) $d['dna_image'], 'large' );
		}
		if ( ! empty( $d['showcase_image'] ) ) {
			$d['showcase_image_url'] = (string) wp_get_attachment_image_url( (int) $d['showcase_image'], 'full' );
		}
		$out[ (string) $id ] = $d;
	}
	return (object) $out;
}

/** Published FAQs: question and answer HTML, in their order. */
function rfaheya_faqs_data() {
	$posts = get_posts(
		array(
			'post_type'   => 'rfaheya_faq',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => array(
				'menu_order' => 'ASC',
				'date'       => 'ASC',
			),
		)
	);
	return array_map(
		fn( $p ) => array(
			'q' => get_the_title( $p ),
			'a' => apply_filters( 'the_content', $p->post_content ),
		),
		$posts
	);
}

/** Calls a WooCommerce Store API route internally and returns its JSON data. */
function rfaheya_store_data( $route, $params ) {
	try {
	// WooCommerce's Store API expects the cart to be loaded (outside REST requests it may not be yet).
	if ( function_exists( 'WC' ) && function_exists( 'wc_load_cart' ) && null === WC()->cart && did_action( 'woocommerce_init' ) ) {
		wc_load_cart();
	}
		$request = new WP_REST_Request( 'GET', $route );
		$request->set_query_params( $params );
		$response = rest_do_request( $request );
		if ( $response->is_error() ) {
			return array();
		}
		// Plain arrays all the way down: the Store API returns some parts as objects (stdClass).
		$data = json_decode( (string) wp_json_encode( rest_get_server()->response_to_data( $response, false ) ), true );
		return is_array( $data ) ? $data : array();
	} catch ( Throwable $e ) {
		// Without it the storefront loads the same data with its own requests.
		error_log( 'Rfaheya: ' . $route . ' failed: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' ' . $route . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
		return array();
	}
}

/** A Store API product or variation with only the fields the storefront reads (RawProduct in src/api/woo.ts). */
/**
 * A product text with only its words and simple formatting: text pasted from other sites or
 * chat tools carries long hidden class lists and wrappers that weigh more than the words.
 */
function rfaheya_clean_html( $html ) {
	$html = (string) $html;
	if ( '' === $html || false === strpos( $html, '<' ) ) {
		return $html;
	}
	$keep = array(
		'p'          => array(),
		'br'         => array(),
		'strong'     => array(),
		'b'          => array(),
		'em'         => array(),
		'i'          => array(),
		'u'          => array(),
		'ul'         => array(),
		'ol'         => array(),
		'li'         => array(),
		'h2'         => array(),
		'h3'         => array(),
		'h4'         => array(),
		'h5'         => array(),
		'blockquote' => array(),
		'a'          => array( 'href' => true ),
		'img'        => array(
			'src' => true,
			'alt' => true,
		),
	);
	$html = preg_replace( '#<(script|style)\b[^>]*>.*?</\1>#is', '', $html );
	$html = wp_kses( $html, $keep );
	$html = preg_replace( '#<p>\s*(&nbsp;|\s)*</p>#i', '', $html );
	$html = preg_replace( '/[ \t]*\n\s*/', "\n", $html );
	return trim( (string) $html );
}

function rfaheya_slim_product( $p ) {
	$pick = function ( $a, $keys ) {
		return array_intersect_key( (array) $a, array_flip( $keys ) );
	};
	$p = (array) $p;
	return array(
		'id'                => isset( $p['id'] ) ? (int) $p['id'] : 0,
		'name'              => isset( $p['name'] ) ? $p['name'] : '',
		'slug'              => isset( $p['slug'] ) ? $p['slug'] : '',
		'type'              => isset( $p['type'] ) ? $p['type'] : '',
		'parent'            => isset( $p['parent'] ) ? (int) $p['parent'] : 0,
		'short_description' => isset( $p['short_description'] ) ? rfaheya_clean_html( $p['short_description'] ) : '',
		'description'       => isset( $p['description'] ) ? rfaheya_clean_html( $p['description'] ) : '',
		'prices'            => $pick( isset( $p['prices'] ) ? $p['prices'] : array(), array( 'price', 'regular_price', 'sale_price', 'price_range', 'currency_minor_unit' ) ),
		'images'            => array_map(
			function ( $i ) use ( $pick ) {
				return $pick( $i, array( 'id', 'src', 'alt', 'name', 'srcset' ) );
			},
			isset( $p['images'] ) ? (array) $p['images'] : array()
		),
		'categories'        => array_map(
			function ( $c ) use ( $pick ) {
				return $pick( $c, array( 'id', 'name', 'slug' ) );
			},
			isset( $p['categories'] ) ? (array) $p['categories'] : array()
		),
		'tags'              => array_map(
			function ( $t ) use ( $pick ) {
				return $pick( $t, array( 'id', 'name', 'slug' ) );
			},
			isset( $p['tags'] ) ? (array) $p['tags'] : array()
		),
		'attributes'        => array_map(
			function ( $a ) use ( $pick ) {
				$a          = (array) $a;
				$out        = $pick( $a, array( 'id', 'name', 'taxonomy', 'has_variations' ) );
				$out['terms'] = array_map(
					function ( $t ) use ( $pick ) {
						return $pick( $t, array( 'id', 'name', 'slug' ) );
					},
					isset( $a['terms'] ) ? (array) $a['terms'] : array()
				);
				return $out;
			},
			isset( $p['attributes'] ) ? (array) $p['attributes'] : array()
		),
		'variations'        => isset( $p['variations'] ) ? $p['variations'] : array(),
		'variation'         => isset( $p['variation'] ) ? $p['variation'] : '',
		'is_in_stock'       => ! empty( $p['is_in_stock'] ),
		'is_purchasable'    => ! empty( $p['is_purchasable'] ),
	);
}

/** A Store API review with only the fields the storefront reads. */
function rfaheya_slim_review( $r ) {
	$r   = (array) $r;
	$out = array_intersect_key( $r, array_flip( array( 'id', 'date_created', 'product_id', 'reviewer', 'review', 'rating', 'verified' ) ) );
	$id  = isset( $r['id'] ) ? (int) $r['id'] : 0;
	// Photos and size added in the dashboard (Products → Add review, or a review's edit screen).
	$out['images'] = $id ? rfaheya_review_image_urls( $id ) : array();
	$out['size']   = $id ? (string) get_comment_meta( $id, 'rfaheya_size', true ) : '';
	return $out;
}

/** A review's photos (attachment IDs saved as comment meta) as image URLs. */
function rfaheya_review_image_urls( $comment_id ) {
	$urls = array();
	foreach ( (array) get_comment_meta( $comment_id, 'rfaheya_images', true ) as $attachment ) {
		$src = wp_get_attachment_image_url( (int) $attachment, 'large' );
		if ( $src ) {
			$urls[] = $src;
		}
	}
	return $urls;
}

/** Every published review (newest first), a hundred at a time, up to 500. */
function rfaheya_all_reviews() {
	$all = array();
	for ( $page = 1; $page <= 5; $page++ ) {
		$chunk = rfaheya_store_data(
			'/wc/store/v1/products/reviews',
			array(
				'per_page' => 100,
				'page'     => $page,
				'orderby'  => 'date_gmt',
				'order'    => 'desc',
			)
		);
		$all = array_merge( $all, $chunk );
		if ( count( $chunk ) < 100 ) {
			break;
		}
	}
	return $all;
}

/**
 * Builds the shop data once this request's answer has been sent (the visitor doesn't wait);
 * WP-Cron is a second chance on hosts that can't finish a request early.
 */
function rfaheya_build_after_response() {
	static $queued = false;
	if ( $queued || get_transient( 'rfaheya_bootstrap_building' ) ) {
		return;
	}
	$queued = true;
	if ( ! wp_next_scheduled( 'rfaheya_warm_bootstrap' ) ) {
		wp_schedule_single_event( time(), 'rfaheya_warm_bootstrap' );
	}
	if ( ! function_exists( 'litespeed_finish_request' ) && ! function_exists( 'fastcgi_finish_request' ) ) {
		return;
	}
	add_action(
		'shutdown',
		function () {
			if ( get_transient( 'rfaheya_bootstrap_building' ) ) {
				return;
			}
			set_transient( 'rfaheya_bootstrap_building', 1, 5 * MINUTE_IN_SECONDS );
			ignore_user_abort( true );
			function_exists( 'litespeed_finish_request' ) ? litespeed_finish_request() : fastcgi_finish_request();
			try {
				rfaheya_bootstrap();
			} catch ( Throwable $e ) {
				update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' build: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
			}
			delete_transient( 'rfaheya_bootstrap_building' );
		},
		0
	);
}

/**
 * Everything the storefront loads at start-up in ONE request: settings,
 * product details, notes, videos, categories, products with their
 * variations, and reviews. Cached for a minute.
 */
function rfaheya_bootstrap() {
	try {
	$cached = get_transient( 'rfaheya_bootstrap' );
	if ( rfaheya_bootstrap_current( $cached ) ) {
		return $cached;
	}
	if ( get_transient( 'rfaheya_bootstrap_failed' ) ) {
		return array( 'products' => array() );
	}
	// Gathering everything takes a while on a busy shared server: no PHP time limit for it.
	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 300 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	}
	$started = microtime( true );
	// Every published product, best sellers first (ties by newest), fetched by ID 100 at a time:
	// paging the Store API by popularity can repeat or skip products whose sales are equal.
	$order = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => 'publish',
			'numberposts' => -1,
			'fields'      => 'ids',
			'meta_key'    => 'total_sales', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'orderby'     => array(
				'meta_value_num' => 'DESC',
				'ID'             => 'DESC',
			),
		)
	);
	// Products that never sold may have no total_sales value at all: add them after the others.
	$all   = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => 'publish',
			'numberposts' => -1,
			'fields'      => 'ids',
			'orderby'     => 'ID',
			'order'       => 'DESC',
		)
	);
	$order = array_values( array_unique( array_merge( array_map( 'intval', $order ), array_map( 'intval', $all ) ) ) );
	$found = array();
	foreach ( array_chunk( $order, 100 ) as $chunk ) {
		foreach ( rfaheya_store_data( '/wc/store/v1/products', array( 'include' => implode( ',', $chunk ), 'per_page' => 100 ) ) as $p ) {
			$found[ (int) $p['id'] ] = $p;
		}
	}
	// The Store API leaves out what the shop hides (catalog visibility, hidden out-of-stock…).
	$products = array();
	foreach ( $order as $id ) {
		if ( isset( $found[ $id ] ) ) {
			$products[] = $found[ $id ];
		}
	}
	$ids        = array();
	foreach ( $products as $p ) {
		foreach ( (array) ( isset( $p['variations'] ) ? $p['variations'] : array() ) as $v ) {
			$ids[] = (int) $v['id'];
		}
	}
	$variations = array();
	foreach ( array_chunk( $ids, 100 ) as $chunk ) {
		$variations = array_merge( $variations, rfaheya_store_data( '/wc/store/v1/products', array( 'type' => 'variation', 'per_page' => 100, 'include' => implode( ',', $chunk ) ) ) );
	}
	// Only the fields the storefront reads (src/api/woo.ts): about a third of the size.
	$products   = array_map( 'rfaheya_slim_product', $products );
	// The storefront reads only a variation's price and stock (its size comes from the parent):
	// the rest would be a third of the page's weight.
	$variations = array_map(
		function ( $v ) {
			$v = (array) $v;
			$p = isset( $v['prices'] ) ? (array) $v['prices'] : array();
			return array(
				'id'          => isset( $v['id'] ) ? (int) $v['id'] : 0,
				'parent'      => isset( $v['parent'] ) ? (int) $v['parent'] : 0,
				'prices'      => array_intersect_key( $p, array_flip( array( 'price', 'regular_price', 'currency_minor_unit' ) ) ),
				'is_in_stock' => ! empty( $v['is_in_stock'] ),
			);
		},
		$variations
	);
	$data = array(
		'v'          => RFAHEYA_DATA_VERSION,
		'settings'   => rfaheya_settings_data(),
		'details'    => rfaheya_products_details(),
		'notes'      => rfaheya_note_library(),
		'videos'     => rfaheya_videos(),
		'categories' => rfaheya_store_data( '/wc/store/v1/products/categories', array( 'per_page' => 100 ) ),
		'products'   => $products,
		'dateOrder'  => array_map(
			'intval',
			get_posts(
				array(
					'post_type'   => 'product',
					'post_status' => 'publish',
					'numberposts' => -1,
					'orderby'     => 'date',
					'order'       => 'ASC',
					'fields'      => 'ids',
				)
			)
		),
		'variations' => $variations,
		'reviews'    => array_map( 'rfaheya_slim_review', rfaheya_all_reviews() ),
		'faqs'       => rfaheya_faqs_data(),
	);
	// Rebuilt whenever products, stock, settings or content change (hooks below), so it can be kept a while.
	update_option(
		'rfaheya_bootstrap_status',
		array(
			'at'       => gmdate( 'Y-m-d H:i:s' ),
			'seconds'  => round( microtime( true ) - $started, 1 ),
			'products' => count( $data['products'] ),
			'bytes'    => strlen( (string) wp_json_encode( $data ) ),
		),
		false
	);
	if ( ! empty( $data['products'] ) ) {
		set_transient( 'rfaheya_bootstrap', $data, HOUR_IN_SECONDS );
		// The last good copy never expires: pages always carry shop data (rfaheya_storefront_shell).
		update_option( 'rfaheya_bootstrap_last', $data, false );
	} else {
		// The storefront loads its data with separate requests then; don't rebuild on every visit.
		set_transient( 'rfaheya_bootstrap_failed', 1, 10 * MINUTE_IN_SECONDS );
	}
	return $data;
	} catch ( Throwable $e ) {
		error_log( 'Rfaheya bootstrap: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() );
		update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' bootstrap: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
		set_transient( 'rfaheya_bootstrap_failed', 1, 10 * MINUTE_IN_SECONDS );
		return array( 'products' => array() );
	}
}

/**
 * The shop data (without the settings) as static files in uploads/rfaheya, named by their
 * content, so browsers and the CDN keep them until they change: the core (what every page
 * needs) and the extra (long product texts and reviews), which the core links to and which
 * the storefront reads right after. Returns the core's URL, or '' when the files can't be
 * written (the page then carries the data itself). Old copies are removed after a day.
 */
function rfaheya_boot_file( $data ) {
	try {
		unset( $data['settings'] );
		$texts = array();
		foreach ( $data['products'] as $i => $product ) {
			if ( ! empty( $product['description'] ) ) {
				$texts[ (string) $product['id'] ] = $product['description'];
			}
			$data['products'][ $i ]['description'] = '';
		}
		$extra = rfaheya_write_data_file(
			'extra',
			array(
				'descriptions' => (object) $texts,
				'reviews'      => $data['reviews'] ?? array(),
			)
		);
		if ( ! $extra ) {
			return '';
		}
		$data['reviews'] = array();
		$data['extra']   = $extra;
		return rfaheya_write_data_file( 'boot', $data );
	} catch ( Throwable $e ) {
		return '';
	}
}

/** Writes JSON to uploads/rfaheya/<prefix>-<content hash>.json once; returns its site-relative URL or ''. */
function rfaheya_write_data_file( $prefix, $data ) {
	$json = wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
	if ( ! $json ) {
		return '';
	}
	$up = wp_upload_dir( null, false );
	if ( ! empty( $up['error'] ) ) {
		return '';
	}
	$dir  = trailingslashit( $up['basedir'] ) . 'rfaheya';
	$name = $prefix . '-' . substr( md5( $json ), 0, 12 ) . '.json';
	$path = $dir . '/' . $name;
	if ( ! is_readable( $path ) ) {
		if ( ! wp_mkdir_p( $dir ) ) {
			return '';
		}
		$tmp = $path . '.' . wp_generate_password( 6, false ) . '.tmp';
		if ( false === file_put_contents( $tmp, $json ) || ! rename( $tmp, $path ) ) { // phpcs:ignore WordPress.WP.AlternativeFunctions
			@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			return '';
		}
		foreach ( (array) glob( $dir . '/' . $prefix . '-*.json' ) as $old ) {
			if ( $old !== $path && filemtime( $old ) < time() - DAY_IN_SECONDS ) {
				@unlink( $old ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			}
		}
	}
	// Same-origin path (works on the temporary and the real domain alike).
	return (string) wp_make_link_relative( trailingslashit( $up['baseurl'] ) . 'rfaheya/' . $name );
}

/** One article in the shape the storefront reads from the REST API (src/api/content.ts), without its text. */
function rfaheya_post_slim_one( $post ) {
	$media = array();
	$thumb = (int) get_post_thumbnail_id( $post );
	if ( $thumb ) {
		$meta  = wp_get_attachment_metadata( $thumb );
		$sizes = array();
		foreach ( (array) ( $meta['sizes'] ?? array() ) as $name => $size ) {
			if ( (int) ( $size['width'] ?? 0 ) >= 600 ) {
				$sizes[ $name ] = array(
					'source_url' => (string) wp_get_attachment_image_url( $thumb, $name ),
					'width'      => (int) $size['width'],
				);
			}
		}
		$media[] = array(
			'source_url'    => (string) wp_get_attachment_image_url( $thumb, 'full' ),
			'alt_text'      => (string) get_post_meta( $thumb, '_wp_attachment_image_alt', true ),
			'media_details' => array( 'sizes' => (object) $sizes ),
		);
	}
	$terms = array();
	foreach ( get_the_category( $post->ID ) as $cat ) {
		$terms[] = array(
			'taxonomy' => 'category',
			'name'     => $cat->name,
		);
	}
	$text  = trim( wp_strip_all_tags( (string) $post->post_content ) );
	return array(
		'slug'      => $post->post_name,
		'date'      => str_replace( ' ', 'T', $post->post_date ),
		'title'     => array( 'rendered' => get_the_title( $post ) ),
		'excerpt'   => array( 'rendered' => get_the_excerpt( $post ) ),
		'content'   => array( 'rendered' => '' ),
		'rf_words'  => '' === $text ? 0 : count( preg_split( '/\s+/u', $text ) ),
		'rf_lang'   => rfaheya_post_lang( $post ),
		'_embedded' => array(
			'wp:featuredmedia' => $media,
			'wp:term'          => array( $terms ),
		),
	);
}

/**
 * Every published article in every language, as the journal's list needs them. Kept an hour,
 * and dropped whenever an article is published, changed, unpublished or deleted.
 */
function rfaheya_posts_slim() {
	$cached = get_transient( 'rfaheya_posts_slim' );
	if ( is_array( $cached ) ) {
		return $cached;
	}
	$out = array();
	foreach ( get_posts( array( 'post_type' => 'post', 'post_status' => 'publish', 'numberposts' => -1, 'suppress_filters' => true ) ) as $post ) {
		if ( ! empty( $post->post_password ) ) {
			continue;
		}
		$out[] = rfaheya_post_slim_one( $post );
	}
	set_transient( 'rfaheya_posts_slim', $out, HOUR_IN_SECONDS );
	return $out;
}
// The journal's list is made again whenever an article is published, changed, unpublished or deleted.
add_action(
	'transition_post_status',
	function ( $new, $old, $post ) {
		if ( 'post' === $post->post_type && ( 'publish' === $new || 'publish' === $old ) ) {
			delete_transient( 'rfaheya_posts_slim' );
			rfaheya_purge_page_cache();
		}
	},
	10,
	3
);
add_action( 'save_post_post', fn() => delete_transient( 'rfaheya_posts_slim' ) );
add_action(
	'deleted_post',
	function ( $id ) {
		if ( 'post' === get_post_type( $id ) ) {
			delete_transient( 'rfaheya_posts_slim' );
		}
	}
);

/** Published pages for "Related" links on the info pages: slug, title and section label. */
function rfaheya_pages_index() {
	return array_values(
		array_map(
			function ( $p ) {
				return array(
					'slug'    => $p->post_name,
					'title'   => get_the_title( $p ),
					'eyebrow' => (string) get_post_meta( $p->ID, 'rfaheya_eyebrow', true ),
				);
			},
			get_pages( array( 'post_status' => 'publish' ) )
		)
	);
}

/** The slug of an info page address (/privacy-policy → privacy-policy); '' for the storefront's own pages. */
function rfaheya_info_slug( $path ) {
	if ( ! preg_match( '#^/([a-z0-9-]+)/?$#', (string) $path, $m ) ) {
		return '';
	}
	// The storefront's own pages (and WooCommerce's) are not info pages.
	if ( preg_match( '#^(shop|product|cart|checkout|my-account|account|wishlist|about|contact|faqs|reviews|journal|collections|finder|discover|our-standard|vitrine|vanilla-redefined|oud-rose-redefined|track-order)$#', $m[1] ) ) {
		return '';
	}
	return $m[1];
}

/** A published page by its address (for the info pages, e.g. /privacy-policy), or null. */
function rfaheya_info_page_for( $path ) {
	$slug = rfaheya_info_slug( $path );
	if ( '' === $slug ) {
		return null;
	}
	$page = get_page_by_path( $slug, OBJECT, 'page' );
	if ( ! $page || 'publish' !== $page->post_status || ! empty( $page->post_password ) || has_shortcode( $page->post_content, 'woocommerce_checkout' ) || false !== strpos( $page->post_content, '[woocommerce' ) ) {
		return null;
	}
	return $page;
}

/** A saved copy of the shop data made by this version of the plugin. */
function rfaheya_bootstrap_current( $data ) {
	return is_array( $data ) && isset( $data['v'] ) && RFAHEYA_DATA_VERSION === (int) $data['v'];
}

/**
 * The shop data as fast as possible: the fresh copy; otherwise the last good one. Either way a
 * missing or old copy is rebuilt after the answer has been sent, never while a visitor waits.
 * Returns array( data or null, stale ).
 */
function rfaheya_bootstrap_ready() {
	$data = get_transient( 'rfaheya_bootstrap' );
	if ( rfaheya_bootstrap_current( $data ) && ! empty( $data['products'] ) ) {
		// The store settings are always the current ones (they are quick to read), so a change
		// in Settings → Rfaheya Store shows at once, even while the product copy is being rebuilt.
		$data['settings'] = rfaheya_settings_data();
		return array( $data, false );
	}
	$last = get_option( 'rfaheya_bootstrap_last' );
	if ( rfaheya_bootstrap_current( $last ) && ! empty( $last['products'] ) ) {
		rfaheya_build_after_response();
		$last['settings'] = rfaheya_settings_data();
		return array( $last, true );
	}
	// None yet: this visitor's storefront loads the products itself; the copy is built meanwhile.
	rfaheya_build_after_response();
	return array( null, false );
}

/**
 * Storefront page (every storefront URL is routed here by .htaccess):
 * index.html as is, plus the shop data when it is already built, so the
 * storefront doesn't have to request it. Nothing else is changed.
 */
function rfaheya_storefront_shell() {
	$file = ABSPATH . 'index.html';
	if ( ! is_readable( $file ) ) {
		return;
	}
	// Old addresses (the previous site's, renamed products and articles…) move for good to the new ones.
	$asked = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- only compared and rebuilt
	$to    = rfaheya_redirect_for( (string) ( $asked['path'] ?? '/' ) );
	if ( $to ) {
		$query = (string) ( $asked['query'] ?? '' );
		$query = trim( preg_replace( '/(^|&)rfaheya_shell=1(&|$)/', '$1', $query ), '&' );
		if ( $query && false === strpos( $to, '?' ) ) {
			$to .= '?' . $query;
		}
		while ( ob_get_level() > 0 ) {
			ob_end_clean();
		}
		header( 'X-Redirect-By: Rfaheya' );
		wp_redirect( preg_match( '#^https?://#', $to ) ? $to : home_url( $to ), 301 ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- the dashboard's own redirects may point to another site
		exit;
	}
	$html = (string) file_get_contents( $file );
	// The fresh copy, or the last good one so the shop shows at once (a fresh one follows).
	list( $data, $stale ) = rfaheya_bootstrap_ready();
	// A new upload: pages cached by LiteSpeed still point at the old files.
	$build = (string) filemtime( $file );
	$fresh = get_option( 'rfaheya_index_build' ) !== $build;
	if ( $fresh ) {
		update_option( 'rfaheya_index_build', $build, false );
		rfaheya_purge_page_cache();
	}
	// The site icon set in WordPress (Appearance → Customize → Site Identity → Site Icon).
	if ( has_site_icon() ) {
		$html = str_replace( '</head>', '<link rel="icon" href="' . esc_url( get_site_icon_url( 32 ) ) . '" sizes="32x32"><link rel="icon" href="' . esc_url( get_site_icon_url( 192 ) ) . '" sizes="192x192"><link rel="apple-touch-icon" href="' . esc_url( get_site_icon_url( 180 ) ) . '"></head>', $html );
	}
	// The dashboard logo shows from the first paint (no swap once the settings arrive).
	$logo = rfaheya_logo_prepared()['url'];
	if ( $logo ) {
		$html = str_replace( '<head>', '<head><script>window.__rfLogo=' . wp_json_encode( $logo, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ) . '</script><link rel="preload" as="image" href="' . esc_url( $logo ) . '">', $html );
	}
	$boot_url = $data ? rfaheya_boot_file( $data ) : '';
	if ( $boot_url ) {
		// The shop data as a separate file (kept by the browser and the CDN, downloaded alongside
		// the storefront's code): the page itself stays small and shows sooner. The settings
		// travel in the page, so a change in the dashboard shows at once.
		$settings = wp_json_encode( $data['settings'] ?? new stdClass(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES );
		// Pages that show no products (About, Contact…) fetch it only once they are on screen.
		$html = str_replace(
			'<head>',
			'<head><script>window.__rfSettings=' . $settings . ';(function(){var u=' . wp_json_encode( $boot_url, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES ) . ';window.__rfBootLoad=function(){return window.__rfBoot||(window.__rfBoot=fetch(u).then(function(r){return r.ok?r.json():null}).then(function(d){if(d&&d.products)d.settings=window.__rfSettings;return d&&d.products?d:null}).catch(function(){return null}))};if(!/^\\/(about|our-standard|contact|track-order|journal|finder\\/?$|collections\\/?$)/.test(location.pathname))window.__rfBootLoad()})()</script>',
			$html
		);
	} elseif ( $data ) {
		// At the end of the page: the first screen (and its picture) starts before this is read.
		// The storefront's module runs only once the whole page is read, so it is there in time.
		$html = str_replace( '</body>', '<script>window.__rfBoot=Promise.resolve(' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ) . ')</script></body>', $html );
	}
	// Start the LCP image before the storefront module has parsed the catalogue.
	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH );
	$slider = rfaheya_hero_slider_data( rfaheya_options()['slider'] );
	$data_logo_hm = max( 28, min( 70, (int) ( rfaheya_options()['home']['logo_height_mobile'] ?? 48 ) ) );
	if ( '/' === $path && ! empty( $slider['enabled'] ) ) {
		// The slider's first picture, when one is chosen in the dashboard.
		// The same files the slider picks (phone picture on phones), so nothing is fetched twice.
		$first  = $slider['slides'][0];
		$filled = count(
			array_filter(
				$slider['slides'],
				function ( $s ) {
					return $s['image'] || trim( $s['title'] );
				}
			)
		);
		// For the phone's first-screen picture shown before the storefront starts (index.html).
		$own = array( 'n' => $filled ? $filled : 3 );
		if ( ! empty( $first['image'] ) ) {
			$own['img'] = $first['mobile'] ? $first['mobile'] : $first['image'];
			$own['set'] = $first['mobile'] ? '' : $first['srcset'];
		}
		if ( ! empty( $slider['intro'] ) ) {
			$own = 1; // the opening animation shows first
		}
		$html = str_replace( '<head>', '<head><script>window.__rfOwnSlides=' . wp_json_encode( $own, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ) . ';window.__rfLogoHm=' . (int) $data_logo_hm . '</script>', $html );
		if ( ! empty( $first['image'] ) ) {
			$tags  = '';
			$media = $first['mobile'] ? ' media="(min-width: 768px)"' : '';
			$tags .= '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $first['image'] ) . '"' . $media;
			if ( $first['srcset'] ) {
				$tags .= ' imagesrcset="' . esc_attr( $first['srcset'] ) . '" imagesizes="(min-width: 1024px) 66vw, 100vw"';
			}
			$tags .= '>';
			if ( $first['mobile'] ) {
				$tags .= '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $first['mobile'] ) . '" media="(max-width: 767px)">';
			}
			$html = str_replace( '<head>', '<head>' . $tags, $html );
		}
	} elseif ( '/' === $path ) {
		$html = str_replace( '<head>', '<head><script>window.__rfOwnSlides=1</script>', $html );
		$hero = isset( $data['settings']['home']['hero']['image'] ) ? $data['settings']['home']['hero']['image'] : '';
		$srcset = isset( $data['settings']['home']['hero']['srcset'] ) ? $data['settings']['home']['hero']['srcset'] : '';
		$hero = $hero ? $hero : '/assets/hero-XWCSYKce.webp';
		$preload = '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $hero ) . '"';
		if ( $srcset ) {
			$preload .= ' imagesrcset="' . esc_attr( $srcset ) . '" imagesizes="(max-width: 767px) 250vw, 100vw"';
		}
		$html = str_replace( '</head>', $preload . '></head>', $html );
	}
	// The journal: its posts come with the page (no slow REST request), and the first
	// post's picture starts at once.
	if ( preg_match( '#^/journal(/|$)#', (string) $path ) ) {
		$posts = rfaheya_posts_slim();
		$head  = '<script>window.__rfPosts=' . wp_json_encode( $posts, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>';
		$lead  = $posts[0]['_embedded']['wp:featuredmedia'][0] ?? null;
		if ( preg_match( '#^/journal/?$#', (string) $path ) && ! empty( $lead['source_url'] ) ) {
			$set = array();
			foreach ( $lead['media_details']['sizes'] as $size ) {
				$set[ $size['width'] ] = $size['source_url'] . ' ' . $size['width'] . 'w';
			}
			$head .= '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $lead['source_url'] ) . '"' . ( $set ? ' imagesrcset="' . esc_attr( implode( ', ', $set ) ) . '" imagesizes="(max-width: 1023px) 100vw, 50vw"' : '' ) . '>';
		}
		$html = str_replace( '</head>', $head . '</head>', $html );
	}
	// An info page (privacy, terms…): its text comes with the page (no slow REST request).
	$info = rfaheya_info_page_for( $path );
	if ( ! $info && rfaheya_info_slug( $path ) ) {
		// No such page in WordPress: the storefront shows its built-in text at once.
		$flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
		$html  = str_replace( '</head>', '<script>window.__rfWpPage=' . wp_json_encode( array( 'slug' => rfaheya_info_slug( $path ), 'missing' => true ), $flags ) . ';window.__rfPageIndex=' . wp_json_encode( rfaheya_pages_index(), $flags ) . '</script></head>', $html );
	}
	if ( $info ) {
		$copy = array(
			'slug'    => $info->post_name,
			'title'   => array( 'rendered' => get_the_title( $info ) ),
			'excerpt' => array( 'rendered' => has_excerpt( $info ) ? get_the_excerpt( $info ) : '' ),
			'content' => array( 'rendered' => apply_filters( 'the_content', $info->post_content ) ), // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals
		);
		$flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
		$html  = str_replace( '</head>', '<script>window.__rfWpPage=' . wp_json_encode( $copy, $flags ) . ';window.__rfPageIndex=' . wp_json_encode( rfaheya_pages_index(), $flags ) . '</script></head>', $html );
	}
	// This page's title, description, sharing picture and structured data for search engines.
	try {
		$html = rfaheya_seo_apply( $html, (string) $path, $data );
	} catch ( Throwable $e ) {
		error_log( 'Rfaheya: SEO tags failed: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	}
	// The stylesheet inline: one request less before the page shows.
	if ( preg_match( '#<link rel="stylesheet" crossorigin href="/([^"]+\.css)">#', $html, $css ) && is_readable( ABSPATH . $css[1] ) && filesize( ABSPATH . $css[1] ) < 300000 ) {
		$html = str_replace( $css[0], '<style>' . str_replace( '</style', '<\/style', (string) file_get_contents( ABSPATH . $css[1] ) ) . '</style>', $html );
	}
	// Sent as is: page optimisers (LiteSpeed Cache "delay / defer JS", minify…) would
	// hold back or reorder the storefront's start-up scripts.
	if ( ! defined( 'LITESPEED_NO_OPTM' ) ) {
		define( 'LITESPEED_NO_OPTM', true );
	}
	while ( ob_get_level() > 0 ) {
		ob_end_clean();
	}
	nocache_headers();
	header( 'Content-Type: text/html; charset=utf-8' );
	if ( $data && ! $fresh && ! $stale ) {
		// The same page for every visitor; LiteSpeed keeps it until products, stock,
		// settings or content change (rfaheya_purge_page_cache).
		header( 'Cache-Control: public, max-age=0, s-maxage=60' ); // CDNs we can't purge keep it a minute at most
		header( 'X-LiteSpeed-Cache-Control: public,max-age=3600' );
		header( 'X-LiteSpeed-Tag: rfaheya_page' );
	} else {
		header( 'Cache-Control: no-cache' );
		header( 'X-LiteSpeed-Cache-Control: no-cache' );
	}
	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- the storefront's own index.html plus escaped data
	exit;
}

/** Drops the storefront pages LiteSpeed has cached. */
function rfaheya_purge_page_cache() {
	if ( ! headers_sent() ) {
		header( 'X-LiteSpeed-Purge: tag=rfaheya_page', false );
	}
	do_action( 'litespeed_purge', 'rfaheya_page' );
}

add_action(
	'wp_loaded',
	function () {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only page request
		if ( isset( $_GET['rfaheya_shell'] ) && ! is_admin() && ! wp_doing_ajax() ) {
			try {
				rfaheya_storefront_shell();
			} catch ( Throwable $e ) {
				// Never a blank error page: serve the plain storefront, which loads its data itself.
				error_log( 'Rfaheya: page shell failed: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' page: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
				if ( ! headers_sent() && is_readable( ABSPATH . 'index.html' ) ) {
					header( 'Content-Type: text/html; charset=utf-8' );
					header( 'Cache-Control: no-cache' );
					readfile( ABSPATH . 'index.html' );
					exit;
				}
			}
		}
	},
	// After WooCommerce has loaded the session and cart.
	99
);

/** Content changes show up right away. */
foreach ( array( 'save_post', 'deleted_post', 'edited_term', 'created_term', 'delete_term', 'update_option_' . RFAHEYA_OPTION, 'woocommerce_product_set_stock', 'woocommerce_variation_set_stock', 'comment_post', 'wp_insert_comment', 'edit_comment', 'wp_set_comment_status', 'deleted_comment' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			delete_transient( 'rfaheya_bootstrap' );
			delete_transient( 'rfaheya_bootstrap_failed' );
			rfaheya_purge_page_cache();
			if ( ! wp_next_scheduled( 'rfaheya_warm_bootstrap' ) ) {
				wp_schedule_single_event( time() + 2, 'rfaheya_warm_bootstrap' );
			}
		}
	);
}

add_action( 'rfaheya_warm_bootstrap', 'rfaheya_bootstrap' );

add_action(
	'rest_api_init',
	function () {
		$public = '__return_true';

		// One article by its address name, in any language (the standard posts route only
		// finds the main language's under WPML).
		register_rest_route(
			'rfaheya/v1',
			'/post',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'args'                => array( 'slug' => array( 'required' => true ) ),
				'callback'            => function ( WP_REST_Request $req ) {
					$post = rfaheya_post_by_slug( (string) $req['slug'], 'post' );
					if ( ! $post || ! empty( $post->post_password ) ) {
						return rest_ensure_response( array() );
					}
					$one = rfaheya_post_slim_one( $post );
					$one['content'] = array( 'rendered' => apply_filters( 'the_content', $post->post_content ) ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals
					return rest_ensure_response( array( $one ) );
				},
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/settings',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_settings_data() ),
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/faqs',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_faqs_data() ),
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/pages',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_pages_index() ),
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/products',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_products_details() ),
			)
		);

		// Whether the shop data copy is built (no shop data or settings in it): for checking a slow start.
		register_rest_route(
			'rfaheya/v1',
			'/status',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => function () {
					$fresh    = get_transient( 'rfaheya_bootstrap' );
					$last     = get_option( 'rfaheya_bootstrap_last' );
					$status = array(
						'version'  => RFAHEYA_DATA_VERSION,
						'fresh'    => rfaheya_bootstrap_current( $fresh ) ? count( $fresh['products'] ) : 0,
						'lastCopy' => rfaheya_bootstrap_current( $last ) ? count( $last['products'] ) : 0,
						'building' => (bool) get_transient( 'rfaheya_bootstrap_building' ),
					);
					// Server details (errors, limits) only for the store's admins.
					if ( current_user_can( 'manage_options' ) ) {
						$status += array(
							'failedPause' => (bool) get_transient( 'rfaheya_bootstrap_failed' ),
							'lastBuild'   => get_option( 'rfaheya_bootstrap_status', null ),
							'lastError'   => (string) get_option( 'rfaheya_last_error', '' ),
							'cron'        => ! ( defined( 'DISABLE_WP_CRON' ) && DISABLE_WP_CRON ),
							'finishEarly' => function_exists( 'litespeed_finish_request' ) || function_exists( 'fastcgi_finish_request' ),
							'timeLimit'   => (int) ini_get( 'max_execution_time' ),
							'memory'      => (string) ini_get( 'memory_limit' ),
						);
					}
					$response = rest_ensure_response( $status );
					$response->header( 'Cache-Control', 'no-cache' );
					return $response;
				},
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/bootstrap',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => function () {
					// The storefront asks for this when the page came without the shop data.
					list( $data ) = rfaheya_bootstrap_ready();
					$response     = rest_ensure_response( $data ? $data : array( 'products' => array() ) );
					$response->header( 'Cache-Control', 'no-cache' );
					return $response;
				},
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/notes',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_note_library() ),
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/videos',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_videos() ),
			)
		);
	}
);

// ==================================================================== starter content import

add_action(
	'admin_post_rfaheya_import',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'rfaheya_import' );
		$message = rfaheya_import_content();
		wp_safe_redirect( add_query_arg( 'rfaheya-imported', rawurlencode( $message ), admin_url( 'options-general.php?page=rfaheya-store' ) ) );
		exit;
	}
);

/** Adds a file from mu-plugins/rfaheya/media to the Media Library once; returns its attachment id. */
function rfaheya_import_media( $file, $title = '' ) {
	$existing = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_rfaheya_source', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_value'  => $file, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
		)
	);
	if ( $existing ) {
		return (int) $existing[0];
	}
	$path = __DIR__ . '/rfaheya/media/' . basename( $file );
	if ( ! $file || ! file_exists( $path ) ) {
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$tmp = wp_tempnam( $file );
	copy( $path, $tmp );
	$id = media_handle_sideload(
		array(
			'name'     => basename( $file ),
			'tmp_name' => $tmp,
		),
		0,
		$title
	);
	if ( is_wp_error( $id ) ) {
		wp_delete_file( $tmp );
		return 0;
	}
	update_post_meta( $id, '_rfaheya_source', $file );
	return (int) $id;
}

function rfaheya_import_content() {
	$file = __DIR__ . '/rfaheya/content.json';
	$data = file_exists( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
	if ( ! is_array( $data ) ) {
		return 'Starter content not found: upload wp-content/mu-plugins/rfaheya/ (from the release zip) and try again.';
	}
	if ( function_exists( 'set_time_limit' ) ) {
		set_time_limit( 300 );
	}
	$count = array(
		'posts'    => 0,
		'pages'    => 0,
		'faqs'     => 0,
		'notes'    => 0,
		'families' => 0,
		'products' => 0,
	);

	// Journal articles -> Posts.
	foreach ( (array) $data['posts'] as $p ) {
		if ( get_page_by_path( $p['slug'], OBJECT, 'post' ) ) {
			continue;
		}
		$cat = term_exists( $p['category'], 'category' );
		if ( ! $cat ) {
			$cat = wp_insert_term( $p['category'], 'category' );
		}
		$id = wp_insert_post(
			array(
				'post_type'     => 'post',
				'post_status'   => 'publish',
				'post_name'     => $p['slug'],
				'post_title'    => $p['title'],
				'post_excerpt'  => $p['excerpt'],
				'post_content'  => $p['content'],
				'post_date'     => $p['date'] . ' 10:00:00',
				'post_category' => is_array( $cat ) ? array( (int) $cat['term_id'] ) : array(),
			)
		);
		if ( $id && ! is_wp_error( $id ) ) {
			$image = rfaheya_import_media( $p['image'], $p['title'] );
			if ( $image ) {
				set_post_thumbnail( $id, $image );
			}
			$count['posts']++;
		}
	}

	// Information pages -> Pages.
	foreach ( (array) $data['pages'] as $p ) {
		if ( get_page_by_path( $p['slug'] ) ) {
			continue;
		}
		$id = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_name'    => $p['slug'],
				'post_title'   => $p['title'],
				'post_excerpt' => $p['excerpt'],
				'post_content' => $p['content'],
			)
		);
		if ( $id && ! is_wp_error( $id ) ) {
			update_post_meta( $id, 'rfaheya_eyebrow', $p['eyebrow'] );
			$count['pages']++;
		}
	}

	// FAQs.
	$existing = wp_list_pluck( get_posts( array( 'post_type' => 'rfaheya_faq', 'post_status' => 'any', 'numberposts' => -1 ) ), 'post_title' );
	foreach ( (array) $data['faqs'] as $i => $f ) {
		if ( in_array( $f['q'], $existing, true ) ) {
			continue;
		}
		wp_insert_post(
			array(
				'post_type'    => 'rfaheya_faq',
				'post_status'  => 'publish',
				'post_title'   => $f['q'],
				'post_content' => $f['a'],
				'menu_order'   => $i,
			)
		);
		$count['faqs']++;
	}

	// Fragrance families -> product category descriptions and images.
	if ( taxonomy_exists( 'product_cat' ) ) {
		foreach ( (array) $data['families'] as $f ) {
			$term = get_term_by( 'slug', $f['slug'], 'product_cat' );
			if ( ! $term ) {
				$made = wp_insert_term( $f['name'], 'product_cat', array( 'slug' => $f['slug'] ) );
				$term = is_wp_error( $made ) ? null : get_term( $made['term_id'], 'product_cat' );
			}
			if ( ! $term ) {
				continue;
			}
			if ( '' === trim( $term->description ) ) {
				wp_update_term( $term->term_id, 'product_cat', array( 'description' => $f['tagline'] ) );
			}
			if ( ! get_term_meta( $term->term_id, 'thumbnail_id', true ) ) {
				$image = rfaheya_import_media( $f['image'], $f['name'] );
				if ( $image ) {
					update_term_meta( $term->term_id, 'thumbnail_id', $image );
				}
			}
			$count['families']++;
		}
	}

	// Home page texts and hero image (only fields that are still empty).
	$saved = get_option( RFAHEYA_OPTION, array() );
	$saved = is_array( $saved ) ? $saved : array();
	$home  = isset( $saved['home'] ) && is_array( $saved['home'] ) ? $saved['home'] : array();
	$h     = isset( $data['home'] ) ? $data['home'] : array();
	$fill  = function ( $key, $value ) use ( &$home ) {
		if ( empty( $home[ $key ] ) && '' !== (string) $value ) {
			$home[ $key ] = (string) $value;
		}
	};
	foreach ( array_values( (array) ( isset( $h['announcements'] ) ? $h['announcements'] : array() ) ) as $i => $line ) {
		if ( $i < 3 ) {
			$fill( 'announcement_' . ( $i + 1 ), $line );
		}
	}
	if ( isset( $h['hero'] ) ) {
		$fill( 'hero_eyebrow', $h['hero']['eyebrow'] );
		$fill( 'hero_title', $h['hero']['title'] );
		$fill( 'hero_text', $h['hero']['text'] );
		if ( empty( $home['hero_image'] ) && ! empty( $h['hero']['image'] ) ) {
			$home['hero_image'] = (string) rfaheya_import_media( $h['hero']['image'], 'Home hero' );
		}
	}
	$saved['home'] = $home;
	update_option( RFAHEYA_OPTION, $saved );

	// Product details box, filled from the attributes the CSV import created.
	if ( function_exists( 'wc_get_products' ) ) {
		$choices = rfaheya_choices();
		$to_keys = function ( $text, $group ) use ( $choices ) {
			$out = array();
			foreach ( rfaheya_list( $text ) as $label ) {
				$key = array_search( strtolower( $label ), array_map( 'strtolower', $choices[ $group ] ), true );
				if ( false === $key && isset( $choices[ $group ][ strtolower( $label ) ] ) ) {
					$key = strtolower( $label );
				}
				if ( false !== $key ) {
					$out[] = $key;
				}
			}
			return $out;
		};
		foreach ( wc_get_products( array( 'limit' => -1, 'status' => 'publish' ) ) as $product ) {
			if ( rfaheya_details( $product->get_id() ) ) {
				continue;
			}
			$g = $to_keys( $product->get_attribute( 'For' ), 'gender' );
			$p = $to_keys( $product->get_attribute( 'Presence' ), 'presence' );
			$l = $to_keys( $product->get_attribute( 'Longevity' ), 'longevity' );
			update_post_meta(
				$product->get_id(),
				'_rfaheya_details',
				rfaheya_clean_details(
					array(
						'inspired_by' => $product->get_attribute( 'Inspired By' ),
						'accords'     => $product->get_attribute( 'Accords' ),
						'notes'       => $product->get_attribute( 'Notes' ),
						'gender'      => $g ? $g[0] : '',
						'occasions'   => $to_keys( $product->get_attribute( 'Occasion' ), 'occasions' ),
						'seasons'     => $to_keys( $product->get_attribute( 'Season' ), 'seasons' ),
						'presence'    => $p ? $p[0] : '',
						'longevity'   => $l ? $l[0] : '',
					)
				)
			);
			$count['products']++;
		}
	}

	$count['notes'] = rfaheya_import_notes( $data );
	rfaheya_import_product_extras( $data );

	// WordPress's sample content would otherwise show up in the journal.
	foreach ( array( array( 'hello-world', 'post' ), array( 'sample-page', 'page' ) ) as $sample ) {
		$post = get_page_by_path( $sample[0], OBJECT, $sample[1] );
		if ( $post ) {
			wp_trash_post( $post->ID );
		}
	}

	return sprintf(
		'Imported %d articles, %d pages, %d FAQs, %d notes, %d family images and %d product detail boxes. Existing content was left as is.',
		$count['posts'],
		$count['pages'],
		$count['faqs'],
		$count['notes'],
		$count['families'],
		$count['products']
	);
}

/** Adds the starter notes (with their icons) that aren't in the library yet; returns how many. */
function rfaheya_import_notes( $data ) {
	$added = 0;
	foreach ( (array) ( isset( $data['notes'] ) ? $data['notes'] : array() ) as $n ) {
		if ( empty( $n['name'] ) || term_exists( $n['name'], 'rfaheya_note' ) ) {
			continue;
		}
		$made = wp_insert_term( $n['name'], 'rfaheya_note' );
		if ( is_wp_error( $made ) ) {
			continue;
		}
		$icon = empty( $n['icon'] ) ? 0 : rfaheya_import_media( $n['icon'], $n['name'] );
		if ( $icon ) {
			update_term_meta( $made['term_id'], 'rfaheya_icon', $icon );
		}
		$added++;
	}
	return $added;
}

/** Fills empty badge / composition / Rfaheya Standard™ values of the starter products (matched by slug). */
function rfaheya_import_product_extras( $data ) {
	foreach ( (array) ( isset( $data['products'] ) ? $data['products'] : array() ) as $extra ) {
		$post = get_page_by_path( $extra['slug'], OBJECT, 'product' );
		if ( ! $post ) {
			continue;
		}
		$d       = rfaheya_details( $post->ID );
		$changed = false;
		foreach ( array( 'badge', 'opening', 'heart', 'drydown', 'standard' ) as $key ) {
			if ( empty( $d[ $key ] ) && ! empty( $extra[ $key ] ) ) {
				$d[ $key ] = $extra[ $key ];
				$changed   = true;
			}
		}
		if ( $changed ) {
			update_post_meta( $post->ID, '_rfaheya_details', rfaheya_clean_details( $d ) );
		}
	}
}

/** One-time upgrade for sites set up with an earlier version: fill the notes library and the new product fields. */
add_action(
	'admin_init',
	function () {
		$version = (int) get_option( 'rfaheya_version', 2 );
		if ( $version >= 4 || ! current_user_can( 'manage_options' ) ) {
			return;
		}
		update_option( 'rfaheya_version', 4 );
		if ( $version < 3 ) {
			$file = __DIR__ . '/rfaheya/content.json';
			$data = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
			if ( is_array( $data ) ) {
				rfaheya_import_notes( $data );
				rfaheya_import_product_extras( $data );
			}
		}
		// The discovery size is now 5 ML: update the announcement bar wording.
		$saved = get_option( RFAHEYA_OPTION, array() );
		if ( is_array( $saved ) && isset( $saved['home'] ) && is_array( $saved['home'] ) ) {
			foreach ( array( 'announcement_1', 'announcement_2', 'announcement_3' ) as $key ) {
				if ( ! empty( $saved['home'][ $key ] ) ) {
					$saved['home'][ $key ] = preg_replace( '/\b10\s*ML\b/i', '5 ML', $saved['home'][ $key ] );
				}
			}
			update_option( RFAHEYA_OPTION, $saved );
		}
	}
);

// ==================================================================== My Account

/**
 * The storefront's account icon opens /my-account/ (routed to WordPress by
 * .htaccess). Make sure WooCommerce's My Account page exists there.
 */
add_action(
	'wp_loaded',
	function () {
		if ( ! function_exists( 'wc_get_page_id' ) ) {
			return;
		}
		$id      = wc_get_page_id( 'myaccount' );
		$page    = $id > 0 ? get_post( $id ) : null;
		$page    = $page && 'page' === $page->post_type && 'trash' !== $page->post_status ? $page : null;
		$by_slug = get_page_by_path( 'my-account' );
		$by_slug = $by_slug && 'trash' !== $by_slug->post_status ? $by_slug : null;
		// A /my-account/ page with the account shortcode is the one to use.
		if ( $by_slug && ( ! $page || $page->ID !== $by_slug->ID ) && false !== strpos( $by_slug->post_content, 'woocommerce_my_account' ) ) {
			$page = $by_slug;
			update_option( 'woocommerce_myaccount_page_id', $page->ID );
		}
		if ( ! $page ) {
			$page = $by_slug;
			if ( ! $page ) {
				$new = wp_insert_post(
					array(
						'post_type'      => 'page',
						'post_status'    => 'publish',
						'post_name'      => 'my-account',
						'post_title'     => 'My account',
						'post_content'   => '<!-- wp:shortcode -->[woocommerce_my_account]<!-- /wp:shortcode -->',
						'comment_status' => 'closed',
					)
				);
				if ( ! $new || is_wp_error( $new ) ) {
					return;
				}
				$page = get_post( $new );
			}
			update_option( 'woocommerce_myaccount_page_id', $page->ID );
		}
		$changes = array();
		if ( 'publish' !== $page->post_status ) {
			$changes['post_status'] = 'publish';
		}
		if ( 'my-account' !== $page->post_name && ! $by_slug ) {
			$changes['post_name'] = 'my-account';
		}
		if ( '' === trim( $page->post_content ) ) {
			$changes['post_content'] = '<!-- wp:shortcode -->[woocommerce_my_account]<!-- /wp:shortcode -->';
		}
		if ( $changes ) {
			wp_update_post( array( 'ID' => $page->ID ) + $changes );
		}
	}
);

/** My Account is shown in a shell that matches the storefront, whatever the WordPress theme. */
function rfaheya_is_account() {
	return function_exists( 'is_account_page' ) && is_account_page();
}

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( ! rfaheya_is_account() ) {
			return;
		}
		// The theme's own styles would fight the storefront look.
		foreach ( wp_styles()->queue as $handle ) {
			$src = isset( wp_styles()->registered[ $handle ] ) ? (string) wp_styles()->registered[ $handle ]->src : '';
			if ( false !== strpos( $src, '/wp-content/themes/' ) || in_array( $handle, array( 'global-styles', 'classic-theme-styles' ), true ) ) {
				wp_dequeue_style( $handle );
			}
		}
	},
	100
);

add_action(
	'template_redirect',
	function () {
		if ( ! rfaheya_is_account() ) {
			return;
		}
		$logo = rfaheya_logo_url();
		$own  = '' !== $logo;
		if ( ! $own ) {
			$logo = file_exists( __DIR__ . '/rfaheya/logo.svg' ) ? WPMU_PLUGIN_URL . '/rfaheya/logo.svg' : '';
		}
		$home = home_url( '/' );
		$link = function ( $path, $label ) use ( $home ) {
			echo '<a href="' . esc_url( $home . ltrim( $path, '/' ) ) . '">' . esc_html( $label ) . '</a>';
		};
		?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php if ( ! current_theme_supports( 'title-tag' ) ) : ?>
<title><?php echo esc_html( wp_get_document_title() ); ?></title>
<?php endif; ?>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<script>try{if(JSON.parse(localStorage.getItem('rfaheya.theme'))==='dark')document.documentElement.classList.add('dark')}catch(e){}</script>
<?php wp_head(); ?>
<style>
:root { --amber: #e49b2d; --amber-hover: #d08619; --on-amber: #fff; --noir: #100e0b; --ink: #1c1a17; --soft: #4a443b; --muted: #74695b; --bg: #f8f4ed; --card: #fcfaf6; --chip: #f1eadf; --line: #e9e0d2; --line-strong: #d3c6b2; --ease: cubic-bezier(.16,1,.3,1); --spring: cubic-bezier(.2,1.25,.3,1); }
:root.dark { color-scheme: dark; --ink: #f1ebe1; --soft: #d2c8b8; --muted: #a59a8b; --bg: #14120f; --card: #201c17; --chip: #29241d; --line: #332d25; --line-strong: #4b4236; }
body.rfaheya-account { margin: 0; background: var(--bg); color: var(--ink); font-family: Roboto, system-ui, sans-serif; font-size: 16px; line-height: 1.6; -webkit-font-smoothing: antialiased; }
.rfaheya-account * { box-sizing: border-box; }
@keyframes rf-rise { from { opacity: 0; transform: translateY(26px); } }
@keyframes rf-pop { from { opacity: 0; transform: translateY(18px) scale(.96); } }
@keyframes rf-glow { 50% { transform: translate(30px, -20px) scale(1.15); } }
@keyframes rf-marquee { to { transform: translateX(-50%); } }
/* Top: black announcement and header, like the storefront */
.rf-announce { background: var(--noir); color: #d8cdbb; font-size: 11px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; overflow: hidden; white-space: nowrap; }
.rf-announce div { display: inline-flex; gap: 48px; padding: 9px 24px; animation: rf-marquee 28s linear infinite; }
.rf-announce b { color: var(--amber); font-weight: 500; }
.rf-bar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px clamp(16px, 5vw, 78px); background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); }
.rf-logo img { display: block; height: 38px; width: auto; }
:root.dark .rf-logo img:not(.rf-own-logo) { filter: invert(1) brightness(.95); }
.rf-logo span { font-family: Roboto, sans-serif; font-weight: 500; font-size: 28px; letter-spacing: .04em; color: var(--ink); }
.rf-nav { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 26px; }
.rf-nav a { color: var(--ink); text-decoration: none; font-size: 12px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat; padding-bottom: 2px; transition: background-size .5s var(--ease); }
.rf-nav a:hover { background-size: 100% 1px; }
.rf-nav .rf-nav-cta { padding: 10px 18px; border-radius: 999px; background: var(--amber); color: var(--on-amber); background-image: none; }
.rf-nav .rf-nav-cta:hover { background: var(--amber-hover); }
@media (max-width: 720px) { .rf-nav a:not(.rf-nav-cta) { display: none; } }
/* Hero band: black with an amber glow */
.rf-hero { position: relative; overflow: hidden; background: var(--noir); color: #f4ede2; padding: clamp(40px, 7vw, 76px) clamp(16px, 5vw, 78px) clamp(36px, 6vw, 64px); }
.rf-hero::before, .rf-hero::after { content: ""; position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; animation: rf-glow 14s ease-in-out infinite; }
.rf-hero::before { width: 420px; height: 420px; right: -80px; top: -160px; background: rgba(228,155,45,.38); }
.rf-hero::after { width: 300px; height: 300px; left: 30%; bottom: -200px; background: rgba(228,155,45,.18); animation-duration: 18s; animation-direction: reverse; }
.rf-hero-in { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 24px; }
.rf-eyebrow { margin: 0; font-size: 12px; letter-spacing: .3em; text-transform: uppercase; color: var(--amber); animation: rf-rise .9s var(--ease) both; }
.rf-title { font-family: Roboto, sans-serif; font-weight: 500; font-size: clamp(42px, 7vw, 72px); line-height: 1; letter-spacing: -.01em; margin: 10px 0 0; animation: rf-rise 1s var(--ease) .08s both; }
.rf-title em { color: var(--amber); }
.rf-hero-sub { margin: 12px 0 0; color: #a99d8b; font-size: 16px; animation: rf-rise 1s var(--ease) .16s both; }
.rf-hero-points { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-radius: 20px; background: rgba(255,255,255,.06); border: 1px solid rgba(228,155,45,.35); animation: rf-pop .9s var(--spring) .25s both; text-decoration: none; color: inherit; }
.rf-hero-points strong { font-family: Roboto, sans-serif; font-weight: 500; font-size: 40px; font-weight: 400; line-height: 1; color: var(--amber); }
.rf-hero-points span { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #d8cdbb; line-height: 1.4; }
.rf-main { max-width: 1100px; margin: 0 auto; padding: 40px 16px 96px; }
.rf-main.rf-main-auth { padding-top: 48px; }
/* WooCommerce account */
.rfaheya-account .woocommerce { font-size: 16px; }
.rfaheya-account .woocommerce::after { content: ""; display: table; clear: both; }
.rfaheya-account .woocommerce a { color: var(--ink); text-underline-offset: 4px; }
.rfaheya-account .woocommerce h2, .rfaheya-account .woocommerce h3 { font-family: Roboto, sans-serif; font-weight: 500; font-size: 30px; line-height: 1.1; }
.rfaheya-account .woocommerce .button, .rfaheya-account .woocommerce button.button, .rfaheya-account .woocommerce input.button, .rfaheya-account .woocommerce a.button { position: relative; overflow: hidden; isolation: isolate; display: inline-flex; align-items: center; justify-content: center; background: var(--amber); color: var(--on-amber); border: 0; border-radius: 999px; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; font-weight: 500; padding: 14px 24px; cursor: pointer; text-decoration: none; transition: background .3s, transform .15s; }
.rfaheya-account .woocommerce .button::after, .rf-primary::after, .rf-nav-cta::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,.4) 50%, transparent 75%); transform: translateX(-130%); pointer-events: none; }
.rfaheya-account .woocommerce .button:hover::after, .rf-primary:hover::after, .rf-nav-cta:hover::after { transform: translateX(130%); transition: transform .9s var(--ease); }
.rfaheya-account .woocommerce .button:hover { background: var(--amber-hover); color: var(--on-amber); }
.rfaheya-account .woocommerce .button:active, .rf-primary:active { transform: scale(.97); }
.rfaheya-account .woocommerce input.input-text, .rfaheya-account .woocommerce select, .rfaheya-account .woocommerce textarea { width: 100%; padding: 13px 16px; border: 1px solid var(--line-strong); border-radius: 14px; background: var(--card); color: var(--ink); font: inherit; transition: border-color .3s, box-shadow .3s; }
.rfaheya-account .woocommerce input.input-text:focus, .rfaheya-account .woocommerce select:focus, .rfaheya-account .woocommerce textarea:focus { outline: none; border-color: var(--amber); box-shadow: 0 0 0 4px rgba(228,155,45,.18); }
.rfaheya-account .woocommerce form .form-row { margin: 0 0 16px; }
.rfaheya-account .woocommerce form .form-row label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--soft); }
.rfaheya-account .woocommerce fieldset { border: 1px solid var(--line); border-radius: 18px; padding: 18px 20px; margin: 24px 0; }
.rfaheya-account .woocommerce form.login, .rfaheya-account .woocommerce form.register, .rfaheya-account .woocommerce form.lost_reset_password { border: 1px solid var(--line); border-radius: 22px; padding: 28px; background: var(--card); }
.rfaheya-account .woocommerce .u-columns { display: grid; gap: 32px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.rfaheya-account .woocommerce .u-columns .col-1, .rfaheya-account .woocommerce .u-columns .col-2 { width: auto; float: none; }
/* Side menu: a card with an amber pill on the current page */
.rfaheya-account .woocommerce-MyAccount-navigation { animation: rf-rise .9s var(--ease) .1s both; }
.rfaheya-account .woocommerce-MyAccount-navigation ul { list-style: none; margin: 0; padding: 8px; border: 1px solid var(--line); border-radius: 22px; background: var(--card); }
.rfaheya-account .woocommerce-MyAccount-navigation li a { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--soft); transition: background .35s var(--ease), color .35s, padding .35s var(--ease); }
.rfaheya-account .woocommerce-MyAccount-navigation li a::after { content: "→"; opacity: 0; transform: translateX(-6px); transition: opacity .3s, transform .4s var(--ease); }
.rfaheya-account .woocommerce-MyAccount-navigation li a:hover { background: var(--chip); color: var(--ink); padding-left: 20px; }
.rfaheya-account .woocommerce-MyAccount-navigation li a:hover::after { opacity: 1; transform: none; }
.rfaheya-account .woocommerce-MyAccount-navigation li.is-active a { background: var(--amber); color: var(--on-amber); }
.rfaheya-account .woocommerce-MyAccount-navigation li.is-active a::after { opacity: 1; transform: none; }
.rfaheya-account .woocommerce-MyAccount-navigation-link--customer-logout a { color: var(--muted); }
.rfaheya-account .woocommerce-MyAccount-content { animation: rf-rise 1s var(--ease) .2s both; }
.rfaheya-account .woocommerce-MyAccount-content > p:first-child { font-size: 17px; color: var(--soft); }
.rfaheya-account .woocommerce table.shop_table { width: 100%; border-collapse: separate; border-spacing: 0; background: var(--card); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; }
.rfaheya-account .woocommerce table.shop_table th { font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); background: var(--chip); }
.rfaheya-account .woocommerce table.shop_table th, .rfaheya-account .woocommerce table.shop_table td { padding: 14px 16px; border-bottom: 1px solid var(--line); text-align: left; }
.rfaheya-account .woocommerce table.shop_table tbody tr { transition: background .3s; }
.rfaheya-account .woocommerce table.shop_table tbody tr:hover { background: color-mix(in srgb, var(--amber) 8%, transparent); }
.rfaheya-account .woocommerce table.shop_table tr:last-child td { border-bottom: 0; }
.rfaheya-account .woocommerce table.shop_table .button { padding: 9px 16px; font-size: 11px; margin: 2px 4px 2px 0; }
.rfaheya-account mark { background: color-mix(in srgb, var(--amber) 22%, transparent); color: var(--ink); padding: 1px 8px; border-radius: 999px; }
.rfaheya-account .woocommerce-Addresses { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.rfaheya-account .woocommerce-Addresses .woocommerce-Address { width: auto; float: none; padding: 22px; border: 1px solid var(--line); border-radius: 22px; background: var(--card); transition: transform .5s var(--ease), box-shadow .5s; }
.rfaheya-account .woocommerce-Addresses .woocommerce-Address:hover { transform: translateY(-4px); box-shadow: 0 24px 50px -30px rgba(16,14,11,.4); }
.rfaheya-account .woocommerce-Address-title { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.rfaheya-account address { font-style: normal; color: var(--soft); }
.rfaheya-account .woocommerce-message, .rfaheya-account .woocommerce-info, .rfaheya-account .woocommerce-error { list-style: none; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 24px; padding: 14px 18px; border-radius: 18px; background: var(--chip); border: 0; border-left: 4px solid var(--amber); animation: rf-pop .7s var(--spring) both; }
.rfaheya-account .woocommerce-error { border-left-color: #c2410c; }
.rfaheya-account .woocommerce-message::before, .rfaheya-account .woocommerce-info::before, .rfaheya-account .woocommerce-error::before { display: none; }
@media (min-width: 768px) { .rfaheya-account .woocommerce-MyAccount-navigation { float: left; width: 26%; position: sticky; top: 92px; } .rfaheya-account .woocommerce-MyAccount-content { float: right; width: 69%; } }
/* Points card on the dashboard */
.rfaheya-account .rf-points { position: relative; overflow: hidden; margin: 28px 0; padding: 26px 28px; border-radius: 24px; background: var(--noir); color: #f4ede2; animation: rf-pop .9s var(--spring) .3s both; }
.rfaheya-account .rf-points::before { content: ""; position: absolute; width: 280px; height: 280px; right: -90px; top: -120px; border-radius: 50%; background: rgba(228,155,45,.35); filter: blur(50px); animation: rf-glow 12s ease-in-out infinite; }
.rfaheya-account .rf-points > * { position: relative; }
.rf-points-label { margin: 0; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--amber); }
.rf-points-total { margin: 8px 0 0; font-family: Roboto, sans-serif; font-weight: 500; font-size: 56px; line-height: 1; color: var(--amber); }
.rf-points-total span { font-family: Roboto, sans-serif; font-size: 15px; color: #a99d8b; }
.rf-points-how { margin: 12px 0 0; color: #d8cdbb; font-size: 14px; }
.rf-points-log { margin-top: 16px; width: 100%; font-size: 13px; border-collapse: collapse; }
.rf-points-log td { padding: 8px 0; border-top: 1px solid rgba(255,255,255,.08); color: #d8cdbb; }
.rf-points-log td:first-child { color: #a99d8b; }
.rf-points-log td:last-child { text-align: right; font-weight: 600; color: var(--amber); }
/* Sign in / register */
.rf-foot a { color: var(--amber); text-underline-offset: 4px; }
.rf-auth { display: grid; gap: 32px; align-items: stretch; max-width: 1040px; margin: 0 auto; }
@media (min-width: 900px) { .rf-auth { grid-template-columns: 1fr 460px; } }
.rf-auth-art { display: none; border-radius: 28px; background-size: cover; background-position: 70% center; min-height: 560px; position: relative; overflow: hidden; animation: rf-pop 1.1s var(--ease) both; }
.rf-auth-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(16,14,11,.75)); }
.rf-auth-art p { position: absolute; left: 32px; bottom: 26px; z-index: 1; margin: 0; color: #fff; font-family: Roboto, sans-serif; font-weight: 500; font-size: 44px; line-height: 1.05; }
.rf-auth-art p em { color: var(--amber); }
@media (min-width: 900px) { .rf-auth-art { display: block; } }
.rf-auth-card { background: var(--card); border: 1px solid var(--line); border-radius: 28px; padding: 28px clamp(20px, 4vw, 40px) 32px; box-shadow: 0 30px 70px -40px rgba(16,14,11,.45); animation: rf-pop .9s var(--spring) .1s both; }
.rf-tabs { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 999px; background: var(--chip); }
.rf-tabs a { text-align: center; padding: 10px 8px; border-radius: 999px; font-size: 13px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--soft); text-decoration: none; transition: background .4s var(--ease), color .3s; }
.rf-tabs a[aria-selected="true"] { background: var(--noir); color: #fff; }
:root.dark .rf-tabs a[aria-selected="true"] { background: var(--amber); color: var(--on-amber); }
.rf-auth-title { font-family: Roboto, sans-serif; font-weight: 500; font-size: 40px; line-height: 1.05; margin: 26px 0 6px; }
.rf-auth-sub { margin: 0 0 22px; color: var(--muted); font-size: 15px; }
.rf-social { display: grid; gap: 10px; }
.rf-social-btn { display: flex; align-items: center; justify-content: center; gap: 12px; height: 50px; border: 1px solid var(--line-strong); border-radius: 999px; background: var(--card); color: var(--ink); text-decoration: none; font-size: 15px; font-weight: 500; transition: border-color .3s, box-shadow .3s, transform .4s var(--ease); }
.rf-social-btn:hover { border-color: var(--amber); box-shadow: 0 10px 24px -14px rgba(16,14,11,.4); transform: translateY(-2px); }
.rf-or { display: flex; align-items: center; gap: 14px; margin: 20px 0; color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: .14em; }
.rf-or::before, .rf-or::after { content: ""; flex: 1; height: 1px; background: var(--line); }
.rf-form { display: grid; gap: 14px; }
.rf-form label { display: grid; gap: 6px; font-size: 13px; font-weight: 500; color: var(--soft); }
.rf-form input[type=text], .rf-form input[type=email], .rf-form input[type=tel], .rf-form input[type=password] { height: 50px; width: 100%; padding: 0 16px; border: 1px solid var(--line-strong); border-radius: 999px; background: var(--card); font: inherit; font-size: 15px; color: var(--ink); transition: border-color .3s, box-shadow .3s; }
.rf-form input:focus { outline: none; border-color: var(--amber); box-shadow: 0 0 0 4px rgba(228,155,45,.18); }
.rf-row-between { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 14px; }
.rf-row-between a { color: var(--ink); text-underline-offset: 4px; }
.rf-form .rf-check { display: inline-flex; align-items: center; gap: 8px; font-weight: 400; }
.rf-form .rf-check input { accent-color: var(--amber); }
.rf-primary { position: relative; overflow: hidden; isolation: isolate; height: 54px; border: 0; border-radius: 999px; background: var(--amber); color: var(--on-amber); font: inherit; font-size: 13px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; margin-top: 4px; transition: background .3s, transform .15s; }
.rf-primary:hover { background: var(--amber-hover); }
.rf-switch { margin: 4px 0 0; text-align: center; font-size: 14px; color: var(--muted); }
.rf-switch a { color: var(--ink); font-weight: 500; text-underline-offset: 4px; }
.rf-foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding: 28px clamp(16px, 5vw, 78px); font-size: 13px; color: #a99d8b; background: var(--noir); }
.rf-foot .rf-foot-logo { font-family: Roboto, sans-serif; font-weight: 500; font-size: 22px; letter-spacing: .06em; color: #f4ede2; }
@media (prefers-reduced-motion: reduce) { .rfaheya-account *, .rfaheya-account *::before, .rfaheya-account *::after { animation-duration: .01ms !important; animation-delay: 0ms !important; transition-duration: .01ms !important; } }
</style>
</head>
<body <?php body_class( 'rfaheya-account' ); ?>>
<?php wp_body_open(); ?>
<div class="rf-announce" aria-hidden="true"><div>
	<?php for ( $i = 0; $i < 2; $i++ ) : ?>
		<span>Free shipping in Cairo &amp; Alexandria over <b>1,200 EGP</b></span><span>Earn <b>points</b> on every order</span><span>Try any scent in <b>5 ML</b> first</span><span>Zero risk guarantee</span>
	<?php endfor; ?>
</div></div>
<header class="rf-bar">
	<a class="rf-logo" href="<?php echo esc_url( $home ); ?>">
		<?php if ( $logo ) : ?>
			<img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"<?php echo $own ? ' class="rf-own-logo"' : ' width="140" height="44"'; ?>>
		<?php else : ?>
			<span>RFAHEYA</span>
		<?php endif; ?>
	</a>
	<nav class="rf-nav" aria-label="Store">
		<?php
		$link( 'shop', 'Shop' );
		$link( 'finder', 'Rfaheya Finder' );
		$link( 'journal', 'Journal' );
		$link( 'contact', 'Contact' );
		?>
		<a class="rf-nav-cta" href="<?php echo esc_url( $home ); ?>">Back to the store</a>
	</nav>
</header>
<?php if ( ! is_user_logged_in() && ! ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'lost-password' ) ) ) : ?>
	<main class="rf-main rf-main-auth">
		<?php rfaheya_auth_page(); ?>
	</main>
<?php else : ?>
	<?php
	$user      = wp_get_current_user();
	$first     = $user->exists() ? ( $user->first_name ? $user->first_name : $user->display_name ) : '';
	$endpoint  = function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url();
	$loyalty   = function_exists( 'rfaheya_loyalty' ) ? rfaheya_loyalty() : array( 'enabled' => false );
	$my_points = $user->exists() && $loyalty['enabled'] ? rfaheya_points( $user->ID ) : null;
	?>
	<section class="rf-hero">
		<div class="rf-hero-in">
			<div>
				<p class="rf-eyebrow">My account</p>
				<?php if ( $endpoint || ! $first ) : ?>
					<h1 class="rf-title"><?php echo esc_html( get_the_title() ); ?></h1>
				<?php else : ?>
					<h1 class="rf-title">Hello, <em><?php echo esc_html( $first ); ?></em>.</h1>
					<p class="rf-hero-sub">Your orders, addresses and points — all in one place.</p>
				<?php endif; ?>
			</div>
			<?php if ( null !== $my_points ) : ?>
				<a class="rf-hero-points" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>">
					<strong data-count="<?php echo esc_attr( $my_points ); ?>"><?php echo esc_html( number_format_i18n( $my_points ) ); ?></strong>
					<span>Rfaheya<br>points</span>
				</a>
			<?php endif; ?>
		</div>
	</section>
	<main class="rf-main">
		<?php
		while ( have_posts() ) {
			the_post();
			the_content();
		}
		?>
	</main>
<?php endif; ?>
<footer class="rf-foot"><span class="rf-foot-logo">RFAHEYA</span><span>&copy; <?php echo esc_html( gmdate( 'Y' ) . ' ' . get_bloginfo( 'name' ) ); ?> · <a href="<?php echo esc_url( $home ); ?>">Back to the store</a></span></footer>
<script>
(function () {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	document.querySelectorAll('[data-count]').forEach(function (el) {
		var end = +el.getAttribute('data-count'), t0 = performance.now(), fmt = new Intl.NumberFormat();
		if (!end) return;
		(function step(t) {
			var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
			el.textContent = fmt.format(Math.round(end * e));
			if (k < 1) requestAnimationFrame(step);
		})(t0);
	});
})();
</script>
<?php wp_footer(); ?>
</body>
</html>
		<?php
		exit;
	},
	99
);

// ==================================================================== sign in / register

// Customers create their own password; the username is generated from the email.
add_filter( 'pre_option_woocommerce_enable_myaccount_registration', fn() => 'yes' );
add_filter( 'pre_option_woocommerce_registration_generate_password', fn() => 'no' );
add_filter( 'pre_option_woocommerce_registration_generate_username', fn() => 'yes' );

/** Register: full name and WhatsApp number are required. */
add_filter(
	'woocommerce_registration_errors',
	function ( $errors ) {
		// Only the register form sends these fields; other ways of creating a customer
		// (an account made at checkout) carry their own name and phone.
		if ( ! empty( $GLOBALS['rfaheya_account_register'] ) || ( ! isset( $_POST['rf_full_name'] ) && ! isset( $_POST['rf_phone'] ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return $errors;
		}
		// WooCommerce verified the register nonce before this filter runs.
		$name  = isset( $_POST['rf_full_name'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['rf_full_name'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$phone = isset( $_POST['rf_phone'] ) ? preg_replace( '/[^\d+]/', '', sanitize_text_field( wp_unslash( $_POST['rf_phone'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( '' === $name ) {
			$errors->add( 'rf_full_name', 'Please enter your full name.' );
		}
		if ( strlen( preg_replace( '/\D/', '', $phone ) ) < 10 ) {
			$errors->add( 'rf_phone', 'Please enter your WhatsApp number.' );
		}
		return $errors;
	}
);

/** Saves the name (also as billing name) and the WhatsApp number (billing phone). */
function rfaheya_save_customer_name( $user_id, $full_name, $phone = '' ) {
	$parts = preg_split( '/\s+/', trim( $full_name ), 2 );
	$first = isset( $parts[0] ) ? $parts[0] : '';
	$last  = isset( $parts[1] ) ? $parts[1] : '';
	wp_update_user(
		array(
			'ID'           => $user_id,
			'first_name'   => $first,
			'last_name'    => $last,
			'display_name' => trim( $full_name ) ? trim( $full_name ) : $first,
		)
	);
	update_user_meta( $user_id, 'billing_first_name', $first );
	update_user_meta( $user_id, 'billing_last_name', $last );
	if ( $phone ) {
		update_user_meta( $user_id, 'billing_phone', $phone );
		update_user_meta( $user_id, 'rfaheya_whatsapp', $phone );
	}
}

add_action(
	'woocommerce_created_customer',
	function ( $user_id ) {
		$name  = isset( $_POST['rf_full_name'] ) ? sanitize_text_field( wp_unslash( $_POST['rf_full_name'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$phone = isset( $_POST['rf_phone'] ) ? preg_replace( '/[^\d+]/', '', sanitize_text_field( wp_unslash( $_POST['rf_phone'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( $name || $phone ) {
			rfaheya_save_customer_name( $user_id, $name, $phone );
		}
	}
);

/** Social sign-in providers that have their keys filled in (Settings → Rfaheya Store → Sign in). */
function rfaheya_oauth_providers() {
	$o   = rfaheya_options()['login'];
	$out = array();
	if ( $o['google_client_id'] && $o['google_client_secret'] ) {
		$out['google'] = array(
			'label'  => 'Google',
			'id'     => $o['google_client_id'],
			'secret' => $o['google_client_secret'],
		);
	}
	if ( $o['facebook_app_id'] && $o['facebook_app_secret'] ) {
		$out['facebook'] = array(
			'label'  => 'Facebook',
			'id'     => $o['facebook_app_id'],
			'secret' => $o['facebook_app_secret'],
		);
	}
	return $out;
}

/** The address Google / Facebook send customers back to (add it in their developer consoles). */
function rfaheya_oauth_redirect_uri( $provider ) {
	return add_query_arg( 'rfaheya_oauth', $provider, home_url( '/my-account/' ) );
}

/** Ends a social sign-in attempt with a message on the sign-in page. */
function rfaheya_oauth_fail( $message ) {
	// The storefront's account page shows the message.
	wp_safe_redirect( add_query_arg( 'error', rawurlencode( $message ), home_url( '/account' ) ) );
	exit;
}

add_action(
	'template_redirect',
	function () {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- OAuth uses its own single-use state.
		$start    = isset( $_GET['rfaheya_login'] ) ? sanitize_key( wp_unslash( $_GET['rfaheya_login'] ) ) : '';
		$callback = isset( $_GET['rfaheya_oauth'] ) ? sanitize_key( wp_unslash( $_GET['rfaheya_oauth'] ) ) : '';
		if ( ! $start && ! $callback ) {
			return;
		}
		$providers = rfaheya_oauth_providers();
		$name      = $start ? $start : $callback;
		if ( ! isset( $providers[ $name ] ) ) {
			rfaheya_oauth_fail( 'This sign-in option is not available.' );
		}
		$p        = $providers[ $name ];
		$redirect = rfaheya_oauth_redirect_uri( $name );

		// 1) Send the customer to Google / Facebook.
		if ( $start ) {
			$state = wp_generate_password( 32, false );
			set_transient( 'rfaheya_oauth_' . $state, $name, 10 * MINUTE_IN_SECONDS );
			// The state is also kept in this browser, so a sign-in link started elsewhere can't sign it in.
			setcookie( 'rfaheya_oauth_state', $state, array( 'expires' => time() + 10 * MINUTE_IN_SECONDS, 'path' => COOKIEPATH ? COOKIEPATH : '/', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax' ) );
			$url = 'google' === $name
				? add_query_arg(
					array(
						'client_id'     => $p['id'],
						'redirect_uri'  => rawurlencode( $redirect ),
						'response_type' => 'code',
						'scope'         => rawurlencode( 'openid email profile' ),
						'state'         => $state,
						'prompt'        => 'select_account',
					),
					'https://accounts.google.com/o/oauth2/v2/auth'
				)
				: add_query_arg(
					array(
						'client_id'    => $p['id'],
						'redirect_uri' => rawurlencode( $redirect ),
						'state'        => $state,
						'scope'        => 'email,public_profile',
					),
					'https://www.facebook.com/v19.0/dialog/oauth'
				);
			wp_redirect( $url ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- external provider
			exit;
		}

		// 2) Back from the provider.
		$state = isset( $_GET['state'] ) ? sanitize_text_field( wp_unslash( $_GET['state'] ) ) : '';
		$code  = isset( $_GET['code'] ) ? sanitize_text_field( wp_unslash( $_GET['code'] ) ) : '';
		// phpcs:enable
		$mine = isset( $_COOKIE['rfaheya_oauth_state'] ) ? sanitize_text_field( wp_unslash( $_COOKIE['rfaheya_oauth_state'] ) ) : '';
		if ( ! $state || ! $mine || ! hash_equals( $mine, $state ) || get_transient( 'rfaheya_oauth_' . $state ) !== $name ) {
			rfaheya_oauth_fail( 'Sign-in expired. Please try again.' );
		}
		delete_transient( 'rfaheya_oauth_' . $state );
		setcookie( 'rfaheya_oauth_state', '', array( 'expires' => time() - 3600, 'path' => COOKIEPATH ? COOKIEPATH : '/', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax' ) );
		if ( ! $code ) {
			rfaheya_oauth_fail( 'Sign-in was cancelled.' );
		}

		$email   = '';
		$profile = array();
		if ( 'google' === $name ) {
			$token = wp_remote_post(
				'https://oauth2.googleapis.com/token',
				array(
					'timeout' => 15,
					'body'    => array(
						'code'          => $code,
						'client_id'     => $p['id'],
						'client_secret' => $p['secret'],
						'redirect_uri'  => $redirect,
						'grant_type'    => 'authorization_code',
					),
				)
			);
			$token = json_decode( (string) wp_remote_retrieve_body( $token ), true );
			if ( empty( $token['access_token'] ) ) {
				rfaheya_oauth_fail( 'Google sign-in failed. Please try again.' );
			}
			$info = json_decode( (string) wp_remote_retrieve_body( wp_remote_get( 'https://openidconnect.googleapis.com/v1/userinfo', array( 'timeout' => 15, 'headers' => array( 'Authorization' => 'Bearer ' . $token['access_token'] ) ) ) ), true );
			if ( empty( $info['email'] ) || empty( $info['email_verified'] ) ) {
				rfaheya_oauth_fail( 'Your Google account has no verified email.' );
			}
			$email   = $info['email'];
			$profile = array(
				'name' => isset( $info['name'] ) ? $info['name'] : '',
				'id'   => isset( $info['sub'] ) ? $info['sub'] : '',
			);
		} else {
			$token = json_decode(
				(string) wp_remote_retrieve_body(
					wp_remote_get(
						add_query_arg(
							array(
								'client_id'     => $p['id'],
								'client_secret' => $p['secret'],
								'redirect_uri'  => rawurlencode( $redirect ),
								'code'          => rawurlencode( $code ),
							),
							'https://graph.facebook.com/v19.0/oauth/access_token'
						),
						array( 'timeout' => 15 )
					)
				),
				true
			);
			if ( empty( $token['access_token'] ) ) {
				rfaheya_oauth_fail( 'Facebook sign-in failed. Please try again.' );
			}
			$info = json_decode( (string) wp_remote_retrieve_body( wp_remote_get( add_query_arg( array( 'fields' => 'id,name,email', 'access_token' => rawurlencode( $token['access_token'] ) ), 'https://graph.facebook.com/v19.0/me' ), array( 'timeout' => 15 ) ) ), true );
			if ( empty( $info['email'] ) ) {
				rfaheya_oauth_fail( 'Your Facebook account did not share an email. Please create an account with your email instead.' );
			}
			$email   = $info['email'];
			$profile = array(
				'name' => isset( $info['name'] ) ? $info['name'] : '',
				'id'   => isset( $info['id'] ) ? $info['id'] : '',
			);
		}

		$email = sanitize_email( $email );
		$user  = get_user_by( 'email', $email );
		if ( $user && ( user_can( $user, 'edit_posts' ) || user_can( $user, 'manage_woocommerce' ) ) ) {
			// Staff accounts sign in with their password only.
			rfaheya_oauth_fail( 'Please sign in to this account with your password.' );
		}
		if ( $user ) {
			$linked = (string) get_user_meta( $user->ID, 'rfaheya_' . $name . '_id', true );
			if ( '' !== $linked && ! hash_equals( $linked, (string) $profile['id'] ) ) {
				rfaheya_oauth_fail( 'This email belongs to another account. Please sign in with your password.' );
			}
			// Facebook doesn't promise the email was confirmed: an existing account is joined only once it was linked before.
			if ( 'facebook' === $name && '' === $linked ) {
				rfaheya_oauth_fail( 'An account with this email already exists. Please sign in with your email and password.' );
			}
		}
		if ( ! $user ) {
			$base     = sanitize_user( current( explode( '@', $email ) ), true );
			$username = $base ? $base : 'customer';
			for ( $i = 1; username_exists( $username ); $i++ ) {
				$username = $base . $i;
			}
			$id = wp_insert_user(
				array(
					'user_login' => $username,
					'user_email' => $email,
					'user_pass'  => wp_generate_password( 24 ),
					'role'       => get_role( 'customer' ) ? 'customer' : 'subscriber',
				)
			);
			if ( is_wp_error( $id ) ) {
				rfaheya_oauth_fail( 'We could not create your account. Please try again.' );
			}
			rfaheya_save_customer_name( $id, $profile['name'] );
			$user = get_user_by( 'id', $id );
		}
		update_user_meta( $user->ID, 'rfaheya_' . $name . '_id', sanitize_text_field( $profile['id'] ) );
		wp_set_current_user( $user->ID );
		wp_set_auth_cookie( $user->ID, true );
		do_action( 'wp_login', $user->user_login, $user ); // phpcs:ignore WordPress.NamingConventions.PrefixAllThemeHooks.NonPrefixedHooknameFound -- core hook
		wp_safe_redirect( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) );
		exit;
	},
	5
);

/** The signed-out My Account page: sign in / create account, with Google and Facebook. */
function rfaheya_auth_page() {
	// phpcs:ignore WordPress.Security.NonceVerification -- only picks the tab to show.
	$register  = isset( $_GET['action'] ) && 'register' === $_GET['action'] || isset( $_POST['register'] );
	$providers = rfaheya_oauth_providers();
	$base      = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' );
	$old       = function ( $key ) {
		return isset( $_POST[ $key ] ) ? esc_attr( sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- refills the form after an error
	};
	$icons     = array(
		'google'   => '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
		'facebook' => '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>',
	);
	$image     = file_exists( __DIR__ . '/rfaheya/media/hero.webp' ) ? WPMU_PLUGIN_URL . '/rfaheya/media/hero.webp' : '';
	?>
	<div class="rf-auth">
		<?php if ( $image ) : ?>
			<div class="rf-auth-art" style="background-image:url('<?php echo esc_url( $image ); ?>')"><p>Speak <em>your scent.</em></p></div>
		<?php endif; ?>
		<div class="rf-auth-card">
			<div class="rf-tabs" role="tablist">
				<a role="tab" aria-selected="<?php echo $register ? 'false' : 'true'; ?>" href="<?php echo esc_url( $base ); ?>">Sign in</a>
				<a role="tab" aria-selected="<?php echo $register ? 'true' : 'false'; ?>" href="<?php echo esc_url( add_query_arg( 'action', 'register', $base ) ); ?>">Create account</a>
			</div>
			<h1 class="rf-auth-title"><?php echo $register ? 'Create your account.' : 'Welcome back.'; ?></h1>
			<p class="rf-auth-sub"><?php echo $register ? 'Track orders, save your favourites and check out faster.' : 'Sign in to see your orders and saved details.'; ?></p>
			<?php
			if ( function_exists( 'wc_print_notices' ) ) {
				wc_print_notices();
			}
			?>
			<?php if ( $providers ) : ?>
				<div class="rf-social">
					<?php foreach ( $providers as $key => $p ) : ?>
						<a class="rf-social-btn" href="<?php echo esc_url( add_query_arg( 'rfaheya_login', $key, $base ) ); ?>"><?php echo $icons[ $key ]; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG ?><span>Continue with <?php echo esc_html( $p['label'] ); ?></span></a>
					<?php endforeach; ?>
				</div>
				<p class="rf-or"><span>or</span></p>
			<?php endif; ?>

			<?php if ( $register ) : ?>
				<form method="post" class="rf-form" novalidate>
					<label>Full name<input type="text" name="rf_full_name" autocomplete="name" required value="<?php echo $old( 'rf_full_name' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in $old ?>"></label>
					<label>WhatsApp number<input type="tel" name="rf_phone" autocomplete="tel" inputmode="tel" placeholder="01x xxxx xxxx" required value="<?php echo $old( 'rf_phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"></label>
					<label>Email<input type="email" name="email" autocomplete="email" required value="<?php echo $old( 'email' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"></label>
					<label>Password<input type="password" name="password" autocomplete="new-password" minlength="6" required></label>
					<?php do_action( 'woocommerce_register_form' ); ?>
					<?php wp_nonce_field( 'woocommerce-register', 'woocommerce-register-nonce' ); ?>
					<button type="submit" name="register" value="Register" class="rf-primary">Create account</button>
					<p class="rf-switch">Already have an account? <a href="<?php echo esc_url( $base ); ?>">Sign in</a></p>
				</form>
			<?php else : ?>
				<form method="post" class="rf-form" novalidate>
					<label>Email<input type="text" name="username" autocomplete="username" required value="<?php echo $old( 'username' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"></label>
					<label>Password<input type="password" name="password" autocomplete="current-password" required></label>
					<div class="rf-row-between">
						<label class="rf-check"><input type="checkbox" name="rememberme" value="forever" checked> Remember me</label>
						<a href="<?php echo esc_url( function_exists( 'wc_lostpassword_url' ) ? wc_lostpassword_url() : wp_lostpassword_url() ); ?>">Forgot password?</a>
					</div>
					<?php do_action( 'woocommerce_login_form' ); ?>
					<?php wp_nonce_field( 'woocommerce-login', 'woocommerce-login-nonce' ); ?>
					<input type="hidden" name="redirect" value="<?php echo esc_url( $base ); ?>">
					<button type="submit" name="login" value="Log in" class="rf-primary">Sign in</button>
					<p class="rf-switch">New to Rfaheya? <a href="<?php echo esc_url( add_query_arg( 'action', 'register', $base ) ); ?>">Create an account</a></p>
				</form>
			<?php endif; ?>
		</div>
	</div>
	<?php
}

// ==================================================================== WooCommerce

/** "a 30 ML" / "30-ml" / "30ml" -> "30ml" */
/**
 * A size as plain text: sizes saved by translated (WPML) products come URL-encoded
 * (“100-%d9%85%d9%84”) and in Arabic (“50 مل”); both read as “100 ml”.
 */
function rfaheya_size_normal( $size ) {
	$size = rawurldecode( (string) $size );
	$size = str_replace( array( 'مللي', 'ملي', 'ملل', 'مل' ), 'ml', $size );
	$size = strtr( $size, array( '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9' ) );
	return trim( preg_replace( '/(\d)\s*-\s*(ml)\b/i', '$1 $2', $size ) );
}

function rfaheya_size_key( $size ) {
	return strtolower( preg_replace( '/[\s_-]+/', '', rfaheya_size_normal( $size ) ) );
}

/** How a size is shown in the dashboard: “100 ML”. */
function rfaheya_size_label( $size ) {
	$size = rfaheya_size_normal( $size );
	if ( preg_match( '/^(\d+(?:\.\d+)?)\s*ml$/i', $size, $m ) ) {
		return $m[1] . ' ML';
	}
	return ucwords( str_replace( '-', ' ', $size ) );
}

/**
 * Bundle: the more full bottles in the cart, the bigger the discount (Settings → Rfaheya Store →
 * Orders & offers → Bundle: “bottles = %” steps). Samples (10 ML or less), the gift box and the
 * gift wrap don't count. Applied as a negative fee, so it shows in the cart, checkout and order.
 */
/** The steps as array( array( bottles, percent ) ), fewest bottles first. */
function rfaheya_bundle_tiers() {
	$tiers = array();
	foreach ( preg_split( '/\R/', (string) rfaheya_options()['bundle']['tiers'] ) as $line ) {
		if ( preg_match( '/^\s*(\d+)\s*[=:]\s*(\d+(?:\.\d+)?)\s*%?\s*$/', $line, $m ) && (int) $m[1] >= 1 && (float) $m[2] > 0 ) {
			$tiers[ (int) $m[1] ] = min( 100, (float) $m[2] );
		}
	}
	ksort( $tiers );
	$out = array();
	foreach ( $tiers as $count => $percent ) {
		$out[] = array( $count, $percent );
	}
	return $out;
}

/** A cart line's size, e.g. “50 ML” (from the variation's attribute or the product's). */
function rfaheya_cart_item_size( $item ) {
	foreach ( (array) ( $item['variation'] ?? array() ) as $attr => $value ) {
		if ( preg_match( '/^attribute_(pa_)?size$/i', $attr ) ) {
			return (string) $value;
		}
	}
	$product = $item['data'] ?? null;
	return $product ? (string) ( $product->get_attribute( 'pa_size' ) ? $product->get_attribute( 'pa_size' ) : $product->get_attribute( 'Size' ) ) : '';
}

/** The bundle discount for a cart (0 when the bundle is off or below the first step). */
function rfaheya_bundle_discount( $cart ) {
	if ( 'no' === rfaheya_options()['bundle']['enabled'] ) {
		return 0;
	}
	$tiers = rfaheya_bundle_tiers();
	if ( ! $tiers ) {
		return 0;
	}
	$bottles = 0;
	$amount  = 0.0;
	foreach ( $cart->get_cart() as $item ) {
		if ( ! empty( $item['rfaheya_gift'] ) || ( function_exists( 'rfaheya_on_sale_only' ) && rfaheya_on_sale_only( $item['data'] ?? null ) ) ) {
			continue; // a free gift from an offer, or a bottle on a sale that takes no other discount
		}
		// A full bottle: a size in ML above 10 (5 / 10 ML samples, boxes and wraps are not).
		if ( ! preg_match( '/(\d+(?:\.\d+)?)\s*-?\s*ml/i', rfaheya_size_normal( rfaheya_cart_item_size( $item ) ), $m ) || (float) $m[1] <= 10 ) {
			continue;
		}
		$bottles += (int) $item['quantity'];
		$amount  += isset( $item['line_subtotal'] ) ? (float) $item['line_subtotal'] : (float) $item['data']->get_price() * (int) $item['quantity'];
	}
	$percent = 0;
	foreach ( $tiers as $t ) {
		if ( $bottles >= $t[0] ) {
			$percent = max( $percent, $t[1] );
		}
	}
	return $percent > 0 ? round( $amount * $percent / 100 ) : 0;
}

/** Everything in the cart at its own price (before any discount). */
function rfaheya_cart_merchandise( $cart ) {
	$amount = 0.0;
	foreach ( $cart->get_cart() as $item ) {
		$amount += isset( $item['line_subtotal'] ) ? (float) $item['line_subtotal'] : 0;
	}
	return max( 0, $amount );
}

/** The discovery set prices (Settings → Rfaheya Store → Orders & offers). */
function rfaheya_discovery_prices() {
	$o = rfaheya_options()['discovery'] ?? array();
	return array(
		'enabled' => 'no' !== ( $o['enabled'] ?? 'yes' ),
		'set10'   => max( 0, (float) ( $o['set10'] ?? 650 ) ),
		'set20'   => max( 0, (float) ( $o['set20'] ?? 1000 ) ),
	);
}

/** Whether a cart line is a sample (a size of 10 ML or less, e.g. 5 ML). */
function rfaheya_is_sample_item( $item ) {
	if ( ! empty( $item['rfaheya_gift'] ) || empty( $item['data'] ) ) {
		return false;
	}
	return (bool) ( preg_match( '/(\d+(?:\.\d+)?)\s*-?\s*ml/i', rfaheya_size_normal( rfaheya_cart_item_size( $item ) ), $m ) && (float) $m[1] <= 10 );
}

/**
 * The discovery set in a cart: with 20 samples or more, the 20 dearest come at the set-of-20
 * price; with 10 to 19, the 10 dearest at the set-of-10 price and the rest at their own. Never
 * more than they cost one by one. Returns [ off, size, covered amount, covered units by cart key ].
 */
function rfaheya_discovery_set( $cart ) {
	$none   = array( 0, 0, 0.0, array() );
	$prices = rfaheya_discovery_prices();
	if ( ! $prices['enabled'] || ! $cart ) {
		return $none;
	}
	$units = array();
	foreach ( $cart->get_cart() as $key => $item ) {
		if ( ! rfaheya_is_sample_item( $item ) ) {
			continue;
		}
		$qty  = max( 0, (int) $item['quantity'] );
		$each = $qty && isset( $item['line_subtotal'] ) && '' !== $item['line_subtotal'] ? (float) $item['line_subtotal'] / $qty : (float) $item['data']->get_price();
		for ( $i = 0; $i < $qty; $i++ ) {
			$units[] = array( $each, $key );
		}
	}
	$n    = count( $units );
	$size = $n >= 20 && $prices['set20'] > 0 ? 20 : ( $n >= 10 && $prices['set10'] > 0 ? 10 : 0 );
	if ( ! $size ) {
		return $none;
	}
	usort( $units, fn( $a, $b ) => $b[0] <=> $a[0] );
	$covered = array_slice( $units, 0, $size );
	$amount  = array_sum( array_column( $covered, 0 ) );
	$off     = round( max( 0, $amount - $prices[ 'set' . $size ] ) );
	if ( $off <= 0 ) {
		return $none;
	}
	$keys = array();
	foreach ( $covered as $u ) {
		$keys[ $u[1] ] = ( $keys[ $u[1] ] ?? 0 ) + 1;
	}
	return array( $off, $size, $amount, $keys );
}

/** The cart's merchandise before coupons and discounts (what the offers bar measures; discounts don't add up). The samples in a discovery set are left out: the set has its own price. */
function rfaheya_offer_base( $cart ) {
	$amount = 0.0;
	foreach ( $cart->get_cart() as $item ) {
		$amount += isset( $item['line_subtotal'] ) ? (float) $item['line_subtotal'] : 0;
	}
	$set = rfaheya_discovery_set( $cart );
	return max( 0, $amount - ( $set[0] > 0 ? $set[2] : 0 ) );
}

/** Spend more, save more (Settings → Rfaheya Store): the discount for an amount, 0 below the minimum. */
function rfaheya_offer_discount( $amount ) {
	$o       = rfaheya_options()['shipping'];
	$min     = (float) $o['offer_min'];
	$percent = min( 100, max( 0, (float) $o['offer_percent'] ) );
	if ( 'no' === $o['offer_enabled'] || $min <= 0 || $percent <= 0 || $amount < $min ) {
		return 0;
	}
	return round( $amount * $percent / 100 );
}

function rfaheya_number( $n ) {
	return rtrim( rtrim( number_format( (float) $n, 2, '.', '' ), '0' ), '.' );
}

/**
 * Free shipping (Settings → Rfaheya Store → Free shipping): Cairo and Alexandria
 * orders from the minimum up ship free; below it WooCommerce's own free-shipping
 * rates are hidden, so the storefront bar and the checkout always agree.
 */
add_filter(
	'woocommerce_package_rates',
	function ( $rates, $package ) {
		$o = rfaheya_options()['shipping'];
		if ( ! $rates ) {
			return $rates;
		}
		// Spend-more offer: free shipping anywhere.
		if ( function_exists( 'WC' ) && WC()->cart && rfaheya_offer_discount( rfaheya_offer_base( WC()->cart ) ) > 0 ) {
			$free = array_filter(
				$rates,
				function ( $rate ) {
					return 'free_shipping' === $rate->get_method_id();
				}
			);
			if ( $free ) {
				return array_slice( $free, 0, 1, true );
			}
			$rate = reset( $rates );
			$rate->set_cost( 0 );
			$rate->set_taxes( array() );
			$rate->set_label( 'Free shipping' );
			return array( $rate->get_id() => $rate );
		}
		if ( 'no' === $o['free_enabled'] || (float) $o['free_min'] <= 0 ) {
			return $rates;
		}
		$state  = isset( $package['destination']['state'] ) ? strtoupper( (string) $package['destination']['state'] ) : '';
		// Before coupons (welcome / points discounts don't take free shipping away), after the one discount the order gets.
		$amount = 0.0;
		foreach ( isset( $package['contents'] ) ? (array) $package['contents'] : array() as $line ) {
			$amount += isset( $line['line_subtotal'] ) ? (float) $line['line_subtotal'] : 0;
		}
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$amount -= rfaheya_cart_discount_total( WC()->cart );
		}
		$free = array_filter(
			$rates,
			function ( $rate ) {
				return 'free_shipping' === $rate->get_method_id();
			}
		);
		if ( in_array( $state, array( 'EGC', 'EGALX' ), true ) && $amount >= (float) $o['free_min'] ) {
			if ( $free ) {
				return array_slice( $free, 0, 1, true );
			}
			$rate = reset( $rates );
			$rate->set_cost( 0 );
			$rate->set_taxes( array() );
			$rate->set_label( 'Free shipping' );
			return array( $rate->get_id() => $rate );
		}
		$paid = array_diff_key( $rates, $free );
		return $paid ? $paid : $rates;
	},
	20,
	2
);

// Saved shipping settings apply to carts that already have rates.
add_action(
	'update_option_' . RFAHEYA_OPTION,
	function () {
		if ( class_exists( 'WC_Cache_Helper' ) ) {
			WC_Cache_Helper::get_transient_version( 'shipping', true );
		}
	}
);

/** Egypt doesn't use postcodes in the storefront checkout. */
add_filter(
	'woocommerce_get_country_locale',
	function ( $locale ) {
		$locale['EG']['postcode'] = array(
			'required' => false,
			'hidden'   => true,
		);
		return $locale;
	}
);

// ==================================================================== gift boxes

/** Packaging price for 1 … max fragrances (Settings → Rfaheya Store → Gift boxes). */
function rfaheya_gift_prices() {
	$o     = rfaheya_options()['gift'];
	$max   = max( 1, min( 20, (int) $o['max'] ) );
	$given = array();
	foreach ( preg_split( '/\r?\n/', (string) $o['prices'] ) as $line ) {
		if ( preg_match( '/^\s*(\d+)\s*[=:\-]\s*([\d.]+)/', $line, $m ) ) {
			$given[ (int) $m[1] ] = (float) $m[2];
		}
	}
	$prices = array();
	$last   = 0.0;
	for ( $n = 1; $n <= $max; $n++ ) {
		if ( isset( $given[ $n ] ) ) {
			$last = $given[ $n ];
		}
		$prices[ $n ] = $last;
	}
	return $prices;
}

/** What the storefront needs: prices and the WooCommerce ids to add to the cart. */
function rfaheya_gift_box_data() {
	$o      = rfaheya_options()['gift'];
	$stored = get_option( 'rfaheya_gift_box', array() );
	return array(
		'enabled'    => 'no' !== $o['enabled'] && ! empty( $stored['product'] ),
		'max'        => count( rfaheya_gift_prices() ),
		'prices'     => (object) rfaheya_gift_prices(),
		'productId'  => isset( $stored['product'] ) ? (int) $stored['product'] : 0,
		'variations' => (object) ( isset( $stored['variations'] ) ? array_map( 'intval', (array) $stored['variations'] ) : array() ),
		'wrap'       => rfaheya_gift_wrap_data(),
	);
}

/** The gift wrap switch in the cart: on or off, its price, and the hidden product that carries it. */
function rfaheya_gift_wrap_data() {
	$o      = rfaheya_options()['gift'];
	$stored = get_option( 'rfaheya_gift_wrap', array() );
	return array(
		'enabled'   => 'no' !== $o['wrap_enabled'] && ! empty( $stored['product'] ),
		'price'     => max( 0, (float) $o['wrap_price'] ),
		'productId' => isset( $stored['product'] ) ? (int) $stored['product'] : 0,
	);
}

/** Keeps the hidden "Gift wrap" product (simple, no shipping) at the price set in the dashboard. */
function rfaheya_gift_wrap_sync() {
	if ( ! class_exists( 'WC_Product_Simple' ) || get_transient( 'rfaheya_gift_wrap_lock' ) ) {
		return;
	}
	set_transient( 'rfaheya_gift_wrap_lock', 1, MINUTE_IN_SECONDS );
	$price   = max( 0, (float) rfaheya_options()['gift']['wrap_price'] );
	$stored  = get_option( 'rfaheya_gift_wrap', array() );
	$product = ! empty( $stored['product'] ) ? wc_get_product( (int) $stored['product'] ) : null;
	if ( ! $product || 'trash' === $product->get_status() ) {
		// One already there (made earlier)? Use it rather than making another.
		$found   = get_posts( array( 'post_type' => 'product', 'name' => 'rfaheya-gift-wrap', 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids' ) );
		$product = $found ? wc_get_product( (int) $found[0] ) : null;
	}
	if ( ! $product || ! $product->is_type( 'simple' ) ) {
		$product = new WC_Product_Simple();
		$product->set_name( 'Gift wrap' );
		$product->set_slug( 'rfaheya-gift-wrap' );
		$product->set_short_description( 'Gift wrapping with a handwritten card (added by the storefront).' );
		$product->set_reviews_allowed( false );
	}
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'hidden' );
	$product->set_virtual( true );
	$product->set_sold_individually( true );
	$product->set_regular_price( wc_format_decimal( $price ) );
	$product->set_manage_stock( false );
	$product->set_stock_status( 'instock' );
	$id = $product->save();
	update_option( 'rfaheya_gift_wrap', array( 'product' => $id, 'price' => $price ), false );
	delete_transient( 'rfaheya_bootstrap' );
	delete_transient( 'rfaheya_gift_wrap_lock' );
}

/**
 * Keeps the hidden "Gift box" product in step with the settings: one variation per
 * number of fragrances, priced from the packaging prices. Runs in the dashboard
 * whenever the prices change (or the product was deleted).
 */
function rfaheya_gift_box_sync() {
	if ( ! class_exists( 'WC_Product_Variable' ) ) {
		return;
	}
	// Two dashboard pages loading at once must not both create one.
	if ( get_transient( 'rfaheya_gift_box_lock' ) ) {
		return;
	}
	set_transient( 'rfaheya_gift_box_lock', 1, MINUTE_IN_SECONDS );
	$prices  = rfaheya_gift_prices();
	$stored  = get_option( 'rfaheya_gift_box', array() );
	$product = ! empty( $stored['product'] ) ? wc_get_product( (int) $stored['product'] ) : null;
	// Every "Gift box" product there is (rfaheya-gift-box, -2, -3…): keep one, trash the copies.
	global $wpdb;
	$boxes = array_map( 'intval', $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'product' AND post_status <> 'trash' AND post_name LIKE %s ORDER BY ID ASC", $wpdb->esc_like( 'rfaheya-gift-box' ) . '%' ) ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	if ( ( ! $product || 'trash' === $product->get_status() ) && $boxes ) {
		$product = wc_get_product( $boxes[0] );
	}
	foreach ( $boxes as $box ) {
		if ( ! $product || $box !== $product->get_id() ) {
			wp_trash_post( $box );
		}
	}
	if ( ! $product || ! $product->is_type( 'variable' ) || 'trash' === $product->get_status() ) {
		$product = new WC_Product_Variable();
		$product->set_name( 'Gift box' );
		$product->set_slug( 'rfaheya-gift-box' );
		$product->set_short_description( 'Gift packaging for a Rfaheya gift box (added by the storefront).' );
		$product->set_reviews_allowed( false );
	}
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'hidden' );
	$attribute = new WC_Product_Attribute();
	$attribute->set_name( 'Fragrances' );
	$attribute->set_options( array_map( 'strval', array_keys( $prices ) ) );
	$attribute->set_visible( false );
	$attribute->set_variation( true );
	$product->set_attributes( array( $attribute ) );
	$id = $product->save();

	$existing = array();
	foreach ( $product->get_children() as $child_id ) {
		$child = wc_get_product( $child_id );
		if ( $child ) {
			$existing[ (string) $child->get_attribute( 'fragrances' ) ] = $child;
		}
	}
	$variations = array();
	foreach ( $prices as $n => $price ) {
		$variation = isset( $existing[ (string) $n ] ) ? $existing[ (string) $n ] : new WC_Product_Variation();
		unset( $existing[ (string) $n ] );
		$variation->set_parent_id( $id );
		$variation->set_attributes( array( 'fragrances' => (string) $n ) );
		$variation->set_regular_price( wc_format_decimal( $price ) );
		$variation->set_status( 'publish' );
		$variation->set_manage_stock( false );
		$variation->set_stock_status( 'instock' );
		$variations[ $n ] = $variation->save();
	}
	foreach ( $existing as $extra ) {
		$extra->delete( true );
	}
	WC_Product_Variable::sync( $id );
	update_option(
		'rfaheya_gift_box',
		array(
			'product'    => $id,
			'variations' => $variations,
			'signature'  => md5( wp_json_encode( $prices ) ),
		),
		false
	);
	delete_transient( 'rfaheya_bootstrap' );
	delete_transient( 'rfaheya_gift_box_lock' );
}

add_action(
	'admin_init',
	function () {
		if ( ! current_user_can( 'manage_options' ) || ! class_exists( 'WC_Product_Variable' ) ) {
			return;
		}
		$stored  = get_option( 'rfaheya_gift_box', array() );
		$product = ! empty( $stored['product'] ) ? wc_get_product( (int) $stored['product'] ) : null;
		$current = md5( wp_json_encode( rfaheya_gift_prices() ) );
		// Once: earlier versions could leave several copies of it (rfaheya-gift-box-2, -3…).
		$dedupe = ! get_option( 'rfaheya_gift_box_deduped' );
		if ( $dedupe ) {
			update_option( 'rfaheya_gift_box_deduped', 1, false );
		}
		$wrap = get_option( 'rfaheya_gift_wrap', array() );
		if ( 'no' !== rfaheya_options()['gift']['wrap_enabled'] && ( empty( $wrap['product'] ) || ! isset( $wrap['price'] ) || (float) $wrap['price'] !== max( 0, (float) rfaheya_options()['gift']['wrap_price'] ) || ! wc_get_product( (int) $wrap['product'] ) || 'publish' !== get_post_status( (int) $wrap['product'] ) ) ) {
			rfaheya_gift_wrap_sync();
		}
		if ( $dedupe || ! $product || 'publish' !== $product->get_status() || ( isset( $stored['signature'] ) ? $stored['signature'] : '' ) !== $current ) {
			rfaheya_gift_box_sync();
		}
	}
);

// ==================================================================== loyalty points & welcome discount

/** Settings → Rfaheya Store → Loyalty points (also sent to the storefront). */
function rfaheya_loyalty() {
	$o = rfaheya_options()['loyalty'];
	return array(
		'enabled'        => 'no' !== $o['enabled'],
		'earn'           => max( 0, (float) $o['earn'] ),
		'value'          => max( 0, (float) $o['value'] ) / 100,
		'min'            => max( 1, (int) $o['min'] ),
		'welcome'        => 'no' !== $o['welcome_enabled'] && (float) $o['welcome_percent'] > 0,
		'welcomePercent' => max( 0, min( 100, (float) $o['welcome_percent'] ) ),
	);
}

function rfaheya_points( $user_id ) {
	return max( 0, (int) get_user_meta( $user_id, 'rfaheya_points', true ) );
}

/** Adds (or with a negative number takes) points, keeping a short history. */
function rfaheya_points_add( $user_id, $delta, $reason ) {
	$balance = max( 0, rfaheya_points( $user_id ) + (int) $delta );
	update_user_meta( $user_id, 'rfaheya_points', $balance );
	$log = array_filter( (array) get_user_meta( $user_id, 'rfaheya_points_log', true ), 'is_array' );
	array_unshift(
		$log,
		array(
			'date'   => current_time( 'mysql' ),
			'points' => (int) $delta,
			'reason' => $reason,
		)
	);
	update_user_meta( $user_id, 'rfaheya_points_log', array_slice( $log, 0, 30 ) );
	return $balance;
}

/** A one-time coupon (welcome discount or points). */
function rfaheya_make_coupon( $prefix, $type, $amount, $days, $user ) {
	$coupon = new WC_Coupon();
	$coupon->set_code( $prefix . '-' . strtoupper( wp_generate_password( 8, false ) ) );
	$coupon->set_discount_type( $type );
	$coupon->set_amount( $amount );
	$coupon->set_usage_limit( 1 );
	$coupon->set_individual_use( false );
	if ( $days ) {
		$coupon->set_date_expires( time() + $days * DAY_IN_SECONDS );
	}
	$coupon->set_description( sprintf( 'Rfaheya %s for %s (user #%d)', strtolower( $prefix ), $user->user_email, $user->ID ) );
	$coupon->update_meta_data( '_rfaheya_user', $user->ID );
	$coupon->save();
	return $coupon;
}

/** 'unused', 'used', 'expired' or 'gone'. */
function rfaheya_coupon_state( $code ) {
	$id = $code ? wc_get_coupon_id_by_code( $code ) : 0;
	if ( ! $id ) {
		return 'gone';
	}
	$coupon = new WC_Coupon( $id );
	if ( $coupon->get_usage_count() >= 1 ) {
		return 'used';
	}
	$expires = $coupon->get_date_expires();
	return $expires && $expires->getTimestamp() < time() ? 'expired' : 'unused';
}

/** Gives back the points of a points discount that was not used (or always, when cancelling it). */
function rfaheya_release_redeem( $user_id, $only_if_lapsed = false ) {
	$redeem = get_user_meta( $user_id, 'rfaheya_redeem', true );
	if ( ! is_array( $redeem ) || empty( $redeem['code'] ) ) {
		return;
	}
	$state = rfaheya_coupon_state( $redeem['code'] );
	if ( 'used' === $state ) {
		delete_user_meta( $user_id, 'rfaheya_redeem' );
		return;
	}
	if ( $only_if_lapsed && 'unused' === $state ) {
		return;
	}
	$id = wc_get_coupon_id_by_code( $redeem['code'] );
	if ( $id ) {
		wp_delete_post( $id, true );
	}
	rfaheya_points_add( $user_id, (int) $redeem['points'], 'Points discount not used' );
	delete_user_meta( $user_id, 'rfaheya_redeem' );
}

/** True when the customer already has an order (by account or billing email). */
function rfaheya_has_ordered( $user_id, $email ) {
	$statuses = array( 'wc-processing', 'wc-completed', 'wc-on-hold' );
	if ( $user_id && wc_get_orders( array( 'customer_id' => $user_id, 'status' => $statuses, 'limit' => 1, 'return' => 'ids' ) ) ) {
		return true;
	}
	return $email && (bool) wc_get_orders( array( 'billing_email' => $email, 'status' => $statuses, 'limit' => 1, 'return' => 'ids' ) );
}

// The welcome discount is for a customer's first order only.
add_filter(
	'woocommerce_coupon_is_valid',
	function ( $valid, $coupon ) {
		if ( ! $valid || 0 !== stripos( $coupon->get_code(), 'welcome-' ) ) {
			return $valid;
		}
		$user_id = (int) $coupon->get_meta( '_rfaheya_user' );
		$user    = $user_id ? get_userdata( $user_id ) : null;
		if ( ! $user ) {
			$owners = get_users( array( 'meta_key' => 'rfaheya_welcome', 'meta_value' => $coupon->get_code(), 'number' => 1 ) ); // phpcs:ignore WordPress.DB.SlowDBQuery
			$user   = $owners ? $owners[0] : null;
		}
		$email = function_exists( 'WC' ) && WC()->customer ? WC()->customer->get_billing_email() : '';
		if ( ( $user && rfaheya_has_ordered( $user->ID, $user->user_email ) ) || ( $email && rfaheya_has_ordered( 0, $email ) ) ) {
			throw new Exception( 'The welcome discount is for your first order only.' );
		}
		return $valid;
	},
	10,
	2
);

/** The signed-in customer for the storefront: points, welcome discount, points discount. */
function rfaheya_me_data() {
	$loyalty = rfaheya_loyalty();
	$user    = wp_get_current_user();
	if ( ! $user || ! $user->ID || ! class_exists( 'WC_Coupon' ) ) {
		return array(
			'loggedIn' => false,
			'loyalty'  => $loyalty,
		);
	}
	rfaheya_release_redeem( $user->ID, true );
	rfaheya_backfill_points( $user );
	$welcome = null;
	// Only before the first order.
	if ( $loyalty['welcome'] && ! rfaheya_has_ordered( $user->ID, $user->user_email ) ) {
		$code = (string) get_user_meta( $user->ID, 'rfaheya_welcome', true );
		if ( '' === $code ) {
			$code = rfaheya_make_coupon( 'WELCOME', 'percent', $loyalty['welcomePercent'], 0, $user )->get_code();
			update_user_meta( $user->ID, 'rfaheya_welcome', $code );
		}
		$welcome = array(
			'code'    => $code,
			'percent' => $loyalty['welcomePercent'],
			'used'    => 'unused' !== rfaheya_coupon_state( $code ),
		);
	}
	$redeem = get_user_meta( $user->ID, 'rfaheya_redeem', true );
	return array(
		'loggedIn'  => true,
		'firstName' => $user->first_name ? $user->first_name : $user->display_name,
		'lastName'  => $user->last_name,
		'email'     => $user->user_email,
		'phone'     => (string) get_user_meta( $user->ID, 'billing_phone', true ),
		'points'    => rfaheya_points( $user->ID ),
		'loyalty'   => $loyalty,
		'welcome'   => $welcome,
		'redeem'    => is_array( $redeem ) && ! empty( $redeem['code'] ) ? array(
			'code'   => $redeem['code'],
			'amount' => (float) $redeem['amount'],
			'points' => (int) $redeem['points'],
		) : null,
		'nonce'     => wp_create_nonce( 'rfaheya_points' ),
		'admin'     => rfaheya_admin_links(),
	);
}

/**
 * For the shop's own admin bar (shown on the storefront to staff who can edit products): the
 * dashboard links it needs. Nothing for customers.
 */
function rfaheya_admin_links() {
	if ( ! current_user_can( 'edit_products' ) && ! current_user_can( 'manage_options' ) ) {
		return null;
	}
	$settings = admin_url( 'options-general.php?page=rfaheya-store' );
	return array(
		'dashboard'  => admin_url(),
		'editPost'   => admin_url( 'post.php?post=__ID__&action=edit' ),
		'products'   => admin_url( 'edit.php?post_type=product' ),
		'newProduct' => admin_url( 'post-new.php?post_type=product' ),
		'orders'     => class_exists( '\Automattic\WooCommerce\Utilities\OrderUtil' ) && \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled() ? admin_url( 'admin.php?page=wc-orders' ) : admin_url( 'edit.php?post_type=shop_order' ),
		'reviews'    => admin_url( 'edit.php?post_type=product&page=product-reviews' ),
		'faqs'       => admin_url( 'edit.php?post_type=rfaheya_faq' ),
		'posts'      => admin_url( 'edit.php' ),
		'offers'     => admin_url( 'edit.php?post_type=product&page=rfaheya-discounts' ),
		'characters' => admin_url( 'edit.php?post_type=product&page=rfaheya-characters' ),
		'settings'   => $settings,
		'settingsTab' => add_query_arg( 'tab', '__TAB__', $settings ),
		'logout'     => wp_logout_url( home_url( '/' ) ),
		'name'       => wp_get_current_user()->display_name,
	);
}

/** Sends the customer data (or $data, e.g. an error). WordPress calls ajax actions with an empty argument. */
function rfaheya_send_me( $data = null ) {
	nocache_headers();
	wp_send_json( is_array( $data ) ? $data : rfaheya_me_data() );
}

add_action( 'wp_ajax_rfaheya_me', 'rfaheya_send_me' );
add_action( 'wp_ajax_nopriv_rfaheya_me', 'rfaheya_send_me' );

// Turn points into a one-time discount (at most the cart total the storefront sends).
add_action(
	'wp_ajax_rfaheya_redeem',
	function () {
		check_ajax_referer( 'rfaheya_points' );
		$user_id = get_current_user_id();
		$loyalty = rfaheya_loyalty();
		if ( ! $loyalty['enabled'] || $loyalty['value'] <= 0 ) {
			rfaheya_send_me( array( 'error' => 'Points can’t be used right now.' ) );
		}
		rfaheya_release_redeem( $user_id );
		$points = rfaheya_points( $user_id );
		if ( $points < $loyalty['min'] ) {
			rfaheya_send_me( array( 'error' => sprintf( 'You need at least %d points.', $loyalty['min'] ) ) );
		}
		$amount = floor( $points * $loyalty['value'] );
		$cap    = isset( $_POST['max'] ) ? (float) wp_unslash( $_POST['max'] ) : 0; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( $cap > 0 ) {
			$amount = min( $amount, floor( $cap ) );
		}
		if ( $amount < 1 ) {
			rfaheya_send_me( array( 'error' => 'Not enough points for a discount yet.' ) );
		}
		$spend  = min( $points, (int) ceil( $amount / $loyalty['value'] ) );
		$coupon = rfaheya_make_coupon( 'POINTS', 'fixed_cart', $amount, 14, wp_get_current_user() );
		rfaheya_points_add( $user_id, -$spend, sprintf( 'Used for %s EGP off', $amount ) );
		update_user_meta(
			$user_id,
			'rfaheya_redeem',
			array(
				'code'   => $coupon->get_code(),
				'amount' => $amount,
				'points' => $spend,
			)
		);
		rfaheya_send_me();
	}
);

// Cancel the points discount: the points come back.
add_action(
	'wp_ajax_rfaheya_unredeem',
	function () {
		check_ajax_referer( 'rfaheya_points' );
		rfaheya_release_redeem( get_current_user_id() );
		rfaheya_send_me();
	}
);

/** Only an explicitly assigned account owns an order; billing email is not proof of identity. */
function rfaheya_order_user( $order ) {
	if ( $order->get_customer_id() ) {
		return (int) $order->get_customer_id();
	}
	return 0;
}

// Cart-token requests may run as guests: verify the WordPress login cookie before assigning an account.
add_action(
	'woocommerce_store_api_checkout_order_processed',
	function ( $order ) {
		if ( ! $order->get_customer_id() ) {
			$user_id = (int) wp_validate_auth_cookie( '', 'logged_in' );
			if ( $user_id ) {
				$order->set_customer_id( $user_id );
				$order->save();
			}
		}
	}
);

/** Gives a completed order's points to its customer, once. */
function rfaheya_award_points( $order, $user_id = 0 ) {
	$loyalty = rfaheya_loyalty();
	if ( ! $loyalty['enabled'] || $loyalty['earn'] <= 0 || ! $order || ! $order->has_status( 'completed' ) || $order->get_meta( '_rfaheya_points' ) ) {
		return;
	}
	$user_id = $user_id ? (int) $user_id : rfaheya_order_user( $order );
	if ( ! $user_id || ( $order->get_customer_id() && (int) $order->get_customer_id() !== $user_id ) ) {
		return;
	}
	$spent  = max( 0, (float) $order->get_total() - (float) $order->get_shipping_total() - (float) $order->get_shipping_tax() );
	$points = (int) floor( $spent * $loyalty['earn'] );
	if ( $points <= 0 ) {
		return;
	}
	if ( ! $order->get_customer_id() ) {
		$order->set_customer_id( $user_id );
	}
	rfaheya_points_add( $user_id, $points, sprintf( 'Order #%s', $order->get_order_number() ) );
	$order->update_meta_data( '_rfaheya_points', $points );
	$order->add_order_note( sprintf( 'Rfaheya points: +%d for the customer.', $points ) );
	$order->save();
}

// Points for completed orders.
add_action(
	'woocommerce_order_status_completed',
	function ( $order_id ) {
		rfaheya_award_points( wc_get_order( $order_id ) );
	}
);

/**
 * Catches up on completed orders of this customer that got no points yet (an order
 * linked to the account later after proving ownership with the order key).
 */
function rfaheya_backfill_points( $user, $force = false ) {
	$loyalty = rfaheya_loyalty();
	if ( ! $loyalty['enabled'] || $loyalty['earn'] <= 0 || ! function_exists( 'wc_get_orders' ) ) {
		return;
	}
	$last = (int) get_user_meta( $user->ID, 'rfaheya_backfill_at', true );
	if ( ! $force && time() - $last < 10 * MINUTE_IN_SECONDS ) {
		return;
	}
	update_user_meta( $user->ID, 'rfaheya_backfill_at', time() );
	$query = array(
		'status' => array( 'wc-completed' ),
		'limit'  => 50,
		'return' => 'ids',
	);
	// Never claim historical guest orders using an unverified email address.
	$ids = wc_get_orders( $query + array( 'customer_id' => $user->ID ) );
	foreach ( $ids as $id ) {
		rfaheya_award_points( wc_get_order( $id ), $user->ID );
	}
}

// The storefront links an order to the signed-in customer right after checkout (by its order key).
add_action(
	'wp_ajax_rfaheya_claim_order',
	function () {
		check_ajax_referer( 'rfaheya_points' );
		$user_id = get_current_user_id();
		$order   = wc_get_order( isset( $_POST['order'] ) ? absint( $_POST['order'] ) : 0 );
		$key     = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
		if ( $user_id && $order && $key && hash_equals( (string) $order->get_order_key(), $key ) && in_array( (int) $order->get_customer_id(), array( 0, $user_id ), true ) ) {
			if ( ! $order->get_customer_id() ) {
				$order->set_customer_id( $user_id );
				$order->add_order_note( 'Linked to the customer’s account by the storefront.' );
				$order->save();
			}
			rfaheya_award_points( $order, $user_id );
		}
		rfaheya_send_me();
	}
);

// Refunded or cancelled after the points were given: take them back.
foreach ( array( 'refunded', 'cancelled' ) as $rfaheya_status ) {
	add_action(
		'woocommerce_order_status_' . $rfaheya_status,
		function ( $order_id ) use ( $rfaheya_status ) {
			$order  = wc_get_order( $order_id );
			$points = $order ? (int) $order->get_meta( '_rfaheya_points' ) : 0;
			if ( ! $points || $order->get_meta( '_rfaheya_points_revoked' ) ) {
				return;
			}
			$user_id = rfaheya_order_user( $order );
			if ( $user_id ) {
				rfaheya_points_add( $user_id, -$points, sprintf( 'Order #%s %s', $order->get_order_number(), $rfaheya_status ) );
			}
			$order->update_meta_data( '_rfaheya_points_revoked', 1 );
			$order->add_order_note( sprintf( 'Rfaheya points: -%d (order %s).', $points, $rfaheya_status ) );
			$order->save();
		}
	);
}

// My Account → Dashboard: points balance and history.
add_action(
	'woocommerce_account_dashboard',
	function () {
		$loyalty = rfaheya_loyalty();
		if ( ! $loyalty['enabled'] ) {
			return;
		}
		$user_id = get_current_user_id();
		rfaheya_release_redeem( $user_id, true );
		rfaheya_backfill_points( wp_get_current_user(), true );
		$points = rfaheya_points( $user_id );
		$log    = array_filter( (array) get_user_meta( $user_id, 'rfaheya_points_log', true ), 'is_array' );
		?>
		<section class="rf-points">
			<p class="rf-points-label">Rfaheya points</p>
			<p class="rf-points-total"><?php echo esc_html( number_format_i18n( $points ) ); ?> <span>points · <?php echo esc_html( number_format_i18n( floor( $points * $loyalty['value'] ) ) ); ?> EGP</span></p>
			<p class="rf-points-how">
				<?php
				echo esc_html(
					sprintf(
						'You earn %s point(s) for every 1 EGP on completed orders. Use %d points or more at checkout.',
						number_format_i18n( $loyalty['earn'], $loyalty['earn'] < 1 ? 2 : 0 ),
						$loyalty['min']
					)
				);
				?>
			</p>
			<?php if ( $log ) : ?>
				<table class="rf-points-log">
					<?php foreach ( array_slice( $log, 0, 8 ) as $row ) : ?>
						<tr>
							<td><?php echo esc_html( mysql2date( get_option( 'date_format' ), $row['date'] ) ); ?></td>
							<td><?php echo esc_html( $row['reason'] ); ?></td>
							<td><?php echo esc_html( ( $row['points'] > 0 ? '+' : '' ) . number_format_i18n( $row['points'] ) ); ?></td>
						</tr>
					<?php endforeach; ?>
				</table>
			<?php endif; ?>
		</section>
		<?php
	}
);

// Users → Profile: see (and, for shop managers, change) a customer's points.
function rfaheya_points_profile_field( $user ) {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	?>
	<h2>Rfaheya points</h2>
	<table class="form-table" role="presentation">
		<tr>
			<th><label for="rfaheya-points">Points</label></th>
			<td><input id="rfaheya-points" name="rfaheya_points" type="number" min="0" step="1" class="small-text" value="<?php echo esc_attr( rfaheya_points( $user->ID ) ); ?>"></td>
		</tr>
	</table>
	<?php
}
add_action( 'show_user_profile', 'rfaheya_points_profile_field' );
add_action( 'edit_user_profile', 'rfaheya_points_profile_field' );

function rfaheya_points_profile_save( $user_id ) {
	// The profile form's own nonce has been checked by WordPress before this runs.
	if ( ! current_user_can( 'manage_woocommerce' ) || ! isset( $_POST['rfaheya_points'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		return;
	}
	$new   = max( 0, (int) $_POST['rfaheya_points'] ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
	$delta = $new - rfaheya_points( $user_id );
	if ( $delta ) {
		rfaheya_points_add( $user_id, $delta, 'Changed by the store' );
	}
}
add_action( 'personal_options_update', 'rfaheya_points_profile_save' );
add_action( 'edit_user_profile_update', 'rfaheya_points_profile_save' );

// ==================================================================== SVG uploads

/** Who may upload SVG files (note icons etc.): administrators and shop managers. */
function rfaheya_can_upload_svg() {
	return current_user_can( 'manage_options' ) || current_user_can( 'manage_woocommerce' );
}

add_filter(
	'upload_mimes',
	function ( $mimes ) {
		if ( rfaheya_can_upload_svg() ) {
			$mimes['svg'] = 'image/svg+xml';
		}
		return $mimes;
	}
);

// PHP reports SVG files under several types (or none); WordPress needs them to match.
add_filter(
	'wp_check_filetype_and_ext',
	function ( $data, $file, $filename ) {
		if ( 'svg' === strtolower( pathinfo( (string) $filename, PATHINFO_EXTENSION ) ) && rfaheya_can_upload_svg() ) {
			$data['ext']  = 'svg';
			$data['type'] = 'image/svg+xml';
		}
		return $data;
	},
	10,
	3
);

/**
 * Removes anything that can run code from an SVG (scripts, event handlers, external
 * links, embedded HTML). Returns the cleaned markup, or false when it isn't a valid SVG.
 */
function rfaheya_sanitize_svg( $svg ) {
	// No DTDs or entities (they can read files or expand without end).
	if ( ! is_string( $svg ) || '' === trim( $svg ) || preg_match( '/<!(DOCTYPE|ENTITY)/i', $svg ) ) {
		return false;
	}
	$dom      = new DOMDocument();
	$previous = libxml_use_internal_errors( true );
	$loaded   = $dom->loadXML( $svg, LIBXML_NONET );
	libxml_clear_errors();
	libxml_use_internal_errors( $previous );
	if ( ! $loaded || ! $dom->documentElement || 'svg' !== strtolower( $dom->documentElement->localName ) ) {
		return false;
	}
	$blocked = array( 'script', 'foreignobject', 'iframe', 'object', 'embed', 'handler', 'listener', 'set', 'audio', 'video', 'canvas', 'base', 'link', 'meta' );
	$xpath   = new DOMXPath( $dom );
	foreach ( iterator_to_array( $xpath->query( '//*' ) ) as $node ) {
		$tag = strtolower( $node->localName );
		if ( in_array( $tag, $blocked, true ) ) {
			$node->parentNode->removeChild( $node );
			continue;
		}
		// Animations that would write a link (or script) into another attribute.
		if ( in_array( $tag, array( 'animate', 'animatemotion', 'animatetransform' ), true ) && preg_match( '/href|javascript:/i', implode( ' ', array( $node->getAttribute( 'attributeName' ), $node->getAttribute( 'values' ), $node->getAttribute( 'to' ), $node->getAttribute( 'from' ), $node->getAttribute( 'by' ) ) ) ) ) {
			$node->parentNode->removeChild( $node );
			continue;
		}
		if ( 'style' === $tag && preg_match( '/@import|javascript:|expression\s*\(|url\s*\(\s*[\'"]?\s*(?!#)/i', $node->textContent ) ) {
			$node->parentNode->removeChild( $node );
			continue;
		}
		foreach ( iterator_to_array( $node->attributes ) as $attribute ) {
			$name  = strtolower( $attribute->nodeName );
			$value = trim( preg_replace( '/[\x00-\x20]+/', '', $attribute->nodeValue ) );
			$bad   = 0 === strpos( $name, 'on' )
				|| ( in_array( $name, array( 'href', 'xlink:href', 'src' ), true ) && '' !== $value && '#' !== $value[0] && ! preg_match( '#^data:image/(png|jpe?g|gif|webp);base64,#i', $value ) )
				|| ( 'attributename' === $name && preg_match( '/href/i', $value ) )
				|| ( 'style' === $name && preg_match( '/javascript:|expression\(|@import|url\((?!#)/i', $value ) );
			if ( $bad ) {
				$node->removeAttributeNode( $attribute );
			}
		}
	}
	return $dom->saveXML( $dom->documentElement );
}

// Clean every uploaded SVG before it is stored; refuse files that aren't valid SVG.
add_filter(
	'wp_handle_upload_prefilter',
	function ( $file ) {
		if ( empty( $file['tmp_name'] ) || 'svg' !== strtolower( pathinfo( (string) $file['name'], PATHINFO_EXTENSION ) ) ) {
			return $file;
		}
		if ( ! rfaheya_can_upload_svg() ) {
			$file['error'] = 'Only administrators and shop managers can upload SVG files.';
			return $file;
		}
		$clean = rfaheya_sanitize_svg( (string) file_get_contents( $file['tmp_name'] ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( false === $clean ) {
			$file['error'] = 'This SVG file could not be read (or contains a DOCTYPE). Please export it again as a plain SVG.';
			return $file;
		}
		file_put_contents( $file['tmp_name'], $clean ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		return $file;
	}
);

// Show SVGs as images in the media library and pickers.
add_filter(
	'wp_prepare_attachment_for_js',
	function ( $response, $attachment ) {
		if ( 'image/svg+xml' === $response['mime'] ) {
			$url               = wp_get_attachment_url( $attachment->ID );
			$size              = array(
				'url'         => $url,
				'width'       => 200,
				'height'      => 200,
				'orientation' => 'landscape',
			);
			$response['sizes'] = array(
				'full'      => $size,
				'medium'    => $size,
				'thumbnail' => $size,
			);
			$response['image'] = array( 'src' => $url );
		}
		return $response;
	},
	10,
	2
);


/* -------------------------------------------------------------------------
 * Reviews from the dashboard, with photos
 * Products → Add review: post a customer's review (e.g. one sent on WhatsApp)
 * with screenshots or photos. Any review's edit screen can add photos too.
 * ---------------------------------------------------------------------- */

add_action(
	'admin_menu',
	function () {
		add_submenu_page( 'edit.php?post_type=product', 'Add review', 'Add review', 'moderate_comments', 'rfaheya-add-review', 'rfaheya_add_review_page' );
	},
	60
);

/** The media picker for review photos (the Add review page and a review's edit screen). */
add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'product_page_rfaheya-add-review' !== $hook && 'comment.php' !== $hook ) {
			return;
		}
		wp_enqueue_media();
		wp_register_script( 'rfaheya-review-photos', false, array( 'jquery' ), '1.0.0', true );
		wp_enqueue_script( 'rfaheya-review-photos' );
		wp_add_inline_script(
			'rfaheya-review-photos',
			"jQuery(function ($) {
				function draw(box) {
					var ids = box.find('input.rf-ids').val().split(',').filter(Boolean);
					var list = box.find('.rf-thumbs').empty();
					ids.forEach(function (id) {
						var url = box.data('urls')[id] || '';
						$('<li>').attr('data-id', id)
							.append($('<img>').attr('src', url))
							.append($('<button type=\"button\" class=\"rf-x\" aria-label=\"Remove photo\">×</button>'))
							.appendTo(list);
					});
				}
				$('.rf-review-photos').each(function () {
					var box = $(this);
					box.data('urls', box.data('initial') || {});
					draw(box);
					box.on('click', '.rf-add', function (e) {
						e.preventDefault();
						var frame = wp.media({ title: 'Review photos', multiple: true, library: { type: 'image' }, button: { text: 'Add photos' } });
						frame.on('select', function () {
							var ids = box.find('input.rf-ids').val().split(',').filter(Boolean);
							frame.state().get('selection').each(function (a) {
								a = a.toJSON();
								if (ids.indexOf(String(a.id)) < 0) ids.push(String(a.id));
								box.data('urls')[a.id] = (a.sizes && (a.sizes.thumbnail || a.sizes.medium) || a).url;
							});
							box.find('input.rf-ids').val(ids.join(','));
							draw(box);
						});
						frame.open();
					});
					box.on('click', '.rf-x', function () {
						var id = String($(this).parent().data('id'));
						var ids = box.find('input.rf-ids').val().split(',').filter(function (x) { return x && x !== id; });
						box.find('input.rf-ids').val(ids.join(','));
						draw(box);
					});
				});
			});"
		);
		wp_register_style( 'rfaheya-review-photos', false, array(), '1.0.0' );
		wp_enqueue_style( 'rfaheya-review-photos' );
		wp_add_inline_style(
			'rfaheya-review-photos',
			'.rf-thumbs{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 10px;padding:0;list-style:none}.rf-thumbs li{position:relative;margin:0}.rf-thumbs img{width:96px;height:96px;object-fit:cover;border-radius:12px;display:block;border:1px solid #ddd}.rf-x{position:absolute;top:-8px;right:-8px;width:24px;height:24px;border-radius:50%;border:0;background:#1d2327;color:#fff;cursor:pointer;line-height:24px;padding:0}.rf-review-form .rf-stars label{margin-right:12px}.rf-review-form td{padding-top:12px}.rf-recent img{width:40px;height:40px;object-fit:cover;border-radius:8px;margin-right:4px;vertical-align:middle}'
		);
	}
);

/** The photo picker: thumbnails, remove buttons and an "Add photos" button; IDs travel in a hidden field. */
function rfaheya_review_photos_field( $ids ) {
	$ids  = array_values( array_filter( array_map( 'absint', (array) $ids ) ) );
	$urls = array();
	foreach ( $ids as $id ) {
		$urls[ $id ] = (string) wp_get_attachment_image_url( $id, 'thumbnail' );
	}
	echo '<div class="rf-review-photos" data-initial="' . esc_attr( wp_json_encode( (object) $urls ) ) . '">';
	echo '<ul class="rf-thumbs"></ul>';
	echo '<input type="hidden" class="rf-ids" name="rfaheya_review_images" value="' . esc_attr( implode( ',', $ids ) ) . '">';
	echo '<button type="button" class="button rf-add">Add photos</button>';
	echo '<p class="description">Screenshots or photos from the customer — they show on the review in the store.</p>';
	echo '</div>';
}

function rfaheya_review_ids_from_post() {
	$raw = isset( $_POST['rfaheya_review_images'] ) ? sanitize_text_field( wp_unslash( $_POST['rfaheya_review_images'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- checked by the callers
	return array_values( array_filter( array_map( 'absint', explode( ',', $raw ) ) ) );
}

/**
 * With WPML (translations), each product exists once per language: keep the English ones
 * (or the site's main language), so a product is listed once. Its translation follows it.
 */
function rfaheya_one_language( $posts ) {
	if ( ! has_filter( 'wpml_post_language_details' ) ) {
		return $posts;
	}
	$languages = (array) apply_filters( 'wpml_active_languages', null, array( 'skip_missing' => 0 ) );
	$main      = isset( $languages['en'] ) ? 'en' : (string) apply_filters( 'wpml_default_language', null );
	if ( '' === $main ) {
		return $posts;
	}
	return array_values(
		array_filter(
			$posts,
			function ( $p ) use ( $main ) {
				$details = apply_filters( 'wpml_post_language_details', null, is_object( $p ) ? $p->ID : (int) $p );
				return ! is_array( $details ) || empty( $details['language_code'] ) || $details['language_code'] === $main;
			}
		)
	);
}

function rfaheya_add_review_page() {
	if ( ! current_user_can( 'moderate_comments' ) ) {
		return;
	}
	$products = rfaheya_one_language(
		get_posts(
			array(
				'post_type'   => 'product',
				'post_status' => 'publish',
				'numberposts' => -1,
				'orderby'     => 'title',
				'order'       => 'ASC',
			)
		)
	);
	$notice = isset( $_GET['rfaheya-review'] ) ? sanitize_text_field( wp_unslash( $_GET['rfaheya-review'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	?>
	<div class="wrap rf-review-form">
		<h1>Add review</h1>
		<p>Post a customer's review — for example one they sent on WhatsApp — with their photos or screenshots. It shows on the product page and in the store's reviews.</p>
		<?php if ( 'added' === $notice ) : ?>
			<div class="notice notice-success is-dismissible"><p>Review added. It shows in the store within a minute.</p></div>
		<?php elseif ( $notice ) : ?>
			<div class="notice notice-error"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="rfaheya_add_review">
			<?php wp_nonce_field( 'rfaheya_add_review' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="rf-product">Fragrance</label></th>
					<td>
						<select id="rf-product" name="product_id" required>
							<option value="">Choose a fragrance…</option>
							<?php foreach ( $products as $p ) : ?>
								<option value="<?php echo esc_attr( $p->ID ); ?>"><?php echo esc_html( $p->post_title ); ?></option>
							<?php endforeach; ?>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="rf-name">Customer name</label></th>
					<td><input id="rf-name" name="author" type="text" class="regular-text" required placeholder="e.g. Sara K."></td>
				</tr>
				<tr>
					<th scope="row">Rating</th>
					<td class="rf-stars">
						<?php for ( $i = 5; $i >= 1; $i-- ) : ?>
							<label><input type="radio" name="rating" value="<?php echo esc_attr( $i ); ?>" <?php checked( 5, $i ); ?>> <?php echo esc_html( str_repeat( '★', $i ) ); ?></label>
						<?php endfor; ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="rf-text">Review</label></th>
					<td><textarea id="rf-text" name="review" rows="6" class="large-text" dir="auto" style="unicode-bidi:plaintext" required placeholder="What the customer said… (Arabic, English or both; Enter starts a new line)"></textarea></td>
				</tr>
				<tr>
					<th scope="row"><label for="rf-size">Size bought</label></th>
					<td><input id="rf-size" name="size" type="text" class="regular-text" placeholder="e.g. 50 ML (optional)"></td>
				</tr>
				<tr>
					<th scope="row"><label for="rf-date">Date</label></th>
					<td><input id="rf-date" name="date" type="date" value="<?php echo esc_attr( current_time( 'Y-m-d' ) ); ?>"></td>
				</tr>
				<tr>
					<th scope="row">Verified purchase</th>
					<td><label><input type="checkbox" name="verified" value="1" checked> Show “Verified purchase” on this review</label></td>
				</tr>
				<tr>
					<th scope="row">Photos</th>
					<td><?php rfaheya_review_photos_field( array() ); ?></td>
				</tr>
			</table>
			<?php submit_button( 'Add review' ); ?>
		</form>

		<h2>Recent reviews</h2>
		<table class="widefat striped rf-recent">
			<thead><tr><th>Fragrance</th><th>Customer</th><th>Rating</th><th>Review</th><th>Photos</th><th></th></tr></thead>
			<tbody>
			<?php
			$recent = get_comments(
				array(
					'post_type' => 'product',
					'type'      => 'review',
					'number'    => 20,
					'status'    => 'approve',
				)
			);
			if ( ! $recent ) {
				echo '<tr><td colspan="6">No reviews yet.</td></tr>';
			}
			foreach ( $recent as $c ) {
				$thumbs = '';
				foreach ( (array) get_comment_meta( $c->comment_ID, 'rfaheya_images', true ) as $a ) {
					$src = wp_get_attachment_image_url( (int) $a, 'thumbnail' );
					if ( $src ) {
						$thumbs .= '<img src="' . esc_url( $src ) . '" alt="">';
					}
				}
				echo '<tr><td>' . esc_html( get_the_title( $c->comment_post_ID ) ) . '</td><td>' . esc_html( $c->comment_author ) . '</td><td>' . esc_html( str_repeat( '★', (int) get_comment_meta( $c->comment_ID, 'rating', true ) ) ) . '</td><td>' . esc_html( wp_trim_words( $c->comment_content, 14 ) ) . '</td><td>' . $thumbs . '</td><td><a href="' . esc_url( admin_url( 'comment.php?action=editcomment&c=' . $c->comment_ID ) ) . '">Edit / photos</a></td></tr>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts
			}
			?>
			</tbody>
		</table>
	</div>
	<?php
}

add_action(
	'admin_post_rfaheya_add_review',
	function () {
		if ( ! current_user_can( 'moderate_comments' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'rfaheya_add_review' );
		$back       = admin_url( 'edit.php?post_type=product&page=rfaheya-add-review' );
		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$author     = isset( $_POST['author'] ) ? sanitize_text_field( wp_unslash( $_POST['author'] ) ) : '';
		$text       = isset( $_POST['review'] ) ? sanitize_textarea_field( wp_unslash( $_POST['review'] ) ) : '';
		$rating     = isset( $_POST['rating'] ) ? max( 1, min( 5, absint( $_POST['rating'] ) ) ) : 5;
		$size       = isset( $_POST['size'] ) ? sanitize_text_field( wp_unslash( $_POST['size'] ) ) : '';
		$date       = isset( $_POST['date'] ) ? sanitize_text_field( wp_unslash( $_POST['date'] ) ) : '';
		if ( ! $product_id || 'product' !== get_post_type( $product_id ) || '' === $author || '' === $text ) {
			wp_safe_redirect( add_query_arg( 'rfaheya-review', rawurlencode( 'Please choose a fragrance and fill in the name and the review.' ), $back ) );
			exit;
		}
		$when = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) ? $date . ' ' . current_time( 'H:i:s' ) : current_time( 'mysql' );
		$id   = wp_insert_comment(
			array(
				'comment_post_ID'  => $product_id,
				'comment_author'   => $author,
				'comment_content'  => $text,
				'comment_type'     => 'review',
				'comment_approved' => 1,
				'comment_date'     => $when,
				'comment_date_gmt' => get_gmt_from_date( $when ),
				'user_id'          => 0,
			)
		);
		if ( ! $id ) {
			wp_safe_redirect( add_query_arg( 'rfaheya-review', rawurlencode( 'The review could not be saved. Please try again.' ), $back ) );
			exit;
		}
		update_comment_meta( $id, 'rating', $rating );
		update_comment_meta( $id, 'verified', empty( $_POST['verified'] ) ? 0 : 1 );
		if ( '' !== $size ) {
			update_comment_meta( $id, 'rfaheya_size', $size );
		}
		update_comment_meta( $id, 'rfaheya_images', rfaheya_review_ids_from_post() );
		// The product's average rating and review count.
		if ( class_exists( 'WC_Comments' ) ) {
			WC_Comments::clear_transients( $product_id );
		}
		wp_safe_redirect( add_query_arg( 'rfaheya-review', 'added', $back ) );
		exit;
	}
);

/** Photos (and size) on any product review's edit screen. */
add_action(
	'add_meta_boxes_comment',
	function ( $comment ) {
		if ( 'product' !== get_post_type( $comment->comment_post_ID ) ) {
			return;
		}
		add_meta_box(
			'rfaheya-review-photos',
			'Review photos (Rfaheya)',
			function ( $comment ) {
				wp_nonce_field( 'rfaheya_review_photos', 'rfaheya_review_photos_nonce' );
				rfaheya_review_photos_field( get_comment_meta( $comment->comment_ID, 'rfaheya_images', true ) );
				echo '<p><label>Size bought <input type="text" name="rfaheya_review_size" value="' . esc_attr( (string) get_comment_meta( $comment->comment_ID, 'rfaheya_size', true ) ) . '" placeholder="e.g. 50 ML"></label></p>';
			},
			'comment',
			'normal'
		);
	}
);

add_action(
	'edit_comment',
	function ( $comment_id ) {
		if ( ! isset( $_POST['rfaheya_review_photos_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rfaheya_review_photos_nonce'] ) ), 'rfaheya_review_photos' ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_comment', $comment_id ) ) {
			return;
		}
		update_comment_meta( $comment_id, 'rfaheya_images', rfaheya_review_ids_from_post() );
		$size = isset( $_POST['rfaheya_review_size'] ) ? sanitize_text_field( wp_unslash( $_POST['rfaheya_review_size'] ) ) : '';
		if ( '' === $size ) {
			delete_comment_meta( $comment_id, 'rfaheya_size' );
		} else {
			update_comment_meta( $comment_id, 'rfaheya_size', $size );
		}
	},
	5
);


/* -------------------------------------------------------------------------
 * Notes pack: 181 note pictures with their names (rfaheya/notes-pack.json,
 * pictures in rfaheya/media/note-*.webp). They go into Products → Fragrance
 * notes a few at a time from the dashboard (a progress bar shows at the top),
 * so the host never times out. A note that already has a picture is kept.
 * ---------------------------------------------------------------------- */

/** The pack's notes, and a fingerprint so a newer pack runs again. */
function rfaheya_notes_pack() {
	$file = __DIR__ . '/rfaheya/notes-pack.json';
	$raw  = is_readable( $file ) ? (string) file_get_contents( $file ) : '';
	$list = $raw ? json_decode( $raw, true ) : null;
	return array( is_array( $list ) ? $list : array(), md5( $raw ) );
}

/** Adds the next few notes of the pack; returns [done, total]. */
function rfaheya_notes_pack_step( $batch = 12 ) {
	list( $list, $hash ) = rfaheya_notes_pack();
	$state               = get_option( 'rfaheya_notes_pack', array() );
	$done                = ( is_array( $state ) && isset( $state['hash'], $state['done'] ) && $state['hash'] === $hash ) ? (int) $state['done'] : 0;
	$total               = count( $list );
	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	}
	$end = min( $total, $done + $batch );
	for ( $i = $done; $i < $end; $i++ ) {
		$n = $list[ $i ];
		if ( empty( $n['name'] ) ) {
			continue;
		}
		$term    = term_exists( $n['name'], 'rfaheya_note' );
		$term_id = $term ? (int) ( is_array( $term ) ? $term['term_id'] : $term ) : 0;
		if ( $term_id && get_term_meta( $term_id, 'rfaheya_icon', true ) ) {
			continue; // already has a picture: keep it
		}
		if ( ! $term_id ) {
			$made = wp_insert_term( $n['name'], 'rfaheya_note' );
			if ( is_wp_error( $made ) ) {
				continue;
			}
			$term_id = (int) $made['term_id'];
		}
		$icon = empty( $n['icon'] ) ? 0 : rfaheya_import_media( $n['icon'], $n['name'] );
		if ( $icon ) {
			update_term_meta( $term_id, 'rfaheya_icon', $icon );
		}
	}
	update_option(
		'rfaheya_notes_pack',
		array(
			'hash' => $hash,
			'done' => $end,
		),
		false
	);
	if ( $end >= $total ) {
		// The storefront picks the new pictures up on its next data rebuild.
		delete_transient( 'rfaheya_bootstrap' );
		if ( ! wp_next_scheduled( 'rfaheya_warm_bootstrap' ) ) {
			wp_schedule_single_event( time() + 2, 'rfaheya_warm_bootstrap' );
		}
	}
	return array( $end, $total );
}

/** How far the pack is: [done, total]. */
function rfaheya_notes_pack_progress() {
	list( $list, $hash ) = rfaheya_notes_pack();
	$state               = get_option( 'rfaheya_notes_pack', array() );
	$done                = ( is_array( $state ) && isset( $state['hash'], $state['done'] ) && $state['hash'] === $hash ) ? (int) $state['done'] : 0;
	return array( min( $done, count( $list ) ), count( $list ) );
}

add_action(
	'wp_ajax_rfaheya_notes_pack',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not allowed', 403 );
		}
		check_ajax_referer( 'rfaheya_notes_pack' );
		list( $done, $total ) = rfaheya_notes_pack_step();
		wp_send_json_success(
			array(
				'done'  => $done,
				'total' => $total,
			)
		);
	}
);

/** While the pack isn't in yet: a notice with a progress bar that fills it in, a batch at a time. */
add_action(
	'admin_notices',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		list( $done, $total ) = rfaheya_notes_pack_progress();
		if ( ! $total || $done >= $total ) {
			return;
		}
		$nonce = wp_create_nonce( 'rfaheya_notes_pack' );
		?>
		<div class="notice notice-info" id="rfaheya-notes-pack">
			<p><strong>Rfaheya:</strong> adding <?php echo esc_html( $total ); ?> fragrance note pictures to <em>Products → Fragrance notes</em>… <span class="rf-np-count"><?php echo esc_html( $done . ' / ' . $total ); ?></span> — keep this page open for a minute.</p>
			<p style="max-width:420px;height:8px;background:#f0e6d6;border-radius:99px;overflow:hidden"><span class="rf-np-bar" style="display:block;height:100%;width:<?php echo esc_attr( (string) round( $done / $total * 100 ) ); ?>%;background:#e49b2d;transition:width .3s"></span></p>
		</div>
		<script>
		(function () {
			var box = document.getElementById('rfaheya-notes-pack');
			var tries = 0;
			function step() {
				var body = new FormData();
				body.append('action', 'rfaheya_notes_pack');
				body.append('_ajax_nonce', <?php echo wp_json_encode( $nonce ); ?>);
				fetch(<?php echo wp_json_encode( admin_url( 'admin-ajax.php' ) ); ?>, { method: 'POST', body: body, credentials: 'same-origin' })
					.then(function (r) { return r.json(); })
					.then(function (r) {
						if (!r || !r.success) throw new Error('failed');
						tries = 0;
						box.querySelector('.rf-np-count').textContent = r.data.done + ' / ' + r.data.total;
						box.querySelector('.rf-np-bar').style.width = Math.round(r.data.done / r.data.total * 100) + '%';
						if (r.data.done < r.data.total) step();
						else box.innerHTML = '<p><strong>Rfaheya:</strong> all ' + r.data.total + ' note pictures are in <a href="<?php echo esc_url( admin_url( 'edit-tags.php?taxonomy=rfaheya_note&post_type=product' ) ); ?>">Products → Fragrance notes</a>. ✓</p>';
					})
					.catch(function () { if (++tries < 4) setTimeout(step, 2000); });
			}
			step();
		})();
		</script>
		<?php
	}
);

/* -------------------------------------------------------------------------
 * The storefront's own My Account page (/account): sign in, create an account,
 * forgotten password, orders, addresses and details, all inside the site
 * with its header and footer. WordPress's /my-account/ sends visitors there;
 * Google / Facebook sign-in and the password-reset email link still pass
 * through it first.
 * ---------------------------------------------------------------------- */

/** The customer data plus a nonce for the account actions. */
function rfaheya_account_me() {
	$me = rfaheya_me_data();
	// Google / Facebook sign-in, when their keys are filled in (Settings → Rfaheya Store).
	$me['social'] = array();
	foreach ( rfaheya_oauth_providers() as $name => $p ) {
		$me['social'][] = array(
			'name'  => $p['label'],
			'url'   => add_query_arg( 'rfaheya_login', $name, home_url( '/my-account/' ) ),
		);
	}
	if ( ! empty( $me['loggedIn'] ) ) {
		$me['accountNonce'] = wp_create_nonce( 'rfaheya_account' );
	}
	return $me;
}

function rfaheya_account_fail( $message ) {
	nocache_headers();
	wp_send_json( array( 'error' => $message ) );
}

function rfaheya_account_ok( $extra = array() ) {
	nocache_headers();
	wp_send_json( array_merge( array( 'ok' => true ), $extra ) );
}

/** Passwords must not be trimmed or otherwise normalised. */
function rfaheya_password_post() {
	return isset( $_POST['password'] ) && is_string( $_POST['password'] ) ? wp_unslash( $_POST['password'] ) : '';
}

/** POST field, trimmed. */
function rfaheya_post( $key ) {
	return isset( $_POST[ $key ] ) ? trim( (string) wp_unslash( $_POST[ $key ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitised by the callers
}

foreach ( array( 'wp_ajax_rfaheya_account_me', 'wp_ajax_nopriv_rfaheya_account_me' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			nocache_headers();
			wp_send_json( rfaheya_account_me() );
		}
	);
}

foreach ( array( 'wp_ajax_rfaheya_login', 'wp_ajax_nopriv_rfaheya_login' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			$login    = sanitize_text_field( rfaheya_post( 'email' ) );
			$password = rfaheya_password_post();
			if ( '' === $login || '' === $password ) {
				rfaheya_account_fail( 'Enter your email and password.' );
			}
			if ( strlen( $password ) > 200 ) {
				rfaheya_account_fail( 'Incorrect email or password.' );
			}
			if ( is_email( $login ) ) {
				$found = get_user_by( 'email', $login );
				if ( $found ) {
					$login = $found->user_login;
				}
			}
			$user = wp_signon(
				array(
					'user_login'    => $login,
					'user_password' => $password,
					'remember'      => true,
				),
				is_ssl()
			);
			if ( is_wp_error( $user ) ) {
				rfaheya_account_fail( 'rfaheya_locked' === $user->get_error_code() ? $user->get_error_message() : 'Incorrect email or password.' );
			}
			rfaheya_account_ok();
		}
	);
}

/**
 * Makes a customer account. Not through WooCommerce's register form checks: other plugins
 * add their own required fields there (a "full name" box, a captcha…) that this page's
 * sign-up and the checkout never send, which made every sign-up fail. This page checks
 * the name, number, email and password itself.
 */
function rfaheya_make_customer( $email, $password, $first = '', $last = '' ) {
	$email = sanitize_email( $email );
	if ( ! is_email( $email ) ) {
		return new WP_Error( 'rf_email', 'Enter a valid email.' );
	}
	if ( email_exists( $email ) ) {
		return new WP_Error( 'rf_exists', 'An account with this email already exists. Sign in instead.' );
	}
	$username = function_exists( 'wc_create_new_customer_username' ) ? wc_create_new_customer_username( $email, array( 'first_name' => $first, 'last_name' => $last ) ) : '';
	if ( ! $username || username_exists( $username ) ) {
		$base     = sanitize_user( current( explode( '@', $email ) ), true );
		$base     = $base ? $base : 'customer';
		$username = $base;
		for ( $i = 1; username_exists( $username ); $i++ ) {
			$username = $base . $i;
		}
	}
	$data = array(
		'user_login'   => $username,
		'user_pass'    => $password,
		'user_email'   => $email,
		'first_name'   => $first,
		'last_name'    => $last,
		'display_name' => trim( $first . ' ' . $last ) ? trim( $first . ' ' . $last ) : $username,
		'role'         => get_role( 'customer' ) ? 'customer' : get_option( 'default_role', 'subscriber' ),
	);
	$id = wp_insert_user( $data );
	if ( is_wp_error( $id ) ) {
		return $id;
	}
	// WooCommerce's own follow-ups (the "new account" email, customer data); our hook saves the name and WhatsApp.
	do_action( 'woocommerce_created_customer', $id, $data, false );
	return $id;
}

foreach ( array( 'wp_ajax_rfaheya_register', 'wp_ajax_nopriv_rfaheya_register' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			if ( ! function_exists( 'wc_create_new_customer' ) ) {
				rfaheya_account_fail( 'Accounts are not available right now.' );
			}
			// A hidden field people never see: bots fill it in.
			if ( '' !== rfaheya_post( 'website' ) ) {
				rfaheya_account_fail( 'Something went wrong. Please try again.' );
			}
			rfaheya_rate_limit( 'register', rfaheya_client_ip(), 5, HOUR_IN_SECONDS );
			$email    = sanitize_email( rfaheya_post( 'email' ) );
			$password = rfaheya_password_post();
			$first    = sanitize_text_field( rfaheya_post( 'firstName' ) );
			$last     = sanitize_text_field( rfaheya_post( 'lastName' ) );
			if ( '' === $first && '' !== rfaheya_post( 'fullName' ) ) {
				$parts = preg_split( '/\s+/', sanitize_text_field( rfaheya_post( 'fullName' ) ), 2 );
				$first = $parts[0];
				$last  = isset( $parts[1] ) ? $parts[1] : '';
			}
			if ( '' === $first ) {
				rfaheya_account_fail( 'Please write your name.' );
			}
			$phone    = sanitize_text_field( rfaheya_post( 'phone' ) );
			if ( ! is_email( $email ) ) {
				rfaheya_account_fail( 'Enter a valid email.' );
			}
			if ( strlen( $password ) < 8 || strlen( $password ) > 200 ) {
				rfaheya_account_fail( 'Password must be at least 8 characters.' );
			}
			if ( email_exists( $email ) ) {
				rfaheya_account_fail( 'An account with this email already exists. Sign in instead.' );
			}
			// The fields the register checks and the new-customer hook read (name and WhatsApp).
			$_POST['rf_full_name'] = trim( $first . ' ' . $last );
			$_POST['rf_phone']     = $phone;
			// This page checks the name and number itself; the old form's check stays out of it.
			$GLOBALS['rfaheya_account_register'] = true;
			$id = rfaheya_make_customer( $email, $password, $first, $last );
			unset( $GLOBALS['rfaheya_account_register'] );
			if ( is_wp_error( $id ) ) {
				rfaheya_account_fail( wp_strip_all_tags( $id->get_error_message() ) );
			}
			foreach ( array(
				'billing_first_name' => $first,
				'billing_last_name'  => $last,
				'billing_phone'      => $phone,
				'billing_email'      => $email,
			) as $key => $value ) {
				if ( '' !== $value ) {
					update_user_meta( $id, $key, $value );
				}
			}
			wc_set_customer_auth_cookie( $id );
			rfaheya_account_ok();
		}
	);
}

foreach ( array( 'wp_ajax_rfaheya_lost_password', 'wp_ajax_nopriv_rfaheya_lost_password' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			$email = sanitize_email( rfaheya_post( 'email' ) );
			if ( ! is_email( $email ) ) {
				rfaheya_account_fail( 'Enter a valid email.' );
			}
			rfaheya_rate_limit( 'lost', rfaheya_client_ip(), 6, HOUR_IN_SECONDS );
			rfaheya_rate_limit( 'lost-mail', strtolower( $email ), 3, HOUR_IN_SECONDS );
			$user = get_user_by( 'email', $email );
			if ( $user && function_exists( 'retrieve_password' ) ) {
				retrieve_password( $user->user_login );
			}
			// The same answer either way: no hint whether an account exists.
			rfaheya_account_ok( array( 'message' => 'If an account exists for this email, a link to choose a new password is on its way.' ) );
		}
	);
}

foreach ( array( 'wp_ajax_rfaheya_reset_password', 'wp_ajax_nopriv_rfaheya_reset_password' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			rfaheya_rate_limit( 'reset', rfaheya_client_ip(), 10, HOUR_IN_SECONDS );
			$key      = rfaheya_post( 'key' );
			$login    = rfaheya_post( 'login' );
			$password = rfaheya_password_post();
			if ( '' === $login && ctype_digit( rfaheya_post( 'id' ) ) ) {
				$by_id = get_user_by( 'id', (int) rfaheya_post( 'id' ) );
				$login = $by_id ? $by_id->user_login : '';
			}
			if ( strlen( $password ) < 8 || strlen( $password ) > 200 ) {
				rfaheya_account_fail( 'Password must be at least 8 characters.' );
			}
			$user = check_password_reset_key( $key, $login );
			if ( is_wp_error( $user ) ) {
				rfaheya_account_fail( 'This link has expired. Ask for a new one.' );
			}
			reset_password( $user, $password );
			// Anyone still signed in with the old password is signed out.
			WP_Session_Tokens::get_instance( $user->ID )->destroy_all();
			wp_set_auth_cookie( $user->ID, true, is_ssl() );
			rfaheya_account_ok();
		}
	);
}

add_action(
	'wp_ajax_rfaheya_logout',
	function () {
		check_ajax_referer( 'rfaheya_account' );
		wp_logout();
		rfaheya_account_ok();
	}
);

/** The signed-in customer's orders, address and details. */
add_action(
	'wp_ajax_rfaheya_account_data',
	function () {
		check_ajax_referer( 'rfaheya_account' );
		$user     = wp_get_current_user();
		$customer = new WC_Customer( $user->ID );
		$orders   = array();
		foreach ( wc_get_orders(
			array(
				'customer_id' => $user->ID,
				'limit'       => 30,
				'orderby'     => 'date',
				'order'       => 'DESC',
			)
		) as $order ) {
			$items = array();
			foreach ( $order->get_items() as $item ) {
				$product = $item->get_product();
				$image   = $product ? wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ) : '';
				$items[] = array(
					'name'     => $item->get_name(),
					'quantity' => (int) $item->get_quantity(),
					'total'    => (float) $order->get_line_total( $item, true ),
					'image'    => $image ? $image : '',
				);
			}
			$created  = $order->get_date_created();
			$orders[] = array(
				'id'       => $order->get_id(),
				'number'   => '#' . $order->get_order_number(),
				'date'     => $created ? $created->date( 'c' ) : '',
				'status'   => wc_get_order_status_name( $order->get_status() ),
				'statusKey'=> $order->get_status(),
				'total'    => (float) $order->get_total(),
				'shipping' => (float) $order->get_shipping_total(),
				'discount' => (float) $order->get_discount_total(),
				'payment'  => $order->get_payment_method_title(),
				'address'  => trim( implode( ', ', array_filter( array( $order->get_billing_address_1(), $order->get_billing_city(), $order->get_billing_state() ) ) ) ),
				'items'    => $items,
			);
		}
		nocache_headers();
		wp_send_json(
			array(
				'orders'  => $orders,
				'details' => array(
					'firstName' => $customer->get_first_name() ? $customer->get_first_name() : $customer->get_billing_first_name(),
					'lastName'  => $customer->get_last_name() ? $customer->get_last_name() : $customer->get_billing_last_name(),
					'email'     => $user->user_email,
					'phone'     => $customer->get_billing_phone(),
					'address'   => $customer->get_billing_address_1(),
					'area'      => $customer->get_billing_city(),
					'governorate' => $customer->get_billing_state(),
				),
			)
		);
	}
);

/** Saves name, phone, address, email and (with the current one) a new password. */
add_action(
	'wp_ajax_rfaheya_save_account',
	function () {
		check_ajax_referer( 'rfaheya_account' );
		$user     = wp_get_current_user();
		$customer = new WC_Customer( $user->ID );
		$first    = sanitize_text_field( rfaheya_post( 'firstName' ) );
		$last     = sanitize_text_field( rfaheya_post( 'lastName' ) );
		$email    = sanitize_email( rfaheya_post( 'email' ) );
		if ( '' === $first ) {
			rfaheya_account_fail( 'Please enter your first name.' );
		}
		if ( ! is_email( $email ) ) {
			rfaheya_account_fail( 'Enter a valid email.' );
		}
		$taken = email_exists( $email );
		if ( $taken && (int) $taken !== (int) $user->ID ) {
			rfaheya_account_fail( 'Another account already uses this email.' );
		}
		$new_password  = rfaheya_post( 'newPassword' );
		$email_changed = strtolower( $email ) !== strtolower( $user->user_email );
		if ( '' !== $new_password && ( strlen( $new_password ) < 8 || strlen( $new_password ) > 200 ) ) {
			rfaheya_account_fail( 'The new password must be at least 8 characters.' );
		}
		// A new password or a new email (the key to the account) needs the current password.
		if ( '' !== $new_password || $email_changed ) {
			rfaheya_rate_limit( 'confirm', (string) $user->ID, 8, 15 * MINUTE_IN_SECONDS );
			if ( ! wp_check_password( rfaheya_post( 'currentPassword' ), $user->user_pass, $user->ID ) ) {
				rfaheya_account_fail( $email_changed && '' === $new_password ? 'To change your email, enter your current password.' : 'Your current password is not right.' );
			}
		}
		$customer->set_first_name( $first );
		$customer->set_last_name( $last );
		$customer->set_billing_first_name( $first );
		$customer->set_billing_last_name( $last );
		$customer->set_billing_phone( sanitize_text_field( rfaheya_post( 'phone' ) ) );
		$customer->set_billing_email( $email );
		$customer->set_billing_address_1( sanitize_text_field( rfaheya_post( 'address' ) ) );
		$customer->set_billing_city( sanitize_text_field( rfaheya_post( 'area' ) ) );
		$customer->set_billing_state( sanitize_text_field( rfaheya_post( 'governorate' ) ) );
		$customer->set_billing_country( 'EG' );
		$customer->set_shipping_first_name( $first );
		$customer->set_shipping_last_name( $last );
		$customer->set_shipping_address_1( sanitize_text_field( rfaheya_post( 'address' ) ) );
		$customer->set_shipping_city( sanitize_text_field( rfaheya_post( 'area' ) ) );
		$customer->set_shipping_state( sanitize_text_field( rfaheya_post( 'governorate' ) ) );
		$customer->set_shipping_country( 'EG' );
		$customer->save();
		$update = array(
			'ID'           => $user->ID,
			'user_email'   => $email,
			'display_name' => trim( $first . ' ' . $last ),
		);
		if ( '' !== $new_password ) {
			$update['user_pass'] = $new_password;
		}
		$saved = wp_update_user( $update );
		if ( is_wp_error( $saved ) ) {
			rfaheya_account_fail( wp_strip_all_tags( $saved->get_error_message() ) );
		}
		if ( '' !== $new_password ) {
			// A new password signs the other sessions out; this one stays signed in.
			wp_set_auth_cookie( $user->ID, true, is_ssl() );
		}
		rfaheya_account_ok();
	}
);

/** WordPress's /my-account/ now opens the site's account page. */
add_action(
	'template_redirect',
	function () {
		if ( ! rfaheya_is_account() ) {
			return;
		}
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- read-only routing
		if ( isset( $_GET['rfaheya_login'] ) || isset( $_GET['rfaheya_oauth'] ) ) {
			return; // Google / Facebook sign-in finishes here first.
		}
		$target = home_url( '/account' );
		if ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'lost-password' ) && isset( $_GET['key'] ) ) {
			$target = add_query_arg(
				array(
					'reset' => rawurlencode( sanitize_text_field( wp_unslash( $_GET['key'] ) ) ),
					'login' => isset( $_GET['login'] ) ? rawurlencode( sanitize_text_field( wp_unslash( $_GET['login'] ) ) ) : '',
					'id'    => isset( $_GET['id'] ) ? (int) $_GET['id'] : '',
				),
				$target
			);
		} elseif ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'customer-logout' ) ) {
			wp_logout();
		} elseif ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'view-order' ) ) {
			global $wp;
			$target = add_query_arg( 'order', (int) ( isset( $wp->query_vars['view-order'] ) ? $wp->query_vars['view-order'] : 0 ), $target );
		}
		// phpcs:enable
		// Messages from a social sign-in (e.g. "not available") are shown by the account page itself.
		wp_safe_redirect( $target );
		exit;
	},
	5
);

/* -------------------------------------------------------------------------
 * Offers (Products → Discount rules). Two families:
 *  - price offers (% off, EGP off, a fixed price) change the product's own price in
 *    WooCommerce, so the store shows it struck through and the cart charges it;
 *  - cart offers are worked out on the cart: buy X get Y (free or % off; the customer
 *    pays for the dearer bottles), any X for a set price, quantity discounts, spend X
 *    save Y, a free gift and free shipping. They show as their own line in the cart,
 *    checkout and order.
 * Every offer can be limited to products, sizes and categories, and to dates.
 * ------------------------------------------------------------------------- */

const RFAHEYA_DISCOUNTS = 'rfaheya_discount_rules';

/** The kinds of offer: id => array( label, short description, family ). */
function rfaheya_offer_kinds() {
	return array(
		'percent'       => array( '% off', 'A percentage off the price of the chosen bottles.', 'price' ),
		'amount'        => array( 'EGP off', 'An amount off each chosen bottle.', 'price' ),
		'fixed'         => array( 'Fixed price', 'The chosen bottles sell at one price.', 'price' ),
		'bogo'          => array( 'Buy X get Y', 'Buy some, get more free or at a discount — e.g. buy 1 get 1 free, buy 2 get the 3rd at 50%. The customer pays for the dearer bottles; the cheaper ones are the free ones.', 'cart' ),
		'set_price'     => array( 'Any X for a price', 'Any number of chosen bottles for one price — e.g. any 3 for 1,500 EGP.', 'cart' ),
		'qty_tiers'     => array( 'Quantity discount', 'The more chosen bottles in the cart, the bigger the percentage off — e.g. 2 = 10%, 3 = 15%.', 'cart' ),
		'spend'         => array( 'Spend X, save Y', 'Spend an amount on the chosen bottles and get a percentage or an amount off them.', 'cart' ),
		'gift'          => array( 'Free gift', 'A product added to the cart for free once the cart qualifies (it leaves again if it no longer does).', 'cart' ),
		'free_shipping' => array( 'Free shipping', 'Free delivery once the cart qualifies.', 'cart' ),
	);
}

/** The saved offers (older rules, from before the kinds, read as % / EGP off). */
function rfaheya_discount_rules() {
	$rules = get_option( RFAHEYA_DISCOUNTS, array() );
	$out   = array();
	foreach ( is_array( $rules ) ? $rules : array() as $rule ) {
		if ( ! is_array( $rule ) ) {
			continue;
		}
		if ( empty( $rule['kind'] ) ) {
			$rule['kind'] = 'amount' === ( $rule['type'] ?? '' ) ? 'amount' : 'percent';
		}
		$out[] = $rule;
	}
	return $out;
}

/** Whether an offer is on right now (switched on, complete, and inside its dates if it has any). */
function rfaheya_rule_live( $rule, $now = null ) {
	$now  = null === $now ? current_time( 'timestamp' ) : $now; // phpcs:ignore WordPress.DateTime.CurrentTimeTimestamp.Requested -- compared with dates typed in the store's time zone
	$kind = $rule['kind'] ?? ( 'amount' === ( $rule['type'] ?? '' ) ? 'amount' : 'percent' );
	if ( empty( $rule['enabled'] ) ) {
		return false;
	}
	$value = (float) ( $rule['value'] ?? 0 );
	$ok    = true;
	switch ( $kind ) {
		case 'percent':
		case 'amount':
		case 'fixed':
		case 'set_price':
			$ok = $value > 0 && ( 'set_price' !== $kind || (int) ( $rule['buy'] ?? 0 ) >= 2 );
			break;
		case 'bogo':
			$ok = (int) ( $rule['buy'] ?? 0 ) >= 1 && (int) ( $rule['get'] ?? 0 ) >= 1 && (float) ( $rule['get_off'] ?? 100 ) > 0;
			break;
		case 'qty_tiers':
			$ok = (bool) rfaheya_rule_tiers( $rule );
			break;
		case 'spend':
			$ok = $value > 0 && (float) ( $rule['min_spend'] ?? 0 ) > 0;
			break;
		case 'gift':
			$ok = (int) ( $rule['gift'] ?? 0 ) > 0;
			break;
	}
	if ( ! $ok ) {
		return false;
	}
	if ( ! empty( $rule['start'] ) && $now < strtotime( $rule['start'] . ' 00:00:00' ) ) {
		return false;
	}
	if ( ! empty( $rule['end'] ) && $now > strtotime( $rule['end'] . ' 23:59:59' ) ) {
		return false;
	}
	return true;
}

/** A quantity discount's steps: array( array( bottles, percent ) ), fewest first. */
function rfaheya_rule_tiers( $rule ) {
	$tiers = array();
	foreach ( preg_split( '/\R/', (string) ( $rule['tiers'] ?? '' ) ) as $line ) {
		if ( preg_match( '/^\s*(\d+)\s*[=:]\s*(\d+(?:\.\d+)?)\s*%?\s*$/', $line, $m ) && (int) $m[1] >= 1 && (float) $m[2] > 0 ) {
			$tiers[ (int) $m[1] ] = min( 100, (float) $m[2] );
		}
	}
	ksort( $tiers );
	$out = array();
	foreach ( $tiers as $count => $percent ) {
		$out[] = array( $count, $percent );
	}
	return $out;
}

/** The product id offers are written for (with WPML, the English / main-language product). */
function rfaheya_rule_product_id( $id ) {
	if ( has_filter( 'wpml_object_id' ) ) {
		$languages = (array) apply_filters( 'wpml_active_languages', null, array( 'skip_missing' => 0 ) );
		$main      = isset( $languages['en'] ) ? 'en' : (string) apply_filters( 'wpml_default_language', null );
		if ( $main ) {
			$id = (int) apply_filters( 'wpml_object_id', $id, 'product', true, $main );
		}
	}
	return (int) $id;
}

/** Whether a product (or one of its sizes) is covered by an offer's products / sizes / categories ($prefix 'get_' for the free side of buy X get Y). */
function rfaheya_rule_covers( $rule, $product, $prefix = '' ) {
	static $cats = array();
	if ( ! $product instanceof WC_Product ) {
		return false;
	}
	$parent = $product->is_type( 'variation' ) ? $product->get_parent_id() : $product->get_id();
	$ids    = array_map( 'intval', (array) ( $rule[ $prefix . 'products' ] ?? array() ) );
	if ( $ids && ! in_array( rfaheya_rule_product_id( $parent ), $ids, true ) && ! in_array( (int) $parent, $ids, true ) ) {
		return false;
	}
	$sizes = array_map( 'rfaheya_size_key', (array) ( $rule[ $prefix . 'sizes' ] ?? array() ) );
	if ( $sizes ) {
		$size = $product->is_type( 'variation' ) ? rfaheya_size_key( $product->get_attribute( 'size' ) ? $product->get_attribute( 'size' ) : $product->get_attribute( 'pa_size' ) ) : '';
		if ( '' === $size || ! in_array( $size, $sizes, true ) ) {
			return false;
		}
	}
	$want = array_map( 'intval', (array) ( $rule[ $prefix . 'categories' ] ?? array() ) );
	if ( $want ) {
		if ( ! isset( $cats[ $parent ] ) ) {
			$cats[ $parent ] = array_map( 'intval', wc_get_product_term_ids( rfaheya_rule_product_id( $parent ), 'product_cat' ) );
		}
		if ( ! array_intersect( $want, $cats[ $parent ] ) ) {
			return false;
		}
	}
	return true;
}

/** The biggest discount (in money) the live price offers give this product at this price. */
function rfaheya_rule_discount( $product, $price ) {
	static $cache = array();
	$price = (float) $price;
	if ( $price <= 0 || ! $product instanceof WC_Product ) {
		return 0;
	}
	$key = $product->get_id() . '|' . $price;
	if ( isset( $cache[ $key ] ) ) {
		return $cache[ $key ];
	}
	$best = 0;
	foreach ( rfaheya_discount_rules() as $rule ) {
		if ( ! in_array( $rule['kind'], array( 'percent', 'amount', 'fixed' ), true ) || ! rfaheya_rule_live( $rule ) || ! rfaheya_rule_covers( $rule, $product ) ) {
			continue;
		}
		$value = (float) $rule['value'];
		if ( 'fixed' === $rule['kind'] ) {
			$off = $price - $value;
		} elseif ( 'amount' === $rule['kind'] ) {
			$off = $value;
		} else {
			$off = $price * min( 100, $value ) / 100;
		}
		$best = max( $best, min( $price, round( $off ) ) );
	}
	$cache[ $key ] = $best;
	return $best;
}

/** The price after the price offers (unchanged when none applies). */
function rfaheya_ruled_price( $price, $product ) {
	if ( '' === $price || null === $price || is_admin() && ! wp_doing_ajax() && ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return $price;
	}
	$off = rfaheya_rule_discount( $product, $price );
	return $off > 0 ? (string) max( 0, (float) $price - $off ) : $price;
}

foreach ( array( 'woocommerce_product_get_price', 'woocommerce_product_variation_get_price' ) as $rfaheya_hook ) {
	add_filter( $rfaheya_hook, 'rfaheya_ruled_price', 50, 2 );
}
foreach ( array( 'woocommerce_product_get_sale_price', 'woocommerce_product_variation_get_sale_price' ) as $rfaheya_hook ) {
	add_filter(
		$rfaheya_hook,
		function ( $sale, $product ) {
			$base = '' !== $sale && null !== $sale ? $sale : $product->get_regular_price();
			$new  = rfaheya_ruled_price( $base, $product );
			return (string) $new !== (string) $base ? $new : $sale;
		},
		50,
		2
	);
}
// The price ranges WooCommerce keeps for variable products.
foreach ( array( 'woocommerce_variation_prices_price', 'woocommerce_variation_prices_sale_price' ) as $rfaheya_hook ) {
	add_filter(
		$rfaheya_hook,
		fn( $price, $variation ) => rfaheya_ruled_price( $price, $variation ),
		50,
		2
	);
}
add_filter(
	'woocommerce_get_variation_prices_hash',
	function ( $hash ) {
		$hash[] = md5( wp_json_encode( array( rfaheya_discount_rules(), gmdate( 'Y-m-d' ) ) ) );
		return $hash;
	}
);
add_filter(
	'woocommerce_product_is_on_sale',
	function ( $on_sale, $product ) {
		return $on_sale || ( $product instanceof WC_Product && ! $product->is_type( 'variable' ) && rfaheya_rule_discount( $product, $product->get_regular_price() ) > 0 );
	},
	50,
	2
);

// ---------------------------------------------------------------- cart offers

/** The live cart offers. */
function rfaheya_cart_offers( $kinds = null ) {
	$out = array();
	foreach ( rfaheya_discount_rules() as $rule ) {
		$family = rfaheya_offer_kinds()[ $rule['kind'] ][2] ?? 'price';
		if ( 'cart' === $family && rfaheya_rule_live( $rule ) && ( null === $kinds || in_array( $rule['kind'], (array) $kinds, true ) ) ) {
			$out[] = $rule;
		}
	}
	return $out;
}

/** Whether a product is on a sale (price offer) set not to take other discounts on top. */
function rfaheya_on_sale_only( $product ) {
	static $cache = array();
	if ( ! $product instanceof WC_Product ) {
		return false;
	}
	$id = $product->get_id();
	if ( ! isset( $cache[ $id ] ) ) {
		$cache[ $id ] = false;
		foreach ( rfaheya_discount_rules() as $rule ) {
			if ( empty( $rule['stack'] ) && in_array( $rule['kind'], array( 'percent', 'amount', 'fixed' ), true ) && rfaheya_rule_live( $rule ) && rfaheya_rule_covers( $rule, $product ) ) {
				$cache[ $id ] = true;
				break;
			}
		}
	}
	return $cache[ $id ];
}

/** Bottle by bottle, the cart lines an offer covers: array( array( 'price' => …, 'key' => … ) ). Free gifts never count. */
function rfaheya_offer_units( $cart, $rule, $prefix = '' ) {
	$units = array();
	$set   = rfaheya_discovery_set( $cart )[3]; // samples already in a discovery set take no other offer
	foreach ( $cart->get_cart() as $key => $item ) {
		if ( ! empty( $item['rfaheya_gift'] ) || empty( $item['data'] ) || rfaheya_on_sale_only( $item['data'] ) || ! rfaheya_rule_covers( $rule, $item['data'], $prefix ) ) {
			continue;
		}
		$qty   = max( 0, (int) $item['quantity'] - (int) ( $set[ $key ] ?? 0 ) );
		$price = $qty && isset( $item['line_subtotal'] ) && '' !== $item['line_subtotal'] ? (float) $item['line_subtotal'] / $qty : (float) $item['data']->get_price();
		for ( $i = 0; $i < $qty; $i++ ) {
			$units[] = array(
				'price' => $price,
				'key'   => $key,
			);
		}
	}
	return $units;
}

/** Whether the covered part of the cart reaches an offer's minimum amount and number of bottles. */
function rfaheya_offer_qualifies( $cart, $rule ) {
	$units = rfaheya_offer_units( $cart, $rule );
	if ( ! $units ) {
		return false;
	}
	$spent = array_sum( array_column( $units, 'price' ) );
	return $spent >= (float) ( $rule['min_spend'] ?? 0 ) && count( $units ) >= max( 1, (int) ( $rule['min_qty'] ?? 1 ) );
}

/** What a cart offer takes off this cart (money). */
function rfaheya_offer_amount( $cart, $rule ) {
	$limit = max( 0, (int) ( $rule['limit'] ?? 0 ) );
	switch ( $rule['kind'] ) {
		case 'bogo':
			$buy  = max( 1, (int) $rule['buy'] );
			$get  = max( 1, (int) $rule['get'] );
			$off  = min( 100, (float) ( $rule['get_off'] ?? 100 ) ) / 100;
			$own  = empty( $rule['get_other'] );
			$paid = rfaheya_offer_units( $cart, $rule );
			if ( $own ) {
				// Every full group of buy + get bottles earns "get" free ones: always the cheapest
				// bottles in the cart, so the customer pays for the dearer ones.
				$sets = intdiv( count( $paid ), $buy + $get );
				if ( $limit ) {
					$sets = min( $sets, $limit );
				}
				usort( $paid, fn( $a, $b ) => $a['price'] <=> $b['price'] );
				$discount = 0;
				foreach ( array_slice( $paid, 0, $sets * $get ) as $u ) {
					$discount += $u['price'] * $off;
				}
				return round( $discount );
			}
			// Buy from one group, the reward from another: the cheapest of the reward group. A bottle
			// in both groups is either bought or rewarded, never both (one bottle can't pay for itself).
			$free = rfaheya_offer_units( $cart, $rule, 'get_' );
			usort( $free, fn( $a, $b ) => $a['price'] <=> $b['price'] );
			$sets = intdiv( count( $paid ), $buy );
			if ( $limit ) {
				$sets = min( $sets, $limit );
			}
			for ( ; $sets > 0; $sets-- ) {
				$reward = array_slice( $free, 0, $sets * $get );
				if ( count( $reward ) < $sets * $get ) {
					continue;
				}
				$taken = array();
				foreach ( $reward as $u ) {
					$taken[ $u['key'] ] = ( $taken[ $u['key'] ] ?? 0 ) + 1;
				}
				$left = 0;
				foreach ( $paid as $u ) {
					if ( ! empty( $taken[ $u['key'] ] ) ) {
						--$taken[ $u['key'] ];
						continue;
					}
					++$left;
				}
				if ( $left >= $sets * $buy ) {
					break;
				}
			}
			$discount = 0;
			foreach ( array_slice( $free, 0, $sets * $get ) as $u ) {
				$discount += $u['price'] * $off;
			}
			return round( $discount );
		case 'set_price':
			$size  = max( 2, (int) $rule['buy'] );
			$price = (float) $rule['value'];
			$units = rfaheya_offer_units( $cart, $rule );
			usort( $units, fn( $a, $b ) => $b['price'] <=> $a['price'] );
			$discount = 0;
			$sets     = 0;
			for ( $i = 0; $i + $size <= count( $units ); $i += $size ) {
				if ( $limit && $sets >= $limit ) {
					break;
				}
				$discount += max( 0, array_sum( array_column( array_slice( $units, $i, $size ), 'price' ) ) - $price );
				++$sets;
			}
			return round( $discount );
		case 'qty_tiers':
			$units   = rfaheya_offer_units( $cart, $rule );
			$percent = 0;
			foreach ( rfaheya_rule_tiers( $rule ) as $t ) {
				if ( count( $units ) >= $t[0] ) {
					$percent = max( $percent, $t[1] );
				}
			}
			return round( array_sum( array_column( $units, 'price' ) ) * $percent / 100 );
		case 'spend':
			$spent = array_sum( array_column( rfaheya_offer_units( $cart, $rule ), 'price' ) );
			if ( $spent < (float) $rule['min_spend'] ) {
				return 0;
			}
			$value = (float) $rule['value'];
			return round( 'amount' === ( $rule['value_type'] ?? 'percent' ) ? min( $spent, $value ) : $spent * min( 100, $value ) / 100 );
	}
	return 0;
}

/** The line an offer shows as in the cart: its name, or a description of it. */
function rfaheya_offer_label( $rule ) {
	if ( ! empty( $rule['name'] ) ) {
		return $rule['name'];
	}
	switch ( $rule['kind'] ) {
		case 'bogo':
			return sprintf( 'Buy %d get %d %s', (int) $rule['buy'], (int) $rule['get'], (float) ( $rule['get_off'] ?? 100 ) >= 100 ? 'free' : rfaheya_number( $rule['get_off'] ) . '% off' );
		case 'set_price':
			return sprintf( 'Any %d for %s EGP', (int) $rule['buy'], number_format( (float) $rule['value'] ) );
		case 'qty_tiers':
			return 'Quantity discount';
		case 'spend':
			return sprintf( 'Spend %s EGP, save %s', number_format( (float) $rule['min_spend'] ), 'amount' === ( $rule['value_type'] ?? 'percent' ) ? number_format( (float) $rule['value'] ) . ' EGP' : rfaheya_number( $rule['value'] ) . '%' );
		case 'gift':
			return 'Free gift';
		case 'free_shipping':
			return 'Free shipping';
	}
	return 'Offer';
}

/*
 * How money-off discounts go together. Each one (the bundle discount, spend more save more, the
 * first-order discount and every cart offer) either adds up with the others or not: the ones that
 * add up are given together, one that doesn't is given alone, and the order gets whichever comes
 * to more. Gifts, free shipping and sale prices have their own switch (see the offer page).
 */
function rfaheya_cart_discount_choices( $cart ) {
	$o       = rfaheya_options();
	$choices = array();
	$bundle  = rfaheya_bundle_discount( $cart );
	if ( $bundle > 0 ) {
		$choices[] = array( 'Bundle discount', $bundle, 'yes' === ( $o['bundle']['stack'] ?? 'no' ) );
	}
	$spend = rfaheya_offer_discount( rfaheya_offer_base( $cart ) );
	if ( $spend > 0 ) {
		$choices[] = array( sprintf( '%s%% off orders over %s EGP', rfaheya_number( $o['shipping']['offer_percent'] ), number_format( (float) $o['shipping']['offer_min'] ) ), $spend, 'yes' === ( $o['shipping']['offer_stack'] ?? 'no' ) );
	}
	foreach ( rfaheya_cart_offers( array( 'bogo', 'set_price', 'qty_tiers', 'spend' ) ) as $rule ) {
		$amount = rfaheya_offer_amount( $cart, $rule );
		if ( $amount > 0 ) {
			$choices[] = array( rfaheya_offer_label( $rule ), $amount, ! empty( $rule['stack'] ) );
		}
	}
	// The first-order discount competes only when it is set not to add up (otherwise it comes on top).
	if ( ! rfaheya_welcome_stacks() && function_exists( 'rfaheya_guest_welcome_percent' ) ) {
		$percent = rfaheya_guest_welcome_percent();
		$off     = round( rfaheya_offer_base( $cart ) * $percent / 100 );
		if ( $off > 0 ) {
			$choices[] = array( sprintf( 'First order · %s%% off', rfaheya_number( $percent ) ), $off, false );
		}
	}
	return $choices;
}

function rfaheya_welcome_stacks() {
	return 'no' !== ( rfaheya_options()['loyalty']['welcome_stack'] ?? 'yes' );
}

/** The discounts the order actually gets: [ [ name, amount ], … ]. */
function rfaheya_cart_applied_discounts( $cart ) {
	$choices = rfaheya_cart_discount_choices( $cart );
	$sets    = array();
	$together = array_values( array_filter( $choices, fn( $c ) => $c[2] ) );
	if ( $together ) {
		$sets[] = $together;
	}
	foreach ( $choices as $c ) {
		if ( ! $c[2] ) {
			$sets[] = array( $c );
		}
	}
	$best = array();
	$most = 0;
	foreach ( $sets as $set ) {
		$sum = array_sum( array_column( $set, 1 ) );
		if ( $sum > $most ) {
			$most = $sum;
			$best = $set;
		}
	}
	return $best;
}

/** The money the order's discounts take off (kept for the free-shipping and minimum-order checks). */
function rfaheya_cart_discount_total( $cart ) {
	return array_sum( array_column( rfaheya_cart_applied_discounts( $cart ), 1 ) ) + rfaheya_discovery_set( $cart )[0];
}

// The discovery set: its own line in the cart, on top of (never instead of) the other discounts.
add_action(
	'woocommerce_cart_calculate_fees',
	function ( $cart ) {
		list( $off, $size ) = rfaheya_discovery_set( $cart );
		if ( $off > 0 ) {
			$price = rfaheya_discovery_prices()[ 'set' . $size ];
			$cart->add_fee( sprintf( 'Discovery set · %d for %s EGP', $size, number_format( $price ) ), -$off, false );
		}
	},
	9
);

add_action(
	'woocommerce_cart_calculate_fees',
	function ( $cart ) {
		$names = array();
		$total = 0;
		foreach ( rfaheya_cart_applied_discounts( $cart ) as $d ) {
			// Two discounts with the same name would merge: the second gets a number.
			$name = $d[0];
			for ( $n = 2; isset( $names[ $name ] ); $n++ ) {
				$name = $d[0] . ' ' . $n;
			}
			$names[ $name ] = true;
			$total         += $d[1];
			$cart->add_fee( $name, -$d[1], false );
		}
		$GLOBALS['rfaheya_cart_off'] = $total;
	},
	10
);

// Free gifts: put in the cart when it qualifies (at 0), taken out when it no longer does.
add_action(
	'woocommerce_before_calculate_totals',
	function ( $cart ) {
		static $busy = false;
		if ( $busy || ! $cart instanceof WC_Cart || ( is_admin() && ! wp_doing_ajax() && ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) ) {
			return;
		}
		$busy  = true;
		$rules = rfaheya_cart_offers( 'gift' );
		$live  = array();
		foreach ( $rules as $rule ) {
			$rid = (string) ( $rule['id'] ?? '' );
			if ( '' === $rid ) {
				continue;
			}
			$live[ $rid ] = true;
			$have         = '';
			foreach ( $cart->get_cart() as $key => $item ) {
				if ( ( $item['rfaheya_gift'] ?? '' ) === $rid ) {
					$have = $key;
				}
			}
			$ok = rfaheya_offer_qualifies( $cart, $rule ) && ( ! empty( $rule['stack'] ) || ! rfaheya_cart_applied_discounts( $cart ) );
			if ( $ok && ! $have ) {
				$gift = wc_get_product( (int) $rule['gift'] );
				if ( $gift && $gift->is_purchasable() && $gift->is_in_stock() ) {
					$parent = $gift->is_type( 'variation' ) ? $gift->get_parent_id() : $gift->get_id();
					$attrs  = $gift->is_type( 'variation' ) ? wc_get_product_variation_attributes( $gift->get_id() ) : array();
					$cart->add_to_cart( $parent, 1, $gift->is_type( 'variation' ) ? $gift->get_id() : 0, $attrs, array( 'rfaheya_gift' => $rid ) );
				}
			} elseif ( ! $ok && $have ) {
				$cart->remove_cart_item( $have );
			}
		}
		foreach ( $cart->get_cart() as $key => $item ) {
			if ( empty( $item['rfaheya_gift'] ) ) {
				continue;
			}
			if ( ! isset( $live[ $item['rfaheya_gift'] ] ) ) {
				$cart->remove_cart_item( $key ); // the offer ended
				continue;
			}
			if ( (int) $item['quantity'] !== 1 ) {
				$cart->set_quantity( $key, 1, false );
			}
			$cart->cart_contents[ $key ]['data']->set_price( 0 );
		}
		$busy = false;
	},
	5
);
// The gift line says so, in the cart and on the order.
add_filter(
	'woocommerce_get_item_data',
	function ( $data, $item ) {
		if ( ! empty( $item['rfaheya_gift'] ) ) {
			$data[] = array(
				'key'   => 'Offer',
				'value' => 'Free gift',
			);
		}
		return $data;
	},
	10,
	2
);
add_action(
	'woocommerce_checkout_create_order_line_item',
	function ( $line, $key, $values ) {
		if ( ! empty( $values['rfaheya_gift'] ) ) {
			$line->add_meta_data( 'Offer', 'Free gift', true );
		}
	},
	10,
	3
);

// Free shipping offers: every delivery option costs nothing once the cart qualifies.
add_filter(
	'woocommerce_package_rates',
	function ( $rates ) {
		if ( ! $rates || ! function_exists( 'WC' ) || ! WC()->cart ) {
			return $rates;
		}
		foreach ( rfaheya_cart_offers( 'free_shipping' ) as $rule ) {
			if ( ! rfaheya_offer_qualifies( WC()->cart, $rule ) || ( empty( $rule['stack'] ) && rfaheya_cart_applied_discounts( WC()->cart ) ) ) {
				continue;
			}
			foreach ( $rates as $rate ) {
				$rate->set_cost( 0 );
				$rate->set_taxes( array() );
				if ( false === stripos( $rate->get_label(), 'free' ) ) {
					$rate->set_label( rfaheya_offer_label( $rule ) );
				}
			}
			break;
		}
		return $rates;
	},
	100
);

/**
 * What the storefront's offers bar measures, worked out here so it always agrees with checkout:
 * the amount after the order's discounts (minimum order, free shipping in Cairo & Alexandria),
 * the amount the spend-more offer is measured on, and whether a free-shipping offer applies.
 */
function rfaheya_cart_bar() {
	$cart = function_exists( 'WC' ) ? WC()->cart : null;
	if ( ! $cart instanceof WC_Cart ) {
		return array();
	}
	$free  = false;
	$label = '';
	foreach ( rfaheya_cart_offers( 'free_shipping' ) as $rule ) {
		if ( rfaheya_offer_qualifies( $cart, $rule ) && ( ! empty( $rule['stack'] ) || ! rfaheya_cart_applied_discounts( $cart ) ) ) {
			$free  = true;
			$label = rfaheya_offer_label( $rule );
			break;
		}
	}
	return array(
		'amount'       => round( max( 0, rfaheya_cart_merchandise( $cart ) - rfaheya_cart_discount_total( $cart ) ), 2 ),
		'base'         => round( rfaheya_offer_base( $cart ), 2 ),
		'freeShipping' => $free,
		'freeLabel'    => $label,
	);
}
add_action(
	'woocommerce_blocks_loaded',
	function () {
		if ( function_exists( 'woocommerce_store_api_register_endpoint_data' ) ) {
			woocommerce_store_api_register_endpoint_data(
				array(
					'endpoint'        => 'cart',
					'namespace'       => 'rfaheya',
					'data_callback'   => 'rfaheya_cart_bar',
					'schema_callback' => fn() => array(),
					'schema_type'     => ARRAY_A,
				)
			);
		}
	}
);

/** The live cart offers for the storefront (product page badges): label, what it covers. */
function rfaheya_offers_data() {
	$out = array();
	foreach ( rfaheya_cart_offers() as $rule ) {
		$out[] = array(
			'label'      => rfaheya_offer_label( $rule ),
			'note'       => (string) ( $rule['note'] ?? '' ),
			'products'   => array_values( array_map( 'intval', (array) ( $rule['products'] ?? array() ) ) ),
			'sizes'      => array_values( array_map( 'strval', (array) ( $rule['sizes'] ?? array() ) ) ),
			'categories' => array_values(
				array_filter(
					array_map(
						function ( $id ) {
							$t = get_term( (int) $id, 'product_cat' );
							return $t && ! is_wp_error( $t ) ? html_entity_decode( $t->name, ENT_QUOTES, 'UTF-8' ) : '';
						},
						(array) ( $rule['categories'] ?? array() )
					)
				)
			),
		);
	}
	return $out;
}

/** Offers start and end on their own: the storefront's copy is refreshed at those times. */
function rfaheya_schedule_rule_refresh() {
	wp_clear_scheduled_hook( 'rfaheya_rules_refresh' );
	$now = current_time( 'timestamp' ); // phpcs:ignore WordPress.DateTime.CurrentTimeTimestamp.Requested
	foreach ( rfaheya_discount_rules() as $rule ) {
		foreach ( array( array( 'start', ' 00:00:05' ), array( 'end', ' 23:59:59' ) ) as $edge ) {
			if ( ! empty( $rule[ $edge[0] ] ) ) {
				$at = strtotime( $rule[ $edge[0] ] . $edge[1] ) + ( 'end' === $edge[0] ? 2 : 0 );
				if ( $at > $now ) {
					wp_schedule_single_event( $at - ( $now - time() ), 'rfaheya_rules_refresh', array( $at ) );
				}
			}
		}
	}
}
add_action(
	'rfaheya_rules_refresh',
	function () {
		delete_transient( 'rfaheya_bootstrap' );
		rfaheya_purge_page_cache();
		rfaheya_bootstrap();
	}
);

add_action(
	'admin_menu',
	function () {
		add_submenu_page( 'edit.php?post_type=product', 'Offers & discount rules', 'Offers & discounts', 'manage_woocommerce', 'rfaheya-discounts', 'rfaheya_discounts_page' );
	}
);

/** One offer from the edit form, cleaned (its id kept, or a new one). */
function rfaheya_clean_offer( $r, $id = '' ) {
	$ids   = fn( $v ) => array_values( array_unique( array_filter( array_map( 'absint', (array) $v ) ) ) );
	$texts = fn( $v ) => array_values( array_unique( array_filter( array_map( 'sanitize_text_field', (array) $v ) ) ) );
	$date  = fn( $v ) => preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $v ) ? (string) $v : '';
	$kind  = isset( rfaheya_offer_kinds()[ $r['kind'] ?? '' ] ) ? $r['kind'] : 'percent';
	return array(
		'id'             => preg_match( '/^[a-z0-9]{6,20}$/i', (string) $id ) ? $id : strtolower( wp_generate_password( 10, false ) ),
		'name'           => sanitize_text_field( $r['name'] ?? '' ),
		'note'           => sanitize_text_field( $r['note'] ?? '' ),
		'enabled'        => ! empty( $r['enabled'] ),
		'stack'          => ! empty( $r['stack'] ),
		'kind'           => $kind,
		'value'          => max( 0, (float) ( $r['value'] ?? 0 ) ),
		'value_type'     => 'amount' === ( $r['value_type'] ?? '' ) ? 'amount' : 'percent',
		'buy'            => max( 0, (int) ( $r['buy'] ?? 0 ) ),
		'get'            => max( 0, (int) ( $r['get'] ?? 0 ) ),
		'get_off'        => min( 100, max( 0, (float) ( $r['get_off'] ?? 100 ) ) ),
		'get_other'      => ! empty( $r['get_other'] ),
		'limit'          => max( 0, (int) ( $r['limit'] ?? 0 ) ),
		'tiers'          => sanitize_textarea_field( $r['tiers'] ?? '' ),
		'min_spend'      => max( 0, (float) ( $r['min_spend'] ?? 0 ) ),
		'min_qty'        => max( 0, (int) ( $r['min_qty'] ?? 0 ) ),
		'gift'           => absint( $r['gift'] ?? 0 ),
		'products'       => $ids( $r['products'] ?? array() ),
		'sizes'          => $texts( $r['sizes'] ?? array() ),
		'categories'     => $ids( $r['categories'] ?? array() ),
		'get_products'   => $ids( $r['get_products'] ?? array() ),
		'get_sizes'      => $texts( $r['get_sizes'] ?? array() ),
		'get_categories' => $ids( $r['get_categories'] ?? array() ),
		'start'          => $date( $r['start'] ?? '' ),
		'end'            => $date( $r['end'] ?? '' ),
	);
}

/** Saves the list of offers and refreshes everything that shows prices. */
function rfaheya_store_offers( $rules ) {
	// Older offers saved before they had an id get one now (edit / delete find them by it).
	foreach ( $rules as $i => $rule ) {
		if ( empty( $rule['id'] ) ) {
			$rules[ $i ]['id'] = strtolower( wp_generate_password( 10, false ) );
		}
	}
	update_option( RFAHEYA_DISCOUNTS, array_values( $rules ), false );
	rfaheya_schedule_rule_refresh();
	if ( function_exists( 'wc_delete_product_transients' ) ) {
		wc_delete_product_transients();
	}
	delete_transient( 'rfaheya_bootstrap' );
	rfaheya_purge_page_cache();
}

/** The offers, each with an id (older ones get theirs saved). */
function rfaheya_offers_with_ids() {
	$rules = rfaheya_discount_rules();
	foreach ( $rules as $rule ) {
		if ( empty( $rule['id'] ) ) {
			rfaheya_store_offers( $rules );
			return rfaheya_discount_rules();
		}
	}
	return $rules;
}

function rfaheya_offers_url( $args = array() ) {
	return add_query_arg( array_merge( array( 'post_type' => 'product', 'page' => 'rfaheya-discounts' ), $args ), admin_url( 'edit.php' ) );
}

// Save one offer (new or edited).
add_action(
	'admin_post_rfaheya_save_offer',
	function () {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'Sorry, you are not allowed to change offers.' );
		}
		check_admin_referer( 'rfaheya_save_offer' );
		$input = isset( $_POST['offer'] ) && is_array( $_POST['offer'] ) ? wp_unslash( $_POST['offer'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned in rfaheya_clean_offer
		$id    = isset( $_POST['offer_id'] ) ? sanitize_key( wp_unslash( $_POST['offer_id'] ) ) : '';
		$offer = rfaheya_clean_offer( $input, $id );
		$rules = rfaheya_offers_with_ids();
		$found = false;
		foreach ( $rules as $i => $rule ) {
			if ( $rule['id'] === $offer['id'] ) {
				$rules[ $i ] = $offer;
				$found       = true;
			}
		}
		if ( ! $found ) {
			$rules[] = $offer;
		}
		rfaheya_store_offers( $rules );
		wp_safe_redirect( rfaheya_offers_url( array( 'saved' => $offer['id'] ) ) );
		exit;
	}
);

// Delete, switch on / off, or duplicate an offer from the list.
add_action(
	'admin_post_rfaheya_offer_action',
	function () {
		$id   = isset( $_GET['offer'] ) ? sanitize_key( wp_unslash( $_GET['offer'] ) ) : '';
		$what = isset( $_GET['do'] ) ? sanitize_key( wp_unslash( $_GET['do'] ) ) : '';
		if ( ! current_user_can( 'manage_woocommerce' ) || ! $id ) {
			wp_die( 'Sorry, you are not allowed to change offers.' );
		}
		check_admin_referer( 'rfaheya_offer_' . $what . '_' . $id );
		$rules = rfaheya_offers_with_ids();
		$out   = array();
		$note  = '';
		foreach ( $rules as $rule ) {
			if ( $rule['id'] !== $id ) {
				$out[] = $rule;
				continue;
			}
			if ( 'delete' === $what ) {
				$note = 'deleted';
				continue;
			}
			if ( 'toggle' === $what ) {
				$rule['enabled'] = empty( $rule['enabled'] );
				$note            = $rule['enabled'] ? 'on' : 'off';
			}
			$out[] = $rule;
			if ( 'duplicate' === $what ) {
				$copy            = $rule;
				$copy['id']      = strtolower( wp_generate_password( 10, false ) );
				$copy['name']    = trim( ( $rule['name'] ? $rule['name'] : rfaheya_offer_label( $rule ) ) . ' (copy)' );
				$copy['enabled'] = false;
				$out[]           = $copy;
				$note            = 'copied';
			}
		}
		rfaheya_store_offers( $out );
		wp_safe_redirect( rfaheya_offers_url( array( 'done' => $note ) ) );
		exit;
	}
);

function rfaheya_offer_action_url( $id, $what ) {
	return wp_nonce_url( admin_url( 'admin-post.php?action=rfaheya_offer_action&do=' . $what . '&offer=' . rawurlencode( $id ) ), 'rfaheya_offer_' . $what . '_' . $id );
}

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'product_page_rfaheya-discounts' !== $hook ) {
			return;
		}
		wp_enqueue_style( 'rfaheya-settings', WPMU_PLUGIN_URL . '/rfaheya-admin/settings.css', array(), rfaheya_admin_asset_version( 'settings.css' ) );
		wp_enqueue_script( 'rfaheya-discounts', WPMU_PLUGIN_URL . '/rfaheya-admin/discounts.js', array(), rfaheya_admin_asset_version( 'discounts.js' ), true );
	}
);

/** Every size the store's products come in, e.g. "10 ML", "50 ML", "100 ML". */
function rfaheya_all_sizes() {
	$sizes = array();
	foreach ( array( 'pa_size', 'size' ) as $tax ) {
		if ( taxonomy_exists( $tax ) ) {
			foreach ( get_terms( array( 'taxonomy' => $tax, 'hide_empty' => false ) ) as $term ) {
				$sizes[ rfaheya_size_key( $term->name ) ] = rfaheya_size_label( $term->name );
			}
		}
	}
	// Sizes typed on the products themselves (custom attributes).
	global $wpdb;
	$values = $wpdb->get_col( "SELECT DISTINCT meta_value FROM {$wpdb->postmeta} WHERE meta_key IN ('attribute_size','attribute_pa_size') AND meta_value <> '' LIMIT 200" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	foreach ( $values as $v ) {
		$key = rfaheya_size_key( $v );
		if ( '' !== $key && ! isset( $sizes[ $key ] ) ) {
			$sizes[ $key ] = rfaheya_size_label( $v );
		}
	}
	uasort( $sizes, fn( $a, $b ) => (float) $a <=> (float) $b ?: strcmp( $a, $b ) );
	return $sizes;
}

/** The products / sizes / categories an offer covers (the same block, prefixed, for the free side of buy X get Y). */
function rfaheya_discount_scope( $n, $rule, $products, $sizes, $cats, $prefix, $title ) {
	$picked     = array_map( 'intval', (array) ( $rule[ $prefix . 'products' ] ?? array() ) );
	$picked_cat = array_map( 'intval', (array) ( $rule[ $prefix . 'categories' ] ?? array() ) );
	$size_keys  = array_map( 'rfaheya_size_key', (array) ( $rule[ $prefix . 'sizes' ] ?? array() ) );
	?>
	<div class="rfd-scope" data-scope="<?php echo esc_attr( $prefix ? 'get' : 'main' ); ?>">
		<p class="rfd-scope-title"><?php echo esc_html( $title ); ?></p>
		<div class="rfs-field rfs-wide">
			<span class="rfs-label">Sizes <small class="rfs-help">(none ticked = every size)</small></span>
			<div class="rfd-chips">
				<?php foreach ( $sizes as $size ) : ?>
					<label class="rfd-chip"><input type="checkbox" name="<?php echo esc_attr( $n . '[' . $prefix . 'sizes][]' ); ?>" value="<?php echo esc_attr( $size ); ?>" <?php checked( in_array( rfaheya_size_key( $size ), $size_keys, true ) ); ?>><span><?php echo esc_html( $size ); ?></span></label>
				<?php endforeach; ?>
			</div>
		</div>
		<?php if ( $cats ) : ?>
			<div class="rfs-field rfs-wide">
				<span class="rfs-label">Categories <small class="rfs-help">(none ticked = every category)</small></span>
				<div class="rfd-chips">
					<?php foreach ( $cats as $cat ) : ?>
						<label class="rfd-chip"><input type="checkbox" name="<?php echo esc_attr( $n . '[' . $prefix . 'categories][]' ); ?>" value="<?php echo esc_attr( $cat->term_id ); ?>" <?php checked( in_array( (int) $cat->term_id, $picked_cat, true ) ); ?>><span><?php echo esc_html( $cat->name ); ?></span></label>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endif; ?>
		<div class="rfs-field rfs-wide">
			<span class="rfs-label">Products <small class="rfs-help">(none ticked = every product)</small></span>
			<div class="rfd-products">
				<div class="rfd-picked" aria-live="polite"></div>
				<div class="rfd-tools"><input type="search" class="rfd-search" placeholder="Search products…" aria-label="Search products"><button type="button" class="rfd-all">Tick all shown</button><button type="button" class="rfd-none">Clear</button><span class="rfd-count"></span></div>
				<div class="rfd-list">
					<?php
					// The ticked ones first.
					usort( $products, fn( $a, $b ) => (int) in_array( (int) $b->ID, $picked, true ) <=> (int) in_array( (int) $a->ID, $picked, true ) );
					foreach ( $products as $p ) :
						?>
						<label class="rfd-product" data-name="<?php echo esc_attr( strtolower( get_the_title( $p ) ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $n . '[' . $prefix . 'products][]' ); ?>" value="<?php echo esc_attr( $p->ID ); ?>" <?php checked( in_array( (int) $p->ID, $picked, true ) ); ?>><?php echo get_the_post_thumbnail( $p->ID, array( 40, 40 ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><span><?php echo esc_html( get_the_title( $p ) ); ?></span></label>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</div>
	<?php
}

/** One offer's card (also the blank template for "Add an offer"). */
function rfaheya_discount_card( $n, $rule, $products, $sizes, $cats, $gifts ) {
	$rule = wp_parse_args(
		$rule,
		array(
			'id'        => '',
			'name'      => '',
			'note'      => '',
			'enabled'   => true,
			'stack'     => false,
			'kind'      => 'percent',
			'value'     => '',
			'value_type' => 'percent',
			'buy'       => 1,
			'get'       => 1,
			'get_off'   => 100,
			'get_other' => false,
			'limit'     => 0,
			'tiers'     => "2 = 10\n3 = 15",
			'min_spend' => '',
			'min_qty'   => '',
			'gift'      => 0,
			'start'     => '',
			'end'       => '',
		)
	);
	$live  = rfaheya_rule_live( $rule );
	$kinds = rfaheya_offer_kinds();
	$f     = fn( $key ) => esc_attr( $n . '[' . $key . ']' );
	?>
	<div class="rfs-card rfd-rule" data-kind="<?php echo esc_attr( $rule['kind'] ); ?>">
		<div class="rfd-head">
			<input type="text" class="rfd-name" name="<?php echo $f( 'name' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['name'] ); ?>" placeholder="Offer name, e.g. Buy 1 get 1 free on 100 ml (shown in the cart)" aria-label="Offer name">
			<span class="rfd-state <?php echo $live ? 'is-live' : ''; ?>"><?php echo $live ? 'Running now' : ( empty( $rule['enabled'] ) ? 'Off' : 'Not running now' ); ?></span>
			<label class="rfs-switch rfd-switch"><input type="checkbox" name="<?php echo $f( 'enabled' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="1" <?php checked( ! empty( $rule['enabled'] ) ); ?>><span class="rfs-track" aria-hidden="true"></span><span class="rfs-switch-text"><strong>On</strong></span></label>
		</div>
		<p class="rfd-step">1 · What kind of offer?</p>

		<div class="rfd-kinds" role="radiogroup" aria-label="Kind of offer">
			<?php foreach ( $kinds as $id => $k ) : ?>
				<label class="rfd-kind"><input type="radio" name="<?php echo $f( 'kind' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $id ); ?>" <?php checked( $rule['kind'], $id ); ?>><span><strong><?php echo esc_html( $k[0] ); ?></strong><small><?php echo esc_html( $k[1] ); ?></small></span></label>
			<?php endforeach; ?>
		</div>

		<p class="rfd-step">2 · The details</p>
		<div class="rfs-grid rfd-grid">
			<div class="rfs-field" data-kinds="percent amount fixed">
				<span class="rfs-label" data-text-percent="Discount (%)" data-text-amount="EGP off each bottle" data-text-fixed="New price (EGP)">Discount</span>
				<input type="number" min="0" step="any" name="<?php echo $f( 'value' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['value'] ); ?>" placeholder="20" data-kinds-input="percent amount fixed set_price spend">
			</div>

			<div class="rfs-field" data-kinds="bogo">
				<span class="rfs-label">Buy</span>
				<div class="rfd-inline"><input type="number" min="1" name="<?php echo $f( 'buy' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['buy'] ); ?>" data-kinds-input="bogo set_price"> <span>get</span> <input type="number" min="1" name="<?php echo $f( 'get' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['get'] ); ?>"> <span>at</span> <input type="number" min="1" max="100" step="any" name="<?php echo $f( 'get_off' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['get_off'] ); ?>"> <span>% off (100 = free)</span></div>
				<small class="rfs-help">The customer pays for the dearer bottles: e.g. buy 1 get 1 free with a 10 EGP and a 20 EGP bottle → pays 20.</small>
			</div>
			<div class="rfs-field rfs-wide" data-kinds="bogo">
				<label class="rfs-switch"><input type="checkbox" class="rfd-get-other" name="<?php echo $f( 'get_other' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="1" <?php checked( ! empty( $rule['get_other'] ) ); ?>><span class="rfs-track" aria-hidden="true"></span><span class="rfs-switch-text"><strong>The free / discounted bottles come from other products or sizes</strong><small>e.g. buy any 100 ml, get a 10 ml free. Off: they come from the same choice.</small></span></label>
			</div>

			<div class="rfs-field" data-kinds="set_price">
				<span class="rfs-label">Any</span>
				<div class="rfd-inline"><input type="number" min="2" class="rfd-mirror" data-mirror="buy" value="<?php echo esc_attr( max( 2, (int) $rule['buy'] ) ); ?>"> <span>bottles for</span> <input type="number" min="0" step="any" class="rfd-mirror" data-mirror="value" value="<?php echo esc_attr( $rule['value'] ); ?>"> <span>EGP</span></div>
			</div>

			<div class="rfs-field" data-kinds="bogo set_price">
				<span class="rfs-label">Times per order <small class="rfs-help">(0 = no limit)</small></span>
				<input type="number" min="0" name="<?php echo $f( 'limit' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['limit'] ); ?>">
			</div>

			<div class="rfs-field rfs-wide" data-kinds="qty_tiers">
				<span class="rfs-label">Steps — one per line, “bottles = % off”</span>
				<textarea rows="4" name="<?php echo $f( 'tiers' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"><?php echo esc_textarea( $rule['tiers'] ); ?></textarea>
				<small class="rfs-help">The highest step reached applies to all the chosen bottles in the cart.</small>
			</div>

			<div class="rfs-field" data-kinds="spend">
				<span class="rfs-label">Discount</span>
				<div class="rfd-amount">
					<input type="number" min="0" step="any" class="rfd-mirror" data-mirror="value" value="<?php echo esc_attr( $rule['value'] ); ?>" placeholder="10">
					<select name="<?php echo $f( 'value_type' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" aria-label="Discount type">
						<option value="percent" <?php selected( $rule['value_type'], 'percent' ); ?>>% off</option>
						<option value="amount" <?php selected( $rule['value_type'], 'amount' ); ?>>EGP off</option>
					</select>
				</div>
			</div>
			<div class="rfs-field" data-kinds="spend gift free_shipping">
				<span class="rfs-label">When the chosen bottles reach (EGP) <small class="rfs-help">(0 = any amount)</small></span>
				<input type="number" min="0" step="any" name="<?php echo $f( 'min_spend' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['min_spend'] ); ?>" placeholder="1500">
			</div>
			<div class="rfs-field" data-kinds="gift free_shipping">
				<span class="rfs-label">…and at least this many bottles <small class="rfs-help">(0 or 1 = any)</small></span>
				<input type="number" min="0" name="<?php echo $f( 'min_qty' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['min_qty'] ); ?>" placeholder="2">
			</div>
			<div class="rfs-field rfs-wide" data-kinds="gift">
				<span class="rfs-label">The gift</span>
				<select name="<?php echo $f( 'gift' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>">
					<option value="0">— Choose the product and size given free —</option>
					<?php foreach ( $gifts as $id => $label ) : ?>
						<option value="<?php echo esc_attr( $id ); ?>" <?php selected( (int) $rule['gift'], (int) $id ); ?>><?php echo esc_html( $label ); ?></option>
					<?php endforeach; ?>
				</select>
				<small class="rfs-help">Added to the cart at 0 EGP when the cart qualifies; taken out if it stops qualifying.</small>
			</div>

			<div class="rfs-field">
				<span class="rfs-label">Dates <small class="rfs-help">(optional — empty means always)</small></span>
				<div class="rfd-dates">
					<input type="date" name="<?php echo $f( 'start' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['start'] ); ?>" aria-label="From">
					<span>to</span>
					<input type="date" name="<?php echo $f( 'end' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['end'] ); ?>" aria-label="Until">
				</div>
			</div>
			<div class="rfs-field rfs-wide rfd-stack">
				<label class="rfs-switch"><input type="checkbox" name="<?php echo $f( 'stack' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="1" <?php checked( ! empty( $rule['stack'] ) ); ?>><span class="rfs-track" aria-hidden="true"></span><span class="rfs-switch-text">
					<strong data-kinds="bogo set_price qty_tiers spend">Adds up with other discounts</strong><small data-kinds="bogo set_price qty_tiers spend">On: given together with the other discounts that are on too. Off: when the order fits several, it gets only the biggest one.</small>
					<strong data-kinds="percent amount fixed">Bottles on this sale also get other discounts</strong><small data-kinds="percent amount fixed">On: the bundle discount and cart offers apply on top of the sale price. Off: sale bottles get the sale price only.</small>
					<strong data-kinds="gift free_shipping">Also given when the order gets a discount</strong><small data-kinds="gift free_shipping">On: given with any discount. Off: given only to orders with no other discount.</small>
				</span></label>
			</div>
			<div class="rfs-field" data-kinds="bogo set_price qty_tiers spend gift free_shipping">
				<span class="rfs-label">Line on the product page <small class="rfs-help">(optional, e.g. “Buy 1 get 1 free — this week only”)</small></span>
				<input type="text" name="<?php echo $f( 'note' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" value="<?php echo esc_attr( $rule['note'] ); ?>">
			</div>
		</div>

		<p class="rfd-step">3 · On which bottles?</p>
		<?php
		rfaheya_discount_scope( $n, $rule, $products, $sizes, $cats, '', 'Which bottles' );
		echo '<div class="rfd-get-scope" data-kinds="bogo">';
		rfaheya_discount_scope( $n, $rule, $products, $sizes, $cats, 'get_', 'Which bottles are free / discounted' );
		echo '</div>';
		?>
	</div>
	<?php
}

/** One line describing an offer, e.g. “Buy 1 get 1 free · 100 ML · 3 products”. */
function rfaheya_offer_summary( $rule ) {
	$parts = array();
	switch ( $rule['kind'] ) {
		case 'percent':
			$parts[] = rfaheya_number( $rule['value'] ) . '% off';
			break;
		case 'amount':
			$parts[] = number_format( (float) $rule['value'] ) . ' EGP off each';
			break;
		case 'fixed':
			$parts[] = 'Sells at ' . number_format( (float) $rule['value'] ) . ' EGP';
			break;
		case 'qty_tiers':
			$parts[] = implode( ', ', array_map( fn( $t ) => $t[0] . ' = ' . rfaheya_number( $t[1] ) . '%', rfaheya_rule_tiers( $rule ) ) );
			break;
		case 'gift':
			$gift    = wc_get_product( (int) ( $rule['gift'] ?? 0 ) );
			$parts[] = 'Gift: ' . ( $gift ? $gift->get_name() : '—' ) . ( (float) ( $rule['min_spend'] ?? 0 ) > 0 ? ' from ' . number_format( (float) $rule['min_spend'] ) . ' EGP' : '' );
			break;
		case 'free_shipping':
			$parts[] = 'Free shipping' . ( (float) ( $rule['min_spend'] ?? 0 ) > 0 ? ' from ' . number_format( (float) $rule['min_spend'] ) . ' EGP' : '' );
			break;
		default:
			$parts[] = rfaheya_offer_label( array_merge( $rule, array( 'name' => '' ) ) );
	}
	$sizes    = array_map( 'rfaheya_size_label', (array) ( $rule['sizes'] ?? array() ) );
	$products = count( (array) ( $rule['products'] ?? array() ) );
	$cats     = count( (array) ( $rule['categories'] ?? array() ) );
	$parts[]  = $sizes ? implode( ', ', $sizes ) : 'every size';
	$parts[]  = $products ? $products . ( 1 === $products ? ' product' : ' products' ) : ( $cats ? $cats . ( 1 === $cats ? ' category' : ' categories' ) : 'every product' );
	$parts[] = ! empty( $rule['stack'] ) ? 'adds up with other discounts' : 'not with other discounts';
	return implode( ' · ', $parts );
}

/** Off / Running / Starts on … / Ended on …: array( text, css class ). */
function rfaheya_offer_status( $rule ) {
	if ( empty( $rule['enabled'] ) ) {
		return array( 'Off', 'is-off' );
	}
	$now = current_time( 'timestamp' ); // phpcs:ignore WordPress.DateTime.CurrentTimeTimestamp.Requested
	if ( ! empty( $rule['start'] ) && $now < strtotime( $rule['start'] . ' 00:00:00' ) ) {
		return array( 'Starts ' . date_i18n( 'j M Y', strtotime( $rule['start'] ) ), 'is-soon' );
	}
	if ( ! empty( $rule['end'] ) && $now > strtotime( $rule['end'] . ' 23:59:59' ) ) {
		return array( 'Ended ' . date_i18n( 'j M Y', strtotime( $rule['end'] ) ), 'is-ended' );
	}
	return rfaheya_rule_live( $rule ) ? array( 'Running', 'is-live' ) : array( 'Incomplete', 'is-ended' );
}

function rfaheya_discounts_page() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- read-only screens
	$view  = isset( $_GET['view'] ) ? sanitize_key( wp_unslash( $_GET['view'] ) ) : '';
	$id    = isset( $_GET['offer'] ) ? sanitize_key( wp_unslash( $_GET['offer'] ) ) : '';
	$saved = isset( $_GET['saved'] ) ? sanitize_key( wp_unslash( $_GET['saved'] ) ) : '';
	$done  = isset( $_GET['done'] ) ? sanitize_key( wp_unslash( $_GET['done'] ) ) : '';
	// phpcs:enable
	$rules = rfaheya_offers_with_ids();
	$kinds = rfaheya_offer_kinds();

	if ( 'edit' === $view ) {
		$rule = array();
		foreach ( $rules as $r ) {
			if ( $r['id'] === $id ) {
				$rule = $r;
			}
		}
		$products = rfaheya_one_language( get_posts( array( 'post_type' => 'product', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) ) );
		$sizes    = rfaheya_all_sizes();
		$cats     = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => false ) );
		$cats     = is_wp_error( $cats ) ? array() : array_values( array_filter( $cats, fn( $c ) => 'uncategorized' !== $c->slug ) );
		$gifts    = array();
		foreach ( $products as $p ) {
			$product = wc_get_product( $p->ID );
			if ( ! $product ) {
				continue;
			}
			if ( $product->is_type( 'variable' ) ) {
				foreach ( $product->get_children() as $vid ) {
					$v = wc_get_product( $vid );
					if ( $v ) {
						$gifts[ $vid ] = get_the_title( $p ) . ' — ' . implode( ', ', array_map( 'rfaheya_size_label', array_filter( array_map( 'strval', $v->get_variation_attributes( false ) ) ) ) );
					}
				}
			} else {
				$gifts[ $p->ID ] = get_the_title( $p );
			}
		}
		?>
		<div class="wrap rfs rfd">
			<p class="rfd-back"><a href="<?php echo esc_url( rfaheya_offers_url() ); ?>">← All offers</a></p>
			<header class="rfs-hero">
				<div>
					<p class="rfs-eyebrow">Rfaheya · Offers</p>
					<h1><?php echo $rule ? esc_html( $rule['name'] ? $rule['name'] : rfaheya_offer_label( $rule ) ) : 'Add an offer'; ?></h1>
					<p>Choose the kind of offer, fill in its details, then pick the bottles it's for. Save, and it's live on the store.</p>
				</div>
			</header>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="rfs-form rfd-form">
				<input type="hidden" name="action" value="rfaheya_save_offer">
				<input type="hidden" name="offer_id" value="<?php echo esc_attr( $rule['id'] ?? '' ); ?>">
				<?php wp_nonce_field( 'rfaheya_save_offer' ); ?>
				<div class="rfd-rules"><?php rfaheya_discount_card( 'offer', $rule, $products, $sizes, $cats, $gifts ); ?></div>
				<div class="rfs-savebar">
					<a class="rfd-cancel" href="<?php echo esc_url( rfaheya_offers_url() ); ?>">Cancel</a>
					<button type="submit" class="rfs-btn">Save offer</button>
				</div>
			</form>
		</div>
		<?php
		return;
	}

	$messages = array(
		'deleted' => 'Offer deleted.',
		'on'      => 'Offer switched on.',
		'off'     => 'Offer switched off.',
		'copied'  => 'Copy made — it is off until you switch it on.',
	);
	?>
	<div class="wrap rfs rfd">
		<header class="rfs-hero rfd-list-hero">
			<div>
				<p class="rfs-eyebrow">Rfaheya · Products</p>
				<h1>Offers &amp; discounts</h1>
				<p>All your offers in one place. Add one, edit it any time, switch it off and on, or copy it for next time. Each offer has an “adds up with other discounts” switch (the bundle, spend more save more and first-order discounts have theirs in Settings): the ones that add up are given together, the others alone, and the order gets whichever comes to more.</p>
			</div>
			<a class="rfs-btn" href="<?php echo esc_url( rfaheya_offers_url( array( 'view' => 'edit' ) ) ); ?>"><span class="dashicons dashicons-plus-alt2"></span> Add an offer</a>
		</header>
		<?php if ( $saved || isset( $messages[ $done ] ) ) : ?>
			<div class="rfs-toast" role="status"><span class="dashicons dashicons-yes-alt"></span> <?php echo esc_html( $saved ? 'Offer saved — it is live on the store.' : $messages[ $done ] ); ?></div>
		<?php endif; ?>
		<?php if ( ! $rules ) : ?>
			<div class="rfs-card rfd-empty-state">
				<h2>No offers yet</h2>
				<p>Buy 1 get 1 free, any 3 for a price, % off a size, a free gift over an amount, free shipping… all from here.</p>
				<a class="rfs-btn" href="<?php echo esc_url( rfaheya_offers_url( array( 'view' => 'edit' ) ) ); ?>">Add your first offer</a>
			</div>
		<?php else : ?>
			<div class="rfs-card rfd-table-card">
				<table class="rfd-table">
					<thead><tr><th>Offer</th><th>Kind</th><th>Dates</th><th>Status</th><th><span class="screen-reader-text">Actions</span></th></tr></thead>
					<tbody>
						<?php
						foreach ( $rules as $rule ) :
							list( $status, $class ) = rfaheya_offer_status( $rule );
							$edit                   = rfaheya_offers_url( array( 'view' => 'edit', 'offer' => $rule['id'] ) );
							?>
							<tr class="<?php echo $saved === $rule['id'] ? 'is-just-saved' : ''; ?>">
								<td>
									<a class="rfd-title" href="<?php echo esc_url( $edit ); ?>"><?php echo esc_html( $rule['name'] ? $rule['name'] : rfaheya_offer_label( $rule ) ); ?></a>
									<span class="rfd-sub"><?php echo esc_html( rfaheya_offer_summary( $rule ) ); ?></span>
								</td>
								<td><span class="rfd-kind-tag"><?php echo esc_html( $kinds[ $rule['kind'] ][0] ?? $rule['kind'] ); ?></span></td>
								<td class="rfd-dates-cell"><?php echo esc_html( $rule['start'] || $rule['end'] ? ( $rule['start'] ? date_i18n( 'j M', strtotime( $rule['start'] ) ) : '…' ) . ' → ' . ( $rule['end'] ? date_i18n( 'j M Y', strtotime( $rule['end'] ) ) : '…' ) : 'Always' ); ?></td>
								<td><a class="rfd-status <?php echo esc_attr( $class ); ?>" href="<?php echo esc_url( rfaheya_offer_action_url( $rule['id'], 'toggle' ) ); ?>" title="<?php echo empty( $rule['enabled'] ) ? 'Switch on' : 'Switch off'; ?>"><i></i><?php echo esc_html( $status ); ?></a></td>
								<td class="rfd-actions">
									<a href="<?php echo esc_url( $edit ); ?>">Edit</a>
									<a href="<?php echo esc_url( rfaheya_offer_action_url( $rule['id'], 'duplicate' ) ); ?>">Copy</a>
									<a class="rfd-del" href="<?php echo esc_url( rfaheya_offer_action_url( $rule['id'], 'delete' ) ); ?>" onclick="return confirm('Delete this offer?')">Delete</a>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</div>
			<p class="rfd-foot">Price offers (% off, EGP off, fixed price) show on the store with the old price struck through — when two fit the same bottle, the bigger one wins. Cart offers show as their own line in the cart and checkout, and add up. Tap a status to switch an offer on or off.</p>
		<?php endif; ?>
	</div>
	<?php
}

/* -------------------------------------------------------------------------
 * Search engines: each storefront page's title, description, sharing picture and
 * structured data in the page itself; robots.txt and a sitemap of the storefront.
 * ------------------------------------------------------------------------- */

/** Plain text, one line, at most $max characters (cut at a word). */
function rfaheya_seo_text( $html, $max = 160 ) {
	$text = trim( preg_replace( '/\s+/u', ' ', html_entity_decode( wp_strip_all_tags( (string) $html ), ENT_QUOTES, 'UTF-8' ) ) );
	if ( function_exists( 'mb_strlen' ) && mb_strlen( $text ) > $max ) {
		$cut  = mb_substr( $text, 0, $max - 1 );
		$text = preg_replace( '/\s+\S*$/u', '', $cut ) . '…';
	}
	return $text;
}

/** Storefront paths that are only for one visitor: not in search results. */
function rfaheya_seo_private( $path ) {
	return (bool) preg_match( '#^/(account|checkout|cart|wishlist|track-order)(/|$)#', $path );
}

/* ---------- Rank Math: the titles, descriptions and robots set in WordPress are the ones used */

function rfaheya_rank_math_on() {
	return defined( 'RANK_MATH_VERSION' ) || class_exists( 'RankMath' );
}

/** Rank Math's variables (%title% %sep% %sitename% …) filled in for a post or term. */
function rfaheya_rm_vars( $text, $object = null ) {
	$text = (string) $text;
	if ( '' === $text || false === strpos( $text, '%' ) ) {
		return $text;
	}
	try {
		if ( class_exists( '\RankMath\Helper' ) && method_exists( '\RankMath\Helper', 'replace_vars' ) ) {
			$out = \RankMath\Helper::replace_vars( $text, $object ? $object : array() );
			if ( is_string( $out ) && false === strpos( $out, '%' ) ) {
				return trim( $out );
			}
		}
	} catch ( Throwable $e ) {
		unset( $e );
	}
	// Without Rank Math (or for what it left): the common ones.
	$titles = (array) get_option( 'rank-math-options-titles', array() );
	$sep    = isset( $titles['title_separator'] ) ? html_entity_decode( (string) $titles['title_separator'] ) : '-';
	$map    = array(
		'%sep%'      => $sep,
		'%sitename%' => get_bloginfo( 'name' ),
		'%sitedesc%' => get_bloginfo( 'description' ),
		'%page%'     => '',
	);
	if ( $object instanceof WP_Post ) {
		$map['%title%']   = get_the_title( $object );
		$map['%excerpt%'] = rfaheya_seo_text( $object->post_excerpt ? $object->post_excerpt : $object->post_content );
		$map['%seo_title%'] = get_the_title( $object );
	} elseif ( $object instanceof WP_Term ) {
		$map['%term%']             = $object->name;
		$map['%term_description%'] = rfaheya_seo_text( $object->description );
	}
	$text = strtr( $text, $map );
	$text = preg_replace( '/%[a-z_]+(\([^)]*\))?%/', '', $text );
	return trim( preg_replace( '/\s+/', ' ', $text ), " \t-|" );
}

/**
 * What Rank Math says about a post (product, article, page) or a term: its own title and
 * description when set, else Rank Math's template for that type; robots, canonical, picture.
 * Empty values are left out (the storefront's own then stand).
 */
function rfaheya_rm_for( $object ) {
	if ( ! rfaheya_rank_math_on() || ! $object ) {
		return array();
	}
	$titles = (array) get_option( 'rank-math-options-titles', array() );
	if ( $object instanceof WP_Post ) {
		$get   = fn( $k ) => get_post_meta( $object->ID, 'rank_math_' . $k, true );
		$type  = $object->post_type;
		$title = (string) $get( 'title' );
		$desc  = (string) $get( 'description' );
		$title = '' !== $title ? $title : (string) ( $titles[ 'pt_' . $type . '_title' ] ?? '' );
		$desc  = '' !== $desc ? $desc : (string) ( $titles[ 'pt_' . $type . '_description' ] ?? '' );
		$image = (string) $get( 'facebook_image' );
	} elseif ( $object instanceof WP_Term ) {
		$get   = fn( $k ) => get_term_meta( $object->term_id, 'rank_math_' . $k, true );
		$title = (string) $get( 'title' );
		$desc  = (string) $get( 'description' );
		$title = '' !== $title ? $title : (string) ( $titles[ 'tax_' . $object->taxonomy . '_title' ] ?? '' );
		$desc  = '' !== $desc ? $desc : (string) ( $titles[ 'tax_' . $object->taxonomy . '_description' ] ?? '' );
		$image = (string) $get( 'facebook_image' );
	} else {
		return array();
	}
	$robots = (array) $get( 'robots' );
	$out    = array(
		'title'       => rfaheya_seo_text( rfaheya_rm_vars( $title, $object ), 200 ),
		'description' => rfaheya_seo_text( rfaheya_rm_vars( $desc, $object ), 170 ),
		'image'       => $image,
		'canonical'   => (string) $get( 'canonical_url' ),
		'noindex'     => in_array( 'noindex', $robots, true ),
		'keyword'     => (string) $get( 'focus_keyword' ),
	);
	return array_filter( $out, fn( $v ) => '' !== $v && false !== $v );
}

/** Rank Math's home page title and description (Titles & Meta → Homepage), or the front page's own. */
function rfaheya_rm_home() {
	if ( ! rfaheya_rank_math_on() ) {
		return array();
	}
	$front = (int) get_option( 'page_on_front' );
	if ( 'page' === get_option( 'show_on_front' ) && $front ) {
		$own = rfaheya_rm_for( get_post( $front ) );
		if ( $own ) {
			return $own;
		}
	}
	$titles = (array) get_option( 'rank-math-options-titles', array() );
	return array_filter(
		array(
			'title'       => rfaheya_seo_text( rfaheya_rm_vars( (string) ( $titles['homepage_title'] ?? '' ) ), 200 ),
			'description' => rfaheya_seo_text( rfaheya_rm_vars( (string) ( $titles['homepage_description'] ?? '' ) ), 170 ),
		)
	);
}

/** A post or product by its address name, whatever its language (WPML) — also by a name it had before. */
function rfaheya_post_by_slug( $slug, $type ) {
	$slug = sanitize_title( rawurldecode( (string) $slug ) );
	if ( '' === $slug ) {
		return null;
	}
	$post = get_page_by_path( $slug, OBJECT, $type );
	if ( $post && 'publish' === $post->post_status ) {
		return $post;
	}
	return null;
}

/** A post's language: from WPML, else guessed from its title (Arabic letters). */
function rfaheya_post_lang( $post ) {
	if ( ! $post ) {
		return 'en';
	}
	if ( has_filter( 'wpml_post_language_details' ) ) {
		$d = apply_filters( 'wpml_post_language_details', null, $post->ID );
		if ( is_array( $d ) && ! empty( $d['language_code'] ) ) {
			return (string) $d['language_code'];
		}
	}
	return preg_match( '/\p{Arabic}/u', get_the_title( $post ) ) ? 'ar' : 'en';
}

/** The same post in the other languages (WPML), by language code (published ones only). */
function rfaheya_post_translations( $post ) {
	$out = array();
	if ( ! $post || ! has_filter( 'wpml_element_trid' ) ) {
		return $out;
	}
	$type = 'post_' . $post->post_type;
	$trid = apply_filters( 'wpml_element_trid', null, $post->ID, $type );
	if ( ! $trid ) {
		return $out;
	}
	foreach ( (array) apply_filters( 'wpml_get_element_translations', null, $trid, $type ) as $lang => $t ) {
		$id = (int) ( is_object( $t ) ? $t->element_id : ( $t['element_id'] ?? 0 ) );
		if ( $id && $id !== (int) $post->ID ) {
			$other = get_post( $id );
			if ( $other && 'publish' === $other->post_status ) {
				$out[ (string) $lang ] = $other;
			}
		}
	}
	return $out;
}

/** The current name of a post or product that was renamed (WordPress keeps the old names). */
function rfaheya_renamed( $slug, $type ) {
	global $wpdb;
	$slug = sanitize_title( rawurldecode( (string) $slug ) );
	$id   = (int) $wpdb->get_var( $wpdb->prepare( "SELECT p.ID FROM {$wpdb->posts} p JOIN {$wpdb->postmeta} m ON m.post_id = p.ID WHERE m.meta_key = '_wp_old_slug' AND m.meta_value = %s AND p.post_type = %s AND p.post_status = 'publish' LIMIT 1", $slug, $type ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	return $id ? get_post( $id ) : null;
}

/**
 * Where an old address goes (301), or ''. Covers the old WordPress site's links (products at
 * /shop/…, articles at /…, Arabic at /ar/…, categories, tags, the old pages), names changed in
 * WordPress, the redirects in Settings → Rfaheya Store → SEO & redirects, and Rank Math's own.
 */
function rfaheya_redirect_for( $path ) {
	$raw  = (string) $path;
	$path = '/' === $raw ? '/' : rtrim( $raw, '/' );

	// 1. The redirects typed in the dashboard (exact, with or without the final slash).
	$own = (string) ( rfaheya_options()['seo']['redirects'] ?? '' );
	foreach ( preg_split( '/\r?\n/', $own ) as $line ) {
		$parts = preg_split( '/\s*(?:→|->|=>|\s)\s*/u', trim( $line ), 2 );
		if ( count( $parts ) < 2 || '' === $parts[0] ) {
			continue;
		}
		$from = '/' . trim( (string) wp_parse_url( $parts[0], PHP_URL_PATH ), '/' );
		if ( rawurldecode( $from ) === rawurldecode( $path ) || rawurldecode( $from ) === rawurldecode( $raw ) ) {
			$to = trim( $parts[1] );
			return preg_match( '#^https?://#', $to ) ? $to : '/' . ltrim( $to, '/' );
		}
	}

	// 2. Rank Math's redirections (Rank Math → Redirections), when that module is on.
	try {
		if ( class_exists( '\RankMath\Redirections\DB' ) && method_exists( '\RankMath\Redirections\DB', 'match_redirections' ) ) {
			$hit = \RankMath\Redirections\DB::match_redirections( ltrim( rawurldecode( $raw ), '/' ) );
			if ( ! empty( $hit['url_to'] ) && in_array( (int) ( $hit['header_code'] ?? 301 ), array( 301, 302, 307 ), true ) ) {
				return (string) $hit['url_to'];
			}
		}
	} catch ( Throwable $e ) {
		unset( $e );
	}

	// 3. The old site's addresses.
	if ( preg_match( '#^/(sitemap_index|[a-z_]+-sitemap\d*|wp-sitemap[a-z0-9-]*|sitemap)\.xml$#', $path ) && '/sitemap.xml' !== $path ) {
		return '/sitemap.xml'; // Rank Math's / WordPress's sitemaps: the storefront's one
	}
	$seg = array_values( array_filter( explode( '/', trim( $path, '/' ) ), 'strlen' ) );
	if ( isset( $seg[0] ) && 'ar' === $seg[0] ) {
		array_shift( $seg ); // the Arabic version of an address: same place on the storefront
		if ( ! $seg ) {
			return '/';
		}
		$inner = rfaheya_redirect_for( '/' . implode( '/', $seg ) );
		if ( $inner ) {
			return $inner;
		}
		return '/' . implode( '/', $seg );
	}
	$n = count( $seg );
	if ( 2 === $n && in_array( $seg[0], array( 'shop', 'product' ), true ) ) {
		if ( rfaheya_post_by_slug( $seg[1], 'product' ) ) {
			return 'product' === $seg[0] || '/' === substr( $raw, -1 ) ? '/shop/' . $seg[1] : '';
		}
		$moved = rfaheya_renamed( $seg[1], 'product' );
		if ( $moved ) {
			return '/shop/' . $moved->post_name;
		}
		return '';
	}
	if ( $n >= 2 && 'product-category' === $seg[0] ) {
		$cat  = sanitize_title( rawurldecode( $seg[ $n - 1 ] ) );
		$fams = array( 'floral', 'fresh', 'fruity', 'oriental', 'sweet', 'woody', 'citrus', 'aromatic' );
		if ( in_array( $cat, $fams, true ) ) {
			return '/shop?family=' . $cat;
		}
		if ( preg_match( '/^(mens?|men)(-|$)/', $cat ) ) {
			return '/shop?gender=men';
		}
		if ( preg_match( '/^(womens?|women)(-|$)/', $cat ) ) {
			return '/shop?gender=women';
		}
		if ( preg_match( '/^unisex/', $cat ) ) {
			return '/shop?gender=unisex';
		}
		return '/shop';
	}
	if ( $n >= 1 && in_array( $seg[0], array( 'category', 'tag', 'author', 'blog' ), true ) ) {
		return '/journal';
	}
	if ( 'product-tag' === ( $seg[0] ?? '' ) ) {
		return '/shop';
	}
	if ( 2 === $n && 'journal' === $seg[0] && ! rfaheya_post_by_slug( $seg[1], 'post' ) ) {
		$moved = rfaheya_renamed( $seg[1], 'post' );
		return $moved ? '/journal/' . $moved->post_name : '';
	}
	if ( 1 === $n ) {
		$aliases = array(
			'about-us'   => '/about',
			'contact-us' => '/contact',
			'faq'        => '/faqs',
			'blog'       => '/journal',
			'sign-in'    => '/account',
			'register'   => '/account',
			'login'      => '/account',
			'new-cart'   => '/checkout',
			'compare'    => '/shop',
			'home'       => '/',
			'limited-edition' => '/shop',
		);
		$one = sanitize_title( rawurldecode( $seg[0] ) );
		if ( isset( $aliases[ $one ] ) ) {
			return $aliases[ $one ];
		}
		// An article at the site's root (the old WordPress address): to the journal.
		if ( ! rfaheya_info_page_for( '/' . $seg[0] ) && ! preg_match( '#^(shop|cart|checkout|account|wishlist|about|contact|faqs|reviews|journal|collections|finder|discover|our-standard|vitrine|vanilla-redefined|oud-rose-redefined|track-order|privacy|returns)$#', $one ) ) {
			$post = rfaheya_post_by_slug( $seg[0], 'post' ) ?: rfaheya_renamed( $seg[0], 'post' );
			if ( $post ) {
				return '/journal/' . $post->post_name;
			}
			$product = rfaheya_post_by_slug( $seg[0], 'product' );
			if ( $product ) {
				return '/shop/' . $product->post_name;
			}
		}
	}
	// 4. Addresses with a final slash: the same page without it (one address per page).
	if ( '/' !== $raw && '/' === substr( $raw, -1 ) ) {
		return $path;
	}
	return '';
}

/** Title, description, picture and structured data for a storefront path. */
function rfaheya_seo_for( $path, $data ) {
	$site  = 'Rfaheya';
	$home  = home_url( '/' );
	$desc  = 'Rfaheya — inspired fragrances crafted with quality materials and high concentration. Try any scent in a small size first, delivered across Egypt.';
	$logo  = rfaheya_logo_url();
	$out   = array(
		'title'       => 'Rfaheya — Speak Your Scent',
		'description' => $desc,
		'image'       => $logo,
		'type'        => 'website',
		'noindex'     => rfaheya_seo_private( $path ),
		'jsonld'      => array(),
		'status'      => 200,
		'canonical'   => '',
		'alternates'  => array(),
		'lang'        => '',
	);
	// Rank Math's values win over the storefront's own when they are set.
	$rm = function ( $object ) use ( &$out ) {
		foreach ( rfaheya_rm_for( $object ) as $k => $v ) {
			if ( in_array( $k, array( 'title', 'description', 'image', 'canonical' ), true ) ) {
				$out[ $k ] = $v;
			} elseif ( 'noindex' === $k ) {
				$out['noindex'] = true;
			}
		}
	};
	$crumbs = array( array( 'Home', $home ) );
	$static = array(
		'/shop'         => array( 'Shop all fragrances', 'Every Rfaheya fragrance — inspired scents for men, women and everyone, in full bottles and small sizes to try first.' ),
		'/collections'  => array( 'Collections', 'Rfaheya collections: discovery sets, gift boxes and fragrances grouped by mood and family.' ),
		'/finder'       => array( 'Rfaheya Finder — find your scent', 'Answer a few questions and find the Rfaheya fragrance that feels like you.' ),
		'/reviews'      => array( 'Customer reviews', 'What Rfaheya customers say about their fragrances.' ),
		'/about'        => array( 'About Rfaheya', $desc ),
		'/contact'      => array( 'Contact us', 'Questions about a fragrance or an order? Reach Rfaheya on WhatsApp, by phone or by email.' ),
		'/faqs'         => array( 'Frequently asked questions', 'Delivery, returns, sizes and how Rfaheya fragrances are made.' ),
		'/vanilla-redefined'  => array( 'Vanilla Redefined — Rfaheya', 'The warmest note in perfumery, re-composed: Rfaheya’s vanilla fragrances.' ),
		'/oud-rose-redefined' => array( 'Oud & Rose Redefined — Rfaheya', 'Deep smoky oud and velvet rose: Rfaheya’s oud and rose fragrances.' ),
		'/vitrine'      => array( 'The Vitrine — Rfaheya', 'Every Rfaheya fragrance in a lit window: pick a bottle to see its notes, sizes and price.' ),
		'/our-standard' => array( 'The Rfaheya Standard', 'How every Rfaheya fragrance is measured on skin: character, comfort, density, projection, longevity and evolution.' ),
		'/journal'      => array( 'Journal', 'Stories, guides and notes from the Rfaheya fragrance lab.' ),
	);
	$path = '/' === $path ? '/' : rtrim( $path, '/' );

	if ( '/' === $path ) {
		foreach ( rfaheya_rm_home() as $k => $v ) {
			$out[ $k ] = $v;
		}
		$out['jsonld'][] = array(
			'@context' => 'https://schema.org',
			'@type'    => 'Organization',
			'name'     => $site,
			'url'      => $home,
			'logo'     => $logo ? $logo : null,
			'sameAs'   => array_values( array_filter( rfaheya_options()['social'] ) ),
		);
		$out['jsonld'][] = array(
			'@context' => 'https://schema.org',
			'@type'    => 'WebSite',
			'name'     => $site,
			'url'      => $home,
		);
		return $out;
	}
	if ( isset( $static[ $path ] ) ) {
		$out['title']       = $static[ $path ][0] . ' — ' . $site;
		$out['description'] = $static[ $path ][1];
		$crumbs[]           = array( $static[ $path ][0], home_url( $path ) );
	} elseif ( preg_match( '#^/(?:product|shop)/([^/]+)$#', $path, $m ) ) {
		$slug    = sanitize_title( rawurldecode( $m[1] ) );
		if ( ! empty( $data['products'] ) ) {
			$out['status'] = 404; // until it is found below
		}
		$product = null;
		foreach ( isset( $data['products'] ) ? $data['products'] : array() as $p ) {
			if ( isset( $p['slug'] ) && $p['slug'] === $slug ) {
				$product = $p;
				break;
			}
		}
		if ( $product ) {
			$short  = rfaheya_seo_text( $product['short_description'] ?? '', 80 );
			$about  = rfaheya_seo_text( ( $product['short_description'] ?? '' ) . ' ' . ( $product['description'] ?? '' ), 158 );
			$image  = $product['images'][0]['src'] ?? '';
			$prices = $product['prices'] ?? array();
			$unit   = (int) ( $prices['currency_minor_unit'] ?? 0 );
			$money  = fn( $v ) => round( (float) $v / pow( 10, $unit ), 2 );
			$low    = $money( $prices['price_range']['min_amount'] ?? ( $prices['price'] ?? 0 ) );
			$high   = $money( $prices['price_range']['max_amount'] ?? ( $prices['price'] ?? 0 ) );
			$url    = home_url( '/shop/' . $slug );
			$out['status'] = 200;
			$out['title']       = $product['name'] . ( $short ? ' — ' . $short : '' ) . ' | ' . $site;
			$out['description'] = $about ? $about : $desc;
			$out['image']       = $image ? $image : $out['image'];
			$out['type']        = 'product';
			$out['preload']     = $product['images'][0] ?? null; // the gallery's first picture
			$crumbs[]           = array( 'Shop', home_url( '/shop' ) );
			$crumbs[]           = array( $product['name'], $url );
			$item = array(
				'@context'    => 'https://schema.org',
				'@type'       => 'Product',
				'name'        => $product['name'],
				'description' => $about,
				'image'       => array_values( array_filter( array_map( fn( $i ) => $i['src'] ?? '', array_slice( $product['images'] ?? array(), 0, 4 ) ) ) ),
				'brand'       => array( '@type' => 'Brand', 'name' => $site ),
				'url'         => $url,
				'sku'         => (string) ( $product['id'] ?? '' ),
				'offers'      => array(
					'@type'         => 'AggregateOffer',
					'priceCurrency' => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'EGP',
					'lowPrice'      => $low,
					'highPrice'     => $high,
					'availability'  => ! empty( $product['is_in_stock'] ) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
					'url'           => $url,
				),
			);
			$ratings = array();
			foreach ( isset( $data['reviews'] ) ? $data['reviews'] : array() as $r ) {
				if ( (int) ( $r['product_id'] ?? 0 ) === (int) $product['id'] && ! empty( $r['rating'] ) ) {
					$ratings[] = (float) $r['rating'];
				}
			}
			if ( $ratings ) {
				$item['aggregateRating'] = array(
					'@type'       => 'AggregateRating',
					'ratingValue' => round( array_sum( $ratings ) / count( $ratings ), 1 ),
					'reviewCount' => count( $ratings ),
					'bestRating'  => 5,
				);
			}
			$rm( get_post( (int) ( $product['id'] ?? 0 ) ) );
			$item['description'] = $out['description'];
			$out['jsonld'][]     = $item;
		}
	} elseif ( preg_match( '#^/collections/([^/]+)$#', $path, $m ) ) {
		$name               = ucwords( str_replace( '-', ' ', sanitize_title( $m[1] ) ) );
		$out['title']       = $name . ' — ' . $site;
		$out['description'] = $name . ' by Rfaheya: inspired fragrances, made to be tried and loved.';
		$crumbs[]           = array( 'Collections', home_url( '/collections' ) );
		$crumbs[]           = array( $name, home_url( $path ) );
	} elseif ( preg_match( '#^/journal/([^/]+)$#', $path, $m ) ) {
		$post = rfaheya_post_by_slug( $m[1], 'post' );
		if ( $post ) {
			$out['title']       = get_the_title( $post ) . ' — Rfaheya Journal';
			$out['description'] = rfaheya_seo_text( $post->post_excerpt ? $post->post_excerpt : $post->post_content );
			$out['image']       = get_the_post_thumbnail_url( $post, 'large' ) ? get_the_post_thumbnail_url( $post, 'large' ) : $out['image'];
			$out['type']        = 'article';
			$crumbs[]           = array( 'Journal', home_url( '/journal' ) );
			$crumbs[]           = array( get_the_title( $post ), home_url( '/journal/' . $post->post_name ) );
			$rm( $post );
			$out['jsonld'][] = array(
				'@context'      => 'https://schema.org',
				'@type'         => 'BlogPosting',
				'headline'      => get_the_title( $post ),
				'description'   => $out['description'],
				'image'         => $out['image'] ? array( $out['image'] ) : null,
				'datePublished' => get_post_time( 'c', true, $post ),
				'dateModified'  => get_post_modified_time( 'c', true, $post ),
				'author'        => array( '@type' => 'Organization', 'name' => $site ),
				'publisher'     => array( '@type' => 'Organization', 'name' => $site, 'logo' => $logo ? array( '@type' => 'ImageObject', 'url' => $logo ) : null ),
				'mainEntityOfPage' => home_url( '/journal/' . $post->post_name ),
				'inLanguage'    => rfaheya_post_lang( $post ),
			);
			$out['lang'] = rfaheya_post_lang( $post );
			// The same article in the other language (WPML): each points at the other.
			foreach ( rfaheya_post_translations( $post ) as $lang => $other ) {
				$out['alternates'][ $lang ] = home_url( '/journal/' . $other->post_name );
			}
		} else {
			$out['status'] = 404;
		}
	} elseif ( preg_match( '#^/([^/]+)$#', $path, $m ) && ! $out['noindex'] ) {
		$page = rfaheya_info_page_for( $path );
		if ( $page ) {
			$out['title']       = get_the_title( $page ) . ' — ' . $site;
			$out['description'] = rfaheya_seo_text( $page->post_excerpt ? $page->post_excerpt : $page->post_content );
			$crumbs[]           = array( get_the_title( $page ), home_url( $path ) );
			$rm( $page );
		} elseif ( rfaheya_info_slug( $path ) && ! in_array( rfaheya_info_slug( $path ), array( 'privacy', 'returns' ), true ) ) {
			$out['status'] = 404; // no such page (the storefront shows its "not found" page)
		}
	} elseif ( preg_match( '#^/(shop|product|journal|collections)/.+/.+#', $path ) ) {
		$out['status'] = 404;
	}
	if ( 404 === $out['status'] ) {
		$out['title']   = 'Page not found — ' . $site;
		$out['noindex'] = true;
		$crumbs         = array();
	}
	if ( count( $crumbs ) > 1 ) {
		$out['jsonld'][] = array(
			'@context'        => 'https://schema.org',
			'@type'           => 'BreadcrumbList',
			'itemListElement' => array_map(
				fn( $c, $i ) => array( '@type' => 'ListItem', 'position' => $i + 1, 'name' => $c[0], 'item' => $c[1] ),
				$crumbs,
				array_keys( $crumbs )
			),
		);
	}
	return $out;
}

/** Puts a page's search and sharing details into the storefront's HTML. */
function rfaheya_seo_apply( $html, $path, $data ) {
	$seo   = rfaheya_seo_for( $path, $data );
	$canon = $seo['canonical'] ? $seo['canonical'] : home_url( '/' === $path ? '/' : rtrim( preg_replace( '#^/product/#', '/shop/', $path ), '/' ) );
	if ( 404 === (int) $seo['status'] && ! headers_sent() ) {
		status_header( 404 );
	}
	$html  = preg_replace( '#<title>.*?</title>#s', '<title>' . esc_html( $seo['title'] ) . '</title>', $html, 1 );
	$html  = preg_replace( '#<meta name="description" content="[^"]*"\s*/?>#', '<meta name="description" content="' . esc_attr( $seo['description'] ) . '">', $html, 1 );
	$head  = 404 === (int) $seo['status'] ? '' : '<link rel="canonical" href="' . esc_url( $canon ) . '">';
	if ( $seo['alternates'] ) {
		$here = $seo['lang'] ? $seo['lang'] : 'en';
		foreach ( $seo['alternates'] + array( $here => $canon ) as $lang => $url ) {
			$head .= '<link rel="alternate" hreflang="' . esc_attr( $lang ) . '" href="' . esc_url( $url ) . '">';
		}
	}
	if ( $seo['noindex'] ) {
		$head .= '<meta name="robots" content="noindex, follow">';
	}
	$head .= '<meta property="og:site_name" content="Rfaheya">';
	$head .= '<meta property="og:type" content="' . esc_attr( 'product' === $seo['type'] ? 'product' : ( 'article' === $seo['type'] ? 'article' : 'website' ) ) . '">';
	$head .= '<meta property="og:title" content="' . esc_attr( $seo['title'] ) . '">';
	$head .= '<meta property="og:description" content="' . esc_attr( $seo['description'] ) . '">';
	$head .= '<meta property="og:url" content="' . esc_url( $canon ) . '">';
	if ( $seo['image'] ) {
		$head .= '<meta property="og:image" content="' . esc_url( $seo['image'] ) . '"><meta name="twitter:card" content="summary_large_image">';
	}
	// The product page's main picture starts before the storefront has started.
	if ( ! empty( $seo['preload']['src'] ) ) {
		$head .= '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $seo['preload']['src'] ) . '"';
		if ( ! empty( $seo['preload']['srcset'] ) ) {
			$head .= ' imagesrcset="' . esc_attr( $seo['preload']['srcset'] ) . '" imagesizes="(min-width: 1024px) 55vw, 100vw"';
		}
		$head .= '>';
	}
	foreach ( $seo['jsonld'] as $ld ) {
		$head .= '<script type="application/ld+json">' . wp_json_encode( array_filter( $ld, fn( $v ) => null !== $v ), JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>';
	}
	return str_replace( '</head>', $head . '</head>', $html );
}

// robots.txt (routed to WordPress by .htaccess): private pages out, the sitemap in.
add_filter(
	'robots_txt',
	function ( $output, $public ) {
		if ( ! $public ) {
			return $output; // Settings → Reading → "Discourage search engines" is on.
		}
		$lines = array(
			'User-agent: *',
			'Allow: /',
			'Disallow: /wp-admin/',
			'Allow: /wp-admin/admin-ajax.php',
			'Disallow: /account',
			'Disallow: /checkout',
			'Disallow: /cart',
			'Disallow: /wishlist',
			'Disallow: /my-account/',
			'Disallow: /*?add-to-cart=',
			'',
			'Sitemap: ' . home_url( '/sitemap.xml' ),
		);
		return implode( "\n", $lines ) . "\n";
	},
	99,
	2
);

// WordPress's own sitemap lists WordPress addresses, not the storefront's: ours replaces it.
add_filter( 'wp_sitemaps_enabled', '__return_false' );

/** /sitemap.xml: every storefront page search engines should know about. */
function rfaheya_sitemap() {
	list( $data ) = rfaheya_bootstrap_ready();
	$urls = array();
	foreach ( array( '/', '/shop', '/collections', '/collections/discovery-sets', '/collections/gift-boxes', '/finder', '/reviews', '/about', '/contact', '/faqs', '/our-standard', '/vitrine', '/vanilla-redefined', '/oud-rose-redefined', '/journal' ) as $p ) {
		$urls[ home_url( $p ) ] = '';
	}
	foreach ( isset( $data['products'] ) ? $data['products'] : array() as $p ) {
		if ( ! empty( $p['slug'] ) ) {
			$product = get_post( (int) ( $p['id'] ?? 0 ) );
			if ( $product && ! empty( rfaheya_rm_for( $product )['noindex'] ) ) {
				continue; // Rank Math says: not in search results
			}
			$wc = $product && function_exists( 'wc_get_product' ) ? wc_get_product( $product->ID ) : null;
			if ( $wc && in_array( $wc->get_catalog_visibility(), array( 'hidden', 'search' ), true ) ) {
				continue; // hidden from the shop (the gift wrap, the gift box builder's product…)
			}
			$urls[ home_url( '/shop/' . $p['slug'] ) ] = $product ? get_post_modified_time( 'c', true, $product ) : '';
		}
	}
	// Every article in every language (get_posts is not narrowed to one language by WPML).
	foreach ( get_posts( array( 'post_type' => 'post', 'post_status' => 'publish', 'numberposts' => -1, 'suppress_filters' => true ) ) as $post ) {
		if ( ! empty( $post->post_password ) || ! empty( rfaheya_rm_for( $post )['noindex'] ) ) {
			continue;
		}
		$urls[ home_url( '/journal/' . $post->post_name ) ] = get_post_modified_time( 'c', true, $post );
	}
	foreach ( get_pages( array( 'post_status' => 'publish' ) ) as $page ) {
		if ( rfaheya_info_page_for( '/' . $page->post_name ) && empty( rfaheya_rm_for( $page )['noindex'] ) ) {
			$urls[ home_url( '/' . $page->post_name ) ] = get_post_modified_time( 'c', true, $page );
		}
	}
	while ( ob_get_level() > 0 ) {
		ob_end_clean();
	}
	header( 'Content-Type: application/xml; charset=utf-8' );
	header( 'Cache-Control: public, max-age=3600' );
	echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
	foreach ( $urls as $loc => $modified ) {
		echo '<url><loc>' . esc_url( $loc ) . '</loc>' . ( $modified ? '<lastmod>' . esc_html( $modified ) . '</lastmod>' : '' ) . "</url>\n";
	}
	echo '</urlset>';
	exit;
}

add_action(
	'wp_loaded',
	function () {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only
		if ( isset( $_GET['rfaheya_sitemap'] ) && ! is_admin() ) {
			rfaheya_sitemap();
		}
	},
	98
);

/* -------------------------------------------------------------------------
 * The dashboard's look (every admin page) and the sign-in page.
 * ------------------------------------------------------------------------- */

function rfaheya_admin_asset_version( $file ) {
	$path = __DIR__ . '/rfaheya-admin/' . $file;
	return file_exists( $path ) ? (string) filemtime( $path ) : '1';
}

add_action(
	'admin_enqueue_scripts',
	function () {
		wp_enqueue_style( 'rfaheya-font', 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600&display=swap', array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( 'rfaheya-theme', WPMU_PLUGIN_URL . '/rfaheya-admin/theme.css', array(), rfaheya_admin_asset_version( 'theme.css' ) );
	}
);

add_action(
	'login_enqueue_scripts',
	function () {
		wp_enqueue_style( 'rfaheya-font', 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600&display=swap', array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( 'rfaheya-login', WPMU_PLUGIN_URL . '/rfaheya-admin/login.css', array( 'login' ), rfaheya_admin_asset_version( 'login.css' ) );
		$logo = rfaheya_logo_url();
		if ( ! $logo && file_exists( __DIR__ . '/rfaheya/logo.svg' ) ) {
			$logo = WPMU_PLUGIN_URL . '/rfaheya/logo.svg';
		}
		if ( $logo ) {
			// The built-in logo is dark: shown light on the dark page.
			$own = (bool) rfaheya_options()['home']['logo'];
			wp_add_inline_style( 'rfaheya-login', '.login h1 a{--rf-login-logo:url("' . esc_url( $logo ) . '")' . ( $own ? '' : ';filter:invert(1) brightness(.95)' ) . '}' );
		}
	}
);
add_filter( 'login_headerurl', fn() => home_url( '/' ) );
add_filter( 'login_headertext', fn() => get_bloginfo( 'name' ) );

/* -------------------------------------------------------------------------
 * Minimum order, and a first order's welcome discount with an account made from it.
 * ------------------------------------------------------------------------- */

/** The smallest basket that can be ordered (Settings → Rfaheya Store → Free shipping & offers), 0 for none. */
function rfaheya_order_min() {
	return max( 0, (float) rfaheya_options()['shipping']['order_min'] );
}

// Below the minimum the order can't be placed (the storefront says so first; this is the guard).
add_action(
	'woocommerce_check_cart_items',
	function () {
		$min = rfaheya_order_min();
		if ( $min <= 0 || ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}
		$amount = rfaheya_cart_merchandise( WC()->cart ) - rfaheya_cart_discount_total( WC()->cart );
		if ( $amount < $min ) {
			wc_add_notice( sprintf( 'The minimum order is %s EGP. Add %s EGP more to order.', number_format( $min ), number_format( ceil( $min - $amount ) ) ), 'error' );
		}
	}
);

/** Whether this guest's email and phone have never ordered and have no account: a first order. */
function rfaheya_is_first_order( $email, $phone = '' ) {
	$email = sanitize_email( (string) $email );
	if ( ! is_email( $email ) || email_exists( $email ) || rfaheya_has_ordered( 0, $email ) ) {
		return false;
	}
	$digits = preg_replace( '/\D/', '', (string) $phone );
	if ( strlen( $digits ) >= 10 ) {
		$statuses = array( 'wc-processing', 'wc-completed', 'wc-on-hold' );
		foreach ( array_unique( array( $phone, $digits, '+2' . $digits ) ) as $p ) {
			if ( wc_get_orders( array( 'billing_phone' => $p, 'status' => $statuses, 'limit' => 1, 'return' => 'ids' ) ) ) {
				return false;
			}
		}
	}
	return true;
}

/** The welcome percent for a guest's first order, 0 when it doesn't apply. */
function rfaheya_guest_welcome_percent() {
	if ( is_user_logged_in() || ! function_exists( 'WC' ) || ! WC()->customer ) {
		return 0;
	}
	$loyalty = rfaheya_loyalty();
	if ( empty( $loyalty['welcome'] ) ) {
		return 0;
	}
	$c = WC()->customer;
	return rfaheya_is_first_order( $c->get_billing_email(), $c->get_billing_phone() ) ? (float) $loyalty['welcomePercent'] : 0;
}

// A guest's first order: the welcome percent off, worked out from the email and phone typed at checkout.
add_action(
	'woocommerce_cart_calculate_fees',
	function ( $cart ) {
		$percent = rfaheya_welcome_stacks() ? rfaheya_guest_welcome_percent() : 0;
		if ( $percent <= 0 ) {
			return;
		}
		$base = rfaheya_offer_base( $cart ) - (float) ( $GLOBALS['rfaheya_cart_off'] ?? 0 );
		$off  = round( max( 0, $base ) * $percent / 100 );
		if ( $off > 0 ) {
			$cart->add_fee( sprintf( 'First order · %s%% off', rfaheya_number( $percent ) ), -$off, false );
		}
	},
	20
);

/*
 * A guest's order makes their account from the details they typed (name, phone, address),
 * signs them in, and emails a link to choose a password. Next time they just sign in.
 */
add_action(
	'woocommerce_store_api_checkout_order_processed',
	function ( $order ) {
		if ( ! $order instanceof WC_Order || $order->get_customer_id() || is_user_logged_in() ) {
			return;
		}
		$email = sanitize_email( $order->get_billing_email() );
		if ( ! is_email( $email ) || email_exists( $email ) ) {
			return;
		}
		$id = rfaheya_make_customer( $email, wp_generate_password( 24 ), $order->get_billing_first_name(), $order->get_billing_last_name() );
		if ( is_wp_error( $id ) ) {
			return;
		}
		$customer = new WC_Customer( $id );
		foreach ( array( 'first_name', 'last_name', 'phone', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country' ) as $field ) {
			$get = 'get_billing_' . $field;
			$set = 'set_billing_' . $field;
			if ( method_exists( $order, $get ) && method_exists( $customer, $set ) ) {
				$customer->$set( $order->$get() );
			}
			$get = 'get_shipping_' . $field;
			$set = 'set_shipping_' . $field;
			if ( method_exists( $order, $get ) && method_exists( $customer, $set ) ) {
				$customer->$set( $order->$get() );
			}
		}
		$customer->set_billing_email( $email );
		$customer->save();
		update_user_meta( $id, 'rfaheya_whatsapp', $order->get_billing_phone() );
		$order->set_customer_id( $id );
		$order->add_order_note( 'Account made for the customer from this order (first order).' );
		$order->save();
		wc_set_customer_auth_cookie( $id );
		// A link to choose their own password (WooCommerce's "reset password" email).
		$user = get_user_by( 'id', $id );
		if ( $user && function_exists( 'retrieve_password' ) ) {
			retrieve_password( $user->user_login );
		}
	}
);

/* -------------------------------------------------------------------------
 * Security: the whole site (dashboard sign-in included), not only the storefront.
 * ------------------------------------------------------------------------- */

// No theme / plugin file editor in the dashboard: a stolen admin password can't write PHP.
if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
	define( 'DISALLOW_FILE_EDIT', true );
}

/** The visitor's IP address (as the web server saw it; headers a browser can fake are ignored). */
function rfaheya_client_ip() {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '0.0.0.0';
}

/** How many times `$what` happened for `$who` in the current window. */
function rfaheya_limit_count( $what, $who ) {
	return (int) get_transient( 'rf_lim_' . md5( $what . '|' . $who ) );
}

/** Counts one more `$what` for `$who`; the window starts at the first one. */
function rfaheya_limit_hit( $what, $who, $window ) {
	$key  = 'rf_lim_' . md5( $what . '|' . $who );
	$seen = (int) get_transient( $key );
	set_transient( $key, $seen + 1, $window );
	return $seen + 1;
}

function rfaheya_limit_clear( $what, $who ) {
	delete_transient( 'rf_lim_' . md5( $what . '|' . $who ) );
}

/** Stops an account request after `$max` tries in `$window` seconds. */
function rfaheya_rate_limit( $what, $who, $max, $window ) {
	if ( rfaheya_limit_hit( $what, $who, $window ) > $max ) {
		rfaheya_account_fail( 'Too many tries. Please wait a little and try again.' );
	}
}

/*
 * Sign-in lockout, for every way in (the storefront, wp-login.php, the dashboard):
 * 5 wrong passwords for one account, or 20 from one address, lock it for 15 minutes.
 */
add_filter(
	'authenticate',
	function ( $user, $username ) {
		$name = strtolower( trim( (string) $username ) );
		if ( '' === $name ) {
			return $user;
		}
		if ( rfaheya_limit_count( 'login-user', $name ) >= 5 || rfaheya_limit_count( 'login-ip', rfaheya_client_ip() ) >= 20 ) {
			return new WP_Error( 'rfaheya_locked', 'Too many wrong passwords. For your safety, sign-in is paused for 15 minutes.' );
		}
		return $user;
	},
	1,
	2
);

add_action(
	'wp_login_failed',
	function ( $username ) {
		$name = strtolower( trim( (string) $username ) );
		rfaheya_limit_hit( 'login-ip', rfaheya_client_ip(), 15 * MINUTE_IN_SECONDS );
		if ( '' !== $name ) {
			rfaheya_limit_hit( 'login-user', $name, 15 * MINUTE_IN_SECONDS );
			// Signing in by email counts against the account as well.
			$user = is_email( $name ) ? get_user_by( 'email', $name ) : get_user_by( 'login', $name );
			if ( $user && strtolower( $user->user_login ) !== $name ) {
				rfaheya_limit_hit( 'login-user', strtolower( $user->user_login ), 15 * MINUTE_IN_SECONDS );
			}
		}
	}
);

add_action(
	'wp_login',
	function ( $login ) {
		rfaheya_limit_clear( 'login-user', strtolower( (string) $login ) );
	}
);

// wp-login.php doesn't say whether the username or the password was wrong.
add_filter(
	'login_errors',
	function ( $message ) {
		if ( false !== strpos( (string) $message, 'Too many wrong passwords' ) ) {
			return $message;
		}
		return '<strong>Error:</strong> Incorrect username or password.';
	}
);

// The storefront's account requests only from this site (another site can't sign a visitor in or out).
add_action(
	'admin_init',
	function () {
		if ( ! wp_doing_ajax() || 'POST' !== ( isset( $_SERVER['REQUEST_METHOD'] ) ? $_SERVER['REQUEST_METHOD'] : '' ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			return;
		}
		$action = isset( $_REQUEST['action'] ) ? sanitize_key( wp_unslash( $_REQUEST['action'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( 0 !== strpos( $action, 'rfaheya_' ) ) {
			return;
		}
		$from = isset( $_SERVER['HTTP_ORIGIN'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';
		if ( '' === $from && isset( $_SERVER['HTTP_REFERER'] ) ) {
			$from = sanitize_text_field( wp_unslash( $_SERVER['HTTP_REFERER'] ) );
		}
		if ( '' === $from ) {
			return; // Old browsers and privacy tools send neither; the nonces still apply.
		}
		$bare = fn( $h ) => preg_replace( '/^www\./', '', strtolower( (string) $h ) );
		$host = $bare( wp_parse_url( $from, PHP_URL_HOST ) );
		$ours = array_map( $bare, array_filter( array( wp_parse_url( home_url(), PHP_URL_HOST ), wp_parse_url( site_url(), PHP_URL_HOST ), isset( $_SERVER['HTTP_HOST'] ) ? preg_replace( '/:\d+$/', '', sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) ) : '' ) ) );
		if ( '' !== $host && ! in_array( $host, $ours, true ) ) {
			status_header( 403 );
			wp_send_json( array( 'error' => 'This request must come from the store.' ) );
		}
	},
	1
);

// XML-RPC (an old remote API, a favourite of password-guessing bots) is off.
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'xmlrpc_methods', fn() => array() );
add_filter(
	'wp_headers',
	function ( $headers ) {
		unset( $headers['X-Pingback'] );
		return $headers;
	}
);

// Application passwords (sign-in keys for apps) are off: the store doesn't use them.
add_filter( 'wp_is_application_passwords_available', '__return_false' );

// No WordPress version in the page source or feeds.
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );

// Usernames stay private: no user list in the REST API, no ?author= pages, no author sitemap.
add_filter(
	'rest_endpoints',
	function ( $endpoints ) {
		if ( current_user_can( 'list_users' ) ) {
			return $endpoints;
		}
		foreach ( array_keys( $endpoints ) as $route ) {
			if ( 0 === strpos( $route, '/wp/v2/users' ) ) {
				unset( $endpoints[ $route ] );
			}
		}
		return $endpoints;
	}
);
add_filter(
	'wp_sitemaps_add_provider',
	fn( $provider, $name ) => 'users' === $name ? false : $provider,
	10,
	2
);
add_filter(
	'oembed_response_data',
	function ( $data ) {
		unset( $data['author_name'], $data['author_url'] );
		return $data;
	}
);
add_action(
	'template_redirect',
	function () {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check
		if ( ( is_author() || isset( $_GET['author'] ) ) && ! current_user_can( 'list_users' ) ) {
			wp_safe_redirect( home_url( '/' ), 301 );
			exit;
		}
	},
	1
);

/** Safety headers on every page WordPress sends (the storefront pages included). */
function rfaheya_security_headers() {
	if ( headers_sent() ) {
		return;
	}
	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()' );
	header( "Content-Security-Policy: frame-ancestors 'self'; base-uri 'self'; object-src 'none'" );
	if ( is_ssl() ) {
		header( 'Strict-Transport-Security: max-age=31536000' );
	}
}
add_action( 'send_headers', 'rfaheya_security_headers' );
add_action( 'admin_init', 'rfaheya_security_headers' );
add_action( 'login_init', 'rfaheya_security_headers' );
add_filter(
	'rest_post_dispatch',
	function ( $response ) {
		rfaheya_security_headers();
		return $response;
	}
);

/*
 * No PHP runs from the uploads folder (an uploaded file can never become a program),
 * and the folder can't be browsed. Written once into wp-content/uploads/.htaccess.
 */
add_action(
	'admin_init',
	function () {
		if ( get_option( 'rfaheya_uploads_locked' ) === '3' ) {
			return;
		}
		$dir  = wp_get_upload_dir();
		$file = trailingslashit( $dir['basedir'] ) . '.htaccess';
		$rule = "# BEGIN Rfaheya security\n<FilesMatch \"\\.(php[0-9]?|phtml|phar|pl|py|cgi|sh)$\">\n<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n</FilesMatch>\n# END Rfaheya security\n";
		$now  = file_exists( $file ) ? (string) file_get_contents( $file ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		// An earlier version also had "Options -Indexes", which some servers refuse (pictures then fail): replaced.
		$now = (string) preg_replace( '/# BEGIN Rfaheya security.*?# END Rfaheya security\n?/s', '', $now );
		if ( is_dir( $dir['basedir'] ) && wp_is_writable( $dir['basedir'] ) ) {
			file_put_contents( $file, $rule . $now ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		}
		update_option( 'rfaheya_uploads_locked', '3', false );
	}
);

// Comments on posts and pages are off (bots use them for spam); product reviews stay.
add_filter(
	'comments_open',
	fn( $open, $post_id ) => 'product' === get_post_type( $post_id ) ? $open : false,
	10,
	2
);
add_filter( 'pings_open', '__return_false' );

// ==================================================================== buyers of a product

/**
 * Everyone who bought a product (any of its sizes), newest first: one row per order line with
 * the customer's details. Cancelled, failed, refunded and draft orders are left out.
 * $limit 0 = all.
 */
function rfaheya_product_buyers( $product_id, $limit = 0 ) {
	global $wpdb;
	$product_id = (int) $product_id;
	$skip       = array( 'cancelled', 'failed', 'refunded', 'checkout-draft', 'trash' );
	$order_ids  = array();
	$table      = $wpdb->prefix . 'wc_order_product_lookup';
	// WooCommerce's own index of order lines (kept for its analytics) answers at once…
	if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) === $table ) { // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$order_ids = array_map( 'intval', (array) $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT order_id FROM {$table} WHERE product_id = %d ORDER BY date_created DESC", $product_id ) ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery,WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}
	// …otherwise (or for orders it hasn't indexed yet) the latest orders are read one by one.
	$recent = wc_get_orders(
		array(
			'limit'   => 300,
			'orderby' => 'date',
			'order'   => 'DESC',
			'type'    => 'shop_order',
			'return'  => 'ids',
		)
	);
	$order_ids = array_values( array_unique( array_merge( array_map( 'intval', $recent ), $order_ids ) ) );
	$rows      = array();
	foreach ( $order_ids as $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order || ! is_a( $order, 'WC_Order' ) || in_array( $order->get_status(), $skip, true ) ) {
			continue;
		}
		foreach ( $order->get_items() as $item ) {
			if ( (int) $item->get_product_id() !== $product_id ) {
				continue;
			}
			$size = '';
			foreach ( $item->get_meta_data() as $meta ) {
				if ( preg_match( '/size/i', (string) $meta->key ) ) {
					$size = (string) $meta->value;
				}
			}
			$user   = $order->get_user();
			$rows[] = array(
				'order'    => $order->get_order_number(),
				'order_id' => $order->get_id(),
				'date'     => $order->get_date_created() ? $order->get_date_created()->date_i18n( 'Y-m-d H:i' ) : '',
				'status'   => wc_get_order_status_name( $order->get_status() ),
				'first'    => $order->get_billing_first_name(),
				'last'     => $order->get_billing_last_name(),
				'email'    => $order->get_billing_email(),
				'phone'    => $order->get_billing_phone(),
				'address'  => trim( $order->get_billing_address_1() . ' ' . $order->get_billing_address_2() ),
				'city'     => $order->get_billing_city(),
				'state'    => WC()->countries->get_states( $order->get_billing_country() )[ $order->get_billing_state() ] ?? $order->get_billing_state(),
				'country'  => $order->get_billing_country(),
				'size'     => str_replace( '-', ' ', strtoupper( $size ) ),
				'qty'      => (int) $item->get_quantity(),
				'line'     => (float) $item->get_total(),
				'total'    => (float) $order->get_total(),
				'payment'  => $order->get_payment_method_title(),
				'account'  => $user ? $user->user_email : 'Guest',
				'note'     => $order->get_customer_note(),
			);
		}
		if ( $limit && count( $rows ) >= $limit ) {
			break;
		}
	}
	usort( $rows, fn( $a, $b ) => strcmp( $b['date'], $a['date'] ) );
	return $rows;
}

/** The buyers table (product screen box and the full page). */
function rfaheya_buyers_table( $rows ) {
	if ( ! $rows ) {
		echo '<p style="color:#7b6e5b">Nobody has bought this product yet.</p>';
		return;
	}
	echo '<div style="overflow-x:auto"><table class="widefat striped rf-buyers"><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Customer</th><th>Email</th><th>Phone</th><th>Address</th><th>Size</th><th>Qty</th><th>Line total</th></tr></thead><tbody>';
	foreach ( $rows as $r ) {
		$order_link = admin_url( 'post.php?post=' . (int) $r['order_id'] . '&action=edit' );
		if ( class_exists( '\Automattic\WooCommerce\Utilities\OrderUtil' ) && \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled() ) {
			$order_link = admin_url( 'admin.php?page=wc-orders&action=edit&id=' . (int) $r['order_id'] );
		}
		printf(
			'<tr><td><a href="%s">#%s</a></td><td>%s</td><td>%s</td><td>%s</td><td><a href="mailto:%s">%s</a></td><td><a href="tel:%s">%s</a></td><td>%s</td><td>%s</td><td>%d</td><td>%s</td></tr>',
			esc_url( $order_link ),
			esc_html( $r['order'] ),
			esc_html( $r['date'] ),
			esc_html( $r['status'] ),
			esc_html( trim( $r['first'] . ' ' . $r['last'] ) ),
			esc_attr( $r['email'] ),
			esc_html( $r['email'] ),
			esc_attr( $r['phone'] ),
			esc_html( $r['phone'] ),
			esc_html( trim( $r['address'] . ', ' . $r['city'] . ( $r['state'] ? ', ' . $r['state'] : '' ), ', ' ) ),
			esc_html( $r['size'] ),
			(int) $r['qty'],
			wp_kses_post( wc_price( $r['line'] ) )
		);
	}
	echo '</tbody></table></div>';
}

function rfaheya_buyers_export_url( $product_id ) {
	return wp_nonce_url( admin_url( 'admin-post.php?action=rfaheya_buyers_csv&product=' . (int) $product_id ), 'rfaheya_buyers_csv_' . (int) $product_id );
}

// The product screen: who bought it, with the export.
add_action(
	'add_meta_boxes_product',
	function ( $post ) {
		if ( ! current_user_can( 'edit_shop_orders' ) && ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		add_meta_box(
			'rfaheya_buyers',
			'Customers who bought this',
			function ( $post ) {
				$rows = rfaheya_product_buyers( $post->ID, 25 );
				echo '<p style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:0">';
				printf( '<a class="button button-primary" href="%s">Export all buyers (Excel)</a>', esc_url( rfaheya_buyers_export_url( $post->ID ) ) );
				printf( '<a class="button" href="%s">See the full list</a>', esc_url( admin_url( 'edit.php?post_type=product&page=rfaheya-buyers&product=' . (int) $post->ID ) ) );
				echo '<span style="color:#7b6e5b">The latest buyers are shown here; the export and the full list have everyone.</span></p>';
				rfaheya_buyers_table( $rows );
			},
			'product',
			'normal',
			'default'
		);
	}
);

// Products → Buyers: pick a product, see everyone who bought it, export.
add_action(
	'admin_menu',
	function () {
		add_submenu_page(
			'edit.php?post_type=product',
			'Buyers',
			'Buyers',
			'manage_woocommerce',
			'rfaheya-buyers',
			function () {
				$product_id = isset( $_GET['product'] ) ? absint( $_GET['product'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				echo '<div class="wrap"><h1 class="wp-heading-inline">Buyers</h1><p>Everyone who bought a product, with their details. Choose a product, then export the list as an Excel file.</p>';
				echo '<form method="get" style="display:flex;gap:8px;align-items:center;margin:14px 0"><input type="hidden" name="post_type" value="product"><input type="hidden" name="page" value="rfaheya-buyers"><select name="product" style="min-width:280px"><option value="">— Choose a product —</option>';
				foreach ( rfaheya_one_language( get_posts( array( 'post_type' => 'product', 'post_status' => array( 'publish', 'private', 'draft' ), 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) ) ) as $p ) {
					printf( '<option value="%d" %s>%s</option>', (int) $p->ID, selected( $product_id, $p->ID, false ), esc_html( get_the_title( $p ) ) );
				}
				echo '</select><button class="button">Show buyers</button></form>';
				if ( $product_id ) {
					$rows = rfaheya_product_buyers( $product_id );
					printf( '<p><strong>%d</strong> order lines · <a class="button button-primary" href="%s">Export Excel</a></p>', count( $rows ), esc_url( rfaheya_buyers_export_url( $product_id ) ) );
					rfaheya_buyers_table( $rows );
				}
				echo '</div>';
			}
		);
	},
	60
);

// A "Buyers" link under each product in Products.
add_filter(
	'post_row_actions',
	function ( $actions, $post ) {
		if ( 'product' === $post->post_type && current_user_can( 'manage_woocommerce' ) ) {
			$actions['rfaheya_buyers'] = sprintf( '<a href="%s">Buyers</a>', esc_url( admin_url( 'edit.php?post_type=product&page=rfaheya-buyers&product=' . (int) $post->ID ) ) );
		}
		return $actions;
	},
	10,
	2
);

// The Excel download.
add_action(
	'admin_post_rfaheya_buyers_csv',
	function () {
		$product_id = isset( $_GET['product'] ) ? absint( $_GET['product'] ) : 0;
		if ( ! $product_id || ! current_user_can( 'manage_woocommerce' ) || ! wp_verify_nonce( isset( $_GET['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ) : '', 'rfaheya_buyers_csv_' . $product_id ) ) {
			wp_die( 'Not allowed.', 403 );
		}
		$rows    = rfaheya_product_buyers( $product_id );
		$product = get_the_title( $product_id );
		$head    = array( 'Order', 'Date', 'Status', 'First name', 'Last name', 'Email', 'Phone', 'Address', 'City', 'Governorate', 'Country', 'Product', 'Size', 'Quantity', 'Line total', 'Order total', 'Payment', 'Account', 'Customer note' );
		$lines   = array();
		foreach ( $rows as $r ) {
			$lines[] = array( $r['order'], $r['date'], $r['status'], $r['first'], $r['last'], $r['email'], $r['phone'], $r['address'], $r['city'], $r['state'], $r['country'], $product, $r['size'], (float) $r['qty'], (float) $r['line'], (float) $r['total'], $r['payment'], $r['account'], $r['note'] );
		}
		rfaheya_send_xlsx( sanitize_file_name( get_post_field( 'post_name', $product_id ) . '-buyers-' . gmdate( 'Y-m-d' ) ), 'Buyers', $head, $lines );
		exit;
	}
);

/**
 * Sends a table as an Excel file (.xlsx): bold header row, frozen, with filters; numbers as
 * numbers, everything else (phones too) as text, so nothing turns into a formula or loses its
 * leading zero. Without PHP's zip support, a CSV that Excel opens instead.
 */
function rfaheya_send_xlsx( $basename, $sheet, $head, $rows ) {
	while ( ob_get_level() > 0 ) {
		ob_end_clean();
	}
	nocache_headers();
	if ( ! class_exists( 'ZipArchive' ) ) {
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $basename . '.csv"' );
		$out = fopen( 'php://output', 'w' );
		fwrite( $out, "\xEF\xBB\xBF" ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		fputcsv( $out, $head );
		foreach ( $rows as $r ) {
			fputcsv( $out, array_map( fn( $v ) => is_string( $v ) && preg_match( '/^(=|@|[+\-](?!\d))/', $v ) ? "'" . $v : $v, $r ) );
		}
		fclose( $out ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		return;
	}
	$x   = fn( $v ) => htmlspecialchars( preg_replace( '/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', (string) $v ), ENT_XML1 | ENT_QUOTES, 'UTF-8' );
	$col = function ( $i ) {
		$s = '';
		for ( $i++; $i > 0; $i = intdiv( $i - 1, 26 ) ) {
			$s = chr( 65 + ( $i - 1 ) % 26 ) . $s;
		}
		return $s;
	};
	$cell = function ( $v, $ref, $style = 0 ) use ( $x ) {
		if ( is_int( $v ) || is_float( $v ) ) {
			return '<c r="' . $ref . '"' . ( $style ? ' s="' . $style . '"' : '' ) . '><v>' . ( 0 + $v ) . '</v></c>';
		}
		return '<c r="' . $ref . '" t="inlineStr"' . ( $style ? ' s="' . $style . '"' : '' ) . '><is><t xml:space="preserve">' . $x( $v ) . '</t></is></c>';
	};
	$all   = array_merge( array( $head ), $rows );
	$xml   = '';
	$width = array();
	foreach ( $all as $r => $row ) {
		$xml .= '<row r="' . ( $r + 1 ) . '">';
		foreach ( array_values( $row ) as $c => $v ) {
			$xml        .= $cell( $v, $col( $c ) . ( $r + 1 ), 0 === $r ? 1 : 0 );
			$width[ $c ] = min( 60, max( $width[ $c ] ?? 8, function_exists( 'mb_strlen' ) ? mb_strlen( (string) $v ) + 2 : strlen( (string) $v ) + 2 ) );
		}
		$xml .= '</row>';
	}
	$cols = '';
	foreach ( $width as $c => $w ) {
		$cols .= '<col min="' . ( $c + 1 ) . '" max="' . ( $c + 1 ) . '" width="' . $w . '" customWidth="1"/>';
	}
	$last  = $col( max( 0, count( $head ) - 1 ) ) . max( 1, count( $all ) );
	$sheet = $x( mb_substr( preg_replace( '#[\\/?*\[\]:]#', ' ', $sheet ), 0, 31 ) );
	$files = array(
		'[Content_Types].xml'        => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
		'_rels/.rels'                => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
		'xl/workbook.xml'            => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' . $sheet . '" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">\'' . $sheet . '\'!$A$1:$' . preg_replace( '/\d+$/', '', $last ) . '$' . preg_replace( '/^[A-Z]+/', '', $last ) . '</definedName></definedNames></workbook>',
		'xl/_rels/workbook.xml.rels' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
		'xl/styles.xml'              => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF14110D"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf xfId="0"/><xf xfId="0" fontId="1" fillId="2" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
		'xl/worksheets/sheet1.xml'   => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>' . $cols . '</cols><sheetData>' . $xml . '</sheetData><autoFilter ref="A1:' . $last . '"/></worksheet>',
	);
	$tmp = wp_tempnam( 'rfaheya-xlsx' );
	$zip = new ZipArchive();
	$zip->open( $tmp, ZipArchive::OVERWRITE );
	foreach ( $files as $path => $content ) {
		$zip->addFromString( $path, $content );
	}
	$zip->close();
	header( 'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' );
	header( 'Content-Disposition: attachment; filename="' . $basename . '.xlsx"' );
	header( 'Content-Length: ' . filesize( $tmp ) );
	readfile( $tmp ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	wp_delete_file( $tmp );
}

/* ---------------------------------------------------------------- the Vitrine's characters */

const RFAHEYA_CHARACTERS = 'rfaheya_characters';

/** The built-in characters (what the storefront shows until the page is saved). */
function rfaheya_default_characters() {
	$rows = array(
		array( 'gangster', 'The Gangster', 'Smoke, leather & power' ),
		array( 'doll', 'The Doll', 'Sweet, pink & iconic' ),
		array( 'professor', 'The Professor', 'Woody, wise & refined' ),
		array( 'gentleman', 'The Gentleman', 'Sharp, clean & confident' ),
		array( 'romantic', 'The Romantic', 'Rose, warmth & date nights' ),
		array( 'nightowl', 'The Night Owl', 'Loud, magnetic & after dark' ),
		array( 'freespirit', 'The Free Spirit', 'Fresh air & endless summer' ),
		array( 'sultan', 'The Sultan', 'Oud, amber & royal trails' ),
	);
	return array_map(
		fn( $r ) => array(
			'id'       => $r[0],
			'name'     => $r[1],
			'tagline'  => $r[2],
			'enabled'  => true,
			'image'    => 0,
			'products' => array(),
		),
		$rows
	);
}

/** The characters as saved (or the built-in ones). */
function rfaheya_characters() {
	$saved = get_option( RFAHEYA_CHARACTERS, null );
	return is_array( $saved ) ? $saved : rfaheya_default_characters();
}

/** For the storefront: the switched-on characters, or null while the page was never saved (the built-in ones then). */
function rfaheya_characters_data() {
	$saved = get_option( RFAHEYA_CHARACTERS, null );
	if ( ! is_array( $saved ) ) {
		return null;
	}
	$out = array();
	foreach ( $saved as $c ) {
		if ( empty( $c['enabled'] ) ) {
			continue;
		}
		$out[] = array(
			'id'       => (string) $c['id'],
			'name'     => (string) $c['name'],
			'tagline'  => (string) $c['tagline'],
			'image'    => empty( $c['image'] ) ? '' : (string) wp_get_attachment_image_url( (int) $c['image'], 'full' ),
			'products' => array_map( 'intval', (array) $c['products'] ),
		);
	}
	return $out;
}

function rfaheya_characters_url( $args = array() ) {
	return add_query_arg( array_merge( array( 'post_type' => 'product', 'page' => 'rfaheya-characters' ), $args ), admin_url( 'edit.php' ) );
}

add_action(
	'admin_menu',
	function () {
		add_submenu_page( 'edit.php?post_type=product', 'Vitrine characters', 'Vitrine characters', 'manage_woocommerce', 'rfaheya-characters', 'rfaheya_characters_page' );
	}
);

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'product_page_rfaheya-characters' === $hook ) {
			wp_enqueue_media();
		}
	}
);

/** A picture named character-<id> (e.g. character-professor.png) becomes that character's photo when it has none. */
function rfaheya_character_attach( $attachment_id ) {
	$file = strtolower( pathinfo( (string) get_post_meta( $attachment_id, '_wp_attached_file', true ), PATHINFO_FILENAME ) );
	if ( ! preg_match( '/^character-(.+?)(-\d+|-scaled)?$/', $file, $m ) ) {
		return false;
	}
	$list = rfaheya_characters();
	foreach ( $list as $i => $c ) {
		if ( sanitize_key( $c['id'] ) === sanitize_key( $m[1] ) && empty( $c['image'] ) ) {
			$list[ $i ]['image'] = (int) $attachment_id;
			update_option( RFAHEYA_CHARACTERS, $list, false );
			delete_transient( 'rfaheya_bootstrap' );
			return true;
		}
	}
	return false;
}
add_action( 'add_attachment', 'rfaheya_character_attach' );

add_action(
	'admin_post_rfaheya_save_characters',
	function () {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'Sorry, you are not allowed to change the characters.' );
		}
		check_admin_referer( 'rfaheya_save_characters' );
		if ( ! empty( $_POST['reset'] ) ) {
			delete_option( RFAHEYA_CHARACTERS );
		} else {
			$input   = isset( $_POST['ch'] ) && is_array( $_POST['ch'] ) ? wp_unslash( $_POST['ch'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned below
			$list    = array();
			foreach ( $input as $r ) {
				if ( ! is_array( $r ) || ! empty( $r['delete'] ) ) {
					continue;
				}
				$name = sanitize_text_field( $r['name'] ?? '' );
				if ( '' === $name ) {
					continue;
				}
				$id     = sanitize_key( $r['id'] ?? '' );
				$list[] = array(
					'id'       => $id ? $id : strtolower( wp_generate_password( 8, false ) ),
					'name'     => $name,
					'tagline'  => sanitize_text_field( $r['tagline'] ?? '' ),
					'enabled'  => ! empty( $r['enabled'] ),
					'image'    => absint( $r['image'] ?? 0 ),
					'products' => array_values( array_unique( array_filter( array_map( 'absint', (array) ( $r['products'] ?? array() ) ) ) ) ),
					'order'    => (float) ( $r['order'] ?? 0 ),
				);
			}
			usort( $list, fn( $a, $b ) => $a['order'] <=> $b['order'] );
			foreach ( $list as $i => $c ) {
				unset( $list[ $i ]['order'] );
			}
			update_option( RFAHEYA_CHARACTERS, $list, false );
		}
		delete_transient( 'rfaheya_bootstrap' );
		rfaheya_purge_page_cache();
		wp_safe_redirect( rfaheya_characters_url( array( 'saved' => 1 ) ) );
		exit;
	}
);

/** One character's card (also the blank template for "Add a character"). */
function rfaheya_character_card( $key, $c, $products ) {
	$n      = 'ch[' . $key . ']';
	$picked = array_map( 'intval', (array) ( $c['products'] ?? array() ) );
	usort( $products, fn( $a, $b ) => (int) in_array( $b['id'], $picked, true ) <=> (int) in_array( $a['id'], $picked, true ) );
	?>
	<div class="rfc-card<?php echo empty( $c['enabled'] ) ? ' is-off' : ''; ?>">
		<input type="hidden" name="<?php echo esc_attr( $n ); ?>[id]" value="<?php echo esc_attr( $c['id'] ?? '' ); ?>">
		<div class="rfc-head">
			<label class="rfc-switch"><input type="checkbox" name="<?php echo esc_attr( $n ); ?>[enabled]" value="1" <?php checked( ! empty( $c['enabled'] ) ); ?>> Show in the Vitrine</label>
			<label class="rfc-order">Order <input type="number" step="1" name="<?php echo esc_attr( $n ); ?>[order]" value="<?php echo esc_attr( $c['_order'] ?? 0 ); ?>"></label>
			<label class="rfc-delete"><input type="checkbox" name="<?php echo esc_attr( $n ); ?>[delete]" value="1"> Delete</label>
		</div>
		<div class="rfc-grid">
			<label>Name<input type="text" class="regular-text" name="<?php echo esc_attr( $n ); ?>[name]" value="<?php echo esc_attr( $c['name'] ?? '' ); ?>" placeholder="The Professor"></label>
			<label>Line under the name<input type="text" class="regular-text" name="<?php echo esc_attr( $n ); ?>[tagline]" value="<?php echo esc_attr( $c['tagline'] ?? '' ); ?>" placeholder="Woody, wise & refined"></label>
		</div>
		<div class="rfc-photo">
			<?php $img = (int) ( $c['image'] ?? 0 ); ?>
			<div class="rfc-photo-preview"><?php echo $img ? wp_get_attachment_image( $img, 'medium' ) : '<span>No photo yet<br>(a gold silhouette stands in)</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
			<div>
				<p class="rfc-label">The character’s photo</p>
				<p class="description">A full-length photo of the person, head to shoes, <b>with a transparent background</b> (PNG or WebP), standing straight and facing forward. Tall pictures look best (about 1 wide : 2.4 tall). Tip: name the file <code>character-<?php echo esc_html( $c['id'] ?? 'id' ); ?>.png</code> and it attaches itself when uploaded to the Media Library.</p>
				<input type="hidden" class="rfc-image" name="<?php echo esc_attr( $n ); ?>[image]" value="<?php echo esc_attr( $img ? $img : '' ); ?>">
				<button type="button" class="button rfc-pick">Choose photo</button> <button type="button" class="button-link rfc-clear">Remove</button>
			</div>
		</div>
		<div class="rfc-products">
			<p class="rfc-label">Perfumes <small>(ticked ones show on this character’s wall, in this order; none ticked = picked by its taste automatically). Only perfumes with a <b>Vitrine bottle</b> picture appear.</small></p>
			<div class="rfc-tools"><input type="search" class="rfc-search" placeholder="Search perfumes…"><span class="rfc-count"></span></div>
			<div class="rfc-list">
				<?php foreach ( $products as $p ) : ?>
					<label class="rfc-product<?php echo $p['bottle'] ? '' : ' no-bottle'; ?>" data-name="<?php echo esc_attr( strtolower( $p['name'] ) ); ?>">
						<input type="checkbox" name="<?php echo esc_attr( $n ); ?>[products][]" value="<?php echo esc_attr( $p['id'] ); ?>" <?php checked( in_array( $p['id'], $picked, true ) ); ?>>
						<?php echo $p['thumb']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<span><?php echo esc_html( $p['name'] ); ?><?php echo $p['bottle'] ? '' : ' <em>no Vitrine bottle</em>'; ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
	<?php
}

function rfaheya_characters_page() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	$posts    = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	);
	$products = array_map(
		fn( $p ) => array(
			'id'     => (int) $p->ID,
			'name'   => get_the_title( $p ),
			'thumb'  => get_the_post_thumbnail( $p->ID, array( 36, 36 ) ),
			'bottle' => ! empty( rfaheya_details( $p->ID )['showcase_image'] ),
		),
		$posts
	);
	$list     = rfaheya_characters();
	?>
	<div class="wrap rfc">
		<h1>Vitrine characters</h1>
		<p class="description">The Vitrine opens on a dark stage where the characters stand in a curve, turned with a scroll, a drag or a swipe. A tap on a character lights its own wall of perfumes in the vitrine; from there shoppers add one, choose a few, or take the whole look, then go back and pick another character.</p>
		<?php if ( isset( $_GET['saved'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended ?>
			<div class="notice notice-success is-dismissible"><p>Saved. The Vitrine shows the new characters now.</p></div>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="rfaheya_save_characters">
			<?php wp_nonce_field( 'rfaheya_save_characters' ); ?>
			<div class="rfc-cards">
				<?php
				foreach ( $list as $i => $c ) {
					$c['_order'] = ( $i + 1 ) * 10;
					rfaheya_character_card( 'k' . $i, $c, $products );
				}
				?>
			</div>
			<template id="rfc-template">
				<?php
				rfaheya_character_card(
					'__KEY__',
					array(
						'enabled' => true,
						'_order'  => ( count( $list ) + 1 ) * 10,
					),
					$products
				);
				?>
			</template>
			<p>
				<button type="button" class="button" id="rfc-add">+ Add a character</button>
			</p>
			<p class="submit">
				<button type="submit" class="button button-primary button-large">Save characters</button>
				<button type="submit" name="reset" value="1" class="button rfc-reset" onclick="return confirm('Go back to the built-in eight characters?');">Reset to the built-in characters</button>
			</p>
		</form>
	</div>
	<style>
		.rfc-cards{display:grid;gap:16px;max-width:1100px;margin-top:16px}
		.rfc-card{background:#fff;border:1px solid #dcdcde;border-radius:10px;padding:16px 18px;border-top:3px solid #e49b2d}
		.rfc-card.is-off{opacity:.62;border-top-color:#c3c4c7}
		.rfc-head{display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
		.rfc-switch{font-weight:600}
		.rfc-order input{width:70px;margin-left:6px}
		.rfc-delete{margin-left:auto;color:#b32d2e}
		.rfc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
		.rfc-grid label{display:grid;gap:4px;font-weight:600}
		.rfc-grid input,.rfc-grid select{width:100%;max-width:none;font-weight:400}
		.rfc-photo{display:flex;gap:16px;align-items:center;margin-top:14px}
		.rfc-photo-preview{flex:none;width:96px;height:150px;display:grid;place-items:center;border-radius:8px;background:repeating-conic-gradient(#f0f0f1 0 25%,#fff 0 50%) 0 0/16px 16px;border:1px solid #dcdcde;overflow:hidden;text-align:center;font-size:11px;color:#8c8f94}
		.rfc-photo-preview img{width:100%;height:100%;object-fit:contain}
		.rfc-photo .rfc-label{margin-top:0}
		.rfc-label{margin:14px 0 6px;font-weight:600}.rfc-label small{font-weight:400;color:#646970}
		.rfc-tools{display:flex;gap:10px;align-items:center;margin-bottom:6px}.rfc-count{color:#646970}
		.rfc-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:4px;max-height:260px;overflow:auto;border:1px solid #f0f0f1;border-radius:8px;padding:6px}
		.rfc-product{display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:6px;cursor:pointer}
		.rfc-product:hover{background:#f6f7f7}.rfc-product img{width:30px;height:30px;object-fit:cover;border-radius:4px}
		.rfc-product:has(input:checked){background:#fcf3e4}
		.rfc-product.no-bottle span{color:#8c8f94}.rfc-product em{font-size:11px;color:#b26200}
	</style>
	<script>
	(function(){
		function wire(card){
			var s=card.querySelector('.rfc-search'),c=card.querySelector('.rfc-count');
			function count(){c.textContent=card.querySelectorAll('.rfc-list input:checked').length+' ticked'}
			s.addEventListener('input',function(){var q=s.value.trim().toLowerCase();card.querySelectorAll('.rfc-product').forEach(function(l){l.style.display=!q||l.dataset.name.indexOf(q)>-1?'':'none'})});
			card.addEventListener('change',function(e){if(e.target.name&&/\[enabled\]$/.test(e.target.name))card.classList.toggle('is-off',!e.target.checked);count()});
			count();
		}
		document.querySelectorAll('.rfc-card').forEach(wire);
		document.addEventListener('click',function(e){
			var card=e.target.closest('.rfc-card');if(!card)return;
			var input=card.querySelector('.rfc-image'),box=card.querySelector('.rfc-photo-preview');
			if(e.target.classList.contains('rfc-clear')){input.value='';box.innerHTML='<span>No photo yet</span>';}
			if(e.target.classList.contains('rfc-pick')&&window.wp&&wp.media){
				var f=wp.media({title:'The character’s photo',library:{type:'image'},multiple:false});
				f.on('select',function(){var a=f.state().get('selection').first().toJSON();input.value=a.id;var u=(a.sizes&&a.sizes.medium?a.sizes.medium.url:a.url);box.innerHTML='<img src="'+u+'" alt="">';});
				f.open();
			}
		});
		var n=0;
		document.getElementById('rfc-add').addEventListener('click',function(){
			var t=document.getElementById('rfc-template').innerHTML.replace(/__KEY__/g,'n'+(n++));
			var box=document.createElement('div');box.innerHTML=t;var card=box.firstElementChild;
			document.querySelector('.rfc-cards').appendChild(card);wire(card);card.scrollIntoView({behavior:'smooth'});card.querySelector('input[type=text]').focus();
		});
	})();
	</script>
	<?php
}

/* ---------------------------------------------------------------- creating an order in the dashboard */

/** Products for the order page: each with its sizes and prices (one language with WPML). */
function rfaheya_order_catalog() {
	$out = array();
	$ids = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'numberposts'    => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
			'fields'         => 'ids',
			'suppress_filters' => false,
		)
	);
	foreach ( rfaheya_one_language( $ids ) as $id ) {
		$p = wc_get_product( is_object( $id ) ? $id->ID : $id );
		if ( ! $p || 'publish' !== $p->get_status() ) {
			continue;
		}
		$sizes = array();
		if ( $p->is_type( 'variable' ) ) {
			foreach ( $p->get_children() as $vid ) {
				$v = wc_get_product( $vid );
				if ( ! $v || ! $v->is_purchasable() ) {
					continue;
				}
				$label = implode( ' · ', array_filter( array_map( 'strval', $v->get_variation_attributes() ) ) );
				$sizes[] = array(
					'id'    => $v->get_id(),
					'label' => $label ? strtoupper( rawurldecode( $label ) ) : $v->get_name(),
					'price' => (float) $v->get_price(),
					'stock' => $v->managing_stock() ? (int) $v->get_stock_quantity() : null,
					'in'    => $v->is_in_stock(),
				);
			}
		} elseif ( $p->is_purchasable() ) {
			$sizes[] = array(
				'id'    => $p->get_id(),
				'label' => '',
				'price' => (float) $p->get_price(),
				'stock' => $p->managing_stock() ? (int) $p->get_stock_quantity() : null,
				'in'    => $p->is_in_stock(),
			);
		}
		if ( ! $sizes ) {
			continue;
		}
		$out[] = array(
			'id'    => $p->get_id(),
			'name'  => $p->get_name(),
			'sku'   => $p->get_sku(),
			'thumb' => (string) wp_get_attachment_image_url( $p->get_image_id(), 'thumbnail' ),
			'sizes' => $sizes,
		);
	}
	return $out;
}

add_action(
	'admin_menu',
	function () {
		add_submenu_page( 'woocommerce', 'New order', 'New order ✦', 'edit_shop_orders', 'rfaheya-new-order', 'rfaheya_new_order_page', 1 );
	},
	60
);

function rfaheya_new_order_url( $args = array() ) {
	return add_query_arg( array_merge( array( 'page' => 'rfaheya-new-order' ), $args ), admin_url( 'admin.php' ) );
}

/** The order's edit screen (with or without WooCommerce's order tables). */
function rfaheya_order_edit_url( $order ) {
	return method_exists( $order, 'get_edit_order_url' ) ? $order->get_edit_order_url() : admin_url( 'post.php?post=' . $order->get_id() . '&action=edit' );
}

// The orders list: the "Add order" button opens this page instead (WooCommerce's stays reachable from the menu).
add_action(
	'admin_footer',
	function () {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || ! in_array( $screen->id, array( 'edit-shop_order', 'woocommerce_page_wc-orders' ), true ) || ! current_user_can( 'edit_shop_orders' ) ) {
			return;
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- which screen only
		if ( isset( $_GET['action'] ) ) {
			return; // an order's own screen
		}
		printf(
			'<script>(function(){var a=document.querySelector(".page-title-action");if(!a)return;var b=document.createElement("a");b.href=%s;b.className="page-title-action";b.textContent="New order ✦";b.style.cssText="background:#e49b2d;border-color:#e49b2d;color:#1a1206;font-weight:600";a.parentNode.insertBefore(b,a);})();</script>',
			wp_json_encode( rfaheya_new_order_url() )
		);
	}
);

// Finding a customer: accounts by name, email or phone, and guests from earlier orders.
add_action(
	'wp_ajax_rfaheya_order_customers',
	function () {
		check_ajax_referer( 'rfaheya_new_order' );
		if ( ! current_user_can( 'edit_shop_orders' ) ) {
			wp_send_json( array() );
		}
		$q    = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
		$out  = array();
		$seen = array();
		if ( mb_strlen( $q ) < 2 ) {
			wp_send_json( $out );
		}
		$digits = preg_replace( '/\D+/', '', $q );
		$users  = get_users(
			array(
				'search'         => '*' . $q . '*',
				'search_columns' => array( 'user_email', 'user_login', 'display_name' ),
				'number'         => 8,
			)
		);
		$meta_q = array( 'relation' => 'OR' );
		foreach ( array( 'first_name', 'last_name', 'billing_first_name', 'billing_last_name' ) as $k ) {
			$meta_q[] = array( 'key' => $k, 'value' => $q, 'compare' => 'LIKE' );
		}
		if ( strlen( $digits ) >= 4 ) {
			$meta_q[] = array( 'key' => 'billing_phone', 'value' => $digits, 'compare' => 'LIKE' );
		}
		$users = array_merge( $users, get_users( array( 'meta_query' => $meta_q, 'number' => 8 ) ) ); // phpcs:ignore WordPress.DB.SlowDBQuery
		foreach ( $users as $u ) {
			if ( isset( $seen[ 'u' . $u->ID ] ) ) {
				continue;
			}
			$seen[ 'u' . $u->ID ] = true;
			$c     = new WC_Customer( $u->ID );
			$out[] = array(
				'user'     => $u->ID,
				'first'    => $c->get_billing_first_name() ? $c->get_billing_first_name() : $u->first_name,
				'last'     => $c->get_billing_last_name() ? $c->get_billing_last_name() : $u->last_name,
				'email'    => $u->user_email,
				'phone'    => $c->get_billing_phone(),
				'state'    => $c->get_billing_state(),
				'city'     => $c->get_billing_city(),
				'address'  => $c->get_billing_address_1(),
				'address2' => $c->get_billing_address_2(),
				'kind'     => 'Account',
			);
		}
		// Guests: the latest order each one placed.
		foreach ( wc_order_search( $q ) as $oid ) {
			if ( count( $out ) >= 14 ) {
				break;
			}
			$o = wc_get_order( $oid );
			if ( ! $o || $o->get_customer_id() ) {
				continue;
			}
			$key = 'g' . preg_replace( '/\D+/', '', $o->get_billing_phone() ) . strtolower( $o->get_billing_email() );
			if ( isset( $seen[ $key ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			$out[]        = array(
				'user'     => 0,
				'first'    => $o->get_billing_first_name(),
				'last'     => $o->get_billing_last_name(),
				'email'    => $o->get_billing_email(),
				'phone'    => $o->get_billing_phone(),
				'state'    => $o->get_billing_state(),
				'city'     => $o->get_billing_city(),
				'address'  => $o->get_billing_address_1(),
				'address2' => $o->get_billing_address_2(),
				'kind'     => 'Guest · order #' . $o->get_order_number(),
			);
		}
		wp_send_json( $out );
	}
);

// The shipping for a governorate, from WooCommerce's shipping zones (the first method; it can be changed).
add_action(
	'wp_ajax_rfaheya_order_shipping',
	function () {
		check_ajax_referer( 'rfaheya_new_order' );
		$state = isset( $_GET['state'] ) ? sanitize_text_field( wp_unslash( $_GET['state'] ) ) : '';
		$total = isset( $_GET['total'] ) ? (float) $_GET['total'] : 0;
		$out   = array();
		if ( class_exists( 'WC_Shipping_Zones' ) ) {
			$zone = WC_Shipping_Zones::get_zone_matching_package(
				array(
					'destination' => array(
						'country'  => 'EG',
						'state'    => $state,
						'postcode' => '',
					),
				)
			);
			foreach ( $zone->get_shipping_methods( true ) as $m ) {
				$cost = 0.0;
				if ( 'free_shipping' === $m->id ) {
					$min = (float) $m->get_option( 'min_amount', 0 );
					if ( $min > 0 && $total < $min ) {
						continue;
					}
				} else {
					$raw  = (string) $m->get_option( 'cost', '0' );
					$cost = is_numeric( trim( $raw ) ) ? (float) $raw : (float) preg_replace( '/[^\d.]/', '', $raw );
				}
				$out[] = array( 'title' => $m->get_title(), 'cost' => $cost, 'method' => $m->id . ':' . $m->get_instance_id() );
			}
		}
		// The store's own free shipping (Settings → Rfaheya Store → Orders & offers).
		$o = rfaheya_options()['shipping'];
		if ( 'no' !== $o['free_enabled'] && in_array( $state, array( 'EGC', 'EGALX' ), true ) && (float) $o['free_min'] > 0 && $total >= (float) $o['free_min'] ) {
			array_unshift( $out, array( 'title' => 'Free shipping', 'cost' => 0, 'method' => 'free_shipping' ) );
		}
		wp_send_json( $out );
	}
);

/** Makes (or finds) a customer account for an order, quietly: no email is sent. */
function rfaheya_order_account( $c ) {
	$email = sanitize_email( $c['email'] ?? '' );
	if ( ! is_email( $email ) ) {
		return new WP_Error( 'email', 'An account needs an email address.' );
	}
	$existing = email_exists( $email );
	if ( $existing ) {
		return (int) $existing;
	}
	$base  = sanitize_user( current( explode( '@', $email ) ), true );
	$base  = $base ? $base : 'customer';
	$login = $base;
	for ( $n = 2; username_exists( $login ); $n++ ) {
		$login = $base . $n;
	}
	$id = wp_insert_user(
		array(
			'user_login'   => $login,
			'user_email'   => $email,
			'user_pass'    => wp_generate_password( 20 ),
			'first_name'   => $c['first'] ?? '',
			'last_name'    => $c['last'] ?? '',
			'display_name' => trim( ( $c['first'] ?? '' ) . ' ' . ( $c['last'] ?? '' ) ),
			'role'         => 'customer',
		)
	);
	if ( is_wp_error( $id ) ) {
		return $id;
	}
	foreach ( array( 'billing_first_name' => 'first', 'billing_last_name' => 'last', 'billing_phone' => 'phone', 'billing_email' => 'email', 'billing_state' => 'state', 'billing_city' => 'city', 'billing_address_1' => 'address', 'billing_address_2' => 'address2' ) as $meta => $k ) {
		update_user_meta( $id, $meta, $c[ $k ] ?? '' );
	}
	update_user_meta( $id, 'billing_country', 'EG' );
	return (int) $id;
}

// Creating the order.
add_action(
	'admin_post_rfaheya_create_order',
	function () {
		if ( ! current_user_can( 'edit_shop_orders' ) ) {
			wp_die( 'Sorry, you are not allowed to create orders.' );
		}
		check_admin_referer( 'rfaheya_new_order' );
		$raw  = isset( $_POST['payload'] ) ? json_decode( wp_unslash( $_POST['payload'] ), true ) : null; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned below
		$back = rfaheya_new_order_url();
		$fail = function ( $msg ) use ( $back ) {
			wp_safe_redirect( add_query_arg( 'rfaheya-error', rawurlencode( $msg ), $back ) );
			exit;
		};
		if ( ! is_array( $raw ) || empty( $raw['items'] ) ) {
			$fail( 'Add at least one product.' );
		}
		$text = fn( $v ) => sanitize_text_field( (string) $v );
		$c    = array_map( $text, (array) ( $raw['customer'] ?? array() ) );
		$c['email'] = sanitize_email( $c['email'] ?? '' );
		if ( '' === trim( ( $c['first'] ?? '' ) . ( $c['last'] ?? '' ) ) || '' === ( $c['phone'] ?? '' ) ) {
			$fail( 'Fill in the customer’s name and phone.' );
		}
		$user = absint( $raw['customer']['user'] ?? 0 );
		if ( ! $user && ! empty( $raw['account'] ) ) {
			$made = rfaheya_order_account( $c );
			if ( is_wp_error( $made ) ) {
				$fail( $made->get_error_message() );
			}
			$user = $made;
		}
		$order = wc_create_order( array( 'customer_id' => $user, 'created_via' => 'rfaheya-dashboard' ) );
		if ( is_wp_error( $order ) ) {
			$fail( $order->get_error_message() );
		}
		foreach ( (array) $raw['items'] as $it ) {
			$product = wc_get_product( absint( $it['id'] ?? 0 ) );
			$qty     = max( 1, min( 999, absint( $it['qty'] ?? 1 ) ) );
			if ( ! $product ) {
				continue;
			}
			$price = isset( $it['price'] ) && '' !== $it['price'] ? max( 0, (float) $it['price'] ) : (float) $product->get_price();
			$order->add_product(
				$product,
				$qty,
				array(
					'subtotal' => $price * $qty,
					'total'    => $price * $qty,
				)
			);
		}
		if ( ! $order->get_items() ) {
			$order->delete( true );
			$fail( 'The products could not be found.' );
		}
		$address = array(
			'first_name' => $c['first'] ?? '',
			'last_name'  => $c['last'] ?? '',
			'phone'      => $c['phone'] ?? '',
			'email'      => $c['email'] ?? '',
			'country'    => 'EG',
			'state'      => $c['state'] ?? '',
			'city'       => $c['city'] ?? '',
			'address_1'  => $c['address'] ?? '',
			'address_2'  => $c['address2'] ?? '',
		);
		$order->set_address( $address, 'billing' );
		unset( $address['email'] );
		$order->set_address( $address, 'shipping' );
		$ship = max( 0, (float) ( $raw['shipping']['cost'] ?? 0 ) );
		if ( $ship > 0 || '' !== ( $raw['shipping']['title'] ?? '' ) ) {
			$item = new WC_Order_Item_Shipping();
			$item->set_method_title( $text( $raw['shipping']['title'] ?? 'Shipping' ) ? $text( $raw['shipping']['title'] ?? 'Shipping' ) : 'Shipping' );
			$method = explode( ':', $text( $raw['shipping']['method'] ?? 'flat_rate' ) );
			$item->set_method_id( $method[0] );
			if ( isset( $method[1] ) ) {
				$item->set_instance_id( (int) $method[1] );
			}
			$item->set_total( $ship );
			$order->add_item( $item );
		}
		$order->calculate_totals( false ); // the products' total, for a percent discount
		$discount = max( 0, (float) ( $raw['discount']['value'] ?? 0 ) );
		if ( $discount > 0 ) {
			$items_total = (float) $order->get_subtotal();
			$off         = 'percent' === ( $raw['discount']['type'] ?? 'amount' ) ? round( $items_total * min( 100, $discount ) / 100, 2 ) : min( $items_total, $discount );
			$fee         = new WC_Order_Item_Fee();
			$fee->set_name( 'percent' === ( $raw['discount']['type'] ?? 'amount' ) ? sprintf( 'Discount · %s%%', rfaheya_number( $discount ) ) : 'Discount' );
			$fee->set_amount( -$off );
			$fee->set_total( -$off );
			$fee->set_tax_status( 'none' );
			$order->add_item( $fee );
		}
		$gateways = WC()->payment_gateways() ? WC()->payment_gateways()->payment_gateways() : array();
		$pay      = $text( $raw['payment'] ?? 'cod' );
		$order->set_payment_method( $pay );
		$order->set_payment_method_title( isset( $gateways[ $pay ] ) ? $gateways[ $pay ]->get_title() : ( 'cod' === $pay ? 'Cash on delivery' : $pay ) );
		if ( ! empty( $raw['note'] ) ) {
			$order->set_customer_note( sanitize_textarea_field( (string) $raw['note'] ) );
		}
		$order->calculate_totals( false );
		$statuses = array( 'pending', 'processing', 'on-hold', 'completed' );
		$status   = in_array( $raw['status'] ?? '', $statuses, true ) ? $raw['status'] : 'processing';
		$by       = wp_get_current_user()->display_name;
		$order->set_status( $status, sprintf( 'Created from the Rfaheya dashboard by %s.', $by ) );
		if ( ! empty( $raw['private'] ) ) {
			$order->add_order_note( sanitize_textarea_field( (string) $raw['private'] ), 0, true );
		}
		$order->save();
		if ( in_array( $status, array( 'processing', 'on-hold', 'completed' ), true ) ) {
			wc_maybe_reduce_stock_levels( $order->get_id() );
		}
		wp_safe_redirect( rfaheya_new_order_url( array( 'created' => $order->get_id() ) ) );
		exit;
	}
);

function rfaheya_new_order_page() {
	if ( ! current_user_can( 'edit_shop_orders' ) ) {
		return;
	}
	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- notices after a redirect
	$created = isset( $_GET['created'] ) ? wc_get_order( absint( $_GET['created'] ) ) : null;
	$error   = isset( $_GET['rfaheya-error'] ) ? sanitize_text_field( wp_unslash( $_GET['rfaheya-error'] ) ) : '';
	// phpcs:enable
	$gateways = array();
	foreach ( ( WC()->payment_gateways() ? WC()->payment_gateways()->payment_gateways() : array() ) as $id => $g ) {
		if ( 'yes' === $g->enabled ) {
			$gateways[ $id ] = $g->get_title();
		}
	}
	if ( ! isset( $gateways['cod'] ) ) {
		$gateways = array( 'cod' => 'Cash on delivery' ) + $gateways;
	}
	$states = WC()->countries ? WC()->countries->get_states( 'EG' ) : array();
	$data   = array(
		'products' => rfaheya_order_catalog(),
		'states'   => $states,
		'ajax'     => admin_url( 'admin-ajax.php' ),
		'nonce'    => wp_create_nonce( 'rfaheya_new_order' ),
		'currency' => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'EGP',
	);
	?>
	<div class="wrap rfo">
		<div class="rfo-head">
			<div>
				<p class="rfo-eyebrow">WooCommerce</p>
				<h1>New order</h1>
			</div>
			<a class="rfo-ghost" href="<?php echo esc_url( admin_url( class_exists( '\Automattic\WooCommerce\Utilities\OrderUtil' ) && \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled() ? 'admin.php?page=wc-orders' : 'edit.php?post_type=shop_order' ) ); ?>">All orders →</a>
		</div>
		<?php if ( $created ) : ?>
			<div class="rfo-done">
				<div class="rfo-done-icon">✓</div>
				<div>
					<h2>Order #<?php echo esc_html( $created->get_order_number() ); ?> is created</h2>
					<p><?php echo esc_html( trim( $created->get_billing_first_name() . ' ' . $created->get_billing_last_name() ) ); ?> · <?php echo wp_kses_post( $created->get_formatted_order_total() ); ?> · <?php echo esc_html( wc_get_order_status_name( $created->get_status() ) ); ?><?php echo $created->get_customer_id() ? ' · with an account' : ''; ?></p>
				</div>
				<div class="rfo-done-actions">
					<a class="rfo-btn" href="<?php echo esc_url( rfaheya_order_edit_url( $created ) ); ?>">Open the order</a>
					<a class="rfo-ghost" href="<?php echo esc_url( rfaheya_new_order_url() ); ?>">Create another</a>
				</div>
			</div>
		<?php endif; ?>
		<?php if ( $error ) : ?>
			<div class="rfo-error"><?php echo esc_html( $error ); ?></div>
		<?php endif; ?>
		<form id="rfo-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" <?php echo $created ? 'hidden' : ''; ?>>
			<input type="hidden" name="action" value="rfaheya_create_order">
			<input type="hidden" name="payload" id="rfo-payload">
			<?php wp_nonce_field( 'rfaheya_new_order' ); ?>
			<div class="rfo-grid">
				<div class="rfo-main">
					<section class="rfo-card">
						<div class="rfo-card-head"><h2>Products</h2><span class="rfo-count" id="rfo-count"></span></div>
						<div class="rfo-search">
							<input type="search" id="rfo-psearch" placeholder="Search a product by name or SKU…" autocomplete="off">
							<div class="rfo-results" id="rfo-presults" hidden></div>
						</div>
						<div id="rfo-lines" class="rfo-lines"></div>
						<p class="rfo-empty" id="rfo-empty">No products yet — search above to add one.</p>
					</section>

					<section class="rfo-card">
						<div class="rfo-card-head">
							<h2>Customer</h2>
							<div class="rfo-tabs" role="tablist">
								<button type="button" class="is-on" data-mode="new">New customer</button>
								<button type="button" data-mode="find">Find a customer</button>
							</div>
						</div>
						<div class="rfo-search" id="rfo-find" hidden>
							<input type="search" id="rfo-csearch" placeholder="Name, phone or email…" autocomplete="off">
							<div class="rfo-results" id="rfo-cresults" hidden></div>
						</div>
						<div class="rfo-picked" id="rfo-picked" hidden></div>
						<div class="rfo-fields">
							<label>First name<input data-c="first" required></label>
							<label>Last name<input data-c="last"></label>
							<label>Phone<input data-c="phone" type="tel" required placeholder="01xxxxxxxxx"></label>
							<label>Email<input data-c="email" type="email" placeholder="optional"></label>
							<label>Governorate
								<select data-c="state">
									<option value="">Choose…</option>
									<?php foreach ( $states as $code => $name ) : ?>
										<option value="<?php echo esc_attr( $code ); ?>"><?php echo esc_html( $name ); ?></option>
									<?php endforeach; ?>
								</select>
							</label>
							<label>City / area<input data-c="city"></label>
							<label class="rfo-wide">Address<input data-c="address" placeholder="Street, building, floor, apartment"></label>
							<label class="rfo-wide">Landmark (optional)<input data-c="address2"></label>
						</div>
						<label class="rfo-switch" id="rfo-account-wrap">
							<input type="checkbox" id="rfo-account">
							<span class="rfo-track"></span>
							<span><strong>Create an account for this customer</strong><small id="rfo-account-help">The order shows in their account; they can sign in with “Forgot password” whenever they like. Needs an email.</small></span>
						</label>
					</section>

					<section class="rfo-card">
						<div class="rfo-card-head"><h2>Notes</h2></div>
						<div class="rfo-fields">
							<label class="rfo-wide">Note from the customer (on the order and the invoice)<textarea id="rfo-note" rows="2" dir="auto"></textarea></label>
							<label class="rfo-wide">Private note (only in the dashboard)<textarea id="rfo-private" rows="2" dir="auto"></textarea></label>
						</div>
					</section>
				</div>

				<aside class="rfo-side">
					<section class="rfo-card rfo-summary">
						<h2>Summary</h2>
						<label>Status
							<select id="rfo-status">
								<option value="processing">Processing</option>
								<option value="pending">Pending payment</option>
								<option value="on-hold">On hold</option>
								<option value="completed">Completed</option>
							</select>
						</label>
						<label>Payment
							<select id="rfo-payment">
								<?php foreach ( $gateways as $id => $title ) : ?>
									<option value="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $title ); ?></option>
								<?php endforeach; ?>
							</select>
						</label>
						<label>Shipping
							<span class="rfo-inline">
								<select id="rfo-shipmethod"><option value="">Choose the governorate first</option></select>
								<input id="rfo-ship" type="number" min="0" step="1" value="0" aria-label="Shipping cost">
							</span>
						</label>
						<label>Discount
							<span class="rfo-inline">
								<input id="rfo-discount" type="number" min="0" step="1" value="0" aria-label="Discount">
								<select id="rfo-dtype"><option value="amount">EGP</option><option value="percent">%</option></select>
							</span>
						</label>
						<dl class="rfo-totals">
							<div><dt>Products</dt><dd id="rfo-t-items">0</dd></div>
							<div><dt>Shipping</dt><dd id="rfo-t-ship">0</dd></div>
							<div><dt>Discount</dt><dd id="rfo-t-disc">0</dd></div>
							<div class="rfo-total"><dt>Total</dt><dd id="rfo-t-total">0</dd></div>
						</dl>
						<button type="submit" class="rfo-btn rfo-submit" id="rfo-submit" disabled>Create order</button>
						<p class="rfo-hint" id="rfo-hint">Add a product and the customer’s name and phone.</p>
					</section>
				</aside>
			</div>
		</form>
	</div>
	<style>
		.rfo{--g:#e49b2d;--ink:#1d1a16;--muted:#6b645b;--line:#e8e2d8;--bg:#faf7f2;max-width:1240px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--ink)}
		.rfo *{box-sizing:border-box}
		.rfo [hidden]{display:none!important}
		.rfo-head{display:flex;align-items:flex-end;justify-content:space-between;margin:18px 0 18px}
		.rfo-head h1{font-size:30px;font-weight:700;margin:2px 0 0;padding:0;letter-spacing:-.01em}
		.rfo-eyebrow{margin:0;font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--g)}
		.rfo-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px;align-items:start}
		@media(max-width:1100px){.rfo-grid{grid-template-columns:1fr}}
		.rfo-main{display:grid;gap:18px}
		.rfo-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px 22px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
		.rfo-card h2{font-size:16px;font-weight:700;margin:0}
		.rfo-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
		.rfo-count{font-size:12px;color:var(--muted)}
		.rfo-search{position:relative}
		.rfo input,.rfo select,.rfo textarea{width:100%;border:1px solid var(--line);border-radius:12px;padding:9px 12px;font-size:14px;background:#fff;box-shadow:none;min-height:40px;max-width:none}
		.rfo input:focus,.rfo select:focus,.rfo textarea:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(228,155,45,.18);outline:none}
		.rfo-search input{padding-left:38px;background:#fff url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%236b645b" stroke-width="2"><circle cx="7" cy="7" r="5"/><path d="m11 11 4 4"/></svg>') 13px 50% no-repeat}
		.rfo-results{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:20;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 18px 40px -12px rgba(0,0,0,.25);max-height:340px;overflow:auto;padding:6px}
		.rfo-result{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;background:none;border-radius:10px;padding:7px 9px;cursor:pointer;font-size:14px}
		.rfo-result:hover,.rfo-result.is-active{background:var(--bg)}
		.rfo-result img,.rfo-thumb{width:38px;height:38px;border-radius:9px;object-fit:cover;background:var(--bg);flex:none}
		.rfo-result small{display:block;color:var(--muted);font-size:12px}
		.rfo-lines{display:grid;gap:8px;margin-top:12px}
		.rfo-line{display:grid;grid-template-columns:44px minmax(0,1fr) 150px 110px 100px 90px 28px;gap:10px;align-items:center;padding:8px;border:1px solid var(--line);border-radius:14px;animation:rfoIn .25s ease}
		@media(max-width:800px){.rfo-line{grid-template-columns:44px 1fr 1fr;}}
		@keyframes rfoIn{from{opacity:0;transform:translateY(4px)}}
		.rfo-line-name{font-weight:600;font-size:14px;line-height:1.25}
		.rfo-line-name small{display:block;font-weight:400;color:var(--muted);font-size:12px}
		.rfo-qty{display:flex;align-items:center;border:1px solid var(--line);border-radius:12px;overflow:hidden;height:40px}
		.rfo-qty button{width:32px;height:100%;border:0;background:var(--bg);cursor:pointer;font-size:16px}
		.rfo-qty input{border:0!important;text-align:center;border-radius:0;padding:0;min-height:0;height:100%;box-shadow:none!important}
		.rfo-line-total{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
		.rfo-remove{border:0;background:none;color:#b32d2e;cursor:pointer;font-size:18px;line-height:1}
		.rfo-empty{margin:14px 0 2px;color:var(--muted);font-size:13px;text-align:center}
		.rfo-tabs{display:inline-flex;background:var(--bg);border-radius:999px;padding:3px}
		.rfo-tabs button{border:0;background:none;border-radius:999px;padding:6px 14px;font-size:13px;cursor:pointer;color:var(--muted)}
		.rfo-tabs button.is-on{background:#fff;color:var(--ink);font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.08)}
		.rfo-picked{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--bg);border-radius:12px;padding:10px 14px;margin:12px 0;font-size:13.5px}
		.rfo-picked button{border:0;background:none;color:#b32d2e;cursor:pointer}
		.rfo-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;margin-top:12px}
		.rfo-fields label,.rfo-summary label{display:grid;gap:5px;font-size:12.5px;font-weight:600;color:var(--muted)}
		.rfo-wide{grid-column:1/-1}
		.rfo-switch{display:flex;gap:12px;align-items:flex-start;margin-top:16px;padding:12px 14px;border:1px dashed var(--line);border-radius:14px;cursor:pointer}
		.rfo-switch input{position:absolute;opacity:0;width:1px;height:1px;min-height:0}
		.rfo-track{flex:none;width:40px;height:22px;border-radius:999px;background:#d6d0c6;position:relative;transition:background .2s;margin-top:1px}
		.rfo-track::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 2px rgba(0,0,0,.2)}
		.rfo-switch input:checked+.rfo-track{background:var(--g)}
		.rfo-switch input:checked+.rfo-track::after{transform:translateX(18px)}
		.rfo-switch input:disabled+.rfo-track{opacity:.45}
		.rfo-switch small{display:block;color:var(--muted);font-weight:400;margin-top:2px;font-size:12px}
		.rfo-side{position:sticky;top:46px}
		.rfo-summary{display:grid;gap:12px;background:#14110d;color:#f6ecdd;border-color:#14110d}
		.rfo-summary h2{color:#fff}
		.rfo-summary label{color:#b9ae9c}
		.rfo-summary input,.rfo-summary select{background:#211b14;border-color:#3a3026;color:#fff}
		.rfo-inline{display:grid;grid-template-columns:1fr 96px;gap:8px}
		.rfo-totals{margin:4px 0 0;border-top:1px solid #3a3026;padding-top:10px;display:grid;gap:6px}
		.rfo-totals div{display:flex;justify-content:space-between;font-size:13.5px;color:#cfc4b2}
		.rfo-totals dt,.rfo-totals dd{margin:0}
		.rfo-totals dd{font-variant-numeric:tabular-nums}
		.rfo-total{font-size:18px!important;color:#fff!important;font-weight:700;border-top:1px solid #3a3026;padding-top:8px;margin-top:2px}
		.rfo-btn{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 22px;border-radius:999px;border:0;background:linear-gradient(180deg,#efab45,#e49b2d);color:#1a1206;font-weight:700;font-size:14px;cursor:pointer;text-decoration:none;box-shadow:0 10px 24px -10px rgba(228,155,45,.7)}
		.rfo-btn:hover{color:#1a1206;filter:brightness(1.05)}
		.rfo-btn:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
		.rfo-submit{width:100%}
		.rfo-ghost{display:inline-flex;align-items:center;height:40px;padding:0 16px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink);text-decoration:none;font-weight:600;font-size:13px}
		.rfo-hint{margin:0;font-size:12px;color:#b9ae9c;text-align:center}
		.rfo-done{display:flex;align-items:center;gap:16px;background:#fff;border:1px solid #cfe3b8;border-radius:18px;padding:18px 22px;margin-bottom:18px;box-shadow:0 10px 30px -18px rgba(85,102,42,.5)}
		.rfo-done-icon{width:44px;height:44px;border-radius:50%;background:#6f8a3a;color:#fff;display:grid;place-items:center;font-size:22px;flex:none}
		.rfo-done h2{margin:0;font-size:18px}.rfo-done p{margin:2px 0 0;color:var(--muted)}
		.rfo-done-actions{margin-left:auto;display:flex;gap:8px}
		.rfo-error{background:#fcf0f1;border:1px solid #f0c3c5;color:#8a1f22;border-radius:14px;padding:12px 16px;margin-bottom:16px}
	</style>
	<script>
	(function () {
		var D = <?php echo wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE ); ?>;
		var $ = function (s, r) { return (r || document).querySelector(s); };
		var lines = [], customer = { user: 0 }, mode = 'new';
		var money = function (n) { return (Math.round(n * 100) / 100).toLocaleString('en-US') + ' ' + D.currency; };
		var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

		// ---- products
		var ps = $('#rfo-psearch'), pr = $('#rfo-presults');
		function productResults() {
			var q = ps.value.trim().toLowerCase();
			if (!q) { pr.hidden = true; return; }
			var found = D.products.filter(function (p) { return p.name.toLowerCase().indexOf(q) > -1 || (p.sku || '').toLowerCase().indexOf(q) > -1; }).slice(0, 12);
			pr.innerHTML = found.length ? found.map(function (p, i) {
				var from = Math.min.apply(null, p.sizes.map(function (s) { return s.price; }));
				return '<button type="button" class="rfo-result' + (i === 0 ? ' is-active' : '') + '" data-id="' + p.id + '">' + (p.thumb ? '<img src="' + esc(p.thumb) + '" alt="">' : '<span class="rfo-thumb"></span>') + '<span><strong>' + esc(p.name) + '</strong><small>' + p.sizes.length + (p.sizes.length === 1 ? ' size' : ' sizes') + ' · from ' + money(from) + '</small></span></button>';
			}).join('') : '<p class="rfo-empty">No product matches.</p>';
			pr.hidden = false;
		}
		ps.addEventListener('input', productResults);
		ps.addEventListener('keydown', function (e) {
			if (e.key === 'Enter') { e.preventDefault(); var a = pr.querySelector('.is-active'); if (a) a.click(); }
			if (e.key === 'Escape') { pr.hidden = true; }
		});
		pr.addEventListener('click', function (e) {
			var b = e.target.closest('.rfo-result'); if (!b) return;
			var p = D.products.find(function (x) { return x.id === +b.dataset.id; });
			var s = p.sizes.find(function (x) { return x.in; }) || p.sizes[0];
			var same = lines.find(function (l) { return l.size === s.id; });
			if (same) same.qty++; else lines.push({ product: p, size: s.id, qty: 1, price: s.price });
			ps.value = ''; pr.hidden = true; ps.focus(); draw();
		});
		document.addEventListener('click', function (e) { if (!e.target.closest('.rfo-search')) { pr.hidden = true; $('#rfo-cresults').hidden = true; } });

		function draw() {
			$('#rfo-lines').innerHTML = lines.map(function (l, i) {
				var p = l.product, s = p.sizes.find(function (x) { return x.id === l.size; });
				var opts = p.sizes.length > 1 ? '<select data-i="' + i + '" data-k="size">' + p.sizes.map(function (x) {
					return '<option value="' + x.id + '"' + (x.id === l.size ? ' selected' : '') + (x.in ? '' : ' disabled') + '>' + esc(x.label || 'One size') + ' · ' + money(x.price) + (x.in ? '' : ' (out of stock)') + '</option>';
				}).join('') + '</select>' : '<span class="rfo-count">' + esc(s.label || 'One size') + '</span>';
				return '<div class="rfo-line">' + (p.thumb ? '<img class="rfo-thumb" src="' + esc(p.thumb) + '" alt="">' : '<span class="rfo-thumb"></span>') +
					'<div class="rfo-line-name">' + esc(p.name) + (s.stock !== null ? '<small>' + s.stock + ' in stock</small>' : '') + '</div>' + opts +
					'<div class="rfo-qty"><button type="button" data-i="' + i + '" data-k="minus">−</button><input data-i="' + i + '" data-k="qty" type="number" min="1" value="' + l.qty + '"><button type="button" data-i="' + i + '" data-k="plus">+</button></div>' +
					'<input data-i="' + i + '" data-k="price" type="number" min="0" step="1" value="' + l.price + '" aria-label="Price each">' +
					'<div class="rfo-line-total">' + money(l.qty * l.price) + '</div>' +
					'<button type="button" class="rfo-remove" data-i="' + i + '" data-k="remove" aria-label="Remove">×</button></div>';
			}).join('');
			$('#rfo-empty').hidden = lines.length > 0;
			var n = lines.reduce(function (a, l) { return a + l.qty; }, 0);
			$('#rfo-count').textContent = n ? n + (n === 1 ? ' item' : ' items') : '';
			totals();
		}
		$('#rfo-lines').addEventListener('click', function (e) {
			var b = e.target.closest('button[data-k]'); if (!b) return;
			var l = lines[+b.dataset.i];
			if (b.dataset.k === 'plus') l.qty++;
			if (b.dataset.k === 'minus') l.qty = Math.max(1, l.qty - 1);
			if (b.dataset.k === 'remove') lines.splice(+b.dataset.i, 1);
			draw();
		});
		$('#rfo-lines').addEventListener('change', function (e) {
			var t = e.target, l = lines[+t.dataset.i]; if (!l) return;
			if (t.dataset.k === 'size') { l.size = +t.value; l.price = l.product.sizes.find(function (x) { return x.id === l.size; }).price; }
			if (t.dataset.k === 'qty') l.qty = Math.max(1, parseInt(t.value, 10) || 1);
			if (t.dataset.k === 'price') l.price = Math.max(0, parseFloat(t.value) || 0);
			draw();
		});

		// ---- customer
		var fields = document.querySelectorAll('[data-c]');
		function fill(c) { fields.forEach(function (f) { f.value = c[f.dataset.c] || ''; }); }
		function read() { var c = { user: customer.user || 0 }; fields.forEach(function (f) { c[f.dataset.c] = f.value.trim(); }); return c; }
		document.querySelectorAll('.rfo-tabs button').forEach(function (b) {
			b.addEventListener('click', function () {
				mode = b.dataset.mode;
				document.querySelectorAll('.rfo-tabs button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
				$('#rfo-find').hidden = mode !== 'find';
				if (mode === 'find') $('#rfo-csearch').focus();
				if (mode === 'new') { customer = { user: 0 }; $('#rfo-picked').hidden = true; fill({}); }
				accountState(); totals();
			});
		});
		var cs = $('#rfo-csearch'), cr = $('#rfo-cresults'), timer, found = [];
		cs.addEventListener('input', function () {
			clearTimeout(timer);
			var q = cs.value.trim();
			if (q.length < 2) { cr.hidden = true; return; }
			timer = setTimeout(function () {
				fetch(D.ajax + '?action=rfaheya_order_customers&_wpnonce=' + D.nonce + '&q=' + encodeURIComponent(q), { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (list) {
					found = list || [];
					cr.innerHTML = found.length ? found.map(function (c, i) {
						return '<button type="button" class="rfo-result" data-i="' + i + '"><span class="rfo-thumb" style="display:grid;place-items:center;font-weight:700">' + esc((c.first || c.email || '?').charAt(0).toUpperCase()) + '</span><span><strong>' + esc((c.first + ' ' + c.last).trim() || c.email) + '</strong><small>' + esc([c.phone, c.email, c.kind].filter(Boolean).join(' · ')) + '</small></span></button>';
					}).join('') : '<p class="rfo-empty">No customer found — use “New customer”.</p>';
					cr.hidden = false;
				});
			}, 250);
		});
		cr.addEventListener('click', function (e) {
			var b = e.target.closest('.rfo-result'); if (!b) return;
			var c = found[+b.dataset.i];
			customer = c; fill(c); cr.hidden = true; cs.value = '';
			$('#rfo-picked').hidden = false;
			$('#rfo-picked').innerHTML = '<span><strong>' + esc((c.first + ' ' + c.last).trim()) + '</strong> · ' + esc(c.kind) + '</span><button type="button" id="rfo-unpick">Change</button>';
			$('#rfo-unpick').onclick = function () { customer = { user: 0 }; fill({}); $('#rfo-picked').hidden = true; cs.focus(); accountState(); totals(); };
			accountState(); quote(); totals();
		});
		function accountState() {
			var acc = $('#rfo-account'), email = $('[data-c="email"]').value.trim();
			var wrap = $('#rfo-account-wrap');
			wrap.hidden = !!customer.user;
			acc.disabled = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
			if (acc.disabled) acc.checked = false;
			$('#rfo-account-help').textContent = acc.disabled ? 'Type the customer’s email to make an account (it isn’t sent anything).' : 'The order shows in their account; no email is sent. They sign in later with “Forgot password”.';
		}
		fields.forEach(function (f) { f.addEventListener('input', function () { accountState(); totals(); }); });

		// ---- shipping
		var ms = $('#rfo-shipmethod'), mcost = $('#rfo-ship'), quotes = [];
		function itemsTotal() { return lines.reduce(function (a, l) { return a + l.qty * l.price; }, 0); }
		function quote() {
			var st = $('[data-c="state"]').value;
			if (!st) { ms.innerHTML = '<option value="">Choose the governorate first</option>'; return; }
			fetch(D.ajax + '?action=rfaheya_order_shipping&_wpnonce=' + D.nonce + '&state=' + encodeURIComponent(st) + '&total=' + itemsTotal(), { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (list) {
				quotes = list || [];
				ms.innerHTML = quotes.map(function (q, i) { return '<option value="' + i + '">' + esc(q.title) + ' · ' + money(q.cost) + '</option>'; }).join('') + '<option value="custom">Other amount</option><option value="none">No shipping</option>';
				if (quotes[0]) mcost.value = quotes[0].cost;
				totals();
			});
		}
		$('[data-c="state"]').addEventListener('change', quote);
		ms.addEventListener('change', function () {
			if (ms.value === 'none') mcost.value = 0;
			else if (quotes[+ms.value]) mcost.value = quotes[+ms.value].cost;
			totals();
		});
		['#rfo-ship', '#rfo-discount', '#rfo-dtype'].forEach(function (s) { $(s).addEventListener('input', totals); $(s).addEventListener('change', totals); });

		function totals() {
			var items = itemsTotal(), ship = Math.max(0, parseFloat(mcost.value) || 0), d = Math.max(0, parseFloat($('#rfo-discount').value) || 0);
			var off = $('#rfo-dtype').value === 'percent' ? Math.round(items * Math.min(100, d)) / 100 : Math.min(items, d);
			$('#rfo-t-items').textContent = money(items);
			$('#rfo-t-ship').textContent = money(ship);
			$('#rfo-t-disc').textContent = off ? '−' + money(off) : money(0);
			$('#rfo-t-total').textContent = money(Math.max(0, items - off) + ship);
			var c = read(), ok = lines.length && (c.first || c.last) && c.phone;
			$('#rfo-submit').disabled = !ok;
			$('#rfo-hint').textContent = ok ? (($('#rfo-account').checked && !customer.user) ? 'An account is made for ' + c.email + ' (nothing is sent).' : 'Stock is taken off when the order is Processing, On hold or Completed.') : 'Add a product and the customer’s name and phone.';
		}

		$('#rfo-form').addEventListener('submit', function (e) {
			var c = read();
			var q = ms.value === 'none' ? null : quotes[+ms.value];
			$('#rfo-payload').value = JSON.stringify({
				items: lines.map(function (l) { return { id: l.size, qty: l.qty, price: l.price }; }),
				customer: c,
				account: $('#rfo-account').checked && !customer.user,
				shipping: ms.value === 'none' ? { cost: 0, title: '' } : { cost: parseFloat(mcost.value) || 0, title: q ? q.title : 'Shipping', method: q ? q.method : 'flat_rate' },
				discount: { value: parseFloat($('#rfo-discount').value) || 0, type: $('#rfo-dtype').value },
				payment: $('#rfo-payment').value,
				status: $('#rfo-status').value,
				note: $('#rfo-note').value,
				private: $('#rfo-private').value
			});
			$('#rfo-submit').disabled = true;
			$('#rfo-submit').textContent = 'Creating…';
		});
		$('#rfo-account').addEventListener('change', totals);
		draw(); accountState();
	})();
	</script>
	<?php
}

/* -------------------------------------------------------------------------
 * Menus (Appearance → Menus ✦): the header and footer links, chosen in the dashboard.
 * Until they are saved once, the storefront keeps its own built-in menus (the same as the defaults below).
 * ------------------------------------------------------------------------- */

define( 'RFAHEYA_MENUS', 'rfaheya_menus' );

/** The built-in menus (kept the same as the storefront's own). */
function rfaheya_menus_default() {
	$o = rfaheya_options()['campaigns'];
	return array(
		'header' => array(
			array( 'label' => 'Shop', 'to' => '/shop', 'on' => true ),
			array( 'label' => 'Best Sellers', 'to' => '/shop?sort=best-sellers', 'on' => true, 'wide' => true ),
			array( 'label' => $o['vanilla_label'] ? $o['vanilla_label'] : 'Vanilla Redefined', 'to' => '/vanilla-redefined', 'on' => true ),
			array( 'label' => $o['oudrose_label'] ? $o['oudrose_label'] : 'Oud & Rose Redefined', 'to' => '/oud-rose-redefined', 'on' => true ),
			array( 'label' => 'Rfaheya Finder', 'to' => '/finder/quiz', 'on' => true ),
			array( 'label' => 'Collections', 'to' => '/collections', 'on' => true, 'wide' => true ),
			array( 'label' => 'The Vitrine', 'to' => '/vitrine', 'on' => true ),
		),
		'footer' => array(
			array(
				'title' => 'Shop',
				'on'    => true,
				'links' => array(
					array( 'label' => 'All Fragrances', 'to' => '/shop', 'on' => true ),
					array( 'label' => 'New Arrivals', 'to' => '/shop?sort=newest', 'on' => true ),
					array( 'label' => 'Best Sellers', 'to' => '/shop?sort=best-sellers', 'on' => true ),
					array( 'label' => 'Perfume Lab (Inspired)', 'to' => '/collections/perfume-lab', 'on' => true ),
					array( 'label' => 'Ledger (Men)', 'to' => '/collections/ledger', 'on' => true ),
					array( 'label' => 'Serenity (Women)', 'to' => '/collections/serenity', 'on' => true ),
					array( 'label' => 'Discovery Sets', 'to' => '/collections/discovery-sets', 'on' => true ),
					array( 'label' => 'Gift Boxes', 'to' => '/collections/gift-boxes', 'on' => true ),
				),
			),
			array(
				'title' => 'About',
				'on'    => true,
				'links' => array(
					array( 'label' => 'Our Story', 'to' => '/about', 'on' => true ),
					array( 'label' => 'Rfaheya Standard™', 'to' => '/our-standard', 'on' => true ),
					array( 'label' => 'Blog', 'to' => '/journal', 'on' => true ),
					array( 'label' => 'Contact Us', 'to' => '/contact', 'on' => true ),
				),
			),
			array(
				'title' => 'Help',
				'on'    => true,
				'links' => array(
					array( 'label' => 'FAQs', 'to' => '/faqs', 'on' => true ),
					array( 'label' => 'Returns & Refunds', 'to' => '/returns', 'on' => true ),
					array( 'label' => 'Track Your Order', 'to' => '/track-order', 'on' => true ),
					array( 'label' => 'Privacy Policy', 'to' => '/privacy', 'on' => true ),
				),
			),
		),
	);
}

/** A link as typed: a path on the store (/shop), or a full web address (https://…). */
function rfaheya_menu_link( $to ) {
	$to = trim( (string) $to );
	if ( '' === $to ) {
		return '';
	}
	if ( preg_match( '#^(https?:)?//#i', $to ) || preg_match( '#^(mailto|tel):#i', $to ) ) {
		$url = esc_url_raw( $to, array( 'http', 'https', 'mailto', 'tel' ) );
		// A link to this same site is kept as a path, so it opens inside the store.
		$home = wp_parse_url( home_url() );
		$p    = wp_parse_url( $url );
		if ( $url && ! empty( $p['host'] ) && ! empty( $home['host'] ) && strtolower( $p['host'] ) === strtolower( $home['host'] ) ) {
			$url = ( $p['path'] ?? '/' ) . ( isset( $p['query'] ) ? '?' . $p['query'] : '' );
		}
		return $url;
	}
	$to = '/' . ltrim( $to, '/' );
	return preg_replace( '/[^A-Za-z0-9\/\-_.~?&=%#+]/', '', $to );
}

/** Cleans menus sent from the page. */
function rfaheya_menus_clean( $m ) {
	$item = function ( $l ) {
		$label = sanitize_text_field( $l['label'] ?? '' );
		$to    = rfaheya_menu_link( $l['to'] ?? '' );
		if ( '' === $label || '' === $to ) {
			return null;
		}
		return array(
			'label' => $label,
			'to'    => $to,
			'on'    => ! empty( $l['on'] ),
			'wide'  => ! empty( $l['wide'] ),
		);
	};
	$out = array( 'header' => array(), 'footer' => array() );
	foreach ( array_slice( (array) ( $m['header'] ?? array() ), 0, 20 ) as $l ) {
		$i = is_array( $l ) ? $item( $l ) : null;
		if ( $i ) {
			$out['header'][] = $i;
		}
	}
	foreach ( array_slice( (array) ( $m['footer'] ?? array() ), 0, 6 ) as $c ) {
		if ( ! is_array( $c ) ) {
			continue;
		}
		$col = array(
			'title' => sanitize_text_field( $c['title'] ?? '' ),
			'on'    => ! empty( $c['on'] ),
			'links' => array(),
		);
		foreach ( array_slice( (array) ( $c['links'] ?? array() ), 0, 30 ) as $l ) {
			$i = is_array( $l ) ? $item( $l ) : null;
			if ( $i ) {
				$col['links'][] = $i;
			}
		}
		if ( '' !== $col['title'] || $col['links'] ) {
			$out['footer'][] = $col;
		}
	}
	return $out;
}

/** The menus as saved, or null for the storefront's own (never saved, or reset). */
function rfaheya_menus_saved() {
	$m = get_option( RFAHEYA_MENUS, null );
	return is_array( $m ) && isset( $m['header'], $m['footer'] ) ? $m : null;
}

/** For the storefront: only the links that are switched on. */
function rfaheya_menus_data() {
	$m = rfaheya_menus_saved();
	if ( ! $m ) {
		return null;
	}
	$on = fn( $l ) => ! empty( $l['on'] );
	$strip = fn( $l ) => array( 'label' => $l['label'], 'to' => $l['to'], 'wide' => ! empty( $l['wide'] ) );
	$footer = array();
	foreach ( $m['footer'] as $c ) {
		if ( empty( $c['on'] ) ) {
			continue;
		}
		$links = array_values( array_map( $strip, array_filter( $c['links'], $on ) ) );
		if ( $links ) {
			$footer[] = array( 'title' => $c['title'], 'links' => $links );
		}
	}
	return array(
		'header' => array_values( array_map( $strip, array_filter( $m['header'], $on ) ) ),
		'footer' => $footer,
	);
}

function rfaheya_menus_url( $args = array() ) {
	return add_query_arg( array_merge( array( 'page' => 'rfaheya-menus' ), $args ), admin_url( 'themes.php' ) );
}

add_action(
	'admin_menu',
	function () {
		add_theme_page( 'Header & footer menus', 'Menus ✦', 'edit_theme_options', 'rfaheya-menus', 'rfaheya_menus_page' );
	}
);

add_action(
	'admin_post_rfaheya_save_menus',
	function () {
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			wp_die( 'Sorry, you are not allowed to change the menus.' );
		}
		check_admin_referer( 'rfaheya_save_menus' );
		if ( ! empty( $_POST['reset'] ) ) {
			delete_option( RFAHEYA_MENUS );
		} else {
			$raw = isset( $_POST['menus'] ) ? json_decode( wp_unslash( $_POST['menus'] ), true ) : null; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned in rfaheya_menus_clean
			if ( is_array( $raw ) ) {
				update_option( RFAHEYA_MENUS, rfaheya_menus_clean( $raw ), true );
			}
		}
		delete_transient( 'rfaheya_bootstrap' );
		rfaheya_purge_page_cache();
		wp_safe_redirect( rfaheya_menus_url( array( 'saved' => empty( $_POST['reset'] ) ? 1 : 2 ) ) );
		exit;
	}
);

/** Pages of the store to pick from when adding a link. */
function rfaheya_menu_suggestions() {
	$o   = rfaheya_options()['campaigns'];
	$out = array(
		'/shop'                        => 'Shop — all fragrances',
		'/shop?sort=best-sellers'      => 'Best sellers',
		'/shop?sort=newest'            => 'New arrivals',
		'/finder/quiz'                 => 'Rfaheya Finder (starts the quiz)',
		'/collections'                 => 'Collections',
		'/collections/perfume-lab'     => 'Perfume Lab (Inspired)',
		'/collections/ledger'          => 'Ledger (Men)',
		'/collections/serenity'        => 'Serenity (Women)',
		'/collections/discovery-sets'  => 'Discovery sets',
		'/collections/gift-boxes'      => 'Gift boxes',
		'/vitrine'                     => 'The Vitrine',
		'/vanilla-redefined'           => 'Campaign: ' . ( $o['vanilla_label'] ? $o['vanilla_label'] : 'Vanilla Redefined' ),
		'/oud-rose-redefined'          => 'Campaign: ' . ( $o['oudrose_label'] ? $o['oudrose_label'] : 'Oud & Rose Redefined' ),
		'/about'                       => 'Our story',
		'/our-standard'                => 'Rfaheya Standard™',
		'/journal'                     => 'Blog',
		'/contact'                     => 'Contact us',
		'/faqs'                        => 'FAQs',
		'/returns'                     => 'Returns & refunds',
		'/track-order'                 => 'Track your order',
		'/privacy'                     => 'Privacy policy',
		'/wishlist'                    => 'Wishlist',
		'/account'                     => 'My account',
	);
	foreach ( array( 'men' => 'Men', 'women' => 'Women', 'unisex' => 'Unisex' ) as $k => $v ) {
		$out[ '/shop?gender=' . $k ] = 'Shop: ' . $v;
	}
	foreach ( array( 'fresh', 'oriental', 'floral', 'fruity', 'sweet' ) as $k ) {
		$out[ '/shop?family=' . $k ] = 'Shop: ' . ucfirst( $k ) . ' family';
	}
	return $out;
}

function rfaheya_menus_page() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	$saved = rfaheya_menus_saved();
	$menus = $saved ? $saved : rfaheya_menus_default();
	$done  = isset( $_GET['saved'] ) ? (int) $_GET['saved'] : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a notice only
	?>
	<div class="wrap rfm">
		<header class="rfm-hero">
			<div>
				<p class="rfm-eyebrow">Rfaheya · Appearance</p>
				<h1>Header &amp; footer menus</h1>
				<p>Rename, reorder (drag ⠿ or the arrows), hide or delete any link, and add your own — a page of the store or any web address. Save, and the store shows it at once.</p>
			</div>
		</header>
		<?php if ( $done ) : ?>
			<div class="rfm-note"><?php echo 1 === $done ? 'Menus saved — they’re live on the store.' : 'Back to the original menus.'; ?></div>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" id="rfm-form">
			<input type="hidden" name="action" value="rfaheya_save_menus">
			<input type="hidden" name="menus" id="rfm-data">
			<?php wp_nonce_field( 'rfaheya_save_menus' ); ?>
			<div class="rfm-grid">
				<section class="rfm-card">
					<div class="rfm-card-head">
						<h2>Header</h2>
						<p>The links across the top (and in the phone menu).</p>
					</div>
					<div class="rfm-list" data-list="header"></div>
					<button type="button" class="rfm-add" data-add="header">+ Add a link</button>
				</section>
				<section class="rfm-card">
					<div class="rfm-card-head">
						<h2>Footer</h2>
						<p>Columns of links at the bottom of every page.</p>
					</div>
					<div id="rfm-cols"></div>
					<button type="button" class="rfm-add" id="rfm-add-col">+ Add a column</button>
				</section>
			</div>
			<div class="rfm-bar">
				<button type="submit" name="reset" value="1" class="rfm-reset" onclick="return confirm('Go back to the original menus? Your changes here are lost.')">Reset to the original</button>
				<span class="rfm-dirty">Unsaved changes</span>
				<button type="submit" class="rfm-save">Save menus</button>
			</div>
		</form>
		<datalist id="rfm-pages">
			<?php foreach ( rfaheya_menu_suggestions() as $to => $label ) : ?>
				<option value="<?php echo esc_attr( $to ); ?>"><?php echo esc_html( $label ); ?></option>
			<?php endforeach; ?>
		</datalist>
	</div>
	<style>
		.rfm{max-width:1280px;margin:20px 20px 0 0;font-size:14px;color:#1d1a16}
		.rfm-hero{border-radius:26px;padding:30px 34px;background:radial-gradient(120% 140% at 0% 0%,#5a3d17 0%,#2a1d0d 45%,#16110b 100%);color:#f4ead8}
		.rfm-eyebrow{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#e6a43a}
		.rfm-hero h1{margin:0;font-size:32px;line-height:1.15;color:#fff;font-weight:600}
		.rfm-hero p{max-width:640px;margin:10px 0 0;color:#d9cbb4;font-size:14.5px;line-height:1.55}
		.rfm-note{margin:16px 0 0;padding:12px 18px;border-radius:14px;background:#eaf3e2;color:#2f5a1f;font-weight:600}
		.rfm-grid{display:grid;grid-template-columns:1fr 1.25fr;gap:18px;margin-top:18px;align-items:start}
		@media (max-width:1100px){.rfm-grid{grid-template-columns:1fr}}
		.rfm-card{background:#fff;border:1px solid #eadfcd;border-radius:22px;padding:20px}
		.rfm-card-head h2{margin:0;font-size:19px}
		.rfm-card-head p{margin:4px 0 14px;color:#7a6f61}
		.rfm-row{display:grid;grid-template-columns:22px minmax(0,1fr) minmax(0,1.1fr) auto;gap:8px;align-items:center;padding:7px 8px;border:1px solid #efe6d8;border-radius:14px;background:#fffdf9;margin-bottom:6px;transition:opacity .2s,box-shadow .2s}
		.rfm-row.is-off{opacity:.5}
		.rfm-row.is-drag{box-shadow:0 10px 30px rgba(0,0,0,.12);opacity:.8}
		.rfm-handle{cursor:grab;color:#b3a48c;font-size:18px;text-align:center;user-select:none}
		.rfm-row input[type=text]{width:100%;min-height:36px;border:1px solid #e3d8c6;border-radius:10px;padding:0 10px;background:#fff}
		.rfm-row input[type=text]:focus{border-color:#e39a2b;box-shadow:0 0 0 2px rgba(227,154,43,.18);outline:0}
		.rfm-tools{display:flex;gap:4px;align-items:center}
		.rfm-tools button{width:30px;height:30px;border:0;border-radius:9px;background:#f4ede1;cursor:pointer;color:#5f5444;font-size:13px}
		.rfm-tools button:hover{background:#ecdcc0}
		.rfm-tools .rfm-del:hover{background:#f8d9d4;color:#b42318}
		.rfm-eye{position:relative;display:inline-flex;align-items:center;cursor:pointer}
		.rfm-eye input{position:absolute;opacity:0}
		.rfm-eye span{width:34px;height:20px;border-radius:20px;background:#d8cdbb;position:relative;transition:background .2s}
		.rfm-eye span:after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .2s}
		.rfm-eye input:checked+span{background:#e39a2b}
		.rfm-eye input:checked+span:after{transform:translateX(14px)}
		.rfm-add{margin-top:6px;border:1px dashed #d9c39c;background:#fffaf1;color:#9a6512;border-radius:12px;padding:9px 14px;font-weight:600;cursor:pointer;width:100%}
		.rfm-add:hover{background:#fff1da}
		.rfm-col{border:1px solid #eadfcd;border-radius:18px;padding:12px;margin-bottom:12px;background:#fbf7f0}
		.rfm-col.is-off{opacity:.55}
		.rfm-col-head{display:flex;gap:8px;align-items:center;margin-bottom:10px}
		.rfm-col-head input[type=text]{flex:1;min-height:38px;border:1px solid #e3d8c6;border-radius:10px;padding:0 12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
		.rfm-hint{font-size:12px;color:#8a7e6c;margin:2px 0 8px 30px}
		.rfm-bar{position:sticky;bottom:0;display:flex;gap:12px;align-items:center;justify-content:flex-end;margin-top:18px;padding:14px 18px;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border:1px solid #eadfcd;border-radius:18px}
		.rfm-reset{margin-right:auto;border:0;background:none;color:#8a7e6c;text-decoration:underline;cursor:pointer}
		.rfm-dirty{display:none;color:#b56a00;font-weight:600}
		.rfm-bar.is-dirty .rfm-dirty{display:inline}
		.rfm-save{border:0;border-radius:999px;background:#e39a2b;color:#1d1a16;font-weight:700;padding:12px 26px;cursor:pointer;letter-spacing:.04em}
		.rfm-save:hover{background:#d48b1d}
		.rfm-ext{font-size:11px;color:#9a6512;margin-left:2px}
	</style>
	<script>
	(function () {
		var data = <?php echo wp_json_encode( $menus ); ?>;
		var bar = document.querySelector('.rfm-bar');
		function dirty() { bar.classList.add('is-dirty'); }
		function el(tag, attrs, kids) {
			var e = document.createElement(tag);
			for (var k in attrs || {}) { if (k === 'text') e.textContent = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
			(kids || []).forEach(function (c) { if (c) e.appendChild(c); });
			return e;
		}
		function toggle(on, change) {
			var box = el('input', { type: 'checkbox', onchange: function () { change(box.checked); } });
			box.checked = !!on;
			return el('label', { class: 'rfm-eye', title: 'Show on the store' }, [box, el('span')]);
		}
		function move(list, i, d, redraw) {
			var j = i + d;
			if (j < 0 || j >= list.length) return;
			var x = list[i]; list[i] = list[j]; list[j] = x; dirty(); redraw();
		}
		function rows(holder, list, redraw) {
			holder.innerHTML = '';
			list.forEach(function (l, i) {
				var label = el('input', { type: 'text', value: l.label || '', placeholder: 'Name, e.g. Shop', 'aria-label': 'Link name', oninput: function () { l.label = label.value; dirty(); } });
				var to = el('input', { type: 'text', value: l.to || '', placeholder: 'Page (pick) or https://…', list: 'rfm-pages', 'aria-label': 'Link', oninput: function () { l.to = to.value; dirty(); } });
				var row = el('div', { class: 'rfm-row' + (l.on ? '' : ' is-off'), draggable: 'true' }, [
					el('span', { class: 'rfm-handle', title: 'Drag to reorder', text: '⠿' }),
					label,
					to,
					el('div', { class: 'rfm-tools' }, [
						toggle(l.on, function (v) { l.on = v; row.classList.toggle('is-off', !v); dirty(); }),
						el('button', { type: 'button', title: 'Move up', text: '↑', onclick: function () { move(list, i, -1, redraw); } }),
						el('button', { type: 'button', title: 'Move down', text: '↓', onclick: function () { move(list, i, 1, redraw); } }),
						el('button', { type: 'button', class: 'rfm-del', title: 'Delete', text: '✕', onclick: function () { list.splice(i, 1); dirty(); redraw(); } })
					])
				]);
				// Drag only by the handle (the text boxes stay selectable).
				row.addEventListener('dragstart', function (e) {
					if (!e.target.classList || !row.dataset.grab) { e.preventDefault(); return; }
					row.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move'; holder.dataset.from = i;
				});
				row.querySelector('.rfm-handle').addEventListener('mousedown', function () { row.dataset.grab = '1'; });
				row.addEventListener('mouseup', function () { delete row.dataset.grab; });
				row.addEventListener('dragend', function () { row.classList.remove('is-drag'); delete row.dataset.grab; });
				row.addEventListener('dragover', function (e) { e.preventDefault(); });
				row.addEventListener('drop', function (e) {
					e.preventDefault();
					var from = +holder.dataset.from;
					if (isNaN(from) || from === i) return;
					var x = list.splice(from, 1)[0]; list.splice(i, 0, x); dirty(); redraw();
				});
				holder.appendChild(row);
			});
		}
		var head = document.querySelector('[data-list="header"]');
		function drawHeader() { rows(head, data.header, drawHeader); }
		document.querySelector('[data-add="header"]').addEventListener('click', function () {
			data.header.push({ label: '', to: '', on: true }); dirty(); drawHeader();
			var r = head.querySelectorAll('.rfm-row'); r[r.length - 1].querySelector('input').focus();
		});
		var cols = document.getElementById('rfm-cols');
		function drawCols() {
			cols.innerHTML = '';
			data.footer.forEach(function (c, ci) {
				var holder = el('div');
				var title = el('input', { type: 'text', value: c.title || '', placeholder: 'Column title', 'aria-label': 'Column title', oninput: function () { c.title = title.value; dirty(); } });
				var box = el('div', { class: 'rfm-col' + (c.on ? '' : ' is-off') }, [
					el('div', { class: 'rfm-col-head' }, [
						title,
						el('div', { class: 'rfm-tools' }, [
							toggle(c.on, function (v) { c.on = v; box.classList.toggle('is-off', !v); dirty(); }),
							el('button', { type: 'button', title: 'Move column up', text: '↑', onclick: function () { move(data.footer, ci, -1, drawCols); } }),
							el('button', { type: 'button', title: 'Move column down', text: '↓', onclick: function () { move(data.footer, ci, 1, drawCols); } }),
							el('button', { type: 'button', class: 'rfm-del', title: 'Delete column', text: '✕', onclick: function () { if (confirm('Delete the column “' + (c.title || '') + '” and its links?')) { data.footer.splice(ci, 1); dirty(); drawCols(); } } })
						])
					]),
					holder,
					el('button', { type: 'button', class: 'rfm-add', text: '+ Add a link', onclick: function () {
						c.links.push({ label: '', to: '', on: true }); dirty(); drawCols();
						var r = cols.querySelectorAll('.rfm-col')[ci].querySelectorAll('.rfm-row'); r[r.length - 1].querySelector('input').focus();
					} })
				]);
				c.links = c.links || [];
				rows(holder, c.links, drawCols);
				cols.appendChild(box);
			});
		}
		document.getElementById('rfm-add-col').addEventListener('click', function () {
			data.footer.push({ title: 'New column', on: true, links: [] }); dirty(); drawCols();
		});
		drawHeader(); drawCols();
		document.getElementById('rfm-form').addEventListener('submit', function (e) {
			if (e.submitter && e.submitter.name === 'reset') return;
			var empty = [].concat(data.header, [].concat.apply([], data.footer.map(function (c) { return c.links; }))).filter(function (l) { return !(l.label || '').trim() || !(l.to || '').trim(); });
			if (empty.length && !confirm(empty.length + ' link(s) have no name or no link and will be left out. Save anyway?')) { e.preventDefault(); return; }
			document.getElementById('rfm-data').value = JSON.stringify(data);
			bar.classList.remove('is-dirty');
		});
		window.addEventListener('beforeunload', function (e) { if (bar.classList.contains('is-dirty')) { e.preventDefault(); e.returnValue = ''; } });
	})();
	</script>
	<?php
}

/* -------------------------------------------------------------------------
 * Claude connection (Tools → Claude connection ✦): an MCP server, so Claude can run the
 * store when asked — read the products, orders and offers, and (in "full control") change them.
 * Off until switched on. Reached with a secret address (or the same key as a Bearer token);
 * every call is written to the activity log on that page.
 * ------------------------------------------------------------------------- */

define( 'RFAHEYA_MCP', 'rfaheya_mcp' );

/** The connection's settings: on, mode (read / full), the key's hash, the user it acts as. */
function rfaheya_mcp_options() {
	$o = get_option( RFAHEYA_MCP, array() );
	return array_merge(
		array(
			'on'   => false,
			'mode' => 'read',
			'hash' => '',
			'hint' => '',
			'user' => 0,
			'until' => 0,
		),
		is_array( $o ) ? $o : array()
	);
}

/**
 * What Claude may do now: read, full (store data) or admin (also files and plugins). Admin lasts
 * only until the time chosen on the page, then falls back to full control on its own.
 */
function rfaheya_mcp_level() {
	$o = rfaheya_mcp_options();
	if ( 'admin' === $o['mode'] ) {
		return ! empty( $o['until'] ) && time() > (int) $o['until'] ? 'full' : 'admin';
	}
	return 'full' === $o['mode'] ? 'full' : 'read';
}

/** Whether a tool may run at the current level. */
function rfaheya_mcp_allowed( $tool ) {
	$need = ! empty( $tool['admin'] ) ? 2 : ( $tool['write'] ? 1 : 0 );
	$have = array( 'read' => 0, 'full' => 1, 'admin' => 2 )[ rfaheya_mcp_level() ];
	return $have >= $need;
}

/** A new secret key: only its hash is kept; the key itself is shown once. */
function rfaheya_mcp_new_key() {
	$key = wp_generate_password( 40, false, false );
	$o   = rfaheya_mcp_options();
	$o['hash'] = hash_hmac( 'sha256', $key, wp_salt( 'auth' ) );
	$o['hint'] = substr( $key, -4 );
	update_option( RFAHEYA_MCP, $o, false );
	return $key;
}

function rfaheya_mcp_key_ok( $key ) {
	$o = rfaheya_mcp_options();
	return $o['on'] && $o['hash'] && is_string( $key ) && strlen( $key ) >= 30 && hash_equals( $o['hash'], hash_hmac( 'sha256', $key, wp_salt( 'auth' ) ) );
}

/** One line in the activity log (the last 300 are kept). */
function rfaheya_mcp_log( $tool, $args, $ok, $note = '' ) {
	$log = get_option( 'rfaheya_mcp_log', array() );
	$log = is_array( $log ) ? $log : array();
	array_unshift(
		$log,
		array(
			't'    => time(),
			'tool' => $tool,
			'args' => mb_substr( wp_json_encode( $args, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ), 0, 400 ),
			'ok'   => (bool) $ok,
			'note' => mb_substr( (string) $note, 0, 200 ),
			'ip'   => function_exists( 'rfaheya_client_ip' ) ? rfaheya_client_ip() : '',
		)
	);
	update_option( 'rfaheya_mcp_log', array_slice( $log, 0, 300 ), false );
}

add_action(
	'rest_api_init',
	function () {
		$args = array(
			'methods'             => array( 'GET', 'POST', 'DELETE' ),
			'callback'            => 'rfaheya_mcp_handle',
			'permission_callback' => '__return_true', // the key is checked in the handler (a JSON-RPC answer, not a WordPress one)
		);
		register_rest_route( 'rfaheya/v1', '/mcp', $args );
		register_rest_route( 'rfaheya/v1', '/mcp/(?P<key>[A-Za-z0-9]{30,64})', $args );
	}
);

/** The key from the address or from "Authorization: Bearer …". */
function rfaheya_mcp_request_key( WP_REST_Request $r ) {
	if ( $r->get_param( 'key' ) ) {
		return (string) $r->get_param( 'key' );
	}
	$auth = (string) $r->get_header( 'authorization' );
	return preg_match( '/^Bearer\s+(\S+)$/i', $auth, $m ) ? $m[1] : '';
}

function rfaheya_mcp_handle( WP_REST_Request $r ) {
	nocache_headers();
	if ( function_exists( 'rfaheya_limit_count' ) && rfaheya_limit_count( 'mcp', rfaheya_client_ip() ) > 30 ) {
		return new WP_REST_Response( array( 'error' => 'Too many wrong attempts. Try again later.' ), 429 );
	}
	if ( ! rfaheya_mcp_key_ok( rfaheya_mcp_request_key( $r ) ) ) {
		// Wrong keys are rate limited like sign-ins.
		if ( function_exists( 'rfaheya_limit_hit' ) ) {
			rfaheya_limit_hit( 'mcp', rfaheya_client_ip(), HOUR_IN_SECONDS );
		}
		return new WP_REST_Response( array( 'error' => 'Not connected: the connection is off or the address is wrong.' ), 401 );
	}
	if ( 'POST' !== $r->get_method() ) {
		// No server-sent stream and no sessions: every answer comes back on its own request.
		return new WP_REST_Response( null, 'DELETE' === $r->get_method() ? 200 : 405 );
	}
	$o = rfaheya_mcp_options();
	if ( $o['user'] ) {
		wp_set_current_user( (int) $o['user'] );
	}
	$body = json_decode( $r->get_body(), true );
	if ( ! is_array( $body ) ) {
		return new WP_REST_Response( array( 'jsonrpc' => '2.0', 'id' => null, 'error' => array( 'code' => -32700, 'message' => 'Parse error' ) ), 400 );
	}
	$batch = isset( $body[0] );
	$out   = array();
	foreach ( $batch ? $body : array( $body ) as $msg ) {
		$res = rfaheya_mcp_message( is_array( $msg ) ? $msg : array() );
		if ( null !== $res ) {
			$out[] = $res;
		}
	}
	if ( ! $out ) {
		return new WP_REST_Response( null, 202 ); // notifications only
	}
	return new WP_REST_Response( $batch ? $out : $out[0], 200 );
}

/** One JSON-RPC message → its answer (null for a notification). */
function rfaheya_mcp_message( $msg ) {
	$id     = $msg['id'] ?? null;
	$method = (string) ( $msg['method'] ?? '' );
	$params = is_array( $msg['params'] ?? null ) ? $msg['params'] : array();
	$answer = fn( $result ) => array( 'jsonrpc' => '2.0', 'id' => $id, 'result' => $result );
	$error  = fn( $code, $text ) => array( 'jsonrpc' => '2.0', 'id' => $id, 'error' => array( 'code' => $code, 'message' => $text ) );
	if ( ! array_key_exists( 'id', $msg ) ) {
		return null; // notifications/initialized, cancelled…
	}
	switch ( $method ) {
		case 'initialize':
			$asked = (string) ( $params['protocolVersion'] ?? '' );
			$known = array( '2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05' );
			return $answer(
				array(
					'protocolVersion' => in_array( $asked, $known, true ) ? $asked : '2025-06-18',
					'capabilities'    => array( 'tools' => array( 'listChanged' => false ) ),
					'serverInfo'      => array(
						'name'    => 'rfaheya-store',
						'title'   => get_bloginfo( 'name' ) . ' store',
						'version' => '1.0.0',
					),
					'instructions'    => 'The ' . get_bloginfo( 'name' ) . ' WooCommerce store (prices in EGP). Read before you change anything; for changes, say what you will do and get the owner\'s go-ahead first. '
						. array(
							'read'  => 'Read-only: the owner allows reading only.',
							'full'  => 'Full control of the store data is on.',
							'admin' => 'Admin is on: store data, site files and plugins. Files you overwrite or delete are backed up first (list_backups / restore_backup).',
						)[ rfaheya_mcp_level() ],
				)
			);
		case 'ping':
			return $answer( new stdClass() );
		case 'tools/list':
			$tools = array();
			foreach ( rfaheya_mcp_tools() as $name => $t ) {
				if ( ! rfaheya_mcp_allowed( $t ) ) {
					continue;
				}
				$tools[] = array(
					'name'        => $name,
					'description' => $t['desc'],
					'inputSchema' => array(
						'type'       => 'object',
						'properties' => $t['props'] ? $t['props'] : new stdClass(),
						'required'   => $t['required'] ?? array(),
					),
					'annotations' => array(
						'readOnlyHint'    => ! $t['write'],
						'destructiveHint' => ! empty( $t['destructive'] ),
					),
				);
			}
			return $answer( array( 'tools' => $tools ) );
		case 'tools/call':
			$name  = (string) ( $params['name'] ?? '' );
			$args  = is_array( $params['arguments'] ?? null ) ? $params['arguments'] : array();
			$tools = rfaheya_mcp_tools();
			if ( ! isset( $tools[ $name ] ) ) {
				return $error( -32602, 'Unknown tool: ' . $name );
			}
			if ( ! rfaheya_mcp_allowed( $tools[ $name ] ) ) {
				rfaheya_mcp_log( $name, $args, false, 'not allowed at ' . rfaheya_mcp_level() );
				return $answer( array( 'content' => array( array( 'type' => 'text', 'text' => 'The store owner hasn\'t allowed this (Tools → Claude connection ✦ → ' . ( empty( $tools[ $name ]['admin'] ) ? 'Full control' : 'Admin' ) . ').' ) ), 'isError' => true ) );
			}
			try {
				$result = call_user_func( $tools[ $name ]['run'], $args );
				if ( is_wp_error( $result ) ) {
					throw new Exception( $result->get_error_message() );
				}
				rfaheya_mcp_log( $name, $args, true );
				return $answer(
					array(
						'content' => array( array( 'type' => 'text', 'text' => wp_json_encode( $result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ) ) ),
					)
				);
			} catch ( Throwable $e ) {
				rfaheya_mcp_log( $name, $args, false, $e->getMessage() );
				return $answer( array( 'content' => array( array( 'type' => 'text', 'text' => 'Error: ' . $e->getMessage() ) ), 'isError' => true ) );
			}
	}
	return $error( -32601, 'Method not found: ' . $method );
}

// ---------------------------------------------------------------- what the tools return

function rfaheya_mcp_money( $n ) {
	return round( (float) $n, 2 );
}

function rfaheya_mcp_product( $p, $full = false ) {
	$out = array(
		'id'     => $p->get_id(),
		'name'   => html_entity_decode( $p->get_name(), ENT_QUOTES, 'UTF-8' ),
		'slug'   => $p->get_slug(),
		'status' => $p->get_status(),
		'type'   => $p->get_type(),
		'url'    => home_url( '/shop/' . $p->get_slug() ),
		'sizes'  => array(),
	);
	$vars = $p->is_type( 'variable' ) ? array_filter( array_map( 'wc_get_product', $p->get_children() ) ) : array( $p );
	foreach ( $vars as $v ) {
		$out['sizes'][] = array(
			'id'            => $v->get_id(),
			'size'          => $p->is_type( 'variable' ) ? implode( ', ', array_filter( array_map( 'strval', $v->get_variation_attributes( false ) ) ) ) : '',
			'regular_price' => rfaheya_mcp_money( $v->get_regular_price( 'edit' ) ),
			'sale_price'    => '' === $v->get_sale_price( 'edit' ) ? null : rfaheya_mcp_money( $v->get_sale_price( 'edit' ) ),
			'price_now'     => rfaheya_mcp_money( $v->get_price() ),
			'stock_status'  => $v->get_stock_status(),
			'stock'         => $v->managing_stock() ? $v->get_stock_quantity() : null,
		);
	}
	if ( $full ) {
		$out['categories']        = array_values( array_map( fn( $id ) => html_entity_decode( get_term( $id )->name ?? '', ENT_QUOTES, 'UTF-8' ), $p->get_category_ids() ) );
		$out['short_description'] = $p->get_short_description();
		$out['description']       = $p->get_description();
		$out['total_sales']       = (int) $p->get_total_sales();
		$out['rating']            = (float) $p->get_average_rating();
		$out['reviews']           = (int) $p->get_review_count();
		$out['visibility']        = $p->get_catalog_visibility();
	}
	return $out;
}

function rfaheya_mcp_order( $o, $full = false ) {
	$out = array(
		'id'       => $o->get_id(),
		'number'   => $o->get_order_number(),
		'date'     => $o->get_date_created() ? $o->get_date_created()->date_i18n( 'Y-m-d H:i' ) : '',
		'status'   => $o->get_status(),
		'total'    => rfaheya_mcp_money( $o->get_total() ),
		'customer' => trim( $o->get_billing_first_name() . ' ' . $o->get_billing_last_name() ),
		'phone'    => $o->get_billing_phone(),
		'city'     => trim( $o->get_billing_city() . ', ' . $o->get_billing_state(), ', ' ),
		'payment'  => $o->get_payment_method_title(),
		'items'    => array_values( array_map( fn( $i ) => $i->get_quantity() . ' × ' . $i->get_name(), $o->get_items() ) ),
	);
	if ( $full ) {
		$out['email']    = $o->get_billing_email();
		$out['address']  = trim( $o->get_billing_address_1() . ' ' . $o->get_billing_address_2() );
		$out['shipping'] = rfaheya_mcp_money( $o->get_shipping_total() );
		$out['discount'] = rfaheya_mcp_money( $o->get_discount_total() );
		$out['fees']     = array_values( array_map( fn( $f ) => $f->get_name() . ': ' . rfaheya_mcp_money( $f->get_total() ), $o->get_fees() ) );
		$out['note']     = $o->get_customer_note();
		$out['notes']    = array_map( fn( $n ) => $n->date_created->date_i18n( 'Y-m-d H:i' ) . ' — ' . wp_strip_all_tags( $n->content ), wc_get_order_notes( array( 'order_id' => $o->get_id(), 'limit' => 10 ) ) );
		$out['admin']    = admin_url( 'post.php?post=' . $o->get_id() . '&action=edit' );
	}
	return $out;
}

function rfaheya_mcp_find_product( $a ) {
	$p = ! empty( $a['id'] ) ? wc_get_product( (int) $a['id'] ) : null;
	if ( ! $p && ! empty( $a['slug'] ) ) {
		$post = get_page_by_path( sanitize_title( $a['slug'] ), OBJECT, 'product' );
		$p    = $post ? wc_get_product( $post->ID ) : null;
	}
	if ( ! $p ) {
		throw new Exception( 'Product not found.' );
	}
	return $p;
}

function rfaheya_mcp_sales( $days ) {
	$from   = gmdate( 'Y-m-d', time() - max( 1, (int) $days ) * DAY_IN_SECONDS + DAY_IN_SECONDS );
	$orders = wc_get_orders(
		array(
			'status'       => array( 'wc-processing', 'wc-completed', 'wc-on-hold' ),
			'date_created' => '>=' . $from,
			'limit'        => -1,
		)
	);
	$total = 0;
	$top   = array();
	foreach ( $orders as $o ) {
		$total += (float) $o->get_total();
		foreach ( $o->get_items() as $i ) {
			$n         = $i->get_name();
			$top[ $n ] = ( $top[ $n ] ?? 0 ) + $i->get_quantity();
		}
	}
	arsort( $top );
	return array(
		'days'          => (int) $days,
		'orders'        => count( $orders ),
		'revenue'       => rfaheya_mcp_money( $total ),
		'average_order' => $orders ? rfaheya_mcp_money( $total / count( $orders ) ) : 0,
		'top_items'     => array_slice( $top, 0, 10, true ),
	);
}

/** The tools: name → description, inputs, whether it changes the store, and what it runs. */
function rfaheya_mcp_tools() {
	$s   = fn( $d ) => array( 'type' => 'string', 'description' => $d );
	$n   = fn( $d ) => array( 'type' => 'number', 'description' => $d );
	$i   = fn( $d ) => array( 'type' => 'integer', 'description' => $d );
	$b   = fn( $d ) => array( 'type' => 'boolean', 'description' => $d );
	$e   = fn( $d, $v ) => array( 'type' => 'string', 'enum' => $v, 'description' => $d );
	$obj = fn( $d ) => array( 'type' => 'object', 'description' => $d );
	return array(
		// ---------------- reading
		'store_overview'     => array(
			'desc'  => 'A snapshot of the store: today\'s and this week\'s sales, orders waiting by status, products out of / low in stock, the offers running now, reviews waiting.',
			'props' => array(),
			'write' => false,
			'run'   => function () {
				$counts = array();
				foreach ( array( 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed' ) as $st ) {
					$counts[ $st ] = (int) wc_orders_count( $st );
				}
				$out = array();
				$low = array();
				foreach ( wc_get_products( array( 'limit' => -1, 'status' => 'publish', 'type' => array( 'simple', 'variable' ) ) ) as $p ) {
					foreach ( $p->is_type( 'variable' ) ? array_filter( array_map( 'wc_get_product', $p->get_children() ) ) : array( $p ) as $v ) {
						if ( 'outofstock' === $v->get_stock_status() ) {
							$out[] = $v->get_name();
						} elseif ( $v->managing_stock() && null !== $v->get_stock_quantity() && $v->get_stock_quantity() <= 3 ) {
							$low[] = $v->get_name() . ' (' . $v->get_stock_quantity() . ')';
						}
					}
				}
				return array(
					'store'           => get_bloginfo( 'name' ),
					'url'             => home_url( '/' ),
					'today'           => rfaheya_mcp_sales( 1 ),
					'last_7_days'     => rfaheya_mcp_sales( 7 ),
					'orders_by_status' => $counts,
					'out_of_stock'    => $out,
					'low_stock'       => $low,
					'offers_running'  => array_values( array_map( 'rfaheya_offer_summary', array_filter( rfaheya_discount_rules(), 'rfaheya_rule_live' ) ) ),
					'reviews_waiting' => (int) get_comments( array( 'type' => 'review', 'status' => 'hold', 'count' => true ) ),
				);
			},
		),
		'sales_report'       => array(
			'desc'     => 'Sales for the last N days: orders, revenue (EGP), average order, best-selling items.',
			'props'    => array( 'days' => $i( 'How many days back (1 = today).' ) ),
			'required' => array( 'days' ),
			'write'    => false,
			'run'      => fn( $a ) => rfaheya_mcp_sales( min( 366, max( 1, (int) $a['days'] ) ) ),
		),
		'search_products'    => array(
			'desc'  => 'Find products by name (empty = all), with each size\'s id, price, sale price and stock.',
			'props' => array(
				'query'  => $s( 'Words in the name.' ),
				'status' => $e( 'Default publish.', array( 'publish', 'draft', 'private', 'any' ) ),
				'limit'  => $i( 'Default 30, at most 100.' ),
			),
			'write' => false,
			'run'   => function ( $a ) {
				$st = $a['status'] ?? 'publish';
				$q  = array( 'limit' => min( 100, max( 1, (int) ( $a['limit'] ?? 30 ) ) ), 'status' => 'any' === $st ? array( 'publish', 'draft', 'private', 'pending' ) : $st, 'type' => array( 'simple', 'variable' ), 'orderby' => 'title', 'order' => 'ASC' );
				if ( ! empty( $a['query'] ) ) {
					$q['s'] = sanitize_text_field( $a['query'] );
				}
				return array_map( 'rfaheya_mcp_product', wc_get_products( $q ) );
			},
		),
		'get_product'        => array(
			'desc'  => 'One product in full (sizes, prices, stock, description, categories, sales, rating) by id or slug.',
			'props' => array( 'id' => $i( 'Product id.' ), 'slug' => $s( 'Or its slug.' ) ),
			'write' => false,
			'run'   => fn( $a ) => rfaheya_mcp_product( rfaheya_mcp_find_product( $a ), true ),
		),
		'list_orders'        => array(
			'desc'  => 'Recent orders, newest first. Filter by status or search a name / phone / email.',
			'props' => array(
				'status' => $e( 'Default any.', array( 'any', 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed' ) ),
				'search' => $s( 'Name, phone or email.' ),
				'limit'  => $i( 'Default 20, at most 100.' ),
			),
			'write' => false,
			'run'   => function ( $a ) {
				$limit  = min( 100, max( 1, (int) ( $a['limit'] ?? 20 ) ) );
				$status = ! empty( $a['status'] ) && 'any' !== $a['status'] ? sanitize_key( $a['status'] ) : '';
				if ( ! empty( $a['search'] ) ) {
					$ids = array_map( 'intval', (array) wc_order_search( sanitize_text_field( $a['search'] ) ) );
					rsort( $ids );
					$found = array();
					foreach ( $ids as $oid ) {
						$o = wc_get_order( $oid );
						if ( $o && ( ! $status || $o->get_status() === $status ) ) {
							$found[] = rfaheya_mcp_order( $o );
						}
						if ( count( $found ) >= $limit ) {
							break;
						}
					}
					return $found;
				}
				$q = array( 'limit' => $limit, 'orderby' => 'date', 'order' => 'DESC' );
				if ( $status ) {
					$q['status'] = 'wc-' . $status;
				}
				return array_map( 'rfaheya_mcp_order', wc_get_orders( $q ) );
			},
		),
		'get_order'          => array(
			'desc'     => 'One order in full (customer, address, items, shipping, discounts, notes).',
			'props'    => array( 'id' => $i( 'Order id.' ) ),
			'required' => array( 'id' ),
			'write'    => false,
			'run'      => function ( $a ) {
				$o = wc_get_order( (int) $a['id'] );
				if ( ! $o ) {
					throw new Exception( 'Order not found.' );
				}
				return rfaheya_mcp_order( $o, true );
			},
		),
		'list_offers'        => array(
			'desc'  => 'Every offer in Products → Offers & discounts, with its id, settings, and whether it is running now. Kinds: percent, amount, fixed (price offers); bogo, set_price, qty_tiers, spend, gift, free_shipping (cart offers).',
			'props' => array(),
			'write' => false,
			'run'   => fn() => array_map(
				fn( $r ) => array_merge( $r, array( 'summary' => rfaheya_offer_summary( $r ), 'running' => rfaheya_rule_live( $r ) ) ),
				rfaheya_offers_with_ids()
			),
		),
		'get_settings'       => array(
			'desc'  => 'The store settings (Settings → Rfaheya Store), by group: contact, social, home, shipping (free shipping, minimum order, spend-more offer), bundle, discovery, campaigns, loyalty, seo…',
			'props' => array( 'group' => $s( 'One group, or empty for all.' ) ),
			'write' => false,
			'run'   => function ( $a ) {
				$o = rfaheya_options();
				$g = sanitize_key( $a['group'] ?? '' );
				if ( $g && ! isset( $o[ $g ] ) ) {
					throw new Exception( 'No such group. Groups: ' . implode( ', ', array_keys( $o ) ) );
				}
				$labels = array();
				foreach ( rfaheya_fields() as $group => $fields ) {
					foreach ( $fields as $k => $f ) {
						$labels[ $group ][ $k ] = $f[0];
					}
				}
				$pick = $g ? array( $g => $o[ $g ] ) : $o;
				$out  = array();
				foreach ( $pick as $group => $vals ) {
					foreach ( $vals as $k => $v ) {
						$out[ $group ][ $k ] = array( 'value' => $v, 'label' => $labels[ $group ][ $k ] ?? '' );
					}
				}
				return $out;
			},
		),
		'get_menus'          => array(
			'desc'  => 'The header and footer menus (Appearance → Menus ✦).',
			'props' => array(),
			'write' => false,
			'run'   => fn() => array(
				'customised' => (bool) rfaheya_menus_saved(),
				'menus'      => rfaheya_menus_saved() ? rfaheya_menus_saved() : rfaheya_menus_default(),
			),
		),
		'list_reviews'       => array(
			'desc'  => 'Product reviews: waiting for approval (hold) or approved.',
			'props' => array( 'status' => $e( 'Default hold.', array( 'hold', 'approve', 'all' ) ), 'limit' => $i( 'Default 20.' ) ),
			'write' => false,
			'run'   => fn( $a ) => array_map(
				fn( $c ) => array(
					'id'      => (int) $c->comment_ID,
					'product' => get_the_title( $c->comment_post_ID ),
					'author'  => $c->comment_author,
					'rating'  => (int) get_comment_meta( $c->comment_ID, 'rating', true ),
					'date'    => $c->comment_date,
					'status'  => wp_get_comment_status( $c ),
					'text'    => $c->comment_content,
				),
				get_comments( array( 'type' => 'review', 'status' => $a['status'] ?? 'hold', 'number' => min( 100, (int) ( $a['limit'] ?? 20 ) ) ) )
			),
		),
		'list_posts'         => array(
			'desc'  => 'Blog articles (all languages), newest first.',
			'props' => array( 'status' => $e( 'Default any.', array( 'any', 'publish', 'draft' ) ), 'limit' => $i( 'Default 20.' ) ),
			'write' => false,
			'run'   => fn( $a ) => array_map(
				fn( $p ) => array( 'id' => $p->ID, 'title' => get_the_title( $p ), 'status' => $p->post_status, 'date' => $p->post_date, 'url' => get_permalink( $p ) ),
				get_posts( array( 'post_type' => 'post', 'post_status' => ( $a['status'] ?? 'any' ) === 'any' ? array( 'publish', 'draft', 'pending', 'future' ) : $a['status'], 'numberposts' => min( 100, (int) ( $a['limit'] ?? 20 ) ), 'suppress_filters' => true ) )
			),
		),
		'list_coupons'       => array(
			'desc'  => 'Coupon codes with their discount, usage and expiry.',
			'props' => array(),
			'write' => false,
			'run'   => fn() => array_map(
				function ( $p ) {
					$c = new WC_Coupon( $p->ID );
					return array( 'id' => $c->get_id(), 'code' => $c->get_code(), 'type' => $c->get_discount_type(), 'amount' => rfaheya_mcp_money( $c->get_amount() ), 'used' => $c->get_usage_count(), 'limit' => $c->get_usage_limit(), 'expires' => $c->get_date_expires() ? $c->get_date_expires()->date( 'Y-m-d' ) : null, 'status' => $p->post_status );
				},
				get_posts( array( 'post_type' => 'shop_coupon', 'post_status' => array( 'publish', 'draft' ), 'numberposts' => 100 ) )
			),
		),

		// ---------------- changing (full control only)
		'update_product'     => array(
			'desc'  => 'Change a product or one of its sizes (use the size id from search_products for prices / stock). Only the fields given change. sale_price "" removes the sale.',
			'props' => array(
				'id'                => $i( 'Product id, or a size (variation) id.' ),
				'name'              => $s( 'New name.' ),
				'status'            => $e( 'publish = on the store, draft = hidden.', array( 'publish', 'draft', 'private' ) ),
				'regular_price'     => $s( 'Price in EGP.' ),
				'sale_price'        => $s( 'Sale price in EGP, or "" to end the sale.' ),
				'stock_status'      => $e( 'Stock status.', array( 'instock', 'outofstock', 'onbackorder' ) ),
				'stock_quantity'    => $i( 'Units in stock (turns stock counting on).' ),
				'short_description' => $s( 'Short description (HTML allowed).' ),
				'description'       => $s( 'Full description (HTML allowed).' ),
			),
			'required' => array( 'id' ),
			'write'    => true,
			'run'      => function ( $a ) {
				$p = wc_get_product( (int) $a['id'] );
				if ( ! $p ) {
					throw new Exception( 'Product not found.' );
				}
				if ( isset( $a['name'] ) && ! $p->is_type( 'variation' ) ) {
					$p->set_name( sanitize_text_field( $a['name'] ) );
				}
				if ( isset( $a['status'] ) ) {
					$p->set_status( sanitize_key( $a['status'] ) );
				}
				foreach ( array( 'regular_price', 'sale_price' ) as $k ) {
					if ( isset( $a[ $k ] ) ) {
						$v = '' === trim( (string) $a[ $k ] ) ? '' : (string) max( 0, (float) $a[ $k ] );
						if ( $p->is_type( 'variable' ) ) {
							throw new Exception( 'Prices belong to the sizes: use a size id from search_products.' );
						}
						$p->{'set_' . $k}( $v );
					}
				}
				if ( isset( $a['stock_quantity'] ) ) {
					$p->set_manage_stock( true );
					$p->set_stock_quantity( (int) $a['stock_quantity'] );
				}
				if ( isset( $a['stock_status'] ) ) {
					$p->set_stock_status( sanitize_key( $a['stock_status'] ) );
				}
				if ( isset( $a['short_description'] ) && ! $p->is_type( 'variation' ) ) {
					$p->set_short_description( wp_kses_post( $a['short_description'] ) );
				}
				if ( isset( $a['description'] ) ) {
					$p->set_description( wp_kses_post( $a['description'] ) );
				}
				$p->save();
				if ( $p->is_type( 'variation' ) ) {
					WC_Product_Variable::sync( $p->get_parent_id() );
					return rfaheya_mcp_product( wc_get_product( $p->get_parent_id() ) );
				}
				return rfaheya_mcp_product( wc_get_product( $p->get_id() ) );
			},
		),
		'update_order'       => array(
			'desc'  => 'Change an order\'s status and / or add a note (a customer note is emailed to them).',
			'props' => array(
				'id'            => $i( 'Order id.' ),
				'status'        => $e( 'New status.', array( 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed' ) ),
				'note'          => $s( 'A note on the order.' ),
				'note_customer' => $b( 'Send the note to the customer too.' ),
			),
			'required' => array( 'id' ),
			'write'    => true,
			'run'      => function ( $a ) {
				$o = wc_get_order( (int) $a['id'] );
				if ( ! $o ) {
					throw new Exception( 'Order not found.' );
				}
				if ( ! empty( $a['note'] ) ) {
					$o->add_order_note( sanitize_textarea_field( $a['note'] ), ! empty( $a['note_customer'] ), true );
				}
				if ( ! empty( $a['status'] ) ) {
					$o->update_status( sanitize_key( $a['status'] ), 'Changed by Claude. ', true );
				}
				return rfaheya_mcp_order( wc_get_order( $o->get_id() ), true );
			},
		),
		'save_offer'         => array(
			'desc'  => 'Add an offer (no id) or change one (its id from list_offers; only the fields given change). Fields as in list_offers: name, kind, enabled, stack (adds up with other discounts), value, value_type (percent|amount, for spend), buy, get, get_off (% off the free ones, 100 = free), get_other, limit, tiers ("2 = 10\n3 = 15"), min_spend, min_qty, gift (product / size id), products / sizes / categories (and get_products… for get_other), start / end (YYYY-MM-DD), note.',
			'props' => array( 'id' => $s( 'Offer id to change; empty adds a new one.' ), 'offer' => $obj( 'The offer\'s fields.' ) ),
			'required' => array( 'offer' ),
			'write'    => true,
			'run'      => function ( $a ) {
				$rules = rfaheya_offers_with_ids();
				$id    = sanitize_key( $a['id'] ?? '' );
				$base  = array();
				foreach ( $rules as $r ) {
					if ( $id && $r['id'] === $id ) {
						$base = $r;
					}
				}
				if ( $id && ! $base ) {
					throw new Exception( 'Offer not found.' );
				}
				$offer = rfaheya_clean_offer( array_merge( $base, (array) $a['offer'] ), $id );
				$found = false;
				foreach ( $rules as $k => $r ) {
					if ( $r['id'] === $offer['id'] ) {
						$rules[ $k ] = $offer;
						$found       = true;
					}
				}
				if ( ! $found ) {
					$rules[] = $offer;
				}
				rfaheya_store_offers( $rules );
				return array_merge( $offer, array( 'summary' => rfaheya_offer_summary( $offer ), 'running' => rfaheya_rule_live( $offer ) ) );
			},
		),
		'delete_offer'       => array(
			'desc'        => 'Delete an offer for good (to pause it, save_offer with enabled false instead).',
			'props'       => array( 'id' => $s( 'Offer id.' ) ),
			'required'    => array( 'id' ),
			'write'       => true,
			'destructive' => true,
			'run'         => function ( $a ) {
				$rules = rfaheya_offers_with_ids();
				$left  = array_values( array_filter( $rules, fn( $r ) => $r['id'] !== sanitize_key( $a['id'] ) ) );
				if ( count( $left ) === count( $rules ) ) {
					throw new Exception( 'Offer not found.' );
				}
				rfaheya_store_offers( $left );
				return array( 'deleted' => $a['id'] );
			},
		),
		'update_settings'    => array(
			'desc'     => 'Change store settings in one group (see get_settings for the groups, keys and current values). Only the keys given change. Yes/no settings take "yes" or "no".',
			'props'    => array( 'group' => $s( 'The group, e.g. shipping.' ), 'values' => $obj( 'key → new value.' ) ),
			'required' => array( 'group', 'values' ),
			'write'    => true,
			'run'      => function ( $a ) {
				$g      = sanitize_key( $a['group'] );
				$fields = rfaheya_fields();
				if ( ! isset( $fields[ $g ] ) ) {
					throw new Exception( 'No such group. Groups: ' . implode( ', ', array_keys( $fields ) ) );
				}
				$bad = array_diff( array_keys( (array) $a['values'] ), array_keys( $fields[ $g ] ) );
				if ( $bad ) {
					throw new Exception( 'Unknown keys in ' . $g . ': ' . implode( ', ', $bad ) . '. Keys: ' . implode( ', ', array_keys( $fields[ $g ] ) ) );
				}
				$saved       = get_option( RFAHEYA_OPTION, array() );
				$saved       = is_array( $saved ) ? $saved : array();
				$merged      = rfaheya_options();
				foreach ( $saved as $sg => $vals ) {
					if ( is_array( $vals ) ) {
						$merged[ $sg ] = array_merge( $merged[ $sg ] ?? array(), $vals );
					}
				}
				$merged[ $g ] = array_merge( $merged[ $g ] ?? array(), array_map( fn( $v ) => is_bool( $v ) ? ( $v ? 'yes' : 'no' ) : $v, (array) $a['values'] ) );
				update_option( RFAHEYA_OPTION, rfaheya_clean_settings( $merged ) );
				delete_transient( 'rfaheya_bootstrap' );
				rfaheya_purge_page_cache();
				return array( $g => rfaheya_options()[ $g ] );
			},
		),
		'save_menus'         => array(
			'desc'     => 'Replace the header and footer menus. Shape: {header:[{label,to,on}], footer:[{title,on,links:[{label,to,on}]}]} — read get_menus first and send the whole thing back changed. "to" is a store path (/shop) or a full https address.',
			'props'    => array( 'menus' => $obj( 'The whole menus.' ) ),
			'required' => array( 'menus' ),
			'write'    => true,
			'run'      => function ( $a ) {
				update_option( RFAHEYA_MENUS, rfaheya_menus_clean( (array) $a['menus'] ), true );
				delete_transient( 'rfaheya_bootstrap' );
				rfaheya_purge_page_cache();
				return rfaheya_menus_saved();
			},
		),
		'moderate_review'    => array(
			'desc'     => 'Approve, hide, mark as spam or bin a review; optionally reply to it as the store.',
			'props'    => array( 'id' => $i( 'Review id.' ), 'action' => $e( 'What to do.', array( 'approve', 'hold', 'spam', 'trash', 'reply' ) ), 'reply' => $s( 'The reply text (action reply).' ) ),
			'required' => array( 'id', 'action' ),
			'write'    => true,
			'run'      => function ( $a ) {
				$c = get_comment( (int) $a['id'] );
				if ( ! $c ) {
					throw new Exception( 'Review not found.' );
				}
				if ( 'reply' === $a['action'] ) {
					$u   = wp_get_current_user();
					$rid = wp_insert_comment(
						array(
							'comment_post_ID'  => $c->comment_post_ID,
							'comment_parent'   => $c->comment_ID,
							'comment_content'  => wp_kses_post( (string) ( $a['reply'] ?? '' ) ),
							'comment_author'   => get_bloginfo( 'name' ),
							'user_id'          => $u->ID,
							'comment_approved' => 1,
							'comment_type'     => 'review',
						)
					);
					return array( 'reply' => $rid );
				}
				wp_set_comment_status( $c->comment_ID, $a['action'] );
				return array( 'id' => (int) $c->comment_ID, 'status' => wp_get_comment_status( $c->comment_ID ) );
			},
		),
		'save_post'          => array(
			'desc'     => 'Write a blog article (new, no id) or change one. Saved as a draft unless status publish is asked for.',
			'props'    => array( 'id' => $i( 'Article id to change.' ), 'title' => $s( 'Title.' ), 'content' => $s( 'Body (HTML).' ), 'excerpt' => $s( 'Short summary.' ), 'status' => $e( 'Default draft.', array( 'draft', 'publish' ) ) ),
			'write'    => true,
			'run'      => function ( $a ) {
				$post = array( 'post_type' => 'post' );
				if ( ! empty( $a['id'] ) ) {
					$post['ID'] = (int) $a['id'];
					if ( 'post' !== get_post_type( $post['ID'] ) ) {
						throw new Exception( 'Article not found.' );
					}
				} else {
					$post['post_status'] = 'draft';
				}
				foreach ( array( 'title' => 'post_title', 'content' => 'post_content', 'excerpt' => 'post_excerpt' ) as $k => $f ) {
					if ( isset( $a[ $k ] ) ) {
						$post[ $f ] = 'title' === $k ? sanitize_text_field( $a[ $k ] ) : wp_kses_post( $a[ $k ] );
					}
				}
				if ( ! empty( $a['status'] ) ) {
					$post['post_status'] = 'publish' === $a['status'] ? 'publish' : 'draft';
				}
				$id = ! empty( $post['ID'] ) ? wp_update_post( $post, true ) : wp_insert_post( $post, true );
				if ( is_wp_error( $id ) ) {
					return $id;
				}
				return array( 'id' => $id, 'status' => get_post_status( $id ), 'url' => get_permalink( $id ), 'edit' => admin_url( 'post.php?post=' . $id . '&action=edit' ) );
			},
		),
		'create_coupon'      => array(
			'desc'     => 'Make a coupon code.',
			'props'    => array(
				'code'        => $s( 'The code customers type.' ),
				'type'        => $e( 'percent = % off the order, fixed_cart = EGP off the order.', array( 'percent', 'fixed_cart' ) ),
				'amount'      => $n( 'The % or the EGP.' ),
				'expires'     => $s( 'Last day, YYYY-MM-DD (optional).' ),
				'usage_limit' => $i( 'How many times in all (optional).' ),
				'per_user'    => $i( 'How many times per customer (optional).' ),
				'minimum'     => $n( 'Smallest order it works on, EGP (optional).' ),
			),
			'required' => array( 'code', 'type', 'amount' ),
			'write'    => true,
			'run'      => function ( $a ) {
				$code = wc_format_coupon_code( (string) $a['code'] );
				if ( '' === $code || wc_get_coupon_id_by_code( $code ) ) {
					throw new Exception( 'That code is empty or already exists.' );
				}
				$c = new WC_Coupon();
				$c->set_code( $code );
				$c->set_discount_type( 'fixed_cart' === $a['type'] ? 'fixed_cart' : 'percent' );
				$c->set_amount( max( 0, (float) $a['amount'] ) );
				if ( ! empty( $a['expires'] ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $a['expires'] ) ) {
					$c->set_date_expires( $a['expires'] . ' 23:59:59' );
				}
				if ( ! empty( $a['usage_limit'] ) ) {
					$c->set_usage_limit( (int) $a['usage_limit'] );
				}
				if ( ! empty( $a['per_user'] ) ) {
					$c->set_usage_limit_per_user( (int) $a['per_user'] );
				}
				if ( ! empty( $a['minimum'] ) ) {
					$c->set_minimum_amount( (float) $a['minimum'] );
				}
				$c->save();
				return array( 'id' => $c->get_id(), 'code' => $c->get_code() );
			},
		),
		'refresh_store'      => array(
			'desc'  => 'Rebuild the storefront\'s copy of the catalogue and clear the page cache (after many changes, or when the store shows something old).',
			'props' => array(),
			'write' => true,
			'run'   => function () {
				delete_transient( 'rfaheya_bootstrap' );
				if ( function_exists( 'wc_delete_product_transients' ) ) {
					wc_delete_product_transients();
				}
				rfaheya_purge_page_cache();
				return array( 'refreshed' => true );
			},
		),

		// ---------------- admin: files and plugins (only while Admin is on)
		'list_files'         => array(
			'desc'  => 'The files and folders in a folder of the site (path relative to the WordPress root, e.g. "" or "wp-content/plugins").',
			'props' => array( 'path' => $s( 'Folder, relative to the site root.' ) ),
			'write' => false,
			'admin' => true,
			'run'   => function ( $a ) {
				$dir = rfaheya_mcp_path( $a['path'] ?? '', true );
				$out = array();
				foreach ( (array) scandir( $dir ) as $f ) {
					if ( '.' === $f || '..' === $f ) {
						continue;
					}
					$full  = $dir . '/' . $f;
					$out[] = array( 'name' => $f, 'type' => is_dir( $full ) ? 'dir' : 'file', 'size' => is_file( $full ) ? filesize( $full ) : null, 'modified' => gmdate( 'Y-m-d H:i', (int) filemtime( $full ) ) );
				}
				return $out;
			},
		),
		'read_file'          => array(
			'desc'     => 'A text file of the site (up to 1 MB). wp-config.php and other secret files are never shown.',
			'props'    => array( 'path' => $s( 'File, relative to the site root.' ) ),
			'required' => array( 'path' ),
			'write'    => false,
			'admin'    => true,
			'run'      => function ( $a ) {
				$file = rfaheya_mcp_path( $a['path'] );
				if ( ! is_file( $file ) ) {
					throw new Exception( 'No such file.' );
				}
				if ( filesize( $file ) > MB_IN_BYTES ) {
					throw new Exception( 'Too big to read here (over 1 MB).' );
				}
				return array( 'path' => rfaheya_mcp_rel( $file ), 'content' => (string) file_get_contents( $file ) );
			},
		),
		'write_file'         => array(
			'desc'     => 'Write a file of the site (made if new, replaced if there; the old one is backed up first). Text as "content", or binary as "base64".',
			'props'    => array( 'path' => $s( 'File, relative to the site root.' ), 'content' => $s( 'Text content.' ), 'base64' => $s( 'Or the bytes, base64.' ) ),
			'required' => array( 'path' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				$file = rfaheya_mcp_path( $a['path'] );
				$data = isset( $a['base64'] ) ? base64_decode( (string) $a['base64'], true ) : (string) ( $a['content'] ?? '' );
				if ( false === $data ) {
					throw new Exception( 'The base64 is not valid.' );
				}
				$backup = rfaheya_mcp_backup( array( $file ), 'write ' . rfaheya_mcp_rel( $file ) );
				wp_mkdir_p( dirname( $file ) );
				if ( false === file_put_contents( $file, $data ) ) {
					throw new Exception( 'Could not write the file (permissions?).' );
				}
				if ( function_exists( 'opcache_invalidate' ) && preg_match( '/\.php$/', $file ) ) {
					opcache_invalidate( $file, true );
				}
				return array( 'path' => rfaheya_mcp_rel( $file ), 'bytes' => strlen( $data ), 'backup' => $backup );
			},
		),
		'delete_file'        => array(
			'desc'        => 'Remove a file of the site (it is moved to a backup, so restore_backup brings it back).',
			'props'       => array( 'path' => $s( 'File, relative to the site root.' ) ),
			'required'    => array( 'path' ),
			'write'       => true,
			'admin'       => true,
			'destructive' => true,
			'run'         => function ( $a ) {
				$file = rfaheya_mcp_path( $a['path'] );
				if ( ! is_file( $file ) ) {
					throw new Exception( 'No such file.' );
				}
				$backup = rfaheya_mcp_backup( array( $file ), 'delete ' . rfaheya_mcp_rel( $file ) );
				unlink( $file );
				return array( 'deleted' => rfaheya_mcp_rel( $file ), 'backup' => $backup );
			},
		),
		'list_backups'       => array(
			'desc'  => 'The backups made before files were changed or deleted (newest first).',
			'props' => array(),
			'write' => false,
			'admin' => true,
			'run'   => fn() => array_slice( (array) get_option( 'rfaheya_mcp_backups', array() ), 0, 50 ),
		),
		'restore_backup'     => array(
			'desc'     => 'Put back the files of a backup (as they were before the change).',
			'props'    => array( 'id' => $s( 'Backup id from list_backups.' ) ),
			'required' => array( 'id' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				$id  = sanitize_key( $a['id'] );
				$dir = rfaheya_mcp_backup_dir() . '/' . $id;
				$map = is_readable( $dir . '/files.json' ) ? json_decode( (string) file_get_contents( $dir . '/files.json' ), true ) : null;
				if ( ! $id || ! is_array( $map ) ) {
					throw new Exception( 'Backup not found.' );
				}
				$done = array();
				foreach ( $map as $rel => $info ) {
					$target = rfaheya_mcp_path( $rel );
					if ( empty( $info['existed'] ) ) {
						if ( is_file( $target ) ) {
							unlink( $target ); // it was new: restoring removes it
						}
					} else {
						wp_mkdir_p( dirname( $target ) );
						copy( $dir . '/' . $info['copy'], $target );
					}
					$done[] = $rel;
				}
				return array( 'restored' => $done );
			},
		),
		'list_plugins'       => array(
			'desc'  => 'The installed plugins, active or not, with versions.',
			'props' => array(),
			'write' => false,
			'admin' => true,
			'run'   => function () {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
				$out = array();
				foreach ( get_plugins() as $file => $p ) {
					$out[] = array( 'file' => $file, 'name' => $p['Name'], 'version' => $p['Version'], 'active' => is_plugin_active( $file ) );
				}
				foreach ( get_mu_plugins() as $file => $p ) {
					$out[] = array( 'file' => 'mu-plugins/' . $file, 'name' => $p['Name'] ? $p['Name'] : $file, 'version' => $p['Version'], 'active' => true, 'must_use' => true );
				}
				return $out;
			},
		),
		'upload_chunk'       => array(
			'desc'     => 'Send a zip (a plugin, or a store update) in pieces of base64: same upload_id for every piece, index 0, 1, 2… Then install_zip with that upload_id.',
			'props'    => array( 'upload_id' => $s( 'Your name for this upload (letters / digits).' ), 'index' => $i( 'Piece number, from 0.' ), 'base64' => $s( 'The piece.' ) ),
			'required' => array( 'upload_id', 'index', 'base64' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				$id   = sanitize_key( $a['upload_id'] );
				$data = base64_decode( (string) $a['base64'], true );
				if ( ! $id || false === $data ) {
					throw new Exception( 'Bad upload id or base64.' );
				}
				$file = rfaheya_mcp_backup_dir() . '/upload-' . $id . '.zip';
				if ( 0 === (int) $a['index'] && is_file( $file ) ) {
					unlink( $file );
				}
				file_put_contents( $file, $data, FILE_APPEND );
				return array( 'upload_id' => $id, 'bytes' => filesize( $file ), 'md5' => md5_file( $file ) );
			},
		),
		'install_zip'        => array(
			'desc'     => 'Install an uploaded zip as a plugin (replacing the installed copy, like Plugins → Upload → Replace). The store update (rfaheya-storefront.zip) puts the new storefront and store plugin in place this way.',
			'props'    => array( 'upload_id' => $s( 'From upload_chunk.' ), 'md5' => $s( 'Optional: the zip\'s md5, to check it arrived whole.' ), 'activate' => $b( 'Switch the plugin on after (default true).' ) ),
			'required' => array( 'upload_id' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				$file = rfaheya_mcp_backup_dir() . '/upload-' . sanitize_key( $a['upload_id'] ) . '.zip';
				if ( ! is_file( $file ) ) {
					throw new Exception( 'No such upload.' );
				}
				if ( ! empty( $a['md5'] ) && md5_file( $file ) !== strtolower( (string) $a['md5'] ) ) {
					throw new Exception( 'The zip didn\'t arrive whole (md5 differs). Send it again.' );
				}
				$result = rfaheya_mcp_install_plugin( $file, ! isset( $a['activate'] ) || ! empty( $a['activate'] ) );
				unlink( $file );
				return $result;
			},
		),
		'install_plugin'     => array(
			'desc'     => 'Install a plugin from wordpress.org by its slug (e.g. "redirection") and switch it on.',
			'props'    => array( 'slug' => $s( 'The plugin\'s slug on wordpress.org.' ), 'activate' => $b( 'Default true.' ) ),
			'required' => array( 'slug' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
				$api = plugins_api( 'plugin_information', array( 'slug' => sanitize_key( $a['slug'] ), 'fields' => array( 'sections' => false ) ) );
				if ( is_wp_error( $api ) ) {
					return $api;
				}
				return rfaheya_mcp_install_plugin( $api->download_link, ! isset( $a['activate'] ) || ! empty( $a['activate'] ) );
			},
		),
		'set_plugin_active'  => array(
			'desc'     => 'Switch an installed plugin on or off (its file from list_plugins).',
			'props'    => array( 'file' => $s( 'e.g. redirection/redirection.php' ), 'active' => $b( 'On or off.' ) ),
			'required' => array( 'file', 'active' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
				$file = plugin_basename( (string) $a['file'] );
				if ( ! isset( get_plugins()[ $file ] ) ) {
					throw new Exception( 'No such plugin.' );
				}
				if ( 'woocommerce/woocommerce.php' === $file && empty( $a['active'] ) ) {
					throw new Exception( 'WooCommerce stays on (the store needs it). Do this in the dashboard if you really mean it.' );
				}
				if ( ! empty( $a['active'] ) ) {
					$r = activate_plugin( $file );
					if ( is_wp_error( $r ) ) {
						return $r;
					}
				} else {
					deactivate_plugins( $file );
				}
				return array( 'file' => $file, 'active' => is_plugin_active( $file ) );
			},
		),
	);
}

// ---------------------------------------------------------------- the page

add_action(
	'admin_menu',
	function () {
		add_management_page( 'Claude connection', 'Claude connection ✦', 'manage_options', 'rfaheya-claude', 'rfaheya_mcp_page' );
	}
);

add_action(
	'admin_post_rfaheya_mcp',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Sorry, you are not allowed to change this.' );
		}
		check_admin_referer( 'rfaheya_mcp' );
		$o    = rfaheya_mcp_options();
		$do   = isset( $_POST['do'] ) ? sanitize_key( wp_unslash( $_POST['do'] ) ) : '';
		$args = array();
		if ( 'on' === $do || 'newkey' === $do ) {
			$o['on']   = true;
			$o['user'] = get_current_user_id();
			update_option( RFAHEYA_MCP, $o, false );
			if ( 'newkey' === $do || ! $o['hash'] ) {
				// Shown once, on the next screen only.
				set_transient( 'rfaheya_mcp_key_' . get_current_user_id(), rfaheya_mcp_new_key(), 10 * MINUTE_IN_SECONDS );
			}
		} elseif ( 'off' === $do ) {
			$o['on'] = false;
			update_option( RFAHEYA_MCP, $o, false );
		} elseif ( 'mode' === $do ) {
			$mode      = isset( $_POST['mode'] ) ? sanitize_key( wp_unslash( $_POST['mode'] ) ) : 'read';
			$o['mode'] = in_array( $mode, array( 'read', 'full', 'admin' ), true ) ? $mode : 'read';
			$hours     = isset( $_POST['hours'] ) ? (int) $_POST['hours'] : 24;
			$o['until'] = 'admin' === $o['mode'] && $hours > 0 ? time() + $hours * HOUR_IN_SECONDS : 0;
			update_option( RFAHEYA_MCP, $o, false );
		} elseif ( 'clearlog' === $do ) {
			delete_option( 'rfaheya_mcp_log' );
		}
		wp_safe_redirect( add_query_arg( 'page', 'rfaheya-claude', admin_url( 'tools.php' ) ) );
		exit;
	}
);

function rfaheya_mcp_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$o    = rfaheya_mcp_options();
	$key  = get_transient( 'rfaheya_mcp_key_' . get_current_user_id() );
	if ( $key ) {
		delete_transient( 'rfaheya_mcp_key_' . get_current_user_id() );
	}
	$url  = rest_url( 'rfaheya/v1/mcp/' );
	$log  = get_option( 'rfaheya_mcp_log', array() );
	$form = function ( $do, $label, $class = '', $extra = '' ) {
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="display:inline">';
		echo '<input type="hidden" name="action" value="rfaheya_mcp"><input type="hidden" name="do" value="' . esc_attr( $do ) . '">';
		wp_nonce_field( 'rfaheya_mcp' );
		echo $extra; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed markup
		echo '<button type="submit" class="' . esc_attr( $class ) . '">' . esc_html( $label ) . '</button></form>';
	};
	?>
	<div class="wrap rfk">
		<header class="rfk-hero">
			<p class="rfk-eyebrow">Rfaheya · Tools</p>
			<h1>Claude connection</h1>
			<p>Connect Claude to the store so you can just ask: “how were sales this week?”, “put Vanilla Oud 100 ML at 1,450”, “start a buy 1 get 1 on the 50 ML until Friday”, “mark order 1234 as shipped”. Claude reads first and tells you what it will change before it does.</p>
		</header>

		<section class="rfk-card">
			<div class="rfk-row">
				<div>
					<h2>Connection <span class="rfk-pill <?php echo $o['on'] ? 'is-on' : ''; ?>"><?php echo $o['on'] ? 'On' : 'Off'; ?></span></h2>
					<p class="rfk-muted"><?php echo $o['on'] ? 'Claude can reach the store with the secret address below.' : 'Nobody can reach the store this way. Switch it on to get the address.'; ?></p>
				</div>
				<div><?php $o['on'] ? $form( 'off', 'Switch off', 'rfk-btn rfk-ghost' ) : $form( 'on', 'Switch on', 'rfk-btn' ); ?></div>
			</div>

			<?php if ( $o['on'] ) : ?>
				<div class="rfk-key">
					<?php if ( $key ) : ?>
						<p><b>Your connection address</b> — copy it now: for safety it is shown only this once.</p>
						<div class="rfk-copy"><input type="text" readonly id="rfk-url" value="<?php echo esc_attr( $url . $key ); ?>"><button type="button" class="rfk-btn" onclick="var i=document.getElementById('rfk-url');i.select();navigator.clipboard&&navigator.clipboard.writeText(i.value);this.textContent='Copied ✓'">Copy</button></div>
					<?php else : ?>
						<p><b>Connection address:</b> <code><?php echo esc_html( $url ); ?>…<?php echo esc_html( $o['hint'] ); ?></code> (hidden for safety). Lost it? Make a new one — the old address stops working at once.</p>
					<?php endif; ?>
					<p class="rfk-warn">Treat this address like a password: whoever has it can do what the mode below allows. Don't post it anywhere.</p>
					<?php $form( 'newkey', 'Make a new address', 'rfk-btn rfk-ghost', '' ); ?>
				</div>
			<?php endif; ?>
		</section>

		<section class="rfk-card">
			<h2>What Claude may do</h2>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="rfk-modes">
				<input type="hidden" name="action" value="rfaheya_mcp"><input type="hidden" name="do" value="mode">
				<?php wp_nonce_field( 'rfaheya_mcp' ); ?>
				<label class="rfk-mode"><input type="radio" name="mode" value="read" <?php checked( 'read', $o['mode'] ); ?> onchange="this.form.submit()"><span><b>Read only</b><small>Sales, orders, products, offers, settings, reviews — look, don't touch.</small></span></label>
				<label class="rfk-mode"><input type="radio" name="mode" value="full" <?php checked( 'full', $o['mode'] ); ?> onchange="this.form.submit()"><span><b>Full control</b><small>Also change prices, stock, products, offers, coupons, order status, settings, menus, reviews and blog drafts. Nothing is ever deleted except an offer you ask to delete.</small></span></label>
				<label class="rfk-mode rfk-admin"><input type="radio" name="mode" value="admin" <?php checked( 'admin', $o['mode'] ); ?> onchange="this.form.submit()"><span><b>Admin — like you</b><small>Everything above, plus the site's files and plugins: edit files, install / update / switch plugins, put store updates in place (no more uploading zips). Every file changed or deleted is backed up first and can be put back. wp-config.php (the database password) stays out of reach.</small>
					<span class="rfk-for">For <select name="hours" onchange="if(this.form.querySelector('[value=admin]').checked)this.form.submit()">
						<?php foreach ( array( 2 => '2 hours', 24 => '24 hours', 168 => '7 days', 0 => 'until I switch it back' ) as $h => $label ) : ?>
							<option value="<?php echo esc_attr( $h ); ?>" <?php selected( 24 === $h ); ?>><?php echo esc_html( $label ); ?></option>
						<?php endforeach; ?>
					</select>, then back to Full control on its own.</span>
					<?php if ( 'admin' === $o['mode'] ) : ?>
						<em class="rfk-left"><?php echo 'admin' === rfaheya_mcp_level() ? ( empty( $o['until'] ) ? 'On until you switch it back.' : 'On until ' . esc_html( wp_date( 'j M, H:i', (int) $o['until'] ) ) . '.' ) : 'Ended — Claude is on Full control now. Choose Admin again to renew.'; ?></em>
					<?php endif; ?>
				</span></label>
			</form>
		</section>

		<section class="rfk-card">
			<h2>Add it to Claude</h2>
			<ol class="rfk-steps">
				<li>On <b>claude.ai</b> (or the Claude app): <b>Settings → Connectors → Add custom connector</b>.</li>
				<li>Name: <b>Rfaheya store</b>. URL: paste the connection address. Leave the advanced options empty → <b>Add</b>.</li>
				<li>In a chat, turn on <b>Rfaheya store</b> from the tools menu, and ask.</li>
			</ol>
			<p class="rfk-muted">Claude Code: <code>claude mcp add --transport http rfaheya &lt;the address&gt;</code></p>
		</section>

		<section class="rfk-card">
			<div class="rfk-row"><h2>Activity</h2><?php if ( $log ) { $form( 'clearlog', 'Clear', 'rfk-link' ); } ?></div>
			<?php if ( ! $log ) : ?>
				<p class="rfk-muted">Nothing yet. Everything Claude reads or changes shows here.</p>
			<?php else : ?>
				<table class="rfk-log">
					<thead><tr><th>When</th><th>What</th><th>Details</th><th></th></tr></thead>
					<tbody>
					<?php foreach ( array_slice( $log, 0, 100 ) as $l ) : ?>
						<tr>
							<td><?php echo esc_html( wp_date( 'j M · H:i', $l['t'] ) ); ?></td>
							<td><code><?php echo esc_html( $l['tool'] ); ?></code></td>
							<td class="rfk-args"><?php echo esc_html( '[]' === $l['args'] ? '' : $l['args'] ); ?><?php echo $l['note'] ? '<br><em>' . esc_html( $l['note'] ) . '</em>' : ''; ?></td>
							<td><?php echo $l['ok'] ? '<span class="rfk-ok">✓</span>' : '<span class="rfk-no">✗</span>'; ?></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</section>
	</div>
	<style>
		.rfk{max-width:980px;margin:20px 20px 0 0;color:#1d1a16;font-size:14px}
		.rfk-hero{border-radius:26px;padding:30px 34px;background:radial-gradient(120% 140% at 0% 0%,#5a3d17 0%,#2a1d0d 45%,#16110b 100%);color:#d9cbb4}
		.rfk-eyebrow{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#e6a43a}
		.rfk-hero h1{margin:0;color:#fff;font-size:32px;font-weight:600}
		.rfk-hero p{max-width:680px;line-height:1.55;font-size:14.5px}
		.rfk-card{background:#fff;border:1px solid #eadfcd;border-radius:22px;padding:20px 22px;margin-top:16px}
		.rfk-card h2{margin:0 0 6px;font-size:19px;display:flex;align-items:center;gap:10px}
		.rfk-row{display:flex;justify-content:space-between;align-items:center;gap:16px}
		.rfk-muted{color:#7a6f61;margin:4px 0}
		.rfk-pill{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;background:#eee6d8;color:#7a6f61;text-transform:uppercase;letter-spacing:.08em}
		.rfk-pill.is-on{background:#e3f1d8;color:#2f6a1f}
		.rfk-btn{border:0;border-radius:999px;background:#e39a2b;color:#1d1a16;font-weight:700;padding:10px 22px;cursor:pointer}
		.rfk-btn:hover{background:#d48b1d}
		.rfk-ghost{background:#f4ede1}
		.rfk-ghost:hover{background:#ecdcc0}
		.rfk-link{border:0;background:none;color:#8a7e6c;text-decoration:underline;cursor:pointer}
		.rfk-key{margin-top:16px;padding:16px;border-radius:16px;background:#fbf7f0;border:1px solid #efe3cf}
		.rfk-copy{display:flex;gap:8px;margin:8px 0}
		.rfk-copy input{flex:1;font-family:monospace;font-size:13px;border:1px solid #e3d8c6;border-radius:10px;padding:8px 10px;background:#fff}
		.rfk-warn{color:#9a5b00;font-size:12.5px}
		.rfk-modes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.rfk-admin{grid-column:1/-1}.rfk-for{display:block;margin-top:8px;font-size:12.5px;color:#5f5444}.rfk-for select{min-height:28px;border-radius:8px}.rfk-left{display:block;margin-top:6px;color:#9a5b00;font-style:normal;font-weight:600}
		.rfk-mode{display:flex;gap:10px;align-items:flex-start;border:1px solid #eadfcd;border-radius:16px;padding:14px;cursor:pointer}
		.rfk-mode:has(input:checked){border-color:#e39a2b;background:#fff8ec;box-shadow:0 0 0 2px rgba(227,154,43,.2)}
		.rfk-mode input{margin-top:3px;accent-color:#e39a2b}
		.rfk-mode small{display:block;color:#7a6f61;margin-top:3px;line-height:1.45}
		.rfk-steps{margin:8px 0 8px 20px;line-height:1.8}
		.rfk-log{width:100%;border-collapse:collapse;margin-top:8px}
		.rfk-log th{text-align:left;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a7e6c;padding:6px 8px;border-bottom:1px solid #eadfcd}
		.rfk-log td{padding:7px 8px;border-bottom:1px solid #f3ece0;vertical-align:top}.rfk-log td:first-child{white-space:nowrap}
		.rfk-args{font-family:monospace;font-size:12px;color:#5f5444;word-break:break-all}
		.rfk-ok{color:#2f8a2f;font-weight:700}.rfk-no{color:#c33;font-weight:700}
		@media (max-width:782px){.rfk-modes{grid-template-columns:1fr}}
	</style>
	<?php
}

// ---------------------------------------------------------------- admin helpers (files, backups, plugins)

/** Files Claude never reads or writes: the database password and other secrets. */
function rfaheya_mcp_secret( $rel ) {
	$base = strtolower( basename( $rel ) );
	return in_array( $base, array( 'wp-config.php', 'wp-config-sample.php', '.env', '.htpasswd', '.user.ini', 'php.ini', 'auth.json' ), true ) || 0 === strpos( ltrim( $rel, '/' ), 'wp-content/rfaheya-backups' );
}

/** A path inside the site (never outside it, never a secret file). */
function rfaheya_mcp_path( $rel, $dir = false ) {
	$rel  = ltrim( str_replace( '\\', '/', (string) $rel ), '/' );
	$root = rtrim( str_replace( '\\', '/', realpath( ABSPATH ) ), '/' );
	if ( preg_match( '#(^|/)\.\.(/|$)#', $rel ) || false !== strpos( $rel, "\0" ) ) {
		throw new Exception( 'That path leaves the site.' );
	}
	$full = '' === $rel ? $root : $root . '/' . $rel;
	$real = realpath( $dir ? $full : dirname( $full ) );
	if ( $real && 0 !== strpos( str_replace( '\\', '/', $real ) . '/', $root . '/' ) ) {
		throw new Exception( 'That path leaves the site.' );
	}
	if ( ! $dir && rfaheya_mcp_secret( $rel ) ) {
		throw new Exception( 'That file holds secrets: it stays out of reach.' );
	}
	if ( $dir && ! is_dir( $full ) ) {
		throw new Exception( 'No such folder.' );
	}
	return $full;
}

function rfaheya_mcp_rel( $full ) {
	return ltrim( substr( str_replace( '\\', '/', $full ), strlen( rtrim( str_replace( '\\', '/', realpath( ABSPATH ) ), '/' ) ) ), '/' );
}

/** The backups folder (closed to the web). */
function rfaheya_mcp_backup_dir() {
	$dir = WP_CONTENT_DIR . '/rfaheya-backups';
	if ( ! is_dir( $dir ) ) {
		wp_mkdir_p( $dir );
	}
	if ( ! is_file( $dir . '/.htaccess' ) ) {
		file_put_contents( $dir . '/.htaccess', "Require all denied\nDeny from all\n" );
		file_put_contents( $dir . '/index.php', "<?php // Silence.\n" );
	}
	return $dir;
}

/** Copies files before a change; returns the backup id. */
function rfaheya_mcp_backup( $files, $what ) {
	$id  = gmdate( 'Ymd-His' ) . '-' . strtolower( wp_generate_password( 4, false ) );
	$dir = rfaheya_mcp_backup_dir() . '/' . $id;
	wp_mkdir_p( $dir );
	$map = array();
	foreach ( $files as $n => $file ) {
		$rel         = rfaheya_mcp_rel( $file );
		$map[ $rel ] = array( 'existed' => is_file( $file ), 'copy' => 'f' . $n );
		if ( is_file( $file ) ) {
			copy( $file, $dir . '/f' . $n );
		}
	}
	file_put_contents( $dir . '/files.json', wp_json_encode( $map ) );
	$list = (array) get_option( 'rfaheya_mcp_backups', array() );
	array_unshift( $list, array( 'id' => $id, 'what' => $what, 'when' => wp_date( 'Y-m-d H:i' ) ) );
	update_option( 'rfaheya_mcp_backups', array_slice( $list, 0, 200 ), false );
	return $id;
}

/** Installs a plugin zip (a file or a download link), replacing the installed copy. */
function rfaheya_mcp_install_plugin( $package, $activate ) {
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/misc.php';
	require_once ABSPATH . 'wp-admin/includes/plugin.php';
	require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
	if ( ! WP_Filesystem() ) {
		throw new Exception( 'WordPress can\'t write files on this server (filesystem method).' );
	}
	$skin     = new WP_Ajax_Upgrader_Skin();
	$upgrader = new Plugin_Upgrader( $skin );
	$ok       = $upgrader->install( $package, array( 'overwrite_package' => true ) );
	if ( is_wp_error( $ok ) ) {
		return $ok;
	}
	if ( ! $ok ) {
		$errors = $skin->get_errors();
		throw new Exception( 'Install failed: ' . ( is_wp_error( $errors ) && $errors->has_errors() ? $errors->get_error_message() : implode( ' ', $skin->get_error_messages() ) ) );
	}
	$file = $upgrader->plugin_info();
	if ( $activate && $file && ! is_plugin_active( $file ) ) {
		$r = activate_plugin( $file );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
	}
	delete_transient( 'rfaheya_bootstrap' );
	rfaheya_purge_page_cache();
	$data = $file ? get_plugin_data( WP_PLUGIN_DIR . '/' . $file, false, false ) : array();
	return array( 'installed' => $file, 'name' => $data['Name'] ?? '', 'version' => $data['Version'] ?? '', 'active' => $file ? is_plugin_active( $file ) : false );
}
