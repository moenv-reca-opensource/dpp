<?php

use App\Controller\Backstage\DppController;
use App\Controller\Backstage\RecycleController;
use App\Controller\Backstage\RepairController;
use App\Controller\Frontstage\AuthController;
use App\Controller\Frontstage\ProductController as FrontstageProductController;
use App\Service\DppRepository;
use App\Service\RecycleRepository;
use App\Service\RepairRepository;

// 供後台管理用途,需要登入(session)才能使用,路徑比照正式版慣例不加額外前綴
$app->group('/api/dpp', function ($group) {
    $dppRepository = new DppRepository();
    $repairRepository = new RepairRepository($dppRepository);
    $recycleRepository = new RecycleRepository($dppRepository);
    $dppController = new DppController($dppRepository, $repairRepository, $recycleRepository);
    $repairController = new RepairController($repairRepository);
    $recycleController = new RecycleController($recycleRepository);

    $group->post('.list', [$dppController, 'list']);
    $group->post('.import', [$dppController, 'import']);
    $group->post('.add', [$dppController, 'add']);
    $group->post('.modify', [$dppController, 'modify']);
    $group->post('.info', [$dppController, 'info']);
    $group->post('.qrcode', [$dppController, 'qrcode']);
    $group->post('.import_repair', [$repairController, 'import']);
    $group->post('.import_recycle', [$recycleController, 'import']);
})->add(new \App\Middleware\AuthMiddleware($app->getResponseFactory()));

// 供單一產品檢視與登入登出用 API,不需登入即可使用,路徑比照正式版慣例加上 /api/frontstage 前綴
$app->group('/api/frontstage/dpp', function ($group) {
    $dppRepository = new DppRepository();
    $productController = new FrontstageProductController(
        $dppRepository,
        new RepairRepository($dppRepository),
        new RecycleRepository($dppRepository)
    );

    $group->post('.info', [$productController, 'show']);
    $group->post('.qrcode', [$productController, 'qrcode']);
});

$app->group('/api/frontstage/auth', function ($group) {
    $authController = new AuthController();

    $group->post('/login', [$authController, 'login']);
    $group->post('/logout', [$authController, 'logout']);
});
