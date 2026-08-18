<?php

namespace App\Service;

use App\Enum\RepairType;
use DateTimeImmutable;
use Exception;

// 維修紀錄以檔案儲存(專案暫無 DB),每筆護照(UID)可累積多次匯入的維修紀錄:
// - storage/dpp/repair-records/{UID}.json 為該護照全部維修紀錄的陣列
//
// dpp.import_repair 收到的文件格式同 storage/dpp/dpp_add_repair_v1.0.json 範例:陣列每個
// 元素為一次維修作業,對應既有護照的 UID,repair_info[] 為該次維修的元件明細。比照
// DppRepository::create() 的批次處理方式,每個元素各自獨立驗證與寫入,單一元素(UID 查無
// 護照、必填缺漏、代碼表不合法等)驗證失敗不影響其餘元素的匯入。
class RepairRepository
{
    private const ENTRY_REQUIRED_FIELDS = ['repair_date', 'repair_delivery_date'];
    private const ENTRY_DATE_FIELDS = ['repair_date', 'repair_delivery_date'];
    private const INFO_REQUIRED_FIELDS = ['repair_type', 'component_name', 'action_date', 'action_area'];

    private string $recordsDir;

    public function __construct(private readonly DppRepository $dppRepository, ?string $storageDir = null)
    {
        $storageDir = $storageDir ?? __DIR__ . '/../../storage/dpp';
        $this->recordsDir = $storageDir . '/repair-records';

        if (!is_dir($this->recordsDir)) {
            mkdir($this->recordsDir, 0775, true);
        }
    }

    public function findByUid(string $uid): array
    {
        $path = $this->recordPath($uid);
        if (!file_exists($path)) {
            return [];
        }

        $records = json_decode((string) file_get_contents($path), true);

        return is_array($records) ? $records : [];
    }

    // $document 為陣列,每個元素代表一次維修作業(見 dpp_add_repair_v1.0.json 範例)
    public function importBatch(array $document): array
    {
        $imported = [];
        $errors = [];

        foreach ($document as $index => $entry) {
            if (!is_array($entry)) {
                $errors[] = ['index' => $index, 'error' => 'entry must be an object'];
                continue;
            }

            $uid = (string) ($entry['UID'] ?? '');
            if ($uid === '' || $this->dppRepository->find($uid) === null) {
                $errors[] = ['index' => $index, 'UID' => $uid, 'error' => 'UID not found'];
                continue;
            }

            $missingFields = $this->missingRequiredFields($entry, self::ENTRY_REQUIRED_FIELDS);
            if ($missingFields !== []) {
                $errors[] = [
                    'index' => $index,
                    'UID' => $uid,
                    'error' => implode(', ', $missingFields) . ' is required',
                ];
                continue;
            }

            $invalidDateFields = $this->normalizeDateFields($entry, self::ENTRY_DATE_FIELDS);
            if ($invalidDateFields !== []) {
                $errors[] = [
                    'index' => $index,
                    'UID' => $uid,
                    'error' => implode(', ', $invalidDateFields) . ' must be a valid date',
                ];
                continue;
            }

            $repairInfo = is_array($entry['repair_info'] ?? null) ? $entry['repair_info'] : [];
            if ($repairInfo === []) {
                $errors[] = ['index' => $index, 'UID' => $uid, 'error' => 'repair_info is required'];
                continue;
            }

            $infoError = $this->validateAndNormalizeRepairInfo($repairInfo);
            if ($infoError !== null) {
                $errors[] = ['index' => $index, 'UID' => $uid, 'error' => $infoError];
                continue;
            }

            $record = [
                'repair_date' => $entry['repair_date'],
                'repair_delivery_date' => $entry['repair_delivery_date'],
                'repair_info' => $repairInfo,
                'importedAt' => $this->now(),
            ];

            $this->appendRecord($uid, $record);
            $imported[] = ['UID' => $uid] + $record;
        }

        return ['imported' => $imported, 'errors' => $errors];
    }

    // 檢查 repair_info[] 各筆必填欄位、repair_type 代碼合法性,並就地正規化 action_date;
    // 回傳第一個錯誤訊息(無錯誤則為 null),沿用整批「單一元素驗證失敗即整筆略過」的一致性
    private function validateAndNormalizeRepairInfo(array &$repairInfo): ?string
    {
        foreach ($repairInfo as $index => &$item) {
            if (!is_array($item)) {
                return "repair_info[{$index}] must be an object";
            }

            $missing = $this->missingRequiredFields($item, self::INFO_REQUIRED_FIELDS);
            if ($missing !== []) {
                return "repair_info[{$index}]: " . implode(', ', $missing) . ' is required';
            }

            if (!$this->matchesIntEnum($item['repair_type'], RepairType::class)) {
                return "repair_info[{$index}].repair_type 代碼無效";
            }

            $normalizedDate = $this->normalizeDate($item['action_date']);
            if ($normalizedDate === false) {
                return "repair_info[{$index}].action_date must be a valid date";
            }
            if ($normalizedDate !== null) {
                $item['action_date'] = $normalizedDate;
            }
        }

        return null;
    }

    // 缺漏視為：欄位不存在、值為 null，或空字串
    private function isMissing(mixed $value): bool
    {
        return $value === null || $value === '';
    }

    private function missingRequiredFields(array $entry, array $fields): array
    {
        $missing = [];
        foreach ($fields as $field) {
            if ($this->isMissing($entry[$field] ?? null)) {
                $missing[] = $field;
            }
        }

        return $missing;
    }

    // 檢查 $value 是否為 $enumClass（int-backed enum）的合法代碼；非數字一律視為不合法
    private function matchesIntEnum(mixed $value, string $enumClass): bool
    {
        if (!is_int($value) && !(is_string($value) && is_numeric($value))) {
            return false;
        }

        return $enumClass::tryFrom((int) $value) !== null;
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

    private function normalizeDateFields(array &$entry, array $fields): array
    {
        $invalid = [];
        foreach ($fields as $field) {
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

    private function now(): string
    {
        return (new DateTimeImmutable())->format(DATE_ATOM);
    }

    private function recordPath(string $uid): string
    {
        return $this->recordsDir . '/' . $uid . '.json';
    }

    // 累加寫入:同一 UID 可能多次匯入維修紀錄,新記錄附加於既有陣列之後,不覆蓋歷史紀錄
    private function appendRecord(string $uid, array $record): void
    {
        $handle = fopen($this->recordPath($uid), 'c+');
        flock($handle, LOCK_EX);

        $content = stream_get_contents($handle);
        $records = json_decode((string) $content, true);
        if (!is_array($records)) {
            $records = [];
        }

        $records[] = $record;

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($handle);
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}
