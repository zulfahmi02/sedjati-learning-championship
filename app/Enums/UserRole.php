<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Juri = 'juri';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Juri => 'Juri',
        };
    }
}
