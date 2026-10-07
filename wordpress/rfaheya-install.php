<?php
/**
 * Rfaheya installer: extracts rfaheya-public_html.zip into this folder
 * (public_html), merging with WordPress's files instead of replacing folders.
 *
 * 1. Upload this file and rfaheya-public_html.zip to public_html.
 * 2. Open https://YOUR-DOMAIN/rfaheya-install.php
 * It backs up the current .htaccess, extracts, then deletes itself and the zip.
 */
header( 'Content-Type: text/plain; charset=utf-8' );
header( 'Cache-Control: no-store' );
header( 'X-LiteSpeed-Cache-Control: no-cache' );

// Show what went wrong instead of a blank page.
ini_set( 'display_errors', '1' );
error_reporting( E_ALL );
@set_time_limit( 600 );
@ini_set( 'memory_limit', '256M' );
ignore_user_abort( true );
while ( ob_get_level() > 0 ) {
	ob_end_flush();
}
register_shutdown_function(
	function () {
		$e = error_get_last();
		if ( $e && in_array( $e['type'], array( E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR ), true ) ) {
			echo "\nERROR: " . $e['message'] . ' (' . basename( $e['file'] ) . ':' . $e['line'] . ")\n";
		}
	}
);
echo "Rfaheya installer (PHP " . PHP_VERSION . ")\n";
flush();

$root = __DIR__;

if ( ! class_exists( 'ZipArchive' ) ) {
	exit( "ERROR: PHP zip extension is not available on this hosting.\n" );
}
// The newest rfaheya*.zip here (the browser may have renamed it, e.g. "rfaheya-public_html (1).zip").
$zips = glob( "$root/rfaheya*.zip" );
$zips = $zips ? $zips : array();
usort(
	$zips,
	function ( $a, $b ) {
		return filemtime( $b ) - filemtime( $a );
	}
);
$zip = $zips ? $zips[0] : '';
if ( ! $zip ) {
	$all = glob( "$root/*.zip" );
	$all = $all ? $all : array();
	exit( "ERROR: no rfaheya*.zip in this folder ($root). Upload it next to this file.\nZip files here: " . ( $all ? implode( ', ', array_map( 'basename', $all ) ) : 'none' ) . "\n" );
}
echo 'Using ' . basename( $zip ) . "\n";
if ( ! file_exists( "$root/wp-config.php" ) ) {
	exit( "ERROR: WordPress (wp-config.php) is not in this folder. Put both files in the WordPress folder (public_html).\n" );
}

$archive = new ZipArchive();
if ( true !== $archive->open( $zip ) ) {
	exit( "ERROR: could not open the zip.\n" );
}

// Only accept the files the release contains: no absolute paths or "..".
for ( $i = 0; $i < $archive->numFiles; $i++ ) {
	$name = $archive->getNameIndex( $i );
	if ( '' === $name || '/' === $name[0] || false !== strpos( $name, '..' ) || false !== strpos( $name, '\\' ) ) {
		exit( "ERROR: unexpected path in the zip: $name\n" );
	}
}

if ( file_exists( "$root/.htaccess" ) ) {
	copy( "$root/.htaccess", "$root/.htaccess.before-rfaheya" );
	echo "Backed up .htaccess -> .htaccess.before-rfaheya\n";
}

// Leftovers from earlier uploads.
if ( file_exists( "$root/_redirects" ) ) {
	unlink( "$root/_redirects" );
	echo "Removed _redirects\n";
}

$count = 0;
for ( $i = 0; $i < $archive->numFiles; $i++ ) {
	$name = $archive->getNameIndex( $i );
	if ( '/' === substr( $name, -1 ) ) {
		continue;
	}
	$target = "$root/$name";
	if ( ! is_dir( dirname( $target ) ) ) {
		mkdir( dirname( $target ), 0755, true );
	}
	// Streamed, so big files (videos) don't need to fit in memory.
	$in  = $archive->getStream( $name );
	$out = $in ? fopen( $target, 'wb' ) : false;
	if ( ! $in || ! $out || false === stream_copy_to_stream( $in, $out ) ) {
		exit( "ERROR: could not write $name (check the folder permissions)\n" );
	}
	fclose( $in );
	fclose( $out );
	$count++;
	if ( 0 === $count % 50 ) {
		echo "  $count files…\n";
		flush();
	}
}
$archive->close();
echo "Extracted $count files into $root\n";

unlink( $zip );
unlink( __FILE__ );
echo "Deleted the zip and this installer.\n\nDONE. Open the home page and /wp-admin now.\n";
