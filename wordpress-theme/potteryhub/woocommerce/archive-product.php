<?php
/**
 * Shop, category and product search pages.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();

$ph_current = is_product_category() ? get_queried_object() : null;
$ph_title   = woocommerce_page_title( false );
if ( is_search() ) {
	/* translators: %s: search query */
	$ph_title = sprintf( __( 'Results for “%s”', 'potteryhub' ), get_search_query() );
}
$ph_desc  = $ph_current && $ph_current->description ? $ph_current->description : __( 'Every piece is handmade — small variations make it yours.', 'potteryhub' );
$ph_shop  = wc_get_page_permalink( 'shop' );
$ph_min   = isset( $_GET['min_price'] ) ? (int) $_GET['min_price'] : null; // phpcs:ignore WordPress.Security.NonceVerification
$ph_max   = isset( $_GET['max_price'] ) ? (int) $_GET['max_price'] : null; // phpcs:ignore WordPress.Security.NonceVerification
$ph_base  = preg_replace( '#/page/\d+/?(?=\?|$)#', '/', remove_query_arg( array( 'min_price', 'max_price', 'paged' ) ) ); // filters start again at page 1
$ph_prices = array(
	array( __( 'Any price', 'potteryhub' ), null, null ),
	/* translators: %s: price */
	array( sprintf( __( 'Under %s', 'potteryhub' ), wp_strip_all_tags( wc_price( 500, array( 'decimals' => 0 ) ) ) ), 0, 499 ),
	array( wp_strip_all_tags( wc_price( 500, array( 'decimals' => 0 ) ) ) . ' – ' . wp_strip_all_tags( wc_price( 1000, array( 'decimals' => 0 ) ) ), 500, 999 ),
	array( wp_strip_all_tags( wc_price( 1000, array( 'decimals' => 0 ) ) ) . ' – ' . wp_strip_all_tags( wc_price( 1500, array( 'decimals' => 0 ) ) ), 1000, 1499 ),
	/* translators: %s: price */
	array( sprintf( __( '%s & up', 'potteryhub' ), wp_strip_all_tags( wc_price( 1500, array( 'decimals' => 0 ) ) ) ), 1500, 999999 ),
);
?>
<div class="shop-page">
	<div class="pband"><?php echo ph_clay( 'clay-band' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
	<div class="pwrap">
		<?php woocommerce_breadcrumb(); ?>
		<div class="shop-h"><div><h1 class="serif"><?php echo esc_html( $ph_title ); ?></h1><p><?php echo esc_html( wp_strip_all_tags( $ph_desc ) ); ?></p></div></div>
		<?php woocommerce_output_all_notices(); ?>
		<div class="shop-l">
			<aside class="side" id="side" data-lenis-prevent>
				<form class="sbox" role="search" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get">
					<?php echo ph_icon( 'search', 17, 1.6 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					<input name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="<?php esc_attr_e( 'Search the shop', 'potteryhub' ); ?>" aria-label="<?php esc_attr_e( 'Search the shop', 'potteryhub' ); ?>">
					<input type="hidden" name="post_type" value="product">
				</form>
				<div><h6><?php esc_html_e( 'Category', 'potteryhub' ); ?></h6><div class="lst">
					<a class="<?php echo ! $ph_current && ! is_search() ? 'on' : ''; ?>" href="<?php echo esc_url( $ph_shop ); ?>"><?php esc_html_e( 'All ceramics', 'potteryhub' ); ?><small><?php echo (int) wp_count_posts( 'product' )->publish; ?></small></a>
					<?php foreach ( ph_categories() as $t ) : ?>
						<a class="<?php echo $ph_current && $ph_current->term_id === $t->term_id ? 'on' : ''; ?>" href="<?php echo esc_url( get_term_link( $t ) ); ?>"><?php echo esc_html( $t->name ); ?><small><?php echo (int) $t->count; ?></small></a>
					<?php endforeach; ?>
				</div></div>
				<div><h6><?php esc_html_e( 'Price', 'potteryhub' ); ?></h6><div class="lst">
					<?php foreach ( $ph_prices as $pr ) : ?>
						<?php
						$on  = ( null === $pr[1] && null === $ph_min ) || ( null !== $pr[1] && $ph_min === $pr[1] && $ph_max === $pr[2] );
						$url = null === $pr[1] ? $ph_base : add_query_arg( array( 'min_price' => $pr[1], 'max_price' => $pr[2] ), $ph_base );
						?>
						<a class="<?php echo $on ? 'on' : ''; ?>" href="<?php echo esc_url( $url ); ?>" rel="nofollow"><?php echo esc_html( $pr[0] ); ?></a>
					<?php endforeach; ?>
				</div></div>
				<button class="btn fbtn" type="button" id="sideDone" style="width:100%"><?php esc_html_e( 'Show results', 'potteryhub' ); ?></button>
			</aside>
			<div>
				<div class="tool">
					<div class="count"><?php woocommerce_result_count(); ?></div>
					<div style="display:flex;gap:8px">
						<button class="sel-wrap fbtn" type="button" id="openFilters"><?php echo ph_icon( 'filter', 15, 1.8 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php esc_html_e( 'Filters', 'potteryhub' ); ?></button>
						<?php ph_sort_menu(); ?>
					</div>
				</div>
				<?php if ( woocommerce_product_loop() ) : ?>
					<div class="grid shop-grid">
						<?php
						$ph_i = 0;
						while ( have_posts() ) {
							the_post();
							ph_card( wc_get_product( get_the_ID() ), $ph_i++ );
						}
						?>
					</div>
					<?php ph_pagination(); ?>
				<?php else : ?>
					<div class="grid shop-grid"><div class="empty"><b><?php esc_html_e( 'Nothing here yet', 'potteryhub' ); ?></b><?php esc_html_e( 'Try another category or clear your filters.', 'potteryhub' ); ?><br><a class="see" href="<?php echo esc_url( $ph_shop ); ?>"><?php esc_html_e( 'Clear filters', 'potteryhub' ); ?></a></div></div>
				<?php endif; ?>
			</div>
		</div>
	</div>
</div>
<?php
get_footer();
