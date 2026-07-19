<?php

namespace App\Enums;

enum ScoreSheetStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf',
            self::Submitted => 'Terkirim',
        };
    }
}
