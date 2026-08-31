<?php

namespace App\Service;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\Result\ResultInterface;

class QrCodeService
{
    public function __construct(private string $publicFrontendUrl)
    {
    }

    // 編碼內容為前台單一產品檢視頁網址，而非後端 API 網址
    public function generateForProduct(string $gtin, string $batchLot, string $serialNo): ResultInterface
    {
        $url = $this->buildProductUrl($gtin, $batchLot, $serialNo);

        return (new Builder(writer: new PngWriter()))->build(
            data: $url,
            errorCorrectionLevel: ErrorCorrectionLevel::Medium,
            size: 300,
            margin: 10,
        );
    }

    public function buildProductUrl(string $gtin, string $batchLot, string $serialNo): string
    {
        return rtrim($this->publicFrontendUrl, '/')
            . '/01/' . rawurlencode($gtin)
            . '/10/' . rawurlencode($batchLot)
            . '/21/' . rawurlencode($serialNo);
    }
}
