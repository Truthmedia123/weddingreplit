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
  ],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: 'es2018',
    // Disable source maps in production for security
    sourcemap: false,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
          rollupOptions: {
        output: {
          // Simplified chunk splitting - let Vite handle it automatically
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
