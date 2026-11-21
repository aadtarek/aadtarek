<?php
/**
 * Cart totals: subtotal, discounts, then checkout. Delivery is worked out at
 * checkout from the governorate.
 *
 * @package PotteryHub
 * @version 2.3.6
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="cart_totals co-card<?php echo WC()->customer->has_calculated_shipping() ? ' calculated_shipping' : ''; ?>">
	<?php do_action( 'woocommerce_before_cart_totals' ); ?>
	<h3 class="co-h"><?php esc_html_e( 'Order summary', 'potteryhub' ); ?></h3>
	<table class="co-totals">
		<tr class="cart-subtotal">
			<th><?php esc_html_e( 'Subtotal', 'woocommerce' ); ?></th>
			<td><?php wc_cart_totals_subtotal_html(); ?></td>
		</tr>
		<?php foreach ( WC()->cart->get_coupons() as $code => $coupon ) : ?>
			<tr class="cart-discount coupon-<?php echo esc_attr( sanitize_title( $code ) ); ?>">
				<th><?php wc_cart_totals_coupon_label( $coupon ); ?></th>
				<td><?php wc_cart_totals_coupon_html( $coupon ); ?></td>
			</tr>
		<?php endforeach; ?>
		<?php foreach ( WC()->cart->get_fees() as $fee ) : ?>
			<tr class="fee"><th><?php echo esc_html( $fee->name ); ?></th><td><?php wc_cart_totals_fee_html( $fee ); ?></td></tr>
		<?php endforeach; ?>
		<?php if ( WC()->cart->needs_shipping() ) : ?>
			<tr class="ph-ship-note"><th><?php esc_html_e( 'Delivery', 'potteryhub' ); ?></th><td><?php if ( ph_free_delivery() ) : ?><b class="ph-free-t"><?php esc_html_e( 'Free', 'potteryhub' ); ?></b><?php else : ?><?php esc_html_e( 'Calculated at checkout', 'potteryhub' ); ?><?php endif; ?></td></tr>
		<?php endif; ?>
		<tr class="order-total">
			<th><?php esc_html_e( 'Total', 'potteryhub' ); ?></th>
			<td><?php echo wc_price( (float) WC()->cart->get_subtotal() + (float) WC()->cart->get_subtotal_tax() - (float) WC()->cart->get_discount_total() - (float) WC()->cart->get_discount_tax() + (float) WC()->cart->get_fee_total() ); // phpcs:ignore WordPress.Security.EscapeOutput ?></td>
		</tr>
	</table>
	<?php if ( ph_free_delivery() ) : ?><div class="ph-free"><i><?php echo ph_icon( 'truck', 18, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></i><span><b><?php esc_html_e( 'Free delivery', 'potteryhub' ); ?></b> <?php esc_html_e( 'all over Egypt', 'potteryhub' ); ?></span></div><?php endif; ?>
	<div class="wc-proceed-to-checkout">
		<?php do_action( 'woocommerce_proceed_to_checkout' ); ?>
	</div>
	<a class="ph-keep" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php echo ph_icon( 'back', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?> <?php esc_html_e( 'Keep shopping', 'potteryhub' ); ?></a>
	<?php do_action( 'woocommerce_after_cart_totals' ); ?>
</div>
