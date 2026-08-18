<?php

namespace App\Controller\Public;

use App\Controller\AbstractController;
use App\Exception\NotFoundException;
use App\Service\DppRepository;
use App\Service\QrCodeService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ProductController extends AbstractController
{
    public function __construct(private readonly DppRepository $dppRepository)
    {
    }

    // 單一產品檢視
    public function show(Request $request, Response $response, array $args): Response
    {
        // TODO: 依 id 查詢單一產品資料
        return $this->json($response, ['id' => $args['id']]);
    }

    // 產品 QR code，掃描後導向前台單一產品檢視頁
    public function qrcode(Request $request, Response $response, array $args): Response
    {
        $id = $this->sanitizeString($args['id'] ?? '');

        if ($id === '' || $this->dppRepository->find($id) === null) {
            throw new NotFoundException('DPP not found');
        }

        $qrCodeService = new QrCodeService((string) getenv('PUBLIC_FRONTEND_URL'));
        $result = $qrCodeService->generateForProduct($id);

        $response->getBody()->write($result->getString());

        return $response->withHeader('Content-Type', $result->getMimeType());
    }
}
