# 🚀 Performance Optimization Guide

This guide outlines all the performance optimizations implemented for the wedding platform.

## 📊 Performance Metrics Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Bundle Size**: < 500KB per chunk

## 🖼️ Image Optimization

### Hero Image Setup
1. **Local Storage**: Hero images stored in `client/public/images/`
2. **Multiple Formats**: AVIF, WebP, and JPEG fallbacks
3. **Preloading**: Critical hero image preloaded in HTML head
4. **Responsive**: Different sizes for different viewports

### Implementation
```bash
# Optimize all images
npm run optimize-images

# Audit performance
npm run audit:performance
```

### Image Formats Priority
1. **AVIF** - Next-gen format, 50% smaller than JPEG
2. **WebP** - Widely supported, 25-30% smaller than JPEG  
3. **JPEG** - Universal fallback

## 📦 Bundle Optimization

### Code Splitting Strategy
- **vendor**: React core libraries
- **ui**: Radix UI components
- **query**: TanStack Query
- **utils**: Utility libraries (date-fns, clsx)
- **forms**: Form handling libraries
- **icons**: Lucide React icons

### Lazy Loading
- **TestimonialSlider**: Lazy loaded with Suspense
- **Below-fold images**: `loading="lazy"` attribute
- **Heavy components**: Dynamic imports for non-critical features

## ⚡ Critical Resource Optimization

### Preload Directives
```html
<link rel="preload" href="/images/hero.jpg" as="image" type="image/jpeg">
<link rel="preload" href="/images/optimized/hero.webp" as="image" type="image/webp">
<link rel="preload" href="/images/optimized/hero.avif" as="image" type="image/avif">
```

### Font Loading
- **Preconnect**: Google Fonts domains
- **Font Display**: `swap` for faster text rendering

## 🌐 CDN & Caching Strategy

### Cloudflare Optimizations
1. **Auto Minify**: Enable for JS, CSS, HTML
2. **Brotli Compression**: Enable in Network settings
3. **Cache Headers**: `Cache-Control: public, max-age=31536000` for assets
4. **Image Optimization**: Enable Polish for automatic image optimization

### Cache Headers
```
Static Assets: Cache-Control: public, max-age=31536000, immutable
HTML: Cache-Control: public, max-age=3600
API: Cache-Control: public, max-age=300
```

## 🔧 Build Process

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build:deploy
```

### Performance Audit
```bash
npm run audit:performance
```

## 📱 Mobile Optimization

### Responsive Images
- **Viewport-based sizing**: Different image sizes for mobile/desktop
- **Touch targets**: Minimum 44px for interactive elements
- **Lazy loading**: Aggressive lazy loading for mobile

### Performance Budget
- **Mobile**: < 300KB initial bundle
- **Desktop**: < 500KB initial bundle
- **Images**: < 100KB per image (optimized)

## 🎯 Performance Monitoring

### Core Web Vitals
Monitor these metrics in production:
- **LCP**: Hero image loading time
- **FID**: Button interaction responsiveness  
- **CLS**: Layout stability during loading

### Tools
- **Lighthouse**: Built-in Chrome DevTools
- **WebPageTest**: Detailed performance analysis
- **GTmetrix**: Performance scoring and recommendations

## 🚀 Deployment Checklist

- [ ] Images optimized and compressed
- [ ] Bundle sizes under limits
- [ ] Preload directives configured
- [ ] CDN settings optimized
- [ ] Cache headers configured
- [ ] Performance audit passed
- [ ] Core Web Vitals tested

## 📈 Expected Performance Gains

- **Image Loading**: 50-70% faster with AVIF/WebP
- **Bundle Size**: 30-40% reduction with code splitting
- **First Paint**: 40-60% improvement with preloading
- **Overall Score**: Target 90+ Lighthouse score

## 🔍 Monitoring & Maintenance

### Regular Tasks
1. **Weekly**: Check bundle sizes after updates
2. **Monthly**: Audit image optimization
3. **Quarterly**: Review and update performance targets

### Performance Regression Prevention
- Bundle size limits in CI/CD
- Lighthouse CI integration
- Performance budgets enforcement

---

*Last updated: August 2025*