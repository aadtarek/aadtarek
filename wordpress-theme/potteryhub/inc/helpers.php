<?php
/**
 * Template helpers: icons, product cards, prices, categories.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

/** Inline SVG icons (stroke = currentColor). */
function ph_icon( $name, $size = 16, $stroke = 1.8 ) {
	$p = array(
		'arrow'  => '<path d="M5 12h14M13 6l6 6-6 6"/>',
		'back'   => '<path d="M19 12H5M11 6l-6 6 6 6"/>',
		'bag'    => '<path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
		'home'   => '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
		'grid'   => '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
		'info'   => '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.2"/>',
		'book'   => '<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v14H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>',
		'leaf'   => '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7"/>',
		'fire'   => '<path d="M12 21c-3.6 0-6-2.4-6-5.6 0-3.4 2.6-5 3.4-8.4 1.9 1.3 2.6 3 2.6 4.6.9-.6 1.6-1.8 1.8-3 2 1.6 4.2 4 4.2 6.8 0 3.2-2.4 5.6-6 5.6z"/>',
		'truck'  => '<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
		'hand'   => '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11.5V5a1.5 1.5 0 0 1 3 0v6.5M14 11.5V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.6 0-4-1.3-5.4-3.4L3.8 14.7a1.5 1.5 0 0 1 2.4-1.8L8 15"/>',
		'heart'  => '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
		'search' => '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
		'close'  => '<path d="M6 6l12 12M18 6 6 18"/>',
		'menu'   => '<path d="M3 7h18M3 12h12M3 17h18"/>',
		'filter' => '<path d="M4 6h16M7 12h10M10 18h4"/>',
		'user'   => '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4.2 4.4-6.2 8-6.2s6.8 2 8 6.2"/>',
		'fb'     => '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z"/>',
		'ig'     => '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/>',
		'check'  => '<path d="M5 12.5 10 17 19 7"/>',
		'chat'   => '<path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5z"/><path d="M9 10.5c.3 1.6 1.9 3.3 3.6 3.8l1.2-1.1 1.7.8"/>',
		'phone'  => '<path d="M5 4h3.5l1.5 4-2 1.3a10.5 10.5 0 0 0 6.7 6.7L16 14l4 1.5V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4z"/>',
		'mail'   => '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
		'pin'    => '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
		'clock'  => '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
	);
	if ( ! isset( $p[ $name ] ) ) {
		return '';
	}
	return '<svg class="ic" width="' . (int) $size . '" height="' . (int) $size . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' . esc_attr( $stroke ) . '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $p[ $name ] . '</svg>';
}

/** Theme image URL. */
function ph_img( $file ) {
	return PH_URI . '/assets/img/' . $file;
}

/** Main image URL of a product. */
function ph_product_img( $product, $size = 'woocommerce_single' ) {
	$id = $product->get_image_id();
	$u  = $id ? wp_get_attachment_image_url( $id, $size ) : '';
	return $u ? $u : wc_placeholder_img_src( $size );
}

/** Discount percent for products on sale (0 when not on sale). */
function ph_discount( $product ) {
	if ( ! $product->is_on_sale() ) {
		return 0;
	}
	if ( $product->is_type( 'variable' ) ) {
		$max = 0;
		foreach ( $product->get_variation_prices()['regular_price'] as $vid => $reg ) {
			$sale = $product->get_variation_prices()['sale_price'][ $vid ];
			if ( $reg > 0 && $sale < $reg ) {
				$max = max( $max, round( ( $reg - $sale ) / $reg * 100 ) );
			}
		}
		return (int) $max;
	}
	$reg  = (float) $product->get_regular_price();
	$sale = (float) $product->get_sale_price();
	return $reg > 0 && $sale > 0 && $sale < $reg ? (int) round( ( $reg - $sale ) / $reg * 100 ) : 0;
}

/** Price markup: current price in <b>, old price in <s>. */
function ph_price( $product ) {
	if ( $product->is_type( 'simple' ) && $product->is_on_sale() ) {
		return '<b>' . wc_price( wc_get_price_to_display( $product ) ) . '</b><s>' . wc_price( wc_get_price_to_display( $product, array( 'price' => $product->get_regular_price() ) ) ) . '</s>';
	}
	return '<b>' . $product->get_price_html() . '</b>';
}

/** Can this product be added to the cart straight from a card? */
function ph_quick_addable( $product ) {
	return $product->is_type( 'simple' ) && $product->is_purchasable() && $product->is_in_stock() && ! $product->is_sold_individually();
}

/** "Buy now" URL: adds the product and goes straight to checkout. */
function ph_buy_url( $product ) {
	if ( ! ph_quick_addable( $product ) ) {
		return $product->get_permalink();
	}
	return add_query_arg(
		array(
			'add-to-cart' => $product->get_id(),
			'ph_buy_now'  => 1,
		),
		home_url( '/' )
	);
}

/** First category name of a product. */
function ph_product_cat( $product ) {
	$ids = $product->get_category_ids();
	if ( ! $ids ) {
		return '';
	}
	$t = get_term( $ids[0], 'product_cat' );
	return $t && ! is_wp_error( $t ) ? $t->name : '';
}

/** Data a heart button stores in the wishlist. */
function ph_wish_data( $product ) {
	return wp_json_encode(
		array(
			'id'    => $product->get_id(),
			'name'  => $product->get_name(),
			'price' => ph_plain_price( wc_get_price_to_display( $product ) ),
			'img'   => ph_product_img( $product, 'woocommerce_thumbnail' ),
			'url'   => $product->get_permalink(),
			'cat'   => ph_product_cat( $product ),
			'add'   => ph_quick_addable( $product ) ? 1 : 0,
		)
	);
}

/** Price as plain text ("EGP 1,100.00"). */
function ph_plain_price( $amount ) {
	return html_entity_decode( wp_strip_all_tags( wc_price( $amount ) ), ENT_QUOTES, 'UTF-8' );
}

/** Five stars filled to the rating (0–5). */
function ph_stars( $rating ) {
	$w = max( 0, min( 100, (float) $rating / 5 * 100 ) );
	/* translators: %s: average rating */
	return '<span class="stars" role="img" aria-label="' . esc_attr( sprintf( __( 'Rated %s out of 5', 'potteryhub' ), number_format_i18n( (float) $rating, 1 ) ) ) . '"><i style="width:' . esc_attr( round( $w, 1 ) ) . '%"></i></span>';
}

/** Product card used on the homepage, shop and related products. */
function ph_card( $product, $i = 0 ) {
	if ( ! $product || ! $product->is_visible() ) {
		return;
	}
	$off  = ph_discount( $product );
	$url  = $product->get_permalink();
	$name = $product->get_name();
	$img  = $product->get_image_id() ? wp_get_attachment_image( $product->get_image_id(), 'woocommerce_single', false, array( 'loading' => 'lazy', 'decoding' => 'async', 'alt' => $name, 'sizes' => '(max-width: 640px) 48vw, (max-width: 1100px) 32vw, 360px' ) ) : wc_placeholder_img( 'woocommerce_single' );
	?>
	<article class="card" data-cur="<?php esc_attr_e( 'View', 'potteryhub' ); ?>" style="--d:<?php echo (int) ( ( $i % 4 ) * 90 ); ?>ms">
		<div class="media">
			<a class="cover" href="<?php echo esc_url( $url ); ?>" aria-label="<?php echo esc_attr( $name ); ?>"></a>
			<?php echo $img; // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<?php if ( $off ) : ?><span class="badge">−<?php echo (int) $off; ?>%</span><?php endif; ?>
			<?php if ( ! $product->is_in_stock() ) : ?><span class="badge sold"><?php esc_html_e( 'Sold out', 'potteryhub' ); ?></span><?php endif; ?>
			<div class="quick">
				<?php if ( ph_quick_addable( $product ) ) : ?>
					<button class="qa" type="button" data-add="<?php echo (int) $product->get_id(); ?>"><?php echo ph_icon( 'bag', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span><?php esc_html_e( 'Add', 'potteryhub' ); ?></span></button>
					<a class="qb" href="<?php echo esc_url( ph_buy_url( $product ) ); ?>" rel="nofollow"><?php esc_html_e( 'Buy now', 'potteryhub' ); ?></a>
				<?php else : ?>
					<a class="qb" href="<?php echo esc_url( $url ); ?>"><?php echo $product->is_in_stock() ? esc_html__( 'Choose options', 'potteryhub' ) : esc_html__( 'View', 'potteryhub' ); ?></a>
				<?php endif; ?>
			</div>
		</div>
		<div class="info">
			<div><div class="cat-l"><?php echo esc_html( ph_product_cat( $product ) ); ?></div><h4><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $name ); ?></a></h4></div>
			<div class="pr"><?php echo ph_price( $product ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		</div>
	</article>
	<?php
}

/** Shop categories (non-empty, without "Uncategorized"), in admin order. */
function ph_categories( $limit = 0 ) {
	$terms = get_terms(
		array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => true,
			'parent'     => 0,
			'orderby'    => 'count',
			'order'      => 'DESC',
			'exclude'    => array( (int) get_option( 'default_product_cat' ) ),
		)
	);
	if ( is_wp_error( $terms ) ) {
		return array();
	}
	return $limit ? array_slice( $terms, 0, $limit ) : $terms;
}

/** Image for a category: its thumbnail, or its most popular product's image. */
function ph_cat_img( $term, $size = 'woocommerce_single' ) {
	$tid = (int) get_term_meta( $term->term_id, 'thumbnail_id', true );
	if ( $tid ) {
		return wp_get_attachment_image_url( $tid, $size );
	}
	$p = wc_get_products(
		array(
			'limit'    => 1,
			'status'   => 'publish',
			'category' => array( $term->slug ),
			'orderby'  => 'popularity',
			'return'   => 'objects',
		)
	);
	return $p ? ph_product_img( $p[0], $size ) : wc_placeholder_img_src( $size );
}

/** "8 pieces". */
function ph_pieces( $n ) {
	/* translators: %s: number of products */
	return sprintf( _n( '%s piece', '%s pieces', $n, 'potteryhub' ), number_format_i18n( $n ) );
}

/** Best sellers, optionally inside one category. */
function ph_best_sellers( $limit = 8, $cat = '' ) {
	$args = array(
		'limit'      => $limit,
		'status'     => 'publish',
		'visibility' => 'catalog',
		'orderby'    => 'popularity',
		'order'      => 'DESC',
	);
	if ( $cat ) {
		$args['category'] = array( $cat );
	}
	return wc_get_products( $args );
}
