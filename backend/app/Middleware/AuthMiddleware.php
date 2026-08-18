<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class AuthMiddleware implements MiddlewareInterface
{
    public function __construct(private ResponseFactoryInterface $responseFactory)
    {
    }

    public function process(Request $request, RequestHandler $handler): Response
    {
        // 實際帳密驗證邏輯位於 routes/public.php 的 /auth/login，此處僅檢查登入後寫入的 session 標記
        if (empty($_SESSION['user'] ?? null)) {
            $response = $this->responseFactory->createResponse(401);
            $response->getBody()->write(json_encode([
                'success' => false,
                'code' => 401,
                's_message' => 'Unauthorized',
                'payload' => null,
            ]));

            return $response->withHeader('Content-Type', 'application/json');
        }

        return $handler->handle($request);
    }
}
