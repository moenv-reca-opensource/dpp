<?php

namespace App\Enum;

// 產品特定資訊類別參數值,code 為 {DPPClass 英文名}{序號} 組成的字串代碼
// 因項目數量龐大(逾 130 項),中英文標籤改用 LABELS 查表而非逐一 match,避免重複三次維護同一份資料
enum SpecInfoType: string
{
    case Battery1 = 'Battery1';
    case Battery2 = 'Battery2';
    case Battery3 = 'Battery3';
    case Battery4 = 'Battery4';
    case Battery5 = 'Battery5';
    case Battery6 = 'Battery6';
    case Battery7 = 'Battery7';
    case Battery8 = 'Battery8';
    case Battery9 = 'Battery9';
    case Battery10 = 'Battery10';
    case Battery11 = 'Battery11';
    case Battery12 = 'Battery12';
    case Battery13 = 'Battery13';
    case Battery14 = 'Battery14';
    case Battery15 = 'Battery15';
    case Battery16 = 'Battery16';
    case Battery17 = 'Battery17';
    case Battery18 = 'Battery18';
    case Battery19 = 'Battery19';
    case Battery20 = 'Battery20';
    case Battery21 = 'Battery21';
    case Battery22 = 'Battery22';
    case Battery23 = 'Battery23';
    case Battery24 = 'Battery24';
    case Battery25 = 'Battery25';
    case Battery26 = 'Battery26';
    case Battery27 = 'Battery27';
    case Battery28 = 'Battery28';
    case Battery29 = 'Battery29';
    case Battery30 = 'Battery30';
    case Battery31 = 'Battery31';
    case Battery32 = 'Battery32';
    case Battery33 = 'Battery33';
    case Battery34 = 'Battery34';
    case Battery35 = 'Battery35';
    case Battery36 = 'Battery36';
    case Battery37 = 'Battery37';
    case Battery38 = 'Battery38';
    case Battery39 = 'Battery39';
    case Battery40 = 'Battery40';

    case Notebook1 = 'Notebook1';
    case Notebook2 = 'Notebook2';
    case Notebook3 = 'Notebook3';
    case Notebook4 = 'Notebook4';
    case Notebook5 = 'Notebook5';
    case Notebook6 = 'Notebook6';
    case Notebook7 = 'Notebook7';
    case Notebook8 = 'Notebook8';
    case Notebook9 = 'Notebook9';
    case Notebook10 = 'Notebook10';
    case Notebook11 = 'Notebook11';
    case Notebook12 = 'Notebook12';
    case Notebook13 = 'Notebook13';
    case Notebook14 = 'Notebook14';
    case Notebook15 = 'Notebook15';
    case Notebook16 = 'Notebook16';
    case Notebook17 = 'Notebook17';
    case Notebook18 = 'Notebook18';
    case Notebook19 = 'Notebook19';
    case Notebook20 = 'Notebook20';

    case Tablet1 = 'Tablet1';
    case Tablet2 = 'Tablet2';
    case Tablet3 = 'Tablet3';
    case Tablet4 = 'Tablet4';
    case Tablet5 = 'Tablet5';
    case Tablet6 = 'Tablet6';
    case Tablet7 = 'Tablet7';
    case Tablet8 = 'Tablet8';
    case Tablet9 = 'Tablet9';
    case Tablet10 = 'Tablet10';
    case Tablet11 = 'Tablet11';
    case Tablet12 = 'Tablet12';
    case Tablet13 = 'Tablet13';
    case Tablet14 = 'Tablet14';
    case Tablet15 = 'Tablet15';
    case Tablet16 = 'Tablet16';
    case Tablet17 = 'Tablet17';
    case Tablet18 = 'Tablet18';
    case Tablet19 = 'Tablet19';
    case Tablet20 = 'Tablet20';
    case Tablet21 = 'Tablet21';
    case Tablet22 = 'Tablet22';
    case Tablet23 = 'Tablet23';
    case Tablet24 = 'Tablet24';
    case Tablet25 = 'Tablet25';
    case Tablet26 = 'Tablet26';
    case Tablet27 = 'Tablet27';
    case Tablet28 = 'Tablet28';
    case Tablet29 = 'Tablet29';
    case Tablet30 = 'Tablet30';
    case Tablet31 = 'Tablet31';

    case SmartPhone1 = 'SmartPhone1';
    case SmartPhone2 = 'SmartPhone2';
    case SmartPhone3 = 'SmartPhone3';
    case SmartPhone4 = 'SmartPhone4';
    case SmartPhone5 = 'SmartPhone5';
    case SmartPhone6 = 'SmartPhone6';
    case SmartPhone7 = 'SmartPhone7';
    case SmartPhone8 = 'SmartPhone8';
    case SmartPhone9 = 'SmartPhone9';
    case SmartPhone10 = 'SmartPhone10';
    case SmartPhone11 = 'SmartPhone11';
    case SmartPhone12 = 'SmartPhone12';
    case SmartPhone13 = 'SmartPhone13';
    case SmartPhone14 = 'SmartPhone14';
    case SmartPhone15 = 'SmartPhone15';
    case SmartPhone16 = 'SmartPhone16';
    case SmartPhone17 = 'SmartPhone17';
    case SmartPhone18 = 'SmartPhone18';
    case SmartPhone19 = 'SmartPhone19';
    case SmartPhone20 = 'SmartPhone20';
    case SmartPhone21 = 'SmartPhone21';
    case SmartPhone22 = 'SmartPhone22';
    case SmartPhone23 = 'SmartPhone23';
    case SmartPhone24 = 'SmartPhone24';
    case SmartPhone25 = 'SmartPhone25';
    case SmartPhone26 = 'SmartPhone26';
    case SmartPhone27 = 'SmartPhone27';
    case SmartPhone28 = 'SmartPhone28';
    case SmartPhone29 = 'SmartPhone29';
    case SmartPhone30 = 'SmartPhone30';
    case SmartPhone31 = 'SmartPhone31';

    case Textile1 = 'Textile1';
    case Textile2 = 'Textile2';
    case Textile3 = 'Textile3';
    case Textile4 = 'Textile4';
    case Textile5 = 'Textile5';
    case Textile6 = 'Textile6';
    case Textile7 = 'Textile7';
    case Textile8 = 'Textile8';
    case Textile9 = 'Textile9';
    case Textile10 = 'Textile10';
    case Textile11 = 'Textile11';
    case Textile12 = 'Textile12';
    case Textile13 = 'Textile13';
    case Textile14 = 'Textile14';

    private const LABELS = [
        'Battery1' => ['zh' => '預期使用壽命(年)', 'en' => 'Expected Battery Lifetime in Years'],
        'Battery2' => ['zh' => '電動車製造商', 'en' => 'EV Manufacturer'],
        'Battery3' => ['zh' => '電動車組裝國', 'en' => 'Country of EV Assembly'],
        'Battery4' => ['zh' => '電池生產商', 'en' => 'BatteryProducer'],
        'Battery5' => ['zh' => '電池生產國', 'en' => 'Country of Battery Production'],
        'Battery6' => ['zh' => '電芯生產商', 'en' => 'Battery Cell Producer'],
        'Battery7' => ['zh' => '電芯生產國', 'en' => 'Country of Cell Production'],
        'Battery8' => ['zh' => '電池類型', 'en' => 'Battery Type'],
        'Battery9' => ['zh' => '額定容量(Ah)', 'en' => 'Rated capacity (in Ah)'],
        'Battery10' => ['zh' => '電芯型態', 'en' => 'Battery Cell type'],
        'Battery11' => ['zh' => '每個電池的電池芯數', 'en' => 'Number of Cell per Battery'],
        'Battery12' => ['zh' => '電池總能量(kWh)', 'en' => 'Total Energy'],
        'Battery13' => ['zh' => '電池往返能源效率(%)', 'en' => 'Battery Round Trip Efficiency'],
        'Battery14' => ['zh' => '電池重量(kg)', 'en' => 'Weight'],
        'Battery15' => ['zh' => '電池不使用時的可承受溫度(°C)', 'en' => 'Temperature Range (Min-Max)'],
        'Battery16' => ['zh' => '電池充放電率(C)', 'en' => 'C-rate'],
        'Battery17' => ['zh' => '註冊商號', 'en' => 'Registered Trade Name'],
        'Battery18' => ['zh' => '註冊商標', 'en' => 'Registered Trade Mark'],
        'Battery19' => ['zh' => '產品電子郵件信箱', 'en' => 'Email Address'],
        'Battery20' => ['zh' => '電池的化學成分、CAS號碼與重量(單位g)', 'en' => 'Chemistry'],
        'Battery21' => ['zh' => '可用滅火劑', 'en' => 'Usable Extinguishing Agent'],
        'Battery22' => ['zh' => '生命週期階段區分的電池碳足跡', 'en' => 'Carbon Footprint of Life cycle Stages'],
        'Battery23' => ['zh' => '碳足跡性能等級', 'en' => 'Carbon Footprint Performance Class'],
        'Battery24' => ['zh' => '碳足跡值的估算依據之web連結', 'en' => 'Web Link of Carbon Footprint Values Reference'],
        'Battery25' => ['zh' => '電池最低、標稱和最高電壓與相關溫度範圍', 'en' => 'Voltage (Min-Nom-Max) and Relevant Temperature Range'],
        'Battery26' => ['zh' => '電池功率能力與相關溫度範圍', 'en' => 'Power Capability and Relevant Temperature Range'],
        'Battery27' => ['zh' => '預估電池壽命(循環)', 'en' => 'Expected Battery Lifetime in Cycles'],
        'Battery28' => ['zh' => '預估電池壽命(循環)所使用的參考測試方式', 'en' => 'Expected Battery Lifetime Reference'],
        'Battery29' => ['zh' => '耗盡的容量閾值(僅適用於電動車電池)', 'en' => 'Capacity Threshold for Exhaustion'],
        'Battery30' => ['zh' => '初始電池單元(cell)之電阻', 'en' => 'Initial Internal Resistance on battery cell level'],
        'Battery31' => ['zh' => '初始電池組(pack)之電阻', 'en' => 'Initial Internal Resistance on battery pack level'],
        'Battery32' => ['zh' => '初始的能源往返效率', 'en' => 'Initial Round Trip Energy Efficiency'],
        'Battery33' => ['zh' => '循環壽命50%的能源往返效率', 'en' => 'Round Trip Energy Efficiency at 50% of Cycle Life'],
        'Battery34' => ['zh' => '可證明符合電池指令法規或在其基礎上通過的任何措施或授權法案所規定的要求之測試報告的結果', 'en' => 'Results of tests reports'],
        'Battery35' => ['zh' => '電池種類', 'en' => 'Battery category'],
        'Battery36' => ['zh' => '歐盟符合性聲明ID', 'en' => 'ID of EU declaration of conformity'],
        'Battery37' => ['zh' => '電池的製造日期或（如果適用）投入使用的日期', 'en' => 'Date of Putting the Battery into Service'],
        'Battery38' => ['zh' => '最大電池功率能力', 'en' => 'Maximum permitted battery power'],
        'Battery39' => ['zh' => '初始自放電率與相關溫度範圍', 'en' => 'Initial Self-Discharging Rate'],
        'Battery40' => ['zh' => '電池在其預期使用壽命期間提供的總能量中每kWh產生的二氧化碳量(kg)計算', 'en' => 'Carbon Footprint of the Battery'],

        'Notebook1' => ['zh' => '中央處理器', 'en' => 'Processor'],
        'Notebook2' => ['zh' => '作業系統', 'en' => 'Operating System'],
        'Notebook3' => ['zh' => '螢幕', 'en' => 'Display'],
        'Notebook4' => ['zh' => '記憶體', 'en' => 'Memory'],
        'Notebook5' => ['zh' => '顯示卡', 'en' => 'Graphics'],
        'Notebook6' => ['zh' => '儲存空間', 'en' => 'Storage'],
        'Notebook7' => ['zh' => '安全機制', 'en' => 'Security'],
        'Notebook8' => ['zh' => '音訊', 'en' => 'Audio'],
        'Notebook9' => ['zh' => '攝影機', 'en' => 'Camera'],
        'Notebook10' => ['zh' => '外觀尺寸', 'en' => 'Dimensions'],
        'Notebook11' => ['zh' => '重量', 'en' => 'Weight'],
        'Notebook12' => ['zh' => '顏色', 'en' => 'Color'],
        'Notebook13' => ['zh' => '鍵盤', 'en' => 'Keyboard'],
        'Notebook14' => ['zh' => '觸控板', 'en' => 'Touchpad'],
        'Notebook15' => ['zh' => '連接埠', 'en' => 'Ports'],
        'Notebook16' => ['zh' => '連線', 'en' => 'Connectivity'],
        'Notebook17' => ['zh' => '包裝盒內容', 'en' => 'In the Box'],
        'Notebook18' => ['zh' => '電池額定容量, [mAh]', 'en' => 'Rated battery capacity [mAh]'],
        'Notebook19' => ['zh' => '充電器所需輸出功率 [W]， X', 'en' => 'Charger Required Output Power [W]'],
        'Notebook20' => ['zh' => '充電器設備端插座類型， [USB-A/USB-Micro B/USB-C/其他]', 'en' => 'Charger Receptacle Type (at Device End)'],

        'Tablet1' => ['zh' => '中央處理器', 'en' => 'Processor'],
        'Tablet2' => ['zh' => '作業系統，[Android /iOS/其他]', 'en' => 'Operating System'],
        'Tablet3' => ['zh' => '螢幕', 'en' => 'Display'],
        'Tablet4' => ['zh' => '記憶體', 'en' => 'Memory'],
        'Tablet5' => ['zh' => '儲存空間', 'en' => 'Storage'],
        'Tablet6' => ['zh' => '攝影機', 'en' => 'Camera'],
        'Tablet7' => ['zh' => '外觀尺寸', 'en' => 'Dimensions'],
        'Tablet8' => ['zh' => '重量', 'en' => 'Weight'],
        'Tablet9' => ['zh' => '顏色', 'en' => 'Color'],
        'Tablet10' => ['zh' => '連接埠', 'en' => 'Ports'],
        'Tablet11' => ['zh' => '連線', 'en' => 'Connectivity'],
        'Tablet12' => ['zh' => '能源效率等級，[A/B/C/D/E/F/G]', 'en' => 'Energy Efficiency Class'],
        'Tablet13' => ['zh' => '供用戶更換電池，[yes/no]', 'en' => 'Battery User-Replaceable'],
        'Tablet14' => ['zh' => '設備續航時間 (ENDdevice[h])， X', 'en' => 'Battery Endurance per Cycle (ENDdevice [h])'],
        'Tablet15' => ['zh' => '電池循環次數 - 預設設定 [cycles] ≥x00', 'en' => 'Battery Endurance in Cycles – Default Settings [cycles]'],
        'Tablet16' => ['zh' => '電池額定容量, [mAh]', 'en' => 'Rated battery capacity [mAh]'],
        'Tablet17' => ['zh' => '出貨時附有保護蓋，[yes/no]', 'en' => 'Shipped with Protective Cover'],
        'Tablet18' => ['zh' => '反覆自由落體可靠度測試 – 墜落無缺陷[n]，[≥ x]', 'en' => 'Repeated Free Fall Reliability Test – Falls without Defect [n]'],
        'Tablet19' => ['zh' => '反覆自由落體可靠度測試 - 完全伸展狀態下墜落無缺陷[n]，[≥ x/n.a.]', 'en' => 'Repeated Free Fall Reliability Test – Falls without Defect, Tested in Fully Extended State [n]'],
        'Tablet20' => ['zh' => '反覆自由落體可靠度等級，[A/B/C/D/E]', 'en' => 'Repeated Free Fall Reliability Class'],
        'Tablet21' => ['zh' => '防塵防水等級， IPxx', 'en' => 'Ingress Protection Rating'],
        'Tablet22' => ['zh' => 'IPx8 情況下指定的水中浸入深度 [m]，[x,xx/n.a.]', 'en' => 'Specified Immersion Depth in Water, in Case of IPx8 [m]'],
        'Tablet23' => ['zh' => '螢幕抗刮硬度（莫氏硬度）， X', 'en' => 'Screen Scratch Resistance on Mohs Hardness Scale'],
        'Tablet24' => ['zh' => '充電器所需輸出功率 [W]， X', 'en' => 'Charger Required Output Power [W]'],
        'Tablet25' => ['zh' => '充電器設備端插座類型， [USB-A/USB-Micro B/USB-C/其他]', 'en' => 'Charger Receptacle Type (at Device End)'],
        'Tablet26' => ['zh' => '提供作業系統安全性更新、修正更新和功能更新的最低保證時間 [years]， X', 'en' => 'Minimum Guaranteed Availability of Operating System Security Updates, Corrective Updates and Functionality Updates (years)'],
        'Tablet27' => ['zh' => '維修度等級， [A/B/C/D/E]', 'en' => 'Repairability Class'],
        'Tablet28' => ['zh' => '提供給專業維修人員和終端使用者備件資訊的網頁連結，https://xxx', 'en' => 'Weblink to Information on Spare Parts Availability for Professional Repairers and End Users'],
        'Tablet29' => ['zh' => '提供給終端使用者維修說明的網頁連結，https://xxx', 'en' => 'Weblink to Repair Instructions for End-Users'],
        'Tablet30' => ['zh' => '稅前價格的網頁連結，https://xxx', 'en' => 'Weblink to Indicative Pre-Tax Prices'],
        'Tablet31' => ['zh' => '供應商提供保證的最短期限 [月]，X', 'en' => 'Minimum Duration of the Guarantee Offered by the Supplier [months]'],

        'SmartPhone1' => ['zh' => '中央處理器', 'en' => 'Processor'],
        'SmartPhone2' => ['zh' => '作業系統，[Android /iOS/其他]', 'en' => 'Operating System'],
        'SmartPhone3' => ['zh' => '螢幕', 'en' => 'Display'],
        'SmartPhone4' => ['zh' => '記憶體', 'en' => 'Memory'],
        'SmartPhone5' => ['zh' => '儲存空間', 'en' => 'Storage'],
        'SmartPhone6' => ['zh' => '攝影機', 'en' => 'Camera'],
        'SmartPhone7' => ['zh' => '外觀尺寸', 'en' => 'Dimensions'],
        'SmartPhone8' => ['zh' => '重量', 'en' => 'Weight'],
        'SmartPhone9' => ['zh' => '顏色', 'en' => 'Color'],
        'SmartPhone10' => ['zh' => '連接埠', 'en' => 'Ports'],
        'SmartPhone11' => ['zh' => '連線', 'en' => 'Connectivity'],
        'SmartPhone12' => ['zh' => '能源效率等級，[A/B/C/D/E/F/G]', 'en' => 'Energy Efficiency Class'],
        'SmartPhone13' => ['zh' => '供用戶更換電池，[yes/no]', 'en' => 'Battery User-Replaceable'],
        'SmartPhone14' => ['zh' => '設備續航時間 (ENDdevice[h])， X', 'en' => 'Battery Endurance per Cycle (ENDdevice [h])'],
        'SmartPhone15' => ['zh' => '電池循環次數 - 預設設定 [cycles] ≥x00', 'en' => 'Battery Endurance in Cycles – Default Settings [cycles]'],
        'SmartPhone16' => ['zh' => '電池額定容量, [mAh]', 'en' => 'Rated battery capacity [mAh]'],
        'SmartPhone17' => ['zh' => '出貨時附有保護蓋，[yes/no]', 'en' => 'Shipped with Protective Cover'],
        'SmartPhone18' => ['zh' => '反覆自由落體可靠度測試 – 墜落無缺陷[n]，[≥ x]', 'en' => 'Repeated Free Fall Reliability Test – Falls without Defect [n]'],
        'SmartPhone19' => ['zh' => '反覆自由落體可靠度測試 - 完全伸展狀態下墜落無缺陷[n]，[≥ x/n.a.]', 'en' => 'Repeated Free Fall Reliability Test – Falls without Defect, Tested in Fully Extended State [n]'],
        'SmartPhone20' => ['zh' => '反覆自由落體可靠度等級，[A/B/C/D/E]', 'en' => 'Repeated Free Fall Reliability Class'],
        'SmartPhone21' => ['zh' => '防塵防水等級， IPxx', 'en' => 'Ingress Protection Rating'],
        'SmartPhone22' => ['zh' => 'IPx8 情況下指定的水中浸入深度 [m]，[x,xx/n.a.]', 'en' => 'Specified Immersion Depth in Water, in Case of IPx8 [m]'],
        'SmartPhone23' => ['zh' => '螢幕抗刮硬度（莫氏硬度）， X', 'en' => 'Screen Scratch Resistance on Mohs Hardness Scale'],
        'SmartPhone24' => ['zh' => '充電器所需輸出功率 [W]， X', 'en' => 'Charger Required Output Power [W]'],
        'SmartPhone25' => ['zh' => '充電器設備端插座類型， [USB-A/USB-Micro B/USB-C/其他]', 'en' => 'Charger Receptacle Type (at Device End)'],
        'SmartPhone26' => ['zh' => '提供作業系統安全性更新、修正更新和功能更新的最低保證時間 [years]， X', 'en' => 'Minimum Guaranteed Availability of Operating System Security Updates, Corrective Updates and Functionality Updates (years)'],
        'SmartPhone27' => ['zh' => '維修度等級， [A/B/C/D/E]', 'en' => 'Repairability Class'],
        'SmartPhone28' => ['zh' => '提供給專業維修人員和終端使用者備件資訊的網頁連結，https://xxx', 'en' => 'Weblink to Information on Spare Parts Availability for Professional Repairers and End Users'],
        'SmartPhone29' => ['zh' => '提供給終端使用者維修說明的網頁連結，https://xxx', 'en' => 'Weblink to Repair Instructions for End-Users'],
        'SmartPhone30' => ['zh' => '稅前價格的網頁連結，https://xxx', 'en' => 'Weblink to Indicative Pre-Tax Prices'],
        'SmartPhone31' => ['zh' => '供應商提供保證的最短期限 [月]，X', 'en' => 'Minimum Duration of the Guarantee Offered by the Supplier [months]'],

        'Textile1' => ['zh' => '細節', 'en' => 'Detail'],
        'Textile2' => ['zh' => '顏色', 'en' => 'Color'],
        'Textile3' => ['zh' => '尺寸範圍', 'en' => 'Size range'],
        'Textile4' => ['zh' => '重量', 'en' => 'Weight'],
        'Textile5' => ['zh' => '禁用物質聲明', 'en' => 'Restricted substances declaration'],
        'Textile6' => ['zh' => '洗標', 'en' => 'Care labeling'],
        'Textile7' => ['zh' => '可回收性', 'en' => 'Recyclability'],
        'Textile8' => ['zh' => '耐用性最低要求', 'en' => 'Meets minimum durability requirement'],
        'Textile9' => ['zh' => '洗滌服務', 'en' => 'Laundry service'],
        'Textile10' => ['zh' => '可維修項目', 'en' => 'Repairable items'],
        'Textile11' => ['zh' => '備註', 'en' => 'Description'],
        'Textile12' => ['zh' => '紡織品類別', 'en' => 'Class'],
        'Textile13' => ['zh' => '產地', 'en' => 'Country of origin'],
        'Textile14' => ['zh' => '原料處理方式', 'en' => 'Raw material processing method'],
    ];

    public function labelZh(): string
    {
        return self::LABELS[$this->value]['zh'];
    }

    public function labelEn(): string
    {
        return self::LABELS[$this->value]['en'];
    }
}
