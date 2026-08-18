<?php

namespace App\Enum;

// 護照類別參數值,code 對應資料庫/前端傳入的 category 代碼
enum DppClass: int
{
    case Battery = 1;
    case Textile = 2;
    case Notebook = 3;
    case SmartPhone = 4;
    case Tablet = 5;
    case ElectricVehicle = 6;
    case Furniture = 7;
    case BuildingMaterial = 8;

    public function labelZh(): string
    {
        return match ($this) {
            self::Battery => '電池',
            self::Textile => '紡織品',
            self::Notebook => '筆電',
            self::SmartPhone => '手機',
            self::Tablet => '平板',
            self::ElectricVehicle => '電動車',
            self::Furniture => '家具',
            self::BuildingMaterial => '建材',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::Battery => 'Battery',
            self::Textile => 'Textile',
            self::Notebook => 'Notebook',
            self::SmartPhone => 'SmartPhone',
            self::Tablet => 'Tablet',
            self::ElectricVehicle => '',
            self::Furniture => '',
            self::BuildingMaterial => '',
        };
    }
}
