<?php

namespace App\Http\Requests\Judge;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustLiveScoreRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'delta' => ['required', 'integer', Rule::in([-1, 1])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'delta' => 'perubahan nilai',
        ];
    }
}
