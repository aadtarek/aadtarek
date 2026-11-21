<?php
/**
 * Product page.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();

while ( have_posts() ) :
	the_post();
	global $product;
	$product = wc_get_product( get_the_ID() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
	if ( ! $product ) {
		continue;
	}
	$ph_off     = ph_discount( $product );
	$ph_gallery = $product->get_gallery_image_ids();
	$ph_main    = ph_product_img( $product, 'full' );
	$ph_related = wc_get_related_products( $product->get_id(), 7 );
	$ph_desc    = $product->get_short_description() ? $product->get_short_description() : $product->get_description();
	$ph_long    = $product->get_description();
	?>
	<div class="product-page" id="product-<?php the_ID(); ?>">
		<div class="pband"></div>
		<div class="pwrap">
			<div class="rv"><?php woocommerce_breadcrumb(); ?></div>
			<?php woocommerce_output_all_notices(); ?>
			<div class="dgrid">
				<div>
					<div class="main" id="main">
						<img id="mainImg" src="<?php echo esc_url( $ph_main ); ?>" alt="<?php echo esc_attr( $product->get_name() ); ?>" fetchpriority="high" decoding="async">
						<?php if ( $ph_off ) : ?><span class="badge">−<?php echo (int) $ph_off; ?>%</span><?php endif; ?>
					</div>
					<div class="minis rv">
						<?php if ( $ph_gallery ) : ?>
							<?php foreach ( array_merge( array( $product->get_image_id() ), $ph_gallery ) as $ph_g ) : ?>
								<button type="button" data-full="<?php echo esc_url( wp_get_attachment_image_url( $ph_g, 'full' ) ); ?>"><?php echo wp_get_attachment_image( $ph_g, 'woocommerce_thumbnail' ); ?></button>
							<?php endforeach; ?>
						<?php else : ?>
							<?php
							foreach ( array_slice( $ph_related, 0, 3 ) as $ph_n => $ph_rid ) :
								$ph_r = wc_get_product( $ph_rid );
								if ( ! $ph_r ) {
									continue;
								}
								$ph_more = count( $ph_related ) - 3;
								?>
								<a href="<?php echo esc_url( $ph_r->get_permalink() ); ?>" aria-label="<?php echo esc_attr( $ph_r->get_name() ); ?>"><img src="<?php echo esc_url( ph_product_img( $ph_r, 'woocommerce_thumbnail' ) ); ?>" alt="" loading="lazy">
									<?php if ( 2 === $ph_n && $ph_more > 0 ) : ?>
										<?php /* translators: %d: number of more products */ ?>
										<span class="more"><?php echo esc_html( sprintf( __( '+%d more', 'potteryhub' ), $ph_more ) ); ?></span>
									<?php endif; ?>
								</a>
							<?php endforeach; ?>
						<?php endif; ?>
					</div>
				</div>
				<div class="pinfo">
					<div class="dcat rv"><?php echo esc_html( ph_product_cat( $product ) ); ?></div>
					<h1 class="dname serif rv"><?php echo esc_html( $product->get_name() ); ?></h1>
					<?php if ( wc_review_ratings_enabled() && $product->get_review_count() ) : ?>
						<a class="drate rv" href="#ph-reviews"><?php echo ph_stars( $product->get_average_rating() ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span><?php echo esc_html( number_format_i18n( (float) $product->get_average_rating(), 1 ) ); ?> · <?php /* translators: %s: number of reviews */ echo esc_html( sprintf( _n( '%s review', '%s reviews', $product->get_review_count(), 'potteryhub' ), number_format_i18n( $product->get_review_count() ) ) ); ?></span></a>
					<?php endif; ?>
					<?php if ( $ph_desc ) : ?><div class="dabout rv"><?php echo wp_kses_post( wpautop( $ph_desc ) ); ?></div><?php endif; ?>
					<div class="book rv">
						<div class="pr"><?php echo $product->get_price_html(); // phpcs:ignore WordPress.Security.EscapeOutput ?>
							<?php if ( $ph_off ) : ?>
								<?php /* translators: %d: discount percent */ ?>
								<i><?php echo esc_html( sprintf( __( 'Save %d%%', 'potteryhub' ), $ph_off ) ); ?></i>
							<?php endif; ?>
						</div>
						<?php woocommerce_template_single_add_to_cart(); ?>
						<?php if ( ph_free_delivery() ) : ?><div class="ph-free"><i><?php echo ph_icon( 'truck', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><b><?php esc_html_e( 'Free delivery', 'potteryhub' ); ?></b> <?php esc_html_e( 'all over Egypt', 'potteryhub' ); ?></span></div><?php endif; ?>
					</div>
					<div class="acc rv">
						<?php if ( $ph_long && $ph_long !== $ph_desc ) : ?>
							<details open><summary><?php esc_html_e( 'Description', 'potteryhub' ); ?></summary><div class="accb"><?php echo wp_kses_post( wpautop( $ph_long ) ); ?></div></details>
						<?php endif; ?>
						<?php if ( $product->has_attributes() || $product->has_weight() || $product->has_dimensions() ) : ?>
							<details><summary><?php esc_html_e( 'Details', 'potteryhub' ); ?></summary><div class="accb"><?php wc_display_product_attributes( $product ); ?></div></details>
						<?php endif; ?>
						<details<?php echo $ph_long && $ph_long !== $ph_desc ? '' : ' open'; ?>><summary><?php esc_html_e( 'Care', 'potteryhub' ); ?></summary><p><?php echo esc_html( ph_mod( 'ph_care' ) ); ?></p></details>
						<details><summary><?php esc_html_e( 'Delivery', 'potteryhub' ); ?></summary><p><?php if ( ph_free_delivery() ) : ?><b><?php esc_html_e( 'Free delivery', 'potteryhub' ); ?></b> <?php esc_html_e( 'all over Egypt', 'potteryhub' ); ?> — <?php endif; ?><?php echo esc_html( ph_mod( 'ph_delivery' ) ); ?></p></details>
						<?php if ( comments_open() || $product->get_review_count() ) : ?>
							<?php /* translators: %d: number of reviews */ ?>
							<details id="ph-reviews"><summary><?php echo esc_html( sprintf( __( 'Reviews (%d)', 'potteryhub' ), $product->get_review_count() ) ); ?></summary><div class="accb ph-reviews"><?php comments_template(); ?></div></details>
						<?php endif; ?>
					</div>
				</div>
			</div>

			<?php if ( $ph_related ) : ?>
			<div class="similar">
				<div class="sec-h rv"><div><div class="eyebrow"><?php esc_html_e( 'You may also like', 'potteryhub' ); ?></div><h2 class="serif"><?php esc_html_e( 'Similar Pieces', 'potteryhub' ); ?></h2></div><a class="see" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Shop all', 'potteryhub' ); ?></a></div>
				<div class="grid">
					<?php
					foreach ( array_slice( $ph_related, 0, 4 ) as $ph_n => $ph_rid ) {
						ph_card( wc_get_product( $ph_rid ), $ph_n );
					}
					?>
				</div>
			</div>
			<?php endif; ?>
		</div>
	</div>

	<?php if ( $product->is_purchasable() && $product->is_in_stock() ) : ?>
	<div class="sbar" id="sbar">
		<div class="si"><img src="<?php echo esc_url( ph_product_img( $product, 'woocommerce_thumbnail' ) ); ?>" alt=""></div>
		<div class="sn"><b><?php echo esc_html( $product->get_name() ); ?></b><small><?php echo wp_kses_post( $product->get_price_html() ); ?></small></div>
		<button class="booknow" type="button" id="sbAdd"><?php esc_html_e( 'Add to Cart', 'potteryhub' ); ?></button>
		<button class="buy" type="button" id="sbBuy"><?php esc_html_e( 'Buy now', 'potteryhub' ); ?> <?php echo ph_icon( 'arrow', 15, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
	</div>
	<?php endif; ?>
	<?php
	if ( WC()->structured_data ) {
		WC()->structured_data->generate_product_data( $product );
	}
	do_action( 'woocommerce_after_single_product' );
endwhile;

get_footer();
