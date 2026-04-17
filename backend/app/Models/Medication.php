<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['tenant_id', 'name', 'generic_name', 'brand_name', 'atc_code', 'form', 'strength', 'unit', 'storage_requirements'])]
class Medication extends Model
{
    use HasFactory, SoftDeletes;

    public const FORM_TABLET = 'tablet';

    public const FORM_CAPSULE = 'capsule';

    public const FORM_LIQUID = 'liquid';

    public const FORM_INJECTION = 'injection';

    public const FORM_CREAM = 'cream';

    public const FORM_OINTMENT = 'ointment';

    public const FORM_DROPS = 'drops';

    public const FORM_INHALER = 'inhaler';

    public const FORM_PATCH = 'patch';

    public const FORM_SUPPOSITORY = 'suppository';

    public const FORM_OTHER = 'other';

    protected function casts(): array
    {
        return [];
    }

    public function batches(): HasMany
    {
        return $this->hasMany(MedicationBatch::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(MedicationLog::class);
    }

    public static function getForms(): array
    {
        return [
            self::FORM_TABLET => 'Tablet',
            self::FORM_CAPSULE => 'Capsule',
            self::FORM_LIQUID => 'Liquid',
            self::FORM_INJECTION => 'Injection',
            self::FORM_CREAM => 'Cream',
            self::FORM_OINTMENT => 'Ointment',
            self::FORM_DROPS => 'Drops',
            self::FORM_INHALER => 'Inhaler',
            self::FORM_PATCH => 'Patch',
            self::FORM_SUPPOSITORY => 'Suppository',
            self::FORM_OTHER => 'Other',
        ];
    }
}
