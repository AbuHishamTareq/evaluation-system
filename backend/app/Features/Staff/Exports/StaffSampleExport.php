<?php

namespace App\Features\Staff\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StaffSampleExport implements FromArray, ShouldAutoSize, WithHeadings, WithStyles
{
    public function headings(): array
    {
        return [
            'Staff ID',
            'First Name',
            'Middle Name',
            'Last Name',
            'Email',
            'Phone',
            'Mobile',
            'Gender',
            'Date of Birth',
            'Nationality',
            'National ID',
            'Address',
            'Notes',
            'PHC Center',
            'Department',
            'Professional',
            'Clinic Assignment',
            'Employment Type',
            'Hire Date',
            'Termination Date',
            'Is Care Provider',
            'In A Team',
            'Team',
            'SCFHS Registration No',
            'SCFHS Issue Date',
            'SCFHS Expiry Date',
            'Malpractice Insurance No',
            'Malpractice Issue Date',
            'Malpractice Expiry Date',
            'Status',
            'Is Active',
        ];
    }

    public function array(): array
    {
        return [
            [
                'EMP001', 'John', 'Michael', 'Doe', 'john.doe@example.com',
                '966-55-123-4567', '966-50-123-4567', 'male', '1990-05-15',
                'Saudi', '1045678901', '123 Main Street, Riyadh', 'Senior physician with 10 years experience',
                'Cape Coast South Clinic', 'General Medicine', 'Physician', 'Outpatient Clinic', 'Full Time',
                '2020-01-15', null, '1', '1', 'TC-001',
                'SCFHS-12345', '2020-03-01', '2025-03-01',
                'MAL-98765', '2020-01-15', '2025-01-15',
                'active', '1',
            ],
            [
                'EMP002', 'Jane', 'Marie', 'Smith', 'jane.smith@example.com',
                '966-55-234-5678', '966-50-234-5678',                 'female', '1995-08-22',
                'Saudi', '1098765432', '456 Oak Avenue, Jeddah', '',
                'Accra Central Health Center', 'Pediatrics', 'Nurse', 'Maternity Ward', 'Part Time',
                '2022-06-01', null, '1', '1', 'TC-002',
                'SCFHS-67890', '2022-07-01', '2027-07-01',
                'MAL-54321', '2022-06-01', '2027-06-01',
                'active', '1',
            ],
            [
                'EMP003', 'Robert', 'James', 'Johnson', '',
                '966-55-345-6789', '',                 'male', '1988-11-03',
                '', '1054321098', '', 'Contract specialist in family medicine',
                'Cape Coast South Clinic', 'Emergency', 'Pharmacist', 'Outpatient Clinic', 'Contract',
                '2023-03-01', '2024-12-31', '0', '0', '',
                '', '', '',
                '', '', '',
                'active', '1',
            ],
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF4F81BD']]],
        ];
    }
}
