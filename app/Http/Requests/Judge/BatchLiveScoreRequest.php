<?php

namespace App\Http\Requests\Judge;

use App\Models\Round;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class BatchLiveScoreRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'scores' => ['required', 'array', 'min:1', 'max:500'],
            'scores.*.participant_id' => [
                'required',
                'integer',
                'distinct:strict',
                Rule::exists('participants', 'id'),
            ],
            'scores.*.value' => ['required', 'numeric'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $criteria = Round::active()?->criteria()->get();

                if ($criteria === null || $criteria->count() !== 1) {
                    return;
                }

                $criterion = $criteria->sole();

                foreach ($this->input('scores', []) as $index => $score) {
                    $value = $score['value'] ?? null;

                    if (! is_numeric($value)) {
                        continue;
                    }

                    if ($value < $criterion->min_score || $value > $criterion->max_score) {
                        $validator->errors()->add(
                            "scores.{$index}.value",
                            "Nilai harus di antara {$criterion->min_score} dan {$criterion->max_score}.",
                        );
                    }
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
            'scores' => 'daftar nilai',
            'scores.*.participant_id' => 'peserta',
            'scores.*.value' => 'nilai',
        ];
    }
}
