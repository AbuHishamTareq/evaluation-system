<?php

namespace App\Console\Commands;

use App\Features\RolesAndPermissions\Services\PermissionRegistryService;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('permissions:sync')]
#[Description('Sync the permissions table to match the PermissionRegistryService source of truth')]
class SyncPermissions extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(PermissionRegistryService $registry): int
    {
        $registeredPermissions = $registry->getAll();
        $syncedCount = 0;
        $deactivatedCount = 0;

        // Insert or update permissions from the registry
        foreach ($registeredPermissions as $name => $description) {
            $permission = Permission::withTrashed()->firstOrNew(['name' => $name]);
            $permission->description = $description;
            $permission->guard_name = 'web';

            // Restore if soft-deleted
            if ($permission->trashed()) {
                $permission->restore();
            }

            $permission->save();
            $syncedCount++;
        }

        // Soft-delete permissions that are in the DB but no longer in the registry
        $registeredNames = array_keys($registeredPermissions);
        $orphaned = Permission::whereNotIn('name', $registeredNames)
            ->whereNull('deleted_at')
            ->get();

        foreach ($orphaned as $permission) {
            $permission->delete();
            $deactivatedCount++;
        }

        // Sync all permissions to Super Admin role
        $superAdmin = Role::where('name', 'Super Admin')->first();
        if ($superAdmin) {
            $allPermissionIds = Permission::pluck('id');
            $superAdmin->permissions()->sync($allPermissionIds);
            $this->info("Super Admin role updated with all {$allPermissionIds->count()} permissions.");
        }

        $this->info("Synced {$syncedCount} permissions from registry.");
        if ($deactivatedCount > 0) {
            $this->warn("Soft-deleted {$deactivatedCount} orphaned permissions.");
        }
        $this->info('Permissions sync completed successfully.');

        return Command::SUCCESS;
    }
}
