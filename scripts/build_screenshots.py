import os
import subprocess
from PIL import Image

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

slides = [
    {
        'badge': '🍳 ENGLISH BREAKFAST',
        'title': 'WORD OF THE <span>DAY</span>',
        'subtitle': 'Learn 10 Minutes a Day with Audio & Gold Cards',
        'screen': 'screen_1.png',
        'output': 'screenshot_1.png'
    },
    {
        'badge': '🎧 INTERACTIVE LEARNING',
        'title': '3D <span>FLASHCARDS</span>',
        'subtitle': 'Spaced Repetition with Phonetics & Audio',
        'screen': 'screen_2.png',
        'output': 'screenshot_2.png'
    },
    {
        'badge': '📚 EXPAND VOCABULARY',
        'title': '6,600+ <span>WORDS & PHRASES</span>',
        'subtitle': 'From Elementary to Advanced & Irregular Verbs',
        'screen': 'screen_3.png',
        'output': 'screenshot_3.png'
    },
    {
        'badge': '🏆 GLOBAL LEAGUES',
        'title': 'COMPETE & <span>WIN</span>',
        'subtitle': 'Earn XP, Keep Streaks & Top the Weekly Podium',
        'screen': 'screen_4.png',
        'output': 'screenshot_4.png'
    }
]

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
raw_dir = os.path.abspath('google_play_assets/screenshots_raw')
out_dir = os.path.abspath('google_play_assets')

for idx, s in enumerate(slides):
    img_path = os.path.join(raw_dir, s['screen']).replace('\\', '/')
    html = html_template.replace('__BADGE__', s['badge'])
    html = html.replace('__TITLE__', s['title'])
    html = html.replace('__SUBTITLE__', s['subtitle'])
    html = html.replace('__SRC__', 'file:///' + img_path)
    
    tmp_html = os.path.join(out_dir, f'tmp_slide_{idx+1}.html')
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(html)
        
    out_png = os.path.join(out_dir, s['output'])
    cmd = [
        chrome,
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1080,1920',
        f'--screenshot={out_png}',
        'file:///' + os.path.abspath(tmp_html).replace('\\', '/')
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(tmp_html):
        os.remove(tmp_html)
    print(f"Generated {s['output']} successfully!")

print("\nAll 4 marketing screenshots generated successfully!")
