<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeamCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'role',
        'is_active',
        'center_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function center(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class, 'center_id');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(User::class, 'team_code_id');
    }
}
