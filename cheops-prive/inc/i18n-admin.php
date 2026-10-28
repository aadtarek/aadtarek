<?php
if (!defined('ABSPATH')) exit;

/**
 * Dashboard → Site Content: every text on the site, in English and Arabic.
 * English edits change the English site; Arabic edits change /ar/.
 * Rows are saved as one JSON field, so hundreds of texts never hit PHP's
 * max_input_vars limit.
 */

add_action('admin_menu', static function () {
    add_menu_page('Site Content', 'Site Content', 'manage_options', 'cheops-site-content', 'cheops_site_content_page', 'dashicons-translation', 3);
});

function cheops_site_content_rows() {
    $saved = cheops_i18n_saved();
    $groups = [];
    $seen = [];
    foreach (cheops_i18n_seed() as $group => $pairs) {
        if ($group === 'Articles') continue; // edited on each article's screen
        foreach ($pairs as $en => $ar) {
            $row = $saved[$en] ?? [];
            $groups[$group][] = ['orig' => $en, 'en' => ($row['en'] ?? '') !== '' ? $row['en'] : $en, 'ar' => ($row['ar'] ?? '') !== '' ? $row['ar'] : $ar];
            $seen[$en] = true;
        }
    }
    foreach ($saved as $orig => $row) {
        if (isset($seen[$orig])) continue;
        $group = !empty($row['group']) ? $row['group'] : 'Added texts';
        $groups[$group][] = ['orig' => $orig, 'en' => ($row['en'] ?? '') !== '' ? $row['en'] : $orig, 'ar' => $row['ar'] ?? ''];
    }
    return $groups;
}

function cheops_site_content_page() {
    if (!current_user_can('manage_options')) return;
    $groups = cheops_site_content_rows();
    $missing = get_option('cheops_i18n_missing', []);
    if (!is_array($missing)) $missing = [];
    $known = [];
    foreach ($groups as $rows) foreach ($rows as $r) $known[cheops_i18n_key($r['orig'])] = true;
    $missing = array_filter($missing, static function ($path, $text) use ($known) { return !isset($known[cheops_i18n_key($text)]); }, ARRAY_FILTER_USE_BOTH);
    $ar_home = cheops_url_in_lang(home_url('/'), 'ar');
    ?>
    <div class="wrap cheops-sc">
      <h1>Site Content <small style="font-size:12px;font-weight:400;color:#787c82">Theme build 2026-10-27 · v5.4 TikTok</small></h1>
      <p class="cheops-sc-intro">Every text on the website in <strong>English</strong> and <strong>Arabic</strong>. Change a text and press <strong>Save changes</strong>. The English column changes the English site; the Arabic column changes the Arabic site (<a href="<?php echo esc_url($ar_home); ?>" target="_blank" rel="noopener"><?php echo esc_html($ar_home); ?></a>). Leave a box as it is to keep the current text. For a heading shown on two lines, put each line on its own line.</p>
      <?php if (isset($_GET['saved'])) : ?><div class="notice notice-success is-dismissible"><p>Saved. The website shows the new texts now.</p></div><?php endif; ?>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" id="cheopsScForm">
        <input type="hidden" name="action" value="cheops_save_site_content">
        <?php wp_nonce_field('cheops_site_content'); ?>
        <input type="hidden" name="rows" id="cheopsScRows" value="">
        <div class="cheops-sc-bar">
          <input type="search" id="cheopsScSearch" placeholder="Search English or Arabic…" class="regular-text">
          <select id="cheopsScGroup"><option value="">All sections</option><?php if ($missing) : ?><option value="__missing">Not translated yet (<?php echo count($missing); ?>)</option><?php endif; foreach (array_keys($groups) as $g) echo '<option value="' . esc_attr($g) . '">' . esc_html($g) . '</option>'; ?></select>
          <button type="submit" class="button button-primary button-large">Save changes</button>
        </div>

        <?php if ($missing) : ?>
        <details class="cheops-sc-group" data-group="__missing" open>
          <summary>Not translated yet <span class="count"><?php echo count($missing); ?></span></summary>
          <p class="description">These texts appeared on the Arabic site without a translation (for example a new property or project). Write the Arabic and save; leave empty to keep the English.</p>
          <table class="widefat striped"><thead><tr><th>English</th><th>Arabic</th></tr></thead><tbody>
          <?php foreach ($missing as $text => $path) : ?>
            <tr class="cheops-sc-row" data-orig="<?php echo esc_attr($text); ?>" data-new="1" data-group="Added texts">
              <td><div class="cheops-sc-orig"><?php echo esc_html($text); ?></div><small>Seen on <?php echo esc_html($path); ?></small><textarea class="cheops-sc-en" hidden><?php echo esc_textarea($text); ?></textarea></td>
              <td><textarea class="cheops-sc-ar" dir="rtl" rows="1"></textarea></td>
            </tr>
          <?php endforeach; ?>
          </tbody></table>
          <p><label><input type="checkbox" name="clear_missing" value="1"> Clear this list after saving</label></p>
        </details>
        <?php endif; ?>

        <?php foreach ($groups as $group => $rows) : ?>
        <details class="cheops-sc-group" data-group="<?php echo esc_attr($group); ?>">
          <summary><?php echo esc_html($group); ?> <span class="count"><?php echo count($rows); ?></span></summary>
          <table class="widefat striped"><thead><tr><th>English</th><th>Arabic</th></tr></thead><tbody>
          <?php foreach ($rows as $r) : ?>
            <tr class="cheops-sc-row" data-orig="<?php echo esc_attr($r['orig']); ?>" data-group="<?php echo esc_attr($group); ?>">
              <td><textarea class="cheops-sc-en" rows="1"><?php echo esc_textarea($r['en']); ?></textarea><?php if ($r['en'] !== $r['orig']) echo '<small>Original: ' . esc_html($r['orig']) . '</small>'; ?></td>
              <td><textarea class="cheops-sc-ar" dir="rtl" rows="1"><?php echo esc_textarea($r['ar']); ?></textarea></td>
            </tr>
          <?php endforeach; ?>
          </tbody></table>
        </details>
        <?php endforeach; ?>

        <details class="cheops-sc-group" data-group="__add" open>
          <summary>Add a text</summary>
          <p class="description">Translate any other English text that appears on the site: paste it exactly as it shows on the English page, then write the Arabic.</p>
          <table class="widefat"><tbody id="cheopsScAdd">
            <tr class="cheops-sc-row" data-new="1" data-group="Added texts"><td><textarea class="cheops-sc-en cheops-sc-add-en" rows="1" placeholder="English text"></textarea></td><td><textarea class="cheops-sc-ar" dir="rtl" rows="1" placeholder="النص بالعربية"></textarea></td></tr>
          </tbody></table>
          <p><button type="button" class="button" id="cheopsScMore">Add another</button></p>
        </details>
        <p><button type="submit" class="button button-primary button-large">Save changes</button></p>
      </form>
    </div>
    <style>
      .cheops-sc-intro{max-width:900px;font-size:14px}
      .cheops-sc-bar{position:sticky;top:32px;z-index:5;display:flex;gap:10px;align-items:center;padding:12px 0;background:#f0f0f1}
      .cheops-sc-group{background:#fff;border:1px solid #dcdcde;border-radius:6px;margin:0 0 12px;padding:0 14px}
      .cheops-sc-group summary{cursor:pointer;padding:14px 0;font-size:15px;font-weight:600}
      .cheops-sc-group summary .count{font-weight:400;color:#787c82;margin-left:6px}
      .cheops-sc-group table{margin:0 0 14px}
      .cheops-sc-group td{width:50%;vertical-align:top}
      .cheops-sc-group textarea{width:100%;min-height:34px;resize:vertical;font-size:13px;line-height:1.5}
      .cheops-sc-group textarea[dir="rtl"]{font-family:Tahoma,"Segoe UI",Arial,sans-serif;font-size:14px}
      .cheops-sc-group small{display:block;color:#787c82;margin-top:4px}
      .cheops-sc-orig{font-size:13px}
      .cheops-sc-row.is-changed td{background:#fcf9e8}
      .cheops-sc-row.is-hidden{display:none}
    </style>
    <script>
    (function(){
      const form=document.getElementById('cheopsScForm');
      const grow=t=>{t.style.height='auto';t.style.height=(t.scrollHeight+2)+'px';};
      const init=t=>{t.dataset.start=t.value;t.addEventListener('input',()=>{grow(t);t.closest('tr').classList.add('is-changed');});};
      form.querySelectorAll('textarea').forEach(init);
      form.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)d.querySelectorAll('textarea').forEach(grow);}));
      form.querySelectorAll('details[open] textarea').forEach(grow);
      document.getElementById('cheopsScMore').addEventListener('click',()=>{
        const tb=document.getElementById('cheopsScAdd'),row=tb.querySelector('tr').cloneNode(true);
        row.classList.remove('is-changed');row.querySelectorAll('textarea').forEach(t=>{t.value='';init(t);});tb.appendChild(row);
      });
      const search=document.getElementById('cheopsScSearch'),group=document.getElementById('cheopsScGroup');
      const filter=()=>{
        const q=search.value.trim().toLowerCase(),g=group.value;
        form.querySelectorAll('details.cheops-sc-group').forEach(d=>{
          const dg=d.dataset.group;if(dg==='__add')return;
          const inGroup=!g||g===dg;let hits=0;
          d.querySelectorAll('tr.cheops-sc-row').forEach(r=>{
            const text=[...r.querySelectorAll('textarea')].map(t=>t.value).join(' ').toLowerCase()+' '+(r.dataset.orig||'').toLowerCase();
            const show=inGroup&&(!q||text.includes(q));r.classList.toggle('is-hidden',!show);if(show)hits++;
          });
          d.style.display=hits?'':'none';
          if((q||g)&&hits){d.open=true;d.querySelectorAll('textarea').forEach(grow);}
        });
      };
      search.addEventListener('input',filter);group.addEventListener('change',filter);
      form.addEventListener('submit',()=>{
        const rows=[];
        form.querySelectorAll('tr.cheops-sc-row').forEach(r=>{
          const en=r.querySelector('.cheops-sc-en'),ar=r.querySelector('.cheops-sc-ar');
          const changed=en.value!==en.dataset.start||ar.value!==ar.dataset.start;
          if(!changed)return;
          const orig=r.dataset.orig||en.value.trim();
          if(!orig)return;
          rows.push({orig:orig,en:r.dataset.orig?en.value:'',ar:ar.value,group:r.dataset.group||''});
        });
        document.getElementById('cheopsScRows').value=JSON.stringify(rows);
      });
    })();
    </script>
    <?php
}

add_action('admin_post_cheops_save_site_content', static function () {
    if (!current_user_can('manage_options')) wp_die('Not allowed.');
    check_admin_referer('cheops_site_content');
    $rows = json_decode(wp_unslash($_POST['rows'] ?? '[]'), true);
    $saved = cheops_i18n_saved();
    $seed = [];
    foreach (cheops_i18n_seed() as $group => $pairs) foreach ($pairs as $en => $ar) $seed[$en] = $ar;
    $missing = get_option('cheops_i18n_missing', []);
    if (!is_array($missing)) $missing = [];
    $clean = static function ($t) { return trim(wp_kses((string) $t, ['br' => []])); };
    foreach (is_array($rows) ? $rows : [] as $row) {
        $orig = trim((string) ($row['orig'] ?? ''));
        if ($orig === '') continue;
        $en = $clean($row['en'] ?? '');
        $ar = $clean($row['ar'] ?? '');
        $entry = [];
        if ($en !== '' && $en !== $orig) $entry['en'] = $en;
        if ($ar !== '' && $ar !== ($seed[$orig] ?? null)) $entry['ar'] = $ar;
        if (!isset($seed[$orig])) $entry['group'] = sanitize_text_field($row['group'] ?? '') ?: 'Added texts';
        if ($entry && (isset($entry['en']) || isset($entry['ar']))) {
            $saved[$orig] = $entry;
        } else {
            unset($saved[$orig]);
        }
        if ($ar !== '') unset($missing[$orig]);
    }
    update_option('cheops_i18n', $saved, true);
    update_option('cheops_i18n_missing', !empty($_POST['clear_missing']) ? [] : $missing, false);
    wp_safe_redirect(add_query_arg(['page' => 'cheops-site-content', 'saved' => 1], admin_url('admin.php')));
    exit;
});

/* Arabic version of each article, edited on the article's own screen. */
add_action('add_meta_boxes_post', static function () {
    add_meta_box('cheops-ar-article', 'Arabic version', 'cheops_ar_article_box', 'post', 'normal', 'high');
});

function cheops_ar_article_box($post) {
    wp_nonce_field('cheops_ar_article', 'cheops_ar_article_nonce');
    echo '<p class="description">Shown on the Arabic site (' . esc_html(cheops_url_in_lang(get_permalink($post), 'ar')) . '). Leave empty to show the English.</p>';
    echo '<p><label><strong>Arabic title</strong><br><input type="text" name="cheops_ar_title" dir="rtl" class="widefat" value="' . esc_attr(cheops_post_ar($post->ID, 'title')) . '"></label></p>';
    echo '<p><label><strong>Arabic summary</strong><br><textarea name="cheops_ar_excerpt" dir="rtl" class="widefat" rows="3">' . esc_textarea(cheops_post_ar($post->ID, 'excerpt')) . '</textarea></label></p>';
    echo '<p><strong>Arabic article</strong></p>';
    wp_editor(cheops_post_ar($post->ID, 'content'), 'cheops_ar_content', ['textarea_name' => 'cheops_ar_content', 'textarea_rows' => 14, 'media_buttons' => true, 'tinymce' => ['directionality' => 'rtl']]);
}

add_action('save_post_post', static function ($post_id) {
    if (!isset($_POST['cheops_ar_article_nonce']) || !wp_verify_nonce($_POST['cheops_ar_article_nonce'], 'cheops_ar_article')) return;
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || !current_user_can('edit_post', $post_id)) return;
    update_post_meta($post_id, '_cheops_ar_title', sanitize_text_field(wp_unslash($_POST['cheops_ar_title'] ?? '')));
    update_post_meta($post_id, '_cheops_ar_excerpt', sanitize_textarea_field(wp_unslash($_POST['cheops_ar_excerpt'] ?? '')));
    update_post_meta($post_id, '_cheops_ar_content', wp_kses_post(wp_unslash($_POST['cheops_ar_content'] ?? '')));
});

/*
 * Fill the Arabic boxes of existing articles from the theme dictionary.
 * Version 2 brings the revised Arabic copy; an article whose Arabic was
 * edited in the dashboard (its text no longer matches the first fill) is left alone.
 */
function cheops_ar_article_first_fill_hashes() {
    return ['9ba9ab6aa89debc0aa09b0f423ab3e86', '5fcc5945bb8c2f4744bec5a3c0f8bcf3', '0d4764e1cb7f554f7825b1eb683bcb96', '5d69557407ba387f1682d23d0498f1e7', '44333f4e4793f7ae34495c805115c344', '8f8c2e5493c36ad54fa3357177bd50bf'];
}

add_action('admin_init', static function () {
    if (get_option('cheops_ar_articles_seeded') === '2' || !current_user_can('edit_posts')) return;
    $posts = get_posts(['post_type' => 'post', 'post_status' => 'any', 'posts_per_page' => -1]);
    foreach ($posts as $p) {
        $current = cheops_post_ar($p->ID, 'content');
        $hash = md5(cheops_post_ar($p->ID, 'title') . '|' . cheops_post_ar($p->ID, 'excerpt') . '|' . $current);
        if ($current !== '' && !in_array($hash, cheops_ar_article_first_fill_hashes(), true)) continue;
        $GLOBALS['cheops_force_lang'] = 'ar';
        $title = cheops_i18n_lookup($p->post_title, false);
        $excerpt = $p->post_excerpt !== '' ? cheops_i18n_lookup($p->post_excerpt, false) : null;
        unset($GLOBALS['cheops_force_lang']);
        $content = cheops_i18n_translate_fragment($p->post_content);
        if ($title === null && !preg_match('/\p{Arabic}/u', $content)) continue;
        if ($title !== null) update_post_meta($p->ID, '_cheops_ar_title', $title);
        if ($excerpt !== null) update_post_meta($p->ID, '_cheops_ar_excerpt', $excerpt);
        update_post_meta($p->ID, '_cheops_ar_content', $content);
    }
    update_option('cheops_ar_articles_seeded', '2', false);
}, 40);
