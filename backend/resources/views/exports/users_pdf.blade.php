<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users Export</title>
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
        .badge-admin { background: #e0e7ff; color: #3730a3; }
        .badge-manager { background: #dbeafe; color: #1e40af; }
        .badge-evaluator { background: #fef3c7; color: #92400e; }
        .badge-staff { background: #f3e8ff; color: #6b21a8; }
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
        <h1>Users Report</h1>
        <p class="subtitle">Generated on {{ $generatedAt }}</p>
        <div class="summary">
            <span>Total Records: {{ $users->count() }}</span>
            <span>Active: {{ $users->where('is_active', true)->count() }}</span>
            <span>Inactive: {{ $users->where('is_active', false)->count() }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Employee ID</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @php $rowNumber = 0; @endphp
            @foreach($users as $user)
            @php $rowNumber++; @endphp
            <tr>
                <td>{{ $rowNumber }}</td>
                <td>{{ $user->name }}</td>
                <td>{{ $user->email }}</td>
                <td>
                    <span class="badge badge-{{ $user->role }}">
                        {{ ucfirst($user->role) }}
                    </span>
                </td>
                <td>{{ $user->employee_id ?: '-' }}</td>
                <td>
                    <span class="badge {{ $user->is_active ? 'badge-active' : 'badge-inactive' }}">
                        {{ $user->is_active ? 'Active' : 'Inactive' }}
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>PHC Evaluation System — Users Export</p>
    </div>
</body>
</html>
