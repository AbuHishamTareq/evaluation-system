<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicationEvaluationTemplateCriterion extends Model
{
    protected $fillable = [
        'template_id',
        'name',
        'description',
        'type',
        'weight',
        'order',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(MedicationEvaluationTemplate::class, 'template_id');
    }
}
