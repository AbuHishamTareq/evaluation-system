<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicationEvaluationTemplate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function medications(): HasMany
    {
        return $this->hasMany(MedicationEvaluationTemplateMedication::class, 'template_id');
    }

    public function criteria(): HasMany
    {
        return $this->hasMany(MedicationEvaluationTemplateCriterion::class, 'template_id');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(MedicationEvaluation::class, 'template_id');
    }
}
