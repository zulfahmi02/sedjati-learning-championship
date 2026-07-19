<?php

namespace App\Http\Requests\Admin;

use App\Models\Panel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class AssignParticipantRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'participant_id' => ['required', 'integer', Rule::exists('participants', 'id')],
        ];
    }

    /**
     * A panel must have a judge before participants can be assigned to it.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                /** @var Panel $panel */
                $panel = $this->route('panel');

                if (! $panel->hasJudge()) {
                    $validator->errors()->add(
                        'participant_id',
                        'Panel ini belum memiliki juri. Tetapkan juri terlebih dahulu sebelum menugaskan peserta.',
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
            'participant_id' => 'peserta',
        ];
    }
}
