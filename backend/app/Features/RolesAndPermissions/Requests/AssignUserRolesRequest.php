<?php

namespace App\Features\RolesAndPermissions\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignUserRolesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_ids' => ['required', 'array'],
            'role_ids.*' => ['required', 'integer', 'exists:roles,id'],
        ];
    }
}
