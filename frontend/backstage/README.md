# 電池產品數位護照開源後台

本專案是一套以 Vue 3 與 Vite 建置的電池產品數位護照管理介面，可搭配同一個儲存庫中的 `opensource/backend` 使用。

## 主要功能

- 管理者登入與登出
- 電池產品數位護照清單、搜尋、分頁、新增、編輯及檢視
- 基本資訊、產品規格、查證、材料、環境足跡、商標、維修及回收等資料頁籤
- 護照、維修紀錄及回收紀錄的 JSON 匯入
- QR Code 預覽與下載
- 繁體中文與英文介面
- 鍵盤操作、可見焦點及基本響應式版面

維修與回收頁籤為唯讀資料，需透過 JSON 匯入新增紀錄。護照狀態只能在新增時設定，既有資料的編輯流程不會變更狀態。

## 系統需求

- Node.js 22 LTS 或更新版本
- npm
- 已可正常啟動的 `opensource/backend`

建議使用 `package-lock.json` 鎖定的套件版本，不要任意混用其他套件管理工具。

## 快速開始

### 1. 啟動後端

由儲存庫的 `opensource` 目錄執行：

```bash
cp backend/.env.example backend/.env
docker compose up -d --build
```

啟動前請先依 `backend/.env.example` 填妥必要設定。預設情況下，後端服務位於 `http://localhost:8080`。

### 2. 啟動後台前端

進入 `opensource/frontend/backstage`：

```bash
npm ci
cp .env.example .env
npm run dev
```

開發伺服器啟動後，請依終端機顯示的網址開啟頁面。前端會把 `/api` 請求轉送至 `.env` 設定的後端位置。

## 環境變數

| 變數 | 用途 | 建議值 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | API 共同路徑 | `/api` |
| `VITE_DEV_API_TARGET` | 本機開發時的後端位置 | `http://localhost:8080` |
| `VITE_APP_BASE_PATH` | 前端部署路徑 | `/` 或 `/battery-dpp/` |
| `VITE_APP_TITLE` | 瀏覽器標題顯示的系統名稱 | `產品數位護照開源後台` |

所有 `VITE_*` 變數都會包含在瀏覽器可讀取的前端檔案中。請勿在其中放入帳號、密碼、Token、私鑰、內部主機名稱或其他機密資訊。

## 前後端連線方式

本專案使用後端 Session 驗證。為避免 Cookie 與跨來源限制影響登入狀態，正式部署時應讓前端與 API 使用相同來源，例如：

```text
https://example.org/       前端頁面
https://example.org/api/   後端 API
```

建議讓 `VITE_API_BASE_URL` 維持 `/api`，再由 Nginx、Apache 或其他 Web 伺服器把 `/api` 轉送至後端服務。

若設定 `VITE_APP_BASE_PATH=/battery-dpp/`，Web 伺服器還必須把 `/battery-dpp/*` 的前端路由導回 `/battery-dpp/index.html`，否則重新整理子頁面時可能出現 404。

## API 使用概要

前端使用的主要端點如下。除 JSON 匯入與 QR Code 外，請求及回應皆以 JSON 傳輸。

| 端點 | 用途 |
| --- | --- |
| `/api/frontstage/auth/login` | 登入 |
| `/api/frontstage/auth/logout` | 登出 |
| `/api/dpp.list` | 取得護照清單 |
| `/api/dpp.info` | 取得護照詳情 |
| `/api/dpp.add` | 新增護照 |
| `/api/dpp.modify` | 編輯護照 |
| `/api/dpp.import` | 匯入護照 JSON |
| `/api/dpp.import_repair` | 匯入維修紀錄 JSON |
| `/api/dpp.import_recycle` | 匯入回收紀錄 JSON |
| `/api/dpp.qrcode` | 取得 QR Code 圖片 |

一般 JSON 回應格式：

```json
{
  "success": true,
  "code": 200,
  "s_message": "0000",
  "payload": {}
}
```

使用 API 時請注意：

- 後台護照端點需要有效的登入 Session。
- `401` 通常表示尚未登入或登入狀態已失效。
- `422` 表示送出的欄位未通過驗證。
- 新增與匯入可能採逐筆處理，呼叫端除了檢查 HTTP 狀態，也要檢查回應中的 `errors`。
- 護照清單的搜尋、排序與分頁目前由瀏覽器端處理；資料量較大時，應評估改由後端處理。
- 編輯護照時，識別用的 `UID` 必須放在 `DPP[0].UID`。

完整資料型別可參考：

- [`src/types/passport.ts`](src/types/passport.ts)
- [`src/api/passport.ts`](src/api/passport.ts)
- [`src/data/parameters.json`](src/data/parameters.json)
- [`src/data/countries.json`](src/data/countries.json)

## JSON 匯入

清單頁提供三種匯入類型：

- 護照資料
- 維修紀錄
- 回收紀錄

匯入檔案必須是合法的 JSON，且欄位名稱、代碼值與日期格式需符合後端驗證規則。電池護照的材料資料應包含系統要求的材料類型；若後端回傳 `errors`，請逐筆檢查後再重新匯入。

範例檔案放在 [`public/templates`](public/templates) 目錄。範例主要用於說明資料結構，正式匯入前仍應依目前使用的後端版本確認必填欄位。

## 自訂系統名稱與標誌

- 系統名稱可透過 `VITE_APP_TITLE` 與語系檔調整。
- 預設標誌位於 [`src/assets/images/logo.svg`](src/assets/images/logo.svg)。
- 若改用不同副檔名，需同步修改 [`src/views/LoginView.vue`](src/views/LoginView.vue) 與 [`src/layouts/AppLayout.vue`](src/layouts/AppLayout.vue) 的引用。
- 請確認替換圖片或標誌的授權範圍，避免使用未取得授權的素材。

## 建置與部署

建立正式版檔案：

```bash
npm run build
```

輸出結果位於 `dist`。部署前請確認：

- 網站使用 HTTPS。
- 前端與 API 的路徑及反向代理設定正確。
- 正式環境沒有使用測試帳號或測試資料。
- `.env`、原始碼對照檔及其他不需公開的檔案未被 Web 伺服器提供下載。
- Session Cookie 已由後端依正式網域及 HTTPS 環境妥善設定。
- Web 伺服器已設定必要的安全標頭與 SPA fallback。

## 開發檢查

提交變更前建議執行：

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

進行前後端整合時，至少確認：

- 登入、登出及重新整理後的登入狀態
- 護照清單、搜尋、分頁、詳情、新增及編輯
- 三種 JSON 匯入及錯誤提示
- QR Code 預覽與下載
- 中英文切換
- 鍵盤操作及不同螢幕寬度
- 瀏覽器 console 與 Network 是否有錯誤

## 專案目錄

```text
src/
├── api/          API 呼叫
├── components/   共用元件與護照頁籤
├── data/         參數與國家資料
├── i18n/         中英文文字
├── router/       頁面路由
├── stores/       狀態管理
├── types/        TypeScript 型別
├── utils/        資料轉換與驗證工具
└── views/        主要頁面
```

## 授權

本專案採用 [MIT License](LICENSE)。
