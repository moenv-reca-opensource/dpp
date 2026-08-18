<?php

namespace App\Handler;

use App\Exception\ApiException;
use App\Exception\ValidationException;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Interfaces\ErrorHandlerInterface;
use Throwable;

// 統一攔截 Slim 路由分派過程中拋出的例外（含 App\Exception\ApiException 與其他未預期的
// Throwable），一律整理成固定的 JSON 錯誤格式回傳，讓 Controller 不需自行 try/catch。
class JsonErrorHandler implements ErrorHandlerInterface
{
    public function __construct(private readonly ResponseFactoryInterface $responseFactory)
    {
    }

    public function __invoke(
        Request $request,
        Throwable $exception,
        bool $displayErrorDetails,
        bool $logErrors,
        bool $logErrorDetails
    ): Response {
        if ($logErrors) {
            error_log(sprintf(
                '[%s] %s in %s:%d',
                get_class($exception),
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));
        }

        $statusCode = $this->resolveStatusCode($exception);
        $message = $exception->getMessage() !== '' ? $exception->getMessage() : 'Internal Server Error';

        $payload = [];
        if ($exception instanceof ValidationException && $exception->getFields() !== []) {
            $payload['fields'] = $exception->getFields();
        }
        if ($displayErrorDetails) {
            $payload['exception'] = get_class($exception);
        }

        $body = [
            'success' => false,
            'code' => $statusCode,
            's_message' => $message,
            'payload' => $payload !== [] ? $payload : null,
        ];

        $response = $this->responseFactory->createResponse($statusCode);
        $response->getBody()->write(json_encode($body, JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json');
    }

    // 應用層的 ApiException 自帶狀態碼；Slim 內建的 HttpException（404、405 等）則透過
    // getCode() 帶出狀態碼；其他未預期例外一律視為 500，避免洩漏內部錯誤細節。
    private function resolveStatusCode(Throwable $exception): int
    {
        if ($exception instanceof ApiException) {
            return $exception->getStatusCode();
        }

        $code = $exception->getCode();

        return $code >= 400 && $code <= 599 ? $code : 500;
    }
}
