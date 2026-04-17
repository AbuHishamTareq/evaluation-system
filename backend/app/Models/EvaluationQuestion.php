<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['template_id', 'parent_id', 'order', 'question', 'question_ar', 'type', 'options', 'options_ar', 'is_required'])]
class EvaluationQuestion extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPE_MCQ = 'mcq';

    public const TYPE_MULTI_SELECT = 'multi_select';

    public const TYPE_RATING = 'rating';

    public const TYPE_ESSAY = 'essay';

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'options_ar' => 'array',
            'is_required' => 'boolean',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(EvaluationTemplate::class, 'template_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(EvaluationQuestion::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(EvaluationQuestion::class, 'parent_id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(EvaluationResponse::class, 'question_id');
    }

    public static function getTypes(): array
    {
        return [
            self::TYPE_MCQ => 'Multiple Choice',
            self::TYPE_MULTI_SELECT => 'Multi-Select',
            self::TYPE_RATING => 'Star Rating',
            self::TYPE_ESSAY => 'Essay',
        ];
    }
}
