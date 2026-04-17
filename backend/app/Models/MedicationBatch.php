<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'medication_id', 'phc_center_id', 'batch_number', 'quantity', 'alert_threshold',
    'manufacture_date', 'expiry_date', 'purchase_price', 'status',
])]
class MedicationBatch extends Model
{
    use SoftDeletes;

    public const STATUS_AVAILABLE = 'available';

    public const STATUS_LOW_STOCK = 'low_stock';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_RECALLED = 'recalled';

    protected function casts(): array
    {
        return [
            'manufacture_date' => 'date',
            'expiry_date' => 'date',
            'purchase_price' => 'decimal:2',
        ];
    }

    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }

    public function phcCenter(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(MedicationAlert::class, 'medication_batch_id');
    }

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->alert_threshold;
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->expiry_date
            && $this->expiry_date->diffInDays(now()) <= $days;
    }

    public static function getStatuses(): array
    {
        return [
            self::STATUS_AVAILABLE => 'Available',
            self::STATUS_LOW_STOCK => 'Low Stock',
            self::STATUS_EXPIRED => 'Expired',
            self::STATUS_RECALLED => 'Recalled',
        ];
    }
}
