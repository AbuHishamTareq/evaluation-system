<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\Cache;

trait CachesIndex
{
    protected function clearIndexCache(): void
    {
        if (! property_exists($this, 'cachePrefix')) {
            return;
        }

        $versionKey = static::$cachePrefix.'index:version';
        Cache::put($versionKey, now()->timestamp, now()->addDays(7));
    }

    protected function getIndexCacheKey(string $filtersKey): string
    {
        if (! property_exists($this, 'cachePrefix')) {
            return 'default:'.$filtersKey;
        }

        $versionKey = static::$cachePrefix.'index:version';
        $version = Cache::get($versionKey, 0);

        return static::$cachePrefix.':v'.$version.':'.$filtersKey;
    }
}
