export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-gray-600 mb-8">Halaman yang Anda cari tidak dapat ditemukan.</p>
        <a 
          href="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  )
}
