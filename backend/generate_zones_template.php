<?php

require __DIR__.'/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Create new Spreadsheet object
$spreadsheet = new Spreadsheet;
$sheet = $spreadsheet->getActiveSheet();

// Set user-friendly headers
$headers = ['Zone Name', 'Zone Code', 'Zone Level', 'Description', 'Parent Zone Name'];
$column = 'A';
foreach ($headers as $header) {
    $sheet->setCellValue($column.'1', $header);
    $column++;
}

// Sample data showing hierarchical zone structure (regions, districts, sub-districts)
// Parent Zone Name uses text (zone names) not IDs
$sampleData = [
    // Level 1 - Regions
    ['Northern Region', 'NR001', 'region', 'Northern region of the country', ''],
    ['Ashanti Region', 'AR002', 'region', 'Central region of Ghana', ''],
    ['Western Region', 'WR003', 'region', 'Western coastal region of Ghana', ''],
    ['Eastern Region', 'ER004', 'region', 'Eastern region of Ghana', ''],
    ['Greater Accra Region', 'GAR005', 'region', 'Capital region of Ghana', ''],

    // Level 2 - Districts (children of regions)
    ['Tamale Metropolitan', 'TM001', 'district', 'Metropolitan area in Northern Region', 'Northern Region'],
    ['Yendi Municipal', 'YM002', 'district', 'Municipal in Northern Region', 'Northern Region'],
    ['Kumasi Metropolitan', 'KM003', 'district', 'Metropolitan area in Ashanti Region', 'Ashanti Region'],
    ['Obuasi Municipal', 'OM004', 'district', 'Municipal in Ashanti Region', 'Ashanti Region'],
    ['Sekondi-Takoradi Metropolitan', 'STM005', 'district', 'Twin-city metropolitan in Western Region', 'Western Region'],
    ['Effia-Kwesimintsim Municipal', 'EKM006', 'district', 'Municipal in Western Region', 'Western Region'],
    ['Koforidua Municipal', 'KFM007', 'district', 'Municipal capital of Eastern Region', 'Eastern Region'],
    ['Accra Metropolitan', 'AM008', 'district', 'Metropolitan area in Greater Accra Region', 'Greater Accra Region'],
    ['Tema Metropolitan', 'TM009', 'district', 'Industrial city in Greater Accra Region', 'Greater Accra Region'],

    // Level 3 - Sub-districts (children of districts)
    ['Tamale Central', 'TC010', 'sub_district', 'Central business district of Tamale', 'Tamale Metropolitan'],
    ['Tamale North', 'TC011', 'sub_district', 'Northern residential area', 'Tamale Metropolitan'],
    ['Tamale South', 'TC012', 'sub_district', 'Southern residential area', 'Tamale Metropolitan'],
    ['Kumasi Central', 'KC013', 'sub_district', 'Central business district of Kumasi', 'Kumasi Metropolitan'],
    ['Asokwa', 'AK014', 'sub_district', 'Commercial hub in Kumasi', 'Kumasi Metropolitan'],
    ['Bompata', 'BP015', 'sub_district', 'Suburb of Asokwa', 'Kumasi Metropolitan'],
    ['Obuasi Central', 'OC016', 'sub_district', 'Central area of Obuasi', 'Obuasi Municipal'],
    ['Berekum', 'BK017', 'sub_district', 'Mining town in Obuasi Municipal', 'Obuasi Municipal'],
    ['Takoradi Central', 'TC018', 'sub_district', 'Central business district', 'Sekondi-Takoradi Metropolitan'],
    ['Essikado', 'ES019', 'sub_district', 'Industrial area', 'Sekondi-Takoradi Metropolitan'],
    ['Kwesimintsim', 'KW020', 'sub_district', 'Residential area', 'Effia-Kwesimintsim Municipal'],
    ['New Juaben North', 'NJ021', 'sub_district', 'Northern part of Koforidua', 'Koforidua Municipal'],
    ['Accra Central', 'AC022', 'sub_district', 'Central business district of Accra', 'Accra Metropolitan'],
    ['Labadi', 'LB023', 'sub_district', 'Coastal community', 'Accra Metropolitan'],
    ['Tema Central', 'TC024', 'sub_district', 'Central industrial area', 'Tema Metropolitan'],
    ['Tema West', 'TW025', 'sub_district', 'Western residential area', 'Tema Metropolitan'],
];

$row = 2;
foreach ($sampleData as $data) {
    $col = 'A';
    foreach ($data as $value) {
        $sheet->setCellValue($col.$row, $value);
        $col++;
    }
    $row++;
}

// Style the header row
$sheet->getStyle('A1:E1')->applyFromArray([
    'font' => [
        'bold' => true,
        'color' => ['rgb' => 'FFFFFF'],
    ],
    'fill' => [
        'fillType' => Fill::FILL_SOLID,
        'startColor' => ['rgb' => '2563EB'],
    ],
    'alignment' => [
        'horizontal' => Alignment::HORIZONTAL_CENTER,
        'vertical' => Alignment::VERTICAL_CENTER,
    ],
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color' => ['rgb' => '94A3B8'],
        ],
    ],
]);

// Style data cells
$sheet->getStyle('A2:E'.(count($sampleData) + 1))->applyFromArray([
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color' => ['rgb' => 'CBD5E1'],
        ],
    ],
    'alignment' => [
        'vertical' => Alignment::VERTICAL_CENTER,
    ],
]);

// Auto-size columns for better readability
$sheet->getColumnDimension('A')->setWidth(25);
$sheet->getColumnDimension('B')->setWidth(15);
$sheet->getColumnDimension('C')->setWidth(15);
$sheet->getColumnDimension('D')->setWidth(45);
$sheet->getColumnDimension('E')->setWidth(25);

// Set row height for header
$sheet->getRowDimension('1')->setRowHeight(25);

// Freeze the first row
$sheet->freezePane('A2');

// Save the file
$writer = new Xlsx($spreadsheet);
$writer->save(__DIR__.'/../frontend/public/templates/zones-sample.xlsx');

echo "Zone sample template generated successfully at: frontend/public/templates/zones-sample.xlsx\n";
