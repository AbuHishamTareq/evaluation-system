<?php

namespace App\Services\Dashboard;

use App\Models\Evaluation;
use App\Models\IncidentReport;
use App\Models\Issue;
use App\Models\Shift;
use App\Models\StaffProfile;
use Illuminate\Support\Facades\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Writer\Pdf;
use Dompdf\Dompdf;
use Dompdf\Options;

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

        $output = fopen('php://temp', 'w');
        fputcsv($output, array_keys($data[0]));

        foreach ($data as $row) {
            fputcsv($output, array_values($row));
        }

        return stream_get_contents($output);
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
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        if (!empty($data)) {
            // Set headers
            $headers = array_keys($data[0]);
            $column = 0;
            foreach ($headers as $header) {
                $sheet->setCellValueByColumnAndRow($column + 1, 1, $header);
                $column++;
            }

            // Set data
            $row = 2;
            foreach ($data as $rowData) {
                $column = 0;
                foreach ($rowData as $value) {
                    $sheet->setCellValueByColumnAndRow($column + 1, $row, $value);
                    $column++;
                }
                $row++;
            }
        }

        $writer = new Xlsx($spreadsheet);
        $output = '';
        ob_start();
        $writer->save('php://output');
        $output = ob_get_clean();

        return Response::make($output, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}.xlsx\"",
        ]);
    }

    public function exportToPdf(array $data, string $filename): \Symfony\Component\HttpFoundation\Response
    {
        // Convert data to HTML table
        $html = $this->dataToHtmlTable($data);

        // Configure DOMPDF
        $options = new Options();
        $options->set('defaultFont', 'Sans-serif');
        $options->setIsRemoteEnabled(true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return Response::make($dompdf->output(), 200, [
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
                $html .= "<td>" . htmlspecialchars($cell ?? '', ENT_QUOTES) . "</td>";
            }
            $html .= '</tr>';
        }

        $html .= '</table>';

        return $html;
    }
}
