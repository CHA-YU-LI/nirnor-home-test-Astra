---
name: nirnor-uiux
description: 撰寫、修改、審查或驗證本專案的頁面、demo、HTML、SCSS、JavaScript 互動、響應式版型、動畫、WebGL 效果、影片控制項或表單控制項時，套用 nirnor 互動式特效庫的 UIUX 規範。
---

# nirnor UIUX 規範

本 skill 適用於首頁／Landing Page、特效庫與分類篩選頁、各獨立 demo 頁面，以及觀察紀錄與驗證頁面。所有頁面應維持一致的視覺與互動體驗，呈現為同一個產品。

## 1. Typography（最高優先）

- 使用 Bootstrap 5 的 RWD breakpoint：`xs <576px`、`sm ≥576px`、`md ≥768px`、`lg ≥992px`、`xl ≥1200px`、`xxl ≥1400px`。
- `md`（`≥768px`）以上所有可見的使用者文字一律不得小於 `16px`；`md` 以下只有輔助 caption 與 meta 資訊可以使用 `14px`，內文、導覽、標籤、按鈕、連結、表單控制項與狀態訊息仍須至少 `16px`。
- 使用共用 type scale。新增字級前先擴充既有 token，並以 `caption`、`body`、`lead`、`heading` 等語義命名，禁止為單一元件任意新增字級。
- 內文行高建議 `1.5–1.6`，標題行高建議 `1.2–1.3`。
- 使用瀏覽器在桌面寬度檢查 computed styles。繼承、`rem` 或元件選擇器可能改變 SCSS 中宣告的實際字級。
- 裝飾性 SVG 或 canvas 文字、純圖示控制項，以及 visually hidden 輔助文字可以例外，但不得降低內容可及性。

## 2. 視覺一致性與 Design Tokens

- 使用並擴充 `scss/_tokens.scss`，集中管理共用色彩、type scale、間距、圓角、陰影與 z-index 層級。
- 目前既有核心 token 包含：背景色 `#0a0a0a`、表面色 `#151713`、主要文字色 `#f0efe9`、次要文字色 `#a1a79a`、強調色 `#dcf99a`。RWD breakpoint 統一採 Bootstrap 5：`576px`、`768px`、`992px`、`1200px`、`1400px`。
- 目前 `_tokens.scss` 也提供 `$font-*`、`$font-size-*`、`$font-weight-*`、`$line-height-*`、`$space-*`、`$border-*`、`$radius-*`、`$shadow-*`、`$z-*` 與 `$duration-*` 變數。新 SCSS 優先使用對應的 `t.$...` token，避免重複宣告相同值。
- SCSS 的顏色、間距、字體、字級、字重、行高、字距、邊框、圓角、陰影、z-index、動畫時間與 RWD breakpoint 都必須透過 `_tokens.scss` 變數維護；使用 `@use 'tokens' as t` 後，以 `t.$token-name` 引用。
- 新增或修改共用介面樣式時，不得直接寫死可重用的 hex 色碼、px 字級、字重、間距或動畫時間。若 token 尚不存在，先補進 `_tokens.scss`，再在元件中引用。
- Demo 專屬的幾何尺寸、WebGL 參數與不會跨元件重用的效果數值可以保留在 demo 內；這類例外要用註解說明原因，並且不能取代共用 UI token。
- hover、focus、active、disabled、error 狀態使用語義化 token。focus 狀態必須清楚可見，且與 hover 狀態有所區別。
- 新增介面 SCSS 時，若既有 token 能表達相同意圖，不得另外寫一次性的顏色、字級或間距數值。
- 效果專用的幾何尺寸、WebGL 尺寸、時間與插值參數可以保留在區域變數中；若數值特殊，需在附近加註解說明用途。

## 3. SCSS 與編譯後 CSS 同步

- 一律修改 `.scss` 原始檔，不得直接手動修改編譯後的 `.css` 檔案。
- 修改 SCSS 後執行 `npm run build:css`。此指令也會同步共用 Header 與 Footer。
- 執行 `npm run check`，並在瀏覽器開啟所有受影響頁面。程式檢查不能取代畫面與互動驗證。
- 修改共用樣式時，檢查首頁、特效庫頁面，以及所有引用該 partial 或編譯後 stylesheet 的 demo。

## 4. 跨頁面一致性

完成頁面或元件前，先與既有頁面比較以下項目：

- Header、導覽、active 狀態、hover、focus 與行動版選單行為。
- 共用 Footer 的標記結構與間距。
- 按鈕與表單控制項，包括 hover、focus、active、disabled、checked 與 pressed 狀態。
- 卡片與分類篩選標籤，並確保選取狀態清楚可辨識。
- Loading、揭露、過場與完成回饋。

沿用既有共用 class 與元件模式。除非效果本身需要已記錄的視覺例外，否則不得為單一 demo 另外創造一套控制項樣式。

## 5. 響應式與無障礙

- RWD 採 Bootstrap 5 breakpoint，至少驗證 `xs <576px`、`sm ≥576px`、`md ≥768px`、`lg ≥992px`、`xl ≥1200px` 與 `xxl ≥1400px` 的版面狀態；新規則使用 mobile-first 的 `min-width` media query。
- 既有 `700px`、`760px` 與 `1050px` 是舊規則。修改到相關樣式時，將它們逐步對應到 Bootstrap breakpoint；未受本次任務影響的舊樣式不需單獨擴大重構。
- 保留鍵盤操作、語義化 HTML、表單 label、有意義的 `alt` 文字、可見的 `:focus-visible` 狀態，以及正確的 ARIA 狀態，例如 `aria-expanded` 與 `aria-pressed`。
- 不得只使用 `outline: none` 而沒有提供同等清楚的替代 focus 樣式。
- CSS 與 JavaScript 都要遵守 `prefers-reduced-motion`。使用者啟用減少動態效果時，降低或停止非必要的循環背景、粒子、捲動與過場效果，但保留功能性回饋。
- 影片與 WebGL 必須提供可感知的 loading 或 fallback 狀態。素材載入失敗時，不得只留下無法解釋的空白區域。
- 動畫迴圈避免造成 layout thrashing，不要反覆交錯讀取版面尺寸與寫入樣式。
- 效果離開可視範圍或文件進入 hidden 狀態時，暫停非必要工作。效果移除或替換時，清理事件監聽器、計時器、animation frame 與 WebGL 資源。

## 6. Demo 頁面規範

每個 demo 頁面都必須提供：

- 清楚的標題。
- 簡短的用途與操作方式說明。
- 可存取的返回特效庫入口。
- 沿用共用 UI 模式，並讓輔助科技能取得控制項狀態的互動控制項。
- 為高負載 WebGL、粒子或影片效果提供明確的 loading 狀態。

新增 demo 時，同步加入 catalog 項目與分類／篩選資料；必要時執行頁面 scaffold 或同步流程，並確認能從特效庫頁面找到新 demo。

## 7. 完成檢查清單

1. 檢查 typography 與 computed styles；Bootstrap `md`（`≥768px`）以上可見文字至少 `16px`。
2. 確認色彩、間距、字體、字級、字重、行高、狀態與動畫參數都使用共用 token。
3. 使用 `npm run build:css` 編譯 SCSS。
4. 執行 `npm run check`。
5. 在 Bootstrap `xs`、`sm`、`md`、`lg`、`xl`、`xxl` 狀態，以及鍵盤 focus 與 reduced-motion 設定下測試受影響頁面。
6. 若為 demo，確認標題、操作說明、返回入口、loading 或 fallback、共用控制項與 catalog 可搜尋性。
7. 將範圍外的既有違規記錄為技術債，不因單一任務擴大修改範圍。
