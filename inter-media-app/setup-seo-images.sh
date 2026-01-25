#!/bin/bash

# SEO Images Setup Script
# This script helps create placeholder images for SEO optimization

echo "🎨 Setting up SEO images for Inter Medi-A..."

# Create images directory if not exists
mkdir -p public/seo-images

# Create placeholder images using ImageMagick (if available)
# You can replace these with actual professional images

echo "📸 Creating Open Graph images..."

# Main OG image (1200x630)
if command -v convert &> /dev/null; then
    convert -size 1200x630 xc:'#dc2626' \
        -font Arial -pointsize 48 -fill white \
        -gravity center -annotate +0-50 'Inter Medi-A' \
        -pointsize 24 -annotate +0+20 'Toko Printer & Komputer Terpercaya' \
        public/og-image.jpg
    
    # Products page image
    convert -size 1200x630 xc:'#dc2626' \
        -font Arial -pointsize 48 -fill white \
        -gravity center -annotate +0-50 'Produk Kami' \
        -pointsize 24 -annotate +0+20 'Printer, Fotocopy & Komputer' \
        public/products-og.jpg
    
    # Service page image
    convert -size 1200x630 xc:'#dc2626' \
        -font Arial -pointsize 48 -fill white \
        -gravity center -annotate +0-50 'Layanan Service' \
        -pointsize 24 -annotate +0+20 'Perbaikan Printer & Komputer' \
        public/service-og.jpg
    
    # About page image
    convert -size 1200x630 xc:'#dc2626' \
        -font Arial -pointsize 48 -fill white \
        -gravity center -annotate +0-50 'Tentang Kami' \
        -pointsize 24 -annotate +0+20 'Inter Medi-A Jakarta' \
        public/about-og.jpg
    
    # Contact page image
    convert -size 1200x630 xc:'#dc2626' \
        -font Arial -pointsize 48 -fill white \
        -gravity center -annotate +0-50 'Kontak Kami' \
        -pointsize 24 -annotate +0+20 'Hubungi Inter Medi-A' \
        public/contact-og.jpg
    
    # Favicon sizes
    convert -size 192x192 xc:'#dc2626' \
        -font Arial -pointsize 48 -fill white \
        -gravity center -annotate +0+0 'IM' \
        public/favicon-192x192.png
    
    convert -size 512x512 xc:'#dc2626' \
        -font Arial -pointsize 128 -fill white \
        -gravity center -annotate +0+0 'IM' \
        public/favicon-512x512.png
    
    echo "✅ SEO images created successfully!"
else
    echo "⚠️  ImageMagick not found. Please install it or create images manually:"
    echo "   - og-image.jpg (1200x630px)"
    echo "   - products-og.jpg (1200x630px)"
    echo "   - service-og.jpg (1200x630px)"
    echo "   - about-og.jpg (1200x630px)"
    echo "   - contact-og.jpg (1200x630px)"
    echo "   - favicon-192x192.png (192x192px)"
    echo "   - favicon-512x512.png (512x512px)"
fi

echo ""
echo "📋 Next steps:"
echo "1. Replace placeholder images with professional photos"
echo "2. Set up Google Analytics and Search Console"
echo "3. Update .env.local with verification codes"
echo "4. Deploy to production"
echo "5. Submit sitemap to Google Search Console"
echo ""
echo "📖 See SEO_SETUP_GUIDE.md for detailed instructions"
