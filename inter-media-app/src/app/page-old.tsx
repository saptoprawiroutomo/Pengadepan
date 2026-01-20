export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Inter Medi-A
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              E-commerce Platform untuk Printer, Fotocopy & Komputer
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">🛒 E-commerce</h3>
              <ul className="text-blue-700 space-y-2">
                <li>• Katalog Produk Lengkap</li>
                <li>• Shopping Cart & Checkout</li>
                <li>• Sistem Pembayaran</li>
                <li>• Order Tracking</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-3">👨‍💼 Admin Panel</h3>
              <ul className="text-green-700 space-y-2">
                <li>• Product Management</li>
                <li>• Order Management</li>
                <li>• Sales Reports</li>
                <li>• User Management</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-purple-900 mb-3">💬 Chat Support</h3>
              <ul className="text-purple-700 space-y-2">
                <li>• Real-time Messaging</li>
                <li>• Customer Support</li>
                <li>• Admin Dashboard</li>
                <li>• Message History</li>
              </ul>
            </div>

            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-orange-900 mb-3">🏪 POS System</h3>
              <ul className="text-orange-700 space-y-2">
                <li>• Point of Sale</li>
                <li>• Transaction History</li>
                <li>• Receipt Generation</li>
                <li>• Inventory Management</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Demo Notice</h3>
            <p className="text-yellow-700">
              Aplikasi ini membutuhkan MongoDB database untuk berfungsi penuh. 
              Saat ini dalam mode demo tanpa database connection.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">🔗 Fitur Tersedia:</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                Next.js 16
              </span>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                TypeScript
              </span>
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                Tailwind CSS
              </span>
              <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                NextAuth
              </span>
              <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium">
                Responsive Design
              </span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Alamat Toko: Jln Klingkit Dalam Blok C No 22, RT 010/011<br/>
              Rawa Buaya, Cengkareng, Jakarta Barat 11470
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
