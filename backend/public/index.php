<?php

require_once __DIR__ . "/../vendor/autoload.php";

session_start();

use App\Handler\JsonErrorHandler;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

// Create Slim app object
$app = AppFactory::create();
$app->addBodyParsingMiddleware();

// 統一攔截所有路由/Controller 拋出的例外（含 Slim 內建的 404/405），轉為 JSON 錯誤格式回傳
$displayErrorDetails = filter_var(getenv('APP_DEBUG'), FILTER_VALIDATE_BOOLEAN);
$errorMiddleware = $app->addErrorMiddleware($displayErrorDetails, true, true);
$errorMiddleware->setDefaultErrorHandler(new JsonErrorHandler($app->getResponseFactory()));

// Add default routes
$app->redirect('/', '/index', 302);

$app->get('/index', function (Request $request, Response $response, array $args) {
    $response->getBody()->write('Digital Passport Backend is running.');
    return $response;
});

// Auto load project routes
$files = glob(__DIR__ . '/../routes/' . '*.php');
foreach ($files as $file) {
    require_once($file);
}

$app->run();
