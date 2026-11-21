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
		if ( ph_free_delivery() ) {
			echo '<div class="shipbar">' . ph_icon( 'truck', 17, 1.7 ) . '<span><b>' . esc_html__( 'Free delivery', 'potteryhub' ) . '</b> ' . esc_html__( 'all over Egypt', 'potteryhub' ) . '</span></div>'; // phpcs:ignore WordPress.Security.EscapeOutput
		}
		echo '<div class="tot big"><span>' . esc_html__( 'Subtotal', 'potteryhub' ) . '</span><span>' . WC()->cart->get_cart_subtotal() . '</span></div>'; // phpcs:ignore WordPress.Security.EscapeOutput
		echo '<a class="btn wide" href="' . esc_url( wc_get_checkout_url() ) . '">' . esc_html__( 'Checkout', 'potteryhub' ) . ' ' . ph_icon( 'arrow', 16, 2 ) . '</a>'; // phpcs:ignore WordPress.Security.EscapeOutput
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

/**
 * Checkout asks for: full name, phone, email (optional), governorate and the
 * full address. The country is always Egypt; no city, postcode, second
 * address or order notes.
 */
add_filter(
	'woocommerce_checkout_fields',
	function ( $f ) {
		$keep = array(
			'billing_first_name' => array(
				'label'        => __( 'Full name', 'potteryhub' ),
				'placeholder'  => '',
				'class'        => array( 'form-row-wide' ),
				'priority'     => 10,
				'required'     => true,
				'autocomplete' => 'name',
			),
			'billing_phone'      => array(
				'label'       => __( 'Phone number', 'potteryhub' ),
				'placeholder' => '01xxxxxxxxx',
				'class'       => array( 'form-row-wide' ),
				'priority'    => 20,
				'required'    => true,
				'type'        => 'tel',
				'validate'    => array( 'phone' ),
			),
			'billing_email'      => array(
				'type'         => 'email',
				'label'        => __( 'Email', 'potteryhub' ),
				'placeholder'  => __( 'To get your order confirmation', 'potteryhub' ),
				'class'        => array( 'form-row-wide' ),
				'priority'     => 22,
				'required'     => false,
				'validate'     => array( 'email' ),
				'autocomplete' => 'email',
			),
			'billing_country'    => array(
				'type'     => 'hidden',
				'label'    => '',
				'class'    => array( 'ph-hidden' ),
				'priority' => 25,
				'required' => true,
				'default'  => 'EG',
			),
			'billing_state'      => array(
				'type'        => 'state',
				'country'     => 'EG',
				'label'       => __( 'Governorate', 'potteryhub' ),
				'placeholder' => __( 'Choose your governorate', 'potteryhub' ),
				'class'       => array( 'form-row-wide', 'address-field', 'update_totals_on_change' ),
				'priority'    => 30,
				'required'    => true,
				'validate'    => array( 'state' ),
			),
			'billing_address_1'  => array(
				'type'         => 'textarea',
				'label'        => __( 'Full address', 'potteryhub' ),
				'placeholder'  => __( 'Area, street, building number, floor, apartment, nearby landmark', 'potteryhub' ),
				'class'        => array( 'form-row-wide' ),
				'priority'     => 40,
				'required'     => true,
				'autocomplete' => 'street-address',
			),
		);
		foreach ( array_keys( $f['billing'] ) as $k ) {
			if ( ! isset( $keep[ $k ] ) ) {
				unset( $f['billing'][ $k ] );
			}
		}
		foreach ( $keep as $k => $v ) {
			$f['billing'][ $k ] = array_merge( isset( $f['billing'][ $k ] ) ? $f['billing'][ $k ] : array(), $v );
		}
		$f['shipping'] = array();
		$f['order']    = array();
		return $f;
	},
	99
);

/** The country is always Egypt. */
add_filter(
	'woocommerce_checkout_get_value',
	function ( $value, $input ) {
		return in_array( $input, array( 'billing_country', 'shipping_country' ), true ) ? 'EG' : $value;
	},
	10,
	2
);
add_action(
	'woocommerce_checkout_update_order_review',
	function () {
		if ( WC()->customer ) {
			WC()->customer->set_billing_country( 'EG' );
			WC()->customer->set_shipping_country( 'EG' );
		}
	}
);

/** Deliver to the address above (no second address, no notes box). */
add_filter( 'woocommerce_cart_needs_shipping_address', '__return_false' );
add_filter( 'woocommerce_enable_order_notes_field', '__return_false' );

/** Store the order cleanly: copy the address to shipping, and use the account email when logged in. */
add_action(
	'woocommerce_checkout_create_order',
	function ( $order ) {
		$order->set_billing_country( 'EG' );
		$order->set_shipping_first_name( $order->get_billing_first_name() );
		$order->set_shipping_address_1( $order->get_billing_address_1() );
		$order->set_shipping_state( $order->get_billing_state() );
		$order->set_shipping_country( 'EG' );
		$order->set_shipping_phone( $order->get_billing_phone() );
		if ( ! $order->get_billing_email() && is_user_logged_in() ) {
			$order->set_billing_email( wp_get_current_user()->user_email );
		}
	}
);

/** Egyptian mobile numbers: 11 digits starting with 01 (or +20 / 0020). */
add_action(
	'woocommerce_after_checkout_validation',
	function ( $data, $errors ) {
		$p = preg_replace( '/[\s\-\(\)]/', '', (string) ( $data['billing_phone'] ?? '' ) );
		$p = preg_replace( '/^(\+|00)20/', '0', $p );
		if ( $p && ! preg_match( '/^01[0125]\d{8}$/', $p ) && ! preg_match( '/^0\d{8,9}$/', $p ) ) {
			$errors->add( 'billing_phone', __( 'Please enter a valid Egyptian phone number (e.g. 01012345678).', 'potteryhub' ), array( 'id' => 'billing_phone' ) );
		}
	},
	10,
	2
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

/** No link to a privacy page that isn't published (it would open a "not found" page). */
add_filter(
	'woocommerce_get_privacy_policy_text',
	function ( $text ) {
		$id = (int) get_option( 'wp_page_for_privacy_policy' );
		if ( $id && 'publish' !== get_post_status( $id ) ) {
			$text = str_replace( '[privacy_policy]', ph_is_ar() ? 'سياسة الخصوصية' : __( 'privacy policy', 'woocommerce' ), $text );
		}
		return $text;
	},
	20
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

/** Error messages say "Full name is required", not "Billing Full name…". */
add_filter(
	'gettext_with_context_woocommerce',
	function ( $t, $text, $context ) {
		return 'checkout-validation' === $context && 'Billing %s' === $text ? '%s' : $t;
	},
	10,
	3
);

/** Governorate starts empty so the shopper picks it (and the right delivery price). */
add_filter( 'default_checkout_billing_state', fn( $v ) => is_user_logged_in() ? $v : '' );

/* Shop toolbar ------------------------------------------------------------- */

/** Sorting options (short labels). */
add_filter(
	'woocommerce_catalog_orderby',
	function () {
		return array(
			'menu_order' => __( 'Featured', 'potteryhub' ),
			'popularity' => __( 'Best selling', 'potteryhub' ),
			'date'       => __( 'Newest', 'potteryhub' ),
			'price'      => __( 'Price: low to high', 'potteryhub' ),
			'price-desc' => __( 'Price: high to low', 'potteryhub' ),
		);
	}
);

/** Sorting dropdown (plain links, so it works without JavaScript and with caching). */
function ph_sort_menu() {
	if ( ! wc_get_loop_prop( 'is_paginated' ) || ! woocommerce_products_will_display() ) {
		return;
	}
	$opts    = apply_filters( 'woocommerce_catalog_orderby', array() );
	$default = apply_filters( 'woocommerce_default_catalog_orderby', get_option( 'woocommerce_default_catalog_orderby', 'menu_order' ) );
	$current = isset( $_GET['orderby'] ) ? wc_clean( wp_unslash( $_GET['orderby'] ) ) : $default; // phpcs:ignore WordPress.Security.NonceVerification
	if ( ! isset( $opts[ $current ] ) ) {
		$current = array_key_first( $opts );
	}
	echo '<details class="sort"><summary><span class="sort-l">' . esc_html__( 'Sort', 'potteryhub' ) . '</span><b>' . esc_html( $opts[ $current ] ) . '</b><i class="sort-c" aria-hidden="true"></i></summary><div class="sort-m" role="menu">';
	foreach ( $opts as $k => $label ) {
		$url = preg_replace( '#/page/\d+/?(?=\?|$)#', '/', remove_query_arg( array( 'paged', 'product-page' ), add_query_arg( 'orderby', $k ) ) );
		$url = preg_replace( '#/page/\d+/?#', '/', $url );
		echo '<a role="menuitem" href="' . esc_url( $url ) . '"' . ( $k === $current ? ' class="on" aria-current="true"' : '' ) . ' rel="nofollow">' . esc_html( $label ) . ( $k === $current ? ph_icon( 'check', 15, 2 ) : '' ) . '</a>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	echo '</div></details>';
}

/** Pagination: previous / numbers / next. */
function ph_pagination() {
	global $wp_query;
	$total = (int) $wp_query->max_num_pages;
	if ( $total < 2 ) {
		return;
	}
	$cur  = max( 1, (int) get_query_var( 'paged' ) );
	$base = esc_url_raw( str_replace( 999999999, '%#%', remove_query_arg( 'add-to-cart', get_pagenum_link( 999999999, false ) ) ) );
	$links = paginate_links(
		array(
			'base'      => $base,
			'format'    => '',
			'current'   => $cur,
			'total'     => $total,
			'type'      => 'array',
			'mid_size'  => 1,
			'end_size'  => 1,
			'prev_next' => false,
		)
	);
	$url = fn( $n ) => str_replace( '%#%', $n, $base );
	echo '<nav class="pager" aria-label="' . esc_attr__( 'Pages', 'potteryhub' ) . '">';
	echo $cur > 1 ? '<a class="pg-arrow" href="' . esc_url( $url( $cur - 1 ) ) . '" rel="prev">' . ph_icon( 'back', 16, 2 ) . '<span>' . esc_html__( 'Previous', 'potteryhub' ) . '</span></a>' : '<span class="pg-arrow off">' . ph_icon( 'back', 16, 2 ) . '<span>' . esc_html__( 'Previous', 'potteryhub' ) . '</span></span>'; // phpcs:ignore WordPress.Security.EscapeOutput
	echo '<div class="pg-nums">' . implode( '', (array) $links ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput
	echo $cur < $total ? '<a class="pg-arrow" href="' . esc_url( $url( $cur + 1 ) ) . '" rel="next"><span>' . esc_html__( 'Next', 'potteryhub' ) . '</span>' . ph_icon( 'arrow', 16, 2 ) . '</a>' : '<span class="pg-arrow off"><span>' . esc_html__( 'Next', 'potteryhub' ) . '</span>' . ph_icon( 'arrow', 16, 2 ) . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput
	/* translators: 1: current page, 2: total pages */
	echo '<div class="pg-of">' . esc_html( sprintf( __( 'Page %1$d of %2$d', 'potteryhub' ), $cur, $total ) ) . '</div>';
	echo '</nav>';
}

/** Cart page: no cross-sell block (keeps the summary clean). */
remove_action( 'woocommerce_cart_collaterals', 'woocommerce_cross_sell_display' );

/** Shipping method names set up in English show in Arabic on the Arabic site. */
add_filter(
	'woocommerce_package_rates',
	function ( $rates ) {
		if ( ph_is_ar() ) {
			$map = array(
				'Home delivery' => __( 'Home delivery', 'potteryhub' ),
				'Flat rate'     => __( 'Home delivery', 'potteryhub' ),
				'Free shipping' => __( 'Free delivery', 'potteryhub' ),
				'Free delivery' => __( 'Free delivery', 'potteryhub' ),
			);
			foreach ( $rates as $r ) {
				if ( isset( $map[ $r->get_label() ] ) ) {
					$r->set_label( $map[ $r->get_label() ] );
				}
			}
		}
		return $rates;
	},
	20
);

/* Instant search ---------------------------------------------------------- */

/**
 * wc-ajax=ph_search_index — every visible product in one small list, so the
 * search box can filter as you type with no waiting. Cached per language and
 * refreshed whenever a product changes.
 */
function ph_search_index() {
	$lang = ph_lang();
	$key  = 'ph_sidx_' . $lang . '_' . get_option( 'ph_sidx_ver', 1 );
	$out  = get_transient( $key );
	if ( false === $out ) {
		$out = array();
		$ids = wc_get_products(
			array(
				'status'     => 'publish',
				'visibility' => 'catalog',
				'limit'      => 1000,
				'return'     => 'ids',
				'orderby'    => 'popularity',
			)
		);
		foreach ( $ids as $id ) {
			$p = wc_get_product( $id );
			if ( ! $p || ! $p->is_visible() ) {
				continue;
			}
			$cats  = wp_get_post_terms( $id, 'product_cat', array( 'fields' => 'names' ) );
			$out[] = array(
				'n' => $p->get_name(),
				'k' => wp_strip_all_tags( get_post_field( 'post_title', $id ) . ' ' . get_post_meta( $id, '_ph_name_ar', true ) . ' ' . $p->get_sku() . ' ' . implode( ' ', is_wp_error( $cats ) ? array() : $cats ) ),
				'p' => ph_plain_price( wc_get_price_to_display( $p ) ),
				'i' => ph_product_img( $p, 'woocommerce_thumbnail' ),
				'u' => $p->get_permalink(),
			);
		}
		set_transient( $key, $out, DAY_IN_SECONDS );
	}
	wp_send_json(
		array(
			'v' => (int) get_option( 'ph_sidx_ver', 1 ),
			'l' => $out,
		)
	);
}
add_action( 'wc_ajax_ph_search_index', 'ph_search_index' );

/** A product changed: bump the index version (old cached copies expire). */
foreach ( array( 'woocommerce_update_product', 'woocommerce_new_product', 'woocommerce_delete_product', 'woocommerce_trash_product', 'woocommerce_product_set_stock_status', 'edited_product_cat' ) as $ph_hook ) {
	add_action( $ph_hook, fn() => update_option( 'ph_sidx_ver', (int) get_option( 'ph_sidx_ver', 1 ) + 1, true ) );
}

/* Instant page loads: handled in main.js (pages open without a reload). */

/**
 * Delivery prices by governorate, so the checkout total changes the moment a
 * governorate is picked (WooCommerce confirms it right after).
 */
/** True when delivery costs nothing everywhere the store ships (so the site can say so). */
function ph_free_delivery() {
	static $free = null;
	if ( null === $free ) {
		$m     = ph_ship_map();
		$costs = array_merge( array_values( $m['s'] ), null === $m['def'] ? array() : array( $m['def'] ) );
		$free  = $costs && 0.0 === (float) max( $costs );
	}
	return $free;
}

function ph_ship_map() {
	$map = array(
		'def' => null,
		's'   => array(),
	);
	if ( ! class_exists( 'WC_Shipping_Zones' ) ) {
		return $map;
	}
	foreach ( WC_Shipping_Zones::get_zones() as $z ) {
		$cost = null;
		foreach ( $z['shipping_methods'] as $m ) {
			if ( 'yes' === $m->enabled && 'flat_rate' === $m->id && is_numeric( $m->get_option( 'cost' ) ) ) {
				$cost = (float) $m->get_option( 'cost' );
				break;
			}
			if ( 'yes' === $m->enabled && 'free_shipping' === $m->id && ! $m->get_option( 'requires' ) ) {
				$cost = 0.0;
				break;
			}
		}
		if ( null === $cost ) {
			continue;
		}
		foreach ( $z['zone_locations'] as $loc ) {
			if ( 'state' === $loc->type && 0 === strpos( $loc->code, 'EG:' ) && ! isset( $map['s'][ substr( $loc->code, 3 ) ] ) ) {
				$map['s'][ substr( $loc->code, 3 ) ] = $cost;
			} elseif ( 'country' === $loc->type && 'EG' === $loc->code && null === $map['def'] ) {
				$map['def'] = $cost;
			}
		}
	}
	return $map;
}
add_action(
	'wp_enqueue_scripts',
	function () {
		// Every page loads the same scripts (and the same combined file under caching plugins), so
		// any page — cart, checkout and account included — opens without a reload. Cart, checkout,
		// address and password-meter scripts are replaced by the theme's own code in main.js.
		wp_enqueue_script( 'wc-add-to-cart-variation' );
		wp_enqueue_script( 'wc-single-product' );
	},
	21
);
add_action(
	'wp_enqueue_scripts',
	function () {
		foreach ( array( 'wc-cart', 'wc-checkout', 'wc-country-select', 'wc-address-i18n', 'selectWoo', 'select2', 'wc-password-strength-meter', 'password-strength-meter', 'zxcvbn-async', 'wc-account-i18n' ) as $h ) {
			wp_dequeue_script( $h );
		}
		foreach ( array( 'select2' ) as $h ) {
			wp_dequeue_style( $h );
		}
	},
	100
);
