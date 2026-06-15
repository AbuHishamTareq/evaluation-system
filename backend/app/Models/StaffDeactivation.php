<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffDeactivation extends Model
{
    protected $fillable = [
        'staff_id',
        'deactivation_reason',
        'deactivation_notes',
        'deactivated_at',
        'reactivated_at',
        'reactivation_notes',
    ];

    protected $casts = [
        'deactivated_at' => 'datetime',
        'reactivated_at' => 'datetime',
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }
}
