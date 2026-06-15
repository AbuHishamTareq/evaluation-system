<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Zone extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'parent_id',
        'level',
        'description',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Zone::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Zone::class, 'parent_id')->with('children');
    }

    public function centers(): HasMany
    {
        return $this->hasMany(PhcCenter::class);
    }

    public function getHierarchyAttribute(): array
    {
        $hierarchy = [];
        $current = $this;

        while ($current) {
            array_unshift($hierarchy, [
                'id' => $current->id,
                'name' => $current->name,
                'level' => $current->level,
            ]);
            $current = $current->parent;
        }

        return $hierarchy;
    }
}
