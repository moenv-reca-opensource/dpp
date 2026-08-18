<?php

namespace App\Enum;

// 自願性標準名稱參數值,code 對應資料庫/前端傳入的 certName 代碼(中文名稱與 MCertName 相同,
// 但英文標籤依官方 ParamGroup 資料略有差異,如 Cfv 為 "CFV" 而非 "CFV盤查認證")
enum VCertName: int
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
            self::Cfv => 'CFV',
            self::Ce => 'CE Marking',
        };
    }
}
