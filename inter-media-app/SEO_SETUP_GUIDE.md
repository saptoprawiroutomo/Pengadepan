# SEO Setup Guide - Inter Medi-A

## 🎯 SEO Optimizations Implemented

### 1. **Meta Tags & Structured Data**
- ✅ Dynamic meta titles and descriptions for each page
- ✅ Open Graph tags for social media sharing
- ✅ Twitter Card meta tags
- ✅ JSON-LD structured data for business information
- ✅ Canonical URLs to prevent duplicate content

### 2. **Technical SEO**
- ✅ Sitemap.xml (auto-generated)
- ✅ Robots.txt with proper directives
- ✅ PWA Manifest for mobile optimization
- ✅ Image optimization with WebP/AVIF formats
- ✅ Proper HTTP headers for security and caching

### 3. **Performance Optimizations**
- ✅ Compression enabled
- ✅ ETags for caching
- ✅ Image lazy loading
- ✅ Minified CSS/JS

## 🚀 Setup Instructions

### Step 1: Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your domain: `inter-media-app.vercel.app`
3. Verify ownership using HTML tag method
4. Copy the verification code and add to `.env.local`:
   ```
   GOOGLE_SITE_VERIFICATION="your-verification-code"
   ```

### Step 2: Google Analytics
1. Create Google Analytics 4 property
2. Get your Measurement ID (GA4)
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
   ```

### Step 3: Submit Sitemap
1. After deployment, submit sitemap to Google Search Console:
   ```
   https://inter-media-app.vercel.app/sitemap.xml
   ```

### Step 4: Social Media Meta Images
Create these images in `/public/` folder:
- `og-image.jpg` (1200x630px) - Main Open Graph image
- `products-og.jpg` - Products page image
- `service-og.jpg` - Service page image
- `about-og.jpg` - About page image
- `contact-og.jpg` - Contact page image

## 📊 SEO Keywords Targeted

### Primary Keywords:
- "toko printer jakarta"
- "jual printer canon epson hp"
- "service printer jakarta"
- "mesin fotocopy jakarta"
- "toko komputer jakarta"

### Long-tail Keywords:
- "printer canon murah jakarta"
- "service printer bergaransi jakarta"
- "jual laptop asus lenovo jakarta"
- "tinta printer original jakarta"
- "spare part printer jakarta"

## 🔍 Local SEO Optimization

### Business Information:
- **Name**: Inter Medi-A
- **Address**: Jl. Raya Jakarta, Jakarta 12345
- **Phone**: +62-21-12345678
- **Hours**: Monday-Saturday 08:00-17:00
- **Categories**: Electronics Store, Computer Store, Printer Service

### Google My Business Setup:
1. Create/claim Google My Business listing
2. Add complete business information
3. Upload photos of store and products
4. Encourage customer reviews
5. Post regular updates

## 📈 Monitoring & Analytics

### Key Metrics to Track:
- **Organic Traffic**: Google Analytics
- **Search Rankings**: Google Search Console
- **Page Speed**: PageSpeed Insights
- **Core Web Vitals**: Search Console
- **Local Rankings**: Google My Business Insights

### Monthly SEO Tasks:
1. Check Google Search Console for errors
2. Monitor keyword rankings
3. Update content with new products
4. Build local citations
5. Encourage customer reviews

## 🛠 Technical Implementation

### Files Added/Modified:
```
src/app/
├── layout.tsx (enhanced metadata)
├── sitemap.ts (dynamic sitemap)
├── manifest.ts (PWA manifest)
├── products/layout.tsx (product SEO)
├── products/[slug]/layout.tsx (dynamic product SEO)
├── service-request/layout.tsx
├── about/layout.tsx
└── contact/layout.tsx

public/
├── robots.txt
└── [og-images].jpg

components/
└── analytics/GoogleAnalytics.tsx

next.config.js (SEO optimizations)
.env.local (SEO variables)
```

### Structured Data Schema:
- LocalBusiness schema for main business info
- Product schema for individual products
- Organization schema for company details
- BreadcrumbList for navigation

## 🎯 Expected Results

### Short-term (1-3 months):
- Improved Google indexing
- Better social media sharing
- Enhanced user experience
- Local search visibility

### Long-term (3-6 months):
- Higher search rankings for target keywords
- Increased organic traffic
- Better conversion rates
- Improved brand visibility

## 📝 Content Strategy

### Blog Content Ideas:
1. "Cara Memilih Printer yang Tepat untuk Kantor"
2. "Tips Perawatan Mesin Fotocopy"
3. "Panduan Membeli Laptop untuk Bisnis"
4. "Troubleshooting Printer Bermasalah"
5. "Perbandingan Printer Inkjet vs Laserjet"

### Product Descriptions:
- Include target keywords naturally
- Highlight unique selling points
- Add technical specifications
- Include customer benefits
- Use local Jakarta references

## 🔧 Maintenance Checklist

### Weekly:
- [ ] Check for 404 errors
- [ ] Monitor site speed
- [ ] Update product inventory
- [ ] Respond to customer reviews

### Monthly:
- [ ] Review Google Analytics data
- [ ] Check Search Console performance
- [ ] Update meta descriptions if needed
- [ ] Add new product pages
- [ ] Build local citations

### Quarterly:
- [ ] Audit all meta tags
- [ ] Update structured data
- [ ] Review and update content
- [ ] Analyze competitor SEO
- [ ] Plan new content strategy

---

**Note**: Replace placeholder values in `.env.local` with actual Google Analytics and Search Console codes after setting up accounts.

**Contact**: For SEO support, refer to this documentation or consult with digital marketing professionals.
