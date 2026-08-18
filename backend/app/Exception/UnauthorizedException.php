<?php

namespace App\Exception;

// 身分驗證失敗時擲出，對應 HTTP 401
class UnauthorizedException extends ApiException
{
    public function __construct(string $message = 'Unauthorized')
    {
        parent::__construct($message, 401);
    }
}
