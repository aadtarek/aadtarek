<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

function cheops_prive_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'custom-logo' );
    register_nav_menus([
        'primary' => __( 'Primary Menu', 'cheops-prive' ),
        'footer'  => __( 'Footer Menu', 'cheops-prive' ),
    ]);
}
add_action( 'after_setup_theme', 'cheops_prive_setup' );

function cheops_get_youtube_id( $url ) {
    $url = trim((string) $url);
    if ( preg_match('~(?:youtu\.be/|youtube(?:-nocookie)?\.com/(?:watch\?v=|embed/|shorts/))([A-Za-z0-9_-]{6,})~', $url, $m) ) {
        return $m[1];
    }
    if ( preg_match('~^[A-Za-z0-9_-]{6,}$~', $url) ) return $url;
    return 'nt0bdK3USr8';
}

function cheops_phone_display() {
    return get_theme_mod('cheops_phone', '01279366691');
}
function cheops_phone_url() {
    $raw = preg_replace('/[^0-9+]/', '', cheops_phone_display());
    return 'tel:' . $raw;
}
function cheops_email() {
    return get_theme_mod('cheops_email', 'hello@cheopsprive.com');
}
function cheops_address() {
    return get_theme_mod('cheops_address', 'Bldg C – Laketown Plaza, New Cairo – Egypt');
}
function cheops_whatsapp_url($message = '') {
    $raw = preg_replace('/\D+/', '', get_theme_mod('cheops_whatsapp', '01279366691'));
    if ($raw && substr($raw, 0, 1) === '0') {
        $raw = '20' . substr($raw, 1);
    }
    if (!$raw) return home_url('/#contact');
    $url = 'https://wa.me/' . $raw;
    if ($message) $url .= '?text=' . rawurlencode($message);
    return $url;
}
function cheops_whatsapp_unit_message($post_id) {
    return "Hello, I'm interested in this unit " . get_permalink($post_id);
}

function cheops_customize_register( $wp_customize ) {
    $wp_customize->add_section('cheops_theme_options', [
        'title' => __('Cheops Theme Options', 'cheops-prive'),
        'priority' => 30,
    ]);

    $settings = [
        'cheops_hero_video_url' => [
            'label' => 'Hero YouTube video URL',
            'default' => 'https://youtu.be/nt0bdK3USr8?feature=shared',
            'sanitize' => 'esc_url_raw',
        ],
        'cheops_phone' => [
            'label' => 'Phone',
            'default' => '01279366691',
            'sanitize' => 'sanitize_text_field',
        ],
        'cheops_whatsapp' => [
            'label' => 'WhatsApp number (local or international)',
            'default' => '01279366691',
            'sanitize' => 'sanitize_text_field',
        ],
        'cheops_email' => [
            'label' => 'Email',
            'default' => 'hello@cheopsprive.com',
            'sanitize' => 'sanitize_email',
        ],
        'cheops_address' => [
            'label' => 'Office address',
            'default' => 'Bldg C – Laketown Plaza, New Cairo – Egypt',
            'sanitize' => 'sanitize_text_field',
        ],
    ];
    foreach ($settings as $id => $args) {
        $wp_customize->add_setting($id, [
            'default' => $args['default'],
            'sanitize_callback' => $args['sanitize'],
        ]);
        $wp_customize->add_control($id, [
            'section' => 'cheops_theme_options',
            'label' => __($args['label'], 'cheops-prive'),
            'type' => 'text',
        ]);
    }

    $logo_settings = [
        'cheops_logo_white' => 'Header logo — white (shown at the top of the page)',
        'cheops_logo_black' => 'Header logo — black (shown once you scroll)',
    ];
    foreach ($logo_settings as $id => $label) {
        $wp_customize->add_setting($id, [
            'default' => '',
            'sanitize_callback' => 'esc_url_raw',
        ]);
        $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, $id, [
            'section' => 'cheops_theme_options',
            'label' => __($label, 'cheops-prive'),
        ]));
    }
}
add_action('customize_register', 'cheops_customize_register');

function cheops_create_core_pages() {
    $pages = [
        'home' => 'Home',
        'about' => 'About',
        'properties' => 'Properties',
        'for-rent' => 'For Rent',
        'for-sale' => 'For Sale',
        'private-consultation' => 'Private Consultation',
        'income-property' => 'Income Property',
        'contact' => 'Contact Us',
    ];
    $ids = [];
    foreach ($pages as $slug => $title) {
        $existing = get_page_by_path($slug);
        if ($existing) { $ids[$slug] = $existing->ID; continue; }
        $ids[$slug] = wp_insert_post([
            'post_type' => 'page',
            'post_status' => 'publish',
            'post_title' => $title,
            'post_name' => $slug,
            'post_content' => '',
        ]);
    }
    if (!empty($ids['home'])) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $ids['home']);
    }
}
add_action('after_switch_theme', 'cheops_create_core_pages');

// Keep the converted front-end clean while preserving the WordPress admin experience.
function cheops_body_class($classes) { $classes[] = 'cheops-prive-theme'; return $classes; }
add_filter('body_class', 'cheops_body_class');

/* =========================================================
 * Cheops Privé — Property Manager + unified navigation
 * ========================================================= */

function cheops_register_units() {
    register_post_type('cheops_unit', [
        'labels' => [
            'name' => 'Units',
            'singular_name' => 'Unit',
            'add_new' => 'Add Unit',
            'add_new_item' => 'Add New Unit',
            'edit_item' => 'Edit Unit',
            'new_item' => 'New Unit',
            'view_item' => 'View Unit',
            'search_items' => 'Search Units',
            'not_found' => 'No units found',
            'menu_name' => 'Property Manager',
        ],
        'public' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-building',
        'supports' => ['title','editor','thumbnail','excerpt','page-attributes'],
        'has_archive' => false,
        'rewrite' => ['slug' => 'property', 'with_front' => false],
        'show_in_nav_menus' => true,
    ]);

    register_taxonomy('unit_type', 'cheops_unit', [
        'labels' => ['name'=>'Property Types','singular_name'=>'Property Type'],
        'public' => true,
        'show_in_rest' => true,
        'hierarchical' => true,
        'rewrite' => ['slug'=>'property-type'],
    ]);
    register_taxonomy('unit_location', 'cheops_unit', [
        'labels' => ['name'=>'Locations','singular_name'=>'Location'],
        'public' => true,
        'show_in_rest' => true,
        'hierarchical' => true,
        'rewrite' => ['slug'=>'location'],
    ]);
    register_taxonomy('unit_developer', 'cheops_unit', [
        'labels' => ['name'=>'Developers','singular_name'=>'Developer'],
        'public' => true,
        'show_in_rest' => true,
        'hierarchical' => false,
        'rewrite' => ['slug'=>'developer'],
    ]);
}
add_action('init','cheops_register_units');

function cheops_seed_property_terms() {
    if ( get_option('cheops_property_terms_seeded_v3') ) return;
    $types = ['Apartment','Villa','Townhouse','Twinhouse','Duplex','Penthouse','Chalet','Office','Clinic','Retail'];
    foreach ($types as $name) {
        if (!term_exists($name,'unit_type')) wp_insert_term($name,'unit_type');
    }
    update_option('cheops_property_terms_seeded_v3',1,false);
}
add_action('init','cheops_seed_property_terms',20);

function cheops_listing_types() {
    return [
        'sale' => 'For Sale',
        'rent' => 'For Rent',
    ];
}
function cheops_rent_periods() {
    return [
        'monthly' => 'Monthly',
        'quarterly' => 'Quarterly',
        'yearly' => 'Yearly',
    ];
}
function cheops_finishing_options() {
    return [
        '' => 'Not specified',
        'core-shell' => 'Core & Shell',
        'semi-finished' => 'Semi-finished',
        'finished' => 'Finished',
        'fully-finished' => 'Fully Finished',
        'furnished' => 'Furnished',
        'luxury-finished' => 'Luxury Finished',
    ];
}
function cheops_sale_type_options() {
    return [
        '' => 'Not specified',
        'developer-sale' => 'Developer Sale',
        'resale' => 'Resale',
        'owner-direct' => 'Owner Direct',
    ];
}
function cheops_amenity_options() {
    return [
        'Garden','Private Garden','Roof','Terrace','Balcony','Parking','Underground Parking','Pool','Private Pool',
        'Clubhouse','Gym','Security','Gated Community','Elevator','Central AC','Kitchen','Storage','Maid’s Room',
        'Driver’s Room','Reception','Meeting Room','Sea View','Nile View','Lagoon View','Landscape View','Smart Home'
    ];
}
function cheops_unit_price_text($post_id) {
    $override = get_post_meta($post_id,'_cheops_price_override_text',true);
    if ($override) return $override;
    $price = (float)get_post_meta($post_id,'_cheops_price',true);
    if (!$price) return 'Price on request';
    $deal = get_post_meta($post_id,'_cheops_listing_type',true) ?: 'sale';
    $suffix = '';
    if ($deal === 'rent') {
        $period = get_post_meta($post_id,'_cheops_rent_period',true) ?: 'monthly';
        $suffix = ' / ' . strtolower(cheops_rent_periods()[$period] ?? 'month');
    }
    return 'EGP ' . number_format_i18n($price,0) . $suffix;
}
function cheops_taxonomy_options_html($taxonomy,$defaults=[]) {
    $terms = get_terms(['taxonomy'=>$taxonomy,'hide_empty'=>false]);
    $names=[];
    if (!is_wp_error($terms)) foreach($terms as $term) $names[]=$term->name;
    if (!$names) $names=$defaults;
    foreach(array_values(array_unique($names)) as $name) echo '<option value="'.esc_attr($name).'">'.esc_html($name).'</option>';
}

function cheops_unit_fields() {
    return [
        '_cheops_price' => ['Price / Rent Amount (EGP)','number'],
        '_cheops_beds' => ['Bedrooms','number'],
        '_cheops_baths' => ['Bathrooms','number'],
        '_cheops_area' => ['Built-up Area (m²)','number'],
        '_cheops_garden_area' => ['Garden Area (m²)','number'],
        '_cheops_terrace_area' => ['Terrace Area (m²)','number'],
        '_cheops_roof_area' => ['Roof Area (m²)','number'],
        '_cheops_floor' => ['Floor','text'],
        '_cheops_project' => ['Project / Compound','text'],
        '_cheops_reference' => ['Reference Code','text'],
        '_cheops_delivery' => ['Delivery Date / Year','text'],
        '_cheops_payment' => ['Payment Plan','text'],
        '_cheops_downpayment' => ['Down Payment','text'],
        '_cheops_remaining_balance' => ['Remaining Balance','text'],
        '_cheops_maintenance' => ['Maintenance','text'],
        '_cheops_due_date' => ['Due Date / Milestone','text'],
        '_cheops_installment' => ['Installment / Monthly Payment','text'],
        '_cheops_map_url' => ['Google Maps URL','url'],
        '_cheops_video_url' => ['Video / YouTube URL','url'],
    ];
}

function cheops_unit_meta_boxes() {
    add_meta_box('cheops_unit_details','Unit Details','cheops_unit_details_box','cheops_unit','normal','high');
    add_meta_box('cheops_unit_gallery','Property Gallery','cheops_unit_gallery_box','cheops_unit','normal','high');
    add_meta_box('cheops_unit_marketing','Marketing & Display','cheops_unit_marketing_box','cheops_unit','side','high');
}
add_action('add_meta_boxes','cheops_unit_meta_boxes');

function cheops_unit_details_box($post) {
    wp_nonce_field('cheops_save_unit','cheops_unit_nonce');
    $listing = get_post_meta($post->ID,'_cheops_listing_type',true) ?: 'sale';
    $period = get_post_meta($post->ID,'_cheops_rent_period',true) ?: 'monthly';
    $finish = get_post_meta($post->ID,'_cheops_finishing',true);
    $sale_type = get_post_meta($post->ID,'_cheops_sale_type',true);
    $selected_amenities = get_post_meta($post->ID,'_cheops_amenities_selected',true);
    if (!is_array($selected_amenities)) $selected_amenities=[];
    $custom_amenities = get_post_meta($post->ID,'_cheops_amenities',true);

    echo '<div class="cheops-admin-section"><h3>Listing & Administrative</h3><div class="cheops-admin-grid">';
    echo '<label><span>Listing Type</span><select name="_cheops_listing_type">';
    foreach(cheops_listing_types() as $key=>$label) echo '<option value="'.esc_attr($key).'" '.selected($listing,$key,false).'>'.esc_html($label).'</option>';
    echo '</select></label>';
    echo '<label><span>Rent Period</span><select name="_cheops_rent_period">';
    foreach(cheops_rent_periods() as $key=>$label) echo '<option value="'.esc_attr($key).'" '.selected($period,$key,false).'>'.esc_html($label).'</option>';
    echo '</select><small>Used only when Listing Type is For Rent.</small></label>';
    echo '<label><span>Sale Type</span><select name="_cheops_sale_type">';
    foreach(cheops_sale_type_options() as $key=>$label) echo '<option value="'.esc_attr($key).'" '.selected($sale_type,$key,false).'>'.esc_html($label).'</option>';
    echo '</select></label>';
    echo '<label><span>Finishing</span><select name="_cheops_finishing">';
    foreach(cheops_finishing_options() as $key=>$label) echo '<option value="'.esc_attr($key).'" '.selected($finish,$key,false).'>'.esc_html($label).'</option>';
    echo '</select></label>';
    echo '</div></div>';

    echo '<div class="cheops-admin-section"><h3>Unit Details</h3><div class="cheops-admin-grid">';
    foreach (cheops_unit_fields() as $key=>$cfg) {
        $val = get_post_meta($post->ID,$key,true);
        printf('<label><span>%s</span><input type="%s" name="%s" value="%s" %s></label>',
            esc_html($cfg[0]), esc_attr($cfg[1]), esc_attr($key), esc_attr($val), $cfg[1]==='number'?'min="0" step="1"':'');
    }
    echo '</div></div>';

    echo '<div class="cheops-admin-section"><h3>Amenities & Features</h3><p class="description">Select everything that applies. Garden / terrace / roof sizes can be entered above.</p><div class="cheops-amenity-checks">';
    foreach(cheops_amenity_options() as $amenity){
        echo '<label><input type="checkbox" name="_cheops_amenities_selected[]" value="'.esc_attr($amenity).'" '.checked(in_array($amenity,$selected_amenities,true),true,false).'><span>'.esc_html($amenity).'</span></label>';
    }
    echo '</div><label class="cheops-custom-amenities"><span>Other / Custom Amenities</span><textarea name="_cheops_amenities" rows="3" placeholder="Concierge, Business lounge, Kids area...">'.esc_textarea($custom_amenities).'</textarea><small>Separate custom amenities with commas.</small></label></div>';

    $floorplan=(int)get_post_meta($post->ID,'_cheops_floorplan_id',true);
    $masterplan=(int)get_post_meta($post->ID,'_cheops_masterplan_id',true);
    echo '<div class="cheops-admin-section"><h3>Plans</h3><div class="cheops-plan-grid">';
    foreach([['_cheops_floorplan_id','Floor Plan',$floorplan],['_cheops_masterplan_id','Master Plan',$masterplan]] as $plan){
        $url=$plan[2]?wp_get_attachment_image_url($plan[2],'medium'):'';
        echo '<div class="cheops-plan-uploader"><strong>'.esc_html($plan[1]).'</strong><div class="cheops-plan-preview" data-for="'.esc_attr($plan[0]).'">'.($url?'<img src="'.esc_url($url).'" alt="">':'<span>No image selected</span>').'</div><input type="hidden" name="'.esc_attr($plan[0]).'" id="'.esc_attr($plan[0]).'" value="'.esc_attr($plan[2]).'"><button type="button" class="button cheops-select-plan" data-target="'.esc_attr($plan[0]).'">Choose image</button> <button type="button" class="button cheops-clear-plan" data-target="'.esc_attr($plan[0]).'">Clear</button></div>';
    }
    echo '</div></div>';
}

function cheops_unit_gallery_box($post) {
    $ids = array_filter(array_map('absint', explode(',', (string)get_post_meta($post->ID,'_cheops_gallery_ids',true))));
    echo '<input type="hidden" id="cheops_gallery_ids" name="_cheops_gallery_ids" value="'.esc_attr(implode(',',$ids)).'">';
    echo '<div id="cheops-gallery-preview" class="cheops-gallery-preview">';
    foreach($ids as $id){ $url=wp_get_attachment_image_url($id,'thumbnail'); if($url) echo '<span data-id="'.esc_attr($id).'"><img src="'.esc_url($url).'" alt=""><button type="button" class="cheops-remove-image">×</button></span>'; }
    echo '</div><p><button type="button" class="button button-primary" id="cheops-select-gallery">Choose gallery images</button> <button type="button" class="button" id="cheops-clear-gallery">Clear</button></p>';
    echo '<p class="description">Choose multiple images. Drag/reorder can be done by re-selecting them in the desired order.</p>';
}

function cheops_unit_marketing_box($post) {
    $featured = get_post_meta($post->ID,'_cheops_featured',true);
    $label = get_post_meta($post->ID,'_cheops_label',true);
    echo '<label class="cheops-toggle"><input type="checkbox" name="_cheops_featured" value="1" '.checked($featured,'1',false).'> <span>Show on homepage Featured Units</span></label>';
    echo '<p><label><strong>Card label</strong><br><input style="width:100%;margin-top:7px" type="text" name="_cheops_label" value="'.esc_attr($label).'" placeholder="New / Ready / Exclusive"></label></p>';
    echo '<p class="description">Use the Featured Image as the unit cover image.</p>';
}

function cheops_save_unit($post_id) {
    if (!isset($_POST['cheops_unit_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cheops_unit_nonce'])),'cheops_save_unit')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post',$post_id)) return;
    foreach (cheops_unit_fields() as $key=>$cfg) {
        if (!isset($_POST[$key])) continue;
        $raw = wp_unslash($_POST[$key]);
        $val = $cfg[1]==='url' ? esc_url_raw($raw) : ($cfg[1]==='number' ? preg_replace('/[^0-9.]/','',$raw) : sanitize_text_field($raw));
        update_post_meta($post_id,$key,$val);
    }
    $listing = isset($_POST['_cheops_listing_type']) ? sanitize_key(wp_unslash($_POST['_cheops_listing_type'])) : 'sale';
    if (!array_key_exists($listing,cheops_listing_types())) $listing='sale';
    update_post_meta($post_id,'_cheops_listing_type',$listing);
    $period = isset($_POST['_cheops_rent_period']) ? sanitize_key(wp_unslash($_POST['_cheops_rent_period'])) : 'monthly';
    if (!array_key_exists($period,cheops_rent_periods())) $period='monthly';
    update_post_meta($post_id,'_cheops_rent_period',$period);
    $finish = isset($_POST['_cheops_finishing']) ? sanitize_key(wp_unslash($_POST['_cheops_finishing'])) : '';
    update_post_meta($post_id,'_cheops_finishing',$finish);
    $sale_type = isset($_POST['_cheops_sale_type']) ? sanitize_key(wp_unslash($_POST['_cheops_sale_type'])) : '';
    update_post_meta($post_id,'_cheops_sale_type',$sale_type);
    $amenities_selected = isset($_POST['_cheops_amenities_selected']) && is_array($_POST['_cheops_amenities_selected']) ? array_values(array_intersect(cheops_amenity_options(),array_map('sanitize_text_field',wp_unslash($_POST['_cheops_amenities_selected'])))) : [];
    update_post_meta($post_id,'_cheops_amenities_selected',$amenities_selected);
    update_post_meta($post_id,'_cheops_amenities', isset($_POST['_cheops_amenities']) ? sanitize_textarea_field(wp_unslash($_POST['_cheops_amenities'])) : '');
    foreach(['_cheops_floorplan_id','_cheops_masterplan_id'] as $media_key) update_post_meta($post_id,$media_key,isset($_POST[$media_key])?absint($_POST[$media_key]):0);
    update_post_meta($post_id,'_cheops_gallery_ids', isset($_POST['_cheops_gallery_ids']) ? implode(',',array_filter(array_map('absint',explode(',',sanitize_text_field(wp_unslash($_POST['_cheops_gallery_ids'])))))) : '');
    update_post_meta($post_id,'_cheops_featured', isset($_POST['_cheops_featured']) ? '1' : '0');
    update_post_meta($post_id,'_cheops_label', isset($_POST['_cheops_label']) ? sanitize_text_field(wp_unslash($_POST['_cheops_label'])) : '');
}
add_action('save_post_cheops_unit','cheops_save_unit');

function cheops_unit_admin_assets($hook) {
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'cheops_unit') return;
    wp_enqueue_media();
    wp_add_inline_script('jquery-core', <<<'JS'
jQuery(function($){
  let frame;
  $('#cheops-select-gallery').on('click',function(e){
    e.preventDefault();
    frame=wp.media({title:'Choose Property Gallery',button:{text:'Use selected images'},multiple:true});
    frame.on('select',function(){
      const items=frame.state().get('selection').toJSON();
      const ids=items.map(i=>i.id);
      $('#cheops_gallery_ids').val(ids.join(','));
      $('#cheops-gallery-preview').html(items.map(i=>'<span data-id="'+i.id+'"><img src="'+(i.sizes?.thumbnail?.url||i.url)+'" alt=""><button type="button" class="cheops-remove-image">×</button></span>').join(''));
    }); frame.open();
  });
  $('#cheops-clear-gallery').on('click',function(){ $('#cheops_gallery_ids').val(''); $('#cheops-gallery-preview').empty(); });
  $(document).on('click','.cheops-remove-image',function(){
    $(this).parent().remove();
    $('#cheops_gallery_ids').val($('#cheops-gallery-preview [data-id]').map(function(){return $(this).data('id')}).get().join(','));
  });
  $(document).on('click','.cheops-select-plan',function(e){
    e.preventDefault();
    const target=$(this).data('target');
    const frame=wp.media({title:'Choose plan image',button:{text:'Use image'},multiple:false});
    frame.on('select',function(){
      const item=frame.state().get('selection').first().toJSON();
      $('#'+target).val(item.id);
      $('.cheops-plan-preview[data-for="'+target+'"]').html('<img src="'+(item.sizes?.medium?.url||item.url)+'" alt="">');
    }); frame.open();
  });
  $(document).on('click','.cheops-clear-plan',function(e){
    e.preventDefault(); const target=$(this).data('target'); $('#'+target).val(''); $('.cheops-plan-preview[data-for="'+target+'"]').html('<span>No image selected</span>');
  });
});
JS
    );
}
add_action('admin_enqueue_scripts','cheops_unit_admin_assets');

function cheops_admin_branding_css() {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    $is_units = $screen && (in_array($screen->post_type,['cheops_unit','cheops_project'],true) || $screen->id === 'dashboard');
    if (!$is_units) return;
    echo '<style>
      :root{--cheops-ink:#171717;--cheops-gold:#b89458;--cheops-cream:#f5f1e9}
      body.post-type-cheops_unit #wpcontent,body.post-type-cheops_project #wpcontent{background:#f7f5f1}
      body.post-type-cheops_unit .wrap h1.wp-heading-inline,body.post-type-cheops_project .wrap h1.wp-heading-inline{font-family:Georgia,serif;font-size:32px;color:var(--cheops-ink)}
      body.post-type-cheops_unit .page-title-action,body.post-type-cheops_project .page-title-action,.cheops-admin-dashboard .button-primary{background:var(--cheops-ink)!important;border-color:var(--cheops-ink)!important;border-radius:999px;padding:5px 16px}
      body.post-type-cheops_unit .postbox,body.post-type-cheops_project .postbox{border:0;border-radius:16px;box-shadow:0 12px 34px rgba(0,0,0,.06);overflow:hidden}
      body.post-type-cheops_unit .postbox,body.post-type-cheops_project .postbox-header{background:#fff;border-bottom:1px solid #eee8dd}
      .cheops-admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .cheops-admin-grid label span{display:block;font-weight:700;margin-bottom:7px;color:#222}
      .cheops-admin-grid input,.cheops-admin-grid textarea{width:100%;border:1px solid #ddd5c7;border-radius:10px;padding:10px 12px;background:#fff}.cheops-admin-grid select{width:100%;max-width:none;border:1px solid #ddd5c7;border-radius:10px;padding:10px 34px 10px 12px;background:#fff;min-height:42px}.cheops-admin-section{padding:8px 0 22px;margin-bottom:18px;border-bottom:1px solid #eee7dc}.cheops-admin-section:last-child{border-bottom:0}.cheops-admin-section h3{font-family:Georgia,serif;font-size:20px;font-weight:400;margin:6px 0 16px}.cheops-amenity-checks{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:14px 0 18px}.cheops-amenity-checks label{display:flex;align-items:center;gap:8px;padding:10px 11px;border:1px solid #e6ded1;border-radius:10px;background:#fff}.cheops-amenity-checks input{width:auto}.cheops-custom-amenities>span{display:block;font-weight:700;margin-bottom:7px}.cheops-custom-amenities textarea{width:100%;border:1px solid #ddd5c7;border-radius:10px;padding:10px 12px}.cheops-plan-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.cheops-plan-uploader{border:1px solid #e6ded1;border-radius:14px;padding:14px;background:#fff}.cheops-plan-preview{aspect-ratio:16/10;background:#f4f0e8;border-radius:10px;display:grid;place-items:center;overflow:hidden;margin:10px 0;color:#8a8378}.cheops-plan-preview img{width:100%;height:100%;object-fit:cover}
      .cheops-admin-grid .cheops-wide{grid-column:1/-1}.cheops-admin-grid small{display:block;color:#777;margin-top:6px}
      .cheops-gallery-preview{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:12px 0}.cheops-gallery-preview span{position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;background:#eee}.cheops-gallery-preview img{width:100%;height:100%;object-fit:cover}.cheops-remove-image{position:absolute;right:5px;top:5px;width:24px;height:24px;border:0;border-radius:50%;background:#111;color:#fff;cursor:pointer}
      .cheops-toggle{display:block;padding:12px;border-radius:12px;background:var(--cheops-cream);font-weight:600}
      .cheops-admin-dashboard{max-width:1180px}.cheops-admin-hero{background:linear-gradient(135deg,#171717,#2b2925);color:#fff;border-radius:22px;padding:34px;margin:22px 0}.cheops-admin-hero h1{font-family:Georgia,serif;font-size:36px;margin:0 0 8px}.cheops-admin-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.cheops-admin-kpi{background:#fff;border-radius:16px;padding:22px;box-shadow:0 8px 28px rgba(0,0,0,.05)}.cheops-admin-kpi strong{font-family:Georgia,serif;font-size:30px;display:block}.cheops-admin-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
      @media(max-width:782px){.cheops-admin-grid,.cheops-admin-kpis,.cheops-plan-grid{grid-template-columns:1fr}.cheops-amenity-checks{grid-template-columns:repeat(2,minmax(0,1fr))}.cheops-gallery-preview{grid-template-columns:repeat(3,1fr)}}
    
</style>';
}
add_action('admin_head','cheops_admin_branding_css');

function cheops_units_admin_menu() {
    add_submenu_page('edit.php?post_type=cheops_unit','Property Dashboard','Overview','edit_posts','cheops-property-dashboard','cheops_property_dashboard_page');
}
add_action('admin_menu','cheops_units_admin_menu');

function cheops_property_dashboard_page() {
    $counts = wp_count_posts('cheops_unit');
    $published = isset($counts->publish) ? (int)$counts->publish : 0;
    $featured = new WP_Query(['post_type'=>'cheops_unit','post_status'=>'publish','posts_per_page'=>1,'meta_key'=>'_cheops_featured','meta_value'=>'1','fields'=>'ids']);
    $types = wp_count_terms(['taxonomy'=>'unit_type','hide_empty'=>false]);
    $locs = wp_count_terms(['taxonomy'=>'unit_location','hide_empty'=>false]);
    if (is_wp_error($types)) $types = 0;
    if (is_wp_error($locs)) $locs = 0;
    if (isset($_GET['lt_imported'])) {
        echo '<div class="notice notice-success"><p>Created '.(int)$_GET['lt_imported'].' new Lake Town units ('.(int)($_GET['lt_skipped'] ?? 0).' already existed and were refreshed with the latest price/location/image).</p></div>';
    }
    if (isset($_GET['portfolio_units_created']) || isset($_GET['portfolio_units_updated'])) {
        echo '<div class="notice notice-success"><p><strong>Curated Portfolio AUG26 refreshed.</strong> Units: '.(int)($_GET['portfolio_units_created'] ?? 0).' created / '.(int)($_GET['portfolio_units_updated'] ?? 0).' updated. Projects: '.(int)($_GET['portfolio_projects_created'] ?? 0).' created / '.(int)($_GET['portfolio_projects_updated'] ?? 0).' updated.</p></div>';
    }
    if (!empty($_GET['portfolio_error'])) {
        echo '<div class="notice notice-error"><p>'.esc_html(wp_unslash($_GET['portfolio_error'])).'</p></div>';
    }
    $portfolio_import_url = wp_nonce_url(admin_url('admin-post.php?action=cheops_import_portfolio_aug26'),'cheops_import_portfolio_aug26');
    echo '<div class="wrap cheops-admin-dashboard"><div class="cheops-admin-hero"><img class="cheops-admin-brand-logo" src="'.esc_url(cheops_prive_brand_logo_url()).'" alt="Cheops Privé"><h1>Property Manager</h1><p style="max-width:680px;opacity:.75;font-size:15px">Manage the public collection, homepage featured units, galleries, filters and property details from one place.</p><div class="cheops-admin-actions"><a class="button button-primary" href="'.esc_url(admin_url('post-new.php?post_type=cheops_unit')).'">+ Add new unit</a><a class="button button-primary" href="'.esc_url($portfolio_import_url).'">Import / Refresh AUG26 Portfolio (35 units)</a><a class="button" href="'.esc_url(wp_nonce_url(admin_url('admin-post.php?action=cheops_import_lake_town_units'),'cheops_import_lake_town_units')).'">Import Lake Town units (29)</a><a class="button" href="'.esc_url(home_url('/properties/')).'" target="_blank">View properties page ↗</a></div></div>';
    echo '<div class="cheops-admin-kpis"><div class="cheops-admin-kpi"><span>Published units</span><strong>'.$published.'</strong></div><div class="cheops-admin-kpi"><span>Featured units</span><strong>'.(int)$featured->found_posts.'</strong></div><div class="cheops-admin-kpi"><span>Property types</span><strong>'.(int)$types.'</strong></div><div class="cheops-admin-kpi"><span>Locations</span><strong>'.(int)$locs.'</strong></div></div></div>';
}

function cheops_unit_columns($cols) {
    return [
        'cb'=>$cols['cb'], 'cheops_thumb'=>'Cover', 'title'=>'Unit', 'cheops_price'=>'Price',
        'cheops_deal'=>'Deal', 'taxonomy-unit_type'=>'Type', 'taxonomy-unit_location'=>'Location', 'cheops_area'=>'Area', 'cheops_featured'=>'Featured', 'date'=>'Date'
    ];
}
add_filter('manage_cheops_unit_posts_columns','cheops_unit_columns');
function cheops_unit_column_content($col,$post_id){
    if($col==='cheops_thumb'){
        $thumb=get_the_post_thumbnail($post_id,[76,56],['style'=>'width:76px;height:56px;object-fit:cover;border-radius:8px']);
        if(!$thumb && function_exists('cheops_portfolio_asset_url')){
            $asset=get_post_meta($post_id,'_cheops_portfolio_cover',true);
            if($asset) $thumb='<img src="'.esc_url(cheops_portfolio_asset_url($asset)).'" alt="" style="width:76px;height:56px;object-fit:cover;border-radius:8px">';
        }
        echo $thumb ?: '<span style="display:inline-block;width:76px;height:56px;background:#eee;border-radius:8px"></span>';
    }
    if($col==='cheops_price'){ echo esc_html(cheops_unit_price_text($post_id)); }
    if($col==='cheops_deal'){ $d=get_post_meta($post_id,'_cheops_listing_type',true) ?: 'sale'; echo '<strong style="text-transform:uppercase;font-size:11px;letter-spacing:.08em">'.esc_html(cheops_listing_types()[$d] ?? 'For Sale').'</strong>'; }
    if($col==='cheops_area'){ $a=get_post_meta($post_id,'_cheops_area',true); echo $a ? esc_html($a).' m²' : '—'; }
    if($col==='cheops_featured'){ echo get_post_meta($post_id,'_cheops_featured',true)==='1' ? '★' : '—'; }
}
add_action('manage_cheops_unit_posts_custom_column','cheops_unit_column_content',10,2);

function cheops_first_term_name($post_id,$taxonomy,$fallback='') {
    $terms = get_the_terms($post_id,$taxonomy);
    return ($terms && !is_wp_error($terms)) ? $terms[0]->name : $fallback;
}

function cheops_render_unit_card($post_id) {
    $title = get_the_title($post_id);
    $url = get_permalink($post_id);
    $type = cheops_first_term_name($post_id,'unit_type','Property');
    $loc = cheops_first_term_name($post_id,'unit_location','');
    $project = get_post_meta($post_id,'_cheops_project',true);
    $price = (float)get_post_meta($post_id,'_cheops_price',true);
    $beds = (int)get_post_meta($post_id,'_cheops_beds',true);
    $baths = (int)get_post_meta($post_id,'_cheops_baths',true);
    $area = get_post_meta($post_id,'_cheops_area',true);
    $label = get_post_meta($post_id,'_cheops_label',true);
    $deal = get_post_meta($post_id,'_cheops_listing_type',true) ?: 'sale';
    $deal_label = cheops_listing_types()[$deal] ?? 'For Sale';
    $img = get_the_post_thumbnail_url($post_id,'large');
    if(!$img){
        $ids=array_filter(array_map('absint',explode(',',(string)get_post_meta($post_id,'_cheops_gallery_ids',true))));
        if($ids) $img=wp_get_attachment_image_url(reset($ids),'large');
    }
    if(!$img && function_exists('cheops_portfolio_asset_url')){
        $asset=get_post_meta($post_id,'_cheops_portfolio_cover',true);
        if($asset) $img=cheops_portfolio_asset_url($asset);
    }
    echo '<article class="pcard reveal cheops-unit-card" data-beds="'.esc_attr($beds).'" data-loc="'.esc_attr($loc).'" data-price="'.esc_attr((int)$price).'" data-type="'.esc_attr($type).'" data-deal="'.esc_attr($deal).'" data-project="'.esc_attr($project).'">';
    echo '<a href="'.esc_url($url).'" class="zoom cheops-card-media" data-cursor="View property" style="position:relative;aspect-ratio:4/3;display:block;overflow:hidden;background:#ded9d1">';
    if($img) echo '<img alt="'.esc_attr($title).'" loading="lazy" decoding="async" src="'.esc_url($img).'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">';
    else echo '<span style="position:absolute;inset:0;background:linear-gradient(135deg,#d9d2c5,#f4f1eb)"></span>';
    echo '<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">'.esc_html($label ?: $type).'</span>';
    echo '<span class="eyebrow" style="position:absolute;bottom:14px;left:14px;background:#171717;color:#fff;padding:7px 12px">'.esc_html($deal_label).'</span>';
    echo '<span class="save-property" aria-hidden="true" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);width:34px;height:34px;display:grid;place-items:center;font-size:.9rem">♡</span></a>';
    echo '<div style="padding:22px"><h3 class="d" style="font-size:1.5rem;margin:0"><a href="'.esc_url($url).'" style="color:inherit;text-decoration:none">'.esc_html($title).'</a></h3>';
    $place = trim(implode(' · ',array_filter([$project,$loc])));
    echo '<p class="meta" style="margin-top:8px">'.esc_html($place ?: $loc).'</p>';
    $spec=[]; if($beds) $spec[]=$beds.' Beds'; if($baths) $spec[]=$baths.' Baths'; if($area) $spec[]=esc_html($area).' m²';
    echo '<p style="margin-top:14px;font-size:.82rem;color:var(--muted)">'.implode(' · ',$spec).'</p>';
    echo '<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px"><p class="d" style="font-size:1.3rem;margin:0">'.esc_html(cheops_unit_price_text($post_id)).'</p><a href="'.esc_url($url).'" class="gold" aria-label="View '.esc_attr($title).'">→</a></div></div>';
    echo '<div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="'.esc_url(cheops_whatsapp_url(cheops_whatsapp_unit_message($post_id))).'" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="'.esc_url(cheops_phone_url()).'">Call <span class="ar">→</span></a></div></article>';
}

function cheops_render_unit_cards($args=[]) {
    $defaults=['limit'=>-1,'featured'=>false]; $args=wp_parse_args($args,$defaults);
    $qargs=['post_type'=>'cheops_unit','post_status'=>'publish','posts_per_page'=>(int)$args['limit'],'orderby'=>['menu_order'=>'ASC','date'=>'DESC']];
    if($args['featured']) $qargs['meta_query']=[['key'=>'_cheops_featured','value'=>'1']];
    $q=new WP_Query($qargs);
    if(!$q->have_posts() && $args['featured']) {
        unset($qargs['meta_query']);
        $q=new WP_Query($qargs);
    }
    if(!$q->have_posts()) return false;
    while($q->have_posts()){ $q->the_post(); cheops_render_unit_card(get_the_ID()); }
    wp_reset_postdata();
    return true;
}


/* =========================================================
 * V4 — Branding, Projects by City, Contact page
 * ========================================================= */
function cheops_brand_logo_url() {
    return cheops_logo_black_url();
}
function cheops_logo_black_url() {
    return get_theme_mod('cheops_logo_black', 'https://cheopsprive.com/wp-content/uploads/2026/09/c9193073bb12.png');
}
function cheops_logo_white_url() {
    return get_theme_mod('cheops_logo_white', 'https://cheopsprive.com/wp-content/uploads/2026/09/side-logo-white.png');
}

function cheops_ensure_v4_pages() {
    if (!get_page_by_path('contact')) {
        wp_insert_post([
            'post_type'=>'page','post_status'=>'publish','post_title'=>'Contact Us','post_name'=>'contact','post_content'=>''
        ]);
    }
}
add_action('init','cheops_ensure_v4_pages',25);

function cheops_register_projects() {
    register_post_type('cheops_project',[
        'labels'=>[
            'name'=>'Projects','singular_name'=>'Project','add_new'=>'Add Project','add_new_item'=>'Add New Project',
            'edit_item'=>'Edit Project','new_item'=>'New Project','view_item'=>'View Project','search_items'=>'Search Projects',
            'not_found'=>'No projects found','menu_name'=>'Projects'
        ],
        'public'=>true,'show_in_rest'=>true,'menu_icon'=>'dashicons-location-alt','supports'=>['title','editor','excerpt','thumbnail','page-attributes'],
        'has_archive'=>false,'rewrite'=>['slug'=>'project','with_front'=>false]
    ]);
    register_taxonomy('project_city','cheops_project',[
        'labels'=>['name'=>'Cities','singular_name'=>'City'],'public'=>true,'show_in_rest'=>true,'hierarchical'=>true,
        'rewrite'=>['slug'=>'city']
    ]);
}
add_action('init','cheops_register_projects',11);

function cheops_seed_projects_v4() {
    if (get_option('cheops_projects_seeded_v4')) return;
    $rows = [
        ['Mountain View LVLS','New Cairo','Panoramic sea views from a gated community elevated up to +45 meters above sea level.','Villas & Apartments','EGP 7.4M','218','project-lvls.jpg'],
        ['LAKE TOWN','Shorouk City','A refined destination designed around elevated business and lifestyle experiences.','Apartments & Townhouses','EGP 5.9M','164','project-lake-town.jpg'],
        ['Mountain View Aliva','New Cairo','A city built around interaction, connectivity and being present in every moment.','Penthouses & Duplexes','EGP 11.2M','76','project-aliva.jpg'],
        ['The MarQ Gardens','New Cairo','Where serenity meets sophistication, blending modern living with lush green spaces.','Apartments & Duplexes','EGP 6.3M','142','project-marq-gardens.jpg'],
    ];
    foreach ($rows as $idx=>$r) {
        if (!term_exists($r[1],'project_city')) wp_insert_term($r[1],'project_city');
        $existing = get_page_by_title($r[0],OBJECT,'cheops_project');
        if ($existing) { $pid=$existing->ID; }
        else {
            $pid=wp_insert_post(['post_type'=>'cheops_project','post_status'=>'publish','post_title'=>$r[0],'post_excerpt'=>$r[2],'menu_order'=>$idx+1]);
        }
        if (!is_wp_error($pid) && $pid) {
            wp_set_object_terms($pid,$r[1],'project_city',false);
            update_post_meta($pid,'_cheops_project_type',$r[3]);
            update_post_meta($pid,'_cheops_project_start_price',$r[4]);
            update_post_meta($pid,'_cheops_project_units',$r[5]);
            update_post_meta($pid,'_cheops_project_theme_image',$r[6]);
        }
    }
    update_option('cheops_projects_seeded_v4',1,false);
}
add_action('init','cheops_seed_projects_v4',30);

function cheops_migrate_city_assignments_v5() {
    if (get_option('cheops_city_assignments_v5')) return;
    if (!term_exists('New Cairo','project_city')) wp_insert_term('New Cairo','project_city');
    foreach (['LAKE TOWN','Mountain View LVLS','Mountain View Aliva','The MarQ Gardens'] as $title) {
        $project=get_page_by_title($title,OBJECT,'cheops_project');
        if ($project) wp_set_object_terms($project->ID,'New Cairo','project_city',false);
    }
    update_option('cheops_city_assignments_v5',1,false);
}
add_action('init','cheops_migrate_city_assignments_v5',36);


function cheops_project_meta_box() {
    add_meta_box('cheops_project_details','Project Details','cheops_project_details_box','cheops_project','normal','high');
}
add_action('add_meta_boxes','cheops_project_meta_box');
function cheops_project_details_box($post) {
    wp_nonce_field('cheops_save_project','cheops_project_nonce');
    $fields=[
        '_cheops_project_type'=>'Property types',
        '_cheops_project_start_price'=>'Starting price',
        '_cheops_project_units'=>'Available units',
        '_cheops_project_link'=>'Project link (optional)',
        '_cheops_project_lat'=>'Map latitude (optional)',
        '_cheops_project_lng'=>'Map longitude (optional)',
    ];
    echo '<div class="cheops-admin-grid">';
    foreach($fields as $key=>$label){
        $v=get_post_meta($post->ID,$key,true);
        echo '<label><span>'.esc_html($label).'</span><input type="text" name="'.esc_attr($key).'" value="'.esc_attr($v).'" /></label>';
    }
    echo '<div class="cheops-wide" style="padding:4px 0 8px;color:#777">Use the <strong>Cities</strong> box in the sidebar to assign the project to a city, and use Featured Image for the project visual.</div></div>';
}
function cheops_save_project($post_id){
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!isset($_POST['cheops_project_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cheops_project_nonce'])),'cheops_save_project')) return;
    if (!current_user_can('edit_post',$post_id)) return;
    foreach(['_cheops_project_type','_cheops_project_start_price','_cheops_project_units','_cheops_project_link','_cheops_project_lat','_cheops_project_lng'] as $key){
        if(isset($_POST[$key])) update_post_meta($post_id,$key,sanitize_text_field(wp_unslash($_POST[$key])));
    }
}
add_action('save_post_cheops_project','cheops_save_project');

function cheops_project_image_url($post_id) {
    if (has_post_thumbnail($post_id)) return get_the_post_thumbnail_url($post_id,'large');
    $portfolio=get_post_meta($post_id,'_cheops_project_portfolio_cover',true);
    if ($portfolio && function_exists('cheops_portfolio_asset_url')) return cheops_portfolio_asset_url($portfolio);
    $file=get_post_meta($post_id,'_cheops_project_theme_image',true);
    if ($file) return get_template_directory_uri().'/assets/images/'.rawurlencode($file);
    return get_template_directory_uri().'/assets/images/project-lvls.jpg';
}
function cheops_city_cover_url($term_id) {
    // Dashboard-selected city image always wins.
    $image_id=absint(get_term_meta((int)$term_id,'_cheops_city_image_id',true));
    if($image_id){
        $custom=wp_get_attachment_image_url($image_id,'large');
        if($custom) return $custom;
    }

    // Otherwise use the first project's image, then the theme fallback.
    $q=new WP_Query(['post_type'=>'cheops_project','post_status'=>'publish','posts_per_page'=>1,'orderby'=>['menu_order'=>'ASC','date'=>'DESC'],
        'tax_query'=>[['taxonomy'=>'project_city','field'=>'term_id','terms'=>(int)$term_id]]]);
    $url=''; if($q->have_posts()){ $q->the_post(); $url=cheops_project_image_url(get_the_ID()); } wp_reset_postdata();
    if(!$url) $url=get_template_directory_uri().'/assets/generated/f9474888e9cc.jpg';
    return $url;
}
function cheops_render_city_projects_section() {
    // Show every city created in the Dashboard, even before a project is assigned to it.
    $cities=get_terms(['taxonomy'=>'project_city','hide_empty'=>false,'orderby'=>'term_id','order'=>'ASC']);
    if (is_wp_error($cities) || !$cities) return;
    echo '<section class="wrap cheops-city-projects" id="projects"><div class="cheops-city-projects-head"><div><p class="eyebrow gold">Explore by city</p><h2 class="d d-lg reveal" style="margin-top:20px"><span class="rl"><span>Choose your</span></span><span class="rl"><span>dream home.</span></span></h2></div><a class="btn btn-ghost" href="'.esc_url(home_url('/properties/')).'">All properties <span class="ar">→</span></a></div>';
    echo '<div class="cheops-city-links" aria-label="Project cities">';
    foreach($cities as $city){
        $cover=cheops_city_cover_url($city->term_id);
        $url=get_term_link($city);
        if (is_wp_error($url)) continue;
        $count_label=$city->count>0 ? $city->count.' '.($city->count===1?'project':'projects') : 'New destination';
        echo '<a class="cheops-city-link reveal" href="'.esc_url($url).'"><span class="cheops-city-tab-bg" style="background-image:url(\''.esc_url($cover).'\')"></span><span class="cheops-city-tab-shade"></span><span class="cheops-city-tab-copy"><small>'.esc_html($count_label).'</small><strong class="d">'.esc_html($city->name).'</strong><em>View projects <b>→</b></em></span></a>';
    }
    echo '</div></section>';
}

function cheops_render_project_row($pid,$city,$n=1) {
    $img=cheops_project_image_url($pid);
    $type=get_post_meta($pid,'_cheops_project_type',true);
    $price=get_post_meta($pid,'_cheops_project_start_price',true);
    $units=get_post_meta($pid,'_cheops_project_units',true);
    $link=get_post_meta($pid,'_cheops_project_link',true);
    if(!$link) $link=home_url('/properties/?loc='.rawurlencode($city->name));
    $desc=get_the_excerpt($pid);
    if(!$desc) $desc=wp_trim_words(wp_strip_all_tags(get_post_field('post_content',$pid)),32);
    $reverse=($n%2===0);
    echo '<article class="proj reveal cheops-project-dynamic cheops-city-project-row">';
    if(!$reverse) echo '<a class="zoom" data-cursor="View project" href="'.esc_url($link).'" style="position:relative;min-height:460px"><img src="'.esc_url($img).'" alt="'.esc_attr(get_the_title($pid).' in '.$city->name).'" loading="lazy" /></a>';
    echo '<div class="cheops-project-copy'.($reverse?' is-reverse':'').'"><p class="eyebrow gold">Project '.str_pad((string)$n,2,'0',STR_PAD_LEFT).'</p><h3 class="d">'.esc_html(get_the_title($pid)).'</h3><p class="cheops-project-desc">'.esc_html($desc).'</p><dl><div><dt class="meta">Location</dt><dd>'.esc_html($city->name).'</dd></div><div><dt class="meta">Property type</dt><dd>'.esc_html($type ?: 'Mixed use').'</dd></div><div><dt class="meta">Starting price</dt><dd class="d">'.esc_html($price ?: 'On request').'</dd></div><div><dt class="meta">Available units</dt><dd class="d">'.esc_html($units ?: '—').'</dd></div></dl><a class="link-arrow" href="'.esc_url($link).'">Explore project <span class="ar">→</span></a><span class="rule-gold"></span></div>';
    if($reverse) echo '<a class="zoom" data-cursor="View project" href="'.esc_url($link).'" style="position:relative;min-height:460px"><img src="'.esc_url($img).'" alt="'.esc_attr(get_the_title($pid).' in '.$city->name).'" loading="lazy" /></a>';
    echo '</article>';
}

function cheops_contact_form_handler() {
    if (!isset($_POST['cheops_contact_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cheops_contact_nonce'])),'cheops_contact_form')) wp_die('Invalid request.');
    $name=sanitize_text_field(wp_unslash($_POST['name'] ?? ''));
    $phone=sanitize_text_field(wp_unslash($_POST['phone'] ?? ''));
    $email=sanitize_email(wp_unslash($_POST['email'] ?? ''));
    $interest=sanitize_text_field(wp_unslash($_POST['interest'] ?? ''));
    $message=sanitize_textarea_field(wp_unslash($_POST['message'] ?? ''));
    if(!$name || !$phone){ wp_safe_redirect(add_query_arg('contact','missing',home_url('/contact/'))); exit; }
    $to=cheops_email(); if(!$to) $to=get_option('admin_email');
    $subject='Cheops Privé enquiry — '.$name;
    $body="Name: {$name}\nPhone: {$phone}\nEmail: {$email}\nInterest: {$interest}\n\nMessage:\n{$message}";
    $headers=[]; if($email) $headers[]='Reply-To: '.$name.' <'.$email.'>';
    wp_mail($to,$subject,$body,$headers);
    wp_safe_redirect(add_query_arg('contact','sent',home_url('/contact/'))); exit;
}
add_action('admin_post_nopriv_cheops_contact','cheops_contact_form_handler');
add_action('admin_post_cheops_contact','cheops_contact_form_handler');

function cheops_arrow_icon() {
    return '<svg class="csi-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 8L8 2M8 2H3.5M8 2V6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function cheops_arrow_icon_right() {
    return '<svg class="csi-arrow csi-arrow--right" width="13" height="9" viewBox="0 0 13 9" fill="none" aria-hidden="true"><path d="M0.5 4.5H12M12 4.5L8 0.5M12 4.5L8 8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function cheops_chevron_icon() {
    return '<svg class="chev" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function cheops_site_header() {
    $links=[['Home',home_url('/')],['Properties',home_url('/properties/')],['About',home_url('/about/')]];
    $services=[['For Rent',home_url('/for-rent/')],['For Sale',home_url('/for-sale/')],['Income Property',home_url('/income-property/')],['Private Consultation',home_url('/private-consultation/')]];
    $portfolio_url='https://drive.google.com/file/d/1IWzDaMAfqADJ9Q7PQqQWh1xkTe1FGzSa/view';
    $profile_url='https://drive.google.com/file/d/1cU9hcaD1U06zxxGTvaEV_n3pwDZKi_YM/view?usp=drive_link';
    echo '<header class="cheops-site-header" id="cheopsSiteHeader"><div class="cheops-site-header-inner">';
    echo '<a class="cheops-brand cheops-logo-crop" href="'.esc_url(home_url('/')).'" aria-label="Cheops Privé home"><span class="cheops-wordmark" aria-hidden="true"><strong>CHEOPS</strong><small>PRIVÉ</small></span></a>';
    echo '<nav class="cheops-desktop-nav" aria-label="Primary navigation">';
    foreach($links as $l) echo '<a href="'.esc_url($l[1]).'">'.esc_html($l[0]).'</a>';
    echo '<div class="cheops-nav-drop"><button type="button">Services '.cheops_chevron_icon().'</button><div class="cheops-nav-drop-panel">';
    foreach($services as $l) echo '<a href="'.esc_url($l[1]).'">'.esc_html($l[0]).'<span>'.cheops_arrow_icon().'</span></a>';
    echo '</div></div><a href="'.esc_url(home_url('/contact/')).'">Contact</a></nav>';
    echo '<div class="cheops-header-actions"><a class="cheops-header-cta cheops-header-doc" href="'.esc_url($portfolio_url).'" target="_blank" rel="noopener">Residential</a><a class="cheops-header-cta cheops-header-doc cheops-header-doc-alt" href="'.esc_url($profile_url).'" target="_blank" rel="noopener">Administrative</a><button class="cheops-mobile-toggle" id="cheopsMobileToggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button></div></div></header>';
    echo '<aside class="cheops-mobile-menu" id="cheopsMobileMenu" aria-hidden="true"><div class="cheops-mobile-menu-glow"></div><div class="cheops-mobile-menu-inner"><div class="cheops-mobile-menu-kicker">Cheops Privé <span>Private Property Advisory</span></div><nav class="cheops-mobile-nav" aria-label="Mobile navigation">';
    $delay=0; foreach($links as $l){$delay+=1; echo '<a class="mobile-main-link" style="--d:'.($delay*55).'ms" href="'.esc_url($l[1]).'"><span>'.esc_html($l[0]).'</span><b>'.cheops_arrow_icon().'</b></a>';}
    $delay+=1; echo '<div class="cheops-mobile-services" style="--d:'.($delay*55).'ms"><button class="cheops-mobile-services-toggle" type="button" aria-expanded="false"><span>Services</span><b>＋</b></button><div class="cheops-mobile-services-panel"><div>';
    foreach($services as $l) echo '<a href="'.esc_url($l[1]).'">'.esc_html($l[0]).'<span>'.cheops_arrow_icon().'</span></a>';
    echo '</div></div></div>';
    $delay+=1; echo '<a class="mobile-main-link" style="--d:'.($delay*55).'ms" href="'.esc_url(home_url('/contact/')).'"><span>Contact</span><b>'.cheops_arrow_icon().'</b></a></nav><div class="cheops-mobile-menu-foot"><a href="'.esc_url($portfolio_url).'" target="_blank" rel="noopener">Residential ↗</a><a href="'.esc_url($profile_url).'" target="_blank" rel="noopener">Administrative ↗</a><a href="'.esc_url(cheops_phone_url()).'">'.esc_html(cheops_phone_display()).'</a><a href="mailto:'.esc_attr(cheops_email()).'">'.esc_html(cheops_email()).'</a></div></div></aside>';
}

function cheops_unified_front_css() {
    echo '<style id="cheops-unified-theme-css">
      body > header.nav#nav, body > .menu#menu, footer:not(.cheops-site-footer){display:none!important}
      .cheops-site-header{position:fixed;z-index:9999;left:0;right:0;top:18px;padding:0 22px;pointer-events:none;transition:.35s ease}.admin-bar .cheops-site-header{top:50px}
      .cheops-site-header-inner{max-width:1320px;margin:0 auto;height:74px;padding:0 18px 0 22px;border:1px solid rgba(255,255,255,.2);background:rgba(10,10,10,.38);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);display:flex;align-items:center;justify-content:space-between;gap:24px;border-radius:20px;box-shadow:0 18px 50px -32px rgba(0,0,0,.62);pointer-events:auto;transition:.35s cubic-bezier(.16,1,.3,1)}
      .cheops-site-header.is-scrolled .cheops-site-header-inner,.single-cheops_unit .cheops-site-header-inner,.page-template-page-contact .cheops-site-header-inner{background:rgba(250,248,244,.94);border-color:rgba(30,30,30,.09);box-shadow:0 22px 55px -36px rgba(0,0,0,.45)}
      .cheops-logo-crop{display:block;width:145px;height:42px;overflow:hidden;border-radius:4px;position:relative;background:#000;flex:0 0 auto}.cheops-logo-crop>span{position:absolute;inset:0;background-repeat:no-repeat;background-size:215% auto;background-position:center 50%}
      .cheops-desktop-nav{display:flex;align-items:center;gap:27px}.cheops-desktop-nav>a,.cheops-nav-drop>button{appearance:none;border:0;background:none;color:#fff;text-decoration:none;font:600 10px/1 Arial,sans-serif;letter-spacing:.09em;cursor:pointer;padding:29px 0;white-space:nowrap;transition:.2s}.cheops-site-header.is-scrolled .cheops-desktop-nav>a,.cheops-site-header.is-scrolled .cheops-nav-drop>button,.single-cheops_unit .cheops-desktop-nav>a,.single-cheops_unit .cheops-nav-drop>button,.page-template-page-contact .cheops-desktop-nav>a,.page-template-page-contact .cheops-nav-drop>button{color:#242424}.cheops-desktop-nav a:hover,.cheops-nav-drop>button:hover{opacity:.56}
      .cheops-nav-drop{position:relative}.cheops-nav-drop .chev{display:inline-block;margin-left:5px;transition:transform .25s}.cheops-nav-drop:hover .chev{transform:rotate(180deg)}.cheops-nav-drop-panel{position:absolute;top:66px;left:50%;transform:translate(-50%,12px) scale(.98);width:320px;padding:10px;background:#fff;color:#171717;border:1px solid rgba(0,0,0,.08);box-shadow:0 28px 70px rgba(0,0,0,.18);border-radius:17px;opacity:0;visibility:hidden;transition:.28s cubic-bezier(.16,1,.3,1)}.cheops-nav-drop:hover .cheops-nav-drop-panel,.cheops-nav-drop:focus-within .cheops-nav-drop-panel{opacity:1;visibility:visible;transform:translate(-50%,0) scale(1)}.cheops-nav-drop-panel a{display:flex;align-items:center;justify-content:space-between;color:#171717!important;text-decoration:none;padding:14px 13px;border-radius:11px;font:600 11px/1.3 Arial,sans-serif}.cheops-nav-drop-panel a:hover{background:#f4f0e8;opacity:1}
      .cheops-header-actions{display:flex;align-items:center;gap:10px}.cheops-header-cta{background:#fff;color:#171717;text-decoration:none;padding:14px 18px;border-radius:999px;font:800 8px/1 Arial,sans-serif;letter-spacing:.11em;text-transform:uppercase}.cheops-site-header.is-scrolled .cheops-header-cta,.single-cheops_unit .cheops-header-cta,.page-template-page-contact .cheops-header-cta{background:#171717;color:#fff}
      .cheops-mobile-toggle{display:none;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.04);position:relative;cursor:pointer}.cheops-mobile-toggle span{position:absolute;left:12px;right:12px;height:1px;background:#fff;top:18px;transition:.35s cubic-bezier(.16,1,.3,1)}.cheops-mobile-toggle span+span{top:25px}.cheops-site-header.is-scrolled .cheops-mobile-toggle,.single-cheops_unit .cheops-mobile-toggle,.page-template-page-contact .cheops-mobile-toggle{border-color:#ddd;background:#fff}.cheops-site-header.is-scrolled .cheops-mobile-toggle span,.single-cheops_unit .cheops-mobile-toggle span,.page-template-page-contact .cheops-mobile-toggle span{background:#111}.cheops-mobile-toggle[aria-expanded="true"]{background:#fff;border-color:#fff}.cheops-mobile-toggle[aria-expanded="true"] span{background:#111!important}.cheops-mobile-toggle[aria-expanded="true"] span:first-child{top:21px;transform:rotate(45deg)}.cheops-mobile-toggle[aria-expanded="true"] span:last-child{top:21px;transform:rotate(-45deg)}
      .cheops-mobile-menu{position:fixed;inset:0;z-index:9998;background:#10100f;color:#fff;display:block;visibility:hidden;opacity:0;transform:translateY(-16px);clip-path:inset(0 0 100% 0 round 0 0 34px 34px);transition:clip-path .7s cubic-bezier(.16,1,.3,1),opacity .35s,transform .7s cubic-bezier(.16,1,.3,1),visibility 0s .7s;padding:116px 24px 28px;overflow:auto}.cheops-mobile-menu.is-open{visibility:visible;opacity:1;transform:none;clip-path:inset(0 0 0 0 round 0);transition-delay:0s}.cheops-mobile-menu-glow{position:absolute;right:-170px;top:-160px;width:480px;height:480px;background:radial-gradient(circle,rgba(213,181,120,.22),transparent 68%);pointer-events:none}.cheops-mobile-menu-inner{max-width:720px;margin:0 auto;min-height:calc(100vh - 144px);display:flex;flex-direction:column;position:relative}.cheops-mobile-menu-kicker{font:700 8px/1.4 Arial,sans-serif;text-transform:uppercase;letter-spacing:.24em;color:#d5b578;padding:0 0 24px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;gap:16px}.cheops-mobile-menu-kicker span{color:rgba(255,255,255,.35)}.cheops-mobile-nav{padding-top:18px}.mobile-main-link,.cheops-mobile-services{transform:translateY(24px);opacity:0;transition:transform .55s cubic-bezier(.16,1,.3,1),opacity .4s;transition-delay:0s}.cheops-mobile-menu.is-open .mobile-main-link,.cheops-mobile-menu.is-open .cheops-mobile-services{transform:none;opacity:1;transition-delay:var(--d,0ms)}.mobile-main-link,.cheops-mobile-services-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:20px;color:#fff;text-decoration:none;font-family:Georgia,serif;font-size:clamp(29px,8.1vw,50px);line-height:1;padding:15px 0;border:0;border-bottom:1px solid rgba(255,255,255,.1);background:none;text-align:left}.mobile-main-link b,.cheops-mobile-services-toggle b{font:400 16px/1 Arial,sans-serif;color:#d5b578}.cheops-mobile-services-toggle{cursor:pointer}.cheops-mobile-services-toggle b{transition:transform .35s}.cheops-mobile-services-toggle[aria-expanded="true"] b{transform:rotate(45deg)}.cheops-mobile-services-panel{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s cubic-bezier(.16,1,.3,1)}.cheops-mobile-services-panel>div{overflow:hidden}.cheops-mobile-services.is-expanded .cheops-mobile-services-panel{grid-template-rows:1fr}.cheops-mobile-services-panel-inner{overflow:hidden}.cheops-mobile-services-panel a{display:flex;justify-content:space-between;gap:16px;color:rgba(255,255,255,.72);text-decoration:none;padding:14px 4px;border-bottom:1px solid rgba(255,255,255,.07);font:600 11px/1.35 Arial,sans-serif;letter-spacing:.06em}.cheops-mobile-services-panel a span{color:#d5b578}.cheops-mobile-menu-foot{margin-top:auto;padding-top:30px;display:flex;gap:12px;flex-wrap:wrap}.cheops-mobile-menu-foot a{color:rgba(255,255,255,.6);font:600 10px/1.4 Arial,sans-serif;text-decoration:none;padding:10px 13px;border:1px solid rgba(255,255,255,.13);border-radius:999px}
      .cheops-city-projects{padding-bottom:92px}.cheops-city-projects-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}.cheops-city-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:50px}.cheops-city-tab{appearance:none;border:0;padding:0;min-height:260px;border-radius:26px;overflow:hidden;position:relative;text-align:left;cursor:pointer;background:#171717;color:#fff;isolation:isolate}.cheops-city-tab-bg,.cheops-city-tab-shade{position:absolute;inset:0}.cheops-city-tab-bg{background-size:cover;background-position:center;z-index:-2;transition:transform .75s cubic-bezier(.16,1,.3,1),filter .4s}.cheops-city-tab-shade{z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.78))}.cheops-city-tab-copy{position:absolute;inset:auto 26px 25px;display:grid;gap:8px}.cheops-city-tab-copy small{font:800 8px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.2em;color:#d5b578}.cheops-city-tab-copy strong{font-size:clamp(1.8rem,3.6vw,3.42rem);font-weight:400}.cheops-city-tab-copy em{font:700 9px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.17em;font-style:normal;color:rgba(255,255,255,.72)}.cheops-city-tab.is-active{outline:2px solid #d5b578;outline-offset:4px}.cheops-city-tab:hover .cheops-city-tab-bg,.cheops-city-tab.is-active .cheops-city-tab-bg{transform:scale(1.06);filter:saturate(.9)}.cheops-project-stage{margin-top:58px}.cheops-project-group{display:none}.cheops-project-group.is-active{display:block;animation:cheopsProjectIn .55s cubic-bezier(.16,1,.3,1)}@keyframes cheopsProjectIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}.cheops-project-dynamic .zoom img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.cheops-project-copy{padding:40px 0 56px}.cheops-project-copy.is-reverse{order:1;padding-right:48px}.cheops-project-copy h3{font-size:clamp(1.8rem,3.24vw,3.06rem);margin:14px 0 0}.cheops-project-desc{margin-top:16px;font-size:.855rem;line-height:1.8;color:var(--muted);max-width:460px}.cheops-project-copy dl{margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:.81rem}.cheops-project-copy dd{margin:5px 0 0}.cheops-project-copy dl .d{font-size:1.17rem}.cheops-project-copy .link-arrow{margin-top:29px;display:inline-block;font-size:.54rem;font-weight:800;letter-spacing:.24em;text-transform:uppercase}.cheops-project-copy .rule-gold{display:block;width:48px;margin-top:24px}
      .cheops-site-footer{background:#11100f;color:#f3efe8;padding:74px 24px 28px;margin-top:0}.cheops-site-footer-inner{max-width:1320px;margin:0 auto}.cheops-footer-top{display:grid;grid-template-columns:.9fr 1.1fr;gap:70px;padding-bottom:52px}.cheops-footer-logo{display:block;width:190px;height:58px;overflow:hidden;background:#000;position:relative;border-radius:5px}.cheops-footer-logo span{position:absolute;inset:0;background-repeat:no-repeat;background-size:215% auto;background-position:center 50%}.cheops-footer-tagline{font-family:Georgia,serif;font-size:clamp(1.8rem,3.6vw,4.05rem);line-height:1.02;max-width:620px;margin:28px 0 0}.cheops-footer-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.cheops-footer-col h4{font:800 8px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.22em;color:#d5b578;margin:0 0 16px}.cheops-footer-col a,.cheops-footer-col p{display:block;color:rgba(255,255,255,.62);font:500 11px/1.65 Arial,sans-serif;text-decoration:none;margin:0 0 8px}.cheops-footer-col a:hover{color:#fff}.cheops-footer-bottom{border-top:1px solid rgba(255,255,255,.12);padding-top:22px;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;color:rgba(255,255,255,.35);font:600 8px/1.4 Arial,sans-serif;text-transform:uppercase;letter-spacing:.14em}
      #pre{display:none!important}body:not(.home) #cheops-video-preloader{display:none!important}.home.cheops-preloader-seen #cheops-video-preloader{display:none!important}.cheops-unit-card .property-contact-actions{margin-top:auto}.cheops-card-media{border-radius:0!important}.cheops-unit-card .save-property{border-radius:50%}
      @media(max-width:980px){.cheops-desktop-nav,.cheops-header-cta{display:none}.cheops-mobile-toggle{display:block}.cheops-site-header{padding:0 12px;top:10px}.admin-bar .cheops-site-header{top:42px}.cheops-site-header-inner{height:64px;border-radius:16px;padding:0 10px 0 13px}.cheops-logo-crop{width:118px;height:35px}.cheops-city-tabs{grid-template-columns:1fr 1fr}.cheops-footer-top{grid-template-columns:1fr;gap:45px}}
      @media(max-width:640px){.cheops-mobile-menu{padding:96px 18px 22px}.cheops-mobile-menu-kicker span{display:none}.cheops-city-tabs{grid-template-columns:1fr;gap:13px;margin-top:34px}.cheops-city-tab{min-height:190px;border-radius:20px}.cheops-project-stage{margin-top:40px}.cheops-project-copy.is-reverse{padding-right:0}.cheops-project-copy dl{grid-template-columns:1fr 1fr;gap:16px}.cheops-project-dynamic{display:flex!important;flex-direction:column}.cheops-project-dynamic .zoom,.cheops-project-copy,.cheops-project-copy.is-reverse{order:initial!important}.cheops-footer-cols{grid-template-columns:1fr}.cheops-site-footer{padding:58px 18px 24px}}
      .csi-arrow{display:inline-block;vertical-align:-1px;flex:0 0 auto;transition:transform .3s cubic-bezier(.16,1,.3,1)}
      a:hover .csi-arrow,button:hover .csi-arrow{transform:translate(3px,-3px)}
      a:hover .csi-arrow.csi-arrow--right,button:hover .csi-arrow.csi-arrow--right{transform:translateX(4px)}
    
</style>';
}
add_action('wp_head','cheops_unified_front_css',99);

function cheops_site_footer() {
    $fb='https://www.facebook.com/cheopsprive';
    $ig='https://www.instagram.com/cheopsprive/?hl=en';
    $li='https://www.linkedin.com/company/cheopsprive';
    echo '<footer class="cheops-site-footer"><div class="cheops-site-footer-inner">';
    echo '<div class="cheops-footer-main">';
    echo '<div class="cheops-footer-brand"><a class="cheops-footer-wordmark" href="'.esc_url(home_url('/')).'" aria-label="Cheops Privé home"><span class="cheops-wordmark"><strong>CHEOPS</strong><small>PRIVÉ</small></span></a><p>Curated property guidance across Egypt’s secondary market residential and business destinations</p><a class="cheops-footer-cta" href="'.esc_url(home_url('/contact/')).'">Start a conversation <span>→</span></a></div>';
    echo '<div class="cheops-footer-col"><h4>Explore</h4><a href="'.esc_url(home_url('/properties/')).'">All properties</a><a href="'.esc_url(home_url('/properties/?type=Residential')).'">Residences</a><a href="'.esc_url(home_url('/properties/?type=Office')).'">Offices</a><a href="'.esc_url(home_url('/about/')).'">About</a></div>';
    echo '<div class="cheops-footer-col"><h4>Services</h4><a href="'.esc_url(home_url('/for-rent/')).'">For Rent</a><a href="'.esc_url(home_url('/for-sale/')).'">For Sale</a><a href="'.esc_url(home_url('/income-property/')).'">Income Property</a><a href="'.esc_url(home_url('/private-consultation/')).'">Private Consultation</a></div>';
    echo '<div class="cheops-footer-col cheops-footer-contact"><h4>Contact</h4><p>'.esc_html(cheops_address()).'</p><a href="'.esc_url(cheops_phone_url()).'">'.esc_html(cheops_phone_display()).'</a><a href="mailto:'.esc_attr(cheops_email()).'">'.esc_html(cheops_email()).'</a></div>';
    echo '</div>';
    echo '<div class="cheops-footer-lower"><div class="cheops-footer-social"><a href="'.esc_url($fb).'" target="_blank" rel="noopener">Facebook ↗</a><a href="'.esc_url($ig).'" target="_blank" rel="noopener">Instagram ↗</a><a href="'.esc_url($li).'" target="_blank" rel="noopener">LinkedIn ↗</a></div><div class="cheops-footer-meta"><span>© '.esc_html(date('Y')).' Cheops Privé</span><span>Curated property in Egypt</span></div></div>';
    echo '</div></footer>';
}
add_action('wp_footer','cheops_site_footer',5);

function cheops_unified_front_js() {
    ?>
    <script id="cheops-unified-theme-js">
    (function(){
      const header=document.getElementById('cheopsSiteHeader'), toggle=document.getElementById('cheopsMobileToggle'), menu=document.getElementById('cheopsMobileMenu');
      if(header){const sync=()=>header.classList.toggle('is-scrolled',window.scrollY>46);sync();addEventListener('scroll',sync,{passive:true});}
      function closeMenu(){if(!toggle||!menu)return;toggle.setAttribute('aria-expanded','false');menu.classList.remove('is-open');menu.setAttribute('aria-hidden','true');document.documentElement.style.overflow='';}
      if(toggle&&menu){toggle.addEventListener('click',()=>{const next=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(next));menu.classList.toggle('is-open',next);menu.setAttribute('aria-hidden',String(!next));document.documentElement.style.overflow=next?'hidden':'';});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));}
      const svc=document.querySelector('.cheops-mobile-services'),svcBtn=document.querySelector('.cheops-mobile-services-toggle'),svcPanel=document.querySelector('.cheops-mobile-services-panel');
      if(svc&&svcBtn&&svcPanel){const inner=document.createElement('div');inner.className='cheops-mobile-services-panel-inner';while(svcPanel.firstChild)inner.appendChild(svcPanel.firstChild);svcPanel.appendChild(inner);svcBtn.addEventListener('click',()=>{const open=svcBtn.getAttribute('aria-expanded')==='true';svcBtn.setAttribute('aria-expanded',String(!open));svc.classList.toggle('is-expanded',!open);});}
      try{const key='cheops_preloader_seen_v10',pre=document.getElementById('cheops-video-preloader');if(document.body.classList.contains('home')){if(sessionStorage.getItem(key)){document.body.classList.add('cheops-preloader-seen');if(pre)pre.remove();}else sessionStorage.setItem(key,'1');}else if(pre)pre.remove();}catch(e){}
      document.querySelectorAll('form[data-search]').forEach(form=>{const cards=[...document.querySelectorAll('#propGrid > article.pcard')];[['loc','loc'],['type','type']].forEach(([name,dataKey])=>{const sel=form.querySelector('select[name="'+name+'"]');if(!sel)return;const existing=new Set([...sel.options].map(o=>o.value));[...new Set(cards.map(c=>c.dataset[dataKey]).filter(Boolean))].sort().forEach(v=>{if(!existing.has(v)){const o=document.createElement('option');o.value=v;o.textContent=v;sel.appendChild(o);}});});});
      const count=document.getElementById('resultCount');if(count){const n=document.querySelectorAll('#propGrid > article.pcard').length;count.textContent=n+' '+(n===1?'property':'properties');}
      // Query-driven office/property shortcuts.
      const params=new URLSearchParams(location.search), searchForm=document.querySelector('#property-search form[data-search], form[data-search]');
      if(searchForm && (params.has('deal')||params.has('type')||params.has('loc')||params.has('project')||params.has('beds')||params.has('min')||params.has('max'))){['deal','type','loc','project','beds','min','max'].forEach(n=>{const el=searchForm.querySelector('[name="'+n+'"]');if(el&&params.get(n)!==null)el.value=params.get(n);});setTimeout(()=>searchForm.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})),80);}
      // City -> Projects interaction.
      const cityTabs=[...document.querySelectorAll('.cheops-city-tab')],groups=[...document.querySelectorAll('.cheops-project-group')];cityTabs.forEach(tab=>tab.addEventListener('click',()=>{const key=tab.dataset.city;cityTabs.forEach(b=>{const on=b===tab;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',String(on));});groups.forEach(g=>g.classList.toggle('is-active',g.dataset.projectCity===key));const stage=document.querySelector('.cheops-project-stage');if(stage&&window.innerWidth<700)stage.scrollIntoView({behavior:'smooth',block:'start'});}));
    })();
    </script>
    <?php
}
add_action('wp_footer','cheops_unified_front_js',99);

function cheops_flush_rewrites_once() {
    if (get_option('cheops_units_rewrite_v2') !== '1') {
        cheops_register_units(); flush_rewrite_rules(); update_option('cheops_units_rewrite_v2','1');
    }
}
add_action('admin_init','cheops_flush_rewrites_once');


/* =========================================================
 * V5 — unified identity + dedicated city pages
 * ========================================================= */
function cheops_v5_identity_css() {
    echo '<style id="cheops-v5-identity-css">
      /* Logo: preserve the supplied artwork exactly; no card, crop or background behind it. */
      .cheops-logo-crop{width:156px!important;height:48px!important;background:transparent!important;border-radius:0!important;overflow:visible!important;display:flex!important;align-items:center!important;box-shadow:none!important}
      .cheops-logo-crop img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:left center!important;background:transparent!important;border-radius:0!important}
      .cheops-footer-logo{display:block!important;width:210px!important;height:auto!important;overflow:visible!important;background:transparent!important;border-radius:0!important;box-shadow:none!important}
      .cheops-footer-logo img{display:block!important;width:100%!important;height:auto!important;object-fit:contain!important;background:transparent!important;border-radius:0!important}
      /* One typography / spacing / motion language across every WordPress page. */
      body.cheops-prive-theme,body.cheops-contact-page,body.single-cheops_unit,body.tax-project_city{font-family:"Romie",Georgia,"Times New Roman",serif!important;-webkit-font-smoothing:antialiased}
      body.cheops-prive-theme h1,body.cheops-prive-theme h2,body.cheops-prive-theme h3,body.cheops-prive-theme h4,body.cheops-prive-theme .d,
      body.cheops-contact-page h1,body.cheops-contact-page h2,body.cheops-contact-page h3,
      body.single-cheops_unit h1,body.single-cheops_unit h2,body.single-cheops_unit h3,
      body.tax-project_city h1,body.tax-project_city h2,body.tax-project_city h3{font-family:"Romie",Georgia,"Times New Roman",serif!important;font-weight:400}
      .cheops-site-header,.cheops-site-footer,.cheops-mobile-menu{font-family:"Romie",Georgia,"Times New Roman",serif}
      .cheops-desktop-nav>a,.cheops-nav-drop>button,.cheops-nav-drop-panel a,.cheops-header-cta,.cheops-mobile-menu-kicker,.cheops-mobile-services-panel a,.cheops-mobile-menu-foot a{font-family:inherit!important}
      .cheops-global-reveal{opacity:0;transform:translateY(28px);transition:opacity .85s cubic-bezier(.16,1,.3,1),transform .85s cubic-bezier(.16,1,.3,1);will-change:opacity,transform}
      .cheops-global-reveal.is-inview{opacity:1;transform:none}
      .cheops-global-reveal.cheops-delay-1{transition-delay:.08s}.cheops-global-reveal.cheops-delay-2{transition-delay:.16s}.cheops-global-reveal.cheops-delay-3{transition-delay:.24s}
      /* Home city cards are links only; projects live on their own city page. */
      .cheops-city-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:50px}
      .cheops-city-link{min-height:300px;border-radius:26px;overflow:hidden;position:relative;text-align:left;background:#171717;color:#fff;isolation:isolate;text-decoration:none;display:block}
      .cheops-city-link .cheops-city-tab-bg,.cheops-city-link .cheops-city-tab-shade{position:absolute;inset:0}
      .cheops-city-link .cheops-city-tab-bg{background-size:cover;background-position:center;z-index:-2;transition:transform .8s cubic-bezier(.16,1,.3,1),filter .5s}
      .cheops-city-link .cheops-city-tab-shade{z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.82))}
      .cheops-city-link .cheops-city-tab-copy{position:absolute;inset:auto 28px 28px;display:grid;gap:9px}
      .cheops-city-link .cheops-city-tab-copy small{font-size:8px;text-transform:uppercase;letter-spacing:.2em;color:#d5b578;font-weight:700}
      .cheops-city-link .cheops-city-tab-copy strong{font-size:clamp(1.98rem,3.6vw,3.6rem);font-weight:400;line-height:.95}
      .cheops-city-link .cheops-city-tab-copy em{font-size:9px;text-transform:uppercase;letter-spacing:.17em;font-style:normal;color:rgba(255,255,255,.72)}
      .cheops-city-link:hover .cheops-city-tab-bg{transform:scale(1.055);filter:saturate(.88)}
      .cheops-city-link:hover .cheops-city-tab-copy em b{display:inline-block;transform:translateX(7px)}
      /* Dedicated city page. */
      body.tax-project_city{margin:0;background:#f7f5f2;color:#1a1a1a;overflow-x:hidden}
      body.tax-project_city *,body.tax-project_city *:before,body.tax-project_city *:after{box-sizing:border-box}
      .cheops-city-page{background:#f7f5f2;color:#1a1a1a;min-height:100vh}
      .cheops-city-page a{color:inherit}
      .cheops-city-page .eyebrow{font-size:.558rem;letter-spacing:.22em;text-transform:uppercase;font-weight:700}.cheops-city-page .eyebrow.gold{color:#9a7440}
      .cheops-city-page .meta{font-size:.522rem;letter-spacing:.19em;text-transform:uppercase;color:#837c73}
      .cheops-city-page .proj{display:grid;grid-template-columns:1.15fr .85fr;align-items:stretch;gap:28px;padding:22px;border-radius:32px;background:rgba(255,255,255,.8);border:1px solid rgba(26,26,26,.08);box-shadow:0 30px 80px -60px rgba(0,0,0,.45);overflow:hidden}
      .cheops-city-page .zoom{display:block;overflow:hidden;border-radius:22px;background:#ddd;position:relative}.cheops-city-page .zoom img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.16,1,.3,1)}.cheops-city-page .zoom:hover img{transform:scale(1.035)}
      .cheops-city-page .cheops-project-copy{padding:40px 28px 48px 10px}.cheops-city-page .cheops-project-copy.is-reverse{order:1;padding:40px 10px 48px 28px}
      .cheops-city-page .cheops-project-copy h3{font-size:clamp(2.25rem,3.78vw,4.32rem);line-height:.92;letter-spacing:-.035em;margin:16px 0 0}
      .cheops-city-page .cheops-project-desc{margin-top:18px;line-height:1.85;color:#77716a;max-width:520px}
      .cheops-city-page .cheops-project-copy dl{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:34px 0 0}.cheops-city-page .cheops-project-copy dt,.cheops-city-page .cheops-project-copy dd{margin:0}.cheops-city-page .cheops-project-copy dd{margin-top:7px}.cheops-city-page .cheops-project-copy dd.d{font-size:1.215rem}
      .cheops-city-page .link-arrow{display:inline-flex;gap:14px;align-items:center;margin-top:34px;text-decoration:none;font-size:.558rem;letter-spacing:.2em;text-transform:uppercase;font-weight:700}.cheops-city-page .link-arrow .ar{transition:transform .3s}.cheops-city-page .link-arrow:hover .ar{transform:translateX(7px)}
      .cheops-city-page .rule-gold{display:block;width:54px;height:1px;background:#b58d52;margin-top:24px}
      .cheops-city-hero{position:relative;min-height:76vh;display:flex;align-items:flex-end;color:#fff;overflow:hidden;background:#111}
      .cheops-city-hero-media{position:absolute;inset:-3%;background-size:cover;background-position:center;transform:scale(1.03)}
      .cheops-city-hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.22),rgba(0,0,0,.72) 75%,rgba(0,0,0,.92))}
      .cheops-city-hero-content{position:relative;z-index:2;width:min(1320px,calc(100% - 48px));margin:0 auto;padding:190px 0 72px}
      .cheops-city-hero-kicker{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#d5b578;margin:0 0 18px}
      .cheops-city-hero-title{font-size:clamp(3.87rem,9vw,9rem);line-height:.82;letter-spacing:-.055em;margin:0;max-width:1100px}
      .cheops-city-hero-meta{display:flex;gap:18px;flex-wrap:wrap;margin-top:28px;color:rgba(255,255,255,.68);font-size:11px;letter-spacing:.08em;text-transform:uppercase}
      .cheops-city-intro{width:min(1320px,calc(100% - 48px));margin:0 auto;padding:92px 0 48px;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:80px;align-items:start}
      .cheops-city-intro h2{font-size:clamp(2.7rem,5.4vw,6.12rem);line-height:.9;letter-spacing:-.045em;margin:0}
      .cheops-city-intro-copy{color:#77716a;font-size:14px;line-height:1.9;max-width:640px}
      .cheops-city-project-list{width:min(1320px,calc(100% - 48px));margin:0 auto;padding:12px 0 110px}
      .cheops-city-project-row{margin-bottom:42px!important}
      .cheops-city-back{display:inline-flex;align-items:center;gap:12px;color:#1a1a1a;text-decoration:none;font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:34px}
      @media(max-width:980px){.cheops-logo-crop{width:126px!important;height:38px!important}.cheops-city-links{grid-template-columns:1fr 1fr}.cheops-city-intro{grid-template-columns:1fr;gap:28px}.cheops-city-hero{min-height:68vh}}
      @media(max-width:640px){.cheops-city-links{grid-template-columns:1fr;gap:13px;margin-top:34px}.cheops-city-link{min-height:215px;border-radius:20px}.cheops-city-hero-content,.cheops-city-intro,.cheops-city-project-list{width:min(100% - 32px,1320px)}.cheops-city-hero-content{padding:150px 0 48px}.cheops-city-hero-title{font-size:clamp(3.06rem,17.1vw,5.22rem)}.cheops-city-intro{padding:58px 0 27px}.cheops-city-project-list{padding-bottom:65px}.cheops-city-page .proj{display:flex;flex-direction:column;padding:12px;gap:0}.cheops-city-page .zoom{min-height:300px!important}.cheops-city-page .cheops-project-copy,.cheops-city-page .cheops-project-copy.is-reverse{order:initial!important;padding:28px 12px 32px}.cheops-city-page .cheops-project-copy dl{grid-template-columns:1fr 1fr}}
      @media(prefers-reduced-motion:reduce){.cheops-global-reveal{opacity:1!important;transform:none!important;transition:none!important}}
    
</style>';
}
add_action('wp_head','cheops_v5_identity_css',120);

function cheops_v5_identity_js() { ?>
<script id="cheops-v5-identity-js">
(function(){
  const selectors=[
    '.cheops-contact-page .contact-hero-inner > *','.cheops-contact-page .contact-main-grid > *','.cheops-contact-page .contact-location-card > *',
    '.single-cheops_unit .sp-gallery','.single-cheops_unit .sp-layout > *','.single-cheops_unit .sp-section > *','.single-cheops_unit .sp-related-head','.single-cheops_unit .sp-related-card',
    '.tax-project_city .cheops-city-hero-content > *','.tax-project_city .cheops-city-intro > *','.tax-project_city .cheops-city-project-row',
    '.cheops-prive-theme .cheops-city-link'
  ];
  const nodes=[...document.querySelectorAll(selectors.join(','))];
  nodes.forEach((el,i)=>{if(!el.classList.contains('reveal')){el.classList.add('cheops-global-reveal','cheops-delay-'+((i%3)+1));}});
  if(!('IntersectionObserver' in window)){nodes.forEach(n=>n.classList.add('is-inview'));return;}
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-inview');io.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -8% 0px'});
  nodes.forEach(n=>io.observe(n));
})();
</script>
<?php }
add_action('wp_footer','cheops_v5_identity_js',110);

function cheops_flush_rewrites_v5() {
    if (get_option('cheops_rewrite_v5') !== '1') {
        cheops_register_projects(); cheops_register_units(); flush_rewrite_rules(); update_option('cheops_rewrite_v5','1');
    }
}
add_action('admin_init','cheops_flush_rewrites_v5',30);


/* =========================================================
 * V6 — one visual system everywhere
 * ========================================================= */
function cheops_v6_motion_assets() {
    if ( is_admin() ) return;
    wp_enqueue_script('cheops-gsap','https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',[], '3.12.5', true);
    wp_enqueue_script('cheops-scrolltrigger','https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js',['cheops-gsap'], '3.12.5', true);
}
add_action('wp_enqueue_scripts','cheops_v6_motion_assets',20);

function cheops_v6_design_system_css() {
    echo '<style id="cheops-v6-design-system">
    :root{--cheops-ink:#1a1a1a;--cheops-gold:#e5cfa7;--cheops-gold-deep:#b58d52;--cheops-line:rgba(26,26,26,.12);--cheops-muted:#6f6f6f;--cheops-ease:cubic-bezier(.16,1,.3,1)}

    /* One type language. */
    body.cheops-prive-theme{font-family:"Romie",Georgia,"Times New Roman",serif!important;color:var(--cheops-ink)}
    body.cheops-prive-theme h1,body.cheops-prive-theme h2,body.cheops-prive-theme h3,body.cheops-prive-theme h4,
    body.cheops-prive-theme .d,body.cheops-prive-theme .sp-title,body.cheops-prive-theme .sp-price,
    body.cheops-prive-theme .cheops-footer-tagline{font-family:"Romie",Georgia,"Times New Roman",serif!important;font-weight:400!important;letter-spacing:-.02em}
    body.cheops-prive-theme .eyebrow,body.cheops-prive-theme .meta,body.cheops-prive-theme .sp-eyebrow,
    body.cheops-prive-theme .contact-eyebrow,body.cheops-prive-theme .cheops-city-hero-kicker{letter-spacing:.24em;text-transform:uppercase;font-weight:700}

    /* Supplied logo, untouched. No crop, no backing card, no filter. */
    .cheops-logo-crop{width:224px!important;height:58px!important;display:flex!important;align-items:center!important;overflow:visible!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;padding:0!important}
    .cheops-logo-crop img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:left center!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;filter:none!important}
    .cheops-footer-logo{width:270px!important;height:auto!important;display:block!important;overflow:visible!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;padding:0!important}
    .cheops-footer-logo img{display:block!important;width:100%!important;height:auto!important;object-fit:contain!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;filter:none!important}

    /* Header — same floating treatment everywhere. */
    .cheops-site-header{top:20px!important;padding:0 24px!important}
    .admin-bar .cheops-site-header{top:52px!important}
    .cheops-site-header-inner{max-width:1460px!important;height:82px!important;padding:0 20px 0 24px!important;border-radius:22px!important;background:rgba(12,12,12,.34)!important;border:1px solid rgba(255,255,255,.18)!important;box-shadow:0 24px 70px -48px rgba(0,0,0,.7)!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important}
    .cheops-site-header.is-scrolled .cheops-site-header-inner,.single-cheops_unit .cheops-site-header-inner,.page-template-page-contact .cheops-site-header-inner{background:rgba(255,255,255,.92)!important;border-color:rgba(26,26,26,.1)!important;box-shadow:0 24px 70px -50px rgba(0,0,0,.42)!important}
    .cheops-desktop-nav{gap:30px!important}
    .cheops-desktop-nav>a,.cheops-nav-drop>button{font-family:inherit!important;font-size:10px!important;line-height:1!important;font-weight:600!important;letter-spacing:.1em!important;text-transform:uppercase!important}
    .cheops-nav-drop-panel{border-radius:20px!important;padding:10px!important;box-shadow:0 28px 70px -40px rgba(0,0,0,.48)!important}
    .cheops-nav-drop-panel a{font-family:inherit!important;font-size:11px!important;border-radius:12px!important}
    .cheops-header-cta{font-family:inherit!important;border-radius:999px!important;padding:15px 20px!important;font-size:9px!important;letter-spacing:.14em!important}

    /* One button family everywhere. */
    body.cheops-prive-theme .btn,body.cheops-prive-theme .sp-btn,body.cheops-prive-theme .contact-call,
    body.cheops-prive-theme .contact-whatsapp,body.cheops-prive-theme .contact-submit,body.cheops-prive-theme .contact-map-btn,
    body.cheops-prive-theme .property-contact-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;min-height:50px!important;padding:14px 24px!important;border-radius:999px!important;border:1px solid var(--cheops-ink)!important;background:var(--cheops-ink)!important;color:#fff!important;font-family:inherit!important;font-size:9px!important;line-height:1!important;font-weight:700!important;letter-spacing:.16em!important;text-transform:uppercase!important;text-decoration:none!important;transition:transform .5s var(--cheops-ease),background .35s,color .35s,border-color .35s!important}
    body.cheops-prive-theme .btn:hover,body.cheops-prive-theme .sp-btn:hover,body.cheops-prive-theme .contact-call:hover,
    body.cheops-prive-theme .contact-whatsapp:hover,body.cheops-prive-theme .contact-submit:hover,body.cheops-prive-theme .contact-map-btn:hover,
    body.cheops-prive-theme .property-contact-btn:hover{color:var(--cheops-gold)!important}
    body.cheops-prive-theme .btn-light,body.cheops-prive-theme .btn.light,body.cheops-prive-theme .hero .btn.ghost{background:rgba(255,255,255,.06)!important;color:#fff!important;border-color:rgba(255,255,255,.52)!important}
    body.cheops-prive-theme .btn-ghost,body.cheops-prive-theme .sp-btn.alt{background:transparent!important;color:var(--cheops-ink)!important;border-color:var(--cheops-line)!important}
    body.cheops-prive-theme .btn .ar,body.cheops-prive-theme .link-arrow .ar,body.cheops-prive-theme .property-contact-btn .ar{display:inline-block;transition:transform .5s var(--cheops-ease)}
    body.cheops-prive-theme .btn:hover .ar,body.cheops-prive-theme .link-arrow:hover .ar,body.cheops-prive-theme .property-contact-btn:hover .ar{transform:translateX(7px)}

    /* Same reveal primitives as the original home page. */
    body.cheops-prive-theme .reveal{opacity:0;transform:translateY(38px);transition:opacity 1.1s var(--cheops-ease),transform 1.1s var(--cheops-ease)}
    body.cheops-prive-theme .reveal.on{opacity:1;transform:none}
    body.cheops-prive-theme .rl{display:block;overflow:hidden}
    body.cheops-prive-theme .rl>span{display:block;transform:translateY(105%);transition:transform 1.15s var(--cheops-ease)}
    body.cheops-prive-theme .on .rl>span,body.cheops-prive-theme .rl.on>span{transform:none}
    body.cheops-prive-theme .zoom{overflow:hidden}
    body.cheops-prive-theme .zoom img{transition:transform 1.6s var(--cheops-ease)}
    body.cheops-prive-theme .zoom:hover img{transform:scale(1.07)}

    /* City page now uses the same clean, old stacked-project language. */
    body.tax-project_city{margin:0!important;background:#fff!important;color:var(--cheops-ink)!important}
    .cheops-city-page{background:#fff!important;color:var(--cheops-ink)!important}
    .cheops-city-hero{min-height:78svh!important;position:relative!important;display:flex!important;align-items:flex-end!important;overflow:hidden!important;background:#000!important;color:#fff!important}
    .cheops-city-hero-media{position:absolute!important;inset:-3%!important;background-size:cover!important;background-position:center!important;transform:scale(1.04);will-change:transform}
    .cheops-city-hero-overlay{position:absolute!important;inset:0!important;background:linear-gradient(to top,rgba(10,10,10,.88),rgba(10,10,10,.33) 48%,rgba(10,10,10,.16))!important}
    .cheops-city-hero-content{position:relative!important;z-index:2!important;width:min(1560px,calc(100% - 96px))!important;margin:0 auto!important;padding:190px 0 70px!important}
    .cheops-city-hero-title{font-size:clamp(3.78rem,8.1vw,8.55rem)!important;line-height:.88!important;letter-spacing:-.045em!important;margin:0!important;max-width:1150px!important}
    .cheops-city-hero-meta{display:flex!important;gap:22px!important;flex-wrap:wrap!important;margin-top:28px!important;font-size:9px!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:rgba(255,255,255,.68)!important}
    .cheops-city-intro{width:min(1560px,calc(100% - 96px))!important;margin:0 auto!important;padding:100px 0 64px!important;display:grid!important;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr)!important;gap:90px!important;align-items:end!important}
    .cheops-city-intro h2{font-size:clamp(2.52rem,5.04vw,4.86rem)!important;line-height:.95!important;margin:18px 0 0!important}
    .cheops-city-intro-copy{font-size:14px!important;line-height:1.9!important;color:var(--cheops-muted)!important;max-width:640px!important}
    .cheops-city-project-list{width:min(1560px,calc(100% - 96px))!important;margin:0 auto!important;padding:0 0 118px!important}
    .cheops-city-back{display:inline-flex!important;align-items:center!important;gap:12px!important;margin-bottom:28px!important;font-size:9px!important;letter-spacing:.18em!important;text-transform:uppercase!important;font-weight:700!important;text-decoration:none!important}
    .cheops-city-project-row{display:grid!important;grid-template-columns:1.15fr .85fr!important;align-items:stretch!important;gap:0!important;margin:0!important;padding:0!important;border-radius:0!important;background:transparent!important;border:0!important;border-top:1px solid var(--cheops-line)!important;box-shadow:none!important;overflow:visible!important;transform-style:preserve-3d}
    .cheops-city-project-row .zoom{min-height:540px!important;border-radius:0!important;background:#eee!important;position:relative!important}
    .cheops-city-project-row .zoom img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;border-radius:0!important}
    .cheops-city-project-row .cheops-project-copy{padding:64px 20px 64px 64px!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
    .cheops-city-project-row .cheops-project-copy.is-reverse{order:1!important;padding:64px 64px 64px 20px!important}
    .cheops-city-project-row .cheops-project-copy h3{font-size:clamp(2.43rem,3.96vw,4.68rem)!important;line-height:.92!important;letter-spacing:-.035em!important;margin:18px 0 0!important}
    .cheops-city-project-row .cheops-project-desc{font-size:14px!important;line-height:1.85!important;color:var(--cheops-muted)!important;max-width:520px!important;margin:22px 0 0!important}
    .cheops-city-project-row .cheops-project-copy dl{display:grid!important;grid-template-columns:1fr 1fr!important;gap:22px 30px!important;margin:38px 0 0!important;font-size:13px!important}
    .cheops-city-project-row .cheops-project-copy dt,.cheops-city-project-row .cheops-project-copy dd{margin:0!important}.cheops-city-project-row .cheops-project-copy dd{margin-top:7px!important}
    .cheops-city-project-row .link-arrow{display:inline-flex!important;align-items:center!important;gap:12px!important;width:max-content!important;margin-top:38px!important;font-size:9px!important;font-weight:700!important;letter-spacing:.2em!important;text-transform:uppercase!important;text-decoration:none!important}
    .cheops-city-project-row .rule-gold{width:54px!important;height:1px!important;background:var(--cheops-gold)!important;margin-top:26px!important}

    /* Footer — same type and logo treatment on every template. */
    .cheops-site-footer{background:#11100f!important;color:#f4f1ec!important;padding:82px 30px 30px!important}
    .cheops-site-footer-inner{max-width:1460px!important}
    .cheops-footer-top{grid-template-columns:.85fr 1.15fr!important;gap:80px!important;padding-bottom:62px!important}
    .cheops-footer-cols{grid-template-columns:repeat(3,1fr)!important;gap:24px!important}
    .cheops-footer-tagline{font-size:clamp(2.52rem,4.5vw,5.22rem)!important;line-height:.94!important;max-width:680px!important;margin-top:28px!important}
    .cheops-footer-col h4{font-family:inherit!important;font-size:9px!important;letter-spacing:.22em!important;color:var(--cheops-gold)!important}
    .cheops-footer-col a,.cheops-footer-col p{font-family:inherit!important;font-size:12px!important;line-height:1.6!important;color:rgba(255,255,255,.62)!important}
    .cheops-footer-col a:hover{color:var(--cheops-gold)!important}
    .cheops-footer-bottom{font-family:inherit!important;font-size:8px!important;letter-spacing:.16em!important}

    @media(max-width:1100px){
      .cheops-logo-crop{width:184px!important;height:50px!important}.cheops-desktop-nav{gap:20px!important}
      .cheops-city-hero-content,.cheops-city-intro,.cheops-city-project-list{width:min(100% - 64px,1560px)!important}
      .cheops-city-project-row .cheops-project-copy{padding-left:42px!important}.cheops-city-project-row .cheops-project-copy.is-reverse{padding-right:42px!important}
    }
    @media(max-width:980px){
      .cheops-site-header{top:12px!important;padding:0 12px!important}.admin-bar .cheops-site-header{top:44px!important}.cheops-site-header-inner{height:70px!important;border-radius:18px!important;padding:0 12px 0 16px!important}
      .cheops-logo-crop{width:170px!important;height:45px!important}.cheops-mobile-toggle{display:block!important}
      .cheops-city-intro{grid-template-columns:1fr!important;gap:32px!important}.cheops-city-project-row{grid-template-columns:1fr!important}.cheops-city-project-row .zoom{min-height:440px!important;order:0!important}.cheops-city-project-row .cheops-project-copy,.cheops-city-project-row .cheops-project-copy.is-reverse{order:1!important;padding:42px 0 62px!important}
      .cheops-footer-top{grid-template-columns:1fr!important;gap:48px!important}
    }
    @media(max-width:640px){
      .cheops-logo-crop{width:156px!important;height:42px!important}.cheops-site-header-inner{height:66px!important}
      .cheops-city-hero{min-height:72svh!important}.cheops-city-hero-content,.cheops-city-intro,.cheops-city-project-list{width:min(100% - 32px,1560px)!important}.cheops-city-hero-content{padding:150px 0 44px!important}.cheops-city-hero-title{font-size:clamp(3.15rem,16.2vw,4.95rem)!important}.cheops-city-intro{padding:61px 0 40px!important}.cheops-city-project-list{padding-bottom:74px!important}.cheops-city-project-row .zoom{min-height:288px!important}.cheops-city-project-row .cheops-project-copy,.cheops-city-project-row .cheops-project-copy.is-reverse{padding:29px 0 47px!important}.cheops-city-project-row .cheops-project-copy dl{grid-template-columns:1fr 1fr!important;gap:18px!important}.cheops-footer-logo{width:230px!important}.cheops-site-footer{padding:62px 18px 26px!important}
    }
    @media(prefers-reduced-motion:reduce){body.cheops-prive-theme .reveal,body.cheops-prive-theme .rl>span{opacity:1!important;transform:none!important;transition:none!important}}
    
</style>';
}
add_action('wp_head','cheops_v6_design_system_css',200);

function cheops_v6_motion_js() { ?>
<script id="cheops-v6-motion">
(function(){
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.cheops-global-reveal').forEach(el=>{el.classList.remove('cheops-global-reveal','cheops-delay-1','cheops-delay-2','cheops-delay-3');el.classList.add('reveal');});
  const reveals=[...document.querySelectorAll('.reveal')];
  if(reduce){reveals.forEach(el=>el.classList.add('on'));return;}
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');e.target.querySelectorAll('.rl').forEach(x=>x.classList.add('on'));io.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -7% 0px'});reveals.forEach(el=>io.observe(el));}else reveals.forEach(el=>el.classList.add('on'));

  const boot=()=>{
    if(!window.gsap||!window.ScrollTrigger)return setTimeout(boot,120);
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.tax-project_city h1.d,.tax-project_city h2.d,.tax-project_city h3.d,.cheops-contact-page h1.d,.single-cheops_unit h1,.single-cheops_unit h2').forEach(h=>{
      if(h.dataset.cheopsSplit)return;h.dataset.cheopsSplit='1';
      const walker=(node)=>[...node.childNodes].forEach(n=>{if(n.nodeType===3&&n.textContent.trim()){const frag=document.createDocumentFragment();n.textContent.split('').forEach(c=>{const sp=document.createElement('span');sp.className='ch';sp.style.display='inline-block';sp.textContent=c===' '?'\u00a0':c;frag.appendChild(sp)});n.replaceWith(frag)}else if(n.nodeType===1&&!['SCRIPT','STYLE'].includes(n.tagName))walker(n)});
      walker(h);const chars=h.querySelectorAll('.ch');if(chars.length)gsap.from(chars,{yPercent:115,opacity:0,rotate:5,duration:.95,ease:'expo.out',stagger:.012,scrollTrigger:{trigger:h,start:'top 90%',once:true}});
    });

    document.querySelectorAll('.tax-project_city .zoom img,.single-cheops_unit .sp-gallery img,.single-cheops_unit .sp-related-card img,.cheops-contact-page .contact-hero-media').forEach(img=>{
      if(img.dataset.cheopsMotion)return;img.dataset.cheopsMotion='1';
      if(img.tagName==='IMG'){
        gsap.fromTo(img,{clipPath:'inset(12% 12% 12% 12% round 18px)',scale:1.12},{clipPath:'inset(0% 0% 0% 0% round 0px)',scale:1,duration:1.45,ease:'expo.out',scrollTrigger:{trigger:img,start:'top 94%',once:true}});
        gsap.to(img,{yPercent:-7,ease:'none',scrollTrigger:{trigger:img,start:'top bottom',end:'bottom top',scrub:true}});
      }
    });

    const cityHero=document.querySelector('.cheops-city-hero-media');if(cityHero)gsap.to(cityHero,{yPercent:10,ease:'none',scrollTrigger:{trigger:'.cheops-city-hero',start:'top top',end:'bottom top',scrub:true}});

    document.querySelectorAll('.pcard,.proj,.sp-related-card,.contact-quick-card').forEach(card=>{if(card.dataset.cheopsTilt)return;card.dataset.cheopsTilt='1';card.style.transformStyle='preserve-3d';card.addEventListener('pointermove',e=>{if(innerWidth<1024)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to(card,{rotateY:x*5,rotateX:-y*4,y:-6,duration:.45,ease:'power2.out',transformPerspective:1000})});card.addEventListener('pointerleave',()=>gsap.to(card,{rotateY:0,rotateX:0,y:0,duration:.7,ease:'expo.out'}));});

    document.querySelectorAll('.btn,.link-arrow,.sp-btn,.contact-call,.contact-whatsapp,.contact-submit,.contact-map-btn,.property-contact-btn,.cheops-header-cta').forEach(btn=>{if(btn.dataset.cheopsMagnetic)return;btn.dataset.cheopsMagnetic='1';btn.addEventListener('pointermove',e=>{if(innerWidth<900)return;const r=btn.getBoundingClientRect();gsap.to(btn,{x:(e.clientX-r.left-r.width/2)*.13,y:(e.clientY-r.top-r.height/2)*.18,duration:.35})});btn.addEventListener('pointerleave',()=>gsap.to(btn,{x:0,y:0,duration:.55,ease:'elastic.out(1,.45)'}));});

    document.querySelectorAll('.rule-gold').forEach(rule=>{if(rule.dataset.cheopsRule)return;rule.dataset.cheopsRule='1';gsap.from(rule,{scaleX:0,transformOrigin:'left center',duration:1.1,ease:'expo.out',scrollTrigger:{trigger:rule,start:'top 95%',once:true}})});
    ScrollTrigger.refresh();
  };
  setTimeout(boot,180);
})();
</script>
<?php }
add_action('wp_footer','cheops_v6_motion_js',200);

function cheops_flush_rewrites_v6() {
    if (get_option('cheops_rewrite_v6') !== '1') {
        cheops_register_projects(); cheops_register_units(); flush_rewrite_rules(); update_option('cheops_rewrite_v6','1');
    }
}
add_action('admin_init','cheops_flush_rewrites_v6',40);

function cheops_v6_home_identity_overrides() {
    echo '<style id="cheops-v6-home-identity-overrides">
    /* Exact visual grammar from the original home project cards. */
    .cheops-city-project-row{gap:28px!important;padding:22px!important;border-radius:36px!important;background:rgba(255,255,255,.72)!important;border:1px solid rgba(26,26,26,.07)!important;box-shadow:0 30px 80px -60px rgba(0,0,0,.5)!important;margin-bottom:34px!important;overflow:hidden!important;transition:box-shadow .7s,transform .7s cubic-bezier(.16,1,.3,1)!important}
    .cheops-city-project-row:hover{box-shadow:0 50px 110px -60px rgba(0,0,0,.55)!important;transform:translateY(-6px)}
    .cheops-city-project-row .zoom{min-height:520px!important;border-radius:22px!important;overflow:hidden!important}
    .cheops-city-project-row .zoom img{border-radius:22px!important}
    .cheops-city-project-row .cheops-project-copy{padding:34px!important}
    .cheops-city-project-row .cheops-project-copy.is-reverse{padding:34px!important}
    .cheops-city-project-row .eyebrow.gold,.cheops-city-page .eyebrow.gold{display:inline-flex!important;width:max-content!important;align-items:center!important;gap:8px!important;padding:8px 16px!important;border-radius:999px!important;background:linear-gradient(120deg,rgba(229,207,167,.35),rgba(255,255,255,.16))!important;color:#8a6b2f!important}

    /* Original Cheops button sweep everywhere. */
    body.cheops-prive-theme .btn,body.cheops-prive-theme .sp-btn,body.cheops-prive-theme .contact-call,
    body.cheops-prive-theme .contact-whatsapp,body.cheops-prive-theme .contact-submit,body.cheops-prive-theme .contact-map-btn,
    body.cheops-prive-theme .property-contact-btn,body.cheops-prive-theme .cheops-header-cta{position:relative!important;isolation:isolate!important;overflow:hidden!important;transition:color .45s,transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s,border-color .45s!important}
    body.cheops-prive-theme .btn:before,body.cheops-prive-theme .sp-btn:before,body.cheops-prive-theme .contact-call:before,
    body.cheops-prive-theme .contact-whatsapp:before,body.cheops-prive-theme .contact-submit:before,body.cheops-prive-theme .contact-map-btn:before,
    body.cheops-prive-theme .property-contact-btn:before,body.cheops-prive-theme .cheops-header-cta:before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;background:linear-gradient(120deg,#e5cfa7 0%,#f6e7c8 34%,#fff 68%,#c9a86a 100%);background-size:260% 260%;transform:translateY(103%);transition:transform .6s cubic-bezier(.16,1,.3,1)}
    body.cheops-prive-theme .btn:hover:before,body.cheops-prive-theme .sp-btn:hover:before,body.cheops-prive-theme .contact-call:hover:before,
    body.cheops-prive-theme .contact-whatsapp:hover:before,body.cheops-prive-theme .contact-submit:hover:before,body.cheops-prive-theme .contact-map-btn:hover:before,
    body.cheops-prive-theme .property-contact-btn:hover:before,body.cheops-prive-theme .cheops-header-cta:hover:before{transform:translateY(0);animation:cheopsBtnShift 3.2s linear infinite}
    body.cheops-prive-theme .btn:hover,body.cheops-prive-theme .sp-btn:hover,body.cheops-prive-theme .contact-call:hover,
    body.cheops-prive-theme .contact-whatsapp:hover,body.cheops-prive-theme .contact-submit:hover,body.cheops-prive-theme .contact-map-btn:hover,
    body.cheops-prive-theme .property-contact-btn:hover,body.cheops-prive-theme .cheops-header-cta:hover{color:#111!important;border-color:transparent!important;transform:translateY(-3px);box-shadow:0 18px 40px -18px rgba(201,168,106,.6)!important}
    @keyframes cheopsBtnShift{0%{background-position:0% 50%}100%{background-position:200% 50%}}

    /* Shared card image treatment and soft page field. */
    body.cheops-prive-theme .pcard,body.cheops-prive-theme .sp-related-card,body.cheops-prive-theme .contact-form-card,body.cheops-prive-theme .contact-location-card{border-color:rgba(26,26,26,.08)!important;box-shadow:0 30px 80px -60px rgba(0,0,0,.45)}
    body.tax-project_city .cheops-city-page{background:radial-gradient(1100px 560px at 85% 0%,rgba(229,207,167,.18),transparent 60%),#fff!important}

    @media(max-width:980px){.cheops-city-project-row{display:flex!important;flex-direction:column!important;padding:14px!important;gap:0!important;border-radius:28px!important}.cheops-city-project-row .zoom{min-height:420px!important;order:0!important}.cheops-city-project-row .cheops-project-copy,.cheops-city-project-row .cheops-project-copy.is-reverse{order:1!important;padding:34px 18px 42px!important}}
    @media(max-width:640px){.cheops-city-project-row{border-radius:22px!important;margin-bottom:20px!important}.cheops-city-project-row .zoom{min-height:300px!important;border-radius:16px!important}.cheops-city-project-row .zoom img{border-radius:16px!important}.cheops-city-project-row .cheops-project-copy,.cheops-city-project-row .cheops-project-copy.is-reverse{padding:28px 12px 34px!important}}
    
</style>';
}
add_action('wp_head','cheops_v6_home_identity_overrides',220);


/* =========================================================
 * V8 — spacing + typography polish
 * ========================================================= */
function cheops_v8_polish_css() {
    echo '<style id="cheops-v8-polish-css">
      /* Never hyphenate or split a real word across lines. */
      body.cheops-prive-theme h1,body.cheops-prive-theme h2,body.cheops-prive-theme h3,body.cheops-prive-theme h4,
      body.cheops-prive-theme .d,body.cheops-prive-theme .section-title,body.cheops-prive-theme .statement,
      body.cheops-prive-theme .qtitle{word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important;-webkit-hyphens:none!important}
      body.cheops-prive-theme .cheops-word{display:inline-block!important;white-space:nowrap!important}
      body.cheops-prive-theme .cheops-word .ch{display:inline-block!important}

      /* Tighten oversized vertical rhythm without changing the visual language. */
      body.cheops-prive-theme .section{padding-top:88px!important;padding-bottom:88px!important}
      body.cheops-prive-theme .quote-band{padding-top:68px!important;padding-bottom:68px!important}
      body.cheops-prive-theme .cta{padding-top:88px!important;padding-bottom:88px!important}
      body.cheops-contact-page .contact-main{padding-top:88px!important;padding-bottom:94px!important}
      body.cheops-contact-page .contact-main-grid{gap:64px!important}
      body.cheops-prive-theme .section-title,body.cheops-prive-theme .statement,body.cheops-prive-theme .cta h2{line-height:1.02!important}
      body.cheops-prive-theme .hero h1{line-height:.98!important}

      /* About hero: no decorative frame, title centered as one line on desktop. */
      body.page-template-page-about #hero .about-frame{display:none!important}
      body.page-template-page-about #hero .about-hero-title{text-align:center!important;white-space:nowrap!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important}
      body.page-template-page-about #hero .about-hero-title .rl{display:inline-block!important;overflow:hidden!important}

      /* Compact FAQ proportions. */
      #faqs{min-height:0!important}
      #faqs>.wrap{padding-top:0!important;padding-bottom:0!important}
      #faqs .faq-list{margin-top:32px!important}

      @media(max-width:800px){
        body.cheops-prive-theme .section{padding-top:64px!important;padding-bottom:64px!important}
        body.cheops-prive-theme .quote-band,body.cheops-prive-theme .cta{padding-top:62px!important;padding-bottom:62px!important}
        body.cheops-contact-page .contact-main{padding-top:66px!important;padding-bottom:72px!important}
        body.page-template-page-about #hero .about-hero-title{white-space:normal!important}
      }
    
</style>';
}
add_action('wp_head','cheops_v8_polish_css',260);

function cheops_v8_word_guard_js() { ?>
<script id="cheops-v8-word-guard">
(function(){
  function wrapRun(run){
    if(!run.length) return;
    if(run[0].parentElement && run[0].parentElement.classList.contains('cheops-word')) return;
    const w=document.createElement('span');w.className='cheops-word';
    run[0].parentNode.insertBefore(w,run[0]);run.forEach(n=>w.appendChild(n));
  }
  function groupWords(){
    document.querySelectorAll('h1,h2,h3,h4,.d,.section-title,.statement').forEach(root=>{
      const parents=[root,...root.querySelectorAll('*')];
      parents.forEach(parent=>{
        if(parent.classList && parent.classList.contains('cheops-word')) return;
        let run=[];
        [...parent.childNodes].forEach(n=>{
          const isChar=n.nodeType===1 && n.classList && n.classList.contains('ch');
          const isSpace=isChar && (n.textContent==='\u00a0' || !n.textContent.trim());
          if(isChar && !isSpace){run.push(n);return;}
          wrapRun(run);run=[];
        });
        wrapRun(run);
      });
    });
  }
  [0,80,240,700].forEach(ms=>setTimeout(groupWords,ms));
})();
</script>
<?php }
add_action('wp_footer','cheops_v8_word_guard_js',999);


/* =========================================================
 * V9 — compact typography + fully dynamic city directory
 * ========================================================= */
function cheops_v9_compact_typography_css() {
    echo '<style id="cheops-v9-compact-typography-css">
      /* Keep the original visual language, but remove the oversized type that caused awkward wraps. */
      body.cheops-prive-theme .d-xl{font-size:clamp(47px,5.4vw,79px)!important;line-height:.98!important}
      body.cheops-prive-theme .d-lg{font-size:clamp(34px,3.6vw,58px)!important;line-height:1.02!important}
      body.cheops-prive-theme .d-md{font-size:clamp(23px,2.115vw,34px)!important;line-height:1.08!important}
      body.cheops-prive-theme #hero .hero-title-single{font-size:clamp(49px,4.68vw,74px)!important;line-height:.99!important;letter-spacing:-.035em!important}
      body.cheops-prive-theme .properties-hero h1{font-size:clamp(49px,5.13vw,79px)!important;line-height:.99!important;letter-spacing:-.038em!important;max-width:900px!important}
      body.cheops-prive-theme .hero.service-hero h1,
      body.cheops-prive-theme .hero-investment h1{font-size:clamp(45px,5.13vw,74px)!important;line-height:1.02!important;letter-spacing:-.035em!important}
      body.cheops-contact-page .contact-title{font-size:clamp(45px,5.22vw,74px)!important;line-height:1!important;letter-spacing:-.035em!important;max-width:760px!important}
      body.page-template-page-about #hero .about-hero-title{font-size:clamp(45px,4.86vw,68px)!important;line-height:1!important}
      body.tax-project_city .cheops-city-hero-title{font-size:clamp(45px,5.4vw,77px)!important;line-height:.98!important;letter-spacing:-.04em!important}
      body.tax-project_city .cheops-city-intro h2{font-size:clamp(34px,3.78vw,56px)!important;line-height:1.02!important}
      body.cheops-prive-theme .section-title,
      body.cheops-prive-theme .statement,
      body.cheops-prive-theme .cta h2{font-size:clamp(34px,3.69vw,58px)!important;line-height:1.05!important;letter-spacing:-.03em!important}
      body.cheops-prive-theme #about .about-title{font-size:clamp(36px,3.6vw,56px)!important;line-height:1.04!important}
      body.cheops-prive-theme .office-choice h2{font-size:clamp(31px,2.7vw,45px)!important;line-height:1.02!important}
      body.single-cheops_unit .sp-title{font-size:clamp(32px,3.6vw,52px)!important;line-height:1.05!important}
      body.single-cheops_unit .sp-related h2{font-size:34px!important}
      body.cheops-prive-theme .hero-lead,
      body.cheops-prive-theme .properties-hero .lead,
      body.cheops-prive-theme .hero.service-hero .lead,
      body.cheops-contact-page .contact-lead{font-size:13px!important;line-height:1.7!important}

      /* Dynamic city cards: every Dashboard city gets a stable slot beside the others. */
      body.cheops-prive-theme .cheops-city-links{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:16px!important;margin-top:38px!important}
      body.cheops-prive-theme .cheops-city-link{min-height:245px!important;border-radius:22px!important}
      body.cheops-prive-theme .cheops-city-link .cheops-city-tab-copy{inset:auto 22px 22px!important;gap:7px!important}
      body.cheops-prive-theme .cheops-city-link .cheops-city-tab-copy strong{font-size:clamp(27px,2.34vw,41px)!important;line-height:1!important;word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important}
      body.cheops-prive-theme .cheops-city-link .cheops-city-tab-copy small{font-size:7px!important}
      body.cheops-prive-theme .cheops-city-link .cheops-city-tab-copy em{font-size:8px!important}
      body.cheops-prive-theme .cheops-city-projects{padding-bottom:65px!important}
      body.cheops-prive-theme .cheops-city-projects-head{align-items:flex-end!important}

      /* Global word-safety for titles, including titles split into animated character spans. */
      body.cheops-prive-theme h1,body.cheops-prive-theme h2,body.cheops-prive-theme h3,
      body.cheops-contact-page h1,body.cheops-contact-page h2,body.cheops-contact-page h3,
      body.single-cheops_unit h1,body.single-cheops_unit h2,body.single-cheops_unit h3,
      body.tax-project_city h1,body.tax-project_city h2,body.tax-project_city h3{
        word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important;-webkit-hyphens:none!important
      }

      @media(max-width:1180px){
        body.cheops-prive-theme .cheops-city-links{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      }
      @media(max-width:760px){
        body.cheops-prive-theme .d-xl{font-size:clamp(38px,10.8vw,52px)!important;line-height:1.02!important}
        body.cheops-prive-theme .d-lg{font-size:clamp(31px,8.55vw,41px)!important;line-height:1.06!important}
        body.cheops-prive-theme .d-md{font-size:clamp(22px,6.3vw,31px)!important;line-height:1.1!important}
        body.cheops-prive-theme #hero .hero-title-single{font-size:clamp(38px,10.8vw,52px)!important;line-height:1.04!important;letter-spacing:-.03em!important}
        body.cheops-prive-theme .properties-hero h1{font-size:clamp(38px,10.8vw,52px)!important;line-height:1.04!important;letter-spacing:-.03em!important;max-width:100%!important}
        body.cheops-prive-theme .hero.service-hero h1,
        body.cheops-prive-theme .hero-investment h1{font-size:clamp(36px,9.9vw,49px)!important;line-height:1.08!important;letter-spacing:-.025em!important}
        body.cheops-contact-page .contact-title{font-size:clamp(36px,9.9vw,49px)!important;line-height:1.06!important;letter-spacing:-.025em!important}
        body.page-template-page-about #hero .about-hero-title{font-size:clamp(34px,9.45vw,45px)!important;line-height:1.06!important;white-space:normal!important}
        body.tax-project_city .cheops-city-hero-title{font-size:clamp(36px,9.9vw,50px)!important;line-height:1.04!important}
        body.tax-project_city .cheops-city-intro h2,
        body.cheops-prive-theme .section-title,
        body.cheops-prive-theme .statement,
        body.cheops-prive-theme .cta h2{font-size:clamp(31px,8.1vw,41px)!important;line-height:1.08!important}
        body.cheops-prive-theme #about .about-title{font-size:clamp(31px,8.1vw,41px)!important;line-height:1.08!important}
        body.cheops-prive-theme .office-choice h2{font-size:31px!important}
        body.cheops-prive-theme .hero-lead,
        body.cheops-prive-theme .properties-hero .lead,
        body.cheops-prive-theme .hero.service-hero .lead,
        body.cheops-contact-page .contact-lead,
        body.cheops-prive-theme .section-copy{font-size:12px!important;line-height:1.7!important}
        body.cheops-prive-theme .btn,body.cheops-prive-theme .sp-btn,body.cheops-prive-theme .property-contact-btn,
        body.cheops-prive-theme .cheops-header-cta,body.cheops-contact-page .contact-call,body.cheops-contact-page .contact-whatsapp,
        body.cheops-contact-page .contact-submit,body.cheops-contact-page .contact-map-btn{font-size:8px!important;letter-spacing:.13em!important;min-height:44px!important;padding:12px 17px!important}
        body.cheops-prive-theme .eyebrow,body.cheops-prive-theme .meta,body.cheops-contact-page .contact-eyebrow{font-size:8px!important;letter-spacing:.18em!important}
        body.cheops-prive-theme .cheops-city-projects-head{align-items:flex-start!important;gap:18px!important}
        body.cheops-prive-theme .cheops-city-projects-head .btn{margin-top:0!important}
        body.cheops-prive-theme .cheops-city-links{grid-template-columns:1fr!important;gap:12px!important;margin-top:28px!important}
        body.cheops-prive-theme .cheops-city-link{min-height:205px!important;border-radius:18px!important}
        body.cheops-prive-theme .cheops-city-link .cheops-city-tab-copy{inset:auto 18px 18px!important}
        body.cheops-prive-theme .cheops-city-link .cheops-city-tab-copy strong{font-size:32px!important}
        body.cheops-prive-theme .m-service-title,body.cheops-prive-theme .mobile-menu nav>a{font-size:27px!important;line-height:1.15!important}
        body.single-cheops_unit .sp-title{font-size:clamp(32px,9vw,43px)!important}
        body.single-cheops_unit .sp-related h2{font-size:31px!important}
      }
      @media(max-width:378px){
        body.cheops-prive-theme .d-xl{font-size:40px!important}
        body.cheops-prive-theme .d-lg{font-size:32px!important}
        body.cheops-prive-theme #hero .hero-title-single,
        body.cheops-prive-theme .properties-hero h1,
        body.cheops-prive-theme .hero.service-hero h1,
        body.cheops-prive-theme .hero-investment h1,
        body.cheops-contact-page .contact-title{font-size:36px!important;line-height:1.08!important}
        body.cheops-prive-theme .section-title,body.cheops-prive-theme .statement,body.cheops-prive-theme .cta h2{font-size:31px!important}
      }

      /* Header logo: white on load, black once the header goes solid/light. */
      .cheops-brand .cheops-logo-black{display:none!important}
      .cheops-brand .cheops-logo-white{display:block!important}
      .cheops-site-header.is-scrolled .cheops-brand .cheops-logo-white,
      .single-cheops_unit .cheops-brand .cheops-logo-white,
      .page-template-page-contact .cheops-brand .cheops-logo-white{display:none!important}
      .cheops-site-header.is-scrolled .cheops-brand .cheops-logo-black,
      .single-cheops_unit .cheops-brand .cheops-logo-black,
      .page-template-page-contact .cheops-brand .cheops-logo-black{display:block!important}
    
</style>';
}
add_action('wp_head','cheops_v9_compact_typography_css',320);

/* =========================================================
 * Cheops Privé — WordPress admin identity
 * ========================================================= */
function cheops_prive_brand_logo_url() {
    return get_template_directory_uri() . '/assets/generated/c9193073bb12.png';
}

function cheops_prive_dashboard_widget_register() {
    wp_add_dashboard_widget(
        'cheops_prive_brand_widget',
        'Cheops Privé',
        'cheops_prive_dashboard_widget_render'
    );
}
add_action('wp_dashboard_setup', 'cheops_prive_dashboard_widget_register');

function cheops_prive_dashboard_widget_render() {
    $logo = cheops_prive_brand_logo_url();
    echo '<div class="cheops-brand-widget">';
    echo '<img class="cheops-brand-widget-logo" src="'.esc_url($logo).'" alt="Cheops Privé">';
    echo '<p>Private property management and website controls.</p>';
    echo '<div class="cheops-brand-widget-actions">';
    echo '<a class="button button-primary" href="'.esc_url(admin_url('edit.php?post_type=cheops_unit&page=cheops-property-dashboard')).'">Property Manager</a>';
    echo '<a class="button" href="'.esc_url(admin_url('edit.php?post_type=cheops_project')).'">Projects</a>';
    echo '<a class="button" href="'.esc_url(admin_url('customize.php')).'">Site Identity</a>';
    echo '</div></div>';
}

function cheops_prive_dashboard_brand_css() {
    echo '<style>
      #cheops_prive_brand_widget .inside{padding:22px 22px 20px}
      .cheops-brand-widget-logo{display:block;width:170px;max-width:70%;height:auto;margin:2px 0 18px}
      .cheops-brand-widget p{color:#64605a;margin:0 0 18px}
      .cheops-brand-widget-actions{display:flex;gap:8px;flex-wrap:wrap}
      .cheops-brand-widget-actions .button-primary{background:#171717;border-color:#171717}
      .cheops-admin-brand-logo{display:block;width:180px;max-width:55%;height:auto;filter:invert(1);margin:0 0 20px;opacity:.95}
    
</style>';
}
add_action('admin_head', 'cheops_prive_dashboard_brand_css', 30);

/* =========================================================
 * Cheops Privé V12 — City image manager
 * ========================================================= */
function cheops_register_city_image_meta() {
    register_term_meta('project_city', '_cheops_city_image_id', [
        'type'              => 'integer',
        'single'            => true,
        'show_in_rest'      => true,
        'sanitize_callback' => 'absint',
        'auth_callback'     => static function () { return current_user_can('manage_categories'); },
    ]);
}
add_action('init', 'cheops_register_city_image_meta', 12);

function cheops_city_image_add_field($taxonomy) {
    wp_nonce_field('cheops_city_image_term', 'cheops_city_image_nonce');
    ?>
    <div class="form-field cheops-city-image-field">
        <label for="cheops_city_image_id">City Image</label>
        <input type="hidden" id="cheops_city_image_id" name="cheops_city_image_id" value="">
        <div class="cheops-city-image-preview" aria-live="polite"></div>
        <p>
            <button type="button" class="button cheops-city-image-choose">Choose City Image</button>
            <button type="button" class="button-link-delete cheops-city-image-remove" style="display:none">Remove image</button>
        </p>
        <p class="description">Used for the “Choose your dream home” card and the city page hero.</p>
    </div>
    <?php
}
add_action('project_city_add_form_fields', 'cheops_city_image_add_field');

function cheops_city_image_edit_field($term, $taxonomy) {
    $image_id = absint(get_term_meta($term->term_id, '_cheops_city_image_id', true));
    $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium') : '';
    wp_nonce_field('cheops_city_image_term', 'cheops_city_image_nonce');
    ?>
    <tr class="form-field cheops-city-image-field">
        <th scope="row"><label for="cheops_city_image_id">City Image</label></th>
        <td>
            <input type="hidden" id="cheops_city_image_id" name="cheops_city_image_id" value="<?php echo esc_attr($image_id); ?>">
            <div class="cheops-city-image-preview" aria-live="polite">
                <?php if ($image_url): ?>
                    <img src="<?php echo esc_url($image_url); ?>" alt="" style="display:block;width:220px;max-width:100%;height:135px;object-fit:cover;border-radius:12px;margin:0 0 12px;">
                <?php endif; ?>
            </div>
            <p>
                <button type="button" class="button cheops-city-image-choose"><?php echo $image_id ? 'Change City Image' : 'Choose City Image'; ?></button>
                <button type="button" class="button-link-delete cheops-city-image-remove" <?php echo $image_id ? '' : 'style="display:none"'; ?>>Remove image</button>
            </p>
            <p class="description">Used for the “Choose your dream home” card and the city page hero.</p>
        </td>
    </tr>
    <?php
}
add_action('project_city_edit_form_fields', 'cheops_city_image_edit_field', 10, 2);

function cheops_save_city_image_term_meta($term_id) {
    if (!current_user_can('manage_categories')) return;
    if (!isset($_POST['cheops_city_image_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cheops_city_image_nonce'])), 'cheops_city_image_term')) return;

    $image_id = isset($_POST['cheops_city_image_id']) ? absint($_POST['cheops_city_image_id']) : 0;
    if ($image_id) update_term_meta($term_id, '_cheops_city_image_id', $image_id);
    else delete_term_meta($term_id, '_cheops_city_image_id');
}
add_action('created_project_city', 'cheops_save_city_image_term_meta');
add_action('edited_project_city', 'cheops_save_city_image_term_meta');

function cheops_city_image_admin_assets($hook) {
    if (!in_array($hook, ['edit-tags.php', 'term.php'], true)) return;
    $screen = get_current_screen();
    if (!$screen || 'project_city' !== $screen->taxonomy) return;

    wp_enqueue_media();
    wp_add_inline_script('jquery-core', <<<'JS'
jQuery(function($){
  let cityFrame;
  function setPreview($field, id, url){
    $field.find('#cheops_city_image_id').val(id || '');
    $field.find('.cheops-city-image-preview').html(url ? '<img src="'+url+'" alt="" style="display:block;width:220px;max-width:100%;height:135px;object-fit:cover;border-radius:12px;margin:0 0 12px;">' : '');
    $field.find('.cheops-city-image-remove').toggle(!!id);
    $field.find('.cheops-city-image-choose').text(id ? 'Change City Image' : 'Choose City Image');
  }
  $(document).on('click','.cheops-city-image-choose',function(e){
    e.preventDefault();
    const $field=$(this).closest('.cheops-city-image-field');
    cityFrame=wp.media({title:'Choose City Image',button:{text:'Use this image'},multiple:false,library:{type:'image'}});
    cityFrame.on('select',function(){
      const a=cityFrame.state().get('selection').first().toJSON();
      const url=(a.sizes && a.sizes.medium ? a.sizes.medium.url : a.url);
      setPreview($field,a.id,url);
    });
    cityFrame.open();
  });
  $(document).on('click','.cheops-city-image-remove',function(e){
    e.preventDefault(); setPreview($(this).closest('.cheops-city-image-field'),'','');
  });
});
JS
    );
}
add_action('admin_enqueue_scripts', 'cheops_city_image_admin_assets');

function cheops_city_admin_columns($columns) {
    $new = [];
    foreach ($columns as $key => $label) {
        $new[$key] = $label;
        if ('cb' === $key) $new['cheops_city_image'] = 'Image';
    }
    return $new;
}
add_filter('manage_edit-project_city_columns', 'cheops_city_admin_columns');

function cheops_city_admin_column_content($content, $column_name, $term_id) {
    if ('cheops_city_image' !== $column_name) return $content;
    $image_id = absint(get_term_meta($term_id, '_cheops_city_image_id', true));
    if (!$image_id) return '<span style="color:#999">—</span>';
    $url = wp_get_attachment_image_url($image_id, 'thumbnail');
    if (!$url) return '<span style="color:#999">—</span>';
    return '<img src="'.esc_url($url).'" alt="" style="width:64px;height:44px;object-fit:cover;border-radius:8px;display:block">';
}
add_filter('manage_project_city_custom_column', 'cheops_city_admin_column_content', 10, 3);

/* =========================================================
 * Leads — Meeting Bookings + Newsletter Signups
 * ========================================================= */
function cheops_register_leads() {
    register_post_type('cheops_booking', [
        'labels' => [
            'name' => 'Meeting Bookings',
            'singular_name' => 'Booking',
            'menu_name' => 'Meeting Bookings',
            'all_items' => 'All Bookings',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-calendar-alt',
        'supports' => ['title'],
        'capability_type' => 'post',
    ]);
    register_post_type('cheops_subscriber', [
        'labels' => [
            'name' => 'Newsletter Signups',
            'singular_name' => 'Subscriber',
            'menu_name' => 'Newsletter Signups',
            'all_items' => 'All Subscribers',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-email-alt',
        'supports' => ['title'],
        'capability_type' => 'post',
    ]);
}
add_action('init', 'cheops_register_leads');

function cheops_booking_columns($cols) {
    return ['cb'=>$cols['cb'],'title'=>'Name','cheops_contact'=>'Contact','cheops_when'=>'Requested date/time','date'=>'Submitted'];
}
add_filter('manage_cheops_booking_posts_columns', 'cheops_booking_columns');
function cheops_booking_column_content($col, $post_id) {
    if ($col === 'cheops_contact') echo esc_html(get_post_meta($post_id, '_cheops_booking_contact', true));
    if ($col === 'cheops_when') echo esc_html(get_post_meta($post_id, '_cheops_booking_date', true).' '.get_post_meta($post_id, '_cheops_booking_time', true));
}
add_action('manage_cheops_booking_posts_custom_column', 'cheops_booking_column_content', 10, 2);

function cheops_subscriber_columns($cols) {
    return ['cb'=>$cols['cb'],'title'=>'Email','cheops_whatsapp'=>'WhatsApp','date'=>'Subscribed'];
}
add_filter('manage_cheops_subscriber_posts_columns', 'cheops_subscriber_columns');
function cheops_subscriber_column_content($col, $post_id) {
    if ($col === 'cheops_whatsapp') {
        $number = get_post_meta($post_id, '_cheops_subscriber_whatsapp', true);
        echo $number ? esc_html($number) : '<span style="color:#999">—</span>';
    }
}
add_action('manage_cheops_subscriber_posts_custom_column', 'cheops_subscriber_column_content', 10, 2);

function cheops_floating_widgets() {
    ?>
    <style id="cheops-floating-widgets-css">
      .cheops-fab{position:fixed;bottom:24px;z-index:9990;width:58px;height:58px;display:grid;place-items:center;background:#171717;color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:50%;padding:0;cursor:pointer;box-shadow:0 18px 40px -20px rgba(0,0,0,.45);transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s;overflow:visible;isolation:isolate}.cheops-fab:before{content:"";position:absolute;inset:0;border-radius:50%;z-index:-1;background:linear-gradient(135deg,#e5cfa7,#fff,#c9a86a);transform:scale(0);transition:transform .45s cubic-bezier(.16,1,.3,1)}.cheops-fab:hover{transform:translateY(-4px) scale(1.04);box-shadow:0 22px 48px -18px rgba(201,168,106,.65);color:#111}.cheops-fab:hover:before{transform:scale(1);animation:cheopsBtnShift 3.2s linear infinite}.cheops-fab svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.cheops-fab-label{position:absolute;left:50%;bottom:68px;white-space:nowrap;background:#171717;color:#fff;border-radius:999px;padding:9px 12px;font:800 8px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.11em;opacity:0;transform:translate(-50%,6px);pointer-events:none;transition:.25s}.cheops-fab:hover .cheops-fab-label{opacity:1;transform:translate(-50%,0)}#cheopsBookFab{left:24px}#cheopsNewsletterFab{right:24px;background:#d5b578;color:#171717;border-color:#d5b578}@media(max-width:640px){.cheops-fab{width:50px;height:50px}.cheops-fab-label{display:none}#cheopsBookFab{left:12px;bottom:12px}#cheopsNewsletterFab{right:12px;bottom:12px}}
      .cheops-modal-overlay{position:fixed;inset:0;background:rgba(10,10,10,.55);backdrop-filter:blur(4px);z-index:99990;display:none;align-items:center;justify-content:center;padding:20px}
      .cheops-modal-overlay.is-open{display:flex}
      .cheops-modal{background:#fff;border-radius:24px;max-width:420px;width:100%;padding:34px;position:relative;font-family:Arial,sans-serif;max-height:90vh;overflow:auto}
      .cheops-modal h3{font-family:Georgia,serif;font-size:26px;margin:0 0 8px;color:#171717}
      .cheops-modal p.desc{margin:0 0 22px;color:#666;font-size:13px;line-height:1.6}
      .cheops-modal-close{position:absolute;top:16px;right:16px;background:none;border:0;font-size:20px;cursor:pointer;color:#999;width:32px;height:32px}
      .cheops-modal label{display:block;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#666;margin:14px 0 6px}
      .cheops-modal input{width:100%;border:1px solid #ddd;border-radius:12px;padding:12px 14px;font:inherit;font-size:14px;box-sizing:border-box;color:#171717}
      .cheops-modal button[type=submit]{margin-top:20px;width:100%;background:#171717;color:#fff;border:0;border-radius:999px;padding:15px;font:800 11px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.1em;cursor:pointer}
      .cheops-modal button[type=submit]:disabled{opacity:.6;cursor:default}
      .cheops-modal .cheops-whatsapp-channel{margin-top:10px;width:100%;min-height:46px;display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid #171717;border-radius:999px;color:#171717;background:#fff;text-decoration:none;font:800 10px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.09em;box-sizing:border-box;transition:background .28s,color .28s,transform .28s}.cheops-modal .cheops-whatsapp-channel:hover{background:#171717;color:#fff;transform:translateY(-1px)}.cheops-modal .cheops-whatsapp-channel svg{width:17px;height:17px;fill:currentColor}
      .cheops-modal .cheops-form-msg{margin-top:12px;font-size:12px;display:none}
      .cheops-modal .cheops-form-msg.ok{color:#31572c;display:block}
      .cheops-modal .cheops-form-msg.err{color:#8b2c24;display:block}
    
</style>

    <button class="cheops-fab" id="cheopsBookFab" type="button" aria-label="Book a meeting"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6"></path></svg><span class="cheops-fab-label">Book a meeting</span></button>
    <button class="cheops-fab" id="cheopsNewsletterFab" type="button" aria-label="Join our newsletter"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"></path><path d="m4 7 8 6 8-6"></path></svg><span class="cheops-fab-label">Join our newsletter</span></button>

    <div class="cheops-modal-overlay" id="cheopsBookOverlay">
      <div class="cheops-modal">
        <button class="cheops-modal-close" type="button" data-close aria-label="Close">&times;</button>
        <h3>Book a meeting</h3>
        <p class="desc">Pick a day and time that works for you — our team will confirm shortly.</p>
        <form id="cheopsBookForm">
          <label>Name</label><input type="text" name="name" required>
          <label>Phone or email</label><input type="text" name="contact" required>
          <label>Date</label><input type="date" name="date" required>
          <label>Time</label><input type="time" name="time" required>
          <button type="submit">Request meeting</button>
          <p class="cheops-form-msg"></p>
        </form>
      </div>
    </div>

    <div class="cheops-modal-overlay" id="cheopsNewsletterOverlay">
      <div class="cheops-modal">
        <button class="cheops-modal-close" type="button" data-close aria-label="Close">&times;</button>
        <h3>Join our newsletter</h3>
        <p class="desc">Get new listings and off-market opportunities before anyone else.</p>
        <form id="cheopsNewsletterForm">
          <label>Email address</label><input type="email" name="email" autocomplete="email" required>
          <label>WhatsApp number (with country code)</label><input type="tel" name="whatsapp" inputmode="tel" autocomplete="tel" placeholder="+20 1XX XXX XXXX" required>
          <button type="submit">Subscribe</button>
          <a class="cheops-whatsapp-channel" href="https://whatsapp.com/channel/0029Vb8qAs06GcG9zZOJHP2S" target="_blank" rel="noopener noreferrer" aria-label="Join Cheops Privé Residential channel on WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M19.11 17.37c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.11 2.81c.14.18 1.92 2.93 4.65 4.11.65.28 1.16.45 1.55.57.65.21 1.24.18 1.71.11.52-.08 1.61-.66 1.84-1.29.23-.64.23-1.2.16-1.31-.07-.12-.25-.18-.52-.32z"></path><path d="M16.03 3.2c-7.03 0-12.75 5.72-12.75 12.75 0 2.25.59 4.45 1.7 6.38L3.2 28.8l6.62-1.74a12.72 12.72 0 0 0 6.21 1.59h.01c7.03 0 12.75-5.72 12.75-12.75S23.07 3.2 16.03 3.2zm0 23.3h-.01a10.55 10.55 0 0 1-5.38-1.47l-.39-.23-3.93 1.03 1.05-3.83-.25-.39a10.56 10.56 0 1 1 8.91 4.89z"></path></svg><span>Join us on WhatsApp</span></a>
          <p class="cheops-form-msg"></p>
        </form>
      </div>
    </div>

    <script id="cheops-floating-widgets-js">
    (function(){
      function bind(fabId, overlayId){
        var fab=document.getElementById(fabId), overlay=document.getElementById(overlayId);
        if(!fab||!overlay) return;
        fab.addEventListener('click', function(){ overlay.classList.add('is-open'); });
        overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.classList.remove('is-open'); });
        overlay.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click', function(){ overlay.classList.remove('is-open'); }); });
      }
      bind('cheopsBookFab','cheopsBookOverlay');
      bind('cheopsNewsletterFab','cheopsNewsletterOverlay');

      function handleForm(formId, action){
        var form=document.getElementById(formId);
        if(!form) return;
        form.addEventListener('submit', function(e){
          e.preventDefault();
          var msg=form.querySelector('.cheops-form-msg');
          var btn=form.querySelector('button[type=submit]');
          var data=new FormData(form);
          data.append('action', action);
          data.append('_wpnonce', '<?php echo esc_js( wp_create_nonce('cheops_leads_nonce') ); ?>');
          btn.disabled=true;
          fetch('<?php echo esc_url( admin_url('admin-ajax.php') ); ?>', { method:'POST', body:data, credentials:'same-origin' })
            .then(function(r){ return r.json(); })
            .then(function(res){
              btn.disabled=false;
              msg.className='cheops-form-msg '+(res.success?'ok':'err');
              msg.textContent = (res.data && res.data.message) ? res.data.message : (res.success ? 'Thank you!' : 'Something went wrong.');
              if(res.success) form.reset();
            })
            .catch(function(){
              btn.disabled=false;
              msg.className='cheops-form-msg err';
              msg.textContent='Something went wrong. Please try again.';
            });
        });
      }
      handleForm('cheopsBookForm','cheops_book_meeting');
      handleForm('cheopsNewsletterForm','cheops_newsletter_signup');
    })();
    </script>
    <?php
}
add_action('wp_footer', 'cheops_floating_widgets', 30);

function cheops_handle_book_meeting() {
    check_ajax_referer('cheops_leads_nonce');
    $name = sanitize_text_field(wp_unslash($_POST['name'] ?? ''));
    $contact = sanitize_text_field(wp_unslash($_POST['contact'] ?? ''));
    $date = sanitize_text_field(wp_unslash($_POST['date'] ?? ''));
    $time = sanitize_text_field(wp_unslash($_POST['time'] ?? ''));
    if (!$name || !$contact || !$date || !$time) {
        wp_send_json_error(['message' => 'Please fill in all fields.']);
    }
    $post_id = wp_insert_post([
        'post_type' => 'cheops_booking',
        'post_status' => 'publish',
        'post_title' => $name . ' — ' . $date . ' ' . $time,
    ]);
    if ($post_id && !is_wp_error($post_id)) {
        update_post_meta($post_id, '_cheops_booking_contact', $contact);
        update_post_meta($post_id, '_cheops_booking_date', $date);
        update_post_meta($post_id, '_cheops_booking_time', $time);
        wp_send_json_success(['message' => 'Thanks — we will confirm your meeting shortly.']);
    }
    wp_send_json_error(['message' => 'Something went wrong. Please try again.']);
}
add_action('wp_ajax_cheops_book_meeting', 'cheops_handle_book_meeting');
add_action('wp_ajax_nopriv_cheops_book_meeting', 'cheops_handle_book_meeting');

function cheops_handle_newsletter_signup() {
    check_ajax_referer('cheops_leads_nonce');
    $email = sanitize_email(wp_unslash($_POST['email'] ?? ''));
    $whatsapp_raw = sanitize_text_field(wp_unslash($_POST['whatsapp'] ?? ''));
    $whatsapp = preg_replace('/[^0-9+() .-]/', '', $whatsapp_raw);

    if (!$email || !is_email($email)) {
        wp_send_json_error(['message' => 'Please enter a valid email address.']);
    }
    if (!$whatsapp || !preg_match('/^\+?[0-9][0-9() .-]{6,20}$/', $whatsapp)) {
        wp_send_json_error(['message' => 'Please enter your WhatsApp number with country code.']);
    }

    $existing = get_posts(['post_type' => 'cheops_subscriber', 'title' => $email, 'posts_per_page' => 1, 'fields' => 'ids']);
    if ($existing) {
        update_post_meta((int) $existing[0], '_cheops_subscriber_whatsapp', $whatsapp);
        wp_send_json_success(['message' => 'You are already subscribed — your WhatsApp number has been updated.']);
    }

    $post_id = wp_insert_post([
        'post_type' => 'cheops_subscriber',
        'post_status' => 'publish',
        'post_title' => $email,
    ]);
    if ($post_id && !is_wp_error($post_id)) {
        update_post_meta($post_id, '_cheops_subscriber_whatsapp', $whatsapp);
        wp_send_json_success(['message' => 'Thanks for subscribing!']);
    }
    wp_send_json_error(['message' => 'Something went wrong. Please try again.']);
}
add_action('wp_ajax_cheops_newsletter_signup', 'cheops_handle_newsletter_signup');
add_action('wp_ajax_nopriv_cheops_newsletter_signup', 'cheops_handle_newsletter_signup');

/* =========================================================
 * Lake Town units — one-time real-data import
 * ========================================================= */
function cheops_lake_town_units_data() {
    return [
    [ 'number'=>'A-321', 'type'=>'clinic', 'status'=>'available', 'purpose'=>'sale', 'badge'=>'Available', 'area'=>'62', 'view'=>'Monorail/Plaza', 'price_text'=>'EGP 240,000 / sqm', 'maintenance'=>'EGP 620,000', 'purpose_text'=>'For Sale' ],
    [ 'number'=>'A-322', 'type'=>'clinic', 'status'=>'leased', 'purpose'=>'sale', 'badge'=>'Leased — Guva Clinic', 'area'=>'63', 'view'=>'Monorail/Plaza', 'price_text'=>'EGP 250,000 / sqm', 'maintenance'=>'EGP 630,000', 'purpose_text'=>'Sale / Income Property' ],
    [ 'number'=>'A-323', 'type'=>'clinic', 'status'=>'leased', 'purpose'=>'sale', 'badge'=>'Leased — Guva Clinic', 'area'=>'63', 'view'=>'Monorail/Plaza', 'price_text'=>'EGP 250,000 / sqm', 'maintenance'=>'EGP 630,000', 'purpose_text'=>'Sale / Income Property' ],
    [ 'number'=>'A-324', 'type'=>'clinic', 'status'=>'leased', 'purpose'=>'sale', 'badge'=>'Leased — Guva Clinic', 'area'=>'64', 'view'=>'Monorail/Plaza', 'price_text'=>'EGP 250,000 / sqm', 'maintenance'=>'EGP 640,000', 'purpose_text'=>'Sale / Income Property' ],
    [ 'number'=>'A-325', 'type'=>'clinic', 'status'=>'leased', 'purpose'=>'sale', 'badge'=>'Leased — Guva Clinic', 'area'=>'64', 'view'=>'Monorail/Plaza', 'price_text'=>'EGP 250,000 / sqm', 'maintenance'=>'EGP 640,000', 'purpose_text'=>'Sale / Income Property' ],
    [ 'number'=>'C-301', 'type'=>'office', 'status'=>'available', 'purpose'=>'rent', 'badge'=>'Available', 'area'=>'189', 'view'=>'Monorail/Plaza', 'price_text'=>'$29.50 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Rent' ],
    [ 'number'=>'C-302', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — SIG Group IMEA', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-303', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — SIG Group IMEA', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-304', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — SIG Group IMEA', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-305', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — City Edge', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-306', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — City Edge', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-307', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — City Edge', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-308', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — City Edge', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-309', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — City Edge', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-310', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — City Edge', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-311', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — City Edge', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-312', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — City Edge', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-313', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — City Edge', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-314', 'type'=>'office', 'status'=>'available', 'purpose'=>'rent', 'badge'=>'Available', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'$29.50 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Rent' ],
    [ 'number'=>'C-315', 'type'=>'office', 'status'=>'available', 'purpose'=>'rent', 'badge'=>'Available', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'$29.50 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Rent' ],
    [ 'number'=>'C-316', 'type'=>'office', 'status'=>'available', 'purpose'=>'rent', 'badge'=>'Available', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'$29.50 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Rent' ],
    [ 'number'=>'C-317', 'type'=>'office', 'status'=>'available', 'purpose'=>'rent', 'badge'=>'Available', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'$29.50 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Rent' ],
    [ 'number'=>'C-318', 'type'=>'office', 'status'=>'available', 'purpose'=>'rent', 'badge'=>'Available', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'$29.50 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Rent' ],
    [ 'number'=>'C-319', 'type'=>'office', 'status'=>'available', 'purpose'=>'rent', 'badge'=>'Available', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'$29.50 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Rent' ],
    [ 'number'=>'C-320', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — Schon Clinic', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-321', 'type'=>'office', 'status'=>'leased', 'purpose'=>'rent', 'badge'=>'Leased — Schon Clinic', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'', 'maintenance'=>'', 'purpose_text'=>'' ],
    [ 'number'=>'C-323', 'type'=>'office', 'status'=>'available', 'purpose'=>'sale', 'badge'=>'Available', 'area'=>'151', 'view'=>'Monorail/Plaza', 'price_text'=>'EGP 200,000 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Sale' ],
    [ 'number'=>'CX-301', 'type'=>'office', 'status'=>'delivery', 'purpose'=>'rent', 'badge'=>'Delivery Mid 2026', 'area'=>'525', 'view'=>'Monorail/Plaza', 'price_text'=>'$29.50 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Rent' ],
    [ 'number'=>'CX-305', 'type'=>'office', 'status'=>'delivery', 'purpose'=>'rent', 'badge'=>'Delivery Mid 2026', 'area'=>'953', 'view'=>'Plaza', 'price_text'=>'$29.50 / sqm', 'maintenance'=>'', 'purpose_text'=>'For Rent' ],
];
}

function cheops_lake_town_image_pool() {
    $files = [
        'project-lake-town.jpg', 'office-buy.jpg', 'office-rent.jpg', 'residential.jpg',
        'project-aliva.jpg', 'project-lvls.jpg', 'project-marq-gardens.jpg',
    ];
    $ids = get_option('cheops_lake_town_image_pool', []);
    if (!is_array($ids)) $ids = [];
    $upload_dir = wp_upload_dir();

    foreach ($files as $file) {
        if (!empty($ids[$file]) && get_post($ids[$file])) continue;

        $file_path = get_template_directory() . '/assets/images/' . $file;
        if (!file_exists($file_path)) continue;

        $new_path = $upload_dir['path'] . '/lake-town-' . $file;
        if (!file_exists($new_path)) copy($file_path, $new_path);

        $filetype = wp_check_filetype(basename($new_path), null);
        $attachment_id = wp_insert_attachment([
            'post_mime_type' => $filetype['type'],
            'post_title' => 'Lake Town — ' . pathinfo($file, PATHINFO_FILENAME),
            'post_content' => '',
            'post_status' => 'inherit',
        ], $new_path);

        if ($attachment_id && !is_wp_error($attachment_id)) {
            require_once ABSPATH . 'wp-admin/includes/image.php';
            $attach_data = wp_generate_attachment_metadata($attachment_id, $new_path);
            wp_update_attachment_metadata($attachment_id, $attach_data);
            $ids[$file] = $attachment_id;
        }
    }

    update_option('cheops_lake_town_image_pool', $ids, false);
    return array_values($ids);
}

function cheops_import_lake_town_units() {
    if (!current_user_can('edit_posts')) wp_die('Not allowed.');
    check_admin_referer('cheops_import_lake_town_units');

    $image_pool = cheops_lake_town_image_pool();

    $location_term = term_exists('New Cairo', 'unit_location');
    if (!$location_term) $location_term = wp_insert_term('New Cairo', 'unit_location');
    $location_term_id = is_array($location_term) ? (int) $location_term['term_id'] : 0;

    $created = 0;
    $updated = 0;
    $index = 0;

    foreach (cheops_lake_town_units_data() as $u) {
        $title = $u['number'] . ' — Lake Town';
        $existing = get_posts([
            'post_type' => 'cheops_unit', 'title' => $title,
            'posts_per_page' => 1, 'fields' => 'ids', 'post_status' => 'any',
        ]);

        $type_label = $u['type'] === 'clinic' ? 'Clinic' : 'Office';

        $content_lines = [];
        if ($u['view']) $content_lines[] = 'View: ' . $u['view'];
        if ($u['price_text']) $content_lines[] = 'Price: ' . $u['price_text'];
        if ($u['maintenance']) $content_lines[] = 'Maintenance: ' . $u['maintenance'];
        if ($u['purpose_text']) $content_lines[] = 'Purpose: ' . $u['purpose_text'];
        if ($u['status'] === 'leased' || $u['status'] === 'delivery') $content_lines[] = 'Status: ' . $u['badge'];
        $content = implode("\n", $content_lines);

        if ($existing) {
            $post_id = $existing[0];
            $updated++;
        } else {
            $post_id = wp_insert_post([
                'post_type' => 'cheops_unit',
                'post_status' => 'publish',
                'post_title' => $title,
                'post_content' => $content,
            ]);
            if (!$post_id || is_wp_error($post_id)) { $index++; continue; }
            $created++;
        }

        update_post_meta($post_id, '_cheops_listing_type', $u['purpose']);
        update_post_meta($post_id, '_cheops_area', $u['area']);
        update_post_meta($post_id, '_cheops_project', 'Lake Town');
        update_post_meta($post_id, '_cheops_beds', 0);
        update_post_meta($post_id, '_cheops_baths', 0);
        update_post_meta($post_id, '_cheops_price', 0);
        update_post_meta($post_id, '_cheops_price_override_text', $u['price_text']);

        $label = '';
        if ($u['status'] === 'leased') $label = 'Leased';
        elseif ($u['status'] === 'delivery') $label = 'Delivery Mid 2026';
        update_post_meta($post_id, '_cheops_label', $label);
        update_post_meta($post_id, '_cheops_featured', $u['status'] === 'available' ? '1' : '0');

        wp_set_object_terms($post_id, $type_label, 'unit_type');
        if ($location_term_id) wp_set_object_terms($post_id, [$location_term_id], 'unit_location');
        if ($image_pool) set_post_thumbnail($post_id, $image_pool[$index % count($image_pool)]);

        $index++;
    }

    wp_safe_redirect(add_query_arg([
        'post_type' => 'cheops_unit',
        'page' => 'cheops-property-dashboard',
        'lt_imported' => $created,
        'lt_skipped' => $updated,
    ], admin_url('edit.php')));
    exit;
}
add_action('admin_post_cheops_import_lake_town_units', 'cheops_import_lake_town_units');

/* Curated Portfolio AUG26 — projects + units importer */
require_once get_template_directory() . '/inc/portfolio-aug26-import.php';


/* =========================================================
 * V17 — Project map, logo bands, footer/header polish
 * ========================================================= */
function cheops_project_options_html() {
    global $wpdb;
    $names=$wpdb->get_col("SELECT DISTINCT pm.meta_value FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID=pm.post_id WHERE pm.meta_key='_cheops_project' AND pm.meta_value<>'' AND p.post_type='cheops_unit' AND p.post_status='publish' ORDER BY pm.meta_value ASC");
    foreach($names as $name) echo '<option value="'.esc_attr($name).'">'.esc_html($name).'</option>';
}

function cheops_project_map_coords($title,$city='') {
    $key=sanitize_title($title);
    $known=[
        'mountain-view-lvls'=>[31.0750,28.5450],
        'mountain-view-aliva-fields-park'=>[30.0305,31.6845],
        'mountain-view-aliva-river-park'=>[30.0210,31.6700],
        'mountain-view-1-1-the-park'=>[30.0120,31.6575],
        'the-marq-gardens'=>[30.0400,31.5650],
        'the-water-marq'=>[30.0290,31.6030],
        'solana-east'=>[30.0260,31.5340],
        'lake-town'=>[30.1435,31.6260],
    ];
    if(isset($known[$key])) return $known[$key];
    $base=[
        'New Cairo'=>[30.0280,31.5650],
        'Mostakbal City'=>[30.0400,31.6650],
        'North Coast'=>[31.0650,28.5000],
        'Shorouk City'=>[30.1450,31.6250],
    ];
    $coord=$base[$city] ?? [30.0444,31.2357];
    $seed=abs(crc32($title));
    $coord[0]+=((($seed%17)-8)*0.0018); $coord[1]+=(((($seed>>5)%17)-8)*0.0018);
    return $coord;
}

function cheops_project_map_items() {
    $items=[];
    $q=new WP_Query(['post_type'=>'cheops_project','post_status'=>'publish','posts_per_page'=>-1,'orderby'=>['menu_order'=>'ASC','title'=>'ASC']]);
    while($q->have_posts()){ $q->the_post(); $pid=get_the_ID(); $title=get_the_title();
        $terms=get_the_terms($pid,'project_city'); $city=($terms && !is_wp_error($terms))?$terms[0]->name:'';
        $desc=get_the_excerpt(); if(!$desc) $desc=wp_trim_words(wp_strip_all_tags(get_post_field('post_content',$pid)),28);
        $unit_ids=get_posts(['post_type'=>'cheops_unit','post_status'=>'publish','posts_per_page'=>-1,'fields'=>'ids','meta_key'=>'_cheops_project','meta_value'=>$title]);
        $real_units=count($unit_ids); if(!$real_units) continue;
        $lat=get_post_meta($pid,'_cheops_project_lat',true); $lng=get_post_meta($pid,'_cheops_project_lng',true); $coords=($lat!=='' && $lng!=='')?[(float)$lat,(float)$lng]:cheops_project_map_coords($title,$city);
        $items[]=[
            'name'=>$title,'dest'=>$city ?: 'Project','coords'=>$coords,
            'statement'=>$desc ?: 'Explore the available residences and private opportunities in this project.',
            'price'=>get_post_meta($pid,'_cheops_project_start_price',true) ?: 'On request',
            'units'=>(string)$real_units,
            'link'=>add_query_arg('project',$title,home_url('/properties/')),
        ];
    }
    wp_reset_postdata();
    return $items;
}

function cheops_render_project_map_section() {
    $items=cheops_project_map_items(); if(!$items) return; $first=$items[0];
    ?>
    <link rel="preconnect" href="https://unpkg.com" crossorigin>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
    <section class="ink sec cheops-project-map" id="map">
      <div class="wrap">
        <p class="eyebrow">Projects on the map</p>
        <h2 class="d d-lg map-title"><span class="rl"><span>Explore projects</span></span><span class="rl"><span>by address.</span></span></h2>
        <div class="cheops-map-grid">
          <div id="mapBox"><div id="real-map" aria-label="Interactive project map"></div></div>
          <div class="cheops-map-info">
            <p class="eyebrow gold" id="mDest"><?php echo esc_html($first['dest']); ?></p>
            <h3 class="d d-md" id="mName"><?php echo esc_html($first['name']); ?></h3>
            <p id="mStatement"><?php echo esc_html($first['statement']); ?></p>
            <dl><div><dt>Starting price</dt><dd class="d" id="mPrice"><?php echo esc_html($first['price']); ?></dd></div><div><dt>Available units</dt><dd class="d" id="mUnits"><?php echo esc_html($first['units']); ?></dd></div></dl>
            <a class="link-arrow" id="mLink" href="<?php echo esc_url($first['link']); ?>">View project units <span class="ar">→</span></a>
          </div>
        </div>
      </div>
    </section>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    <script>(function(){
      var data=<?php echo wp_json_encode($items,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE); ?>;
      function boot(){var el=document.getElementById('real-map');if(!el||!window.L){setTimeout(boot,100);return}if(el._leaflet_id)return;
        var map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
        function icon(on){return L.divIcon({className:'cheops-map-icon',html:'<span class="cheops-pin'+(on?' active':'')+'"><i></i></span>',iconSize:[26,26],iconAnchor:[13,26]});}
        var markers=[];
        function select(i,fly){var p=data[i];if(!p)return;document.getElementById('mDest').textContent=p.dest;document.getElementById('mName').textContent=p.name;document.getElementById('mStatement').textContent=p.statement;document.getElementById('mPrice').textContent=p.price;document.getElementById('mUnits').textContent=p.units;document.getElementById('mLink').href=p.link;markers.forEach(function(m,n){m.setIcon(icon(n===i));});if(fly)map.flyTo(p.coords,p.dest==='North Coast'?10:12,{duration:1.05});}
        data.forEach(function(p,i){var m=L.marker(p.coords,{icon:icon(i===0),title:p.name,keyboard:true}).addTo(map).bindTooltip(p.name,{direction:'top',offset:[0,-20],className:'cheops-tooltip'});m.on('click',function(){select(i,false);window.location.href=p.link});markers.push(m)});
        map.fitBounds(L.latLngBounds(data.map(function(p){return p.coords})),{padding:[44,44],maxZoom:9});select(0,false);
        var fix=function(){try{map.invalidateSize(true)}catch(e){}};[50,300,900].forEach(function(t){setTimeout(fix,t)});addEventListener('resize',fix);
      } if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
    })();</script>
    <?php
}

function cheops_render_logo_band($kind='tenants') {
    $is_dev=$kind==='developers';
    $start=$is_dev?10:25; $end=$is_dev?21:29;
    $label=$is_dev?'Developer logo':'Business tenant logo';
    $title_html=$is_dev?'Our Developers':'Our Business Tenants';
    echo '<section class="cheops-logo-band cheops-logo-band-'.esc_attr($kind).'"><div class="wrap cheops-logo-band-head"><p class="cheops-logo-band-title">'.$title_html.'</p></div><div class="cheops-logo-marquee"><div class="cheops-logo-track">';
    for($copy=0;$copy<2;$copy++){
        echo '<div class="cheops-logo-set"'.($copy?' aria-hidden="true"':'').'>';
        for($i=$start;$i<=$end;$i++){
            // Remove the two unwanted developer logos from Home + About.
            if($is_dev && in_array($i,[13,14],true)) continue;
            $url='https://cheopsprive.com/wp-content/uploads/2026/09/'.$i.'-2.png?v=20260924d';
            echo '<span class="cheops-logo-item"><img src="'.esc_url($url).'" alt="'.esc_attr($copy?'':$label).'" loading="lazy" decoding="async"></span>';
        }
        echo '</div>';
    }
    echo '</div></div></section>';
}
function cheops_render_business_tenants(){cheops_render_logo_band('tenants');}
function cheops_render_developers_band(){cheops_render_logo_band('developers');}

function cheops_v17_polish_css(){ ?>
<style id="cheops-v17-polish-css">
/* Vector-like wordmark: avoids raster logo pixelation at all viewport sizes. */
.cheops-logo-crop{width:auto!important;height:auto!important;overflow:visible!important;background:transparent!important;border-radius:0!important;text-decoration:none!important}
.cheops-wordmark{position:static!important;inset:auto!important;background:none!important;display:inline-grid;justify-items:center;line-height:1;color:inherit;min-width:118px}.cheops-wordmark strong{font-family:"Romie",Georgia,serif;font-size:27px;font-weight:400;letter-spacing:.045em}.cheops-wordmark small{font:700 7px/1 Arial,sans-serif;letter-spacing:.42em;margin-top:5px;padding-left:.42em}
.cheops-site-header:not(.is-scrolled) .cheops-wordmark{color:#fff}.cheops-site-header.is-scrolled .cheops-wordmark,.single-cheops_unit .cheops-wordmark,.page-template-page-contact .cheops-wordmark{color:#171717}
.cheops-header-actions{gap:7px!important}.cheops-header-doc{padding:12px 14px!important;font-size:7.5px!important}.cheops-header-doc-alt{background:rgba(255,255,255,.12)!important;color:#fff!important;border:1px solid rgba(255,255,255,.28)!important}.cheops-site-header.is-scrolled .cheops-header-doc-alt,.single-cheops_unit .cheops-header-doc-alt,.page-template-page-contact .cheops-header-doc-alt{background:#fff!important;color:#171717!important;border-color:#ddd!important}
/* compact editorial rhythm site-wide */
body.cheops-prive-theme .sec{padding-top:48px!important;padding-bottom:48px!important}body.cheops-prive-theme h1.d .rl+.rl,body.cheops-prive-theme h2.d .rl+.rl,body.cheops-prive-theme h3.d .rl+.rl{margin-top:-.08em!important}body.cheops-prive-theme .d{line-height:1.01!important}body.cheops-prive-theme .collection-head{margin-bottom:26px!important}
/* about/editorial compactness */
body.cheops-prive-theme #about .about-shell{min-height:0!important}body.cheops-prive-theme #about .about-grid{min-height:0!important;gap:28px!important;padding-top:12px!important}body.cheops-prive-theme #about .about-lead{margin-top:14px!important;line-height:1.68!important}body.cheops-prive-theme #about .about-tags{margin-top:18px!important}body.cheops-prive-theme #about .about-copy{gap:20px!important}body.cheops-prive-theme #about .about-footer{margin-top:28px!important;padding-top:18px!important}
/* logo bands */
.cheops-logo-band{background:#fff;overflow:hidden;border-top:1px solid rgba(26,26,26,.08);border-bottom:1px solid rgba(26,26,26,.06)}.cheops-logo-band-head{padding-top:26px!important;padding-bottom:14px!important;text-align:left}.cheops-logo-band-head .eyebrow{font-size:10px!important;padding:10px 18px!important;margin:0!important}.cheops-logo-marquee{overflow:hidden;padding:16px 0 28px}.cheops-logo-track{display:flex;width:max-content;animation:cheopsLogoLoop 34s linear infinite;will-change:transform}.cheops-logo-set{display:flex;align-items:center;gap:74px;padding-right:74px}.cheops-logo-item{width:260px;height:112px;flex:0 0 auto;display:grid;place-items:center}.cheops-logo-band-developers .cheops-logo-item{width:220px;height:92px}.cheops-logo-item img{max-width:100%;max-height:100%;width:auto!important;height:auto!important;object-fit:contain!important;border-radius:0!important;filter:none!important;opacity:1!important;transform:none!important;image-rendering:auto!important}@keyframes cheopsLogoLoop{to{transform:translateX(-50%)}}
/* project map */
.cheops-project-map{position:relative!important;background:#171717!important;color:#f4f1ec!important;padding:62px 0!important;margin:0 12px!important;border-radius:36px!important;overflow:hidden!important}.cheops-project-map .map-title{margin:15px 0 0!important;color:#fff!important;font-size:clamp(38px,4.2vw,64px)!important;line-height:1!important}.cheops-map-grid{margin-top:32px!important;display:grid!important;grid-template-columns:minmax(0,1.55fr) minmax(320px,.95fr)!important;gap:38px!important;align-items:stretch!important}#mapBox{height:480px!important;min-height:480px!important;position:relative!important;overflow:hidden!important;border-radius:22px!important;border:1px solid rgba(255,255,255,.14)!important;background:#d9d4cc!important}#real-map{position:absolute!important;inset:0!important;width:100%!important;height:100%!important}.cheops-map-info{display:flex!important;flex-direction:column!important;justify-content:center!important;color:#fff!important}.cheops-map-info h3{font-size:clamp(34px,3.2vw,52px)!important;line-height:1!important;margin:10px 0 0!important}.cheops-map-info #mStatement{margin:16px 0 0!important;color:rgba(255,255,255,.68)!important;font-size:13px!important;line-height:1.72!important}.cheops-map-info dl{margin:28px 0 0!important}.cheops-map-info dl>div{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:12px;color:rgba(255,255,255,.62)}.cheops-map-info dd{margin:0;color:#fff;font-size:16px}.cheops-map-info .link-arrow{margin-top:27px;font-size:9px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#e5cfa7}.cheops-map-icon{background:transparent!important;border:0!important}.cheops-pin{display:block;width:24px;height:24px;border-radius:50% 50% 50% 0;background:#e5cfa7;transform:rotate(-45deg);box-shadow:0 7px 18px rgba(0,0,0,.35);position:relative;border:3px solid #171717}.cheops-pin i{display:block;position:absolute;width:7px;height:7px;border-radius:50%;background:#171717;left:5.5px;top:5.5px}.cheops-pin.active{background:#fff}.cheops-tooltip{background:#171717!important;color:#fff!important;border:none!important;border-radius:8px!important}.cheops-tooltip:before{border-top-color:#171717!important}
/* footer rebuild */
.cheops-site-footer{padding:66px 28px 26px!important;background:#0d0d0c!important}.cheops-site-footer-inner{max-width:1460px!important}.cheops-footer-hero{display:grid;grid-template-columns:1.15fr .85fr;gap:80px;align-items:end;padding-bottom:48px}.cheops-footer-wordmark{color:#fff;text-decoration:none}.cheops-footer-wordmark .cheops-wordmark{justify-items:start;min-width:190px}.cheops-footer-wordmark .cheops-wordmark strong{font-size:42px}.cheops-footer-wordmark .cheops-wordmark small{font-size:8px;margin-left:5px}.cheops-footer-tagline{font-family:"Romie",Georgia,serif!important;font-size:clamp(44px,5.3vw,82px)!important;line-height:.93!important;letter-spacing:-.045em!important;max-width:720px!important;margin:30px 0 0!important}.cheops-footer-intro{max-width:500px;justify-self:end}.cheops-footer-intro>p{font-size:14px;line-height:1.8;color:rgba(255,255,255,.55);margin:0 0 24px}.cheops-footer-social{display:flex;flex-wrap:wrap;gap:10px}.cheops-footer-social a{display:inline-flex;padding:11px 14px;border:1px solid rgba(255,255,255,.16);border-radius:999px;color:#fff;text-decoration:none;font:700 9px/1 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;transition:.25s}.cheops-footer-social a:hover{background:#e5cfa7;color:#111;border-color:#e5cfa7;transform:translateY(-2px)}.cheops-footer-links{border-top:1px solid rgba(255,255,255,.12);padding:38px 0 42px;display:grid;grid-template-columns:repeat(3,1fr);gap:46px}.cheops-footer-col h4{font-size:9px!important;margin-bottom:18px!important}.cheops-footer-col a,.cheops-footer-col p{font-size:12px!important;line-height:1.7!important;margin-bottom:9px!important}.cheops-footer-bottom{padding-top:20px!important}
/* contact typography */
body.cheops-contact-page .contact-title{font-size:clamp(46px,5vw,72px)!important;line-height:.98!important}body.cheops-contact-page .contact-copy h2{font-size:clamp(42px,4.1vw,62px)!important;line-height:1!important;max-width:650px!important}body.cheops-contact-page .contact-copy>p{font-size:13px!important;line-height:1.72!important}body.cheops-contact-page .contact-form-card h3{font-size:30px!important}body.cheops-contact-page .contact-quick-card span{font-size:18px!important}
@media(max-width:980px){.cheops-header-doc{display:none!important}.cheops-wordmark strong{font-size:24px}.cheops-map-grid{grid-template-columns:1fr!important}.cheops-footer-hero{grid-template-columns:1fr;gap:36px}.cheops-footer-intro{justify-self:start}.cheops-footer-links{grid-template-columns:1fr 1fr}.cheops-logo-item{width:215px;height:94px}.cheops-logo-band-developers .cheops-logo-item{width:195px;height:84px}}
@media(max-width:640px){body.cheops-prive-theme .sec{padding-top:38px!important;padding-bottom:38px!important}.cheops-logo-band-head{padding:20px 18px 8px!important}.cheops-logo-band-head .eyebrow{font-size:9px!important}.cheops-logo-set{gap:44px;padding-right:44px}.cheops-logo-item{width:180px;height:82px}.cheops-logo-band-developers .cheops-logo-item{width:172px;height:76px}.cheops-project-map{margin:0 8px!important;padding:48px 0!important;border-radius:26px!important}#mapBox{height:345px!important;min-height:345px!important}.cheops-footer-links{grid-template-columns:1fr}.cheops-site-footer{padding:54px 18px 22px!important}.cheops-footer-tagline{font-size:48px!important}.cheops-footer-wordmark .cheops-wordmark strong{font-size:34px}}
@media(prefers-reduced-motion:reduce){.cheops-logo-track{animation:none!important}}

</style>
<?php }
add_action('wp_head','cheops_v17_polish_css',400);


/* =========================================================
   V19 — refined logo headings + compact footer
   ========================================================= */
function cheops_v19_refine_css(){ ?>
<style id="cheops-v19-refine-css">
/* Logo section headings: normal text, selective bold, no pill treatment. */
.cheops-logo-band-head{
  max-width:none!important;
  margin:0!important;
  padding:24px 48px 8px!important;
  text-align:left!important;
}
.cheops-logo-band-title{
  margin:0!important;
  padding:0!important;
  background:none!important;
  border:0!important;
  color:#1a1a1a!important;
  font-family:"Romie",Georgia,serif!important;
  font-size:clamp(28px,2.5vw,42px)!important;
  line-height:1.04!important;
  font-weight:400!important;
  letter-spacing:-.02em!important;
  text-transform:none!important;
}
.cheops-logo-marquee{padding-top:12px!important}

/* Footer: compact, quiet, no oversized display statement. */
.cheops-site-footer{
  background:#0d0d0c!important;
  color:#f4f1ec!important;
  padding:56px 30px 24px!important;
}
.cheops-site-footer-inner{max-width:1460px!important;margin:0 auto!important}
.cheops-footer-main{
  display:grid!important;
  grid-template-columns:minmax(280px,1.25fr) repeat(3,minmax(150px,.72fr))!important;
  gap:58px!important;
  align-items:start!important;
  padding-bottom:42px!important;
}
.cheops-footer-brand{max-width:390px!important}
.cheops-footer-wordmark{display:inline-block!important;color:#fff!important;text-decoration:none!important}
.cheops-footer-wordmark .cheops-wordmark{justify-items:start!important;min-width:150px!important}
.cheops-footer-wordmark .cheops-wordmark strong{font-size:32px!important;letter-spacing:.05em!important}
.cheops-footer-wordmark .cheops-wordmark small{font-size:7px!important;margin-top:4px!important;margin-left:4px!important}
.cheops-footer-brand>p{
  margin:22px 0 0!important;
  max-width:360px!important;
  color:rgba(255,255,255,.56)!important;
  font-family:Arial,Helvetica,sans-serif!important;
  font-size:12px!important;
  line-height:1.75!important;
}
.cheops-footer-cta{
  display:inline-flex!important;
  align-items:center!important;
  gap:14px!important;
  margin-top:22px!important;
  color:#f4f1ec!important;
  font:700 9px/1 Arial,Helvetica,sans-serif!important;
  letter-spacing:.12em!important;
  text-transform:uppercase!important;
  text-decoration:none!important;
  padding-bottom:6px!important;
  border-bottom:1px solid rgba(229,207,167,.48)!important;
  transition:color .3s,border-color .3s!important;
}
.cheops-footer-cta span{transition:transform .3s!important}
.cheops-footer-cta:hover{color:#e5cfa7!important;border-color:#e5cfa7!important}
.cheops-footer-cta:hover span{transform:translateX(4px)!important}
.cheops-footer-col h4{
  margin:4px 0 17px!important;
  color:#d9bd85!important;
  font:700 9px/1 Arial,Helvetica,sans-serif!important;
  letter-spacing:.16em!important;
  text-transform:uppercase!important;
}
.cheops-footer-col a,.cheops-footer-col p{
  display:block!important;
  margin:0 0 9px!important;
  color:rgba(255,255,255,.58)!important;
  font:400 12px/1.6 Arial,Helvetica,sans-serif!important;
  text-decoration:none!important;
}
.cheops-footer-col a{width:max-content;max-width:100%;transition:color .25s,transform .25s!important}
.cheops-footer-col a:hover{color:#fff!important;transform:translateX(2px)!important}
.cheops-footer-contact p{max-width:260px!important}
.cheops-footer-lower{
  border-top:1px solid rgba(255,255,255,.11)!important;
  padding-top:20px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:24px!important;
}
.cheops-footer-social{display:flex!important;flex-wrap:wrap!important;gap:18px!important}
.cheops-footer-social a{
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:none!important;
  color:rgba(255,255,255,.64)!important;
  font:600 9px/1 Arial,Helvetica,sans-serif!important;
  letter-spacing:.08em!important;
  text-transform:none!important;
  text-decoration:none!important;
}
.cheops-footer-social a:hover{background:none!important;color:#e5cfa7!important;transform:none!important}
.cheops-footer-meta{display:flex!important;gap:24px!important;flex-wrap:wrap!important;color:rgba(255,255,255,.32)!important;font:600 8px/1.4 Arial,Helvetica,sans-serif!important;letter-spacing:.12em!important;text-transform:uppercase!important}
/* retire older footer layout rules */
.cheops-footer-hero,.cheops-footer-links,.cheops-footer-bottom,.cheops-footer-tagline,.cheops-footer-intro{display:none!important}
@media(max-width:980px){
  .cheops-logo-band-head{padding-left:32px!important;padding-right:32px!important}
  .cheops-footer-main{grid-template-columns:1.2fr 1fr 1fr!important;gap:38px!important}
  .cheops-footer-brand{grid-column:1/-1!important;max-width:520px!important}
}
@media(max-width:640px){
  .cheops-logo-band-head{padding:22px 20px 8px!important}
  .cheops-logo-band-title{font-size:16px!important}
  .cheops-site-footer{padding:46px 20px 22px!important}
  .cheops-footer-main{grid-template-columns:1fr 1fr!important;gap:34px 24px!important;padding-bottom:34px!important}
  .cheops-footer-brand{grid-column:1/-1!important}
  .cheops-footer-contact{grid-column:1/-1!important}
  .cheops-footer-lower{align-items:flex-start!important;flex-direction:column!important;gap:18px!important}
  .cheops-footer-meta{gap:10px 18px!important}
}


/* V22 — compact logo bands: 69% visual width / 80px max height */
.cheops-logo-track{animation-duration:34s!important;}
.cheops-logo-set{gap:54px!important;padding-right:54px!important;}
.cheops-logo-item,.cheops-logo-band-developers .cheops-logo-item{
  width:170px!important;
  height:92px!important;
  overflow:visible!important;
  flex:0 0 170px!important;
  display:grid!important;
  place-items:center!important;
}
.cheops-logo-item img{
  width:auto!important;
  height:auto!important;
  max-width:69%!important;
  max-height:80px!important;
  object-fit:contain!important;
  object-position:center center!important;
  display:block!important;
}
.cheops-logo-marquee{padding:10px 0 22px!important;overflow:hidden!important;}
@media(max-width:980px){
  .cheops-logo-set{gap:46px!important;padding-right:46px!important;}
  .cheops-logo-item,.cheops-logo-band-developers .cheops-logo-item{width:150px!important;height:82px!important;flex-basis:150px!important;}
  .cheops-logo-item img{max-width:69%!important;max-height:72px!important;}
}
@media(max-width:640px){
  .cheops-logo-band-title{font-size:clamp(25px,7.5vw,34px)!important;line-height:1.04!important}
  .cheops-logo-set{gap:34px!important;padding-right:34px!important;}
  .cheops-logo-item,.cheops-logo-band-developers .cheops-logo-item{width:128px!important;height:72px!important;flex-basis:128px!important;}
  .cheops-logo-item img{max-width:72%!important;max-height:62px!important;}
}
</style>
<?php }
add_action('wp_head','cheops_v19_refine_css',430);


/* =========================================================
 * V24 — Clinics category + mobile About title guard
 * ========================================================= */
function cheops_v24_mobile_about_fix_css(){ ?>
<style id="cheops-v24-mobile-about-fix-css">
@media(max-width:640px){
  body.page-template-page-about #hero .about-hero-title{
    width:100%!important;
    max-width:100%!important;
    margin-left:0!important;
    margin-right:0!important;
    padding:0 4px!important;
    font-size:clamp(30px,9.2vw,40px)!important;
    line-height:1.06!important;
    letter-spacing:-.03em!important;
    white-space:normal!important;
    overflow:visible!important;
    text-align:center!important;
  }
  body.page-template-page-about #hero .about-hero-title .hero-title-line,
  body.page-template-page-about #hero .about-hero-title .rl,
  body.page-template-page-about #hero .about-hero-title .rl>span,
  body.page-template-page-about #hero .about-hero-title .cheops-word{
    display:inline!important;
    width:auto!important;
    max-width:none!important;
    overflow:visible!important;
    white-space:normal!important;
  }
  body.page-template-page-about #hero .about-hero-title .hero-title-line{
    line-height:inherit!important;
  }
}
</style>
<?php }
add_action('wp_head','cheops_v24_mobile_about_fix_css',490);


/* =========================================================
 * V26 — definitive mobile About hero title wrap
 * ========================================================= */
function cheops_v26_about_title_css(){ ?>
<style id="cheops-v26-about-title-css">
body.page-template-page-about #hero .about-title-part{display:inline-block!important;vertical-align:baseline!important;overflow:visible!important}
body.page-template-page-about #hero .about-title-first{margin-right:.16em!important}
@media(max-width:640px){
  body.page-template-page-about #hero .about-hero-title{
    width:100%!important;
    max-width:100%!important;
    font-size:clamp(38px,11.2vw,54px)!important;
    line-height:.98!important;
    letter-spacing:-.035em!important;
    padding:0 14px!important;
    overflow:visible!important;
  }
  body.page-template-page-about #hero .about-hero-title .hero-title-line{
    display:flex!important;
    flex-direction:column!important;
    align-items:center!important;
    justify-content:center!important;
    width:100%!important;
    max-width:100%!important;
    overflow:visible!important;
  }
  body.page-template-page-about #hero .about-title-part,
  body.page-template-page-about #hero .about-title-part>span,
  body.page-template-page-about #hero .about-title-part .cheops-word{
    display:block!important;
    width:max-content!important;
    max-width:100%!important;
    white-space:nowrap!important;
    overflow:visible!important;
  }
  body.page-template-page-about #hero .about-title-first{margin-right:0!important;margin-bottom:.04em!important}
  body.page-template-page-about #hero .about-title-brand{font-size:.92em!important}
}
</style>
<?php }
add_action('wp_head','cheops_v26_about_title_css',520);


/* =========================================================
   Global CTA typography — one button language across the site
   ========================================================= */
function cheops_global_uppercase_buttons_css(){ ?>
<style id="cheops-global-uppercase-buttons">
.btn,
button.btn,
a.btn,
.cheops-header-cta,
.cheops-header-doc,
.property-contact-btn,
.cheops-footer-cta,
.cheops-whatsapp-channel,
.cheops-modal button[type="submit"],
.cheops-fab-label,
input[type="submit"],
button[type="submit"],
button[type="reset"],
.link-arrow{
  font-family:Arial,Helvetica,sans-serif !important;
  font-size:10px !important;
  font-weight:800 !important;
  line-height:1 !important;
  letter-spacing:.14em !important;
  text-transform:uppercase !important;
}

/* Keep the same CTA rhythm on the homepage and inner pages. */
body.home .btn,
body.home a.btn,
body.home button.btn,
body.home .link-arrow,
body.cheops-prive-theme .btn,
body.cheops-prive-theme a.btn,
body.cheops-prive-theme button.btn,
body.cheops-prive-theme .link-arrow,
body.cheops-contact-page .btn,
body.single-cheops_unit .btn,
body.tax-project_city .btn{
  font-family:Arial,Helvetica,sans-serif !important;
  font-size:10px !important;
  font-weight:800 !important;
  line-height:1 !important;
  letter-spacing:.14em !important;
  text-transform:uppercase !important;
}

@media(max-width:640px){
  .btn,button.btn,a.btn,.property-contact-btn,.cheops-footer-cta,.cheops-whatsapp-channel,.link-arrow{
    font-size:9px !important;
    letter-spacing:.12em !important;
  }
}
</style>
<?php }
add_action('wp_head','cheops_global_uppercase_buttons_css',9999);


/* =========================================================
   Logo band heading typography — Romie Regular only
   ========================================================= */
function cheops_logo_band_romie_regular_css(){ ?>
<style id="cheops-logo-band-romie-regular-css">
.cheops-logo-band-title,
.cheops-logo-band-title strong,
.cheops-logo-band-title b{
  font-family:"Romie", Georgia, serif !important;
  font-weight:400 !important;
  font-style:normal !important;
  font-synthesis:none !important;
  letter-spacing:-.025em !important;
  text-transform:none !important;
  text-shadow:none !important;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
</style>
<?php }
add_action('wp_head','cheops_logo_band_romie_regular_css',999);
