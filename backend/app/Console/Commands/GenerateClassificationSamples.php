<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Facades\Excel;

#[Signature('generate:classification-samples')]
#[Description('Regenerate sample XLSX templates for classification imports matching actual database columns')]
class GenerateClassificationSamples extends Command
{
    /**
     * Template definitions: filename => [headers, data rows].
     *
     * @var array<string, array{0: string[], 1: string[][]}>
     */
    protected array $templates = [
        'fields-sample.xlsx' => [
            ['Name', 'Description', 'Is Active'],
            [['Cardiology', 'Cardiology department', 'Yes']],
        ],
        'specialties-sample.xlsx' => [
            ['Field Name', 'Name', 'Description', 'Is Active'],
            [['Cardiology', 'Interventional Cardiology', 'Heart interventions', 'Yes']],
        ],
        'ranks-sample.xlsx' => [
            ['Name', 'Description', 'Level', 'Is Active'],
            [['Consultant', 'Senior consultant', '1', 'Yes']],
        ],
        'categories-sample.xlsx' => [
            ['Code', 'Name', 'Description', 'Is Active'],
            [['CAT-A', 'Category A', 'Top tier category', 'Yes']],
        ],
        'classifications-sample.xlsx' => [
            ['Field Name', 'Specialty Name', 'Rank Name', 'Category Code'],
            [['Cardiology', 'Interventional Cardiology', 'Consultant', 'CAT-A']],
        ],
    ];

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        // Ensure the templates directory exists
        $templateDir = public_path('templates');

        if (! is_dir($templateDir)) {
            mkdir($templateDir, 0755, true);
        }

        // Temporarily configure a filesystem disk targeting public/templates
        config(['filesystems.disks.templates' => [
            'driver' => 'local',
            'root' => $templateDir,
        ]]);

        foreach ($this->templates as $filename => [$headers, $rows]) {
            $export = new class($headers, $rows) implements FromArray, WithHeadings
            {
                /**
                 * @param  string[]  $headings
                 * @param  mixed[][]  $data
                 */
                public function __construct(
                    protected array $headings,
                    protected array $data,
                ) {}

                public function array(): array
                {
                    return $this->data;
                }

                public function headings(): array
                {
                    return [$this->headings];
                }
            };

            Excel::store($export, $filename, 'templates');

            $this->info("Generated: {$filename}");
        }

        $this->info('All classification sample templates generated successfully.');
    }
}
