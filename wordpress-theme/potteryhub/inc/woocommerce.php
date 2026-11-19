<?php
/**
 * WooCommerce integration: cart drawer fragments, Buy now, quantity & search AJAX.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

/* Layout ------------------------------------------------------------------ */

add_filter( 'loop_shop_per_page', fn() => 12 );
add_filter( 'loop_shop_columns', fn() => 3 );
add_filter( 'woocommerce_output_related_products_args', fn( $a ) => array_merge( $a, array( 'posts_per_page' => 4, 'columns' => 4 ) ) );
add_filter( 'woocommerce_enqueue_styles', fn( $s ) => array_diff_key( $s, array( 'woocommerce-smallscreen' => 1 ) ) );
add_filter( 'woocommerce_breadcrumb_defaults', fn( $d ) => array_merge( $d, array( 'delimiter' => '<i>›</i>', 'wrap_before' => '<nav class="crumb" aria-label="breadcrumb">', 'wrap_after' => '</nav>', 'home' => __( 'Home', 'potteryhub' ) ) ) );

/* Buy now ------------------------------------------------------------------ */

/** After adding with "Buy now", go straight to checkout. */
add_filter(
	'woocommerce_add_to_cart_redirect',
	function ( $url ) {
		if ( ! empty( $_REQUEST['ph_buy_now'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return wc_get_checkout_url();
		}
		return $url;
	},
	99
);

/** A "Buy now" submit carries the product id; hand it to WooCommerce's add-to-cart handler. */
add_action(
	'wp_loaded',
	function () {
		// phpcs:disable WordPress.Security.NonceVerification -- same as WooCommerce's own add-to-cart form.
		if ( ! empty( $_REQUEST['ph_buy_now'] ) && empty( $_REQUEST['add-to-cart'] ) && is_numeric( $_REQUEST['ph_buy_now'] ) && (int) $_REQUEST['ph_buy_now'] > 1 ) {
			$_REQUEST['add-to-cart'] = absint( $_REQUEST['ph_buy_now'] );
		}
		// phpcs:enable
	},
	19
);

/** Space between the currency and the amount ("EGP 1,100"). */
add_filter(
	'woocommerce_price_format',
	function ( $format, $pos ) {
		return 'left' === $pos && ! ph_is_ar() ? '%1$s&nbsp;%2$s' : $format;
	},
	9,
	2
);

/** "Buy now" next to "Add to cart" on the product page. */
add_action(
	'woocommerce_after_add_to_cart_button',
	function () {
		global $product;
		if ( ! $product || ! $product->is_purchasable() || ! $product->is_in_stock() ) {
			return;
		}
		echo '<button type="submit" name="ph_buy_now" value="' . (int) $product->get_id() . '" class="buy" id="buyNow">' . esc_html__( 'Buy now', 'potteryhub' ) . ' ' . ph_icon( 'arrow', 16, 2 ) . '</button>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
);
add_filter( 'woocommerce_product_single_add_to_cart_text', fn() => __( 'Add to Cart', 'potteryhub' ) );

/** Variable products: Buy now needs the add-to-cart field filled by the variation form. */
add_action(
	'woocommerce_before_add_to_cart_button',
	function () {
		echo '<div class="ph-qty-label">' . esc_html__( 'Quantity', 'potteryhub' ) . '</div>';
	}
);

/* Cart drawer (fragments) -------------------------------------------------- */

/** Drawer contents. */
function ph_mini_cart() {
	ob_start();
	echo '<div class="ph-mini">';
	if ( WC()->cart && ! WC()->cart->is_empty() ) {
		echo '<div class="dbody" data-lenis-prevent>';
		foreach ( WC()->cart->get_cart() as $key => $item ) {
			$p = $item['data'];
			if ( ! $p || ! $p->exists() || $item['quantity'] <= 0 ) {
				continue;
			}
			$name = $p->get_name();
			$link = $p->is_visible() ? $p->get_permalink( $item ) : '';
			$img  = $p->get_image( 'woocommerce_thumbnail' );
			$cat  = ph_product_cat( $p->is_type( 'variation' ) ? wc_get_product( $p->get_parent_id() ) : $p );
			$var  = wc_get_formatted_cart_item_data( $item, true );
			?>
			<div class="line" data-key="<?php echo esc_attr( $key ); ?>">
				<a class="li" href="<?php echo esc_url( $link ); ?>"><?php echo $img; // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
				<div>
					<b><?php echo esc_html( $name ); ?></b>
					<small><?php echo esc_html( $var ? $var : $cat ); ?></small>
					<div class="lp"><?php echo WC()->cart->get_product_subtotal( $p, $item['quantity'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
					<div class="step"><button type="button" data-q="-1" aria-label="<?php esc_attr_e( 'Less', 'potteryhub' ); ?>">−</button><output><?php echo (int) $item['quantity']; ?></output><button type="button" data-q="1" aria-label="<?php esc_attr_e( 'More', 'potteryhub' ); ?>">+</button></div>
				</div>
				<button type="button" class="rm" data-rm="<?php echo esc_attr( $key ); ?>"><?php esc_html_e( 'Remove', 'potteryhub' ); ?></button>
			</div>
			<?php
		}
		echo '</div><div class="dfoot">';
		$save = 0;
		foreach ( WC()->cart->get_cart() as $item ) {
			$p = $item['data'];
			if ( $p && $p->is_on_sale() ) {
				$save += ( (float) $p->get_regular_price() - (float) $p->get_price() ) * $item['quantity'];
			}
		}
		if ( $save > 0 ) {
			echo '<div class="tot"><span>' . esc_html__( 'You save', 'potteryhub' ) . '</span><span>' . wc_price( $save ) . '</span></div>'; // phpcs:ignore WordPress.Security.EscapeOutput
		}
		echo '<div class="tot big"><span>' . esc_html__( 'Subtotal', 'potteryhub' ) . '</span><span>' . WC()->cart->get_cart_subtotal() . '</span></div>'; // phpcs:ignore WordPress.Security.EscapeOutput
		echo '<a class="btn wide" href="' . esc_url( wc_get_checkout_url() ) . '">' . esc_html__( 'Checkout', 'potteryhub' ) . ' ' . ph_icon( 'arrow', 16, 2 ) . '</a>'; // phpcs:ignore WordPress.Security.EscapeOutput
		echo '<a class="vcart" href="' . esc_url( wc_get_cart_url() ) . '">' . esc_html__( 'View cart', 'potteryhub' ) . '</a>';
		echo '</div>';
	} else {
		echo '<div class="dbody"><div class="dempty"><div class="eb">' . ph_icon( 'bag', 30, 1.4 ) . '</div><b>' . esc_html__( 'Your cart is empty', 'potteryhub' ) . '</b>' . esc_html__( 'Find a piece you love.', 'potteryhub' ) . '<br><a class="btn" href="' . esc_url( wc_get_page_permalink( 'shop' ) ) . '">' . esc_html__( 'Start shopping', 'potteryhub' ) . '</a></div></div>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	echo '</div>';
	return ob_get_clean();
}

function ph_cart_count() {
	$n = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
	return '<i class="cnt ph-bag-n' . ( $n ? ' on' : '' ) . '">' . (int) $n . '</i>';
}

add_filter(
	'woocommerce_add_to_cart_fragments',
	function ( $f ) {
		$f['div.ph-mini']  = ph_mini_cart();
		$f['i.ph-bag-n']   = ph_cart_count();
		$n                 = WC()->cart->get_cart_contents_count();
		$f['span.ph-tabn'] = '<span class="ph-tabn">' . ( $n ? '(' . (int) $n . ')' : '' ) . '</span>';
		return $f;
	}
);

/** wc-ajax=ph_qty — change a cart line quantity. */
function ph_ajax_qty() {
	$key = isset( $_POST['key'] ) ? wc_clean( wp_unslash( $_POST['key'] ) ) : '';
	$qty = isset( $_POST['qty'] ) ? max( 0, (int) $_POST['qty'] ) : 0;
	if ( $key && WC()->cart->get_cart_item( $key ) ) {
		if ( $qty ) {
			WC()->cart->set_quantity( $key, $qty, true );
		} else {
			WC()->cart->remove_cart_item( $key );
		}
	}
	WC_AJAX::get_refreshed_fragments();
}
add_action( 'wc_ajax_ph_qty', 'ph_ajax_qty' );

/** wc-ajax=ph_search — live product search for the search overlay. */
function ph_ajax_search() {
	$q   = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	$out = array();
	if ( mb_strlen( $q ) >= 2 ) {
		$ids = array();
		$wq  = new WP_Query(
			array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				's'              => $q,
				'posts_per_page' => 12,
				'fields'         => 'ids',
			)
		);
		$ids = $wq->posts;
		// Also match Arabic names.
		$mq  = new WP_Query(
			array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => 12,
				'fields'         => 'ids',
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery
					array(
						'key'     => '_ph_name_ar',
						'value'   => $q,
						'compare' => 'LIKE',
					),
				),
			)
		);
		foreach ( array_slice( array_unique( array_merge( $ids, $mq->posts ) ), 0, 12 ) as $id ) {
			$p = wc_get_product( $id );
			if ( $p && $p->is_visible() ) {
				$out[] = array(
					'name'  => $p->get_name(),
					'price' => ph_plain_price( wc_get_price_to_display( $p ) ),
					'img'   => ph_product_img( $p, 'woocommerce_thumbnail' ),
					'url'   => $p->get_permalink(),
				);
			}
		}
	}
	wp_send_json( $out );
}
add_action( 'wc_ajax_ph_search', 'ph_ajax_search' );

/**
 * wc-ajax=ph_wish — wishlist. Returns fresh card data for the given product ids.
 * Logged-in shoppers: the list is merged with (or, with replace=1, saved to) their account.
 */
function ph_ajax_wish() {
	// phpcs:disable WordPress.Security.NonceVerification -- checked below for logged-in writes; guests only read public product data.
	$ids = isset( $_POST['ids'] ) ? array_filter( array_map( 'absint', explode( ',', sanitize_text_field( wp_unslash( $_POST['ids'] ) ) ) ) ) : array();
	$uid = get_current_user_id();
	if ( $uid ) {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['nonce'] ) ), 'ph_wish' ) ) {
			wp_send_json_error( null, 403 );
		}
		$saved = array_filter( array_map( 'absint', (array) get_user_meta( $uid, 'ph_wishlist', true ) ) );
		$ids   = empty( $_POST['replace'] ) ? array_merge( $saved, $ids ) : $ids;
	}
	// phpcs:enable
	$ids = array_slice( array_values( array_unique( $ids ) ), 0, 100 );
	$out = array();
	foreach ( $ids as $id ) {
		$p = wc_get_product( $id );
		if ( $p && $p->is_visible() ) {
			$out[] = json_decode( ph_wish_data( $p ), true );
		}
	}
	if ( $uid ) {
		update_user_meta( $uid, 'ph_wishlist', wp_list_pluck( $out, 'id' ) );
	}
	wp_send_json( $out );
}
add_action( 'wc_ajax_ph_wish', 'ph_ajax_wish' );

/** Wishlist nonce for logged-in shoppers (their pages aren't cached). */
add_action(
	'wp_enqueue_scripts',
	function () {
		if ( is_user_logged_in() ) {
			wp_add_inline_script( 'ph-main', 'window.PH=window.PH||{};PH.user=1;PH.wnonce=' . wp_json_encode( wp_create_nonce( 'ph_wish' ) ) . ';', 'before' );
		}
	},
	20
);

/* Product page ------------------------------------------------------------- */

/** Quantity +/- around WooCommerce's quantity field. */
add_action( 'woocommerce_before_quantity_input_field', fn() => print '<button type="button" class="qminus" aria-label="' . esc_attr__( 'Less', 'potteryhub' ) . '">−</button>' );
add_action( 'woocommerce_after_quantity_input_field', fn() => print '<button type="button" class="qplus" aria-label="' . esc_attr__( 'More', 'potteryhub' ) . '">+</button>' );

/* Checkout ------------------------------------------------------------------ */

/** Checkout fields: phone required (we call to confirm), no company, Egyptian-friendly order. */
add_filter(
	'woocommerce_checkout_fields',
	function ( $f ) {
		unset( $f['billing']['billing_company'], $f['shipping']['shipping_company'] );
		$order = array(
			'first_name' => 10,
			'last_name'  => 20,
			'phone'      => 30,
			'email'      => 40,
			'country'    => 50,
			'state'      => 60,
			'city'       => 70,
			'address_1'  => 80,
			'address_2'  => 90,
			'postcode'   => 100,
		);
		foreach ( array( 'billing', 'shipping' ) as $g ) {
			foreach ( $order as $k => $prio ) {
				if ( isset( $f[ $g ][ $g . '_' . $k ] ) ) {
					$f[ $g ][ $g . '_' . $k ]['priority'] = $prio;
				}
			}
		}
		if ( isset( $f['billing']['billing_phone'] ) ) {
			$f['billing']['billing_phone']['required'] = true;
			$f['billing']['billing_phone']['class']    = array( 'form-row-first' );
		}
		if ( isset( $f['billing']['billing_email'] ) ) {
			$f['billing']['billing_email']['class'] = array( 'form-row-last' );
		}
		if ( isset( $f['order']['order_comments'] ) ) {
			$f['order']['order_comments']['placeholder'] = __( 'Landmark, best time to call, gift note…', 'potteryhub' );
		}
		return $f;
	}
);

/** Egypt: no postcode, governorate + city side by side. */
add_filter(
	'woocommerce_get_country_locale',
	function ( $l ) {
		$l['EG'] = array_merge(
			isset( $l['EG'] ) ? $l['EG'] : array(),
			array(
				'postcode' => array(
					'required' => false,
					'hidden'   => true,
				),
				'state'    => array(
					'label'    => __( 'Governorate', 'potteryhub' ),
					'required' => true,
					'class'    => array( 'form-row-first', 'address-field' ),
				),
				'city'     => array(
					'label' => __( 'City / Area', 'potteryhub' ),
					'class' => array( 'form-row-last', 'address-field' ),
				),
			)
		);
		return $l;
	}
);

/** Keep our field order after WooCommerce's address script re-sorts by country; phone is required. */
add_filter(
	'woocommerce_get_country_locale_default',
	function ( $d ) {
		$prio = array(
			'first_name' => 10,
			'last_name'  => 20,
			'phone'      => 30,
			'country'    => 50,
			'state'      => 60,
			'city'       => 70,
			'address_1'  => 80,
			'address_2'  => 90,
			'postcode'   => 100,
		);
		foreach ( $prio as $k => $p ) {
			$d[ $k ]             = isset( $d[ $k ] ) ? $d[ $k ] : array();
			$d[ $k ]['priority'] = $p;
		}
		$d['phone']['required'] = true;
		return $d;
	},
	20
);

/** Arabic checkout privacy note (when the store still uses WooCommerce's default English text). */
add_filter(
	'woocommerce_get_privacy_policy_text',
	function ( $text, $type ) {
		if ( ph_is_ar() && false !== strpos( $text, 'Your personal data will be used' ) ) {
			return 'checkout' === $type
				? 'هنستخدم بياناتك الشخصية عشان ننفّذ طلبك ونحسّن تجربتك على الموقع، وللأغراض الموضحة في [privacy_policy].'
				: 'هنستخدم بياناتك الشخصية لإدارة حسابك وللأغراض الموضحة في [privacy_policy].';
		}
		return $text;
	},
	10,
	2
);

/** "Delivery" instead of "Shipping"/"Shipment" in the order summary. */
add_filter( 'woocommerce_shipping_package_name', fn() => __( 'Delivery', 'potteryhub' ) );

/** Buy now goes straight to checkout: skip the "added to your cart" notice there. */
add_filter(
	'woocommerce_add_to_cart_redirect',
	function ( $url ) {
		if ( ! empty( $_REQUEST['ph_buy_now'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			wc_clear_notices();
		}
		return $url;
	},
	100
);

/** Coupon field inside the order summary (fills WooCommerce's own coupon form). */
remove_action( 'woocommerce_before_checkout_form', 'woocommerce_checkout_coupon_form', 10 );
add_action(
	'woocommerce_checkout_before_order_review',
	function () {
		if ( ! wc_coupons_enabled() ) {
			return;
		}
		echo '<details class="co-coupon"><summary>' . esc_html__( 'Have a coupon?', 'potteryhub' ) . '</summary><div class="co-cpn"><input type="text" id="phCoupon" placeholder="' . esc_attr__( 'Coupon code', 'potteryhub' ) . '" autocomplete="off"><button type="button" id="phCouponApply">' . esc_html__( 'Apply', 'potteryhub' ) . '</button></div></details>';
	}
);

/** Place order button shows the total. */
add_filter(
	'woocommerce_order_button_html',
	function ( $html ) {
		if ( ! WC()->cart ) {
			return $html;
		}
		$label = __( 'Place order', 'potteryhub' ) . ' · ' . ph_plain_price( WC()->cart->get_total( 'edit' ) );
		return '<button type="submit" class="button alt" name="woocommerce_checkout_place_order" id="place_order" value="' . esc_attr( $label ) . '" data-value="' . esc_attr( $label ) . '">' . ph_icon( 'check', 18, 2 ) . ' ' . esc_html( $label ) . '</button>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
);

/** Body class on WooCommerce pages so the header is solid. */
add_filter(
	'body_class',
	function ( $c ) {
		if ( ! is_front_page() ) {
			$c[] = 'ph-inner';
		}
		return $c;
	}
);
