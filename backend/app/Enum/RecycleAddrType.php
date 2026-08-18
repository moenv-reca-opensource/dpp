<?php

namespace App\Enum;

// 回收紀錄貯存地區類別參數值,code 對應 recycle_addr_type 代碼
enum RecycleAddrType: int
{
    case CompanyAddress = 1;
    case CustomAddress = 2;

    public function labelZh(): string
    {
        return match ($this) {
            self::CompanyAddress => '使用公司地址',
            self::CustomAddress => '自行填入',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::CompanyAddress => 'CompanyAddress',
            self::CustomAddress => 'CustomAddress',
        };
    }
}
