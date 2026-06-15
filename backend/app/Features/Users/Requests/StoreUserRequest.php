<?php

namespace App\Features\Users\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:admin,manager,evaluator,staff'],
            'employee_id' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'team_code_id' => ['nullable', 'integer', 'exists:team_codes,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->mergeIfMissing([
            'is_active' => true,
            'role' => 'staff',
        ]);
    }

    protected function passedValidation(): void
    {
        $this->merge([
            'password' => bcrypt($this->input('password')),
        ]);
    }
}
