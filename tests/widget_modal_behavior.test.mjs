import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

test('Widget Modal Contract: EXACTLY 1 button, dynamic label and correct pin invocation', async (t) => {
  const widgetSheetPath = path.join(ROOT, 'frontend/components/modals/WidgetConfigBottomSheet.js');
  const code = fs.readFileSync(widgetSheetPath, 'utf8');

  await t.test('1. Verify HTML template contains strictly ONE button in actions', () => {
    // Check that there is no second button template like repin-widget
    assert.strictEqual(code.includes('id="btn-repin-widget"'), false, 'btn-repin-widget must be completely absent');
    assert.strictEqual(code.includes('widget-sheet-pin-btn'), false, 'widget-sheet-pin-btn must be absent');

    // Extract the actions block
    const actionsMatch = code.match(/<div class="widget-sheet-actions"[^>]*>([\s\S]*?)<\/div>/);
    assert.ok(actionsMatch, 'Must have .widget-sheet-actions block');
    const actionsHtml = actionsMatch[1];

    // Count <button tags in actionsHtml
    const buttonCount = (actionsHtml.match(/<button/g) || []).length;
    assert.strictEqual(buttonCount, 1, 'Must contain STRICTLY 1 button inside .widget-sheet-actions');
  });

  await t.test('2. Verify button label and behavior when widget is NOT installed (isInstalled = false)', () => {
    // When isInstalled is false:
    // Label should be ✨ widget_add_to_screen (Добавить виджет на экран)
    assert.ok(code.includes("${isInstalled ? (t('widget_save_changes') || 'Сохранить изменения') : `✨ ${t('widget_add_to_screen') || 'Добавить виджет на экран'}`}"),
      'Label must toggle between save and add_to_screen based on isInstalled');

    // On submit, calls saveAndSync(!isInstalled) -> saveAndSync(true) -> calls requestPinWidget()
    assert.ok(code.includes('saveAndSync(!isInstalled)'), 'Submit button must call saveAndSync(!isInstalled)');
  });

  await t.test('3. Verify Java requestPinWidget runs on UI thread with direct null callback', () => {
    const mainActivityPath = path.join(ROOT, 'android/app/src/main/java/com/englishbreakfast/app/MainActivity.java');
    const javaCode = fs.readFileSync(mainActivityPath, 'utf8');

    // Must run on UI thread so Android WindowManager accepts the dialog
    assert.ok(javaCode.includes('runOnUiThread(() -> {'), 'Must call requestPinAppWidget on UI thread');
    assert.ok(javaCode.includes('appWidgetManager.requestPinAppWidget(provider, null, null)'),
      'Must pass null callback to prevent MIUI / OEM launcher PendingIntent rejection');

    const providerPath = path.join(ROOT, 'android/app/src/main/java/com/englishbreakfast/app/GoldCardWidgetProvider.java');
    const providerCode = fs.readFileSync(providerPath, 'utf8');
    assert.ok(providerCode.includes('ACTION_PIN_SUCCESS'), 'Must handle ACTION_PIN_SUCCESS in provider');
  });

  await t.test('4. Verify WidgetDataManager uses clean versioned ghost keys', () => {
    const managerPath = path.join(ROOT, 'android/app/src/main/java/com/englishbreakfast/app/WidgetDataManager.java');
    const managerCode = fs.readFileSync(managerPath, 'utf8');

    assert.ok(managerCode.includes('key_ghost_widget_ids_v7'), 'Must use version v7 for ghost widget IDs');
    assert.ok(managerCode.includes('key_widget_ghost_migrated_v7'), 'Must use version v7 for ghost migration flag');
  });
});
