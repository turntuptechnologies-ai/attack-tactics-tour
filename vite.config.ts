import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/attack-tactics-tour/',
  plugins: [react()],
  build: {
    // 日本語フォントは文字の範囲ごとに細かく分かれたファイルになっている。
    // 小さいものを CSS に埋め込むと、使わない分まで毎回読み込むことになるので、埋め込まない。
    assetsInlineLimit: 0,
    // three.js を丸ごと含むので、1ファイルが大きいのは想定どおり。
    chunkSizeWarningLimit: 900,
  },
})
