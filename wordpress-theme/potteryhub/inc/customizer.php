<?php
/**
 * Customizer: hero slides, promos, workshop band, product page texts, social links.
 * Every text has an "(Arabic)" twin used on the Arabic site.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

/** Default texts (also used for translation). */
function ph_defaults() {
	return array(
		'ph_hero1_eb'   => 'House of Pottery',
		'ph_hero1_t'    => 'Handmade in Egypt',
		'ph_hero1_p'    => 'Ceramics shaped, glazed and fired by hand — pieces with warmth, character and a story.',
		'ph_hero1_cta'  => 'Shop the collection',
		'ph_hero2_eb'   => 'Bowls & serving',
		'ph_hero2_t'    => 'Made for full tables',
		'ph_hero2_p'    => 'Speckled, ribbed and scalloped pieces that turn every dinner into an occasion.',
		'ph_hero2_cta'  => 'Shop bowls',
		'ph_hero3_eb'   => 'Mugs & cups',
		'ph_hero3_t'    => 'For slow mornings',
		'ph_hero3_p'    => 'Hand-thrown mugs, cups and saucers for the first quiet hour of the day.',
		'ph_hero3_cta'  => 'Shop mugs',
		'ph_promo1_eb'  => 'Sets & bundles',
		'ph_promo1_t'   => 'Serve it all, together',
		'ph_promo1_p'   => 'Nested bowl sets and serving platters, matched by hand for full tables.',
		'ph_promo1_cta' => 'Shop sets',
		'ph_promo2_eb'  => 'Everyday pieces',
		'ph_promo2_t'   => 'Mugs for every morning',
		'ph_promo2_p'   => 'Speckled, reactive and matte glazes for every morning.',
		'ph_promo2_cta' => 'Shop mugs',
		'ph_band_eb'    => 'Workshops',
		'ph_band_t'     => 'Get to know pottery',
		'ph_band_p'     => 'Sit at the wheel, feel the clay and leave with a piece you made yourself.',
		'ph_band_cta'   => 'Ask about the next class',
		'ph_about'      => 'Where creativity meets craftsmanship. We make handmade ceramics that bring warmth, character and artistic charm to everyday life — shaped and glazed in Egypt.',
		'ph_care'       => 'Wash gently with warm water and a soft sponge. Avoid sudden temperature changes, and let the piece cool before washing.',
		'ph_delivery'   => 'We call you to confirm your order and delivery details.',
	);
}

/** Get a customizable text in the current language. */
function ph_mod( $key ) {
	$d = ph_defaults();
	return ph_text( $key, isset( $d[ $key ] ) ? $d[ $key ] : '' );
}

/** Default slugs for hero / promo links (matched to the store's categories). */
function ph_default_cat( $key ) {
	$map = array(
		'ph_hero2_cat'  => 'bowls',
		'ph_hero3_cat'  => 'mugs',
		'ph_promo1_cat' => 'bowls',
		'ph_promo2_cat' => 'mugs',
	);
	return isset( $map[ $key ] ) ? $map[ $key ] : '';
}

/** Link to a category set in the Customizer (falls back to the shop). */
function ph_cat_link( $key ) {
	$slug = get_theme_mod( $key, ph_default_cat( $key ) );
	if ( $slug ) {
		$t = get_term_by( 'slug', $slug, 'product_cat' );
		if ( $t && ! is_wp_error( $t ) ) {
			return get_term_link( $t );
		}
	}
	return class_exists( 'WooCommerce' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
}

add_action(
	'customize_register',
	function ( WP_Customize_Manager $wp ) {
		$d    = ph_defaults();
		$cats = array( '' => __( '— Whole shop —', 'potteryhub' ) );
		foreach ( get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => false ) ) as $t ) {
			if ( ! is_wp_error( $t ) ) {
				$cats[ $t->slug ] = $t->name;
			}
		}
		$wp->add_panel( 'ph', array( 'title' => __( 'Pottery Hub', 'potteryhub' ), 'priority' => 30 ) );

		$text = function ( $section, $key, $label, $area = false ) use ( $wp, $d ) {
			foreach ( array( '' => '', '_ar' => ' (' . __( 'Arabic', 'potteryhub' ) . ')' ) as $suf => $lab ) {
				$wp->add_setting( $key . $suf, array( 'default' => '' === $suf ? $d[ $key ] : '', 'sanitize_callback' => $area ? 'sanitize_textarea_field' : 'sanitize_text_field' ) );
				$wp->add_control( $key . $suf, array( 'label' => $label . $lab, 'section' => $section, 'type' => $area ? 'textarea' : 'text' ) );
			}
		};
		$img = function ( $section, $key, $label, $default ) use ( $wp ) {
			$wp->add_setting( $key, array( 'default' => $default, 'sanitize_callback' => 'esc_url_raw' ) );
			$wp->add_control( new WP_Customize_Image_Control( $wp, $key, array( 'label' => $label, 'section' => $section ) ) );
		};
		$cat = function ( $section, $key, $label ) use ( $wp, $cats ) {
			$wp->add_setting( $key, array( 'default' => ph_default_cat( $key ), 'sanitize_callback' => 'sanitize_title' ) );
			$wp->add_control( $key, array( 'label' => $label, 'section' => $section, 'type' => 'select', 'choices' => $cats ) );
		};

		for ( $i = 1; $i <= 3; $i++ ) {
			$s = 'ph_hero' . $i;
			/* translators: %d: slide number */
			$wp->add_section( $s, array( 'title' => sprintf( __( 'Hero slide %d', 'potteryhub' ), $i ), 'panel' => 'ph' ) );
			$img( $s, $s . '_img', __( 'Photo (wide, 2400px+)', 'potteryhub' ), ph_img( 'hero-' . $i . '.jpg' ) );
			$wp->add_setting( $s . '_fx', array( 'default' => array( 80, 64, 42 )[ $i - 1 ], 'sanitize_callback' => 'absint' ) );
			$wp->add_control( $s . '_fx', array( 'label' => __( 'Focus point, left → right (%)', 'potteryhub' ), 'section' => $s, 'type' => 'range', 'input_attrs' => array( 'min' => 0, 'max' => 100 ) ) );
			$text( $s, $s . '_eb', __( 'Small label', 'potteryhub' ) );
			$text( $s, $s . '_t', __( 'Title', 'potteryhub' ) );
			$text( $s, $s . '_p', __( 'Text', 'potteryhub' ), true );
			$text( $s, $s . '_cta', __( 'Button', 'potteryhub' ) );
			$cat( $s, $s . '_cat', __( 'Button opens', 'potteryhub' ) );
		}
		for ( $i = 1; $i <= 2; $i++ ) {
			$s = 'ph_promo' . $i;
			/* translators: %d: banner number */
			$wp->add_section( $s, array( 'title' => sprintf( __( 'Promo banner %d', 'potteryhub' ), $i ), 'panel' => 'ph' ) );
			$img( $s, $s . '_img', __( 'Image (optional — defaults to the category image)', 'potteryhub' ), '' );
			$text( $s, $s . '_eb', __( 'Small label', 'potteryhub' ) );
			$text( $s, $s . '_t', __( 'Title', 'potteryhub' ) );
			$text( $s, $s . '_p', __( 'Text', 'potteryhub' ), true );
			$text( $s, $s . '_cta', __( 'Button', 'potteryhub' ) );
			$cat( $s, $s . '_cat', __( 'Button opens', 'potteryhub' ) );
		}
		$wp->add_section( 'ph_band', array( 'title' => __( 'Workshops section', 'potteryhub' ), 'panel' => 'ph' ) );
		$img( 'ph_band', 'ph_band_img', __( 'Photo', 'potteryhub' ), 'https://potteryhubeg.com/wp-content/uploads/2024/07/w-hmp-video-2-image.jpg' );
		$text( 'ph_band', 'ph_band_eb', __( 'Small label', 'potteryhub' ) );
		$text( 'ph_band', 'ph_band_t', __( 'Title', 'potteryhub' ) );
		$text( 'ph_band', 'ph_band_p', __( 'Text', 'potteryhub' ), true );
		$text( 'ph_band', 'ph_band_cta', __( 'Button', 'potteryhub' ) );
		$wp->add_setting( 'ph_band_url', array( 'default' => 'https://www.facebook.com/profile.php?id=61595757980356', 'sanitize_callback' => 'esc_url_raw' ) );
		$wp->add_control( 'ph_band_url', array( 'label' => __( 'Button link', 'potteryhub' ), 'section' => 'ph_band', 'type' => 'url' ) );

		$wp->add_section( 'ph_texts', array( 'title' => __( 'Footer & product page texts', 'potteryhub' ), 'panel' => 'ph' ) );
		$text( 'ph_texts', 'ph_about', __( 'Footer text', 'potteryhub' ), true );
		$text( 'ph_texts', 'ph_care', __( 'Product page — Care', 'potteryhub' ), true );
		$text( 'ph_texts', 'ph_delivery', __( 'Product page — Delivery', 'potteryhub' ), true );

		$wp->add_section( 'ph_social', array( 'title' => __( 'Social links', 'potteryhub' ), 'panel' => 'ph' ) );
		foreach ( array( 'ph_facebook' => array( 'Facebook', 'https://www.facebook.com/profile.php?id=61595757980356' ), 'ph_instagram' => array( 'Instagram', '' ) ) as $k => $v ) {
			$wp->add_setting( $k, array( 'default' => $v[1], 'sanitize_callback' => 'esc_url_raw' ) );
			$wp->add_control( $k, array( 'label' => $v[0], 'section' => 'ph_social', 'type' => 'url' ) );
		}
	}
);
