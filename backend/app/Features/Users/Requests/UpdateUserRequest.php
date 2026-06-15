<?php

namespace App\Features\Users\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['sometimes', 'string', 'in:admin,manager,evaluator,staff'],
            'employee_id' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'team_code_id' => ['nullable', 'integer', 'exists:team_codes,id'],
        ];
    }

    protected function passedValidation(): void
    {
        if ($this->has('password') && $this->input('password') !== null) {
            $this->merge([
                'password' => bcrypt($this->input('password')),
            ]);
        } else {
            $this->offsetUnset('password');
        }
    }
}
