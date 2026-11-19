<?php
/**
 * Template Name: About
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();
$ph_wc   = class_exists( 'WooCommerce' );
$ph_cats = $ph_wc ? ph_categories( 3 ) : array();

while ( have_posts() ) :
	the_post();
	?>
	<div class="tpl tpl-about">
		<div class="pband"></div>
		<div class="pwrap">
			<?php ph_page_hero( __( 'Our story', 'potteryhub' ), get_the_title(), ph_mod( 'ph_about' ), ph_page_img( ph_img( 'hero-1.jpg' ) ) ); ?>

			<div class="tpl-body">
				<div class="entry rv"><?php the_content(); ?></div>
				<?php if ( $ph_cats ) : ?>
					<div class="mosaic">
						<?php foreach ( $ph_cats as $ph_i => $ph_t ) : ?>
							<a class="mo" data-rv style="--d:<?php echo (int) $ph_i * 110; ?>ms" href="<?php echo esc_url( get_term_link( $ph_t ) ); ?>" data-cur="<?php esc_attr_e( 'Shop', 'potteryhub' ); ?>">
								<img src="<?php echo esc_url( ph_cat_img( $ph_t ) ); ?>" alt="" loading="lazy">
								<span><?php echo esc_html( $ph_t->name ); ?> <?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
							</a>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			</div>
		</div>

		<section class="band" data-rv>
			<img data-par=".12" src="<?php echo esc_url( get_theme_mod( 'ph_band_img', 'https://potteryhubeg.com/wp-content/uploads/2024/07/w-hmp-video-2-image.jpg' ) ); ?>" alt="" loading="lazy">
			<div class="bt2">
				<div class="eyebrow"><?php echo esc_html( ph_mod( 'ph_band_eb' ) ); ?></div>
				<h2 class="serif"><?php echo esc_html( ph_mod( 'ph_band_t' ) ); ?></h2>
				<p><?php echo esc_html( ph_mod( 'ph_band_p' ) ); ?></p>
				<?php $ph_wk = ph_template_url( 'template-workshops.php' ); ?>
				<a class="btn" href="<?php echo esc_url( $ph_wk ? $ph_wk : get_theme_mod( 'ph_band_url', 'https://www.facebook.com/profile.php?id=61595757980356' ) ); ?>"><?php echo esc_html( ph_mod( 'ph_band_cta' ) ); ?> <?php echo ph_icon( 'arrow', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
			</div>
		</section>
	</div>
	<?php
endwhile;
get_footer();
