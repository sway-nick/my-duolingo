import os
import re
import sys
import xml.etree.ElementTree as ET

def validate_widget():
    errors = []
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # Try finding Android app path
    android_app = os.path.join(base_dir, 'android', 'app')
    if not os.path.exists(android_app):
        android_app = os.path.join('C:/projects/my-duolingo-android/android/app')
    
    base_res = os.path.join(android_app, 'src', 'main', 'res')
    manifest_path = os.path.join(android_app, 'src', 'main', 'AndroidManifest.xml')
    provider_java = os.path.join(android_app, 'src', 'main', 'java', 'com', 'englishbreakfast', 'app', 'GoldCardWidgetProvider.java')

    print("[WIDGET VALIDATOR] Checking Android Manifest integrity...")
    if not os.path.exists(manifest_path):
        errors.append(f"AndroidManifest.xml not found at {manifest_path}")
    else:
        manifest_tree = ET.parse(manifest_path)
        root = manifest_tree.getroot()
        app_node = root.find('application')
        
        found_provider = False
        found_config = False
        
        for rec in app_node.findall('receiver'):
            name = rec.attrib.get('{http://schemas.android.com/apk/res/android}name', '')
            exported = rec.attrib.get('{http://schemas.android.com/apk/res/android}exported', '')
            if '.GoldCardWidgetProvider' in name:
                found_provider = True
                if exported != 'true':
                    errors.append(f"GoldCardWidgetProvider MUST have android:exported='true', but found '{exported}'. Android launcher will fail with 'Problem loading widget' if false.")
            if '.BootReceiver' in name:
                if exported != 'true':
                    errors.append(f"BootReceiver MUST have android:exported='true' to receive BOOT_COMPLETED, but found '{exported}'.")

        for act in app_node.findall('activity'):
            name = act.attrib.get('{http://schemas.android.com/apk/res/android}name', '')
            exported = act.attrib.get('{http://schemas.android.com/apk/res/android}exported', '')
            if '.WidgetConfigActivity' in name:
                found_config = True
                if exported != 'true':
                    errors.append(f"WidgetConfigActivity MUST have android:exported='true' for launcher configuration, but found '{exported}'.")

        if not found_provider:
            errors.append("GoldCardWidgetProvider receiver declaration missing in AndroidManifest.xml!")

    print("[WIDGET VALIDATOR] Checking RemoteViews layout XMLs and allowed tags...")
    layouts = ['widget_gold_card.xml', 'widget_glass_card.xml', 'widget_dark_glass_card.xml']
    layout_ids = {}
    ALLOWED_TAGS = {
        'RelativeLayout', 'LinearLayout', 'FrameLayout', 'GridLayout',
        'TextView', 'ImageView', 'ImageButton', 'Button', 'ProgressBar',
        'ViewStub', 'ViewFlipper', 'AdapterViewFlipper', 'StackView', 'GridView', 'ListView', 'AnalogClock', 'Chronometer'
    }

    if not os.path.exists(provider_java):
        errors.append(f"GoldCardWidgetProvider.java not found at {provider_java}")
        java_ids = set()
    else:
        with open(provider_java, 'r', encoding='utf-8') as f:
            java_code = f.read()
        java_ids = set(re.findall(r'R\.id\.([a-zA-Z0-9_]+)', java_code))

    for lay in layouts:
        p = os.path.join(base_res, 'layout', lay)
        if not os.path.exists(p):
            errors.append(f"Missing layout file: {lay}")
            continue
        try:
            tree = ET.parse(p)
        except Exception as ex:
            errors.append(f"XML Syntax error in {lay}: {ex}")
            continue

        ids_in_layout = set()
        for elem in tree.iter():
            if elem.tag not in ALLOWED_TAGS:
                errors.append(f"Forbidden RemoteViews tag <{elem.tag}> in {lay}. Only standard RemoteViews tags are allowed!")
            vid = elem.attrib.get('{http://schemas.android.com/apk/res/android}id', '')
            if vid.startswith('@+id/'):
                ids_in_layout.add(vid.replace('@+id/', ''))
            elif vid.startswith('@id/'):
                ids_in_layout.add(vid.replace('@id/', ''))
            
            # Check drawables referenced in layout
            for attr, val in elem.attrib.items():
                if val.startswith('@drawable/'):
                    dname = val.replace('@drawable/', '')
                    dp1 = os.path.join(base_res, 'drawable', dname + '.png')
                    dp2 = os.path.join(base_res, 'drawable', dname + '.xml')
                    if not os.path.exists(dp1) and not os.path.exists(dp2):
                        errors.append(f"Missing drawable resource {val} in layout {lay}")

        layout_ids[lay] = ids_in_layout

    print("[WIDGET VALIDATOR] Checking ID symmetry between Java and all 3 layout themes...")
    for jid in java_ids:
        for lay, ids in layout_ids.items():
            if jid not in ids:
                errors.append(f"ID 'R.id.{jid}' used in GoldCardWidgetProvider.java is MISSING from layout '{lay}'! RemoteViews will crash in this theme.")

    print("[WIDGET VALIDATOR] Checking Drawables and image integrity...")
    required_drawables = [
        'ic_widget_speaker.png', 'ic_widget_speaker_light.png',
        'ic_widget_play.png', 'ic_widget_play_light.png',
        'ic_widget_pause.png', 'ic_widget_pause_light.png',
        'ic_widget_heart_active.png', 'ic_widget_heart_inactive.png',
        'widget_gold_card_bg.xml', 'widget_glass_card_bg.xml', 'widget_dark_glass_card_bg.xml'
    ]
    for d in required_drawables:
        dp = os.path.join(base_res, 'drawable', d)
        if not os.path.exists(dp):
            errors.append(f"Required widget drawable missing: res/drawable/{d}")
        else:
            if os.path.getsize(dp) == 0:
                errors.append(f"Corrupt (0 bytes) drawable: res/drawable/{d}")

    print("--------------------------------------------------")
    if errors:
        print(f"[FAIL] Found {len(errors)} critical widget issue(s):")
        for i, e in enumerate(errors, 1):
            print(f"  {i}. {e}")
        return False
    else:
        print("[PASS] All widget integrity and compatibility checks passed successfully!")
        return True

if __name__ == '__main__':
    ok = validate_widget()
    sys.exit(0 if ok else 1)
