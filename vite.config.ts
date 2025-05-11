
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./", // Explicitly set base for relative paths in GitHub Pages
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      jsxImportSource: "react",
      // Remove jsxRuntime as it's not a valid option in the TypeScript type definitions
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Explicitly set paths for React modules to avoid resolution issues
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime")
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  // Add proper MIME type handling for modules
  assetsInclude: ['**/*.js'],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime'
    ],
    esbuildOptions: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
    }
  },
}));
