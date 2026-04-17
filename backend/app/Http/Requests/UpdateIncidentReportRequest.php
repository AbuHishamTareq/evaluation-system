<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIncidentReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tenant_id' => 'sometimes|exists:tenants,id',
            'phc_center_id' => 'sometimes|exists:phc_centers,id',
            'reporter_id' => 'sometimes|exists:users,id',
            'assigned_to_id' => 'nullable|exists:users,id',
            'staff_profile_id' => 'nullable|exists:staff_profiles,id',
            'type' => 'sometimes|in:medication,storage,treatment,equipment,near_miss',
            'severity' => 'nullable|in:low,medium,high,critical',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:5000',
            'root_cause' => 'nullable|string|max:5000',
            'contributing_factors' => 'nullable|string|max:5000',
            'corrective_action' => 'nullable|string|max:5000',
            'responsible_owner_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:open,investigating,action_plan,resolved,closed',
        ];
    }
}
