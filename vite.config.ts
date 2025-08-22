import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { visualizer } from 'rollup-plugin-visualizer';

// Bundle analysis plugin
const bundleAnalyzer = visualizer({
  filename: 'dist/bundle-analysis.html',
  open: false,
  gzipSize: true,
  brotliSize: true,
  template: 'treemap'
});

export default defineConfig({
  plugins: [
    react({
      // Enable JSX runtime for better tree shaking
      jsxRuntime: 'automatic',
    }),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
    // Bundle analyzer for production builds
    ...(process.env.ANALYZE === 'true' ? [bundleAnalyzer] : []),
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
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    target: 'es2018',
    // Disable source maps in production for security
    sourcemap: false,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'radix-ui': [
            '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card', '@radix-ui/react-label', '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu', '@radix-ui/react-popover', '@radix-ui/react-progress',
            '@radix-ui/react-radio-group', '@radix-ui/react-scroll-area', '@radix-ui/react-select',
            '@radix-ui/react-separator', '@radix-ui/react-slider', '@radix-ui/react-slot',
            '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toast',
            '@radix-ui/react-toggle', '@radix-ui/react-toggle-group', '@radix-ui/react-tooltip'
          ],
          'ui-utils': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge', 'tailwindcss-animate'],
          'form-validation': ['react-hook-form', '@hookform/resolvers', 'zod', 'zod-validation-error'],
          'date-utils': ['date-fns', 'react-day-picker'],
          'animations': ['framer-motion'],
          'charts': ['recharts'],
          'document-generation': ['pdf-lib', 'qrcode.react'],
          'query-client': ['@tanstack/react-query'],
          'routing': ['wouter'],
          'ui-components': ['cmdk', 'embla-carousel-react', 'vaul', 'react-resizable-panels']
        },
        // Optimize chunk naming
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
      // External dependencies that shouldn't be bundled
      external: [],
      // Enable tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minification
    minify: 'terser',
         terserOptions: {
       compress: {
         // Remove console statements in production
         drop_console: true,
         drop_debugger: true,
         // Remove unused code
         pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
         // Optimize boolean expressions
         booleans_as_integers: true,
         // Remove unused variables
         unused: true,
         // Dead code elimination
         dead_code: true,
         // Optimize if statements
         conditionals: true,
         // Optimize loops
         loops: true,
         // Optimize function calls
         sequences: true,
         // Optimize property access
         properties: true,
         // Optimize expressions
         evaluate: true,
         // Optimize typeof expressions
         typeofs: true,
         // Optimize global variables
         global_defs: {
           __DEV__: false,
           __PROD__: true,
         },
         // Additional obfuscation
         passes: 2,
         toplevel: true,
         unsafe: true,
         unsafe_comps: true,
         unsafe_Function: true,
         unsafe_math: true,
         unsafe_proto: true,
         unsafe_regexp: true,
         unsafe_undefined: true,
       },
       mangle: {
         // Mangle property names
         properties: {
           regex: /^_/,
         },
         // Mangle function names
         toplevel: true,
         eval: true,
         keep_fnames: false,
         reserved: ['__esModule'],
       },
       format: {
         // Remove comments
         comments: false,
         // Minimize whitespace
         beautify: false,
         // Preserve semicolons for safety
         semicolons: true,
       },
     },
  },
  // Optimize dependencies
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
    exclude: [
      // Exclude heavy dependencies that should be loaded dynamically
      'pdf-lib',
      'canvas',
      'sharp',
    ],
  },
  // Development server configuration
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Enable HMR
    hmr: {
      overlay: true,
    },
  },
  // CSS optimization
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
  },
  // Define global constants
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
  },
});
