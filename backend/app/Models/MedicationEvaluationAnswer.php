<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicationEvaluationAnswer extends Model
{
    protected $fillable = [
        'evaluation_id',
        'template_medication_id',
        'criterion_id',
        'answer_value',
        'score',
        'max_score',
        'comment',
    ];

    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(MedicationEvaluation::class, 'evaluation_id');
    }

    public function templateMedication(): BelongsTo
    {
        return $this->belongsTo(MedicationEvaluationTemplateMedication::class, 'template_medication_id');
    }

    public function criterion(): BelongsTo
    {
        return $this->belongsTo(MedicationEvaluationTemplateCriterion::class, 'criterion_id');
    }
}
