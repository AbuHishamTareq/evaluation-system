<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeamBasedCode extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'role',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function phcCenters(): BelongsToMany
    {
        return $this->belongsToMany(PhcCenter::class, 'phc_center_team_based_code')
            ->withTimestamps();
    }
}
