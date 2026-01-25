'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Tentang Inter Medi-A</h1>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Sejarah Perusahaan</h2>
              <p className="text-gray-600 mb-4">
                Inter Medi-A didirikan pada tahun 2020 dengan visi menjadi penyedia solusi 
                terpercaya untuk kebutuhan peralatan kantor di Jakarta dan sekitarnya.
              </p>
              <p className="text-gray-600">
                Dengan pengalaman lebih dari 4 tahun, kami telah melayani ribuan pelanggan 
                dari berbagai kalangan, mulai dari perusahaan besar hingga UMKM.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Visi & Misi</h2>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">Visi</h3>
                <p className="text-gray-600">
                  Menjadi penyedia solusi teknologi perkantoran terdepan di Indonesia.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Misi</h3>
                <ul className="text-gray-600 list-disc list-inside">
                  <li>Memberikan produk berkualitas tinggi</li>
                  <li>Pelayanan after-sales terbaik</li>
                  <li>Harga kompetitif dan terjangkau</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6">Mengapa Memilih Kami?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Berpengalaman</h3>
                <p className="text-gray-600">4+ tahun melayani kebutuhan perkantoran</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Terpercaya</h3>
                <p className="text-gray-600">Garansi resmi dan service berkualitas</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Lengkap</h3>
                <p className="text-gray-600">Printer, fotocopy, komputer & aksesoris</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
