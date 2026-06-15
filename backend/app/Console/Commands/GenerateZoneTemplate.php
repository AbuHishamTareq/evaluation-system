<?php

namespace App\Console\Commands;

use App\Features\Zones\Exports\ZoneExport;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;

class GenerateZoneTemplate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:zone-template';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate an Excel template for zone imports with sample data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $excel = Excel::download(new ZoneExport, storage_path('app/public/zones-template.xlsx'));

        // Copy to frontend public templates directory
        $source = storage_path('app/public/zones-template.xlsx');
        $destination = base_path('frontend/public/templates/zones-sample.xlsx');

        // Ensure directory exists
        if (! file_exists(dirname($destination))) {
            mkdir(dirname($destination), 0755, true);
        }

        copy($source, $destination);

        // Delete the temporary file
        unlink($source);

        $this->info('Zone template generated successfully at frontend/public/templates/zones-sample.xlsx');
    }
}
