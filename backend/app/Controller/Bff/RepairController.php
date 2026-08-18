<?php

namespace App\Controller\Bff;

use App\Controller\AbstractController;
use App\Exception\ValidationException;
use App\Service\RepairRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class RepairController extends AbstractController
{
    public function __construct(private readonly RepairRepository $repairRepository)
    {
    }

    // 匯入維修紀錄,body 為 multipart/form-data,file 欄位放置 JSON 檔
    // (檔案格式參考 storage/dpp/dpp_add_repair_v1.0.json 範例)
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

        return $this->json($response, $this->repairRepository->importBatch($document));
    }
}
