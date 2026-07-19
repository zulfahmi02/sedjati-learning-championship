<?php

namespace App\Http\Requests\Admin;

use App\Models\Round;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreCriterionRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'weight' => ['required', 'integer', 'min:1', 'max:100'],
            'min_score' => ['required', 'integer', 'min:0', 'max:100'],
            'max_score' => ['required', 'integer', 'gt:min_score', 'max:100'],
            'sequence' => ['required', 'integer', 'min:1'],
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

                if (! $round->isPending()) {
                    $validator->errors()->add('name', 'Kriteria hanya dapat diubah saat ronde masih berstatus menunggu.');

                    return;
                }

                $existing = (int) $round->criteria()->sum('weight');

                if ($existing + (int) $this->integer('weight') > 100) {
                    $validator->errors()->add(
                        'weight',
                        'Total bobot kriteria ronde ini tidak boleh melebihi 100% (saat ini terpakai '.$existing.'%).',
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
