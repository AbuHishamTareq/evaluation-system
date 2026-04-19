<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'nullable|exists:users,id',
            'zone_id' => 'nullable|exists:regions,id',
            'phc_center_id' => 'nullable|exists:phc_centers,id',
            'department_id' => 'nullable|exists:departments,id',
            'employee_id' => 'nullable|string|unique:staff_profiles,employee_id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'first_name_ar' => 'nullable|string|max:255',
            'last_name_ar' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'national_id' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'job_title' => 'nullable|string|max:255',
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
