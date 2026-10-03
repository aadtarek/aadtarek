<?php
/**
 * Plugin Name: Rfaheya Store
 * Description: WordPress side of the headless Rfaheya storefront: store settings (contact, social, home page), FAQs, page section labels, the "Rfaheya details" box on products, starter-content import, and the REST routes the storefront reads.
 * Version:     2.0.0
 *
 * Must-use plugin: lives in wp-content/mu-plugins/ and runs automatically.
 * Starter content (articles, pages, FAQs, images) ships in mu-plugins/rfaheya/.
 */

defined( 'ABSPATH' ) || exit;

const RFAHEYA_OPTION = 'rfaheya_store';

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
		),
	);
}

function rfaheya_group_title( $group ) {
	$titles = array(
		'contact' => 'Contact details',
		'social'  => 'Social links',
		'home'    => 'Home page (empty fields keep the storefront’s built-in text)',
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
				'sanitize_callback' => function ( $input ) {
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
									$value = $value ? (string) absint( $value ) : '';
									break;
								default:
									$value = sanitize_text_field( $value );
							}
							$clean[ $group ][ $key ] = $value;
						}
					}
					return $clean;
				},
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

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'settings_page_rfaheya-store' !== $hook ) {
			return;
		}
		wp_enqueue_media();
		wp_register_script( 'rfaheya-admin', false, array( 'jquery' ), '2.0.0', true );
		wp_enqueue_script( 'rfaheya-admin' );
		wp_add_inline_script(
			'rfaheya-admin',
			"jQuery(function ($) {
				$('.rfaheya-media').on('click', function (e) {
					e.preventDefault();
					var id = $(this).data('target');
					var frame = wp.media({ title: 'Choose image', multiple: false, library: { type: 'image' } });
					frame.on('select', function () {
						var a = frame.state().get('selection').first().toJSON();
						$('#' + id).val(a.id);
						$('#' + id + '-preview').html('<img src=\"' + (a.sizes && a.sizes.medium ? a.sizes.medium.url : a.url) + '\" style=\"max-width:260px;height:auto;border-radius:4px\">');
					});
					frame.open();
				});
				$('.rfaheya-media-clear').on('click', function (e) {
					e.preventDefault();
					var id = $(this).data('target');
					$('#' + id).val('');
					$('#' + id + '-preview').empty();
				});
			});"
		);
	}
);

function rfaheya_settings_page() {
	$options = rfaheya_options();
	$name    = RFAHEYA_OPTION;
	?>
	<div class="wrap">
		<h1>Rfaheya Store</h1>
		<?php if ( isset( $_GET['rfaheya-imported'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended ?>
			<div class="notice notice-success"><p><?php echo esc_html( sanitize_text_field( wp_unslash( $_GET['rfaheya-imported'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended ?></p></div>
		<?php endif; ?>
		<form method="post" action="options.php">
			<?php settings_fields( 'rfaheya_store' ); ?>
			<?php foreach ( rfaheya_fields() as $group => $fields ) : ?>
				<h2><?php echo esc_html( rfaheya_group_title( $group ) ); ?></h2>
				<table class="form-table" role="presentation">
					<?php
					foreach ( $fields as $key => $field ) :
						$id    = "rfaheya-$group-$key";
						$input = "{$name}[$group][$key]";
						$value = $options[ $group ][ $key ];
						?>
						<tr>
							<th scope="row"><label for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $field[0] ); ?></label></th>
							<td>
								<?php if ( 'textarea' === $field[2] ) : ?>
									<textarea id="<?php echo esc_attr( $id ); ?>" class="large-text" rows="3" name="<?php echo esc_attr( $input ); ?>"><?php echo esc_textarea( $value ); ?></textarea>
								<?php elseif ( 'image' === $field[2] ) : ?>
									<input id="<?php echo esc_attr( $id ); ?>" type="hidden" name="<?php echo esc_attr( $input ); ?>" value="<?php echo esc_attr( $value ); ?>">
									<div id="<?php echo esc_attr( $id ); ?>-preview" style="margin-bottom:8px"><?php echo $value ? wp_get_attachment_image( (int) $value, 'medium', false, array( 'style' => 'max-width:260px;height:auto;border-radius:4px' ) ) : ''; ?></div>
									<button type="button" class="button rfaheya-media" data-target="<?php echo esc_attr( $id ); ?>">Choose image</button>
									<button type="button" class="button-link rfaheya-media-clear" data-target="<?php echo esc_attr( $id ); ?>" style="margin-left:8px">Remove</button>
								<?php else : ?>
									<input id="<?php echo esc_attr( $id ); ?>" class="regular-text" type="<?php echo 'url' === $field[2] ? 'url' : 'text'; ?>" name="<?php echo esc_attr( $input ); ?>" value="<?php echo esc_attr( $value ); ?>">
								<?php endif; ?>
							</td>
						</tr>
					<?php endforeach; ?>
				</table>
			<?php endforeach; ?>
			<?php submit_button(); ?>
		</form>

		<hr>
		<h2>Starter content</h2>
		<p>Copies the storefront’s built-in content into WordPress so you can edit it here: journal articles (Posts), information pages (Pages), FAQs, home page texts and images (Media), and fragrance family images (Products → Categories). It also fills the “Rfaheya details” box of each product from its attributes.<br>Anything that already exists is left untouched, so it is safe to run again. The default “Hello world!” post and “Sample Page” are moved to the trash.</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="rfaheya_import">
			<?php wp_nonce_field( 'rfaheya_import' ); ?>
			<?php submit_button( 'Import starter content', 'secondary', 'submit', false ); ?>
		</form>
	</div>
	<?php
}

// ==================================================================== FAQs

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
			'standard' => 'Standard',
			'extended' => 'Extended',
			'eternal'  => 'Eternal',
		),
	);
}

function rfaheya_details( $product_id ) {
	$d = get_post_meta( $product_id, '_rfaheya_details', true );
	return is_array( $d ) ? $d : array();
}

/** "a, b , c" or "a\nb" -> ['a', 'b', 'c'] */
function rfaheya_list( $text ) {
	return array_values( array_filter( array_map( 'trim', preg_split( '/[,\n]+/', (string) $text ) ) ) );
}

add_action(
	'add_meta_boxes_product',
	function () {
		add_meta_box( 'rfaheya_details', 'Rfaheya details', 'rfaheya_details_box', 'product', 'normal', 'high' );
	}
);

function rfaheya_details_box( $post ) {
	wp_nonce_field( 'rfaheya_details', 'rfaheya_details_nonce' );
	$d       = rfaheya_details( $post->ID );
	$choices = rfaheya_choices();
	$val     = function ( $key ) use ( $d ) {
		return isset( $d[ $key ] ) ? $d[ $key ] : '';
	};
	$text_row = function ( $key, $label, $help, $list = false ) use ( $val ) {
		$value = $val( $key );
		$value = is_array( $value ) ? implode( ', ', $value ) : $value;
		echo '<tr><th scope="row"><label for="rfaheya-' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label></th><td>';
		echo '<input id="rfaheya-' . esc_attr( $key ) . '" name="rfaheya[' . esc_attr( $key ) . ']" class="large-text" value="' . esc_attr( $value ) . '">';
		echo '<p class="description">' . esc_html( $help ) . '</p></td></tr>';
	};
	$select_row = function ( $key, $label ) use ( $val, $choices ) {
		echo '<tr><th scope="row"><label for="rfaheya-' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label></th><td><select id="rfaheya-' . esc_attr( $key ) . '" name="rfaheya[' . esc_attr( $key ) . ']"><option value="">— from attributes —</option>';
		foreach ( $choices[ $key ] as $k => $l ) {
			echo '<option value="' . esc_attr( $k ) . '"' . selected( $val( $key ), $k, false ) . '>' . esc_html( $l ) . '</option>';
		}
		echo '</select></td></tr>';
	};
	$checks_row = function ( $key, $label ) use ( $val, $choices ) {
		$current = (array) $val( $key );
		echo '<tr><th scope="row">' . esc_html( $label ) . '</th><td><fieldset>';
		foreach ( $choices[ $key ] as $k => $l ) {
			echo '<label style="margin-right:16px;display:inline-block"><input type="checkbox" name="rfaheya[' . esc_attr( $key ) . '][]" value="' . esc_attr( $k ) . '"' . checked( in_array( $k, $current, true ), true, false ) . '> ' . esc_html( $l ) . '</label>';
		}
		echo '</fieldset></td></tr>';
	};

	echo '<p>What the storefront shows for this fragrance. Empty fields fall back to the product attributes. The tagline is the product’s <em>Short description</em>; sizes and prices are the variations.</p>';
	echo '<table class="form-table" role="presentation">';
	$text_row( 'inspired_by', 'Inspired by', 'The scent it is inspired by, e.g. “Tobacco Vanille”.' );
	$text_row( 'accords', 'Main accords', 'Comma separated, e.g. Sweet, Oud, Amber. Shown as chips and used by Search and the Shop filters.' );
	$text_row( 'notes', 'Notes', 'Comma separated, e.g. Vanilla, Oud, Amber, Tonka Bean. Shown with their illustrations.' );
	$select_row( 'gender', 'For' );
	$checks_row( 'occasions', 'Occasions' );
	$checks_row( 'seasons', 'Seasons' );
	$select_row( 'presence', 'Presence' );
	$select_row( 'longevity', 'Longevity' );
	echo '</table><p class="description">For, Occasions, Seasons, Presence and Longevity drive the Rfaheya Finder’s recommendations.</p>';
}

/** Cleans the posted details box values. */
function rfaheya_clean_details( $input ) {
	$choices = rfaheya_choices();
	$input   = is_array( $input ) ? $input : array();
	$out     = array(
		'inspired_by' => sanitize_text_field( isset( $input['inspired_by'] ) ? $input['inspired_by'] : '' ),
		'accords'     => array_map( 'sanitize_text_field', rfaheya_list( isset( $input['accords'] ) ? $input['accords'] : '' ) ),
		'notes'       => array_map( 'sanitize_text_field', rfaheya_list( isset( $input['notes'] ) ? $input['notes'] : '' ) ),
	);
	foreach ( array( 'gender', 'presence', 'longevity' ) as $key ) {
		$v           = isset( $input[ $key ] ) ? (string) $input[ $key ] : '';
		$out[ $key ] = isset( $choices[ $key ][ $v ] ) ? $v : '';
	}
	foreach ( array( 'occasions', 'seasons' ) as $key ) {
		$out[ $key ] = array_values( array_intersect( array_keys( $choices[ $key ] ), isset( $input[ $key ] ) ? (array) $input[ $key ] : array() ) );
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
	}
);

// ==================================================================== REST

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
				'callback'            => function () {
					$o    = rfaheya_options();
					$h    = $o['home'];
					$home = array(
						'announcements' => array_values( array_filter( array( $h['announcement_1'], $h['announcement_2'], $h['announcement_3'] ) ) ),
						'hero'          => array(
							'eyebrow' => $h['hero_eyebrow'],
							'title'   => $h['hero_title'],
							'text'    => $h['hero_text'],
							'image'   => $h['hero_image'] ? (string) wp_get_attachment_image_url( (int) $h['hero_image'], 'full' ) : '',
						),
					);
					return rest_ensure_response(
						array(
							'contact'      => $o['contact'],
							'social'       => $o['social'],
							'home'         => $home,
							'myAccountUrl' => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ),
							'currency'     => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'EGP',
						)
					);
				},
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/faqs',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => function () {
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
					return rest_ensure_response(
						array_map(
							function ( $p ) {
								return array(
									'q' => get_the_title( $p ),
									'a' => apply_filters( 'the_content', $p->post_content ),
								);
							},
							$posts
						)
					);
				},
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/pages',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => function () {
					$pages = get_pages( array( 'post_status' => 'publish' ) );
					return rest_ensure_response(
						array_values(
							array_map(
								function ( $p ) {
									return array(
										'slug'    => $p->post_name,
										'title'   => get_the_title( $p ),
										'eyebrow' => (string) get_post_meta( $p->ID, 'rfaheya_eyebrow', true ),
									);
								},
								$pages
							)
						)
					);
				},
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/products',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => function () {
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
						$out[ (string) $id ] = rfaheya_details( $id );
					}
					return rest_ensure_response( (object) $out );
				},
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

	// WordPress's sample content would otherwise show up in the journal.
	foreach ( array( array( 'hello-world', 'post' ), array( 'sample-page', 'page' ) ) as $sample ) {
		$post = get_page_by_path( $sample[0], OBJECT, $sample[1] );
		if ( $post ) {
			wp_trash_post( $post->ID );
		}
	}

	return sprintf(
		'Imported %d articles, %d pages, %d FAQs, %d family images and %d product detail boxes. Existing content was left as is.',
		$count['posts'],
		$count['pages'],
		$count['faqs'],
		$count['families'],
		$count['products']
	);
}

// ==================================================================== WooCommerce

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
