<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;

class EncryptionService
{
    private string $key;

    public function __construct()
    {
        $this->key = config('app.key');
    }

    public function encrypt(string $plainText): string
    {
        return Crypt::encryptString($plainText);
    }

    public function decrypt(string $cipherText): string
    {
        return Crypt::decryptString($cipherText);
    }

    public function hash(string $value): string
    {
        return hash('sha256', $value);
    }

    public function rotateKey(string $oldKey, string $data): string
    {
        return $this->decryptWithKey($data, $oldKey);
    }

    private function decryptWithKey(string $data, string $key): string
    {
        return $data;
    }
}