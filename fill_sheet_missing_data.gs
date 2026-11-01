// Функция для автоматического заполнения недостающих category, Zipf, level, IPA и добавления metro
function fixMissingCategoriesAndZipf() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Vocabulary');
  
  // 1. Заполняем AR6911:AS6925 (category и Частотность Zipf)
  var catZipfData = [["Food", 3.3], ["Entertainment", 5.2], ["Shopping", 3.13], ["Preposition", 5.45], ["Travel", 4.83], ["Technology", 4.06], ["Travel", 4.61], ["Technology", 3.76], ["Intermediate", 3.54], ["Travel", 4.14], ["Shopping", 3.94], ["Technology", 3.26], ["Technology", 5.53], ["Travel", 5.02], ["Travel", 4.19]];
  sheet.getRange(6911, 44, catZipfData.length, 2).setValues(catZipfData); // Col 44 = AR
  
  // 2. Заполняем BJ6911:BJ6925 (level)
  var levelData = [["A1"], ["A1"], ["A1"], ["A2"], ["A2"], ["A1"], ["A1"], ["A2"], ["B1"], ["B1"], ["A2"], ["B1"], ["A2"], ["A2"], ["B1"]];
  sheet.getRange(6911, 62, levelData.length, 1).setValues(levelData); // Col 62 = BJ
  
  // 3. Заполняем C6911:C6925 (transcription_IPA)
  var ipaData = [["ˈlɑːteɪ"], ["fɪlm"], ["ˈkiːləʊ"], ["pɜː(r)"], ["skeɪl"], ["ˈpɑːswɜːd"], ["ˌaɪˈdiː"], ["ˈæktɪveɪt"], ["ɪkˈspaɪə(r)"], ["əˈbɔːd"], ["ˈriːfʌnd"], ["ˈaʊtɪdʒ"], ["səˈpɔːt"], ["træk"], ["ˌəʊvəˈnaɪt"]];
  sheet.getRange(6911, 3, ipaData.length, 1).setValues(ipaData); // Col 3 = C
  
  // 4. Проверяем, есть ли metro (строка 6926)
  if (sheet.getLastRow() < 6926) {
    var metroRow = [["6957", "metro", "ˈmetrəʊ", "метро", "", "метро", "метро", "U-Bahn, Metro", "metro", "métro", "metro", "metropolitana", "metro", "metrô", "metrou", "метро", "metro", "metro", "metró", "μετρό", "podzemna železnica, metro", "metroo", "metropolitenas, metro", "metro", "metro", "tunnelbana, metro", "podzemna željeznica, metro", "metro", "", "", "میٹرو", "地铁", "मेट्रो", "মেট্রো", "مترو الأنفاق", "مترو", "kereta bawah tanah, metro", "tàu điện ngầm", "รถไฟใต้ดิน", "지하철", "地下鉄", "5", "1", "Travel", "4,18", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "ˈmetrəʊ", "A1"]];
    sheet.getRange(6926, 1, 1, metroRow[0].length).setValues(metroRow);
  }
  
  SpreadsheetApp.flush();
  Logger.log('Готово! Поля category, Zipf, level, транскрипция и слово metro успешно заполнены.');
}
