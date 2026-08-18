<?php

namespace App\Enum;

// 護照狀態參數值,code 對應資料庫/前端傳入的 status 代碼
enum DppStatus: int
{
    case Initial = 0;
    case Published = 1;
    case Unpublished = 2;

    public function labelZh(): string
    {
        return match ($this) {
            self::Initial => '初始',
            self::Published => '上架',
            self::Unpublished => '下架',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::Initial => 'Initial',
            self::Published => 'Published',
            self::Unpublished => 'Unpublished',
        };
    }
}
