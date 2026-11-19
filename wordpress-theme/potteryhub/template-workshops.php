<?php
/**
 * Template Name: Workshops
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();

while ( have_posts() ) :
	the_post();
	$ph_wa = ph_whatsapp_url( ph_is_ar() ? 'أهلاً، عايز أعرف مواعيد الورشة الجاية' : 'Hi! I’d like to know the next workshop dates.' );
	?>
	<div class="tpl tpl-workshops">
		<div class="pband"></div>
		<div class="pwrap">
			<?php ph_page_hero( ph_mod( 'ph_band_eb' ), get_the_title(), ph_mod( 'ph_band_p' ), ph_page_img( get_theme_mod( 'ph_band_img', 'https://potteryhubeg.com/wp-content/uploads/2024/07/w-hmp-video-2-image.jpg' ) ) ); ?>

			<div class="tpl-cols" id="form">
				<div>
					<div class="entry rv"><?php the_content(); ?></div>
					<?php if ( $ph_wa ) : ?>
						<a class="wa rv" href="<?php echo esc_url( $ph_wa ); ?>" target="_blank" rel="noopener"><?php echo ph_icon( 'chat', 18, 1.8 ); // phpcs:ignore WordPress.Security.EscapeOutput ?> <?php esc_html_e( 'Ask on WhatsApp', 'potteryhub' ); ?></a>
					<?php endif; ?>
				</div>
				<div class="fcard">
					<h2 class="serif rv"><?php esc_html_e( 'Book a place', 'potteryhub' ); ?></h2>
					<p class="rv"><?php esc_html_e( 'Send your details and we’ll call you with the next dates.', 'potteryhub' ); ?></p>
					<?php ph_form( 'workshop' ); ?>
				</div>
			</div>
		</div>
	</div>
	<?php
endwhile;
get_footer();
