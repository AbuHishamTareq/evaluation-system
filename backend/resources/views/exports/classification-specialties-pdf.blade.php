<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Specialties Export</title>
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
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            font-size: 10px;
            color: #9CA3AF;
        }
        .active-yes { color: #059669; font-weight: 600; }
        .active-no { color: #DC2626; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Specialties Report</h1>
        <p class="subtitle">Generated on {{ $generatedAt }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Field Name</th>
                <th>Name</th>
                <th>Description</th>
                <th>Is Active</th>
            </tr>
        </thead>
        <tbody>
            @php $rowNumber = 0; @endphp
            @foreach($specialties as $specialty)
            @php $rowNumber++; @endphp
            <tr>
                <td>{{ $rowNumber }}</td>
                <td>{{ $specialty->field?->name ?: '-' }}</td>
                <td>{{ $specialty->name }}</td>
                <td>{{ $specialty->description ?: '-' }}</td>
                <td>
                    <span class="{{ $specialty->is_active ? 'active-yes' : 'active-no' }}">
                        {{ $specialty->is_active ? 'Yes' : 'No' }}
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Total Records: {{ $specialties->count() }}</p>
        <p>PHC Evaluation System - Specialties Export</p>
    </div>
</body>
</html>
