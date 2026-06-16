<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'sub_category_id',
        'question_text',
        'description',
        'question_type',
        'options',
        'weight',
        'max_score',
        'is_required',
        'is_active',
        'version',
    ];

    protected $casts = [
        'options' => 'array',
        'weight' => 'integer',
        'max_score' => 'integer',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'version' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(QuestionCategory::class, 'category_id');
    }

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(QuestionSubCategory::class, 'sub_category_id');
    }
}
