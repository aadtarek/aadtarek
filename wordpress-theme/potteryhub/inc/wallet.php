<?php
/**
 * "Digital wallet" payment: the shopper sends the order total from any mobile wallet to the
 * shop's wallet number, the order waits "on hold" until the transfer is seen.
 * Number, title and texts can be changed in WooCommerce → Settings → Payments → Digital wallet.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

/** The wallet number, grouped for reading (010 9262 6818). */
function ph_wallet_pretty( $n ) {
	$d = preg_replace( '/\D+/', '', (string) $n );
	if ( 0 === strpos( $d, '20' ) && 12 === strlen( $d ) ) {
		$d = '0' . substr( $d, 2 );
	}
	return 11 === strlen( $d ) ? substr( $d, 0, 3 ) . ' ' . substr( $d, 3, 4 ) . ' ' . substr( $d, 7 ) : $d;
}

class PH_Gateway_Wallet extends WC_Payment_Gateway {

	/** @var string Wallet number customers send to. */
	public $number = '';

	public function __construct() {
		$this->id                 = 'ph_wallet';
		$this->method_title       = __( 'Digital wallet', 'potteryhub' );
		$this->method_description = __( 'Customers send the order total from any mobile wallet to your wallet number. Orders wait on hold until you confirm the transfer.', 'potteryhub' );
		$this->has_fields         = true; // the box with the number shows under the option
		$this->init_form_fields();
		$this->init_settings();
		$this->title  = $this->get_option( 'title' );
		$this->number = $this->get_option( 'number' );
		add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
		add_action( 'woocommerce_before_thankyou', array( $this, 'thankyou_page' ) ); // at the top of the thank-you page
		add_action( 'woocommerce_email_before_order_table', array( $this, 'email_instructions' ), 10, 3 );
	}

	public function init_form_fields() {
		$this->form_fields = array(
			'enabled' => array(
				'title'   => __( 'Enable', 'potteryhub' ),
				'type'    => 'checkbox',
				'label'   => __( 'Accept payment by digital wallet', 'potteryhub' ),
				'default' => 'yes',
			),
			'title'   => array(
				'title'   => __( 'Title', 'potteryhub' ),
				'type'    => 'text',
				'default' => 'Digital wallet',
			),
			'number'  => array(
				'title'   => __( 'Wallet number', 'potteryhub' ),
				'type'    => 'text',
				'default' => '+20 10 92626818',
			),
		);
	}

	/** Shown in the shopper's language while the title is the default one. */
	public function get_title() {
		$t = $this->title;
		if ( 'Digital wallet' === $t || '' === $t ) {
			$t = __( 'Digital wallet', 'potteryhub' );
		}
		return apply_filters( 'woocommerce_gateway_title', $t, $this->id );
	}

	/** The box under the option at checkout. */
	public function payment_fields() {
		echo $this->box( WC()->cart ? WC()->cart->get_total( 'edit' ) : 0, __( 'After you place the order, send the total from any mobile wallet to this number. We’ll confirm your order as soon as the transfer arrives.', 'potteryhub' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	}

	private function box( $amount, $text ) {
		$n = ph_wallet_pretty( $this->number );
		return '<div class="ph-wallet">'
			. '<p>' . esc_html( $text ) . '</p>'
			. '<div class="ph-wallet-n"><span>' . esc_html__( 'Wallet number', 'potteryhub' ) . '</span><b dir="ltr">' . esc_html( $n ) . '</b>'
			. '<button type="button" data-copy="' . esc_attr( preg_replace( '/\s+/', '', $n ) ) . '">' . esc_html__( 'Copy', 'potteryhub' ) . '</button></div>'
			. ( $amount ? '<div class="ph-wallet-a"><span>' . esc_html__( 'Amount to send', 'potteryhub' ) . '</span><b>' . wp_kses_post( wc_price( $amount ) ) . '</b></div>' : '' )
			. '</div>';
	}

	public function process_payment( $order_id ) {
		$order = wc_get_order( $order_id );
		$order->update_status( 'on-hold', __( 'Waiting for the digital wallet transfer.', 'potteryhub' ) );
		wc_reduce_stock_levels( $order_id );
		WC()->cart->empty_cart();
		return array(
			'result'   => 'success',
			'redirect' => $this->get_return_url( $order ),
		);
	}

	public function thankyou_page( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order || $this->id !== $order->get_payment_method() || ! $order->has_status( 'on-hold' ) ) {
			return;
		}
		echo '<section class="ph-wallet-ty"><h2 class="serif">' . esc_html__( 'One last step: send the payment', 'potteryhub' ) . '</h2>'
			. $this->box( $order->get_total(), __( 'Send the total from any mobile wallet to this number, and we’ll confirm your order as soon as it arrives.', 'potteryhub' ) ) // phpcs:ignore WordPress.Security.EscapeOutput
			. '</section>';
	}

	public function email_instructions( $order, $sent_to_admin, $plain_text = false ) {
		if ( $sent_to_admin || $this->id !== $order->get_payment_method() || ! $order->has_status( 'on-hold' ) ) {
			return;
		}
		/* translators: 1: amount, 2: wallet number */
		$line = sprintf( __( 'Please send %1$s from any mobile wallet to %2$s. We’ll confirm your order as soon as the transfer arrives.', 'potteryhub' ), wp_strip_all_tags( wc_price( $order->get_total() ) ), ph_wallet_pretty( $this->number ) );
		echo $plain_text ? esc_html( $line ) . "\n\n" : '<p style="font-size:15px;padding:14px 16px;background:#f3e0d6;border-radius:10px">' . esc_html( $line ) . '</p>';
	}
}

add_filter(
	'woocommerce_payment_gateways',
	function ( $g ) {
		$g[] = 'PH_Gateway_Wallet';
		return $g;
	}
);
