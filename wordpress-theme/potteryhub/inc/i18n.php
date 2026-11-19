<?php
/**
 * Built-in English / Arabic switch.
 *
 * The Arabic site lives under /ar/ (example.com/ar/shop/). The language comes
 * from the URL only, so every page has one fixed language — safe for page
 * caching and for search engines (hreflang tags are printed in the head).
 * Theme strings come from languages/ar.mo; WooCommerce strings need the Arabic
 * language pack, which Appearance → Pottery Hub can install. Product, category,
 * page and post texts use the "Arabic" fields on their edit screens.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

/** Path of the site root ("/" or "/sub/"). */
function ph_home_path() {
	$p = wp_parse_url( get_option( 'home' ), PHP_URL_PATH );
	return trailingslashit( $p ? $p : '/' );
}

/** Current front-end language: 'ar' or 'en'. Decided once, from the request URL. */
function ph_lang() {
	static $lang = null;
	if ( null !== $lang ) {
		return $lang;
	}
	$uri  = isset( $_SERVER['PH_ORIG_URI'] ) ? $_SERVER['PH_ORIG_URI'] : ( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '/' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	$path = (string) wp_parse_url( $uri, PHP_URL_PATH );
	$base = ph_home_path();
	$lang = ( 0 === strpos( $path, $base . 'ar/' ) || rtrim( $base, '/' ) . '/ar' === $path ) ? 'ar' : 'en';
	return $lang;
}
ph_lang();

/** True when the visitor-facing site should be Arabic (never inside wp-admin). */
function ph_is_ar() {
	if ( is_admin() && ! wp_doing_ajax() ) {
		return false;
	}
	return 'ar' === ph_lang();
}

/** Turn any front-end URL into its English or Arabic version. */
function ph_lang_url( $url, $lang ) {
	$home = untrailingslashit( get_option( 'home' ) );
	if ( 0 !== strpos( $url, $home ) ) {
		// Relative URLs ("/shop/").
		$home = untrailingslashit( ph_home_path() );
		if ( '/' !== substr( $url, 0, 1 ) || '//' === substr( $url, 0, 2 ) || ( '' !== $home && 0 !== strpos( $url, $home ) ) ) {
			return $url;
		}
	}
	$rest = substr( $url, strlen( $home ) );
	$rest = preg_replace( '#^/ar(?=/|$|\?|\#)#', '', $rest );
	if ( 'ar' === $lang ) {
		$rest = '/ar' . ( '' === $rest ? '/' : $rest );
	}
	return $home . ( '' === $rest ? '/' : $rest );
}

/** Current URL (as the visitor sees it). */
function ph_current_url() {
	$scheme = is_ssl() ? 'https://' : 'http://';
	$host   = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';
	$uri    = isset( $_SERVER['PH_ORIG_URI'] ) ? $_SERVER['PH_ORIG_URI'] : ( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '/' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	return remove_query_arg( array( 'lang', 'add-to-cart', 'ph_buy_now', 'ph_sub', 'ph_sent' ), $scheme . $host . esc_url_raw( $uri ) );
}

/** URL of the current page in the other language. */
function ph_switch_url() {
	return ph_lang_url( ph_current_url(), ph_is_ar() ? 'en' : 'ar' );
}

/** Let WordPress route /ar/... like the English URL, then put the real URL back. */
add_filter(
	'do_parse_request',
	function ( $do ) {
		if ( 'ar' === ph_lang() && isset( $_SERVER['REQUEST_URI'] ) ) {
			$_SERVER['PH_ORIG_URI'] = $_SERVER['REQUEST_URI']; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			$base                   = ph_home_path();
			$_SERVER['REQUEST_URI'] = preg_replace( '#^' . preg_quote( $base, '#' ) . 'ar(/|$|(?=\?))#', $base, $_SERVER['REQUEST_URI'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		}
		return $do;
	},
	1
);
add_action(
	'parse_request',
	function () {
		if ( isset( $_SERVER['PH_ORIG_URI'] ) ) {
			$_SERVER['REQUEST_URI'] = $_SERVER['PH_ORIG_URI']; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		}
	},
	999
);

/** Every link on an Arabic page stays Arabic. */
add_filter(
	'home_url',
	function ( $url, $path ) {
		if ( ! ph_is_ar() || 0 === strpos( ltrim( (string) $path, '/' ), rest_get_url_prefix() ) ) {
			return $url;
		}
		return ph_lang_url( $url, 'ar' );
	},
	10,
	2
);

/** Old ?lang=ar / ?lang=en links → the right URL. */
add_action(
	'template_redirect',
	function () {
		if ( ! isset( $_GET['lang'] ) || wp_doing_ajax() ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		$want = 'ar' === sanitize_key( wp_unslash( $_GET['lang'] ) ) ? 'ar' : 'en'; // phpcs:ignore WordPress.Security.NonceVerification
		wp_safe_redirect( ph_lang_url( ph_current_url(), $want ), 301 );
		exit;
	},
	1
);

/** hreflang alternates. */
add_action(
	'wp_head',
	function () {
		if ( is_404() || is_search() ) {
			return;
		}
		$u = ph_current_url();
		echo '<link rel="alternate" hreflang="en" href="' . esc_url( ph_lang_url( $u, 'en' ) ) . '">' . "\n";
		echo '<link rel="alternate" hreflang="ar" href="' . esc_url( ph_lang_url( $u, 'ar' ) ) . '">' . "\n";
		echo '<link rel="alternate" hreflang="x-default" href="' . esc_url( ph_lang_url( $u, 'en' ) ) . '">' . "\n";
	},
	2
);

/** Switch WordPress to Arabic for the front end. */
add_action(
	'after_setup_theme',
	function () {
		if ( ! ph_is_ar() ) {
			load_theme_textdomain( 'potteryhub', PH_DIR . '/languages' );
			return;
		}
		$switched = false;
		if ( 'ar' !== determine_locale() && in_array( 'ar', get_available_languages(), true ) ) {
			$switched = switch_to_locale( 'ar' );
		}
		load_textdomain( 'potteryhub', PH_DIR . '/languages/ar.mo' );
		if ( ! $switched && isset( $GLOBALS['wp_locale'] ) ) {
			// Arabic language pack not installed yet: keep theme strings Arabic and the layout RTL.
			$GLOBALS['wp_locale']->text_direction = 'rtl';
			add_filter( 'language_attributes', fn( $a ) => preg_replace( '/lang="[^"]*"/', 'lang="ar"', $a ) );
		}
	},
	1
);

add_filter(
	'body_class',
	function ( $c ) {
		$c[] = ph_is_ar() ? 'ph-ar' : 'ph-en';
		return $c;
	}
);

/* ---------------------------------------------------------------------------
 * Arabic product & category names
 * ------------------------------------------------------------------------- */

/** Arabic product field on the edit screen. */
add_action(
	'woocommerce_product_options_general_product_data',
	function () {
		echo '<div class="options_group">';
		woocommerce_wp_text_input(
			array(
				'id'    => '_ph_name_ar',
				'label' => __( 'Arabic name', 'potteryhub' ),
				'style' => 'direction:rtl',
			)
		);
		woocommerce_wp_textarea_input(
			array(
				'id'    => '_ph_desc_ar',
				'label' => __( 'Arabic description', 'potteryhub' ),
				'style' => 'direction:rtl;min-height:90px',
			)
		);
		echo '</div>';
	}
);
add_action(
	'woocommerce_admin_process_product_object',
	function ( $product ) {
		// phpcs:disable WordPress.Security.NonceVerification -- WooCommerce verifies the product save nonce.
		if ( isset( $_POST['_ph_name_ar'] ) ) {
			$product->update_meta_data( '_ph_name_ar', sanitize_text_field( wp_unslash( $_POST['_ph_name_ar'] ) ) );
		}
		if ( isset( $_POST['_ph_desc_ar'] ) ) {
			$product->update_meta_data( '_ph_desc_ar', sanitize_textarea_field( wp_unslash( $_POST['_ph_desc_ar'] ) ) );
		}
		// phpcs:enable
	}
);

/** Arabic category field. */
add_action(
	'product_cat_edit_form_fields',
	function ( $term ) {
		$v = get_term_meta( $term->term_id, 'ph_name_ar', true );
		echo '<tr class="form-field"><th scope="row"><label for="ph_name_ar">' . esc_html__( 'Arabic name', 'potteryhub' ) . '</label></th><td><input type="text" dir="rtl" name="ph_name_ar" id="ph_name_ar" value="' . esc_attr( $v ) . '"></td></tr>';
	}
);
add_action(
	'product_cat_add_form_fields',
	function () {
		echo '<div class="form-field"><label for="ph_name_ar">' . esc_html__( 'Arabic name', 'potteryhub' ) . '</label><input type="text" dir="rtl" name="ph_name_ar" id="ph_name_ar"></div>';
	}
);
foreach ( array( 'edited_product_cat', 'created_product_cat' ) as $ph_hook ) {
	add_action(
		$ph_hook,
		function ( $term_id ) {
			// phpcs:ignore WordPress.Security.NonceVerification -- core verifies the term form nonce.
			if ( isset( $_POST['ph_name_ar'] ) && current_user_can( 'manage_product_terms' ) ) {
				update_term_meta( $term_id, 'ph_name_ar', sanitize_text_field( wp_unslash( $_POST['ph_name_ar'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification
			}
		}
	);
}

/** Front-end filters that show the Arabic names. */
add_action(
	'init',
	function () {
		if ( ! ph_is_ar() ) {
			return;
		}
		$name = function ( $value, $product ) {
			$id = $product->is_type( 'variation' ) ? $product->get_parent_id() : $product->get_id();
			$ar = get_post_meta( $id, '_ph_name_ar', true );
			return $ar ? $ar : $value;
		};
		$desc = function ( $value, $product ) {
			$ar = get_post_meta( $product->get_id(), '_ph_desc_ar', true );
			return $ar ? $ar : $value;
		};
		add_filter( 'woocommerce_product_get_name', $name, 10, 2 );
		add_filter( 'woocommerce_product_variation_get_name', $name, 10, 2 );
		add_filter( 'woocommerce_product_get_short_description', $desc, 10, 2 );
		add_filter( 'woocommerce_product_get_description', $desc, 10, 2 );
		add_filter(
			'the_title',
			function ( $title, $id = 0 ) {
				if ( $id && 'product' === get_post_type( $id ) ) {
					$ar = get_post_meta( $id, '_ph_name_ar', true );
					return $ar ? $ar : $title;
				}
				return $title;
			},
			10,
			2
		);
		$term = function ( $t ) {
			if ( $t instanceof WP_Term && 'product_cat' === $t->taxonomy ) {
				$ar = get_term_meta( $t->term_id, 'ph_name_ar', true );
				if ( $ar ) {
					$t->name = $ar;
				}
			}
			return $t;
		};
		add_filter( 'get_term', $term );
		add_filter(
			'get_terms',
			function ( $terms ) use ( $term ) {
				return is_array( $terms ) ? array_map( $term, $terms ) : $terms;
			}
		);
		add_filter(
			'get_the_terms',
			function ( $terms ) use ( $term ) {
				return is_array( $terms ) ? array_map( $term, $terms ) : $terms;
			}
		);
		// WooCommerce page titles (Shop, Cart, Checkout, My account) in Arabic.
		$wc_titles = function ( $title, $id = 0 ) {
			if ( ! function_exists( 'wc_get_page_id' ) || ! $id ) {
				return $title;
			}
			$map = array(
				'shop'      => __( 'Shop', 'potteryhub' ),
				'cart'      => __( 'Cart', 'potteryhub' ),
				'checkout'  => __( 'Checkout', 'potteryhub' ),
				'myaccount' => __( 'My account', 'potteryhub' ),
			);
			foreach ( $map as $page => $t ) {
				if ( (int) $id === wc_get_page_id( $page ) ) {
					return $t;
				}
			}
			return $title;
		};
		add_filter( 'the_title', $wc_titles, 20, 2 );
		add_filter( 'woocommerce_page_title', fn( $t ) => is_shop() ? __( 'Shop', 'potteryhub' ) : $t );
		add_filter( 'woocommerce_currency_symbol', fn( $s, $c ) => 'EGP' === $c ? 'ج.م' : $s, 10, 2 );
		add_filter( 'woocommerce_price_format', fn() => '%2$s&nbsp;%1$s' );
	},
	5
);

/**
 * Pick a theme text by language. English comes from the Customizer (or the
 * default); Arabic comes from the "(Arabic)" Customizer field, or the
 * translated default.
 */
function ph_text( $key, $default ) {
	if ( ph_is_ar() ) {
		$ar = get_theme_mod( $key . '_ar', '' );
		return '' !== $ar ? $ar : __( $default, 'potteryhub' ); // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
	}
	return get_theme_mod( $key, $default );
}
