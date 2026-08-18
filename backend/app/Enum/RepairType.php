<?php

namespace App\Enum;

// 維修作業項目類別參數值,code 對應 repair_info[].repair_type 代碼
enum RepairType: int
{
    case Repair = 1;
    case Replace = 2;

    public function labelZh(): string
    {
        return match ($this) {
            self::Repair => '維修',
            self::Replace => '更換',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::Repair => 'Repair',
            self::Replace => 'Replace',
        };
    }
}
