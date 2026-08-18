<?php

namespace App\Enum;

// 材料表類別參數值,code 對應資料庫/前端傳入的 materType 代碼
enum MaterType: int
{
    case MaterialComposition = 1;
    case CriticalMaterial = 2;
    case HazardousSubstances = 3;
    case RecycledMaterial = 4;
    case RenewableMaterial = 5;
    case SubstanceOfConcern = 6;

    public function labelZh(): string
    {
        return match ($this) {
            self::MaterialComposition => '材料組成成分',
            self::CriticalMaterial => '關鍵材料組成成分',
            self::HazardousSubstances => '有害成分',
            self::RecycledMaterial => '回收材料成分',
            self::RenewableMaterial => '使用的可再生材料',
            self::SubstanceOfConcern => '產品內關注物質',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::MaterialComposition => 'MaterialComposition',
            self::CriticalMaterial => 'CriticalMaterial',
            self::HazardousSubstances => 'HazardousSubstances',
            self::RecycledMaterial => 'RecycledMaterial',
            self::RenewableMaterial => 'RenewableMaterial',
            self::SubstanceOfConcern => 'SubstanceOfConcern',
        };
    }
}
