<?php

namespace App\Features\Users\Services;

use App\Features\Users\Repositories\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    public function getAllUsers(array $filters = []): LengthAwarePaginator
    {
        return $this->userRepository->getAll($filters);
    }

    public function getUserById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    public function createUser(array $data): User
    {
        return $this->userRepository->create($data);
    }

    public function updateUser(int $id, array $data): User
    {
        $user = $this->userRepository->findById($id);

        if (! $user) {
            throw new \InvalidArgumentException("User not found: {$id}");
        }

        return $this->userRepository->update($user, $data);
    }

    public function deleteUser(int $id): bool
    {
        $user = $this->userRepository->findById($id);

        if (! $user) {
            return false;
        }

        return $this->userRepository->delete($user);
    }

    public function toggleActive(int $id): ?User
    {
        $user = $this->userRepository->findById($id);

        if (! $user) {
            return null;
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        return $user->fresh()->load('roles')->loadCount('roles');
    }

    public function getActiveUsers(): Collection
    {
        return $this->userRepository->getActive();
    }

    public function searchUsers(string $query): Collection
    {
        return $this->userRepository->search($query);
    }
}
