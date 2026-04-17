<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['phc_center_id', 'name', 'name_ar', 'code', 'is_active'])]
class Department extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function phcCenter(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class);
    }
}