<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appended;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Appended(['users_count'])]
class Role extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'description', 'guard_name'];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_role');
    }

    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->where('name', $permission)->exists();
    }

    public function getUsersCountAttribute(): int
    {
        return $this->users()->count();
    }
}
