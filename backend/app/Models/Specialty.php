<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['medical_field_id', 'name', 'name_ar', 'code', 'is_active'])]
class Specialty extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function medicalField(): BelongsTo
    {
        return $this->belongsTo(MedicalField::class);
    }

    public function shcCategories(): HasMany
    {
        return $this->hasMany(ShcCategory::class);
    }
}
