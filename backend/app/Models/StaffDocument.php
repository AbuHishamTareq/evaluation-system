<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class StaffDocument extends Model
{
    protected $fillable = [
        'staff_id',
        'name',
        'file_path',
        'file_type',
        'file_size',
    ];

    protected $appends = ['url'];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
}
