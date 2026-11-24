<?php
/**
 * Theme file tools: read, write, upload and delete files inside the active
 * theme folder only. Every change keeps a backup first, PHP is syntax checked
 * before it is saved, and the home page is loaded after each PHP change: if it
 * breaks, the old file goes straight back.
 */
if (!defined('ABSPATH')) exit;

function cheops_mcp_files_enabled() { return (bool) get_option('cheops_mcp_files', 1); }
function cheops_mcp_theme_root() { $d = get_template_directory(); return wp_normalize_path(realpath($d) ?: $d); }

/** Absolute path for a path relative to the theme folder, or an error when it leaves the folder. */
function cheops_mcp_theme_path($rel, $must_exist = true) {
    if (!cheops_mcp_files_enabled()) return new WP_Error('files', 'File editing is switched off in Settings → Cheops MCP.');
    $rel = ltrim(wp_normalize_path((string) $rel), '/');
    if ($rel === '' || preg_match('#(^|/)\.\.?(/|$)#', $rel) || strpos($rel, "\0") !== false) return new WP_Error('files', 'Give a path inside the theme folder, like assets/css/theme.css');
    $root = cheops_mcp_theme_root();
    $abs = $root . '/' . $rel;
    $real = realpath($must_exist ? $abs : dirname($abs));
    if ($must_exist && !$real) return new WP_Error('files', 'No such file: ' . $rel);
    if ($real && strpos(wp_normalize_path($real) . '/', $root . '/') !== 0) return new WP_Error('files', 'Outside the theme folder: ' . $rel);
    if (!$real && !$must_exist) { // new folder: check the nearest existing parent
        $parent = dirname($abs);
        while (!is_dir($parent) && strlen($parent) > strlen($root)) $parent = dirname($parent);
        $rp = realpath($parent);
        if (!$rp || strpos(wp_normalize_path($rp) . '/', $root . '/') !== 0) return new WP_Error('files', 'Outside the theme folder: ' . $rel);
    }
    return $abs;
}

function cheops_mcp_backup_dir() {
    $up = wp_upload_dir();
    $dir = wp_normalize_path($up['basedir']) . '/cheops-mcp-backups';
    if (!is_dir($dir)) {
        wp_mkdir_p($dir);
        @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
        @file_put_contents($dir . '/index.php', "<?php\n// Silence.\n");
    }
    return $dir;
}

/** Copy the current file (if any) into the backups and record it. Returns the backup id. */
function cheops_mcp_backup($rel, $abs, $action) {
    $id = gmdate('Ymd-His') . '-' . wp_generate_password(6, false, false);
    $entry = ['id' => $id, 'path' => $rel, 'action' => $action, 'time' => time(), 'existed' => file_exists($abs)];
    if ($entry['existed']) {
        $dest = cheops_mcp_backup_dir() . '/' . $id . '.bak';
        if (!@copy($abs, $dest)) return new WP_Error('files', 'Could not make a backup, nothing was changed.');
    }
    $list = get_option('cheops_mcp_backups', []);
    if (!is_array($list)) $list = [];
    array_unshift($list, $entry);
    foreach (array_slice($list, 200) as $old) @unlink(cheops_mcp_backup_dir() . '/' . $old['id'] . '.bak');
    update_option('cheops_mcp_backups', array_slice($list, 0, 200), false);
    return $id;
}

function cheops_mcp_put_back($entry) {
    $abs = cheops_mcp_theme_root() . '/' . $entry['path'];
    if (empty($entry['existed'])) return @unlink($abs) || !file_exists($abs);
    return @copy(cheops_mcp_backup_dir() . '/' . $entry['id'] . '.bak', $abs);
}

function cheops_mcp_find_backup($id) {
    foreach ((array) get_option('cheops_mcp_backups', []) as $e) if ($e['id'] === $id) return $e;
    return null;
}

/** PHP syntax check without running the code. */
function cheops_mcp_php_ok($code) {
    try { token_get_all($code, TOKEN_PARSE); return true; }
    catch (ParseError $e) { return new WP_Error('php', 'PHP error on line ' . $e->getLine() . ': ' . $e->getMessage() . '. Nothing was saved.'); }
}

/** Load the home page fresh; an error page means the change broke the site. */
function cheops_mcp_site_ok() {
    $r = wp_remote_get(add_query_arg('cheops_mcp_check', wp_generate_password(8, false, false), home_url('/')), ['timeout' => 25, 'sslverify' => false, 'headers' => ['Cache-Control' => 'no-cache']]);
    if (is_wp_error($r)) return new WP_Error('site', 'Could not load the home page to check the change (' . $r->get_error_message() . '), so the old file was put back to be safe.');
    $code = (int) wp_remote_retrieve_response_code($r);
    $body = (string) wp_remote_retrieve_body($r);
    if ($code >= 500 || stripos($body, 'critical error on this website') !== false || preg_match('#<b>(Fatal|Parse) error</b>#i', $body)) return new WP_Error('site', 'The home page broke after this change (HTTP ' . $code . '), so the old file was put back.');
    return true;
}

function cheops_mcp_after_change($rel, $abs, $backup_id) {
    if (preg_match('#\.php$#i', $rel)) {
        if (function_exists('opcache_invalidate')) @opcache_invalidate($abs, true);
        $ok = cheops_mcp_site_ok();
        if (is_wp_error($ok)) {
            $e = cheops_mcp_find_backup($backup_id);
            if ($e) cheops_mcp_put_back($e);
            if (function_exists('opcache_invalidate')) @opcache_invalidate($abs, true);
            return $ok;
        }
    }
    if (function_exists('cheops_mcp_bump')) cheops_mcp_bump();
    return true;
}

function cheops_mcp_text_file($rel) { return (bool) preg_match('#\.(php|css|js|json|txt|md|html?|svg|xml|po|pot|htaccess)$#i', $rel) || basename($rel) === '.htaccess'; }

add_filter('cheops_mcp_tools', static function ($tools) {
    $path = ['type' => 'string', 'description' => 'Path inside the theme folder, e.g. functions.php or assets/css/theme.css'];
    $tools['list_theme_files'] = [
        'description' => 'List files in the live theme folder (cheops-prive) with size and last change. Give a folder to look inside it.',
        'schema' => cheops_mcp_obj(['folder' => ['type' => 'string', 'description' => 'Folder inside the theme, empty for the top.'], 'recursive' => ['type' => 'boolean', 'default' => false]]), 'annotations' => CHEOPS_MCP_RO,
        'run' => static function ($a) {
            $root = cheops_mcp_theme_root();
            $folder = trim((string) ($a['folder'] ?? ''), '/');
            $dir = $folder === '' ? $root : cheops_mcp_theme_path($folder);
            if (is_wp_error($dir)) return $dir;
            if (!is_dir($dir)) return new WP_Error('files', 'Not a folder: ' . $folder);
            $out = [];
            $it = !empty($a['recursive']) ? new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS)) : new FilesystemIterator($dir, FilesystemIterator::SKIP_DOTS);
            foreach ($it as $f) {
                $out[] = ['path' => ltrim(substr(wp_normalize_path($f->getPathname()), strlen($root)), '/') . ($f->isDir() ? '/' : ''), 'size' => $f->isDir() ? null : $f->getSize(), 'modified' => gmdate('Y-m-d H:i', $f->getMTime())];
                if (count($out) >= 2000) break;
            }
            usort($out, static function ($x, $y) { return strcmp($x['path'], $y['path']); });
            return ['theme' => get_template(), 'items' => $out];
        },
    ];
    $tools['read_theme_file'] = [
        'description' => 'Read a text file from the live theme (PHP, CSS, JS, SVG, JSON...). Returns its content and a sha1 to pass back when writing.',
        'schema' => cheops_mcp_obj(['path' => $path], ['path']), 'annotations' => CHEOPS_MCP_RO,
        'run' => static function ($a) {
            $abs = cheops_mcp_theme_path($a['path']);
            if (is_wp_error($abs)) return $abs;
            if (!is_file($abs)) return new WP_Error('files', 'Not a file.');
            if (!cheops_mcp_text_file($a['path'])) return new WP_Error('files', 'Not a text file. Use list_theme_files to see it.');
            if (filesize($abs) > 1500000) return new WP_Error('files', 'File is too big to read here.');
            $c = (string) file_get_contents($abs);
            return ['path' => $a['path'], 'sha1' => sha1($c), 'size' => strlen($c), 'content' => $c];
        },
    ];
    $tools['write_theme_file'] = [
        'description' => 'Create or replace a text file in the live theme. Keeps a backup, checks PHP syntax first, and puts the old file back if the home page breaks. Pass sha1 from read_theme_file so a file changed meanwhile is not overwritten.',
        'schema' => cheops_mcp_obj(['path' => $path, 'content' => ['type' => 'string'], 'sha1' => ['type' => 'string', 'description' => 'sha1 of the file as you read it; leave out for a new file.']], ['path', 'content']), 'annotations' => ['readOnlyHint' => false, 'destructiveHint' => true, 'openWorldHint' => false],
        'run' => static function ($a) {
            $rel = ltrim(wp_normalize_path((string) $a['path']), '/');
            $abs = cheops_mcp_theme_path($rel, false);
            if (is_wp_error($abs)) return $abs;
            if (!cheops_mcp_text_file($rel)) return new WP_Error('files', 'Only text files here; use upload_theme_file for images, fonts and videos.');
            $content = (string) $a['content'];
            if (file_exists($abs) && !empty($a['sha1']) && sha1((string) file_get_contents($abs)) !== $a['sha1']) return new WP_Error('files', 'The file changed since you read it. Read it again first.');
            if (file_exists($abs) && empty($a['sha1'])) return new WP_Error('files', 'This file exists. Read it first and pass its sha1.');
            if (preg_match('#\.php$#i', $rel)) { $ok = cheops_mcp_php_ok($content); if (is_wp_error($ok)) return $ok; }
            $backup = cheops_mcp_backup($rel, $abs, file_exists($abs) ? 'write' : 'create');
            if (is_wp_error($backup)) return $backup;
            wp_mkdir_p(dirname($abs));
            if (@file_put_contents($abs, $content) === false) return new WP_Error('files', 'Could not write the file (permissions).');
            $ok = cheops_mcp_after_change($rel, $abs, $backup);
            if (is_wp_error($ok)) return $ok;
            return ['saved' => $rel, 'size' => strlen($content), 'sha1' => sha1($content), 'backup' => $backup];
        },
    ];
    $tools['upload_theme_file'] = [
        'description' => 'Put an image, font, video or any file from a public URL into the live theme folder (replaces a file at that path, with a backup).',
        'schema' => cheops_mcp_obj(['path' => $path, 'url' => ['type' => 'string']], ['path', 'url']), 'annotations' => ['readOnlyHint' => false, 'destructiveHint' => true, 'openWorldHint' => true],
        'run' => static function ($a) {
            $rel = ltrim(wp_normalize_path((string) $a['path']), '/');
            if (preg_match('#\.(php|phtml|phar)$#i', $rel)) return new WP_Error('files', 'Use write_theme_file for PHP.');
            $abs = cheops_mcp_theme_path($rel, false);
            if (is_wp_error($abs)) return $abs;
            require_once ABSPATH . 'wp-admin/includes/file.php';
            $tmp = download_url(esc_url_raw((string) $a['url']), 120);
            if (is_wp_error($tmp)) return $tmp;
            $backup = cheops_mcp_backup($rel, $abs, file_exists($abs) ? 'write' : 'create');
            if (is_wp_error($backup)) { @unlink($tmp); return $backup; }
            wp_mkdir_p(dirname($abs));
            $ok = @copy($tmp, $abs); @unlink($tmp);
            if (!$ok) return new WP_Error('files', 'Could not write the file (permissions).');
            cheops_mcp_after_change($rel, $abs, $backup);
            return ['saved' => $rel, 'size' => filesize($abs), 'url' => get_template_directory_uri() . '/' . $rel, 'backup' => $backup];
        },
    ];
    $tools['delete_theme_file'] = [
        'description' => 'Delete a file from the live theme (a backup is kept, restore_theme_backup brings it back).',
        'schema' => cheops_mcp_obj(['path' => $path], ['path']), 'annotations' => ['readOnlyHint' => false, 'destructiveHint' => true, 'openWorldHint' => false],
        'run' => static function ($a) {
            $rel = ltrim(wp_normalize_path((string) $a['path']), '/');
            $abs = cheops_mcp_theme_path($rel);
            if (is_wp_error($abs)) return $abs;
            if (!is_file($abs)) return new WP_Error('files', 'Not a file.');
            if (in_array($rel, ['style.css', 'functions.php', 'index.php'], true)) return new WP_Error('files', 'The theme needs this file.');
            $backup = cheops_mcp_backup($rel, $abs, 'delete');
            if (is_wp_error($backup)) return $backup;
            if (!@unlink($abs)) return new WP_Error('files', 'Could not delete the file.');
            $ok = cheops_mcp_after_change(preg_match('#\.php$#i', $rel) ? $rel : $rel . '.x', $abs, $backup);
            if (is_wp_error($ok)) return $ok;
            return ['deleted' => $rel, 'backup' => $backup];
        },
    ];
    $tools['list_theme_backups'] = [
        'description' => 'Recent theme file changes made through this connector, newest first, each with a backup id.',
        'schema' => cheops_mcp_obj(['path' => ['type' => 'string', 'description' => 'Only this file.']]), 'annotations' => CHEOPS_MCP_RO,
        'run' => static function ($a) {
            $list = (array) get_option('cheops_mcp_backups', []);
            if (!empty($a['path'])) $list = array_values(array_filter($list, static function ($e) use ($a) { return $e['path'] === ltrim((string) $a['path'], '/'); }));
            return array_map(static function ($e) { return $e + ['when' => wp_date('Y-m-d H:i', (int) $e['time'])]; }, array_slice($list, 0, 100));
        },
    ];
    $tools['restore_theme_backup'] = [
        'description' => 'Undo one file change: puts the file back the way it was before that change (a new backup of the current file is kept too).',
        'schema' => cheops_mcp_obj(['backup' => ['type' => 'string']], ['backup']), 'annotations' => ['readOnlyHint' => false, 'destructiveHint' => true, 'openWorldHint' => false],
        'run' => static function ($a) {
            $e = cheops_mcp_find_backup((string) $a['backup']);
            if (!$e) return new WP_Error('files', 'No backup with that id.');
            $abs = cheops_mcp_theme_path($e['path'], false);
            if (is_wp_error($abs)) return $abs;
            $now = cheops_mcp_backup($e['path'], $abs, 'restore');
            if (is_wp_error($now)) return $now;
            if (!cheops_mcp_put_back($e)) return new WP_Error('files', 'Could not restore the file.');
            $ok = cheops_mcp_after_change($e['path'], $abs, $now);
            if (is_wp_error($ok)) return $ok;
            return ['restored' => $e['path'], 'from' => $e['id'], 'backup_of_current' => $now];
        },
    ];
    return $tools;
});
