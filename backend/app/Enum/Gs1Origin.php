<?php

namespace App\Enum;

// GS1 交易品項原產國參數值,code 為 ISO 3166-1 alpha-2 國別碼
enum Gs1Origin: string
{
    case Taiwan = 'TW';

    public function labelZh(): string
    {
        return match ($this) {
            self::Taiwan => '台灣',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::Taiwan => 'Taiwan',
        };
    }
}
