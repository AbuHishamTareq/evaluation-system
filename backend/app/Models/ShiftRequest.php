<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'requester_id', 'approver_id', 'original_shift_id', 'target_shift_id',
    'type', 'status', 'reason', 'approver_notes', 'decided_at',
])]
class ShiftRequest extends Model
{
    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\SoftDeletes;

    protected function casts(): array
    {
        return [
            'decided_at' => 'datetime',
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class, 'requester_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class, 'approver_id');
    }

    public function originalShift(): BelongsTo
    {
        return $this->belongsTo(Shift::class, 'original_shift_id');
    }

    public function targetShift(): BelongsTo
    {
        return $this->belongsTo(Shift::class, 'target_shift_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function approve(?string $notes = null): bool
    {
        $this->status = 'approved';
        $this->approver_notes = $notes;
        $this->decided_at = now();

        return $this->save();
    }

    public function reject(?string $notes = null): bool
    {
        $this->status = 'rejected';
        $this->approver_notes = $notes;
        $this->decided_at = now();

        return $this->save();
    }
}
