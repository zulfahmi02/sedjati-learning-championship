<?php

namespace App\Http\Requests\Admin;

use App\Models\Criterion;
use App\Models\Round;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCriterionRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'weight' => ['required', 'integer', Rule::in([100])],
            'min_score' => ['required', 'integer', Rule::in([0])],
            'max_score' => ['required', 'integer', 'gt:min_score', 'max:100'],
            'sequence' => ['required', 'integer', Rule::in([1])],
        ];
    }

    /**
     * Block criteria changes for non-pending rounds and guard weight ceiling.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                /** @var Round $round */
                $round = $this->route('round');
                /** @var Criterion $criterion */
                $criterion = $this->route('criterion');

                if (! $round->isPending()) {
                    $validator->errors()->add('name', 'Kriteria hanya dapat diubah saat ronde masih berstatus menunggu.');

                    return;
                }

                if ($round->criteria()->whereKeyNot($criterion->id)->exists()) {
                    $validator->errors()->add(
                        'name',
                        'Setiap ronde hanya boleh memiliki satu kriteria Live Scoring.',
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
            'name' => 'nama kriteria',
            'description' => 'deskripsi',
            'weight' => 'bobot',
            'min_score' => 'nilai minimum',
            'max_score' => 'nilai maksimum',
            'sequence' => 'urutan',
        ];
    }
}
