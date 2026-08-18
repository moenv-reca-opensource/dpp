<?php

namespace App\Enum;

// 強制性標準名稱參數值,code 對應資料庫/前端傳入的 certName 代碼
enum MCertName: int
{
    case Scs = 1;
    case Grs = 2;
    case Rcs = 3;
    case Cfv = 4;
    case Ce = 5;

    public function labelZh(): string
    {
        return match ($this) {
            self::Scs => 'SCS標準',
            self::Grs => 'GRS標準',
            self::Rcs => 'RCS標準',
            self::Cfv => 'CFV盤查認證',
            self::Ce => 'CE標誌',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::Scs => 'Supply Chain Security',
            self::Grs => 'Global Recycled Standard',
            self::Rcs => 'Recycled Claim Standard',
            self::Cfv => 'CFV盤查認證',
            self::Ce => 'CE Marking',
        };
    }
}
