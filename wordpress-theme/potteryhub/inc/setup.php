<?php
/**
 * Theme supports, menus and assets.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'after_setup_theme',
	function () {
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
		add_theme_support( 'custom-logo' );
		add_theme_support(
			'woocommerce',
			array(
				'thumbnail_image_width' => 600,
				'single_image_width'    => 1000,
				'product_grid'          => array(
					'default_columns' => 3,
					'default_rows'    => 4,
				),
			)
		);
		register_nav_menus(
			array(
				'primary' => __( 'Header menu', 'potteryhub' ),
				'footer'  => __( 'Footer help menu', 'potteryhub' ),
			)
		);
	}
);

/** Google Fonts URL (Arabic fonts only for Arabic visitors). */
function ph_fonts_url() {
	$fam = 'family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700';
	if ( ph_is_ar() ) {
		$fam .= '&family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700';
	}
	return 'https://fonts.googleapis.com/css2?' . $fam . '&display=swap';
}

add_action(
	'wp_enqueue_scripts',
	function () {
		wp_enqueue_style( 'ph-fonts', ph_fonts_url(), array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( 'ph-main', PH_URI . '/assets/css/main.css', array(), PH_VERSION );
		wp_enqueue_script( 'lenis', 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js', array(), '1.1.13', true );
		wp_enqueue_script( 'ph-main', PH_URI . '/assets/js/main.js', array( 'lenis' ), PH_VERSION, true );

		$wc = class_exists( 'WooCommerce' );
		wp_localize_script(
			'ph-main',
			'PH',
			array(
				'ajax'     => $wc ? WC_AJAX::get_endpoint( '%%endpoint%%' ) : '',
				'checkout' => $wc ? wc_get_checkout_url() : '',
				'shop'     => $wc ? wc_get_page_permalink( 'shop' ) : home_url( '/' ),
				'search'   => home_url( '/' ),
				'ar'       => ph_is_ar() ? 1 : 0,
				'front'    => is_front_page() ? 1 : 0,
				'i18n'     => array(
					'added'      => __( 'added to your cart', 'potteryhub' ),
					'viewCart'   => __( 'View cart', 'potteryhub' ),
					'saved'      => __( 'Saved to your wishlist', 'potteryhub' ),
					'unsaved'    => __( 'Removed from your wishlist', 'potteryhub' ),
					'moved'      => __( 'Moved to your cart', 'potteryhub' ),
					'noWish'     => __( 'No saved pieces', 'potteryhub' ),
					'noWishTxt'  => __( 'Tap the heart on any piece to keep it here.', 'potteryhub' ),
					'browse'     => __( 'Browse the shop', 'potteryhub' ),
					'moveToCart' => __( 'Add to cart', 'potteryhub' ),
					'remove'     => __( 'Remove', 'potteryhub' ),
					'noMatch'    => __( 'No pieces match', 'potteryhub' ),
					'seeAll'     => __( 'See all results', 'potteryhub' ),
					'error'      => __( 'Something went wrong — please try again.', 'potteryhub' ),
					'subscribed' => __( 'You’re on the list', 'potteryhub' ),
					'sub_bad'    => __( 'Please enter a valid email', 'potteryhub' ),
				),
			)
		);
	}
);

/** Admin bar offset for the fixed header. */
add_action(
	'wp_head',
	function () {
		echo '<link rel="icon" href="' . esc_url( ph_img( 'favicon.png' ) ) . '">';
		echo '<meta name="theme-color" content="#ba4a2f">';
	}
);

/** Header menu fallback when no menu is assigned. */
function ph_menu_fallback() {
	$home  = home_url( '/' );
	$items = array(
		array( class_exists( 'WooCommerce' ) ? wc_get_page_permalink( 'shop' ) : $home, __( 'Shop', 'potteryhub' ) ),
		array( ph_template_url( 'template-workshops.php' ) ? ph_template_url( 'template-workshops.php' ) : $home . '#classes', __( 'Workshops', 'potteryhub' ) ),
		array( ph_template_url( 'template-about.php' ) ? ph_template_url( 'template-about.php' ) : $home . '#about', __( 'About', 'potteryhub' ) ),
	);
	if ( ! ph_template_url( 'template-about.php' ) ) {
		array_splice( $items, 1, 0, array( array( $home . '#cats', __( 'Collections', 'potteryhub' ) ) ) );
	}
	if ( ph_journal_url() && wp_count_posts()->publish ) {
		$items[] = array( ph_journal_url(), __( 'Journal', 'potteryhub' ) );
	}
	if ( ph_template_url( 'template-contact.php' ) ) {
		$items[] = array( ph_template_url( 'template-contact.php' ), __( 'Contact', 'potteryhub' ) );
	}
	foreach ( $items as $it ) {
		echo '<a class="ul" href="' . esc_url( $it[0] ) . '">' . esc_html( $it[1] ) . '</a>';
	}
}

/** Menu links: plain anchors with the underline animation. */
function ph_menu( $location ) {
	if ( ! has_nav_menu( $location ) ) {
		if ( 'primary' === $location ) {
			ph_menu_fallback();
		}
		return;
	}
	$items = wp_get_nav_menu_items( get_nav_menu_locations()[ $location ] );
	foreach ( (array) $items as $it ) {
		if ( (int) $it->menu_item_parent ) {
			continue;
		}
		echo '<a class="ul" href="' . esc_url( $it->url ) . '">' . esc_html( $it->title ) . '</a>';
	}
}

/** Social links (Customizer). */
function ph_socials() {
	$out = '';
	$fb  = get_theme_mod( 'ph_facebook', 'https://www.facebook.com/profile.php?id=61595757980356' );
	$ig  = get_theme_mod( 'ph_instagram', '' );
	if ( $fb ) {
		$out .= '<a href="' . esc_url( $fb ) . '" target="_blank" rel="noopener" aria-label="Facebook">' . ph_icon( 'fb', 18, 1.5 ) . '</a>';
	}
	if ( $ig ) {
		$out .= '<a href="' . esc_url( $ig ) . '" target="_blank" rel="noopener" aria-label="Instagram">' . ph_icon( 'ig', 18, 1.5 ) . '</a>';
	}
	return $out;
}
