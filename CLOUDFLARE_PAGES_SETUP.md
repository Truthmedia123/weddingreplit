# 🚀 Cloudflare Pages Deployment Configuration

## ⚙️ **Build Settings**

Configure these exact settings in your Cloudflare Pages dashboard:

### **Build Configuration**
```
Framework preset: None (or Vite)
Build command: npm run build:deploy
Build output directory: client/dist
Root directory: (leave empty)
```

### **Environment Variables**
```
NODE_VERSION: 18
NPM_VERSION: 10
```

## 📁 **Directory Structure After Build**

Your build should create this structure:
```
client/dist/
├── index.html
├── _headers
├── category-icons.json
├── assets/
│   ├── index-[hash].css
│   ├── index-[hash].js
│   └── [other-chunks].js
├── data/
│   ├── categories.json
│   ├── featured-vendors.json
│   └── blog-posts.json
└── images/
    ├── hero.jpg
    ├── placeholder-photography.svg
    ├── placeholder-catering.svg
    ├── placeholder-flowers.svg
    ├── placeholder-blog1.svg
    ├── placeholder-blog2.svg
    └── optimized/
        └── hero.jpg
```

## 🔗 **Image Path Configuration**

### ✅ **Correct Image References**
In your React components, always use:
```jsx
<img src="/images/hero.jpg" alt="Hero" />
<img src="/images/placeholder-photography.svg" alt="Photography" />
```

### ❌ **Incorrect References (Don't Use)**
```jsx
<img src="./images/hero.jpg" />          // Relative path
<img src="images/hero.jpg" />            // Missing leading slash
<img src="/public/images/hero.jpg" />    // Includes 'public'
<img src="../images/hero.jpg" />         // Relative navigation
```

## 🧪 **Testing Your Deployment**

### **1. Local Build Test**
```bash
npm run build:deploy
npm run verify:deployment
```

### **2. Check Build Output**
Verify these files exist in `client/dist/`:
- `index.html`
- `images/placeholder-photography.svg`
- `data/categories.json`

### **3. Test Image URLs After Deployment**
Visit these URLs directly in your browser:
- `https://your-site.pages.dev/images/placeholder-photography.svg`
- `https://your-site.pages.dev/data/categories.json`
- `https://your-site.pages.dev/_headers`

If any 404, check your build output directory setting.

## 🔧 **Troubleshooting**

### **Images Not Loading**
1. **Check Build Output Directory**: Must be `client/dist` (not `client/dist/public`)
2. **Verify Image Paths**: Use `/images/filename.ext` (with leading slash)
3. **Clear Cloudflare Cache**: Purge cache after deployment
4. **Disable Cloudflare Features**: Temporarily disable Rocket Loader, Mirage, Polish

### **JSON Data Not Loading**
1. **Check MIME Types**: `_headers` file should set `Content-Type: application/json`
2. **Test Direct Access**: Visit `/data/categories.json` directly
3. **Check CORS**: Ensure no CORS blocking in Cloudflare settings

### **Build Fails**
1. **Node Version**: Ensure using Node 18+ in Cloudflare Pages
2. **Dependencies**: Check all dependencies are in `package.json`
3. **Build Command**: Use exact command `npm run build:deploy`

## 📊 **Performance Optimization**

### **Cloudflare Settings**
1. **Auto Minify**: Enable JS, CSS, HTML
2. **Brotli Compression**: Enable in Network settings
3. **Caching**: Set aggressive caching for `/images/*` and `/assets/*`
4. **Polish**: Enable for automatic image optimization

### **Cache Headers** (via `_headers` file)
```
/images/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/data/*.json
  Cache-Control: public, max-age=300
```

## ✅ **Deployment Checklist**

- [ ] Build output directory set to `client/dist`
- [ ] Build command set to `npm run build:deploy`
- [ ] Node version set to 18+
- [ ] Images exist in `client/dist/images/`
- [ ] JSON data exists in `client/dist/data/`
- [ ] `_headers` file deployed
- [ ] Test image URLs directly
- [ ] Test JSON data URLs directly
- [ ] Clear Cloudflare cache after deployment

## 🎯 **Expected Results**

After correct configuration:
- ✅ All images load reliably
- ✅ Categories and vendors display
- ✅ Fast loading with proper caching
- ✅ No 404 errors for assets
- ✅ Consistent experience across browsers

---

*Last updated: August 2025*