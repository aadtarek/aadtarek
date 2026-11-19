<?php
/**
 * Footer, drawers and overlays.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
$ph_wc = class_exists( 'WooCommerce' );
?>
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
				<li><button type="button" data-open="wish"><?php esc_html_e( 'Wishlist', 'potteryhub' ); ?></button></li>
				<li><a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>"><?php esc_html_e( 'My account', 'potteryhub' ); ?></a></li>
				<?php foreach ( array( 'template-about.php' => __( 'About', 'potteryhub' ), 'template-workshops.php' => __( 'Workshops', 'potteryhub' ), 'template-contact.php' => __( 'Contact', 'potteryhub' ) ) as $ph_tpl => $ph_lbl ) : ?>
					<?php if ( ph_template_url( $ph_tpl ) ) : ?><li><a href="<?php echo esc_url( ph_template_url( $ph_tpl ) ); ?>"><?php echo esc_html( $ph_lbl ); ?></a></li><?php endif; ?>
				<?php endforeach; ?>
			<?php endif; ?>
		</ul></div>
		<div data-rv style="--d:300ms"><h5><?php esc_html_e( 'Stay in the loop', 'potteryhub' ); ?></h5><p><?php esc_html_e( 'New glazes, restocks and workshop dates — first.', 'potteryhub' ); ?></p>
			<?php ph_newsletter_form(); ?></div>
	</div>
	<div class="giant sp" id="giant" data-par="-.08"><?php esc_html_e( 'House of Pottery', 'potteryhub' ); ?></div>
	<svg class="spark" style="left:8%;bottom:30%" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.6 6.5 3.5 9.4 10 10-6.5.6-9.4 3.5-10 10-.6-6.5-3.5-9.4-10-10 6.5-.6 9.4-3.5 10-10z"/></svg>
	<svg class="spark" style="right:12%;bottom:46%;animation-delay:-1.2s" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.6 6.5 3.5 9.4 10 10-6.5.6-9.4 3.5-10 10-.6-6.5-3.5-9.4-10-10 6.5-.6 9.4-3.5 10-10z"/></svg>
	<div class="bot"><span>© <?php echo esc_html( gmdate( 'Y' ) ); ?></span><span><?php esc_html_e( 'House of Pottery', 'potteryhub' ); ?></span></div>
</footer>

<div class="scrim" id="scrim"></div>

<?php if ( $ph_wc ) : ?>
<aside class="drawer" id="drawer" aria-hidden="true" data-lenis-prevent>
	<div class="dh"><h3 class="serif" id="drTitle"><?php esc_html_e( 'Your cart', 'potteryhub' ); ?></h3><button class="x" type="button" data-close aria-label="<?php esc_attr_e( 'Close', 'potteryhub' ); ?>"><?php echo ph_icon( 'close', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button></div>
	<div class="tabs"><button type="button" data-tab="cart" class="on"><?php esc_html_e( 'Cart', 'potteryhub' ); ?> <span class="ph-tabn"></span></button><button type="button" data-tab="wish"><?php esc_html_e( 'Wishlist', 'potteryhub' ); ?> <span id="tabWishN"></span></button></div>
	<div class="pane" data-pane="cart"><?php echo ph_mini_cart(); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
	<div class="pane" data-pane="wish" hidden><div class="dbody" id="wishBody" data-lenis-prevent></div></div>
</aside>
<?php endif; ?>

<aside class="drawer left" id="menu" aria-hidden="true" data-lenis-prevent>
	<div class="dh"><img src="<?php echo esc_url( ph_img( 'logo-dark.png' ) ); ?>" alt="" style="height:52px;width:auto"><button class="x" type="button" data-close aria-label="<?php esc_attr_e( 'Close', 'potteryhub' ); ?>"><?php echo ph_icon( 'close', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button></div>
	<nav class="menu-l">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'potteryhub' ); ?></a>
		<?php if ( $ph_wc ) : ?>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Shop all', 'potteryhub' ); ?><small><?php echo esc_html( ph_pieces( (int) wp_count_posts( 'product' )->publish ) ); ?></small></a>
			<?php foreach ( ph_categories( 6 ) as $ph_t ) : ?>
				<a href="<?php echo esc_url( get_term_link( $ph_t ) ); ?>"><?php echo esc_html( $ph_t->name ); ?><small><?php echo (int) $ph_t->count; ?></small></a>
			<?php endforeach; ?>
			<button type="button" data-open="wish"><?php esc_html_e( 'Wishlist', 'potteryhub' ); ?></button>
			<button type="button" data-open="cart"><?php esc_html_e( 'Cart', 'potteryhub' ); ?></button>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>"><?php esc_html_e( 'My account', 'potteryhub' ); ?></a>
		<?php endif; ?>
		<?php foreach ( array( 'template-workshops.php' => __( 'Workshops', 'potteryhub' ), 'template-about.php' => __( 'About', 'potteryhub' ), 'template-contact.php' => __( 'Contact', 'potteryhub' ) ) as $ph_tpl => $ph_lbl ) : ?>
			<?php if ( ph_template_url( $ph_tpl ) ) : ?><a href="<?php echo esc_url( ph_template_url( $ph_tpl ) ); ?>"><?php echo esc_html( $ph_lbl ); ?></a><?php endif; ?>
		<?php endforeach; ?>
		<?php if ( ph_journal_url() && wp_count_posts()->publish ) : ?><a href="<?php echo esc_url( ph_journal_url() ); ?>"><?php esc_html_e( 'Journal', 'potteryhub' ); ?></a><?php endif; ?>
		<a href="<?php echo esc_url( ph_switch_url() ); ?>"><?php echo ph_is_ar() ? 'English' : 'العربية'; ?></a>
	</nav>
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
