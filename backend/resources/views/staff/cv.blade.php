<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CV - {{ $staff->full_name }}</title>
    <style>
        /* ===== Base Reset & Typography ===== */
        body {
            font-family: sans-serif;
            font-size: 9.5px;
            line-height: 1.6;
            color: #1e293b;
            margin: 20px;
        }

        /* ===== Header ===== */
        .header {
            padding-bottom: 10px;
            margin-bottom: 16px;
            border-bottom: 1px solid #e2e8f0;
        }
        .header .name-block {
            margin-bottom: 6px;
        }
        .header h1 {
            font-size: 19px;
            color: #1e293b;
            margin: 0 0 1px 0;
            font-weight: 700;
            letter-spacing: 0.4px;
        }
        .header .employee-id {
            font-size: 10px;
            color: #64748b;
            margin: 0 0 5px 0;
            font-weight: 400;
        }
        .header .accent-bar {
            height: 3px;
            background: #0d9488;
            width: 50px;
            margin: 0 0 8px 0;
        }
        .header .contact-row {
            font-size: 8.5px;
            color: #475569;
        }
        .header .contact-row .sep {
            color: #94a3b8;
            margin: 0 6px;
        }

        /* ===== Sections ===== */
        .section {
            margin-bottom: 14px;
        }
        .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #0f766e;
            background: #f0fdfa;
            padding: 5px 8px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        /* ===== Details (Key-Value) Tables ===== */
        table.details {
            width: 100%;
            border-collapse: collapse;
        }
        table.details td {
            padding: 2.5px 6px;
            vertical-align: top;
        }
        table.details .label {
            font-weight: 600;
            color: #475569;
            width: 130px;
            white-space: nowrap;
        }
        table.details .value {
            color: #1e293b;
        }

        /* ===== Two-Column Layout Table ===== */
        table.two-col {
            width: 100%;
            border-collapse: collapse;
        }
        table.two-col td {
            vertical-align: top;
            width: 50%;
        }
        table.two-col .left-col {
            padding-right: 10px;
        }
        table.two-col .right-col {
            padding-left: 10px;
        }

        /* ===== Data Tables (Education, Experience, Certifications) ===== */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2px;
        }
        table.data-table th {
            background: #0f766e;
            color: #ffffff;
            padding: 4px 7px;
            text-align: left;
            font-size: 8.5px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        table.data-table td {
            padding: 3.5px 7px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 8.5px;
        }
        table.data-table tr:nth-child(even) td {
            background: #f8fafc;
        }
        table.data-table tr:nth-child(odd) td {
            background: #ffffff;
        }

        /* ===== Status Badges ===== */
        .badge {
            display: inline-block;
            padding: 1.5px 8px;
            font-size: 7.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .badge-active {
            background: #d1fae5;
            color: #065f46;
        }
        .badge-inactive {
            background: #fee2e2;
            color: #991b1b;
        }
        .badge-valid {
            background: #d1fae5;
            color: #065f46;
        }
        .badge-expired {
            background: #fef3c7;
            color: #92400e;
        }
        .status-na {
            color: #94a3b8;
            font-style: italic;
        }

        /* ===== Footer ===== */
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            color: #94a3b8;
            font-size: 7.5px;
        }
        .footer p {
            margin: 2px 0;
        }
    </style>
</head>
<body>

    <!-- ============================================================ -->
    <!-- HEADER                                                         -->
    <!-- ============================================================ -->
    <div class="header">
        <div class="name-block">
            <h1>{{ $staff->full_name }}</h1>
            <div class="employee-id">Employee ID: {{ $staff->employee_id }}</div>
        </div>
        <div class="accent-bar"></div>
        <div class="contact-row">
            Email: {{ $staff->email ?? 'N/A' }}<span class="sep">|</span>
            Phone: {{ $staff->phone ?? 'N/A' }}<span class="sep">|</span>
            Mobile: {{ $staff->mobile ?? 'N/A' }}
        </div>
    </div>

    <!-- ============================================================ -->
    <!-- TWO-COLUMN: PERSONAL + PROFESSIONAL INFORMATION                -->
    <!-- ============================================================ -->
    <table class="two-col">
        <tr>
            <!-- LEFT COLUMN: Personal Information -->
            <td class="left-col">
                <div class="section">
                    <div class="section-title">Personal Information</div>
                    <table class="details">
                        <tr>
                            <td class="label">Date of Birth</td>
                            <td class="value">{{ $staff->date_of_birth ? $staff->date_of_birth->format('d M Y') : 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">Age</td>
                            <td class="value">{{ $staff->date_of_birth ? $staff->date_of_birth->age . ' years' : 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">National ID</td>
                            <td class="value">{{ $staff->national_id ?? 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">Gender</td>
                            <td class="value">{{ $staff->gender ? ucfirst($staff->gender) : 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">Nationality</td>
                            <td class="value">{{ $staff->nationality ?? 'N/A' }}</td>
                        </tr>
                    </table>
                </div>
            </td>

            <!-- RIGHT COLUMN: Professional Information -->
            <td class="right-col">
                <div class="section">
                    <div class="section-title">Professional Information</div>
                    <table class="details">
                        <tr>
                            <td class="label">PHC Center</td>
                            <td class="value">{{ optional($staff->center)->name ?? 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">Department</td>
                            <td class="value">{{ optional($staff->department)->name ?? 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">Role Name</td>
                            <td class="value">{{ optional($staff->professional)->name ?? 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">Clinic Assignment</td>
                            <td class="value">{{ optional($staff->clinicAssignment)->name ?? 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">Employment Type</td>
                            <td class="value">{{ $staff->employment_type ? ucfirst(str_replace('_', ' ', $staff->employment_type)) : 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">Hire Date</td>
                            <td class="value">{{ $staff->hire_date ? $staff->hire_date->format('d M Y') : 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="label">Status</td>
                            <td class="value">
                                @if($staff->is_active)
                                    <span class="badge badge-active">Active</span>
                                @else
                                    <span class="badge badge-inactive">Inactive</span>
                                @endif
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <!-- ============================================================ -->
    <!-- SCFHS REGISTRATION                                             -->
    <!-- ============================================================ -->
    <div class="section">
        <div class="section-title">SCFHS Registration</div>
        <table class="details">
            <tr>
                <td class="label">Registration No</td>
                <td class="value">{{ $staff->scfhs_registration_no ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Issue Date</td>
                <td class="value">{{ $staff->scfhs_issue_date ? $staff->scfhs_issue_date->format('d M Y') : 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Expiry Date</td>
                <td class="value">{{ $staff->scfhs_expiry_date ? $staff->scfhs_expiry_date->format('d M Y') : 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Status</td>
                <td class="value">
                    @php
                        $scfhsValid = $staff->scfhs_expiry_date && $staff->scfhs_expiry_date->isFuture();
                    @endphp
                    @if($staff->scfhs_registration_no)
                        @if($scfhsValid)
                            <span class="badge badge-valid">Valid</span>
                        @else
                            <span class="badge badge-expired">Expired</span>
                        @endif
                    @else
                        <span class="status-na">N/A</span>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <!-- ============================================================ -->
    <!-- MALPRACTICE INSURANCE                                          -->
    <!-- ============================================================ -->
    <div class="section">
        <div class="section-title">Malpractice Insurance</div>
        <table class="details">
            <tr>
                <td class="label">Policy No</td>
                <td class="value">{{ $staff->malpractice_insurance_no ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Issue Date</td>
                <td class="value">{{ $staff->malpractice_issue_date ? $staff->malpractice_issue_date->format('d M Y') : 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Expiry Date</td>
                <td class="value">{{ $staff->malpractice_expiry_date ? $staff->malpractice_expiry_date->format('d M Y') : 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Status</td>
                <td class="value">
                    @php
                        $malpracticeValid = $staff->malpractice_expiry_date && $staff->malpractice_expiry_date->isFuture();
                    @endphp
                    @if($staff->malpractice_insurance_no)
                        @if($malpracticeValid)
                            <span class="badge badge-valid">Valid</span>
                        @else
                            <span class="badge badge-expired">Expired</span>
                        @endif
                    @else
                        <span class="status-na">N/A</span>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <!-- ============================================================ -->
    <!-- EDUCATIONAL DEGREES                                             -->
    <!-- ============================================================ -->
    @if($staff->educationalDegrees->isNotEmpty())
    <div class="section">
        <div class="section-title">Educational Degrees</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Degree</th>
                    <th>Institution</th>
                    <th>GPA</th>
                    <th>Year</th>
                </tr>
            </thead>
            <tbody>
                @foreach($staff->educationalDegrees as $degree)
                <tr>
                    <td>{{ $degree->name ?? $degree->pivot->degree_field ?? 'N/A' }}</td>
                    <td>{{ $degree->pivot->institution ?? 'N/A' }}</td>
                    <td>
                        @if($degree->pivot->gpa_value)
                            {{ $degree->pivot->gpa_value }} {{ $degree->pivot->gpa_type ? '(' . $degree->pivot->gpa_type . ')' : '' }}
                        @else
                            N/A
                        @endif
                    </td>
                    <td>{{ $degree->pivot->year_obtained ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- ============================================================ -->
    <!-- EXPERIENCE                                                     -->
    <!-- ============================================================ -->
    @if($staff->experiences->isNotEmpty())
    <div class="section">
        <div class="section-title">Experience</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Company</th>
                    <th>Position</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                @foreach($staff->experiences as $exp)
                <tr>
                    <td>{{ $exp->company }}</td>
                    <td>{{ $exp->position ?? 'N/A' }}</td>
                    <td>{{ $exp->from_date ? $exp->from_date->format('M Y') : 'N/A' }}</td>
                    <td>
                        @if($exp->is_current)
                            Present
                        @else
                            {{ $exp->to_date ? $exp->to_date->format('M Y') : 'N/A' }}
                        @endif
                    </td>
                    <td>{{ $exp->description ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- ============================================================ -->
    <!-- CERTIFICATIONS                                                 -->
    <!-- ============================================================ -->
    @if($staff->certifications->isNotEmpty())
    <div class="section">
        <div class="section-title">Certifications</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Organization</th>
                    <th>Issue Date</th>
                    <th>Expiry Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach($staff->certifications as $cert)
                <tr>
                    <td>{{ $cert->name }}</td>
                    <td>{{ $cert->issuing_organization ?? 'N/A' }}</td>
                    <td>{{ $cert->issue_date ? $cert->issue_date->format('d M Y') : 'N/A' }}</td>
                    <td>{{ $cert->expiry_date ? $cert->expiry_date->format('d M Y') : 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- ============================================================ -->
    <!-- FOOTER                                                        -->
    <!-- ============================================================ -->
    <div class="footer">
        <p>PHC Evaluation System - Curriculum Vitae</p>
        <p>Generated on {{ now()->format('d F Y, h:i A') }}</p>
    </div>

</body>
</html>
