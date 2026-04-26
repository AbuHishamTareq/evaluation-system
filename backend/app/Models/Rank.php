<?php

namespace App\Models;

use App\Models\MedicalField;
use App\Models\Specialty;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'name_ar', 'code', 'medical_field_id', 'specialty_id', 'is_active'])]

class Rank extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function medicalField()
    {
        return $this->belongsTo(MedicalField::class);
    }

    public function specialty()
    {
        return $this->belongsTo(Specialty::class);
    }

    public function shcCategories(): HasMany
    {
        return $this->hasMany(ShcCategory::class);
    }
}
