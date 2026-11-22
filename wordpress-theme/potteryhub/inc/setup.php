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
				'search'   => home_url( '/' ),
				'ar'       => ph_is_ar() ? 1 : 0,
				'base'     => ph_home_path(),
				'dyn'      => ph_full_load_paths(),
				'i18n'     => array(
					'added'       => __( 'added to your cart', 'potteryhub' ),
					'noMatch'     => __( 'No pieces match', 'potteryhub' ),
					'seeAll'      => __( 'See all results', 'potteryhub' ),
					'error'       => __( 'Something went wrong — please try again.', 'potteryhub' ),
					'subscribed'  => __( 'You’re on the list', 'potteryhub' ),
					'sub_bad'     => __( 'Please enter a valid email', 'potteryhub' ),
					'sent'        => __( 'Thanks! We’ll get back to you soon.', 'potteryhub' ),
					'needContact' => __( 'Please add your name and a phone number or email.', 'potteryhub' ),
				),
			)
		);
	}
);

/**
 * Pages that always open with a normal page load (the rest open instantly, without one):
 * cart, checkout and account pages run WooCommerce's own scripts.
 */
function ph_full_load_paths() {
	$out = array();
	if ( ! class_exists( 'WooCommerce' ) ) {
		return $out;
	}
	$base = ph_home_path();
	foreach ( array( 'cart', 'checkout', 'myaccount' ) as $page ) {
		$id = wc_get_page_id( $page );
		if ( $id > 0 ) {
			$path = (string) wp_parse_url( get_permalink( $id ), PHP_URL_PATH );
			if ( 0 === strpos( $path, $base . 'ar/' ) ) {
				$path = $base . substr( $path, strlen( $base . 'ar/' ) );
			}
			if ( $path && $path !== $base ) {
				$out[] = $path;
			}
		}
	}
	return $out;
}

/* WordPress' own link pre-loading is not needed: main.js opens pages instantly. */
add_filter( 'wp_speculation_rules_configuration', '__return_null' );

/* Fonts don't hold up the first paint: connect early, load the stylesheet without blocking. */
add_filter(
	'style_loader_tag',
	function ( $tag, $handle ) {
		if ( 'ph-fonts' !== $handle || is_admin() ) {
			return $tag;
		}
		$pre = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
		$async = str_replace( array( "rel='stylesheet'", 'rel="stylesheet"' ), 'rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" data-no-optimize="1"', $tag );
		return $pre . $async . '<noscript>' . $tag . '</noscript>';
	},
	10,
	2
);

/** Admin bar offset for the fixed header. */
add_action(
	'wp_head',
	function () {
		echo '<link rel="icon" href="' . esc_url( ph_img( 'favicon.png' ) ) . '">';
		if ( is_front_page() ) { // the first hero photo is the largest thing on the page: fetch it first
			echo '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( get_theme_mod( 'ph_hero1_img', ph_img( 'hero-1.jpg' ) ) ) . '">';
		}
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
