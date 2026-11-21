<?php
/**
 * Pages & journal: Arabic versions of pages/posts, About / Workshops / Contact
 * templates, the contact & workshop booking forms, contact details.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;

/* ---------------------------------------------------------------------------
 * Arabic title / content / excerpt for pages and posts
 * ------------------------------------------------------------------------- */

add_action(
	'add_meta_boxes',
	function () {
		foreach ( array( 'page', 'post' ) as $type ) {
			add_meta_box( 'ph_ar', __( 'Arabic version', 'potteryhub' ), 'ph_ar_box', $type, 'normal', 'high' );
		}
	}
);

function ph_ar_box( $post ) {
	wp_nonce_field( 'ph_ar_save', 'ph_ar_nonce' );
	echo '<p><label><b>' . esc_html__( 'Arabic title', 'potteryhub' ) . '</b><br><input type="text" dir="rtl" name="ph_title_ar" value="' . esc_attr( get_post_meta( $post->ID, '_ph_title_ar', true ) ) . '" style="width:100%"></label></p>';
	echo '<p><b>' . esc_html__( 'Arabic content', 'potteryhub' ) . '</b></p>';
	wp_editor(
		(string) get_post_meta( $post->ID, '_ph_content_ar', true ),
		'ph_content_ar',
		array(
			'textarea_rows' => 10,
			'media_buttons' => true,
		)
	);
	echo '<p><label><b>' . esc_html__( 'Arabic excerpt (optional)', 'potteryhub' ) . '</b><br><textarea dir="rtl" name="ph_excerpt_ar" rows="2" style="width:100%">' . esc_textarea( get_post_meta( $post->ID, '_ph_excerpt_ar', true ) ) . '</textarea></label></p>';
	echo '<p class="description">' . esc_html__( 'Shown on the Arabic site (/ar/). Leave empty to show the English text.', 'potteryhub' ) . '</p>';
}

add_action(
	'save_post',
	function ( $id ) {
		if ( ! isset( $_POST['ph_ar_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ph_ar_nonce'] ) ), 'ph_ar_save' ) || ! current_user_can( 'edit_post', $id ) || wp_is_post_revision( $id ) ) {
			return;
		}
		update_post_meta( $id, '_ph_title_ar', isset( $_POST['ph_title_ar'] ) ? sanitize_text_field( wp_unslash( $_POST['ph_title_ar'] ) ) : '' );
		update_post_meta( $id, '_ph_content_ar', isset( $_POST['ph_content_ar'] ) ? wp_kses_post( wp_unslash( $_POST['ph_content_ar'] ) ) : '' );
		update_post_meta( $id, '_ph_excerpt_ar', isset( $_POST['ph_excerpt_ar'] ) ? sanitize_textarea_field( wp_unslash( $_POST['ph_excerpt_ar'] ) ) : '' );
	}
);

add_action(
	'init',
	function () {
		if ( ! ph_is_ar() ) {
			return;
		}
		$is_text = fn( $id ) => $id && in_array( get_post_type( $id ), array( 'page', 'post' ), true );
		add_filter(
			'the_title',
			function ( $title, $id = 0 ) use ( $is_text ) {
				if ( $is_text( $id ) ) {
					$ar = get_post_meta( $id, '_ph_title_ar', true );
					return $ar ? $ar : $title;
				}
				return $title;
			},
			15,
			2
		);
		add_filter(
			'the_content',
			function ( $content ) use ( $is_text ) {
				$id = get_the_ID();
				if ( ! $is_text( $id ) || ! in_the_loop() ) {
					return $content;
				}
				$ar = get_post_meta( $id, '_ph_content_ar', true );
				if ( ! $ar ) {
					return $content;
				}
				return $ar; // WordPress formats it next (paragraphs, shortcodes, embeds).
			},
			1
		);
		add_filter(
			'get_the_excerpt',
			function ( $excerpt, $post = null ) use ( $is_text ) {
				$post = get_post( $post );
				if ( ! $post || ! $is_text( $post->ID ) ) {
					return $excerpt;
				}
				$ar = get_post_meta( $post->ID, '_ph_excerpt_ar', true );
				if ( $ar ) {
					return $ar;
				}
				$c = get_post_meta( $post->ID, '_ph_content_ar', true );
				return $c ? wp_trim_words( wp_strip_all_tags( strip_shortcodes( $c ) ), 30 ) : $excerpt;
			},
			15,
			2
		);
		add_filter(
			'document_title_parts',
			function ( $parts ) use ( $is_text ) {
				if ( is_singular() && $is_text( get_queried_object_id() ) ) {
					$ar = get_post_meta( get_queried_object_id(), '_ph_title_ar', true );
					if ( $ar ) {
						$parts['title'] = $ar;
					}
				}
				return $parts;
			}
		);
	}
);

/* ---------------------------------------------------------------------------
 * Contact details (Customizer → Pottery Hub → Contact details)
 * ------------------------------------------------------------------------- */

add_action(
	'customize_register',
	function ( WP_Customize_Manager $wp ) {
		$wp->add_section( 'ph_contact', array( 'title' => __( 'Contact details', 'potteryhub' ), 'panel' => 'ph' ) );
		$fields = array(
			'ph_phone'    => array( __( 'Phone', 'potteryhub' ), 'text' ),
			'ph_whatsapp' => array( __( 'WhatsApp number (with country code, e.g. 201001234567)', 'potteryhub' ), 'text' ),
			'ph_email'    => array( __( 'Email (also receives the forms)', 'potteryhub' ), 'email' ),
			'ph_address'  => array( __( 'Address', 'potteryhub' ), 'textarea' ),
			'ph_address_ar' => array( __( 'Address', 'potteryhub' ) . ' (' . __( 'Arabic', 'potteryhub' ) . ')', 'textarea' ),
			'ph_hours'    => array( __( 'Opening hours', 'potteryhub' ), 'textarea' ),
			'ph_hours_ar' => array( __( 'Opening hours', 'potteryhub' ) . ' (' . __( 'Arabic', 'potteryhub' ) . ')', 'textarea' ),
			'ph_map'      => array( __( 'Google Maps link (optional)', 'potteryhub' ), 'url' ),
		);
		foreach ( $fields as $k => $f ) {
			$san = 'email' === $f[1] ? 'sanitize_email' : ( 'url' === $f[1] ? 'esc_url_raw' : ( 'textarea' === $f[1] ? 'sanitize_textarea_field' : 'sanitize_text_field' ) );
			$wp->add_setting( $k, array( 'default' => '', 'sanitize_callback' => $san ) );
			$wp->add_control( $k, array( 'label' => $f[0], 'section' => 'ph_contact', 'type' => $f[1] ) );
		}
	},
	20
);

/** A contact detail in the current language ('' when not set). */
function ph_contact( $key ) {
	if ( ph_is_ar() && in_array( $key, array( 'ph_address', 'ph_hours' ), true ) ) {
		$ar = get_theme_mod( $key . '_ar', '' );
		if ( '' !== $ar ) {
			return $ar;
		}
	}
	return (string) get_theme_mod( $key, '' );
}

/** wa.me link for the WhatsApp number. */
function ph_whatsapp_url( $text = '' ) {
	$n = preg_replace( '/\D+/', '', ph_contact( 'ph_whatsapp' ) );
	if ( ! $n ) {
		return '';
	}
	return 'https://wa.me/' . $n . ( $text ? '?text=' . rawurlencode( $text ) : '' );
}

/* ---------------------------------------------------------------------------
 * Page templates: helpers
 * ------------------------------------------------------------------------- */

/** URL of the first published page using a template, or ''. */
function ph_template_url( $template ) {
	static $cache = array();
	if ( ! isset( $cache[ $template ] ) ) {
		$ids                = get_posts(
			array(
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'meta_key'       => '_wp_page_template', // phpcs:ignore WordPress.DB.SlowDBQuery
				'meta_value'     => $template, // phpcs:ignore WordPress.DB.SlowDBQuery
				'posts_per_page' => 1,
				'fields'         => 'ids',
			)
		);
		if ( ! $ids && isset( ph_template_slugs()[ $template ] ) ) {
			foreach ( ph_template_slugs()[ $template ] as $slug ) {
				$pg = get_page_by_path( $slug );
				if ( $pg && 'publish' === $pg->post_status ) {
					$ids = array( $pg->ID );
					break;
				}
			}
		}
		$cache[ $template ] = $ids ? get_permalink( $ids[0] ) : '';
	}
	return $cache[ $template ];
}

/** Page slugs that get a template's design even when the template isn't picked in the editor. */
function ph_template_slugs() {
	return array(
		'template-about.php' => array( 'about', 'about-us', 'about-me' ),
	);
}
add_filter(
	'template_include',
	function ( $tpl ) {
		if ( ! is_page() || get_page_template_slug() ) {
			return $tpl;
		}
		$slug = get_post_field( 'post_name', get_queried_object_id() );
		foreach ( ph_template_slugs() as $file => $slugs ) {
			if ( in_array( $slug, $slugs, true ) ) {
				$t = locate_template( $file );
				return $t ? $t : $tpl;
			}
		}
		return $tpl;
	}
);

/** Big page header used by About / Workshops / Contact / Journal. */
function ph_page_hero( $eyebrow, $title, $text = '', $img = '' ) {
	?>
	<section class="phero<?php echo $img ? '' : ' noimg'; ?>">
		<div class="phero-t">
			<?php if ( $eyebrow ) : ?><div class="eyebrow rv"><?php echo esc_html( $eyebrow ); ?></div><?php endif; ?>
			<h1 class="serif rv" style="--d:80ms"><?php echo esc_html( $title ); ?></h1>
			<?php if ( $text ) : ?><p class="rv" style="--d:160ms"><?php echo esc_html( $text ); ?></p><?php endif; ?>
		</div>
		<?php if ( $img ) : ?>
			<div class="phero-i rv" style="--d:120ms"><img src="<?php echo esc_url( $img ); ?>" alt="" data-par=".06"></div>
		<?php endif; ?>
	</section>
	<?php
}

/** Featured image of the current page, or a fallback. */
function ph_page_img( $fallback ) {
	$u = get_the_post_thumbnail_url( null, 'full' );
	return $u ? $u : $fallback;
}

/* ---------------------------------------------------------------------------
 * Forms (contact & workshop booking)
 * ------------------------------------------------------------------------- */

/** Form markup. $type: 'contact' or 'workshop'. */
function ph_form( $type ) {
	$sent = isset( $_GET['ph_sent'] ) ? sanitize_key( wp_unslash( $_GET['ph_sent'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	?>
	<form class="phform rv" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" data-ok="<?php echo esc_attr( 'workshop' === $type ? __( 'Thanks! We’ll call you to confirm your place.', 'potteryhub' ) : __( 'Thanks! We’ll get back to you soon.', 'potteryhub' ) ); ?>">
		<?php if ( 'ok' === $sent ) : ?>
			<div class="phform-ok"><?php echo ph_icon( 'check', 20, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?> <?php echo 'workshop' === $type ? esc_html__( 'Thanks! We’ll call you to confirm your place.', 'potteryhub' ) : esc_html__( 'Thanks! We’ll get back to you soon.', 'potteryhub' ); ?></div>
		<?php elseif ( 'bad' === $sent ) : ?>
			<div class="phform-err"><?php esc_html_e( 'Please add your name and a phone number or email.', 'potteryhub' ); ?></div>
		<?php endif; ?>
		<input type="hidden" name="action" value="ph_form">
		<input type="hidden" name="type" value="<?php echo esc_attr( $type ); ?>">
		<input type="text" name="website" value="" tabindex="-1" autocomplete="off" aria-hidden="true" class="ph-hp">
		<div class="f2">
			<label><span><?php esc_html_e( 'Name', 'potteryhub' ); ?> *</span><input name="name" required autocomplete="name"></label>
			<label><span><?php esc_html_e( 'Phone', 'potteryhub' ); ?></span><input name="phone" type="tel" autocomplete="tel" dir="ltr"></label>
		</div>
		<label><span><?php esc_html_e( 'Email', 'potteryhub' ); ?></span><input name="email" type="email" autocomplete="email" dir="ltr"></label>
		<?php if ( 'workshop' === $type ) : ?>
			<div class="f2">
				<label><span><?php esc_html_e( 'Preferred date', 'potteryhub' ); ?></span><input name="date" type="date"></label>
				<label><span><?php esc_html_e( 'People', 'potteryhub' ); ?></span><input name="people" type="number" min="1" max="30" value="1"></label>
			</div>
		<?php endif; ?>
		<label><span><?php echo 'workshop' === $type ? esc_html__( 'Anything we should know?', 'potteryhub' ) : esc_html__( 'Message', 'potteryhub' ); ?><?php echo 'contact' === $type ? ' *' : ''; ?></span><textarea name="message" rows="5"<?php echo 'contact' === $type ? ' required' : ''; ?>></textarea></label>
		<button class="btn" type="submit"><?php echo 'workshop' === $type ? esc_html__( 'Request a place', 'potteryhub' ) : esc_html__( 'Send message', 'potteryhub' ); ?> <?php echo ph_icon( 'arrow', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
	</form>
	<?php
}

/** Handle both forms: save the message (Appearance → Pottery Hub) and email it. */
function ph_form_handle() {
	// phpcs:disable WordPress.Security.NonceVerification -- public form on cached pages; honeypot + rate limit instead.
	$back = wp_get_referer() ? remove_query_arg( 'ph_sent', wp_get_referer() ) : home_url( '/' );
	if ( ! empty( $_POST['website'] ) ) {
		wp_safe_redirect( add_query_arg( 'ph_sent', 'ok', $back ) . '#form' );
		exit;
	}
	$f = array(
		'type'    => isset( $_POST['type'] ) && 'workshop' === $_POST['type'] ? 'workshop' : 'contact',
		'name'    => isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '',
		'phone'   => isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '',
		'email'   => isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '',
		'date'    => isset( $_POST['date'] ) ? sanitize_text_field( wp_unslash( $_POST['date'] ) ) : '',
		'people'  => isset( $_POST['people'] ) ? absint( $_POST['people'] ) : 0,
		'message' => isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '',
		'time'    => current_time( 'mysql' ),
		'lang'    => ph_lang(),
	);
	// phpcs:enable
	if ( ! $f['name'] || ( ! $f['phone'] && ! $f['email'] ) || ( 'contact' === $f['type'] && ! $f['message'] ) ) {
		wp_safe_redirect( add_query_arg( 'ph_sent', 'bad', $back ) . '#form' );
		exit;
	}
	// Simple rate limit: 5 messages per IP per hour.
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$key = 'ph_rl_' . md5( $ip );
	$n   = (int) get_transient( $key );
	if ( $n >= 5 ) {
		wp_safe_redirect( add_query_arg( 'ph_sent', 'ok', $back ) . '#form' );
		exit;
	}
	set_transient( $key, $n + 1, HOUR_IN_SECONDS );

	$list = get_option( 'ph_messages', array() );
	array_unshift( $list, $f );
	update_option( 'ph_messages', array_slice( $list, 0, 500 ), false );

	$to      = get_theme_mod( 'ph_email', '' ) ? get_theme_mod( 'ph_email' ) : get_option( 'admin_email' );
	$subject = ( 'workshop' === $f['type'] ? 'Workshop request' : 'New message' ) . ' — ' . $f['name'];
	$body    = '';
	foreach ( array( 'name', 'phone', 'email', 'date', 'people', 'message' ) as $k ) {
		if ( $f[ $k ] ) {
			$body .= ucfirst( $k ) . ': ' . $f[ $k ] . "\n";
		}
	}
	$headers = $f['email'] ? array( 'Reply-To: ' . $f['name'] . ' <' . $f['email'] . '>' ) : array();
	wp_mail( $to, $subject, $body, $headers );

	wp_safe_redirect( add_query_arg( 'ph_sent', 'ok', $back ) . '#form' );
	exit;
}
add_action( 'admin_post_nopriv_ph_form', 'ph_form_handle' );
add_action( 'admin_post_ph_form', 'ph_form_handle' );

/* ---------------------------------------------------------------------------
 * One-click pages (Appearance → Pottery Hub)
 * ------------------------------------------------------------------------- */

/** Starter content for the three pages. */
function ph_starter_pages() {
	return array(
		'template-about.php'     => array(
			'title'      => 'About',
			'title_ar'   => 'من نحن',
			'content'    => "<h2>Where creativity meets craftsmanship</h2>\n<p>Pottery Hub is a small ceramics studio in Egypt. Every piece is shaped, glazed and fired by hand, so no two are exactly alike.</p>\n<p>We make mugs, bowls, plates and serving pieces for everyday use — pieces with warmth and character that you reach for every day.</p>",
			'content_ar' => "<h2>حيث يلتقي الإبداع بالحِرفة</h2>\n<p>بوتري هب استوديو سيراميك صغير في مصر. كل قطعة بتتشكّل وتتزجّج وتتحرق باليد، عشان كده مفيش قطعتين زي بعض بالظبط.</p>\n<p>بنعمل مجات وبولات وأطباق وقطع تقديم للاستخدام اليومي — قطع فيها دفء وطابع بتحب تستخدمها كل يوم.</p>",
		),
		'template-workshops.php' => array(
			'title'      => 'Workshops',
			'title_ar'   => 'الورش',
			'content'    => "<h2>Get to know pottery</h2>\n<p>Sit at the wheel, feel the clay and leave with a piece you made yourself. Our workshops are for complete beginners and for anyone who wants to practise.</p>\n<ul><li>Small groups</li><li>All tools and clay included</li><li>We glaze and fire your piece, then let you know when it’s ready</li></ul>",
			'content_ar' => "<h2>اكتشف عالم الفخار</h2>\n<p>اقعد على العجلة، المس الطين، واخرج بقطعة عملتها بإيدك. الورش مناسبة للمبتدئين تمامًا ولأي حد عايز يتمرّن.</p>\n<ul><li>مجموعات صغيرة</li><li>كل الأدوات والطين موجودين</li><li>بنزجّج ونحرق قطعتك ونبلغك أول ما تجهز</li></ul>",
		),
		'template-contact.php'   => array(
			'title'      => 'Contact',
			'title_ar'   => 'تواصل معنا',
			'content'    => '<p>Questions about an order, a custom piece or a workshop? Send us a message and we’ll get back to you.</p>',
			'content_ar' => '<p>عندك سؤال عن طلب، أو قطعة مخصوصة، أو ورشة؟ ابعتلنا رسالة وهنرد عليك.</p>',
		),
	);
}

/** Create the pages that don't exist yet. Returns how many were created. */
function ph_create_pages() {
	$n = 0;
	foreach ( ph_starter_pages() as $tpl => $p ) {
		if ( ph_template_url( $tpl ) ) {
			continue;
		}
		$id = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $p['title'],
				'post_content' => $p['content'],
			)
		);
		if ( $id && ! is_wp_error( $id ) ) {
			update_post_meta( $id, '_wp_page_template', $tpl );
			update_post_meta( $id, '_ph_title_ar', $p['title_ar'] );
			update_post_meta( $id, '_ph_content_ar', $p['content_ar'] );
			$n++;
		}
	}
	// Journal (blog) page, when the site has a static front page and no posts page yet.
	if ( 'page' === get_option( 'show_on_front' ) && ! get_option( 'page_for_posts' ) ) {
		$id = wp_insert_post(
			array(
				'post_type'   => 'page',
				'post_status' => 'publish',
				'post_title'  => 'Journal',
				'post_name'   => 'journal',
			)
		);
		if ( $id && ! is_wp_error( $id ) ) {
			update_post_meta( $id, '_ph_title_ar', 'المدونة' );
			update_option( 'page_for_posts', $id );
			$n++;
		}
	}
	return $n;
}

/** Journal URL ('' when the site has no posts page). */
function ph_journal_url() {
	$id = (int) get_option( 'page_for_posts' );
	return $id && 'publish' === get_post_status( $id ) ? get_permalink( $id ) : '';
}
