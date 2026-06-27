# Medication Evaluation Module — UI Design Specification

> **Project**: PHC Evaluation System  
> **Stack**: React 19 + TypeScript + Tailwind CSS  
> **Design Language**: Matches existing evaluation module (teal/emerald/cyan gradient accents, glass cards, soft shadows, rounded-2xl containers, hover animations)

---

## Table of Contents

1. [Color & Visual Strategy](#1-color--visual-strategy)
2. [Page 1: Templates List (`TemplatesPage`)](#2-page-1-medication-evaluation-templates-list)
3. [Page 2: Template Builder (`TemplateBuilderPage`)](#3-page-2-template-builder)
4. [Page 3: Evaluations List (`EvaluationsListPage`)](#4-page-3-medication-evaluations-list)
5. [Page 4: Evaluation Taking (`EvaluationTakingPage`)](#5-page-4-medication-evaluation-taking)
6. [Page 5: Evaluation Results (`EvaluationResultPage`)](#6-page-5-medication-evaluation-results)
7. [Component API Specifications](#7-component-apis)
8. [TypeScript Data Structures](#8-typescript-data-structures)
9. [State Management](#9-state-management)
10. [Routing & File Layout](#10-routing--file-layout)
11. [Accessibility & RTL](#11-accessibility--rtl)
12. [Key Interaction Patterns](#12-key-interaction-patterns)

---

## 1. Color & Visual Strategy

### Module Color Palette
The medication evaluation module uses a **teal/emerald/cyan** accent palette (consistent with the existing evaluation module).

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| Gradient Primary | `from-emerald-500 to-teal-500` | Primary buttons, active tabs, header icons |
| Gradient Secondary | `from-teal-500 to-cyan-500` | Secondary CTAs, progress bars, toggle active |
| Badge — Draft | `bg-slate-100 text-slate-600` | Draft evaluation status |
| Badge — In Progress | `bg-blue-100 text-blue-700` | In-progress status |
| Badge — Completed | `bg-emerald-100 text-emerald-700` | Completed status |
| Badge — Archived | `bg-purple-100 text-purple-700` | Archived status |
| Badge — Active | `bg-emerald-100 text-emerald-700` | Active template status |
| Badge — Inactive | `bg-slate-100 text-slate-500` | Inactive template status |
| Criterion input — number | `bg-blue-50 border-blue-200` | Numeric answer input wrap |
| Criterion input — yes_no | `bg-amber-50 border-amber-200` | Yes/No toggle wrap |
| Criterion input — text | `bg-slate-50 border-slate-200` | Text answer input wrap |
| Score — high | `text-emerald-600` | Score ≥ 80% |
| Score — medium | `text-amber-600` | Score ≥ 60% |
| Score — low | `text-red-600` | Score < 60% |
| Page header gradient | `from-emerald-600 to-teal-600 bg-clip-text text-transparent` | All page titles |
| Stat card 1 | `from-emerald-500 to-teal-500` | Total evaluations |
| Stat card 2 | `from-blue-500 to-indigo-500` | In progress |
| Stat card 3 | `from-slate-400 to-slate-500` | Drafts |
| Medication header pill | `bg-amber-100 text-amber-700` | Allocation location badge |
| Quantity badge | `bg-cyan-100 text-cyan-700` | Recommended quantity display |
| Criteria section | `bg-gradient-to-r from-teal-500/5 to-cyan-500/5` | Subtle background for criteria rows |
| Template accent | `h-2 bg-gradient-to-r from-teal-500 to-cyan-500` | Top accent bar on template cards |

### Typography & Spacing
- Consistent with existing: `Inter` font (via Tailwind), 4px base spacing unit
- Section titles: `text-lg font-bold text-slate-800`
- Metric labels: `text-[11px] font-semibold text-slate-400 uppercase tracking-wider`
- Data values: `text-sm font-semibold text-slate-800`

---

## 2. Page 1: Medication Evaluation Templates List

### File: `pages/medication-evaluations/TemplatesPage.tsx`

### URL: `/medication-evaluations/templates`

### Wireframe Description

```
┌──────────────────────────────────────────────────────────────────────┐
│ [← Back]  Medication Evaluation Templates                           │
│ (breadcrumb)  [Search...]  [Status: All ▼]  [Create Template  ＋]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────┐                   │
│  │  Template Cards Grid (1 → 3 cols)              │                   │
│  │                                                │                   │
│  │  ┌─────────────────┐  ┌─────────────────┐      │                   │
│  │  │ [teal bar top]  │  │ [teal bar top]  │      │                   │
│  │  │                 │  │                 │      │                   │
│  │  │ 📋 Template A   │  │ 📋 Template B   │      │                   │
│  │  │ Description...  │  │ Description...  │      │                   │
│  │  │                 │  │                 │      │                   │
│  │  │ 6 meds · 4 crit │  │ 8 meds · 6 crit │      │                   │
│  │  │ Active badge    │  │ Inactive badge  │      │                   │
│  │  │                 │  │                 │      │                   │
│  │  │ [Edit] [Delete] │  │ [Edit] [Delete] │      │                   │
│  │  └─────────────────┘  └─────────────────┘      │                   │
│  └───────────────────────────────────────────────┘                   │
│                                                                      │
│  Pagination: [< Prev] [1] [2] [3] ... [Next >]                      │
│                                                                      │
│  ┌─── Detail Panel (shown when a template is selected) ────────────┐ │
│  │  [teal gradient line top]                                       │ │
│  │  Template Name                              [Deactivate] [Delete]│ │
│  │  Description text                                                │ │
│  │  ┌────────┬────────┬────────┬────────┐                          │ │
│  │  │Schedule│ # Meds │# Criter│ Status │                          │ │
│  │  │ One    │      6 │      4 │ Active │                          │ │
│  │  │ Time   │        │        │        │                          │ │
│  │  └────────┴────────┴────────┴────────┘                          │ │
│  │                                                                  │ │
│  │  Medications in this template: 6                                 │ │
│  │  [List of medication names with strength/form pills]             │ │
│  │                                                                  │ │
│  │  Criteria defined: 4                                             │ │
│  │  1. No. of Availability  [type: number] [weight: 3]              │ │
│  │  2. Accessibility        [type: yes_no] [weight: 2]              │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout Structure

```tsx
<div className="space-y-6">
  {/* ── Page Header ── */}
  <PageHeader
    title="Medication Evaluation Templates"
    subtitle="Create and manage medication evaluation templates"
    actions={[<CreateTemplateButton />]}
  />

  {/* ── Stats Row ── */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <StatCard title="Total Templates" value={stats.total} gradient="from-emerald-500 to-teal-500" icon={...} />
    <StatCard title="Active" value={stats.active} gradient="from-blue-500 to-indigo-500" icon={...} />
    <StatCard title="Draft/Inactive" value={stats.inactive} gradient="from-slate-400 to-slate-500" icon={...} />
    <StatCard title="Total Criteria" value={stats.totalCriteria} gradient="from-teal-500 to-cyan-500" icon={...} />
  </div>

  {/* ── Search + Filter Bar ── */}
  <Card variant="outlined" padding="md" className="mb-6">
    <form className="flex flex-wrap gap-3 items-end">
      <SearchInput placeholder="Search templates..." />
      <Select label="Status" options={['All', 'Active', 'Inactive']} />
      <Button type="submit" variant="outline">Search</Button>
      <Button type="reset" variant="ghost">Clear</Button>
    </form>
  </Card>

  {/* ── Template Card Grid ── */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {templates.map(t => <MedicationEvalTemplateCard key={t.id} template={t} ... />)}
  </div>

  {/* ── Detail Panel (conditional) ── */}
  {selectedTemplate && <TemplateDetailPanel template={selectedTemplate} ... />}

  {/* ── Pagination ── */}
  {pagination.totalPages > 1 && <Pagination ... />}

  {/* ── Create/Edit Modal ── */}
  <Modal> ... </Modal>

  {/* ── Delete Confirm Modal ── */}
  <Modal> ... </Modal>
</div>
```

### Template Card Component

Props:
```tsx
interface MedicationEvalTemplateCardProps {
  template: MedicationEvalTemplate;
  onSelect: (template: MedicationEvalTemplate) => void;
  onEdit: (template: MedicationEvalTemplate) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}
```

Card layout (matches existing `TemplateCard` pattern):
- Top accent bar: `h-2 bg-gradient-to-r from-teal-500 to-cyan-500`
- Icon area: `w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500` with clipboard/list icon
- Template name: `font-semibold text-slate-800`
- Description: `text-sm text-slate-500 line-clamp-2`
- Meta row: `text-xs text-slate-400` — e.g., "6 medications · 4 criteria"
- Status badge (Active/Inactive) — absolute positioned top-right
- Hover-reveal action buttons: Edit, Delete
- On hover: `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`

### Detail Panel

Props:
```tsx
interface TemplateDetailPanelProps {
  template: MedicationEvalTemplate;
  medications: TemplateMedicationEntry[];
  criteria: TemplateCriterion[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}
```

- Gradient accent line at top: `h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500`
- Header: name + status badge + action buttons
- Stats row: 4 metric cards (Schedule, Medications, Criteria, Status)
- Medications section: list of pills/chips showing name + strength + form
- Criteria section: numbered list with type badge and weight badge (same pattern as existing template detail)
- Empty state for no medications/criteria

### States

| State | Visual |
|-------|--------|
| **Loading** | Centered spinner: `animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600` |
| **Empty** | Gradient icon + "No templates yet" + description + CTAs |
| **Error** | Red banner with dismiss (matching existing pattern) |
| **Populated** | Card grid + detail panel + pagination |

---

## 3. Page 2: Template Builder

### File: `pages/medication-evaluations/TemplateBuilderPage.tsx`

### URL: `/medication-evaluations/templates/create` and `/medication-evaluations/templates/:id/edit`

### Wireframe Description

```
┌──────────────────────────────────────────────────────────────────────┐
│  [← Back to Templates]                                              │
│  Create Medication Evaluation Template                               │
│  ─── Section 1: Template Info ────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Template Info                                                │   │
│  │                                                               │   │
│  │  Template Name *        [_____________________________]      │   │
│  │                                                               │   │
│  │  Description              [_____________________________]    │   │
│  │                           [_____________________________]    │   │
│  │                                                               │   │
│  │  Is Active                [═══════●═══════════════]  Active   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ─── Section 2: Select Medications ──────────────────────────────   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Medications                                                  │   │
│  │                                                               │   │
│  │  [Search and select medications...  🔍]                      │   │
│  │                                                               │   │
│  │  Selected Medications (3):                                    │   │
│  │                                                               │   │
│  │  ┌────────────────────────────────────────────────────────┐   │   │
│  │  │ ⠿ Paracetamol · 500mg · Tablet                       │   │   │
│  │  │   Recommended Qty: [ 100    ]  Location: [Shelf A3  ] │   │   │
│  │  │   [▲] [▼] [✕]                                        │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────────┐   │   │
│  │  │ ⠿ Amoxicillin · 250mg · Capsule                      │   │   │
│  │  │   Recommended Qty: [ 50     ]  Location: [Fridge B1 ] │   │   │
│  │  │   [▲] [▼] [✕]                                        │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────────┐   │   │
│  │  │ ⠿ Insulin Glargine · 100IU · Injection                │   │   │
│  │  │   Recommended Qty: [ 20     ]  Location: [Fridge A2 ] │   │   │
│  │  │   [▲] [▼] [✕]                                        │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ─── Section 3: Define Criteria ────────────────────────────────     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Criteria                                                     │   │
│  │                                                               │   │
│  │  ┌────────────────────────────────────────────────────────┐   │   │
│  │  │ 1  Criterion Name *  Type ▼  Weight *       [▲] [▼] [✕]│   │   │
│  │  │    [No. of Availab..] [number  ▼] [  3  ]              │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────────┐   │   │
│  │  │ 2  Criterion Name *  Type ▼  Weight *       [▲] [▼] [✕]│   │   │
│  │  │    [Accessibility   ] [yes_no  ▼] [  2  ]              │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────────┐   │   │
│  │  │ 3  Criterion Name *  Type ▼  Weight *       [▲] [▼] [✕]│   │   │
│  │  │    [Comments        ] [text    ▼] [  0  ]              │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  [+ Add Criterion]                                            │   │
│  │                                                               │   │
│  │  Weight Distribution: [████████████████░░░░░░] Total: 5       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ─── Bottom Bar ──────────────────────────────────────────────────   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                          [Save Draft]  [Save & Close  ➤]     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout Structure

The builder uses a **scrollable page layout** (not modal) with three `Card` sections stacked vertically. Each section can also be viewed as a step, but for simplicity, all sections are visible simultaneously with a single save operation.

```tsx
<div className="max-w-4xl mx-auto space-y-6">
  {/* Back button + page title */}
  <div className="flex items-center gap-3">
    <Link to="/medication-evaluations/templates">← Back</Link>
    <h1 className="text-2xl font-bold ...">
      {isEditing ? 'Edit Template' : 'Create Template'}
    </h1>
  </div>

  {/* Section 1: Template Info */}
  <Card variant="outlined" padding="none" className="overflow-hidden">
    <CardHeader title="Template Info" subtitle="Basic details about this evaluation template" />
    <CardContent className="space-y-4">
      <Input label="Template Name" required value={name} onChange={...} />
      <Textarea label="Description" value={desc} onChange={...} rows={2} />
      <div className="flex items-center gap-4">
        <Label>Is Active</Label>
        <Switch checked={isActive} onChange={...} />
        <span className="text-sm text-slate-500">{isActive ? 'Active' : 'Inactive'}</span>
      </div>
    </CardContent>
  </Card>

  {/* Section 2: Select Medications */}
  <Card variant="outlined" padding="none" className="overflow-hidden">
    <CardHeader title="Medications" subtitle="Select medications for this template" />
    <CardContent>
      <MedicationPicker
        medications={catalog}
        selected={selectedMeds}
        onAdd={handleAddMedication}
        onRemove={handleRemoveMedication}
        onReorder={handleReorderMedications}
        onUpdateQuantity={...}
        onUpdateLocation={...}
      />
    </CardContent>
  </Card>

  {/* Section 3: Define Criteria */}
  <Card variant="outlined" padding="none" className="overflow-hidden">
    <CardHeader title="Criteria" subtitle="Define evaluation criteria for each medication" />
    <CardContent>
      <CriteriaBuilderList
        criteria={criteria}
        onAdd={handleAddCriterion}
        onRemove={handleRemoveCriterion}
        onUpdate={handleUpdateCriterion}
        onReorder={handleReorderCriteria}
      />
    </CardContent>
  </Card>

  {/* Bottom sticky bar */}
  <BottomBar onSave={handleSaveDraft} onSaveClose={handleSaveAndClose} />
</div>
```

### Section 2: MedicationPicker Component

See [Component APIs — MedicationPicker](#medicationpicker) below.

### Section 3: CriteriaBuilderList Component

See [Component APIs — CriteriaBuilderList](#criteriabuilderlist) below.

### States

| State | Visual |
|-------|--------|
| **No medications selected** | Empty state in the medications section with a "Search and add medications" prompt |
| **No criteria defined** | Empty state with dashed border and "Add your first criterion" CTA |
| **Validation errors** | Inline error messages (red text) below each invalid field |
| **Saving** | Loading spinner on Save buttons, disabled interaction |

---

## 4. Page 3: Medication Evaluations List

### File: `pages/medication-evaluations/EvaluationsListPage.tsx`

### URL: `/medication-evaluations`

### Wireframe Description

```
┌──────────────────────────────────────────────────────────────────────┐
│  Medication Evaluations                                              │
│  Track medication evaluation instances across centers                │
│                                                          [Create ＋] │
│  ┌──────────┬──────────┬────────────┐                               │
│  │  Total    │ In Prog. │ Completed  │                               │
│  │    124    │      28  │        89  │                               │
│  └──────────┴──────────┴────────────┘                               │
│                                                                      │
│  ┌─ Search + Filters ─────────────────────────────────────────────┐ │
│  │  [Search by template/center... 🔍]  [Template ▼] [Center ▼]    │ │
│  │  [Status ▼]  [Search] [Clear]                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌── Evaluation Rows ─────────────────────────────────────────────┐ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │ 📋 Template A    →  Center Name                         │   │ │
│  │  │    Evaluator: John   │  [In Progress]  │  72%   [▶]    │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │ 📋 Template B    →  Center Name                         │   │ │
│  │  │    Evaluator: Sara   │  [Completed]  │  95%   [👁]      │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │ 📋 Template C    →  Center Name                         │   │ │
│  │  │    Evaluator: Ahmed  │  [Draft]      │  —%    [▶]      │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Pagination: [< Prev] [1] [2] [3] ... [Next >]                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout Structure

```tsx
<div className="space-y-6">
  {/* Page Header */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        Medication Evaluations
      </h1>
      <p className="text-slate-500 mt-1">Track medication evaluation instances across centers</p>
    </div>
    <Button variant="gradient" gradient="from-emerald-500 to-teal-500" leftIcon={<PlusIcon />}>
      Create Evaluation
    </Button>
  </div>

  {/* Stats */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <StatCard ... /> {/* Total */}
    <StatCard ... /> {/* In Progress */}
    <StatCard ... /> {/* Completed */}
  </div>

  {/* Search + Filters */}
  <Card variant="outlined" padding="md">
    <form className="flex flex-wrap gap-3 items-end">
      <Input placeholder="Search by template or center..." />
      <SearchableCombobox label="Template" ... />
      <SearchableCombobox label="Center" ... />
      <SearchableCombobox label="Status" ... />
      <Button type="submit" variant="outline">Search</Button>
      <Button type="reset" variant="ghost">Clear</Button>
    </form>
  </Card>

  {/* Evaluations List */}
  <Card variant="elevated" className="overflow-hidden">
    <CardContent className="p-0">
      <div className="divide-y divide-slate-100">
        {evaluations.map(eval => <MedicationEvalRow key={eval.id} ... />)}
      </div>
    </CardContent>
  </Card>

  {/* Detail Panel */}
  {selectedEvaluation && <EvaluationDetailPanel ... />}

  {/* Pagination */}
  {pagination.totalPages > 1 && <Pagination ... />}

  {/* Create Modal */}
  <CreateEvaluationModal ... />
</div>
```

### Evaluation Row Component

Props:
```tsx
interface MedicationEvalRowProps {
  evaluation: MedicationEvaluation;
  onSelect: (evaluation: MedicationEvaluation) => void;
  onDelete: (id: number) => void;
  onSubmit?: (id: number) => void;
}
```

Layout:
- Left: gradient icon block + template name + center + evaluator name
- Right: percentage score (colored), status badge, hover actions
- Hover background: `hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50`
- Click navigates to take/result page

### States

| State | Visual |
|-------|--------|
| **Loading** | Centered spinner |
| **Empty** | Gradient icon + "No medication evaluations yet" + CTA |
| **Error** | Red banner (matching existing pattern) |
| **Populated** | Scrollable row list + detail panel |

---

## 5. Page 4: Medication Evaluation Taking

### File: `pages/medication-evaluations/EvaluationTakingPage.tsx`

### URL: `/medication-evaluations/:id/take`

This is the **most important screen** in the module. It allows evaluators to score each medication in a center against the template criteria.

### Wireframe Description

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Back to Evaluations                                              │
│                                                                      │
│  ┌─── Header ───────────────────────────────────────────────────┐   │
│  │  📋 Medication Availability Check — Al Salam Center          │   │
│  │  Template: Med Eval Q1 2026              [Draft]  [In Progress]│   │
│  │  Evaluator: Dr. Ahmed                     Total: 85%   ✅    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── Medication Card #1 ─────────────────────────────────────────┐ │
│  │  💊 Paracetamol · 500mg · Tablet                              │ │
│  │  Allocation: Shelf A3  │  Recommended Qty: 100                │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  #  Criterion                  Answer                Score    │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  1  No. of Availability        [ 80  ]          [15] / 20     │ │
│  │     (Numeric: enter count)                                     │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  2  Accessibility              [✅ Yes]  [⬜ No]   [10] / 10 │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  3  Locked & Labeled           [⬜ Yes]  [✅ No]   [0] / 10  │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  4  Expired Medications Found  [  0  ]            [20] / 20   │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  5  Comments                   [___________________________]  │ │
│  │     (Free text, no score)                         —            │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                                      Subtotal:  45 / 60       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─── Medication Card #2 ─────────────────────────────────────────┐ │
│  │  💊 Amoxicillin · 250mg · Capsule                             │ │
│  │  Allocation: Fridge B1  │  Recommended Qty: 50                │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  ... (same criteria structure as above)                       │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                                      Subtotal:  42 / 60       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─── Medication Card #3 ─────────────────────────────────────────┐ │
│  │  ...                                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─── Sticky Bottom Bar ──────────────────────────────────────────┐ │
│  │  9/9 criteria answered across 3 medications  Total: 78%        │ │
│  │                                       [Save Draft]  [Submit  ➤] │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout Structure

```tsx
<div className="max-w-4xl mx-auto space-y-6">
  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
    <div className="flex items-center gap-3">
      <BackButton to="/medication-evaluations" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{template?.name}</h1>
        <p className="text-sm text-slate-500">
          {center?.name} · Evaluator: {evaluator?.name}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <StatusBadge status={evaluation.status} />
      <div className="text-right">
        <p className="text-3xl font-bold text-emerald-600">{percentage}%</p>
        <p className="text-xs text-slate-400">{totalScore} / {maxScore}</p>
      </div>
    </div>
  </div>

  {/* Medication Cards */}
  <div className="space-y-6">
    {medications.map((med, idx) => (
      <MedicationEvalCard
        key={med.medication_id}
        medication={med}
        criteria={criteria}
        answers={getAnswersForMedication(med.medication_id)}
        onAnswerChange={handleAnswerChange}
        readOnly={false}
      />
    ))}
  </div>

  {/* Sticky Bottom Bar */}
  <div className="sticky bottom-4 bg-white rounded-xl border border-slate-200 shadow-lg p-4">
    <AnswerProgress />
    <ScoreDisplay />
    <ActionButtons onSave={handleSave} onSubmit={handleSubmit} />
  </div>
</div>
```

### MedicationEvalCard Component

This is the core display unit. Each card represents one medication being evaluated.

**Visual Layout (per medication card):**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Top bar — medication identity]                                 │
│ 💊 Medication Name · Strength · Form                            │
│ Allocation: [Location badge]  │  Rec. Qty: [Quantity badge]     │
├─────────────────────────────────────────────────────────────────┤
│ [Criteria table header]                                         │
│ #  Criterion                    Answer               Score      │
├─────────────────────────────────────────────────────────────────┤
│ [Criterion rows]                                                │
│ 1  Criterion Name               [Input widget]     [Score/Max]  │
│    └─ Comment input (optional)                                  │
│ 2  Criterion Name               [Input widget]     [Score/Max]  │
│    └─ Comment input (optional)                                  │
│ ...                                                             │
├─────────────────────────────────────────────────────────────────┤
│                                              Subtotal: N / M    │
└─────────────────────────────────────────────────────────────────┘
```

Props:
```tsx
interface MedicationEvalCardProps {
  index: number;
  medication: {
    medication_id: number;
    medication_name: string;
    strength: string | null;
    form: string | null;
    allocation_location: string | null;
    recommended_quantity: number | null;
  };
  criteria: TemplateCriterion[];
  answers: Record<number, MedicationEvalAnswer>; // criterion_id → answer
  onAnswerChange: (medicationId: number, criterionId: number, answer: Partial<MedicationEvalAnswer>) => void;
  readOnly: boolean;
}
```

**Card structural elements:**
1. **Medication Identity Bar**:
   - Pill icon or gradient letter badge on left
   - Medication name (bold), strength, form in muted text
   - Allocation location as an amber badge: `px-2 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full`
   - Recommended quantity as a cyan badge: `px-2 py-0.5 text-[10px] bg-cyan-100 text-cyan-700 rounded-full`
   - Badges use `gap-2` flex layout

2. **Criteria Table**:
   - Minimal table header row with `text-xs font-medium text-slate-500 uppercase tracking-wider`
   - Alternating or consistent row backgrounds (`bg-slate-50` for each row)
   - Each row has: number badge, criterion name, answer input, score display
   - Criterion type determines the input widget (see CriterionInput below)
   - Comment field: optional text input below each criterion

3. **Subtotal Footer**:
   - Right-aligned, bold, colored by percentage
   - `border-t border-slate-100 mt-4 pt-4`

### CriterionInput Component

Handles the three different input types:

| Type | Render | Score Behavior |
|------|--------|---------------|
| `number` | Numeric `<input type="number">` | Score = value_if_filled ? max_score * weight : 0 |
| `yes_no` | Two toggle buttons: Yes (green when selected) / No (red when selected) | Yes = max_score * weight, No = 0 |
| `text` | Text `<input type="text">` | No auto-score (informational only), score = 0 |

**Yes/No Toggle Pattern** (matches existing `EvaluationTakingPage`):
```tsx
<label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
  value === 'yes' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'
}`}>
  <input type="radio" name={`q-${uniqueId}`} value="yes" checked={value === 'yes'} onChange={...} />
  Yes
</label>
<label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
  value === 'no' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200 hover:border-red-300'
}`}>
  <input type="radio" name={`q-${uniqueId}`} value="no" checked={value === 'no'} onChange={...} />
  No
</label>
```

**Number Input Pattern:**
```tsx
<input
  type="number"
  min={0}
  value={answerValue ?? ''}
  onChange={(e) => onUpdate({ answer_value: e.target.value ? Number(e.target.value) : null })}
  className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-emerald-500"
  placeholder="Enter count"
/>
```

### Mobile Responsiveness

On small screens (`< 640px`):
- Medication cards stack vertically (already the default)
- The criteria table becomes a stacked list: label above input, score below input
- The header row compacts: name on one line, badges below
- The sticky bottom bar collapses buttons to full-width stack
- Answer input and score display go on separate lines

Media query pattern:
```tsx
// Inside MedicationEvalCard, the criteria rows use:
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-slate-50 rounded-lg">
  <div className="flex items-center gap-2 sm:w-48 shrink-0">
    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
      {index + 1}
    </span>
    <span className="text-sm font-medium">{criterion.name}</span>
  </div>
  <div className="flex-1">{/* input widget */}</div>
  <div className="text-right sm:w-20 shrink-0">
    <span className="text-sm font-bold">{score}</span>
  </div>
</div>
```

### Real-time Score Calculation

The score for each criterion input is calculated client-side and displayed immediately:

```tsx
const calculateCriterionScore = (criterion: TemplateCriterion, answer: MedicationEvalAnswer | undefined): number => {
  if (!answer) return 0;
  
  switch (criterion.type) {
    case 'number':
      return answer.answer_value != null && answer.answer_value > 0 ? criterion.weight : 0;
    case 'yes_no':
      return answer.answer_yes_no === 'yes' ? criterion.weight : 0;
    case 'text':
      return 0; // text criteria don't auto-score
    default:
      return 0;
  }
};
```

The subtotal for each medication card is the sum of all criterion scores for that medication.

The overall total percentage is calculated as: `(sum of all scores across all medications) / (sum of all max scores across all medications) * 100`

### States

| State | Visual |
|-------|--------|
| **Loading** | Full-page spinner |
| **Not found** | "Evaluation not found" + back button (matching existing) |
| **No medications** | Empty state: "No medications assigned for this evaluation" |
| **Draft (first load)** | Auto-transitions to `in_progress` (matching existing pattern) |
| **All answered** | Progress shows "N/N answered", submit button enabled |
| **Partial answers** | Progress shows partial, save draft enabled |
| **Saving** | Loading state on buttons |
| **Completed (read-only)** | All inputs disabled, no save/submit actions — only "View Results" |

---

## 6. Page 5: Medication Evaluation Results

### File: `pages/medication-evaluations/EvaluationResultPage.tsx`

### URL: `/medication-evaluations/:id` or `/medication-evaluations/:id/result`

### Wireframe Description

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Back to Evaluations                         [Print  🖨]          │
│                                                                      │
│  ┌─── Results Summary ────────────────────────────────────────────┐ │
│  │  📋 Medication Availability Check — Al Salam Center            │ │
│  │  Template: Med Eval Q1 2026    Evaluator: Dr. Ahmed            │ │
│  │  Status: [Completed]           Date: Jan 15, 2026              │ │
│  │                                                                 │ │
│  │  ┌────────────────────────────────────────────────────────┐    │ │
│  │  │  Total Score    │  Max Score    │  Percentage  │ Grade │    │ │
│  │  │      312        │      360      │     87%      │   B   │    │ │
│  │  └────────────────────────────────────────────────────────┘    │ │
│  │                                                                 │ │
│  │  [████████████████████████████████████░░░░░] 87%                │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─── Medication Card #1 (read-only) ─────────────────────────────┐ │
│  │  💊 Paracetamol · 500mg · Tablet                              │ │
│  │  Allocation: Shelf A3  │  Recommended Qty: 100                │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  #  Criterion                  Answer               Score    │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  1  No. of Availability        80                  15 / 20    │ │
│  │  2  Accessibility              Yes                 10 / 10    │ │
│  │  3  Locked & Labeled           No                   0 / 10    │ │
│  │  4  Expired Medications Found  0                   20 / 20    │ │
│  │  5  Comments                   "Well organized"     —          │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                                        Subtotal:  45 / 60     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─── Medication Card #2 (read-only) ─────────────────────────────┐ │
│  │  ... (same pattern)                                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout Structure

This is a **read-only version** of `EvaluationTakingPage`. It reuses the same `MedicationEvalCard` component with `readOnly={true}`.

```tsx
<div className="max-w-4xl mx-auto space-y-6">
  {/* Back + Print button */}
  <div className="flex items-center justify-between">
    <BackButton />
    <Button variant="outline" leftIcon={<PrintIcon />} onClick={window.print}>
      Print
    </Button>
  </div>

  {/* Header Summary */}
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold">{template?.name}</h1>
      <p className="text-sm text-slate-500">{center?.name} · {evaluator?.name}</p>
      <p className="text-xs text-slate-400">Completed: {completed_at}</p>
    </div>
    <StatusBadge status={evaluation.status} />
  </div>

  {/* Score Summary Card */}
  <Card variant="elevated" padding="lg">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      <ScoreMetric label="Total Score" value={totalScore} />
      <ScoreMetric label="Max Score" value={maxScore} />
      <ScoreMetric label="Percentage" value={`${percentage}%`} color={scoreColor} />
      <ScoreMetric label="Grade" value={grade} />
    </div>
    {/* Progress Bar */}
    <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all" style={{width: `${percentage}%`}} />
    </div>
  </Card>

  {/* Medication Cards (read-only) */}
  <div className="space-y-6">
    {medications.map(med => (
      <MedicationEvalCard
        key={med.medication_id}
        medication={med}
        criteria={criteria}
        answers={getAnswersForMedication(med.medication_id)}
        onAnswerChange={() => {}}
        readOnly={true}
      />
    ))}
  </div>
</div>
```

### Print-friendly Considerations

- Add `@media print` CSS in a `<style>` block or dedicated CSS file:
  ```css
  @media print {
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    body { background: white; }
    .shadow-lg, .shadow-xl { box-shadow: none !important; }
  }
  ```
- Hide sidebar, header, back button, and action buttons during print
- Ensure all cards have white backgrounds and black text
- Score summaries remain colored for readability
- The print button itself is hidden during print

### States

| State | Visual |
|-------|--------|
| **Loading** | Centered spinner |
| **Not found** | "Evaluation not found" message |
| **Draft/In-progress** | Redirect to `/take` or show "Evaluation is not yet complete" message |
| **Completed** | Full results display |

---

## 7. Component APIs

### `MedicationEvalCard`

**File**: `components/features/medication-evaluations/MedicationEvalCard.tsx`

```tsx
interface MedicationEvalCardProps {
  /** 0-based index for numbering criteria rows */
  index?: number;
  /** The medication being evaluated */
  medication: {
    medication_id: number;
    medication_name: string;
    strength: string | null;
    form: string | null;
    allocation_location: string | null;
    recommended_quantity: number | null;
  };
  /** The list of criteria from the template */
  criteria: TemplateCriterion[];
  /** Answers keyed by criterion_id */
  answers: Record<number, MedicationEvalAnswer>;
  /** Called when an answer changes for a criterion */
  onAnswerChange: (criterionId: number, answer: Partial<MedicationEvalAnswer>) => void;
  /** If true, render as read-only (display only, no inputs) */
  readOnly?: boolean;
  /** Optional class name override */
  className?: string;
}
```

**Internal structure:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Card variant="elevated" padding="lg"                            │
│                                                                 │
│ ┌─ Medication identity header (flex row) ─────────────────────┐ │
│ │ [Gradient icon/letter]  Name · Strength · Form              │ │
│ │                          [Alloc badge]  [Qty badge]         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─ Criteria section (space-y-3) ──────────────────────────────┐ │
│ │  (If readOnly, only display text; else render CriterionInput)│ │
│ │  ┌──────────────────────────────────────────────────────────┐│ │
│ │  │ #  Criterion Name          [Input]          [Score/Max]  ││ │
│ │  │    └─ Optional comment field                             ││ │
│ │  └──────────────────────────────────────────────────────────┘│ │
│ │  ... repeated for each criterion                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─ Subtotal (border-t, right-aligned) ────────────────────────┐ │
│ │                                    Subtotal: 45 / 60         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### `CriterionInput`

**File**: `components/features/medication-evaluations/CriterionInput.tsx`

```tsx
export type CriterionType = 'number' | 'yes_no' | 'text';

export interface CriterionInputProps {
  /** The type of criterion */
  type: CriterionType;
  /** The current answer value */
  value: MedicationEvalAnswer | undefined;
  /** Called when value changes */
  onChange: (partial: Partial<MedicationEvalAnswer>) => void;
  /** The criterion weight (for display) */
  weight: number;
  /** The max possible score for this criterion (weight * something or just weight) */
  maxScore: number;
  /** Read-only mode */
  readOnly?: boolean;
  /** Optional unique key prefix for radio input names */
  idPrefix?: string;
}
```

**Rendering per type:**

- `number`: `<input type="number" min="0" class="w-24 ...">` — numeric only
- `yes_no`: Two `<label>` toggles for Yes/No with radio inputs inside
- `text`: `<input type="text" class="w-full ...">` — free text

Each type also shows:
- Current score (real-time calculated)
- "Comment" optional text input below the main input

### `CriteriaBuilderList`

**File**: `components/features/medication-evaluations/CriteriaBuilderList.tsx`

```tsx
interface CriteriaBuilderListProps {
  /** List of criteria currently defined */
  criteria: TemplateCriterion[];
  /** Add a new empty criterion */
  onAdd: () => void;
  /** Remove a criterion by its temporary ID */
  onRemove: (tempId: string) => void;
  /** Update a criterion field */
  onUpdate: (tempId: string, field: Partial<TemplateCriterion>) => void;
  /** Move criterion up/down */
  onReorder: (tempId: string, direction: 'up' | 'down') => void;
}
```

**Visual:**

Each criterion row:
```
┌─────────────────────────────────────────────────────────────────────┐
│  [order #]  [Name input ████████████]  [Type ▼]  [Weight ██]       │
│             [▲] [▼] [✕]                                            │
└─────────────────────────────────────────────────────────────────────┘
```

Layout per row:
```tsx
<div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl">
  {/* Order number */}
  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
    {index + 1}
  </span>

  {/* Name input */}
  <div className="flex-1">
    <Input value={c.name} onChange={...} placeholder="Criterion name" />
  </div>

  {/* Type select */}
  <SearchableCombobox
    value={c.type}
    onChange={(val) => onUpdate(c.tempId, { type: val as CriterionType })}
    options={TYPE_OPTIONS}
    clearable={false}
    className="w-32"
  />

  {/* Weight input */}
  <input type="number" min={0} value={c.weight}
    className="w-16 px-2.5 py-2 border border-slate-200 rounded-lg text-center text-sm"
    onChange={(e) => onUpdate(c.tempId, { weight: parseInt(e.target.value) || 0 })}
  />

  {/* Reorder + Remove buttons */}
  <div className="flex items-center gap-1">
    <button onClick={() => onReorder(c.tempId, 'up')} disabled={index === 0}>▲</button>
    <button onClick={() => onReorder(c.tempId, 'down')} disabled={index === criteria.length - 1}>▼</button>
    <button onClick={() => onRemove(c.tempId)} className="text-red-400 hover:text-red-600">✕</button>
  </div>
</div>
```

**Empty state**: Dashed border area with "Add your first criterion" button.

### `MedicationPicker`

**File**: `components/features/medication-evaluations/MedicationPicker.tsx`

```tsx
interface MedicationPickerProps {
  /** All medications available in the catalog */
  catalog: Medication[];
  /** Currently selected medications with metadata */
  selected: TemplateMedicationEntry[];
  /** Called when a medication is added */
  onAdd: (medicationId: number) => void;
  /** Called when a medication is removed */
  onRemove: (medicationId: number) => void;
  /** Called to reorder selected medications */
  onReorder: (medicationId: number, direction: 'up' | 'down') => void;
  /** Called when recommended_quantity changes */
  onUpdateQuantity: (medicationId: number, quantity: number) => void;
  /** Called when allocation_location changes */
  onUpdateLocation: (medicationId: number, location: string) => void;
}
```

**Visual:**

```
┌──────────────────────────────────────────────────────────────┐
│  Search: [___________________________________  🔍]          │
│  ┌─ Dropdown (when searching) ─────────────────────────────┐│
│  │  • Paracetamol 500mg Tablet                             ││
│  │  • Amoxicillin 250mg Capsule                            ││
│  │  • ...                                                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Selected Medications (3):                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⠿ Paracetamol · 500mg · Tablet                        │ │
│  │   Rec. Qty: [ 100  ]  Location: [Shelf A3           ] │ │
│  │   [▲] [▼] [✕ Remove]                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⠿ Amoxicillin · 250mg · Capsule                       │ │
│  │   ...                                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Search behavior**: Uses a controlled `<Input>` with a dropdown. On typing, filters the catalog by name. Click adds the medication to the selected list.

**Selected list**: Each entry shows medication details, quantity input, location input, reorder arrows, and a remove button.

### `MedicationEvalRow`

**File**: `components/features/medication-evaluations/MedicationEvalRow.tsx` (used in Evaluations List)

```tsx
interface MedicationEvalRowProps {
  evaluation: MedicationEvaluation;
  onSelect: (evaluation: MedicationEvaluation) => void;
  onDelete: (id: number) => void;
  onSubmit?: (id: number) => void;
}
```

Same visual pattern as `EvaluationRow` in the existing `EvaluationsPage`.

---

## 8. TypeScript Data Structures

### Medication Evaluation Types

Create a new file: `frontend/src/types/medicationEvaluation.ts`

```tsx
// ─── Medication Evaluation Template ──────────────────────────────────

export interface MedicationEvalTemplate {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  medications_count?: number;
  criteria_count?: number;
  created_at: string;
  updated_at: string;
  /** Relationships */
  medications?: TemplateMedicationEntry[];
  criteria?: TemplateCriterion[];
}

export interface TemplateMedicationEntry {
  id: number; // pivot ID
  medication_id: number;
  medication_name: string;
  strength: string | null;
  form: string | null;
  recommended_quantity: number | null;
  allocation_location: string | null;
  order: number;
}

export interface TemplateCriterion {
  tempId?: string; // client-side only, for React key management
  id?: number; // server-side ID (undefined for new unsaved criteria)
  name: string;
  type: CriterionType;
  weight: number;
  order: number;
}

export type CriterionType = 'number' | 'yes_no' | 'text';

// ─── Medication Evaluation Instance ──────────────────────────────────

export type MedicationEvalStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export interface MedicationEvaluation {
  id: number;
  template_id: number;
  phc_center_id: number;
  evaluator_id: number;
  status: MedicationEvalStatus;
  total_score: number | null;
  max_score: number | null;
  percentage: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  /** Relationships */
  template?: MedicationEvalTemplate;
  center?: {
    id: number;
    name: string;
    code: string;
  };
  evaluator?: {
    id: number;
    name: string;
    email: string;
  };
  answers?: MedicationEvalAnswer[];
  template_medications?: TemplateMedicationEntry[];
  criteria?: TemplateCriterion[];
}

export interface MedicationEvalAnswer {
  id?: number;
  evaluation_id?: number;
  medication_id: number;
  criterion_id: number;
  /** For 'number' type: the numeric value entered */
  answer_value: number | null;
  /** For 'yes_no' type: 'yes' or 'no' */
  answer_yes_no: 'yes' | 'no' | null;
  /** For 'text' type: free text */
  answer_text: string | null;
  /** Optional comment on the answer */
  comment: string | null;
  /** Computed score (sent from server or calculated client-side) */
  score: number | null;
}

// ─── Input Types ─────────────────────────────────────────────────────

export interface MedicationEvalTemplateCreateInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
  medications: Array<{
    medication_id: number;
    recommended_quantity?: number | null;
    allocation_location?: string | null;
    order: number;
  }>;
  criteria: Array<{
    name: string;
    type: CriterionType;
    weight: number;
    order: number;
  }>;
}

export interface MedicationEvalTemplateUpdateInput extends Partial<MedicationEvalTemplateCreateInput> {}

export interface MedicationEvalCreateInput {
  template_id: number;
  phc_center_id: number;
  evaluator_id: number;
}

export interface MedicationEvalUpdateInput {
  status?: MedicationEvalStatus;
  answers?: Array<{
    medication_id: number;
    criterion_id: number;
    answer_value?: number | null;
    answer_yes_no?: 'yes' | 'no' | null;
    answer_text?: string | null;
    comment?: string | null;
  }>;
}

// ─── Filter Types ────────────────────────────────────────────────────

export interface MedicationEvalTemplateFilters {
  search?: string;
  is_active?: boolean;
}

export interface MedicationEvalFilters {
  search?: string;
  status?: MedicationEvalStatus;
  template_id?: number;
  center_id?: number;
}
```

### Page State Shapes (for Zustand stores)

```tsx
// Store for templates
interface MedicationEvalTemplateStore {
  templates: MedicationEvalTemplate[];
  currentTemplate: MedicationEvalTemplate | null;
  isLoading: boolean;
  pagination: PaginationMeta;
  
  fetchTemplates: (params?: FetchParams) => Promise<void>;
  fetchTemplateById: (id: number) => Promise<void>;
  createTemplate: (input: MedicationEvalTemplateCreateInput) => Promise<void>;
  updateTemplate: (id: number, input: MedicationEvalTemplateUpdateInput) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
  toggleTemplateActive: (id: number, isActive: boolean) => Promise<void>;
}

// Store for evaluation instances
interface MedicationEvalStore {
  evaluations: MedicationEvaluation[];
  currentEvaluation: MedicationEvaluation | null;
  isLoading: boolean;
  pagination: PaginationMeta;
  
  fetchEvaluations: (params?: FetchParams) => Promise<void>;
  fetchEvaluationById: (id: number) => Promise<void>;
  createEvaluation: (input: MedicationEvalCreateInput) => Promise<void>;
  updateEvaluation: (id: number, input: MedicationEvalUpdateInput) => Promise<void>;
  submitEvaluation: (id: number) => Promise<void>;
  deleteEvaluation: (id: number) => Promise<void>;
}
```

---

## 9. State Management

### Per-Page State (for builder)

The `TemplateBuilderPage` manages local state with `useState`:

```tsx
const [name, setName] = useState('');
const [description, setDescription] = useState('');
const [isActive, setIsActive] = useState(true);
const [selectedMeds, setSelectedMeds] = useState<TemplateMedicationEntry[]>([]);
const [criteria, setCriteria] = useState<TemplateCriterion[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [saving, setSaving] = useState(false);
```

### Per-Page State (for evaluation taking)

The `EvaluationTakingPage` manages extensive local state:

```tsx
const [answers, setAnswers] = useState<Record<number, Record<number, MedicationEvalAnswer>>>({});
// answers[medicationId][criterionId] = MedicationEvalAnswer

const [saving, setSaving] = useState(false);
```

### Answer Lookup Pattern

Efficient lookup using nested objects instead of arrays:

```tsx
// Get answer for a specific medication + criterion
const getAnswer = (medicationId: number, criterionId: number): MedicationEvalAnswer | undefined => {
  return answers[medicationId]?.[criterionId];
};

// Update answer for a specific medication + criterion
const updateAnswer = (medicationId: number, criterionId: number, partial: Partial<MedicationEvalAnswer>) => {
  setAnswers(prev => ({
    ...prev,
    [medicationId]: {
      ...prev[medicationId],
      [criterionId]: {
        ...(prev[medicationId]?.[criterionId] ?? {
          medication_id: medicationId,
          criterion_id: criterionId,
          answer_value: null,
          answer_yes_no: null,
          answer_text: null,
          comment: null,
        }),
        ...partial,
      },
    },
  }));
};
```

### Real-time Score Calculation

Compute on the fly in render (no need for memoization given trivial computation):

```tsx
const calculateScore = (criterion: TemplateCriterion, answer: MedicationEvalAnswer | undefined): number => {
  if (!answer) return 0;
  
  switch (criterion.type) {
    case 'number':
      // Score if a value > 0 is entered; otherwise 0
      return (answer.answer_value != null && answer.answer_value > 0) ? criterion.weight : 0;
    case 'yes_no':
      return answer.answer_yes_no === 'yes' ? criterion.weight : 0;
    case 'text':
      return 0;
    default:
      return 0;
  }
};

// Total for a medication
const medicationSubtotal = (medicationId: number): number => {
  return criteria.reduce((sum, c) => sum + calculateScore(c, getAnswer(medicationId, c.id ?? 0)), 0);
};

// Overall total
const overallTotal = useMemo(() => {
  return medications.reduce((sum, med) => sum + medicationSubtotal(med.medication_id), 0);
}, [answers, medications, criteria]);
```

---

## 10. Routing & File Layout

### File System

```
frontend/src/
├── pages/
│   └── medication-evaluations/
│       ├── TemplatesPage.tsx           → /medication-evaluations/templates
│       ├── TemplateBuilderPage.tsx     → /medication-evaluations/templates/create
│       │                                → /medication-evaluations/templates/:id/edit
│       ├── EvaluationsListPage.tsx     → /medication-evaluations
│       ├── EvaluationTakingPage.tsx    → /medication-evaluations/:id/take
│       └── EvaluationResultPage.tsx    → /medication-evaluations/:id
│                                       → /medication-evaluations/:id/result
│
├── components/
│   └── features/
│       └── medication-evaluations/
│           ├── MedicationEvalCard.tsx
│           ├── CriterionInput.tsx
│           ├── CriteriaBuilderList.tsx
│           └── MedicationPicker.tsx
│
├── stores/
│   ├── medicationEvalTemplateStore.ts
│   └── medicationEvalStore.ts
│
└── types/
    └── medicationEvaluation.ts
```

### Route Definitions

```tsx
// In your router configuration:
<Route path="/medication-evaluations" element={<EvaluationsListPage />} />
<Route path="/medication-evaluations/templates" element={<TemplatesPage />} />
<Route path="/medication-evaluations/templates/create" element={<TemplateBuilderPage />} />
<Route path="/medication-evaluations/templates/:id/edit" element={<TemplateBuilderPage />} />
<Route path="/medication-evaluations/:id/take" element={<EvaluationTakingPage />} />
<Route path="/medication-evaluations/:id" element={<EvaluationResultPage />} />
<Route path="/medication-evaluations/:id/result" element={<EvaluationResultPage />} />
```

### Sidebar Entry

Add a new nav group or add entries to the existing "Evaluation" group in `Sidebar.tsx`:

```tsx
// Inside the Evaluation group children array:
{ path: '/medication-evaluations', labelKey: 'nav.medicationEvaluations' },
{ path: '/medication-evaluations/templates', labelKey: 'nav.medicationEvalTemplates' },
```

Add corresponding i18n keys to `en.json` and `ar.json`:

```json
{
  "nav": {
    "medicationEvaluations": "Medication Evaluations",
    "medicationEvalTemplates": "Medication Eval Templates"
  }
}
```

---

## 11. Accessibility & RTL

### RTL Variants

Every component must use Tailwind's `rtl:` prefix where layout direction matters:

| LTR | RTL |
|-----|-----|
| `left-0` | `right-0` |
| `mr-2` | `ml-2` (use `me-2` / `ms-2`) |
| `ml-auto` | `mr-auto` (use `ms-auto` / `me-auto`) |
| `border-l` | `border-r` |
| `text-left` | `text-right` |
| `pl-4` | `pr-4` (use `ps-4` / `pe-4`) |
| `rotate-90` | `-rotate-90` (chevrons) |
| `← Back` | `Back →` |

**Key patterns from existing code**:
```tsx
// Chevron in sidebar
<ChevronIcon isExpanded={isExpanded} isRtl={isRtl} />

// Position
const sidebarPosition = isRtl ? 'right-0' : 'left-0';

// Border
className={`border-${isRtl ? 'l' : 'r'} border-white/10`}
```

In the medication evaluation pages, use logical properties (`ms`, `me`, `ps`, `pe`, `inset-inline-start`, etc.) where possible and the `rtl:` prefix for explicit overrides.

### Keyboard Navigation

| Action | Key |
|--------|-----|
| Navigate medication list | `Tab` through cards |
| Select Yes/No on criterion | `Tab` then `Space` or `Enter` |
| Move between criteria in a card | `Tab` forward, `Shift+Tab` backward |
| Submit evaluation | `Ctrl+Enter` or `Cmd+Enter` (when focus is on submit button) |
| Save draft | `Ctrl+S` or `Cmd+S` |
| Close builder | `Escape` |
| Search medication in picker | Type immediately when focused on search input |

### Focus Indicators

All interactive elements must have visible focus rings using the existing pattern:
```tsx
className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
```

### ARIA Attributes

- Medication cards: `role="region"` with `aria-label="Medication: {name}"`
- Criteria inputs: Each input should have an associated `aria-label` or `<label>` element
- Yes/No groups: `role="radiogroup"` with `aria-label="{criterion name}"`
- Score displays: `aria-live="polite"` for real-time score updates
- Save/Submit buttons: `aria-disabled` when form is not ready

### Screen Reader Considerations

- The score column should include a `sr-only` label: "Score for this criterion"
- The subtotal row should announce as "Subtotal: {value} out of {max}"
- Progress indicator: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

---

## 12. Key Interaction Patterns

### Pattern 1: Search and Add Medication (Template Builder)

1. User types in the medication search input
2. After 300ms debounce, a dropdown appears with filtered results
3. User clicks a medication → it gets added to the selected list with default quantity/location
4. The dropdown closes and search is cleared
5. User can adjust quantity and location inline
6. User can reorder with arrow buttons or remove with ✕

**Debounced search**:
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery) fetchMedications({ filters: { search: searchQuery } });
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```

### Pattern 2: Inline Score Display (Evaluation Taking)

1. Every criterion answer input triggers `onChange`
2. On each change, the score for that criterion is recalculated
3. The score display updates immediately (no save required to see score)
4. The medication subtotal updates immediately
5. The overall total and percentage update immediately

**Micro-interaction**: When a Yes/No toggle is clicked, it has a subtle scale animation:
```tsx
className={`transition-all duration-150 active:scale-95 ${
  selected ? 'bg-emerald-50 border-emerald-500' : 'border-gray-200'
}`}
```

### Pattern 3: Save vs. Submit (Evaluation Taking)

- **Save Draft**: Persists answers to server, keeps status as `in_progress`, user stays on page, toast "Answers saved"
- **Submit**: Persists answers, changes status to `completed`, redirects to evaluations list, toast "Evaluation submitted"
- On first interaction (transition from `draft` to `in_progress`): auto-triggers on mount if status is `draft` (matching existing pattern)

### Pattern 4: Reorder Criteria/Medications (Template Builder)

Arrow buttons (▲/▼) rather than drag-and-drop for simplicity:
```tsx
const handleReorder = (tempId: string, direction: 'up' | 'down') => {
  setCriteria(prev => {
    const idx = prev.findIndex(c => c.tempId === tempId);
    if (idx === -1) return prev;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= prev.length) return prev;
    
    const next = [...prev];
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    return next.map((c, i) => ({ ...c, order: i }));
  });
};
```

### Pattern 5: Create Evaluation Flow

1. User clicks "Create Evaluation" on the Evaluations List page
2. A modal opens (matching `CreateEvaluationModal` in existing `EvaluationsPage`)
3. Form fields: Template (required), Center (required), Evaluator (auto-filled from auth)
4. On submit, the evaluation is created with `draft` status
5. User is redirected to the evaluation taking page (`/medication-evaluations/{id}/take`)

### Pattern 6: Print Results

1. User clicks "Print" on the result page
2. `window.print()` is called
3. CSS `@media print` hides sidebar, header, and action buttons
4. All cards render with white backgrounds, black text, no shadows
5. Score colors are preserved for readability

---

## Appendix A: Comparison with Existing Patterns

| Aspect | Existing (Evaluations/Templates) | Medication Evaluations (Proposed) |
|--------|----------------------------------|-----------------------------------|
| Template builder | Modal with 3 tabs (Pick/Import/Create) | Full-page with 3 sections (Info/Medications/Criteria) |
| Question selection | Pick from existing question bank + create new | Define reusable criteria inline (name, type, weight) |
| Evaluation taking | Paginated regular questions + medication check section | All medications displayed at once, each with all criteria |
| Score calculation | Per-question weighted score | Per-medication-per-criterion weighted score |
| Data model | Many-to-many: template ↔ questions | One-to-many: template → medications + template → criteria |
| Answer structure | Flat: question_id + optional medication_id | Nested: medication_id + criterion_id |

## Appendix B: Mobile Responsiveness Strategy

| Breakpoint | Layout Changes |
|------------|---------------|
| `< 640px` (mobile) | Single column; criteria rows stack vertically (label above input); stat cards 1-col; template cards 1-col; medication picker items stack |
| `640px - 1023px` (tablet) | 2-col stat cards; 2-col template grid; criteria rows remain horizontal but narrower |
| `≥ 1024px` (desktop) | Full layout: 3-4 col stats; 3-col template grid; max-w-4xl centered for taking/result |

**Responsive criteria row (mobile first)**:
```tsx
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-slate-50 rounded-lg">
  {/* On mobile: label above input. On desktop: side by side */}
  <div className="flex items-center gap-2 sm:w-48 shrink-0">
    <span className="w-6 h-6 rounded-full ...">1</span>
    <span className="text-sm font-medium">Criterion Name</span>
  </div>
  <div className="flex-1 w-full sm:w-auto">{/* input */}</div>
  <div className="text-right sm:w-20 shrink-0">{/* score */}</div>
</div>
```
