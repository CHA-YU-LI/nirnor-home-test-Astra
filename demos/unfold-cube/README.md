# 分類立方體分階段攤平

這個資料夾把效果拆成可閱讀的 HTML、SCSS、CSS 與 JavaScript。直接開啟 index.html 可看展示；要移植到其他頁面，保留 HTML 容器、effect.css、effect.js、main.js 與「效果依賴」列出的檔案。ES Module 請透過 HTTP 伺服器載入。

## 參數

| key | 名稱 | 預設值 | 範圍 | 說明 |
|---|---|---:|---|---|
| variant | 分類變體 | art | art / digital / movie / graphic / logo | 各自的鉸鏈路徑與第 2、3 階段展開方向 |
| duration | 階段時間 | 0.5 | 0.15–1.5 | 每階段秒數；先擺正再展開 |
| inertia | 跟隨慣性 | 0.1 | 0.02–0.3 | 每 60 Hz frame 的跟隨比例 |
| tilt | 指標傾角 | 10 | 0–24 | 最大傾斜角度 |

初始化設定寫在 main.js 的 options。執行中可呼叫 effect.update({ key: value })，也可使用 effect.replay()、effect.reset()、effect.destroy()。

## 檔案

- index.html：展示容器與可操作的 HTML。
- effect.scss：樣式原始碼；修改後以 Sass 編譯成 effect.css。
- effect.js：效果邏輯與 init(root, options) 公開介面。
- main.js：最小初始化範例，集中放使用者要調整的參數。
- 依賴：無額外動畫套件。

來源與官方 API 文件請回到特效頁面的「實際使用的技術」區塊查看。
