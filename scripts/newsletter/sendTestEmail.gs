/**
 * English Breakfast — тестовая отправка письма об обновлении.
 *
 * Как запустить:
 * 1. Войдите в Google под аккаунтом lipniagovnikola@gmail.com.
 * 2. Откройте https://script.google.com → «Новый проект».
 * 3. Вставьте этот код, сохраните и выберите функцию sendTestEmail → «Выполнить».
 * 4. При первом запуске разрешите доступ к отправке почты от вашего имени.
 *
 * Письмо уйдёт с адреса аккаунта, под которым запущен скрипт.
 */

const TEST_RECIPIENT = 'sway1976@gmail.com';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.englishbreakfast.app';

function sendTestEmail() {
  const subject = 'Обновление English Breakfast: разбираем сложные слова и запускаем конкурс';

  const plainBody = [
    'Привет!',
    '',
    'Делимся главными новостями English Breakfast за последнее время:',
    '',
    '1. Сложные слова теперь учить проще: мы добавили «Кубики» — режим сборки слова из букв, который мягко помогает запомнить слова, вызвавшие затруднения.',
    '2. Две новые подборки: для тех, кто работает в IT (187 терминов с короткими объяснениями), и для тех, кто хочет понимать живую речь (100 популярных идиом).',
    '3. Конкурс видео: ждём ваши 10-секундные ролики (включая AI-видео)! Победителей покажем прямо на Золотой карте.',
    '',
    'Чтобы все новые функции работали стабильно, не забывайте обновлять приложение.',
    'Обновить приложение в Google Play: ' + PLAY_URL,
    '',
    'Команда English Breakfast'
  ].join('\n');

  const htmlBody = `
  <div style="background:#f1f5f9;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
      <div style="background:#0f172a;padding:18px 24px;">
        <span style="font-size:20px;font-weight:800;color:#ffffff;">English </span><span style="font-size:20px;font-weight:800;color:#f97316;">Breakfast</span>
      </div>
      <div style="padding:24px;color:#1e293b;font-size:15px;line-height:1.55;">
        <p style="margin:0 0 14px;">Привет!</p>
        <p style="margin:0 0 16px;">Делимся главными новостями English Breakfast за последнее время:</p>

        <p style="margin:0 0 12px;"><b>1. Сложные слова теперь учить проще:</b> мы добавили «Кубики» — режим сборки слова из букв, который мягко помогает запомнить слова, вызвавшие затруднения.</p>
        <p style="margin:0 0 12px;"><b>2. Две новые подборки:</b> для тех, кто работает в IT (187 терминов с короткими объяснениями), и для тех, кто хочет понимать живую речь (100 популярных идиом).</p>
        <p style="margin:0 0 18px;"><b>3. Конкурс видео:</b> ждём ваши 10-секундные ролики (включая AI-видео)! Победителей покажем прямо на Золотой карте.</p>

        <p style="margin:0 0 20px;">Чтобы все новые функции работали стабильно, не забывайте обновлять приложение.</p>

        <div style="text-align:center;margin:0 0 22px;">
          <a href="${PLAY_URL}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px;">Обновить приложение в Google Play</a>
        </div>

        <p style="margin:0;color:#475569;">Команда English Breakfast ☕🐱</p>
      </div>
    </div>
  </div>`;

  MailApp.sendEmail({
    to: TEST_RECIPIENT,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody,
    name: 'English Breakfast'
  });

  Logger.log('Тестовое письмо отправлено на ' + TEST_RECIPIENT +
    '. Оставшаяся дневная квота: ' + MailApp.getRemainingDailyQuota());
}
