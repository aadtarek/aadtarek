<?php
/**
 * Not found.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();
?>
<div class="std-page">
	<div class="pband"></div>
	<div class="pwrap nf">
		<div class="dempty">
			<div class="eb"><?php echo ph_icon( 'search', 30, 1.4 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
			<b><?php esc_html_e( 'This page wandered off', 'potteryhub' ); ?></b>
			<?php esc_html_e( 'The page you’re looking for doesn’t exist.', 'potteryhub' ); ?><br>
			<a class="btn" href="<?php echo esc_url( class_exists( 'WooCommerce' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>"><?php esc_html_e( 'Go to shop', 'potteryhub' ); ?></a>
		</div>
	</div>
</div>
<?php
get_footer();
