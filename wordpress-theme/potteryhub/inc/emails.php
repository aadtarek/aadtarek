<?php
/**
 * WooCommerce emails in the shop's colours and fonts, with the logo on top.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

/** Apply the brand to WooCommerce email settings. $force overwrites custom choices. */
function ph_brand_emails( $force = false ) {
	$set = array(
		'woocommerce_email_base_color'       => '#ba4a2f',
		'woocommerce_email_background_color' => '#f5efe6',
		'woocommerce_email_body_background_color' => '#fffdf9',
		'woocommerce_email_text_color'       => '#2f3b33',
		'woocommerce_email_header_image'     => ph_img( 'logo-dark.png' ),
		'woocommerce_email_footer_text_color' => '#6b625b',
	);
	$wc_defaults = array( '', '#7f54b3', '#720eec', '#f7f7f7', '#ffffff', '#3c3c3c', '#515151', '#3c3c3c' );
	foreach ( $set as $k => $v ) {
		$cur = (string) get_option( $k, '' );
		if ( $force || in_array( strtolower( $cur ), $wc_defaults, true ) ) {
			update_option( $k, $v );
		}
	}
}

add_action(
	'after_switch_theme',
	function () {
		if ( class_exists( 'WooCommerce' ) ) {
			ph_brand_emails();
			ph_enable_order_emails();
		}
	}
);

/** Fonts & rounded corners (email clients that support them). */
add_filter(
	'woocommerce_email_styles',
	function ( $css ) {
		return $css . '
		#wrapper, #template_container, #body_content, #body_content_inner, td, p, h2, h3 { font-family: "DM Sans", "Segoe UI", Tahoma, Arial, sans-serif !important; }
		#template_header h1, h1 { font-family: Georgia, "Times New Roman", serif !important; font-weight: 400 !important; letter-spacing: -.01em; }
		#template_container { border-radius: 18px !important; overflow: hidden; border: 1px solid #e7ddd0 !important; box-shadow: none !important; }
		#template_header { border-radius: 0 !important; }
		#template_header_image img { max-height: 70px; width: auto; }
		.td, table.td th, table.td td { border-color: #ece3d6 !important; }
		a { color: #ba4a2f; }
		';
	}
);
