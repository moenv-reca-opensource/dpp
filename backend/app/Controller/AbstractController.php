<?php

namespace App\Controller;

use App\Exception\ValidationException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// 提供所有 Controller 共用的輸入清理與輸出封裝，個別 Controller 只需專注在業務邏輯
abstract class AbstractController
{
    // 統一 JSON 輸出格式，並用 RESTful 狀態碼標示結果（200/201 等交由呼叫端指定）
    protected function json(Response $response, mixed $data, int $status = 200): Response
    {
        $body = [
            'success' => true,
            'code' => $status,
            's_message' => '0000',
            'payload' => $data,
        ];
        $response->getBody()->write(json_encode($body, JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    protected function getJsonBody(Request $request): array
    {
        $body = $request->getParsedBody();

        return is_array($body) ? $body : [];
    }

    // 檢查必填欄位是否存在且非空，未通過則擲出 ValidationException（422）。
    // 之後 add/modify 若需新增欄位檢查，於各 Controller 呼叫處增加欄位名稱即可。
    protected function requireFields(array $body, array $fields): void
    {
        $missing = [];
        foreach ($fields as $field) {
            if (empty($body[$field])) {
                $missing[] = $field;
            }
        }

        if ($missing !== []) {
            throw new ValidationException(implode(', ', $missing) . ' is required', $missing);
        }
    }

    // 將外部輸入轉為字串，非 scalar（如陣列、null）則回傳預設值，避免非預期型別流入業務邏輯
    protected function sanitizeString(mixed $value, string $default = ''): string
    {
        return is_scalar($value) ? (string) $value : $default;
    }
}
