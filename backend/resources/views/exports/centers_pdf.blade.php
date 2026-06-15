<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Centers Export</title>
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
        .classification-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .classification-primary { background-color: #DBEAFE; color: #1E40AF; }
        .classification-secondary { background-color: #D1FAE5; color: #065F46; }
        .classification-specialized { background-color: #FEE2E2; color: #991B1B; }
        .classification-community { background-color: #FEF3C7; color: #92400E; }
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
        <h1>Centers Report</h1>
        <p class="subtitle">Generated on {{ $generatedAt }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Code</th>
                <th>Zone</th>
                <th>Classification</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @php $rowNumber = 0; @endphp
            @foreach($centers as $center)
            @php $rowNumber++; @endphp
            <tr>
                <td>{{ $rowNumber }}</td>
                <td>{{ $center->name }}</td>
                <td>{{ $center->code }}</td>
                <td>
                    @php
                        $zoneName = $center->getRelation('zone')?->name ?? $center->zone ?: '-';
                    @endphp
                    {{ $zoneName }}
                </td>
                <td>
                    @if($center->classification)
                        <span class="classification-badge classification-{{ $center->classification }}">
                            @switch($center->classification)
                                @case('primary')
                                    Primary Health Center
                                    @break
                                @case('secondary')
                                    Secondary Health Center
                                    @break
                                @case('community')
                                    Community Health Center
                                    @break
                                @case('specialized')
                                    Specialized Center
                                    @break
                                @default
                                    {{ ucfirst($center->classification) }}
                            @endswitch
                        </span>
                    @else
                        -
                    @endif
                </td>
                <td>{{ $center->address ?: '-' }}</td>
                <td>{{ $center->phone ?: '-' }}</td>
                <td>{{ $center->email ?: '-' }}</td>
                <td class="{{ $center->is_active ? 'status-active' : 'status-inactive' }}">
                    {{ $center->is_active ? 'Active' : 'Inactive' }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Total Records: {{ $centers->count() }}</p>
        <p>PHC Evaluation System - Centers Export</p>
    </div>
</body>
</html>