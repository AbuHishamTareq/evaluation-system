<?php

namespace App\Services\Pharmacy;

use App\Models\Medication;
use App\Models\MedicationAlert;
use App\Models\MedicationBatch;
use App\Models\MedicationLog;
use Illuminate\Pagination\LengthAwarePaginator;

class MedicationService
{
    public function getAllMedications(array $filters = []): LengthAwarePaginator
    {
        $query = Medication::query();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(static function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('generic_name', 'like', "%{$search}%")
                    ->orWhere('brand_name', 'like', "%{$search}%");
            });
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getMedicationById(int $id): ?Medication
    {
        return Medication::with('batches')->find($id);
    }

    public function createMedication(array $data): Medication
    {
        return Medication::create($data);
    }

    public function updateMedication(Medication $medication, array $data): Medication
    {
        $medication->update($data);

        return $medication;
    }

    public function getAllBatches(array $filters = []): LengthAwarePaginator
    {
        $query = MedicationBatch::with(['medication', 'phcCenter']);

        if (! empty($filters['medication_id'])) {
            $query->where('medication_id', $filters['medication_id']);
        }

        if (! empty($filters['phc_center_id'])) {
            $query->where('phc_center_id', $filters['phc_center_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 15);
    }

    public function createBatch(array $data): MedicationBatch
    {
        $batch = MedicationBatch::create($data);
        $this->checkBatchAlerts($batch);

        return $batch;
    }

    public function updateBatch(MedicationBatch $batch, array $data): MedicationBatch
    {
        $batch->update($data);
        $this->checkBatchAlerts($batch);

        return $batch;
    }

    public function getBatchesAlerts(int $days = 30): array
    {
        $lowStock = MedicationBatch::whereColumn('quantity', '<=', 'alert_threshold')
            ->where('status', '!=', 'recalled')
            ->count();

        $nearExpiry = MedicationBatch::whereBetween('expiry_date', [now(), now()->addDays($days)])
            ->where('status', '!=', 'recalled')
            ->count();

        $expired = MedicationBatch::where('expiry_date', '<', now())
            ->where('status', '!=', 'recalled')
            ->count();

        return [
            'low_stock' => $lowStock,
            'near_expiry' => $nearExpiry,
            'expired' => $expired,
        ];
    }

    public function getInventory(int $phcCenterId): array
    {
        $batches = MedicationBatch::where('phc_center_id', $phcCenterId)
            ->where('status', 'available')
            ->with('medication')
            ->get();

        $totalItems = $batches->count();
        $totalQuantity = $batches->sum('quantity');

        return [
            'total_items' => $totalItems,
            'total_quantity' => $totalQuantity,
            'batches' => $batches,
        ];
    }

    public function getAlerts(array $filters = []): LengthAwarePaginator
    {
        $query = MedicationAlert::with(['medicationBatch.medication', 'phcCenter']);

        if (! empty($filters['phc_center_id'])) {
            $query->where('phc_center_id', $filters['phc_center_id']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['is_resolved'])) {
            $query->where('is_resolved', $filters['is_resolved']);
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 15);
    }

    public function createLog(array $data): MedicationLog
    {
        $log = MedicationLog::create($data);

        if ($log->step === MedicationLog::STEP_VERIFIED) {
            $log->update(['completed_at' => now()]);
        }

        return $log;
    }

    protected function checkBatchAlerts(MedicationBatch $batch): void
    {
        if ($batch->quantity <= $batch->alert_threshold && $batch->status === MedicationBatch::STATUS_AVAILABLE) {
            MedicationAlert::firstOrCreate(
                [
                    'medication_batch_id' => $batch->id,
                    'type' => MedicationAlert::TYPE_LOW_STOCK,
                ],
                [
                    'phc_center_id' => $batch->phc_center_id,
                    'title' => 'Low Stock Alert',
                    'message' => "Medication {$batch->medication?->name} is running low ({$batch->quantity} remaining)",
                ]
            );
        }

        if ($batch->isExpiringSoon(30) && ! $batch->alerts()->where('type', MedicationAlert::TYPE_NEAR_EXPIRY)->exists()) {
            MedicationAlert::firstOrCreate(
                [
                    'medication_batch_id' => $batch->id,
                    'type' => MedicationAlert::TYPE_NEAR_EXPIRY,
                ],
                [
                    'phc_center_id' => $batch->phc_center_id,
                    'title' => 'Near Expiry Alert',
                    'message' => "Medication {$batch->medication?->name} expires on {$batch->expiry_date}",
                ]
            );
        }
    }
}
