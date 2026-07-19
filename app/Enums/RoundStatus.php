<?php

namespace App\Enums;

enum RoundStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Locked = 'locked';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu',
            self::Active => 'Berlangsung',
            self::Locked => 'Terkunci',
        };
    }
}
