<?php

require __DIR__.'/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Create new Spreadsheet object
$spreadsheet = new Spreadsheet;
$sheet = $spreadsheet->getActiveSheet();

// Set headers with user-friendly names
$headers = ['ID', 'Zone Name', 'Zone Code', 'Zone Level', 'Parent Zone Name', 'Description', 'Created At'];
$column = 0;
foreach ($headers as $header) {
    $sheet->setCellValueByColumnAndRow($column + 1, 1, $header);
    $column++;
}

// Add sample data
$sampleData = [
    [1, 'Northern Region', 'NR001', 'region', null, 'Northern part of the country', '2026-01-01'],
    [2, 'Ashanti Region', 'AR002', 'region', null, 'Central region of Ghana', '2026-01-01'],
    [3, 'Western Region', 'WR003', 'region', null, 'Western coastal region of Ghana', '2026-01-01'],
    [4, 'Tamale District', 'TD001', 'district', 1, 'Major district in Northern Region', '2026-01-01'],
    [5, 'Kumasi District', 'KD002', 'district', 2, 'Capital district of Ashanti Region', '2026-01-01'],
    [6, 'Sekondi-Takoradi District', 'STD003', 'district', 3, 'Twin-city district', '2026-01-01'],
    [7, 'Tamale Central', 'TC001', 'sub_district', 4, 'Central business district', '2026-01-01'],
    [8, 'Kumasi Sub-Metro', 'KSM001', 'sub_district', 5, 'Administrative sub-metro', '2026-01-01'],
    [9, 'Takoradi Port', 'TP001', 'sub_district', 6, 'Port and harbor area', '2026-01-01'],
];

$row = 2;
foreach ($sampleData as $data) {
    $column = 0;
    foreach ($data as $value) {
        $sheet->setCellValueByColumnAndRow($column + 1, $row, $value);
        $column++;
    }
    $row++;
}

// Auto-size columns for better readability
foreach (range('A', 'G') as $columnID) {
    $sheet->getColumnDimension($columnID)->setAutoSize(true);
}

// Save the file
$writer = new Xlsx($spreadsheet);
$writer->save(__DIR__.'/../frontend/public/templates/zones-sample.xlsx');

echo "Zone sample template generated successfully!\n";
