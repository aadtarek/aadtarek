<?php
/**
 * Plugin Name: Rfaheya Store
 * Description: Settings for the Rfaheya storefront (contact details, social links) served at /wp-json/rfaheya/v1/settings, and no postcode for Egyptian addresses.
 * Version:     1.0.0
 *
 * Must-use plugin: upload this file to wp-content/mu-plugins/ (create the
 * folder if it doesn't exist). It runs automatically; there is nothing to activate.
 */

defined( 'ABSPATH' ) || exit;

const RFAHEYA_OPTION = 'rfaheya_store';

/** Settings fields: group => key => [label, default]. */
function rfaheya_fields() {
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

// -------------------------------------------------------------------- settings page

add_action(
	'admin_init',
	function () {
		register_setting(
			'rfaheya_store',
			RFAHEYA_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => function ( $input ) {
					$input = is_array( $input ) ? $input : array();
					$clean = array();
					foreach ( rfaheya_fields() as $group => $fields ) {
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
		add_options_page( 'Rfaheya Store', 'Rfaheya Store', 'manage_options', 'rfaheya-store', 'rfaheya_settings_page' );
	}
);

function rfaheya_settings_page() {
	$options = rfaheya_options();
	$name    = RFAHEYA_OPTION;
	?>
	<div class="wrap">
		<h1>Rfaheya Store</h1>
		<form method="post" action="options.php">
			<?php settings_fields( 'rfaheya_store' ); ?>
			<?php foreach ( rfaheya_fields() as $group => $fields ) : ?>
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
					$options = rfaheya_options();
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
