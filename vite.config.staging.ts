import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      jsxRuntime: 'automatic',
    }),
    // Bundle analyzer for staging builds
    visualizer({
      filename: 'dist/staging-bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/staging"),
    emptyOutDir: true,
    target: 'es2018',
    sourcemap: true, // Enable source maps for staging
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          if (id.includes('lucide-react') || 
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge')) {
            return 'ui-utils';
          }
          if (id.includes('react-hook-form') || 
              id.includes('@hookform/resolvers') ||
              id.includes('zod')) {
            return 'form-validation';
          }
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-utils';
          }
          if (id.includes('framer-motion')) {
            return 'animations';
          }
          if (id.includes('recharts')) {
            return 'charts';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query-client';
          }
          if (id.includes('wouter')) {
            return 'routing';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name || '')) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs in staging
        drop_debugger: true,
        pure_funcs: ['console.debug'],
        unused: true,
        dead_code: true,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
      format: {
        comments: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'lucide-react',
      '@tanstack/react-query',
      'wouter',
      'date-fns',
      'zod',
      'react-hook-form',
      '@hookform/resolvers',
      'framer-motion',
      'clsx',
      'class-variance-authority',
      'tailwind-merge',
    ],
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      overlay: true,
    },
  },
  css: {
    devSourcemap: true,
  },
  define: {
    __DEV__: false,
    __STAGING__: true,
    __PROD__: false,
  },
});
