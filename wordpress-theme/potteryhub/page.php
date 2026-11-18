<?php
/**
 * Pages (cart, checkout, my account and any other page).
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();
$ph_wc_page = function_exists( 'is_woocommerce' ) && ( is_cart() || is_checkout() || is_account_page() );
?>
<div class="std-page<?php echo $ph_wc_page ? ' wc-page' : ''; ?>">
	<div class="pband"></div>
	<div class="pwrap">
		<?php
		while ( have_posts() ) :
			the_post();
			?>
			<?php if ( ! ( function_exists( 'is_order_received_page' ) && is_order_received_page() ) ) : ?>
				<h1 class="ptitle serif"><?php the_title(); ?></h1>
			<?php endif; ?>
			<div class="entry"><?php the_content(); ?></div>
		<?php endwhile; ?>
	</div>
</div>
<?php
get_footer();
