# 服務手風琴與直向媒體帶

這個資料夾把效果拆成可閱讀的 HTML、SCSS、CSS 與 JavaScript。直接開啟 index.html 可看展示；要移植到其他頁面，保留 HTML 容器、effect.css、effect.js、main.js 與「效果依賴」列出的檔案。ES Module 請透過 HTTP 伺服器載入。

## 參數

| key | 名稱 | 預設值 | 範圍 | 說明 |
|---|---|---:|---|---|
| duration | 切換時間 | 400 | 150–1200 | 媒體位移與文字收展（ms） |

初始化設定寫在 main.js 的 options。執行中可呼叫 effect.update({ key: value })，也可使用 effect.replay()、effect.reset()、effect.destroy()。

## 檔案

- index.html：展示容器與可操作的 HTML。
- effect.scss：樣式原始碼；修改後以 Sass 編譯成 effect.css。
- effect.js：效果邏輯與 init(root, options) 公開介面。
- main.js：最小初始化範例，集中放使用者要調整的參數。
- 依賴：assets/motion-study.webm；無額外動畫套件。

來源與官方 API 文件請回到特效頁面的「實際使用的技術」區塊查看。
