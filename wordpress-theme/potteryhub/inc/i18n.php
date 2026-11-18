<?php
/**
 * Built-in English / Arabic switch.
 *
 * Visitors switch with ?lang=ar or ?lang=en (stored in a cookie). The front end
 * then switches WordPress to Arabic (RTL). Theme strings come from
 * languages/ar.mo; WooCommerce strings need the Arabic language pack, which
 * Appearance → Pottery Hub can install. Product and category names use the
 * "Arabic name" fields added to the product / category edit screens.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

/** Current front-end language: 'ar' or 'en'. */
function ph_lang() {
	static $lang = null;
	if ( null !== $lang ) {
		return $lang;
	}
	$lang = 'en';
	if ( isset( $_GET['lang'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		$lang = 'ar' === sanitize_key( wp_unslash( $_GET['lang'] ) ) ? 'ar' : 'en'; // phpcs:ignore WordPress.Security.NonceVerification
	} elseif ( isset( $_COOKIE['ph_lang'] ) ) {
		$lang = 'ar' === sanitize_key( wp_unslash( $_COOKIE['ph_lang'] ) ) ? 'ar' : 'en';
	}
	return $lang;
}

/** True when the visitor-facing site should be Arabic (never inside wp-admin). */
function ph_is_ar() {
	if ( is_admin() && ! wp_doing_ajax() ) {
		return false;
	}
	return 'ar' === ph_lang();
}

/** URL of the current page in the other language. */
function ph_switch_url() {
	$scheme = is_ssl() ? 'https://' : 'http://';
	$host   = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';
	$uri    = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
	$url    = remove_query_arg( array( 'lang', 'add-to-cart', 'ph_buy_now' ), $scheme . $host . $uri );
	return add_query_arg( 'lang', ph_is_ar() ? 'en' : 'ar', $url );
}

/** Remember the choice. */
add_action(
	'init',
	function () {
		if ( isset( $_GET['lang'] ) && ! headers_sent() ) { // phpcs:ignore WordPress.Security.NonceVerification
			setcookie( 'ph_lang', ph_lang(), time() + YEAR_IN_SECONDS, COOKIEPATH ? COOKIEPATH : '/', COOKIE_DOMAIN, is_ssl(), false );
		}
	},
	0
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
