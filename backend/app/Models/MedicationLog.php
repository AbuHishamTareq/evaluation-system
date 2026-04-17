<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'medication_batch_id', 'patient_id', 'prescriber_id', 'dispenser_id',
    'administrator_id', 'verifier_id', 'step', 'quantity', 'notes', 'completed_at',
])]
class MedicationLog extends Model
{
    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\SoftDeletes;

    public const STEP_PRESCRIBED = 'prescribed';

    public const STEP_DISPENSED = 'dispensed';

    public const STEP_ADMINISTERED = 'administered';

    public const STEP_VERIFIED = 'verified';

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function medicationBatch(): BelongsTo
    {
        return $this->belongsTo(MedicationBatch::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class, 'patient_id');
    }

    public function prescriber(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prescriber_id');
    }

    public function dispenser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dispenser_id');
    }

    public function administrator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'administrator_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verifier_id');
    }

    public function isComplete(): bool
    {
        return $this->step === self::STEP_VERIFIED;
    }

    public static function getSteps(): array
    {
        return [
            self::STEP_PRESCRIBED => 'Prescribed',
            self::STEP_DISPENSED => 'Dispensed',
            self::STEP_ADMINISTERED => 'Administered',
            self::STEP_VERIFIED => 'Verified',
        ];
    }
}
