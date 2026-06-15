<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Staff extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'employee_id',
        'email',
        'phone',
        'phc_center_id',
        'user_id',
        'gender',
        'date_of_birth',
        'national_id',
        'nationality',
        'mobile',
        'address',
        'photo_path',
        'employment_type',
        'hire_date',
        'termination_date',
        'status',
        'is_active',
        'deactivation_reason',
        'deactivation_notes',
        'notes',
        'field_id',
        'specialty_id',
        'rank_id',
        'classification_category_id',
        'team_code_id',
        'department_id',
        'clinic_assignment_id',
        'professional_id',
        'scfhs_registration_no',
        'scfhs_issue_date',
        'scfhs_expiry_date',
        'malpractice_insurance_no',
        'malpractice_issue_date',
        'malpractice_expiry_date',
        'is_care_provider',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'hire_date' => 'date',
        'termination_date' => 'date',
        'is_active' => 'boolean',
        'is_care_provider' => 'boolean',
        'scfhs_issue_date' => 'date',
        'scfhs_expiry_date' => 'date',
        'malpractice_issue_date' => 'date',
        'malpractice_expiry_date' => 'date',
    ];

    protected $with = ['experiences', 'certifications', 'department', 'clinicAssignment', 'professional', 'latestDeactivation'];

    protected $appends = ['full_name', 'photo_url'];

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (! $this->photo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->photo_path);
    }

    public function center(): BelongsTo
    {
        return $this->belongsTo(PhcCenter::class, 'phc_center_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function teamCode(): BelongsTo
    {
        return $this->belongsTo(TeamCode::class, 'team_code_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function clinicAssignment(): BelongsTo
    {
        return $this->belongsTo(ClinicAssignment::class, 'clinic_assignment_id');
    }

    public function professional(): BelongsTo
    {
        return $this->belongsTo(Professional::class, 'professional_id');
    }

    public function educationalDegrees(): BelongsToMany
    {
        return $this->belongsToMany(EducationalDegree::class, 'staff_educational_degree')
            ->withPivot('institution', 'year_obtained', 'degree_field', 'gpa_type', 'gpa_value')
            ->withTimestamps();
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(StaffExperience::class);
    }

    public function certifications(): HasMany
    {
        return $this->hasMany(StaffCertification::class);
    }

    public function classificationField(): BelongsTo
    {
        return $this->belongsTo(Field::class, 'field_id');
    }

    public function classificationSpecialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class, 'specialty_id');
    }

    public function classificationRank(): BelongsTo
    {
        return $this->belongsTo(Rank::class, 'rank_id');
    }

    public function classificationCategory(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'classification_category_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(StaffDocument::class);
    }

    public function deactivations(): HasMany
    {
        return $this->hasMany(StaffDeactivation::class);
    }

    public function latestDeactivation(): HasOne
    {
        return $this->hasOne(StaffDeactivation::class)->latestOfMany('deactivated_at');
    }

    public function searchable(): array
    {
        return [
            'first_name',
            'middle_name',
            'last_name',
            'employee_id',
            'email',
            'phone',
        ];
    }

    public function scopeSearch($query, string $term): void
    {
        $query->where(function ($q) use ($term) {
            foreach ($this->searchable() as $column) {
                $q->orWhere($column, 'like', "%{$term}%");
            }
            $q->orWhereHas('department', fn ($q) => $q->where('name', 'like', "%{$term}%"));
            $q->orWhereHas('professional', fn ($q) => $q->where('name', 'like', "%{$term}%"));
        });
    }
}
