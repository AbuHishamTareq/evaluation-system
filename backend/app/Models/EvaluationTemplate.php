<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['tenant_id', 'name', 'name_ar', 'description', 'description_ar', 'is_active'])]
class EvaluationTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function questions(): HasMany
    {
        return $this->hasMany(EvaluationQuestion::class, 'template_id')->orderBy('order');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'template_id');
    }

    public function getActiveQuestions(): HasMany
    {
        return $this->questions();
    }
}
