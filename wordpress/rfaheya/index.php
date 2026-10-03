<?php
/**
 * Every front-end page is the React storefront, except WooCommerce's
 * My Account area, which WooCommerce renders itself.
 */
defined( 'ABSPATH' ) || exit;

if ( rfaheya_is_classic_page() ) {
	get_template_part( 'templates/account' );
	return;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#2a2f1b">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'rfaheya-app' ); ?>>
<?php wp_body_open(); ?>
<div id="root"></div>
<noscript><p style="padding:2rem;font-family:sans-serif">Please enable JavaScript to shop at <?php bloginfo( 'name' ); ?>.</p></noscript>
<?php wp_footer(); ?>
</body>
</html>
