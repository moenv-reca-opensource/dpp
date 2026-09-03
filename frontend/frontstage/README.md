# 電池產品數位護照公開前台

本專案是一個以原生 HTML、CSS 與 JavaScript 製作的唯讀公開頁面，用來顯示單一電池產品的產品數位護照。頁面可搭配同一個儲存庫中的 `opensource/backend`，透過公開 API 即時取得護照資料。

本文件介紹專案用途、本機預覽、API 串接及基本部署方式，方便使用者快速了解與使用。

## 主要功能

- 顯示產品基本資訊、識別資訊與碳足跡
- 顯示認證、材料、產品規格、商標及相關連結
- 顯示維修與回收紀錄
- 提供列印、電子郵件及社群分享入口
- 提供中文及英文介面，英文版使用 `?lang=en` 網址參數
- 支援鍵盤操作、頁籤切換、狀態提示及響應式版面
- API 載入失敗時顯示錯誤訊息與重新讀取按鈕

本前台僅供公開查閱，不包含登入、資料新增、編輯、刪除或匯入功能。資料維護請使用後台管理介面。

## 技術需求

- 支援現代 JavaScript、Fetch API 與 `<dialog>` 的瀏覽器
- 可提供靜態檔案與 SPA fallback 的 Web 伺服器
- 可依公開識別碼查詢護照資料的後端 API
- 正式環境使用 HTTPS

本專案沒有套件安裝與建置步驟，可直接部署靜態檔案。

## 頁面網址格式

前台使用 GS1 識別欄位組成頁面路徑：

```text
/01/{GTIN}/10/{BatchLot}/21/{SerialNo}
```

英文介面可在相同產品網址加上 `?lang=en`；未指定或使用其他值時維持中文介面：

```text
/01/{GTIN}/10/{BatchLot}/21/{SerialNo}?lang=en
```

例如：

```text
/01/00000000000000/10/DEMO-BATCH-001/21/DEMO-SERIAL-001
```

各段意義如下：

| 路徑段 | 說明 |
| --- | --- |
| `01` | 全球交易品項識別碼 GTIN |
| `10` | 批號 Batch/Lot |
| `21` | 產品序號 Serial Number |

若欄位包含空白或特殊字元，產生網址時必須先進行 URL encoding。QR Code 也必須使用相同路徑格式，否則前台無法辨識產品。

## 本機預覽

直接以瀏覽器開啟 [`index.html`](index.html)，即可使用內建的虛構示範資料預覽頁面。示範資料的識別資訊如下：

```text
GTIN: 00000000000000
批號 Batch/Lot: DEMO-BATCH-001
產品序號 Serial Number: DEMO-SERIAL-001
DPPID: 010000000000000010DEMO-BATCH-00121DEMO-SERIAL-001
```

直接開啟檔案適合快速瀏覽畫面。若要測試完整網址、API 串接與網站路由，請改用本機 Web 伺服器。

若要驗證完整網址與 API 整合，請透過本機 Web 伺服器提供此目錄，並設定：

- 非靜態檔案路徑導回 `index.html`
- `/api` 轉送至後端服務
- 前台與 API 使用相同來源

開發環境的建議結構：

```text
http://localhost:4173/       前台靜態檔案
http://localhost:4173/api/   轉送至後端 API
```

使用示範資料驗證 GS1 路徑時，可開啟：

```text
http://localhost:4173/01/00000000000000/10/DEMO-BATCH-001/21/DEMO-SERIAL-001
```

## API 設定

API 與靜態資源的共同路徑設定在 [`index.html`](index.html)：

```html
<meta name="dpp-api-base" content="/api" />
<meta name="dpp-asset-base" content="/" />
```

| 設定 | 用途 | 建議值 |
| --- | --- | --- |
| `dpp-api-base` | 公開 API 的共同路徑 | `/api` |
| `dpp-asset-base` | API 回傳相對圖片路徑時使用的資源基底 | `/` |

若網站部署在子路徑，需同步調整 `<base>`、靜態檔案位置、API 路徑及 Web 伺服器 fallback。調整後應逐一測試 CSS、JavaScript、圖片與產品網址。

所有寫在 HTML、JavaScript 或 meta 標籤中的設定都能被瀏覽器讀取。請勿放入 Token、私鑰、內部主機名稱或其他機密資訊。

## 公開 API 契約

前台會呼叫：

```http
POST /api/frontstage/dpp.info
Content-Type: application/json
```

請求內容中的 `id` 與 `DPPID` 是由網址中的 GTIN、Batch/Lot 與 Serial Number 組合而成：

```json
{
  "id": "010000000000000010DEMO-BATCH-00121DEMO-SERIAL-001",
  "DPPID": "010000000000000010DEMO-BATCH-00121DEMO-SERIAL-001"
}
```

一般成功回應格式：

```json
{
  "success": true,
  "code": 200,
  "s_message": "0000",
  "payload": {}
}
```

`payload` 應包含護照基本資料及可公開的相關區塊，例如：

- `DPP` 或根層護照欄位
- `DPPInfo`
- `ProductInfo`
- `MandatoryCertification`
- `VoluntaryCertification`
- `Material`
- `PEFInfo`
- `TradeMark`
- `RepairRecord`
- `RecycleRecord`

缺少非必要區塊時，前台會顯示無資料狀態。若 API 回傳非成功狀態、格式錯誤或超過等待時間，頁面會顯示錯誤訊息。

## 前後端整合前必要確認

部署前請確認下列契約一致：

1. 前台以 GS1 路徑產生組合識別碼。
2. 公開 API 能以該組合識別碼查到同一筆護照。
3. 後台產生的 QR Code 導向本前台接受的 GS1 路徑。
4. GTIN、Batch/Lot 與 Serial Number 的編碼及大小寫規則前後一致。
5. API 只回傳允許公開的欄位與檔案網址。

若後端使用 UID 或其他識別方式，必須同步調整前台路由與 API 請求，不應只修改其中一端。

## 部署方式

將以下檔案部署至靜態網站目錄：

```text
index.html
i18n.js
app.js
styles.css
images/
```

正式部署前，請另外處理示範資料：

- [`mock-data.js`](mock-data.js) 僅供示範與本機預覽使用。
- 正式網站不需要示範資料時，請移除 `index.html` 中對它的引用，並停止部署該檔案。
- 若保留公開示範頁，請只使用虛構且已核准公開的內容。
- 不得將真實聯絡資料、未公開產品資訊或其他敏感資料放入前端檔案。

Web 伺服器至少需要：

- 使用 HTTPS
- 將產品路徑 fallback 至 `index.html`
- 將 `/api` 轉送至公開後端 API
- 為 HTML 設定適當的更新與快取策略
- 為 CSS、JavaScript 與圖片設定合理快取
- 設定必要的安全標頭
- 避免提供 `.env`、備份檔、原始資料或其他非公開檔案下載

## 圖片與外部連結

護照資料中的圖片與連結可能由 API 提供。部署時請確認：

- 圖片與連結使用 `https://`。
- 圖片來源允許公開顯示，且不需要內部登入狀態。
- 連結指向可信任且可公開存取的網站。
- 圖片失效或欄位缺漏時，頁面仍能正常閱讀。
- 分享功能使用正式公開網址，而不是本機或測試網址。

## 無障礙與響應式檢查

本頁面提供跳到主要內容、語意化標題、鍵盤頁籤操作、對話框焦點返回及狀態訊息。這些功能仍需在實際部署環境驗證。

建議至少檢查：

- 僅使用鍵盤能完成頁籤切換、碳足跡對話框及重試操作
- 320 CSS px 寬度下沒有遮擋或水平捲動問題
- 200% 文字放大後仍可閱讀及操作
- 圖片替代文字與連結名稱符合實際內容
- 列印預覽沒有截斷重要資料
- 色彩與焦點樣式在正式品牌配色下仍清楚可見

## 驗證清單

發布前建議使用一筆完整資料及一筆部分欄位為空的資料，確認：

- 合法產品網址可成功載入
- 錯誤網址會顯示清楚提示
- API 404、500 及逾時狀態能正確處理
- 基本資訊、材料、規格、認證及商標顯示正確
- 維修與回收紀錄顯示正確
- 相對及絕對圖片網址都能正確處理
- 碳足跡對話框、列印與分享功能正常
- 瀏覽器 console 沒有未處理錯誤
- Network 中沒有對內部或測試主機的請求
- QR Code 掃描後開啟正確產品

## 專案目錄

```text
frontstage/
├── index.html     頁面結構與公開設定
├── i18n.js        中文／英文介面文字與語系切換
├── app.js         API 載入、資料呈現與互動
├── styles.css     版面與響應式樣式
├── mock-data.js   本機版面預覽資料
└── images/        頁面圖片
```

## 授權

本專案程式碼採用 [MIT License](LICENSE)。
