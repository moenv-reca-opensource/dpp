<?php

namespace App\Enum;

// PEF生命週期階段參數值,code 對應資料庫/前端傳入的 lifeCycleStage 代碼
enum LifeCycleStage: int
{
    case RawMaterial = 1;
    case Production = 2;
    case Distribution = 3;
    case Use = 4;
    case EndOfLife = 5;

    public function labelZh(): string
    {
        return match ($this) {
            self::RawMaterial => '原料階段',
            self::Production => '製造階段',
            self::Distribution => '運輸階段',
            self::Use => '使用階段',
            self::EndOfLife => '棄置或回收階段',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::RawMaterial => 'Raw material acquisition and pre-processing',
            self::Production => 'Production of the main product',
            self::Distribution => 'Product distribution and storage',
            self::Use => 'Use stage',
            self::EndOfLife => 'End of life',
        };
    }
}
