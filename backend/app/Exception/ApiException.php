<?php

namespace App\Exception;

// 帶有 HTTP 狀態碼的例外基底類別，由 App\Handler\JsonErrorHandler 統一攔截並轉為 JSON 回應
abstract class ApiException extends \RuntimeException
{
    public function __construct(string $message, private readonly int $statusCode)
    {
        parent::__construct($message);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
