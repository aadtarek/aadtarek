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
