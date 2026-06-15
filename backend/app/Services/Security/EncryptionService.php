<?php

namespace App\Services\Security;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

class EncryptionService
{
    private const PII_FIELDS = [
        'national_id',
        'passport_number',
        'phone',
        'mobile',
        'email',
        'address',
        'emergency_contact',
        'emergency_phone',
        'bank_account',
        'social_security_number',
    ];

    public function encryptPii(array $data): array
    {
        $encrypted = [];
        foreach ($data as $key => $value) {
            if (in_array($key, self::PII_FIELDS) && $value !== null) {
                $encrypted[$key] = $this->encrypt($value);
            } else {
                $encrypted[$key] = $value;
            }
        }

        return $encrypted;
    }

    public function decryptPii(array $data): array
    {
        $decrypted = [];
        foreach ($data as $key => $value) {
            if (in_array($key, self::PII_FIELDS) && $value !== null) {
                $decrypted[$key] = $this->decrypt($value);
            } else {
                $decrypted[$key] = $value;
            }
        }

        return $decrypted;
    }

    public function encrypt(string $value): string
    {
        return Crypt::encryptString($value);
    }

    public function decrypt(string $value): string
    {
        return Crypt::decryptString($value);
    }

    public function hash(string $value): string
    {
        return Hash::make($value);
    }

    public function isPiiField(string $fieldName): bool
    {
        return in_array($fieldName, self::PII_FIELDS);
    }

    public function getPiiFields(): array
    {
        return self::PII_FIELDS;
    }
}
