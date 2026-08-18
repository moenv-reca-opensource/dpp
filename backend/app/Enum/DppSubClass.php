<?php

namespace App\Enum;

// 護照子類別參數值,code 對應資料庫/前端傳入的 subCategory 代碼
enum DppSubClass: int
{
    case SecondaryLithiumBattery = 1;
    case EvBattery = 2;
    case LmtBattery = 3;
    case IndustrialBattery = 4;

    public function labelZh(): string
    {
        return match ($this) {
            self::SecondaryLithiumBattery => '二次鋰電池',
            self::EvBattery => '電動車用電池',
            self::LmtBattery => '輕型交通工具用電池',
            self::IndustrialBattery => '工業電池',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::SecondaryLithiumBattery => '',
            self::EvBattery => 'EV',
            self::LmtBattery => 'LMT',
            self::IndustrialBattery => 'IND',
        };
    }
}
