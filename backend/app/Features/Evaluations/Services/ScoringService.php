<?php

namespace App\Features\Evaluations\Services;

use App\Models\Evaluation;
use App\Models\Question;

class ScoringService
{
    public function calculateScore(Evaluation $evaluation): array
    {
        $answers = $evaluation->answers()->with('question')->get();

        if ($answers->isEmpty()) {
            return ['total' => 0, 'max' => 0, 'percentage' => 0];
        }

        $totalScore = 0;
        $maxScore = 0;

        foreach ($answers as $answer) {
            $question = $answer->question;

            if (! $question) {
                continue;
            }

            $weight = $this->getQuestionWeight($evaluation, $question);
            $questionMaxScore = $question->max_score ?? 1;

            $totalScore += ($answer->score ?? 0) * $weight;
            $maxScore += $questionMaxScore * $weight;
        }

        $percentage = $maxScore > 0 ? round(($totalScore / $maxScore) * 100, 2) : 0;

        return [
            'total' => round($totalScore, 2),
            'max' => round($maxScore, 2),
            'percentage' => $percentage,
        ];
    }

    public function calculateAnswerScoreFromInput(array $answer, ?Question $question): array
    {
        if (! $question) {
            return ['score' => 0, 'max_score' => 0];
        }

        $maxScore = $question->max_score ?? 1;

        $score = match ($question->question_type) {
            'yes_no' => $this->calculateYesNoScore($answer),
            'rating' => $this->calculateRatingScore($answer, $maxScore),
            'multiple_choice' => $this->calculateMultipleChoiceScore($answer, $question),
            'text' => $this->calculateTextScore($answer),
            default => 0,
        };

        return [
            'score' => round($score, 2),
            'max_score' => $maxScore,
        ];
    }

    protected function calculateYesNoScore(array $answer): float
    {
        return ($answer['answer_yes_no'] ?? '') === 'yes' ? 1 : 0;
    }

    protected function calculateRatingScore(array $answer, float $maxScore): float
    {
        $rating = $answer['answer_rating'] ?? 0;

        return ($rating / 5) * $maxScore;
    }

    protected function calculateMultipleChoiceScore(array $answer, Question $question): float
    {
        $selected = $answer['answer_multiple_choice'] ?? '';
        $options = $question->options ?? [];

        if (empty($options)) {
            return 0;
        }

        $correctIndex = array_search(true, array_column($options, 'is_correct'), true);
        if ($correctIndex === false) {
            return 0;
        }

        return ($selected === $correctIndex) ? ($question->max_score ?? 1) : 0;
    }

    protected function calculateTextScore(array $answer): float
    {
        $text = $answer['answer_text'] ?? '';

        return empty($text) ? 0 : 0.5;
    }

    protected function getQuestionWeight(Evaluation $evaluation, Question $question): int
    {
        $templateQuestion = $evaluation->template->questions->firstWhere('question_id', $question->id);

        return $templateQuestion ? $templateQuestion->weight : 1;
    }

    public function getScoreGrade(float $percentage): string
    {
        return match (true) {
            $percentage >= 90 => 'A',
            $percentage >= 80 => 'B',
            $percentage >= 70 => 'C',
            $percentage >= 60 => 'D',
            default => 'F',
        };
    }

    public function getScoreColor(string $grade): string
    {
        return match ($grade) {
            'A' => '#22c55e',
            'B' => '#84cc16',
            'C' => '#eab308',
            'D' => '#f97316',
            'F' => '#ef4444',
            default => '#6b7280',
        };
    }
}
