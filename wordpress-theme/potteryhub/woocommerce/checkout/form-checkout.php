<?php
/**
 * Checkout form — two columns: delivery details, and a sticky order summary.
 *
 * Based on WooCommerce's checkout/form-checkout.php (all hooks kept).
 *
 * @package PotteryHub
 * @version 9.4.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_checkout_form', $checkout );

if ( ! $checkout->is_registration_enabled() && $checkout->is_registration_required() && ! is_user_logged_in() ) {
	echo esc_html( apply_filters( 'woocommerce_checkout_must_be_logged_in_message', __( 'You must be logged in to checkout.', 'woocommerce' ) ) );
	return;
}
?>
<form name="checkout" method="post" class="checkout woocommerce-checkout ph-co" action="<?php echo esc_url( wc_get_checkout_url() ); ?>" enctype="multipart/form-data" aria-label="<?php echo esc_attr__( 'Checkout', 'woocommerce' ); ?>"
	data-ship="<?php echo esc_attr( wp_json_encode( ph_ship_map() ) ); ?>"
	data-uor="<?php echo esc_attr( wp_create_nonce( 'update-order-review' ) ); ?>"
	data-coupon="<?php echo esc_attr( wp_create_nonce( 'apply-coupon' ) ); ?>"
	data-rcoupon="<?php echo esc_attr( wp_create_nonce( 'remove-coupon' ) ); ?>">

	<div class="ph-co-main">
		<?php if ( $checkout->get_checkout_fields() ) : ?>
			<?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>
			<div id="customer_details">
				<section class="co-card">
					<h3 class="co-h"><span>1</span><?php esc_html_e( 'Delivery details', 'potteryhub' ); ?></h3>
					<?php do_action( 'woocommerce_checkout_billing' ); ?>
				</section>
				<?php do_action( 'woocommerce_checkout_shipping' ); ?>
			</div>
			<?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>
		<?php endif; ?>
	</div>

	<aside class="ph-co-side">
		<div class="co-card co-sum">
			<?php do_action( 'woocommerce_checkout_before_order_review_heading' ); ?>
			<h3 id="order_review_heading" class="co-h"><span>2</span><?php esc_html_e( 'Your order', 'woocommerce' ); ?></h3>
			<?php if ( ph_free_delivery() ) : ?><div class="ph-free"><i><?php echo ph_icon( 'truck', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><b><?php esc_html_e( 'Free delivery', 'potteryhub' ); ?></b> <?php esc_html_e( 'to every governorate', 'potteryhub' ); ?></span></div><?php endif; ?>
			<?php do_action( 'woocommerce_checkout_before_order_review' ); ?>
			<div id="order_review" class="woocommerce-checkout-review-order">
				<?php do_action( 'woocommerce_checkout_order_review' ); ?>
			</div>
			<?php do_action( 'woocommerce_checkout_after_order_review' ); ?>
		</div>
	</aside>

</form>
<?php do_action( 'woocommerce_after_checkout_form', $checkout ); ?>
