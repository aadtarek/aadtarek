<?php
/**
 * Appearance → Pottery Hub: one-click setup tools and newsletter subscribers.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'admin_menu',
	function () {
		add_theme_page( __( 'Pottery Hub', 'potteryhub' ), __( 'Pottery Hub', 'potteryhub' ), 'manage_options', 'potteryhub', 'ph_admin_page' );
	}
);

/** Run a tool and return a message. */
function ph_admin_run( $tool ) {
	switch ( $tool ) {
		case 'arabic_names':
			$data = json_decode( (string) file_get_contents( PH_DIR . '/data/ar-translations.json' ), true );
			$n    = 0;
			$c    = 0;
			foreach ( (array) $data['products'] as $row ) {
				$q = new WP_Query(
					array(
						'post_type'      => 'product',
						'post_status'    => 'any',
						'title'          => $row['name'],
						'posts_per_page' => 5,
						'fields'         => 'ids',
						'no_found_rows'  => true,
					)
				);
				foreach ( $q->posts as $id ) {
					if ( ! get_post_meta( $id, '_ph_name_ar', true ) ) {
						update_post_meta( $id, '_ph_name_ar', $row['name_ar'] );
						update_post_meta( $id, '_ph_desc_ar', $row['desc_ar'] );
						$n++;
					}
				}
			}
			foreach ( (array) $data['categories'] as $en => $ar ) {
				$t = get_term_by( 'name', $en, 'product_cat' );
				if ( $t && ! get_term_meta( $t->term_id, 'ph_name_ar', true ) ) {
					update_term_meta( $t->term_id, 'ph_name_ar', $ar );
					$c++;
				}
			}
			/* translators: 1: products count, 2: categories count */
			return sprintf( __( 'Arabic names added to %1$d products and %2$d categories. Existing Arabic names were kept.', 'potteryhub' ), $n, $c );

		case 'classic_checkout':
			$done = 0;
			foreach ( array( 'cart' => '[woocommerce_cart]', 'checkout' => '[woocommerce_checkout]' ) as $page => $code ) {
				$id = wc_get_page_id( $page );
				if ( $id > 0 ) {
					wp_update_post(
						array(
							'ID'           => $id,
							'post_content' => '<!-- wp:shortcode -->' . $code . '<!-- /wp:shortcode -->',
						)
					);
					$done++;
				}
			}
			/* translators: %d: number of pages */
			return sprintf( __( 'Updated %d pages to the theme’s cart & checkout design.', 'potteryhub' ), $done );

		case 'pages':
			$n = ph_create_pages();
			/* translators: %d: number of pages */
			return $n ? sprintf( __( 'Created %d pages (About, Workshops, Contact, Journal) with English and Arabic text. Edit them in Pages.', 'potteryhub' ), $n ) : __( 'The pages already exist.', 'potteryhub' );

		case 'smtp_save':
			return ph_smtp_save();

		case 'smtp_test':
			return ph_smtp_test();

		case 'emails':
			ph_brand_emails( true );
			ph_enable_order_emails();
			return __( 'Order emails now use the shop’s colours and logo. Preview them in WooCommerce → Settings → Emails.', 'potteryhub' );

		case 'shipping':
			// phpcs:ignore WordPress.Security.NonceVerification -- verified in ph_admin_page().
			$near = isset( $_POST['ph_ship_near'] ) ? wc_format_decimal( sanitize_text_field( wp_unslash( $_POST['ph_ship_near'] ) ) ) : '';
			$far  = isset( $_POST['ph_ship_far'] ) ? wc_format_decimal( sanitize_text_field( wp_unslash( $_POST['ph_ship_far'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
			if ( '' === $near || '' === $far ) {
				return __( 'Enter both delivery prices.', 'potteryhub' );
			}
			return ph_setup_shipping( $near, $far );
			require_once ABSPATH . 'wp-admin/includes/translation-install.php';
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
			require_once ABSPATH . 'wp-admin/includes/file.php';
			if ( ! wp_can_install_language_pack() ) {
				return __( 'This server can’t install languages automatically. Go to Settings → General, choose العربية as Site Language, save, then switch back to English.', 'potteryhub' );
			}
			$ok = wp_download_language_pack( 'ar' );
			wp_clean_update_cache();
			wp_update_plugins();
			wp_update_themes();
			$updates = wp_get_translation_updates();
			if ( $updates ) {
				$up = new Language_Pack_Upgrader( new Automatic_Upgrader_Skin() );
				$up->bulk_upgrade( $updates );
			}
			return $ok ? __( 'Arabic language installed for WordPress and WooCommerce.', 'potteryhub' ) : __( 'Couldn’t download the Arabic language. Try again later, or install it from Settings → General.', 'potteryhub' );
	}
	return '';
}

/** Two Egypt delivery zones (Cairo & Giza / rest of Egypt) with a flat price each. */
function ph_setup_shipping( $near, $far ) {
	$zones = array(
		array( __( 'Cairo & Giza', 'potteryhub' ), array( 'EG:EGC', 'EG:EGGZ' ), $near ),
		array( __( 'Rest of Egypt', 'potteryhub' ), array( 'EG' ), $far ),
	);
	foreach ( WC_Shipping_Zones::get_zones() as $z ) {
		foreach ( $zones as $want ) {
			if ( $z['zone_name'] === $want[0] ) {
				WC_Shipping_Zones::delete_zone( $z['id'] );
			}
		}
	}
	foreach ( $zones as $order => $want ) {
		$zone = new WC_Shipping_Zone();
		$zone->set_zone_name( $want[0] );
		$zone->set_zone_order( $order );
		foreach ( $want[1] as $loc ) {
			$zone->add_location( $loc, false === strpos( $loc, ':' ) ? 'country' : 'state' );
		}
		$zone->save();
		$iid = $zone->add_shipping_method( 'flat_rate' );
		update_option(
			'woocommerce_flat_rate_' . $iid . '_settings',
			array(
				'title'      => __( 'Home delivery', 'potteryhub' ),
				'tax_status' => 'none',
				'cost'       => $want[2],
			)
		);
	}
	WC_Cache_Helper::get_transient_version( 'shipping', true );
	/* translators: 1: Cairo & Giza price, 2: other governorates price */
	return sprintf( __( 'Delivery set: Cairo & Giza %1$s, other governorates %2$s. Fine-tune in WooCommerce → Settings → Shipping.', 'potteryhub' ), ph_plain_price( $near ), ph_plain_price( $far ) );
}

function ph_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$msg = '';
	if ( isset( $_POST['ph_tool'], $_POST['_wpnonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_wpnonce'] ) ), 'ph_tools' ) ) {
		$msg = ph_admin_run( sanitize_key( wp_unslash( $_POST['ph_tool'] ) ) );
	}
	if ( isset( $_GET['ph_csv'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		return;
	}
	$subs = get_option( 'ph_subscribers', array() );
	$ar   = in_array( 'ar', get_available_languages(), true );
	$tool = function ( $id, $title, $desc, $btn, $extra = '' ) {
		echo '<div class="card" style="max-width:760px"><h2>' . esc_html( $title ) . '</h2><p>' . esc_html( $desc ) . '</p><form method="post">';
		wp_nonce_field( 'ph_tools' );
		echo $extra; // phpcs:ignore WordPress.Security.EscapeOutput -- built from escaped parts below.
		echo '<input type="hidden" name="ph_tool" value="' . esc_attr( $id ) . '">';
		submit_button( $btn, 'secondary', 'submit', false );
		echo '</form></div>';
	};
	echo '<div class="wrap"><h1>' . esc_html__( 'Pottery Hub', 'potteryhub' ) . '</h1>';
	if ( $msg ) {
		echo '<div class="notice notice-success"><p>' . esc_html( $msg ) . '</p></div>';
	}
	echo '<p>' . esc_html__( 'Texts, hero photos and banners are edited in Appearance → Customize → Pottery Hub.', 'potteryhub' ) . '</p>';
	$tool( 'classic_checkout', __( '1. Cart & checkout design', 'potteryhub' ), __( 'Switches the Cart and Checkout pages to the classic WooCommerce forms that this theme styles.', 'potteryhub' ), __( 'Use theme cart & checkout', 'potteryhub' ) );
	$tool(
		'arabic_pack',
		__( '2. Arabic language', 'potteryhub' ),
		$ar ? __( 'Arabic is installed. Run again to refresh WooCommerce’s Arabic translations.', 'potteryhub' ) : __( 'Installs Arabic for WordPress and WooCommerce so the Arabic site (/ar/) shows Arabic checkout, account and notices. The site language stays English.', 'potteryhub' ),
		__( 'Install Arabic', 'potteryhub' )
	);
	$tool( 'arabic_names', __( '3. Arabic product names', 'potteryhub' ), __( 'Fills the "Arabic name" and "Arabic description" fields of the current 46 products and their categories. New products: fill the fields on the product edit screen.', 'potteryhub' ), __( 'Add Arabic names', 'potteryhub' ) );

	$tool( 'pages', __( '4. About, Workshops & Contact pages', 'potteryhub' ), __( 'Creates the three pages with their designs and starter text in English and Arabic, and adds them to the menu and footer. Your phone, WhatsApp and address go in Customize → Pottery Hub → Contact details.', 'potteryhub' ), __( 'Create pages', 'potteryhub' ) );
	$tool( 'emails', __( '5. Branded order emails', 'potteryhub' ), __( 'Gives WooCommerce’s order emails the shop’s colours and logo.', 'potteryhub' ), __( 'Apply brand to emails', 'potteryhub' ) );
	if ( class_exists( 'WooCommerce' ) ) {
		$cur   = get_woocommerce_currency_symbol();
		$field = function ( $name, $label ) use ( $cur ) {
			return '<p><label>' . esc_html( $label ) . ' <input type="number" min="0" step="1" name="' . esc_attr( $name ) . '" class="small-text" required> ' . esc_html( $cur ) . '</label></p>';
		};
		$tool( 'shipping', __( '6. Delivery prices in Egypt', 'potteryhub' ), __( 'Creates two delivery zones — Cairo & Giza, and the rest of Egypt — each with its own price. Running it again replaces these two zones.', 'potteryhub' ), __( 'Save delivery prices', 'potteryhub' ), $field( 'ph_ship_near', __( 'Cairo & Giza', 'potteryhub' ) ) . $field( 'ph_ship_far', __( 'Other governorates', 'potteryhub' ) ) );
	}

	echo '<div id="smtp"></div>';
	ph_smtp_card();

	$msgs = get_option( 'ph_messages', array() );
	echo '<div class="card" style="max-width:760px"><h2>' . esc_html__( 'Messages & workshop requests', 'potteryhub' ) . ' (' . count( $msgs ) . ')</h2>';
	if ( $msgs ) {
		echo '<table class="widefat striped"><thead><tr><th>' . esc_html__( 'Date', 'potteryhub' ) . '</th><th>' . esc_html__( 'Type', 'potteryhub' ) . '</th><th>' . esc_html__( 'From', 'potteryhub' ) . '</th><th>' . esc_html__( 'Message', 'potteryhub' ) . '</th></tr></thead><tbody>';
		foreach ( array_slice( $msgs, 0, 100 ) as $m ) {
			$from = esc_html( $m['name'] ) . '<br>' . esc_html( $m['phone'] ) . ( $m['email'] ? '<br><a href="mailto:' . esc_attr( $m['email'] ) . '">' . esc_html( $m['email'] ) . '</a>' : '' );
			$what = 'workshop' === $m['type'] ? __( 'Workshop', 'potteryhub' ) . ( $m['date'] ? '<br>' . esc_html( $m['date'] ) : '' ) . ( $m['people'] ? '<br>× ' . (int) $m['people'] : '' ) : esc_html__( 'Message', 'potteryhub' );
			echo '<tr><td>' . esc_html( $m['time'] ) . '</td><td>' . $what . '</td><td>' . $from . '</td><td>' . nl2br( esc_html( $m['message'] ) ) . '</td></tr>'; // phpcs:ignore WordPress.Security.EscapeOutput
		}
		echo '</tbody></table>';
	} else {
		echo '<p>' . esc_html__( 'No messages yet. Forms on the Contact and Workshops pages arrive here and by email.', 'potteryhub' ) . '</p>';
	}
	echo '</div>';

	echo '<div class="card" style="max-width:760px"><h2>' . esc_html__( 'Newsletter subscribers', 'potteryhub' ) . ' (' . count( $subs ) . ')</h2>';
	if ( $subs ) {
		echo '<p><a class="button" href="' . esc_url( wp_nonce_url( admin_url( 'themes.php?page=potteryhub&ph_csv=1' ), 'ph_csv' ) ) . '">' . esc_html__( 'Download CSV', 'potteryhub' ) . '</a></p><table class="widefat striped"><tbody>';
		foreach ( array_reverse( $subs, true ) as $email => $date ) {
			echo '<tr><td>' . esc_html( $email ) . '</td><td>' . esc_html( $date ) . '</td></tr>';
		}
		echo '</tbody></table>';
	} else {
		echo '<p>' . esc_html__( 'No subscribers yet.', 'potteryhub' ) . '</p>';
	}
	echo '</div></div>';
}

/** CSV download (runs before the page renders). */
add_action(
	'admin_init',
	function () {
		if ( ! isset( $_GET['page'], $_GET['ph_csv'] ) || 'potteryhub' !== $_GET['page'] || ! current_user_can( 'manage_options' ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		check_admin_referer( 'ph_csv' );
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=subscribers.csv' );
		$out = fopen( 'php://output', 'w' );
		fputcsv( $out, array( 'email', 'date' ) );
		foreach ( get_option( 'ph_subscribers', array() ) as $e => $d ) {
			fputcsv( $out, array( $e, $d ) );
		}
		exit;
	}
);

/** Nudge after activation. */
add_action(
	'after_switch_theme',
	function () {
		set_transient( 'ph_welcome', 1, DAY_IN_SECONDS );
		// Use the theme's cart & checkout design right away (only if those pages still use WooCommerce blocks).
		if ( class_exists( 'WooCommerce' ) ) {
			foreach ( array( 'cart', 'checkout' ) as $page ) {
				$id = wc_get_page_id( $page );
				if ( $id > 0 && has_block( 'woocommerce/' . $page, $id ) ) {
					ph_admin_run( 'classic_checkout' );
					break;
				}
			}
		}
	}
);
add_action(
	'admin_notices',
	function () {
		if ( get_transient( 'ph_welcome' ) && current_user_can( 'manage_options' ) ) {
			delete_transient( 'ph_welcome' );
			echo '<div class="notice notice-info"><p>' . esc_html__( 'Pottery Hub is active. Finish setup in Appearance → Pottery Hub (one-click setup).', 'potteryhub' ) . ' <a href="' . esc_url( admin_url( 'themes.php?page=potteryhub' ) ) . '">' . esc_html__( 'Open', 'potteryhub' ) . '</a></p></div>';
		}
	}
);
