# 原站觀察紀錄

此檔說明專案中既有的觀察資料如何對應效果庫；逐效果的來源 URL、觸發方式、公開程式碼線索與已知差異，以 `js/library/catalog.js` 和 `audit.html` 為準。技術證據只代表可從公開資源確認的部分，不能由視覺相似推定使用某套件。

| 已保留的觀察範圍 | 主要證據檔案 | 對應效果 |
| --- | --- | --- |
| 首頁載入、捲動、反向捲動、導覽與手機選單 | `evidence/source/home-*.png`、`mobile-*.png`、`navigation-*.png` | N01–N05、N07–N10、C02 |
| Works 列表、分類與 hover | `evidence/source/works-*.png` | N06、N11、C01 |
| 不同作品詳情頁 | `evidence/source/*-top.png`、同系列頁面截圖 | N06、N11–N13 |
| Contact 頁面 | `evidence/source/contact-*.png` | N14 |

`evidence/source/*.json` 保留當時取得的頁面資訊；`js/library/catalog.js` 記錄可指認的公開 JS / CSS 檔名及線索。原站完整資源未納入本專案，且本次結構整理沒有重新走查原站，因此這份檔案不新增「已確認」技術判斷。

尚未驗證所有作品詳情頁的特殊內容、外部影片完整播放，以及原站聯絡表單送出後的狀態。這些範圍不能標示為完整分析。效果與原站的具體差異可從各 demo 頁查看；本地互動驗證進度見 [VALIDATION.md](VALIDATION.md)。
