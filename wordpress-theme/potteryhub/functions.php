<?php
/**
 * Pottery Hub theme bootstrap.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

define( 'PH_VERSION', '1.4.2' );
define( 'PH_DIR', get_template_directory() );
define( 'PH_URI', get_template_directory_uri() );

require PH_DIR . '/inc/i18n.php';
require PH_DIR . '/inc/helpers.php';
require PH_DIR . '/inc/setup.php';
require PH_DIR . '/inc/customizer.php';
require PH_DIR . '/inc/newsletter.php';
require PH_DIR . '/inc/pages.php';
require PH_DIR . '/inc/seo.php';
require PH_DIR . '/inc/emails.php';
require PH_DIR . '/inc/mail.php';
require PH_DIR . '/inc/admin.php';

if ( class_exists( 'WooCommerce' ) ) {
	require PH_DIR . '/inc/woocommerce.php';
}
