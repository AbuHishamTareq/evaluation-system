<?php

namespace App\Features\RolesAndPermissions\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('role');

        return [
            'name' => ['required', 'string', 'max:255', "unique:roles,name,{$roleId}"],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
