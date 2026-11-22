<?php
/**
 * Template Name: About
 *
 * Also used automatically for a page with the slug about, about-us or about-me.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();
$ph_wc    = class_exists( 'WooCommerce' );
$ph_cats  = $ph_wc ? ph_categories( 3 ) : array();
$ph_imgs  = array();
if ( $ph_wc ) {
	foreach ( ph_best_sellers( 3 ) as $ph_p ) {
		$ph_imgs[] = ph_product_img( $ph_p );
	}
}
while ( count( $ph_imgs ) < 3 ) {
	$ph_imgs[] = ph_img( 'hero-' . ( count( $ph_imgs ) % 2 + 1 ) . '.jpg' );
}
$ph_count = $ph_wc ? (int) wp_count_posts( 'product' )->publish : 0;
$ph_ncat  = count( $ph_wc ? ph_categories() : array() );
$ph_addr  = ph_contact( 'ph_address' ) ? ph_contact( 'ph_address' ) : 'Value Mall, New Cairo';
$ph_mail  = ph_contact( 'ph_email' ) ? ph_contact( 'ph_email' ) : 'info@potteryhubeg.com';
$ph_phone = ph_contact( 'ph_phone' );
$ph_wa    = ph_whatsapp_url();
if ( ! function_exists( 'ph_free_delivery' ) ) {
	function ph_free_delivery() { return false; } // phpcs:ignore
}

while ( have_posts() ) :
	the_post();
	$ph_own = trim( wp_strip_all_tags( get_the_content() ) );
	// Old page-builder demo text is left out; anything written for this site is shown.
	$ph_own = $ph_own && false === stripos( get_the_content(), 'woodmart' ) ? $ph_own : '';
	?>
	<div class="tpl ab">
		<section class="ab-hero">
			<div class="ab-ht">
				<div class="eyebrow rv"><?php esc_html_e( 'Our story', 'potteryhub' ); ?></div>
				<h1 class="serif rv" style="--d:80ms"><?php esc_html_e( 'Handmade in Egypt, one piece at a time', 'potteryhub' ); ?></h1>
				<p class="rv" style="--d:160ms"><?php echo esc_html( ph_mod( 'ph_about' ) ); ?></p>
				<div class="ab-cta rv" style="--d:240ms">
					<?php if ( $ph_wc ) : ?><a class="btn" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Shop the collection', 'potteryhub' ); ?> <?php echo ph_icon( 'arrow', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a><?php endif; ?>
					<a class="ab-ghost" href="#ab-visit"><?php esc_html_e( 'Visit us', 'potteryhub' ); ?></a>
				</div>
			</div>
			<div class="ab-col rv" style="--d:120ms">
				<span class="ab-a1"><img src="<?php echo esc_url( $ph_imgs[0] ); ?>" alt="" data-par=".05"></span>
				<span class="ab-a2"><img src="<?php echo esc_url( $ph_imgs[1] ); ?>" alt=""></span>
				<span class="ab-a3"><img src="<?php echo esc_url( $ph_imgs[2] ); ?>" alt=""></span>
				<span class="ab-seal"><?php echo ph_icon( 'hand', 22, 1.6 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><b>100%</b><small><?php esc_html_e( 'Handmade', 'potteryhub' ); ?></small></span>
			</div>
		</section>

		<section class="ab-stats">
			<?php
			$ph_stats = array(
				array( $ph_count ? $ph_count . '+' : '—', __( 'Handmade pieces', 'potteryhub' ) ),
				array( $ph_ncat ? $ph_ncat : '—', __( 'Collections', 'potteryhub' ) ),
				array( '100%', __( 'Shaped & glazed by hand', 'potteryhub' ) ),
				array( '27', __( 'Governorates we deliver to', 'potteryhub' ) ),
			);
			foreach ( $ph_stats as $ph_i => $ph_s ) :
				?>
				<div class="ab-stat" data-rv style="--d:<?php echo (int) $ph_i * 90; ?>ms"><b class="serif"><?php echo esc_html( $ph_s[0] ); ?></b><span><?php echo esc_html( $ph_s[1] ); ?></span></div>
			<?php endforeach; ?>
		</section>

		<section class="ab-story">
			<div class="ab-sh" data-rv>
				<div class="eyebrow"><?php esc_html_e( 'Who we are', 'potteryhub' ); ?></div>
				<h2 class="serif"><?php esc_html_e( 'Where creativity meets craftsmanship', 'potteryhub' ); ?></h2>
			</div>
			<div class="ab-sb" data-rv style="--d:120ms">
				<?php if ( $ph_own ) : ?>
					<div class="entry"><?php the_content(); ?></div>
				<?php else : ?>
					<p><?php esc_html_e( 'Pottery Hub started with a simple love for clay: the weight of a mug in your hands, the way a glaze catches the light, the table that feels warmer because of it.', 'potteryhub' ); ?></p>
					<p><?php esc_html_e( 'Every mug, bowl and plate is shaped by hand, so no two pieces are exactly alike — small variations in form and glaze are part of their charm, and part of what makes each one yours.', 'potteryhub' ); ?></p>
				<?php endif; ?>
			</div>
		</section>

		<section class="ab-steps">
			<?php echo ph_clay( 'clay-steps' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<div class="sec-h"><div><div class="eyebrow"><?php esc_html_e( 'From clay to your table', 'potteryhub' ); ?></div><h2 class="serif"><?php esc_html_e( 'How a piece is made', 'potteryhub' ); ?></h2></div></div>
			<div class="ab-sg">
				<?php
				$ph_steps = array(
					array( 'hand', __( 'Shaped', 'potteryhub' ), __( 'Each piece starts as a block of clay, thrown on the wheel or built by hand.', 'potteryhub' ) ),
					array( 'leaf', __( 'Dried & trimmed', 'potteryhub' ), __( 'It dries slowly, then gets trimmed and smoothed until the form feels right.', 'potteryhub' ) ),
					array( 'check', __( 'Glazed', 'potteryhub' ), __( 'Glazes are applied by hand — speckled, matte or glossy — so every finish is unique.', 'potteryhub' ) ),
					array( 'fire', __( 'Fired', 'potteryhub' ), __( 'The kiln melts the glaze into its final colour and makes the piece strong for daily use.', 'potteryhub' ) ),
				);
				foreach ( $ph_steps as $ph_i => $ph_s ) :
					?>
					<div class="ab-step" data-rv style="--d:<?php echo (int) $ph_i * 110; ?>ms">
						<span class="ab-n">0<?php echo (int) $ph_i + 1; ?></span>
						<i><?php echo ph_icon( $ph_s[0], 22, 1.6 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i>
						<b><?php echo esc_html( $ph_s[1] ); ?></b>
						<p><?php echo esc_html( $ph_s[2] ); ?></p>
					</div>
				<?php endforeach; ?>
			</div>
		</section>

		<?php if ( $ph_cats ) : ?>
			<section class="ab-shop">
				<div class="sec-h"><div><div class="eyebrow"><?php esc_html_e( 'The collection', 'potteryhub' ); ?></div><h2 class="serif"><?php esc_html_e( 'Find your piece', 'potteryhub' ); ?></h2></div>
					<a class="see" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Shop all', 'potteryhub' ); ?> <?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a></div>
				<div class="mosaic">
					<?php foreach ( $ph_cats as $ph_i => $ph_t ) : ?>
						<a class="mo" data-rv style="--d:<?php echo (int) $ph_i * 110; ?>ms" href="<?php echo esc_url( get_term_link( $ph_t ) ); ?>">
							<img src="<?php echo esc_url( ph_cat_img( $ph_t ) ); ?>" alt="" loading="lazy">
							<span><?php echo esc_html( $ph_t->name ); ?> <?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
						</a>
					<?php endforeach; ?>
				</div>
			</section>
		<?php endif; ?>

		<section class="ab-faq">
			<div class="ab-sh" data-rv>
				<div class="eyebrow"><?php esc_html_e( 'Good to know', 'potteryhub' ); ?></div>
				<h2 class="serif"><?php esc_html_e( 'Questions, answered', 'potteryhub' ); ?></h2>
			</div>
			<div class="ab-qs" data-rv style="--d:120ms">
				<?php
				$ph_faq = array(
					array( __( 'Is everything really handmade?', 'potteryhub' ), __( 'Yes — every piece is shaped and glazed by hand. That’s why each one is a little different from the next.', 'potteryhub' ) ),
					array( __( 'Do you deliver everywhere in Egypt?', 'potteryhub' ), ph_free_delivery() ? __( 'Yes, to every governorate — delivery is free, and you pay cash on delivery.', 'potteryhub' ) : __( 'Yes, to every governorate. The delivery fee shows at checkout as soon as you pick your governorate, and you pay cash on delivery.', 'potteryhub' ) ),
					array( __( 'Can I order a custom piece?', 'potteryhub' ), __( 'Tell us what you have in mind on WhatsApp or by email, and we’ll let you know what’s possible.', 'potteryhub' ) ),
					array( __( 'How do I care for my pottery?', 'potteryhub' ), __( 'Wash gently with warm water and a soft sponge. Avoid sudden temperature changes, and let the piece cool before washing.', 'potteryhub' ) ),
				);
				foreach ( $ph_faq as $ph_i => $ph_q ) :
					?>
					<details<?php echo 0 === $ph_i ? ' open' : ''; ?>><summary><?php echo esc_html( $ph_q[0] ); ?><i></i></summary><p><?php echo esc_html( $ph_q[1] ); ?></p></details>
				<?php endforeach; ?>
			</div>
		</section>

		<section class="ab-visit" id="ab-visit">
			<div class="ab-vc" data-rv>
				<div class="eyebrow"><?php esc_html_e( 'Say hello', 'potteryhub' ); ?></div>
				<h2 class="serif"><?php esc_html_e( 'Come see the pieces in person', 'potteryhub' ); ?></h2>
				<ul>
					<li><i><?php echo ph_icon( 'pin', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><small><?php esc_html_e( 'Address', 'potteryhub' ); ?></small><?php echo esc_html( $ph_addr ); ?></span></li>
					<li><i><?php echo ph_icon( 'mail', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><small><?php esc_html_e( 'Email', 'potteryhub' ); ?></small><a href="mailto:<?php echo esc_attr( $ph_mail ); ?>"><?php echo esc_html( $ph_mail ); ?></a></span></li>
					<?php if ( $ph_phone ) : ?>
						<li><i><?php echo ph_icon( 'phone', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><small><?php esc_html_e( 'Phone', 'potteryhub' ); ?></small><a href="tel:<?php echo esc_attr( preg_replace( '/[^\d+]/', '', $ph_phone ) ); ?>" dir="ltr"><?php echo esc_html( $ph_phone ); ?></a></span></li>
					<?php endif; ?>
				</ul>
				<div class="ab-cta">
					<?php if ( $ph_wa ) : ?><a class="btn" href="<?php echo esc_url( $ph_wa ); ?>" target="_blank" rel="noopener"><?php echo ph_icon( 'chat', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?> <?php esc_html_e( 'Chat on WhatsApp', 'potteryhub' ); ?></a><?php endif; ?>
					<a class="<?php echo $ph_wa ? 'ab-ghost' : 'btn'; ?>" href="mailto:<?php echo esc_attr( $ph_mail ); ?>"><?php esc_html_e( 'Send an email', 'potteryhub' ); ?></a>
				</div>
			</div>
			<div class="ab-map" data-rv style="--d:120ms">
				<iframe loading="lazy" src="https://maps.google.com/maps?q=<?php echo rawurlencode( $ph_addr ); ?>&amp;t=m&amp;z=13&amp;output=embed" title="<?php echo esc_attr( $ph_addr ); ?>"></iframe>
			</div>
		</section>
	</div>
	<?php
endwhile;
get_footer();
