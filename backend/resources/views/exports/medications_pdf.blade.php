<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medications Export</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
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
            border-bottom: 2px solid #059669;
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
            background-color: #059669;
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
        .status-active {
            color: #059669;
            font-weight: 600;
        }
        .status-inactive {
            color: #DC2626;
            font-weight: 600;
        }
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
        <h1>Medications Report</h1>
        <p class="subtitle">Generated on {{ $generatedAt }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Medication Name</th>
                <th>Strength</th>
                <th>Form</th>
                <th>Unit</th>
                <th>Category</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @php $rowNumber = 0; @endphp
            @foreach($medications as $medication)
            @php $rowNumber++; @endphp
            <tr>
                <td>{{ $rowNumber }}</td>
                <td>{{ $medication->name }}</td>
                <td>{{ $medication->strength ?: '-' }}</td>
                <td>{{ $medication->form ?: '-' }}</td>
                <td>{{ $medication->unit ?: '-' }}</td>
                <td>{{ $medication->category ?: '-' }}</td>
                <td class="{{ $medication->is_active ? 'status-active' : 'status-inactive' }}">
                    {{ $medication->is_active ? 'Active' : 'Inactive' }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Total Records: {{ $medications->count() }}</p>
        <p>PHC Evaluation System - Medications Export</p>
    </div>
</body>
</html>
