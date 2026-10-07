<?php
/**
 * Rfaheya hosting check. Upload to public_html, open
 * https://YOUR-DOMAIN/rfaheya-check.php, send a screenshot, then delete it.
 * It only lists file names and server info; no passwords or settings.
 */
header( 'Content-Type: text/plain; charset=utf-8' );
header( 'Cache-Control: no-store' );

$root = __DIR__;
$yes  = function ( $path ) use ( $root ) {
	return file_exists( "$root/$path" ) ? 'YES' : '-- MISSING --';
};

echo "RFAHEYA CHECK\n=============\n\n";
echo 'Folder:      ' . $root . "\n";
echo 'Server:      ' . ( isset( $_SERVER['SERVER_SOFTWARE'] ) ? $_SERVER['SERVER_SOFTWARE'] : '?' ) . "\n";
echo 'PHP:         ' . PHP_VERSION . "\n";
echo 'Doc root:    ' . ( isset( $_SERVER['DOCUMENT_ROOT'] ) ? $_SERVER['DOCUMENT_ROOT'] : '?' ) . "\n\n";

echo "WordPress files in this folder:\n";
foreach ( array( 'index.php', 'wp-config.php', 'wp-load.php', 'wp-login.php', 'wp-admin/index.php', 'wp-includes/version.php', 'wp-content/plugins/woocommerce/woocommerce.php', 'wp-content/mu-plugins/rfaheya.php' ) as $f ) {
	printf( "  %-50s %s\n", $f, $yes( $f ) );
}
if ( file_exists( "$root/wp-includes/version.php" ) ) {
	$wp_version = '';
	include "$root/wp-includes/version.php";
	echo "  WordPress version: $wp_version\n";
}

echo "\nStorefront files:\n";
foreach ( array( 'index.html', 'assets', 'import', '.htaccess' ) as $f ) {
	printf( "  %-50s %s\n", $f, $yes( $f ) );
}

echo "\n.htaccess has the Rfaheya block: " . ( file_exists( "$root/.htaccess" ) && false !== strpos( (string) file_get_contents( "$root/.htaccess" ), 'BEGIN Rfaheya' ) ? 'YES' : 'NO' ) . "\n";

echo "\nEverything in this folder:\n";
foreach ( scandir( $root ) as $name ) {
	if ( '.' === $name || '..' === $name ) {
		continue;
	}
	echo '  ' . $name . ( is_dir( "$root/$name" ) ? '/' : '' ) . "\n";
}

// WordPress somewhere below? (common when it was installed in a sub-folder)
echo "\nwp-config.php found in sub-folders:\n";
$found = false;
foreach ( scandir( $root ) as $name ) {
	if ( '.' !== $name[0] && is_dir( "$root/$name" ) && file_exists( "$root/$name/wp-config.php" ) ) {
		echo "  $name/\n";
		$found = true;
	}
}
if ( ! $found ) {
	echo "  (none)\n";
}

// Speed: how long the store data takes to build on this server, and what the home page sends.
if ( file_exists( "$root/wp-load.php" ) && isset( $_GET['speed'] ) ) {
	echo "\nSPEED\n=====\n";
	$t = microtime( true );
	require "$root/wp-load.php";
	printf( "WordPress loads in:        %.2f s\n", microtime( true ) - $t );
	echo 'Memory limit:              ' . ini_get( 'memory_limit' ) . "\n";
	echo 'Last Rfaheya error:        ' . ( get_option( 'rfaheya_last_error' ) ? get_option( 'rfaheya_last_error' ) : '(none)' ) . "\n";
	echo 'WooCommerce:               ' . ( defined( 'WC_VERSION' ) ? WC_VERSION : 'not active' ) . "\n";
	echo "Active plugins:\n";
	foreach ( (array) get_option( 'active_plugins', array() ) as $plugin ) {
		echo "  $plugin\n";
	}
	if ( function_exists( 'rfaheya_bootstrap' ) ) {
		delete_transient( 'rfaheya_bootstrap' );
		$t = microtime( true );
		try {
			$data = rfaheya_bootstrap();
			printf( "Store data builds in:      %.2f s\n", microtime( true ) - $t );
			printf( "  products %d, variations %d, reviews %d, faqs %d\n", count( (array) $data['products'] ), count( (array) $data['variations'] ), count( (array) $data['reviews'] ), count( (array) $data['faqs'] ) );
			printf( "  size: %d KB\n", strlen( (string) wp_json_encode( $data ) ) / 1024 );
		} catch ( Throwable $e ) {
			echo 'Store data FAILED: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() . "\n";
		}
	}
	foreach ( array( '/', '/shop' ) as $path ) {
		for ( $i = 1; $i <= 2; $i++ ) {
			$t   = microtime( true );
			$res = wp_remote_get( home_url( $path ), array( 'timeout' => 30, 'sslverify' => false, 'headers' => array( 'Cache-Control' => 'no-cache' ) ) );
			$sec = microtime( true ) - $t;
			if ( is_wp_error( $res ) ) {
				echo "Page $path: ERROR " . $res->get_error_message() . "\n";
				continue;
			}
			$body = wp_remote_retrieve_body( $res );
			printf(
				"Page %-6s try %d: %.2f s, HTTP %d, %d KB, data inside: %s, pre-painted: %s, litespeed in page: %s, cache: %s\n",
				$path,
				$i,
				$sec,
				wp_remote_retrieve_response_code( $res ),
				strlen( $body ) / 1024,
				false !== strpos( $body, '__rfBoot=Promise.resolve' ) ? 'YES' : 'NO',
				false !== strpos( $body, 'rf-pre' ) ? 'YES' : 'NO',
				false !== stripos( $body, 'litespeed' ) ? 'YES' : 'no',
				(string) wp_remote_retrieve_header( $res, 'x-litespeed-cache' )
			);
		}
	}
}
