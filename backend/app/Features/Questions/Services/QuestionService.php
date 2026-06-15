<?php

namespace App\Features\Questions\Services;

use App\Features\Questions\Repositories\QuestionRepositoryInterface;
use App\Models\Question;
use Illuminate\Pagination\LengthAwarePaginator;

class QuestionService
{
    public function __construct(
        protected QuestionRepositoryInterface $questionRepository
    ) {}

    public function getAllQuestions(array $filters = []): LengthAwarePaginator
    {
        return $this->questionRepository->getAll($filters);
    }

    public function getQuestionById(int $id): ?Question
    {
        return $this->questionRepository->findById($id);
    }

    public function createQuestion(array $data): Question
    {
        return $this->questionRepository->create($data);
    }

    public function updateQuestion(int $id, array $data): Question
    {
        return $this->questionRepository->update($id, $data);
    }

    public function deleteQuestion(int $id): bool
    {
        return $this->questionRepository->delete($id);
    }

    public function getQuestionsByCategory(int $categoryId): LengthAwarePaginator
    {
        return $this->questionRepository->getByCategory($categoryId);
    }

    public function getQuestionsByType(string $type): LengthAwarePaginator
    {
        return $this->questionRepository->getByType($type);
    }

    public function validateAnswers(array $answers, int $questionId): bool
    {
        $question = $this->getQuestionById($questionId);

        if (! $question) {
            return false;
        }

        if ($question->question_type === 'multiple_choice') {
            return is_array($answers['selected_options'] ?? null) &&
                   count($answers['selected_options']) > 0;
        }

        if ($question->question_type === 'text') {
            return ! empty($answers['text_answer'] ?? null);
        }

        if ($question->question_type === 'rating') {
            return isset($answers['rating']) &&
                   $answers['rating'] >= 1 &&
                   $answers['rating'] <= 5;
        }

        return false;
    }
}
