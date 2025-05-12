
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "https://favour-onyenike.github.io/lexpix-portfolio/", // Updated base URL for GitHub Pages
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
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "./node_modules/react/jsx-dev-runtime")
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime'
    ],
    esbuildOptions: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'global': 'window'
      }
    }
  },
}));
