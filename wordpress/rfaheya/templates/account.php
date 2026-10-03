<?php
/**
 * WooCommerce My Account (login, registration, orders, addresses) in a
 * minimal shell that matches the storefront.
 */
defined( 'ABSPATH' ) || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'rfaheya-account' ); ?>>
<?php wp_body_open(); ?>
<header class="rf-bar">
	<a class="rf-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
		<img src="<?php echo esc_url( get_template_directory_uri() . '/logo.svg' ); ?>" alt="<?php bloginfo( 'name' ); ?>" width="140" height="44">
	</a>
	<nav class="rf-nav">
		<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>">Shop</a>
		<a href="<?php echo esc_url( home_url( '/finder' ) ); ?>">Rfaheya Finder</a>
		<a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">Contact</a>
	</nav>
</header>
<main class="rf-main">
	<?php
	while ( have_posts() ) {
		the_post();
		echo '<h1 class="rf-title">' . esc_html( get_the_title() ) . '</h1>';
		the_content();
	}
	?>
</main>
<?php wp_footer(); ?>
</body>
</html>
