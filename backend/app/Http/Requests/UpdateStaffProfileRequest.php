<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $staffProfile = $this->route('staffProfile');
        $staffProfileId = $staffProfile?->id ?? 0;

        return [
            'user_id' => 'sometimes|exists:users,id',
            'zone_id' => 'nullable|exists:regions,id',
            'phc_center_id' => 'nullable|exists:phc_centers,id',
            'department_id' => 'nullable|exists:departments,id',
            'nationality_id' => 'nullable|exists:nationalities,id',
            'employee_id' => 'nullable|string|unique:staff_profiles,employee_id,'.$staffProfileId,
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'first_name_ar' => 'nullable|string|max:255',
            'last_name_ar' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'national_id' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'shc_category_id' => 'nullable|exists:shc_categories,id',
            'scfhs_license' => 'nullable|string|max:100',
            'scfhs_license_expiry' => 'nullable|date',
            'malpractice_insurance' => 'nullable|string|max:100',
            'malpractice_expiry' => 'nullable|date',
            'employment_status' => 'nullable|in:active,on_leave,suspended,terminated',
            'hire_date' => 'nullable|date',
            'termination_date' => 'nullable|date',
        ];
    }
}
