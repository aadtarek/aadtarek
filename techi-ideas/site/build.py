"""Bundle the site into one self-contained HTML file (CSS, JS and images inlined).
Usage: python3 build.py  ->  ../techi-site.html
"""
import base64, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'techi-site.html')
MIME = {'.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg'}


def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    with open(path, 'rb') as f:
        return f'data:{MIME[ext]};base64,' + base64.b64encode(f.read()).decode()


def read(name):
    with open(os.path.join(HERE, name), encoding='utf-8') as f:
        return f.read()


imgs = {f: data_uri(os.path.join(HERE, 'img', f)) for f in sorted(os.listdir(os.path.join(HERE, 'img')))
        if os.path.splitext(f)[1].lower() in MIME}

html = read('index.html')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + read('styles.css') + '\n</style>')
html = re.sub(r'src="img/([^"]+)"', lambda m: f'src="{imgs[m.group(1)]}"', html)
inline = {
    'data.js': read('data.js'),
    'i18n.js': read('i18n.js'),
    'bgmesh.js': read('bgmesh.js'),
    'three-home.js': read('three-home.js'),
    'app.js': 'window.TECHI_IMG=' + json.dumps(imgs) + ';\n' + read('app.js'),
}
for name, code in inline.items():
    assert '</script' not in code, name
    html = html.replace(f'<script src="{name}"></script>', '<script>\n' + code + '\n</script>')
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)
print(f'wrote {OUT} ({os.path.getsize(OUT)/1e6:.1f} MB)')
