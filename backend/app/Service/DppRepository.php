<?php

namespace App\Service;

use App\Enum\CompositionType;
use App\Enum\DppClass;
use App\Enum\DppSource;
use App\Enum\DppStatus;
use App\Enum\DppSubClass;
use App\Enum\Gs1Origin;
use App\Enum\ImpactCategory;
use App\Enum\LifeCycleStage;
use App\Enum\MaterType;
use App\Enum\MCertName;
use App\Enum\ProdCycleStatus;
use App\Enum\SpecInfoType;
use App\Enum\VCertName;
use App\Exception\ValidationException;
use DateTimeImmutable;
use Exception;
use Ramsey\Uuid\Uuid;

// DPP 資料以檔案儲存(專案暫無 DB):
// - storage/dpp/records/{UID}.json 為單筆完整資料
// - storage/dpp/index.json 為列表用摘要索引,避免 dpp.list 需讀取所有完整檔案
//
// dpp.add / dpp.import 收到的是一份「文件」(格式同 storage/dpp/dpp_add_bettery_v1.0.json 範例):
// DPPInfo/ProductInfo 等區塊為共用資料,DPP 陣列則可能同時申報多個序號(SerialNo)各自的護照,
// 因此 DPP 陣列的每個元素展開為一筆獨立記錄,並各自持有一份共用區塊的複本。
class DppRepository
{
    private const SHARED_SECTIONS = [
        'DPPInfo',
        'ProductInfo',
        'MandatoryCertification',
        'VoluntaryCertification',
        'RepairabilityIndex',
        'Material',
        'PEFInfo',
        'TradeMark',
    ];

    // 無 DB 拘束，日期欄位需自行檢查並正規化為 YYYY-MM-DD 再落地存檔
    private const DATE_FIELDS = ['PassportStartDate', 'PassportEndDate', 'MftDate', 'WarrantyDate'];

    // DPP 陣列每筆項目標 V 的必填欄位（DPPStatus 允許 0，故必填檢查需用「是否缺漏」而非布林真假值判斷）
    private const ENTRY_REQUIRED_FIELDS = ['DPPClass', 'SerialNo', 'MftDate', 'WarrantyDate', 'DPPStatus'];

    // DPPInfo 標 V 的必填欄位；TARIC 與 CCCCode、DUNS 與 GLN 是「擇一有值」而非各自必填，於別處檢查
    private const DPP_INFO_REQUIRED_FIELDS = ['GTIN', 'BatchLot', 'OrigIn'];

    // ProductInfo 標 V 的必填欄位（不含 CCCCode，其必填性已由 TARIC/CCCCode 擇一有值涵蓋）
    private const PRODUCT_INFO_REQUIRED_FIELDS = ['Model', 'ProdName', 'FID'];

    // 標 V 但僅在 DPPClass = 電池(1) 時才必填的 ProductInfo 欄位
    private const CFP_REQUIRED_FIELDS_WHEN_BATTERY = ['CFPValue', 'CFPEmissionUnit', 'CFPFunctionUnit'];

    // DPPClass=電池(1) 時,Material 陣列必須涵蓋的 MaterType 類別(不含回收材料成分=4,
    // 該類別另有 consumer_time 條件必填,非電池強制揭露項目)
    private const BATTERY_REQUIRED_MATER_TYPES = [
        MaterType::MaterialComposition,
        MaterType::CriticalMaterial,
        MaterType::HazardousSubstances,
        MaterType::RenewableMaterial,
        MaterType::SubstanceOfConcern,
    ];

    // Material[].Material[] 巢狀項目中,依所屬(父層) MaterType 才需填入的欄位；
    // 與 DPPClass 無關,任何產品只要該 Material 項目的 MaterType 符合條件即需填入
    private const MATERIAL_COMPOSITION_REQUIRED_WHEN = [
        'parts' => [MaterType::HazardousSubstances, MaterType::RecycledMaterial, MaterType::SubstanceOfConcern],
        'consumer_time' => [MaterType::RecycledMaterial],
        'cas_no' => [MaterType::HazardousSubstances],
        'clp_index_no' => [MaterType::HazardousSubstances],
        'hazard_class_and_category_code' => [MaterType::HazardousSubstances],
        'concentration_range' => [MaterType::HazardousSubstances],
    ];

    // ProductInfo.SpecInfo[] 於 DPPClass=電池(1) 時,依 SpecInfo_Type 決定 Details/Voltage/
    // Chemistry 三者哪個才是必填的子結構(其餘維持原樣、不需填入)
    private const SPEC_INFO_TEMPERATURE_DETAIL_TYPES = [SpecInfoType::Battery26, SpecInfoType::Battery39];

    // DPP 陣列項目中,採固定代碼表(enum/ParamGroup)的欄位；有提供值時才檢查代碼合法性,未提供則略過
    private const ENTRY_ENUM_FIELDS = [
        'DPPClass' => DppClass::class,
        'DPPSubClass' => DppSubClass::class,
        'DPPStatus' => DppStatus::class,
        'DPPSource' => DppSource::class,
        'ProdCycleStatus' => ProdCycleStatus::class,
    ];

    // DPPInfo 各欄位長度上限（無 DB 拘束，需自行檢查）
    private const DPP_INFO_MAX_LENGTHS = [
        'GTIN' => 14,
        'SSCC' => 18,
        'BatchLot' => 20,
        'TARIC' => 14,
        'UniqueFacilityIdentifierDUNS' => 9,
        'UniqueFacilityIdentifierGLN' => 13,
    ];

    // ProductInfo 各欄位長度上限（無 DB 拘束，需自行檢查）
    private const PRODUCT_INFO_MAX_LENGTHS = [
        'FID' => 8,
        'CCCCode' => 11,
    ];

    // 共用區塊內的日期欄位：ProductInfo 為單一物件，其餘為陣列（每個元素各自檢查）
    private const SHARED_SECTION_OBJECT_DATE_FIELDS = [
        'ProductInfo' => ['CFPDate'],
    ];

    private const SHARED_SECTION_LIST_DATE_FIELDS = [
        'MandatoryCertification' => ['StartDate', 'EndDate'],
        'VoluntaryCertification' => ['StartDate', 'EndDate'],
        'TradeMark' => ['StartDate', 'EndDate'],
        'PEFInfo' => ['AssessmentDate'],
    ];

    private string $recordsDir;
    private string $indexFile;

    public function __construct(?string $storageDir = null)
    {
        $storageDir = $storageDir ?? __DIR__ . '/../../storage/dpp';
        $this->recordsDir = $storageDir . '/records';
        $this->indexFile = $storageDir . '/index.json';

        if (!is_dir($this->recordsDir)) {
            mkdir($this->recordsDir, 0775, true);
        }
        if (!file_exists($this->indexFile)) {
            file_put_contents($this->indexFile, json_encode([]));
        }
    }

    public function listAll(): array
    {
        return array_values($this->readIndex());
    }

    public function find(string $uid): ?array
    {
        $path = $this->recordPath($uid);
        if (!file_exists($path)) {
            return null;
        }

        $record = json_decode((string) file_get_contents($path), true);

        return is_array($record) ? $this->withDppId($record) : null;
    }

    // $document 格式同 dpp.add / dpp.import 的輸入:{"DPP": [...], "DPPInfo": {...}, "ProductInfo": {...}, ...}
    // DPP 陣列每個元素展開成一筆獨立記錄,缺少 SerialNo 的元素視為錯誤,不中斷整批處理
    public function create(array $document): array
    {
        $this->validateDocument($document);

        $entries = is_array($document['DPP'] ?? null) ? $document['DPP'] : [];
        $now = $this->now();

        $created = [];
        $errors = [];
        foreach ($entries as $index => $entry) {
            if (!is_array($entry)) {
                $errors[] = ['index' => $index, 'error' => 'DPP entry must be an object'];
                continue;
            }

            $missingFields = $this->missingRequiredFields($entry, self::ENTRY_REQUIRED_FIELDS);
            if ($missingFields !== []) {
                $errors[] = ['index' => $index, 'error' => implode(', ', $missingFields) . ' is required'];
                continue;
            }

            $invalidEnumFields = $this->invalidEnumFields($entry);
            if ($invalidEnumFields !== []) {
                $errors[] = ['index' => $index, 'error' => implode(', ', $invalidEnumFields) . ' is invalid'];
                continue;
            }

            $invalidDateFields = $this->normalizeDateFields($entry);
            if ($invalidDateFields !== []) {
                $errors[] = ['index' => $index, 'error' => implode(', ', $invalidDateFields) . ' must be a valid date'];
                continue;
            }

            $record = $this->buildRecord(Uuid::uuid7()->toString(), $entry, $document, $now, $now);
            $this->writeRecord($record);
            $this->upsertIndex($record);
            $created[] = $this->withDppId($record);
        }

        return ['created' => $created, 'errors' => $errors];
    }

    // $document['DPP'][0] 為欲修改的護照最新欄位值,未提供的欄位(含共用區塊)沿用舊值
    public function update(string $uid, array $document): ?array
    {
        $existing = $this->find($uid);
        if ($existing === null) {
            return null;
        }

        $this->validateDocument($document, $existing);

        $entries = is_array($document['DPP'] ?? null) ? $document['DPP'] : [];
        $entry = is_array($entries[0] ?? null) ? $entries[0] : [];

        $missingFields = $this->missingRequiredFields($entry, self::ENTRY_REQUIRED_FIELDS, $existing);
        if ($missingFields !== []) {
            throw new ValidationException(
                implode(', ', $missingFields) . ' is required',
                $missingFields
            );
        }

        $invalidEnumFields = $this->invalidEnumFields($entry, $existing);
        if ($invalidEnumFields !== []) {
            throw new ValidationException(
                implode(', ', $invalidEnumFields) . ' is invalid',
                $invalidEnumFields
            );
        }

        $invalidDateFields = $this->normalizeDateFields($entry);
        if ($invalidDateFields !== []) {
            throw new ValidationException(
                implode(', ', $invalidDateFields) . ' must be a valid date',
                $invalidDateFields
            );
        }

        $record = $this->buildRecord($uid, $entry, $document, $existing['createdAt'], $this->now(), $existing);
        $this->writeRecord($record);
        $this->upsertIndex($record);

        return $this->withDppId($record);
    }

    private function buildRecord(
        string $uid,
        array $entry,
        array $document,
        string $createdAt,
        string $updatedAt,
        ?array $fallback = null
    ): array {
        $get = fn (string $key, mixed $default = null) => $entry[$key] ?? $fallback[$key] ?? $default;
        $serialNo = (string) $get('SerialNo', '');

        $record = [
            'UID' => $uid,
            'DPPClass' => $get('DPPClass'),
            'DPPSubClass' => $get('DPPSubClass'),
            'PassportStartDate' => $get('PassportStartDate'),
            'PassportEndDate' => $get('PassportEndDate'),
            'SerialNo' => $serialNo,
            'MftDate' => $get('MftDate'),
            'WarrantyDate' => $get('WarrantyDate'),
            'ProdCycleStatus' => $get('ProdCycleStatus'),
            'DPPStatus' => $get('DPPStatus', 0),
            'DPPSource' => $get('DPPSource'),
            'createdAt' => $createdAt,
            'updatedAt' => $updatedAt,
        ];

        foreach (self::SHARED_SECTIONS as $section) {
            $record[$section] = $document[$section] ?? $fallback[$section] ?? [];
        }

        return $record;
    }

    // DPPID 是由 GTIN/BatchLot/SerialNo 組合出的值,不落地存成欄位,避免這三個來源欄位
    // 未來若被修改卻忘記重算,導致存檔的 DPPID 跟來源資料不一致;因此每次讀取(find/create/update
    // 回傳)時才用當下的 DPPInfo/SerialNo 現算,確保永遠反映最新資料。
    private function withDppId(array $record): array
    {
        $dppInfo = $record['DPPInfo'] ?? [];

        return ['UID' => $record['UID'], 'DPPID' => $this->buildDppId(
            (string) ($dppInfo['GTIN'] ?? ''),
            (string) ($dppInfo['BatchLot'] ?? ''),
            (string) ($record['SerialNo'] ?? '')
        )] + $record;
    }

    // DPPID 為 GS1 Application Identifier 格式:01+GTIN+10+BatchLot+21+SerialNo(移除空白),
    // 用於識別護照本身,與資料庫主鍵 UID(uuid7)是兩個不同用途的識別碼
    private function buildDppId(string $gtin, string $batchLot, string $serialNo): string
    {
        return '01' . str_replace(' ', '', $gtin)
            . '10' . str_replace(' ', '', $batchLot)
            . '21' . str_replace(' ', '', $serialNo);
    }

    // 彙整共用區塊的所有檢查（長度上限、擇一有值、日期格式），並就地正規化 $document
    // 內合法的日期欄位；任一項不通過即擲出 ValidationException，不寫入任何檔案
    private function validateDocument(array &$document, ?array $fallback = null): void
    {
        $isBattery = $this->isBatteryDocument($document, $fallback);

        $errors = $this->validateSharedSections($document, $fallback);
        $errors = array_merge($errors, $this->validateConditionalProductInfoFields($document, $isBattery, $fallback));
        $errors = array_merge($errors, $this->validateSectionArrayEnums($document, $fallback));
        $errors = array_merge($errors, $this->validateMaterialConditionalFields($document, $fallback, $isBattery));
        $errors = array_merge($errors, $this->validateSpecInfoFields($document, $fallback, $isBattery));

        $invalidDateFields = $this->normalizeSharedSectionDates($document);
        if ($invalidDateFields !== []) {
            $errors[] = implode(', ', $invalidDateFields) . ' must be a valid date';
        }

        if ($errors !== []) {
            throw new ValidationException(
                implode('; ', $errors),
                array_merge(['DPPInfo', 'ProductInfo'], $invalidDateFields)
            );
        }
    }

    // 檢查並就地正規化共用區塊內的日期欄位為 YYYY-MM-DD：ProductInfo.CFPDate、
    // MandatoryCertification/VoluntaryCertification/TradeMark 各筆的 StartDate/EndDate、
    // PEFInfo 各筆的 AssessmentDate；回傳格式不合法的欄位路徑清單
    private function normalizeSharedSectionDates(array &$document): array
    {
        $invalid = [];

        foreach (self::SHARED_SECTION_OBJECT_DATE_FIELDS as $section => $fields) {
            if (!is_array($document[$section] ?? null)) {
                continue;
            }

            foreach ($this->normalizeDateFieldsAt($document[$section], $fields, $section) as $path) {
                $invalid[] = $path;
            }
        }

        foreach (self::SHARED_SECTION_LIST_DATE_FIELDS as $section => $fields) {
            if (!is_array($document[$section] ?? null)) {
                continue;
            }

            foreach ($document[$section] as $index => &$item) {
                if (!is_array($item)) {
                    continue;
                }

                foreach ($this->normalizeDateFieldsAt($item, $fields, "{$section}[{$index}]") as $path) {
                    $invalid[] = $path;
                }
            }
        }

        return $invalid;
    }

    // normalizeDateFields() 的通用版本：欄位名稱改用完整路徑回報（如 PEFInfo[0].AssessmentDate）
    private function normalizeDateFieldsAt(array &$target, array $fields, string $pathPrefix): array
    {
        $invalid = [];
        foreach ($fields as $field) {
            if (!array_key_exists($field, $target)) {
                continue;
            }

            $normalized = $this->normalizeDate($target[$field]);
            if ($normalized === false) {
                $invalid[] = "{$pathPrefix}.{$field}";
                continue;
            }

            if ($normalized !== null) {
                $target[$field] = $normalized;
            }
        }

        return $invalid;
    }

    // 檢查 DPPInfo/ProductInfo 共用區塊：標 V 的必填欄位、各欄位長度上限，以及
    // TARIC/CCCCode、DUNS/GLN 兩組「擇一有值」的拘束；回傳錯誤訊息清單（無錯誤則為空陣列）
    private function validateSharedSections(array $document, ?array $fallback = null): array
    {
        $dppInfo = $document['DPPInfo'] ?? $fallback['DPPInfo'] ?? [];
        $productInfo = $document['ProductInfo'] ?? $fallback['ProductInfo'] ?? [];

        $errors = [];
        foreach (self::DPP_INFO_REQUIRED_FIELDS as $field) {
            if ($this->isMissing($dppInfo[$field] ?? null)) {
                $errors[] = "DPPInfo.{$field} 為必填";
            }
        }

        foreach (self::PRODUCT_INFO_REQUIRED_FIELDS as $field) {
            if ($this->isMissing($productInfo[$field] ?? null)) {
                $errors[] = "ProductInfo.{$field} 為必填";
            }
        }

        if ($this->isEmptyArray($productInfo['SpecInfo'] ?? null)) {
            $errors[] = 'ProductInfo.SpecInfo 為必填(至少需一筆)';
        }

        $origIn = $dppInfo['OrigIn'] ?? null;
        if (!$this->isMissing($origIn) && Gs1Origin::tryFrom((string) $origIn) === null) {
            $errors[] = 'DPPInfo.OrigIn 代碼無效(需為 GS1ORIGIN 合法國別碼)';
        }

        foreach (self::DPP_INFO_MAX_LENGTHS as $field => $maxLength) {
            $value = (string) ($dppInfo[$field] ?? '');
            if (mb_strlen($value) > $maxLength) {
                $errors[] = "DPPInfo.{$field} 長度不得大於 {$maxLength} 碼";
            }
        }

        foreach (self::PRODUCT_INFO_MAX_LENGTHS as $field => $maxLength) {
            $value = (string) ($productInfo[$field] ?? '');
            if (mb_strlen($value) > $maxLength) {
                $errors[] = "ProductInfo.{$field} 長度不得大於 {$maxLength} 碼";
            }
        }

        $taric = (string) ($dppInfo['TARIC'] ?? '');
        $cccCode = (string) ($productInfo['CCCCode'] ?? '');
        if ($taric === '' && $cccCode === '') {
            $errors[] = 'DPPInfo.TARIC、ProductInfo.CCCCode 需擇一有值';
        }

        $duns = (string) ($dppInfo['UniqueFacilityIdentifierDUNS'] ?? '');
        $gln = (string) ($dppInfo['UniqueFacilityIdentifierGLN'] ?? '');
        if ($duns === '' && $gln === '') {
            $errors[] = 'DPPInfo.UniqueFacilityIdentifierDUNS、UniqueFacilityIdentifierGLN 需擇一有值';
        }

        return $errors;
    }

    // 掃描 DPP 陣列判斷本次文件是否含電池(DPPClass=1)項目；DPPClass 屬於 DPP 陣列項目而非
    // 共用區塊，故須另外掃描 entries 取得（update 時項目可能省略、沿用 $fallback）
    private function isBatteryDocument(array $document, ?array $fallback = null): bool
    {
        $entries = is_array($document['DPP'] ?? null) ? $document['DPP'] : [];

        foreach ($entries as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            $dppClass = $entry['DPPClass'] ?? $fallback['DPPClass'] ?? null;
            if ($dppClass !== null && (int) $dppClass === DppClass::Battery->value) {
                return true;
            }
        }

        return false;
    }

    // CFPValue/CFPEmissionUnit/CFPFunctionUnit 僅在 DPPClass 為電池(1)時才必填
    private function validateConditionalProductInfoFields(array $document, bool $isBattery, ?array $fallback = null): array
    {
        if (!$isBattery) {
            return [];
        }

        $productInfo = $document['ProductInfo'] ?? $fallback['ProductInfo'] ?? [];

        $errors = [];
        foreach (self::CFP_REQUIRED_FIELDS_WHEN_BATTERY as $field) {
            if ($this->isMissing($productInfo[$field] ?? null)) {
                $errors[] = "ProductInfo.{$field} 於 DPPClass=1(電池) 時為必填";
            }
        }

        return $errors;
    }

    // 檢查各共用區塊陣列中,採固定代碼表(enum/ParamGroup)的欄位：MandatoryCertification/
    // VoluntaryCertification 的 CertName、Material 的 MaterType 與巢狀 Material[].composition_type、
    // PEFInfo 的 ImpactCategory/LifeCycleStage；有提供值時才檢查代碼合法性,未提供則略過
    private function validateSectionArrayEnums(array $document, ?array $fallback = null): array
    {
        $errors = [];
        $errors = array_merge(
            $errors,
            $this->validateCertNameEnum($document, $fallback, 'MandatoryCertification', MCertName::class)
        );
        $errors = array_merge(
            $errors,
            $this->validateCertNameEnum($document, $fallback, 'VoluntaryCertification', VCertName::class)
        );

        $material = $document['Material'] ?? $fallback['Material'] ?? [];
        if (is_array($material)) {
            foreach ($material as $index => $item) {
                if (!is_array($item)) {
                    continue;
                }

                $materType = $item['MaterType'] ?? null;
                if (!$this->isMissing($materType) && !$this->matchesIntEnum($materType, MaterType::class)) {
                    $errors[] = "Material[{$index}].MaterType 代碼無效";
                }

                $nestedMaterials = is_array($item['Material'] ?? null) ? $item['Material'] : [];
                foreach ($nestedMaterials as $subIndex => $sub) {
                    if (!is_array($sub)) {
                        continue;
                    }

                    // 規格文件寫作 composition_type,範例檔(dpp_add_bettery_v1.0.json)實際鍵名為
                    // composition_Type,兩種鍵名皆接受,避免因大小寫落差誤判缺漏
                    $compositionType = $sub['composition_type'] ?? $sub['composition_Type'] ?? null;
                    if (!$this->isMissing($compositionType)
                        && !$this->matchesIntEnum($compositionType, CompositionType::class)
                    ) {
                        $errors[] = "Material[{$index}].Material[{$subIndex}].composition_type 代碼無效";
                    }
                }
            }
        }

        $pefInfo = $document['PEFInfo'] ?? $fallback['PEFInfo'] ?? [];
        if (is_array($pefInfo)) {
            foreach ($pefInfo as $index => $item) {
                if (!is_array($item)) {
                    continue;
                }

                $impactCategory = $item['ImpactCategory'] ?? null;
                if (!$this->isMissing($impactCategory) && !$this->matchesIntEnum($impactCategory, ImpactCategory::class)) {
                    $errors[] = "PEFInfo[{$index}].ImpactCategory 代碼無效";
                }

                $lifeCycleStage = $item['LifeCycleStage'] ?? null;
                if (!$this->isMissing($lifeCycleStage) && !$this->matchesIntEnum($lifeCycleStage, LifeCycleStage::class)) {
                    $errors[] = "PEFInfo[{$index}].LifeCycleStage 代碼無效";
                }
            }
        }

        return $errors;
    }

    // MandatoryCertification/VoluntaryCertification 陣列共用的 CertName 代碼檢查
    private function validateCertNameEnum(array $document, ?array $fallback, string $section, string $enumClass): array
    {
        $items = $document[$section] ?? $fallback[$section] ?? [];
        if (!is_array($items)) {
            return [];
        }

        $errors = [];
        foreach ($items as $index => $item) {
            if (!is_array($item)) {
                continue;
            }

            $certName = $item['CertName'] ?? null;
            if (!$this->isMissing($certName) && !$this->matchesIntEnum($certName, $enumClass)) {
                $errors[] = "{$section}[{$index}].CertName 代碼無效";
            }
        }

        return $errors;
    }

    // 檢查 Material 區塊的條件必填規則：
    // 1. DPPClass=電池(1) 時,Material 陣列須涵蓋 BATTERY_REQUIRED_MATER_TYPES 所列全部類別
    // 2. 巢狀 Material[].Material[] 項目依所屬(父層) MaterType 決定哪些欄位為必填(見
    //    MATERIAL_COMPOSITION_REQUIRED_WHEN),此規則與 DPPClass 無關
    // MaterType 代碼本身不合法的項目已由 validateSectionArrayEnums 標記錯誤,此處僅略過
    // 不列入涵蓋範圍/條件判斷,避免同一筆資料重複報錯
    private function validateMaterialConditionalFields(array $document, ?array $fallback, bool $isBattery): array
    {
        $material = $document['Material'] ?? $fallback['Material'] ?? [];
        if (!is_array($material)) {
            return [];
        }

        $errors = [];
        $presentMaterTypes = [];

        foreach ($material as $index => $item) {
            if (!is_array($item)) {
                continue;
            }

            $materType = $item['MaterType'] ?? null;
            if ($this->isMissing($materType) || !$this->matchesIntEnum($materType, MaterType::class)) {
                continue;
            }

            $materTypeCase = MaterType::from((int) $materType);
            $presentMaterTypes[$materTypeCase->value] = true;

            $nestedMaterials = is_array($item['Material'] ?? null) ? $item['Material'] : [];
            foreach ($nestedMaterials as $subIndex => $sub) {
                if (!is_array($sub)) {
                    continue;
                }

                foreach (self::MATERIAL_COMPOSITION_REQUIRED_WHEN as $field => $requiredForTypes) {
                    if (!in_array($materTypeCase, $requiredForTypes, true)) {
                        continue;
                    }

                    if ($this->isMissing($sub[$field] ?? null)) {
                        $errors[] = "Material[{$index}].Material[{$subIndex}].{$field} 於 MaterType="
                            . "{$materTypeCase->value}({$materTypeCase->labelZh()}) 時為必填";
                    }
                }
            }
        }

        if ($isBattery) {
            foreach (self::BATTERY_REQUIRED_MATER_TYPES as $requiredType) {
                if (!isset($presentMaterTypes[$requiredType->value])) {
                    $errors[] = "Material 缺少 MaterType={$requiredType->value}({$requiredType->labelZh()}) 之項目,"
                        . 'DPPClass=1(電池) 時為必填';
                }
            }
        }

        return $errors;
    }

    // 檢查 ProductInfo.SpecInfo[] 的 SpecInfo_Type 代碼合法性,並在 DPPClass=電池(1) 時依代碼
    // 決定 Details/Voltage/Chemistry 何者為必填：Battery20→Chemistry、Battery25→Voltage、
    // Battery26/Battery39→Details[].Temperature、其餘 Battery* 類型→Details。非電池文件僅
    // 檢查代碼合法性,不套用電池專屬的子結構必填規則
    private function validateSpecInfoFields(array $document, ?array $fallback, bool $isBattery): array
    {
        $productInfo = $document['ProductInfo'] ?? $fallback['ProductInfo'] ?? [];
        $specInfo = $productInfo['SpecInfo'] ?? null;
        if (!is_array($specInfo)) {
            return [];
        }

        $errors = [];
        foreach ($specInfo as $index => $item) {
            if (!is_array($item)) {
                continue;
            }

            $type = $item['SpecInfo_Type'] ?? null;
            if ($this->isMissing($type)) {
                continue;
            }

            $typeCase = SpecInfoType::tryFrom((string) $type);
            if ($typeCase === null) {
                $errors[] = "ProductInfo.SpecInfo[{$index}].SpecInfo_Type 代碼無效";
                continue;
            }

            if (!$isBattery) {
                continue;
            }

            if ($typeCase === SpecInfoType::Battery20) {
                if ($this->isEmptyArray($item['Chemistry'] ?? null)) {
                    $errors[] = "ProductInfo.SpecInfo[{$index}].Chemistry 於 SpecInfo_Type=Battery20 時為必填";
                }
                continue;
            }

            if ($typeCase === SpecInfoType::Battery25) {
                if ($this->isEmptyArray($item['Voltage'] ?? null)) {
                    $errors[] = "ProductInfo.SpecInfo[{$index}].Voltage 於 SpecInfo_Type=Battery25 時為必填";
                }
                continue;
            }

            $details = $item['Details'] ?? null;
            if ($this->isEmptyArray($details)) {
                $errors[] = "ProductInfo.SpecInfo[{$index}].Details 於 SpecInfo_Type={$typeCase->value} 時為必填";
                continue;
            }

            if (!in_array($typeCase, self::SPEC_INFO_TEMPERATURE_DETAIL_TYPES, true)) {
                continue;
            }

            foreach ($details as $detailIndex => $detail) {
                if (!is_array($detail)) {
                    continue;
                }

                if ($this->isEmptyArray($detail['Temperature'] ?? null)) {
                    $errors[] = "ProductInfo.SpecInfo[{$index}].Details[{$detailIndex}].Temperature 於"
                        . " SpecInfo_Type={$typeCase->value} 時為必填";
                }
            }
        }

        return $errors;
    }

    // DPP 陣列項目內,採固定代碼表(enum/ParamGroup)欄位的合法性檢查；$fallback 供 update 時
    // 沿用既有記錄的值一併檢查；回傳代碼不合法的欄位名稱清單（未提供的欄位不檢查，缺漏與否已由
    // missingRequiredFields 處理）
    private function invalidEnumFields(array $entry, ?array $fallback = null): array
    {
        $invalid = [];
        foreach (self::ENTRY_ENUM_FIELDS as $field => $enumClass) {
            $value = $entry[$field] ?? $fallback[$field] ?? null;
            if ($this->isMissing($value)) {
                continue;
            }

            if (!$this->matchesIntEnum($value, $enumClass)) {
                $invalid[] = $field;
            }
        }

        return $invalid;
    }

    // 檢查 $value 是否為 $enumClass（int-backed enum）的合法代碼；非數字（含轉型後失真的字串，如
    // "abc"）一律視為不合法，避免 (int) 轉型把無效輸入吃成剛好合法的 0
    private function matchesIntEnum(mixed $value, string $enumClass): bool
    {
        if (!is_int($value) && !(is_string($value) && is_numeric($value))) {
            return false;
        }

        return $enumClass::tryFrom((int) $value) !== null;
    }

    // 缺漏視為：欄位不存在、值為 null，或空字串；數值 0（如 DPPStatus=0）不視為缺漏
    private function isMissing(mixed $value): bool
    {
        return $value === null || $value === '';
    }

    // 供陣列/物件型欄位（如 SpecInfo、Chemistry、Voltage、Temperature）使用：非陣列或空陣列視為缺漏
    private function isEmptyArray(mixed $value): bool
    {
        return !is_array($value) || $value === [];
    }

    // 檢查 $fields 是否皆有值：$entry 優先，update 時未提供的欄位可由 $fallback（既有記錄）沿用；
    // 回傳缺漏的欄位名稱清單（無缺漏則為空陣列）
    private function missingRequiredFields(array $entry, array $fields, ?array $fallback = null): array
    {
        $missing = [];
        foreach ($fields as $field) {
            $value = $entry[$field] ?? $fallback[$field] ?? null;
            if ($this->isMissing($value)) {
                $missing[] = $field;
            }
        }

        return $missing;
    }

    // 檢查並就地正規化 $entry 內的日期欄位為 YYYY-MM-DD，回傳格式不合法的欄位名稱清單
    private function normalizeDateFields(array &$entry): array
    {
        $invalid = [];
        foreach (self::DATE_FIELDS as $field) {
            if (!array_key_exists($field, $entry)) {
                continue;
            }

            $normalized = $this->normalizeDate($entry[$field]);
            if ($normalized === false) {
                $invalid[] = $field;
                continue;
            }

            if ($normalized !== null) {
                $entry[$field] = $normalized;
            }
        }

        return $invalid;
    }

    // 空值視為未提供（不檢查）；YYYY-MM-DD 直接採用；其他可被解析的日期格式轉換為 YYYY-MM-DD；
    // 無法解析則回傳 false，由呼叫端視為驗證失敗
    private function normalizeDate(mixed $value): string|false|null
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_string($value)) {
            return false;
        }

        $value = trim($value);
        if ($value === '') {
            return null;
        }

        $strict = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        if ($strict !== false && $strict->format('Y-m-d') === $value) {
            return $value;
        }

        try {
            $parsed = new DateTimeImmutable($value);
        } catch (Exception) {
            return false;
        }

        return $parsed->format('Y-m-d');
    }

    private function now(): string
    {
        return (new DateTimeImmutable())->format(DATE_ATOM);
    }

    private function recordPath(string $uid): string
    {
        return $this->recordsDir . '/' . $uid . '.json';
    }

    private function writeRecord(array $record): void
    {
        file_put_contents(
            $this->recordPath($record['UID']),
            json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }

    private function readIndex(): array
    {
        $handle = fopen($this->indexFile, 'r');
        flock($handle, LOCK_SH);
        $content = stream_get_contents($handle);
        flock($handle, LOCK_UN);
        fclose($handle);

        $index = json_decode((string) $content, true);

        return is_array($index) ? $index : [];
    }

    // 讀取、修改、寫回 index.json 皆在同一個檔案鎖區間內完成,避免併發寫入互相覆蓋
    private function upsertIndex(array $record): void
    {
        $handle = fopen($this->indexFile, 'c+');
        flock($handle, LOCK_EX);

        $content = stream_get_contents($handle);
        $index = json_decode((string) $content, true);
        if (!is_array($index)) {
            $index = [];
        }

        // 摘要對齊前台列表(DPPListResponse)顯示所需欄位,Model/ProdName 取自 ProductInfo 共用區塊
        $index[$record['UID']] = [
            'UID' => $record['UID'],
            'DPPClass' => $record['DPPClass'],
            'DPPSubClass' => $record['DPPSubClass'],
            'SerialNo' => $record['SerialNo'],
            'Model' => $record['ProductInfo']['Model'] ?? null,
            'ProdName' => $record['ProductInfo']['ProdName'] ?? null,
            'PassportStartDate' => $record['PassportStartDate'],
            'DPPStatus' => $record['DPPStatus'],
            'createdAt' => $record['createdAt'],
            'updatedAt' => $record['updatedAt'],
        ];

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($index, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($handle);
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}
