<?php
/**
 * Footer, drawers and overlays.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
$ph_wc = class_exists( 'WooCommerce' );
?>
</div><!-- #ph-main -->
<footer class="foot" id="about">
	<div class="fg">
		<div data-rv>
			<img src="<?php echo esc_url( ph_img( 'logo-light.png' ) ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" style="height:92px;width:auto">
			<p style="margin-top:18px;max-width:360px;line-height:1.7"><?php echo esc_html( ph_mod( 'ph_about' ) ); ?></p>
			<div class="soc"><?php echo ph_socials(); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		</div>
		<div data-rv style="--d:100ms"><h5><?php esc_html_e( 'Shop', 'potteryhub' ); ?></h5><ul>
			<?php foreach ( ph_categories( 6 ) as $ph_t ) : ?>
				<li><a href="<?php echo esc_url( get_term_link( $ph_t ) ); ?>"><?php echo esc_html( $ph_t->name ); ?></a></li>
			<?php endforeach; ?>
		</ul></div>
		<div data-rv style="--d:200ms"><h5><?php esc_html_e( 'Help', 'potteryhub' ); ?></h5><ul>
			<?php if ( has_nav_menu( 'footer' ) ) : ?>
				<?php foreach ( (array) wp_get_nav_menu_items( get_nav_menu_locations()['footer'] ) as $ph_it ) : ?>
					<li><a href="<?php echo esc_url( $ph_it->url ); ?>"><?php echo esc_html( $ph_it->title ); ?></a></li>
				<?php endforeach; ?>
			<?php elseif ( $ph_wc ) : ?>
				<li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'All products', 'potteryhub' ); ?></a></li>
				<li><button type="button" data-open="cart"><?php esc_html_e( 'Your cart', 'potteryhub' ); ?></button></li>
				<li><a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>"><?php esc_html_e( 'My account', 'potteryhub' ); ?></a></li>
				<?php foreach ( array( 'template-about.php' => __( 'About', 'potteryhub' ), 'template-workshops.php' => __( 'Workshops', 'potteryhub' ), 'template-contact.php' => __( 'Contact', 'potteryhub' ) ) as $ph_tpl => $ph_lbl ) : ?>
					<?php if ( ph_template_url( $ph_tpl ) ) : ?><li><a href="<?php echo esc_url( ph_template_url( $ph_tpl ) ); ?>"><?php echo esc_html( $ph_lbl ); ?></a></li><?php endif; ?>
				<?php endforeach; ?>
			<?php endif; ?>
		</ul></div>
		<div data-rv style="--d:300ms"><h5><?php esc_html_e( 'Stay in the loop', 'potteryhub' ); ?></h5><p><?php esc_html_e( 'New glazes, restocks and workshop dates — first.', 'potteryhub' ); ?></p>
			<?php ph_newsletter_form(); ?></div>
	</div>
	<div class="bot"><span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( get_bloginfo( 'name' ) ); ?></span><span><?php esc_html_e( 'Handmade in Egypt', 'potteryhub' ); ?></span></div>
</footer>

<div class="scrim" id="scrim"></div>

<?php if ( $ph_wc ) : ?>
<aside class="drawer" id="drawer" aria-hidden="true" data-lenis-prevent>
	<div class="dh"><h3 class="serif" id="drTitle"><?php esc_html_e( 'Your cart', 'potteryhub' ); ?></h3><button class="x" type="button" data-close aria-label="<?php esc_attr_e( 'Close', 'potteryhub' ); ?>"><?php echo ph_icon( 'close', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button></div>
	<div class="pane" data-pane="cart"><?php echo ph_mini_cart(); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
</aside>
<?php endif; ?>

<aside class="drawer left mnav" id="menu" aria-hidden="true" data-lenis-prevent>
	<div class="mn-top">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="mn-logo"><img src="<?php echo esc_url( ph_img( 'logo-dark.png' ) ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"></a>
		<button class="x" type="button" data-close aria-label="<?php esc_attr_e( 'Close', 'potteryhub' ); ?>"><?php echo ph_icon( 'close', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
	</div>
	<div class="mn-body" data-lenis-prevent>
		<button class="mn-search" type="button" data-search><?php echo ph_icon( 'search', 18, 1.8 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span><?php esc_html_e( 'Search mugs, bowls, teapots…', 'potteryhub' ); ?></span></button>
		<?php if ( $ph_wc ) : ?>
			<div class="mn-h"><span><?php esc_html_e( 'Shop by category', 'potteryhub' ); ?></span><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Shop all', 'potteryhub' ); ?> <?php echo ph_icon( 'arrow', 13, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a></div>
			<div class="mn-cats">
				<?php foreach ( ph_categories( 6 ) as $ph_t ) : ?>
					<a class="mn-cat" href="<?php echo esc_url( get_term_link( $ph_t ) ); ?>">
						<span class="mn-ci"><img src="<?php echo esc_url( ph_cat_img( $ph_t, 'woocommerce_thumbnail' ) ); ?>" alt="" loading="lazy"></span>
						<b><?php echo esc_html( $ph_t->name ); ?></b><small><?php echo esc_html( ph_pieces( (int) $ph_t->count ) ); ?></small>
					</a>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
		<div class="mn-h"><span><?php esc_html_e( 'Explore', 'potteryhub' ); ?></span></div>
		<nav class="mn-links">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><i><?php echo ph_icon( 'home', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><?php esc_html_e( 'Home', 'potteryhub' ); ?></span><?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
			<?php if ( $ph_wc ) : ?>
				<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><i><?php echo ph_icon( 'grid', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><?php esc_html_e( 'All products', 'potteryhub' ); ?></span><small><?php echo esc_html( (int) wp_count_posts( 'product' )->publish ); ?></small><?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
			<?php endif; ?>
			<?php
			$ph_pages = array(
				array( ph_template_url( 'template-workshops.php' ), __( 'Workshops', 'potteryhub' ), 'clock' ),
				array( ph_template_url( 'template-about.php' ), __( 'About us', 'potteryhub' ), 'info' ),
				array( ph_template_url( 'template-contact.php' ), __( 'Contact', 'potteryhub' ), 'chat' ),
				array( ph_journal_url() && wp_count_posts()->publish ? ph_journal_url() : '', __( 'Journal', 'potteryhub' ), 'book' ),
			);
			foreach ( $ph_pages as $ph_p ) :
				if ( ! $ph_p[0] ) {
					continue;
				}
				?>
				<a href="<?php echo esc_url( $ph_p[0] ); ?>"><i><?php echo ph_icon( $ph_p[2], 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><?php echo esc_html( $ph_p[1] ); ?></span><?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
			<?php endforeach; ?>
			<?php if ( $ph_wc ) : ?>
				<a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>"><i><?php echo ph_icon( 'user', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><?php echo is_user_logged_in() ? esc_html__( 'My account', 'potteryhub' ) : esc_html__( 'Sign in', 'potteryhub' ); ?></span><?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
			<?php endif; ?>
		</nav>
	</div>
	<div class="mn-foot">
		<?php if ( $ph_wc ) : ?>
			<button class="mn-cart" type="button" data-open="cart"><?php echo ph_icon( 'bag', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span><?php esc_html_e( 'Your cart', 'potteryhub' ); ?></span><span class="ph-tabn"></span></button>
		<?php endif; ?>
		<div class="mn-row">
			<a class="mn-lang" href="<?php echo esc_url( ph_switch_url() ); ?>" hreflang="<?php echo ph_is_ar() ? 'en' : 'ar'; ?>"><?php echo ph_is_ar() ? 'English' : 'العربية'; ?></a>
			<?php if ( ph_whatsapp_url() ) : ?><a class="mn-wa" href="<?php echo esc_url( ph_whatsapp_url() ); ?>" target="_blank" rel="noopener"><?php echo ph_icon( 'chat', 16, 1.8 ); // phpcs:ignore WordPress.Security.EscapeOutput ?> WhatsApp</a><?php endif; ?>
			<div class="soc"><?php echo ph_socials(); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		</div>
	</div>
</aside>

<div class="sov" id="sov" aria-hidden="true" data-lenis-prevent>
	<form class="sform" role="search" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get">
		<label class="sbox" style="flex:1"><?php echo ph_icon( 'search', 20, 1.6 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><input id="sovQ" name="s" placeholder="<?php esc_attr_e( 'Search mugs, bowls, teapots…', 'potteryhub' ); ?>" autocomplete="off" aria-label="<?php esc_attr_e( 'Search', 'potteryhub' ); ?>"></label>
		<input type="hidden" name="post_type" value="product">
		<button class="x" type="button" data-close aria-label="<?php esc_attr_e( 'Close', 'potteryhub' ); ?>"><?php echo ph_icon( 'close', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
	</form>
	<div class="hint" id="sovHint"><?php esc_html_e( 'Popular:', 'potteryhub' ); ?>
		<?php foreach ( ph_categories( 5 ) as $ph_t ) : ?>
			<a class="chip" href="<?php echo esc_url( get_term_link( $ph_t ) ); ?>"><?php echo esc_html( $ph_t->name ); ?></a>
		<?php endforeach; ?>
	</div>
	<div class="res sugg" id="sovRes" style="width:auto"></div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
<?php wp_footer(); ?>
</body>
</html>
