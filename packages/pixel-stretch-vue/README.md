# 影像邊緣拉伸揭露 — Vue 範例

## 啟動

1. 完整解壓縮，用 VS Code 開啟 pixel-stretch-vue 資料夾（內有 package.json）。
2. 安裝 Node.js 20.19+ 或 22.12+；建議使用受支援的 LTS 版本。
3. 在這個資料夾的終端機執行：

```sh
npm install
npm run dev
```

開啟終端機列出的網址。Vue 單檔元件需要 Vite 編譯，請使用 npm run dev 啟動。正式建置：npm run
build；預覽建置結果：npm run preview。

## 修改位置

- src/options.js：參數用途、預設值、單位與建議範圍。
- src/effect.html：此效果的 HTML；只放入自己信任的內容。
- src/EffectDemo.vue：Vue 掛載／卸載與效果生命週期。
- src/demos/pixel-stretch/effect.js：效果邏輯。
- src/demos/pixel-stretch/effect.scss：效果樣式，Vite 自動编譯。
- src/scss/：完整共用 Sass 相依。

程式碼與共用依賴均保留可閱讀格式。npm
install 需要網路；執行效果的套件由 npm 安裝並由 Vite 打包。套件版本已固定；node_modules 與 dist 不包含在 ZIP，會在安裝／建置時產生。效果會在 onMounted 啟動，並在 onBeforeUnmount 清理動畫與事件。

## 官方文件

- [Vue 快速開始](https://vuejs.org/guide/quick-start.html)
- [Vue 生命週期](https://vuejs.org/api/composition-api-lifecycle.html)
- [Vite](https://vite.dev/guide/)
