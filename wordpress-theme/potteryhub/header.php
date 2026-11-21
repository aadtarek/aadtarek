<?php
/**
 * Header.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
$ph_wc = class_exists( 'WooCommerce' );
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="cur"><span></span></div>

<?php if ( is_front_page() ) : ?>
<div id="pre" aria-hidden="true">
	<svg class="spark" style="left:14%;top:22%" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.6 6.5 3.5 9.4 10 10-6.5.6-9.4 3.5-10 10-.6-6.5-3.5-9.4-10-10 6.5-.6 9.4-3.5 10-10z"/></svg>
	<svg class="spark" style="right:18%;top:30%;animation-delay:-.8s" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.6 6.5 3.5 9.4 10 10-6.5.6-9.4 3.5-10 10-.6-6.5-3.5-9.4-10-10 6.5-.6 9.4-3.5 10-10z"/></svg>
	<svg class="spark" style="left:26%;bottom:24%;animation-delay:-1.6s" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.6 6.5 3.5 9.4 10 10-6.5.6-9.4 3.5-10 10-.6-6.5-3.5-9.4-10-10 6.5-.6 9.4-3.5 10-10z"/></svg>
	<div class="pre-in">
		<div class="pre-logo"><img class="g" src="<?php echo esc_url( ph_img( 'emblem-light.png' ) ); ?>" alt=""><img class="f" id="preF" src="<?php echo esc_url( ph_img( 'emblem-light.png' ) ); ?>" alt=""></div>
		<div class="pre-word" id="preWord"></div>
		<div class="pre-sub"><?php esc_html_e( 'House of Pottery', 'potteryhub' ); ?></div>
		<div class="pre-bar"><i id="preBar"></i></div>
	</div>
</div>
<?php endif; ?>
<div id="prog"></div>

<header class="nav pre" id="nav">
	<div class="l">
		<button class="ibtn mb" id="openMenuM" type="button" aria-label="<?php esc_attr_e( 'Menu', 'potteryhub' ); ?>"><?php echo ph_icon( 'menu', 20, 1.6 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
		<nav class="c" aria-label="<?php esc_attr_e( 'Main', 'potteryhub' ); ?>"><?php ph_menu( 'primary' ); ?></nav>
	</div>
	<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="brand" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"><img class="lt" src="<?php echo esc_url( ph_img( 'logo-light.png' ) ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"><img class="dk" src="<?php echo esc_url( ph_img( 'logo-dark.png' ) ); ?>" alt=""></a>
	<div class="r">
		<a class="lang ul" href="<?php echo esc_url( ph_switch_url() ); ?>" hreflang="<?php echo ph_is_ar() ? 'en' : 'ar'; ?>"><?php echo ph_is_ar() ? 'EN' : 'عربي'; ?></a>
		<button class="ibtn" id="openSearch" type="button" aria-label="<?php esc_attr_e( 'Search', 'potteryhub' ); ?>"><?php echo ph_icon( 'search', 19, 1.5 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
		<button class="ibtn hide-m" id="openWish" type="button" aria-label="<?php esc_attr_e( 'Wishlist', 'potteryhub' ); ?>"><?php echo ph_icon( 'heart', 19, 1.5 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><i class="cnt" id="wishN">0</i></button>
		<?php if ( $ph_wc ) : ?>
		<button class="ibtn" id="openCart" type="button" aria-label="<?php esc_attr_e( 'Cart', 'potteryhub' ); ?>"><?php echo ph_icon( 'bag', 19, 1.5 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo ph_cart_count(); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
		<?php endif; ?>
		<button class="pill" id="openMenu" type="button" aria-label="<?php esc_attr_e( 'Menu', 'potteryhub' ); ?>">
			<svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1h14M1 6h14M1 11h14"/></svg>
			<span class="av"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="9" r="4.2"/><path d="M4 21c1.2-4.2 4.4-6.2 8-6.2s6.8 2 8 6.2z"/></svg></span>
		</button>
	</div>
</header>
