# BAB I
# PENDAHULUAN

## 1.1. Latar Belakang

Perkembangan teknologi informasi dan internet telah mengubah lanskap bisnis secara fundamental, di mana sistem informasi berbasis web menjadi tulang punggung operasional perusahaan modern. Sistem informasi tidak hanya berfungsi sebagai alat bantu, tetapi telah menjadi komponen strategis yang menentukan daya saing dan keberlangsungan bisnis. Urgensi implementasi sistem informasi terintegrasi semakin meningkat seiring dengan digitalisasi yang masif dan pergeseran perilaku konsumen yang mengutamakan kemudahan akses informasi dan transaksi digital.

Dalam konteks bisnis ritel, khususnya industri peralatan printer, fotocopy, dan komputer yang menunjukkan pertumbuhan pesat di kawasan perkotaan, sistem informasi penjualan terintegrasi menawarkan solusi untuk mengatasi keterbatasan operasional dan kompleksitas manajemen multi-channel yang melekat pada model bisnis konvensional. Data menunjukkan bahwa sektor ritel teknologi mengalami peningkatan adopsi sistem informasi terintegrasi yang signifikan dalam beberapa tahun terakhir. Oleh karena itu, implementasi sistem informasi bukan lagi sekadar pilihan, melainkan suatu keharusan strategis untuk mempertahankan dan meningkatkan efisiensi operasional.

Inter Media merupakan salah satu pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) yang beroperasi di sektor ritel peralatan printer, fotocopy, dan komputer. Meskipun industri ini kompetitif, operasional Inter Media saat ini masih sangat bergantung pada sistem manual dan penjualan konvensional (toko fisik). Keterbatasan ini menghasilkan beberapa permasalahan krusial, antara lain: jangkauan pasar yang sempit, minimnya otomatisasi dalam pengelolaan inventori, kesulitan dalam sinkronisasi data penjualan, dan ketidakmampuan bersaing dengan kompetitor yang sudah memiliki sistem informasi terintegrasi yang matang. Meskipun telah menggunakan media sosial, platform tersebut belum terintegrasi sebagai sistem informasi penjualan dan manajemen yang utuh.

Untuk mengatasi tantangan tersebut, diperlukan perancangan dan implementasi sebuah sistem informasi penjualan terintegrasi berbasis web yang fungsional dan responsif. Dalam penelitian ini, teknologi web modern seperti Next.js, React, Node.js, dan MongoDB dipilih sebagai foundation utama. Pemilihan teknologi ini didasarkan pada kemampuan integrasi yang superior, scalability yang tinggi, real-time capabilities melalui Socket.IO, serta fleksibilitas dalam pengembangan fitur Point of Sale (POS) dan komunikasi real-time, yang sangat sesuai dengan kebutuhan digitalisasi UMKM seperti Inter Media.

Berdasarkan latar belakang dan permasalahan yang telah diuraikan, penelitian ini bertujuan untuk "Membangun Sistem E-commerce Terintegrasi dengan Fitur Real-time Chat dan Point of Sale" yang diharapkan dapat mengoptimalkan sistem informasi penjualan, meningkatkan efisiensi proses bisnis, dan memperluas jangkauan pelanggan bagi Inter Media. Hasil dari penelitian ini diharapkan dapat memberikan kontribusi nyata sebagai model implementasi sistem informasi terintegrasi yang efektif bagi UMKM di sektor ritel peralatan teknologi.

## 1.2. Masalah

### a. Identifikasi Masalah
Merujuk pada latar belakang masalah maka dapat disimpulkan rumusan masalah yang akan dibahas yaitu:

1. **Keterbatasan sistem informasi dan akses pasar digital**: Sistem informasi penjualan Inter Media saat ini masih manual dan jangkauan penjualan terbatas secara geografis hanya pada area di sekitar toko fisik, menyebabkan potensi pasar digital yang lebih luas belum tergarap optimal.

2. **Belum ada sistem informasi penjualan terintegrasi**: Inter Media belum memiliki sistem informasi atau platform penjualan e-commerce yang terintegrasi. Hal ini mengakibatkan proses pengelolaan pesanan, pemantauan stok inventori, dan pencatatan transaksi masih dilakukan secara manual dan terpisah, sehingga menghambat efisiensi operasional dan tidak mampu bersaing dalam era digital.

### b. Batasan Masalah
Adapun batasan masalah dari penelitian ini adalah:

1. Penelitian ini hanya membatasi pembahasan pada sistem informasi penjualan terintegrasi, meliputi pengelolaan produk, pemesanan, konfirmasi pembayaran, Point of Sale, dan real-time chat.

2. Pengguna yang terlibat dalam sistem ini dibatasi pada Admin (pemilik/pengelola) Inter Media, Kasir (untuk POS), dan Pelanggan (umum) yang melakukan transaksi.

3. Metode pembayaran yang diimplementasikan mencakup transfer bank dan payment gateway terintegrasi dengan sistem notifikasi otomatis.

4. Sistem informasi ini dikembangkan menggunakan teknologi Next.js, React, Node.js, MongoDB, dan Socket.IO dengan fokus pada integrasi multi-channel dan real-time communication.

5. Objek penelitian adalah Inter Media, dan data produk yang digunakan adalah data riil produk printer, fotocopy, dan komputer.

### c. Rumusan Masalah
Berdasarkan latar belakang yang telah dijelaskan sebelumnya, rumusan masalah dari penelitian ini adalah sebagai berikut:

1. Bagaimana merancang dan membangun sistem informasi penjualan terintegrasi berbasis web yang fungsional dan responsif untuk Inter Media?

2. Bagaimana mengintegrasikan sistem Point of Sale dengan platform e-commerce dalam satu sistem informasi terpadu untuk sinkronisasi inventori real-time?

## 1.3. Tujuan dan Manfaat Penulisan

### a. Tujuan Penulisan
Berikut tujuan penulisan:

1. Merancang dan membangun sistem informasi penjualan terintegrasi berbasis web yang fungsional dan responsif sesuai dengan kebutuhan Inter Media.

2. Mengimplementasikan teknologi web modern untuk mengotomatisasi proses bisnis inti seperti pemesanan, Point of Sale, real-time chat, dan manajemen inventori Inter Media.

3. Menganalisis fungsionalitas sistem informasi yang dibangun untuk memastikan platform dapat mendukung perluasan jangkauan pasar dan efisiensi operasional Inter Media.

### b. Manfaat Penulisan
ingat.

## 1.4. Sistematika Penulisan

Penulisan skripsi ini dibagi menjadi beberapa bab untuk mempermudah pembahasan, berikut perinciannya:

**BAB I: PENDAHULUAN**
Pada bab ini, berisikan tentang latar belakang sistem informasi, rumusan masalah, tujuan dan manfaat penulisan, batasan masalah dan sistematika penulisan.

**BAB II: STUDI PUSTAKA**
Pada bab ini, berisi penjelasan tentang teori-teori yang berkaitan dengan sistem informasi, e-commerce terintegrasi, POS system, real-time communication, dan teknologi web modern yang akan digunakan.

**BAB III: METODOLOGI PENELITIAN**
Pada bab ini, berisikan langkah-langkah yang akan dilakukan dalam penelitian, tools dan teknologi yang akan digunakan serta metodologi pengembangan sistem.

**BAB IV: ANALISIS DAN PEMBAHASAN**
Pada bab ini, membahas mengenai tahapan analisis sistem informasi existing, perancangan arsitektur sistem terintegrasi, implementasi sistem, dan pengujian fungsionalitas.

**BAB V: PENUTUP**
Berisi kesimpulan yang diperoleh dari tahap-tahap analisis, perancangan, implementasi, dan pengujian sistem informasi.
