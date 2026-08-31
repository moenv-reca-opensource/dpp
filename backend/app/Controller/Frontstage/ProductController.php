<?php

namespace App\Controller\Frontstage;

use App\Controller\AbstractController;
use App\Exception\NotFoundException;
use App\Service\DppRepository;
use App\Service\QrCodeService;
use App\Service\RecycleRepository;
use App\Service\RepairRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ProductController extends AbstractController
{
    public function __construct(
        private readonly DppRepository $dppRepository,
        private readonly RepairRepository $repairRepository,
        private readonly RecycleRepository $recycleRepository
    ) {
    }

    // 單一產品檢視,掃 QR code 後供消費者查看的完整護照內容(含維修/回收紀錄)
    public function show(Request $request, Response $response): Response
    {
        $record = $this->findRequestedRecord($this->getJsonBody($request));
        if ($record === null) {
            throw new NotFoundException('DPP not found');
        }

        $uid = (string) $record['UID'];
        $record['RepairRecord'] = $this->repairRepository->findByUid($uid);
        $record['RecycleRecord'] = $this->recycleRepository->findByUid($uid);

        return $this->json($response, $record);
    }

    // 產品 QR code，掃描後導向前台單一產品檢視頁
    public function qrcode(Request $request, Response $response): Response
    {
        $record = $this->findRequestedRecord($this->getJsonBody($request));
        if ($record === null) {
            throw new NotFoundException('DPP not found');
        }

        $dppInfo = $record['DPPInfo'] ?? [];
        $qrCodeService = new QrCodeService((string) getenv('PUBLIC_FRONTEND_URL'));
        $result = $qrCodeService->generateForProduct(
            (string) ($dppInfo['GTIN'] ?? ''),
            (string) ($dppInfo['BatchLot'] ?? ''),
            (string) ($record['SerialNo'] ?? '')
        );

        $response->getBody()->write($result->getString());

        return $response->withHeader('Content-Type', $result->getMimeType());
    }

    private function findRequestedRecord(array $body): ?array
    {
        $id = $this->sanitizeString($body['id'] ?? '');
        $dppId = $this->sanitizeString($body['DPPID'] ?? '');

        $record = $id !== '' ? $this->dppRepository->find($id) : null;
        if ($record !== null) {
            return $record;
        }

        $dppId = $dppId !== '' ? $dppId : $id;

        return $dppId !== '' ? $this->dppRepository->findByDppId($dppId) : null;
    }
}
