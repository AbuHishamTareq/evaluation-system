<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationAnswer extends Model
{
    protected $fillable = [
        'evaluation_id',
        'question_id',
        'answer_text',
        'answer_yes_no',
        'answer_rating',
        'answer_multiple_choice',
        'score',
        'max_score',
        'evidence_path',
        'comment',
    ];

    protected $casts = [
        'answer_rating' => 'integer',
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
    ];

    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(Evaluation::class, 'evaluation_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
