<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (app()->isProduction()) {
            ini_set('max_execution_time', '30');
        }

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        RateLimiter::for('api', function (Request $request) {
            $limit = $request->user()?->isAdmin() ? 300 : 60;

            return Limit::perMinute($limit)->by($request->user()?->id ?? $request->ip());
        });

        RateLimiter::for('analytics', function (Request $request) {
            $limit = $request->user()?->isAdmin() ? 120 : 30;

            return Limit::perMinute($limit)->by($request->user()?->id ?? $request->ip());
        });

        RateLimiter::for('exports', function (Request $request) {
            $limit = $request->user()?->isAdmin() ? 20 : 5;

            return Limit::perMinute($limit)->by($request->user()?->id ?? $request->ip());
        });
    }
}
