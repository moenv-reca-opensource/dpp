<?php

namespace App\Controller\Bff;

use App\Controller\AbstractController;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ProductController extends AbstractController
{
    // TODO: 依後台管理需求新增實際邏輯（如產品管理、使用者管理等）
    public function list(Request $request, Response $response): Response
    {
        return $this->json($response, []);
    }
}
