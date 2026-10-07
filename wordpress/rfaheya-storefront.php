<?php
/**
 * Plugin Name: Rfaheya Storefront
 * Description: Installs and updates the Rfaheya storefront (the shop pages, images and the Rfaheya store settings) in this site. Upload a new version from Plugins → Add New → Upload Plugin and choose "Replace current with uploaded".
 * Version: 1.0.__BUILD__
 * Author: Rfaheya
 *
 * Packaged by scripts/package-release.mjs: site/ holds the same files as
 * rfaheya-public_html.zip (with .htaccess stored as htaccess.txt, so it
 * doesn't apply inside the plugin folder). They are copied into the
 * WordPress folder when the plugin is activated and whenever a newer
 * version is uploaded.
 */

defined( 'ABSPATH' ) || exit;

define( 'RFAHEYA_STOREFRONT_BUILD', '__BUILD__' );

/** Copies site/ into the WordPress folder. */
function rfaheya_storefront_install() {
	$src = __DIR__ . '/site';
	if ( ! is_dir( $src ) ) {
		return;
	}
	@set_time_limit( 300 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	if ( file_exists( ABSPATH . '.htaccess' ) && ! file_exists( ABSPATH . '.htaccess.before-rfaheya' ) ) {
		copy( ABSPATH . '.htaccess', ABSPATH . '.htaccess.before-rfaheya' );
	}
	$count  = 0;
	$failed = array();
	$files  = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $src, FilesystemIterator::SKIP_DOTS ) );
	foreach ( $files as $file ) {
		$rel  = str_replace( '\\', '/', substr( $file->getPathname(), strlen( $src ) + 1 ) );
		$dest = ABSPATH . ( 'htaccess.txt' === $rel ? '.htaccess' : $rel );
		wp_mkdir_p( dirname( $dest ) );
		if ( copy( $file->getPathname(), $dest ) ) {
			++$count;
		} else {
			$failed[] = $rel;
		}
	}
	update_option( 'rfaheya_storefront_result', array( RFAHEYA_STOREFRONT_BUILD, $count, $failed ), false );
	if ( ! $failed ) {
		update_option( 'rfaheya_storefront_build', RFAHEYA_STOREFRONT_BUILD, false );
	}
	// Fresh shop data and pages with the new files.
	delete_transient( 'rfaheya_bootstrap' );
	delete_transient( 'rfaheya_bootstrap_failed' );
	do_action( 'litespeed_purge_all' );
}

register_activation_hook( __FILE__, 'rfaheya_storefront_install' );

// A newer version uploaded over this one ("Replace current with uploaded").
add_action(
	'admin_init',
	function () {
		if ( get_option( 'rfaheya_storefront_build' ) !== RFAHEYA_STOREFRONT_BUILD && current_user_can( 'manage_options' ) ) {
			rfaheya_storefront_install();
		}
	}
);

// Copy straight away on the "Plugin updated successfully" screen (site/ already holds the new files).
add_action(
	'upgrader_process_complete',
	function ( $upgrader ) {
		if ( isset( $upgrader->result['destination_name'] ) && 'rfaheya-storefront' === $upgrader->result['destination_name'] && current_user_can( 'manage_options' ) ) {
			rfaheya_storefront_install();
		}
	}
);

add_action(
	'admin_notices',
	function () {
		$result = get_option( 'rfaheya_storefront_result' );
		if ( ! is_array( $result ) || RFAHEYA_STOREFRONT_BUILD !== $result[0] || ! current_user_can( 'manage_options' ) ) {
			return;
		}
		if ( $result[2] ) {
			echo '<div class="notice notice-error"><p><strong>Rfaheya Storefront:</strong> ' . esc_html( count( $result[2] ) ) . ' files could not be written (folder permissions), e.g. ' . esc_html( implode( ', ', array_slice( $result[2], 0, 3 ) ) ) . '.</p></div>';
			return;
		}
		if ( ! get_transient( 'rfaheya_storefront_notice_' . RFAHEYA_STOREFRONT_BUILD ) ) {
			set_transient( 'rfaheya_storefront_notice_' . RFAHEYA_STOREFRONT_BUILD, 1, DAY_IN_SECONDS );
			echo '<div class="notice notice-success is-dismissible"><p><strong>Rfaheya Storefront</strong> is installed (' . esc_html( $result[1] ) . ' files). Open the site to see it.</p></div>';
		}
	}
);
