<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateParticipantRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! is_numeric($this->input('panel_id'))) {
            $this->merge(['panel_id' => null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'participant_number' => ['required', 'string', 'max:50', Rule::unique('participants')->ignore($this->route('participant'))],
            'name' => ['required', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'panel_id' => ['nullable', 'integer', Rule::exists('panels', 'id')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'participant_number' => 'nomor peserta',
            'name' => 'nama',
            'institution' => 'institusi',
            'category' => 'kategori',
            'notes' => 'catatan',
            'panel_id' => 'panel',
        ];
    }
}
