<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MedicationEvaluation extends Model
{
    protected $fillable = [
        'template_id',
        'phc_center_id',
        'evaluator_id',
        'status',
        'started_at',
        'completed_at',
        'notes',
        'total_score',
        'max_score',
        'percentage',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(MedicationEvaluationTemplate::class, 'template_id');
    }

    public function phcCenter(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class, 'phc_center_id');
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(MedicationEvaluationAnswer::class, 'evaluation_id');
    }
}
