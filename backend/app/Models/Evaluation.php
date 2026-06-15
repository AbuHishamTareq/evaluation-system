<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Evaluation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'template_id',
        'phc_center_id',
        'staff_id',
        'evaluator_id',
        'status',
        'total_score',
        'max_score',
        'percentage',
        'started_at',
        'completed_at',
        'notes',
        'submitted_by',
    ];

    protected $casts = [
        'status' => 'string',
        'total_score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(EvaluationTemplate::class, 'template_id');
    }

    public function center(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class, 'phc_center_id');
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(EvaluationAnswer::class, 'evaluation_id');
    }
}
