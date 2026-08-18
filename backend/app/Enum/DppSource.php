<?php

namespace App\Enum;

// 資料來源參數值,code 對應資料庫/前端傳入的 source 代碼;
// dpp.add 呼叫時填入規則:後臺UI畫面新增=1、外部系統呼叫新增=2、後臺點選"匯入"=3
enum DppSource: int
{
    case ManualEntry = 1;
    case ApiIntegration = 2;
    case BatchImport = 3;

    public function labelZh(): string
    {
        return match ($this) {
            self::ManualEntry => '手動新增',
            self::ApiIntegration => 'API串接',
            self::BatchImport => '整批匯入',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::ManualEntry => 'Manual Entry',
            self::ApiIntegration => 'API Integration',
            self::BatchImport => 'Batch Import',
        };
    }
}
