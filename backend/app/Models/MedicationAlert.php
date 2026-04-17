<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'medication_batch_id', 'phc_center_id', 'type', 'title', 'message',
    'is_resolved', 'resolved_by_id', 'resolved_at',
])]
class MedicationAlert extends Model
{
    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\SoftDeletes;

    public const TYPE_LOW_STOCK = 'low_stock';

    public const TYPE_NEAR_EXPIRY = 'near_expiry';

    public const TYPE_EXPIRED = 'expired';

    public const TYPE_RECALL = 'recall';

    public const TYPE_ALLERGY_CONFLICT = 'allergy_conflict';

    public const TYPE_DUPLICATE_THERAPY = 'duplicate_therapy';

    protected function casts(): array
    {
        return [
            'is_resolved' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

    public function medicationBatch(): BelongsTo
    {
        return $this->belongsTo(MedicationBatch::class);
    }

    public function phcCenter(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class);
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_id');
    }

    public static function getTypes(): array
    {
        return [
            self::TYPE_LOW_STOCK => 'Low Stock',
            self::TYPE_NEAR_EXPIRY => 'Near Expiry',
            self::TYPE_EXPIRED => 'Expired',
            self::TYPE_RECALL => 'Recall',
            self::TYPE_ALLERGY_CONFLICT => 'Allergy Conflict',
            self::TYPE_DUPLICATE_THERAPY => 'Duplicate Therapy',
        ];
    }
}
