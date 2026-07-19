<?php

namespace App\Http\Requests\Admin;

use App\Models\Round;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateRoundRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'sequence' => ['required', 'integer', 'min:1', Rule::unique('rounds')->ignore($this->route('round'))],
            'weight' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    /**
     * Block edits on locked rounds and guard the 100% weight ceiling.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                /** @var Round $round */
                $round = $this->route('round');

                if ($round->isLocked()) {
                    $validator->errors()->add('name', 'Ronde yang terkunci tidak dapat diubah.');

                    return;
                }

                $otherWeights = (int) Round::query()->whereKeyNot($round->id)->sum('weight');

                if ($otherWeights + (int) $this->integer('weight') > 100) {
                    $validator->errors()->add(
                        'weight',
                        'Total bobot seluruh ronde tidak boleh melebihi 100% (ronde lain terpakai '.$otherWeights.'%).',
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
