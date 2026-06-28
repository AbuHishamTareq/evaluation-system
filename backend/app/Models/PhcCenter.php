<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PhcCenter extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'zone_id',
        'classification',
        'address',
        'latitude',
        'longitude',
        'region',
        'phone',
        'email',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'staff_count',
    ];

    public function getStaffCountAttribute(): int
    {
        // Use pre-loaded withCount value if available (avoids N+1)
        if (array_key_exists('staff_count', $this->attributes)) {
            return (int) $this->attributes['staff_count'];
        }

        return $this->staff()->where('is_active', true)->count();
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'phc_center_id');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class, 'phc_center_id');
    }

    public function medicationEvaluations(): HasMany
    {
        return $this->hasMany(MedicationEvaluation::class, 'phc_center_id');
    }

    public function phcMedications(): HasMany
    {
        return $this->hasMany(PhcMedication::class, 'phc_center_id');
    }

    public function teamCodes(): HasMany
    {
        return $this->hasMany(TeamCode::class, 'center_id');
    }
}
