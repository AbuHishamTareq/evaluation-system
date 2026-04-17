<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'tenant_id', 'phc_center_id', 'reporter_id', 'assigned_to_id', 'staff_profile_id',
    'type', 'severity', 'title', 'description',
    'root_cause', 'contributing_factors', 'corrective_action',
    'responsible_owner_id', 'due_date', 'status', 'resolved_at',
])]
class IncidentReport extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPE_MEDICATION = 'medication';

    public const TYPE_STORAGE = 'storage';

    public const TYPE_TREATMENT = 'treatment';

    public const TYPE_EQUIPMENT = 'equipment';

    public const TYPE_NEAR_MISS = 'near_miss';

    public const SEVERITY_LOW = 'low';

    public const SEVERITY_MEDIUM = 'medium';

    public const SEVERITY_HIGH = 'high';

    public const SEVERITY_CRITICAL = 'critical';

    public const STATUS_OPEN = 'open';

    public const STATUS_INVESTIGATING = 'investigating';

    public const STATUS_ACTION_PLAN = 'action_plan';

    public const STATUS_RESOLVED = 'resolved';

    public const STATUS_CLOSED = 'closed';

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'resolved_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function phcCenter(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }

    public function staffProfile(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class);
    }

    public function responsibleOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_owner_id');
    }

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_OPEN;
    }

    public function isInvestigating(): bool
    {
        return $this->status === self::STATUS_INVESTIGATING;
    }

    public function isCritical(): bool
    {
        return $this->severity === self::SEVERITY_CRITICAL;
    }

    public function isHighSeverity(): bool
    {
        return in_array($this->severity, [self::SEVERITY_HIGH, self::SEVERITY_CRITICAL]);
    }

    public function requiresActionPlan(): bool
    {
        return in_array($this->severity, [self::SEVERITY_HIGH, self::SEVERITY_CRITICAL])
            && in_array($this->status, [self::STATUS_INVESTIGATING, self::STATUS_ACTION_PLAN]);
    }

    public function resolve(): bool
    {
        $this->status = self::STATUS_RESOLVED;
        $this->resolved_at = now();

        return $this->save();
    }

    public function close(): bool
    {
        $this->status = self::STATUS_CLOSED;

        return $this->save();
    }

    public static function getTypes(): array
    {
        return [
            self::TYPE_MEDICATION => 'Medication Error',
            self::TYPE_STORAGE => 'Storage Issue',
            self::TYPE_TREATMENT => 'Treatment Error',
            self::TYPE_EQUIPMENT => 'Equipment Failure',
            self::TYPE_NEAR_MISS => 'Near Miss',
        ];
    }

    public static function getSeverities(): array
    {
        return [
            self::SEVERITY_LOW => 'Low',
            self::SEVERITY_MEDIUM => 'Medium',
            self::SEVERITY_HIGH => 'High',
            self::SEVERITY_CRITICAL => 'Critical',
        ];
    }

    public static function getStatuses(): array
    {
        return [
            self::STATUS_OPEN => 'Open',
            self::STATUS_INVESTIGATING => 'Investigating',
            self::STATUS_ACTION_PLAN => 'Action Plan',
            self::STATUS_RESOLVED => 'Resolved',
            self::STATUS_CLOSED => 'Closed',
        ];
    }
}
