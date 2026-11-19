<?php
/**
 * Template Name: Contact
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();

while ( have_posts() ) :
	the_post();
	$ph_phone = ph_contact( 'ph_phone' );
	$ph_email = ph_contact( 'ph_email' );
	$ph_addr  = ph_contact( 'ph_address' );
	$ph_hours = ph_contact( 'ph_hours' );
	$ph_map   = ph_contact( 'ph_map' );
	$ph_wa    = ph_whatsapp_url();
	$ph_soc   = ph_socials();
	?>
	<div class="tpl tpl-contact">
		<div class="pband"></div>
		<div class="pwrap">
			<?php ph_page_hero( __( 'We’d love to hear from you', 'potteryhub' ), get_the_title(), '', '' ); ?>

			<div class="tpl-cols" id="form">
				<div>
					<div class="entry rv"><?php the_content(); ?></div>
					<div class="cinfo">
						<?php if ( $ph_wa ) : ?>
							<a class="ci rv" href="<?php echo esc_url( $ph_wa ); ?>" target="_blank" rel="noopener"><span class="cic"><?php echo ph_icon( 'chat', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><span><small><?php esc_html_e( 'WhatsApp', 'potteryhub' ); ?></small><b dir="ltr">+<?php echo esc_html( preg_replace( '/\D+/', '', ph_contact( 'ph_whatsapp' ) ) ); ?></b></span></a>
						<?php endif; ?>
						<?php if ( $ph_phone ) : ?>
							<a class="ci rv" href="tel:<?php echo esc_attr( preg_replace( '/[^\d+]/', '', $ph_phone ) ); ?>"><span class="cic"><?php echo ph_icon( 'phone', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><span><small><?php esc_html_e( 'Phone', 'potteryhub' ); ?></small><b dir="ltr"><?php echo esc_html( $ph_phone ); ?></b></span></a>
						<?php endif; ?>
						<?php if ( $ph_email ) : ?>
							<a class="ci rv" href="mailto:<?php echo esc_attr( $ph_email ); ?>"><span class="cic"><?php echo ph_icon( 'mail', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><span><small><?php esc_html_e( 'Email', 'potteryhub' ); ?></small><b><?php echo esc_html( $ph_email ); ?></b></span></a>
						<?php endif; ?>
						<?php if ( $ph_addr ) : ?>
							<<?php echo $ph_map ? 'a href="' . esc_url( $ph_map ) . '" target="_blank" rel="noopener"' : 'div'; ?> class="ci rv"><span class="cic"><?php echo ph_icon( 'pin', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><span><small><?php esc_html_e( 'Studio', 'potteryhub' ); ?></small><b><?php echo nl2br( esc_html( $ph_addr ) ); ?></b></span></<?php echo $ph_map ? 'a' : 'div'; ?>>
						<?php endif; ?>
						<?php if ( $ph_hours ) : ?>
							<div class="ci rv"><span class="cic"><?php echo ph_icon( 'clock', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><span><small><?php esc_html_e( 'Opening hours', 'potteryhub' ); ?></small><b><?php echo nl2br( esc_html( $ph_hours ) ); ?></b></span></div>
						<?php endif; ?>
					</div>
					<?php if ( $ph_soc ) : ?><div class="soc dark rv"><?php echo $ph_soc; // phpcs:ignore WordPress.Security.EscapeOutput ?></div><?php endif; ?>
				</div>
				<div class="fcard">
					<h2 class="serif rv"><?php esc_html_e( 'Send a message', 'potteryhub' ); ?></h2>
					<?php ph_form( 'contact' ); ?>
				</div>
			</div>
		</div>
	</div>
	<?php
endwhile;
get_footer();
