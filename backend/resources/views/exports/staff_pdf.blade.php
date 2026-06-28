<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Export</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.5;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #0d9488;
        }
        .header h1 {
            font-size: 22px;
            color: #0f172a;
            margin-bottom: 4px;
        }
        .header .subtitle {
            font-size: 13px;
            color: #64748b;
        }
        .summary {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-top: 12px;
            font-size: 11px;
            color: #475569;
        }
        .summary span {
            background: #f1f5f9;
            padding: 4px 14px;
            border-radius: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        thead {
            background-color: #0d9488;
            color: #fff;
        }
        th, td {
            padding: 7px 6px;
            text-align: left;
            border: 1px solid #e2e8f0;
            font-size: 9px;
        }
        th {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.4px;
        }
        tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .badge-active { background: #d1fae5; color: #065f46; }
        .badge-inactive { background: #fee2e2; color: #991b1b; }
        .badge-full-time { background: #dbeafe; color: #1e40af; }
        .badge-part-time { background: #e0e7ff; color: #4338ca; }
        .badge-contract { background: #fef3c7; color: #92400e; }
        .badge-temporary { background: #f3e8ff; color: #6b21a8; }
        .footer {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
        }
        .page-break {
            page-break-after: always;
        }
        @media print {
            body { padding: 0; }
            .header { margin-bottom: 16px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Staff Report</h1>
        <p class="subtitle">Generated on {{ $generatedAt }}</p>
        <div class="summary">
            <span>Total Records: {{ $totalCount }}</span>
            <span>Active: {{ $activeCount }}</span>
            <span>Inactive: {{ $totalCount - $activeCount }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Staff ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>PHC Center</th>
                <th>Department</th>
                <th>Role</th>
                <th>Employment Type</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            {!! $rowsHtml !!}
        </tbody>
    </table>

    <div class="footer">
        <p>PHC Evaluation System — Staff Export</p>
    </div>
</body>
</html>
