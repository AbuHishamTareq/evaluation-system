<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePhcCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'code' => 'required|string|max:50|unique:phc_centers,code',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'region_id' => 'required|exists:regions,id',
            'is_active' => 'nullable|boolean',
        ];
    }
}
