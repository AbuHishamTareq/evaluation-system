<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Questions Export</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.5;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #6366F1;
        }
        .header h1 {
            font-size: 24px;
            color: #1F2937;
            margin-bottom: 5px;
        }
        .header .subtitle {
            font-size: 14px;
            color: #6B7280;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        thead {
            background-color: #6366F1;
            color: white;
        }
        th, td {
            padding: 10px 8px;
            text-align: left;
            border: 1px solid #E5E7EB;
            font-size: 10px;
        }
        th {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
        }
        tbody tr:nth-child(even) {
            background-color: #F9FAFB;
        }
        tbody tr:hover {
            background-color: #F3F4F6;
        }
        .type-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .type-text { background-color: #DBEAFE; color: #1E40AF; }
        .type-textarea { background-color: #FEF3C7; color: #92400E; }
        .type-select { background-color: #D1FAE5; color: #065F46; }
        .type-radio { background-color: #FEE2E2; color: #991B1B; }
        .type-checkbox { background-color: #E0E7FF; color: #3730A3; }
        .type-rating { background-color: #FCE7F3; color: #9D174D; }
        .status-active { color: #059669; font-weight: 600; }
        .status-inactive { color: #DC2626; font-weight: 600; }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            font-size: 10px;
            color: #9CA3AF;
        }
        @media print {
            body { padding: 0; }
            .header { margin-bottom: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Questions Report</h1>
        <p class="subtitle">Generated on {{ $generatedAt }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 35%;">Question</th>
                <th style="width: 20%;">Category / Sub Category</th>
                <th style="width: 15%;">Question Type</th>
                <th style="width: 25%;">Options</th>
            </tr>
        </thead>
        <tbody>
            @php $rowNumber = 0; @endphp
            @foreach($questions as $question)
            @php $rowNumber++; @endphp
            <tr>
                <td>{{ $rowNumber }}</td>
                <td>{{ $question->question_text }}</td>
                <td>
                    @php
                        $catName = $question->category?->name;
                        $subCatName = $question->subCategory?->name;
                    @endphp
                    {{ $catName ? ($subCatName ? "{$catName} - {$subCatName}" : $catName) : ($subCatName ?: '—') }}
                </td>
                <td>
                    <span class="type-badge type-{{ $question->question_type }}">
                        {{ $question->question_type }}
                    </span>
                </td>
                <td>
                    @if($question->options && is_array($question->options))
                        @php
                            $labels = [];
                            foreach ($question->options as $option) {
                                if (is_string($option)) {
                                    $labels[] = $option;
                                } elseif (is_array($option) && isset($option['label'])) {
                                    $labels[] = $option['label'];
                                }
                            }
                        @endphp
                        {{ implode(', ', $labels) }}
                    @else
                        —
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Total Records: {{ $questions->count() }}</p>
        <p>PHC Evaluation System - Questions Export</p>
    </div>
</body>
</html>
