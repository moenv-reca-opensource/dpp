<?php

namespace App\Controller\Frontstage;

use App\Controller\AbstractController;
use App\Exception\UnauthorizedException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// 帳密由容器啟動時的環境變數（.env）提供，僅支援單一管理者帳號。
// 因專案為開源性質，以下限制無法透過程式強制：
// 1. .env 內密碼是否已 hash 由部署者自行決定與負責，本專案僅能做明文/雜湊值的字串比對
// 2. 僅單一管理者帳號，沒有多使用者、無角色權限機制
// 3. 密碼輪替須重新啟動容器才會生效（環境變數於容器啟動時載入）
class AuthController extends AbstractController
{
    public function login(Request $request, Response $response): Response
    {
        $body = $this->getJsonBody($request);
        $username = $this->sanitizeString($body['username'] ?? '');
        $password = $this->sanitizeString($body['password'] ?? '');

        $adminUsername = (string) getenv('ADMIN_USERNAME');
        $adminPassword = (string) getenv('ADMIN_PASSWORD');

        $authenticated = $adminUsername !== '' && $adminPassword !== ''
            && hash_equals($adminUsername, $username)
            && hash_equals($adminPassword, $password);

        if (!$authenticated) {
            throw new UnauthorizedException('Invalid credentials');
        }

        $_SESSION['user'] = $username;

        return $this->json($response, ['ok' => true]);
    }

    public function logout(Request $request, Response $response): Response
    {
        unset($_SESSION['user']);

        return $this->json($response, ['ok' => true]);
    }
}
