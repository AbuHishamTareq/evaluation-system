<?php

namespace App\Providers;

use App\Models\PhcCenter;
use App\Models\Region;
use App\Models\TeamBasedCode;
use App\Policies\PhcCenterPolicy;
use App\Policies\TeamBasedCodePolicy;
use App\Policies\ZonePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Region::class, ZonePolicy::class);
        Gate::policy(PhcCenter::class, PhcCenterPolicy::class);
        Gate::policy(TeamBasedCode::class, TeamBasedCodePolicy::class);
    }
}
