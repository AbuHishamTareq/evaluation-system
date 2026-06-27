<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicationEvaluationTemplateMedication extends Model
{
    protected $fillable = [
        'template_id',
        'medication_id',
        'recommended_quantity',
        'allocation_location',
        'order',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(MedicationEvaluationTemplate::class, 'template_id');
    }

    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class, 'medication_id');
    }
}
