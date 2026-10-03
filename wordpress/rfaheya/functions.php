<?php
/**
 * Rfaheya Storefront theme.
 *
 * Loads the React storefront (built into ./dist by `npm run build:wp`) and
 * hands it the WooCommerce Store API location plus a nonce. Contact details
 * and social links are editable in Appearance → Customize → Rfaheya Store.
 */
defined( 'ABSPATH' ) || exit;

add_action(
	'after_setup_theme',
	function () {
		add_theme_support( 'title-tag' );
		add_theme_support( 'woocommerce' );
		add_theme_support( 'html5', array( 'script', 'style' ) );
	}
);

/** Pages rendered by WooCommerce itself rather than the React app. */
function rfaheya_is_classic_page() {
	return function_exists( 'is_account_page' ) && is_account_page();
}

/** Entry JS/CSS files from dist/.vite/manifest.json. */
function rfaheya_assets() {
	static $assets = null;
	if ( null !== $assets ) {
		return $assets;
	}
	$assets = array( 'js' => array(), 'css' => array() );
	$file   = get_template_directory() . '/dist/.vite/manifest.json';
	if ( ! is_readable( $file ) ) {
		return $assets;
	}
	$manifest = json_decode( (string) file_get_contents( $file ), true );
	if ( ! is_array( $manifest ) ) {
		return $assets;
	}
	foreach ( $manifest as $chunk ) {
		if ( empty( $chunk['isEntry'] ) || empty( $chunk['file'] ) ) {
			continue;
		}
		$assets['js'][] = $chunk['file'];
		foreach ( isset( $chunk['css'] ) ? (array) $chunk['css'] : array() as $css ) {
			$assets['css'][] = $css;
		}
	}
	return $assets;
}

/** Store settings editable in the Customizer. */
function rfaheya_settings() {
	return array(
		'contact' => array(
			'email'    => array( 'Contact email', 'hello@rfaheya.com' ),
			'phone'    => array( 'Phone', '+20 100 000 0000' ),
			'whatsapp' => array( 'WhatsApp number (international, digits only, e.g. 2010…)', '201000000000' ),
			'hours'    => array( 'Opening hours', 'Sat – Thu · 10 AM – 8 PM' ),
			'location' => array( 'Location', 'Cairo, Egypt' ),
			'instapay' => array( 'InstaPay address customers transfer to', 'rfaheya@instapay' ),
		),
		'social'  => array(
			'instagram' => array( 'Instagram URL', 'https://www.instagram.com/' ),
			'tiktok'    => array( 'TikTok URL', 'https://www.tiktok.com/' ),
			'youtube'   => array( 'YouTube URL', 'https://www.youtube.com/' ),
			'facebook'  => array( 'Facebook URL', 'https://www.facebook.com/' ),
		),
	);
}

add_action(
	'customize_register',
	function ( $wp_customize ) {
		$wp_customize->add_section( 'rfaheya_store', array( 'title' => 'Rfaheya Store', 'priority' => 30 ) );
		foreach ( rfaheya_settings() as $group => $fields ) {
			foreach ( $fields as $key => $field ) {
				$id = "rfaheya_{$group}_{$key}";
				$wp_customize->add_setting(
					$id,
					array(
						'default'           => $field[1],
						'sanitize_callback' => 'social' === $group ? 'esc_url_raw' : 'sanitize_text_field',
					)
				);
				$wp_customize->add_control( $id, array( 'label' => $field[0], 'section' => 'rfaheya_store', 'type' => 'text' ) );
			}
		}
	}
);

function rfaheya_config() {
	$config = array(
		'storeApi'     => esc_url_raw( rest_url( 'wc/store/v1/' ) ),
		'nonce'        => wp_create_nonce( 'wc_store_api' ),
		'siteUrl'      => home_url( '/' ),
		'myAccountUrl' => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ),
		'currency'     => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'EGP',
	);
	foreach ( rfaheya_settings() as $group => $fields ) {
		foreach ( $fields as $key => $field ) {
			$config[ $group ][ $key ] = (string) get_theme_mod( "rfaheya_{$group}_{$key}", $field[1] );
		}
	}
	return $config;
}

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( rfaheya_is_classic_page() ) {
			wp_enqueue_style( 'rfaheya-account', get_template_directory_uri() . '/templates/account.css', array(), '1.0.0' );
			return;
		}
		$base   = get_template_directory_uri() . '/dist/';
		$assets = rfaheya_assets();
		foreach ( $assets['css'] as $i => $css ) {
			wp_enqueue_style( "rfaheya-$i", $base . $css, array(), null );
		}
		foreach ( $assets['js'] as $i => $js ) {
			wp_enqueue_script( "rfaheya-app-$i", $base . $js, array(), null, true );
		}
		if ( ! empty( $assets['js'] ) ) {
			wp_add_inline_script( 'rfaheya-app-0', 'window.__RFAHEYA__ = ' . wp_json_encode( rfaheya_config() ) . ';', 'before' );
		}
	},
	20
);

/** The storefront is an ES module. */
add_filter(
	'script_loader_tag',
	function ( $tag, $handle ) {
		if ( 0 === strpos( $handle, 'rfaheya-app' ) ) {
			$tag = preg_replace( '/<script (?=[^>]*\bsrc=)/', '<script type="module" ', $tag, 1 );
		}
		return $tag;
	},
	10,
	2
);

/** The React app brings its own styles: drop block/WooCommerce CSS on its pages. */
add_action(
	'wp_enqueue_scripts',
	function () {
		if ( rfaheya_is_classic_page() ) {
			return;
		}
		$handles = array( 'wp-block-library', 'wp-block-library-theme', 'classic-theme-styles', 'global-styles', 'woocommerce-general', 'woocommerce-layout', 'woocommerce-smallscreen', 'wc-blocks-style', 'wc-blocks-vendors-style', 'brands-styles' );
		foreach ( $handles as $handle ) {
			wp_dequeue_style( $handle );
		}
	},
	100
);

remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

add_action(
	'wp_head',
	function () {
		echo '<link rel="icon" type="image/svg+xml" href="' . esc_url( get_template_directory_uri() . '/favicon.svg' ) . '">' . "\n";
	}
);

/**
 * Storefront routes such as /finder or /collections/ledger aren't WordPress
 * pages: serve the app with 200 and let it route (it has its own 404 page).
 */
add_action(
	'template_redirect',
	function () {
		global $wp_query;
		if ( is_404() ) {
			$wp_query->is_404 = false;
			status_header( 200 );
		}
	},
	0
);

/** The app shows its own empty-cart state on /checkout. */
add_filter( 'woocommerce_checkout_redirect_empty_cart', '__return_false' );
add_filter( 'woocommerce_checkout_update_order_review_expired', '__return_false' );

/** Egypt doesn't use postcodes in the storefront checkout. */
add_filter(
	'woocommerce_get_country_locale',
	function ( $locale ) {
		$locale['EG']['postcode'] = array( 'required' => false, 'hidden' => true );
		return $locale;
	}
);

/** Warn in the admin if the theme was uploaded without its build. */
add_action(
	'admin_notices',
	function () {
		if ( empty( rfaheya_assets()['js'] ) ) {
			echo '<div class="notice notice-error"><p><strong>Rfaheya Storefront:</strong> the storefront build (dist/) is missing from the theme folder. Upload the complete rfaheya-theme.zip.</p></div>';
		}
		if ( ! class_exists( 'WooCommerce' ) ) {
			echo '<div class="notice notice-warning"><p><strong>Rfaheya Storefront:</strong> please install and activate WooCommerce.</p></div>';
		}
	}
);
