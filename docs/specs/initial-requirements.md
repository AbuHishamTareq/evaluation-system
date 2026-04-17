# 🏥 PHC Evaluation & Quality Management SaaS Platform

## Initial Requirements Document (IRD) v1.0

> **Project Code**: PHC-EVAL-SA  
> **Document Status**: Draft for Stakeholder Review  
> **Last Updated**: 2024-05-20  
> **Prepared For**: Primary Healthcare Centers — Saudi Arabia  
> **Prepared By**: System Analysis Team

---

## 📑 Table of Contents

1. [Vision & Scope](#1-vision--scope)
2. [Target Users & RBAC](#2-target-users--rbac)
3. [Functional Requirements](#3-functional-requirements)
4. [Technical Architecture](#4-technical-architecture)
5. [Security & Compliance](#5-security--compliance)
6. [MVP Release Plan](#6-mvp-release-plan)
7. [Risk Register](#7-risk-register)
8. [Appendices](#8-appendices)

---

## 1. Vision & Scope

### 🎯 Vision Statement

> _"To empower Primary Healthcare Centers (PHCs) across Saudi Arabia with a centralized, bilingual SaaS platform that streamlines evaluations, prevents medication errors, optimizes nursing workforce management, and drives continuous quality improvement through actionable plans — ultimately elevating patient safety and operational efficiency."_

### Full Project Structure (Monorepo Style)

evaluation/
├── backend/ (Laravel API)
├── frontend/ (React PWA)
├── docs/
├── docker/
├── scripts/
└── README.md

### Backend Structure (Laravel – Clean Architecture)

backend/
├── app/
│ ├── Http/
│ │ ├── Controllers/
│ │ │ ├── API/
│ │ │ │ ├── V1/
│ │ │
│ │ ├── Requests/
│ │ │
│ │ ├── Resources/ (API Transformers)
│ │ └── Middleware/
│ │
│ ├── Services/
│ │
│ ├── Repositories/
│ │ ├── Interfaces/
│ │ │
│ │ └── Eloquent/
│ │
│ ├── Models/
│ │
│ ├── Jobs/ (Queues - Redis)
│ │
│ ├── Events/
│ │
│ ├── Listeners/
│ │
│ ├── Policies/ (RBAC)
│ ├── Traits/
│ ├── Helpers/
│ │
│ └── Providers/
│
├── routes/
│ ├── api.php
│ └── web.php
│
├── database/
│ ├── migrations/
│ ├── seeders/
│ └── factories/
│
├── config/
├── storage/
├── tests/
│ ├── Feature/
│ └── Unit/
│
├── bootstrap/
├── public/
└── artisan

### Backend Architecture Flow (How It Works)

Request → Controller → Service → Repository → Model → DB

### Frontend Structure (React + Vite + PWA)

frontend/
├── src/
│ ├── app/
│ │ ├── store.ts
│ │ ├── router.tsx
│ │ └── providers/
│ │ └── I18nProvider.tsx
│ │
│ ├── localization/ ✅ NEW (centralized i18n)
│ │ ├── en.json
│ │ ├── ar.json
│ │ └── index.tss
│ │
│ ├── modules/
│ ├── shared/
│ ├── services/
│ ├── pwa/
│ ├── assets/
│ ├── styles/
│ ├── main.tsx
│ └── App.tsx

### 📋 MVP Scope (Phase 1)

| Module                                | Core Capabilities                                                                             | Priority     |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | ------------ |
| **Patient Safety Incident Reporting** | Log 5 incident types, automated workflows, RCA templates                                      | 🔴 Must-Have |
| **Medication Control & Tracking**     | Storage→Prescribed→Administered→Verified; risk alerts; expiry/shortage tracking               | 🔴 Must-Have |
| **HR Management & Staffing**          | Full staff profiles, shortage prediction, shift swap workflows                                | 🔴 Must-Have |
| **Service Evaluations**               | Importable question banks (MC, rating, essay), auto/manual action plans, evidence attachments | 🔴 Must-Have |
| **Team-Based Issue Tracking**         | Status workflows, @mentions, audit-linked resolution                                          | 🔴 Must-Have |
| **PHC Management Dashboard**          | KPIs (incidents, eval %, staffing gaps), drill-down, Arabic/Excel export                      | 🔴 Must-Have |

### 🌟 Phase 2+ (Nice-to-Have)

- AI-powered analytics & auto-reporting
- Advanced regulatory compliance modules (CBAHI/NCA)
- Patient-facing feedback portal
- Mobile barcode scanning for medication verification

### 🚫 Explicitly Out of Scope (All Phases)

- Replacement of existing Electronic Health Record (EHR) systems
- Payroll or financial accounting functionality
- Clinical decision support or diagnostic tools

### 🌐 Deployment & Localization

- **Model**: Multi-tenant SaaS, centralized management console
- **Region**: Saudi Arabia (primary), architecture ready for GCC expansion
- **Languages**: Full bilingual support (English/Arabic) with RTL layout compatibility
- **Data Residency**: Hosted within Saudi borders (recommended for compliance readiness)

### 📈 Success Metrics (12-Month Targets)

| KPI                        | Target                                    | Measurement Method        |
| -------------------------- | ----------------------------------------- | ------------------------- |
| Medication error reduction | ≥ 30% decrease                            | Incident report analytics |
| Evaluation cycle time      | ≤ 48 hours per evaluation                 | Workflow timestamp audit  |
| Issue resolution rate      | ≥ 80% assigned action plans within 7 days | Issue tracking dashboard  |
| User adoption              | ≥ 90% of targeted staff active            | Login/usage analytics     |
| Offline sync success       | ≥ 95% after connectivity restore          | PWA sync logs             |

---

## 2. Target Users & RBAC

### 👥 User Personas

| Role                         | Primary Responsibilities              | Key System Actions                                                          |
| ---------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| **PHC Clinic Manager**       | Oversee daily clinic operations       | View clinic dashboard, approve action plans, manage staff assignments       |
| **Head Nurse / Supervisor**  | Manage nursing staff & workflows      | Evaluate nurses, monitor medication logs, report incidents                  |
| **Staff Nurse / Pharmacist** | Deliver care & administer meds        | Log medication administration, report incidents, view personal evaluations  |
| **QA / Compliance Officer**  | Ensure quality & regulatory adherence | Run audit reports, track incident resolution, review evaluation compliance  |
| **HR Administrator**         | Manage staff records & staffing       | Update staff profiles, track certifications, monitor shortage alerts        |
| **Regional Head Supervisor** | Oversee multiple PHCs in a region     | Compare regional metrics, escalate critical issues, approve regional plans  |
| **Main Office Analyst**      | Strategic oversight & policy          | Aggregate analytics, set evaluation templates, configure system-wide rules  |
| **Doctor**                   | Clinical care & prescriptions         | Review medication logs, contribute to safety reports, view team evaluations |
| **IT/System Administrator**  | Technical maintenance                 | Manage users, configure integrations, monitor system health                 |

### 🔐 Role-Based Access Control (RBAC) Matrix

| Permission                | Main Office | Regional Supervisor | PHC Manager | Dept. Head | Staff |
| ------------------------- | ----------- | ------------------- | ----------- | ---------- | ----- |
| View All PHCs             | ✅          | ✅ (Region only)    | ❌          | ❌         | ❌    |
| View Own PHC/Dept         | ✅          | ✅                  | ✅          | ✅         | ✅    |
| Create/Edit Evaluations   | ✅          | ❌                  | ❌          | ❌         | ❌    |
| Submit Incident Report    | ✅          | ✅                  | ✅          | ✅         | ✅    |
| Manage Staff Profiles     | ✅          | ✅                  | ✅          | ❌         | ❌    |
| Configure System Settings | ✅          | ❌                  | ❌          | ❌         | ❌    |
| Export Reports            | ✅          | ✅                  | ✅          | ❌         | ❌    |

> _Note: Regional/PHC/Dept dashboards automatically filter data to match the user's organizational scope._

### 🔐 Access Control Rules

- **Data Isolation**: All queries automatically filtered by `tenant_id` + organizational hierarchy
- **No External Access**: System closed to external auditors/patients (Phase 1)
- **Audit Trail**: Immutable log of all data access and modifications:  
  `user_id | role | timestamp | IP | action | record_type | record_id | before_value | after_value`

---

## 3. Functional Requirements

### 🔄 Cross-Cutting Features

| Requirement            | Description                                                                          | Acceptance Criteria                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Bilingual UI**       | Dynamic Arabic/English toggle with RTL layout engine                                 | All UI components render correctly in both languages; RTL mirrors layout without breaking forms/tables                                |
| **Data Import/Export** | CSV/Excel import with Arabic column mapping; export to PDF/Excel with RTL formatting | Import validates structure, rejects invalid rows with downloadable error log; exports preserve Arabic text and RTL alignment          |
| **Workflow Engine**    | Configurable routing rules, SLA timers, escalation paths, notification templates     | Admin can create/modify workflows via UI; notifications trigger on schedule; escalations auto-assign when SLA breached                |
| **Audit Logging**      | Immutable trail of all create/update/delete/export actions                           | Logs cannot be modified/deleted by any user; exportable for compliance reviews                                                        |
| **Offline-First PWA**  | Service Worker + IndexedDB for offline data capture and background sync              | Users can complete forms offline; sync resumes automatically when connectivity restores; conflict resolution UI for overlapping edits |

### 📦 Module Specifications

#### Module 1: Patient Safety Incident Reporting

| ID     | Requirement                                                                       | Acceptance Criteria                                                                                                                                   |
| ------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1.1 | Log incidents by type: Medication Error, Storage, Treatment, Equipment, Near-Miss | Dropdown selector; mandatory fields vary by incident type; validation prevents submission of incomplete reports                                       |
| FR-1.2 | Automated workflow routing based on severity/type                                 | High-severity incidents auto-assign to QA/Manager within 1 hour; email + in-app notification triggered                                                |
| FR-1.3 | Structured RCA templates + free-text support                                      | Template includes: Root Cause, Contributing Factors, Corrective Action, Responsible Owner, Due Date; free-text field available for additional context |

#### Module 2: Medication Control & Administration Tracking

| ID     | Requirement                                                                                                      | Acceptance Criteria                                                                                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-2.1 | Track lifecycle: Storage → Shortage → Quantities → Expiration → Prescribed → Dispensed → Administered → Verified | Each step logs timestamp, user ID, and status; requires verification before progression; audit trail visible per medication batch                                            |
| FR-2.2 | Risk flagging engine                                                                                             | Alerts for: low stock (< threshold), near-expiry (<30 days), duplicate therapy, allergy conflicts, missed verification; alerts appear in dashboard + notify responsible role |
| FR-2.3 | Mobile barcode scanning _(Phase 2)_                                                                              | UI placeholder reserved; backend API designed to accept barcode payload; no frontend implementation in MVP                                                                   |

#### Module 3: HR Management & Staffing

| ID     | Requirement                  | Acceptance Criteria                                                                                                                                                           |
| ------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-3.1 | Comprehensive staff profiles | Fields: Personal Info, Region, Team-Based Code, SCFHS License, Malpractice Insurance, Certifications, Evaluation History, Employment Status; all fields searchable/filterable |
| FR-3.2 | Staff shortage prediction    | Rule-based alert when coverage < configurable threshold (e.g., nurse:patient ratio, unapproved leave, expiring certifications); alert appears in manager dashboard            |
| FR-3.3 | Shift swap/request workflow  | Submit → Supervisor Approval → System Update → Audit Log; conflict detection prevents overlapping shift approvals; notifications to affected staff                            |

#### Module 4: Service Evaluations & Action Plans

| ID     | Requirement                           | Acceptance Criteria                                                                                                                        |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-4.1 | Dynamic question builder (importable) | Supports CSV/Excel import; question types: Multiple Choice, Multi-Select, Star Rating (1-5), Essay; questions grouped by domain/category   |
| FR-4.2 | Auto/Manual action plan generation    | Auto-trigger if evaluation score < configurable threshold; managers can manually create/edit/assign action plans with due dates and owners |
| FR-4.3 | Evidence attachment                   | Upload PDFs, images, docs (max 25MB); virus-scanned on upload; files linked to evaluation record; preview available in UI                  |

#### Module 5: Team-Based Issue Tracking

| ID     | Requirement         | Acceptance Criteria                                                                                                          |
| ------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| FR-5.1 | Status workflow     | Reported → Assigned → In Progress → Resolved → Verified; status changes trigger notifications to assignee and reporter       |
| FR-5.2 | Collaboration tools | Comments, @mentions, file attachments in-thread; @mentioned users receive in-app + email notification                        |
| FR-5.3 | Audit linkage       | Resolved issues auto-link to source evaluation/incident; visible in audit trail and report exports; clickable back-reference |

#### Module 6: PHC Management Dashboard

| ID     | Requirement            | Acceptance Criteria                                                                                                                                          |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-6.1 | KPI visualization      | Display: Open incidents count, Evaluation completion %, Staffing gaps count, Operational readiness score (vs Region vs National); charts update in real-time |
| FR-6.2 | Drill-down capability  | Click KPI → filter by Region → PHC → Department; respects RBAC data scope; breadcrumb navigation for easy back-tracking                                      |
| FR-6.3 | Export & Import engine | Export PDF/Excel with Arabic/RTL formatting; Bulk import CSV/Excel with validation, preview, and downloadable error report                                   |

---

## 4. Technical Architecture

### ⚙️ Technology Stack

| Layer            | Technology                               | Version | Purpose                                                                          |
| ---------------- | ---------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| Frontend         | React (TypeScript) + Vite + PWA          | 19.x    | Component-driven UI, Tailwind CSS, offline-ready via Service Workers & IndexedDB |
| State Management | Zustand / Redux Toolkit                  | Latest  | Predictable state for offline queue, user session, RTL toggle                    |
| Backend          | Laravel                                  | 13.x    | RESTful API, authentication, queue workers, multi-tenancy middleware             |
| Database         | MySQL                                    | 8.0+    | Relational data + JSON columns for dynamic evaluation forms                      |
| Caching/Queues   | Redis                                    | 7.x     | Session storage, rate limiting, async job processing                             |
| File Storage     | S3-compatible (Saudi region)             | -       | Encrypted storage for attachments, exports, backups                              |
| Search           | MySQL Full-Text / Meilisearch (optional) | -       | Staff/profile search, incident lookup                                            |

### 🌐 Offline-First PWA Strategy

```javascript
// Service Worker: Background Sync Registration
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-evaluations') {
    event.waitUntil(syncPendingEvaluations());
  }
});

// IndexedDB Schema Concept
const dbSchema = {
  evaluations: { fields: ['id', 'phc_id', 'staff_id', 'answers', 'sync_status'] },
  incidents: { fields: ['id', 'type', 'severity', 'description', 'sync_status'] },
  medication_logs: { fields: ['id', 'patient_id', 'drug_id', 'step', 'verified', 'sync_status'] }
};

// Conflict Resolution Strategy
function resolveConflict(localRecord, serverRecord) {
  if (localRecord.lastModified > serverRecord.lastModified) {
    return 'keep_local'; // Last-write-wins for non-clinical data
  } else if (isClinicalData(localRecord)) {
    return 'flag_for_review'; // Manual review for medication/incident records
  }
  return 'keep_server';
}

### 🗄️ Required MVP Tables (AI Implementation Scope)
- `users`, `roles`, `permissions`, `role_has_permissions` (Spatie/Laravel-Permission)
- `phc_centers`, `regions`, `tenants`
- `staff_profiles`, `shifts`, `shift_requests`
- `incident_reports`, `incident_rca`, `incident_workflows`
- `medication_batches`, `medication_logs`, `medication_alerts`
- `evaluation_templates`, `evaluations`, `evaluation_responses`, `action_plans`
- `issues`, `issue_comments`, `issue_assignments`
- `audit_logs`, `import_logs`, `sync_queues`
- `settings`, `notifications`, `files`

## Deployment Architecture
[React PWA Client]
       ↓ HTTPS/TLS 1.3
[Laravel API Gateway + Sanctum Auth]
       ↓
[Redis: Cache + Queue + Sessions]
       ↓
[MySQL 8.0 Cluster: Primary + Read Replica]
       ↓
[Backup Server: Hourly Incremental + Daily Full]
       ↓
[DR Replica: Async replication to secondary Saudi region]

Network Security:
- VPC with private subnets for DB/Redis
- WAF + DDoS protection at edge
- Bastion host for SSH access (MFA required)
- All traffic encrypted in transit (TLS 1.3)

## Security & Compliance
- Data Protection Framework: Check @docs/excel/data-protection-framework.xlsx for details

- Data Retention & Recovery: Check @docs/excel/ data-retention-recovery.xlsx for details

- Recovery Objectives (Recommended):
    - RPO (Recovery Point Objective): ≤ 2 hours (hourly incremental backups)
    - RTO (Recovery Time Objective): ≤ 4 hours (hot standby + scripted restore)
    - Testing: Quarterly DR drills with documented runbooks

    - Compliance-Ready Design
        - Architecture designed for future alignment with:
        - Saudi CBAHI accreditation standards
        - National Cybersecurity Authority (NCA) Essential Cybersecurity Controls
        - Saudi Data & AI Authority (SDAIA) Personal Data Protection Law
    - Consent tracking hooks, breach notification workflows, and data subject request APIs designed but disabled until required

## Foundation Deliverables
- Repository setup (Git) + CI/CD pipeline (GitHub Actions/GitLab CI)
- Laravel + React boilerplate with RTL support
- MySQL schema migration scripts + seed data
- Authentication scaffold (Sanctum + custom password policy)
- PWA manifest + Service Worker registration
- Docker Compose for local development

## MVP Launch Criteria (Go/No-Go Gates)
Check @docs/excel/mvp-launch-criteria.xlsx for details

## Risk Register
Check @docs/excel/risk-register.xlsx for details
```
