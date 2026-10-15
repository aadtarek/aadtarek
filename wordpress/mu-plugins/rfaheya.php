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
	);
}

function rfaheya_group_title( $group ) {
	$titles = array(
		'contact' => 'Contact details',
		'social'  => 'Social links',
		'home'    => 'Home page (empty fields keep the storefront’s built-in text)',
		'bundle'  => 'Bundle (home page “Build your trio”; the discount is applied in the cart)',
		'login'   => 'Sign in with Google / Facebook (the buttons show once the keys are filled in)',
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
				<?php if ( 'login' === $group ) : ?>
					<p>Google: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud → Credentials</a> → OAuth client ID (Web application). Authorized redirect URI:<br><code><?php echo esc_html( rfaheya_oauth_redirect_uri( 'google' ) ); ?></code></p>
					<p>Facebook: <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener">Meta for Developers</a> → your app → Facebook Login → Valid OAuth Redirect URIs:<br><code><?php echo esc_html( rfaheya_oauth_redirect_uri( 'facebook' ) ); ?></code></p>
				<?php endif; ?>
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
								<?php elseif ( 'yesno' === $field[2] ) : ?>
									<select id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( $input ); ?>">
										<option value="yes" <?php selected( $value, 'yes' ); ?>>Yes</option>
										<option value="no" <?php selected( $value, 'no' ); ?>>No</option>
									</select>
								<?php elseif ( 'image' === $field[2] ) : ?>
									<input id="<?php echo esc_attr( $id ); ?>" type="hidden" name="<?php echo esc_attr( $input ); ?>" value="<?php echo esc_attr( $value ); ?>">
									<div id="<?php echo esc_attr( $id ); ?>-preview" style="margin-bottom:8px"><?php echo $value ? wp_get_attachment_image( (int) $value, 'medium', false, array( 'style' => 'max-width:260px;height:auto;border-radius:4px' ) ) : ''; ?></div>
									<button type="button" class="button rfaheya-media" data-target="<?php echo esc_attr( $id ); ?>">Choose image</button>
									<button type="button" class="button-link rfaheya-media-clear" data-target="<?php echo esc_attr( $id ); ?>" style="margin-left:8px">Remove</button>
								<?php else : ?>
									<input id="<?php echo esc_attr( $id ); ?>" class="regular-text" autocomplete="off" type="<?php echo 'url' === $field[2] ? 'url' : ( 'secret' === $field[2] ? 'password' : 'text' ); ?>" name="<?php echo esc_attr( $input ); ?>" value="<?php echo esc_attr( $value ); ?>">
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
			'standard' => 'Standard',
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
			: wp_get_attachment_image( $attachment_id, 'medium' );
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
	$id = (int) get_term_meta( $term_id, 'rfaheya_icon', true );
	return $id ? (string) wp_get_attachment_image_url( $id, 'medium' ) : '';
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
		echo '<p>A transparent PNG works best (about 200 × 200).</p></div>';
	}
);
add_action(
	'rfaheya_note_edit_form_fields',
	function ( $term ) {
		echo '<tr class="form-field"><th scope="row"><label>Icon</label></th><td>';
		rfaheya_media_field( 'rfaheya-note-icon', 'rfaheya_icon', get_term_meta( $term->term_id, 'rfaheya_icon', true ) );
		echo '<p class="description">A transparent PNG works best (about 200 × 200).</p></td></tr>';
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
	$home = array(
		'announcements' => array_values( array_filter( array( $h['announcement_1'], $h['announcement_2'], $h['announcement_3'] ) ) ),
		'hero'          => array(
			'eyebrow' => $h['hero_eyebrow'],
			'title'   => $h['hero_title'],
			'text'    => $h['hero_text'],
			'image'   => $h['hero_image'] ? (string) wp_get_attachment_image_url( (int) $h['hero_image'], 'full' ) : '',
		'srcset'  => $h['hero_image'] ? (string) wp_get_attachment_image_srcset( (int) $h['hero_image'], 'full' ) : '',
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
			$d['dna_image_url'] = (string) wp_get_attachment_image_url( (int) $d['dna_image'], 'medium' );
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
	// WooCommerce's Store API expects the cart to be loaded (outside REST requests it may not be yet).
	if ( function_exists( 'WC' ) && function_exists( 'wc_load_cart' ) && null === WC()->cart && did_action( 'woocommerce_init' ) ) {
		wc_load_cart();
	}
	try {
		$request = new WP_REST_Request( 'GET', $route );
		$request->set_query_params( $params );
		$response = rest_do_request( $request );
		return $response->is_error() ? array() : rest_get_server()->response_to_data( $response, false );
	} catch ( Throwable $e ) {
		// Without it the storefront loads the same data with its own requests.
		error_log( 'Rfaheya: ' . $route . ' failed: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' ' . $route . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
		return array();
	}
}

/**
 * Everything the storefront loads at start-up in ONE request: settings,
 * product details, notes, videos, categories, products with their
 * variations, and reviews. Cached for a minute.
 */
function rfaheya_bootstrap() {
	$cached = get_transient( 'rfaheya_bootstrap' );
	if ( is_array( $cached ) ) {
		return $cached;
	}
	if ( get_transient( 'rfaheya_bootstrap_failed' ) ) {
		return array( 'products' => array() );
	}
	$products   = rfaheya_store_data( '/wc/store/v1/products', array( 'per_page' => 100, 'orderby' => 'popularity', 'order' => 'desc' ) );
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
	$data = array(
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
		'reviews'    => rfaheya_store_data( '/wc/store/v1/products/reviews', array( 'per_page' => 50, 'orderby' => 'date_gmt', 'order' => 'desc' ) ),
		'faqs'       => rfaheya_faqs_data(),
	);
	// Rebuilt whenever products, stock, settings or content change (hooks below), so it can be kept a while.
	if ( ! empty( $data['products'] ) ) {
		set_transient( 'rfaheya_bootstrap', $data, HOUR_IN_SECONDS );
	} else {
		// The storefront loads its data with separate requests then; don't rebuild on every visit.
		set_transient( 'rfaheya_bootstrap_failed', 1, 10 * MINUTE_IN_SECONDS );
	}
	return $data;
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
	$data = get_transient( 'rfaheya_bootstrap' );
	$data = is_array( $data ) && ! empty( $data['products'] ) ? $data : null;
	// A new upload: pages cached by LiteSpeed still point at the old files.
	$build = (string) filemtime( $file );
	$fresh = get_option( 'rfaheya_index_build' ) !== $build;
	if ( $fresh ) {
		update_option( 'rfaheya_index_build', $build, false );
		rfaheya_purge_page_cache();
	}
	if ( $data ) {
		$html = str_replace( '<head>', '<head><script>window.__rfBoot=Promise.resolve(' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ) . ')</script>', $html );
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
	if ( $data && ! $fresh ) {
		// The same page for every visitor; LiteSpeed keeps it until products, stock,
		// settings or content change (rfaheya_purge_page_cache).
		header( 'Cache-Control: public, max-age=0, s-maxage=3600' );
		header( 'X-LiteSpeed-Cache-Control: public,max-age=3600' );
		header( 'X-LiteSpeed-Tag: rfaheya_page' );
	} else {
		header( 'Cache-Control: no-cache' );
		header( 'X-LiteSpeed-Cache-Control: no-cache' );
	}
	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- the storefront's own index.html plus escaped data
	// No shop data in the page yet: build it after the page has been sent, for the next visitors.
	if ( ! $data && ( function_exists( 'litespeed_finish_request' ) || function_exists( 'fastcgi_finish_request' ) ) && ! get_transient( 'rfaheya_bootstrap_building' ) ) {
		set_transient( 'rfaheya_bootstrap_building', 1, MINUTE_IN_SECONDS );
		function_exists( 'litespeed_finish_request' ) ? litespeed_finish_request() : fastcgi_finish_request();
		try {
			rfaheya_bootstrap();
		} catch ( Throwable $e ) {
			update_option( 'rfaheya_last_error', gmdate( 'Y-m-d H:i' ) . ' build: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), false );
		}
		delete_transient( 'rfaheya_bootstrap_building' );
	}
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
foreach ( array( 'save_post', 'deleted_post', 'edited_term', 'created_term', 'delete_term', 'update_option_' . RFAHEYA_OPTION, 'woocommerce_product_set_stock', 'woocommerce_variation_set_stock', 'comment_post' ) as $rfaheya_hook ) {
	add_action(
		$rfaheya_hook,
		function () {
			delete_transient( 'rfaheya_bootstrap' );
			delete_transient( 'rfaheya_bootstrap_failed' );
			rfaheya_purge_page_cache();
		}
	);
}

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
				'callback'            => fn() => rest_ensure_response( rfaheya_products_details() ),
			)
		);

		register_rest_route(
			'rfaheya/v1',
			'/bootstrap',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => function () {
					$response = rest_ensure_response( rfaheya_bootstrap() );
					$response->header( 'Cache-Control', 'public, max-age=60' );
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
		$logo = file_exists( __DIR__ . '/rfaheya/logo.svg' ) ? WPMU_PLUGIN_URL . '/rfaheya/logo.svg' : '';
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
<link rel="icon" type="image/svg+xml" href="<?php echo esc_url( $home . 'favicon.svg' ); ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Playfair+Display:wght@400;500&display=swap">
<?php wp_head(); ?>
<style>
body.rfaheya-account { margin: 0; background: #f6f1eb; color: #18140b; font-family: "DM Sans", system-ui, sans-serif; font-size: 16px; line-height: 1.6; }
.rf-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px clamp(16px, 5vw, 78px); background: #f9f6f1; border-bottom: 1px solid #e6e1d8; }
.rf-logo img { display: block; height: 40px; width: auto; }
.rf-logo span { font-family: "Playfair Display", serif; font-size: 28px; letter-spacing: .04em; color: #18140b; }
.rf-nav { display: flex; flex-wrap: wrap; gap: 8px 28px; }
.rf-nav a { color: #18140b; text-decoration: none; font-size: 12px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; }
.rf-nav a:hover { color: #2a2f1b; text-decoration: underline; text-underline-offset: 4px; }
.rf-main { max-width: 1100px; margin: 0 auto; padding: 48px 16px 96px; }
.rf-eyebrow { margin: 0; font-size: 13px; letter-spacing: .3em; text-transform: uppercase; color: #3d3a33; }
.rf-title { font-family: "Playfair Display", serif; font-weight: 400; font-size: clamp(38px, 6vw, 56px); line-height: 1.05; margin: 8px 0 36px; }
.rfaheya-account .woocommerce { font-size: 16px; }
.rfaheya-account .woocommerce a { color: #18140b; text-underline-offset: 4px; }
.rfaheya-account .woocommerce h2, .rfaheya-account .woocommerce h3 { font-family: "Playfair Display", serif; font-weight: 400; }
.rfaheya-account .woocommerce .button, .rfaheya-account .woocommerce button.button, .rfaheya-account .woocommerce input.button { background: #2a2f1b; color: #f9f6f1; border: 0; border-radius: 3px; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; font-weight: 500; padding: 15px 26px; cursor: pointer; }
.rfaheya-account .woocommerce .button:hover, .rfaheya-account .woocommerce button.button:hover { background: #3a412a; color: #f9f6f1; }
.rfaheya-account .woocommerce input.input-text, .rfaheya-account .woocommerce select, .rfaheya-account .woocommerce textarea { width: 100%; box-sizing: border-box; padding: 13px 14px; border: 1px solid #c9c3b8; border-radius: 3px; background: #fcf8f2; font: inherit; }
.rfaheya-account .woocommerce form .form-row { margin: 0 0 16px; }
.rfaheya-account .woocommerce form .form-row label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; }
.rfaheya-account .woocommerce form.login, .rfaheya-account .woocommerce form.register { border: 1px solid #e6e1d8; border-radius: 8px; padding: 28px; background: #fcf8f2; }
.rfaheya-account .woocommerce .u-columns { display: grid; gap: 32px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.rfaheya-account .woocommerce .u-columns .col-1, .rfaheya-account .woocommerce .u-columns .col-2 { width: auto; float: none; }
.rfaheya-account .woocommerce-MyAccount-navigation ul { list-style: none; margin: 0; padding: 0; border-top: 1px solid #e6e1d8; }
.rfaheya-account .woocommerce-MyAccount-navigation li { border-bottom: 1px solid #e6e1d8; }
.rfaheya-account .woocommerce-MyAccount-navigation li a { display: block; padding: 13px 0; text-decoration: none; font-size: 14px; letter-spacing: .06em; text-transform: uppercase; }
.rfaheya-account .woocommerce-MyAccount-navigation li.is-active a { font-weight: 600; color: #2a2f1b; }
.rfaheya-account .woocommerce table.shop_table { width: 100%; border-collapse: collapse; background: #fcf8f2; border: 1px solid #e6e1d8; border-radius: 8px; }
.rfaheya-account .woocommerce table.shop_table th, .rfaheya-account .woocommerce table.shop_table td { padding: 12px 14px; border-bottom: 1px solid #e6e1d8; text-align: left; }
.rfaheya-account .woocommerce-message, .rfaheya-account .woocommerce-info, .rfaheya-account .woocommerce-error { list-style: none; margin: 0 0 24px; padding: 14px 18px; border-radius: 6px; background: #f0ebe2; border: 0; }
.rfaheya-account .woocommerce-error { background: #f6e3df; }
@media (min-width: 768px) { .rfaheya-account .woocommerce-MyAccount-navigation { float: left; width: 24%; } .rfaheya-account .woocommerce-MyAccount-content { float: right; width: 70%; } }
.rf-foot a { color: #18140b; text-underline-offset: 4px; }
.rf-auth { display: grid; gap: 32px; align-items: stretch; max-width: 1040px; margin: 0 auto; }
@media (min-width: 900px) { .rf-auth { grid-template-columns: 1fr 460px; } }
.rf-auth-art { display: none; border-radius: 14px; background-size: cover; background-position: 70% center; min-height: 560px; position: relative; overflow: hidden; }
.rf-auth-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 50%, rgba(24,20,11,.55)); }
.rf-auth-art p { position: absolute; left: 32px; bottom: 26px; z-index: 1; margin: 0; color: #f9f6f1; font-family: "Playfair Display", serif; font-size: 38px; line-height: 1.05; }
@media (min-width: 900px) { .rf-auth-art { display: block; } }
.rf-auth-card { background: #fcf8f2; border: 1px solid #e6e1d8; border-radius: 14px; padding: 28px clamp(20px, 4vw, 40px) 32px; box-shadow: 0 20px 50px -30px rgba(40,30,20,.35); }
.rf-tabs { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 999px; background: #f0ebe2; }
.rf-tabs a { text-align: center; padding: 10px 8px; border-radius: 999px; font-size: 13px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: #3d3a33; text-decoration: none; }
.rf-tabs a[aria-selected="true"] { background: #2a2f1b; color: #f9f6f1; }
.rf-auth-title { font-family: "Playfair Display", serif; font-weight: 400; font-size: 34px; line-height: 1.1; margin: 26px 0 6px; }
.rf-auth-sub { margin: 0 0 22px; color: #6f6a60; font-size: 15px; }
.rf-social { display: grid; gap: 10px; }
.rf-social-btn { display: flex; align-items: center; justify-content: center; gap: 12px; height: 50px; border: 1px solid #c9c3b8; border-radius: 6px; background: #fff; color: #18140b; text-decoration: none; font-size: 15px; font-weight: 500; transition: border-color .15s, box-shadow .15s; }
.rf-social-btn:hover { border-color: #18140b; box-shadow: 0 4px 14px -8px rgba(0,0,0,.3); }
.rf-or { display: flex; align-items: center; gap: 14px; margin: 20px 0; color: #6f6a60; font-size: 13px; text-transform: uppercase; letter-spacing: .14em; }
.rf-or::before, .rf-or::after { content: ""; flex: 1; height: 1px; background: #e6e1d8; }
.rf-form { display: grid; gap: 14px; }
.rf-form label { display: grid; gap: 6px; font-size: 13px; font-weight: 500; color: #3d3a33; }
.rf-form input[type=text], .rf-form input[type=email], .rf-form input[type=tel], .rf-form input[type=password] { height: 50px; box-sizing: border-box; width: 100%; padding: 0 14px; border: 1px solid #c9c3b8; border-radius: 6px; background: #fff; font: inherit; font-size: 15px; color: #18140b; }
.rf-form input:focus { outline: none; border-color: #2a2f1b; box-shadow: 0 0 0 3px rgba(42,47,27,.12); }
.rf-row-between { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 14px; }
.rf-row-between a { color: #18140b; text-underline-offset: 4px; }
.rf-form .rf-check { display: inline-flex; align-items: center; gap: 8px; font-weight: 400; }
.rf-primary { height: 54px; border: 0; border-radius: 6px; background: #2a2f1b; color: #f9f6f1; font: inherit; font-size: 13px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; cursor: pointer; margin-top: 4px; }
.rf-primary:hover { background: #3a412a; }
.rf-switch { margin: 4px 0 0; text-align: center; font-size: 14px; color: #6f6a60; }
.rf-switch a { color: #18140b; font-weight: 500; text-underline-offset: 4px; }
.rf-foot { padding: 28px 16px; text-align: center; font-size: 13px; color: #6f6a60; border-top: 1px solid #e6e1d8; }
</style>
</head>
<body <?php body_class( 'rfaheya-account' ); ?>>
<?php wp_body_open(); ?>
<header class="rf-bar">
	<a class="rf-logo" href="<?php echo esc_url( $home ); ?>">
		<?php if ( $logo ) : ?>
			<img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" width="140" height="44">
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
	</nav>
</header>
<main class="rf-main">
	<?php if ( ! is_user_logged_in() && ! ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'lost-password' ) ) ) : ?>
		<?php rfaheya_auth_page(); ?>
	<?php else : ?>
		<p class="rf-eyebrow">My account</p>
		<?php
		while ( have_posts() ) {
			the_post();
			echo '<h1 class="rf-title">' . esc_html( get_the_title() ) . '</h1>';
			the_content();
		}
		?>
	<?php endif; ?>
</main>
<footer class="rf-foot">&copy; <?php echo esc_html( gmdate( 'Y' ) . ' ' . get_bloginfo( 'name' ) ); ?> · <a href="<?php echo esc_url( $home ); ?>">Back to the store</a></footer>
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
	if ( function_exists( 'wc_add_notice' ) && WC()->session ) {
		wc_add_notice( $message, 'error' );
	}
	wp_safe_redirect( home_url( '/my-account/' ) );
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
		if ( ! $state || get_transient( 'rfaheya_oauth_' . $state ) !== $name ) {
			rfaheya_oauth_fail( 'Sign-in expired. Please try again.' );
		}
		delete_transient( 'rfaheya_oauth_' . $state );
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
			<div class="rf-auth-art" style="background-image:url('<?php echo esc_url( $image ); ?>')"><p>Speak your scent.</p></div>
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
add_action(
	'woocommerce_cart_calculate_fees',
	function ( $cart ) {
		$b     = rfaheya_options()['bundle'];
		$count = (int) $b['count'];
		$price = (float) $b['price'];
		if ( 'no' === $b['enabled'] || $count < 2 || $price <= 0 ) {
			return;
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
		if ( $discount > 0 ) {
			$cart->add_fee( 'Bundle discount', -$discount, false );
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
