<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medication extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'strength',
        'form',
        'unit',
        'category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function phcMedications(): HasMany
    {
        return $this->hasMany(PhcMedication::class, 'medication_id');
    }

    public function evaluationAnswers(): HasMany
    {
        return $this->hasMany(EvaluationAnswer::class, 'medication_id');
    }
}
