<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvaluationTemplate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'type',
        'schedule_type',
        'start_date',
        'end_date',
        'total_score',
        'is_active',
        'version',
    ];

    protected $casts = [
        'type' => 'string',
        'schedule_type' => 'string',
        'start_date' => 'date',
        'end_date' => 'date',
        'total_score' => 'integer',
        'is_active' => 'boolean',
        'version' => 'integer',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(EvaluationTemplateQuestion::class, 'template_id');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'template_id');
    }
}
