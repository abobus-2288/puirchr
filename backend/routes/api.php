<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\TestResultController;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });
    // Public read endpoints
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
    Route::apiResource('tests', TestController::class)->only(['index', 'show']);

    // Authenticated user endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('tests/{test}/start', [TestResultController::class, 'startTest']);
        Route::post('test-results/{testResult}/submit', [TestResultController::class, 'submitAnswers']);
        Route::get('test-results/{testResult}', [TestResultController::class, 'getResult']);
        Route::get('my-test-results', [TestResultController::class, 'getUserResults']);
    });

    // Admin-only write endpoints
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('tests', TestController::class)->only(['store', 'update', 'destroy']);
    });
});
