<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PhcMedication extends Model
{
    use SoftDeletes;

    protected $table = 'phc_medication';

    protected $fillable = [
        'phc_center_id',
        'medication_id',
        'recommended_quantity',
        'current_stock',
        'allocation_location',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'recommended_quantity' => 'decimal:2',
        'current_stock' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function phcCenter(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class, 'phc_center_id');
    }

    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class, 'medication_id');
    }
}
