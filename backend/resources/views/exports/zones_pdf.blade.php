<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zones Export</title>
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
            border-bottom: 2px solid #4F46E5;
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
            background-color: #4F46E5;
            color: white;
        }
        th, td {
            padding: 12px 10px;
            text-align: left;
            border: 1px solid #E5E7EB;
        }
        th {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
        }
        tbody tr:nth-child(even) {
            background-color: #F9FAFB;
        }
        tbody tr:hover {
            background-color: #F3F4F6;
        }
        .level-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .level-region { background-color: #DBEAFE; color: #1E40AF; }
        .level-district { background-color: #D1FAE5; color: #065F46; }
        .level-sub_district { background-color: #FEE2E2; color: #991B1B; }
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
        <h1>Zones Report</h1>
        <p class="subtitle">Generated on {{ $generatedAt }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Code</th>
                <th>Level</th>
                <th>Parent</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            @php $rowNumber = 0; @endphp
            @foreach($zones as $zone)
            @php $rowNumber++; @endphp
            <tr>
                <td>{{ $rowNumber }}</td>
                <td>{{ $zone->name }}</td>
                <td>{{ $zone->code }}</td>
                <td>
                    <span class="level-badge level-{{ $zone->level }}">
                        {{ ucfirst($zone->level) }}
                    </span>
                </td>
                <td>{{ $zone->parent?->name ?: '-' }}</td>
                <td>{{ $zone->description ?: '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Total Records: {{ $zones->count() }}</p>
        <p>PHC Evaluation System - Zones Export</p>
    </div>
</body>
</html>