<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreRoundRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'sequence' => ['required', 'integer', 'min:1', Rule::unique('rounds')],
            'weight' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    /**
     * Ensure total round weight does not exceed 100%.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $existing = (int) \App\Models\Round::query()->sum('weight');

                if ($existing + (int) $this->integer('weight') > 100) {
                    $validator->errors()->add(
                        'weight',
                        'Total bobot seluruh ronde tidak boleh melebihi 100% (saat ini terpakai '.$existing.'%).',
                    );
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama ronde',
            'sequence' => 'urutan',
            'weight' => 'bobot',
        ];
    }
}
