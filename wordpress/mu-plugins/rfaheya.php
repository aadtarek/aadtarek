<?php
/**
 * Plugin Name: Rfaheya Store
 * Description: WordPress side of the headless Rfaheya storefront: store settings (contact, social, home page), FAQs, page section labels, the "Rfaheya details" box on products, the fragrance notes library, wear-report videos, starter-content import, and the REST routes the storefront reads.
 * Version:     3.0.0
 *
 * Must-use plugin: lives in wp-content/mu-plugins/ and runs automatically.
 * Starter content (articles, pages, FAQs, images) ships in mu-plugins/rfaheya/.
 */

defined( 'ABSPATH' ) || exit;

const RFAHEYA_OPTION = 'rfaheya_store';
// Bump when the shop data changes shape or how it is gathered: older saved copies are then rebuilt.
const RFAHEYA_DATA_VERSION = 10;

// ==================================================================== settings

/** Settings fields: group => key => [label, default, type]. */
function rfaheya_fields() {
	return array(
		'contact' => array(
			'email'    => array( 'Contact email', 'hello@rfaheya.com', 'text' ),
			'phone'    => array( 'Phone', '+20 100 000 0000', 'text' ),
			'whatsapp' => array( 'WhatsApp number (international, digits only, e.g. 2010…)', '201000000000', 'text' ),
			'hours'    => array( 'Opening hours', 'Sat – Thu · 10 AM – 8 PM', 'text' ),
			'location' => array( 'Location', 'Cairo, Egypt', 'text' ),
			'instapay' => array( 'InstaPay address customers transfer to', 'rfaheya@instapay', 'text' ),
		),
		'social'  => array(
			'instagram' => array( 'Instagram URL', 'https://www.instagram.com/', 'url' ),
			'tiktok'    => array( 'TikTok URL', 'https://www.tiktok.com/', 'url' ),
			'youtube'   => array( 'YouTube URL', 'https://www.youtube.com/', 'url' ),
			'facebook'  => array( 'Facebook URL', 'https://www.facebook.com/', 'url' ),
		),
		'home'    => array(
			'announcement_1' => array( 'Announcement bar — message 1', '', 'text' ),
			'announcement_2' => array( 'Announcement bar — message 2', '', 'text' ),
			'announcement_3' => array( 'Announcement bar — message 3', '', 'text' ),
			'hero_eyebrow'   => array( 'Hero — small line above the title', '', 'text' ),
			'hero_title'     => array( 'Hero — title (press Enter for a new line)', '', 'textarea' ),
			'hero_text'      => array( 'Hero — text', '', 'textarea' ),
			'hero_image'     => array( 'Hero — image', '', 'image' ),
			'logo'           => array( 'Logo (header, footer and My Account) — PNG or SVG; empty uses the built-in logo', '', 'image' ),
			'logo_height'    => array( 'Logo size — height in the header on computers (px, 30–90; 56 is the default)', '56', 'text' ),
			'logo_height_mobile' => array( 'Logo size — height in the header on phones (px, 28–70; 48 is the default)', '48', 'text' ),
			'logo_footer'    => array( 'Logo size — width in the footer (px, 120–360; 240 is the default)', '240', 'text' ),
		),
		'slider'  => array(
			'enabled'         => array( 'Show the hero slider on the home page (otherwise the single hero above)', 'yes', 'yesno' ),
			'interval'        => array( 'Seconds per slide', '6', 'text' ),
			'intro'           => array( 'Opening animation on the first visit (“Speak your scent”) — looks lovely but slows the PageSpeed score', 'no', 'yesno' ),
			'slide_1_image'   => array( 'Slide 1 — image (945 × 780)', '', 'image' ),
			'slide_1_mobile'  => array( 'Slide 1 — image for phones (optional, 358 × 550)', '', 'image' ),
			'slide_1_closed'  => array( 'Slide 1 — narrow image while closed (optional, computers, 170 × 780)', '', 'image' ),
			'slide_1_eyebrow' => array( 'Slide 1 — small line above the title', '', 'text' ),
			'slide_1_title'   => array( 'Slide 1 — title', '', 'text' ),
			'slide_1_text'    => array( 'Slide 1 — text under the title', '', 'textarea' ),
			'slide_1_button'  => array( 'Slide 1 — button text', '', 'text' ),
			'slide_1_link'    => array( 'Slide 1 — button link (e.g. /shop or /collections/oud)', '', 'text' ),
			'slide_2_image'   => array( 'Slide 2 — image (945 × 780)', '', 'image' ),
			'slide_2_mobile'  => array( 'Slide 2 — image for phones (optional, 358 × 550)', '', 'image' ),
			'slide_2_closed'  => array( 'Slide 2 — narrow image while closed (optional, computers, 170 × 780)', '', 'image' ),
			'slide_2_eyebrow' => array( 'Slide 2 — small line above the title', '', 'text' ),
			'slide_2_title'   => array( 'Slide 2 — title', '', 'text' ),
			'slide_2_text'    => array( 'Slide 2 — text under the title', '', 'textarea' ),
			'slide_2_button'  => array( 'Slide 2 — button text', '', 'text' ),
			'slide_2_link'    => array( 'Slide 2 — button link (e.g. /shop or /collections/oud)', '', 'text' ),
			'slide_3_image'   => array( 'Slide 3 — image (945 × 780)', '', 'image' ),
			'slide_3_mobile'  => array( 'Slide 3 — image for phones (optional, 358 × 550)', '', 'image' ),
			'slide_3_closed'  => array( 'Slide 3 — narrow image while closed (optional, computers, 170 × 780)', '', 'image' ),
			'slide_3_eyebrow' => array( 'Slide 3 — small line above the title', '', 'text' ),
			'slide_3_title'   => array( 'Slide 3 — title', '', 'text' ),
			'slide_3_text'    => array( 'Slide 3 — text under the title', '', 'textarea' ),
			'slide_3_button'  => array( 'Slide 3 — button text', '', 'text' ),
			'slide_3_link'    => array( 'Slide 3 — button link (e.g. /shop or /collections/oud)', '', 'text' ),
			'slide_4_image'   => array( 'Slide 4 — image (945 × 780)', '', 'image' ),
			'slide_4_mobile'  => array( 'Slide 4 — image for phones (optional, 358 × 550)', '', 'image' ),
			'slide_4_closed'  => array( 'Slide 4 — narrow image while closed (optional, computers, 170 × 780)', '', 'image' ),
			'slide_4_eyebrow' => array( 'Slide 4 — small line above the title', '', 'text' ),
			'slide_4_title'   => array( 'Slide 4 — title', '', 'text' ),
			'slide_4_text'    => array( 'Slide 4 — text under the title', '', 'textarea' ),
			'slide_4_button'  => array( 'Slide 4 — button text', '', 'text' ),
			'slide_4_link'    => array( 'Slide 4 — button link (e.g. /shop or /collections/oud)', '', 'text' ),
		),
		'login'   => array(
			'google_client_id'     => array( 'Google — Client ID', '', 'text' ),
			'google_client_secret' => array( 'Google — Client secret', '', 'secret' ),
			'facebook_app_id'      => array( 'Facebook — App ID', '', 'text' ),
			'facebook_app_secret'  => array( 'Facebook — App secret', '', 'secret' ),
		),
		'bundle'  => array(
			'enabled' => array( 'Show the bundle section and apply its discount', 'yes', 'yesno' ),
			'title'   => array( 'Title', 'Build your trio.', 'text' ),
			'text'    => array( 'Text', 'Pick any three fragrances in 30 ML and pay less for the set.', 'textarea' ),
			'size'    => array( 'Bottle size in the bundle (must match the variation size, e.g. 30 ML)', '30 ML', 'text' ),
			'count'   => array( 'Bottles per bundle', '3', 'text' ),
			'price'   => array( 'Bundle price (EGP)', '1200', 'text' ),
		),
		'loyalty'  => array(
			'enabled'         => array( 'Loyalty points: customers earn points on completed orders and use them as a discount', 'yes', 'yesno' ),
			'earn'            => array( 'Points earned per 1 EGP spent (shipping not counted)', '1', 'text' ),
			'value'           => array( 'Discount value of 100 points (EGP)', '5', 'text' ),
			'min'             => array( 'Fewest points a customer can use at once', '200', 'text' ),
			'welcome_enabled' => array( 'Welcome discount: a discount on the first order (with an animated pop-up) for customers who sign in', 'yes', 'yesno' ),
			'welcome_percent' => array( 'Welcome discount (%)', '5', 'text' ),
		),
		'gift'     => array(
			'enabled' => array( 'Charge gift packaging on gift boxes', 'yes', 'yesno' ),
			'max'     => array( 'Most fragrances in one box', '6', 'text' ),
			'prices'  => array( 'Packaging price by number of fragrances in the box — one per line, “fragrances = price (EGP)”. A box with more fragrances than the last line pays the last price.', "1 = 60\n2 = 90\n3 = 120\n4 = 150\n5 = 180\n6 = 200", 'textarea' ),
			'wrap_enabled' => array( 'Gift wrap in the cart (a switch: the order is boxed with a handwritten card)', 'yes', 'yesno' ),
			'wrap_price'   => array( 'Gift wrap price (EGP)', '50', 'text' ),
		),
		'shipping' => array(
			'free_enabled' => array( 'Free shipping in Cairo & Alexandria (and the bar on the product page, cart and checkout)', 'yes', 'yesno' ),
			'free_min'     => array( 'Free shipping from (EGP)', '1200', 'text' ),
			'offer_enabled' => array( 'Spend more, save more: a discount plus free shipping (anywhere) from a higher amount, shown on the same bar', 'yes', 'yesno' ),
			'offer_min'     => array( 'Discount + free shipping from (EGP)', '2500', 'text' ),
			'offer_percent' => array( 'Discount (%)', '20', 'text' ),
			'order_min'     => array( 'Minimum order (EGP) — the smallest basket that can be ordered; 0 for none', '300', 'text' ),
		),
	);
}

function rfaheya_group_title( $group ) {
	$titles = array(
		'contact' => 'Contact details',
		'social'  => 'Social links',
		'home'    => 'Home page (empty fields keep the storefront’s built-in text)',
		'bundle'  => 'Bundle (home page “Build your trio”; the discount is applied in the cart)',
		'slider'  => 'Home hero slider (up to four slides, each with your own image and text; they open like an accordion. A slide shows when it has an image or a title; with none filled in, three built-in slides show)',
		'login'   => 'Sign in with Google / Facebook (the buttons show once the keys are filled in)',
		'shipping' => 'Free shipping & spend-more offer (the bar on the product page, cart and checkout; applied in the WooCommerce cart and shipping rates)',
		'gift'     => 'Gift boxes (customers fill a box with any fragrances; a hidden “Gift box” product carries the packaging price)',
		'loyalty'  => 'Loyalty points & welcome discount (points are added when an order is marked Completed; a customer’s points can be changed on their user profile)',
	);
	return isset( $titles[ $group ] ) ? $titles[ $group ] : $group;
}

function rfaheya_options() {
	$saved = get_option( RFAHEYA_OPTION, array() );
	$saved = is_array( $saved ) ? $saved : array();
	$out   = array();
	foreach ( rfaheya_fields() as $group => $fields ) {
		foreach ( $fields as $key => $field ) {
			$value                 = isset( $saved[ $group ][ $key ] ) ? (string) $saved[ $group ][ $key ] : '';
			$out[ $group ][ $key ] = '' !== $value ? $value : $field[1];
		}
	}
	return $out;
}

add_action(
	'admin_init',
	function () {
		register_setting(
			'rfaheya_store',
			RFAHEYA_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => 'rfaheya_clean_settings',
			)
		);
	}
);

add_action(
	'admin_menu',
	function () {
		add_options_page( 'Rfaheya Store', 'Rfaheya Store', 'manage_options', 'rfaheya-store', 'rfaheya_settings_page' );
	}
);

/** Tabs of the Rfaheya Store page: title, dashicon, one line about it, and the field groups in it. */
function rfaheya_settings_tabs() {
	return array(
		'store'    => array( 'Store', 'dashicons-store', 'How customers reach you, and your social pages.', array( 'contact', 'social' ) ),
		'home'     => array( 'Home & logo', 'dashicons-admin-home', 'The announcement bar, the hero, the slider and your logo.', array( 'home', 'slider' ) ),
		'offers'   => array( 'Orders & offers', 'dashicons-tag', 'Minimum order, free shipping, the spend-more offer and the bundle.', array( 'shipping', 'bundle' ) ),
		'gifts'    => array( 'Gift boxes', 'dashicons-heart', 'Packaging prices for the gift boxes customers build.', array( 'gift' ) ),
		'loyalty'  => array( 'Loyalty', 'dashicons-awards', 'Points and the first-order welcome discount.', array( 'loyalty' ) ),
		'signin'   => array( 'Sign in', 'dashicons-admin-users', 'Google and Facebook sign-in buttons.', array( 'login' ) ),
		'tools'    => array( 'Tools', 'dashicons-admin-tools', 'Starter content and store health.', array() ),
	);
}

/** Smaller headings inside a group, by field name. */
function rfaheya_settings_section( $group, $key ) {
	if ( 'home' === $group ) {
		if ( 0 === strpos( $key, 'announcement' ) ) {
			return 'Announcement bar';
		}
		if ( 0 === strpos( $key, 'hero' ) ) {
			return 'Hero (when the slider is off)';
		}
		return 'Logo';
	}
	if ( 'slider' === $group ) {
		return preg_match( '/^slide_(\d)_/', $key, $m ) ? 'Slide ' . $m[1] : 'Hero slider';
	}
	$titles = array(
		'contact'  => 'Contact details',
		'social'   => 'Social links',
		'shipping' => 'Minimum order, free shipping & spend more',
		'bundle'   => 'Bundle — “Build your trio”',
		'gift'     => 'Gift boxes & gift wrap',
		'loyalty'  => 'Points & welcome discount',
		'login'    => 'Sign in with Google / Facebook',
	);
	return isset( $titles[ $group ] ) ? $titles[ $group ] : $group;
}

/** The submitted settings, cleaned field by field. */
function rfaheya_clean_settings( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();
	foreach ( rfaheya_fields() as $group => $fields ) {
		foreach ( $fields as $key => $field ) {
			$value = isset( $input[ $group ][ $key ] ) ? trim( (string) $input[ $group ][ $key ] ) : '';
			switch ( $field[2] ) {
				case 'url':
					$value = esc_url_raw( $value );
					break;
				case 'textarea':
					$value = str_replace( "\r\n", "\n", sanitize_textarea_field( $value ) );
					break;
				case 'image':
				case 'product':
					$value = $value ? (string) absint( $value ) : '';
					break;
				case 'yesno':
					$value = 'no' === $value ? 'no' : 'yes';
					break;
				default:
					$value = sanitize_text_field( $value );
			}
			$clean[ $group ][ $key ] = $value;
		}
	}
	return $clean;
}

// The page saves through its own handler (no options.php), then comes back to the same tab.
add_action(
	'admin_post_rfaheya_save_settings',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Sorry, you are not allowed to change these settings.' );
		}
		check_admin_referer( 'rfaheya_save_settings' );
		$input = isset( $_POST[ RFAHEYA_OPTION ] ) ? wp_unslash( $_POST[ RFAHEYA_OPTION ] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned field by field below
		$saved = get_option( RFAHEYA_OPTION, array() );
		$saved = is_array( $saved ) ? $saved : array();
		// Groups not on the form keep what they had.
		foreach ( rfaheya_fields() as $group => $fields ) {
			if ( ! isset( $input[ $group ] ) && isset( $saved[ $group ] ) ) {
				$input[ $group ] = $saved[ $group ];
			}
		}
		$clean = rfaheya_clean_settings( $input );
		update_option( RFAHEYA_OPTION, $clean );
		// Content changes show up right away (same as update_option_ hooks; runs even when nothing changed).
		delete_transient( 'rfaheya_bootstrap' );
		rfaheya_purge_page_cache();
		$tab = isset( $_POST['rfaheya_tab'] ) ? sanitize_key( wp_unslash( $_POST['rfaheya_tab'] ) ) : 'store';
		wp_safe_redirect( add_query_arg( array( 'page' => 'rfaheya-store', 'tab' => $tab, 'saved' => '1' ), admin_url( 'options-general.php' ) ) );
		exit;
	}
);

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'settings_page_rfaheya-store' !== $hook ) {
			return;
		}
		wp_enqueue_media();
		$base = WPMU_PLUGIN_URL . '/rfaheya-admin/';
		$ver  = file_exists( __DIR__ . '/rfaheya-admin/settings.css' ) ? (string) filemtime( __DIR__ . '/rfaheya-admin/settings.css' ) : '1';
		wp_enqueue_style( 'rfaheya-settings', $base . 'settings.css', array(), $ver );
		wp_enqueue_script( 'rfaheya-settings', $base . 'settings.js', array( 'jquery' ), $ver, true );
	}
);

/** One field, in the page's own style. */
function rfaheya_settings_field( $group, $key, $field, $value ) {
	$id    = "rfaheya-$group-$key";
	$input = RFAHEYA_OPTION . "[$group][$key]";
	$label = $field[0];
	$help  = '';
	// "Title (explanation)" or "Title — explanation": the explanation shows smaller underneath.
	if ( preg_match( '/^(.+?)\s+\((.+)\)$/u', $label, $m ) ) {
		$label = $m[1];
		$help  = $m[2];
	}
	$range = array(
		'logo_height'        => array( 30, 90 ),
		'logo_height_mobile' => array( 28, 70 ),
		'logo_footer'        => array( 120, 360 ),
	);
	$wide = in_array( $field[2], array( 'textarea', 'image' ), true ) || 'yesno' === $field[2];
	echo '<div class="rfs-field' . ( $wide ? ' rfs-wide' : '' ) . ' rfs-type-' . esc_attr( $field[2] ) . '">';
	if ( 'yesno' === $field[2] ) {
		printf(
			'<label class="rfs-switch"><input type="hidden" name="%1$s" value="no"><input type="checkbox" id="%2$s" name="%1$s" value="yes" %3$s><span class="rfs-track" aria-hidden="true"></span><span class="rfs-switch-text"><strong>%4$s</strong>%5$s</span></label>',
			esc_attr( $input ),
			esc_attr( $id ),
			checked( $value, 'yes', false ),
			esc_html( $label ),
			$help ? '<small>' . esc_html( $help ) . '</small>' : ''
		);
		echo '</div>';
		return;
	}
	printf( '<label class="rfs-label" for="%s">%s</label>', esc_attr( $id ), esc_html( $label ) );
	if ( 'home' === $group && isset( $range[ $key ] ) ) {
		printf(
			'<div class="rfs-range"><input type="range" min="%1$d" max="%2$d" value="%3$d" data-for="%4$s" aria-label="%5$s"><span class="rfs-num"><input id="%4$s" type="number" min="%1$d" max="%2$d" name="%6$s" value="%3$d" data-logo="%7$s"> px</span></div>',
			(int) $range[ $key ][0],
			(int) $range[ $key ][1],
			(int) $value,
			esc_attr( $id ),
			esc_attr( $label ),
			esc_attr( $input ),
			esc_attr( $key )
		);
	} elseif ( 'textarea' === $field[2] ) {
		printf( '<textarea id="%s" rows="3" name="%s">%s</textarea>', esc_attr( $id ), esc_attr( $input ), esc_textarea( $value ) );
	} elseif ( 'product' === $field[2] ) {
		printf( '<select id="%s" name="%s"><option value="">— Best seller —</option>', esc_attr( $id ), esc_attr( $input ) );
		foreach ( rfaheya_one_language( get_posts( array( 'post_type' => 'product', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) ) ) as $p ) {
			printf( '<option value="%d" %s>%s</option>', (int) $p->ID, selected( (int) $value, $p->ID, false ), esc_html( get_the_title( $p ) ) );
		}
		echo '</select>';
	} elseif ( 'image' === $field[2] ) {
		$url = $value ? wp_get_attachment_image_url( (int) $value, 'medium' ) : '';
		printf(
			'<div class="rfs-image%5$s"><input id="%1$s" type="hidden" name="%2$s" value="%3$s"><button type="button" class="rfs-image-pick" data-target="%1$s" data-logo="%6$s"><span class="rfs-image-preview" id="%1$s-preview">%4$s</span><span class="rfs-image-empty"><span class="dashicons dashicons-format-image"></span>Choose image</span></button><button type="button" class="rfs-image-clear" data-target="%1$s">Remove</button></div>',
			esc_attr( $id ),
			esc_attr( $input ),
			esc_attr( $value ),
			$url ? '<img src="' . esc_url( $url ) . '" alt="">' : '',
			$url ? ' has-image' : '',
			'logo' === $key && 'home' === $group ? '1' : ''
		);
	} else {
		$type = 'url' === $field[2] ? 'url' : ( 'secret' === $field[2] ? 'password' : 'text' );
		printf( '<input id="%s" type="%s" name="%s" value="%s" autocomplete="off">', esc_attr( $id ), esc_attr( $type ), esc_attr( $input ), esc_attr( $value ) );
	}
	if ( $help ) {
		printf( '<small class="rfs-help">%s</small>', esc_html( $help ) );
	}
	echo '</div>';
}

function rfaheya_settings_page() {
	$options = rfaheya_options();
	$tabs    = rfaheya_settings_tabs();
	$fields  = rfaheya_fields();
	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- which tab to show, and notices
	$tab   = isset( $_GET['tab'] ) && isset( $tabs[ sanitize_key( $_GET['tab'] ) ] ) ? sanitize_key( $_GET['tab'] ) : 'store';
	$saved = isset( $_GET['saved'] );
	$note  = isset( $_GET['rfaheya-imported'] ) ? sanitize_text_field( wp_unslash( $_GET['rfaheya-imported'] ) ) : '';
	// phpcs:enable
	$logo  = rfaheya_logo_url();
	?>
	<div class="wrap rfs">
		<header class="rfs-hero">
			<div>
				<p class="rfs-eyebrow">Rfaheya · Speak your scent</p>
				<h1>Store settings</h1>
				<p>Everything the storefront shows — change it here and it’s live on the site in a moment.</p>
			</div>
			<a class="rfs-btn rfs-btn-light" href="<?php echo esc_url( home_url( '/' ) ); ?>" target="_blank" rel="noopener">View store <span class="dashicons dashicons-external"></span></a>
		</header>
		<?php if ( $saved ) : ?>
			<div class="rfs-toast" role="status"><span class="dashicons dashicons-yes-alt"></span> Saved — it’s live on the store.</div>
		<?php endif; ?>
		<?php if ( $note ) : ?>
			<div class="rfs-toast" role="status"><span class="dashicons dashicons-yes-alt"></span> <?php echo esc_html( $note ); ?></div>
		<?php endif; ?>

		<div class="rfs-layout">
			<nav class="rfs-nav" aria-label="Settings">
				<?php foreach ( $tabs as $slug => $t ) : ?>
					<a href="<?php echo esc_url( add_query_arg( array( 'page' => 'rfaheya-store', 'tab' => $slug ), admin_url( 'options-general.php' ) ) ); ?>" class="<?php echo $slug === $tab ? 'is-active' : ''; ?>" data-tab="<?php echo esc_attr( $slug ); ?>">
						<span class="dashicons <?php echo esc_attr( $t[1] ); ?>"></span>
						<span><strong><?php echo esc_html( $t[0] ); ?></strong><small><?php echo esc_html( $t[2] ); ?></small></span>
					</a>
				<?php endforeach; ?>
			</nav>

			<div class="rfs-main">
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="rfs-form">
					<input type="hidden" name="action" value="rfaheya_save_settings">
					<input type="hidden" name="rfaheya_tab" value="<?php echo esc_attr( $tab ); ?>">
					<?php wp_nonce_field( 'rfaheya_save_settings' ); ?>
					<?php foreach ( $tabs as $slug => $t ) : ?>
						<section class="rfs-panel" data-panel="<?php echo esc_attr( $slug ); ?>" <?php echo $slug === $tab ? '' : 'hidden'; ?>>
							<?php
							if ( 'tools' === $slug ) {
								echo '</section>';
								continue;
							}
							foreach ( $t[3] as $group ) {
								if ( 'login' === $group ) {
									echo '<div class="rfs-card rfs-info"><p><strong>Google:</strong> <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud → Credentials</a> → OAuth client ID (Web application). Authorized redirect URI:<br><code>' . esc_html( rfaheya_oauth_redirect_uri( 'google' ) ) . '</code></p><p><strong>Facebook:</strong> <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener">Meta for Developers</a> → your app → Facebook Login → Valid OAuth Redirect URIs:<br><code>' . esc_html( rfaheya_oauth_redirect_uri( 'facebook' ) ) . '</code></p></div>';
								}
								$sections = array();
								foreach ( $fields[ $group ] as $key => $field ) {
									$sections[ rfaheya_settings_section( $group, $key ) ][ $key ] = $field;
								}
								foreach ( $sections as $title => $list ) {
									$is_slide = 'slider' === $group && 0 === strpos( $title, 'Slide ' );
									echo $is_slide ? '<details class="rfs-card rfs-collapsible"><summary>' : '<div class="rfs-card">';
									echo '<h2>' . esc_html( $title ) . '</h2>';
									echo $is_slide ? '</summary>' : '';
									if ( 'home' === $group && 'Logo' === $title ) {
										?>
										<div class="rfs-logo-preview" data-logo-src="<?php echo esc_url( $logo ); ?>">
											<div class="rfs-lp-desktop"><span class="rfs-lp-label">Computer</span><div class="rfs-lp-bar"><img alt="" data-size="desktop"><i></i><i></i><i></i><b></b></div></div>
											<div class="rfs-lp-row">
												<div class="rfs-lp-phone"><span class="rfs-lp-label">Phone</span><div class="rfs-lp-bar"><b class="rfs-lp-menu"></b><img alt="" data-size="mobile"><b></b></div></div>
												<div class="rfs-lp-footer"><span class="rfs-lp-label">Footer</span><div class="rfs-lp-dark"><img alt="" data-size="footer"></div></div>
											</div>
										</div>
										<?php
									}
									echo '<div class="rfs-grid">';
									foreach ( $list as $key => $field ) {
										rfaheya_settings_field( $group, $key, $field, $options[ $group ][ $key ] );
									}
									echo '</div>';
									echo $is_slide ? '</details>' : '</div>';
								}
							}
							?>
						</section>
					<?php endforeach; ?>
					<div class="rfs-savebar" <?php echo 'tools' === $tab ? 'hidden' : ''; ?>>
						<span>Changes go live on the store as soon as you save.</span>
						<button type="submit" class="rfs-btn">Save changes</button>
					</div>
				</form>

				<section class="rfs-panel" data-panel="tools-extra" <?php echo 'tools' === $tab ? '' : 'hidden'; ?>>
					<div class="rfs-card">
						<h2>Starter content</h2>
						<p class="rfs-text">Copies the storefront’s built-in content into WordPress so you can edit it here: journal articles (Posts), information pages (Pages), FAQs, home page texts and images (Media), and fragrance family images (Products → Categories). It also fills the “Rfaheya details” box of each product from its attributes. Anything that already exists is left untouched, so it is safe to run again.</p>
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
							<input type="hidden" name="action" value="rfaheya_import">
							<?php wp_nonce_field( 'rfaheya_import' ); ?>
							<button type="submit" class="rfs-btn rfs-btn-ghost">Import starter content</button>
						</form>
					</div>
					<div class="rfs-card">
						<h2>Store health</h2>
						<?php
						$fresh   = get_transient( 'rfaheya_bootstrap' );
						$count   = is_array( $fresh ) && isset( $fresh['products'] ) ? count( $fresh['products'] ) : 0;
						$missing = rfaheya_missing_products();
						?>
						<ul class="rfs-stats">
							<li><strong><?php echo esc_html( number_format_i18n( $count ) ); ?></strong><span>products on the storefront</span></li>
							<li><strong><?php echo esc_html( number_format_i18n( count( $missing ) ) ); ?></strong><span>products not showing</span></li>
							<li><strong><?php echo esc_html( RFAHEYA_DATA_VERSION ); ?></strong><span>data version</span></li>
						</ul>
					</div>
				</section>
			</div>
		</div>
	</div>
	<?php
}

// ==================================================================== products missing from the storefront

/**
 * Products that exist in WooCommerce but don't show on the storefront, with the
 * reason. Shown on the Products screen and on Settings → Rfaheya Store.
 */
function rfaheya_missing_products() {
	if ( ! function_exists( 'wc_get_product' ) ) {
		return array();
	}
	$shown = array();
	$data  = rfaheya_bootstrap();
	if ( empty( $data['products'] ) ) {
		return array();
	}
	foreach ( (array) $data['products'] as $p ) {
		$shown[ (int) $p['id'] ] = true;
	}
	$gift = (int) ( (array) get_option( 'rfaheya_gift_box', array() ) + array( 'product' => 0 ) )['product'];
	$hide_out = 'yes' === get_option( 'woocommerce_hide_out_of_stock_items' );
	$missing  = array();
	$ids      = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts' => -1,
			'fields'      => 'ids',
		)
	);
	foreach ( $ids as $id ) {
		if ( isset( $shown[ $id ] ) || $id === $gift || 0 === strpos( (string) get_post_field( 'post_name', $id ), 'rfaheya-gift-' ) ) {
			continue;
		}
		$product = wc_get_product( $id );
		if ( ! $product ) {
			continue;
		}
		$status = get_post_status( $id );
		if ( 'publish' !== $status ) {
			$labels = array( 'draft' => 'Draft', 'pending' => 'Pending review', 'private' => 'Private', 'future' => 'Scheduled' );
			$reason = sprintf( 'Not published (%s) — open it and press Publish.', isset( $labels[ $status ] ) ? $labels[ $status ] : $status );
		} elseif ( post_password_required( $id ) || '' !== get_post_field( 'post_password', $id ) ) {
			$reason = 'Password protected — remove the password (Publish box → Visibility: Public).';
		} elseif ( in_array( $product->get_catalog_visibility(), array( 'hidden', 'search' ), true ) ) {
			$reason = 'Catalog visibility is “' . $product->get_catalog_visibility() . '” — set it to “Shop and search results” (Publish box).';
		} elseif ( $hide_out && ! $product->is_in_stock() ) {
			$reason = 'Out of stock, and WooCommerce → Settings → Products → Inventory hides out-of-stock products.';
		} elseif ( '' === (string) $product->get_price() ) {
			$reason = 'No price — add a price (or prices on its variations).';
		} else {
			$reason = 'Not in the storefront data yet — it refreshes on its own within a few minutes after any save.';
		}
		$missing[] = array(
			'id'     => $id,
			'name'   => get_the_title( $id ),
			'reason' => $reason,
		);
	}
	return $missing;
}

add_action(
	'admin_notices',
	function () {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || ! current_user_can( 'edit_products' ) || ! in_array( $screen->id, array( 'edit-product' ), true ) ) {
			return;
		}
		$missing = rfaheya_missing_products();
		if ( ! $missing ) {
			return;
		}
		echo '<div class="notice notice-warning"><p><strong>' . esc_html( sprintf( '%d product(s) don’t show on the storefront:', count( $missing ) ) ) . '</strong></p><ul style="list-style:disc;margin-left:20px">';
		foreach ( array_slice( $missing, 0, 25 ) as $m ) {
			printf( '<li><a href="%s">%s</a> — %s</li>', esc_url( get_edit_post_link( $m['id'] ) ), esc_html( $m['name'] ), esc_html( $m['reason'] ) );
		}
		echo '</ul></div>';
	}
);

// ==================================================================== hero slider

function rfaheya_hero_slider_data( $s ) {
	$slides = array();
	for ( $i = 1; $i <= 4; $i++ ) {
		$image    = (int) $s[ "slide_{$i}_image" ];
		$mobile   = (int) $s[ "slide_{$i}_mobile" ];
		$closed   = (int) ( $s[ "slide_{$i}_closed" ] ?? 0 );
		$slides[] = array(
			'image'   => $image ? (string) wp_get_attachment_image_url( $image, 'full' ) : '',
			'srcset'  => $image ? (string) wp_get_attachment_image_srcset( $image, 'full' ) : '',
			'mobile'  => $mobile ? (string) wp_get_attachment_image_url( $mobile, 'full' ) : '',
			'closed'  => $closed ? (string) wp_get_attachment_image_url( $closed, 'full' ) : '',
			'eyebrow' => (string) $s[ "slide_{$i}_eyebrow" ],
			'title'   => (string) $s[ "slide_{$i}_title" ],
			'text'    => (string) $s[ "slide_{$i}_text" ],
			'button'  => (string) $s[ "slide_{$i}_button" ],
			'link'    => (string) $s[ "slide_{$i}_link" ],
		);
	}
	return array(
		'enabled'  => 'no' !== $s['enabled'],
		'interval' => max( 2, (float) $s['interval'] ),
		'intro'    => 'yes' === ( $s['intro'] ?? 'no' ),
		'slides'   => $slides,
	);
}

// ==================================================================== logo

/** The logo chosen in Settings → Rfaheya Store (empty: the storefront's built-in logo). */
function rfaheya_logo_url() {
	$id = (int) rfaheya_options()['home']['logo'];
	return $id ? (string) wp_get_attachment_image_url( $id, 'full' ) : '';
}

/**
 * The logo as the storefront shows it, prepared once on the server (not in every visitor's
 * phone): its empty margins cut off, made small enough for a sharp footer, and its main
 * colour and darkness read. Kept until the logo changes. Falls back to the original file.
 * Returns array( url, color, dark, trimmed ).
 */
function rfaheya_logo_prepared() {
	$id  = (int) rfaheya_options()['home']['logo'];
	$url = rfaheya_logo_url();
	$out = array(
		'url'     => $url,
		'color'   => '',
		'dark'    => false,
		'trimmed' => false,
	);
	if ( ! $id || ! $url ) {
		return $out;
	}
	$file = get_attached_file( $id );
	if ( ! $file || ! is_readable( $file ) || preg_match( '/\.svg$/i', $file ) || ! function_exists( 'imagecreatefromstring' ) ) {
		return $out;
	}
	$key  = $id . ':' . filemtime( $file ) . ':' . filesize( $file ) . ':2';
	$done = get_option( 'rfaheya_logo_prepared' );
	if ( is_array( $done ) && ( $done['key'] ?? '' ) === $key ) {
		if ( empty( $done['file'] ) || is_readable( $done['file'] ) ) {
			return array_merge( $out, $done['data'] );
		}
	}
	$data = array();
	try {
		$data = rfaheya_logo_prepare( $file, $id );
	} catch ( Throwable $e ) {
		$data = array();
	}
	update_option(
		'rfaheya_logo_prepared',
		array(
			'key'  => $key,
			'file' => $data['file'] ?? '',
			'data' => array_diff_key( $data, array( 'file' => 1 ) ),
		),
		true
	);
	return array_merge( $out, array_diff_key( $data, array( 'file' => 1 ) ) );
}

/** Does the work for rfaheya_logo_prepared(): returns the fields it found (and the new file). */
function rfaheya_logo_prepare( $file, $id ) {
	$src = @imagecreatefromstring( (string) file_get_contents( $file ) ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	if ( ! $src ) {
		return array();
	}
	$w = imagesx( $src );
	$h = imagesy( $src );
	if ( ! imageistruecolor( $src ) ) {
		imagepalettetotruecolor( $src );
	}
	imagealphablending( $src, false );
	imagesavealpha( $src, true );
	// Edges and colour from a small copy (quick for any file size).
	$scale = min( 1, 480 / max( $w, $h ) );
	$sw    = max( 1, (int) round( $w * $scale ) );
	$sh    = max( 1, (int) round( $h * $scale ) );
	$small = imagecreatetruecolor( $sw, $sh );
	imagealphablending( $small, false );
	imagesavealpha( $small, true );
	imagefill( $small, 0, 0, imagecolorallocatealpha( $small, 0, 0, 0, 127 ) );
	imagecopyresampled( $small, $src, 0, 0, 0, 0, $sw, $sh, $w, $h );
	$top    = $sh;
	$bottom = -1;
	$left   = $sw;
	$right  = -1;
	$seen   = 0;
	$light  = 0.0;
	$col    = 0;
	$r      = 0;
	$g      = 0;
	$b      = 0;
	for ( $y = 0; $y < $sh; $y++ ) {
		for ( $x = 0; $x < $sw; $x++ ) {
			$c  = imagecolorat( $small, $x, $y );
			$a  = 255 - ( ( ( $c >> 24 ) & 0x7f ) * 2 );
			$pr = ( $c >> 16 ) & 0xff;
			$pg = ( $c >> 8 ) & 0xff;
			$pb = $c & 0xff;
			if ( $a < 12 || ( $pr > 246 && $pg > 246 && $pb > 246 ) ) {
				continue;
			}
			$top    = min( $top, $y );
			$bottom = max( $bottom, $y );
			$left   = min( $left, $x );
			$right  = max( $right, $x );
			if ( $a < 140 || ( $pr > 242 && $pg > 242 && $pb > 242 ) ) {
				continue;
			}
			++$seen;
			$max    = max( $pr, $pg, $pb );
			$min    = min( $pr, $pg, $pb );
			$luma   = ( 0.299 * $pr + 0.587 * $pg + 0.114 * $pb ) / 255;
			$light += $luma;
			$sat    = 0 === $max ? 0 : ( $max - $min ) / $max;
			if ( $sat > 0.28 && $luma > 0.18 && $luma < 0.9 ) {
				++$col;
				$r += $pr;
				$g += $pg;
				$b += $pb;
			}
		}
	}
	imagedestroy( $small );
	$data = array();
	if ( $seen ) {
		$data['dark'] = $light / $seen < 0.45;
		if ( $col / $seen > 0.03 ) {
			$data['color'] = sprintf( 'rgb(%d %d %d)', round( $r / $col ), round( $g / $col ), round( $b / $col ) );
		}
	}
	if ( $bottom < 0 ) {
		return $data;
	}
	$pad = 2;
	$x0  = max( 0, ( $left - $pad ) / $scale );
	$y0  = max( 0, ( $top - $pad ) / $scale );
	$x1  = min( $w, ( $right + 1 + $pad ) / $scale );
	$y1  = min( $h, ( $bottom + 1 + $pad ) / $scale );
	$cw  = $x1 - $x0;
	$ch  = $y1 - $y0;
	if ( $cw * $ch > $w * $h * 0.92 && max( $w, $h ) <= 1200 ) {
		return $data; // nothing worth cutting, and not oversized
	}
	// Just big enough for the footer on a sharp screen (about 260 px tall).
	$k   = min( 1, 260 / $ch );
	$ow  = max( 1, (int) round( $cw * $k ) );
	$oh  = max( 1, (int) round( $ch * $k ) );
	$dst = imagecreatetruecolor( $ow, $oh );
	imagealphablending( $dst, false );
	imagesavealpha( $dst, true );
	imagefill( $dst, 0, 0, imagecolorallocatealpha( $dst, 0, 0, 0, 127 ) );
	imagecopyresampled( $dst, $src, 0, 0, (int) round( $x0 ), (int) round( $y0 ), $ow, $oh, (int) round( $cw ), (int) round( $ch ) );
	imagedestroy( $src );
	$up = wp_upload_dir();
	if ( ! empty( $up['error'] ) ) {
		return $data;
	}
	$dir = trailingslashit( $up['basedir'] ) . 'rfaheya';
	wp_mkdir_p( $dir );
	$name = 'logo-' . $id . '-' . substr( md5( $file . filemtime( $file ) ), 0, 8 );
	$path = $dir . '/' . $name . '.webp';
	$ok   = function_exists( 'imagewebp' ) && imagewebp( $dst, $path, 90 );
	if ( ! $ok ) {
		$path = $dir . '/' . $name . '.png';
		$ok   = imagepng( $dst, $path, 9 );
	}
	imagedestroy( $dst );
	if ( ! $ok ) {
		return $data;
	}
	$data['url']     = trailingslashit( $up['baseurl'] ) . 'rfaheya/' . basename( $path );
	$data['trimmed'] = true;
	$data['file']    = $path;
	return $data;
}

/**
 * One-time: a logo already uploaded to the media library as “LOGO-1.png” becomes
 * the store logo (it can be changed or removed in Settings → Rfaheya Store).
 */
add_action(
	'admin_init',
	function () {
		if ( get_option( 'rfaheya_logo_seeded' ) ) {
			return;
		}
		update_option( 'rfaheya_logo_seeded', 1 );
		$saved = get_option( RFAHEYA_OPTION, array() );
		$saved = is_array( $saved ) ? $saved : array();
		if ( ! empty( $saved['home']['logo'] ) ) {
			return;
		}
		$found = get_posts(
			array(
				'post_type'      => 'attachment',
				'post_mime_type' => 'image',
				'posts_per_page' => 1,
				'orderby'        => 'date',
				'order'          => 'DESC',
				'meta_query'     => array(
					array(
						'key'     => '_wp_attached_file',
						'value'   => '/LOGO-1\\.(png|svg|webp)$',
						'compare' => 'REGEXP',
					),
				),
			)
		);
		if ( $found ) {
			$saved['home']['logo'] = (string) $found[0]->ID;
			update_option( RFAHEYA_OPTION, $saved );
		}
	}
);

// ==================================================================== information pages

/**
 * One-time page refresh: the starter Shipping, Size Guide, Ingredients,
 * Sustainability and Terms pages are removed (moved to the trash), and the
 * starter Privacy Policy and Returns & Refunds pages get the store's own
 * text from rfaheya/content.json. Only pages the starter import created
 * (they carry the rfaheya_eyebrow field) are touched.
 */
add_action(
	'init',
	function () {
		if ( (int) get_option( 'rfaheya_pages_set', 1 ) >= 2 ) {
			return;
		}
		$file = __DIR__ . '/rfaheya/content.json';
		$data = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
		if ( ! is_array( $data ) || ! isset( $data['pages'] ) ) {
			return;
		}
		$ours = function ( $slug ) {
			$page = get_page_by_path( $slug );
			return $page && '' !== (string) get_post_meta( $page->ID, 'rfaheya_eyebrow', true ) ? $page : null;
		};
		foreach ( array( 'shipping', 'size-guide', 'ingredients', 'sustainability', 'terms' ) as $slug ) {
			$page = $ours( $slug );
			if ( ! $page ) {
				continue;
			}
			if ( (int) get_option( 'woocommerce_terms_page_id' ) === (int) $page->ID ) {
				update_option( 'woocommerce_terms_page_id', 0 );
			}
			wp_trash_post( $page->ID );
		}
		foreach ( (array) $data['pages'] as $p ) {
			$page = $ours( $p['slug'] );
			if ( ! $page ) {
				continue;
			}
			wp_update_post(
				array(
					'ID'           => $page->ID,
					'post_title'   => $p['title'],
					'post_excerpt' => $p['excerpt'],
					'post_content' => $p['content'],
				)
			);
			update_post_meta( $page->ID, 'rfaheya_eyebrow', $p['eyebrow'] );
		}
		update_option( 'rfaheya_pages_set', 2 );
	}
);

// ==================================================================== FAQs

/**
 * One-time FAQ refresh: replaces the first starter FAQs (if they were
 * imported) with the current set from rfaheya/content.json. FAQs written
 * in WordPress are left alone.
 */
add_action(
	'init',
	function () {
		if ( (int) get_option( 'rfaheya_faq_set', 1 ) >= 2 ) {
			return;
		}
		$file = __DIR__ . '/rfaheya/content.json';
		$data = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
		if ( ! is_array( $data ) || empty( $data['faqs'] ) ) {
			return;
		}
		$old = array(
			'What does “inspired by” mean?',
			'How does “Try 10 ML first” work?',
			'How much is shipping?',
			'How do I pay?',
			'What is the zero risk guarantee?',
			'How can I track my order?',
		);
		$faqs   = get_posts( array( 'post_type' => 'rfaheya_faq', 'post_status' => 'any', 'numberposts' => -1 ) );
		$titles = array();
		$had    = false;
		foreach ( $faqs as $f ) {
			if ( in_array( $f->post_title, $old, true ) ) {
				wp_trash_post( $f->ID );
				$had = true;
			} else {
				$titles[] = $f->post_title;
			}
		}
		// Only add the new set where the starter FAQs had been imported (otherwise the import adds them).
		if ( $had ) {
			foreach ( $data['faqs'] as $i => $f ) {
				if ( in_array( $f['q'], $titles, true ) ) {
					continue;
				}
				wp_insert_post(
					array(
						'post_type'    => 'rfaheya_faq',
						'post_status'  => 'publish',
						'post_title'   => $f['q'],
						'post_content' => $f['a'],
						'menu_order'   => $i,
					)
				);
			}
		}
		update_option( 'rfaheya_faq_set', 2 );
	},
	20
);

add_action(
	'init',
	function () {
		register_post_type(
			'rfaheya_faq',
			array(
				'labels'       => array(
					'name'          => 'FAQs',
					'singular_name' => 'FAQ',
					'add_new_item'  => 'Add question',
					'edit_item'     => 'Edit question',
					'all_items'     => 'All questions',
				),
				'public'       => false,
				'show_ui'      => true,
				'show_in_rest' => true,
				'menu_icon'    => 'dashicons-editor-help',
				'menu_position' => 21,
				'supports'     => array( 'title', 'editor', 'page-attributes' ),
			)
		);
		add_filter(
			'enter_title_here',
			function ( $text, $post ) {
				return 'rfaheya_faq' === $post->post_type ? 'Question' : $text;
			},
			10,
			2
		);

		// Pages: the intro under the title (excerpt) and the small section label above it.
		add_post_type_support( 'page', 'excerpt' );
		register_post_meta(
			'page',
			'rfaheya_eyebrow',
			array(
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => true,
				'auth_callback' => function () {
					return current_user_can( 'edit_pages' );
				},
			)
		);
	}
);

// ==================================================================== page section label

add_action(
	'add_meta_boxes_page',
	function () {
		add_meta_box(
			'rfaheya_page',
			'Storefront',
			function ( $post ) {
				wp_nonce_field( 'rfaheya_page', 'rfaheya_page_nonce' );
				$value = (string) get_post_meta( $post->ID, 'rfaheya_eyebrow', true );
				echo '<p><label for="rfaheya-eyebrow"><strong>Section label</strong></label></p>';
				echo '<input id="rfaheya-eyebrow" name="rfaheya_eyebrow" list="rfaheya-eyebrows" class="widefat" value="' . esc_attr( $value ) . '" placeholder="e.g. Help">';
				echo '<datalist id="rfaheya-eyebrows"><option value="Help"><option value="Legal"><option value="About"></datalist>';
				echo '<p class="description">Shown above the title. Pages with the same label are listed together as “Related”. The page excerpt is shown as the intro.</p>';
			},
			'page',
			'side'
		);
	}
);

add_action(
	'save_post_page',
	function ( $post_id ) {
		if ( ! isset( $_POST['rfaheya_page_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rfaheya_page_nonce'] ) ), 'rfaheya_page' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE || ! current_user_can( 'edit_page', $post_id ) ) {
			return;
		}
		update_post_meta( $post_id, 'rfaheya_eyebrow', sanitize_text_field( wp_unslash( isset( $_POST['rfaheya_eyebrow'] ) ? $_POST['rfaheya_eyebrow'] : '' ) ) );
	}
);

// ==================================================================== product details box

/** Finder choices: key => label. */
function rfaheya_choices() {
	return array(
		'gender'    => array(
			'men'    => 'Men',
			'women'  => 'Women',
			'unisex' => 'Unisex',
		),
		'occasions' => array(
			'everyday' => 'Everyday',
			'work'     => 'Work',
			'date'     => 'Date Night',
			'special'  => 'Special Occasions',
			'club'     => 'Club Vibe',
		),
		'seasons'   => array(
			'spring' => 'Spring',
			'summer' => 'Summer',
			'autumn' => 'Autumn',
			'winter' => 'Winter',
			'all'    => 'All Year',
		),
		'presence'  => array(
			'soft'     => 'Soft',
			'balanced' => 'Balanced',
			'bold'     => 'Bold',
		),
		'longevity' => array(
			'standard' => 'Moderate',
			'extended' => 'Extended',
			'eternal'  => 'Eternal',
		),
	);
}

/** Small label on the product image. */
function rfaheya_badges() {
	return array( 'Best Seller', 'New', 'Limited Edition' );
}

/** Rfaheya Standard™ dimensions and their levels (same names as the storefront's Standard page). */
function rfaheya_standard_levels() {
	return array(
		'character'  => array( 'Character', array( 'Universal', 'Selective', 'Enthusiast' ) ),
		'comfort'    => array( 'Comfort', array( 'Relaxed', 'Balanced', 'Intense' ) ),
		'density'    => array( 'Density', array( 'Airy', 'Balanced', 'Dense' ) ),
		'projection' => array( 'Projection', array( 'Intimate', 'Balanced', 'Enormous' ) ),
		'longevity'  => array( 'Longevity', array( 'Moderate', 'Extended', 'Long-lasting' ) ),
		'evolution'  => array( 'Evolution', array( 'Linear', 'Evolving' ) ),
	);
}

function rfaheya_details( $product_id ) {
	$d = get_post_meta( $product_id, '_rfaheya_details', true );
	return is_array( $d ) ? $d : array();
}

/** "a, b , c" or "a\nb" -> ['a', 'b', 'c'] */
function rfaheya_list( $text ) {
	if ( is_array( $text ) ) {
		$text = implode( ',', $text );
	}
	return array_values( array_unique( array_filter( array_map( 'trim', preg_split( '/[,\n]+/', (string) $text ) ) ) ) );
}

add_action(
	'add_meta_boxes_product',
	function () {
		add_meta_box( 'rfaheya_details', 'Rfaheya details', 'rfaheya_details_box', 'product', 'normal', 'high' );
	}
);

/** Pill buttons (radio = pick one, checkbox = pick several). Works without JavaScript. */
function rfaheya_pills( $name, $options, $current, $multiple = false ) {
	echo '<div class="rf-pills">';
	foreach ( $options as $value => $label ) {
		$on = $multiple ? in_array( (string) $value, array_map( 'strval', (array) $current ), true ) : (string) $current === (string) $value;
		printf(
			'<label class="rf-pill"><input type="%s" name="%s" value="%s"%s><span>%s</span></label>',
			$multiple ? 'checkbox' : 'radio',
			esc_attr( $multiple ? $name . '[]' : $name ),
			esc_attr( $value ),
			$on ? ' checked' : '',
			esc_html( $label )
		);
	}
	echo '</div>';
}

/** Note picker: chosen notes as chips with their icons, picked from Products → Fragrance notes. */
function rfaheya_note_picker( $name, $current, $hint = '' ) {
	$value = implode( ', ', (array) $current );
	printf(
		'<div class="rf-notes" data-hint="%s"><input type="text" class="rf-notes-value large-text" name="%s" value="%s" placeholder="Vanilla, Oud, Amber"></div>',
		esc_attr( $hint ),
		esc_attr( $name ),
		esc_attr( $value )
	);
}

/** Image picker (Media Library). */
function rfaheya_media_field( $id, $name, $attachment_id, $type = 'image' ) {
	$attachment_id = (int) $attachment_id;
	$preview       = '';
	if ( $attachment_id ) {
		$preview = 'video' === $type
			? '<video src="' . esc_url( (string) wp_get_attachment_url( $attachment_id ) ) . '" muted playsinline></video>'
			: ( 'image/svg+xml' === get_post_mime_type( $attachment_id )
				? '<img src="' . esc_url( rfaheya_image_url( $attachment_id ) ) . '" alt="">'
				: wp_get_attachment_image( $attachment_id, 'medium' ) );
	}
	printf(
		'<div class="rf-media" data-type="%1$s"><input type="hidden" id="%2$s" name="%3$s" value="%4$s"><div class="rf-media-preview" id="%2$s-preview">%5$s</div><button type="button" class="button rfaheya-media" data-target="%2$s" data-type="%1$s">%6$s</button> <button type="button" class="button-link rfaheya-media-clear" data-target="%2$s">Remove</button></div>',
		esc_attr( $type ),
		esc_attr( $id ),
		esc_attr( $name ),
		$attachment_id ? esc_attr( (string) $attachment_id ) : '',
		$preview, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts / wp_get_attachment_image
		'video' === $type ? 'Choose video' : 'Choose image'
	);
}

function rfaheya_details_box( $post ) {
	wp_nonce_field( 'rfaheya_details', 'rfaheya_details_nonce' );
	$d       = rfaheya_details( $post->ID );
	$choices = rfaheya_choices();
	$val     = function ( $key, $default = '' ) use ( $d ) {
		return isset( $d[ $key ] ) ? $d[ $key ] : $default;
	};
	$row     = function ( $label, $help, $render ) {
		echo '<div class="rf-row"><div class="rf-label">' . esc_html( $label ) . ( $help ? '<small>' . esc_html( $help ) . '</small>' : '' ) . '</div><div class="rf-field">';
		$render();
		echo '</div></div>';
	};
	$auto    = array( '' => 'Auto' );
	$notes   = admin_url( 'edit-tags.php?taxonomy=rfaheya_note&post_type=product' );
	?>
	<div class="rf-box">
		<p class="rf-intro">What the storefront shows for this fragrance. The tagline is the product’s <em>Short description</em>, the story is the main description, and sizes / prices are the variations.</p>

		<h3 class="rf-section">Rfaheya Finder <small>The quiz questions, in order. Each answer is matched against these.</small></h3>
		<?php
		$row(
			'1 · For you',
			'“Who are you shopping for?”',
			function () use ( $val, $choices, $auto ) {
				rfaheya_pills( 'rfaheya[gender]', $auto + $choices['gender'], $val( 'gender' ) );
			}
		);
		$row(
			'2 · Occasion',
			'“Where will you wear it?” The first one also shows on the card.',
			function () use ( $val, $choices ) {
				rfaheya_pills( 'rfaheya[occasions]', $choices['occasions'], $val( 'occasions', array() ), true );
			}
		);
		$row(
			'3 · Scent style',
			'“What kind of scent speaks to you?” Same as the product categories.',
			function () use ( $post ) {
				$current = wp_get_object_terms( $post->ID, 'product_cat', array( 'fields' => 'slugs' ) );
				echo '<input type="hidden" name="rfaheya[families_sent]" value="1">';
				rfaheya_pills( 'rfaheya[families]', rfaheya_families(), is_wp_error( $current ) ? array() : $current, true );
			}
		);
		$row(
			'4 · Notes',
			'“Which notes do you love?” Key notes; the first 4 show on the card.',
			function () use ( $val ) {
				rfaheya_note_picker( 'rfaheya[notes]', $val( 'notes', array() ), 'Pick up to 5' );
			}
		);
		$row(
			'Main accords',
			'Also matched by the Notes question, Search and the Shop.',
			function () use ( $val ) {
				echo '<div class="rf-tags"><input type="text" class="rf-tags-value large-text" id="rfaheya-accords" name="rfaheya[accords]" value="' . esc_attr( implode( ', ', (array) $val( 'accords', array() ) ) ) . '" placeholder="Sweet, Oud, Amber"></div>';
			}
		);
		$row(
			'5 · Season',
			'“When do you wear it most?” The first one also shows on the card.',
			function () use ( $val, $choices ) {
				rfaheya_pills( 'rfaheya[seasons]', $choices['seasons'], $val( 'seasons', array() ), true );
			}
		);
		$row(
			'6 · Presence',
			'“How noticeable should it be?”',
			function () use ( $val, $choices, $auto ) {
				rfaheya_pills( 'rfaheya[presence]', $auto + $choices['presence'], $val( 'presence' ) );
			}
		);
		$row(
			'7 · Longevity',
			'“How long should it last?”',
			function () use ( $val, $choices, $auto ) {
				rfaheya_pills( 'rfaheya[longevity]', $auto + $choices['longevity'], $val( 'longevity' ) );
			}
		);
		?>

		<h3 class="rf-section">Product page <a href="<?php echo esc_url( $notes ); ?>" target="_blank" rel="noopener">Manage notes &amp; icons ↗</a></h3>
		<?php
		$row(
			'Badge',
			'Shown on the product image.',
			function () use ( $val ) {
				rfaheya_pills( 'rfaheya[badge]', array_merge( array( '' => 'None' ), array_combine( rfaheya_badges(), rfaheya_badges() ) ), $val( 'badge' ) );
			}
		);
		$row(
			'DNA',
			'The original fragrance it is based on.',
			function () use ( $val ) {
				echo '<input id="rfaheya-inspired_by" name="rfaheya[inspired_by]" class="large-text" placeholder="e.g. Vanilla 28 by Kayali" value="' . esc_attr( $val( 'inspired_by' ) ) . '">';
			}
		);
		$row(
			'DNA bottle image',
			'Optional, shown in the DNA card.',
			function () use ( $val ) {
				rfaheya_media_field( 'rfaheya-dna-image', 'rfaheya[dna_image]', $val( 'dna_image', 0 ) );
			}
		);
		$row(
			'Opening',
			'The composition: first impression.',
			function () use ( $val ) {
				rfaheya_note_picker( 'rfaheya[opening]', $val( 'opening', array() ) );
			}
		);
		$row(
			'Heart',
			'',
			function () use ( $val ) {
				rfaheya_note_picker( 'rfaheya[heart]', $val( 'heart', array() ) );
			}
		);
		$row(
			'Dry down',
			'',
			function () use ( $val ) {
				rfaheya_note_picker( 'rfaheya[drydown]', $val( 'drydown', array() ) );
			}
		);
		?>

		<h3 class="rf-section">Rfaheya Standard™ <small>The six dimensions on the product page.</small></h3>
		<?php
		$standard = (array) $val( 'standard', array() );
		foreach ( rfaheya_standard_levels() as $key => $dim ) {
			$row(
				$dim[0],
				'',
				function () use ( $key, $dim, $standard ) {
					rfaheya_pills( "rfaheya[standard][$key]", array_merge( array( '' => '—' ), array_combine( $dim[1], $dim[1] ) ), isset( $standard[ $key ] ) ? $standard[ $key ] : '' );
				}
			);
		}
		?>
	</div>
	<?php
}

/** Fragrance families (the Finder's scent styles): product category slug => name. */
function rfaheya_families() {
	return array(
		'fresh'    => 'Fresh & Clean',
		'oriental' => 'Warm & Oriental',
		'floral'   => 'Floral & Expressive',
		'fruity'   => 'Fruity & Juicy',
		'sweet'    => 'Sweet & Addictive',
	);
}

/** Sets the product's family categories (keeps its other categories). */
function rfaheya_save_families( $post_id, $picked ) {
	$names   = array(
		'fresh'    => 'Fresh',
		'oriental' => 'Oriental',
		'floral'   => 'Floral',
		'fruity'   => 'Fruity',
		'sweet'    => 'Sweet',
	);
	$current = wp_get_object_terms( $post_id, 'product_cat', array( 'fields' => 'all' ) );
	if ( is_wp_error( $current ) ) {
		return;
	}
	$keep = array();
	foreach ( $current as $t ) {
		if ( ! isset( $names[ $t->slug ] ) ) {
			$keep[] = (int) $t->term_id;
		}
	}
	foreach ( array_intersect( array_keys( $names ), (array) $picked ) as $slug ) {
		$term = get_term_by( 'slug', $slug, 'product_cat' );
		if ( ! $term ) {
			$made = wp_insert_term( $names[ $slug ], 'product_cat', array( 'slug' => $slug ) );
			$term = is_wp_error( $made ) ? null : get_term( $made['term_id'], 'product_cat' );
		}
		if ( $term ) {
			$keep[] = (int) $term->term_id;
		}
	}
	wp_set_object_terms( $post_id, array_values( array_unique( $keep ) ), 'product_cat' );
}

/** Cleans the posted details box values. */
function rfaheya_clean_details( $input ) {
	$choices = rfaheya_choices();
	$input   = is_array( $input ) ? $input : array();
	$text    = function ( $key ) use ( $input ) {
		return sanitize_text_field( isset( $input[ $key ] ) ? (string) $input[ $key ] : '' );
	};
	$names   = function ( $key ) use ( $input ) {
		return array_map( 'sanitize_text_field', rfaheya_list( isset( $input[ $key ] ) ? $input[ $key ] : '' ) );
	};
	$badge   = $text( 'badge' );
	$out     = array(
		'inspired_by' => $text( 'inspired_by' ),
		'dna_image'   => isset( $input['dna_image'] ) ? absint( $input['dna_image'] ) : 0,
		'badge'       => $badge,
		'accords'     => $names( 'accords' ),
		'notes'       => $names( 'notes' ),
		'opening'     => $names( 'opening' ),
		'heart'       => $names( 'heart' ),
		'drydown'     => $names( 'drydown' ),
		'standard'    => array(),
	);
	foreach ( array( 'gender', 'presence', 'longevity' ) as $key ) {
		$v           = isset( $input[ $key ] ) ? (string) $input[ $key ] : '';
		$out[ $key ] = isset( $choices[ $key ][ $v ] ) ? $v : '';
	}
	foreach ( array( 'occasions', 'seasons' ) as $key ) {
		$picked      = isset( $input[ $key ] ) ? (array) $input[ $key ] : array();
		$out[ $key ] = array_values( array_filter( array_map( 'strval', $picked ), fn( $k ) => isset( $choices[ $key ][ $k ] ) ) );
	}
	$standard = isset( $input['standard'] ) && is_array( $input['standard'] ) ? $input['standard'] : array();
	foreach ( rfaheya_standard_levels() as $key => $dim ) {
		$v = isset( $standard[ $key ] ) ? (string) $standard[ $key ] : '';
		if ( in_array( $v, $dim[1], true ) ) {
			$out['standard'][ $key ] = $v;
		}
	}
	return $out;
}

add_action(
	'save_post_product',
	function ( $post_id ) {
		if ( ! isset( $_POST['rfaheya_details_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rfaheya_details_nonce'] ) ), 'rfaheya_details' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$input = isset( $_POST['rfaheya'] ) ? wp_unslash( $_POST['rfaheya'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned below
		update_post_meta( $post_id, '_rfaheya_details', rfaheya_clean_details( $input ) );
		if ( ! empty( $input['families_sent'] ) && taxonomy_exists( 'product_cat' ) ) {
			rfaheya_save_families( $post_id, isset( $input['families'] ) ? (array) $input['families'] : array() );
		}
	}
);

// ==================================================================== fragrance notes library

add_action(
	'init',
	function () {
		register_taxonomy(
			'rfaheya_note',
			'product',
			array(
				'labels'            => array(
					'name'          => 'Fragrance notes',
					'singular_name' => 'Note',
					'menu_name'     => 'Fragrance notes',
					'add_new_item'  => 'Add note',
					'edit_item'     => 'Edit note',
					'search_items'  => 'Search notes',
					'not_found'     => 'No notes yet.',
				),
				'public'            => false,
				'show_ui'           => true,
				'show_in_menu'      => true,
				'show_admin_column' => false,
				'meta_box_cb'       => false,
				'show_in_rest'      => false,
				'rewrite'           => false,
				'hierarchical'      => false,
			)
		);
	}
);

/** Icon URL of a note term ('' when none). */
function rfaheya_note_icon( $term_id ) {
	return rfaheya_image_url( (int) get_term_meta( $term_id, 'rfaheya_icon', true ) );
}

/** URL of an image attachment: the medium size, or the file itself for an SVG ('' when none). */
function rfaheya_image_url( $id ) {
	if ( ! $id ) {
		return '';
	}
	return 'image/svg+xml' === get_post_mime_type( $id ) ? (string) wp_get_attachment_url( $id ) : (string) wp_get_attachment_image_url( $id, 'medium' );
}

/** Every note in the library: name and icon. */
function rfaheya_note_library() {
	$terms = get_terms(
		array(
			'taxonomy'   => 'rfaheya_note',
			'hide_empty' => false,
			'orderby'    => 'name',
		)
	);
	if ( is_wp_error( $terms ) ) {
		return array();
	}
	return array_map(
		fn( $t ) => array(
			'name' => html_entity_decode( $t->name, ENT_QUOTES ),
			'icon' => rfaheya_note_icon( $t->term_id ),
		),
		$terms
	);
}

add_action(
	'rfaheya_note_add_form_fields',
	function () {
		echo '<div class="form-field"><label>Icon</label>';
		rfaheya_media_field( 'rfaheya-note-icon', 'rfaheya_icon', 0 );
		echo '<p>An SVG or a transparent PNG (about 200 × 200) works best.</p></div>';
	}
);
add_action(
	'rfaheya_note_edit_form_fields',
	function ( $term ) {
		echo '<tr class="form-field"><th scope="row"><label>Icon</label></th><td>';
		rfaheya_media_field( 'rfaheya-note-icon', 'rfaheya_icon', get_term_meta( $term->term_id, 'rfaheya_icon', true ) );
		echo '<p class="description">An SVG or a transparent PNG (about 200 × 200) works best.</p></td></tr>';
	}
);
$rfaheya_save_note = function ( $term_id ) {
	if ( ! current_user_can( 'manage_product_terms' ) && ! current_user_can( 'manage_categories' ) ) {
		return;
	}
	// The term screens verify their own nonce before these hooks run.
	if ( isset( $_POST['rfaheya_icon'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		update_term_meta( $term_id, 'rfaheya_icon', absint( $_POST['rfaheya_icon'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
	}
};
add_action( 'created_rfaheya_note', $rfaheya_save_note );
add_action( 'edited_rfaheya_note', $rfaheya_save_note );

add_filter(
	'manage_edit-rfaheya_note_columns',
	function ( $cols ) {
		unset( $cols['description'], $cols['slug'], $cols['posts'] );
		return array_merge( array( 'cb' => $cols['cb'], 'rf_icon' => 'Icon' ), $cols );
	}
);
add_filter(
	'manage_rfaheya_note_custom_column',
	function ( $out, $col, $term_id ) {
		if ( 'rf_icon' !== $col ) {
			return $out;
		}
		$url = rfaheya_note_icon( $term_id );
		return $url ? '<img src="' . esc_url( $url ) . '" alt="" style="width:44px;height:44px;object-fit:contain">' : '—';
	},
	10,
	3
);

// ==================================================================== wear-report videos

add_action(
	'init',
	function () {
		register_post_type(
			'rfaheya_video',
			array(
				'labels'        => array(
					'name'          => 'Videos',
					'singular_name' => 'Video',
					'add_new'       => 'Add video',
					'add_new_item'  => 'Add video',
					'edit_item'     => 'Edit video',
					'all_items'     => 'Videos',
				),
				'public'        => false,
				'show_ui'       => true,
				'show_in_menu'  => 'edit.php?post_type=product',
				'supports'      => array( 'title', 'page-attributes' ),
				'menu_icon'     => 'dashicons-video-alt3',
			)
		);
	}
);

add_filter(
	'enter_title_here',
	fn( $text, $post ) => 'rfaheya_video' === $post->post_type ? 'Title shown on the video, e.g. Drunk Gold + Mawj' : $text,
	10,
	2
);

add_action(
	'add_meta_boxes_rfaheya_video',
	function () {
		add_meta_box( 'rfaheya_video', 'Video', 'rfaheya_video_box', 'rfaheya_video', 'normal', 'high' );
	}
);

function rfaheya_video_meta( $post_id ) {
	$m = get_post_meta( $post_id, '_rfaheya_video', true );
	return wp_parse_args(
		is_array( $m ) ? $m : array(),
		array(
			'video'   => 0,
			'poster'  => 0,
			'product' => 0,
			'label'   => 'Rfaheya Wear Report',
			'tags'    => '',
		)
	);
}

function rfaheya_video_box( $post ) {
	wp_nonce_field( 'rfaheya_video', 'rfaheya_video_nonce' );
	$m        = rfaheya_video_meta( $post->ID );
	$products = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => 'title',
			'order'       => 'ASC',
		)
	);
	?>
	<div class="rf-box">
		<div class="rf-row"><div class="rf-label">Video file<small>MP4, vertical (9:16) looks best.</small></div><div class="rf-field"><?php rfaheya_media_field( 'rfaheya-video-file', 'rfaheya_video[video]', $m['video'], 'video' ); ?></div></div>
		<div class="rf-row"><div class="rf-label">Cover image<small>Optional: shown before the video plays.</small></div><div class="rf-field"><?php rfaheya_media_field( 'rfaheya-video-poster', 'rfaheya_video[poster]', $m['poster'] ); ?></div></div>
		<div class="rf-row"><div class="rf-label">Small label</div><div class="rf-field"><input class="regular-text" name="rfaheya_video[label]" value="<?php echo esc_attr( $m['label'] ); ?>"></div></div>
		<div class="rf-row"><div class="rf-label">Tags line<small>e.g. Warm · Bold · Evening</small></div><div class="rf-field"><input class="regular-text" name="rfaheya_video[tags]" value="<?php echo esc_attr( $m['tags'] ); ?>"></div></div>
		<div class="rf-row"><div class="rf-label">Product<small>Shown on the video, with Add to cart.</small></div><div class="rf-field">
			<input type="search" class="rf-product-search regular-text" placeholder="Search products…">
			<div class="rf-products">
				<?php foreach ( $products as $p ) : ?>
					<label class="rf-product" data-name="<?php echo esc_attr( strtolower( get_the_title( $p ) ) ); ?>">
						<input type="radio" name="rfaheya_video[product]" value="<?php echo esc_attr( (string) $p->ID ); ?>" <?php checked( (int) $m['product'], $p->ID ); ?>>
						<span><?php echo get_the_post_thumbnail( $p, 'thumbnail' ); ?><b><?php echo esc_html( get_the_title( $p ) ); ?></b></span>
					</label>
				<?php endforeach; ?>
				<?php if ( ! $products ) : ?>
					<p>No published products yet.</p>
				<?php endif; ?>
			</div>
		</div></div>
	</div>
	<?php
}

add_action(
	'save_post_rfaheya_video',
	function ( $post_id ) {
		if ( ! isset( $_POST['rfaheya_video_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rfaheya_video_nonce'] ) ), 'rfaheya_video' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$in = isset( $_POST['rfaheya_video'] ) && is_array( $_POST['rfaheya_video'] ) ? wp_unslash( $_POST['rfaheya_video'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned below
		update_post_meta(
			$post_id,
			'_rfaheya_video',
			array(
				'video'   => absint( isset( $in['video'] ) ? $in['video'] : 0 ),
				'poster'  => absint( isset( $in['poster'] ) ? $in['poster'] : 0 ),
				'product' => absint( isset( $in['product'] ) ? $in['product'] : 0 ),
				'label'   => sanitize_text_field( isset( $in['label'] ) ? $in['label'] : '' ),
				'tags'    => sanitize_text_field( isset( $in['tags'] ) ? $in['tags'] : '' ),
			)
		);
	}
);

add_filter(
	'manage_rfaheya_video_posts_columns',
	function ( $cols ) {
		return array(
			'cb'         => $cols['cb'],
			'rf_preview' => '',
			'title'      => 'Title',
			'rf_product' => 'Product',
			'date'       => $cols['date'],
		);
	}
);
add_action(
	'manage_rfaheya_video_posts_custom_column',
	function ( $col, $post_id ) {
		$m = rfaheya_video_meta( $post_id );
		if ( 'rf_preview' === $col && $m['video'] ) {
			echo '<video src="' . esc_url( (string) wp_get_attachment_url( (int) $m['video'] ) ) . '" muted playsinline preload="metadata" style="width:54px;height:96px;object-fit:cover;border-radius:4px;background:#111"></video>';
		}
		if ( 'rf_product' === $col ) {
			echo $m['product'] ? esc_html( get_the_title( (int) $m['product'] ) ) : '—';
		}
	},
	10,
	2
);

/** Published videos for the storefront. */
function rfaheya_videos() {
	$posts = get_posts(
		array(
			'post_type'   => 'rfaheya_video',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => array(
				'menu_order' => 'ASC',
				'date'       => 'DESC',
			),
		)
	);
	$out   = array();
	foreach ( $posts as $p ) {
		$m   = rfaheya_video_meta( $p->ID );
		$src = $m['video'] ? (string) wp_get_attachment_url( (int) $m['video'] ) : '';
		if ( ! $src ) {
			continue;
		}
		$out[] = array(
			'id'        => $p->ID,
			'title'     => html_entity_decode( get_the_title( $p ), ENT_QUOTES ),
			'label'     => $m['label'],
			'tags'      => $m['tags'],
			'src'       => $src,
			'poster'    => $m['poster'] ? (string) wp_get_attachment_image_url( (int) $m['poster'], 'large' ) : '',
			'productId' => (int) $m['product'],
		);
	}
	return $out;
}

// ==================================================================== admin assets (details box, notes, videos)

add_action(
	'admin_enqueue_scripts',
	function () {
		$screen = get_current_screen();
		if ( ! $screen || ! ( in_array( $screen->post_type, array( 'product', 'rfaheya_video' ), true ) && in_array( $screen->base, array( 'post', 'edit-tags', 'term' ), true ) ) ) {
			return;
		}
		$base = content_url( 'mu-plugins/rfaheya-admin/' );
		$ver  = '3.0.0';
		wp_enqueue_media();
		wp_enqueue_style( 'rfaheya-admin-ui', $base . 'admin.css', array(), $ver );
		wp_enqueue_script( 'rfaheya-admin-ui', $base . 'admin.js', array( 'jquery' ), $ver, true );
		wp_localize_script(
			'rfaheya-admin-ui',
			'rfaheyaAdmin',
			array(
				'notes'     => rfaheya_note_library(),
				'notesUrl'  => admin_url( 'edit-tags.php?taxonomy=rfaheya_note&post_type=product' ),
			)
		);
	}
);

// ==================================================================== REST

/** Store settings for the storefront (also part of the bootstrap response). */
function rfaheya_settings_data() {
	$o    = rfaheya_options();
	$h    = $o['home'];
	$logo = rfaheya_logo_prepared();
	$home = array(
		'announcements' => array_values( array_filter( array( $h['announcement_1'], $h['announcement_2'], $h['announcement_3'] ) ) ),
		'hero'          => array(
			'eyebrow' => $h['hero_eyebrow'],
			'title'   => $h['hero_title'],
			'text'    => $h['hero_text'],
			'image'   => $h['hero_image'] ? (string) wp_get_attachment_image_url( (int) $h['hero_image'], 'full' ) : '',
		'srcset'  => $h['hero_image'] ? (string) wp_get_attachment_image_srcset( (int) $h['hero_image'], 'full' ) : '',
		),
		'logo'          => $logo['url'],
		'logoReady'     => function_exists( 'imagecreatefromstring' ),
		'logoColor'     => $logo['color'],
		'logoDark'      => $logo['dark'],
		'logoSize'      => array(
			'desktop' => max( 30, min( 90, (int) ( $h['logo_height'] ?? 56 ) ) ),
			'mobile'  => max( 28, min( 70, (int) ( $h['logo_height_mobile'] ?? 48 ) ) ),
			'footer'  => max( 120, min( 360, (int) ( $h['logo_footer'] ?? 240 ) ) ),
		),
	);
	return array(
			'contact'      => $o['contact'],
			'social'       => $o['social'],
			'home'         => $home,
			'myAccountUrl' => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ),
			'bundle'       => array(
				'enabled' => 'no' !== $o['bundle']['enabled'],
				'title'   => $o['bundle']['title'],
				'text'    => $o['bundle']['text'],
				'size'    => $o['bundle']['size'],
				'count'   => (int) $o['bundle']['count'],
				'price'   => (float) $o['bundle']['price'],
			),
			'gift'         => rfaheya_gift_box_data(),
			'heroSlider'   => rfaheya_hero_slider_data( $o['slider'] ),
			'loyalty'      => rfaheya_loyalty(),
			'shipping'     => array(
				'freeShipping' => 'no' !== $o['shipping']['free_enabled'],
				'freeMin'      => (float) $o['shipping']['free_min'],
				'offer'        => 'no' !== $o['shipping']['offer_enabled'],
				'offerMin'     => (float) $o['shipping']['offer_min'],
				'offerPercent' => (float) $o['shipping']['offer_percent'],
				'orderMin'     => rfaheya_order_min(),
			),
			'currency'     => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'EGP',
		);
}

/** Rfaheya details of every published product: id => details (+ DNA image URL). */
function rfaheya_products_details() {
	$ids = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => 'publish',
			'numberposts' => -1,
			'fields'      => 'ids',
			'meta_key'    => '_rfaheya_details', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
		)
	);
	$out = array();
	foreach ( $ids as $id ) {
		$d = rfaheya_details( $id );
		if ( ! empty( $d['dna_image'] ) ) {
			$d['dna_image_url'] = (string) wp_get_attachment_image_url( (int) $d['dna_image'], 'large' );
		}
		$out[ (string) $id ] = $d;
	}
	return (object) $out;
}

/** Published FAQs: question and answer HTML, in their order. */
function rfaheya_faqs_data() {
	$posts = get_posts(
		array(
			'post_type'   => 'rfaheya_faq',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => array(
				'menu_order' => 'ASC',
				'date'       => 'ASC',
			),
		)
	);
	return array_map(
		fn( $p ) => array(
			'q' => get_the_title( $p ),
			'a' => apply_filters( 'the_content', $p->post_content ),
		),
		$posts
	);
}

/** Calls a WooCommerce Store API route internally and returns its JSON data. */
function rfaheya_store_data( $route, $params ) {
	try {
	// WooCommerce's Store API expects the cart to be loaded (outside REST requests it may not be yet).
	if ( function_exists( 'WC' ) && function_exists( 'wc_load_cart' ) && null === WC()->cart && did_action( 'woocommerce_init' ) ) {
		wc_load_cart();
	}
		$request = new WP_REST_Request( 'GET', $route );
		$request->set_query_params( $params );
		$response = rest_do_request( $request );
		if ( $response->is_error() ) {
			return array();
		}
		// Plain arrays all the way down: the Store API returns some parts as objects (stdClass).
		$data = json_decode( (string) wp_json_encode( rest_get_server()->response_to_data( $response, false ) ), true );
		return is_array( $data ) ? $data : array();
	} catch ( Throwable $e ) {
		// Without it the storefront loads the same data with its own requests.
		error_log( 'Rfaheya: ' . $route . ' failed: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' ' . $route . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
		return array();
	}
}

/** A Store API product or variation with only the fields the storefront reads (RawProduct in src/api/woo.ts). */
/**
 * A product text with only its words and simple formatting: text pasted from other sites or
 * chat tools carries long hidden class lists and wrappers that weigh more than the words.
 */
function rfaheya_clean_html( $html ) {
	$html = (string) $html;
	if ( '' === $html || false === strpos( $html, '<' ) ) {
		return $html;
	}
	$keep = array(
		'p'          => array(),
		'br'         => array(),
		'strong'     => array(),
		'b'          => array(),
		'em'         => array(),
		'i'          => array(),
		'u'          => array(),
		'ul'         => array(),
		'ol'         => array(),
		'li'         => array(),
		'h2'         => array(),
		'h3'         => array(),
		'h4'         => array(),
		'h5'         => array(),
		'blockquote' => array(),
		'a'          => array( 'href' => true ),
		'img'        => array(
			'src' => true,
			'alt' => true,
		),
	);
	$html = preg_replace( '#<(script|style)\b[^>]*>.*?</\1>#is', '', $html );
	$html = wp_kses( $html, $keep );
	$html = preg_replace( '#<p>\s*(&nbsp;|\s)*</p>#i', '', $html );
	$html = preg_replace( '/[ \t]*\n\s*/', "\n", $html );
	return trim( (string) $html );
}

function rfaheya_slim_product( $p ) {
	$pick = function ( $a, $keys ) {
		return array_intersect_key( (array) $a, array_flip( $keys ) );
	};
	$p = (array) $p;
	return array(
		'id'                => isset( $p['id'] ) ? (int) $p['id'] : 0,
		'name'              => isset( $p['name'] ) ? $p['name'] : '',
		'slug'              => isset( $p['slug'] ) ? $p['slug'] : '',
		'type'              => isset( $p['type'] ) ? $p['type'] : '',
		'parent'            => isset( $p['parent'] ) ? (int) $p['parent'] : 0,
		'short_description' => isset( $p['short_description'] ) ? rfaheya_clean_html( $p['short_description'] ) : '',
		'description'       => isset( $p['description'] ) ? rfaheya_clean_html( $p['description'] ) : '',
		'prices'            => $pick( isset( $p['prices'] ) ? $p['prices'] : array(), array( 'price', 'regular_price', 'sale_price', 'price_range', 'currency_minor_unit' ) ),
		'images'            => array_map(
			function ( $i ) use ( $pick ) {
				return $pick( $i, array( 'id', 'src', 'alt', 'name', 'srcset' ) );
			},
			isset( $p['images'] ) ? (array) $p['images'] : array()
		),
		'categories'        => array_map(
			function ( $c ) use ( $pick ) {
				return $pick( $c, array( 'id', 'name', 'slug' ) );
			},
			isset( $p['categories'] ) ? (array) $p['categories'] : array()
		),
		'tags'              => array_map(
			function ( $t ) use ( $pick ) {
				return $pick( $t, array( 'id', 'name', 'slug' ) );
			},
			isset( $p['tags'] ) ? (array) $p['tags'] : array()
		),
		'attributes'        => array_map(
			function ( $a ) use ( $pick ) {
				$a          = (array) $a;
				$out        = $pick( $a, array( 'id', 'name', 'taxonomy', 'has_variations' ) );
				$out['terms'] = array_map(
					function ( $t ) use ( $pick ) {
						return $pick( $t, array( 'id', 'name', 'slug' ) );
					},
					isset( $a['terms'] ) ? (array) $a['terms'] : array()
				);
				return $out;
			},
			isset( $p['attributes'] ) ? (array) $p['attributes'] : array()
		),
		'variations'        => isset( $p['variations'] ) ? $p['variations'] : array(),
		'variation'         => isset( $p['variation'] ) ? $p['variation'] : '',
		'is_in_stock'       => ! empty( $p['is_in_stock'] ),
		'is_purchasable'    => ! empty( $p['is_purchasable'] ),
	);
}

/** A Store API review with only the fields the storefront reads. */
function rfaheya_slim_review( $r ) {
	$r   = (array) $r;
	$out = array_intersect_key( $r, array_flip( array( 'id', 'date_created', 'product_id', 'reviewer', 'review', 'rating', 'verified' ) ) );
	$id  = isset( $r['id'] ) ? (int) $r['id'] : 0;
	// Photos and size added in the dashboard (Products → Add review, or a review's edit screen).
	$out['images'] = $id ? rfaheya_review_image_urls( $id ) : array();
	$out['size']   = $id ? (string) get_comment_meta( $id, 'rfaheya_size', true ) : '';
	return $out;
}

/** A review's photos (attachment IDs saved as comment meta) as image URLs. */
function rfaheya_review_image_urls( $comment_id ) {
	$urls = array();
	foreach ( (array) get_comment_meta( $comment_id, 'rfaheya_images', true ) as $attachment ) {
		$src = wp_get_attachment_image_url( (int) $attachment, 'large' );
		if ( $src ) {
			$urls[] = $src;
		}
	}
	return $urls;
}

/** Every published review (newest first), a hundred at a time, up to 500. */
function rfaheya_all_reviews() {
	$all = array();
	for ( $page = 1; $page <= 5; $page++ ) {
		$chunk = rfaheya_store_data(
			'/wc/store/v1/products/reviews',
			array(
				'per_page' => 100,
				'page'     => $page,
				'orderby'  => 'date_gmt',
				'order'    => 'desc',
			)
		);
		$all = array_merge( $all, $chunk );
		if ( count( $chunk ) < 100 ) {
			break;
		}
	}
	return $all;
}

/**
 * Builds the shop data once this request's answer has been sent (the visitor doesn't wait);
 * WP-Cron is a second chance on hosts that can't finish a request early.
 */
function rfaheya_build_after_response() {
	static $queued = false;
	if ( $queued || get_transient( 'rfaheya_bootstrap_building' ) ) {
		return;
	}
	$queued = true;
	if ( ! wp_next_scheduled( 'rfaheya_warm_bootstrap' ) ) {
		wp_schedule_single_event( time(), 'rfaheya_warm_bootstrap' );
	}
	if ( ! function_exists( 'litespeed_finish_request' ) && ! function_exists( 'fastcgi_finish_request' ) ) {
		return;
	}
	add_action(
		'shutdown',
		function () {
			if ( get_transient( 'rfaheya_bootstrap_building' ) ) {
				return;
			}
			set_transient( 'rfaheya_bootstrap_building', 1, 5 * MINUTE_IN_SECONDS );
			ignore_user_abort( true );
			function_exists( 'litespeed_finish_request' ) ? litespeed_finish_request() : fastcgi_finish_request();
			try {
				rfaheya_bootstrap();
			} catch ( Throwable $e ) {
				update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' build: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
			}
			delete_transient( 'rfaheya_bootstrap_building' );
		},
		0
	);
}

/**
 * Everything the storefront loads at start-up in ONE request: settings,
 * product details, notes, videos, categories, products with their
 * variations, and reviews. Cached for a minute.
 */
function rfaheya_bootstrap() {
	try {
	$cached = get_transient( 'rfaheya_bootstrap' );
	if ( rfaheya_bootstrap_current( $cached ) ) {
		return $cached;
	}
	if ( get_transient( 'rfaheya_bootstrap_failed' ) ) {
		return array( 'products' => array() );
	}
	// Gathering everything takes a while on a busy shared server: no PHP time limit for it.
	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 300 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	}
	$started = microtime( true );
	// Every published product, best sellers first (ties by newest), fetched by ID 100 at a time:
	// paging the Store API by popularity can repeat or skip products whose sales are equal.
	$order = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => 'publish',
			'numberposts' => -1,
			'fields'      => 'ids',
			'meta_key'    => 'total_sales', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'orderby'     => array(
				'meta_value_num' => 'DESC',
				'ID'             => 'DESC',
			),
		)
	);
	// Products that never sold may have no total_sales value at all: add them after the others.
	$all   = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => 'publish',
			'numberposts' => -1,
			'fields'      => 'ids',
			'orderby'     => 'ID',
			'order'       => 'DESC',
		)
	);
	$order = array_values( array_unique( array_merge( array_map( 'intval', $order ), array_map( 'intval', $all ) ) ) );
	$found = array();
	foreach ( array_chunk( $order, 100 ) as $chunk ) {
		foreach ( rfaheya_store_data( '/wc/store/v1/products', array( 'include' => implode( ',', $chunk ), 'per_page' => 100 ) ) as $p ) {
			$found[ (int) $p['id'] ] = $p;
		}
	}
	// The Store API leaves out what the shop hides (catalog visibility, hidden out-of-stock…).
	$products = array();
	foreach ( $order as $id ) {
		if ( isset( $found[ $id ] ) ) {
			$products[] = $found[ $id ];
		}
	}
	$ids        = array();
	foreach ( $products as $p ) {
		foreach ( (array) ( isset( $p['variations'] ) ? $p['variations'] : array() ) as $v ) {
			$ids[] = (int) $v['id'];
		}
	}
	$variations = array();
	foreach ( array_chunk( $ids, 100 ) as $chunk ) {
		$variations = array_merge( $variations, rfaheya_store_data( '/wc/store/v1/products', array( 'type' => 'variation', 'per_page' => 100, 'include' => implode( ',', $chunk ) ) ) );
	}
	// Only the fields the storefront reads (src/api/woo.ts): about a third of the size.
	$products   = array_map( 'rfaheya_slim_product', $products );
	// The storefront reads only a variation's price and stock (its size comes from the parent):
	// the rest would be a third of the page's weight.
	$variations = array_map(
		function ( $v ) {
			$v = (array) $v;
			$p = isset( $v['prices'] ) ? (array) $v['prices'] : array();
			return array(
				'id'          => isset( $v['id'] ) ? (int) $v['id'] : 0,
				'parent'      => isset( $v['parent'] ) ? (int) $v['parent'] : 0,
				'prices'      => array_intersect_key( $p, array_flip( array( 'price', 'regular_price', 'currency_minor_unit' ) ) ),
				'is_in_stock' => ! empty( $v['is_in_stock'] ),
			);
		},
		$variations
	);
	$data = array(
		'v'          => RFAHEYA_DATA_VERSION,
		'settings'   => rfaheya_settings_data(),
		'details'    => rfaheya_products_details(),
		'notes'      => rfaheya_note_library(),
		'videos'     => rfaheya_videos(),
		'categories' => rfaheya_store_data( '/wc/store/v1/products/categories', array( 'per_page' => 100 ) ),
		'products'   => $products,
		'dateOrder'  => array_map(
			'intval',
			get_posts(
				array(
					'post_type'   => 'product',
					'post_status' => 'publish',
					'numberposts' => -1,
					'orderby'     => 'date',
					'order'       => 'ASC',
					'fields'      => 'ids',
				)
			)
		),
		'variations' => $variations,
		'reviews'    => array_map( 'rfaheya_slim_review', rfaheya_all_reviews() ),
		'faqs'       => rfaheya_faqs_data(),
	);
	// Rebuilt whenever products, stock, settings or content change (hooks below), so it can be kept a while.
	update_option(
		'rfaheya_bootstrap_status',
		array(
			'at'       => gmdate( 'Y-m-d H:i:s' ),
			'seconds'  => round( microtime( true ) - $started, 1 ),
			'products' => count( $data['products'] ),
			'bytes'    => strlen( (string) wp_json_encode( $data ) ),
		),
		false
	);
	if ( ! empty( $data['products'] ) ) {
		set_transient( 'rfaheya_bootstrap', $data, HOUR_IN_SECONDS );
		// The last good copy never expires: pages always carry shop data (rfaheya_storefront_shell).
		update_option( 'rfaheya_bootstrap_last', $data, false );
	} else {
		// The storefront loads its data with separate requests then; don't rebuild on every visit.
		set_transient( 'rfaheya_bootstrap_failed', 1, 10 * MINUTE_IN_SECONDS );
	}
	return $data;
	} catch ( Throwable $e ) {
		error_log( 'Rfaheya bootstrap: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() );
		update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' bootstrap: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
		set_transient( 'rfaheya_bootstrap_failed', 1, 10 * MINUTE_IN_SECONDS );
		return array( 'products' => array() );
	}
}

/**
 * The shop data (without the settings) as static files in uploads/rfaheya, named by their
 * content, so browsers and the CDN keep them until they change: the core (what every page
 * needs) and the extra (long product texts and reviews), which the core links to and which
 * the storefront reads right after. Returns the core's URL, or '' when the files can't be
 * written (the page then carries the data itself). Old copies are removed after a day.
 */
function rfaheya_boot_file( $data ) {
	try {
		unset( $data['settings'] );
		$texts = array();
		foreach ( $data['products'] as $i => $product ) {
			if ( ! empty( $product['description'] ) ) {
				$texts[ (string) $product['id'] ] = $product['description'];
			}
			$data['products'][ $i ]['description'] = '';
		}
		$extra = rfaheya_write_data_file(
			'extra',
			array(
				'descriptions' => (object) $texts,
				'reviews'      => $data['reviews'] ?? array(),
			)
		);
		if ( ! $extra ) {
			return '';
		}
		$data['reviews'] = array();
		$data['extra']   = $extra;
		return rfaheya_write_data_file( 'boot', $data );
	} catch ( Throwable $e ) {
		return '';
	}
}

/** Writes JSON to uploads/rfaheya/<prefix>-<content hash>.json once; returns its site-relative URL or ''. */
function rfaheya_write_data_file( $prefix, $data ) {
	$json = wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
	if ( ! $json ) {
		return '';
	}
	$up = wp_upload_dir( null, false );
	if ( ! empty( $up['error'] ) ) {
		return '';
	}
	$dir  = trailingslashit( $up['basedir'] ) . 'rfaheya';
	$name = $prefix . '-' . substr( md5( $json ), 0, 12 ) . '.json';
	$path = $dir . '/' . $name;
	if ( ! is_readable( $path ) ) {
		if ( ! wp_mkdir_p( $dir ) ) {
			return '';
		}
		$tmp = $path . '.' . wp_generate_password( 6, false ) . '.tmp';
		if ( false === file_put_contents( $tmp, $json ) || ! rename( $tmp, $path ) ) { // phpcs:ignore WordPress.WP.AlternativeFunctions
			@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			return '';
		}
		foreach ( (array) glob( $dir . '/' . $prefix . '-*.json' ) as $old ) {
			if ( $old !== $path && filemtime( $old ) < time() - DAY_IN_SECONDS ) {
				@unlink( $old ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			}
		}
	}
	// Same-origin path (works on the temporary and the real domain alike).
	return (string) wp_make_link_relative( trailingslashit( $up['baseurl'] ) . 'rfaheya/' . $name );
}

/**
 * The journal's published posts in the shape the storefront reads from the REST API
 * (src/api/content.ts), without their full text: what the journal list needs. Kept an hour,
 * and dropped whenever a post is saved.
 */
function rfaheya_posts_slim() {
	$cached = get_transient( 'rfaheya_posts_slim' );
	if ( is_array( $cached ) ) {
		return $cached;
	}
	$out = array();
	foreach ( get_posts( array( 'post_type' => 'post', 'post_status' => 'publish', 'numberposts' => 100 ) ) as $post ) {
		$media = array();
		$thumb = (int) get_post_thumbnail_id( $post );
		if ( $thumb ) {
			$meta  = wp_get_attachment_metadata( $thumb );
			$sizes = array();
			foreach ( (array) ( $meta['sizes'] ?? array() ) as $name => $size ) {
				if ( (int) ( $size['width'] ?? 0 ) >= 600 ) {
					$sizes[ $name ] = array(
						'source_url' => (string) wp_get_attachment_image_url( $thumb, $name ),
						'width'      => (int) $size['width'],
					);
				}
			}
			$media[] = array(
				'source_url'    => (string) wp_get_attachment_image_url( $thumb, 'full' ),
				'alt_text'      => (string) get_post_meta( $thumb, '_wp_attachment_image_alt', true ),
				'media_details' => array( 'sizes' => (object) $sizes ),
			);
		}
		$terms = array();
		foreach ( get_the_category( $post->ID ) as $cat ) {
			$terms[] = array(
				'taxonomy' => 'category',
				'name'     => $cat->name,
			);
		}
		$text  = trim( wp_strip_all_tags( (string) $post->post_content ) );
		$out[] = array(
			'slug'      => $post->post_name,
			'date'      => str_replace( ' ', 'T', $post->post_date ),
			'title'     => array( 'rendered' => get_the_title( $post ) ),
			'excerpt'   => array( 'rendered' => get_the_excerpt( $post ) ),
			'content'   => array( 'rendered' => '' ),
			'rf_words'  => '' === $text ? 0 : count( preg_split( '/\s+/u', $text ) ),
			'_embedded' => array(
				'wp:featuredmedia' => $media,
				'wp:term'          => array( $terms ),
			),
		);
	}
	set_transient( 'rfaheya_posts_slim', $out, HOUR_IN_SECONDS );
	return $out;
}
add_action(
	'save_post_post',
	function () {
		delete_transient( 'rfaheya_posts_slim' );
	}
);

/** Published pages for "Related" links on the info pages: slug, title and section label. */
function rfaheya_pages_index() {
	return array_values(
		array_map(
			function ( $p ) {
				return array(
					'slug'    => $p->post_name,
					'title'   => get_the_title( $p ),
					'eyebrow' => (string) get_post_meta( $p->ID, 'rfaheya_eyebrow', true ),
				);
			},
			get_pages( array( 'post_status' => 'publish' ) )
		)
	);
}

/** The slug of an info page address (/privacy-policy → privacy-policy); '' for the storefront's own pages. */
function rfaheya_info_slug( $path ) {
	if ( ! preg_match( '#^/([a-z0-9-]+)/?$#', (string) $path, $m ) ) {
		return '';
	}
	// The storefront's own pages (and WooCommerce's) are not info pages.
	if ( preg_match( '#^(shop|product|cart|checkout|my-account|account|wishlist|about|contact|faqs|reviews|journal|collections|finder|discover|our-standard|track-order)$#', $m[1] ) ) {
		return '';
	}
	return $m[1];
}

/** A published page by its address (for the info pages, e.g. /privacy-policy), or null. */
function rfaheya_info_page_for( $path ) {
	$slug = rfaheya_info_slug( $path );
	if ( '' === $slug ) {
		return null;
	}
	$page = get_page_by_path( $slug, OBJECT, 'page' );
	if ( ! $page || 'publish' !== $page->post_status || ! empty( $page->post_password ) || has_shortcode( $page->post_content, 'woocommerce_checkout' ) || false !== strpos( $page->post_content, '[woocommerce' ) ) {
		return null;
	}
	return $page;
}

/** A saved copy of the shop data made by this version of the plugin. */
function rfaheya_bootstrap_current( $data ) {
	return is_array( $data ) && isset( $data['v'] ) && RFAHEYA_DATA_VERSION === (int) $data['v'];
}

/**
 * The shop data as fast as possible: the fresh copy; otherwise the last good one. Either way a
 * missing or old copy is rebuilt after the answer has been sent, never while a visitor waits.
 * Returns array( data or null, stale ).
 */
function rfaheya_bootstrap_ready() {
	$data = get_transient( 'rfaheya_bootstrap' );
	if ( rfaheya_bootstrap_current( $data ) && ! empty( $data['products'] ) ) {
		// The store settings are always the current ones (they are quick to read), so a change
		// in Settings → Rfaheya Store shows at once, even while the product copy is being rebuilt.
		$data['settings'] = rfaheya_settings_data();
		return array( $data, false );
	}
	$last = get_option( 'rfaheya_bootstrap_last' );
	if ( rfaheya_bootstrap_current( $last ) && ! empty( $last['products'] ) ) {
		rfaheya_build_after_response();
		$last['settings'] = rfaheya_settings_data();
		return array( $last, true );
	}
	// None yet: this visitor's storefront loads the products itself; the copy is built meanwhile.
	rfaheya_build_after_response();
	return array( null, false );
}

/**
 * Storefront page (every storefront URL is routed here by .htaccess):
 * index.html as is, plus the shop data when it is already built, so the
 * storefront doesn't have to request it. Nothing else is changed.
 */
function rfaheya_storefront_shell() {
	$file = ABSPATH . 'index.html';
	if ( ! is_readable( $file ) ) {
		return;
	}
	$html = (string) file_get_contents( $file );
	// The fresh copy, or the last good one so the shop shows at once (a fresh one follows).
	list( $data, $stale ) = rfaheya_bootstrap_ready();
	// A new upload: pages cached by LiteSpeed still point at the old files.
	$build = (string) filemtime( $file );
	$fresh = get_option( 'rfaheya_index_build' ) !== $build;
	if ( $fresh ) {
		update_option( 'rfaheya_index_build', $build, false );
		rfaheya_purge_page_cache();
	}
	// The site icon set in WordPress (Appearance → Customize → Site Identity → Site Icon).
	if ( has_site_icon() ) {
		$html = str_replace( '</head>', '<link rel="icon" href="' . esc_url( get_site_icon_url( 32 ) ) . '" sizes="32x32"><link rel="icon" href="' . esc_url( get_site_icon_url( 192 ) ) . '" sizes="192x192"><link rel="apple-touch-icon" href="' . esc_url( get_site_icon_url( 180 ) ) . '"></head>', $html );
	}
	// The dashboard logo shows from the first paint (no swap once the settings arrive).
	$logo = rfaheya_logo_prepared()['url'];
	if ( $logo ) {
		$html = str_replace( '<head>', '<head><script>window.__rfLogo=' . wp_json_encode( $logo, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ) . '</script><link rel="preload" as="image" href="' . esc_url( $logo ) . '">', $html );
	}
	$boot_url = $data ? rfaheya_boot_file( $data ) : '';
	if ( $boot_url ) {
		// The shop data as a separate file (kept by the browser and the CDN, downloaded alongside
		// the storefront's code): the page itself stays small and shows sooner. The settings
		// travel in the page, so a change in the dashboard shows at once.
		$settings = wp_json_encode( $data['settings'] ?? new stdClass(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES );
		// Pages that show no products (About, Contact…) fetch it only once they are on screen.
		$html = str_replace(
			'<head>',
			'<head><script>window.__rfSettings=' . $settings . ';(function(){var u=' . wp_json_encode( $boot_url, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES ) . ';window.__rfBootLoad=function(){return window.__rfBoot||(window.__rfBoot=fetch(u).then(function(r){return r.ok?r.json():null}).then(function(d){if(d&&d.products)d.settings=window.__rfSettings;return d&&d.products?d:null}).catch(function(){return null}))};if(!/^\\/(about|our-standard|contact|track-order|journal|finder\\/?$|collections\\/?$)/.test(location.pathname))window.__rfBootLoad()})()</script>',
			$html
		);
	} elseif ( $data ) {
		// At the end of the page: the first screen (and its picture) starts before this is read.
		// The storefront's module runs only once the whole page is read, so it is there in time.
		$html = str_replace( '</body>', '<script>window.__rfBoot=Promise.resolve(' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ) . ')</script></body>', $html );
	}
	// Start the LCP image before the storefront module has parsed the catalogue.
	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH );
	$slider = rfaheya_hero_slider_data( rfaheya_options()['slider'] );
	$data_logo_hm = max( 28, min( 70, (int) ( rfaheya_options()['home']['logo_height_mobile'] ?? 48 ) ) );
	if ( '/' === $path && ! empty( $slider['enabled'] ) ) {
		// The slider's first picture, when one is chosen in the dashboard.
		// The same files the slider picks (phone picture on phones), so nothing is fetched twice.
		$first  = $slider['slides'][0];
		$filled = count(
			array_filter(
				$slider['slides'],
				function ( $s ) {
					return $s['image'] || trim( $s['title'] );
				}
			)
		);
		// For the phone's first-screen picture shown before the storefront starts (index.html).
		$own = array( 'n' => $filled ? $filled : 3 );
		if ( ! empty( $first['image'] ) ) {
			$own['img'] = $first['mobile'] ? $first['mobile'] : $first['image'];
			$own['set'] = $first['mobile'] ? '' : $first['srcset'];
		}
		if ( ! empty( $slider['intro'] ) ) {
			$own = 1; // the opening animation shows first
		}
		$html = str_replace( '<head>', '<head><script>window.__rfOwnSlides=' . wp_json_encode( $own, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ) . ';window.__rfLogoHm=' . (int) $data_logo_hm . '</script>', $html );
		if ( ! empty( $first['image'] ) ) {
			$tags  = '';
			$media = $first['mobile'] ? ' media="(min-width: 768px)"' : '';
			$tags .= '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $first['image'] ) . '"' . $media;
			if ( $first['srcset'] ) {
				$tags .= ' imagesrcset="' . esc_attr( $first['srcset'] ) . '" imagesizes="(min-width: 1024px) 66vw, 100vw"';
			}
			$tags .= '>';
			if ( $first['mobile'] ) {
				$tags .= '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $first['mobile'] ) . '" media="(max-width: 767px)">';
			}
			$html = str_replace( '<head>', '<head>' . $tags, $html );
		}
	} elseif ( '/' === $path ) {
		$html = str_replace( '<head>', '<head><script>window.__rfOwnSlides=1</script>', $html );
		$hero = isset( $data['settings']['home']['hero']['image'] ) ? $data['settings']['home']['hero']['image'] : '';
		$srcset = isset( $data['settings']['home']['hero']['srcset'] ) ? $data['settings']['home']['hero']['srcset'] : '';
		$hero = $hero ? $hero : '/assets/hero-XWCSYKce.webp';
		$preload = '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $hero ) . '"';
		if ( $srcset ) {
			$preload .= ' imagesrcset="' . esc_attr( $srcset ) . '" imagesizes="(max-width: 767px) 250vw, 100vw"';
		}
		$html = str_replace( '</head>', $preload . '></head>', $html );
	}
	// The journal: its posts come with the page (no slow REST request), and the first
	// post's picture starts at once.
	if ( preg_match( '#^/journal(/|$)#', (string) $path ) ) {
		$posts = rfaheya_posts_slim();
		$head  = '<script>window.__rfPosts=' . wp_json_encode( $posts, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>';
		$lead  = $posts[0]['_embedded']['wp:featuredmedia'][0] ?? null;
		if ( preg_match( '#^/journal/?$#', (string) $path ) && ! empty( $lead['source_url'] ) ) {
			$set = array();
			foreach ( $lead['media_details']['sizes'] as $size ) {
				$set[ $size['width'] ] = $size['source_url'] . ' ' . $size['width'] . 'w';
			}
			$head .= '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $lead['source_url'] ) . '"' . ( $set ? ' imagesrcset="' . esc_attr( implode( ', ', $set ) ) . '" imagesizes="(max-width: 1023px) 100vw, 50vw"' : '' ) . '>';
		}
		$html = str_replace( '</head>', $head . '</head>', $html );
	}
	// An info page (privacy, terms…): its text comes with the page (no slow REST request).
	$info = rfaheya_info_page_for( $path );
	if ( ! $info && rfaheya_info_slug( $path ) ) {
		// No such page in WordPress: the storefront shows its built-in text at once.
		$flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
		$html  = str_replace( '</head>', '<script>window.__rfWpPage=' . wp_json_encode( array( 'slug' => rfaheya_info_slug( $path ), 'missing' => true ), $flags ) . ';window.__rfPageIndex=' . wp_json_encode( rfaheya_pages_index(), $flags ) . '</script></head>', $html );
	}
	if ( $info ) {
		$copy = array(
			'slug'    => $info->post_name,
			'title'   => array( 'rendered' => get_the_title( $info ) ),
			'excerpt' => array( 'rendered' => has_excerpt( $info ) ? get_the_excerpt( $info ) : '' ),
			'content' => array( 'rendered' => apply_filters( 'the_content', $info->post_content ) ), // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals
		);
		$flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
		$html  = str_replace( '</head>', '<script>window.__rfWpPage=' . wp_json_encode( $copy, $flags ) . ';window.__rfPageIndex=' . wp_json_encode( rfaheya_pages_index(), $flags ) . '</script></head>', $html );
	}
	// This page's title, description, sharing picture and structured data for search engines.
	try {
		$html = rfaheya_seo_apply( $html, (string) $path, $data );
	} catch ( Throwable $e ) {
		error_log( 'Rfaheya: SEO tags failed: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	}
	// The stylesheet inline: one request less before the page shows.
	if ( preg_match( '#<link rel="stylesheet" crossorigin href="/([^"]+\.css)">#', $html, $css ) && is_readable( ABSPATH . $css[1] ) && filesize( ABSPATH . $css[1] ) < 300000 ) {
		$html = str_replace( $css[0], '<style>' . str_replace( '</style', '<\/style', (string) file_get_contents( ABSPATH . $css[1] ) ) . '</style>', $html );
	}
	// Sent as is: page optimisers (LiteSpeed Cache "delay / defer JS", minify…) would
	// hold back or reorder the storefront's start-up scripts.
	if ( ! defined( 'LITESPEED_NO_OPTM' ) ) {
		define( 'LITESPEED_NO_OPTM', true );
	}
	while ( ob_get_level() > 0 ) {
		ob_end_clean();
	}
	nocache_headers();
	header( 'Content-Type: text/html; charset=utf-8' );
	if ( $data && ! $fresh && ! $stale ) {
		// The same page for every visitor; LiteSpeed keeps it until products, stock,
		// settings or content change (rfaheya_purge_page_cache).
		header( 'Cache-Control: public, max-age=0, s-maxage=60' ); // CDNs we can't purge keep it a minute at most
		header( 'X-LiteSpeed-Cache-Control: public,max-age=3600' );
		header( 'X-LiteSpeed-Tag: rfaheya_page' );
	} else {
		header( 'Cache-Control: no-cache' );
		header( 'X-LiteSpeed-Cache-Control: no-cache' );
	}
	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- the storefront's own index.html plus escaped data
	exit;
}

/** Drops the storefront pages LiteSpeed has cached. */
function rfaheya_purge_page_cache() {
	if ( ! headers_sent() ) {
		header( 'X-LiteSpeed-Purge: tag=rfaheya_page', false );
	}
	do_action( 'litespeed_purge', 'rfaheya_page' );
}

add_action(
	'wp_loaded',
	function () {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only page request
		if ( isset( $_GET['rfaheya_shell'] ) && ! is_admin() && ! wp_doing_ajax() ) {
			try {
				rfaheya_storefront_shell();
			} catch ( Throwable $e ) {
				// Never a blank error page: serve the plain storefront, which loads its data itself.
				error_log( 'Rfaheya: page shell failed: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' page: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
				if ( ! headers_sent() && is_readable( ABSPATH . 'index.html' ) ) {
					header( 'Content-Type: text/html; charset=utf-8' );
					header( 'Cache-Control: no-cache' );
					readfile( ABSPATH . 'index.html' );
					exit;
				}
			}
		}
	},
	// After WooCommerce has loaded the session and cart.
	99
);

/** Content changes show up right away. */
foreach ( array( 'save_post', 'deleted_post', 'edited_term', 'created_term', 'delete_term', 'update_option_' . RFAHEYA_OPTION, 'woocommerce_product_set_stock', 'woocommerce_variation_set_stock', 'comment_post', 'wp_insert_comment', 'edit_comment', 'wp_set_comment_status', 'deleted_comment' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			delete_transient( 'rfaheya_bootstrap' );
			delete_transient( 'rfaheya_bootstrap_failed' );
			rfaheya_purge_page_cache();
			if ( ! wp_next_scheduled( 'rfaheya_warm_bootstrap' ) ) {
				wp_schedule_single_event( time() + 2, 'rfaheya_warm_bootstrap' );
			}
		}
	);
}

add_action( 'rfaheya_warm_bootstrap', 'rfaheya_bootstrap' );

add_action(
	'rest_api_init',
	function () {
		$public = '__return_true';

		register_rest_route(
			'rfaheya/v1',
			'/settings',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_settings_data() ),
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/faqs',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_faqs_data() ),
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/pages',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_pages_index() ),
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/products',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_products_details() ),
			)
		);

		// Whether the shop data copy is built (no shop data or settings in it): for checking a slow start.
		register_rest_route(
			'rfaheya/v1',
			'/status',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => function () {
					$fresh    = get_transient( 'rfaheya_bootstrap' );
					$last     = get_option( 'rfaheya_bootstrap_last' );
					$status = array(
						'version'  => RFAHEYA_DATA_VERSION,
						'fresh'    => rfaheya_bootstrap_current( $fresh ) ? count( $fresh['products'] ) : 0,
						'lastCopy' => rfaheya_bootstrap_current( $last ) ? count( $last['products'] ) : 0,
						'building' => (bool) get_transient( 'rfaheya_bootstrap_building' ),
					);
					// Server details (errors, limits) only for the store's admins.
					if ( current_user_can( 'manage_options' ) ) {
						$status += array(
							'failedPause' => (bool) get_transient( 'rfaheya_bootstrap_failed' ),
							'lastBuild'   => get_option( 'rfaheya_bootstrap_status', null ),
							'lastError'   => (string) get_option( 'rfaheya_last_error', '' ),
							'cron'        => ! ( defined( 'DISABLE_WP_CRON' ) && DISABLE_WP_CRON ),
							'finishEarly' => function_exists( 'litespeed_finish_request' ) || function_exists( 'fastcgi_finish_request' ),
							'timeLimit'   => (int) ini_get( 'max_execution_time' ),
							'memory'      => (string) ini_get( 'memory_limit' ),
						);
					}
					$response = rest_ensure_response( $status );
					$response->header( 'Cache-Control', 'no-cache' );
					return $response;
				},
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/bootstrap',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => function () {
					// The storefront asks for this when the page came without the shop data.
					list( $data ) = rfaheya_bootstrap_ready();
					$response     = rest_ensure_response( $data ? $data : array( 'products' => array() ) );
					$response->header( 'Cache-Control', 'no-cache' );
					return $response;
				},
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/notes',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_note_library() ),
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/videos',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => fn() => rest_ensure_response( rfaheya_videos() ),
			)
		);
	}
);

// ==================================================================== starter content import

add_action(
	'admin_post_rfaheya_import',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'rfaheya_import' );
		$message = rfaheya_import_content();
		wp_safe_redirect( add_query_arg( 'rfaheya-imported', rawurlencode( $message ), admin_url( 'options-general.php?page=rfaheya-store' ) ) );
		exit;
	}
);

/** Adds a file from mu-plugins/rfaheya/media to the Media Library once; returns its attachment id. */
function rfaheya_import_media( $file, $title = '' ) {
	$existing = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_rfaheya_source', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_value'  => $file, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
		)
	);
	if ( $existing ) {
		return (int) $existing[0];
	}
	$path = __DIR__ . '/rfaheya/media/' . basename( $file );
	if ( ! $file || ! file_exists( $path ) ) {
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$tmp = wp_tempnam( $file );
	copy( $path, $tmp );
	$id = media_handle_sideload(
		array(
			'name'     => basename( $file ),
			'tmp_name' => $tmp,
		),
		0,
		$title
	);
	if ( is_wp_error( $id ) ) {
		wp_delete_file( $tmp );
		return 0;
	}
	update_post_meta( $id, '_rfaheya_source', $file );
	return (int) $id;
}

function rfaheya_import_content() {
	$file = __DIR__ . '/rfaheya/content.json';
	$data = file_exists( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
	if ( ! is_array( $data ) ) {
		return 'Starter content not found: upload wp-content/mu-plugins/rfaheya/ (from the release zip) and try again.';
	}
	if ( function_exists( 'set_time_limit' ) ) {
		set_time_limit( 300 );
	}
	$count = array(
		'posts'    => 0,
		'pages'    => 0,
		'faqs'     => 0,
		'notes'    => 0,
		'families' => 0,
		'products' => 0,
	);

	// Journal articles -> Posts.
	foreach ( (array) $data['posts'] as $p ) {
		if ( get_page_by_path( $p['slug'], OBJECT, 'post' ) ) {
			continue;
		}
		$cat = term_exists( $p['category'], 'category' );
		if ( ! $cat ) {
			$cat = wp_insert_term( $p['category'], 'category' );
		}
		$id = wp_insert_post(
			array(
				'post_type'     => 'post',
				'post_status'   => 'publish',
				'post_name'     => $p['slug'],
				'post_title'    => $p['title'],
				'post_excerpt'  => $p['excerpt'],
				'post_content'  => $p['content'],
				'post_date'     => $p['date'] . ' 10:00:00',
				'post_category' => is_array( $cat ) ? array( (int) $cat['term_id'] ) : array(),
			)
		);
		if ( $id && ! is_wp_error( $id ) ) {
			$image = rfaheya_import_media( $p['image'], $p['title'] );
			if ( $image ) {
				set_post_thumbnail( $id, $image );
			}
			$count['posts']++;
		}
	}

	// Information pages -> Pages.
	foreach ( (array) $data['pages'] as $p ) {
		if ( get_page_by_path( $p['slug'] ) ) {
			continue;
		}
		$id = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_name'    => $p['slug'],
				'post_title'   => $p['title'],
				'post_excerpt' => $p['excerpt'],
				'post_content' => $p['content'],
			)
		);
		if ( $id && ! is_wp_error( $id ) ) {
			update_post_meta( $id, 'rfaheya_eyebrow', $p['eyebrow'] );
			$count['pages']++;
		}
	}

	// FAQs.
	$existing = wp_list_pluck( get_posts( array( 'post_type' => 'rfaheya_faq', 'post_status' => 'any', 'numberposts' => -1 ) ), 'post_title' );
	foreach ( (array) $data['faqs'] as $i => $f ) {
		if ( in_array( $f['q'], $existing, true ) ) {
			continue;
		}
		wp_insert_post(
			array(
				'post_type'    => 'rfaheya_faq',
				'post_status'  => 'publish',
				'post_title'   => $f['q'],
				'post_content' => $f['a'],
				'menu_order'   => $i,
			)
		);
		$count['faqs']++;
	}

	// Fragrance families -> product category descriptions and images.
	if ( taxonomy_exists( 'product_cat' ) ) {
		foreach ( (array) $data['families'] as $f ) {
			$term = get_term_by( 'slug', $f['slug'], 'product_cat' );
			if ( ! $term ) {
				$made = wp_insert_term( $f['name'], 'product_cat', array( 'slug' => $f['slug'] ) );
				$term = is_wp_error( $made ) ? null : get_term( $made['term_id'], 'product_cat' );
			}
			if ( ! $term ) {
				continue;
			}
			if ( '' === trim( $term->description ) ) {
				wp_update_term( $term->term_id, 'product_cat', array( 'description' => $f['tagline'] ) );
			}
			if ( ! get_term_meta( $term->term_id, 'thumbnail_id', true ) ) {
				$image = rfaheya_import_media( $f['image'], $f['name'] );
				if ( $image ) {
					update_term_meta( $term->term_id, 'thumbnail_id', $image );
				}
			}
			$count['families']++;
		}
	}

	// Home page texts and hero image (only fields that are still empty).
	$saved = get_option( RFAHEYA_OPTION, array() );
	$saved = is_array( $saved ) ? $saved : array();
	$home  = isset( $saved['home'] ) && is_array( $saved['home'] ) ? $saved['home'] : array();
	$h     = isset( $data['home'] ) ? $data['home'] : array();
	$fill  = function ( $key, $value ) use ( &$home ) {
		if ( empty( $home[ $key ] ) && '' !== (string) $value ) {
			$home[ $key ] = (string) $value;
		}
	};
	foreach ( array_values( (array) ( isset( $h['announcements'] ) ? $h['announcements'] : array() ) ) as $i => $line ) {
		if ( $i < 3 ) {
			$fill( 'announcement_' . ( $i + 1 ), $line );
		}
	}
	if ( isset( $h['hero'] ) ) {
		$fill( 'hero_eyebrow', $h['hero']['eyebrow'] );
		$fill( 'hero_title', $h['hero']['title'] );
		$fill( 'hero_text', $h['hero']['text'] );
		if ( empty( $home['hero_image'] ) && ! empty( $h['hero']['image'] ) ) {
			$home['hero_image'] = (string) rfaheya_import_media( $h['hero']['image'], 'Home hero' );
		}
	}
	$saved['home'] = $home;
	update_option( RFAHEYA_OPTION, $saved );

	// Product details box, filled from the attributes the CSV import created.
	if ( function_exists( 'wc_get_products' ) ) {
		$choices = rfaheya_choices();
		$to_keys = function ( $text, $group ) use ( $choices ) {
			$out = array();
			foreach ( rfaheya_list( $text ) as $label ) {
				$key = array_search( strtolower( $label ), array_map( 'strtolower', $choices[ $group ] ), true );
				if ( false === $key && isset( $choices[ $group ][ strtolower( $label ) ] ) ) {
					$key = strtolower( $label );
				}
				if ( false !== $key ) {
					$out[] = $key;
				}
			}
			return $out;
		};
		foreach ( wc_get_products( array( 'limit' => -1, 'status' => 'publish' ) ) as $product ) {
			if ( rfaheya_details( $product->get_id() ) ) {
				continue;
			}
			$g = $to_keys( $product->get_attribute( 'For' ), 'gender' );
			$p = $to_keys( $product->get_attribute( 'Presence' ), 'presence' );
			$l = $to_keys( $product->get_attribute( 'Longevity' ), 'longevity' );
			update_post_meta(
				$product->get_id(),
				'_rfaheya_details',
				rfaheya_clean_details(
					array(
						'inspired_by' => $product->get_attribute( 'Inspired By' ),
						'accords'     => $product->get_attribute( 'Accords' ),
						'notes'       => $product->get_attribute( 'Notes' ),
						'gender'      => $g ? $g[0] : '',
						'occasions'   => $to_keys( $product->get_attribute( 'Occasion' ), 'occasions' ),
						'seasons'     => $to_keys( $product->get_attribute( 'Season' ), 'seasons' ),
						'presence'    => $p ? $p[0] : '',
						'longevity'   => $l ? $l[0] : '',
					)
				)
			);
			$count['products']++;
		}
	}

	$count['notes'] = rfaheya_import_notes( $data );
	rfaheya_import_product_extras( $data );

	// WordPress's sample content would otherwise show up in the journal.
	foreach ( array( array( 'hello-world', 'post' ), array( 'sample-page', 'page' ) ) as $sample ) {
		$post = get_page_by_path( $sample[0], OBJECT, $sample[1] );
		if ( $post ) {
			wp_trash_post( $post->ID );
		}
	}

	return sprintf(
		'Imported %d articles, %d pages, %d FAQs, %d notes, %d family images and %d product detail boxes. Existing content was left as is.',
		$count['posts'],
		$count['pages'],
		$count['faqs'],
		$count['notes'],
		$count['families'],
		$count['products']
	);
}

/** Adds the starter notes (with their icons) that aren't in the library yet; returns how many. */
function rfaheya_import_notes( $data ) {
	$added = 0;
	foreach ( (array) ( isset( $data['notes'] ) ? $data['notes'] : array() ) as $n ) {
		if ( empty( $n['name'] ) || term_exists( $n['name'], 'rfaheya_note' ) ) {
			continue;
		}
		$made = wp_insert_term( $n['name'], 'rfaheya_note' );
		if ( is_wp_error( $made ) ) {
			continue;
		}
		$icon = empty( $n['icon'] ) ? 0 : rfaheya_import_media( $n['icon'], $n['name'] );
		if ( $icon ) {
			update_term_meta( $made['term_id'], 'rfaheya_icon', $icon );
		}
		$added++;
	}
	return $added;
}

/** Fills empty badge / composition / Rfaheya Standard™ values of the starter products (matched by slug). */
function rfaheya_import_product_extras( $data ) {
	foreach ( (array) ( isset( $data['products'] ) ? $data['products'] : array() ) as $extra ) {
		$post = get_page_by_path( $extra['slug'], OBJECT, 'product' );
		if ( ! $post ) {
			continue;
		}
		$d       = rfaheya_details( $post->ID );
		$changed = false;
		foreach ( array( 'badge', 'opening', 'heart', 'drydown', 'standard' ) as $key ) {
			if ( empty( $d[ $key ] ) && ! empty( $extra[ $key ] ) ) {
				$d[ $key ] = $extra[ $key ];
				$changed   = true;
			}
		}
		if ( $changed ) {
			update_post_meta( $post->ID, '_rfaheya_details', rfaheya_clean_details( $d ) );
		}
	}
}

/** One-time upgrade for sites set up with an earlier version: fill the notes library and the new product fields. */
add_action(
	'admin_init',
	function () {
		$version = (int) get_option( 'rfaheya_version', 2 );
		if ( $version >= 4 || ! current_user_can( 'manage_options' ) ) {
			return;
		}
		update_option( 'rfaheya_version', 4 );
		if ( $version < 3 ) {
			$file = __DIR__ . '/rfaheya/content.json';
			$data = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
			if ( is_array( $data ) ) {
				rfaheya_import_notes( $data );
				rfaheya_import_product_extras( $data );
			}
		}
		// The discovery size is now 5 ML: update the announcement bar wording.
		$saved = get_option( RFAHEYA_OPTION, array() );
		if ( is_array( $saved ) && isset( $saved['home'] ) && is_array( $saved['home'] ) ) {
			foreach ( array( 'announcement_1', 'announcement_2', 'announcement_3' ) as $key ) {
				if ( ! empty( $saved['home'][ $key ] ) ) {
					$saved['home'][ $key ] = preg_replace( '/\b10\s*ML\b/i', '5 ML', $saved['home'][ $key ] );
				}
			}
			update_option( RFAHEYA_OPTION, $saved );
		}
	}
);

// ==================================================================== My Account

/**
 * The storefront's account icon opens /my-account/ (routed to WordPress by
 * .htaccess). Make sure WooCommerce's My Account page exists there.
 */
add_action(
	'wp_loaded',
	function () {
		if ( ! function_exists( 'wc_get_page_id' ) ) {
			return;
		}
		$id      = wc_get_page_id( 'myaccount' );
		$page    = $id > 0 ? get_post( $id ) : null;
		$page    = $page && 'page' === $page->post_type && 'trash' !== $page->post_status ? $page : null;
		$by_slug = get_page_by_path( 'my-account' );
		$by_slug = $by_slug && 'trash' !== $by_slug->post_status ? $by_slug : null;
		// A /my-account/ page with the account shortcode is the one to use.
		if ( $by_slug && ( ! $page || $page->ID !== $by_slug->ID ) && false !== strpos( $by_slug->post_content, 'woocommerce_my_account' ) ) {
			$page = $by_slug;
			update_option( 'woocommerce_myaccount_page_id', $page->ID );
		}
		if ( ! $page ) {
			$page = $by_slug;
			if ( ! $page ) {
				$new = wp_insert_post(
					array(
						'post_type'      => 'page',
						'post_status'    => 'publish',
						'post_name'      => 'my-account',
						'post_title'     => 'My account',
						'post_content'   => '<!-- wp:shortcode -->[woocommerce_my_account]<!-- /wp:shortcode -->',
						'comment_status' => 'closed',
					)
				);
				if ( ! $new || is_wp_error( $new ) ) {
					return;
				}
				$page = get_post( $new );
			}
			update_option( 'woocommerce_myaccount_page_id', $page->ID );
		}
		$changes = array();
		if ( 'publish' !== $page->post_status ) {
			$changes['post_status'] = 'publish';
		}
		if ( 'my-account' !== $page->post_name && ! $by_slug ) {
			$changes['post_name'] = 'my-account';
		}
		if ( '' === trim( $page->post_content ) ) {
			$changes['post_content'] = '<!-- wp:shortcode -->[woocommerce_my_account]<!-- /wp:shortcode -->';
		}
		if ( $changes ) {
			wp_update_post( array( 'ID' => $page->ID ) + $changes );
		}
	}
);

/** My Account is shown in a shell that matches the storefront, whatever the WordPress theme. */
function rfaheya_is_account() {
	return function_exists( 'is_account_page' ) && is_account_page();
}

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( ! rfaheya_is_account() ) {
			return;
		}
		// The theme's own styles would fight the storefront look.
		foreach ( wp_styles()->queue as $handle ) {
			$src = isset( wp_styles()->registered[ $handle ] ) ? (string) wp_styles()->registered[ $handle ]->src : '';
			if ( false !== strpos( $src, '/wp-content/themes/' ) || in_array( $handle, array( 'global-styles', 'classic-theme-styles' ), true ) ) {
				wp_dequeue_style( $handle );
			}
		}
	},
	100
);

add_action(
	'template_redirect',
	function () {
		if ( ! rfaheya_is_account() ) {
			return;
		}
		$logo = rfaheya_logo_url();
		$own  = '' !== $logo;
		if ( ! $own ) {
			$logo = file_exists( __DIR__ . '/rfaheya/logo.svg' ) ? WPMU_PLUGIN_URL . '/rfaheya/logo.svg' : '';
		}
		$home = home_url( '/' );
		$link = function ( $path, $label ) use ( $home ) {
			echo '<a href="' . esc_url( $home . ltrim( $path, '/' ) ) . '">' . esc_html( $label ) . '</a>';
		};
		?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php if ( ! current_theme_supports( 'title-tag' ) ) : ?>
<title><?php echo esc_html( wp_get_document_title() ); ?></title>
<?php endif; ?>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Instrument+Serif:ital@0;1&display=swap">
<script>try{if(JSON.parse(localStorage.getItem('rfaheya.theme'))==='dark')document.documentElement.classList.add('dark')}catch(e){}</script>
<?php wp_head(); ?>
<style>
:root { --amber: #e49b2d; --amber-hover: #d08619; --on-amber: #fff; --noir: #100e0b; --ink: #1c1a17; --soft: #4a443b; --muted: #74695b; --bg: #f8f4ed; --card: #fcfaf6; --chip: #f1eadf; --line: #e9e0d2; --line-strong: #d3c6b2; --ease: cubic-bezier(.16,1,.3,1); --spring: cubic-bezier(.2,1.25,.3,1); }
:root.dark { color-scheme: dark; --ink: #f1ebe1; --soft: #d2c8b8; --muted: #a59a8b; --bg: #14120f; --card: #201c17; --chip: #29241d; --line: #332d25; --line-strong: #4b4236; }
body.rfaheya-account { margin: 0; background: var(--bg); color: var(--ink); font-family: "DM Sans", system-ui, sans-serif; font-size: 16px; line-height: 1.6; -webkit-font-smoothing: antialiased; }
.rfaheya-account * { box-sizing: border-box; }
@keyframes rf-rise { from { opacity: 0; transform: translateY(26px); } }
@keyframes rf-pop { from { opacity: 0; transform: translateY(18px) scale(.96); } }
@keyframes rf-glow { 50% { transform: translate(30px, -20px) scale(1.15); } }
@keyframes rf-marquee { to { transform: translateX(-50%); } }
/* Top: black announcement and header, like the storefront */
.rf-announce { background: var(--noir); color: #d8cdbb; font-size: 11px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; overflow: hidden; white-space: nowrap; }
.rf-announce div { display: inline-flex; gap: 48px; padding: 9px 24px; animation: rf-marquee 28s linear infinite; }
.rf-announce b { color: var(--amber); font-weight: 500; }
.rf-bar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px clamp(16px, 5vw, 78px); background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); }
.rf-logo img { display: block; height: 38px; width: auto; }
:root.dark .rf-logo img:not(.rf-own-logo) { filter: invert(1) brightness(.95); }
.rf-logo span { font-family: "Instrument Serif", serif; font-size: 28px; letter-spacing: .04em; color: var(--ink); }
.rf-nav { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 26px; }
.rf-nav a { color: var(--ink); text-decoration: none; font-size: 12px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat; padding-bottom: 2px; transition: background-size .5s var(--ease); }
.rf-nav a:hover { background-size: 100% 1px; }
.rf-nav .rf-nav-cta { padding: 10px 18px; border-radius: 999px; background: var(--amber); color: var(--on-amber); background-image: none; }
.rf-nav .rf-nav-cta:hover { background: var(--amber-hover); }
@media (max-width: 720px) { .rf-nav a:not(.rf-nav-cta) { display: none; } }
/* Hero band: black with an amber glow */
.rf-hero { position: relative; overflow: hidden; background: var(--noir); color: #f4ede2; padding: clamp(40px, 7vw, 76px) clamp(16px, 5vw, 78px) clamp(36px, 6vw, 64px); }
.rf-hero::before, .rf-hero::after { content: ""; position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; animation: rf-glow 14s ease-in-out infinite; }
.rf-hero::before { width: 420px; height: 420px; right: -80px; top: -160px; background: rgba(228,155,45,.38); }
.rf-hero::after { width: 300px; height: 300px; left: 30%; bottom: -200px; background: rgba(228,155,45,.18); animation-duration: 18s; animation-direction: reverse; }
.rf-hero-in { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 24px; }
.rf-eyebrow { margin: 0; font-size: 12px; letter-spacing: .3em; text-transform: uppercase; color: var(--amber); animation: rf-rise .9s var(--ease) both; }
.rf-title { font-family: "Instrument Serif", serif; font-weight: 400; font-size: clamp(42px, 7vw, 72px); line-height: 1; letter-spacing: -.01em; margin: 10px 0 0; animation: rf-rise 1s var(--ease) .08s both; }
.rf-title em { color: var(--amber); }
.rf-hero-sub { margin: 12px 0 0; color: #a99d8b; font-size: 16px; animation: rf-rise 1s var(--ease) .16s both; }
.rf-hero-points { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-radius: 20px; background: rgba(255,255,255,.06); border: 1px solid rgba(228,155,45,.35); animation: rf-pop .9s var(--spring) .25s both; text-decoration: none; color: inherit; }
.rf-hero-points strong { font-family: "Instrument Serif", serif; font-size: 40px; font-weight: 400; line-height: 1; color: var(--amber); }
.rf-hero-points span { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #d8cdbb; line-height: 1.4; }
.rf-main { max-width: 1100px; margin: 0 auto; padding: 40px 16px 96px; }
.rf-main.rf-main-auth { padding-top: 48px; }
/* WooCommerce account */
.rfaheya-account .woocommerce { font-size: 16px; }
.rfaheya-account .woocommerce::after { content: ""; display: table; clear: both; }
.rfaheya-account .woocommerce a { color: var(--ink); text-underline-offset: 4px; }
.rfaheya-account .woocommerce h2, .rfaheya-account .woocommerce h3 { font-family: "Instrument Serif", serif; font-weight: 400; font-size: 30px; line-height: 1.1; }
.rfaheya-account .woocommerce .button, .rfaheya-account .woocommerce button.button, .rfaheya-account .woocommerce input.button, .rfaheya-account .woocommerce a.button { position: relative; overflow: hidden; isolation: isolate; display: inline-flex; align-items: center; justify-content: center; background: var(--amber); color: var(--on-amber); border: 0; border-radius: 999px; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; font-weight: 500; padding: 14px 24px; cursor: pointer; text-decoration: none; transition: background .3s, transform .15s; }
.rfaheya-account .woocommerce .button::after, .rf-primary::after, .rf-nav-cta::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,.4) 50%, transparent 75%); transform: translateX(-130%); pointer-events: none; }
.rfaheya-account .woocommerce .button:hover::after, .rf-primary:hover::after, .rf-nav-cta:hover::after { transform: translateX(130%); transition: transform .9s var(--ease); }
.rfaheya-account .woocommerce .button:hover { background: var(--amber-hover); color: var(--on-amber); }
.rfaheya-account .woocommerce .button:active, .rf-primary:active { transform: scale(.97); }
.rfaheya-account .woocommerce input.input-text, .rfaheya-account .woocommerce select, .rfaheya-account .woocommerce textarea { width: 100%; padding: 13px 16px; border: 1px solid var(--line-strong); border-radius: 14px; background: var(--card); color: var(--ink); font: inherit; transition: border-color .3s, box-shadow .3s; }
.rfaheya-account .woocommerce input.input-text:focus, .rfaheya-account .woocommerce select:focus, .rfaheya-account .woocommerce textarea:focus { outline: none; border-color: var(--amber); box-shadow: 0 0 0 4px rgba(228,155,45,.18); }
.rfaheya-account .woocommerce form .form-row { margin: 0 0 16px; }
.rfaheya-account .woocommerce form .form-row label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--soft); }
.rfaheya-account .woocommerce fieldset { border: 1px solid var(--line); border-radius: 18px; padding: 18px 20px; margin: 24px 0; }
.rfaheya-account .woocommerce form.login, .rfaheya-account .woocommerce form.register, .rfaheya-account .woocommerce form.lost_reset_password { border: 1px solid var(--line); border-radius: 22px; padding: 28px; background: var(--card); }
.rfaheya-account .woocommerce .u-columns { display: grid; gap: 32px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.rfaheya-account .woocommerce .u-columns .col-1, .rfaheya-account .woocommerce .u-columns .col-2 { width: auto; float: none; }
/* Side menu: a card with an amber pill on the current page */
.rfaheya-account .woocommerce-MyAccount-navigation { animation: rf-rise .9s var(--ease) .1s both; }
.rfaheya-account .woocommerce-MyAccount-navigation ul { list-style: none; margin: 0; padding: 8px; border: 1px solid var(--line); border-radius: 22px; background: var(--card); }
.rfaheya-account .woocommerce-MyAccount-navigation li a { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--soft); transition: background .35s var(--ease), color .35s, padding .35s var(--ease); }
.rfaheya-account .woocommerce-MyAccount-navigation li a::after { content: "→"; opacity: 0; transform: translateX(-6px); transition: opacity .3s, transform .4s var(--ease); }
.rfaheya-account .woocommerce-MyAccount-navigation li a:hover { background: var(--chip); color: var(--ink); padding-left: 20px; }
.rfaheya-account .woocommerce-MyAccount-navigation li a:hover::after { opacity: 1; transform: none; }
.rfaheya-account .woocommerce-MyAccount-navigation li.is-active a { background: var(--amber); color: var(--on-amber); }
.rfaheya-account .woocommerce-MyAccount-navigation li.is-active a::after { opacity: 1; transform: none; }
.rfaheya-account .woocommerce-MyAccount-navigation-link--customer-logout a { color: var(--muted); }
.rfaheya-account .woocommerce-MyAccount-content { animation: rf-rise 1s var(--ease) .2s both; }
.rfaheya-account .woocommerce-MyAccount-content > p:first-child { font-size: 17px; color: var(--soft); }
.rfaheya-account .woocommerce table.shop_table { width: 100%; border-collapse: separate; border-spacing: 0; background: var(--card); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; }
.rfaheya-account .woocommerce table.shop_table th { font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); background: var(--chip); }
.rfaheya-account .woocommerce table.shop_table th, .rfaheya-account .woocommerce table.shop_table td { padding: 14px 16px; border-bottom: 1px solid var(--line); text-align: left; }
.rfaheya-account .woocommerce table.shop_table tbody tr { transition: background .3s; }
.rfaheya-account .woocommerce table.shop_table tbody tr:hover { background: color-mix(in srgb, var(--amber) 8%, transparent); }
.rfaheya-account .woocommerce table.shop_table tr:last-child td { border-bottom: 0; }
.rfaheya-account .woocommerce table.shop_table .button { padding: 9px 16px; font-size: 11px; margin: 2px 4px 2px 0; }
.rfaheya-account mark { background: color-mix(in srgb, var(--amber) 22%, transparent); color: var(--ink); padding: 1px 8px; border-radius: 999px; }
.rfaheya-account .woocommerce-Addresses { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.rfaheya-account .woocommerce-Addresses .woocommerce-Address { width: auto; float: none; padding: 22px; border: 1px solid var(--line); border-radius: 22px; background: var(--card); transition: transform .5s var(--ease), box-shadow .5s; }
.rfaheya-account .woocommerce-Addresses .woocommerce-Address:hover { transform: translateY(-4px); box-shadow: 0 24px 50px -30px rgba(16,14,11,.4); }
.rfaheya-account .woocommerce-Address-title { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.rfaheya-account address { font-style: normal; color: var(--soft); }
.rfaheya-account .woocommerce-message, .rfaheya-account .woocommerce-info, .rfaheya-account .woocommerce-error { list-style: none; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 24px; padding: 14px 18px; border-radius: 18px; background: var(--chip); border: 0; border-left: 4px solid var(--amber); animation: rf-pop .7s var(--spring) both; }
.rfaheya-account .woocommerce-error { border-left-color: #c2410c; }
.rfaheya-account .woocommerce-message::before, .rfaheya-account .woocommerce-info::before, .rfaheya-account .woocommerce-error::before { display: none; }
@media (min-width: 768px) { .rfaheya-account .woocommerce-MyAccount-navigation { float: left; width: 26%; position: sticky; top: 92px; } .rfaheya-account .woocommerce-MyAccount-content { float: right; width: 69%; } }
/* Points card on the dashboard */
.rfaheya-account .rf-points { position: relative; overflow: hidden; margin: 28px 0; padding: 26px 28px; border-radius: 24px; background: var(--noir); color: #f4ede2; animation: rf-pop .9s var(--spring) .3s both; }
.rfaheya-account .rf-points::before { content: ""; position: absolute; width: 280px; height: 280px; right: -90px; top: -120px; border-radius: 50%; background: rgba(228,155,45,.35); filter: blur(50px); animation: rf-glow 12s ease-in-out infinite; }
.rfaheya-account .rf-points > * { position: relative; }
.rf-points-label { margin: 0; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--amber); }
.rf-points-total { margin: 8px 0 0; font-family: "Instrument Serif", serif; font-size: 56px; line-height: 1; color: var(--amber); }
.rf-points-total span { font-family: "DM Sans", sans-serif; font-size: 15px; color: #a99d8b; }
.rf-points-how { margin: 12px 0 0; color: #d8cdbb; font-size: 14px; }
.rf-points-log { margin-top: 16px; width: 100%; font-size: 13px; border-collapse: collapse; }
.rf-points-log td { padding: 8px 0; border-top: 1px solid rgba(255,255,255,.08); color: #d8cdbb; }
.rf-points-log td:first-child { color: #a99d8b; }
.rf-points-log td:last-child { text-align: right; font-weight: 600; color: var(--amber); }
/* Sign in / register */
.rf-foot a { color: var(--amber); text-underline-offset: 4px; }
.rf-auth { display: grid; gap: 32px; align-items: stretch; max-width: 1040px; margin: 0 auto; }
@media (min-width: 900px) { .rf-auth { grid-template-columns: 1fr 460px; } }
.rf-auth-art { display: none; border-radius: 28px; background-size: cover; background-position: 70% center; min-height: 560px; position: relative; overflow: hidden; animation: rf-pop 1.1s var(--ease) both; }
.rf-auth-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(16,14,11,.75)); }
.rf-auth-art p { position: absolute; left: 32px; bottom: 26px; z-index: 1; margin: 0; color: #fff; font-family: "Instrument Serif", serif; font-size: 44px; line-height: 1.05; }
.rf-auth-art p em { color: var(--amber); }
@media (min-width: 900px) { .rf-auth-art { display: block; } }
.rf-auth-card { background: var(--card); border: 1px solid var(--line); border-radius: 28px; padding: 28px clamp(20px, 4vw, 40px) 32px; box-shadow: 0 30px 70px -40px rgba(16,14,11,.45); animation: rf-pop .9s var(--spring) .1s both; }
.rf-tabs { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 999px; background: var(--chip); }
.rf-tabs a { text-align: center; padding: 10px 8px; border-radius: 999px; font-size: 13px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--soft); text-decoration: none; transition: background .4s var(--ease), color .3s; }
.rf-tabs a[aria-selected="true"] { background: var(--noir); color: #fff; }
:root.dark .rf-tabs a[aria-selected="true"] { background: var(--amber); color: var(--on-amber); }
.rf-auth-title { font-family: "Instrument Serif", serif; font-weight: 400; font-size: 40px; line-height: 1.05; margin: 26px 0 6px; }
.rf-auth-sub { margin: 0 0 22px; color: var(--muted); font-size: 15px; }
.rf-social { display: grid; gap: 10px; }
.rf-social-btn { display: flex; align-items: center; justify-content: center; gap: 12px; height: 50px; border: 1px solid var(--line-strong); border-radius: 999px; background: var(--card); color: var(--ink); text-decoration: none; font-size: 15px; font-weight: 500; transition: border-color .3s, box-shadow .3s, transform .4s var(--ease); }
.rf-social-btn:hover { border-color: var(--amber); box-shadow: 0 10px 24px -14px rgba(16,14,11,.4); transform: translateY(-2px); }
.rf-or { display: flex; align-items: center; gap: 14px; margin: 20px 0; color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: .14em; }
.rf-or::before, .rf-or::after { content: ""; flex: 1; height: 1px; background: var(--line); }
.rf-form { display: grid; gap: 14px; }
.rf-form label { display: grid; gap: 6px; font-size: 13px; font-weight: 500; color: var(--soft); }
.rf-form input[type=text], .rf-form input[type=email], .rf-form input[type=tel], .rf-form input[type=password] { height: 50px; width: 100%; padding: 0 16px; border: 1px solid var(--line-strong); border-radius: 999px; background: var(--card); font: inherit; font-size: 15px; color: var(--ink); transition: border-color .3s, box-shadow .3s; }
.rf-form input:focus { outline: none; border-color: var(--amber); box-shadow: 0 0 0 4px rgba(228,155,45,.18); }
.rf-row-between { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 14px; }
.rf-row-between a { color: var(--ink); text-underline-offset: 4px; }
.rf-form .rf-check { display: inline-flex; align-items: center; gap: 8px; font-weight: 400; }
.rf-form .rf-check input { accent-color: var(--amber); }
.rf-primary { position: relative; overflow: hidden; isolation: isolate; height: 54px; border: 0; border-radius: 999px; background: var(--amber); color: var(--on-amber); font: inherit; font-size: 13px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; margin-top: 4px; transition: background .3s, transform .15s; }
.rf-primary:hover { background: var(--amber-hover); }
.rf-switch { margin: 4px 0 0; text-align: center; font-size: 14px; color: var(--muted); }
.rf-switch a { color: var(--ink); font-weight: 500; text-underline-offset: 4px; }
.rf-foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding: 28px clamp(16px, 5vw, 78px); font-size: 13px; color: #a99d8b; background: var(--noir); }
.rf-foot .rf-foot-logo { font-family: "Instrument Serif", serif; font-size: 22px; letter-spacing: .06em; color: #f4ede2; }
@media (prefers-reduced-motion: reduce) { .rfaheya-account *, .rfaheya-account *::before, .rfaheya-account *::after { animation-duration: .01ms !important; animation-delay: 0ms !important; transition-duration: .01ms !important; } }
</style>
</head>
<body <?php body_class( 'rfaheya-account' ); ?>>
<?php wp_body_open(); ?>
<div class="rf-announce" aria-hidden="true"><div>
	<?php for ( $i = 0; $i < 2; $i++ ) : ?>
		<span>Free shipping in Cairo &amp; Alexandria over <b>1,200 EGP</b></span><span>Earn <b>points</b> on every order</span><span>Try any scent in <b>5 ML</b> first</span><span>Zero risk guarantee</span>
	<?php endfor; ?>
</div></div>
<header class="rf-bar">
	<a class="rf-logo" href="<?php echo esc_url( $home ); ?>">
		<?php if ( $logo ) : ?>
			<img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"<?php echo $own ? ' class="rf-own-logo"' : ' width="140" height="44"'; ?>>
		<?php else : ?>
			<span>RFAHEYA</span>
		<?php endif; ?>
	</a>
	<nav class="rf-nav" aria-label="Store">
		<?php
		$link( 'shop', 'Shop' );
		$link( 'finder', 'Rfaheya Finder' );
		$link( 'journal', 'Journal' );
		$link( 'contact', 'Contact' );
		?>
		<a class="rf-nav-cta" href="<?php echo esc_url( $home ); ?>">Back to the store</a>
	</nav>
</header>
<?php if ( ! is_user_logged_in() && ! ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'lost-password' ) ) ) : ?>
	<main class="rf-main rf-main-auth">
		<?php rfaheya_auth_page(); ?>
	</main>
<?php else : ?>
	<?php
	$user      = wp_get_current_user();
	$first     = $user->exists() ? ( $user->first_name ? $user->first_name : $user->display_name ) : '';
	$endpoint  = function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url();
	$loyalty   = function_exists( 'rfaheya_loyalty' ) ? rfaheya_loyalty() : array( 'enabled' => false );
	$my_points = $user->exists() && $loyalty['enabled'] ? rfaheya_points( $user->ID ) : null;
	?>
	<section class="rf-hero">
		<div class="rf-hero-in">
			<div>
				<p class="rf-eyebrow">My account</p>
				<?php if ( $endpoint || ! $first ) : ?>
					<h1 class="rf-title"><?php echo esc_html( get_the_title() ); ?></h1>
				<?php else : ?>
					<h1 class="rf-title">Hello, <em><?php echo esc_html( $first ); ?></em>.</h1>
					<p class="rf-hero-sub">Your orders, addresses and points — all in one place.</p>
				<?php endif; ?>
			</div>
			<?php if ( null !== $my_points ) : ?>
				<a class="rf-hero-points" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>">
					<strong data-count="<?php echo esc_attr( $my_points ); ?>"><?php echo esc_html( number_format_i18n( $my_points ) ); ?></strong>
					<span>Rfaheya<br>points</span>
				</a>
			<?php endif; ?>
		</div>
	</section>
	<main class="rf-main">
		<?php
		while ( have_posts() ) {
			the_post();
			the_content();
		}
		?>
	</main>
<?php endif; ?>
<footer class="rf-foot"><span class="rf-foot-logo">RFAHEYA</span><span>&copy; <?php echo esc_html( gmdate( 'Y' ) . ' ' . get_bloginfo( 'name' ) ); ?> · <a href="<?php echo esc_url( $home ); ?>">Back to the store</a></span></footer>
<script>
(function () {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	document.querySelectorAll('[data-count]').forEach(function (el) {
		var end = +el.getAttribute('data-count'), t0 = performance.now(), fmt = new Intl.NumberFormat();
		if (!end) return;
		(function step(t) {
			var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
			el.textContent = fmt.format(Math.round(end * e));
			if (k < 1) requestAnimationFrame(step);
		})(t0);
	});
})();
</script>
<?php wp_footer(); ?>
</body>
</html>
		<?php
		exit;
	},
	99
);

// ==================================================================== sign in / register

// Customers create their own password; the username is generated from the email.
add_filter( 'pre_option_woocommerce_enable_myaccount_registration', fn() => 'yes' );
add_filter( 'pre_option_woocommerce_registration_generate_password', fn() => 'no' );
add_filter( 'pre_option_woocommerce_registration_generate_username', fn() => 'yes' );

/** Register: full name and WhatsApp number are required. */
add_filter(
	'woocommerce_registration_errors',
	function ( $errors ) {
		// Only the register form sends these fields; other ways of creating a customer
		// (an account made at checkout) carry their own name and phone.
		if ( ! empty( $GLOBALS['rfaheya_account_register'] ) || ( ! isset( $_POST['rf_full_name'] ) && ! isset( $_POST['rf_phone'] ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return $errors;
		}
		// WooCommerce verified the register nonce before this filter runs.
		$name  = isset( $_POST['rf_full_name'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['rf_full_name'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$phone = isset( $_POST['rf_phone'] ) ? preg_replace( '/[^\d+]/', '', sanitize_text_field( wp_unslash( $_POST['rf_phone'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( '' === $name ) {
			$errors->add( 'rf_full_name', 'Please enter your full name.' );
		}
		if ( strlen( preg_replace( '/\D/', '', $phone ) ) < 10 ) {
			$errors->add( 'rf_phone', 'Please enter your WhatsApp number.' );
		}
		return $errors;
	}
);

/** Saves the name (also as billing name) and the WhatsApp number (billing phone). */
function rfaheya_save_customer_name( $user_id, $full_name, $phone = '' ) {
	$parts = preg_split( '/\s+/', trim( $full_name ), 2 );
	$first = isset( $parts[0] ) ? $parts[0] : '';
	$last  = isset( $parts[1] ) ? $parts[1] : '';
	wp_update_user(
		array(
			'ID'           => $user_id,
			'first_name'   => $first,
			'last_name'    => $last,
			'display_name' => trim( $full_name ) ? trim( $full_name ) : $first,
		)
	);
	update_user_meta( $user_id, 'billing_first_name', $first );
	update_user_meta( $user_id, 'billing_last_name', $last );
	if ( $phone ) {
		update_user_meta( $user_id, 'billing_phone', $phone );
		update_user_meta( $user_id, 'rfaheya_whatsapp', $phone );
	}
}

add_action(
	'woocommerce_created_customer',
	function ( $user_id ) {
		$name  = isset( $_POST['rf_full_name'] ) ? sanitize_text_field( wp_unslash( $_POST['rf_full_name'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$phone = isset( $_POST['rf_phone'] ) ? preg_replace( '/[^\d+]/', '', sanitize_text_field( wp_unslash( $_POST['rf_phone'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( $name || $phone ) {
			rfaheya_save_customer_name( $user_id, $name, $phone );
		}
	}
);

/** Social sign-in providers that have their keys filled in (Settings → Rfaheya Store → Sign in). */
function rfaheya_oauth_providers() {
	$o   = rfaheya_options()['login'];
	$out = array();
	if ( $o['google_client_id'] && $o['google_client_secret'] ) {
		$out['google'] = array(
			'label'  => 'Google',
			'id'     => $o['google_client_id'],
			'secret' => $o['google_client_secret'],
		);
	}
	if ( $o['facebook_app_id'] && $o['facebook_app_secret'] ) {
		$out['facebook'] = array(
			'label'  => 'Facebook',
			'id'     => $o['facebook_app_id'],
			'secret' => $o['facebook_app_secret'],
		);
	}
	return $out;
}

/** The address Google / Facebook send customers back to (add it in their developer consoles). */
function rfaheya_oauth_redirect_uri( $provider ) {
	return add_query_arg( 'rfaheya_oauth', $provider, home_url( '/my-account/' ) );
}

/** Ends a social sign-in attempt with a message on the sign-in page. */
function rfaheya_oauth_fail( $message ) {
	// The storefront's account page shows the message.
	wp_safe_redirect( add_query_arg( 'error', rawurlencode( $message ), home_url( '/account' ) ) );
	exit;
}

add_action(
	'template_redirect',
	function () {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- OAuth uses its own single-use state.
		$start    = isset( $_GET['rfaheya_login'] ) ? sanitize_key( wp_unslash( $_GET['rfaheya_login'] ) ) : '';
		$callback = isset( $_GET['rfaheya_oauth'] ) ? sanitize_key( wp_unslash( $_GET['rfaheya_oauth'] ) ) : '';
		if ( ! $start && ! $callback ) {
			return;
		}
		$providers = rfaheya_oauth_providers();
		$name      = $start ? $start : $callback;
		if ( ! isset( $providers[ $name ] ) ) {
			rfaheya_oauth_fail( 'This sign-in option is not available.' );
		}
		$p        = $providers[ $name ];
		$redirect = rfaheya_oauth_redirect_uri( $name );

		// 1) Send the customer to Google / Facebook.
		if ( $start ) {
			$state = wp_generate_password( 32, false );
			set_transient( 'rfaheya_oauth_' . $state, $name, 10 * MINUTE_IN_SECONDS );
			// The state is also kept in this browser, so a sign-in link started elsewhere can't sign it in.
			setcookie( 'rfaheya_oauth_state', $state, array( 'expires' => time() + 10 * MINUTE_IN_SECONDS, 'path' => COOKIEPATH ? COOKIEPATH : '/', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax' ) );
			$url = 'google' === $name
				? add_query_arg(
					array(
						'client_id'     => $p['id'],
						'redirect_uri'  => rawurlencode( $redirect ),
						'response_type' => 'code',
						'scope'         => rawurlencode( 'openid email profile' ),
						'state'         => $state,
						'prompt'        => 'select_account',
					),
					'https://accounts.google.com/o/oauth2/v2/auth'
				)
				: add_query_arg(
					array(
						'client_id'    => $p['id'],
						'redirect_uri' => rawurlencode( $redirect ),
						'state'        => $state,
						'scope'        => 'email,public_profile',
					),
					'https://www.facebook.com/v19.0/dialog/oauth'
				);
			wp_redirect( $url ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- external provider
			exit;
		}

		// 2) Back from the provider.
		$state = isset( $_GET['state'] ) ? sanitize_text_field( wp_unslash( $_GET['state'] ) ) : '';
		$code  = isset( $_GET['code'] ) ? sanitize_text_field( wp_unslash( $_GET['code'] ) ) : '';
		// phpcs:enable
		$mine = isset( $_COOKIE['rfaheya_oauth_state'] ) ? sanitize_text_field( wp_unslash( $_COOKIE['rfaheya_oauth_state'] ) ) : '';
		if ( ! $state || ! $mine || ! hash_equals( $mine, $state ) || get_transient( 'rfaheya_oauth_' . $state ) !== $name ) {
			rfaheya_oauth_fail( 'Sign-in expired. Please try again.' );
		}
		delete_transient( 'rfaheya_oauth_' . $state );
		setcookie( 'rfaheya_oauth_state', '', array( 'expires' => time() - 3600, 'path' => COOKIEPATH ? COOKIEPATH : '/', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax' ) );
		if ( ! $code ) {
			rfaheya_oauth_fail( 'Sign-in was cancelled.' );
		}

		$email   = '';
		$profile = array();
		if ( 'google' === $name ) {
			$token = wp_remote_post(
				'https://oauth2.googleapis.com/token',
				array(
					'timeout' => 15,
					'body'    => array(
						'code'          => $code,
						'client_id'     => $p['id'],
						'client_secret' => $p['secret'],
						'redirect_uri'  => $redirect,
						'grant_type'    => 'authorization_code',
					),
				)
			);
			$token = json_decode( (string) wp_remote_retrieve_body( $token ), true );
			if ( empty( $token['access_token'] ) ) {
				rfaheya_oauth_fail( 'Google sign-in failed. Please try again.' );
			}
			$info = json_decode( (string) wp_remote_retrieve_body( wp_remote_get( 'https://openidconnect.googleapis.com/v1/userinfo', array( 'timeout' => 15, 'headers' => array( 'Authorization' => 'Bearer ' . $token['access_token'] ) ) ) ), true );
			if ( empty( $info['email'] ) || empty( $info['email_verified'] ) ) {
				rfaheya_oauth_fail( 'Your Google account has no verified email.' );
			}
			$email   = $info['email'];
			$profile = array(
				'name' => isset( $info['name'] ) ? $info['name'] : '',
				'id'   => isset( $info['sub'] ) ? $info['sub'] : '',
			);
		} else {
			$token = json_decode(
				(string) wp_remote_retrieve_body(
					wp_remote_get(
						add_query_arg(
							array(
								'client_id'     => $p['id'],
								'client_secret' => $p['secret'],
								'redirect_uri'  => rawurlencode( $redirect ),
								'code'          => rawurlencode( $code ),
							),
							'https://graph.facebook.com/v19.0/oauth/access_token'
						),
						array( 'timeout' => 15 )
					)
				),
				true
			);
			if ( empty( $token['access_token'] ) ) {
				rfaheya_oauth_fail( 'Facebook sign-in failed. Please try again.' );
			}
			$info = json_decode( (string) wp_remote_retrieve_body( wp_remote_get( add_query_arg( array( 'fields' => 'id,name,email', 'access_token' => rawurlencode( $token['access_token'] ) ), 'https://graph.facebook.com/v19.0/me' ), array( 'timeout' => 15 ) ) ), true );
			if ( empty( $info['email'] ) ) {
				rfaheya_oauth_fail( 'Your Facebook account did not share an email. Please create an account with your email instead.' );
			}
			$email   = $info['email'];
			$profile = array(
				'name' => isset( $info['name'] ) ? $info['name'] : '',
				'id'   => isset( $info['id'] ) ? $info['id'] : '',
			);
		}

		$email = sanitize_email( $email );
		$user  = get_user_by( 'email', $email );
		if ( $user && ( user_can( $user, 'edit_posts' ) || user_can( $user, 'manage_woocommerce' ) ) ) {
			// Staff accounts sign in with their password only.
			rfaheya_oauth_fail( 'Please sign in to this account with your password.' );
		}
		if ( $user ) {
			$linked = (string) get_user_meta( $user->ID, 'rfaheya_' . $name . '_id', true );
			if ( '' !== $linked && ! hash_equals( $linked, (string) $profile['id'] ) ) {
				rfaheya_oauth_fail( 'This email belongs to another account. Please sign in with your password.' );
			}
			// Facebook doesn't promise the email was confirmed: an existing account is joined only once it was linked before.
			if ( 'facebook' === $name && '' === $linked ) {
				rfaheya_oauth_fail( 'An account with this email already exists. Please sign in with your email and password.' );
			}
		}
		if ( ! $user ) {
			$base     = sanitize_user( current( explode( '@', $email ) ), true );
			$username = $base ? $base : 'customer';
			for ( $i = 1; username_exists( $username ); $i++ ) {
				$username = $base . $i;
			}
			$id = wp_insert_user(
				array(
					'user_login' => $username,
					'user_email' => $email,
					'user_pass'  => wp_generate_password( 24 ),
					'role'       => get_role( 'customer' ) ? 'customer' : 'subscriber',
				)
			);
			if ( is_wp_error( $id ) ) {
				rfaheya_oauth_fail( 'We could not create your account. Please try again.' );
			}
			rfaheya_save_customer_name( $id, $profile['name'] );
			$user = get_user_by( 'id', $id );
		}
		update_user_meta( $user->ID, 'rfaheya_' . $name . '_id', sanitize_text_field( $profile['id'] ) );
		wp_set_current_user( $user->ID );
		wp_set_auth_cookie( $user->ID, true );
		do_action( 'wp_login', $user->user_login, $user ); // phpcs:ignore WordPress.NamingConventions.PrefixAllThemeHooks.NonPrefixedHooknameFound -- core hook
		wp_safe_redirect( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) );
		exit;
	},
	5
);

/** The signed-out My Account page: sign in / create account, with Google and Facebook. */
function rfaheya_auth_page() {
	// phpcs:ignore WordPress.Security.NonceVerification -- only picks the tab to show.
	$register  = isset( $_GET['action'] ) && 'register' === $_GET['action'] || isset( $_POST['register'] );
	$providers = rfaheya_oauth_providers();
	$base      = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' );
	$old       = function ( $key ) {
		return isset( $_POST[ $key ] ) ? esc_attr( sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- refills the form after an error
	};
	$icons     = array(
		'google'   => '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
		'facebook' => '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>',
	);
	$image     = file_exists( __DIR__ . '/rfaheya/media/hero.webp' ) ? WPMU_PLUGIN_URL . '/rfaheya/media/hero.webp' : '';
	?>
	<div class="rf-auth">
		<?php if ( $image ) : ?>
			<div class="rf-auth-art" style="background-image:url('<?php echo esc_url( $image ); ?>')"><p>Speak <em>your scent.</em></p></div>
		<?php endif; ?>
		<div class="rf-auth-card">
			<div class="rf-tabs" role="tablist">
				<a role="tab" aria-selected="<?php echo $register ? 'false' : 'true'; ?>" href="<?php echo esc_url( $base ); ?>">Sign in</a>
				<a role="tab" aria-selected="<?php echo $register ? 'true' : 'false'; ?>" href="<?php echo esc_url( add_query_arg( 'action', 'register', $base ) ); ?>">Create account</a>
			</div>
			<h1 class="rf-auth-title"><?php echo $register ? 'Create your account.' : 'Welcome back.'; ?></h1>
			<p class="rf-auth-sub"><?php echo $register ? 'Track orders, save your favourites and check out faster.' : 'Sign in to see your orders and saved details.'; ?></p>
			<?php
			if ( function_exists( 'wc_print_notices' ) ) {
				wc_print_notices();
			}
			?>
			<?php if ( $providers ) : ?>
				<div class="rf-social">
					<?php foreach ( $providers as $key => $p ) : ?>
						<a class="rf-social-btn" href="<?php echo esc_url( add_query_arg( 'rfaheya_login', $key, $base ) ); ?>"><?php echo $icons[ $key ]; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG ?><span>Continue with <?php echo esc_html( $p['label'] ); ?></span></a>
					<?php endforeach; ?>
				</div>
				<p class="rf-or"><span>or</span></p>
			<?php endif; ?>

			<?php if ( $register ) : ?>
				<form method="post" class="rf-form" novalidate>
					<label>Full name<input type="text" name="rf_full_name" autocomplete="name" required value="<?php echo $old( 'rf_full_name' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in $old ?>"></label>
					<label>WhatsApp number<input type="tel" name="rf_phone" autocomplete="tel" inputmode="tel" placeholder="01x xxxx xxxx" required value="<?php echo $old( 'rf_phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"></label>
					<label>Email<input type="email" name="email" autocomplete="email" required value="<?php echo $old( 'email' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"></label>
					<label>Password<input type="password" name="password" autocomplete="new-password" minlength="6" required></label>
					<?php do_action( 'woocommerce_register_form' ); ?>
					<?php wp_nonce_field( 'woocommerce-register', 'woocommerce-register-nonce' ); ?>
					<button type="submit" name="register" value="Register" class="rf-primary">Create account</button>
					<p class="rf-switch">Already have an account? <a href="<?php echo esc_url( $base ); ?>">Sign in</a></p>
				</form>
			<?php else : ?>
				<form method="post" class="rf-form" novalidate>
					<label>Email<input type="text" name="username" autocomplete="username" required value="<?php echo $old( 'username' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"></label>
					<label>Password<input type="password" name="password" autocomplete="current-password" required></label>
					<div class="rf-row-between">
						<label class="rf-check"><input type="checkbox" name="rememberme" value="forever" checked> Remember me</label>
						<a href="<?php echo esc_url( function_exists( 'wc_lostpassword_url' ) ? wc_lostpassword_url() : wp_lostpassword_url() ); ?>">Forgot password?</a>
					</div>
					<?php do_action( 'woocommerce_login_form' ); ?>
					<?php wp_nonce_field( 'woocommerce-login', 'woocommerce-login-nonce' ); ?>
					<input type="hidden" name="redirect" value="<?php echo esc_url( $base ); ?>">
					<button type="submit" name="login" value="Log in" class="rf-primary">Sign in</button>
					<p class="rf-switch">New to Rfaheya? <a href="<?php echo esc_url( add_query_arg( 'action', 'register', $base ) ); ?>">Create an account</a></p>
				</form>
			<?php endif; ?>
		</div>
	</div>
	<?php
}

// ==================================================================== WooCommerce

/** "a 30 ML" / "30-ml" / "30ml" -> "30ml" */
function rfaheya_size_key( $size ) {
	return strtolower( preg_replace( '/[\s_-]+/', '', (string) $size ) );
}

/**
 * Bundle: every full set of N bottles in the bundle size costs the bundle price
 * (Settings → Rfaheya Store → Bundle). Applied as a negative fee, so it shows
 * in the storefront cart, the checkout and the order.
 */
/** The bundle discount for a cart (0 when the bundle is off or no full set is in the cart). */
function rfaheya_bundle_discount( $cart ) {
	$b     = rfaheya_options()['bundle'];
	$count = (int) $b['count'];
	$price = (float) $b['price'];
	if ( 'no' === $b['enabled'] || $count < 2 || $price <= 0 ) {
		return 0;
	}
	$want   = rfaheya_size_key( $b['size'] );
	$prices = array();
	foreach ( $cart->get_cart() as $item ) {
		$product = $item['data'];
		$size    = '';
		foreach ( (array) ( isset( $item['variation'] ) ? $item['variation'] : array() ) as $attr => $value ) {
			if ( preg_match( '/^attribute_(pa_)?size$/i', $attr ) ) {
				$size = $value;
			}
		}
		if ( '' === $size && $product ) {
			$size = $product->get_attribute( 'pa_size' ) ? $product->get_attribute( 'pa_size' ) : $product->get_attribute( 'Size' );
		}
		if ( rfaheya_size_key( $size ) !== $want ) {
			continue;
		}
		for ( $i = 0; $i < (int) $item['quantity']; $i++ ) {
			$prices[] = (float) $product->get_price();
		}
	}
	rsort( $prices );
	$discount = 0;
	for ( $i = 0; $i + $count <= count( $prices ); $i += $count ) {
		$discount += max( 0, array_sum( array_slice( $prices, $i, $count ) ) - $price );
	}
	return $discount;
}

/** The cart's merchandise before coupons, after the bundle discount (what the offers bar measures). */
function rfaheya_offer_base( $cart ) {
	$amount = 0.0;
	foreach ( $cart->get_cart() as $item ) {
		$amount += isset( $item['line_subtotal'] ) ? (float) $item['line_subtotal'] : 0;
	}
	return max( 0, $amount - rfaheya_bundle_discount( $cart ) );
}

/** Spend more, save more (Settings → Rfaheya Store): the discount for an amount, 0 below the minimum. */
function rfaheya_offer_discount( $amount ) {
	$o       = rfaheya_options()['shipping'];
	$min     = (float) $o['offer_min'];
	$percent = min( 100, max( 0, (float) $o['offer_percent'] ) );
	if ( 'no' === $o['offer_enabled'] || $min <= 0 || $percent <= 0 || $amount < $min ) {
		return 0;
	}
	return round( $amount * $percent / 100 );
}

add_action(
	'woocommerce_cart_calculate_fees',
	function ( $cart ) {
		$discount = rfaheya_bundle_discount( $cart );
		if ( $discount > 0 ) {
			$cart->add_fee( 'Bundle discount', -$discount, false );
		}
		$offer = rfaheya_offer_discount( rfaheya_offer_base( $cart ) );
		if ( $offer > 0 ) {
			$o = rfaheya_options()['shipping'];
			$cart->add_fee( sprintf( '%s%% off orders over %s EGP', rfaheya_number( $o['offer_percent'] ), number_format( (float) $o['offer_min'] ) ), -$offer, false );
		}
	}
);

function rfaheya_number( $n ) {
	return rtrim( rtrim( number_format( (float) $n, 2, '.', '' ), '0' ), '.' );
}

/**
 * Free shipping (Settings → Rfaheya Store → Free shipping): Cairo and Alexandria
 * orders from the minimum up ship free; below it WooCommerce's own free-shipping
 * rates are hidden, so the storefront bar and the checkout always agree.
 */
add_filter(
	'woocommerce_package_rates',
	function ( $rates, $package ) {
		$o = rfaheya_options()['shipping'];
		if ( ! $rates ) {
			return $rates;
		}
		// Spend-more offer: free shipping anywhere.
		if ( function_exists( 'WC' ) && WC()->cart && rfaheya_offer_discount( rfaheya_offer_base( WC()->cart ) ) > 0 ) {
			$free = array_filter(
				$rates,
				function ( $rate ) {
					return 'free_shipping' === $rate->get_method_id();
				}
			);
			if ( $free ) {
				return array_slice( $free, 0, 1, true );
			}
			$rate = reset( $rates );
			$rate->set_cost( 0 );
			$rate->set_taxes( array() );
			$rate->set_label( 'Free shipping' );
			return array( $rate->get_id() => $rate );
		}
		if ( 'no' === $o['free_enabled'] || (float) $o['free_min'] <= 0 ) {
			return $rates;
		}
		$state  = isset( $package['destination']['state'] ) ? strtoupper( (string) $package['destination']['state'] ) : '';
		// Before coupons (welcome / points discounts don't take free shipping away), after the bundle discount.
		$amount = 0.0;
		foreach ( isset( $package['contents'] ) ? (array) $package['contents'] : array() as $line ) {
			$amount += isset( $line['line_subtotal'] ) ? (float) $line['line_subtotal'] : 0;
		}
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$amount -= rfaheya_bundle_discount( WC()->cart );
		}
		$free = array_filter(
			$rates,
			function ( $rate ) {
				return 'free_shipping' === $rate->get_method_id();
			}
		);
		if ( in_array( $state, array( 'EGC', 'EGALX' ), true ) && $amount >= (float) $o['free_min'] ) {
			if ( $free ) {
				return array_slice( $free, 0, 1, true );
			}
			$rate = reset( $rates );
			$rate->set_cost( 0 );
			$rate->set_taxes( array() );
			$rate->set_label( 'Free shipping' );
			return array( $rate->get_id() => $rate );
		}
		$paid = array_diff_key( $rates, $free );
		return $paid ? $paid : $rates;
	},
	20,
	2
);

// Saved shipping settings apply to carts that already have rates.
add_action(
	'update_option_' . RFAHEYA_OPTION,
	function () {
		if ( class_exists( 'WC_Cache_Helper' ) ) {
			WC_Cache_Helper::get_transient_version( 'shipping', true );
		}
	}
);

/** Egypt doesn't use postcodes in the storefront checkout. */
add_filter(
	'woocommerce_get_country_locale',
	function ( $locale ) {
		$locale['EG']['postcode'] = array(
			'required' => false,
			'hidden'   => true,
		);
		return $locale;
	}
);

// ==================================================================== gift boxes

/** Packaging price for 1 … max fragrances (Settings → Rfaheya Store → Gift boxes). */
function rfaheya_gift_prices() {
	$o     = rfaheya_options()['gift'];
	$max   = max( 1, min( 20, (int) $o['max'] ) );
	$given = array();
	foreach ( preg_split( '/\r?\n/', (string) $o['prices'] ) as $line ) {
		if ( preg_match( '/^\s*(\d+)\s*[=:\-]\s*([\d.]+)/', $line, $m ) ) {
			$given[ (int) $m[1] ] = (float) $m[2];
		}
	}
	$prices = array();
	$last   = 0.0;
	for ( $n = 1; $n <= $max; $n++ ) {
		if ( isset( $given[ $n ] ) ) {
			$last = $given[ $n ];
		}
		$prices[ $n ] = $last;
	}
	return $prices;
}

/** What the storefront needs: prices and the WooCommerce ids to add to the cart. */
function rfaheya_gift_box_data() {
	$o      = rfaheya_options()['gift'];
	$stored = get_option( 'rfaheya_gift_box', array() );
	return array(
		'enabled'    => 'no' !== $o['enabled'] && ! empty( $stored['product'] ),
		'max'        => count( rfaheya_gift_prices() ),
		'prices'     => (object) rfaheya_gift_prices(),
		'productId'  => isset( $stored['product'] ) ? (int) $stored['product'] : 0,
		'variations' => (object) ( isset( $stored['variations'] ) ? array_map( 'intval', (array) $stored['variations'] ) : array() ),
		'wrap'       => rfaheya_gift_wrap_data(),
	);
}

/** The gift wrap switch in the cart: on or off, its price, and the hidden product that carries it. */
function rfaheya_gift_wrap_data() {
	$o      = rfaheya_options()['gift'];
	$stored = get_option( 'rfaheya_gift_wrap', array() );
	return array(
		'enabled'   => 'no' !== $o['wrap_enabled'] && ! empty( $stored['product'] ),
		'price'     => max( 0, (float) $o['wrap_price'] ),
		'productId' => isset( $stored['product'] ) ? (int) $stored['product'] : 0,
	);
}

/** Keeps the hidden "Gift wrap" product (simple, no shipping) at the price set in the dashboard. */
function rfaheya_gift_wrap_sync() {
	if ( ! class_exists( 'WC_Product_Simple' ) || get_transient( 'rfaheya_gift_wrap_lock' ) ) {
		return;
	}
	set_transient( 'rfaheya_gift_wrap_lock', 1, MINUTE_IN_SECONDS );
	$price   = max( 0, (float) rfaheya_options()['gift']['wrap_price'] );
	$stored  = get_option( 'rfaheya_gift_wrap', array() );
	$product = ! empty( $stored['product'] ) ? wc_get_product( (int) $stored['product'] ) : null;
	if ( ! $product || 'trash' === $product->get_status() ) {
		// One already there (made earlier)? Use it rather than making another.
		$found   = get_posts( array( 'post_type' => 'product', 'name' => 'rfaheya-gift-wrap', 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids' ) );
		$product = $found ? wc_get_product( (int) $found[0] ) : null;
	}
	if ( ! $product || ! $product->is_type( 'simple' ) ) {
		$product = new WC_Product_Simple();
		$product->set_name( 'Gift wrap' );
		$product->set_slug( 'rfaheya-gift-wrap' );
		$product->set_short_description( 'Gift wrapping with a handwritten card (added by the storefront).' );
		$product->set_reviews_allowed( false );
	}
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'hidden' );
	$product->set_virtual( true );
	$product->set_sold_individually( true );
	$product->set_regular_price( wc_format_decimal( $price ) );
	$product->set_manage_stock( false );
	$product->set_stock_status( 'instock' );
	$id = $product->save();
	update_option( 'rfaheya_gift_wrap', array( 'product' => $id, 'price' => $price ), false );
	delete_transient( 'rfaheya_bootstrap' );
	delete_transient( 'rfaheya_gift_wrap_lock' );
}

/**
 * Keeps the hidden "Gift box" product in step with the settings: one variation per
 * number of fragrances, priced from the packaging prices. Runs in the dashboard
 * whenever the prices change (or the product was deleted).
 */
function rfaheya_gift_box_sync() {
	if ( ! class_exists( 'WC_Product_Variable' ) ) {
		return;
	}
	// Two dashboard pages loading at once must not both create one.
	if ( get_transient( 'rfaheya_gift_box_lock' ) ) {
		return;
	}
	set_transient( 'rfaheya_gift_box_lock', 1, MINUTE_IN_SECONDS );
	$prices  = rfaheya_gift_prices();
	$stored  = get_option( 'rfaheya_gift_box', array() );
	$product = ! empty( $stored['product'] ) ? wc_get_product( (int) $stored['product'] ) : null;
	// Every "Gift box" product there is (rfaheya-gift-box, -2, -3…): keep one, trash the copies.
	global $wpdb;
	$boxes = array_map( 'intval', $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'product' AND post_status <> 'trash' AND post_name LIKE %s ORDER BY ID ASC", $wpdb->esc_like( 'rfaheya-gift-box' ) . '%' ) ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	if ( ( ! $product || 'trash' === $product->get_status() ) && $boxes ) {
		$product = wc_get_product( $boxes[0] );
	}
	foreach ( $boxes as $box ) {
		if ( ! $product || $box !== $product->get_id() ) {
			wp_trash_post( $box );
		}
	}
	if ( ! $product || ! $product->is_type( 'variable' ) || 'trash' === $product->get_status() ) {
		$product = new WC_Product_Variable();
		$product->set_name( 'Gift box' );
		$product->set_slug( 'rfaheya-gift-box' );
		$product->set_short_description( 'Gift packaging for a Rfaheya gift box (added by the storefront).' );
		$product->set_reviews_allowed( false );
	}
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'hidden' );
	$attribute = new WC_Product_Attribute();
	$attribute->set_name( 'Fragrances' );
	$attribute->set_options( array_map( 'strval', array_keys( $prices ) ) );
	$attribute->set_visible( false );
	$attribute->set_variation( true );
	$product->set_attributes( array( $attribute ) );
	$id = $product->save();

	$existing = array();
	foreach ( $product->get_children() as $child_id ) {
		$child = wc_get_product( $child_id );
		if ( $child ) {
			$existing[ (string) $child->get_attribute( 'fragrances' ) ] = $child;
		}
	}
	$variations = array();
	foreach ( $prices as $n => $price ) {
		$variation = isset( $existing[ (string) $n ] ) ? $existing[ (string) $n ] : new WC_Product_Variation();
		unset( $existing[ (string) $n ] );
		$variation->set_parent_id( $id );
		$variation->set_attributes( array( 'fragrances' => (string) $n ) );
		$variation->set_regular_price( wc_format_decimal( $price ) );
		$variation->set_status( 'publish' );
		$variation->set_manage_stock( false );
		$variation->set_stock_status( 'instock' );
		$variations[ $n ] = $variation->save();
	}
	foreach ( $existing as $extra ) {
		$extra->delete( true );
	}
	WC_Product_Variable::sync( $id );
	update_option(
		'rfaheya_gift_box',
		array(
			'product'    => $id,
			'variations' => $variations,
			'signature'  => md5( wp_json_encode( $prices ) ),
		),
		false
	);
	delete_transient( 'rfaheya_bootstrap' );
	delete_transient( 'rfaheya_gift_box_lock' );
}

add_action(
	'admin_init',
	function () {
		if ( ! current_user_can( 'manage_options' ) || ! class_exists( 'WC_Product_Variable' ) ) {
			return;
		}
		$stored  = get_option( 'rfaheya_gift_box', array() );
		$product = ! empty( $stored['product'] ) ? wc_get_product( (int) $stored['product'] ) : null;
		$current = md5( wp_json_encode( rfaheya_gift_prices() ) );
		// Once: earlier versions could leave several copies of it (rfaheya-gift-box-2, -3…).
		$dedupe = ! get_option( 'rfaheya_gift_box_deduped' );
		if ( $dedupe ) {
			update_option( 'rfaheya_gift_box_deduped', 1, false );
		}
		$wrap = get_option( 'rfaheya_gift_wrap', array() );
		if ( 'no' !== rfaheya_options()['gift']['wrap_enabled'] && ( empty( $wrap['product'] ) || ! isset( $wrap['price'] ) || (float) $wrap['price'] !== max( 0, (float) rfaheya_options()['gift']['wrap_price'] ) || ! wc_get_product( (int) $wrap['product'] ) || 'publish' !== get_post_status( (int) $wrap['product'] ) ) ) {
			rfaheya_gift_wrap_sync();
		}
		if ( $dedupe || ! $product || 'publish' !== $product->get_status() || ( isset( $stored['signature'] ) ? $stored['signature'] : '' ) !== $current ) {
			rfaheya_gift_box_sync();
		}
	}
);

// ==================================================================== loyalty points & welcome discount

/** Settings → Rfaheya Store → Loyalty points (also sent to the storefront). */
function rfaheya_loyalty() {
	$o = rfaheya_options()['loyalty'];
	return array(
		'enabled'        => 'no' !== $o['enabled'],
		'earn'           => max( 0, (float) $o['earn'] ),
		'value'          => max( 0, (float) $o['value'] ) / 100,
		'min'            => max( 1, (int) $o['min'] ),
		'welcome'        => 'no' !== $o['welcome_enabled'] && (float) $o['welcome_percent'] > 0,
		'welcomePercent' => max( 0, min( 100, (float) $o['welcome_percent'] ) ),
	);
}

function rfaheya_points( $user_id ) {
	return max( 0, (int) get_user_meta( $user_id, 'rfaheya_points', true ) );
}

/** Adds (or with a negative number takes) points, keeping a short history. */
function rfaheya_points_add( $user_id, $delta, $reason ) {
	$balance = max( 0, rfaheya_points( $user_id ) + (int) $delta );
	update_user_meta( $user_id, 'rfaheya_points', $balance );
	$log = array_filter( (array) get_user_meta( $user_id, 'rfaheya_points_log', true ), 'is_array' );
	array_unshift(
		$log,
		array(
			'date'   => current_time( 'mysql' ),
			'points' => (int) $delta,
			'reason' => $reason,
		)
	);
	update_user_meta( $user_id, 'rfaheya_points_log', array_slice( $log, 0, 30 ) );
	return $balance;
}

/** A one-time coupon (welcome discount or points). */
function rfaheya_make_coupon( $prefix, $type, $amount, $days, $user ) {
	$coupon = new WC_Coupon();
	$coupon->set_code( $prefix . '-' . strtoupper( wp_generate_password( 8, false ) ) );
	$coupon->set_discount_type( $type );
	$coupon->set_amount( $amount );
	$coupon->set_usage_limit( 1 );
	$coupon->set_individual_use( false );
	if ( $days ) {
		$coupon->set_date_expires( time() + $days * DAY_IN_SECONDS );
	}
	$coupon->set_description( sprintf( 'Rfaheya %s for %s (user #%d)', strtolower( $prefix ), $user->user_email, $user->ID ) );
	$coupon->update_meta_data( '_rfaheya_user', $user->ID );
	$coupon->save();
	return $coupon;
}

/** 'unused', 'used', 'expired' or 'gone'. */
function rfaheya_coupon_state( $code ) {
	$id = $code ? wc_get_coupon_id_by_code( $code ) : 0;
	if ( ! $id ) {
		return 'gone';
	}
	$coupon = new WC_Coupon( $id );
	if ( $coupon->get_usage_count() >= 1 ) {
		return 'used';
	}
	$expires = $coupon->get_date_expires();
	return $expires && $expires->getTimestamp() < time() ? 'expired' : 'unused';
}

/** Gives back the points of a points discount that was not used (or always, when cancelling it). */
function rfaheya_release_redeem( $user_id, $only_if_lapsed = false ) {
	$redeem = get_user_meta( $user_id, 'rfaheya_redeem', true );
	if ( ! is_array( $redeem ) || empty( $redeem['code'] ) ) {
		return;
	}
	$state = rfaheya_coupon_state( $redeem['code'] );
	if ( 'used' === $state ) {
		delete_user_meta( $user_id, 'rfaheya_redeem' );
		return;
	}
	if ( $only_if_lapsed && 'unused' === $state ) {
		return;
	}
	$id = wc_get_coupon_id_by_code( $redeem['code'] );
	if ( $id ) {
		wp_delete_post( $id, true );
	}
	rfaheya_points_add( $user_id, (int) $redeem['points'], 'Points discount not used' );
	delete_user_meta( $user_id, 'rfaheya_redeem' );
}

/** True when the customer already has an order (by account or billing email). */
function rfaheya_has_ordered( $user_id, $email ) {
	$statuses = array( 'wc-processing', 'wc-completed', 'wc-on-hold' );
	if ( $user_id && wc_get_orders( array( 'customer_id' => $user_id, 'status' => $statuses, 'limit' => 1, 'return' => 'ids' ) ) ) {
		return true;
	}
	return $email && (bool) wc_get_orders( array( 'billing_email' => $email, 'status' => $statuses, 'limit' => 1, 'return' => 'ids' ) );
}

// The welcome discount is for a customer's first order only.
add_filter(
	'woocommerce_coupon_is_valid',
	function ( $valid, $coupon ) {
		if ( ! $valid || 0 !== stripos( $coupon->get_code(), 'welcome-' ) ) {
			return $valid;
		}
		$user_id = (int) $coupon->get_meta( '_rfaheya_user' );
		$user    = $user_id ? get_userdata( $user_id ) : null;
		if ( ! $user ) {
			$owners = get_users( array( 'meta_key' => 'rfaheya_welcome', 'meta_value' => $coupon->get_code(), 'number' => 1 ) ); // phpcs:ignore WordPress.DB.SlowDBQuery
			$user   = $owners ? $owners[0] : null;
		}
		$email = function_exists( 'WC' ) && WC()->customer ? WC()->customer->get_billing_email() : '';
		if ( ( $user && rfaheya_has_ordered( $user->ID, $user->user_email ) ) || ( $email && rfaheya_has_ordered( 0, $email ) ) ) {
			throw new Exception( 'The welcome discount is for your first order only.' );
		}
		return $valid;
	},
	10,
	2
);

/** The signed-in customer for the storefront: points, welcome discount, points discount. */
function rfaheya_me_data() {
	$loyalty = rfaheya_loyalty();
	$user    = wp_get_current_user();
	if ( ! $user || ! $user->ID || ! class_exists( 'WC_Coupon' ) ) {
		return array(
			'loggedIn' => false,
			'loyalty'  => $loyalty,
		);
	}
	rfaheya_release_redeem( $user->ID, true );
	rfaheya_backfill_points( $user );
	$welcome = null;
	// Only before the first order.
	if ( $loyalty['welcome'] && ! rfaheya_has_ordered( $user->ID, $user->user_email ) ) {
		$code = (string) get_user_meta( $user->ID, 'rfaheya_welcome', true );
		if ( '' === $code ) {
			$code = rfaheya_make_coupon( 'WELCOME', 'percent', $loyalty['welcomePercent'], 0, $user )->get_code();
			update_user_meta( $user->ID, 'rfaheya_welcome', $code );
		}
		$welcome = array(
			'code'    => $code,
			'percent' => $loyalty['welcomePercent'],
			'used'    => 'unused' !== rfaheya_coupon_state( $code ),
		);
	}
	$redeem = get_user_meta( $user->ID, 'rfaheya_redeem', true );
	return array(
		'loggedIn'  => true,
		'firstName' => $user->first_name ? $user->first_name : $user->display_name,
		'lastName'  => $user->last_name,
		'email'     => $user->user_email,
		'phone'     => (string) get_user_meta( $user->ID, 'billing_phone', true ),
		'points'    => rfaheya_points( $user->ID ),
		'loyalty'   => $loyalty,
		'welcome'   => $welcome,
		'redeem'    => is_array( $redeem ) && ! empty( $redeem['code'] ) ? array(
			'code'   => $redeem['code'],
			'amount' => (float) $redeem['amount'],
			'points' => (int) $redeem['points'],
		) : null,
		'nonce'     => wp_create_nonce( 'rfaheya_points' ),
	);
}

/** Sends the customer data (or $data, e.g. an error). WordPress calls ajax actions with an empty argument. */
function rfaheya_send_me( $data = null ) {
	nocache_headers();
	wp_send_json( is_array( $data ) ? $data : rfaheya_me_data() );
}

add_action( 'wp_ajax_rfaheya_me', 'rfaheya_send_me' );
add_action( 'wp_ajax_nopriv_rfaheya_me', 'rfaheya_send_me' );

// Turn points into a one-time discount (at most the cart total the storefront sends).
add_action(
	'wp_ajax_rfaheya_redeem',
	function () {
		check_ajax_referer( 'rfaheya_points' );
		$user_id = get_current_user_id();
		$loyalty = rfaheya_loyalty();
		if ( ! $loyalty['enabled'] || $loyalty['value'] <= 0 ) {
			rfaheya_send_me( array( 'error' => 'Points can’t be used right now.' ) );
		}
		rfaheya_release_redeem( $user_id );
		$points = rfaheya_points( $user_id );
		if ( $points < $loyalty['min'] ) {
			rfaheya_send_me( array( 'error' => sprintf( 'You need at least %d points.', $loyalty['min'] ) ) );
		}
		$amount = floor( $points * $loyalty['value'] );
		$cap    = isset( $_POST['max'] ) ? (float) wp_unslash( $_POST['max'] ) : 0; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( $cap > 0 ) {
			$amount = min( $amount, floor( $cap ) );
		}
		if ( $amount < 1 ) {
			rfaheya_send_me( array( 'error' => 'Not enough points for a discount yet.' ) );
		}
		$spend  = min( $points, (int) ceil( $amount / $loyalty['value'] ) );
		$coupon = rfaheya_make_coupon( 'POINTS', 'fixed_cart', $amount, 14, wp_get_current_user() );
		rfaheya_points_add( $user_id, -$spend, sprintf( 'Used for %s EGP off', $amount ) );
		update_user_meta(
			$user_id,
			'rfaheya_redeem',
			array(
				'code'   => $coupon->get_code(),
				'amount' => $amount,
				'points' => $spend,
			)
		);
		rfaheya_send_me();
	}
);

// Cancel the points discount: the points come back.
add_action(
	'wp_ajax_rfaheya_unredeem',
	function () {
		check_ajax_referer( 'rfaheya_points' );
		rfaheya_release_redeem( get_current_user_id() );
		rfaheya_send_me();
	}
);

/** The customer an order belongs to: its account, or the account with the billing email. */
function rfaheya_order_user( $order ) {
	if ( $order->get_customer_id() ) {
		return (int) $order->get_customer_id();
	}
	$user = get_user_by( 'email', $order->get_billing_email() );
	return $user ? (int) $user->ID : 0;
}

// Storefront orders are placed as guest orders: link them to the customer's account by email.
add_action(
	'woocommerce_store_api_checkout_order_processed',
	function ( $order ) {
		if ( ! $order->get_customer_id() ) {
			$user_id = rfaheya_order_user( $order );
			if ( $user_id ) {
				$order->set_customer_id( $user_id );
				$order->save();
			}
		}
	}
);

/** Gives a completed order's points to its customer, once. */
function rfaheya_award_points( $order, $user_id = 0 ) {
	$loyalty = rfaheya_loyalty();
	if ( ! $loyalty['enabled'] || $loyalty['earn'] <= 0 || ! $order || ! $order->has_status( 'completed' ) || $order->get_meta( '_rfaheya_points' ) ) {
		return;
	}
	$user_id = $user_id ? (int) $user_id : rfaheya_order_user( $order );
	if ( ! $user_id || ( $order->get_customer_id() && (int) $order->get_customer_id() !== $user_id ) ) {
		return;
	}
	$spent  = max( 0, (float) $order->get_total() - (float) $order->get_shipping_total() - (float) $order->get_shipping_tax() );
	$points = (int) floor( $spent * $loyalty['earn'] );
	if ( $points <= 0 ) {
		return;
	}
	if ( ! $order->get_customer_id() ) {
		$order->set_customer_id( $user_id );
	}
	rfaheya_points_add( $user_id, $points, sprintf( 'Order #%s', $order->get_order_number() ) );
	$order->update_meta_data( '_rfaheya_points', $points );
	$order->add_order_note( sprintf( 'Rfaheya points: +%d for the customer.', $points ) );
	$order->save();
}

// Points for completed orders.
add_action(
	'woocommerce_order_status_completed',
	function ( $order_id ) {
		rfaheya_award_points( wc_get_order( $order_id ) );
	}
);

/**
 * Catches up on completed orders of this customer that got no points yet (an order
 * linked to the account later, or placed with the account's email as a guest).
 */
function rfaheya_backfill_points( $user, $force = false ) {
	$loyalty = rfaheya_loyalty();
	if ( ! $loyalty['enabled'] || $loyalty['earn'] <= 0 || ! function_exists( 'wc_get_orders' ) ) {
		return;
	}
	$last = (int) get_user_meta( $user->ID, 'rfaheya_backfill_at', true );
	if ( ! $force && time() - $last < 10 * MINUTE_IN_SECONDS ) {
		return;
	}
	update_user_meta( $user->ID, 'rfaheya_backfill_at', time() );
	$query = array(
		'status' => array( 'wc-completed' ),
		'limit'  => 50,
		'return' => 'ids',
	);
	$ids   = array_unique(
		array_merge(
			wc_get_orders( $query + array( 'customer_id' => $user->ID ) ),
			wc_get_orders( $query + array( 'billing_email' => $user->user_email ) )
		)
	);
	foreach ( $ids as $id ) {
		rfaheya_award_points( wc_get_order( $id ), $user->ID );
	}
}

// The storefront links an order to the signed-in customer right after checkout (by its order key).
add_action(
	'wp_ajax_rfaheya_claim_order',
	function () {
		check_ajax_referer( 'rfaheya_points' );
		$user_id = get_current_user_id();
		$order   = wc_get_order( isset( $_POST['order'] ) ? absint( $_POST['order'] ) : 0 );
		$key     = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
		if ( $user_id && $order && $key && hash_equals( (string) $order->get_order_key(), $key ) && in_array( (int) $order->get_customer_id(), array( 0, $user_id ), true ) ) {
			if ( ! $order->get_customer_id() ) {
				$order->set_customer_id( $user_id );
				$order->add_order_note( 'Linked to the customer’s account by the storefront.' );
				$order->save();
			}
			rfaheya_award_points( $order, $user_id );
		}
		rfaheya_send_me();
	}
);

// Refunded or cancelled after the points were given: take them back.
foreach ( array( 'refunded', 'cancelled' ) as $rfaheya_status ) {
	add_action(
		'woocommerce_order_status_' . $rfaheya_status,
		function ( $order_id ) use ( $rfaheya_status ) {
			$order  = wc_get_order( $order_id );
			$points = $order ? (int) $order->get_meta( '_rfaheya_points' ) : 0;
			if ( ! $points || $order->get_meta( '_rfaheya_points_revoked' ) ) {
				return;
			}
			$user_id = rfaheya_order_user( $order );
			if ( $user_id ) {
				rfaheya_points_add( $user_id, -$points, sprintf( 'Order #%s %s', $order->get_order_number(), $rfaheya_status ) );
			}
			$order->update_meta_data( '_rfaheya_points_revoked', 1 );
			$order->add_order_note( sprintf( 'Rfaheya points: -%d (order %s).', $points, $rfaheya_status ) );
			$order->save();
		}
	);
}

// My Account → Dashboard: points balance and history.
add_action(
	'woocommerce_account_dashboard',
	function () {
		$loyalty = rfaheya_loyalty();
		if ( ! $loyalty['enabled'] ) {
			return;
		}
		$user_id = get_current_user_id();
		rfaheya_release_redeem( $user_id, true );
		rfaheya_backfill_points( wp_get_current_user(), true );
		$points = rfaheya_points( $user_id );
		$log    = array_filter( (array) get_user_meta( $user_id, 'rfaheya_points_log', true ), 'is_array' );
		?>
		<section class="rf-points">
			<p class="rf-points-label">Rfaheya points</p>
			<p class="rf-points-total"><?php echo esc_html( number_format_i18n( $points ) ); ?> <span>points · <?php echo esc_html( number_format_i18n( floor( $points * $loyalty['value'] ) ) ); ?> EGP</span></p>
			<p class="rf-points-how">
				<?php
				echo esc_html(
					sprintf(
						'You earn %s point(s) for every 1 EGP on completed orders. Use %d points or more at checkout.',
						number_format_i18n( $loyalty['earn'], $loyalty['earn'] < 1 ? 2 : 0 ),
						$loyalty['min']
					)
				);
				?>
			</p>
			<?php if ( $log ) : ?>
				<table class="rf-points-log">
					<?php foreach ( array_slice( $log, 0, 8 ) as $row ) : ?>
						<tr>
							<td><?php echo esc_html( mysql2date( get_option( 'date_format' ), $row['date'] ) ); ?></td>
							<td><?php echo esc_html( $row['reason'] ); ?></td>
							<td><?php echo esc_html( ( $row['points'] > 0 ? '+' : '' ) . number_format_i18n( $row['points'] ) ); ?></td>
						</tr>
					<?php endforeach; ?>
				</table>
			<?php endif; ?>
		</section>
		<?php
	}
);

// Users → Profile: see (and, for shop managers, change) a customer's points.
function rfaheya_points_profile_field( $user ) {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	?>
	<h2>Rfaheya points</h2>
	<table class="form-table" role="presentation">
		<tr>
			<th><label for="rfaheya-points">Points</label></th>
			<td><input id="rfaheya-points" name="rfaheya_points" type="number" min="0" step="1" class="small-text" value="<?php echo esc_attr( rfaheya_points( $user->ID ) ); ?>"></td>
		</tr>
	</table>
	<?php
}
add_action( 'show_user_profile', 'rfaheya_points_profile_field' );
add_action( 'edit_user_profile', 'rfaheya_points_profile_field' );

function rfaheya_points_profile_save( $user_id ) {
	// The profile form's own nonce has been checked by WordPress before this runs.
	if ( ! current_user_can( 'manage_woocommerce' ) || ! isset( $_POST['rfaheya_points'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		return;
	}
	$new   = max( 0, (int) $_POST['rfaheya_points'] ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
	$delta = $new - rfaheya_points( $user_id );
	if ( $delta ) {
		rfaheya_points_add( $user_id, $delta, 'Changed by the store' );
	}
}
add_action( 'personal_options_update', 'rfaheya_points_profile_save' );
add_action( 'edit_user_profile_update', 'rfaheya_points_profile_save' );

// ==================================================================== SVG uploads

/** Who may upload SVG files (note icons etc.): administrators and shop managers. */
function rfaheya_can_upload_svg() {
	return current_user_can( 'manage_options' ) || current_user_can( 'manage_woocommerce' );
}

add_filter(
	'upload_mimes',
	function ( $mimes ) {
		if ( rfaheya_can_upload_svg() ) {
			$mimes['svg'] = 'image/svg+xml';
		}
		return $mimes;
	}
);

// PHP reports SVG files under several types (or none); WordPress needs them to match.
add_filter(
	'wp_check_filetype_and_ext',
	function ( $data, $file, $filename ) {
		if ( 'svg' === strtolower( pathinfo( (string) $filename, PATHINFO_EXTENSION ) ) && rfaheya_can_upload_svg() ) {
			$data['ext']  = 'svg';
			$data['type'] = 'image/svg+xml';
		}
		return $data;
	},
	10,
	3
);

/**
 * Removes anything that can run code from an SVG (scripts, event handlers, external
 * links, embedded HTML). Returns the cleaned markup, or false when it isn't a valid SVG.
 */
function rfaheya_sanitize_svg( $svg ) {
	// No DTDs or entities (they can read files or expand without end).
	if ( ! is_string( $svg ) || '' === trim( $svg ) || preg_match( '/<!(DOCTYPE|ENTITY)/i', $svg ) ) {
		return false;
	}
	$dom      = new DOMDocument();
	$previous = libxml_use_internal_errors( true );
	$loaded   = $dom->loadXML( $svg, LIBXML_NONET );
	libxml_clear_errors();
	libxml_use_internal_errors( $previous );
	if ( ! $loaded || ! $dom->documentElement || 'svg' !== strtolower( $dom->documentElement->localName ) ) {
		return false;
	}
	$blocked = array( 'script', 'foreignobject', 'iframe', 'object', 'embed', 'handler', 'listener', 'set', 'audio', 'video', 'canvas', 'base', 'link', 'meta' );
	$xpath   = new DOMXPath( $dom );
	foreach ( iterator_to_array( $xpath->query( '//*' ) ) as $node ) {
		$tag = strtolower( $node->localName );
		if ( in_array( $tag, $blocked, true ) ) {
			$node->parentNode->removeChild( $node );
			continue;
		}
		// Animations that would write a link (or script) into another attribute.
		if ( in_array( $tag, array( 'animate', 'animatemotion', 'animatetransform' ), true ) && preg_match( '/href|javascript:/i', implode( ' ', array( $node->getAttribute( 'attributeName' ), $node->getAttribute( 'values' ), $node->getAttribute( 'to' ), $node->getAttribute( 'from' ), $node->getAttribute( 'by' ) ) ) ) ) {
			$node->parentNode->removeChild( $node );
			continue;
		}
		if ( 'style' === $tag && preg_match( '/@import|javascript:|expression\s*\(|url\s*\(\s*[\'"]?\s*(?!#)/i', $node->textContent ) ) {
			$node->parentNode->removeChild( $node );
			continue;
		}
		foreach ( iterator_to_array( $node->attributes ) as $attribute ) {
			$name  = strtolower( $attribute->nodeName );
			$value = trim( preg_replace( '/[\x00-\x20]+/', '', $attribute->nodeValue ) );
			$bad   = 0 === strpos( $name, 'on' )
				|| ( in_array( $name, array( 'href', 'xlink:href', 'src' ), true ) && '' !== $value && '#' !== $value[0] && ! preg_match( '#^data:image/(png|jpe?g|gif|webp);base64,#i', $value ) )
				|| ( 'attributename' === $name && preg_match( '/href/i', $value ) )
				|| ( 'style' === $name && preg_match( '/javascript:|expression\(|@import|url\((?!#)/i', $value ) );
			if ( $bad ) {
				$node->removeAttributeNode( $attribute );
			}
		}
	}
	return $dom->saveXML( $dom->documentElement );
}

// Clean every uploaded SVG before it is stored; refuse files that aren't valid SVG.
add_filter(
	'wp_handle_upload_prefilter',
	function ( $file ) {
		if ( empty( $file['tmp_name'] ) || 'svg' !== strtolower( pathinfo( (string) $file['name'], PATHINFO_EXTENSION ) ) ) {
			return $file;
		}
		if ( ! rfaheya_can_upload_svg() ) {
			$file['error'] = 'Only administrators and shop managers can upload SVG files.';
			return $file;
		}
		$clean = rfaheya_sanitize_svg( (string) file_get_contents( $file['tmp_name'] ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( false === $clean ) {
			$file['error'] = 'This SVG file could not be read (or contains a DOCTYPE). Please export it again as a plain SVG.';
			return $file;
		}
		file_put_contents( $file['tmp_name'], $clean ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		return $file;
	}
);

// Show SVGs as images in the media library and pickers.
add_filter(
	'wp_prepare_attachment_for_js',
	function ( $response, $attachment ) {
		if ( 'image/svg+xml' === $response['mime'] ) {
			$url               = wp_get_attachment_url( $attachment->ID );
			$size              = array(
				'url'         => $url,
				'width'       => 200,
				'height'      => 200,
				'orientation' => 'landscape',
			);
			$response['sizes'] = array(
				'full'      => $size,
				'medium'    => $size,
				'thumbnail' => $size,
			);
			$response['image'] = array( 'src' => $url );
		}
		return $response;
	},
	10,
	2
);


/* -------------------------------------------------------------------------
 * Reviews from the dashboard, with photos
 * Products → Add review: post a customer's review (e.g. one sent on WhatsApp)
 * with screenshots or photos. Any review's edit screen can add photos too.
 * ---------------------------------------------------------------------- */

add_action(
	'admin_menu',
	function () {
		add_submenu_page( 'edit.php?post_type=product', 'Add review', 'Add review', 'moderate_comments', 'rfaheya-add-review', 'rfaheya_add_review_page' );
	},
	60
);

/** The media picker for review photos (the Add review page and a review's edit screen). */
add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'product_page_rfaheya-add-review' !== $hook && 'comment.php' !== $hook ) {
			return;
		}
		wp_enqueue_media();
		wp_register_script( 'rfaheya-review-photos', false, array( 'jquery' ), '1.0.0', true );
		wp_enqueue_script( 'rfaheya-review-photos' );
		wp_add_inline_script(
			'rfaheya-review-photos',
			"jQuery(function ($) {
				function draw(box) {
					var ids = box.find('input.rf-ids').val().split(',').filter(Boolean);
					var list = box.find('.rf-thumbs').empty();
					ids.forEach(function (id) {
						var url = box.data('urls')[id] || '';
						$('<li>').attr('data-id', id)
							.append($('<img>').attr('src', url))
							.append($('<button type=\"button\" class=\"rf-x\" aria-label=\"Remove photo\">×</button>'))
							.appendTo(list);
					});
				}
				$('.rf-review-photos').each(function () {
					var box = $(this);
					box.data('urls', box.data('initial') || {});
					draw(box);
					box.on('click', '.rf-add', function (e) {
						e.preventDefault();
						var frame = wp.media({ title: 'Review photos', multiple: true, library: { type: 'image' }, button: { text: 'Add photos' } });
						frame.on('select', function () {
							var ids = box.find('input.rf-ids').val().split(',').filter(Boolean);
							frame.state().get('selection').each(function (a) {
								a = a.toJSON();
								if (ids.indexOf(String(a.id)) < 0) ids.push(String(a.id));
								box.data('urls')[a.id] = (a.sizes && (a.sizes.thumbnail || a.sizes.medium) || a).url;
							});
							box.find('input.rf-ids').val(ids.join(','));
							draw(box);
						});
						frame.open();
					});
					box.on('click', '.rf-x', function () {
						var id = String($(this).parent().data('id'));
						var ids = box.find('input.rf-ids').val().split(',').filter(function (x) { return x && x !== id; });
						box.find('input.rf-ids').val(ids.join(','));
						draw(box);
					});
				});
			});"
		);
		wp_register_style( 'rfaheya-review-photos', false, array(), '1.0.0' );
		wp_enqueue_style( 'rfaheya-review-photos' );
		wp_add_inline_style(
			'rfaheya-review-photos',
			'.rf-thumbs{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 10px;padding:0;list-style:none}.rf-thumbs li{position:relative;margin:0}.rf-thumbs img{width:96px;height:96px;object-fit:cover;border-radius:12px;display:block;border:1px solid #ddd}.rf-x{position:absolute;top:-8px;right:-8px;width:24px;height:24px;border-radius:50%;border:0;background:#1d2327;color:#fff;cursor:pointer;line-height:24px;padding:0}.rf-review-form .rf-stars label{margin-right:12px}.rf-review-form td{padding-top:12px}.rf-recent img{width:40px;height:40px;object-fit:cover;border-radius:8px;margin-right:4px;vertical-align:middle}'
		);
	}
);

/** The photo picker: thumbnails, remove buttons and an "Add photos" button; IDs travel in a hidden field. */
function rfaheya_review_photos_field( $ids ) {
	$ids  = array_values( array_filter( array_map( 'absint', (array) $ids ) ) );
	$urls = array();
	foreach ( $ids as $id ) {
		$urls[ $id ] = (string) wp_get_attachment_image_url( $id, 'thumbnail' );
	}
	echo '<div class="rf-review-photos" data-initial="' . esc_attr( wp_json_encode( (object) $urls ) ) . '">';
	echo '<ul class="rf-thumbs"></ul>';
	echo '<input type="hidden" class="rf-ids" name="rfaheya_review_images" value="' . esc_attr( implode( ',', $ids ) ) . '">';
	echo '<button type="button" class="button rf-add">Add photos</button>';
	echo '<p class="description">Screenshots or photos from the customer — they show on the review in the store.</p>';
	echo '</div>';
}

function rfaheya_review_ids_from_post() {
	$raw = isset( $_POST['rfaheya_review_images'] ) ? sanitize_text_field( wp_unslash( $_POST['rfaheya_review_images'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- checked by the callers
	return array_values( array_filter( array_map( 'absint', explode( ',', $raw ) ) ) );
}

/**
 * With WPML (translations), each product exists once per language: keep the English ones
 * (or the site's main language), so a product is listed once. Its translation follows it.
 */
function rfaheya_one_language( $posts ) {
	if ( ! has_filter( 'wpml_post_language_details' ) ) {
		return $posts;
	}
	$languages = (array) apply_filters( 'wpml_active_languages', null, array( 'skip_missing' => 0 ) );
	$main      = isset( $languages['en'] ) ? 'en' : (string) apply_filters( 'wpml_default_language', null );
	if ( '' === $main ) {
		return $posts;
	}
	return array_values(
		array_filter(
			$posts,
			function ( $p ) use ( $main ) {
				$details = apply_filters( 'wpml_post_language_details', null, is_object( $p ) ? $p->ID : (int) $p );
				return ! is_array( $details ) || empty( $details['language_code'] ) || $details['language_code'] === $main;
			}
		)
	);
}

function rfaheya_add_review_page() {
	if ( ! current_user_can( 'moderate_comments' ) ) {
		return;
	}
	$products = rfaheya_one_language(
		get_posts(
			array(
				'post_type'   => 'product',
				'post_status' => 'publish',
				'numberposts' => -1,
				'orderby'     => 'title',
				'order'       => 'ASC',
			)
		)
	);
	$notice = isset( $_GET['rfaheya-review'] ) ? sanitize_text_field( wp_unslash( $_GET['rfaheya-review'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	?>
	<div class="wrap rf-review-form">
		<h1>Add review</h1>
		<p>Post a customer's review — for example one they sent on WhatsApp — with their photos or screenshots. It shows on the product page and in the store's reviews.</p>
		<?php if ( 'added' === $notice ) : ?>
			<div class="notice notice-success is-dismissible"><p>Review added. It shows in the store within a minute.</p></div>
		<?php elseif ( $notice ) : ?>
			<div class="notice notice-error"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="rfaheya_add_review">
			<?php wp_nonce_field( 'rfaheya_add_review' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="rf-product">Fragrance</label></th>
					<td>
						<select id="rf-product" name="product_id" required>
							<option value="">Choose a fragrance…</option>
							<?php foreach ( $products as $p ) : ?>
								<option value="<?php echo esc_attr( $p->ID ); ?>"><?php echo esc_html( $p->post_title ); ?></option>
							<?php endforeach; ?>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="rf-name">Customer name</label></th>
					<td><input id="rf-name" name="author" type="text" class="regular-text" required placeholder="e.g. Sara K."></td>
				</tr>
				<tr>
					<th scope="row">Rating</th>
					<td class="rf-stars">
						<?php for ( $i = 5; $i >= 1; $i-- ) : ?>
							<label><input type="radio" name="rating" value="<?php echo esc_attr( $i ); ?>" <?php checked( 5, $i ); ?>> <?php echo esc_html( str_repeat( '★', $i ) ); ?></label>
						<?php endfor; ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="rf-text">Review</label></th>
					<td><textarea id="rf-text" name="review" rows="5" class="large-text" required placeholder="What the customer said…"></textarea></td>
				</tr>
				<tr>
					<th scope="row"><label for="rf-size">Size bought</label></th>
					<td><input id="rf-size" name="size" type="text" class="regular-text" placeholder="e.g. 50 ML (optional)"></td>
				</tr>
				<tr>
					<th scope="row"><label for="rf-date">Date</label></th>
					<td><input id="rf-date" name="date" type="date" value="<?php echo esc_attr( current_time( 'Y-m-d' ) ); ?>"></td>
				</tr>
				<tr>
					<th scope="row">Verified purchase</th>
					<td><label><input type="checkbox" name="verified" value="1" checked> Show “Verified purchase” on this review</label></td>
				</tr>
				<tr>
					<th scope="row">Photos</th>
					<td><?php rfaheya_review_photos_field( array() ); ?></td>
				</tr>
			</table>
			<?php submit_button( 'Add review' ); ?>
		</form>

		<h2>Recent reviews</h2>
		<table class="widefat striped rf-recent">
			<thead><tr><th>Fragrance</th><th>Customer</th><th>Rating</th><th>Review</th><th>Photos</th><th></th></tr></thead>
			<tbody>
			<?php
			$recent = get_comments(
				array(
					'post_type' => 'product',
					'type'      => 'review',
					'number'    => 20,
					'status'    => 'approve',
				)
			);
			if ( ! $recent ) {
				echo '<tr><td colspan="6">No reviews yet.</td></tr>';
			}
			foreach ( $recent as $c ) {
				$thumbs = '';
				foreach ( (array) get_comment_meta( $c->comment_ID, 'rfaheya_images', true ) as $a ) {
					$src = wp_get_attachment_image_url( (int) $a, 'thumbnail' );
					if ( $src ) {
						$thumbs .= '<img src="' . esc_url( $src ) . '" alt="">';
					}
				}
				echo '<tr><td>' . esc_html( get_the_title( $c->comment_post_ID ) ) . '</td><td>' . esc_html( $c->comment_author ) . '</td><td>' . esc_html( str_repeat( '★', (int) get_comment_meta( $c->comment_ID, 'rating', true ) ) ) . '</td><td>' . esc_html( wp_trim_words( $c->comment_content, 14 ) ) . '</td><td>' . $thumbs . '</td><td><a href="' . esc_url( admin_url( 'comment.php?action=editcomment&c=' . $c->comment_ID ) ) . '">Edit / photos</a></td></tr>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts
			}
			?>
			</tbody>
		</table>
	</div>
	<?php
}

add_action(
	'admin_post_rfaheya_add_review',
	function () {
		if ( ! current_user_can( 'moderate_comments' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'rfaheya_add_review' );
		$back       = admin_url( 'edit.php?post_type=product&page=rfaheya-add-review' );
		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$author     = isset( $_POST['author'] ) ? sanitize_text_field( wp_unslash( $_POST['author'] ) ) : '';
		$text       = isset( $_POST['review'] ) ? sanitize_textarea_field( wp_unslash( $_POST['review'] ) ) : '';
		$rating     = isset( $_POST['rating'] ) ? max( 1, min( 5, absint( $_POST['rating'] ) ) ) : 5;
		$size       = isset( $_POST['size'] ) ? sanitize_text_field( wp_unslash( $_POST['size'] ) ) : '';
		$date       = isset( $_POST['date'] ) ? sanitize_text_field( wp_unslash( $_POST['date'] ) ) : '';
		if ( ! $product_id || 'product' !== get_post_type( $product_id ) || '' === $author || '' === $text ) {
			wp_safe_redirect( add_query_arg( 'rfaheya-review', rawurlencode( 'Please choose a fragrance and fill in the name and the review.' ), $back ) );
			exit;
		}
		$when = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) ? $date . ' ' . current_time( 'H:i:s' ) : current_time( 'mysql' );
		$id   = wp_insert_comment(
			array(
				'comment_post_ID'  => $product_id,
				'comment_author'   => $author,
				'comment_content'  => $text,
				'comment_type'     => 'review',
				'comment_approved' => 1,
				'comment_date'     => $when,
				'comment_date_gmt' => get_gmt_from_date( $when ),
				'user_id'          => 0,
			)
		);
		if ( ! $id ) {
			wp_safe_redirect( add_query_arg( 'rfaheya-review', rawurlencode( 'The review could not be saved. Please try again.' ), $back ) );
			exit;
		}
		update_comment_meta( $id, 'rating', $rating );
		update_comment_meta( $id, 'verified', empty( $_POST['verified'] ) ? 0 : 1 );
		if ( '' !== $size ) {
			update_comment_meta( $id, 'rfaheya_size', $size );
		}
		update_comment_meta( $id, 'rfaheya_images', rfaheya_review_ids_from_post() );
		// The product's average rating and review count.
		if ( class_exists( 'WC_Comments' ) ) {
			WC_Comments::clear_transients( $product_id );
		}
		wp_safe_redirect( add_query_arg( 'rfaheya-review', 'added', $back ) );
		exit;
	}
);

/** Photos (and size) on any product review's edit screen. */
add_action(
	'add_meta_boxes_comment',
	function ( $comment ) {
		if ( 'product' !== get_post_type( $comment->comment_post_ID ) ) {
			return;
		}
		add_meta_box(
			'rfaheya-review-photos',
			'Review photos (Rfaheya)',
			function ( $comment ) {
				wp_nonce_field( 'rfaheya_review_photos', 'rfaheya_review_photos_nonce' );
				rfaheya_review_photos_field( get_comment_meta( $comment->comment_ID, 'rfaheya_images', true ) );
				echo '<p><label>Size bought <input type="text" name="rfaheya_review_size" value="' . esc_attr( (string) get_comment_meta( $comment->comment_ID, 'rfaheya_size', true ) ) . '" placeholder="e.g. 50 ML"></label></p>';
			},
			'comment',
			'normal'
		);
	}
);

add_action(
	'edit_comment',
	function ( $comment_id ) {
		if ( ! isset( $_POST['rfaheya_review_photos_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rfaheya_review_photos_nonce'] ) ), 'rfaheya_review_photos' ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_comment', $comment_id ) ) {
			return;
		}
		update_comment_meta( $comment_id, 'rfaheya_images', rfaheya_review_ids_from_post() );
		$size = isset( $_POST['rfaheya_review_size'] ) ? sanitize_text_field( wp_unslash( $_POST['rfaheya_review_size'] ) ) : '';
		if ( '' === $size ) {
			delete_comment_meta( $comment_id, 'rfaheya_size' );
		} else {
			update_comment_meta( $comment_id, 'rfaheya_size', $size );
		}
	},
	5
);


/* -------------------------------------------------------------------------
 * Notes pack: 181 note pictures with their names (rfaheya/notes-pack.json,
 * pictures in rfaheya/media/note-*.webp). They go into Products → Fragrance
 * notes a few at a time from the dashboard (a progress bar shows at the top),
 * so the host never times out. A note that already has a picture is kept.
 * ---------------------------------------------------------------------- */

/** The pack's notes, and a fingerprint so a newer pack runs again. */
function rfaheya_notes_pack() {
	$file = __DIR__ . '/rfaheya/notes-pack.json';
	$raw  = is_readable( $file ) ? (string) file_get_contents( $file ) : '';
	$list = $raw ? json_decode( $raw, true ) : null;
	return array( is_array( $list ) ? $list : array(), md5( $raw ) );
}

/** Adds the next few notes of the pack; returns [done, total]. */
function rfaheya_notes_pack_step( $batch = 12 ) {
	list( $list, $hash ) = rfaheya_notes_pack();
	$state               = get_option( 'rfaheya_notes_pack', array() );
	$done                = ( is_array( $state ) && isset( $state['hash'], $state['done'] ) && $state['hash'] === $hash ) ? (int) $state['done'] : 0;
	$total               = count( $list );
	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	}
	$end = min( $total, $done + $batch );
	for ( $i = $done; $i < $end; $i++ ) {
		$n = $list[ $i ];
		if ( empty( $n['name'] ) ) {
			continue;
		}
		$term    = term_exists( $n['name'], 'rfaheya_note' );
		$term_id = $term ? (int) ( is_array( $term ) ? $term['term_id'] : $term ) : 0;
		if ( $term_id && get_term_meta( $term_id, 'rfaheya_icon', true ) ) {
			continue; // already has a picture: keep it
		}
		if ( ! $term_id ) {
			$made = wp_insert_term( $n['name'], 'rfaheya_note' );
			if ( is_wp_error( $made ) ) {
				continue;
			}
			$term_id = (int) $made['term_id'];
		}
		$icon = empty( $n['icon'] ) ? 0 : rfaheya_import_media( $n['icon'], $n['name'] );
		if ( $icon ) {
			update_term_meta( $term_id, 'rfaheya_icon', $icon );
		}
	}
	update_option(
		'rfaheya_notes_pack',
		array(
			'hash' => $hash,
			'done' => $end,
		),
		false
	);
	if ( $end >= $total ) {
		// The storefront picks the new pictures up on its next data rebuild.
		delete_transient( 'rfaheya_bootstrap' );
		if ( ! wp_next_scheduled( 'rfaheya_warm_bootstrap' ) ) {
			wp_schedule_single_event( time() + 2, 'rfaheya_warm_bootstrap' );
		}
	}
	return array( $end, $total );
}

/** How far the pack is: [done, total]. */
function rfaheya_notes_pack_progress() {
	list( $list, $hash ) = rfaheya_notes_pack();
	$state               = get_option( 'rfaheya_notes_pack', array() );
	$done                = ( is_array( $state ) && isset( $state['hash'], $state['done'] ) && $state['hash'] === $hash ) ? (int) $state['done'] : 0;
	return array( min( $done, count( $list ) ), count( $list ) );
}

add_action(
	'wp_ajax_rfaheya_notes_pack',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not allowed', 403 );
		}
		check_ajax_referer( 'rfaheya_notes_pack' );
		list( $done, $total ) = rfaheya_notes_pack_step();
		wp_send_json_success(
			array(
				'done'  => $done,
				'total' => $total,
			)
		);
	}
);

/** While the pack isn't in yet: a notice with a progress bar that fills it in, a batch at a time. */
add_action(
	'admin_notices',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		list( $done, $total ) = rfaheya_notes_pack_progress();
		if ( ! $total || $done >= $total ) {
			return;
		}
		$nonce = wp_create_nonce( 'rfaheya_notes_pack' );
		?>
		<div class="notice notice-info" id="rfaheya-notes-pack">
			<p><strong>Rfaheya:</strong> adding <?php echo esc_html( $total ); ?> fragrance note pictures to <em>Products → Fragrance notes</em>… <span class="rf-np-count"><?php echo esc_html( $done . ' / ' . $total ); ?></span> — keep this page open for a minute.</p>
			<p style="max-width:420px;height:8px;background:#f0e6d6;border-radius:99px;overflow:hidden"><span class="rf-np-bar" style="display:block;height:100%;width:<?php echo esc_attr( (string) round( $done / $total * 100 ) ); ?>%;background:#e49b2d;transition:width .3s"></span></p>
		</div>
		<script>
		(function () {
			var box = document.getElementById('rfaheya-notes-pack');
			var tries = 0;
			function step() {
				var body = new FormData();
				body.append('action', 'rfaheya_notes_pack');
				body.append('_ajax_nonce', <?php echo wp_json_encode( $nonce ); ?>);
				fetch(<?php echo wp_json_encode( admin_url( 'admin-ajax.php' ) ); ?>, { method: 'POST', body: body, credentials: 'same-origin' })
					.then(function (r) { return r.json(); })
					.then(function (r) {
						if (!r || !r.success) throw new Error('failed');
						tries = 0;
						box.querySelector('.rf-np-count').textContent = r.data.done + ' / ' + r.data.total;
						box.querySelector('.rf-np-bar').style.width = Math.round(r.data.done / r.data.total * 100) + '%';
						if (r.data.done < r.data.total) step();
						else box.innerHTML = '<p><strong>Rfaheya:</strong> all ' + r.data.total + ' note pictures are in <a href="<?php echo esc_url( admin_url( 'edit-tags.php?taxonomy=rfaheya_note&post_type=product' ) ); ?>">Products → Fragrance notes</a>. ✓</p>';
					})
					.catch(function () { if (++tries < 4) setTimeout(step, 2000); });
			}
			step();
		})();
		</script>
		<?php
	}
);

/* -------------------------------------------------------------------------
 * The storefront's own My Account page (/account): sign in, create an account,
 * forgotten password, orders, addresses and details, all inside the site
 * with its header and footer. WordPress's /my-account/ sends visitors there;
 * Google / Facebook sign-in and the password-reset email link still pass
 * through it first.
 * ---------------------------------------------------------------------- */

/** The customer data plus a nonce for the account actions. */
function rfaheya_account_me() {
	$me = rfaheya_me_data();
	// Google / Facebook sign-in, when their keys are filled in (Settings → Rfaheya Store).
	$me['social'] = array();
	foreach ( rfaheya_oauth_providers() as $name => $p ) {
		$me['social'][] = array(
			'name'  => $p['label'],
			'url'   => add_query_arg( 'rfaheya_login', $name, home_url( '/my-account/' ) ),
		);
	}
	if ( ! empty( $me['loggedIn'] ) ) {
		$me['accountNonce'] = wp_create_nonce( 'rfaheya_account' );
	}
	return $me;
}

function rfaheya_account_fail( $message ) {
	nocache_headers();
	wp_send_json( array( 'error' => $message ) );
}

function rfaheya_account_ok( $extra = array() ) {
	nocache_headers();
	wp_send_json( array_merge( array( 'ok' => true ), $extra ) );
}

/** POST field, trimmed. */
function rfaheya_post( $key ) {
	return isset( $_POST[ $key ] ) ? trim( (string) wp_unslash( $_POST[ $key ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitised by the callers
}

foreach ( array( 'wp_ajax_rfaheya_account_me', 'wp_ajax_nopriv_rfaheya_account_me' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			nocache_headers();
			wp_send_json( rfaheya_account_me() );
		}
	);
}

foreach ( array( 'wp_ajax_rfaheya_login', 'wp_ajax_nopriv_rfaheya_login' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			$login    = sanitize_text_field( rfaheya_post( 'email' ) );
			$password = rfaheya_post( 'password' );
			if ( '' === $login || '' === $password ) {
				rfaheya_account_fail( 'Enter your email and password.' );
			}
			if ( strlen( $password ) > 200 ) {
				rfaheya_account_fail( 'Incorrect email or password.' );
			}
			if ( is_email( $login ) ) {
				$found = get_user_by( 'email', $login );
				if ( $found ) {
					$login = $found->user_login;
				}
			}
			$user = wp_signon(
				array(
					'user_login'    => $login,
					'user_password' => $password,
					'remember'      => true,
				),
				is_ssl()
			);
			if ( is_wp_error( $user ) ) {
				rfaheya_account_fail( 'rfaheya_locked' === $user->get_error_code() ? $user->get_error_message() : 'Incorrect email or password.' );
			}
			rfaheya_account_ok();
		}
	);
}

/**
 * Makes a customer account. Not through WooCommerce's register form checks: other plugins
 * add their own required fields there (a "full name" box, a captcha…) that this page's
 * sign-up and the checkout never send, which made every sign-up fail. This page checks
 * the name, number, email and password itself.
 */
function rfaheya_make_customer( $email, $password, $first = '', $last = '' ) {
	$email = sanitize_email( $email );
	if ( ! is_email( $email ) ) {
		return new WP_Error( 'rf_email', 'Enter a valid email.' );
	}
	if ( email_exists( $email ) ) {
		return new WP_Error( 'rf_exists', 'An account with this email already exists. Sign in instead.' );
	}
	$username = function_exists( 'wc_create_new_customer_username' ) ? wc_create_new_customer_username( $email, array( 'first_name' => $first, 'last_name' => $last ) ) : '';
	if ( ! $username || username_exists( $username ) ) {
		$base     = sanitize_user( current( explode( '@', $email ) ), true );
		$base     = $base ? $base : 'customer';
		$username = $base;
		for ( $i = 1; username_exists( $username ); $i++ ) {
			$username = $base . $i;
		}
	}
	$data = array(
		'user_login'   => $username,
		'user_pass'    => $password,
		'user_email'   => $email,
		'first_name'   => $first,
		'last_name'    => $last,
		'display_name' => trim( $first . ' ' . $last ) ? trim( $first . ' ' . $last ) : $username,
		'role'         => get_role( 'customer' ) ? 'customer' : get_option( 'default_role', 'subscriber' ),
	);
	$id = wp_insert_user( $data );
	if ( is_wp_error( $id ) ) {
		return $id;
	}
	// WooCommerce's own follow-ups (the "new account" email, customer data); our hook saves the name and WhatsApp.
	do_action( 'woocommerce_created_customer', $id, $data, false );
	return $id;
}

foreach ( array( 'wp_ajax_rfaheya_register', 'wp_ajax_nopriv_rfaheya_register' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			if ( ! function_exists( 'wc_create_new_customer' ) ) {
				rfaheya_account_fail( 'Accounts are not available right now.' );
			}
			// A hidden field people never see: bots fill it in.
			if ( '' !== rfaheya_post( 'website' ) ) {
				rfaheya_account_fail( 'Something went wrong. Please try again.' );
			}
			rfaheya_rate_limit( 'register', rfaheya_client_ip(), 5, HOUR_IN_SECONDS );
			$email    = sanitize_email( rfaheya_post( 'email' ) );
			$password = rfaheya_post( 'password' );
			$first    = sanitize_text_field( rfaheya_post( 'firstName' ) );
			$last     = sanitize_text_field( rfaheya_post( 'lastName' ) );
			if ( '' === $first && '' !== rfaheya_post( 'fullName' ) ) {
				$parts = preg_split( '/\s+/', sanitize_text_field( rfaheya_post( 'fullName' ) ), 2 );
				$first = $parts[0];
				$last  = isset( $parts[1] ) ? $parts[1] : '';
			}
			if ( '' === $first ) {
				rfaheya_account_fail( 'Please write your name.' );
			}
			$phone    = sanitize_text_field( rfaheya_post( 'phone' ) );
			if ( ! is_email( $email ) ) {
				rfaheya_account_fail( 'Enter a valid email.' );
			}
			if ( strlen( $password ) < 8 || strlen( $password ) > 200 ) {
				rfaheya_account_fail( 'Password must be at least 8 characters.' );
			}
			if ( email_exists( $email ) ) {
				rfaheya_account_fail( 'An account with this email already exists. Sign in instead.' );
			}
			// The fields the register checks and the new-customer hook read (name and WhatsApp).
			$_POST['rf_full_name'] = trim( $first . ' ' . $last );
			$_POST['rf_phone']     = $phone;
			// This page checks the name and number itself; the old form's check stays out of it.
			$GLOBALS['rfaheya_account_register'] = true;
			$id = rfaheya_make_customer( $email, $password, $first, $last );
			unset( $GLOBALS['rfaheya_account_register'] );
			if ( is_wp_error( $id ) ) {
				rfaheya_account_fail( wp_strip_all_tags( $id->get_error_message() ) );
			}
			foreach ( array(
				'billing_first_name' => $first,
				'billing_last_name'  => $last,
				'billing_phone'      => $phone,
				'billing_email'      => $email,
			) as $key => $value ) {
				if ( '' !== $value ) {
					update_user_meta( $id, $key, $value );
				}
			}
			wc_set_customer_auth_cookie( $id );
			rfaheya_account_ok();
		}
	);
}

foreach ( array( 'wp_ajax_rfaheya_lost_password', 'wp_ajax_nopriv_rfaheya_lost_password' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			$email = sanitize_email( rfaheya_post( 'email' ) );
			if ( ! is_email( $email ) ) {
				rfaheya_account_fail( 'Enter a valid email.' );
			}
			rfaheya_rate_limit( 'lost', rfaheya_client_ip(), 6, HOUR_IN_SECONDS );
			rfaheya_rate_limit( 'lost-mail', strtolower( $email ), 3, HOUR_IN_SECONDS );
			$user = get_user_by( 'email', $email );
			if ( $user && function_exists( 'retrieve_password' ) ) {
				retrieve_password( $user->user_login );
			}
			// The same answer either way: no hint whether an account exists.
			rfaheya_account_ok( array( 'message' => 'If an account exists for this email, a link to choose a new password is on its way.' ) );
		}
	);
}

foreach ( array( 'wp_ajax_rfaheya_reset_password', 'wp_ajax_nopriv_rfaheya_reset_password' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			rfaheya_rate_limit( 'reset', rfaheya_client_ip(), 10, HOUR_IN_SECONDS );
			$key      = rfaheya_post( 'key' );
			$login    = rfaheya_post( 'login' );
			$password = rfaheya_post( 'password' );
			if ( '' === $login && ctype_digit( rfaheya_post( 'id' ) ) ) {
				$by_id = get_user_by( 'id', (int) rfaheya_post( 'id' ) );
				$login = $by_id ? $by_id->user_login : '';
			}
			if ( strlen( $password ) < 8 || strlen( $password ) > 200 ) {
				rfaheya_account_fail( 'Password must be at least 8 characters.' );
			}
			$user = check_password_reset_key( $key, $login );
			if ( is_wp_error( $user ) ) {
				rfaheya_account_fail( 'This link has expired. Ask for a new one.' );
			}
			reset_password( $user, $password );
			// Anyone still signed in with the old password is signed out.
			WP_Session_Tokens::get_instance( $user->ID )->destroy_all();
			wp_set_auth_cookie( $user->ID, true, is_ssl() );
			rfaheya_account_ok();
		}
	);
}

add_action(
	'wp_ajax_rfaheya_logout',
	function () {
		check_ajax_referer( 'rfaheya_account' );
		wp_logout();
		rfaheya_account_ok();
	}
);

/** The signed-in customer's orders, address and details. */
add_action(
	'wp_ajax_rfaheya_account_data',
	function () {
		check_ajax_referer( 'rfaheya_account' );
		$user     = wp_get_current_user();
		$customer = new WC_Customer( $user->ID );
		$orders   = array();
		foreach ( wc_get_orders(
			array(
				'customer_id' => $user->ID,
				'limit'       => 30,
				'orderby'     => 'date',
				'order'       => 'DESC',
			)
		) as $order ) {
			$items = array();
			foreach ( $order->get_items() as $item ) {
				$product = $item->get_product();
				$image   = $product ? wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ) : '';
				$items[] = array(
					'name'     => $item->get_name(),
					'quantity' => (int) $item->get_quantity(),
					'total'    => (float) $order->get_line_total( $item, true ),
					'image'    => $image ? $image : '',
				);
			}
			$created  = $order->get_date_created();
			$orders[] = array(
				'id'       => $order->get_id(),
				'number'   => '#' . $order->get_order_number(),
				'date'     => $created ? $created->date( 'c' ) : '',
				'status'   => wc_get_order_status_name( $order->get_status() ),
				'statusKey'=> $order->get_status(),
				'total'    => (float) $order->get_total(),
				'shipping' => (float) $order->get_shipping_total(),
				'discount' => (float) $order->get_discount_total(),
				'payment'  => $order->get_payment_method_title(),
				'address'  => trim( implode( ', ', array_filter( array( $order->get_billing_address_1(), $order->get_billing_city(), $order->get_billing_state() ) ) ) ),
				'items'    => $items,
			);
		}
		nocache_headers();
		wp_send_json(
			array(
				'orders'  => $orders,
				'details' => array(
					'firstName' => $customer->get_first_name() ? $customer->get_first_name() : $customer->get_billing_first_name(),
					'lastName'  => $customer->get_last_name() ? $customer->get_last_name() : $customer->get_billing_last_name(),
					'email'     => $user->user_email,
					'phone'     => $customer->get_billing_phone(),
					'address'   => $customer->get_billing_address_1(),
					'area'      => $customer->get_billing_city(),
					'governorate' => $customer->get_billing_state(),
				),
			)
		);
	}
);

/** Saves name, phone, address, email and (with the current one) a new password. */
add_action(
	'wp_ajax_rfaheya_save_account',
	function () {
		check_ajax_referer( 'rfaheya_account' );
		$user     = wp_get_current_user();
		$customer = new WC_Customer( $user->ID );
		$first    = sanitize_text_field( rfaheya_post( 'firstName' ) );
		$last     = sanitize_text_field( rfaheya_post( 'lastName' ) );
		$email    = sanitize_email( rfaheya_post( 'email' ) );
		if ( '' === $first ) {
			rfaheya_account_fail( 'Please enter your first name.' );
		}
		if ( ! is_email( $email ) ) {
			rfaheya_account_fail( 'Enter a valid email.' );
		}
		$taken = email_exists( $email );
		if ( $taken && (int) $taken !== (int) $user->ID ) {
			rfaheya_account_fail( 'Another account already uses this email.' );
		}
		$new_password  = rfaheya_post( 'newPassword' );
		$email_changed = strtolower( $email ) !== strtolower( $user->user_email );
		if ( '' !== $new_password && ( strlen( $new_password ) < 8 || strlen( $new_password ) > 200 ) ) {
			rfaheya_account_fail( 'The new password must be at least 8 characters.' );
		}
		// A new password or a new email (the key to the account) needs the current password.
		if ( '' !== $new_password || $email_changed ) {
			rfaheya_rate_limit( 'confirm', (string) $user->ID, 8, 15 * MINUTE_IN_SECONDS );
			if ( ! wp_check_password( rfaheya_post( 'currentPassword' ), $user->user_pass, $user->ID ) ) {
				rfaheya_account_fail( $email_changed && '' === $new_password ? 'To change your email, enter your current password.' : 'Your current password is not right.' );
			}
		}
		$customer->set_first_name( $first );
		$customer->set_last_name( $last );
		$customer->set_billing_first_name( $first );
		$customer->set_billing_last_name( $last );
		$customer->set_billing_phone( sanitize_text_field( rfaheya_post( 'phone' ) ) );
		$customer->set_billing_email( $email );
		$customer->set_billing_address_1( sanitize_text_field( rfaheya_post( 'address' ) ) );
		$customer->set_billing_city( sanitize_text_field( rfaheya_post( 'area' ) ) );
		$customer->set_billing_state( sanitize_text_field( rfaheya_post( 'governorate' ) ) );
		$customer->set_billing_country( 'EG' );
		$customer->set_shipping_first_name( $first );
		$customer->set_shipping_last_name( $last );
		$customer->set_shipping_address_1( sanitize_text_field( rfaheya_post( 'address' ) ) );
		$customer->set_shipping_city( sanitize_text_field( rfaheya_post( 'area' ) ) );
		$customer->set_shipping_state( sanitize_text_field( rfaheya_post( 'governorate' ) ) );
		$customer->set_shipping_country( 'EG' );
		$customer->save();
		$update = array(
			'ID'           => $user->ID,
			'user_email'   => $email,
			'display_name' => trim( $first . ' ' . $last ),
		);
		if ( '' !== $new_password ) {
			$update['user_pass'] = $new_password;
		}
		$saved = wp_update_user( $update );
		if ( is_wp_error( $saved ) ) {
			rfaheya_account_fail( wp_strip_all_tags( $saved->get_error_message() ) );
		}
		if ( '' !== $new_password ) {
			// A new password signs the other sessions out; this one stays signed in.
			wp_set_auth_cookie( $user->ID, true, is_ssl() );
		}
		rfaheya_account_ok();
	}
);

/** WordPress's /my-account/ now opens the site's account page. */
add_action(
	'template_redirect',
	function () {
		if ( ! rfaheya_is_account() ) {
			return;
		}
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- read-only routing
		if ( isset( $_GET['rfaheya_login'] ) || isset( $_GET['rfaheya_oauth'] ) ) {
			return; // Google / Facebook sign-in finishes here first.
		}
		$target = home_url( '/account' );
		if ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'lost-password' ) && isset( $_GET['key'] ) ) {
			$target = add_query_arg(
				array(
					'reset' => rawurlencode( sanitize_text_field( wp_unslash( $_GET['key'] ) ) ),
					'login' => isset( $_GET['login'] ) ? rawurlencode( sanitize_text_field( wp_unslash( $_GET['login'] ) ) ) : '',
					'id'    => isset( $_GET['id'] ) ? (int) $_GET['id'] : '',
				),
				$target
			);
		} elseif ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'customer-logout' ) ) {
			wp_logout();
		} elseif ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'view-order' ) ) {
			global $wp;
			$target = add_query_arg( 'order', (int) ( isset( $wp->query_vars['view-order'] ) ? $wp->query_vars['view-order'] : 0 ), $target );
		}
		// phpcs:enable
		// Messages from a social sign-in (e.g. "not available") are shown by the account page itself.
		wp_safe_redirect( $target );
		exit;
	},
	5
);

/* -------------------------------------------------------------------------
 * Discount rules (Products → Discount rules): a percent or an amount off chosen
 * products and sizes, on their own, with optional start and end dates. They change
 * the product's price in WooCommerce itself, so the store, cart, checkout and orders
 * all show the discounted price (and the old one struck through).
 * ------------------------------------------------------------------------- */

const RFAHEYA_DISCOUNTS = 'rfaheya_discount_rules';

/** The saved rules. */
function rfaheya_discount_rules() {
	$rules = get_option( RFAHEYA_DISCOUNTS, array() );
	return is_array( $rules ) ? array_values( array_filter( $rules, 'is_array' ) ) : array();
}

/** Whether a rule is on right now (switched on, and inside its dates if it has any). */
function rfaheya_rule_live( $rule, $now = null ) {
	$now = null === $now ? current_time( 'timestamp' ) : $now; // phpcs:ignore WordPress.DateTime.CurrentTimeTimestamp.Requested -- compared with dates typed in the store's time zone
	if ( empty( $rule['enabled'] ) || (float) ( $rule['value'] ?? 0 ) <= 0 ) {
		return false;
	}
	if ( ! empty( $rule['start'] ) && $now < strtotime( $rule['start'] . ' 00:00:00' ) ) {
		return false;
	}
	if ( ! empty( $rule['end'] ) && $now > strtotime( $rule['end'] . ' 23:59:59' ) ) {
		return false;
	}
	return true;
}

/** The product id rules are written for (with WPML, the English / main-language product). */
function rfaheya_rule_product_id( $id ) {
	if ( has_filter( 'wpml_object_id' ) ) {
		$languages = (array) apply_filters( 'wpml_active_languages', null, array( 'skip_missing' => 0 ) );
		$main      = isset( $languages['en'] ) ? 'en' : (string) apply_filters( 'wpml_default_language', null );
		if ( $main ) {
			$id = (int) apply_filters( 'wpml_object_id', $id, 'product', true, $main );
		}
	}
	return (int) $id;
}

/** The biggest discount (in money) the live rules give this product at this price. */
function rfaheya_rule_discount( $product, $price ) {
	static $cache = array();
	$price = (float) $price;
	if ( $price <= 0 || ! $product instanceof WC_Product ) {
		return 0;
	}
	$parent = $product->is_type( 'variation' ) ? $product->get_parent_id() : $product->get_id();
	$key    = $product->get_id() . '|' . $price;
	if ( isset( $cache[ $key ] ) ) {
		return $cache[ $key ];
	}
	$best = 0;
	$main = rfaheya_rule_product_id( $parent );
	$size = '';
	if ( $product->is_type( 'variation' ) ) {
		$size = rfaheya_size_key( $product->get_attribute( 'size' ) ? $product->get_attribute( 'size' ) : $product->get_attribute( 'pa_size' ) );
	}
	foreach ( rfaheya_discount_rules() as $rule ) {
		if ( ! rfaheya_rule_live( $rule ) ) {
			continue;
		}
		$ids = array_map( 'intval', (array) ( $rule['products'] ?? array() ) );
		if ( $ids && ! in_array( $main, $ids, true ) && ! in_array( (int) $parent, $ids, true ) ) {
			continue;
		}
		$sizes = array_map( 'rfaheya_size_key', (array) ( $rule['sizes'] ?? array() ) );
		if ( $sizes && ( '' === $size || ! in_array( $size, $sizes, true ) ) ) {
			continue;
		}
		$value = (float) $rule['value'];
		$off   = 'amount' === ( $rule['type'] ?? 'percent' ) ? $value : $price * min( 100, $value ) / 100;
		$best  = max( $best, min( $price, round( $off ) ) );
	}
	$cache[ $key ] = $best;
	return $best;
}

/** The price after the rules (unchanged when no rule applies). */
function rfaheya_ruled_price( $price, $product ) {
	if ( '' === $price || null === $price || is_admin() && ! wp_doing_ajax() && ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return $price;
	}
	$off = rfaheya_rule_discount( $product, $price );
	return $off > 0 ? (string) max( 0, (float) $price - $off ) : $price;
}

foreach ( array( 'woocommerce_product_get_price', 'woocommerce_product_variation_get_price' ) as $rfaheya_hook ) {
	add_filter( $rfaheya_hook, 'rfaheya_ruled_price', 50, 2 );
}
foreach ( array( 'woocommerce_product_get_sale_price', 'woocommerce_product_variation_get_sale_price' ) as $rfaheya_hook ) {
	add_filter(
		$rfaheya_hook,
		function ( $sale, $product ) {
			$base = '' !== $sale && null !== $sale ? $sale : $product->get_regular_price();
			$new  = rfaheya_ruled_price( $base, $product );
			return (string) $new !== (string) $base ? $new : $sale;
		},
		50,
		2
	);
}
// The price ranges WooCommerce keeps for variable products.
foreach ( array( 'woocommerce_variation_prices_price', 'woocommerce_variation_prices_sale_price' ) as $rfaheya_hook ) {
	add_filter(
		$rfaheya_hook,
		fn( $price, $variation ) => rfaheya_ruled_price( $price, $variation ),
		50,
		2
	);
}
add_filter(
	'woocommerce_get_variation_prices_hash',
	function ( $hash ) {
		$hash[] = md5( wp_json_encode( array( rfaheya_discount_rules(), gmdate( 'Y-m-d' ) ) ) );
		return $hash;
	}
);
add_filter(
	'woocommerce_product_is_on_sale',
	function ( $on_sale, $product ) {
		return $on_sale || ( $product instanceof WC_Product && ! $product->is_type( 'variable' ) && rfaheya_rule_discount( $product, $product->get_regular_price() ) > 0 );
	},
	50,
	2
);

/** Rules start and end on their own: the storefront's copy is refreshed at those times. */
function rfaheya_schedule_rule_refresh() {
	wp_clear_scheduled_hook( 'rfaheya_rules_refresh' );
	$now = current_time( 'timestamp' ); // phpcs:ignore WordPress.DateTime.CurrentTimeTimestamp.Requested
	foreach ( rfaheya_discount_rules() as $rule ) {
		foreach ( array( array( 'start', ' 00:00:05' ), array( 'end', ' 23:59:59' ) ) as $edge ) {
			if ( ! empty( $rule[ $edge[0] ] ) ) {
				$at = strtotime( $rule[ $edge[0] ] . $edge[1] ) + ( 'end' === $edge[0] ? 2 : 0 );
				if ( $at > $now ) {
					wp_schedule_single_event( $at - ( $now - time() ), 'rfaheya_rules_refresh', array( $at ) );
				}
			}
		}
	}
}
add_action(
	'rfaheya_rules_refresh',
	function () {
		delete_transient( 'rfaheya_bootstrap' );
		rfaheya_purge_page_cache();
		rfaheya_bootstrap();
	}
);

add_action(
	'admin_menu',
	function () {
		add_submenu_page( 'edit.php?post_type=product', 'Discount rules', 'Discount rules', 'manage_woocommerce', 'rfaheya-discounts', 'rfaheya_discounts_page' );
	}
);

add_action(
	'admin_post_rfaheya_save_discounts',
	function () {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'Sorry, you are not allowed to change discounts.' );
		}
		check_admin_referer( 'rfaheya_save_discounts' );
		$input = isset( $_POST['rules'] ) && is_array( $_POST['rules'] ) ? wp_unslash( $_POST['rules'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- cleaned below
		$rules = array();
		foreach ( $input as $r ) {
			if ( ! is_array( $r ) || ! empty( $r['delete'] ) ) {
				continue;
			}
			$date    = fn( $v ) => preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $v ) ? (string) $v : '';
			$rules[] = array(
				'name'     => sanitize_text_field( $r['name'] ?? '' ),
				'enabled'  => ! empty( $r['enabled'] ),
				'type'     => 'amount' === ( $r['type'] ?? '' ) ? 'amount' : 'percent',
				'value'    => max( 0, (float) ( $r['value'] ?? 0 ) ),
				'products' => array_values( array_unique( array_filter( array_map( 'absint', (array) ( $r['products'] ?? array() ) ) ) ) ),
				'sizes'    => array_values( array_unique( array_filter( array_map( 'sanitize_text_field', (array) ( $r['sizes'] ?? array() ) ) ) ) ),
				'start'    => $date( $r['start'] ?? '' ),
				'end'      => $date( $r['end'] ?? '' ),
			);
		}
		update_option( RFAHEYA_DISCOUNTS, $rules, false );
		rfaheya_schedule_rule_refresh();
		if ( function_exists( 'wc_delete_product_transients' ) ) {
			wc_delete_product_transients();
		}
		delete_transient( 'rfaheya_bootstrap' );
		rfaheya_purge_page_cache();
		wp_safe_redirect( add_query_arg( array( 'post_type' => 'product', 'page' => 'rfaheya-discounts', 'saved' => '1' ), admin_url( 'edit.php' ) ) );
		exit;
	}
);

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'product_page_rfaheya-discounts' !== $hook ) {
			return;
		}
		wp_enqueue_style( 'rfaheya-settings', WPMU_PLUGIN_URL . '/rfaheya-admin/settings.css', array(), rfaheya_admin_asset_version( 'settings.css' ) );
		wp_enqueue_script( 'rfaheya-discounts', WPMU_PLUGIN_URL . '/rfaheya-admin/discounts.js', array(), rfaheya_admin_asset_version( 'discounts.js' ), true );
	}
);

/** Every size the store's products come in, e.g. "10 ML", "50 ML", "100 ML". */
function rfaheya_all_sizes() {
	$sizes = array();
	foreach ( array( 'pa_size', 'size' ) as $tax ) {
		if ( taxonomy_exists( $tax ) ) {
			foreach ( get_terms( array( 'taxonomy' => $tax, 'hide_empty' => false ) ) as $term ) {
				$sizes[ rfaheya_size_key( $term->name ) ] = $term->name;
			}
		}
	}
	// Sizes typed on the products themselves (custom attributes).
	global $wpdb;
	$values = $wpdb->get_col( "SELECT DISTINCT meta_value FROM {$wpdb->postmeta} WHERE meta_key IN ('attribute_size','attribute_pa_size') AND meta_value <> '' LIMIT 200" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	foreach ( $values as $v ) {
		$name = ucwords( str_replace( '-', ' ', $v ) );
		$name = preg_replace( '/\bml\b/i', 'ML', $name );
		if ( ! isset( $sizes[ rfaheya_size_key( $name ) ] ) ) {
			$sizes[ rfaheya_size_key( $name ) ] = $name;
		}
	}
	uasort( $sizes, fn( $a, $b ) => (float) $a <=> (float) $b ?: strcmp( $a, $b ) );
	return $sizes;
}

/** One rule's card (also the blank template for "Add a rule"). */
function rfaheya_discount_card( $i, $rule, $products, $sizes ) {
	$n     = 'rules[' . $i . ']';
	$rule  = wp_parse_args( $rule, array( 'name' => '', 'enabled' => true, 'type' => 'percent', 'value' => '', 'products' => array(), 'sizes' => array(), 'start' => '', 'end' => '' ) );
	$live  = rfaheya_rule_live( $rule );
	$picked = array_map( 'intval', (array) $rule['products'] );
	?>
	<div class="rfs-card rfd-rule" data-index="<?php echo esc_attr( $i ); ?>">
		<div class="rfd-head">
			<input type="text" class="rfd-name" name="<?php echo esc_attr( $n ); ?>[name]" value="<?php echo esc_attr( $rule['name'] ); ?>" placeholder="Rule name, e.g. Ramadan offer on 100 ml" aria-label="Rule name">
			<span class="rfd-state <?php echo $live ? 'is-live' : ''; ?>"><?php echo $live ? 'Running now' : ( empty( $rule['enabled'] ) ? 'Off' : 'Not running now' ); ?></span>
			<label class="rfs-switch rfd-switch"><input type="checkbox" name="<?php echo esc_attr( $n ); ?>[enabled]" value="1" <?php checked( ! empty( $rule['enabled'] ) ); ?>><span class="rfs-track" aria-hidden="true"></span><span class="rfs-switch-text"><strong>On</strong></span></label>
			<button type="button" class="rfd-delete" title="Delete this rule">Delete</button>
			<input type="hidden" class="rfd-deleted" name="<?php echo esc_attr( $n ); ?>[delete]" value="">
		</div>
		<div class="rfs-grid rfd-grid">
			<div class="rfs-field">
				<span class="rfs-label">Discount</span>
				<div class="rfd-amount">
					<input type="number" min="0" step="any" name="<?php echo esc_attr( $n ); ?>[value]" value="<?php echo esc_attr( $rule['value'] ); ?>" placeholder="20" aria-label="Discount">
					<select name="<?php echo esc_attr( $n ); ?>[type]" aria-label="Discount type">
						<option value="percent" <?php selected( $rule['type'], 'percent' ); ?>>% off</option>
						<option value="amount" <?php selected( $rule['type'], 'amount' ); ?>>EGP off each</option>
					</select>
				</div>
			</div>
			<div class="rfs-field">
				<span class="rfs-label">Dates <small class="rfs-help">(optional — empty means always)</small></span>
				<div class="rfd-dates">
					<input type="date" name="<?php echo esc_attr( $n ); ?>[start]" value="<?php echo esc_attr( $rule['start'] ); ?>" aria-label="From">
					<span>to</span>
					<input type="date" name="<?php echo esc_attr( $n ); ?>[end]" value="<?php echo esc_attr( $rule['end'] ); ?>" aria-label="Until">
				</div>
			</div>
			<div class="rfs-field rfs-wide">
				<span class="rfs-label">Sizes <small class="rfs-help">(none ticked = every size)</small></span>
				<div class="rfd-chips">
					<?php foreach ( $sizes as $size ) : ?>
						<label class="rfd-chip"><input type="checkbox" name="<?php echo esc_attr( $n ); ?>[sizes][]" value="<?php echo esc_attr( $size ); ?>" <?php checked( in_array( rfaheya_size_key( $size ), array_map( 'rfaheya_size_key', (array) $rule['sizes'] ), true ) ); ?>><span><?php echo esc_html( $size ); ?></span></label>
					<?php endforeach; ?>
				</div>
			</div>
			<div class="rfs-field rfs-wide">
				<span class="rfs-label">Products <small class="rfs-help">(none ticked = every product)</small></span>
				<div class="rfd-products">
					<div class="rfd-tools"><input type="search" class="rfd-search" placeholder="Search products…" aria-label="Search products"><button type="button" class="rfd-all">Tick all shown</button><button type="button" class="rfd-none">Clear</button><span class="rfd-count"></span></div>
					<div class="rfd-list">
						<?php foreach ( $products as $p ) : ?>
							<label class="rfd-product" data-name="<?php echo esc_attr( strtolower( get_the_title( $p ) ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $n ); ?>[products][]" value="<?php echo esc_attr( $p->ID ); ?>" <?php checked( in_array( (int) $p->ID, $picked, true ) ); ?>><?php echo get_the_post_thumbnail( $p->ID, array( 40, 40 ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><span><?php echo esc_html( get_the_title( $p ) ); ?></span></label>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
		</div>
	</div>
	<?php
}

function rfaheya_discounts_page() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	$products = rfaheya_one_language( get_posts( array( 'post_type' => 'product', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) ) );
	$sizes    = rfaheya_all_sizes();
	$rules    = rfaheya_discount_rules();
	$saved    = isset( $_GET['saved'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	?>
	<div class="wrap rfs rfd">
		<header class="rfs-hero">
			<div>
				<p class="rfs-eyebrow">Rfaheya · Products</p>
				<h1>Discount rules</h1>
				<p>Take a percent or an amount off chosen products and sizes. Each rule works on its own: the store shows the new price with the old one struck through, and the cart and checkout charge it. When two rules fit the same bottle, the bigger discount wins.</p>
			</div>
		</header>
		<?php if ( $saved ) : ?>
			<div class="rfs-toast" role="status"><span class="dashicons dashicons-yes-alt"></span> Saved — the new prices are live on the store.</div>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="rfs-form rfd-form">
			<input type="hidden" name="action" value="rfaheya_save_discounts">
			<?php wp_nonce_field( 'rfaheya_save_discounts' ); ?>
			<div class="rfd-rules">
				<?php
				foreach ( $rules as $i => $rule ) {
					rfaheya_discount_card( $i, $rule, $products, $sizes );
				}
				?>
			</div>
			<p class="rfd-empty" <?php echo $rules ? 'hidden' : ''; ?>>No rules yet. Add your first one.</p>
			<button type="button" class="rfs-btn rfs-btn-ghost rfd-add"><span class="dashicons dashicons-plus-alt2"></span> Add a rule</button>
			<template id="rfd-template"><?php rfaheya_discount_card( '__i__', array(), $products, $sizes ); ?></template>
			<div class="rfs-savebar">
				<span>Prices change on the store as soon as you save.</span>
				<button type="submit" class="rfs-btn">Save rules</button>
			</div>
		</form>
	</div>
	<?php
}

/* -------------------------------------------------------------------------
 * Search engines: each storefront page's title, description, sharing picture and
 * structured data in the page itself; robots.txt and a sitemap of the storefront.
 * ------------------------------------------------------------------------- */

/** Plain text, one line, at most $max characters (cut at a word). */
function rfaheya_seo_text( $html, $max = 160 ) {
	$text = trim( preg_replace( '/\s+/u', ' ', html_entity_decode( wp_strip_all_tags( (string) $html ), ENT_QUOTES, 'UTF-8' ) ) );
	if ( function_exists( 'mb_strlen' ) && mb_strlen( $text ) > $max ) {
		$cut  = mb_substr( $text, 0, $max - 1 );
		$text = preg_replace( '/\s+\S*$/u', '', $cut ) . '…';
	}
	return $text;
}

/** Storefront paths that are only for one visitor: not in search results. */
function rfaheya_seo_private( $path ) {
	return (bool) preg_match( '#^/(account|checkout|cart|wishlist|track-order)(/|$)#', $path );
}

/** Title, description, picture and structured data for a storefront path. */
function rfaheya_seo_for( $path, $data ) {
	$site  = 'Rfaheya';
	$home  = home_url( '/' );
	$desc  = 'Rfaheya — inspired fragrances crafted with quality materials and high concentration. Try any scent in a small size first, delivered across Egypt.';
	$logo  = rfaheya_logo_url();
	$out   = array(
		'title'       => 'Rfaheya — Speak Your Scent',
		'description' => $desc,
		'image'       => $logo,
		'type'        => 'website',
		'noindex'     => rfaheya_seo_private( $path ),
		'jsonld'      => array(),
	);
	$crumbs = array( array( 'Home', $home ) );
	$static = array(
		'/shop'         => array( 'Shop all fragrances', 'Every Rfaheya fragrance — inspired scents for men, women and everyone, in full bottles and small sizes to try first.' ),
		'/collections'  => array( 'Collections', 'Rfaheya collections: discovery sets, gift boxes and fragrances grouped by mood and family.' ),
		'/finder'       => array( 'Rfaheya Finder — find your scent', 'Answer a few questions and find the Rfaheya fragrance that feels like you.' ),
		'/reviews'      => array( 'Customer reviews', 'What Rfaheya customers say about their fragrances.' ),
		'/about'        => array( 'About Rfaheya', $desc ),
		'/contact'      => array( 'Contact us', 'Questions about a fragrance or an order? Reach Rfaheya on WhatsApp, by phone or by email.' ),
		'/faqs'         => array( 'Frequently asked questions', 'Delivery, returns, sizes and how Rfaheya fragrances are made.' ),
		'/our-standard' => array( 'The Rfaheya Standard', 'How every Rfaheya fragrance is measured on skin: character, comfort, density, projection, longevity and evolution.' ),
		'/journal'      => array( 'Journal', 'Stories, guides and notes from the Rfaheya fragrance lab.' ),
	);
	$path = '/' === $path ? '/' : rtrim( $path, '/' );

	if ( '/' === $path ) {
		$out['jsonld'][] = array(
			'@context' => 'https://schema.org',
			'@type'    => 'Organization',
			'name'     => $site,
			'url'      => $home,
			'logo'     => $logo ? $logo : null,
			'sameAs'   => array_values( array_filter( rfaheya_options()['social'] ) ),
		);
		$out['jsonld'][] = array(
			'@context' => 'https://schema.org',
			'@type'    => 'WebSite',
			'name'     => $site,
			'url'      => $home,
		);
		return $out;
	}
	if ( isset( $static[ $path ] ) ) {
		$out['title']       = $static[ $path ][0] . ' — ' . $site;
		$out['description'] = $static[ $path ][1];
		$crumbs[]           = array( $static[ $path ][0], home_url( $path ) );
	} elseif ( preg_match( '#^/(?:product|shop)/([^/]+)$#', $path, $m ) ) {
		$slug    = sanitize_title( rawurldecode( $m[1] ) );
		$product = null;
		foreach ( isset( $data['products'] ) ? $data['products'] : array() as $p ) {
			if ( isset( $p['slug'] ) && $p['slug'] === $slug ) {
				$product = $p;
				break;
			}
		}
		if ( $product ) {
			$short  = rfaheya_seo_text( $product['short_description'] ?? '', 80 );
			$about  = rfaheya_seo_text( ( $product['short_description'] ?? '' ) . ' ' . ( $product['description'] ?? '' ), 158 );
			$image  = $product['images'][0]['src'] ?? '';
			$prices = $product['prices'] ?? array();
			$unit   = (int) ( $prices['currency_minor_unit'] ?? 0 );
			$money  = fn( $v ) => round( (float) $v / pow( 10, $unit ), 2 );
			$low    = $money( $prices['price_range']['min_amount'] ?? ( $prices['price'] ?? 0 ) );
			$high   = $money( $prices['price_range']['max_amount'] ?? ( $prices['price'] ?? 0 ) );
			$url    = home_url( '/product/' . $slug );
			$out['title']       = $product['name'] . ( $short ? ' — ' . $short : '' ) . ' | ' . $site;
			$out['description'] = $about ? $about : $desc;
			$out['image']       = $image ? $image : $out['image'];
			$out['type']        = 'product';
			$out['preload']     = $product['images'][0] ?? null; // the gallery's first picture
			$crumbs[]           = array( 'Shop', home_url( '/shop' ) );
			$crumbs[]           = array( $product['name'], $url );
			$item = array(
				'@context'    => 'https://schema.org',
				'@type'       => 'Product',
				'name'        => $product['name'],
				'description' => $about,
				'image'       => array_values( array_filter( array_map( fn( $i ) => $i['src'] ?? '', array_slice( $product['images'] ?? array(), 0, 4 ) ) ) ),
				'brand'       => array( '@type' => 'Brand', 'name' => $site ),
				'url'         => $url,
				'sku'         => (string) ( $product['id'] ?? '' ),
				'offers'      => array(
					'@type'         => 'AggregateOffer',
					'priceCurrency' => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'EGP',
					'lowPrice'      => $low,
					'highPrice'     => $high,
					'availability'  => ! empty( $product['is_in_stock'] ) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
					'url'           => $url,
				),
			);
			$ratings = array();
			foreach ( isset( $data['reviews'] ) ? $data['reviews'] : array() as $r ) {
				if ( (int) ( $r['product_id'] ?? 0 ) === (int) $product['id'] && ! empty( $r['rating'] ) ) {
					$ratings[] = (float) $r['rating'];
				}
			}
			if ( $ratings ) {
				$item['aggregateRating'] = array(
					'@type'       => 'AggregateRating',
					'ratingValue' => round( array_sum( $ratings ) / count( $ratings ), 1 ),
					'reviewCount' => count( $ratings ),
					'bestRating'  => 5,
				);
			}
			$out['jsonld'][] = $item;
		}
	} elseif ( preg_match( '#^/collections/([^/]+)$#', $path, $m ) ) {
		$name               = ucwords( str_replace( '-', ' ', sanitize_title( $m[1] ) ) );
		$out['title']       = $name . ' — ' . $site;
		$out['description'] = $name . ' by Rfaheya: inspired fragrances, made to be tried and loved.';
		$crumbs[]           = array( 'Collections', home_url( '/collections' ) );
		$crumbs[]           = array( $name, home_url( $path ) );
	} elseif ( preg_match( '#^/journal/([^/]+)$#', $path, $m ) ) {
		$post = get_page_by_path( sanitize_title( $m[1] ), OBJECT, 'post' );
		if ( $post && 'publish' === $post->post_status ) {
			$out['title']       = get_the_title( $post ) . ' — Rfaheya Journal';
			$out['description'] = rfaheya_seo_text( $post->post_excerpt ? $post->post_excerpt : $post->post_content );
			$out['image']       = get_the_post_thumbnail_url( $post, 'large' ) ? get_the_post_thumbnail_url( $post, 'large' ) : $out['image'];
			$out['type']        = 'article';
			$crumbs[]           = array( 'Journal', home_url( '/journal' ) );
			$crumbs[]           = array( get_the_title( $post ), home_url( $path ) );
		}
	} elseif ( preg_match( '#^/([^/]+)$#', $path, $m ) && ! $out['noindex'] ) {
		$page = get_page_by_path( sanitize_title( $m[1] ) );
		if ( $page && 'publish' === $page->post_status ) {
			$out['title']       = get_the_title( $page ) . ' — ' . $site;
			$out['description'] = rfaheya_seo_text( $page->post_excerpt ? $page->post_excerpt : $page->post_content );
			$crumbs[]           = array( get_the_title( $page ), home_url( $path ) );
		}
	}
	if ( count( $crumbs ) > 1 ) {
		$out['jsonld'][] = array(
			'@context'        => 'https://schema.org',
			'@type'           => 'BreadcrumbList',
			'itemListElement' => array_map(
				fn( $c, $i ) => array( '@type' => 'ListItem', 'position' => $i + 1, 'name' => $c[0], 'item' => $c[1] ),
				$crumbs,
				array_keys( $crumbs )
			),
		);
	}
	return $out;
}

/** Puts a page's search and sharing details into the storefront's HTML. */
function rfaheya_seo_apply( $html, $path, $data ) {
	$seo   = rfaheya_seo_for( $path, $data );
	$canon = home_url( '/' === $path ? '/' : rtrim( $path, '/' ) );
	$html  = preg_replace( '#<title>.*?</title>#s', '<title>' . esc_html( $seo['title'] ) . '</title>', $html, 1 );
	$html  = preg_replace( '#<meta name="description" content="[^"]*"\s*/?>#', '<meta name="description" content="' . esc_attr( $seo['description'] ) . '">', $html, 1 );
	$head  = '<link rel="canonical" href="' . esc_url( $canon ) . '">';
	if ( $seo['noindex'] ) {
		$head .= '<meta name="robots" content="noindex, follow">';
	}
	$head .= '<meta property="og:site_name" content="Rfaheya">';
	$head .= '<meta property="og:type" content="' . esc_attr( 'product' === $seo['type'] ? 'product' : ( 'article' === $seo['type'] ? 'article' : 'website' ) ) . '">';
	$head .= '<meta property="og:title" content="' . esc_attr( $seo['title'] ) . '">';
	$head .= '<meta property="og:description" content="' . esc_attr( $seo['description'] ) . '">';
	$head .= '<meta property="og:url" content="' . esc_url( $canon ) . '">';
	if ( $seo['image'] ) {
		$head .= '<meta property="og:image" content="' . esc_url( $seo['image'] ) . '"><meta name="twitter:card" content="summary_large_image">';
	}
	// The product page's main picture starts before the storefront has started.
	if ( ! empty( $seo['preload']['src'] ) ) {
		$head .= '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url( $seo['preload']['src'] ) . '"';
		if ( ! empty( $seo['preload']['srcset'] ) ) {
			$head .= ' imagesrcset="' . esc_attr( $seo['preload']['srcset'] ) . '" imagesizes="(min-width: 1024px) 55vw, 100vw"';
		}
		$head .= '>';
	}
	foreach ( $seo['jsonld'] as $ld ) {
		$head .= '<script type="application/ld+json">' . wp_json_encode( array_filter( $ld, fn( $v ) => null !== $v ), JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>';
	}
	return str_replace( '</head>', $head . '</head>', $html );
}

// robots.txt (routed to WordPress by .htaccess): private pages out, the sitemap in.
add_filter(
	'robots_txt',
	function ( $output, $public ) {
		if ( ! $public ) {
			return $output; // Settings → Reading → "Discourage search engines" is on.
		}
		$lines = array(
			'User-agent: *',
			'Allow: /',
			'Disallow: /wp-admin/',
			'Allow: /wp-admin/admin-ajax.php',
			'Disallow: /account',
			'Disallow: /checkout',
			'Disallow: /cart',
			'Disallow: /wishlist',
			'Disallow: /my-account/',
			'Disallow: /*?add-to-cart=',
			'',
			'Sitemap: ' . home_url( '/sitemap.xml' ),
		);
		return implode( "\n", $lines ) . "\n";
	},
	99,
	2
);

// WordPress's own sitemap lists WordPress addresses, not the storefront's: ours replaces it.
add_filter( 'wp_sitemaps_enabled', '__return_false' );

/** /sitemap.xml: every storefront page search engines should know about. */
function rfaheya_sitemap() {
	list( $data ) = rfaheya_bootstrap_ready();
	$urls = array();
	foreach ( array( '/', '/shop', '/collections', '/collections/discovery-sets', '/collections/gift-boxes', '/finder', '/reviews', '/about', '/contact', '/faqs', '/our-standard', '/journal' ) as $p ) {
		$urls[ home_url( $p ) ] = '';
	}
	foreach ( isset( $data['products'] ) ? $data['products'] : array() as $p ) {
		if ( ! empty( $p['slug'] ) ) {
			$urls[ home_url( '/product/' . $p['slug'] ) ] = '';
		}
	}
	foreach ( get_posts( array( 'post_type' => 'post', 'post_status' => 'publish', 'numberposts' => 200 ) ) as $post ) {
		$urls[ home_url( '/journal/' . $post->post_name ) ] = get_post_modified_time( 'c', true, $post );
	}
	foreach ( get_pages( array( 'post_status' => 'publish' ) ) as $page ) {
		if ( ! rfaheya_seo_private( '/' . $page->post_name ) && ! in_array( $page->post_name, array( 'shop', 'cart', 'checkout', 'my-account' ), true ) ) {
			$urls[ home_url( '/' . $page->post_name ) ] = get_post_modified_time( 'c', true, $page );
		}
	}
	while ( ob_get_level() > 0 ) {
		ob_end_clean();
	}
	header( 'Content-Type: application/xml; charset=utf-8' );
	header( 'Cache-Control: public, max-age=3600' );
	echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
	foreach ( $urls as $loc => $modified ) {
		echo '<url><loc>' . esc_url( $loc ) . '</loc>' . ( $modified ? '<lastmod>' . esc_html( $modified ) . '</lastmod>' : '' ) . "</url>\n";
	}
	echo '</urlset>';
	exit;
}

add_action(
	'wp_loaded',
	function () {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only
		if ( isset( $_GET['rfaheya_sitemap'] ) && ! is_admin() ) {
			rfaheya_sitemap();
		}
	},
	98
);

/* -------------------------------------------------------------------------
 * The dashboard's look (every admin page) and the sign-in page.
 * ------------------------------------------------------------------------- */

function rfaheya_admin_asset_version( $file ) {
	$path = __DIR__ . '/rfaheya-admin/' . $file;
	return file_exists( $path ) ? (string) filemtime( $path ) : '1';
}

add_action(
	'admin_enqueue_scripts',
	function () {
		wp_enqueue_style( 'rfaheya-font', 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap', array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( 'rfaheya-theme', WPMU_PLUGIN_URL . '/rfaheya-admin/theme.css', array(), rfaheya_admin_asset_version( 'theme.css' ) );
	}
);

add_action(
	'login_enqueue_scripts',
	function () {
		wp_enqueue_style( 'rfaheya-font', 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap', array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( 'rfaheya-login', WPMU_PLUGIN_URL . '/rfaheya-admin/login.css', array( 'login' ), rfaheya_admin_asset_version( 'login.css' ) );
		$logo = rfaheya_logo_url();
		if ( ! $logo && file_exists( __DIR__ . '/rfaheya/logo.svg' ) ) {
			$logo = WPMU_PLUGIN_URL . '/rfaheya/logo.svg';
		}
		if ( $logo ) {
			// The built-in logo is dark: shown light on the dark page.
			$own = (bool) rfaheya_options()['home']['logo'];
			wp_add_inline_style( 'rfaheya-login', '.login h1 a{--rf-login-logo:url("' . esc_url( $logo ) . '")' . ( $own ? '' : ';filter:invert(1) brightness(.95)' ) . '}' );
		}
	}
);
add_filter( 'login_headerurl', fn() => home_url( '/' ) );
add_filter( 'login_headertext', fn() => get_bloginfo( 'name' ) );

/* -------------------------------------------------------------------------
 * Minimum order, and a first order's welcome discount with an account made from it.
 * ------------------------------------------------------------------------- */

/** The smallest basket that can be ordered (Settings → Rfaheya Store → Free shipping & offers), 0 for none. */
function rfaheya_order_min() {
	return max( 0, (float) rfaheya_options()['shipping']['order_min'] );
}

// Below the minimum the order can't be placed (the storefront says so first; this is the guard).
add_action(
	'woocommerce_check_cart_items',
	function () {
		$min = rfaheya_order_min();
		if ( $min <= 0 || ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}
		$amount = rfaheya_offer_base( WC()->cart );
		if ( $amount < $min ) {
			wc_add_notice( sprintf( 'The minimum order is %s EGP. Add %s EGP more to order.', number_format( $min ), number_format( ceil( $min - $amount ) ) ), 'error' );
		}
	}
);

/** Whether this guest's email and phone have never ordered and have no account: a first order. */
function rfaheya_is_first_order( $email, $phone = '' ) {
	$email = sanitize_email( (string) $email );
	if ( ! is_email( $email ) || email_exists( $email ) || rfaheya_has_ordered( 0, $email ) ) {
		return false;
	}
	$digits = preg_replace( '/\D/', '', (string) $phone );
	if ( strlen( $digits ) >= 10 ) {
		$statuses = array( 'wc-processing', 'wc-completed', 'wc-on-hold' );
		foreach ( array_unique( array( $phone, $digits, '+2' . $digits ) ) as $p ) {
			if ( wc_get_orders( array( 'billing_phone' => $p, 'status' => $statuses, 'limit' => 1, 'return' => 'ids' ) ) ) {
				return false;
			}
		}
	}
	return true;
}

/** The welcome percent for a guest's first order, 0 when it doesn't apply. */
function rfaheya_guest_welcome_percent() {
	if ( is_user_logged_in() || ! function_exists( 'WC' ) || ! WC()->customer ) {
		return 0;
	}
	$loyalty = rfaheya_loyalty();
	if ( empty( $loyalty['welcome'] ) ) {
		return 0;
	}
	$c = WC()->customer;
	return rfaheya_is_first_order( $c->get_billing_email(), $c->get_billing_phone() ) ? (float) $loyalty['welcomePercent'] : 0;
}

// A guest's first order: the welcome percent off, worked out from the email and phone typed at checkout.
add_action(
	'woocommerce_cart_calculate_fees',
	function ( $cart ) {
		$percent = rfaheya_guest_welcome_percent();
		if ( $percent <= 0 ) {
			return;
		}
		$base = rfaheya_offer_base( $cart ) - rfaheya_offer_discount( rfaheya_offer_base( $cart ) );
		$off  = round( max( 0, $base ) * $percent / 100 );
		if ( $off > 0 ) {
			$cart->add_fee( sprintf( 'First order · %s%% off', rfaheya_number( $percent ) ), -$off, false );
		}
	},
	20
);

/*
 * A guest's order makes their account from the details they typed (name, phone, address),
 * signs them in, and emails a link to choose a password. Next time they just sign in.
 */
add_action(
	'woocommerce_store_api_checkout_order_processed',
	function ( $order ) {
		if ( ! $order instanceof WC_Order || $order->get_customer_id() || is_user_logged_in() ) {
			return;
		}
		$email = sanitize_email( $order->get_billing_email() );
		if ( ! is_email( $email ) || email_exists( $email ) ) {
			return;
		}
		$id = rfaheya_make_customer( $email, wp_generate_password( 24 ), $order->get_billing_first_name(), $order->get_billing_last_name() );
		if ( is_wp_error( $id ) ) {
			return;
		}
		$customer = new WC_Customer( $id );
		foreach ( array( 'first_name', 'last_name', 'phone', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country' ) as $field ) {
			$get = 'get_billing_' . $field;
			$set = 'set_billing_' . $field;
			if ( method_exists( $order, $get ) && method_exists( $customer, $set ) ) {
				$customer->$set( $order->$get() );
			}
			$get = 'get_shipping_' . $field;
			$set = 'set_shipping_' . $field;
			if ( method_exists( $order, $get ) && method_exists( $customer, $set ) ) {
				$customer->$set( $order->$get() );
			}
		}
		$customer->set_billing_email( $email );
		$customer->save();
		update_user_meta( $id, 'rfaheya_whatsapp', $order->get_billing_phone() );
		$order->set_customer_id( $id );
		$order->add_order_note( 'Account made for the customer from this order (first order).' );
		$order->save();
		wc_set_customer_auth_cookie( $id );
		// A link to choose their own password (WooCommerce's "reset password" email).
		$user = get_user_by( 'id', $id );
		if ( $user && function_exists( 'retrieve_password' ) ) {
			retrieve_password( $user->user_login );
		}
	}
);

/* -------------------------------------------------------------------------
 * Security: the whole site (dashboard sign-in included), not only the storefront.
 * ------------------------------------------------------------------------- */

// No theme / plugin file editor in the dashboard: a stolen admin password can't write PHP.
if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
	define( 'DISALLOW_FILE_EDIT', true );
}

/** The visitor's IP address (as the web server saw it; headers a browser can fake are ignored). */
function rfaheya_client_ip() {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '0.0.0.0';
}

/** How many times `$what` happened for `$who` in the current window. */
function rfaheya_limit_count( $what, $who ) {
	return (int) get_transient( 'rf_lim_' . md5( $what . '|' . $who ) );
}

/** Counts one more `$what` for `$who`; the window starts at the first one. */
function rfaheya_limit_hit( $what, $who, $window ) {
	$key  = 'rf_lim_' . md5( $what . '|' . $who );
	$seen = (int) get_transient( $key );
	set_transient( $key, $seen + 1, $window );
	return $seen + 1;
}

function rfaheya_limit_clear( $what, $who ) {
	delete_transient( 'rf_lim_' . md5( $what . '|' . $who ) );
}

/** Stops an account request after `$max` tries in `$window` seconds. */
function rfaheya_rate_limit( $what, $who, $max, $window ) {
	if ( rfaheya_limit_hit( $what, $who, $window ) > $max ) {
		rfaheya_account_fail( 'Too many tries. Please wait a little and try again.' );
	}
}

/*
 * Sign-in lockout, for every way in (the storefront, wp-login.php, the dashboard):
 * 5 wrong passwords for one account, or 20 from one address, lock it for 15 minutes.
 */
add_filter(
	'authenticate',
	function ( $user, $username ) {
		$name = strtolower( trim( (string) $username ) );
		if ( '' === $name ) {
			return $user;
		}
		if ( rfaheya_limit_count( 'login-user', $name ) >= 5 || rfaheya_limit_count( 'login-ip', rfaheya_client_ip() ) >= 20 ) {
			return new WP_Error( 'rfaheya_locked', 'Too many wrong passwords. For your safety, sign-in is paused for 15 minutes.' );
		}
		return $user;
	},
	1,
	2
);

add_action(
	'wp_login_failed',
	function ( $username ) {
		$name = strtolower( trim( (string) $username ) );
		rfaheya_limit_hit( 'login-ip', rfaheya_client_ip(), 15 * MINUTE_IN_SECONDS );
		if ( '' !== $name ) {
			rfaheya_limit_hit( 'login-user', $name, 15 * MINUTE_IN_SECONDS );
			// Signing in by email counts against the account as well.
			$user = is_email( $name ) ? get_user_by( 'email', $name ) : get_user_by( 'login', $name );
			if ( $user && strtolower( $user->user_login ) !== $name ) {
				rfaheya_limit_hit( 'login-user', strtolower( $user->user_login ), 15 * MINUTE_IN_SECONDS );
			}
		}
	}
);

add_action(
	'wp_login',
	function ( $login ) {
		rfaheya_limit_clear( 'login-user', strtolower( (string) $login ) );
	}
);

// wp-login.php doesn't say whether the username or the password was wrong.
add_filter(
	'login_errors',
	function ( $message ) {
		if ( false !== strpos( (string) $message, 'Too many wrong passwords' ) ) {
			return $message;
		}
		return '<strong>Error:</strong> Incorrect username or password.';
	}
);

// The storefront's account requests only from this site (another site can't sign a visitor in or out).
add_action(
	'admin_init',
	function () {
		if ( ! wp_doing_ajax() || 'POST' !== ( isset( $_SERVER['REQUEST_METHOD'] ) ? $_SERVER['REQUEST_METHOD'] : '' ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			return;
		}
		$action = isset( $_REQUEST['action'] ) ? sanitize_key( wp_unslash( $_REQUEST['action'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( 0 !== strpos( $action, 'rfaheya_' ) ) {
			return;
		}
		$from = isset( $_SERVER['HTTP_ORIGIN'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';
		if ( '' === $from && isset( $_SERVER['HTTP_REFERER'] ) ) {
			$from = sanitize_text_field( wp_unslash( $_SERVER['HTTP_REFERER'] ) );
		}
		if ( '' === $from ) {
			return; // Old browsers and privacy tools send neither; the nonces still apply.
		}
		$bare = fn( $h ) => preg_replace( '/^www\./', '', strtolower( (string) $h ) );
		$host = $bare( wp_parse_url( $from, PHP_URL_HOST ) );
		$ours = array_map( $bare, array_filter( array( wp_parse_url( home_url(), PHP_URL_HOST ), wp_parse_url( site_url(), PHP_URL_HOST ), isset( $_SERVER['HTTP_HOST'] ) ? preg_replace( '/:\d+$/', '', sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) ) : '' ) ) );
		if ( '' !== $host && ! in_array( $host, $ours, true ) ) {
			status_header( 403 );
			wp_send_json( array( 'error' => 'This request must come from the store.' ) );
		}
	},
	1
);

// XML-RPC (an old remote API, a favourite of password-guessing bots) is off.
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'xmlrpc_methods', fn() => array() );
add_filter(
	'wp_headers',
	function ( $headers ) {
		unset( $headers['X-Pingback'] );
		return $headers;
	}
);

// Application passwords (sign-in keys for apps) are off: the store doesn't use them.
add_filter( 'wp_is_application_passwords_available', '__return_false' );

// No WordPress version in the page source or feeds.
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );

// Usernames stay private: no user list in the REST API, no ?author= pages, no author sitemap.
add_filter(
	'rest_endpoints',
	function ( $endpoints ) {
		if ( current_user_can( 'list_users' ) ) {
			return $endpoints;
		}
		foreach ( array_keys( $endpoints ) as $route ) {
			if ( 0 === strpos( $route, '/wp/v2/users' ) ) {
				unset( $endpoints[ $route ] );
			}
		}
		return $endpoints;
	}
);
add_filter(
	'wp_sitemaps_add_provider',
	fn( $provider, $name ) => 'users' === $name ? false : $provider,
	10,
	2
);
add_filter(
	'oembed_response_data',
	function ( $data ) {
		unset( $data['author_name'], $data['author_url'] );
		return $data;
	}
);
add_action(
	'template_redirect',
	function () {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check
		if ( ( is_author() || isset( $_GET['author'] ) ) && ! current_user_can( 'list_users' ) ) {
			wp_safe_redirect( home_url( '/' ), 301 );
			exit;
		}
	},
	1
);

/** Safety headers on every page WordPress sends (the storefront pages included). */
function rfaheya_security_headers() {
	if ( headers_sent() ) {
		return;
	}
	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()' );
	header( "Content-Security-Policy: frame-ancestors 'self'; base-uri 'self'; object-src 'none'" );
	if ( is_ssl() ) {
		header( 'Strict-Transport-Security: max-age=31536000' );
	}
}
add_action( 'send_headers', 'rfaheya_security_headers' );
add_action( 'admin_init', 'rfaheya_security_headers' );
add_action( 'login_init', 'rfaheya_security_headers' );
add_filter(
	'rest_post_dispatch',
	function ( $response ) {
		rfaheya_security_headers();
		return $response;
	}
);

/*
 * No PHP runs from the uploads folder (an uploaded file can never become a program),
 * and the folder can't be browsed. Written once into wp-content/uploads/.htaccess.
 */
add_action(
	'admin_init',
	function () {
		if ( get_option( 'rfaheya_uploads_locked' ) === '3' ) {
			return;
		}
		$dir  = wp_get_upload_dir();
		$file = trailingslashit( $dir['basedir'] ) . '.htaccess';
		$rule = "# BEGIN Rfaheya security\n<FilesMatch \"\\.(php[0-9]?|phtml|phar|pl|py|cgi|sh)$\">\n<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n</FilesMatch>\n# END Rfaheya security\n";
		$now  = file_exists( $file ) ? (string) file_get_contents( $file ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		// An earlier version also had "Options -Indexes", which some servers refuse (pictures then fail): replaced.
		$now = (string) preg_replace( '/# BEGIN Rfaheya security.*?# END Rfaheya security\n?/s', '', $now );
		if ( is_dir( $dir['basedir'] ) && wp_is_writable( $dir['basedir'] ) ) {
			file_put_contents( $file, $rule . $now ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		}
		update_option( 'rfaheya_uploads_locked', '3', false );
	}
);

// Comments on posts and pages are off (bots use them for spam); product reviews stay.
add_filter(
	'comments_open',
	fn( $open, $post_id ) => 'product' === get_post_type( $post_id ) ? $open : false,
	10,
	2
);
add_filter( 'pings_open', '__return_false' );
