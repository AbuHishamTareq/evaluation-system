<?php

namespace App\Console\Commands;

use App\Features\Zones\Exports\ZoneExport;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;

#[Signature('app:generate-zone-sample-template')]
#[Description('Generate an Excel template for zone imports with sample data')]
class GenerateZoneSampleTemplate extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $excel = Excel::download(new ZoneExport, storage_path('app/public/zones-sample.xlsx'));

        // Copy to frontend public templates directory
        $source = storage_path('app/public/zones-sample.xlsx');
        $destination = base_path('frontend/public/templates/zones-sample.xlsx');

        // Ensure directory exists
        if (! file_exists(dirname($destination))) {
            mkdir(dirname($destination), 0755, true);
        }

        copy($source, $destination);

        // Delete the temporary file
        if (file_exists($source)) {
            unlink($source);
        }

        $this->info('Zone sample template generated successfully at frontend/public/templates/zones-sample.xlsx');
    }
}
