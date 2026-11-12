<?php
/**
 * Plugin Name: Techi Storefront (headless)
 * Description: Serves the Techi React storefront (public_html/techi-app.html) on the shop's own domain and lets it use WooCommerce through the Store API. WordPress keeps wp-admin, the REST API, My Account and the payment pages.
 * Version: 1.0.0
 * Author: Techi
 *
 * Must-use plugin: runs automatically from wp-content/mu-plugins, nothing to activate.
 * To switch the storefront off: add  define( 'TECHI_STOREFRONT_OFF', true );  to wp-config.php
 * (or delete this file). The old theme is back immediately.
 */

defined( 'ABSPATH' ) || exit;

define( 'TECHI_APP_FILE', ABSPATH . 'techi-app.html' );

/* ------------------------------------------------------------------ *
 * Which requests stay with WordPress
 * ------------------------------------------------------------------ */
function techi_is_wordpress_request( $path ) {
	if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
		return true;
	}
	// WordPress links by query string (?rest_route=, ?wc-ajax=, ?p=, previews …)
	foreach ( array( 'rest_route', 'wc-ajax', 'wc-api', 'preview', 'p', 'page_id', 'post_type', 's', 'customize_changeset_uuid', 'elementor-preview', 'add-to-cart' ) as $q ) {
		if ( isset( $_GET[ $q ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return true;
		}
	}
	$keep = array(
		'wp-admin', 'wp-login.php', 'wp-json', 'wp-content', 'wp-includes', 'wp-cron.php', 'xmlrpc.php',
		'my-account', 'checkout/order-pay', 'checkout/order-received', 'wc-api', 'wc-auth',
		'feed', 'wp-sitemap', 'sitemap', 'robots.txt', 'favicon.ico',
	);
	/** Add more WordPress paths (e.g. 'blog') with: add_filter( 'techi_wp_paths', fn( $p ) => array_merge( $p, array( 'blog' ) ) ); */
	$keep = apply_filters( 'techi_wp_paths', $keep );
	foreach ( $keep as $k ) {
		if ( $path === $k || 0 === strpos( $path, $k . '/' ) || 0 === strpos( $path, $k . '.' ) || ( 'sitemap' === $k && false !== strpos( $path, 'sitemap' ) ) ) {
			return true;
		}
	}
	return false;
}

/* ------------------------------------------------------------------ *
 * Serve the storefront
 * ------------------------------------------------------------------ */
add_action(
	'wp_loaded',
	function () {
		if ( ( defined( 'TECHI_STOREFRONT_OFF' ) && TECHI_STOREFRONT_OFF ) || ! file_exists( TECHI_APP_FILE ) ) {
			return;
		}
		if ( 'GET' !== $_SERVER['REQUEST_METHOD'] && 'HEAD' !== $_SERVER['REQUEST_METHOD'] ) {
			return;
		}
		$path = trim( (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH ), '/' );
		$home = trim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
		if ( '' !== $home && 0 === strpos( $path, $home ) ) {
			$path = trim( substr( $path, strlen( $home ) ), '/' );
		}
		$path = rawurldecode( $path );
		if ( techi_is_wordpress_request( $path ) ) {
			return;
		}

		// Old WooCommerce links keep working: /product/slug/ -> /product/123
		if ( preg_match( '#^product/([^/]+)$#', $path, $m ) && ! ctype_digit( $m[1] ) ) {
			$post = get_page_by_path( sanitize_title( $m[1] ), OBJECT, 'product' );
			wp_safe_redirect( home_url( $post ? '/product/' . $post->ID : '/shop' ), 301 );
			exit;
		}
		if ( preg_match( '#^(product-category|product-tag|shop/page)(/|$)#', $path ) ) {
			wp_safe_redirect( home_url( '/shop' ), 301 );
			exit;
		}
		if ( 'cart' === $path ) {
			wp_safe_redirect( home_url( '/checkout' ), 302 );
			exit;
		}

		$html = file_get_contents( TECHI_APP_FILE ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		if ( false === $html ) {
			return;
		}
		status_header( 200 );
		nocache_headers();
		header( 'Content-Type: text/html; charset=utf-8' );
		header( 'X-Content-Type-Options: nosniff' );
		header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		header( 'X-LiteSpeed-Cache-Control: no-cache' );
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput -- our own built file
		exit;
	},
	1
);

/* ------------------------------------------------------------------ *
 * Store API: never cached, orders tagged
 * ------------------------------------------------------------------ */
add_filter(
	'rest_post_dispatch',
	function ( $response, $server, $request ) {
		if ( 0 === strpos( $request->get_route(), '/wc/store' ) && $response instanceof WP_REST_Response ) {
			$response->header( 'Cache-Control', 'no-store, private' );
			$response->header( 'X-LiteSpeed-Cache-Control', 'no-cache' );
		}
		return $response;
	},
	10,
	3
);

add_action(
	'woocommerce_store_api_checkout_order_processed',
	function ( $order ) {
		$order->update_meta_data( '_techi_source', 'techi-storefront' );
		$order->save();
	}
);

/* Egypt: postcode is optional */
add_filter(
	'woocommerce_get_country_locale',
	function ( $locale ) {
		$locale['EG']['postcode'] = array( 'required' => false, 'hidden' => true );
		return $locale;
	}
);

/* Customers without an email get a placeholder address: never send mail to it */
add_filter(
	'pre_wp_mail',
	function ( $return, $atts ) {
		$to = isset( $atts['to'] ) ? implode( ',', (array) $atts['to'] ) : '';
		return false !== strpos( $to, '@guest.techi-eg.com' ) ? false : $return;
	},
	10,
	2
);

/* A small reminder in the admin that the storefront is on */
add_action(
	'admin_bar_menu',
	function ( $bar ) {
		if ( current_user_can( 'manage_options' ) && file_exists( TECHI_APP_FILE ) && ! ( defined( 'TECHI_STOREFRONT_OFF' ) && TECHI_STOREFRONT_OFF ) ) {
			$bar->add_node( array( 'id' => 'techi', 'title' => 'Techi storefront: ON', 'href' => home_url( '/' ) ) );
		}
	},
	100
);
