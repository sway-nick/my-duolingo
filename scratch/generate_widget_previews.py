import os
from PIL import Image, ImageDraw, ImageFont

def render_preview_4x2(output_path):
    W, H = 500, 240
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background gradient
    # We can draw rounded rectangle with linear gradient
    card_margin = 8
    rx, ry = 28, 28
    
    # Create mask for rounded rectangle
    mask = Image.new('L', (W, H), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([card_margin, card_margin, W - card_margin, H - card_margin], radius=24, fill=255)

    # Gradient base
    gradient = Image.new('RGBA', (W, H))
    g_draw = ImageDraw.Draw(gradient)
    for y in range(H):
        # Angle gradient ~135 deg: interpolate from top-left (113, 63, 18) to center (202, 138, 4) to bottom-right (69, 26, 3)
        t = y / float(H)
        if t < 0.5:
            factor = t / 0.5
            r = int(113 + factor * (202 - 113))
            g = int(63 + factor * (138 - 63))
            b = int(18 + factor * (4 - 18))
        else:
            factor = (t - 0.5) / 0.5
            r = int(202 - factor * (202 - 69))
            g = int(138 - factor * (138 - 26))
            b = int(4 + factor * (3 - 4))
        g_draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # Top specular shine
    shine = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shine)
    for y in range(card_margin, int(H * 0.45)):
        alpha = int(45 * (1.0 - (y - card_margin) / (H * 0.45)))
        s_draw.line([(card_margin, y), (W - card_margin, y)], fill=(255, 255, 255, alpha))

    # Composite base
    img.paste(gradient, (0, 0), mask)
    img.alpha_composite(shine)

    # Re-apply mask to clean edges
    clean_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    clean_img.paste(img, (0, 0), mask)
    img = clean_img
    draw = ImageDraw.Draw(img)

    # Gold Border
    draw.rounded_rectangle([card_margin, card_margin, W - card_margin, H - card_margin], radius=24, outline=(253, 224, 71, 230), width=3)

    # Try loading clean system font or fallback
    def get_font(size, bold=False):
        font_names = [
            "C:\\Windows\\Fonts\\segoeui.ttf",
            "C:\\Windows\\Fonts\\arial.ttf",
            "C:\\Windows\\Fonts\\calibri.ttf"
        ]
        if bold:
            font_names = [
                "C:\\Windows\\Fonts\\segoeuib.ttf",
                "C:\\Windows\\Fonts\\arialbd.ttf",
                "C:\\Windows\\Fonts\\calibrib.ttf"
            ] + font_names
        for fn in font_names:
            if os.path.exists(fn):
                try:
                    return ImageFont.truetype(fn, size)
                except:
                    pass
        return ImageFont.load_default()

    font_brand = get_font(13, bold=True)
    font_word = get_font(34, bold=True)
    font_trans = get_font(18, bold=False)
    font_badge = get_font(12, bold=True)
    font_arrow = get_font(32, bold=True)
    font_icon = get_font(20, bold=False)

    # Brand Label
    brand_text = "ENGLISH BREAKFAST"
    draw.text((W / 2, card_margin + 16), brand_text, fill=(254, 240, 138, 200), font=font_brand, anchor="mm")

    # Speaker (🔊)
    draw.text((card_margin + 28, card_margin + 20), "🔊", fill=(254, 240, 138, 255), font=font_icon, anchor="mm")

    # Heart (❤️)
    draw.text((W - card_margin - 28, card_margin + 20), "❤️", fill=(239, 68, 68, 255), font=font_icon, anchor="mm")

    # Arrows ‹ and ›
    draw.text((card_margin + 26, H / 2), "‹", fill=(254, 240, 138, 220), font=font_arrow, anchor="mm")
    draw.text((W - card_margin - 26, H / 2), "›", fill=(254, 240, 138, 220), font=font_arrow, anchor="mm")

    # Word
    word_text = "Knowledge"
    # Word shadow
    draw.text((W / 2, H / 2 - 20 + 2), word_text, fill=(0, 0, 0, 180), font=font_word, anchor="mm")
    draw.text((W / 2, H / 2 - 20), word_text, fill=(255, 255, 255, 255), font=font_word, anchor="mm")

    # Transcription
    trans_text = "/ˈnɒl.ɪdʒ/"
    draw.text((W / 2, H / 2 + 14), trans_text, fill=(254, 240, 138, 240), font=font_trans, anchor="mm")

    # Badge
    badge_text = "ELEMENTARY"
    badge_w, badge_h = 104, 22
    bx0 = W / 2 - badge_w / 2
    by0 = H / 2 + 34
    draw.rounded_rectangle([bx0, by0, bx0 + badge_w, by0 + badge_h], radius=11, fill=(53, 26, 3, 220), outline=(253, 224, 71, 200), width=1)
    draw.text((W / 2, by0 + badge_h / 2), badge_text, fill=(253, 224, 71, 255), font=font_badge, anchor="mm")

    img.save(output_path, 'PNG')
    print("Saved 4x2 preview:", output_path)

def render_preview_2x1(output_path):
    W, H = 320, 150
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    card_margin = 6

    # Mask for rounded rectangle
    mask = Image.new('L', (W, H), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([card_margin, card_margin, W - card_margin, H - card_margin], radius=20, fill=255)

    gradient = Image.new('RGBA', (W, H))
    g_draw = ImageDraw.Draw(gradient)
    for y in range(H):
        t = y / float(H)
        if t < 0.5:
            factor = t / 0.5
            r = int(113 + factor * (202 - 113))
            g = int(63 + factor * (138 - 63))
            b = int(18 + factor * (4 - 18))
        else:
            factor = (t - 0.5) / 0.5
            r = int(202 - factor * (202 - 69))
            g = int(138 - factor * (138 - 26))
            b = int(4 + factor * (3 - 4))
        g_draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    shine = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shine)
    for y in range(card_margin, int(H * 0.45)):
        alpha = int(45 * (1.0 - (y - card_margin) / (H * 0.45)))
        s_draw.line([(card_margin, y), (W - card_margin, y)], fill=(255, 255, 255, alpha))

    img.paste(gradient, (0, 0), mask)
    img.alpha_composite(shine)

    clean_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    clean_img.paste(img, (0, 0), mask)
    img = clean_img
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([card_margin, card_margin, W - card_margin, H - card_margin], radius=20, outline=(253, 224, 71, 230), width=2)

    def get_font(size, bold=False):
        font_names = [
            "C:\\Windows\\Fonts\\segoeui.ttf",
            "C:\\Windows\\Fonts\\arial.ttf",
            "C:\\Windows\\Fonts\\calibri.ttf"
        ]
        if bold:
            font_names = [
                "C:\\Windows\\Fonts\\segoeuib.ttf",
                "C:\\Windows\\Fonts\\arialbd.ttf",
                "C:\\Windows\\Fonts\\calibrib.ttf"
            ] + font_names
        for fn in font_names:
            if os.path.exists(fn):
                try:
                    return ImageFont.truetype(fn, size)
                except:
                    pass
        return ImageFont.load_default()

    font_word = get_font(26, bold=True)
    font_trans = get_font(15, bold=False)
    font_icon = get_font(16, bold=False)

    # Speaker & Heart
    draw.text((card_margin + 20, card_margin + 18), "🔊", fill=(254, 240, 138, 255), font=font_icon, anchor="mm")
    draw.text((W - card_margin - 20, card_margin + 18), "❤️", fill=(239, 68, 68, 255), font=font_icon, anchor="mm")

    # Word (No badge, no arrows)
    word_text = "Knowledge"
    draw.text((W / 2, H / 2 - 10 + 2), word_text, fill=(0, 0, 0, 180), font=font_word, anchor="mm")
    draw.text((W / 2, H / 2 - 10), word_text, fill=(255, 255, 255, 255), font=font_word, anchor="mm")

    # Transcription
    trans_text = "/ˈnɒl.ɪdʒ/"
    draw.text((W / 2, H / 2 + 20), trans_text, fill=(254, 240, 138, 240), font=font_trans, anchor="mm")

    img.save(output_path, 'PNG')
    print("Saved 2x1 preview:", output_path)

if __name__ == '__main__':
    dest_dir = r"C:\projects\my-duolingo-android\android\app\src\main\res\drawable-nodpi"
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    render_preview_4x2(os.path.join(dest_dir, "widget_preview_gold_card.png"))
    render_preview_2x1(os.path.join(dest_dir, "widget_preview_gold_card_small.png"))
