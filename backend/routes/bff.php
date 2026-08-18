<?php

use App\Controller\Bff\DppController;
use App\Controller\Bff\ProductController;
use App\Controller\Bff\RecycleController;
use App\Controller\Bff\RepairController;
use App\Service\DppRepository;
use App\Service\RecycleRepository;
use App\Service\RepairRepository;

// 供後台管理用途，需要登入（session）才能使用
$app->group('/api/bff', function ($group) {
    $productController = new ProductController();
    $dppRepository = new DppRepository();
    $repairRepository = new RepairRepository($dppRepository);
    $recycleRepository = new RecycleRepository($dppRepository);
    $dppController = new DppController($dppRepository, $repairRepository, $recycleRepository);
    $repairController = new RepairController($repairRepository);
    $recycleController = new RecycleController($recycleRepository);

    $group->get('/products', [$productController, 'list']);

    $group->post('/dpp.list', [$dppController, 'list']);
    $group->post('/dpp.import', [$dppController, 'import']);
    $group->post('/dpp.add', [$dppController, 'add']);
    $group->post('/dpp.modify', [$dppController, 'modify']);
    $group->post('/dpp.info', [$dppController, 'info']);
    $group->post('/dpp.qrcode', [$dppController, 'qrcode']);
    $group->post('/dpp.import_repair', [$repairController, 'import']);
    $group->post('/dpp.import_recycle', [$recycleController, 'import']);
})->add(new \App\Middleware\AuthMiddleware($app->getResponseFactory()));
