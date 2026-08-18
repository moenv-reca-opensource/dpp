<?php

namespace App\Exception;

// 外部輸入未通過檢查（缺必填欄位、格式錯誤等）時擲出，對應 HTTP 422
class ValidationException extends ApiException
{
    public function __construct(string $message, private readonly array $fields = [])
    {
        parent::__construct($message, 422);
    }

    // 未通過檢查的欄位名稱，供前端定位錯誤欄位
    public function getFields(): array
    {
        return $this->fields;
    }
}
