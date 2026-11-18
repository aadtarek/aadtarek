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

		case 'arabic_pack':
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
	$tool = function ( $id, $title, $desc, $btn ) {
		echo '<div class="card" style="max-width:760px"><h2>' . esc_html( $title ) . '</h2><p>' . esc_html( $desc ) . '</p><form method="post">';
		wp_nonce_field( 'ph_tools' );
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
		$ar ? __( 'Arabic is installed. Run again to refresh WooCommerce’s Arabic translations.', 'potteryhub' ) : __( 'Installs Arabic for WordPress and WooCommerce so the Arabic site (?lang=ar) shows Arabic checkout, account and notices. The site language stays English.', 'potteryhub' ),
		__( 'Install Arabic', 'potteryhub' )
	);
	$tool( 'arabic_names', __( '3. Arabic product names', 'potteryhub' ), __( 'Fills the "Arabic name" and "Arabic description" fields of the current 46 products and their categories. New products: fill the fields on the product edit screen.', 'potteryhub' ), __( 'Add Arabic names', 'potteryhub' ) );

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
	}
);
add_action(
	'admin_notices',
	function () {
		if ( get_transient( 'ph_welcome' ) && current_user_can( 'manage_options' ) ) {
			delete_transient( 'ph_welcome' );
			echo '<div class="notice notice-info"><p>' . esc_html__( 'Pottery Hub is active. Finish setup in Appearance → Pottery Hub (3 one-click steps).', 'potteryhub' ) . ' <a href="' . esc_url( admin_url( 'themes.php?page=potteryhub' ) ) . '">' . esc_html__( 'Open', 'potteryhub' ) . '</a></p></div>';
		}
	}
);
