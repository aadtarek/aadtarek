<?php
/**
 * Plugin Name:       Rfaheya Headless
 * Description:       Connects the headless Rfaheya storefront (React) to this WooCommerce store: Store API CORS for cart tokens, store settings endpoint, front-end redirects and product images for the import.
 * Version:           1.0.0
 * Requires at least: 6.4
 * Requires PHP:      7.4
 * Author:            Rfaheya
 * Text Domain:       rfaheya-headless
 */

defined( 'ABSPATH' ) || exit;

const RFAHEYA_HEADLESS_OPTION = 'rfaheya_headless';

/** Settings fields: group => key => [label, default]. */
function rfaheya_headless_fields() {
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

function rfaheya_headless_options() {
	$saved = get_option( RFAHEYA_HEADLESS_OPTION, array() );
	$saved = is_array( $saved ) ? $saved : array();
	$out   = array( 'frontend_url' => isset( $saved['frontend_url'] ) ? (string) $saved['frontend_url'] : '' );
	foreach ( rfaheya_headless_fields() as $group => $fields ) {
		foreach ( $fields as $key => $field ) {
			$value                 = isset( $saved[ $group ][ $key ] ) ? (string) $saved[ $group ][ $key ] : '';
			$out[ $group ][ $key ] = '' !== $value ? $value : $field[1];
		}
	}
	return $out;
}

/** The storefront's address, e.g. https://rfaheya.com (no trailing slash), or '' if not set. */
function rfaheya_headless_frontend_url() {
	return untrailingslashit( rfaheya_headless_options()['frontend_url'] );
}

// -------------------------------------------------------------------- settings page

add_action(
	'admin_init',
	function () {
		register_setting(
			'rfaheya_headless',
			RFAHEYA_HEADLESS_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => function ( $input ) {
					$input = is_array( $input ) ? $input : array();
					$clean = array( 'frontend_url' => isset( $input['frontend_url'] ) ? esc_url_raw( trim( (string) $input['frontend_url'] ) ) : '' );
					foreach ( rfaheya_headless_fields() as $group => $fields ) {
						foreach ( $fields as $key => $field ) {
							$value                   = isset( $input[ $group ][ $key ] ) ? trim( (string) $input[ $group ][ $key ] ) : '';
							$clean[ $group ][ $key ] = 'social' === $group ? esc_url_raw( $value ) : sanitize_text_field( $value );
						}
					}
					return $clean;
				},
			)
		);
	}
);

add_action(
	'admin_menu',
	function () {
		add_options_page( 'Rfaheya Headless', 'Rfaheya Headless', 'manage_options', 'rfaheya-headless', 'rfaheya_headless_settings_page' );
	}
);

add_filter(
	'plugin_action_links_' . plugin_basename( __FILE__ ),
	function ( $links ) {
		array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=rfaheya-headless' ) ) . '">Settings</a>' );
		return $links;
	}
);

function rfaheya_headless_settings_page() {
	$options = rfaheya_headless_options();
	$name    = RFAHEYA_HEADLESS_OPTION;
	?>
	<div class="wrap">
		<h1>Rfaheya Headless</h1>
		<form method="post" action="options.php">
			<?php settings_fields( 'rfaheya_headless' ); ?>
			<h2>Storefront</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="rfaheya-frontend-url">Storefront URL</label></th>
					<td>
						<input id="rfaheya-frontend-url" class="regular-text code" type="url" name="<?php echo esc_attr( $name ); ?>[frontend_url]" value="<?php echo esc_attr( $options['frontend_url'] ); ?>" placeholder="https://rfaheya.com">
						<p class="description">Where the React storefront is deployed. Visitors opening this WordPress site's pages are sent there (wp-admin, My Account and payment pages stay here).</p>
					</td>
				</tr>
			</table>
			<?php foreach ( rfaheya_headless_fields() as $group => $fields ) : ?>
				<h2><?php echo 'contact' === $group ? 'Contact details' : 'Social links'; ?></h2>
				<table class="form-table" role="presentation">
					<?php foreach ( $fields as $key => $field ) : ?>
						<tr>
							<th scope="row"><label for="<?php echo esc_attr( "rfaheya-$group-$key" ); ?>"><?php echo esc_html( $field[0] ); ?></label></th>
							<td><input id="<?php echo esc_attr( "rfaheya-$group-$key" ); ?>" class="regular-text" type="<?php echo 'social' === $group ? 'url' : 'text'; ?>" name="<?php echo esc_attr( "{$name}[$group][$key]" ); ?>" value="<?php echo esc_attr( $options[ $group ][ $key ] ); ?>"></td>
						</tr>
					<?php endforeach; ?>
				</table>
			<?php endforeach; ?>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

// -------------------------------------------------------------------- REST

/** Public store settings for the storefront. */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'rfaheya/v1',
			'/settings',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => function () {
					$options = rfaheya_headless_options();
					return rest_ensure_response(
						array(
							'contact'      => $options['contact'],
							'social'       => $options['social'],
							'myAccountUrl' => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ),
							'currency'     => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'EGP',
						)
					);
				},
			)
		);
	}
);

/**
 * The storefront runs on another domain and keeps the cart session in
 * WooCommerce's Cart-Token header. Browsers only send/read custom headers
 * cross-origin when CORS allows them.
 */
add_filter(
	'rest_allowed_cors_headers',
	function ( $headers ) {
		return array_values( array_unique( array_merge( (array) $headers, array( 'Cart-Token', 'Nonce', 'Content-Type' ) ) ) );
	}
);
add_filter(
	'rest_exposed_cors_headers',
	function ( $headers ) {
		return array_values( array_unique( array_merge( (array) $headers, array( 'Cart-Token', 'Nonce' ) ) ) );
	}
);

// -------------------------------------------------------------------- WooCommerce

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

// -------------------------------------------------------------------- front-end redirects

/**
 * WordPress only serves wp-admin, the API, My Account and payment pages;
 * every other front-end URL goes to the same place on the storefront.
 */
add_action(
	'template_redirect',
	function () {
		$frontend = rfaheya_headless_frontend_url();
		if ( '' === $frontend || is_preview() || is_customize_preview() || is_feed() || is_robots() || is_favicon() ) {
			return;
		}
		if ( function_exists( 'is_account_page' ) && ( is_account_page() || is_checkout_pay_page() || is_wc_endpoint_url( 'order-pay' ) ) ) {
			return;
		}
		$target = null;
		if ( function_exists( 'is_order_received_page' ) && is_order_received_page() ) {
			global $wp;
			$target = '/checkout/order-received/' . absint( isset( $wp->query_vars['order-received'] ) ? $wp->query_vars['order-received'] : 0 ) . '/';
		} elseif ( function_exists( 'is_product' ) && is_product() ) {
			$target = '/product/' . get_post_field( 'post_name', get_queried_object_id() );
		} elseif ( function_exists( 'is_shop' ) && ( is_shop() || is_product_taxonomy() ) ) {
			$target = '/shop';
		} elseif ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() ) ) {
			$target = '/checkout';
		} else {
			$path   = (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$home   = (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH );
			$target = '/' . ltrim( substr( $path, strlen( rtrim( $home, '/' ) ) ), '/' );
		}
		// The storefront's own domain, so wp_safe_redirect must allow it.
		add_filter(
			'allowed_redirect_hosts',
			function ( $hosts ) use ( $frontend ) {
				$hosts[] = wp_parse_url( $frontend, PHP_URL_HOST );
				return $hosts;
			}
		);
		wp_safe_redirect( $frontend . $target, 302 );
		exit;
	},
	1
);

/** Links WooCommerce prints (emails, My Account "Browse products") point at the storefront. */
add_filter(
	'woocommerce_return_to_shop_redirect',
	function ( $url ) {
		$frontend = rfaheya_headless_frontend_url();
		return '' !== $frontend ? $frontend . '/shop' : $url;
	}
);

// -------------------------------------------------------------------- admin notices

add_action(
	'admin_notices',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		if ( ! class_exists( 'WooCommerce' ) ) {
			echo '<div class="notice notice-warning"><p><strong>Rfaheya Headless:</strong> please install and activate WooCommerce.</p></div>';
		}
		if ( '' === rfaheya_headless_frontend_url() ) {
			echo '<div class="notice notice-info"><p><strong>Rfaheya Headless:</strong> add your storefront address in <a href="' . esc_url( admin_url( 'options-general.php?page=rfaheya-headless' ) ) . '">Settings → Rfaheya Headless</a>.</p></div>';
		}
	}
);
