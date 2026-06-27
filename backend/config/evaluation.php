<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Composite Score Weights
    |--------------------------------------------------------------------------
    |
    | Define the weight of regular evaluations and medication evaluations
    | when computing the composite final score for a PHC center.
    |
    | The final score is calculated as:
    |   (regular_weight * avg_regular_percentage + medication_weight * avg_medication_percentage)
    |   / (regular_weight + medication_weight)
    |
    */
    'composite_weights' => [
        'regular' => 70,
        'medication' => 30,
    ],
];
