<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dashboard Report</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #06b6d4;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            color: #06b6d4;
            margin: 0 0 5px 0;
        }
        .header p {
            color: #666;
            margin: 0;
        }
        .section {
            margin-bottom: 20px;
        }
        .section h2 {
            font-size: 16px;
            color: #1e293b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .stats-row {
            display: table-row;
        }
        .stat-item {
            display: table-cell;
            width: 25%;
            padding: 10px;
            text-align: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
        }
        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #06b6d4;
        }
        .stat-label {
            font-size: 10px;
            color: #64748b;
            margin-top: 3px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th {
            background: #06b6d4;
            color: white;
            padding: 8px 10px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) {
            background: #f8fafc;
        }
        .score-badge {
            padding: 3px 8px;
            border-radius: 10px;
            font-weight: bold;
        }
        .score-excellent { background: #d1fae5; color: #065f46; }
        .score-good { background: #fef3c7; color: #92400e; }
        .score-fair { background: #ffedd5; color: #9a3412; }
        .score-poor { background: #fee2e2; color: #991b1b; }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            color: #94a3b8;
            font-size: 9px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PHC Evaluation Dashboard Report</h1>
        <p>Generated: {{ $generatedAt }}</p>
    </div>

    <div class="section">
        <h2>Summary</h2>
        <div class="stats-grid">
            <div class="stats-row">
                <div class="stat-item">
                    <div class="stat-value">{{ $dashboard['total_staff'] }}</div>
                    <div class="stat-label">Total Staff</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ $dashboard['total_centers'] }}</div>
                    <div class="stat-label">Total Centers</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ $dashboard['total_evaluations'] }}</div>
                    <div class="stat-label">Evaluations</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ $dashboard['average_percentage'] }}%</div>
                    <div class="stat-label">Avg Score</div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Score Distribution</h2>
        <table>
            <thead>
                <tr>
                    <th>Score Range</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                @foreach($distribution as $range => $count)
                <tr>
                    <td>{{ $range }}%</td>
                    <td>{{ $count }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Center Classification</h2>
        <table>
            <thead>
                <tr>
                    <th>Classification</th>
                    <th>Count</th>
                    <th>Avg Score</th>
                </tr>
            </thead>
            <tbody>
                @foreach($classification as $item)
                <tr>
                    <td>{{ ucfirst($item['classification']) }}</td>
                    <td>{{ $item['count'] }}</td>
                    <td>{{ $item['avg_percentage'] }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Top Centers</h2>
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Classification</th>
                    <th>Evaluations</th>
                    <th>Avg Score</th>
                </tr>
            </thead>
            <tbody>
                @foreach($centers as $index => $center)
                @php
                    $scoreClass = $center['avg_percentage'] >= 80 ? 'score-excellent' :
                                  ($center['avg_percentage'] >= 60 ? 'score-good' :
                                  ($center['avg_percentage'] >= 40 ? 'score-fair' : 'score-poor'));
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $center['name'] }}</td>
                    <td>{{ ucfirst($center['classification']) }}</td>
                    <td>{{ $center['evaluations_count'] }}</td>
                    <td><span class="score-badge {{ $scoreClass }}">{{ $center['avg_percentage'] }}%</span></td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Zone Analytics</h2>
        <table>
            <thead>
                <tr>
                    <th>Zone</th>
                    <th>Level</th>
                    <th>Centers</th>
                    <th>Evaluations</th>
                    <th>Avg Score</th>
                </tr>
            </thead>
            <tbody>
                @foreach($zones as $zone)
                <tr>
                    <td>{{ $zone['name'] }}</td>
                    <td>{{ $zone['level'] }}</td>
                    <td>{{ $zone['centers_count'] }}</td>
                    <td>{{ $zone['evaluations_count'] }}</td>
                    <td>{{ $zone['avg_percentage'] }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Recent Activity</h2>
        <table>
            <thead>
                <tr>
                    <th>Template</th>
                    <th>Center</th>
                    <th>Status</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                @foreach($recentActivity as $activity)
                <tr>
                    <td>{{ $activity['template_name'] ?? 'Untitled' }}</td>
                    <td>{{ $activity['center_name'] ?? 'N/A' }}</td>
                    <td>{{ ucfirst(str_replace('_', ' ', $activity['status'])) }}</td>
                    <td>{{ $activity['percentage'] ? $activity['percentage'] . '%' : 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>PHC Evaluation System - Dashboard Report</p>
        <p>This report was automatically generated on {{ $generatedAt }}</p>
    </div>
</body>
</html>
