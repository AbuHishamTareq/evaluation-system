<?php

namespace App\Services\Security;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuditService
{
    public function log(
        string $event,
        string $description,
        ?Model $model = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null
    ): AuditLog {
        $data = [
            'event' => $event,
            'description' => $description,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model?->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'hash' => $this->generateHash($event, $description, $model),
        ];

        if (auth()->check()) {
            $data['user_id'] = auth()->id();
        }

        return AuditLog::create($data);
    }

    public function logCreated(Model $model, array $values, ?Request $request = null): AuditLog
    {
        return $this->log(
            'created',
            class_basename($model).' created',
            $model,
            null,
            $values,
            $request
        );
    }

    public function logUpdated(Model $model, array $oldValues, array $newValues, ?Request $request = null): AuditLog
    {
        return $this->log(
            'updated',
            class_basename($model).' updated',
            $model,
            $oldValues,
            $newValues,
            $request
        );
    }

    public function logDeleted(Model $model, array $values, ?Request $request = null): AuditLog
    {
        return $this->log(
            'deleted',
            class_basename($model).' deleted',
            $model,
            $values,
            null,
            $request
        );
    }

    public function logLogin(?Request $request = null): AuditLog
    {
        return $this->log(
            'login',
            'User logged in',
            null,
            null,
            null,
            $request
        );
    }

    public function logLogout(?Request $request = null): AuditLog
    {
        return $this->log(
            'logout',
            'User logged out',
            null,
            null,
            null,
            $request
        );
    }

    public function logAccess(string $description, ?Request $request = null): AuditLog
    {
        return $this->log(
            'access',
            $description,
            null,
            null,
            null,
            $request
        );
    }

    private function generateHash(string $event, string $description, ?Model $model): string
    {
        $payload = $event.$description.($model?->id ?? '').now()->toIso8601String();

        return 'AUD_'.strtoupper(Str::random(32));
    }

    public function getImmutableLogs(int $perPage = 50)
    {
        return AuditLog::orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    public function getLogsByModel(string $modelType, int $modelId)
    {
        return AuditLog::where('model_type', $modelType)
            ->where('model_id', $modelId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getLogsByUser(int $userId, int $perPage = 50)
    {
        return AuditLog::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
