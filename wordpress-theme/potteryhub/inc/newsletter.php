<?php
/**
 * Footer newsletter form: saves emails to a list shown under Appearance → Pottery Hub.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

function ph_newsletter_handle() {
	$back = wp_get_referer() ? wp_get_referer() : home_url( '/' );
	$back = remove_query_arg( 'ph_sub', $back );
	if ( ! isset( $_POST['ph_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ph_nonce'] ) ), 'ph_newsletter' ) ) {
		wp_safe_redirect( add_query_arg( 'ph_sub', 'bad', $back ) );
		exit;
	}
	$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	if ( ! is_email( $email ) ) {
		wp_safe_redirect( add_query_arg( 'ph_sub', 'bad', $back ) );
		exit;
	}
	$list = get_option( 'ph_subscribers', array() );
	if ( ! isset( $list[ strtolower( $email ) ] ) ) {
		$list[ strtolower( $email ) ] = current_time( 'mysql' );
		update_option( 'ph_subscribers', $list, false );
	}
	wp_safe_redirect( add_query_arg( 'ph_sub', 'ok', $back ) . '#about' );
	exit;
}
add_action( 'admin_post_nopriv_ph_newsletter', 'ph_newsletter_handle' );
add_action( 'admin_post_ph_newsletter', 'ph_newsletter_handle' );

/** The footer form. */
function ph_newsletter_form() {
	?>
	<form class="news" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="ph_newsletter">
		<?php wp_nonce_field( 'ph_newsletter', 'ph_nonce' ); ?>
		<input type="email" name="email" required placeholder="<?php esc_attr_e( 'Your email', 'potteryhub' ); ?>" aria-label="<?php esc_attr_e( 'Email', 'potteryhub' ); ?>">
		<button type="submit"><?php esc_html_e( 'Subscribe', 'potteryhub' ); ?></button>
	</form>
	<?php
}
