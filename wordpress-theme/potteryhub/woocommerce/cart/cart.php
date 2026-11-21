<?php
/**
 * Cart page: items on the left, totals on the right. Quantities update on
 * change (no "Update cart" button), items remove instantly.
 *
 * Based on WooCommerce's cart/cart.php — class names and hooks that
 * WooCommerce's cart script relies on are kept.
 *
 * @package PotteryHub
 * @version 11.3.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_cart' ); ?>

<div class="ph-cart">
<form class="woocommerce-cart-form co-card" action="<?php echo esc_url( wc_get_cart_url() ); ?>" method="post">
	<?php do_action( 'woocommerce_before_cart_table' ); ?>
	<h3 class="co-h"><?php esc_html_e( 'Your pieces', 'potteryhub' ); ?> <small>(<?php echo (int) WC()->cart->get_cart_contents_count(); ?>)</small></h3>
	<div class="shop_table cart woocommerce-cart-form__contents ph-cart-items">
		<?php do_action( 'woocommerce_before_cart_contents' ); ?>
		<?php
		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			$_product   = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
			$product_id = apply_filters( 'woocommerce_cart_item_product_id', $cart_item['product_id'], $cart_item, $cart_item_key );
			$visible    = apply_filters( 'woocommerce_cart_item_visible', true, $cart_item, $cart_item_key );
			if ( ! $_product || ! $_product->exists() || $cart_item['quantity'] <= 0 || ! $visible ) {
				continue;
			}
			$cart_item_name    = WC()->cart->get_item_product_name( $cart_item, $_product );
			$product_name      = apply_filters( 'woocommerce_cart_item_name', $cart_item_name, $cart_item, $cart_item_key );
			$product_permalink = apply_filters( 'woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink( $cart_item ) : '', $cart_item, $cart_item_key );
			$thumbnail         = apply_filters( 'woocommerce_cart_item_thumbnail', $_product->get_image( 'woocommerce_thumbnail' ), $cart_item, $cart_item_key );
			?>
			<div class="woocommerce-cart-form__cart-item <?php echo esc_attr( apply_filters( 'woocommerce_cart_item_class', 'cart_item', $cart_item, $cart_item_key ) ); ?>">
				<div class="product-thumbnail"><?php echo $product_permalink ? '<a href="' . esc_url( $product_permalink ) . '">' . $thumbnail . '</a>' : $thumbnail; // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
				<div class="product-name">
					<?php
					echo $product_permalink ? wp_kses_post( sprintf( '<a href="%s">%s</a>', esc_url( $product_permalink ), $product_name ) ) : wp_kses_post( $product_name );
					do_action( 'woocommerce_after_cart_item_name', $cart_item, $cart_item_key );
					echo wc_get_formatted_cart_item_data( $cart_item ); // phpcs:ignore WordPress.Security.EscapeOutput
					if ( $_product->backorders_require_notification() && $_product->is_on_backorder( $cart_item['quantity'] ) ) {
						echo wp_kses_post( apply_filters( 'woocommerce_cart_item_backorder_notification', '<p class="backorder_notification">' . esc_html__( 'Available on backorder', 'woocommerce' ) . '</p>', $product_id ) );
					}
					?>
					<div class="product-price"><?php echo apply_filters( 'woocommerce_cart_item_price', WC()->cart->get_product_price( $_product ), $cart_item, $cart_item_key ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
				</div>
				<div class="product-quantity">
					<?php
					$min_quantity = $_product->is_sold_individually() ? 1 : 0;
					$max_quantity = $_product->is_sold_individually() ? 1 : $_product->get_max_purchase_quantity();
					$qty          = woocommerce_quantity_input(
						array(
							'input_name'   => "cart[{$cart_item_key}][qty]",
							'input_value'  => $cart_item['quantity'],
							'max_value'    => $max_quantity,
							'min_value'    => $min_quantity,
							'product_name' => $product_name,
						),
						$_product,
						false
					);
					echo apply_filters( 'woocommerce_cart_item_quantity', $qty, $cart_item_key, $cart_item ); // phpcs:ignore WordPress.Security.EscapeOutput
					?>
				</div>
				<div class="product-subtotal"><?php echo apply_filters( 'woocommerce_cart_item_subtotal', WC()->cart->get_product_subtotal( $_product, $cart_item['quantity'] ), $cart_item, $cart_item_key ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
				<div class="product-remove">
					<?php
					echo apply_filters( // phpcs:ignore WordPress.Security.EscapeOutput
						'woocommerce_cart_item_remove_link',
						sprintf(
							'<a role="button" href="%s" class="remove" aria-label="%s" data-product_id="%s" data-product_sku="%s">%s</a>',
							esc_url( wc_get_cart_remove_url( $cart_item_key ) ),
							/* translators: %s: product name */
							esc_attr( sprintf( __( 'Remove %s from cart', 'woocommerce' ), wp_strip_all_tags( $product_name ) ) ),
							esc_attr( $product_id ),
							esc_attr( $_product->get_sku() ),
							ph_icon( 'close', 14, 2 )
						),
						$cart_item_key
					);
					?>
				</div>
			</div>
			<?php
		}
		?>
		<?php do_action( 'woocommerce_cart_contents' ); ?>
		<div class="actions">
			<?php if ( wc_coupons_enabled() ) : ?>
				<div class="coupon">
					<label for="coupon_code" class="screen-reader-text"><?php esc_html_e( 'Coupon:', 'woocommerce' ); ?></label>
					<input type="text" name="coupon_code" class="input-text" id="coupon_code" value="" placeholder="<?php esc_attr_e( 'Coupon code', 'potteryhub' ); ?>">
					<button type="submit" class="button" name="apply_coupon" value="<?php esc_attr_e( 'Apply coupon', 'woocommerce' ); ?>"><?php esc_html_e( 'Apply', 'potteryhub' ); ?></button>
					<?php do_action( 'woocommerce_cart_coupon' ); ?>
				</div>
			<?php endif; ?>
			<button type="submit" class="button ph-update" name="update_cart" value="<?php esc_attr_e( 'Update cart', 'woocommerce' ); ?>"><?php esc_html_e( 'Update cart', 'woocommerce' ); ?></button>
			<?php do_action( 'woocommerce_cart_actions' ); ?>
			<?php wp_nonce_field( 'woocommerce-cart', 'woocommerce-cart-nonce' ); ?>
		</div>
		<?php do_action( 'woocommerce_after_cart_contents' ); ?>
	</div>
	<?php do_action( 'woocommerce_after_cart_table' ); ?>
</form>

<?php do_action( 'woocommerce_before_cart_collaterals' ); ?>
<div class="cart-collaterals">
	<?php do_action( 'woocommerce_cart_collaterals' ); ?>
</div>
</div>
<?php do_action( 'woocommerce_after_cart' ); ?>
