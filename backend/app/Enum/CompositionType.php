<?php

namespace App\Enum;

// 材料種類參數值,code 對應資料庫/前端傳入的 compositionType 代碼
enum CompositionType: int
{
    case Metal = 1;
    case Plastic = 2;
    case TextileFiber = 3;
    case RecycledPolyester = 4;

    public function labelZh(): string
    {
        return match ($this) {
            self::Metal => '金屬',
            self::Plastic => '塑膠',
            self::TextileFiber => '紡織纖維',
            self::RecycledPolyester => '再生聚酯',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::Metal => '',
            self::Plastic => '',
            self::TextileFiber => '',
            self::RecycledPolyester => '',
        };
    }
}
