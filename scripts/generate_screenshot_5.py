import os
import subprocess

html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    background: radial-gradient(circle at 50% 12%, rgba(249, 115, 22, 0.22) 0%, transparent 55%),
                linear-gradient(180deg, #090e17 0%, #0f172a 45%, #080c14 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 100px;
}
.badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(249, 115, 22, 0.16);
    border: 1.5px solid rgba(249, 115, 22, 0.45);
    color: #f97316;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 12px 28px;
    border-radius: 40px;
    margin-bottom: 22px;
}
.title {
    font-size: 68px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: -1px;
    text-align: center;
    line-height: 1.15;
    margin-bottom: 14px;
    text-shadow: 0 4px 18px rgba(0,0,0,0.5);
}
.title span {
    color: #f97316;
}
.subtitle {
    font-size: 34px;
    font-weight: 500;
    color: #94a3b8;
    text-align: center;
    margin-bottom: 50px;
    max-width: 900px;
    line-height: 1.35;
}
.phone-mockup {
    width: 720px;
    height: 1460px;
    background: #090d16;
    border: 14px solid #1e293b;
    outline: 2px solid rgba(255, 255, 255, 0.12);
    border-radius: 54px;
    box-shadow: 0 40px 90px rgba(0, 0, 0, 0.85), 0 0 60px rgba(249, 115, 22, 0.18);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.screen-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
</style>
</head>
<body>
    <div class="badge">__BADGE__</div>
    <div class="title">__TITLE__</div>
    <div class="subtitle">__SUBTITLE__</div>
    <div class="phone-mockup">
        <img class="screen-img" src="__SRC__" />
    </div>
</body>
</html>"""

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
raw_dir = os.path.abspath('google_play_assets/screenshots_raw')
out_dir = os.path.abspath('google_play_assets')

# Generate slide 5
img_path = os.path.join(raw_dir, 'screen_5.png').replace('\\', '/')
html = html_template.replace('__BADGE__', '📱 VOCABULARY WIDGET')
html = html.replace('__TITLE__', 'HOME SCREEN <span>WIDGET</span>')
html = html.replace('__SUBTITLE__', 'Flip, Listen & Master Words on Autopilot')
html = html.replace('__SRC__', 'file:///' + img_path)

tmp_html = os.path.join(out_dir, 'tmp_slide_5.html')
with open(tmp_html, 'w', encoding='utf-8') as f:
    f.write(html)

out_png = os.path.join(out_dir, 'screenshot_5.png')
cmd = [
    chrome,
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1080,1920',
    f'--screenshot={out_png}',
    'file:///' + os.path.abspath(tmp_html).replace('\\', '/')
]
res = subprocess.run(cmd, capture_output=True, text=True)
print('Generated screenshot_5.png:', res.returncode, os.path.exists(out_png))
if os.path.exists(tmp_html):
    os.remove(tmp_html)
