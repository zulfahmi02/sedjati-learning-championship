<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePanelRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! is_numeric($this->input('judge_id'))) {
            $this->merge(['judge_id' => null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('panels')->ignore($this->route('panel'))],
            'description' => ['nullable', 'string', 'max:2000'],
            'judge_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', UserRole::Juri->value),
                Rule::unique('panels', 'judge_id')->ignore($this->route('panel')),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama panel',
            'description' => 'deskripsi',
            'judge_id' => 'juri',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'judge_id.unique' => 'Juri tersebut sudah memegang panel lain.',
        ];
    }
}
