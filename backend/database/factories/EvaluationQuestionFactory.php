<?php

namespace Database\Factories;

use App\Models\EvaluationQuestion;
use App\Models\EvaluationTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EvaluationQuestion>
 */
class EvaluationQuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'template_id' => EvaluationTemplate::factory(),
            'order' => fake()->numberBetween(1, 20),
            'question' => fake()->randomElement([
                'How would you rate your communication with patients?',
                'Do you follow safety protocols?',
                'Rate your teamwork skills.',
            ]),
            'question_ar' => 'سؤال ',
            'type' => EvaluationQuestion::TYPE_MCQ,
            'options' => json_encode(['Excellent', 'Good', 'Fair', 'Poor']),
            'options_ar' => json_encode(['ممتاز', 'جيد', 'متوسط', 'ضعيف']),
            'score' => 10,
            'is_required' => true,
        ];
    }

    public function rating(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => EvaluationQuestion::TYPE_RATING,
            'options' => null,
        ]);
    }

    public function essay(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => EvaluationQuestion::TYPE_ESSAY,
            'options' => null,
            'score' => 20,
        ]);
    }
}
