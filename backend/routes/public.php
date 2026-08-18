<?php

use App\Controller\Public\AuthController;
use App\Controller\Public\ProductController;
use App\Service\DppRepository;

// 供單一產品檢視用 API 與使用者登入登出，不需登入即可使用
$app->group('/api/public', function ($group) {
    $productController = new ProductController(new DppRepository());
    $authController = new AuthController();

    $group->get('/products/{id}', [$productController, 'show']);
    $group->get('/products/{id}/qrcode', [$productController, 'qrcode']);

    $group->post('/auth/login', [$authController, 'login']);
    $group->post('/auth/logout', [$authController, 'logout']);
});
