# 本機驗證紀錄

## 共用頁首與頁尾

全站 20 個頁面以 Chrome 在 390 px 與 1440 px 寬度驗證：各頁只含一個 Header / Footer；Header 的計算定位為 `fixed`，直接位於 body 下，捲到最底部仍維持 `top: 0` 且可接收點擊。手機選單開關、Escape 關閉、320 px 跨頁導覽、切到 1024 px 時收合選單與首頁「創作理念」對話框均通過，無未處理 JavaScript 錯誤。

共用元件同步指令重複執行後檔案雜湊相同。對照截圖位於 `evidence/shared-index-390.png`、`shared-library-390.png`、對應的 `1440` 版本及 `shared-fixed-bottom-390.png`。這些結果驗證共用介面，不變更下方各特效的完整互動驗證狀態。

本次結構整理完成的靜態檢查：`npm run build:css`、`npm run check`。前者編譯 SCSS；後者檢查效果檔案、站內連結與編譯後 CSS 的一致性。這些檢查**不能證明** 16 個 demo 的動畫及互動已在瀏覽器逐一通過。

本次另以本機 HTTP 伺服器和 Chrome 檢查 `audit.html` 及 `demos/mobile-menu/`：16 列狀態均顯示「待瀏覽器驗證」，驗證文件回應 200，沒有本機資源 4xx 或未處理的 JavaScript 錯誤。這是介面狀態檢查，並非 N09 動畫操作驗證。

先前針對首頁手機選單的 Chrome 測試，涵蓋 320、390、760 px 寬度的展開、收合、「創作理念」開啟與 Escape 關閉；對照圖保存在 `evidence/mobile-menu-390-before.png` 與 `evidence/mobile-menu-390-after.png`。此紀錄只涵蓋首頁選單，不能套用到獨立的 N09 demo。

## 待逐項驗證

以下效果已具備獨立頁面與模組，但目前沒有可供核對的逐項瀏覽器通過報告，因此一律標示為「待驗證」。驗證時應實際操作重播、重設、參數、正反向互動、手機與 reduced-motion，並檢查 Console、資源載入及離開頁面後的清理。

| ID | Demo | 瀏覽器驗證 |
| --- | --- | --- |
| N01 | blink-type | 待驗證 |
| N02 | chaos-attractor | 待驗證 |
| N03 | orbit-cubes | 待驗證 |
| N04 | unfold-cube | 待驗證 |
| N05 | lattice-pulse | 待驗證 |
| N06 | pixel-stretch | 待驗證 |
| N07 | service-slider | 待驗證 |
| N08 | topics-accordion | 待驗證 |
| N09 | mobile-menu | 待驗證 |
| N10 | link-feedback | 待驗證 |
| N11 | page-transition | 待驗證 |
| N12 | scroll-navigation | 待驗證 |
| N13 | video-reveal | 待驗證 |
| N14 | contact-controls | 待驗證 |
| C01 | works-gallery | 待驗證 |
| C02 | home-sequence | 待驗證 |

`evidence/validation.json` 目前逐項記為 `pending`，讓網站清楚顯示待驗證狀態。之後應逐項補記測試視窗、操作、結果與失敗原因；只在有實際結果時將狀態改為通過。
