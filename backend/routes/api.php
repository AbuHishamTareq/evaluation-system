<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Middleware\PermissionScope;
use App\Http\Middleware\TenancyScope;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

        Route::middleware(['throttle:60,1', TenancyScope::class])->group(function () {
            // Protected API routes with tenant isolation
            // Usage: ->middleware(PermissionScope::class.':users.view')
        });
    });
});
