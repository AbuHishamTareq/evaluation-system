<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'staff_profile_id', 'school_name', 'degree', 'field_of_study',
    'gpa', 'start_date', 'graduation_date', 'notes',
])]
class StaffEducation extends Model
{
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'graduation_date' => 'date',
        ];
    }

    public function staffProfile(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class);
    }
}
