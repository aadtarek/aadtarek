<?php
/**
 * Reliable email: send through an SMTP account (Gmail, Zoho, hosting mailbox…)
 * instead of the server's mail(), which most hosts block or send to spam.
 * Settings live in Appearance → Pottery Hub → Email delivery.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

/** Saved SMTP settings. */
function ph_smtp() {
	return wp_parse_args(
		(array) get_option( 'ph_smtp', array() ),
		array(
			'host'      => '',
			'port'      => 587,
			'secure'    => 'tls',
			'user'      => '',
			'pass'      => '',
			'from'      => '',
			'from_name' => '',
		)
	);
}

add_action(
	'phpmailer_init',
	function ( $mail ) {
		$s = ph_smtp();
		if ( ! $s['host'] ) {
			return;
		}
		$mail->isSMTP();
		$mail->Host       = $s['host'];
		$mail->Port       = (int) $s['port'];
		$mail->SMTPSecure = in_array( $s['secure'], array( 'tls', 'ssl' ), true ) ? $s['secure'] : '';
		$mail->SMTPAuth   = '' !== $s['user'];
		$mail->Username   = $s['user'];
		$mail->Password   = $s['pass'];
		$mail->Timeout    = 15;
		$from             = $s['from'] ? $s['from'] : $s['user'];
		if ( is_email( $from ) ) {
			$mail->setFrom( $from, $s['from_name'] ? $s['from_name'] : get_bloginfo( 'name' ), false );
		}
	}
);

/** Same sender for WooCommerce emails. */
add_filter(
	'woocommerce_email_from_address',
	function ( $a ) {
		$s    = ph_smtp();
		$from = $s['from'] ? $s['from'] : $s['user'];
		return $s['host'] && is_email( $from ) ? $from : $a;
	}
);

/** Remember the last failure so the admin can see why mail isn't arriving. */
add_action(
	'wp_mail_failed',
	function ( $err ) {
		update_option(
			'ph_mail_error',
			array(
				'time' => current_time( 'mysql' ),
				'msg'  => $err->get_error_message(),
			),
			false
		);
	}
);

/** Save the form (called from the admin page). */
function ph_smtp_save() {
	// phpcs:disable WordPress.Security.NonceVerification -- verified in ph_admin_page().
	$old = ph_smtp();
	$new = array(
		'host'      => isset( $_POST['smtp_host'] ) ? sanitize_text_field( wp_unslash( $_POST['smtp_host'] ) ) : '',
		'port'      => isset( $_POST['smtp_port'] ) ? absint( $_POST['smtp_port'] ) : 587,
		'secure'    => isset( $_POST['smtp_secure'] ) ? sanitize_key( wp_unslash( $_POST['smtp_secure'] ) ) : 'tls',
		'user'      => isset( $_POST['smtp_user'] ) ? sanitize_text_field( wp_unslash( $_POST['smtp_user'] ) ) : '',
		'from'      => isset( $_POST['smtp_from'] ) ? sanitize_email( wp_unslash( $_POST['smtp_from'] ) ) : '',
		'from_name' => isset( $_POST['smtp_from_name'] ) ? sanitize_text_field( wp_unslash( $_POST['smtp_from_name'] ) ) : '',
	);
	// Keep the saved password when the field is left empty.
	$pass        = isset( $_POST['smtp_pass'] ) ? trim( (string) wp_unslash( $_POST['smtp_pass'] ) ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- passwords may contain any character.
	$new['pass'] = '' !== $pass ? $pass : $old['pass'];
	// phpcs:enable
	update_option( 'ph_smtp', $new, false );
	delete_option( 'ph_mail_error' );
	return __( 'Email settings saved. Send a test email to check them.', 'potteryhub' );
}

/** Send a test email to the store's order-notification address. */
function ph_smtp_test() {
	$to = ph_order_email_recipient();
	delete_option( 'ph_mail_error' );
	$ok = wp_mail( $to, __( 'Pottery Hub — test email', 'potteryhub' ), __( 'If you can read this, order emails will arrive too.', 'potteryhub' ) );
	if ( $ok ) {
		/* translators: %s: email address */
		return sprintf( __( 'Test email sent to %s. Check the inbox (and spam).', 'potteryhub' ), $to );
	}
	$e = get_option( 'ph_mail_error' );
	/* translators: %s: error message */
	return sprintf( __( 'The email could not be sent: %s', 'potteryhub' ), $e ? $e['msg'] : __( 'unknown error', 'potteryhub' ) );
}

/** Where WooCommerce sends "New order" emails. */
function ph_order_email_recipient() {
	$s = get_option( 'woocommerce_new_order_settings', array() );
	return ! empty( $s['recipient'] ) ? $s['recipient'] : get_option( 'admin_email' );
}

/** Make sure the order emails are switched on (they can be turned off in WooCommerce → Settings → Emails). */
function ph_enable_order_emails() {
	foreach ( array( 'new_order', 'customer_processing_order', 'customer_on_hold_order', 'customer_completed_order', 'cancelled_order', 'failed_order' ) as $id ) {
		$o = get_option( 'woocommerce_' . $id . '_settings', array() );
		if ( is_array( $o ) && isset( $o['enabled'] ) && 'no' === $o['enabled'] ) {
			$o['enabled'] = 'yes';
			update_option( 'woocommerce_' . $id . '_settings', $o );
		}
	}
}

/** Admin card. */
function ph_smtp_card() {
	$s   = ph_smtp();
	$err = get_option( 'ph_mail_error' );
	echo '<div class="card" style="max-width:760px"><h2>' . esc_html__( '7. Email delivery (order emails)', 'potteryhub' ) . '</h2>';
	echo '<p>' . esc_html__( 'Most hosting servers block or spam-folder emails sent the default way, so order emails never arrive. Connect a real mailbox here and every email (new order, order confirmation, forms) goes through it.', 'potteryhub' ) . '</p>';
	/* translators: %s: email address */
	echo '<p><b>' . esc_html( sprintf( __( 'New-order emails go to: %s', 'potteryhub' ), ph_order_email_recipient() ) ) . '</b> — <a href="' . esc_url( admin_url( 'admin.php?page=wc-settings&tab=email&section=wc_email_new_order' ) ) . '">' . esc_html__( 'change', 'potteryhub' ) . '</a></p>';
	if ( $err ) {
		/* translators: 1: date, 2: error */
		echo '<div class="notice notice-error inline"><p>' . esc_html( sprintf( __( 'Last email failure (%1$s): %2$s', 'potteryhub' ), $err['time'], $err['msg'] ) ) . '</p></div>';
	}
	echo '<form method="post">';
	wp_nonce_field( 'ph_tools' );
	echo '<input type="hidden" name="ph_tool" value="smtp_save"><table class="form-table" role="presentation">';
	$row = function ( $label, $html ) {
		echo '<tr><th scope="row">' . esc_html( $label ) . '</th><td>' . $html . '</td></tr>'; // phpcs:ignore WordPress.Security.EscapeOutput
	};
	$row( __( 'SMTP server', 'potteryhub' ), '<input name="smtp_host" class="regular-text" value="' . esc_attr( $s['host'] ) . '" placeholder="smtp.gmail.com">' );
	$row( __( 'Port & security', 'potteryhub' ), '<input name="smtp_port" type="number" class="small-text" value="' . esc_attr( $s['port'] ) . '"> <select name="smtp_secure"><option value="tls"' . selected( $s['secure'], 'tls', false ) . '>TLS (587)</option><option value="ssl"' . selected( $s['secure'], 'ssl', false ) . '>SSL (465)</option><option value="none"' . selected( $s['secure'], 'none', false ) . '>' . esc_html__( 'None', 'potteryhub' ) . '</option></select>' );
	$row( __( 'Username (email)', 'potteryhub' ), '<input name="smtp_user" class="regular-text" value="' . esc_attr( $s['user'] ) . '" autocomplete="off">' );
	$row( __( 'Password', 'potteryhub' ), '<input name="smtp_pass" type="password" class="regular-text" value="" autocomplete="new-password" placeholder="' . esc_attr( $s['pass'] ? __( '(saved — leave empty to keep)', 'potteryhub' ) : '' ) . '"><p class="description">' . esc_html__( 'Gmail: use an "App password" (Google Account → Security → 2-Step Verification → App passwords), not your normal password.', 'potteryhub' ) . '</p>' );
	$row( __( 'From email (optional)', 'potteryhub' ), '<input name="smtp_from" class="regular-text" value="' . esc_attr( $s['from'] ) . '">' );
	$row( __( 'From name (optional)', 'potteryhub' ), '<input name="smtp_from_name" class="regular-text" value="' . esc_attr( $s['from_name'] ) . '" placeholder="' . esc_attr( get_bloginfo( 'name' ) ) . '">' );
	echo '</table>';
	submit_button( __( 'Save email settings', 'potteryhub' ), 'primary', 'submit', false );
	echo '</form><form method="post" style="margin-top:10px">';
	wp_nonce_field( 'ph_tools' );
	echo '<input type="hidden" name="ph_tool" value="smtp_test">';
	submit_button( __( 'Send a test email', 'potteryhub' ), 'secondary', 'submit', false );
	echo '</form></div>';
}

/** Admin warning while an email failure is on record. */
add_action(
	'admin_notices',
	function () {
		$e = get_option( 'ph_mail_error' );
		if ( ! $e || ! current_user_can( 'manage_options' ) || ( isset( $_GET['page'] ) && 'potteryhub' === $_GET['page'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		echo '<div class="notice notice-error"><p>' . esc_html__( 'Emails from the shop are failing, so customers and you may not get order emails.', 'potteryhub' ) . ' <a href="' . esc_url( admin_url( 'themes.php?page=potteryhub#smtp' ) ) . '">' . esc_html__( 'Fix email delivery', 'potteryhub' ) . '</a></p></div>';
	}
);
