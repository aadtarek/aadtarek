#!/usr/bin/env bash
# Serves a fake public_html with Apache on :8090, using the real
# wordpress/htaccess: the storefront build sits in the root, and WordPress's
# index.php is a CGI script that forwards to the mock (scripts/mock-wp/server.mjs on :8080).
#
#   npm run build:headless && SITE_URL=http://localhost:8090 node scripts/package-release.mjs
#   unzip -p release/rfaheya-public_html.zip rfaheya-setup/rfaheya-products.csv > /tmp/p.csv
#   node scripts/mock-wp/server.mjs 8080 /tmp/p.csv http://localhost:8090 &
#   scripts/mock-wp/apache-test.sh
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
www=/tmp/rfaheya-public_html
rm -rf "$www" && mkdir -p "$www/wp-admin" "$www/wp-content/uploads"
(cd "$www" && unzip -q "$root/release/rfaheya-public_html.zip")
echo '<h1>wp-admin</h1>' > "$www/wp-admin/index.html"
echo 'uploaded' > "$www/wp-content/uploads/file.txt"
cat > "$www/index.php" <<'PHP'
#!/usr/bin/php
<?php
// Stand-in for WordPress: forward the original request to the mock.
$headers = [];
foreach (['CONTENT_TYPE' => 'Content-Type', 'HTTP_CART_TOKEN' => 'Cart-Token', 'HTTP_NONCE' => 'Nonce', 'HTTP_ACCEPT' => 'Accept'] as $env => $name) {
  if (getenv($env) !== false) $headers[] = "$name: " . getenv($env);
}
$ch = curl_init('http://127.0.0.1:8080' . getenv('REQUEST_URI'));
curl_setopt_array($ch, [
  CURLOPT_CUSTOMREQUEST => getenv('REQUEST_METHOD'),
  CURLOPT_HTTPHEADER => $headers,
  CURLOPT_POSTFIELDS => getenv('REQUEST_METHOD') === 'POST' ? stream_get_contents(STDIN) : null,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HEADER => true,
]);
$raw = curl_exec($ch);
$size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
echo "Status: $status\r\n";
foreach (explode("\r\n", substr($raw, 0, $size)) as $line) {
  if (preg_match('/^(Content-Type|Cart-Token|Nonce|X-Served-By|Location):/i', $line)) echo $line . "\r\n";
}
echo "\r\n" . substr($raw, $size);
PHP
chmod +x "$www/index.php"
cat > /tmp/rfaheya-apache.conf <<CONF
ServerRoot /etc/apache2
Listen 8090
PidFile /tmp/rfaheya-apache.pid
ErrorLog /tmp/rfaheya-apache-error.log
LoadModule mpm_prefork_module /usr/lib/apache2/modules/mod_mpm_prefork.so
LoadModule authz_core_module /usr/lib/apache2/modules/mod_authz_core.so
LoadModule dir_module /usr/lib/apache2/modules/mod_dir.so
LoadModule mime_module /usr/lib/apache2/modules/mod_mime.so
LoadModule rewrite_module /usr/lib/apache2/modules/mod_rewrite.so
LoadModule headers_module /usr/lib/apache2/modules/mod_headers.so
LoadModule cgi_module /usr/lib/apache2/modules/mod_cgi.so
LoadModule env_module /usr/lib/apache2/modules/mod_env.so
LoadModule setenvif_module /usr/lib/apache2/modules/mod_setenvif.so
TypesConfig /etc/mime.types
User www-data
Group www-data
DocumentRoot $www
<Directory $www>
  AllowOverride All
  Options +ExecCGI +FollowSymLinks
  AddHandler cgi-script .php
  Require all granted
</Directory>
CONF
apache2 -k stop -f /tmp/rfaheya-apache.conf 2>/dev/null || true
sleep 1
apache2 -f /tmp/rfaheya-apache.conf -k start
echo "Apache on http://localhost:8090 (public_html: $www)"
