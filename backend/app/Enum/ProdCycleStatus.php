<?php

namespace App\Enum;

// 產品狀態參數值,code 對應資料庫/前端傳入的 status 代碼(非連續數值,依原始資料表)
enum ProdCycleStatus: int
{
    case Original = 1;
    case InUse = 2;
    case Reused = 3;
    case Remanufactured = 4;
    case Waste = 5;
    case Other = 9;
    case Warehouse = 11;
    case Distribution = 12;
    case Recycled = 14;
    case Scrapped = 15;

    public function labelZh(): string
    {
        return match ($this) {
            self::Original => '原裝',
            self::InUse => '使用中',
            self::Reused => '再使用',
            self::Remanufactured => '再製造',
            self::Waste => '廢棄',
            self::Other => '其他',
            self::Warehouse => '廠庫',
            self::Distribution => '銷庫',
            self::Recycled => '回收',
            self::Scrapped => '報廢',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::Original => 'Original',
            self::InUse => '',
            self::Reused => 'Reused',
            self::Remanufactured => 'Remanufactured',
            self::Waste => 'Waste',
            self::Other => '',
            self::Warehouse => '',
            self::Distribution => '',
            self::Recycled => '',
            self::Scrapped => '',
        };
    }
}
