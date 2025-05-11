
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
      // Don't use jsxRuntime option as it causes TypeScript error
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Ensure proper aliasing for React
      "react/jsx-runtime": "react/jsx-runtime",
      "react": "react"
    },
  },
  // Add proper MIME type handling for modules
  assetsInclude: ['**/*.js'],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime'
    ],
  },
}));
