<?php
if (!defined('ABSPATH')) exit;

/**
 * English and Arabic.
 *
 * The Arabic site lives under /ar/ (for example /ar/about/). The request is
 * routed exactly like its English twin, then the finished page is translated
 * on its way out: every visible text, alt text, placeholder and meta
 * description is looked up in the dictionary. The dictionary ships with the
 * theme (inc/i18n-ar.php) and every entry can be changed, in English or in
 * Arabic, from Dashboard → Site Content (inc/i18n-admin.php).
 */

function cheops_home_path() {
    return rtrim((string) parse_url((string) get_option('home'), PHP_URL_PATH), '/');
}

function cheops_detect_lang() {
    if (defined('WP_CLI') && WP_CLI) return 'en';
    $base = '';
    $home = (string) get_option('home');
    if ($home !== '') $base = rtrim((string) parse_url($home, PHP_URL_PATH), '/');
    $ar_prefix = '#^' . preg_quote($base, '#') . '/ar(?=/|\?|$)#';
    if (wp_doing_ajax() || is_admin()) {
        // Forms posted from an Arabic page answer in Arabic.
        $ref = (string) ($_SERVER['HTTP_REFERER'] ?? '');
        return (wp_doing_ajax() && $ref !== '' && preg_match($ar_prefix, (string) parse_url($ref, PHP_URL_PATH))) ? 'ar' : 'en';
    }
    $uri = (string) ($_SERVER['REQUEST_URI'] ?? '');
    if (!preg_match($ar_prefix, $uri)) return 'en';
    $rest = substr($uri, strlen($base) + 3);
    if ($rest === '' || $rest[0] !== '/') $rest = '/' . $rest;
    $_SERVER['CHEOPS_ORIGINAL_URI'] = $uri;
    $_SERVER['REQUEST_URI'] = $base . $rest;
    return 'ar';
}
if (!defined('CHEOPS_LANG')) define('CHEOPS_LANG', cheops_detect_lang());

function cheops_lang() { return $GLOBALS['cheops_force_lang'] ?? CHEOPS_LANG; }
function cheops_is_ar() { return cheops_lang() === 'ar'; }

/** Translate a piece of HTML into Arabic outside a page view (used for articles). */
function cheops_i18n_translate_fragment($html) {
    $GLOBALS['cheops_force_lang'] = 'ar';
    $html = cheops_i18n_blocks((string) $html);
    $parts = preg_split('#(<[^>]*>)#', $html, -1, PREG_SPLIT_DELIM_CAPTURE);
    foreach ($parts as $i => $part) {
        if ($i % 2 === 0 && $part !== '') {
            $tr = cheops_i18n_lookup($part, false);
            if ($tr !== null) $parts[$i] = cheops_i18n_esc(str_replace("\n", ' ', $tr));
        }
    }
    unset($GLOBALS['cheops_force_lang']);
    return implode('', $parts);
}

/** Links built by WordPress stay inside the language being viewed. */
function cheops_ar_home_url($url, $path = '') {
    if (!cheops_is_ar() || is_admin()) return $url;
    if (preg_match('#^/?(wp-json|wp-admin|wp-content|wp-includes|wp-login|xmlrpc|feed)#', ltrim((string) $path)) || strpos((string) $path, 'rest_route') !== false) return $url;
    return cheops_url_in_lang($url, 'ar');
}
add_filter('home_url', 'cheops_ar_home_url', 10, 2);

/** The same address in the other language. */
function cheops_url_in_lang($url, $lang) {
    $base = cheops_home_path();
    $p = parse_url($url);
    if (empty($p['host'])) return $url;
    $path = $p['path'] ?? '';
    if ($base !== '' && strpos($path, $base) !== 0) return $url;
    $rest = substr($path, strlen($base));
    $rest = preg_replace('#^/ar(?=/|$)#', '', $rest);
    if ($lang === 'ar') $rest = '/ar' . ($rest === '' ? '/' : $rest);
    $out = ($p['scheme'] ?? 'https') . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '') . $base . ($rest === '' ? '/' : $rest);
    if (isset($p['query'])) $out .= '?' . $p['query'];
    if (isset($p['fragment'])) $out .= '#' . $p['fragment'];
    return $out;
}

/** After a form posts to admin-post.php, send the visitor back in the language they wrote in. */
function cheops_url_for_referer_lang($url) {
    $ref = (string) parse_url((string) ($_SERVER['HTTP_REFERER'] ?? ''), PHP_URL_PATH);
    return preg_match('#^' . preg_quote(cheops_home_path(), '#') . '/ar(?=/|$)#', $ref) ? cheops_url_in_lang($url, 'ar') : $url;
}

function cheops_current_url_in_lang($lang) {
    $home = (string) get_option('home');
    $p = parse_url($home);
    $origin = ($p['scheme'] ?? 'https') . '://' . ($p['host'] ?? '') . (isset($p['port']) ? ':' . $p['port'] : '');
    return cheops_url_in_lang($origin . (string) ($_SERVER['REQUEST_URI'] ?? '/'), $lang);
}

// The Arabic address is canonical for Arabic pages; never bounce it to English.
add_filter('redirect_canonical', static function ($redirect) { return cheops_is_ar() ? false : $redirect; });
add_filter('show_admin_bar', static function ($show) { return cheops_is_ar() ? false : $show; });
add_filter('body_class', static function ($classes) { if (cheops_is_ar()) $classes[] = 'cheops-ar'; return $classes; });

function cheops_i18n_head() {
    if (is_admin()) return;
    $en = cheops_current_url_in_lang('en');
    $ar = cheops_current_url_in_lang('ar');
    echo '<link rel="alternate" hreflang="en" href="' . esc_url($en) . '">' . "\n";
    echo '<link rel="alternate" hreflang="ar" href="' . esc_url($ar) . '">' . "\n";
    echo '<link rel="alternate" hreflang="x-default" href="' . esc_url($en) . '">' . "\n";
    if (!cheops_is_ar()) return;
    $dir = get_template_directory_uri() . '/assets/';
    // The Arabic font is printed inline so no cache, CDN or plugin can keep it from loading.
    $font_css = (string) @file_get_contents(get_template_directory() . '/assets/css/arabic-font.css');
    if ($font_css !== '') echo '<style id="cheops-arabic-font">' . str_replace('../fonts/', $dir . 'fonts/', $font_css) . '</style>' . "\n";
    echo '<link rel="stylesheet" id="cheops-rtl-css" href="' . esc_url($dir . 'css/rtl.css?ver=' . cheops_asset_ver('assets/css/rtl.css')) . '">' . "\n";
}
add_action('wp_head', 'cheops_i18n_head', 999);

/** Translate a text used in PHP messages (form replies). */
function cheops_t($text) {
    $tr = cheops_i18n_lookup($text, false);
    return $tr === null ? $text : $tr;
}

/* Texts that scripts write into the page (button states, form replies). */
function cheops_js_strings() {
    return ['Request sent', 'Subscribed', 'Thank you!', 'Thank you', 'Something went wrong.', 'Something went wrong. Please try again.', 'Explore', 'Sending…'];
}

function cheops_js_i18n() {
    if (is_admin()) return;
    $out = [];
    foreach (cheops_js_strings() as $s) {
        $tr = cheops_i18n_lookup($s, false);
        if ($tr !== null) $out[$s] = $tr;
    }
    echo '<script id="cheops-i18n-js">window.CHEOPS_I18N=' . wp_json_encode((object) $out, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) . ';window.cheopsT=function(s){return (window.CHEOPS_I18N&&window.CHEOPS_I18N[s])||s};</script>' . "\n";
}
add_action('wp_head', 'cheops_js_i18n', 1);

/** EN / ع switch for the header and the mobile menu. */
function cheops_lang_switch_html($class = 'cheops-lang-switch') {
    if (cheops_is_ar()) {
        return '<a class="' . esc_attr($class) . '" href="' . esc_url(cheops_current_url_in_lang('en')) . '" hreflang="en" lang="en" data-no-i18n>English</a>';
    }
    return '<a class="' . esc_attr($class) . '" href="' . esc_url(cheops_current_url_in_lang('ar')) . '" hreflang="ar" lang="ar">العربية</a>';
}

/* ---------------------------------------------------------------------
 * Dictionary
 * ------------------------------------------------------------------- */

/** Theme dictionary: [group => [English => Arabic]]. */
function cheops_i18n_seed() {
    static $seed = null;
    if ($seed === null) {
        $seed = include get_template_directory() . '/inc/i18n-ar.php';
        if (!is_array($seed)) $seed = [];
    }
    return $seed;
}

/** Edits made in Dashboard → Site Content: [original English => ['en' => .., 'ar' => .., 'group' => ..]]. */
function cheops_i18n_saved() {
    $saved = get_option('cheops_i18n', []);
    return is_array($saved) ? $saved : [];
}

/** Lookup key: entities decoded, quotes and spaces normalised, arrows dropped, lower case. */
function cheops_i18n_key($text) {
    $t = html_entity_decode((string) $text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $t = strtr($t, ['’' => "'", '‘' => "'", '“' => '"', '”' => '"', "\u{00A0}" => ' ', '–' => '-', '—' => '-']);
    $t = preg_replace('/^\s*[→←↗◆▦]\s*|\s*[→←↗◆▦]\s*$/u', '', $t);
    $t = preg_replace('/\s+/u', ' ', $t);
    return mb_strtolower(trim($t), 'UTF-8');
}

/** key => replacement text for the language being shown. */
function cheops_i18n_map($lang = null) {
    static $maps = [];
    $lang = $lang ?: cheops_lang();
    if (isset($maps[$lang])) return $maps[$lang];
    $map = [];
    if ($lang === 'ar') {
        foreach (cheops_i18n_seed() as $group => $pairs) {
            foreach ($pairs as $en => $ar) $map[cheops_i18n_key($en)] = $ar;
        }
    }
    foreach (cheops_i18n_saved() as $orig => $row) {
        $k = cheops_i18n_key($orig);
        if ($lang === 'ar') {
            if (isset($row['ar']) && trim($row['ar']) !== '') $map[$k] = $row['ar'];
            elseif (!isset($map[$k]) && isset($row['en']) && trim($row['en']) !== '') $map[$k] = $row['en'];
        } elseif (isset($row['en']) && trim($row['en']) !== '' && $row['en'] !== $orig) {
            $map[$k] = $row['en'];
        }
    }
    return $maps[$lang] = $map;
}

function cheops_i18n_ar_number($n, $one, $two, $few, $many) {
    $n = (int) $n;
    if ($n === 0) return null;
    if ($n === 1) return $one;
    if ($n === 2) return $two;
    if ($n % 100 >= 3 && $n % 100 <= 10) return $n . ' ' . $few;
    return $n . ' ' . $many;
}

/** Patterns for prices, areas, dates and counts, which change with the listings. */
function cheops_i18n_rules($t) {
    static $months = ['Jan' => 'يناير', 'Feb' => 'فبراير', 'Mar' => 'مارس', 'Apr' => 'أبريل', 'May' => 'مايو', 'Jun' => 'يونيو', 'Jul' => 'يوليو', 'Aug' => 'أغسطس', 'Sep' => 'سبتمبر', 'Oct' => 'أكتوبر', 'Nov' => 'نوفمبر', 'Dec' => 'ديسمبر',
        'January' => 'يناير', 'February' => 'فبراير', 'March' => 'مارس', 'April' => 'أبريل', 'June' => 'يونيو', 'July' => 'يوليو', 'August' => 'أغسطس', 'September' => 'سبتمبر', 'October' => 'أكتوبر', 'November' => 'نوفمبر', 'December' => 'ديسمبر'];
    if (preg_match('/^EGP\s*([\d.,]+)\s*M$/u', $t, $m)) return $m[1] . ' مليون جنيه';
    if (preg_match('/^EGP\s*([\d.,]+)(\s*\/\s*(?:sqm|m²))?$/u', $t, $m)) return $m[1] . ' جنيه' . (!empty($m[2]) ? '/م²' : '');
    if (preg_match('/^\$\s*([\d.,]+)\s*\/\s*(?:sqm|m²)$/u', $t, $m)) return $m[1] . ' دولار/م²';
    if (preg_match('/^([\d.,]+)\s*(?:m²|sqm|m2)$/u', $t, $m)) return $m[1] . ' م²';
    if (preg_match('/^(\d+) Beds? · ([\d.,]+) m²$/u', $t, $m)) return $m[1] . ' غرف نوم · ' . $m[2] . ' م²';
    if (preg_match('/^(\d+) Beds?$/u', $t, $m)) return $m[1] . ' غرف نوم';
    if (preg_match('/^(\d+) propert(?:y|ies)$/iu', $t, $m)) return cheops_i18n_ar_number($m[1], 'عقار واحد', 'عقاران', 'عقارات', 'عقارًا') ?? 'لا توجد عقارات';
    if (preg_match('/^(\d+) projects?$/iu', $t, $m)) return cheops_i18n_ar_number($m[1], 'مشروع واحد', 'مشروعان', 'مشروعات', 'مشروعًا') ?? 'لا توجد مشروعات حاليًا';
    if (preg_match('/^(\d+) units?$/iu', $t, $m)) return cheops_i18n_ar_number($m[1], 'وحدة واحدة', 'وحدتان', 'وحدات', 'وحدة') ?? 'لا توجد وحدات';
    if (preg_match('/^(\d{1,2}) ([A-Z][a-z]+) (\d{4})$/u', $t, $m) && isset($months[$m[2]])) return (int) $m[1] . ' ' . $months[$m[2]] . ' ' . $m[3];
    if (preg_match('/^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/u', $t, $m) && isset($months[$m[1]])) return (int) $m[2] . ' ' . $months[$m[1]] . ' ' . $m[3];
    if (preg_match('/^Project (\d+)$/u', $t, $m)) return 'المشروع ' . $m[1];
    if (preg_match('/^([\d.,]+) EGP$/u', $t, $m)) return $m[1] . ' جنيه';
    if (preg_match('/^([\d.,]+) EGP \+ ([\d.,]+) USD$/u', $t, $m)) return $m[1] . ' جنيه + ' . $m[2] . ' دولار';
    if (preg_match('/^(?:(\d{1,2})-)?([A-Z][a-z]{2})-(\d{4})$/u', $t, $m) && isset($months[$m[2]])) return ($m[1] !== '' ? (int) $m[1] . ' ' : '') . $months[$m[2]] . ' ' . $m[3];
    if (preg_match('/^© (\d{4}) Cheops Privé$/u', $t, $m)) return '© ' . $m[1] . ' Cheops Privé';
    if (preg_match('/^View all (\d+) photos$/u', $t, $m)) return 'عرض جميع الصور (' . $m[1] . ')';
    if (preg_match('/^(\d+) installments payable over ([\d.]+) years?; \d+ (quarterly|biannual|monthly|annual|semi-annual) installments per year(?: \(([^)]+)\))?(?: at (.+))?$/u', $t, $m)) {
        $kind = ['quarterly' => 'قسط ربع سنوي', 'biannual' => 'قسط نصف سنوي', 'semi-annual' => 'قسط نصف سنوي', 'monthly' => 'قسط شهري', 'annual' => 'قسط سنوي'][$m[3]];
        $when = '';
        if (!empty($m[4])) $when = ' (' . implode('، ', array_map(static function ($x) use ($months) { $x = trim($x); return $months[$x] ?? $x; }, explode(',', $m[4]))) . ')';
        $at = !empty($m[5]) ? ' بقيمة ' . (cheops_i18n_rules(trim($m[5])) ?? $m[5]) : '';
        return 'عدد الأقساط ' . $m[1] . ' على مدار ' . $m[2] . ' سنوات، بواقع ' . $kind . $when . $at;
    }
    if (preg_match('/^Curated residences selected by Cheops Privé at (.+?)\.?$/u', $t, $m)) return 'وحدات سكنية منتقاة بعناية من Cheops Privé في ' . $m[1] . '.';
    if (preg_match('/^Projects in (.+)$/u', $t, $m)) { $c = cheops_i18n_map()[cheops_i18n_key($m[1])] ?? $m[1]; return 'مشروعات في ' . $c; }
    if (preg_match('/^Discover our curated projects in (.+?)\. Compare each destination, property mix, starting price and availability through one consistent Cheops Privé experience\.$/u', $t, $m)) {
        $c = cheops_i18n_map()[cheops_i18n_key($m[1])] ?? $m[1];
        return 'اكتشف مشروعاتنا المختارة بعناية في ' . $c . '. قارن بين كل وجهة ومزيج العقارات والأسعار المبدئية والتوافر ضمن تجربة موحدة من Cheops Privé.';
    }
    // "Label: value" and "Label:" (property details, payment plans).
    if (preg_match('/^([A-Za-z0-9][^:]{0,50}):(?: (.+))?$/u', $t, $m)) {
        $map = cheops_i18n_map();
        $label = $map[cheops_i18n_key($m[1])] ?? cheops_i18n_rules($m[1]);
        if ($label !== null) {
            if (!isset($m[2]) || $m[2] === '') return $label . ':';
            $value = $map[cheops_i18n_key($m[2])] ?? cheops_i18n_rules($m[2]) ?? $m[2];
            return $label . ': ' . $value;
        }
    }
    if (preg_match('/^Delivery (.+)$/u', $t, $m)) return 'التسليم ' . strtr($m[1], ['Mid' => 'منتصف', 'End of' => 'نهاية', 'Early' => 'بداية', 'Ready' => 'جاهز']);
    return null;
}

/**
 * Translate one piece of visible text. Returns null when nothing matches.
 * Leading and trailing spaces, and an arrow at either end, are kept.
 */
function cheops_i18n_lookup($raw, $record = true) {
    $map = cheops_i18n_map();
    $text = html_entity_decode((string) $raw, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if (!preg_match('/\p{L}/u', $text)) return null;
    if (preg_match('/\p{Arabic}/u', $text)) return null;
    $k = cheops_i18n_key($text);
    if ($k === '') return null;
    $out = $map[$k] ?? null;
    $ar = cheops_is_ar();
    if ($out === null && $ar) {
        $core = trim(preg_replace('/^\s*[→←↗◆▦]\s*|\s*[→←↗◆▦]\s*$/u', '', $text));
        $out = cheops_i18n_rules($core);
        // "Project · City" and similar: translate each part that is known.
        if ($out === null && preg_match('/ [·–—|-] /u', $core)) {
            $parts = preg_split('/( [·–—|-] )/u', $core, -1, PREG_SPLIT_DELIM_CAPTURE);
            $hit = false;
            foreach ($parts as $i => $part) {
                if ($i % 2) continue;
                $tr = $map[cheops_i18n_key($part)] ?? cheops_i18n_rules($part);
                if ($tr !== null) { $parts[$i] = $tr; $hit = true; }
            }
            if ($hit) $out = implode('', $parts);
        }
        // "View X", "X in New Cairo", "X · Cheops" built around names.
        if ($out === null && preg_match('/^View (.+)$/u', $core, $m)) $out = 'عرض ' . (cheops_i18n_lookup($m[1], false) ?? $m[1]);
        if ($out === null && preg_match('/^(.+) in (New Cairo|Mostakbal City|North Coast|Shorouk City|New Capital)$/u', $core, $m)) $out = $m[1] . ' في ' . ($map[cheops_i18n_key($m[2])] ?? $m[2]);
        if ($out === null && preg_match('/^(.+) [·–-] Cheops$/u', $core, $m)) {
            $tr = cheops_i18n_lookup($m[1], false);
            if ($tr !== null) $out = $tr . ' · Cheops';
        }
        if ($out === null && $record) cheops_i18n_note_missing($core);
    }
    if ($out === null) return null;
    preg_match('/^(\s*)([→←↗◆▦]\s*)?/u', $text, $lead);
    preg_match('/(\s*[→←↗◆▦])?(\s*)$/u', $text, $trail);
    $before = ($lead[1] ?? '') . (!empty($lead[2]) ? ($ar ? strtr($lead[2], ['←' => '→']) : $lead[2]) : '');
    $after = (!empty($trail[1]) ? ($ar ? strtr($trail[1], ['→' => '←']) : $trail[1]) : '') . ($trail[2] ?? '');
    return $before . $out . $after;
}

/* Texts with no Arabic yet are listed in Site Content when an admin browses /ar/. */
function cheops_i18n_note_missing($text) {
    global $cheops_i18n_missing;
    if (!cheops_is_ar() || mb_strlen($text) < 2) return;
    if (preg_match('/^[\d\s.,+()\/#:%-]+$|@|^https?:|\b[A-Z]{1,5}-[A-Z0-9-]*\d/u', $text)) return;
    // Names (projects, developers, places) usually stay in English.
    if (preg_match('/^(?:[A-Z0-9ÉÈ][\w.&\'’É-]*[ ·–-]*){1,6}$/u', $text)) return;
    if (!is_array($cheops_i18n_missing)) $cheops_i18n_missing = [];
    $cheops_i18n_missing[$text] = 1;
}

function cheops_i18n_save_missing() {
    global $cheops_i18n_missing;
    if (empty($cheops_i18n_missing) || !function_exists('current_user_can')) return;
    if (!current_user_can('manage_options') && !(defined('CHEOPS_I18N_RECORD') && CHEOPS_I18N_RECORD)) return;
    $list = get_option('cheops_i18n_missing', []);
    if (!is_array($list)) $list = [];
    $before = count($list);
    $path = strtok((string) ($_SERVER['REQUEST_URI'] ?? '/'), '?');
    foreach (array_keys($cheops_i18n_missing) as $t) {
        if (!isset($list[$t]) && count($list) < 800) $list[$t] = $path;
    }
    if (count($list) !== $before) update_option('cheops_i18n_missing', $list, false);
    $cheops_i18n_missing = [];
}

/* ---------------------------------------------------------------------
 * Page translation
 * ------------------------------------------------------------------- */

function cheops_i18n_esc($text) {
    return htmlspecialchars($text, ENT_NOQUOTES, 'UTF-8', false);
}

/** Spread a translation over the pieces of a heading split into lines. */
function cheops_i18n_spread($text, $count) {
    if ($count < 2) return [$text];
    if (strpos($text, "\n") !== false) {
        $lines = array_map('trim', explode("\n", $text));
        if (count($lines) > $count) {
            $last = implode(' ', array_slice($lines, $count - 1));
            $lines = array_merge(array_slice($lines, 0, $count - 1), [$last]);
        }
        return array_pad($lines, $count, '');
    }
    $words = preg_split('/\s+/u', trim($text));
    if (count($words) < $count) return array_pad([implode(' ', $words)], $count, '');
    $total = mb_strlen(implode(' ', $words));
    $lines = [];
    $line = [];
    $done = 0;
    foreach ($words as $i => $w) {
        $line[] = $w;
        $done += mb_strlen($w) + 1;
        $left_words = count($words) - $i - 1;
        $left_lines = $count - count($lines) - 1;
        if ($left_lines > 0 && ($done >= $total * (count($lines) + 1) / $count || $left_words === $left_lines)) {
            $lines[] = implode(' ', $line);
            $line = [];
        }
    }
    $lines[] = implode(' ', $line);
    return array_pad($lines, $count, '');
}

/**
 * Headings and paragraphs split over several spans (one per animated line)
 * are translated as a whole, then spread back over the same spans.
 */
function cheops_i18n_blocks($html) {
    return preg_replace_callback('#<(h[1-6]|p|a|button|li|dt|dd|label|blockquote|figcaption)\b([^>]*)>((?:(?!<\1\b|</\1>).)*)</\1>#is', static function ($m) {
        if (strpos($m[2], 'data-no-i18n') !== false) return $m[0];
        $inner = '<' . $m[1] . $m[2] . '>' . cheops_i18n_blocks($m[3]) . '</' . $m[1] . '>';
        $parts = preg_split('#(<[^>]*>)#', $m[3], -1, PREG_SPLIT_DELIM_CAPTURE);
        $slots = [];
        foreach ($parts as $i => $part) {
            if ($i % 2 === 0 && preg_match('/\p{L}/u', html_entity_decode($part, ENT_QUOTES, 'UTF-8'))) $slots[] = $i;
        }
        if (count($slots) < 2) return $inner;
        $whole = implode(' ', array_map(static function ($i) use ($parts) { return trim($parts[$i]); }, $slots));
        $map = cheops_i18n_map();
        $k = cheops_i18n_key($whole);
        if (!isset($map[$k])) return $inner;
        // Spread over separate lines only when the pieces really are lines;
        // inline pieces (a styled word) get the whole sentence in the first one.
        $is_lines = stripos($m[3], 'class="rl"') !== false || stripos($m[3], '<br') !== false;
        $lines = $is_lines ? cheops_i18n_spread($map[$k], count($slots)) : array_pad([str_replace("\n", ' ', $map[$k])], count($slots), '');
        foreach ($slots as $n => $i) {
            preg_match('/^(\s*)/u', $parts[$i], $a);
            preg_match('/(\s*)$/u', $parts[$i], $b);
            $parts[$i] = $lines[$n] === '' ? '' : $a[1] . cheops_i18n_esc($lines[$n]) . $b[1];
        }
        return '<' . $m[1] . $m[2] . '>' . implode('', $parts) . '</' . $m[1] . '>';
    }, $html);
}

function cheops_i18n_tag($tag) {
    if (cheops_is_ar() && stripos($tag, '<html') === 0) {
        $tag = preg_replace('/\s(lang|dir)="[^"]*"/i', '', $tag);
        return preg_replace('/^<html/i', '<html lang="ar" dir="rtl"', $tag);
    }
    if (strpos($tag, 'data-no-i18n') !== false) return $tag;
    $tag = preg_replace_callback('/\s(alt|title|aria-label|placeholder|data-cursor)="([^"]*)"/i', static function ($m) {
        $tr = cheops_i18n_lookup($m[2], false);
        return $tr === null ? $m[0] : ' ' . $m[1] . '="' . esc_attr(trim(str_replace("\n", ' ', $tr))) . '"';
    }, $tag);
    if (preg_match('/^<meta\b/i', $tag) && preg_match('/(name|property)="(description|og:title|og:description|twitter:title|twitter:description)"/i', $tag)) {
        $tag = preg_replace_callback('/\scontent="([^"]*)"/i', static function ($m) {
            $tr = cheops_i18n_lookup($m[1], false);
            return $tr === null ? $m[0] : ' content="' . esc_attr(trim($tr)) . '"';
        }, $tag);
    }
    if (preg_match('/^<meta\b[^>]*property="og:locale"/i', $tag) && cheops_is_ar()) $tag = preg_replace('/content="[^"]*"/', 'content="ar_EG"', $tag);
    if (preg_match('/^<input\b[^>]*type="(submit|button)"/i', $tag)) {
        $tag = preg_replace_callback('/\svalue="([^"]*)"/i', static function ($m) {
            $tr = cheops_i18n_lookup($m[1], false);
            return $tr === null ? $m[0] : ' value="' . esc_attr(trim($tr)) . '"';
        }, $tag);
    }
    return $tag;
}

function cheops_i18n_html($html) {
    if (stripos($html, '<html') === false) return $html;
    if (!cheops_is_ar() && !cheops_i18n_map('en')) return $html;
    // Scripts, styles and text areas pass through untouched.
    $chunks = preg_split('#(<script\b.*?</script>|<style\b.*?</style>|<textarea\b.*?</textarea>|<!--.*?-->)#is', $html, -1, PREG_SPLIT_DELIM_CAPTURE);
    foreach ($chunks as $c => $chunk) {
        if ($chunk === '') continue;
        if ($c % 2 === 1) {
            if (stripos($chunk, '<textarea') === 0) $chunks[$c] = preg_replace_callback('#^<textarea\b[^>]*>#i', static function ($m) { return cheops_i18n_tag($m[0]); }, $chunk);
            continue;
        }
        $chunk = cheops_i18n_blocks($chunk);
        $parts = preg_split('#(<[^>]*>)#', $chunk, -1, PREG_SPLIT_DELIM_CAPTURE);
        $skip = 0;
        foreach ($parts as $i => $part) {
            if ($part === '') continue;
            if ($i % 2 === 1) {
                $parts[$i] = cheops_i18n_tag($part);
                continue;
            }
            $tr = cheops_i18n_lookup($part);
            if ($tr !== null) $parts[$i] = cheops_i18n_esc(str_replace("\n", ' ', $tr));
        }
        $chunks[$c] = implode('', $parts);
    }
    $html = implode('', $chunks);
    if (cheops_is_ar()) cheops_i18n_save_missing();
    return $html;
}

/* ---------------------------------------------------------------------
 * Articles: an Arabic title, summary and text on each post.
 * ------------------------------------------------------------------- */

function cheops_post_ar($post_id, $field) {
    return (string) get_post_meta($post_id, '_cheops_ar_' . $field, true);
}

add_filter('the_title', static function ($title, $id = 0) {
    if (!cheops_is_ar() || is_admin() || !$id || get_post_type($id) !== 'post') return $title;
    $ar = cheops_post_ar($id, 'title');
    return $ar !== '' ? $ar : $title;
}, 10, 2);

add_filter('single_post_title', static function ($title, $post = null) {
    if (!cheops_is_ar() || !$post || $post->post_type !== 'post') return $title;
    $ar = cheops_post_ar($post->ID, 'title');
    return $ar !== '' ? $ar : $title;
}, 10, 2);

add_filter('document_title_parts', static function ($parts) {
    if (cheops_is_ar() && is_singular('post')) {
        $ar = cheops_post_ar(get_queried_object_id(), 'title');
        if ($ar !== '') $parts['title'] = $ar;
    }
    return $parts;
});

add_filter('the_content', static function ($content) {
    if (!cheops_is_ar() || is_admin()) return $content;
    $id = get_the_ID();
    if (!$id || get_post_type($id) !== 'post') return $content;
    $ar = cheops_post_ar($id, 'content');
    return $ar !== '' ? wpautop($ar) : $content;
}, 5);

add_filter('get_the_excerpt', static function ($excerpt, $post = null) {
    if (!cheops_is_ar() || is_admin() || !$post || $post->post_type !== 'post') return $excerpt;
    $ar = cheops_post_ar($post->ID, 'excerpt');
    return $ar !== '' ? $ar : $excerpt;
}, 10, 2);
