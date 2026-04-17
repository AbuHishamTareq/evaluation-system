<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncidentReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tenant_id' => 'required|exists:tenants,id',
            'phc_center_id' => 'required|exists:phc_centers,id',
            'reporter_id' => 'required|exists:users,id',
            'assigned_to_id' => 'nullable|exists:users,id',
            'staff_profile_id' => 'nullable|exists:staff_profiles,id',
            'type' => 'required|in:medication,storage,treatment,equipment,near_miss',
            'severity' => 'nullable|in:low,medium,high,critical',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'root_cause' => 'nullable|string|max:5000',
            'contributing_factors' => 'nullable|string|max:5000',
            'corrective_action' => 'nullable|string|max:5000',
            'responsible_owner_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ];
    }
}
