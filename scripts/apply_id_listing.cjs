const fs = require('fs');

const idTitle = 'English Breakfast: Kosakata';
const idShort = 'Widget layar utama, kata frekuensi, pemindai PR & podcast saat layar mati!';

const idDesc = `English Breakfast adalah aplikasi cerdas harian untuk memperkaya kosakata bahasa Inggris Anda dengan widget interaktif di layar utama!

Lupakan hafalan kaku dan frasa yang jarang digunakan. Pelajari kata-kata berdasarkan frekuensi penggunaan nyata dalam percakapan, pindai tugas sekolah dengan kamera, baca cerita interaktif, dan kuasai kosakata secara permanen!

🍳 10 KEUNGGULAN UTAMA:

1. 📈 BELAJAR BERDASARKAN FREKUENSI KATA NYATA (ZIPF)
Kosakata disusun berdasarkan frekuensi penggunaan nyata (CEFR A1–C2). 1.000 kata pertama mencakup hingga 85% bahasa Inggris lisan, film, dan percakapan harian. Hampir 7.000 kata tanpa membuang waktu.

2. 📱 WIDGET INTERAKTIF LAYAR UTAMA (GOLDEN CARD)
Pelajari kosakata baru setiap kali memegang ponsel! Pasang widget Golden Card langsung di layar utama: balik kartu dengan sekali ketuk untuk memeriksa terjemahan, dengarkan pelafalan studio, dan ganti kata tanpa membuka aplikasi.

3. 📖 CERITA INTERAKTIF SETIAP 100 KATA
Kuasai kosakata dalam konteks nyata! Setiap 100 kata yang Anda kuasai membuka cerita baru yang memotivasi, ditulis khusus hanya dari kata-kata yang telah Anda pelajari. Ketuk kata apa pun untuk melihat terjemahan instan, simpan ke Favorit, atau buka terjemahan lengkap.

4. 🔓 TANPA BIAYA LANGGANAN MAHAL & TANPA BATASAN
Bebas biaya langganan dan tanpa batasan jumlah "nyawa" (hati). Akses penuh ke semua kata dan mode latihan — belajar sesuai kecepatan Anda sendiri kapan saja.

5. 🧠 ARSITEK PUTARAN LATIHAN CERDAS
Algoritma cerdas menganalisis jawaban secara real-time. Jika Anda kesulitan pada suatu kata, sistem adaptif akan menampilkannya kembali di langkah berikutnya sampai Anda benar-benar menguasainya 100%.

6. 📷 PEMINDAI FOTO PINTAR UNTUK PR & BUKU
Ada tugas menghafal kata dari buku teks atau artikel? Cukup ambil fotonya! Pemindai OCR cerdas langsung mengekstrak kata-kata baru dan menambahkannya ke latihan tanpa perlu mengetik manual.

7. 📝 KAMUS PRIBADI & CATATAN KHUSUS
Menemukan kata baru di film atau game? Tambahkan dengan satu ketukan. Sematkan catatan pribadi, contoh kalimat, dan asosiasi ingatan untuk daya ingat jangka panjang.

8. ⭐ DAFTAR FAVORIT SESUAI KEBUTUHAN
Kelompokkan kata untuk target tertentu: ujian sekolah besok, wawancara kerja, liburan, atau persiapan ujian internasional (IELTS, TOEFL, Cambridge).

9. 🎧 MODE PODCAST SAAT BEPERGIAN DENGAN LAYAR MATI
Belajar saat bepergian, berjalan santai, atau berolahraga! Pemutaran audio latar belakang berjalan mulus saat layar ponsel mati untuk hemat baterai: dengarkan terjemahan bahasa Indonesia, jeda berpikir, dan pelafalan bahasa Inggris jernih dua kali.

10. 🎙️ DUA STANDAR AUDIO STUDIO: US & UK
Pelafalan jernih standar studio direkam oleh penutur asli. Beralih mudah antara aksen Amerika dan Inggris kapan saja.

🔄 SIKLUS HAFAL LENGKAP (4 TAHAP):
1. Kartu Kata — pengenalan visual dan pelafalan
2. Kuis — pemahaman mendengar cepat dan mengingat arti
3. Pasangan Kata — kecepatan reaksi dan asosiasi
4. Mengetik — ejaan akurat huruf demi huruf.

🌍 DUKUNGAN LENGKAP 36 BAHASA & RTL:
Belajar bahasa Inggris dengan nyaman dalam bahasa ibu Anda — antarmuka diterjemahkan ke 36 bahasa, termasuk bahasa Arab, Persia, dan Urdu (RTL).

🏆 LIGA MINGGUAN & SINKRONISASI CLOUD:
Bersaing di liga mingguan, raih podium juara, pertahankan streak harian, dan simpan kemajuan dengan 1 ketukan akun Google.

🚀 COCOK UNTUK:
• Pelajar & Mahasiswa: Pindai tugas buku dan raih nilai tinggi.
• Pemula (A1–A2): Bangun fondasi kosakata penting tanpa bingung.
• Tingkat Lanjutan (B1–C2): Perluas kosakata aktif untuk karier dan ujian.

Hanya 10–15 menit sehari dengan "English Breakfast" untuk kelancaran berbicara!
Unduh English Breakfast sekarang dan mulai bicara bahasa Inggris dengan percaya diri!`;

console.log('ID Title length:', idTitle.length, '(Limit: 30)');
console.log('ID Short length:', idShort.length, '(Limit: 80)');
console.log('ID Desc length:', idDesc.length, '(Limit: 4000)');

const idFile = `# Google Play Store Listing — ID

## Title (max 30 chars)
${idTitle}

## Short Description (max 80 chars)
${idShort}

## Full Description (max 4000 chars)
${idDesc}
`;

fs.writeFileSync('google_play_assets/store_listings/id.md', idFile);
