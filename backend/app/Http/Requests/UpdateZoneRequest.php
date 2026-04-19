<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateZoneRequest extends FormRequest
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
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('regions', 'code')->ignore($this->zone->id),
            ],
            'is_active' => 'nullable|boolean',
        ];
    }
}
