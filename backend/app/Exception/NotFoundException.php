<?php

namespace App\Exception;

// 查無資源時擲出，對應 HTTP 404
class NotFoundException extends ApiException
{
    public function __construct(string $message = 'Resource not found')
    {
        parent::__construct($message, 404);
    }
}
