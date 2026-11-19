<?php
/**
 * Basic SEO & sharing tags (description, Open Graph, Twitter) — only when no
 * SEO plugin (Yoast, Rank Math, AIOSEO, SEOPress) is active.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

function ph_has_seo_plugin() {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' ) || class_exists( 'The_SEO_Framework\Load' );
}

add_action(
	'wp_head',
	function () {
		if ( ph_has_seo_plugin() || is_404() ) {
			return;
		}
		$title = wp_get_document_title();
		$desc  = ph_mod( 'ph_about' );
		$img   = ph_img( 'hero-1.jpg' );
		$type  = 'website';
		$wc    = class_exists( 'WooCommerce' );

		if ( $wc && is_product() ) {
			$p = wc_get_product( get_queried_object_id() );
			if ( $p ) {
				$desc = $p->get_short_description() ? $p->get_short_description() : $p->get_description();
				$img  = ph_product_img( $p, 'full' );
				$type = 'product';
			}
		} elseif ( $wc && is_product_category() ) {
			$t    = get_queried_object();
			$desc = $t->description ? $t->description : $desc;
			$img  = ph_cat_img( $t, 'full' );
		} elseif ( is_singular() ) {
			$ex   = get_the_excerpt( get_queried_object_id() );
			$desc = $ex ? $ex : $desc;
			$th   = get_the_post_thumbnail_url( get_queried_object_id(), 'full' );
			$img  = $th ? $th : $img;
			$type = is_single() ? 'article' : 'website';
		}
		$desc = wp_trim_words( wp_strip_all_tags( strip_shortcodes( (string) $desc ) ), 32, '…' );
		$url  = ph_current_url();

		echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
		$tags = array(
			'og:site_name'   => get_bloginfo( 'name' ),
			'og:type'        => $type,
			'og:title'       => $title,
			'og:description' => $desc,
			'og:url'         => $url,
			'og:image'       => $img,
			'og:locale'      => ph_is_ar() ? 'ar_EG' : 'en_US',
		);
		foreach ( $tags as $k => $v ) {
			echo '<meta property="' . esc_attr( $k ) . '" content="' . esc_attr( $v ) . '">' . "\n";
		}
		if ( 'product' === $type && isset( $p ) && $p ) {
			echo '<meta property="product:price:amount" content="' . esc_attr( wc_get_price_to_display( $p ) ) . '">' . "\n";
			echo '<meta property="product:price:currency" content="' . esc_attr( get_woocommerce_currency() ) . '">' . "\n";
		}
		echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
		if ( is_singular() || ( $wc && ( is_shop() || is_product_taxonomy() ) ) ) {
			echo '<link rel="canonical" href="' . esc_url( $url ) . '">' . "\n";
		}
	},
	3
);

/* WordPress prints its own canonical on singular pages; ours includes the language. */
add_action(
	'wp',
	function () {
		if ( ! ph_has_seo_plugin() ) {
			remove_action( 'wp_head', 'rel_canonical' );
		}
	}
);
