<?php
/**
 * Plugin Name:       Claude Connection
 * Description:       Connect Claude to this site (an MCP server): ask it about your sales, orders, products and posts, and — when you allow it — let it make the changes, install plugins and edit files, with a backup before every file change and a log of everything it does. Tools → Claude connection.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            AT
 * License:           GPL-2.0-or-later
 * Text Domain:       claude-connection
 *
 * Works on any WordPress site; with WooCommerce it adds the store tools. Other plugins can add
 * their own tools with the `claude_connection_tools` filter (same shape as clc_tools()).
 */

defined( 'ABSPATH' ) || exit;

define( 'CLC_VERSION', '1.0.0' );
define( 'CLC_OPTION', 'claude_connection' );
define( 'CLC_LOG', 'claude_connection_log' );
define( 'CLC_BACKUPS', 'claude_connection_backups' );

/* =========================================================================
 * Settings, key, level, log
 * ========================================================================= */

/** on, mode (read / full / admin), until (admin ends then), key hash + last 4, the user it acts as. */
function clc_options() {
	$o = get_option( CLC_OPTION, array() );
	return array_merge(
		array(
			'on'    => false,
			'mode'  => 'read',
			'until' => 0,
			'hash'  => '',
			'hint'  => '',
			'user'  => 0,
		),
		is_array( $o ) ? $o : array()
	);
}

function clc_save( $o ) {
	update_option( CLC_OPTION, $o, false );
}

/** read / full / admin. Admin lasts until the time chosen, then falls back to full on its own. */
function clc_level() {
	$o = clc_options();
	if ( 'admin' === $o['mode'] ) {
		return ! empty( $o['until'] ) && time() > (int) $o['until'] ? 'full' : 'admin';
	}
	return 'full' === $o['mode'] ? 'full' : 'read';
}

function clc_allowed( $tool ) {
	$need = ! empty( $tool['admin'] ) ? 2 : ( ! empty( $tool['write'] ) ? 1 : 0 );
	$have = array( 'read' => 0, 'full' => 1, 'admin' => 2 )[ clc_level() ];
	return $have >= $need;
}

/** A new secret key: only its hash is kept; the key itself is shown once. */
function clc_new_key() {
	$key       = wp_generate_password( 40, false, false );
	$o         = clc_options();
	$o['hash'] = hash_hmac( 'sha256', $key, wp_salt( 'auth' ) );
	$o['hint'] = substr( $key, -4 );
	clc_save( $o );
	return $key;
}

function clc_key_ok( $key ) {
	$o = clc_options();
	return $o['on'] && $o['hash'] && is_string( $key ) && strlen( $key ) >= 30 && hash_equals( $o['hash'], hash_hmac( 'sha256', $key, wp_salt( 'auth' ) ) );
}

function clc_ip() {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '0.0.0.0';
}

function clc_log( $tool, $args, $ok, $note = '' ) {
	$log = get_option( CLC_LOG, array() );
	$log = is_array( $log ) ? $log : array();
	array_unshift(
		$log,
		array(
			't'    => time(),
			'tool' => $tool,
			'args' => mb_substr( (string) wp_json_encode( $args, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ), 0, 400 ),
			'ok'   => (bool) $ok,
			'note' => mb_substr( (string) $note, 0, 200 ),
			'ip'   => clc_ip(),
		)
	);
	update_option( CLC_LOG, array_slice( $log, 0, 300 ), false );
}

/* =========================================================================
 * The MCP endpoint: /wp-json/claude-connection/v1/mcp/<key> (or Authorization: Bearer <key>)
 * ========================================================================= */

add_action(
	'rest_api_init',
	function () {
		$args = array(
			'methods'             => array( 'GET', 'POST', 'DELETE' ),
			'callback'            => 'clc_handle',
			'permission_callback' => '__return_true', // the key is checked in clc_handle
		);
		register_rest_route( 'claude-connection/v1', '/mcp', $args );
		register_rest_route( 'claude-connection/v1', '/mcp/(?P<key>[A-Za-z0-9]{30,64})', $args );
	}
);

function clc_request_key( WP_REST_Request $r ) {
	if ( $r->get_param( 'key' ) ) {
		return (string) $r->get_param( 'key' );
	}
	return preg_match( '/^Bearer\s+(\S+)$/i', (string) $r->get_header( 'authorization' ), $m ) ? $m[1] : '';
}

function clc_handle( WP_REST_Request $r ) {
	nocache_headers();
	$limit = 'clc_bad_' . md5( clc_ip() );
	if ( (int) get_transient( $limit ) > 30 ) {
		return new WP_REST_Response( array( 'error' => 'Too many wrong attempts. Try again later.' ), 429 );
	}
	if ( ! clc_key_ok( clc_request_key( $r ) ) ) {
		set_transient( $limit, (int) get_transient( $limit ) + 1, HOUR_IN_SECONDS );
		return new WP_REST_Response( array( 'error' => 'Not connected: the connection is off or the address is wrong.' ), 401 );
	}
	if ( 'POST' !== $r->get_method() ) {
		return new WP_REST_Response( null, 'DELETE' === $r->get_method() ? 200 : 405 );
	}
	$o = clc_options();
	if ( $o['user'] ) {
		wp_set_current_user( (int) $o['user'] );
	}
	$body = json_decode( $r->get_body(), true );
	if ( ! is_array( $body ) ) {
		return new WP_REST_Response( array( 'jsonrpc' => '2.0', 'id' => null, 'error' => array( 'code' => -32700, 'message' => 'Parse error' ) ), 400 );
	}
	$batch = isset( $body[0] );
	$out   = array();
	foreach ( $batch ? $body : array( $body ) as $msg ) {
		$res = clc_message( is_array( $msg ) ? $msg : array() );
		if ( null !== $res ) {
			$out[] = $res;
		}
	}
	if ( ! $out ) {
		return new WP_REST_Response( null, 202 );
	}
	return new WP_REST_Response( $batch ? $out : $out[0], 200 );
}

/** Every tool: the built-in ones plus those other plugins add. */
function clc_all_tools() {
	static $tools = null;
	if ( null === $tools ) {
		$tools = (array) apply_filters( 'claude_connection_tools', clc_tools() );
	}
	return $tools;
}

function clc_message( $msg ) {
	$id     = $msg['id'] ?? null;
	$method = (string) ( $msg['method'] ?? '' );
	$params = is_array( $msg['params'] ?? null ) ? $msg['params'] : array();
	$answer = function ( $result ) use ( $id ) {
		return array( 'jsonrpc' => '2.0', 'id' => $id, 'result' => $result );
	};
	$error  = function ( $code, $text ) use ( $id ) {
		return array( 'jsonrpc' => '2.0', 'id' => $id, 'error' => array( 'code' => $code, 'message' => $text ) );
	};
	if ( ! array_key_exists( 'id', $msg ) ) {
		return null; // a notification
	}
	switch ( $method ) {
		case 'initialize':
			$asked = (string) ( $params['protocolVersion'] ?? '' );
			$known = array( '2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05' );
			$name  = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
			return $answer(
				array(
					'protocolVersion' => in_array( $asked, $known, true ) ? $asked : '2025-06-18',
					'capabilities'    => array( 'tools' => array( 'listChanged' => false ) ),
					'serverInfo'      => array(
						'name'    => 'claude-connection',
						'title'   => $name,
						'version' => CLC_VERSION,
					),
					'instructions'    => 'The WordPress site "' . $name . '" (' . home_url( '/' ) . ')' . ( class_exists( 'WooCommerce' ) ? ', a WooCommerce store (currency ' . get_woocommerce_currency() . ')' : '' ) . '. Read before you change anything; for changes, say what you will do and get the owner\'s go-ahead first. '
						. array(
							'read'  => 'The owner allows reading only.',
							'full'  => 'The owner allows changing the site\'s content and store data.',
							'admin' => 'Admin is on: content, store data, files and plugins. Files you overwrite or delete are backed up first (list_backups / restore_backup).',
						)[ clc_level() ],
				)
			);
		case 'ping':
			return $answer( new stdClass() );
		case 'tools/list':
			$list = array();
			foreach ( clc_all_tools() as $name => $t ) {
				if ( ! clc_allowed( $t ) ) {
					continue;
				}
				$list[] = array(
					'name'        => $name,
					'description' => $t['desc'],
					'inputSchema' => array(
						'type'       => 'object',
						'properties' => ! empty( $t['props'] ) ? $t['props'] : new stdClass(),
						'required'   => $t['required'] ?? array(),
					),
					'annotations' => array(
						'readOnlyHint'    => empty( $t['write'] ),
						'destructiveHint' => ! empty( $t['destructive'] ),
					),
				);
			}
			return $answer( array( 'tools' => $list ) );
		case 'tools/call':
			$name  = (string) ( $params['name'] ?? '' );
			$args  = is_array( $params['arguments'] ?? null ) ? $params['arguments'] : array();
			$tools = clc_all_tools();
			if ( ! isset( $tools[ $name ] ) ) {
				return $error( -32602, 'Unknown tool: ' . $name );
			}
			if ( ! clc_allowed( $tools[ $name ] ) ) {
				clc_log( $name, $args, false, 'not allowed at ' . clc_level() );
				return $answer( array( 'content' => array( array( 'type' => 'text', 'text' => 'The site owner hasn\'t allowed this (Tools → Claude connection → ' . ( empty( $tools[ $name ]['admin'] ) ? 'Full control' : 'Admin' ) . ').' ) ), 'isError' => true ) );
			}
			try {
				$result = call_user_func( $tools[ $name ]['run'], $args );
				if ( is_wp_error( $result ) ) {
					throw new Exception( $result->get_error_message() );
				}
				clc_log( $name, $args, true );
				return $answer( array( 'content' => array( array( 'type' => 'text', 'text' => wp_json_encode( $result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ) ) ) ) );
			} catch ( Throwable $e ) {
				clc_log( $name, $args, false, $e->getMessage() );
				return $answer( array( 'content' => array( array( 'type' => 'text', 'text' => 'Error: ' . $e->getMessage() ) ), 'isError' => true ) );
			}
	}
	return $error( -32601, 'Method not found: ' . $method );
}

/* =========================================================================
 * Helpers for the tools
 * ========================================================================= */

function clc_money( $n ) {
	return round( (float) $n, 2 );
}

function clc_woo() {
	return class_exists( 'WooCommerce' ) && function_exists( 'wc_get_product' );
}

function clc_product( $p, $full = false ) {
	$out  = array(
		'id'     => $p->get_id(),
		'name'   => html_entity_decode( $p->get_name(), ENT_QUOTES, 'UTF-8' ),
		'slug'   => $p->get_slug(),
		'status' => $p->get_status(),
		'type'   => $p->get_type(),
		'sku'    => $p->get_sku(),
		'url'    => get_permalink( $p->get_id() ),
		'sizes'  => array(),
	);
	$vars = $p->is_type( 'variable' ) ? array_filter( array_map( 'wc_get_product', $p->get_children() ) ) : array( $p );
	foreach ( $vars as $v ) {
		$out['sizes'][] = array(
			'id'            => $v->get_id(),
			'variation'     => $p->is_type( 'variable' ) ? implode( ', ', array_filter( array_map( 'strval', $v->get_variation_attributes( false ) ) ) ) : '',
			'regular_price' => clc_money( $v->get_regular_price( 'edit' ) ),
			'sale_price'    => '' === $v->get_sale_price( 'edit' ) ? null : clc_money( $v->get_sale_price( 'edit' ) ),
			'price_now'     => clc_money( $v->get_price() ),
			'stock_status'  => $v->get_stock_status(),
			'stock'         => $v->managing_stock() ? $v->get_stock_quantity() : null,
		);
	}
	if ( $full ) {
		$out['categories']        = array_values( array_map( fn( $id ) => html_entity_decode( (string) ( get_term( $id )->name ?? '' ), ENT_QUOTES, 'UTF-8' ), $p->get_category_ids() ) );
		$out['short_description'] = $p->get_short_description();
		$out['description']       = $p->get_description();
		$out['total_sales']       = (int) $p->get_total_sales();
		$out['rating']            = (float) $p->get_average_rating();
		$out['reviews']           = (int) $p->get_review_count();
		$out['visibility']        = $p->get_catalog_visibility();
	}
	return $out;
}

function clc_order( $o, $full = false ) {
	$out = array(
		'id'       => $o->get_id(),
		'number'   => $o->get_order_number(),
		'date'     => $o->get_date_created() ? $o->get_date_created()->date_i18n( 'Y-m-d H:i' ) : '',
		'status'   => $o->get_status(),
		'total'    => clc_money( $o->get_total() ),
		'customer' => trim( $o->get_billing_first_name() . ' ' . $o->get_billing_last_name() ),
		'phone'    => $o->get_billing_phone(),
		'city'     => trim( $o->get_billing_city() . ', ' . $o->get_billing_state(), ', ' ),
		'payment'  => $o->get_payment_method_title(),
		'items'    => array_values( array_map( fn( $i ) => $i->get_quantity() . ' × ' . $i->get_name(), $o->get_items() ) ),
	);
	if ( $full ) {
		$out['email']    = $o->get_billing_email();
		$out['address']  = trim( $o->get_billing_address_1() . ' ' . $o->get_billing_address_2() );
		$out['shipping'] = clc_money( $o->get_shipping_total() );
		$out['discount'] = clc_money( $o->get_discount_total() );
		$out['fees']     = array_values( array_map( fn( $f ) => $f->get_name() . ': ' . clc_money( $f->get_total() ), $o->get_fees() ) );
		$out['note']     = $o->get_customer_note();
		$out['notes']    = array_map( fn( $n ) => $n->date_created->date_i18n( 'Y-m-d H:i' ) . ' — ' . wp_strip_all_tags( $n->content ), wc_get_order_notes( array( 'order_id' => $o->get_id(), 'limit' => 10 ) ) );
		$out['admin']    = $o->get_edit_order_url();
	}
	return $out;
}

function clc_sales( $days ) {
	$from   = gmdate( 'Y-m-d', time() - max( 1, (int) $days ) * DAY_IN_SECONDS + DAY_IN_SECONDS );
	$orders = wc_get_orders(
		array(
			'status'       => array( 'wc-processing', 'wc-completed', 'wc-on-hold' ),
			'date_created' => '>=' . $from,
			'limit'        => -1,
		)
	);
	$total = 0;
	$top   = array();
	foreach ( $orders as $o ) {
		$total += (float) $o->get_total();
		foreach ( $o->get_items() as $i ) {
			$top[ $i->get_name() ] = ( $top[ $i->get_name() ] ?? 0 ) + $i->get_quantity();
		}
	}
	arsort( $top );
	return array(
		'days'          => (int) $days,
		'orders'        => count( $orders ),
		'revenue'       => clc_money( $total ),
		'currency'      => get_woocommerce_currency(),
		'average_order' => $orders ? clc_money( $total / count( $orders ) ) : 0,
		'top_items'     => array_slice( $top, 0, 10, true ),
	);
}

/** Clears the page caches of the usual cache plugins and the object cache. */
function clc_clear_caches() {
	$done = array();
	wp_cache_flush();
	$done[] = 'object cache';
	if ( has_action( 'litespeed_purge_all' ) || defined( 'LSCWP_V' ) ) {
		do_action( 'litespeed_purge_all' );
		$done[] = 'LiteSpeed';
	}
	if ( function_exists( 'rocket_clean_domain' ) ) {
		rocket_clean_domain();
		$done[] = 'WP Rocket';
	}
	if ( function_exists( 'w3tc_flush_all' ) ) {
		w3tc_flush_all();
		$done[] = 'W3 Total Cache';
	}
	if ( function_exists( 'wp_cache_clear_cache' ) ) {
		wp_cache_clear_cache();
		$done[] = 'WP Super Cache';
	}
	if ( has_action( 'wpfc_clear_all_cache' ) ) {
		do_action( 'wpfc_clear_all_cache' );
		$done[] = 'WP Fastest Cache';
	}
	if ( class_exists( 'autoptimizeCache' ) ) {
		autoptimizeCache::clearall();
		$done[] = 'Autoptimize';
	}
	if ( function_exists( 'wc_delete_product_transients' ) ) {
		wc_delete_product_transients();
		$done[] = 'WooCommerce product cache';
	}
	do_action( 'claude_connection_clear_caches' ); // other plugins clear their own copies here
	return $done;
}

/* ---------------- files, backups, plugins (Admin) */

/** Files never read or written: the database password and other secrets, and the backups. */
function clc_secret( $rel ) {
	$base = strtolower( basename( $rel ) );
	return in_array( $base, array( 'wp-config.php', 'wp-config-sample.php', '.env', '.htpasswd', '.user.ini', 'php.ini', 'auth.json' ), true ) || 0 === strpos( ltrim( $rel, '/' ), 'wp-content/claude-connection-backups' );
}

function clc_root() {
	return rtrim( str_replace( '\\', '/', (string) realpath( ABSPATH ) ), '/' );
}

/** A path inside the site (never outside it, never a secret file). */
function clc_path( $rel, $dir = false ) {
	$rel  = ltrim( str_replace( '\\', '/', (string) $rel ), '/' );
	$root = clc_root();
	if ( preg_match( '#(^|/)\.\.(/|$)#', $rel ) || false !== strpos( $rel, "\0" ) ) {
		throw new Exception( 'That path leaves the site.' );
	}
	$full = '' === $rel ? $root : $root . '/' . $rel;
	$real = realpath( $dir ? $full : dirname( $full ) );
	if ( $real && 0 !== strpos( str_replace( '\\', '/', $real ) . '/', $root . '/' ) ) {
		throw new Exception( 'That path leaves the site.' );
	}
	if ( ! $dir && clc_secret( $rel ) ) {
		throw new Exception( 'That file holds secrets: it stays out of reach.' );
	}
	if ( $dir && ! is_dir( $full ) ) {
		throw new Exception( 'No such folder.' );
	}
	return $full;
}

function clc_rel( $full ) {
	return ltrim( substr( str_replace( '\\', '/', $full ), strlen( clc_root() ) ), '/' );
}

function clc_backup_dir() {
	$dir = WP_CONTENT_DIR . '/claude-connection-backups';
	if ( ! is_dir( $dir ) ) {
		wp_mkdir_p( $dir );
	}
	if ( ! is_file( $dir . '/.htaccess' ) ) {
		file_put_contents( $dir . '/.htaccess', "Require all denied\nDeny from all\n" );
		file_put_contents( $dir . '/index.php', "<?php // Silence.\n" );
	}
	return $dir;
}

/** Copies files before a change; returns the backup id. */
function clc_backup( $files, $what ) {
	$id  = gmdate( 'Ymd-His' ) . '-' . strtolower( wp_generate_password( 4, false ) );
	$dir = clc_backup_dir() . '/' . $id;
	wp_mkdir_p( $dir );
	$map = array();
	foreach ( array_values( $files ) as $n => $file ) {
		$map[ clc_rel( $file ) ] = array( 'existed' => is_file( $file ), 'copy' => 'f' . $n );
		if ( is_file( $file ) ) {
			copy( $file, $dir . '/f' . $n );
		}
	}
	file_put_contents( $dir . '/files.json', wp_json_encode( $map ) );
	$list = (array) get_option( CLC_BACKUPS, array() );
	array_unshift( $list, array( 'id' => $id, 'what' => $what, 'when' => wp_date( 'Y-m-d H:i' ) ) );
	update_option( CLC_BACKUPS, array_slice( $list, 0, 200 ), false );
	return $id;
}

function clc_upgrader_files() {
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/misc.php';
	require_once ABSPATH . 'wp-admin/includes/plugin.php';
	require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
	if ( ! WP_Filesystem() ) {
		throw new Exception( 'WordPress can\'t write files on this server (filesystem method).' );
	}
}

/** Installs a plugin zip (a file or a download link), replacing the installed copy. */
function clc_install_plugin( $package, $activate ) {
	clc_upgrader_files();
	$skin     = new WP_Ajax_Upgrader_Skin();
	$upgrader = new Plugin_Upgrader( $skin );
	$ok       = $upgrader->install( $package, array( 'overwrite_package' => true ) );
	if ( is_wp_error( $ok ) ) {
		return $ok;
	}
	if ( ! $ok ) {
		$errors = $skin->get_errors();
		throw new Exception( 'Install failed: ' . ( is_wp_error( $errors ) && $errors->has_errors() ? $errors->get_error_message() : implode( ' ', $skin->get_error_messages() ) ) );
	}
	$file = $upgrader->plugin_info();
	if ( $activate && $file && ! is_plugin_active( $file ) ) {
		$r = activate_plugin( $file );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
	}
	clc_clear_caches();
	$data = $file ? get_plugin_data( WP_PLUGIN_DIR . '/' . $file, false, false ) : array();
	return array( 'installed' => $file, 'name' => $data['Name'] ?? '', 'version' => $data['Version'] ?? '', 'active' => $file ? is_plugin_active( $file ) : false );
}

/* =========================================================================
 * The tools
 * ========================================================================= */

function clc_tools() {
	$s   = fn( $d ) => array( 'type' => 'string', 'description' => $d );
	$n   = fn( $d ) => array( 'type' => 'number', 'description' => $d );
	$i   = fn( $d ) => array( 'type' => 'integer', 'description' => $d );
	$b   = fn( $d ) => array( 'type' => 'boolean', 'description' => $d );
	$e   = fn( $d, $v ) => array( 'type' => 'string', 'enum' => $v, 'description' => $d );
	$obj = fn( $d ) => array( 'type' => 'object', 'description' => $d );

	$tools = array(
		// ---------------- any site: reading
		'site_overview'       => array(
			'desc'  => 'The site at a glance: name, address, WordPress / PHP versions, theme, how many posts / pages, comments waiting, plugins with updates' . ( clc_woo() ? ', and the store: sales today and this week, orders by status, out-of-stock products.' : '.' ),
			'props' => array(),
			'run'   => function () {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
				$updates = get_site_transient( 'update_plugins' );
				$out     = array(
					'name'             => wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
					'tagline'          => wp_specialchars_decode( get_bloginfo( 'description' ), ENT_QUOTES ),
					'url'              => home_url( '/' ),
					'language'         => get_locale(),
					'timezone'         => wp_timezone_string(),
					'wordpress'        => get_bloginfo( 'version' ),
					'php'              => PHP_VERSION,
					'theme'            => wp_get_theme()->get( 'Name' ),
					'posts'            => (int) wp_count_posts( 'post' )->publish,
					'pages'            => (int) wp_count_posts( 'page' )->publish,
					'comments_waiting' => (int) wp_count_comments()->moderated,
					'plugins_active'   => count( (array) get_option( 'active_plugins', array() ) ),
					'plugin_updates'   => array_values( array_map( fn( $f ) => $f, array_keys( (array) ( $updates->response ?? array() ) ) ) ),
					'search_engines'   => get_option( 'blog_public' ) ? 'allowed' : 'discouraged (Settings → Reading)',
				);
				if ( clc_woo() ) {
					$counts = array();
					foreach ( array( 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed' ) as $st ) {
						$counts[ $st ] = (int) wc_orders_count( $st );
					}
					$oos = array();
					foreach ( wc_get_products( array( 'limit' => 200, 'status' => 'publish', 'stock_status' => 'outofstock', 'return' => 'objects' ) ) as $p ) {
						$oos[] = $p->get_name();
					}
					$out['store'] = array(
						'currency'         => get_woocommerce_currency(),
						'today'            => clc_sales( 1 ),
						'last_7_days'      => clc_sales( 7 ),
						'orders_by_status' => $counts,
						'out_of_stock'     => $oos,
					);
				}
				return $out;
			},
		),
		'list_posts'          => array(
			'desc'  => 'Posts, pages (or another content type), newest first. Search by words.',
			'props' => array(
				'type'   => $s( 'post (default), page, or another post type.' ),
				'status' => $e( 'Default any.', array( 'any', 'publish', 'draft', 'pending', 'future', 'private' ) ),
				'search' => $s( 'Words to look for.' ),
				'limit'  => $i( 'Default 20, at most 100.' ),
			),
			'run'   => function ( $a ) {
				$type = sanitize_key( $a['type'] ?? 'post' );
				$st   = $a['status'] ?? 'any';
				$q    = array(
					'post_type'        => $type,
					'post_status'      => 'any' === $st ? array( 'publish', 'draft', 'pending', 'future', 'private' ) : sanitize_key( $st ),
					'numberposts'      => min( 100, max( 1, (int) ( $a['limit'] ?? 20 ) ) ),
					'suppress_filters' => false,
				);
				if ( ! empty( $a['search'] ) ) {
					$q['s'] = sanitize_text_field( $a['search'] );
				}
				return array_map(
					fn( $p ) => array( 'id' => $p->ID, 'title' => get_the_title( $p ), 'status' => $p->post_status, 'date' => $p->post_date, 'url' => get_permalink( $p ) ),
					get_posts( $q )
				);
			},
		),
		'get_post'            => array(
			'desc'     => 'One post or page in full: title, content (HTML), excerpt, status, categories, tags, featured image.',
			'props'    => array( 'id' => $i( 'Its id.' ) ),
			'required' => array( 'id' ),
			'run'      => function ( $a ) {
				$p = get_post( (int) $a['id'] );
				if ( ! $p ) {
					throw new Exception( 'Not found.' );
				}
				return array(
					'id'         => $p->ID,
					'type'       => $p->post_type,
					'title'      => $p->post_title,
					'status'     => $p->post_status,
					'date'       => $p->post_date,
					'slug'       => $p->post_name,
					'url'        => get_permalink( $p ),
					'excerpt'    => $p->post_excerpt,
					'content'    => $p->post_content,
					'categories' => wp_get_post_terms( $p->ID, 'category', array( 'fields' => 'names' ) ),
					'tags'       => wp_get_post_terms( $p->ID, 'post_tag', array( 'fields' => 'names' ) ),
					'image'      => get_the_post_thumbnail_url( $p, 'full' ),
				);
			},
		),
		'list_comments'       => array(
			'desc'  => 'Comments' . ( clc_woo() ? ' and product reviews' : '' ) . ': waiting for approval (hold) or approved.',
			'props' => array(
				'status' => $e( 'Default hold.', array( 'hold', 'approve', 'spam', 'all' ) ),
				'type'   => $e( 'Default all.', array( 'all', 'comment', 'review' ) ),
				'limit'  => $i( 'Default 20.' ),
			),
			'run'   => function ( $a ) {
				$q = array( 'status' => $a['status'] ?? 'hold', 'number' => min( 100, (int) ( $a['limit'] ?? 20 ) ) );
				if ( ! empty( $a['type'] ) && 'all' !== $a['type'] ) {
					$q['type'] = $a['type'];
				}
				return array_map(
					fn( $c ) => array(
						'id'     => (int) $c->comment_ID,
						'on'     => get_the_title( $c->comment_post_ID ),
						'type'   => $c->comment_type,
						'author' => $c->comment_author,
						'rating' => (int) get_comment_meta( $c->comment_ID, 'rating', true ),
						'date'   => $c->comment_date,
						'status' => wp_get_comment_status( $c ),
						'text'   => $c->comment_content,
					),
					get_comments( $q )
				);
			},
		),
		'get_site_settings'   => array(
			'desc'  => 'The main WordPress settings: title, tagline, admin email, timezone, date format, front page, posts per page, comments, search-engine visibility.',
			'props' => array(),
			'run'   => fn() => array_combine( clc_site_setting_keys(), array_map( 'get_option', clc_site_setting_keys() ) ),
		),
		'list_menus'          => array(
			'desc'  => 'The navigation menus (Appearance → Menus) with their links, and where each menu shows.',
			'props' => array(),
			'run'   => function () {
				$where = array_flip( array_filter( (array) get_nav_menu_locations() ) );
				$out   = array();
				foreach ( wp_get_nav_menus() as $m ) {
					$out[] = array(
						'id'       => $m->term_id,
						'name'     => $m->name,
						'location' => $where[ $m->term_id ] ?? null,
						'items'    => array_map( fn( $it ) => array( 'id' => $it->ID, 'title' => $it->title, 'url' => $it->url, 'parent' => (int) $it->menu_item_parent ), (array) wp_get_nav_menu_items( $m->term_id ) ),
					);
				}
				return $out;
			},
		),

		// ---------------- any site: changing (Full control)
		'save_post'           => array(
			'desc'  => 'Write a post or page (new, no id) or change one (only the fields given change). New ones are saved as drafts unless status publish is asked for.',
			'props' => array(
				'id'         => $i( 'The one to change.' ),
				'type'       => $s( 'post (default) or page, for a new one.' ),
				'title'      => $s( 'Title.' ),
				'content'    => $s( 'Body (HTML).' ),
				'excerpt'    => $s( 'Short summary.' ),
				'slug'       => $s( 'Address part, e.g. my-first-post.' ),
				'status'     => $e( 'draft (default for new) / publish / private.', array( 'draft', 'publish', 'private', 'pending' ) ),
				'categories' => array( 'type' => 'array', 'items' => array( 'type' => 'string' ), 'description' => 'Category names (made if new).' ),
				'tags'       => array( 'type' => 'array', 'items' => array( 'type' => 'string' ), 'description' => 'Tag names.' ),
			),
			'write' => true,
			'run'   => function ( $a ) {
				$post = array();
				if ( ! empty( $a['id'] ) ) {
					$post['ID'] = (int) $a['id'];
					if ( ! get_post( $post['ID'] ) ) {
						throw new Exception( 'Not found.' );
					}
				} else {
					$post['post_type']   = sanitize_key( $a['type'] ?? 'post' );
					$post['post_status'] = 'draft';
				}
				foreach ( array( 'title' => 'post_title', 'content' => 'post_content', 'excerpt' => 'post_excerpt', 'slug' => 'post_name' ) as $k => $f ) {
					if ( isset( $a[ $k ] ) ) {
						$post[ $f ] = 'content' === $k || 'excerpt' === $k ? wp_kses_post( $a[ $k ] ) : ( 'slug' === $k ? sanitize_title( $a[ $k ] ) : sanitize_text_field( $a[ $k ] ) );
					}
				}
				if ( ! empty( $a['status'] ) ) {
					$post['post_status'] = sanitize_key( $a['status'] );
				}
				$id = ! empty( $post['ID'] ) ? wp_update_post( wp_slash( $post ), true ) : wp_insert_post( wp_slash( $post ), true );
				if ( is_wp_error( $id ) ) {
					return $id;
				}
				if ( isset( $a['categories'] ) ) {
					$cats = array();
					foreach ( (array) $a['categories'] as $name ) {
						$t      = term_exists( sanitize_text_field( $name ), 'category' );
						$t      = $t ? $t : wp_insert_term( sanitize_text_field( $name ), 'category' );
						$cats[] = is_array( $t ) ? (int) $t['term_id'] : (int) $t;
					}
					wp_set_post_categories( $id, array_filter( $cats ) );
				}
				if ( isset( $a['tags'] ) ) {
					wp_set_post_tags( $id, array_map( 'sanitize_text_field', (array) $a['tags'] ) );
				}
				return array( 'id' => $id, 'status' => get_post_status( $id ), 'url' => get_permalink( $id ), 'edit' => get_edit_post_link( $id, 'raw' ) );
			},
		),
		'moderate_comment'    => array(
			'desc'     => 'Approve, hold, mark as spam or bin a comment / review; or reply to it as the site.',
			'props'    => array( 'id' => $i( 'Comment id.' ), 'action' => $e( 'What to do.', array( 'approve', 'hold', 'spam', 'trash', 'reply' ) ), 'reply' => $s( 'The reply (action reply).' ) ),
			'required' => array( 'id', 'action' ),
			'write'    => true,
			'run'      => function ( $a ) {
				$c = get_comment( (int) $a['id'] );
				if ( ! $c ) {
					throw new Exception( 'Comment not found.' );
				}
				if ( 'reply' === $a['action'] ) {
					$u   = wp_get_current_user();
					$rid = wp_insert_comment(
						array(
							'comment_post_ID'      => $c->comment_post_ID,
							'comment_parent'       => $c->comment_ID,
							'comment_content'      => wp_kses_post( (string) ( $a['reply'] ?? '' ) ),
							'comment_author'       => $u->display_name ? $u->display_name : wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
							'comment_author_email' => $u->user_email,
							'user_id'              => $u->ID,
							'comment_approved'     => 1,
							'comment_type'         => $c->comment_type,
						)
					);
					return array( 'reply' => $rid );
				}
				wp_set_comment_status( $c->comment_ID, $a['action'] );
				return array( 'id' => (int) $c->comment_ID, 'status' => wp_get_comment_status( $c->comment_ID ) );
			},
		),
		'update_site_settings' => array(
			'desc'     => 'Change main WordPress settings (keys from get_site_settings; only those keys).',
			'props'    => array( 'values' => $obj( 'key → new value.' ) ),
			'required' => array( 'values' ),
			'write'    => true,
			'run'      => function ( $a ) {
				$keys = clc_site_setting_keys();
				$bad  = array_diff( array_keys( (array) $a['values'] ), $keys );
				if ( $bad ) {
					throw new Exception( 'Not one of these settings: ' . implode( ', ', $bad ) . '. Allowed: ' . implode( ', ', $keys ) );
				}
				foreach ( (array) $a['values'] as $k => $v ) {
					update_option( $k, sanitize_option( $k, $v ) );
				}
				return array_combine( $keys, array_map( 'get_option', $keys ) );
			},
		),
		'clear_cache'         => array(
			'desc'  => 'Clear the site\'s caches (LiteSpeed, WP Rocket, W3 Total Cache, WP Super Cache, WP Fastest Cache, Autoptimize, object cache) so changes show at once.',
			'props' => array(),
			'write' => true,
			'run'   => fn() => array( 'cleared' => clc_clear_caches() ),
		),
	);

	if ( clc_woo() ) {
		$tools += array(
			// ---------------- WooCommerce: reading
			'sales_report'    => array(
				'desc'     => 'Sales for the last N days: orders, revenue, average order, best-selling items.',
				'props'    => array( 'days' => $i( 'How many days back (1 = today).' ) ),
				'required' => array( 'days' ),
				'run'      => fn( $a ) => clc_sales( min( 366, max( 1, (int) $a['days'] ) ) ),
			),
			'search_products' => array(
				'desc'  => 'Find products by name or SKU (empty = all), with each variation\'s id, price, sale price and stock.',
				'props' => array(
					'query'  => $s( 'Words in the name, or the SKU.' ),
					'status' => $e( 'Default publish.', array( 'publish', 'draft', 'private', 'any' ) ),
					'limit'  => $i( 'Default 30, at most 100.' ),
				),
				'run'   => function ( $a ) {
					$st = $a['status'] ?? 'publish';
					$q  = array( 'limit' => min( 100, max( 1, (int) ( $a['limit'] ?? 30 ) ) ), 'status' => 'any' === $st ? array( 'publish', 'draft', 'private', 'pending' ) : $st, 'orderby' => 'title', 'order' => 'ASC' );
					if ( ! empty( $a['query'] ) ) {
						$byskU = wc_get_product_id_by_sku( sanitize_text_field( $a['query'] ) );
						if ( $byskU ) {
							$p = wc_get_product( $byskU );
							return $p ? array( clc_product( $p->get_parent_id() ? wc_get_product( $p->get_parent_id() ) : $p ) ) : array();
						}
						$q['s'] = sanitize_text_field( $a['query'] );
					}
					return array_map( 'clc_product', wc_get_products( $q ) );
				},
			),
			'get_product'     => array(
				'desc'  => 'One product in full (variations, prices, stock, description, categories, sales, rating) by id or slug.',
				'props' => array( 'id' => $i( 'Product id.' ), 'slug' => $s( 'Or its slug.' ) ),
				'run'   => function ( $a ) {
					$p = ! empty( $a['id'] ) ? wc_get_product( (int) $a['id'] ) : null;
					if ( ! $p && ! empty( $a['slug'] ) ) {
						$post = get_page_by_path( sanitize_title( $a['slug'] ), OBJECT, 'product' );
						$p    = $post ? wc_get_product( $post->ID ) : null;
					}
					if ( ! $p ) {
						throw new Exception( 'Product not found.' );
					}
					return clc_product( $p, true );
				},
			),
			'list_orders'     => array(
				'desc'  => 'Recent orders, newest first. Filter by status or search a name / phone / email.',
				'props' => array(
					'status' => $e( 'Default any.', array( 'any', 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed' ) ),
					'search' => $s( 'Name, phone or email.' ),
					'limit'  => $i( 'Default 20, at most 100.' ),
				),
				'run'   => function ( $a ) {
					$limit  = min( 100, max( 1, (int) ( $a['limit'] ?? 20 ) ) );
					$status = ! empty( $a['status'] ) && 'any' !== $a['status'] ? sanitize_key( $a['status'] ) : '';
					if ( ! empty( $a['search'] ) ) {
						$ids = array_map( 'intval', (array) wc_order_search( sanitize_text_field( $a['search'] ) ) );
						rsort( $ids );
						$found = array();
						foreach ( $ids as $oid ) {
							$o = wc_get_order( $oid );
							if ( $o && ( ! $status || $o->get_status() === $status ) ) {
								$found[] = clc_order( $o );
							}
							if ( count( $found ) >= $limit ) {
								break;
							}
						}
						return $found;
					}
					$q = array( 'limit' => $limit, 'orderby' => 'date', 'order' => 'DESC', 'type' => 'shop_order' );
					if ( $status ) {
						$q['status'] = 'wc-' . $status;
					}
					return array_map( 'clc_order', wc_get_orders( $q ) );
				},
			),
			'get_order'       => array(
				'desc'     => 'One order in full (customer, address, items, shipping, discounts, notes).',
				'props'    => array( 'id' => $i( 'Order id.' ) ),
				'required' => array( 'id' ),
				'run'      => function ( $a ) {
					$o = wc_get_order( (int) $a['id'] );
					if ( ! $o ) {
						throw new Exception( 'Order not found.' );
					}
					return clc_order( $o, true );
				},
			),
			'list_coupons'    => array(
				'desc'  => 'Coupon codes with their discount, usage and expiry.',
				'props' => array(),
				'run'   => fn() => array_map(
					function ( $p ) {
						$c = new WC_Coupon( $p->ID );
						return array( 'id' => $c->get_id(), 'code' => $c->get_code(), 'type' => $c->get_discount_type(), 'amount' => clc_money( $c->get_amount() ), 'used' => $c->get_usage_count(), 'limit' => $c->get_usage_limit(), 'expires' => $c->get_date_expires() ? $c->get_date_expires()->date( 'Y-m-d' ) : null, 'status' => $p->post_status );
					},
					get_posts( array( 'post_type' => 'shop_coupon', 'post_status' => array( 'publish', 'draft' ), 'numberposts' => 100 ) )
				),
			),

			// ---------------- WooCommerce: changing (Full control)
			'update_product'  => array(
				'desc'     => 'Change a product or one of its variations (use the variation id from search_products for its price / stock). Only the fields given change. sale_price "" ends the sale.',
				'props'    => array(
					'id'                => $i( 'Product id, or a variation id.' ),
					'name'              => $s( 'New name.' ),
					'status'            => $e( 'publish = on the store, draft = hidden.', array( 'publish', 'draft', 'private' ) ),
					'regular_price'     => $s( 'Price.' ),
					'sale_price'        => $s( 'Sale price, or "" to end the sale.' ),
					'sku'               => $s( 'SKU.' ),
					'stock_status'      => $e( 'Stock status.', array( 'instock', 'outofstock', 'onbackorder' ) ),
					'stock_quantity'    => $i( 'Units in stock (turns stock counting on).' ),
					'short_description' => $s( 'Short description (HTML).' ),
					'description'       => $s( 'Full description (HTML).' ),
				),
				'required' => array( 'id' ),
				'write'    => true,
				'run'      => function ( $a ) {
					$p = wc_get_product( (int) $a['id'] );
					if ( ! $p ) {
						throw new Exception( 'Product not found.' );
					}
					if ( isset( $a['name'] ) && ! $p->is_type( 'variation' ) ) {
						$p->set_name( sanitize_text_field( $a['name'] ) );
					}
					if ( isset( $a['status'] ) ) {
						$p->set_status( sanitize_key( $a['status'] ) );
					}
					foreach ( array( 'regular_price', 'sale_price' ) as $k ) {
						if ( isset( $a[ $k ] ) ) {
							if ( $p->is_type( 'variable' ) ) {
								throw new Exception( 'Prices belong to the variations: use a variation id from search_products.' );
							}
							$p->{'set_' . $k}( '' === trim( (string) $a[ $k ] ) ? '' : (string) max( 0, (float) $a[ $k ] ) );
						}
					}
					if ( isset( $a['sku'] ) ) {
						$p->set_sku( sanitize_text_field( $a['sku'] ) );
					}
					if ( isset( $a['stock_quantity'] ) ) {
						$p->set_manage_stock( true );
						$p->set_stock_quantity( (int) $a['stock_quantity'] );
					}
					if ( isset( $a['stock_status'] ) ) {
						$p->set_stock_status( sanitize_key( $a['stock_status'] ) );
					}
					if ( isset( $a['short_description'] ) && ! $p->is_type( 'variation' ) ) {
						$p->set_short_description( wp_kses_post( $a['short_description'] ) );
					}
					if ( isset( $a['description'] ) ) {
						$p->set_description( wp_kses_post( $a['description'] ) );
					}
					$p->save();
					if ( $p->is_type( 'variation' ) ) {
						WC_Product_Variable::sync( $p->get_parent_id() );
						return clc_product( wc_get_product( $p->get_parent_id() ) );
					}
					return clc_product( wc_get_product( $p->get_id() ) );
				},
			),
			'update_order'    => array(
				'desc'     => 'Change an order\'s status and / or add a note (a customer note is emailed to them).',
				'props'    => array(
					'id'            => $i( 'Order id.' ),
					'status'        => $e( 'New status.', array( 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed' ) ),
					'note'          => $s( 'A note on the order.' ),
					'note_customer' => $b( 'Send the note to the customer too.' ),
				),
				'required' => array( 'id' ),
				'write'    => true,
				'run'      => function ( $a ) {
					$o = wc_get_order( (int) $a['id'] );
					if ( ! $o ) {
						throw new Exception( 'Order not found.' );
					}
					if ( ! empty( $a['note'] ) ) {
						$o->add_order_note( sanitize_textarea_field( $a['note'] ), ! empty( $a['note_customer'] ), true );
					}
					if ( ! empty( $a['status'] ) ) {
						$o->update_status( sanitize_key( $a['status'] ), 'Changed by Claude. ', true );
					}
					return clc_order( wc_get_order( $o->get_id() ), true );
				},
			),
			'create_coupon'   => array(
				'desc'     => 'Make a coupon code.',
				'props'    => array(
					'code'        => $s( 'The code customers type.' ),
					'type'        => $e( 'percent = % off the order, fixed_cart = an amount off the order.', array( 'percent', 'fixed_cart' ) ),
					'amount'      => $n( 'The % or the amount.' ),
					'expires'     => $s( 'Last day, YYYY-MM-DD (optional).' ),
					'usage_limit' => $i( 'How many times in all (optional).' ),
					'per_user'    => $i( 'How many times per customer (optional).' ),
					'minimum'     => $n( 'Smallest order it works on (optional).' ),
				),
				'required' => array( 'code', 'type', 'amount' ),
				'write'    => true,
				'run'      => function ( $a ) {
					$code = wc_format_coupon_code( (string) $a['code'] );
					if ( '' === $code || wc_get_coupon_id_by_code( $code ) ) {
						throw new Exception( 'That code is empty or already exists.' );
					}
					$c = new WC_Coupon();
					$c->set_code( $code );
					$c->set_discount_type( 'fixed_cart' === $a['type'] ? 'fixed_cart' : 'percent' );
					$c->set_amount( max( 0, (float) $a['amount'] ) );
					if ( ! empty( $a['expires'] ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $a['expires'] ) ) {
						$c->set_date_expires( $a['expires'] . ' 23:59:59' );
					}
					if ( ! empty( $a['usage_limit'] ) ) {
						$c->set_usage_limit( (int) $a['usage_limit'] );
					}
					if ( ! empty( $a['per_user'] ) ) {
						$c->set_usage_limit_per_user( (int) $a['per_user'] );
					}
					if ( ! empty( $a['minimum'] ) ) {
						$c->set_minimum_amount( (float) $a['minimum'] );
					}
					$c->save();
					return array( 'id' => $c->get_id(), 'code' => $c->get_code() );
				},
			),
		);
	}

	// ---------------- Admin: files and plugins
	$tools += array(
		'list_files'        => array(
			'desc'  => 'The files and folders in a folder of the site (path from the WordPress root, e.g. "" or "wp-content/themes").',
			'props' => array( 'path' => $s( 'Folder, from the site root.' ) ),
			'admin' => true,
			'run'   => function ( $a ) {
				$dir = clc_path( $a['path'] ?? '', true );
				$out = array();
				foreach ( (array) scandir( $dir ) as $f ) {
					if ( '.' === $f || '..' === $f ) {
						continue;
					}
					$full  = $dir . '/' . $f;
					$out[] = array( 'name' => $f, 'type' => is_dir( $full ) ? 'dir' : 'file', 'size' => is_file( $full ) ? filesize( $full ) : null, 'modified' => gmdate( 'Y-m-d H:i', (int) filemtime( $full ) ) );
				}
				return $out;
			},
		),
		'read_file'         => array(
			'desc'     => 'A text file of the site (up to 1 MB). wp-config.php and other secret files are never shown.',
			'props'    => array( 'path' => $s( 'File, from the site root.' ) ),
			'required' => array( 'path' ),
			'admin'    => true,
			'run'      => function ( $a ) {
				$file = clc_path( $a['path'] );
				if ( ! is_file( $file ) ) {
					throw new Exception( 'No such file.' );
				}
				if ( filesize( $file ) > MB_IN_BYTES ) {
					throw new Exception( 'Too big to read here (over 1 MB).' );
				}
				return array( 'path' => clc_rel( $file ), 'content' => (string) file_get_contents( $file ) );
			},
		),
		'write_file'        => array(
			'desc'     => 'Write a file of the site (made if new, replaced if there; the old one is backed up first). Text as "content", or binary as "base64".',
			'props'    => array( 'path' => $s( 'File, from the site root.' ), 'content' => $s( 'Text content.' ), 'base64' => $s( 'Or the bytes, base64.' ) ),
			'required' => array( 'path' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				$file = clc_path( $a['path'] );
				$data = isset( $a['base64'] ) ? base64_decode( (string) $a['base64'], true ) : (string) ( $a['content'] ?? '' );
				if ( false === $data ) {
					throw new Exception( 'The base64 is not valid.' );
				}
				$backup = clc_backup( array( $file ), 'write ' . clc_rel( $file ) );
				wp_mkdir_p( dirname( $file ) );
				if ( false === file_put_contents( $file, $data ) ) {
					throw new Exception( 'Could not write the file (permissions?).' );
				}
				if ( function_exists( 'opcache_invalidate' ) && preg_match( '/\.php$/', $file ) ) {
					opcache_invalidate( $file, true );
				}
				return array( 'path' => clc_rel( $file ), 'bytes' => strlen( $data ), 'backup' => $backup );
			},
		),
		'delete_file'       => array(
			'desc'        => 'Remove a file of the site (it is moved to a backup, so restore_backup brings it back).',
			'props'       => array( 'path' => $s( 'File, from the site root.' ) ),
			'required'    => array( 'path' ),
			'write'       => true,
			'admin'       => true,
			'destructive' => true,
			'run'         => function ( $a ) {
				$file = clc_path( $a['path'] );
				if ( ! is_file( $file ) ) {
					throw new Exception( 'No such file.' );
				}
				$backup = clc_backup( array( $file ), 'delete ' . clc_rel( $file ) );
				unlink( $file );
				return array( 'deleted' => clc_rel( $file ), 'backup' => $backup );
			},
		),
		'list_backups'      => array(
			'desc'  => 'The backups made before files were changed or deleted (newest first).',
			'props' => array(),
			'admin' => true,
			'run'   => fn() => array_slice( (array) get_option( CLC_BACKUPS, array() ), 0, 50 ),
		),
		'restore_backup'    => array(
			'desc'     => 'Put back the files of a backup, as they were before the change (a file that was new is removed).',
			'props'    => array( 'id' => $s( 'Backup id from list_backups.' ) ),
			'required' => array( 'id' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				$id  = preg_replace( '/[^a-z0-9-]/', '', strtolower( (string) $a['id'] ) );
				$dir = clc_backup_dir() . '/' . $id;
				$map = is_readable( $dir . '/files.json' ) ? json_decode( (string) file_get_contents( $dir . '/files.json' ), true ) : null;
				if ( ! $id || ! is_array( $map ) ) {
					throw new Exception( 'Backup not found.' );
				}
				$done = array();
				foreach ( $map as $rel => $info ) {
					$target = clc_path( $rel );
					if ( empty( $info['existed'] ) ) {
						if ( is_file( $target ) ) {
							unlink( $target );
						}
					} else {
						wp_mkdir_p( dirname( $target ) );
						copy( $dir . '/' . $info['copy'], $target );
					}
					$done[] = $rel;
				}
				return array( 'restored' => $done );
			},
		),
		'list_plugins'      => array(
			'desc'  => 'The installed plugins (and must-use plugins), active or not, with versions and available updates.',
			'props' => array(),
			'admin' => true,
			'run'   => function () {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
				$updates = (array) ( get_site_transient( 'update_plugins' )->response ?? array() );
				$out     = array();
				foreach ( get_plugins() as $file => $p ) {
					$out[] = array( 'file' => $file, 'name' => $p['Name'], 'version' => $p['Version'], 'active' => is_plugin_active( $file ), 'update' => isset( $updates[ $file ] ) ? $updates[ $file ]->new_version : null );
				}
				foreach ( get_mu_plugins() as $file => $p ) {
					$out[] = array( 'file' => 'mu-plugins/' . $file, 'name' => $p['Name'] ? $p['Name'] : $file, 'version' => $p['Version'], 'active' => true, 'must_use' => true );
				}
				return $out;
			},
		),
		'list_themes'       => array(
			'desc'  => 'The installed themes and which one is on.',
			'props' => array(),
			'admin' => true,
			'run'   => fn() => array_values(
				array_map(
					fn( $t ) => array( 'slug' => $t->get_stylesheet(), 'name' => $t->get( 'Name' ), 'version' => $t->get( 'Version' ), 'active' => get_stylesheet() === $t->get_stylesheet() ),
					wp_get_themes()
				)
			),
		),
		'install_plugin'    => array(
			'desc'     => 'Install a plugin from wordpress.org by its slug (e.g. "redirection") and switch it on.',
			'props'    => array( 'slug' => $s( 'The plugin\'s slug on wordpress.org.' ), 'activate' => $b( 'Default true.' ) ),
			'required' => array( 'slug' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
				$api = plugins_api( 'plugin_information', array( 'slug' => sanitize_key( $a['slug'] ), 'fields' => array( 'sections' => false ) ) );
				if ( is_wp_error( $api ) ) {
					return $api;
				}
				return clc_install_plugin( $api->download_link, ! isset( $a['activate'] ) || ! empty( $a['activate'] ) );
			},
		),
		'update_plugin'     => array(
			'desc'     => 'Update an installed plugin to its newest version (its file from list_plugins).',
			'props'    => array( 'file' => $s( 'e.g. woocommerce/woocommerce.php' ) ),
			'required' => array( 'file' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				clc_upgrader_files();
				wp_update_plugins();
				$file     = plugin_basename( (string) $a['file'] );
				$was      = is_plugin_active( $file );
				$skin     = new WP_Ajax_Upgrader_Skin();
				$upgrader = new Plugin_Upgrader( $skin );
				$ok       = $upgrader->upgrade( $file );
				if ( is_wp_error( $ok ) ) {
					return $ok;
				}
				if ( ! $ok ) {
					throw new Exception( 'Nothing to update, or the update failed: ' . implode( ' ', $skin->get_error_messages() ) );
				}
				if ( $was && ! is_plugin_active( $file ) ) {
					activate_plugin( $file );
				}
				$data = get_plugin_data( WP_PLUGIN_DIR . '/' . $file, false, false );
				return array( 'file' => $file, 'version' => $data['Version'], 'active' => is_plugin_active( $file ) );
			},
		),
		'set_plugin_active' => array(
			'desc'     => 'Switch an installed plugin on or off (its file from list_plugins).',
			'props'    => array( 'file' => $s( 'e.g. redirection/redirection.php' ), 'active' => $b( 'On or off.' ) ),
			'required' => array( 'file', 'active' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
				$file = plugin_basename( (string) $a['file'] );
				if ( ! isset( get_plugins()[ $file ] ) ) {
					throw new Exception( 'No such plugin.' );
				}
				if ( plugin_basename( __FILE__ ) === $file && empty( $a['active'] ) ) {
					throw new Exception( 'Claude Connection can only be switched off from the dashboard.' );
				}
				if ( ! empty( $a['active'] ) ) {
					$r = activate_plugin( $file );
					if ( is_wp_error( $r ) ) {
						return $r;
					}
				} else {
					deactivate_plugins( $file );
				}
				return array( 'file' => $file, 'active' => is_plugin_active( $file ) );
			},
		),
		'upload_chunk'      => array(
			'desc'     => 'Send a zip (a plugin) in pieces of base64: same upload_id for every piece, index 0, 1, 2… Then install_zip with that upload_id.',
			'props'    => array( 'upload_id' => $s( 'Your name for this upload (letters / digits).' ), 'index' => $i( 'Piece number, from 0.' ), 'base64' => $s( 'The piece.' ) ),
			'required' => array( 'upload_id', 'index', 'base64' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				$id   = sanitize_key( $a['upload_id'] );
				$data = base64_decode( (string) $a['base64'], true );
				if ( ! $id || false === $data ) {
					throw new Exception( 'Bad upload id or base64.' );
				}
				$file = clc_backup_dir() . '/upload-' . $id . '.zip';
				if ( 0 === (int) $a['index'] && is_file( $file ) ) {
					unlink( $file );
				}
				file_put_contents( $file, $data, FILE_APPEND );
				return array( 'upload_id' => $id, 'bytes' => filesize( $file ), 'md5' => md5_file( $file ) );
			},
		),
		'install_zip'       => array(
			'desc'     => 'Install an uploaded zip as a plugin (replacing the installed copy, like Plugins → Upload → Replace current with uploaded).',
			'props'    => array( 'upload_id' => $s( 'From upload_chunk.' ), 'md5' => $s( 'Optional: the zip\'s md5, to check it arrived whole.' ), 'activate' => $b( 'Switch it on after (default true).' ) ),
			'required' => array( 'upload_id' ),
			'write'    => true,
			'admin'    => true,
			'run'      => function ( $a ) {
				$file = clc_backup_dir() . '/upload-' . sanitize_key( $a['upload_id'] ) . '.zip';
				if ( ! is_file( $file ) ) {
					throw new Exception( 'No such upload.' );
				}
				if ( ! empty( $a['md5'] ) && md5_file( $file ) !== strtolower( (string) $a['md5'] ) ) {
					unlink( $file );
					throw new Exception( 'The zip didn\'t arrive whole (md5 differs). Send it again.' );
				}
				try {
					return clc_install_plugin( $file, ! isset( $a['activate'] ) || ! empty( $a['activate'] ) );
				} finally {
					if ( is_file( $file ) ) {
						unlink( $file );
					}
				}
			},
		),
	);
	return $tools;
}

/** The WordPress settings get_site_settings shows and update_site_settings may change. */
function clc_site_setting_keys() {
	return array( 'blogname', 'blogdescription', 'admin_email', 'timezone_string', 'date_format', 'time_format', 'start_of_week', 'show_on_front', 'page_on_front', 'page_for_posts', 'posts_per_page', 'default_comment_status', 'comment_moderation', 'blog_public' );
}

/* =========================================================================
 * The page: Tools → Claude connection
 * ========================================================================= */

function clc_page_url() {
	return admin_url( 'tools.php?page=claude-connection' );
}

add_action(
	'admin_menu',
	function () {
		add_management_page( 'Claude connection', 'Claude connection', 'manage_options', 'claude-connection', 'clc_page' );
	}
);

add_filter(
	'plugin_action_links_' . plugin_basename( __FILE__ ),
	function ( $links ) {
		array_unshift( $links, '<a href="' . esc_url( clc_page_url() ) . '">Settings</a>' );
		return $links;
	}
);

add_action(
	'admin_post_claude_connection',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Sorry, you are not allowed to change this.' );
		}
		check_admin_referer( 'claude_connection' );
		$o  = clc_options();
		$do = isset( $_POST['do'] ) ? sanitize_key( wp_unslash( $_POST['do'] ) ) : '';
		if ( 'on' === $do || 'newkey' === $do ) {
			$o['on']   = true;
			$o['user'] = get_current_user_id();
			clc_save( $o );
			if ( 'newkey' === $do || ! $o['hash'] ) {
				set_transient( 'clc_key_' . get_current_user_id(), clc_new_key(), 10 * MINUTE_IN_SECONDS ); // shown once, on the next screen
			}
		} elseif ( 'off' === $do ) {
			$o['on'] = false;
			clc_save( $o );
		} elseif ( 'mode' === $do ) {
			$mode       = isset( $_POST['mode'] ) ? sanitize_key( wp_unslash( $_POST['mode'] ) ) : 'read';
			$o['mode']  = in_array( $mode, array( 'read', 'full', 'admin' ), true ) ? $mode : 'read';
			$hours      = isset( $_POST['hours'] ) ? (int) $_POST['hours'] : 24;
			$o['until'] = 'admin' === $o['mode'] && $hours > 0 ? time() + $hours * HOUR_IN_SECONDS : 0;
			$o['user']  = get_current_user_id();
			clc_save( $o );
		} elseif ( 'clearlog' === $do ) {
			delete_option( CLC_LOG );
		}
		wp_safe_redirect( clc_page_url() );
		exit;
	}
);

function clc_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$o   = clc_options();
	$key = get_transient( 'clc_key_' . get_current_user_id() );
	if ( $key ) {
		delete_transient( 'clc_key_' . get_current_user_id() );
	}
	$url  = rest_url( 'claude-connection/v1/mcp/' );
	$log  = get_option( CLC_LOG, array() );
	$name = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
	$form = function ( $do, $label, $class = '' ) {
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="display:inline">';
		echo '<input type="hidden" name="action" value="claude_connection"><input type="hidden" name="do" value="' . esc_attr( $do ) . '">';
		wp_nonce_field( 'claude_connection' );
		echo '<button type="submit" class="' . esc_attr( $class ) . '">' . esc_html( $label ) . '</button></form>';
	};
	?>
	<div class="wrap clc">
		<header class="clc-hero">
			<p class="clc-eyebrow">Tools</p>
			<h1>Claude connection</h1>
			<p>Connect Claude to <b><?php echo esc_html( $name ); ?></b> so you can just ask: “how were sales this week?”, “write a draft post about…”, “approve the waiting comments”<?php echo clc_woo() ? ', “put this product on sale until Friday”' : ''; ?>. Claude reads first and tells you what it will change before it does.</p>
		</header>

		<section class="clc-card">
			<div class="clc-row">
				<div>
					<h2>Connection <span class="clc-pill <?php echo $o['on'] ? 'is-on' : ''; ?>"><?php echo $o['on'] ? 'On' : 'Off'; ?></span></h2>
					<p class="clc-muted"><?php echo $o['on'] ? 'Claude can reach this site with the secret address below.' : 'Nobody can reach the site this way. Switch it on to get the address.'; ?></p>
				</div>
				<div><?php $o['on'] ? $form( 'off', 'Switch off', 'clc-btn clc-ghost' ) : $form( 'on', 'Switch on', 'clc-btn' ); ?></div>
			</div>
			<?php if ( $o['on'] ) : ?>
				<div class="clc-key">
					<?php if ( $key ) : ?>
						<p><b>Your connection address</b> — copy it now: for safety it is shown only this once.</p>
						<div class="clc-copy"><input type="text" readonly id="clc-url" value="<?php echo esc_attr( $url . $key ); ?>"><button type="button" class="clc-btn" onclick="var i=document.getElementById('clc-url');i.select();navigator.clipboard&&navigator.clipboard.writeText(i.value);this.textContent='Copied ✓'">Copy</button></div>
					<?php else : ?>
						<p><b>Connection address:</b> <code><?php echo esc_html( $url ); ?>…<?php echo esc_html( $o['hint'] ); ?></code> (hidden for safety). Lost it? Make a new one — the old address stops working at once.</p>
					<?php endif; ?>
					<p class="clc-warn">Treat this address like a password: whoever has it can do what the level below allows. Don't post it anywhere.</p>
					<?php $form( 'newkey', 'Make a new address', 'clc-btn clc-ghost' ); ?>
				</div>
			<?php endif; ?>
		</section>

		<section class="clc-card">
			<h2>What Claude may do</h2>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="clc-modes">
				<input type="hidden" name="action" value="claude_connection"><input type="hidden" name="do" value="mode">
				<?php wp_nonce_field( 'claude_connection' ); ?>
				<label class="clc-mode"><input type="radio" name="mode" value="read" <?php checked( 'read', $o['mode'] ); ?> onchange="this.form.submit()"><span><b>Read only</b><small>Posts, pages, comments, settings, menus<?php echo clc_woo() ? ', sales, orders, products, coupons' : ''; ?> — look, don't touch.</small></span></label>
				<label class="clc-mode"><input type="radio" name="mode" value="full" <?php checked( 'full', $o['mode'] ); ?> onchange="this.form.submit()"><span><b>Full control</b><small>Also write and edit posts and pages, moderate comments, change the main settings, clear the cache<?php echo clc_woo() ? ', change prices, stock and products, order status, make coupons' : ''; ?>. Nothing is deleted.</small></span></label>
				<label class="clc-mode clc-admin"><input type="radio" name="mode" value="admin" <?php checked( 'admin', $o['mode'] ); ?> onchange="this.form.submit()"><span><b>Admin — like you</b><small>Everything above, plus the site's files and plugins: edit files, install / update / switch plugins, upload plugin zips. Every file changed or deleted is backed up first and can be put back. wp-config.php (the database password) stays out of reach.</small>
					<span class="clc-for">For <select name="hours" onchange="if(this.form.querySelector('[value=admin]').checked)this.form.submit()">
						<?php foreach ( array( 2 => '2 hours', 24 => '24 hours', 168 => '7 days', 0 => 'until I switch it back' ) as $h => $label ) : ?>
							<option value="<?php echo esc_attr( $h ); ?>" <?php selected( 24 === $h ); ?>><?php echo esc_html( $label ); ?></option>
						<?php endforeach; ?>
					</select>, then back to Full control on its own.</span>
					<?php if ( 'admin' === $o['mode'] ) : ?>
						<em class="clc-left"><?php echo 'admin' === clc_level() ? ( empty( $o['until'] ) ? 'On until you switch it back.' : 'On until ' . esc_html( wp_date( 'j M, H:i', (int) $o['until'] ) ) . '.' ) : 'Ended — Claude is on Full control now. Choose Admin again to renew.'; ?></em>
					<?php endif; ?>
				</span></label>
			</form>
		</section>

		<section class="clc-card">
			<h2>Add it to Claude</h2>
			<ol class="clc-steps">
				<li>On <b>claude.ai</b> (or the Claude app): <b>Settings → Connectors → Add custom connector</b>.</li>
				<li>Name: <b><?php echo esc_html( $name ); ?></b>. URL: paste the connection address. Leave the advanced options empty → <b>Add</b>.</li>
				<li>In a chat, turn it on from the tools menu, and ask.</li>
			</ol>
			<p class="clc-muted">Claude Code: <code>claude mcp add --transport http my-site &lt;the address&gt;</code> · Each site has its own address: add one connector per site.</p>
		</section>

		<section class="clc-card">
			<div class="clc-row"><h2>Activity</h2><?php if ( $log ) { $form( 'clearlog', 'Clear', 'clc-link' ); } ?></div>
			<?php if ( ! $log ) : ?>
				<p class="clc-muted">Nothing yet. Everything Claude reads or changes shows here.</p>
			<?php else : ?>
				<table class="clc-log">
					<thead><tr><th>When</th><th>What</th><th>Details</th><th></th></tr></thead>
					<tbody>
					<?php foreach ( array_slice( $log, 0, 100 ) as $l ) : ?>
						<tr>
							<td class="clc-when"><?php echo esc_html( wp_date( 'j M · H:i', $l['t'] ) ); ?></td>
							<td><code><?php echo esc_html( $l['tool'] ); ?></code></td>
							<td class="clc-args"><?php echo esc_html( '[]' === $l['args'] ? '' : $l['args'] ); ?><?php echo $l['note'] ? '<br><em>' . esc_html( $l['note'] ) . '</em>' : ''; ?></td>
							<td><?php echo $l['ok'] ? '<span class="clc-ok">✓</span>' : '<span class="clc-no">✗</span>'; ?></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</section>
	</div>
	<style>
		.clc{max-width:980px;margin:20px 20px 0 0;color:#1d1a16;font-size:14px}
		.clc-hero{border-radius:24px;padding:28px 32px;background:radial-gradient(120% 140% at 0% 0%,#4b3a8c 0%,#231a46 50%,#120d24 100%);color:#d8d2ee}
		.clc-eyebrow{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#d9a35b}
		.clc-hero h1{margin:0;color:#fff;font-size:30px;font-weight:600}
		.clc-hero p{max-width:680px;line-height:1.55;font-size:14.5px}
		.clc-hero b{color:#fff}
		.clc-card{background:#fff;border:1px solid #e6e2ef;border-radius:20px;padding:20px 22px;margin-top:16px}
		.clc-card h2{margin:0 0 6px;font-size:19px;display:flex;align-items:center;gap:10px}
		.clc-row{display:flex;justify-content:space-between;align-items:center;gap:16px}
		.clc-muted{color:#6f6a7d;margin:4px 0}
		.clc-pill{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;background:#eeeaf4;color:#6f6a7d;text-transform:uppercase;letter-spacing:.08em}
		.clc-pill.is-on{background:#e1f2dc;color:#2f6a1f}
		.clc-btn{border:0;border-radius:999px;background:#d97757;color:#fff;font-weight:700;padding:10px 22px;cursor:pointer}
		.clc-btn:hover{background:#c4643f}
		.clc-ghost{background:#f1eef6;color:#1d1a16}
		.clc-ghost:hover{background:#e4dfee}
		.clc-link{border:0;background:none;color:#6f6a7d;text-decoration:underline;cursor:pointer}
		.clc-key{margin-top:16px;padding:16px;border-radius:14px;background:#faf8fd;border:1px solid #ebe6f3}
		.clc-copy{display:flex;gap:8px;margin:8px 0}
		.clc-copy input{flex:1;font-family:monospace;font-size:13px;border:1px solid #ddd6ea;border-radius:10px;padding:8px 10px;background:#fff}
		.clc-warn{color:#9a5b00;font-size:12.5px}
		.clc-modes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
		.clc-admin{grid-column:1/-1}
		.clc-mode{display:flex;gap:10px;align-items:flex-start;border:1px solid #e6e2ef;border-radius:14px;padding:14px;cursor:pointer}
		.clc-mode:has(input:checked){border-color:#d97757;background:#fdf6f2;box-shadow:0 0 0 2px rgba(217,119,87,.18)}
		.clc-mode input{margin-top:3px;accent-color:#d97757}
		.clc-mode small{display:block;color:#6f6a7d;margin-top:3px;line-height:1.45}
		.clc-for{display:block;margin-top:8px;font-size:12.5px;color:#4f4a5d}
		.clc-left{display:block;margin-top:6px;color:#9a5b00;font-style:normal;font-weight:600}
		.clc-steps{margin:8px 0 8px 20px;line-height:1.8}
		.clc-log{width:100%;border-collapse:collapse;margin-top:8px}
		.clc-log th{text-align:left;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7d778b;padding:6px 8px;border-bottom:1px solid #e6e2ef}
		.clc-log td{padding:7px 8px;border-bottom:1px solid #f1eef6;vertical-align:top}
		.clc-when{white-space:nowrap}
		.clc-args{font-family:monospace;font-size:12px;color:#4f4a5d;word-break:break-all}
		.clc-ok{color:#2f8a2f;font-weight:700}.clc-no{color:#c33;font-weight:700}
		@media (max-width:782px){.clc-modes{grid-template-columns:1fr}}
	</style>
	<?php
}

/* Removing the plugin removes its settings, log and backups. */
register_uninstall_hook( __FILE__, 'clc_uninstall' );
function clc_uninstall() {
	delete_option( CLC_OPTION );
	delete_option( CLC_LOG );
	delete_option( CLC_BACKUPS );
	$dir = WP_CONTENT_DIR . '/claude-connection-backups';
	if ( is_dir( $dir ) ) {
		$it = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $dir, FilesystemIterator::SKIP_DOTS ), RecursiveIteratorIterator::CHILD_FIRST );
		foreach ( $it as $f ) {
			$f->isDir() ? rmdir( $f->getPathname() ) : unlink( $f->getPathname() );
		}
		rmdir( $dir );
	}
}
