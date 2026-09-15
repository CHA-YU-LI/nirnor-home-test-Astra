# 形體 / 特效庫

以原生 HTML、SCSS 與 JavaScript ES Modules 製作的互動特效庫。`index.html` 是既有的獨立創作；`library.html` 收錄依 NIRNOR 公開頁面觀察整理的效果，`audit.html` 對照來源與實作。

## 啟動

需要 Node.js 與 npm。首次下載專案後執行：

```sh
npm ci
npm run build:css
npm run serve
```

以瀏覽器開啟 `http://127.0.0.1:8081/library.html`。伺服器只監聽本機；ES Modules 與影片須透過 HTTP 預覽。開發樣式時另開終端機執行 `npm run watch:css`。`npm run check` 會檢查 demo 檔案、站內連結，以及交付的 CSS 是否與 SCSS 編譯結果一致；它不代替瀏覽器互動測試。

## 目錄與維護方式

| 位置 | 用途 | 修改來源 |
| --- | --- | --- |
| `index.html`、`scss/style.scss`、`js/main.js`、`js/demos.js` | 既有創作首頁 | 直接修改 HTML、SCSS、JS |
| `library.html`、`audit.html` | 特效庫列表與觀察對照 | 直接修改 HTML；效果資料改 `js/library/catalog.js` |
| `demos/<slug>/` | 每個效果的 `index.html`、`effect.scss`、`effect.css`、`effect.js` | 直接修改各效果檔案 |
| `scss/`、`css/` | 共用介面 SCSS 與編譯後 CSS | 只修改 SCSS，再執行 `build:css` |
| `js/library/` | 列表、demo 控制介面與效果共用執行工具 | 依功能修改對應模組 |
| `js/effects/`、`EFFECTS.md` | 既有創作首頁的兩個 WebGL 效果 | 與 NIRNOR demo 分開維護 |
| `assets/`、`evidence/source/` | 自製素材、預覽與原站觀察截圖 | 保留來源區分 |
| `docs/` | 觀察範圍與驗證狀態 | 驗證後更新紀錄 |

`npm run scaffold:pages` 先補建缺少的 HTML 與預覽圖，再同步全站 Header / Footer；既有頁面的主要內容不會覆寫。新增效果時，先在 `js/library/catalog.js` 加入資料，再執行這個指令，接著編寫該效果的 `effect.scss` 和 `effect.js`，並更新 `evidence/validation.json` 的進度。若效果總數或套件選項改變，還需同步修改 `library.html` 的統計與篩選選項。各頁主要內容直接修改 HTML，共用頁首與頁尾則依下方方式維護。

## 共用 Header 與 Footer

全站的頁首與頁尾由 `components/header.html`、`components/footer.html` 維護，樣式為 `scss/site.scss`，手機選單操作為 `js/site.js`。Header 採 `position: fixed`，直接放在 body 下方，頁面以共用高度預留空間，因此捲過首頁的第一區塊後仍會固定在頂端。

修改元件後執行 `npm run sync:layout`；`npm run build:css` 也會先同步元件再編譯 CSS。`npm run watch:css` 只監看 SCSS，修改元件 HTML 時需另執行同步。同步只更新各頁的 `site-header`／`site-footer` 標記區域，不改寫 demo 內容；請勿直接編輯標記內的副本。頁面初始 HTML 已含完整導覽，不必等待 JavaScript 產生。

## 移植單一效果

複製 `demos/<slug>/` 的 HTML 結構、`effect.css` 與 `effect.js`；依效果模組中的 import 一併複製必要的 `js/library/` 共用工具或其他效果模組。若要修改樣式，再複製 `effect.scss` 及其 `@use` 的 `scss/_tokens.scss`；立方體效果也需要 `scss/_cube.scss`。每個 demo 頁的「複製與移植」區會列出該效果實際依賴、API、參數與範例。

原站觀察與未驗證範圍見 [觀察紀錄](docs/OBSERVATIONS.md)，本機檢查與逐項進度見 [驗證紀錄](docs/VALIDATION.md)。
