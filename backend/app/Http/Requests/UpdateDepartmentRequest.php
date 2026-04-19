<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $department = $this->route('department');
        $departmentId = $department?->id ?? 0;

        return [
            'phc_center_id' => 'sometimes|exists:phc_centers,id',
            'name' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'code' => 'sometimes|string|max:50|unique:departments,code,'.$departmentId,
            'is_active' => 'sometimes|boolean',
        ];
    }
}
