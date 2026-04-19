<?php

namespace App\Services\Dashboard;

use App\Models\Evaluation;
use App\Models\IncidentReport;
use App\Models\Issue;
use App\Models\Shift;
use App\Models\StaffProfile;
use Illuminate\Support\Facades\Response;
use Mpdf\Mpdf;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class ExportService
{
    public function exportToCsv(array $data, string $filename): \Symfony\Component\HttpFoundation\Response
    {
        $csv = $this->arrayToCsv($data);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ]);
    }

    public function generateReport(string $type, array $filters = []): array
    {
        $data = match ($type) {
            'incidents' => $this->getIncidentReport($filters),
            'evaluations' => $this->getEvaluationReport($filters),
            'staff' => $this->getStaffReport($filters),
            'issues' => $this->getIssueReport($filters),
            'shifts' => $this->getShiftReport($filters),
            default => [],
        };

        return [
            'type' => $type,
            'generated_at' => now()->toIso8601String(),
            'filters' => $filters,
            'data' => $data,
            'summary' => $this->generateSummary($data),
        ];
    }

    public function exportIncidentReport(array $filters): array
    {
        $query = IncidentReport::with(['phcCenter', 'reporter']);

        $this->applyFilters($query, $filters);

        return $query->get()->map(fn ($r) => [
            'id' => $r->id,
            'date' => $r->created_at->format('Y-m-d'),
            'title' => $r->title,
            'type' => $r->type,
            'severity' => $r->severity,
            'status' => $r->status,
            'center' => $r->phcCenter?->name,
            'reporter' => $r->reporter?->name,
        ])->toArray();
    }

    public function exportEvaluationReport(array $filters): array
    {
        $query = Evaluation::with(['staffProfile', 'template']);

        $this->applyFilters($query, $filters);

        return $query->get()->map(fn ($e) => [
            'id' => $e->id,
            'date' => $e->created_at->format('Y-m-d'),
            'staff_name' => $e->staffProfile?->full_name,
            'template' => $e->template?->name,
            'score' => $e->percentage ? round($e->percentage, 1).'%' : 'N/A',
            'status' => $e->status,
        ])->toArray();
    }

    public function exportStaffReport(array $filters): array
    {
        $query = StaffProfile::with(['phcCenter', 'department']);

        $this->applyFilters($query, $filters);

        return $query->get()->map(fn ($s) => [
            'id' => $s->id,
            'employee_id' => $s->employee_id,
            'name' => $s->full_name,
            'center' => $s->phcCenter?->name,
            'department' => $s->department?->name,
            'status' => $s->employment_status,
            'hire_date' => $s->hire_date?->format('Y-m-d'),
        ])->toArray();
    }

    public function exportStaffReportByIds(array $ids): array
    {
        return StaffProfile::with(['phcCenter', 'department'])
            ->whereIn('id', $ids)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'employee_id' => $s->employee_id,
                'name' => $s->full_name,
                'center' => $s->phcCenter?->name,
                'department' => $s->department?->name,
                'status' => $s->employment_status,
                'hire_date' => $s->hire_date?->format('Y-m-d'),
            ])->toArray();
    }

    public function exportIssueReport(array $filters): array
    {
        $query = Issue::with(['phcCenter', 'assignee']);

        $this->applyFilters($query, $filters);

        return $query->get()->map(fn ($i) => [
            'id' => $i->id,
            'date' => $i->created_at->format('Y-m-d'),
            'title' => $i->title,
            'priority' => $i->priority,
            'status' => $i->status,
            'center' => $i->phcCenter?->name,
            'assignee' => $i->assignee?->name ?? 'Unassigned',
        ])->toArray();
    }

    protected function applyFilters($query, array $filters): void
    {
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }
        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
        if (! empty($filters['phc_center_id'])) {
            $query->where('phc_center_id', $filters['phc_center_id']);
        }
    }

    protected function getIncidentReport(array $filters): array
    {
        return $this->exportIncidentReport($filters);
    }

    protected function getEvaluationReport(array $filters): array
    {
        return $this->exportEvaluationReport($filters);
    }

    protected function getStaffReport(array $filters): array
    {
        return $this->exportStaffReport($filters);
    }

    protected function getIssueReport(array $filters): array
    {
        return $this->exportIssueReport($filters);
    }

    protected function getShiftReport(array $filters): array
    {
        $query = Shift::with(['staffProfile', 'department']);
        $this->applyFilters($query, $filters);

        return $query->get()->map(fn ($s) => [
            'id' => $s->id,
            'date' => $s->date,
            'staff' => $s->staffProfile?->full_name,
            'department' => $s->department?->name,
            'status' => $s->status,
        ])->toArray();
    }

    protected function arrayToCsv(array $data): string
    {
        if (empty($data)) {
            return '';
        }

        $output = fopen('php://temp', 'w+');
        fputcsv($output, array_keys($data[0]));

        foreach ($data as $row) {
            fputcsv($output, array_values($row));
        }

        rewind($output);
        $content = stream_get_contents($output);
        fclose($output);

        return $content;
    }

    protected function generateSummary(array $data): array
    {
        return [
            'total_records' => count($data),
            'generated_at' => now()->toIso8601String(),
        ];
    }

    public function exportToExcel(array $data, string $filename): \Symfony\Component\HttpFoundation\Response
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $colLetter = function ($col): string {
            $letters = '';
            while ($col > 0) {
                $col--;
                $letters = chr(65 + ($col % 26)).$letters;
                $col = intdiv($col, 26);
            }

            return $letters ?: 'A';
        };

        if (! empty($data)) {
            $firstRow = $data[0];
            $isAssociative = array_keys($firstRow) !== range(0, count($firstRow) - 1);

            if ($isAssociative) {
                $headers = array_keys($firstRow);
                $col = 1;
                foreach ($headers as $header) {
                    $sheet->setCellValue($colLetter($col).'1', $header);
                    $col++;
                }

                $rowNum = 2;
                foreach ($data as $rowData) {
                    $col = 1;
                    foreach ($rowData as $value) {
                        $sheet->setCellValue($colLetter($col).$rowNum, $value);
                        $col++;
                    }
                    $rowNum++;
                }
            } else {
                $headers = $firstRow;
                $col = 1;
                foreach ($headers as $header) {
                    $sheet->setCellValue($colLetter($col).'1', $header);
                    $col++;
                }

                $rowNum = 2;
                foreach (array_slice($data, 1) as $rowData) {
                    $col = 1;
                    foreach ($rowData as $value) {
                        $sheet->setCellValue($colLetter($col).$rowNum, $value);
                        $col++;
                    }
                    $rowNum++;
                }
            }
        }

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $tempFile = tempnam(sys_get_temp_dir(), 'excel_');
        $writer->save($tempFile);
        $output = file_get_contents($tempFile);
        unlink($tempFile);

        return Response::make($output, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}.xlsx\"",
        ]);
    }

    public function exportToPdf(array $data, string $filename): \Symfony\Component\HttpFoundation\Response
    {
        // Convert data to HTML table
        $html = $this->dataToHtmlTable($data);

        // Add UTF-8 meta tag for proper Arabic character support
        $html = '<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style>
    body { font-family: DejaVu Sans, sans-serif; }
    table { border-collapse: collapse; width: 100%; font-family: DejaVu Sans, sans-serif; }
    th, td { border: 1px solid #000; padding: 5px; }
</style>
</head>
<body>'.$html.'</body>
</html>';

        // Configure mPDF for Arabic support
        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'orientation' => 'P',
            'default_font_size' => 10,
            'default_font' => 'Arial',
        ]);

        $mpdf->WriteHTML($html);

        return Response::make($mpdf->Output('', 'S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}.pdf\"",
        ]);
    }

    protected function dataToHtmlTable(array $data): string
    {
        if (empty($data)) {
            return '<p>No data available</p>';
        }

        $html = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">';

        // Add headers
        $html .= '<tr style="background-color: #f2f2f2; font-weight: bold;">';
        foreach (array_keys($data[0]) as $header) {
            $html .= "<th>{$header}</th>";
        }
        $html .= '</tr>';

        // Add data rows
        foreach ($data as $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                $html .= '<td>'.htmlspecialchars($cell ?? '', ENT_QUOTES).'</td>';
            }
            $html .= '</tr>';
        }

        $html .= '</table>';

        return $html;
    }
}
