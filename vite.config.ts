import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import eslint from 'vite-plugin-eslint'
import svgr from 'vite-plugin-svgr'
import { createHtmlPlugin as html } from 'vite-plugin-html'
import dotenv from 'dotenv'

import { generateAssetsBuildPaths } from './src/helpers/viteBuild'

dotenv.config()

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

export default defineConfig({
  root: resolve(__dirname, 'src'),
  define: {
    _API_CONNECTION_STRING_: JSON.stringify(process.env._API_CONNECTION_STRING_),
  },
  server: {
    open: true,
    host: '0.0.0.0',
    port: 3000,
  },
  css: {
    devSourcemap: isDev,
  },
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'build'),
    assetsDir: 'assets',
    emptyOutDir: true,
    cssCodeSplit: isDev,
    sourcemap: isDev,
    minify: isDev ? false : 'terser',
    rollupOptions: {
      output: {
        assetFileNames: generateAssetsBuildPaths,
        chunkFileNames: 'chunks/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
      },
    },
  },
  plugins: [
    eslint(),
    html({
      minify: true,
      // fot passing data to html (ejs syntax)
      // inject: {
      //   data: {
      //     test: 'test',
      //   },
      // },
    }),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    svgr({
      exportAsDefault: false,
      include: '**/*.svg',
    }),
    react({
      include: '**/*.tsx',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
