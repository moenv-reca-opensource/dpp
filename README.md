# 數位產品護照(DPP)開源版

[![PHP 8.5](https://img.shields.io/badge/PHP-8.5-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![Slim 4.15.2](https://img.shields.io/badge/Slim-4.15.2-74A045)](https://www.slimframework.com/)
[![Vue 3.5.41](https://img.shields.io/badge/Vue-3.5.41-42B883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite 8.2.1](https://img.shields.io/badge/Vite-8.2.1-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](http://opensource.org/licenses/MIT)

## 這是什麼

DPP(Digital Product Passport,數位產品護照)是用於整合產品原料、製造、維修與回收等生命週期資訊的數位化資料,可供產品資訊揭露、追溯與查閱。

本專案包含後端 API、後台管理介面與公開查閱前臺,可供開發者參考、本機測試與自行部署。

## 技術架構

- PHP 8.5 + [Slim 4](https://www.slimframework.com/) 微框架
  - `routes/routes.php`:所有路由定義。公開 API 使用 `/api/frontstage` 路徑;後台管理 API 需要有效的 Session
- 檔案儲存(`backend/storage/dpp/`),無資料庫
- Docker Compose(`backend` PHP-FPM container + `nginx` container)
- 後台管理介面:`frontend/backstage`,使用 Vue 3、TypeScript、Vite 與 Element Plus
- 公開查閱前臺:`frontend/frontstage`,使用原生 HTML、CSS 與 JavaScript,可直接部署為靜態網站
- QR Code 產生([endroid/qr-code](https://github.com/endroid/qr-code)),掃描後導向 `PUBLIC_FRONTEND_URL/01/{GTIN}/10/{BatchLot}/21/{SerialNo}`

## 目錄結構

```
opensource/
├── docker-compose.yml
├── docker/
│   ├── nginx.conf
│   └── php/Dockerfile
├── backend/
│   ├── .env.example        # 複製為 .env 後填入實際帳密
│   ├── app/
│   │   ├── Controller/
│   │   │   ├── Backstage/   # 後台管理 API(需登入)
│   │   │   └── Frontstage/  # 前台公開 API(免登入)
│   │   ├── Enum/            # 固定代碼表(取代資料庫字典)
│   │   ├── Exception/
│   │   ├── Handler/         # 統一錯誤格式輸出
│   │   ├── Middleware/      # session 登入檢查
│   │   └── Service/         # 護照/維修/回收紀錄的檔案存取與驗證邏輯
│   ├── routes/routes.php    # 所有路由定義
│   ├── public/index.php     # 入口點
│   └── storage/dpp/         # 護照/維修/回收紀錄實際落地位置(runtime 產生,已於 .gitignore 排除)
└── frontend/
    ├── backstage/          # Vue 3/Vite 後台管理介面
    └── frontstage/         # 公開查閱用純 HTML/CSS/JavaScript 前臺
```

## 快速開始

以下指令均以 `opensource/` 為起始目錄。後端需要 Docker 與 Docker Compose;後台前端需要 Node.js 22 或更新版本與 npm。

### 1. 建立並啟動後端

```bash
cp backend/.env.example backend/.env
# 編輯 backend/.env,設定 ADMIN_USERNAME / ADMIN_PASSWORD / PUBLIC_FRONTEND_URL

docker compose build

# 安裝 PHP 套件依賴(產生 backend/vendor/,首次啟動前必做)
docker compose run --rm backend composer install

docker compose up -d

# 開放資料目錄寫入權限(護照/維修/回收紀錄的落地位置)
sudo chown -R www-data:www-data backend/storage
sudo chmod -R 775 backend/storage
```

服務啟動後可透過 `http://localhost:8080` 存取 API(對外埠號見 `docker-compose.yml`)。

> `backend/` 是以 bind mount 掛載進容器,`backend/storage/` 在主機上的擁有者是執行 docker 的使用者,
> 而容器內的 php-fpm 以 `www-data` 執行,因此需要開放寫入權限。
> 若省略這一步,新增或匯入護照時會出現 `file_put_contents(.../storage/dpp/index.json): Permission denied`。

### 2. 建立並啟動後台前端

後台前端需要 Node.js 22 或更新版本。若尚未安裝(或版本過舊),可透過 [nvm](https://github.com/nvm-sh/nvm) 安裝:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
nvm alias default 22
node -v          # 應顯示 v22.x
```

> Vite 8 使用的 Rolldown 需要 `node:util` 的 `styleText`(Node 20.12 / 22.0 才提供)。
> Node 版本過舊時,`npm run dev` 會失敗並顯示
> `SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'`。
> 若是從舊版 Node 升級上來,請先 `rm -rf node_modules` 再重新安裝依賴。

接著安裝依賴並啟動開發伺服器:

```bash
cd frontend/backstage
npm ci
cp .env.example .env
npm run dev
```

請依終端機顯示的網址開啟後台。開發伺服器會根據 `.env` 的 `VITE_DEV_API_TARGET`,將 `/api` 請求轉送至後端;預設為 `http://localhost:8080`。

建立正式部署檔案:

```bash
npm run build
```

建置結果會輸出至 `frontend/backstage/dist/`。正式部署時,請將後台與 `/api` 配置在相同來源,並為 Vue Router 設定 SPA fallback。

### 3. 建立與預覽公開前臺

`frontend/frontstage/` 沒有套件安裝或編譯步驟,不需要執行 `npm install` 或 `npm run build`。可直接以瀏覽器開啟:

```text
frontend/frontstage/index.html
```

直接開啟檔案時會使用內建的虛構示範資料。若要測試實際 API 與 GS1 產品路徑,請將 `frontend/frontstage/` 作為靜態網站目錄,並設定:

- `/01/{GTIN}/10/{BatchLot}/21/{SerialNo}` 等前臺路徑 fallback 至 `index.html`
- `/api` 轉送至後端服務
- 前臺與 API 使用相同來源
- `backend/.env` 的 `PUBLIC_FRONTEND_URL` 設為實際公開前臺網址

靜態部署需包含 `index.html`、`app.js`、`styles.css` 與 `images/`;如果不提供公開示範頁,可不部署 `mock-data.js`,並移除 `index.html` 中對它的引用。詳細設定請參考 `frontend/frontstage/README.md`。

## API 一覽

### `/api/frontstage`(免登入)

| Method | Path | 說明 |
| --- | --- | --- |
| POST | `/api/frontstage/dpp.info` | 以 UID 或 DPPID 取得單一產品(護照)資料 |
| POST | `/api/frontstage/dpp.qrcode` | 以 UID 或 DPPID 取得該產品的 QR code 圖片 |
| POST | `/api/frontstage/auth/login` | 管理者登入,成功後建立 session |
| POST | `/api/frontstage/auth/logout` | 登出,清除 session |

### 後台管理(需登入,session-based,由 `AuthMiddleware` 驗證)

| Method | Path | 說明 |
| --- | --- | --- |
| POST | `/api/dpp.list` | 護照列表摘要 |
| POST | `/api/dpp.add` | 新增護照(JSON body) |
| POST | `/api/dpp.modify` | 修改單筆護照 |
| POST | `/api/dpp.info` | 取得單筆護照完整資料(含維修/回收紀錄) |
| POST | `/api/dpp.qrcode` | 取得指定護照的 QR code 圖片 |
| POST | `/api/dpp.import` | 匯入護照資料(multipart/form-data,`file` 欄位放 JSON 檔) |
| POST | `/api/dpp.import_repair` | 匯入維修紀錄(multipart/form-data) |
| POST | `/api/dpp.import_recycle` | 匯入回收紀錄(multipart/form-data) |

匯入格式範例見 `frontend\backstage\public\templates\dpp_add_battery_v1.0.json`。

所有 API 回應統一格式:`{"success": bool, "code": int, "s_message": string, "payload": ...}`。

## 資料驗證

`DppRepository` 內建護照資料的驗證邏輯,包含:

- 標示必填的欄位檢查(如 `DPPClass` / `SerialNo` / `GTIN` / `BatchLot` 等)
- 依 `DPPClass` = 電池(1)時才生效的條件必填規則(如碳足跡欄位、指定材料類別、`SpecInfo_Type` 對應的 `Details` / `Voltage` / `Chemistry` 子結構)
- 固定代碼表(Enum)合法性檢查
- 日期欄位格式正規化為 `YYYY-MM-DD`
- 欄位長度上限、「擇一有值」欄位組合(如 `TARIC` / `CCCCode`)

詳細規則請參考 `backend/app/Service/DppRepository.php`。

## 授權

本專案採用 [MIT License](http://opensource.org/licenses/MIT)。
