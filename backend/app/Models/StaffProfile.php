<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'user_id', 'zone_id', 'phc_center_id', 'department_id', 'employee_id',
    'first_name', 'last_name', 'first_name_ar', 'last_name_ar',
    'phone', 'email', 'national_id', 'birth_date', 'gender',
    'job_title', 'scfhs_license', 'scfhs_license_expiry',
    'malpractice_insurance', 'malpractice_expiry',
    'certifications', 'education', 'employment_status',
    'hire_date', 'termination_date',
])]
class StaffProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'scfhs_license_expiry' => 'date',
            'malpractice_expiry' => 'date',
            'hire_date' => 'date',
            'termination_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Region::class, 'zone_id');
    }

    public function phcCenter(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function educations(): HasMany
    {
        return $this->hasMany(StaffEducation::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(StaffCertificate::class);
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(StaffExperience::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function isActive(): bool
    {
        return $this->employment_status === 'active';
    }

    public function hasExpiringLicense(int $days = 30): bool
    {
        return $this->scfhs_license_expiry
            && $this->scfhs_license_expiry->diffInDays(now()) <= $days;
    }

    public function hasExpiringInsurance(int $days = 30): bool
    {
        return $this->malpractice_expiry
            && $this->malpractice_expiry->diffInDays(now()) <= $days;
    }

    public function isAdmin(): bool
    {
        return $this->user && $this->user->hasRole('Main Office');
    }

    public static function generateNextEmployeeId(): string
    {
        $last = self::orderBy('id', 'desc')->first();
        $next = $last ? intval(substr($last->employee_id, 3)) + 1 : 1;

        return 'EMP'.str_pad($next, 5, '0', STR_PAD_LEFT);
    }
}
