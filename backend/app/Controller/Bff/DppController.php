<?php

namespace App\Controller\Bff;

use App\Controller\AbstractController;
use App\Exception\NotFoundException;
use App\Exception\ValidationException;
use App\Service\DppRepository;
use App\Service\QrCodeService;
use App\Service\RecycleRepository;
use App\Service\RepairRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class DppController extends AbstractController
{
    public function __construct(
        private readonly DppRepository $dppRepository,
        private readonly RepairRepository $repairRepository,
        private readonly RecycleRepository $recycleRepository
    ) {
    }

    // DPP 列表（索引摘要）
    public function list(Request $request, Response $response): Response
    {
        return $this->json($response, $this->dppRepository->listAll());
    }

    // 匯入 DPP 資料,body 為 multipart/form-data,file 欄位放置 JSON 檔
    // (檔案格式參考 storage/dpp/dpp_add_bettery_v1.0.json 範例,與 add() 的 body 結構相同)
    public function import(Request $request, Response $response): Response
    {
        $file = $request->getUploadedFiles()['file'] ?? null;
        if ($file === null || $file->getError() !== UPLOAD_ERR_OK) {
            throw new ValidationException('file is required', ['file']);
        }

        $document = json_decode((string) $file->getStream()->getContents(), true);
        if (!is_array($document)) {
            throw new ValidationException('file content is not valid JSON', ['file']);
        }

        return $this->json($response, $this->dppRepository->create($document));
    }

    // 新增 DPP 資料;DPP 陣列可同時申報多個序號(SerialNo)的護照,共用同一份 DPPInfo/ProductInfo 等區塊
    public function add(Request $request, Response $response): Response
    {
        $body = $this->getJsonBody($request);
        $this->requireFields($body, ['DPP']);

        $result = $this->dppRepository->create($body);

        return $this->json($response, $result, 201);
    }

    // 修改單筆 DPP 資料,body 的 DPP 陣列第一筆需含目標 UID
    public function modify(Request $request, Response $response): Response
    {
        $body = $this->getJsonBody($request);
        $this->requireFields($body, ['DPP']);

        $uid = $this->sanitizeString($body['DPP'][0]['UID'] ?? '');
        if ($uid === '') {
            throw new ValidationException('DPP.0.UID is required', ['DPP.0.UID']);
        }

        $record = $this->dppRepository->update($uid, $body);
        if ($record === null) {
            throw new NotFoundException('DPP not found');
        }

        return $this->json($response, $record);
    }

    // 取得單筆 DPP 完整資料
    public function info(Request $request, Response $response): Response
    {
        $body = $this->getJsonBody($request);
        $uid = $this->sanitizeString($body['UID'] ?? '');

        $record = $uid !== '' ? $this->dppRepository->find($uid) : null;
        if ($record === null) {
            throw new NotFoundException('DPP not found');
        }

        $record['RepairRecord'] = $this->repairRepository->findByUid($uid);
        $record['RecycleRecord'] = $this->recycleRepository->findByUid($uid);

        return $this->json($response, $record);
    }

    // 取得單筆 DPP 的 QR code 圖片，供後台頁面顯示/列印
    public function qrcode(Request $request, Response $response): Response
    {
        $body = $this->getJsonBody($request);
        $uid = $this->sanitizeString($body['UID'] ?? '');

        if ($uid === '' || $this->dppRepository->find($uid) === null) {
            throw new NotFoundException('DPP not found');
        }

        $qrCodeService = new QrCodeService((string) getenv('PUBLIC_FRONTEND_URL'));
        $result = $qrCodeService->generateForProduct($uid);

        $response->getBody()->write($result->getString());

        return $response->withHeader('Content-Type', $result->getMimeType());
    }
}
