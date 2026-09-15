---
name: desktop-readable-text
description: 撰寫、修改、審查或驗證本專案的 HTML、CSS、SCSS 或元件 UI 時，套用桌面網頁使用者文字不得小於 16px 的可及性規則。
---

# 桌面可讀文字

套用本專案的 typography 規則：

- 使用 Bootstrap 5 的 RWD breakpoint：`xs <576px`、`sm ≥576px`、`md ≥768px`、`lg ≥992px`、`xl ≥1200px`、`xxl ≥1400px`。在 `md`（`min-width: 768px`）以上，每個使用者可見文字元素的 computed font size 都必須至少為 `16px`。
- 標題與其他展示文字可依版面需要使用更大的字級；`16px` 是最低限制，不是指定目標。
- 規則涵蓋導覽、按鈕、連結、標籤、輔助說明、狀態訊息、表單控制項、caption、meta 資訊、表格與響應式元件中的文字。
- 純裝飾圖像、純圖示控制項，以及隱藏的螢幕閱讀器文字可以不套用此規則，但不得因此影響可及性。
- 新增或修改 RWD 時使用 Bootstrap breakpoint 與 mobile-first 的 `min-width` media query。`md` 以下只有 caption 與 meta 資訊可使用 `14px`；只有在任務明確要求時，才可改變其他行動版文字的最低字級。

修改 UI 樣式時：

1. 搜尋所有受影響的 CSS、SCSS 與 inline style 來源，檢查 `font-size`、`font` 以及繼承而來的 typography 規則。
2. 修改原始 stylesheet，不要只修改編譯後的 CSS。若專案有提交編譯產物，也要同步更新。
3. 檢查 media query 內外的選擇器，包括元件區域樣式與 demo 樣式；新增規則應使用 Bootstrap 的 `sm`、`md`、`lg`、`xl` 或 `xxl` breakpoint。
4. 使用具代表性的 Bootstrap `md`、`lg` 或更寬 viewport，檢查可見文字的 computed styles；若有刻意保留的例外，需明確記錄。

不得為了塞入版面而將桌面文字縮小至 `16px` 以下。應改為調整間距、換行、欄位配置或容器尺寸。
