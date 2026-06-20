<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationTemplateQuestion extends Model
{
    protected $fillable = [
        'template_id',
        'question_id',
        'order',
        'weight',
        'is_medication_check',
    ];

    protected $casts = [
        'order' => 'integer',
        'weight' => 'integer',
        'is_medication_check' => 'boolean',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(EvaluationTemplate::class, 'template_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
