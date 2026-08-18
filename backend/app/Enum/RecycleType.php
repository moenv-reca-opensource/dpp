<?php

namespace App\Enum;

// 回收紀錄產品狀態參數值,code 對應 recycle_type 代碼
enum RecycleType: int
{
    case Recycle = 1;
    case Disposal = 2;

    public function labelZh(): string
    {
        return match ($this) {
            self::Recycle => '回收',
            self::Disposal => '報廢',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::Recycle => 'Recycle',
            self::Disposal => 'Disposal',
        };
    }
}
