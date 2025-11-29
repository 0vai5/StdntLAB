# SEO Setup Guide for STDNTLAB

This document outlines the SEO improvements made and what you need to configure for optimal search engine visibility.

## ✅ What's Been Implemented

### 1. **Enhanced Metadata**
- Comprehensive title and description with template support
- Keywords for better search relevance
- Open Graph tags for social media sharing
- Twitter Card metadata
- Proper robots directives for search engines

### 2. **Favicon & Icons**
- Created `src/app/icon.tsx` for dynamic icon generation
- Created `src/app/opengraph-image.tsx` for dynamic OG image generation
- Updated favicon references in metadata
- Added web manifest for PWA support

### 3. **SEO Files**
- `src/app/robots.ts` - Search engine crawler instructions
- `src/app/sitemap.ts` - XML sitemap for search engines
- `public/site.webmanifest` - PWA manifest

### 4. **Structured Data (Schema.org)**
- Organization schema
- Website schema with search action
- Added to homepage for better search understanding

## 🔧 Required Configuration

### 1. **Environment Variables**

Add to your Vercel environment variables (or `.env.local`):

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Replace `https://your-domain.com` with your actual domain (e.g., `https://stdntlab.com`).

### 2. **Favicon Files**

Ensure these files exist in your `public` folder:
- `favicon.ico` - Traditional favicon (16x16 or 32x32)
- `favicon.png` - PNG version (32x32 or larger)
- `icon.png` - For Apple touch icon (180x180 recommended)
- `logo.png` - Your logo for structured data

### 3. **Open Graph Image**

Create or add an Open Graph image:
- `public/og-image.png` - 1200x630 pixels
- This will be used when sharing on social media

Alternatively, the dynamic `opengraph-image.tsx` will generate one automatically.

### 4. **Search Engine Verification**

In `src/app/layout.tsx`, uncomment and add your verification codes:

```typescript
verification: {
  google: "your-google-verification-code",
  // yandex: "your-yandex-verification-code",
  // yahoo: "your-yahoo-verification-code",
},
```

### 5. **Social Media Links**

Update the structured data in `src/app/page.tsx` with your actual social media links:

```typescript
sameAs: [
  "https://twitter.com/stdntlab",
  "https://facebook.com/stdntlab",
  // Add more as needed
],
```

## 📋 Vercel Deployment Checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` environment variable in Vercel
- [ ] Ensure all favicon files are in the `public` folder
- [ ] Create/upload `og-image.png` (1200x630px) to `public` folder
- [ ] Verify favicon is accessible at `/favicon.ico` and `/favicon.png`
- [ ] Test robots.txt at `https://your-domain.com/robots.txt`
- [ ] Test sitemap at `https://your-domain.com/sitemap.xml`
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify site in Google Search Console
- [ ] Test Open Graph tags using [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test Twitter Card using [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## 🔍 Testing SEO

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **PageSpeed Insights**: https://pagespeed.web.dev/
3. **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
4. **Schema Markup Validator**: https://validator.schema.org/

## 📈 Next Steps for Better Rankings

1. **Content Strategy**
   - Add unique, valuable content to each page
   - Use proper heading hierarchy (H1, H2, H3)
   - Include relevant keywords naturally

2. **Performance**
   - Optimize images (use Next.js Image component)
   - Enable compression
   - Minimize JavaScript bundles

3. **Backlinks**
   - Get quality backlinks from educational websites
   - Share on relevant forums and communities

4. **Regular Updates**
   - Keep content fresh and updated
   - Add blog posts or articles
   - Update sitemap regularly

5. **Analytics**
   - Set up Google Analytics
   - Monitor search performance in Google Search Console
   - Track user behavior and optimize accordingly

## 🐛 Troubleshooting Favicon Issues on Vercel

If favicon is not showing on Vercel:

1. **Check file paths**: Ensure files are in `public/` folder
2. **Clear cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check file names**: Must be exactly `favicon.ico` and `favicon.png`
4. **Verify in browser**: Visit `https://your-domain.com/favicon.ico` directly
5. **Check Next.js version**: Ensure you're using Next.js 13+ for app directory support
6. **Rebuild**: Sometimes Vercel needs a fresh build to pick up new files

The `icon.tsx` file in `src/app/` will automatically generate an icon, but having static files in `public/` is more reliable.

