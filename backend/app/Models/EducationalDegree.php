<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EducationalDegree extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function staff(): BelongsToMany
    {
        return $this->belongsToMany(Staff::class, 'staff_educational_degree')
            ->withPivot('institution', 'year_obtained')
            ->withTimestamps();
    }
}
